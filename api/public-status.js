// Fixed public target. No credentials, arbitrary URL input, private probes or provider operations.
export async function checkPublicBlog(fetcher=fetch,now=Date.now){
 const started=now();
 try{
  const result=await fetcher('https://josh.engineer/articles/',{method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(5000),headers:{'User-Agent':'JoshPortfolio-PublicReachability/1.0'}});
  return {state:result.status===200?'reachable':'unavailable',latencyMs:Math.max(0,now()-started),checkedAt:new Date(now()).toISOString()};
 }catch{return {state:'unavailable',latencyMs:null,checkedAt:new Date(now()).toISOString()};}
}
export default async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 const blog=await checkPublicBlog();
 res.setHeader('Cache-Control','public, max-age=0, s-maxage=30');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Content-Type','application/json');
 return res.status(200).json({schema:1,blog});
}
