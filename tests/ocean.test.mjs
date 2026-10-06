import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('Vercel previews serve their own build; only existing public domains use AWS',async()=>{
  const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
  const bridge=config.routes[0];const host=new RegExp(`^${bridge.has[0].value}$`);
  for(const domain of ['josh.house','josh.engineer','www.josh.house','www.josh.engineer'])assert(host.test(domain));
  for(const domain of ['house-preview.vercel.app','josh.house.evil.test','archive.josh.house'])assert(!host.test(domain));
  const deep=config.routes.find(r=>r.check);const route=new RegExp(`^${deep.src}$`);
  assert.equal('/engineering/'.replace(route,deep.dest),'/engineering/index.html');assert.equal('/articles/after-aaron'.replace(route,deep.dest),'/articles/after-aaron/index.html');
  assert.equal(config.routes.at(-1).status,404);
});
