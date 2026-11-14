/* Loja: pedidos de desbloqueio aprovados só pelo administrador. O servidor (regras do Firebase) é quem protege, nunca o navegador. */
const PAY={ent:{world:false,items:{}},
list:()=>[['world','Modo World (online)',CFG.prices.world],...SETS.filter(s=>s[2]).map(s=>['pack_'+s[0],s[1],CFG.prices['pack_'+s[0]]]),...CHAIR.filter(h=>h[2]).map(h=>['hair_'+h[0],'Cabelo: '+h[1],CFG.prices['hair_'+h[0]]]),...ACCS.map(a=>['acc_'+a[0],a[1],CFG.prices['acc_'+a[0]]])],
has(k){if(k=='world')return !!PAY.ent.world;return !!(PAY.ent.items&&PAY.ent.items[k])},
async load(){const u=AUTH.user;if(!u)return;try{if(AUTH.live()&&!u.local){const e=await DB.get('users/'+u.uid+'/ent');if(e)PAY.ent=Object.assign({world:false,items:{}},e)}else{PAY.ent=JSON.parse(localStorage.getItem('pm_ent_'+u.uid)||'{"world":false,"items":{}}')}}catch(e){}},
ref(){const u=AUTH.user;return 'PM-'+((u&&u.uid)||'X').replace(/[^A-Za-z0-9]/g,'').slice(-5).toUpperCase()+'-'+(Date.now()%10000)},
async request(item,method,ref){const u=AUTH.user,rec={uid:u.uid,email:u.email,item,method,ref,amount:(PAY.list().find(x=>x[0]==item)||[])[2],ts:Date.now(),status:'pending'};
if(AUTH.live()&&!u.local)return DB.post('requests',rec);
/* modo de teste: sem servidor não há pagamento real; só para ver o fluxo */
const q=JSON.parse(localStorage.getItem('pm_req')||'[]');q.push(rec);localStorage.setItem('pm_req',JSON.stringify(q));return rec},
demoApprove(item){const u=AUTH.user;if(item=='world')PAY.ent.world=true;else PAY.ent.items[item]=true;localStorage.setItem('pm_ent_'+u.uid,JSON.stringify(PAY.ent))}};
