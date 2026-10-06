import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {publicPages} from '../content/public-pages.js';
import {projects, projectsIndex, projectPage} from './projects.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const escape = (text) => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeUrl(value) {
  if (/^\/(?!\/)[a-zA-Z0-9/_#?.=:%-]*$/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function inline(text) {
  let result = '', offset = 0;
  for (const match of text.matchAll(/\[([^\]]+)\]\(([^\s)]+)\)/g)) {
    result += escape(text.slice(offset, match.index)); const url = safeUrl(match[2]);
    result += url ? `<a href="${escape(url)}" rel="noreferrer">${escape(match[1])}</a>` : escape(match[1]);
    offset = match.index + match[0].length;
  }
  return result + escape(text.slice(offset));
}
export function renderMarkdown(text) {
  const blocks = []; let list = null;
  const closeList = () => { if (list) { blocks.push(`</${list}>`); list = null; } };
  for (const line of text.split('\n')) {
    const item = line.match(/^\s*(\* |\d+\. )(.*)$/);
    if (item) {
      const type = item[1] === '* ' ? 'ul' : 'ol';
      if (list !== type) { closeList(); blocks.push(`<${type}>`); list = type; }
      blocks.push(`<li>${inline(item[2])}</li>`); continue;
    }
    closeList(); if (!line.trim()) continue;
    if (line === '> [Original photograph unavailable in the recovered cache]') { blocks.push('<p class="image-note">Original photograph unavailable in the recovered cache.</p>'); continue; }
    const heading = line.match(/^(#{1,6}) (.+)$/);
    if (heading) { const level = Math.min(6, heading[1].length + 1); blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`); }
    else if (line.startsWith('> ')) blocks.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    else blocks.push(`<p>${inline(line)}</p>`);
  }
  closeList(); return blocks.join('\n');
}
export async function loadArticles(contentRoot = path.join(root, 'content')) {
  const manifest = JSON.parse(await readFile(path.join(contentRoot, 'articles.json'), 'utf8'));
  if (!Array.isArray(manifest) || manifest.length < 6) throw new Error('Expected the six recovered articles.');
  const seen = new Set();
  for (const article of manifest) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) || seen.has(article.slug)) throw new Error('Invalid or duplicate article slug.');
    seen.add(article.slug);
    if (article.content_file !== `articles/${article.slug}.md`) throw new Error('Unsafe article file path.');
    article.markdown = await readFile(path.join(contentRoot, article.content_file), 'utf8');
    if (createHash('sha256').update(article.markdown).digest('hex') !== article.sha256) throw new Error(`Article checksum mismatch: ${article.slug}. Update the manifest intentionally when editing content.`);
    if (article.markdown.trim().length < 1000) throw new Error('Incomplete recovered article.');
  }
  return manifest;
}
const baseUrl = () => {
  const url = new URL(process.env.SITE_URL || 'https://josh.engineer');
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('SITE_URL must be an HTTPS origin.');
  return url.origin;
};
const card = article => `<li class="article-card" data-search="${escape(article.title.toLowerCase())}"><a href="/articles/${article.slug}/"><span class="eyebrow">${article.reading_minutes} minute read</span><h2>${escape(article.title)}</h2><span class="read-link">Read article <span aria-hidden="true">↗</span></span></a></li>`;
function page({title, description, route, body, section = '', noindex = false}) {
  const canonical = `${baseUrl()}${route}`;
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} · Joshua Whitcombe</title><meta name="description" content="${escape(description)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:type" content="${section === 'article' ? 'article' : 'website'}"><link rel="canonical" href="${escape(canonical)}">${noindex ? '<meta name="robots" content="noindex">' : ''}<link rel="icon" href="/favicon.png"><link rel="stylesheet" href="/assets/site.css"><link rel="alternate" type="application/rss+xml" title="Written by Josh" href="/feed.xml"><script src="/assets/site.js" defer></script><script type="module" src="/assets/traffic-client.js"></script>${section === 'projects' ? '<link rel="stylesheet" href="/assets/projects.css"><script type="module" src="/assets/project-explorer.js"></script>' : ''}</head><body${publicPages.has(route) ? ` data-traffic-page="${escape(route)}"` : ''}${section === 'projects' ? ' class="projects-page"' : ''}><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/">Joshua Whitcombe</a><nav aria-label="Main navigation"><a href="/articles/"${section.startsWith('article') ? ' aria-current="page"' : ''}>Writing</a><a href="/projects/"${section === 'projects' ? ' aria-current="page"' : ''}>Projects</a><a href="/photography/"${section === 'photography' ? ' aria-current="page"' : ''}>Photography</a><a href="/feed.xml">RSS</a></nav></header><main id="main">${body}</main><footer class="site-footer"><span>Written by Josh, in Sydney.</span><button class="traffic-privacy" data-traffic-optout aria-pressed="false">Exclude this browser from live counts</button><div><a href="mailto:joshua@whitcombe.me">Say hello</a><a href="https://github.com/designedbyjosh/house" rel="noreferrer">Source</a><a href="https://www.instagram.com/jbwhitcombe/" rel="noreferrer">Instagram</a></div></footer></body></html>`;
}
async function output(relative, text) {
  const dest = path.join(root, 'dist', relative); await mkdir(path.dirname(dest), {recursive:true}); await writeFile(dest, text);
}
export async function build() {
  const articles = await loadArticles(); await rm(path.join(root, 'dist'), {recursive:true, force:true});
  await mkdir(path.join(root, 'dist/assets'), {recursive:true});
  await cp(path.join(root, 'public'), path.join(root, 'dist'), {recursive:true});
  await cp(path.join(root, 'web/site.css'), path.join(root, 'dist/assets/site.css'));
  await cp(path.join(root, 'web/site.js'), path.join(root, 'dist/assets/site.js'));
  for (const asset of ['projects.css', 'project-explorer.js', 'project-graph.js', 'project-renderer.js', 'project-status.js', 'traffic-client.js']) await cp(path.join(root, 'web', asset), path.join(root, 'dist/assets', asset));
  const description = 'Stories of adventure, grief, discovery and finding a little meaning along the way.';
  const archiveIntro = '<p class="archive-note">These articles have been preserved from the original site. Some photographs are still being recovered.</p>';
  await output('index.html', page({title:'G’day, I’m Josh',description,route:'/',body:`<section class="intro"><p class="eyebrow">Sydney, Australia</p><h1>G’day,<br>I’m Josh.</h1><p class="intro-copy">I’m a software engineer who gets amongst photography, overseas travel, and ways to navigate adversity.</p><a class="button" href="/articles/">Explore my writing <span aria-hidden="true">↗</span></a></section><section class="writing-section"><div class="section-heading"><h2>From the journal</h2><a href="/articles/">All articles</a></div><ul class="article-grid">${articles.slice(0,3).map(card).join('')}</ul></section>`}));
  const indexBody = `<section class="page-intro"><p class="eyebrow">The journal</p><h1>Written by Josh.</h1><p>${description}</p>${archiveIntro}</section><label class="search-label" for="article-search">Find an article</label><input type="search" id="article-search" placeholder="Search the journal" maxlength="100" autocomplete="off"><p id="search-status" role="status" aria-live="polite"></p><ul class="article-grid" id="articles">${articles.map(card).join('')}</ul>`;
  await output('articles/index.html', page({title:'Writing',description,route:'/articles/',body:indexBody,section:'articles'}));
  await output('blog/index.html', page({title:'Writing',description,route:'/articles/',body:indexBody,section:'articles'}));
  for (let i=0; i<articles.length; i++) {
    const article=articles[i], previous=articles[i+1], next=articles[i-1];
    const body=`<article><header class="article-header"><a class="back-link" href="/articles/">← All writing</a><p class="eyebrow">${article.reading_minutes} minute read</p><h1>${escape(article.title)}</h1><p class="archive-note">Preserved from my original blog. Some original photographs are unavailable.</p></header><div class="prose">${renderMarkdown(article.markdown)}</div><nav class="article-pagination" aria-label="Other articles">${previous ? `<a href="/articles/${previous.slug}/"><span>Earlier in the journal</span>${escape(previous.title)}</a>` : ''}${next ? `<a href="/articles/${next.slug}/"><span>Later in the journal</span>${escape(next.title)}</a>` : ''}</nav></article>`;
    const rendered=page({title:article.title,description:article.markdown.split('\n').find(l=>l && !l.startsWith('#') && !l.startsWith('>')).slice(0,200),route:`/articles/${article.slug}/`,body,section:'article'});
    await output(`articles/${article.slug}/index.html`,rendered); await output(`blog/${article.slug}/index.html`,rendered);
    const gallery=`<section class="page-intro"><p class="eyebrow">Photographs & memories</p><h1>${escape(article.title)}</h1><p>The original photographs are being recovered. Their captions have been preserved below.</p><a href="/articles/${article.slug}/">Read the article ↗</a></section><ul class="caption-list">${article.captions.map(c=>`<li>${escape(c)}</li>`).join('')}</ul>`;
    await output(`photography/${article.slug}/index.html`,page({title:article.title,description:'Captions from the original photo journal.',route:`/photography/${article.slug}/`,body:gallery,section:'photography'}));
  }
  const alias='after-the-wards-navigating-lifes-turbulent-currents-as-a-gay-widower';
  await output(`blog/${alias}/index.html`,await readFile(path.join(root,'dist/blog/after-the-wards-navigating-lifes-turbulent-currents-as-a-widower/index.html'),'utf8'));
  await output('blog/cliftons/index.html',page({title:'Writing',description,route:'/articles/',body:indexBody,section:'articles'}));
  const other=JSON.parse(await readFile(path.join(root,'content/other-snapshot.json'),'utf8')).map(c=>c.text || '').join('\n');
  const photos=[...other.matchAll(/【\d+†([^†】]+?)】/g)].map(m=>m[1]).filter(s=>s!=='Image' && s!=='Joshua Whitcombe' && s!=='Read the Backstory' && !s.startsWith('URL '));
  const photoBody=`<section class="page-intro"><p class="eyebrow">A few places I’ve been</p><h1>Photography.</h1><p>The original photo journal is being recovered. These locations and captions survived in the cached site.</p></section><ul class="caption-list">${photos.map(c=>`<li>${escape(c)}</li>`).join('')}</ul><p><a href="/articles/">Read the stories behind the photographs ↗</a></p>`;
  await output('photography/index.html',page({title:'Photography',description:'Places and memories from the original photo journal.',route:'/photography/',body:photoBody,section:'photography'}));
  const photoRoutes=JSON.parse(await readFile(path.join(root,'content/legacy-photo-routes.json'),'utf8'));
  for(const slug of photoRoutes){
    if(articles.some(a=>a.slug===slug))continue;
    if(!/^[a-z0-9-]+$/.test(slug))throw new Error('Invalid legacy photography route.');
    const title=slug.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
    await output(`photography/${slug}/index.html`,page({title,description:'A location from the original photo journal.',route:`/photography/${slug}/`,section:'photography',noindex:true,body:`<section class="page-intro"><p class="eyebrow">From the original photo journal</p><h1>${escape(title)}.</h1><p>The photographs from this page are being recovered. The original page address has been preserved.</p><a href="/photography/">Explore the photo journal ↗</a></section>`}));
  }
  await output('music/index.html',page({title:'Music',description:'Music at home and away.',route:'/music/',body:'<section class="page-intro"><p class="eyebrow">Music</p><h1>A little quieter for now.</h1><p>The live Spotify feed is offline while the original service is being restored.</p><a href="/articles/">Back to the journal ↗</a></section>',noindex:true}));
  await output('404.html',page({title:'Page not found',description:'This page could not be found.',route:'/404.html',body:'<section class="page-intro"><p class="eyebrow">404</p><h1>Somewhere else?</h1><p>This page isn’t here. The journal is a good place to start.</p><a class="button" href="/articles/">Explore the journal ↗</a></section>',noindex:true}));
  await output('projects/index.html', page({title:'Projects',description:'Explore the architecture of my blog and personal MCP projects.',route:'/projects/',body:projectsIndex(),section:'projects'}));
  for (const project of projects) await output(`projects/${project.slug}/index.html`, page({title:project.name,description:project.summary,route:`/projects/${project.slug}/`,body:projectPage(project),section:'projects'}));
  const routes=['/projects/',...projects.map(p=>`/projects/${p.slug}/`),'/','/articles/','/photography/',...articles.map(a=>`/articles/${a.slug}/`)];
  await output('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(route=>`<url><loc>${escape(baseUrl()+route)}</loc></url>`).join('')+'</urlset>');
  await output('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${baseUrl()}/sitemap.xml\n`);
  await output('feed.xml','<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Written by Josh</title><link>'+escape(baseUrl()+'/articles/')+'</link><description>'+escape(description)+'</description>'+articles.map(a=>`<item><title>${escape(a.title)}</title><link>${escape(baseUrl()+`/articles/${a.slug}/`)}</link><guid isPermaLink="true">${escape(a.source_url)}</guid><description>${escape(a.markdown)}</description></item>`).join('')+'</channel></rss>');
  await output('build-info.json',JSON.stringify({schema_version:1,commit:process.env.GITHUB_SHA || 'local',article_count:articles.length,article_checksums:Object.fromEntries(articles.map(a=>[a.slug,a.sha256]))},null,2)+'\n');
  console.log(`Built ${articles.length} complete articles, legacy routes, RSS and a sitemap without network access.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
