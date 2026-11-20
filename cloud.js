/* Progresso na conta: Modo Fuga e História guardados na nuvem, por jogador. */
(function(){
const SV={'.sv':'timestamp'};
const onl=()=>AUTH.live()&&AUTH.user&&!AUTH.user.local;
const uid=()=>AUTH.user.uid;
const MODES={fuga:{key:'pm_v2'},story:{key:'pm_story',extra:'pm_story_st'}};
const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}};
const pack=m=>{const c=MODES[m],g=ls(c.key);if(!g)return null;return JSON.stringify({g,s:c.extra?ls(c.extra):null})};
function unpack(m,txt){const c=MODES[m];try{const o=JSON.parse(txt);if(!o||typeof o.g!=='string')return false;JSON.parse(o.g);ls(c.key,o.g);if(c.extra){if(o.s)ls(c.extra,o.s);else ls(c.extra,null)}return true}catch(e){return false}}
const cur=()=>typeof SAVEKEY!=='undefined'&&SAVEKEY==='pm_story'?'story':'fuga';
async function push(m,keep){if(!onl())return;const d=pack(m);
  if(!d){return}
  if(d===ls('pm_cl_'+m))return;if(d.length>30000)return;
  try{await DB.set('users/'+uid()+'/save/'+m,{d,t:SV});ls('pm_cl_'+m,d);ls('pm_clt_'+m,String(Date.now()))}catch(e){}}
async function wipe(m){if(!onl())return;try{await DB.f('users/'+uid()+'/save/'+m,'DELETE')}catch(e){}ls('pm_cl_'+m,null)}
async function down(){if(!onl())return;
  if(ls('pm_save_owner')!==uid()){const had=ls('pm_save_owner');if(had){for(const m in MODES){ls(MODES[m].key,null);if(MODES[m].extra)ls(MODES[m].extra,null);ls('pm_cl_'+m,null);ls('pm_clt_'+m,null)}}ls('pm_save_owner',uid())}
  for(const m in MODES){let c=null;try{c=await DB.get('users/'+uid()+'/save/'+m)}catch(e){continue}
    const local=ls(MODES[m].key),lt=+ls('pm_clt_'+m)||0;
    if(c&&typeof c.d==='string'&&typeof c.t==='number'){
      if(!local){unpack(m,c.d);ls('pm_cl_'+m,c.d);ls('pm_clt_'+m,String(c.t))}
      else if(pack(m)!==c.d&&c.t>lt+5000){unpack(m,c.d);ls('pm_cl_'+m,c.d);ls('pm_clt_'+m,String(c.t))}
    }
  }}
const _al=afterLogin;afterLogin=async function(){try{await down()}catch(e){}return _al.apply(this,arguments)};
setInterval(()=>{if(G.started&&!G.over&&!document.hidden)push(cur())},30000);
addEventListener('pagehide',()=>{if(G.started&&!G.over)push(cur())});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.started&&!G.over)push(cur())});
const _tm=toMenu;toMenu=function(){const m=cur(),was=G.started&&!G.over;const r=_tm.apply(this,arguments);if(was)setTimeout(()=>push(m),400);return r};
const _e0=endGame0;endGame0=function(){const m=cur(),was=G.over;const r=_e0.apply(this,arguments);if(!was)setTimeout(()=>{wipe(m);if(MODES[m].extra)ls(MODES[m].extra,null)},600);return r};
window.CLOUD={push,down};
})();
