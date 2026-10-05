import {readdir, readFile, access} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,loadArticles,escape} from './build.mjs';
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(d=>d.isDirectory()?files(path.join(dir,d.name)):[path.join(dir,d.name)]))).flat();}
const dist=path.join(root,'dist'); const all=await files(dist);
for(const file of all.filter(f=>f.endsWith('.html'))){
  const html=await readFile(file,'utf8');
  assert(!/<(?:iframe|object|embed)\b|\son\w+=|javascript:|<script[^>]*>\s*[^<]/i.test(html),`Unsafe markup in ${file}`);
  assert(!/blog\.josh\.house|spotify\.josh\.house|umami\.josh\.house|api\.mapbox\.com|_next\//.test(html),`Retired service in ${file}`);
  for(const [,url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
    if(!url.startsWith('/'))continue;
    let route=url.split(/[?#]/)[0]; if(route.endsWith('/'))route+='index.html';
    await access(path.join(dist,route));
  }
}
for(const a of await loadArticles()){
  const html=await readFile(path.join(dist,`articles/${a.slug}/index.html`),'utf8');
  assert(html.includes(escape(a.title)),`Missing title ${a.slug}`);
  assert(html.includes(escape(a.markdown.trim().split('\n').at(-1))),`Missing end of article ${a.slug}`);
}
console.log(`Verified ${all.length} output files, local links, service independence and complete article endings.`);
