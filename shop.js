/* Loja: pedidos aprovados só pelo administrador. Trajes: preço em dólar, convertido em Kz, duram 30 dias. */
const DAY30=30*864e5;
const PAY={ent:{world:false,items:{}},
rate:()=>CFG.usdRate||913,
kz:u=>Math.round(u*PAY.rate()/10)*10,
list:()=>{const L=[['world','Modo World (online)',CFG.prices.world]];
 for(const s of SETS){if(!s[2])continue;const i=SETINFO[s[0]]||{usd:1};L.push(['pack_'+s[0],s[1],PAY.kz(i.usd),i.usd,i.perk||'',i.group||''])}
 for(const h of CHAIR)if(h[2])L.push(['hair_'+h[0],'Cabelo: '+h[1],PAY.kz(1),1,'Só estilo, sem vantagem.','']);
 for(const a of ACCS)L.push(['acc_'+a[0],a[1],PAY.kz(1),1,'Só estilo, sem vantagem.','']);return L},
left(k){const v=PAY.ent.items&&PAY.ent.items[k];if(v===true)return Infinity;return typeof v==='number'?v-Date.now():0},
has(k){if(k=='world')return !!PAY.ent.world;return PAY.left(k)>0},
expiring(){const o=[];for(const x of PAY.list()){if(x[0]=='world')continue;const l=PAY.left(x[0]);if(l>0&&l!==Infinity&&l<=3*864e5)o.push([x,Math.max(1,Math.ceil(l/864e5))])}return o},
async load(){const u=AUTH.user;if(!u)return;try{if(AUTH.live()&&!u.local){const e=await DB.get('users/'+u.uid+'/ent');if(e)PAY.ent=Object.assign({world:false,items:{}},e);try{const r=await DB.get('config/usdRate');if(typeof r==='number'&&r>100&&r<5000)CFG.usdRate=r}catch(e2){}}else{PAY.ent=JSON.parse(localStorage.getItem('pm_ent_'+u.uid)||'{"world":false,"items":{}}')}}catch(e){}},
ref(){const u=AUTH.user;return 'PM-'+((u&&u.uid)||'X').replace(/[^A-Za-z0-9]/g,'').slice(-5).toUpperCase()+'-'+(Date.now()%10000)},
async request(item,method,ref){const u=AUTH.user,it=PAY.list().find(x=>x[0]==item)||[],rec={uid:u.uid,email:u.email,item,method,ref,amount:it[2],usd:it[3]||0,ts:Date.now(),status:'pending'};
if(AUTH.live()&&!u.local)return DB.post('requests',rec);
const q=JSON.parse(localStorage.getItem('pm_req')||'[]');q.push(rec);localStorage.setItem('pm_req',JSON.stringify(q));return rec},
demoApprove(item){const u=AUTH.user;if(item=='world')PAY.ent.world=true;else PAY.ent.items[item]=Math.max(Date.now(),typeof PAY.ent.items[item]=='number'?PAY.ent.items[item]:0)+DAY30;localStorage.setItem('pm_ent_'+u.uid,JSON.stringify(PAY.ent))}};
