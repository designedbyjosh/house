import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,cp,mkdtemp,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {escape,safeUrl,renderMarkdown,loadArticles,root} from '../scripts/build.mjs';
test('article content cannot inject executable HTML',()=>{
  const output=renderMarkdown('<script>alert(1)</script>\n<img src=x onerror=alert(1)>\n# <iframe>\n[click](javascript:alert)');
  assert(!output.includes('<script>'));assert(!output.includes('<img'));assert(!output.includes('href="javascript'));assert(output.includes('&lt;script&gt;'));
});
test('links reject active schemes, credentials and protocol-relative URLs',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,boom','//evil.test','http://example.com','https://user:pass@example.com'])assert.equal(safeUrl(url),null);
  assert.equal(safeUrl('/articles/after-aaron/'),'/articles/after-aaron/');assert.equal(safeUrl('https://example.com'),'https://example.com/');
});
test('titles and attribute content are escaped',()=>assert.equal(escape('"<>&\''),'&quot;&lt;&gt;&amp;&#39;'));
test('recovered article corpus includes six full bodies',async()=>{
  const articles=await loadArticles();assert.equal(articles.length,6);
  assert(articles.find(a=>a.slug==='after-aaron').markdown.includes("I'm still writing Aaron's story."));
  assert(articles.find(a=>a.slug==='becoming-a-cave-diver-in-mexico').markdown.includes('Sacramental Submersion, to me'));
});
test('tampering with a recovered article fails the build',async()=>{
  const temp=await mkdtemp(path.join(os.tmpdir(),'house-test-'));
  try{await cp(path.join(root,'content'),temp,{recursive:true});await writeFile(path.join(temp,'articles/after-aaron.md'),'truncated');await assert.rejects(loadArticles(temp),/checksum mismatch/);}finally{await rm(temp,{recursive:true,force:true});}
});
test('manifest paths cannot escape the content directory',async()=>{
  const temp=await mkdtemp(path.join(os.tmpdir(),'house-test-'));
  try{await cp(path.join(root,'content'),temp,{recursive:true});const manifest=JSON.parse(await readFile(path.join(temp,'articles.json'),'utf8'));manifest[0].content_file='../package.json';await writeFile(path.join(temp,'articles.json'),JSON.stringify(manifest));await assert.rejects(loadArticles(temp),/Unsafe article file path/);}finally{await rm(temp,{recursive:true,force:true});}
});
const router=await readFile(path.join(root,'infra/router.js'),'utf8');
const invoke=uri=>vm.runInNewContext(router+'; handler({request:{uri:'+JSON.stringify(uri)+'}});');
test('AWS routing handles deep links and real files',()=>{
  assert.equal(invoke('/articles/after-aaron').uri,'/articles/after-aaron/index.html');assert.equal(invoke('/articles/after-aaron/').uri,'/articles/after-aaron/index.html');assert.equal(invoke('/assets/site.js').uri,'/assets/site.js');assert.equal(invoke('/').uri,'/index.html');
});
test('old links redirect without an open redirect',()=>{
  assert.equal(invoke('/blog/after-aaron').headers.location.value,'/articles/after-aaron/');assert.equal(invoke('/blog/after-the-wards-navigating-lifes-turbulent-currents-as-a-gay-widower').headers.location.value,'/articles/after-the-wards-navigating-lifes-turbulent-currents-as-a-widower/');assert.equal(invoke('/blog').headers.location.value,'/articles/');assert.equal(invoke('/blog//evil.com').statusCode,undefined);
});
