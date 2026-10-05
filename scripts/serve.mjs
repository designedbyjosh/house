import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {root, build} from './build.mjs';
await build();
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{
  try {
    const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const key=route.endsWith('/')?route+'index.html':path.extname(route)?route:route+'/index.html';
    const file=path.resolve(root,'dist','.'+key);
    if (!file.startsWith(path.join(root,'dist')+path.sep)) {res.writeHead(400);res.end();return;}
    const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);
  } catch {res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(root,'dist/404.html')));}
}).listen(Number(process.env.PORT || 4173),'127.0.0.1',()=>console.log(`Preview at http://127.0.0.1:${process.env.PORT || 4173}`));
