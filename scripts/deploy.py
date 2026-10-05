"""Upload an immutable release and atomically switch CloudFront after verification.

Uses the runner's AWS CLI and temporary OIDC credentials; no SDK dependency.
"""
import argparse
import hashlib
import json
import mimetypes
from pathlib import Path
import subprocess
import tempfile
import urllib.request
from urllib.error import HTTPError
import sys
import time

ROOT = Path(__file__).resolve().parents[1]

def aws(*args, region, decode=True):
    completed = subprocess.run(['aws', *args, '--region', region, '--output', 'json'], check=True, capture_output=True, text=True)
    return json.loads(completed.stdout or '{}') if decode else completed.stdout

def config_and_outputs():
    config = json.loads((ROOT / 'infra/deployment.json').read_text())
    identity = aws('sts', 'get-caller-identity', region=config['region'])
    if identity['Account'] != config['aws_account_id']:
        raise ValueError('AWS account does not match deployment.json.')
    stack = aws('cloudformation', 'describe-stacks', '--stack-name', config['stack_name'], region=config['region'])['Stacks'][0]
    return config, {item['OutputKey']: item['OutputValue'] for item in stack['Outputs']}

def switch_release(release, config, outputs):
    region = config['region']
    existing = aws('cloudfront', 'get-distribution-config', '--id', outputs['DistributionId'], region=region)
    distribution = existing['DistributionConfig']
    origins = [origin for origin in distribution['Origins']['Items'] if origin['Id'] == 'site']
    if len(origins) != 1:
        raise ValueError('Expected exactly one site origin.')
    previous = origins[0].get('OriginPath', '')
    stack = aws('cloudformation', 'describe-stacks', '--stack-name', config['stack_name'], region=region)['Stacks'][0]
    parameters = [{'ParameterKey': p['ParameterKey'], 'UsePreviousValue': True} for p in stack['Parameters'] if p['ParameterKey'] != 'ReleaseId']
    parameters.append({'ParameterKey': 'ReleaseId', 'ParameterValue': release})
    change_set = 'house-' + release[:12] + '-' + str(int(time.time()))
    with tempfile.TemporaryDirectory(prefix='house-deploy-') as temp:
        filename = Path(temp) / 'parameters.json'
        filename.write_text(json.dumps(parameters))
        aws('cloudformation', 'create-change-set', '--stack-name', config['stack_name'], '--change-set-name', change_set, '--change-set-type', 'UPDATE', '--template-body', 'file://' + str(ROOT / 'infra/site.json'), '--parameters', 'file://' + str(filename), '--role-arn', config['infrastructure_role_arn'], region=region)
    try:
        aws('cloudformation', 'wait', 'change-set-create-complete', '--stack-name', config['stack_name'], '--change-set-name', change_set, region=region)
    except subprocess.CalledProcessError:
        change = aws('cloudformation', 'describe-change-set', '--stack-name', config['stack_name'], '--change-set-name', change_set, region=region)
        if "didn't contain changes" not in change.get('StatusReason', '') and 'No updates' not in change.get('StatusReason', ''):
            raise
        aws('cloudformation', 'delete-change-set', '--stack-name', config['stack_name'], '--change-set-name', change_set, region=region)
        return previous
    change = aws('cloudformation', 'describe-change-set', '--stack-name', config['stack_name'], '--change-set-name', change_set, region=region)
    for item in change.get('Changes', []):
        resource = item.get('ResourceChange', {})
        if resource.get('Action') == 'Remove' or resource.get('Replacement') in ['True', 'Conditional']:
            raise ValueError('Infrastructure deletion or replacement requires a separately reviewed deployment.')
    aws('cloudformation', 'execute-change-set', '--stack-name', config['stack_name'], '--change-set-name', change_set, region=region)
    aws('cloudformation', 'wait', 'stack-update-complete', '--stack-name', config['stack_name'], region=region)
    print(json.dumps({'release': release, 'previous_origin_path': previous, 'url': outputs['SiteUrl']}))
    aws('cloudfront', 'wait', 'distribution-deployed', '--id', outputs['DistributionId'], region=region)
    invalidation = aws('cloudfront', 'create-invalidation', '--distribution-id', outputs['DistributionId'], '--paths', '/*', region=region)
    aws('cloudfront', 'wait', 'invalidation-completed', '--distribution-id', outputs['DistributionId'], '--id', invalidation['Invalidation']['Id'], region=region)
    return previous

