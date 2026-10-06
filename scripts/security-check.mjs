import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {root} from './build.mjs';
const template=JSON.parse(await readFile(path.join(root,'infra/site.json'),'utf8'));
const bucket=template.Resources.SiteBucket;
assert.equal(bucket.DeletionPolicy,'Retain');assert.equal(bucket.UpdateReplacePolicy,'Retain');
assert(Object.values(bucket.Properties.PublicAccessBlockConfiguration).every(v=>v===true));
assert.equal(bucket.Properties.BucketEncryption.ServerSideEncryptionConfiguration[0].ServerSideEncryptionByDefault.SSEAlgorithm,'AES256');
assert.equal(template.Resources.Distribution.Properties.DistributionConfig.DefaultCacheBehavior.ViewerProtocolPolicy,'redirect-to-https');
const headers=template.Resources.SecurityHeaders.Properties.ResponseHeadersPolicyConfig.SecurityHeadersConfig;
assert(headers.ContentSecurityPolicy.ContentSecurityPolicy.includes("script-src 'self'"));
assert(!headers.ContentSecurityPolicy.ContentSecurityPolicy.includes('unsafe-inline'));
assert.equal(headers.FrameOptions.FrameOption,'DENY');
const policy=template.Resources.BucketPolicy.Properties.PolicyDocument.Statement;
assert(policy.some(p=>p.Effect==='Deny'&&p.Condition?.Bool?.['aws:SecureTransport']==='false'));
assert(policy.find(p=>p.Sid==='CloudFrontRead').Condition.StringEquals['AWS:SourceArn']);
assert.equal(template.Resources.Router.Properties.FunctionCode,await readFile(path.join(root,'infra/router.js'),'utf8'),'The reviewed router and template must match.');
for(const name of await readdir(path.join(root,'.github/workflows'))){
 const workflow=await readFile(path.join(root,'.github/workflows',name),'utf8');
 assert(!workflow.includes('pull_request_target'),'Untrusted PR code must not run with write credentials.');
 for(const [,action]of workflow.matchAll(/uses:\s*(\S+)/g))assert(/@[a-f0-9]{40}$/.test(action),`Unpinned action: ${action}`);
 assert(workflow.includes('timeout-minutes:'),`Workflow missing timeout: ${name}`);
}
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
assert(!pkg.dependencies&&!pkg.devDependencies,'The static build must not acquire unreviewed package dependencies.');
const vendor=JSON.parse(await readFile(path.join(root,'public/assets/vendor/manifest.json'),'utf8'));
assert.equal(vendor.version,'0.186.1');
for(const [name,expected] of Object.entries(vendor.files)){
 assert(!name.includes('/')&&!name.includes('..'),'Invalid vendor filename');
 const bytes=await readFile(path.join(root,'public/assets/vendor',name));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),expected,`Vendored asset changed: ${name}`);
}
console.log('Pinned graphics assets, private storage, scoped origin access, transport encryption, CSP and workflow pins verified.');

const materialManifest=JSON.parse(await readFile(path.join(root,'public/assets/materials/manifest.json'),'utf8'));
assert.equal(materialManifest.license,'CC0-1.0');
for(const [name,hash] of Object.entries(materialManifest.files)){
 assert(/^[a-z-]+\.jpg$/.test(name));
 assert.equal(createHash('sha256').update(await readFile(path.join(root,'public/assets/materials',name))).digest('hex'),hash,`Material changed: ${name}`);
}
