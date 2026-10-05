export function validObservation(value,now=Date.now()){
 return Boolean(value&&['reachable','unavailable'].includes(value.state)&&Number.isFinite(Date.parse(value.checkedAt))&&now-Date.parse(value.checkedAt)<120000&&now-Date.parse(value.checkedAt)>-15000&&(value.latencyMs===null||(Number.isFinite(value.latencyMs)&&value.latencyMs>=0&&value.latencyMs<60000)));
}
export async function readStatus(fetcher=fetch,now=Date.now){
 const started=now();
 const results=await Promise.allSettled([
  fetcher('/build-info.json',{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(7000)}).then(async r=>{if(!r.ok)throw new Error('Unavailable');const body=await r.json();if(body.schema_version!==1||!Number.isInteger(body.article_count))throw new Error('Unexpected response');return {state:'reachable',latencyMs:Math.max(0,now()-started),checkedAt:new Date(now()).toISOString()};}),
  fetcher('/api/public-status',{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(8000)}).then(async r=>{if(!r.ok)throw new Error('Monitor unavailable');const body=await r.json();if(body.schema!==1||!validObservation(body.blog,now()))throw new Error('Stale or invalid status');return body.blog;})
 ]);
 return {local:results[0].status==='fulfilled'?results[0].value:{state:'unavailable',latencyMs:null,checkedAt:new Date(now()).toISOString()},blog:results[1].status==='fulfilled'?results[1].value:{state:'unknown',latencyMs:null,checkedAt:null}};
}