def verify_live(release, config, outputs):
    articles = json.loads((ROOT / 'content/articles.json').read_text())
    origins = dict.fromkeys([outputs['SiteUrl'], *config['public_site_urls']])
    routes = ['/build-info.json', '/', '/articles/', '/photography/', '/sitemap.xml', '/feed.xml', *['/articles/' + a['slug'] + '/' for a in articles]]
    for origin in origins:
        for route in routes:
            url = origin + route + '?release=' + release
            request = urllib.request.Request(url, headers={'User-Agent': 'house-deployment-check'})
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read()
                if response.status != 200:
                    raise ValueError('Deployment did not return HTTP 200 for ' + url)
                for header in ['content-security-policy', 'strict-transport-security', 'x-content-type-options']:
                    if not response.headers.get(header):
                        raise ValueError('Missing security header at ' + url + ': ' + header)
            if route == '/build-info.json' and json.loads(data)['commit'] != release:
                raise ValueError('The deployed release is not the expected commit at ' + origin)
            if route.startswith('/articles/') and route != '/articles/' and b'<div class="prose">' not in data:
                raise ValueError('Live article is incomplete at ' + url)
            if route.endswith('/') and (b'Stories, photographs & a life outside.' in data or b'href="/travel/"' in data):
                raise ValueError('Removed header content is still published at ' + url)
            if route == '/sitemap.xml' and b'/travel/' in data:
                raise ValueError('Travel is still present in the live sitemap at ' + origin)
        for route in ['/travel', '/travel/', '/travel/index.html']:
            url = origin + route + '?release=' + release
            request = urllib.request.Request(url, headers={'User-Agent': 'house-deployment-check'})
            try:
                with urllib.request.urlopen(request, timeout=30):
                    raise ValueError('Removed Travel page is still served at ' + url)
            except HTTPError as error:
                if error.code != 404:
                    raise ValueError('Expected HTTP 404 for the removed Travel page at ' + url) from error
        print('Live release, all six articles and security headers verified at ' + origin)
        print('Photography retained; tagline, Travel navigation, sitemap entry and page removed at ' + origin)

def deploy(release, rollback=False):
    if len(release) != 40 or any(c not in '0123456789abcdef' for c in release):
        raise ValueError('Release must be a full Git commit SHA.')
    config, outputs = config_and_outputs()
    region = config['region']
    if not rollback:
        info = json.loads((ROOT / 'dist/build-info.json').read_text())
        if info['commit'] != release or info['article_count'] < 6:
            raise ValueError('Build metadata does not match this release.')
        for filename in sorted((ROOT / 'dist').rglob('*')):
            if filename.is_symlink():
                raise ValueError('Deployment cannot include symbolic links.')
            if not filename.is_file():
                continue
            key = 'releases/' + release + '/' + filename.relative_to(ROOT / 'dist').as_posix()
            mime = mimetypes.guess_type(filename.name)[0] or 'application/octet-stream'
            # Every file is uploaded before the distribution changes its origin.
            digest = hashlib.sha256(filename.read_bytes()).hexdigest()
            try:
                aws('s3api', 'put-object', '--bucket', outputs['BucketName'], '--key', key, '--body', str(filename), '--content-type', mime, '--cache-control', 'public,max-age=300', '--server-side-encryption', 'AES256', '--if-none-match', '*', '--metadata', 'sha256=' + digest, region=region)
            except subprocess.CalledProcessError as error:
                if 'PreconditionFailed' not in error.stderr:
                    raise
                saved = aws('s3api', 'head-object', '--bucket', outputs['BucketName'], '--key', key, region=region)
                if saved.get('Metadata', {}).get('sha256') != digest:
                    raise ValueError('An existing immutable release has different content.') from error
    expected = aws('s3api', 'head-object', '--bucket', outputs['BucketName'], '--key', 'releases/' + release + '/build-info.json', region=region)
    if not expected.get('ContentLength'):
        raise ValueError('Release is missing its build metadata.')
    previous = switch_release(release, config, outputs)
    try:
        verify_live(release, config, outputs)
    except Exception:
        if previous.startswith('/releases/') and previous != '/releases/bootstrap':
            print('Verification failed; restoring the previous release.', file=sys.stderr)
            switch_release(previous.removeprefix('/releases/'), config, outputs)
        raise

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--release', required=True)
    parser.add_argument('--rollback', action='store_true')
    args = parser.parse_args()
    deploy(args.release, args.rollback)

if __name__ == '__main__':
    main()
