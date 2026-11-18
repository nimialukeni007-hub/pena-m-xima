/* Qualidade automática: ajusta resolução, luzes, sombras e contornos para manter fluidez */
(function(){
const mob=/android|iphone|ipad|ipod/i.test(navigator.userAgent);
const RS=[.4,.5,.6,.7,.8,.9,1],NL=[2,3,3,6];
let ri=mob?2:4,q=mob?1:2,ema=33,cool=1.5,good=0,last=performance.now();
function apply(){R3.rs=RS[ri];R3.q=q;if(R3.gl){R3.gl.nl=q>=2?6:(q===1?3:2);R3.gl.noOut=q<1}}
R3.rs=RS[ri];R3.q=q;
const _r=render;
render=function(now){
  const t=performance.now(),dt=Math.min(250,t-last);last=t;
  ema+=(dt-ema)*.12;cool-=dt/1000;
  if(cool<=0){
    if(ema>46){ /* lento: baixa */
      if(ri>1){ri--;}else if(q>0){q--;ri=Math.min(ri+2,RS.length-1)}else if(ri>0)ri--;
      cool=1.2;good=0;apply();R3.perf=Math.round(1000/ema);
    }else if(ema<21){ /* folga: sobe devagar */
      good+=1;if(good>=4){good=0;
        if(ri<(mob?4:6)){ri++;cool=2;apply()}
        else if(q<(mob?1:2)){q++;ri=Math.max(ri-2,1);cool=3;apply()}}
      cool=Math.max(cool,.5)
    }else good=0;
  }
  if(R3.gl&&R3.gl.nl==null)apply();
  _r(now)};
window.__perf=()=>({fps:Math.round(1000/ema),scale:R3.rs,q:R3.q});
})();
/* Online em tempo real v3.
   - Relógio do mundo = hora do servidor (igual para todos, sem anfitrião)
   - Pacotes com carimbo de hora do servidor + buffer de interpolação (sem soquinhos)
   - Anfitrião = jogador que entrou primeiro (não o de menor id)
   - Sala única MUNDO automática; salas privadas continuam */
(function(){
const isW=r=>/^W\d+$/.test(r||''),PD=170,HD=380,SEND=.1,HSEND=.25,MAXEX=400;
let OFF=0,calOK=false,calBusy=false;
const snow=()=>Date.now()+OFF;
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const wrapD=d=>((d+720)%1440+1440)%1440-720;
function angl(a,b,t){let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*t}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---- calibragem da hora do servidor (Firebase .sv timestamp) ---- */
async function calibrate(){
  if(calBusy||!Net.on)return;calBusy=true;const id=Net.id;let best=null;
  try{
    for(let i=0;i<5&&Net.on&&Net.id===id;i++){
      const t0=Date.now();let v=null,t1=t0;
      try{const r=await fetch(nurl('/ping/'+id),{method:'PUT',body:'{".sv":"timestamp"}'});t1=Date.now();try{v=await r.json()}catch(e){}
        if(typeof v!=='number'||v<1e12){const r2=await fetch(nurl('/ping/'+id));v=await r2.json()}}catch(e){}
      if(typeof v==='number'&&v>1e12){const rtt=t1-t0,off=v-(t0+rtt/2);if(!best||rtt<best.rtt)best={rtt,off}}
      await sleep(150);
    }
    if(best&&best.rtt<6000){OFF=calOK?(OFF*.5+best.off*.5):best.off;calOK=true;Net.rtt=Math.round(best.rtt);Net.calFail=0}else Net.calFail=(Net.calFail||0)+1;
    try{ndel('/ping/'+id)}catch(e){}
  }finally{calBusy=false}
}

/* ---- trilho de amostras com carimbo de tempo ---- */
function push(b,w,o){if(b.length&&w<=b[b.length-1].w)return;o.w=w;b.push(o);if(b.length>16)b.shift()}
function sample(b,t,extra){
  if(!b.length)return null;const l=b[b.length-1];
  if(t>=l.w){
    const p=b.length>1?b[b.length-2]:null;
    if(extra&&l.mv&&p&&p.s===l.s&&l.w>p.w){const ex=Math.min(MAXEX,t-l.w),dt=l.w-p.w;return{x:l.x+(l.x-p.x)/dt*ex,z:l.z+(l.z-p.z)/dt*ex,s:l.s,y:l.y,mv:1}}
    return{x:l.x,z:l.z,s:l.s,y:l.y,mv:l.mv&&(t-l.w<300)?1:0};
  }
  if(t<=b[0].w)return{x:b[0].x,z:b[0].z,s:b[0].s,y:b[0].y,mv:0};
  let i=b.length-1;while(i>0&&b[i-1].w>t)i--;const a=b[i-1],c=b[i];
  if(a.s!==c.s)return{x:a.x,z:a.z,s:a.s,y:a.y,mv:0};
  const k=(t-a.w)/Math.max(1,c.w-a.w);
  return{x:a.x+(c.x-a.x)*k,z:a.z+(c.z-a.z)*k,s:c.s,y:(a.y!=null&&c.y!=null)?angl(a.y,c.y,k):c.y,mv:c.mv||a.mv?1:0};
}

/* ---- envio da posição (PATCH só com o que mudou) ---- */
netSendPos=function(force){
  if(!Net.on||!Net.ready)return;
  const now=performance.now();
  if(!Net.joinT)Net.joinT=Math.round(snow());
  const cur={x:Math.round(P.x),z:Math.round(P.z*1000)/1000,y:Math.round((R3.yaw||0)*50)/50,m:P.moving?1:0,
    n:Net.name,pu:(AUTH.user&&AUTH.user.uid)||'',s:P.scene,f:P.face<0?-1:1,u:P.uniform?1:0,g:P.gang||0,lk:(typeof LOOK!=='undefined'&&LOOK)?lookStr(LOOK):'',k:P.sleeping?1:0,a:P.atk>0?1:0,h:Math.round(P.hp)};
  const key=JSON.stringify(cur);
  if(!force&&key===Net.lastPos&&now-Net.posT<2000)return;
  const full=force||!Net.sent||now-(Net.fullT||0)>5000;
  const patch={};
  for(const k in cur)if(full||!Net.sent||Net.sent[k]!==cur[k])patch[k]=cur[k];
  if(full)Net.fullT=now;
  Net.sent=cur;Net.lastPos=key;Net.posT=now;Net.beat++;
  patch.b=Net.beat;patch.w=Math.round(snow());patch.j=Net.joinT;
  Net.sendQ=Object.assign(Net.sendQ||{},patch);flush();
};
function flush(){
  while(Net.sendQ&&(Net.inflight||0)<2){
    const o=Net.sendQ;Net.sendQ=null;Net.inflight=(Net.inflight||0)+1;
    fetch(nurl('/players/'+Net.id,'?print=silent'),{method:'PATCH',body:JSON.stringify(o)}).catch(()=>{}).then(()=>{Net.inflight--;if(Net.sendQ)flush()});
  }
}

/* ---- receção ---- */
const syncA=netSync;
netSync=function(){
  syncA();
  const pl=Net.mirror.players||{},n=snow();
  for(const id in pl){
    if(id===Net.id)continue;const d=pl[id],q=Net.peers[id];
    if(!q||!d||typeof d.x!=='number')continue;
    if(q.seen!=null&&d.b<=q.seen)continue;
    q.seen=d.b;q.rm=d.m?1:0;q.j=d.j;if(typeof d.pu==='string'&&d.pu){q.pu=d.pu.slice(0,40);if(window.AVload)AVload(q.pu)}
    let w=d.w;if(typeof w!=='number'||Math.abs(n-w)>5000)w=n;
    if(w!==n){const raw=clampN(n-w,0,8000);
      if(q.mn==null){q.mn=raw;q.dj=40}else{q.mn+=raw<q.mn?(raw-q.mn)*.35:(raw-q.mn)*.004;q.dj+=(Math.max(0,raw-q.mn)-q.dj)*.06}
      q.bf=clampN(150+1.6*q.dj,200,480);q.pd=q.mn+q.bf}
    push(q.buf||(q.buf=[]),w,{x:d.x,z:d.z,s:d.s,y:typeof d.y==='number'?Math.PI-d.y:null,mv:d.m?1:0});
  }
  pickHost();
};
function pickHost(){
  let bj=Net.joinT||Infinity,bid=Net.id;
  for(const id in Net.peers){const j=Net.peers[id].j!=null?Net.peers[id].j:Infinity;if(j<bj||(j===bj&&id<bid)){bj=j;bid=id}}
  Net.host=bid===Net.id;
}
/* NPCs / guardas: alimenta buffers só com o que chegou de novo */
const msgA=netMsg;
netMsg=function(e,merge){
  msgA(e,merge);
  if(!isW(Net.room)||Net.host)return;
  let d;try{d=JSON.parse(e.data)}catch(_){return}
  if(!d||typeof d.path!=='string')return;
  const seg=d.path.split('/').filter(Boolean);
  if(!seg.length){const x=d.data;if(x){if(x.nd)applyNd(x.nd);if(x.n)feed('n',x.n);if(x.g)feed('g',x.g)}return}
  if(seg[0]==='nd'){applyNd(Net.mirror.nd);return}
  if((seg[0]==='n'||seg[0]==='g')&&d.data){
    if(seg.length===1)feed(seg[0],d.data);else if(seg.length===2){const o={};o[seg[1]]=d.data;feed(seg[0],o)}
  }
};
function feed(kind,obj){
  const n=snow();
  for(const k in obj){const r=obj[k];if(!Array.isArray(r))continue;
    const t=kind==='n'?NPC.find(x=>x.nid==+k):GUARDS[+k];if(!t)continue;
    let w=r[5];if(typeof w!=='number'||Math.abs(n-w)>8000)w=n;
    else{const raw=clampN(n-w,0,8000);if(Net.hmn==null){Net.hmn=raw;Net.hdj=60}else{Net.hmn+=raw<Net.hmn?(raw-Net.hmn)*.35:(raw-Net.hmn)*.004;Net.hdj+=(Math.max(0,raw-Net.hmn)-Net.hdj)*.05}Net.hb=clampN(HSEND*1000+150+1.6*Net.hdj,380,800);Net.hd=Net.hmn+Net.hb}
    push(t.nbuf||(t.nbuf=[]),w,{s:r[0],x:r[1],z:r[2],f:r[3],c:r[4],y:null,mv:0});
  }
}
function applyNd(st){
  if(!st)return;
  for(const n of NPC){const r=st[n.nid];if(!r)continue;
    n.name=r[3];n.skin=r[0];n.hair=r[1];n.suit=r[2];n.big=r[4]||1;n.work=r[5]||null;
    if(r[6]&&typeof GANG!=='undefined'&&GANG[r[6]]){n.gang=r[6];n.band=GANG[r[6]].c}
    if(R3.chars)R3.chars.delete(n)}
}
function ids(){if(NPC.some(n=>n.nid!=null))return;let i=0;for(const n of NPC)if(!n.cop)n.nid=i++}

/* ---- ciclo por frame ---- */
let calT=0;
netUpdate=function(dt){
  if(!Net.on||!Net.ready)return;
  const st=snow();
  if(!Net.calDone||Net.calDone!==Net.id){Net.calDone=Net.id;calOK=false;calibrate()}
  calT-=dt;if(calT<=0){calT=45;calibrate()}
  /* amigos */
  for(const p of Object.values(Net.peers)){
    const s=p.buf&&sample(p.buf,st-(p.pd||PD),true);
    if(s){const m=Math.hypot(s.x-p.x,(s.z-p.z)*600);p.x=s.x;p.z=s.z;p.scene=s.s;if(s.y!=null)p.ryaw=s.y;
      p.moving=!!s.mv&&(m/Math.max(dt,.001)>6);if(p.moving)p.walk+=dt}
    if(p.talkT>0)p.talkT-=dt;
  }
  /* relógio do mundo = hora do servidor */
  const tg=(st/1000*TS)%1440;let d=wrapD(tg-S.t);
  if(Math.abs(d)>8){if(d>0&&tg<S.t)S.day++;S.t=tg;try{snapNPCs()}catch(e){}}
  else S.speed=clampN(1+d*.5,.4,2.2);
  /* mundo partilhado (só MUNDO) */
  if(isW(Net.room)){
    ids();
    const wt=st-(Net.hd||HD);
    if(!Net.host){
      for(const n of NPC){
        if(n.nid==null||n.fixed||n.cop||n.aggro>0||n.ko>0||n.down>0||n.talkHold>GT)continue;
        const s=n.nbuf&&sample(n.nbuf,wt,false);if(!s)continue;
        const m=Math.hypot(s.x-n.x,(s.z-n.z)*600);n.moving=m>1.2;if(m>1.2&&Math.abs(s.x-n.x)>.4)n.face=s.x>n.x?1:-1;
        n.scene=s.s;n.x=s.x;n.z=s.z;n.tx=null;n.tz=null}
      GUARDS.forEach(g=>{
        if(g.fixed||g.state!=='patrol'||g.ko>0||g.down>0)return;
        const s=g.nbuf&&sample(g.nbuf,wt,false);if(!s)return;
        const m=Math.hypot(s.x-g.x,(s.z-g.z)*600);g.moving=m>1.2;if(m>1.2&&Math.abs(s.x-g.x)>.4)g.face=s.x>g.x?1:-1;
        g.scene=s.s;g.x=s.x;g.z=s.z;g.tx=null})
    }else{
      Net.nT=(Net.nT||0)-dt;
      if(Net.nT<=0){Net.nT=HSEND;const w=Math.round(st);
        const on={},og={};let cn=0,cg=0;Net.lastN=Net.lastN||{};Net.lastG=Net.lastG||{};
        for(const n of NPC){if(n.nid==null)continue;const r=[n.scene,Math.round(n.x),Math.round(n.z*1000)/1000,n.face<0?-1:1,(n.ko>0||n.down>0||n.aggro>0)?1:0];const k=r.join(',');
          if(Net.lastN[n.nid]!==k){Net.lastN[n.nid]=k;r.push(w);on[n.nid]=r;cn++}}
        GUARDS.forEach((g,i)=>{const r=[g.scene,Math.round(g.x),Math.round(g.z*1000)/1000,g.face<0?-1:1,(g.state==='patrol'&&!(g.ko>0)&&!(g.down>0))?0:1];const k=r.join(',');
          if(Net.lastG[i]!==k){Net.lastG[i]=k;r.push(w);og[i]=r;cg++}});
        if(cn)fetch(nurl('/n','?print=silent'),{method:'PATCH',body:JSON.stringify(on)}).catch(()=>{});
        if(cg)fetch(nurl('/g','?print=silent'),{method:'PATCH',body:JSON.stringify(og)}).catch(()=>{});
        if(!Net.ndSent||Net.ndN!==NPC.length){Net.ndSent=1;Net.ndN=NPC.length;const dd={};for(const n of NPC){if(n.nid!=null)dd[n.nid]=[n.skin,n.hair,n.suit||'#e07a1c',n.name,n.big||1,n.work||0,n.gang||0]}nput('/nd',dd)}
      }
    }
  }
  Net.posT0=(Net.posT0||0)-dt;
  if(Net.posT0<=0){Net.posT0=SEND;netSendPos(false)}
};
netAdoptClock=function(){};
/* separador em 2.º plano: mantém presença; ao fechar, sai da sala */
setInterval(()=>{if(Net.on&&Net.ready&&document.hidden)netSendPos(true)},1500);
addEventListener('pagehide',()=>{if(Net.on&&Net.id){try{navigator.sendBeacon&&0;fetch(nurl('/players/'+Net.id,'?print=silent'),{method:'DELETE',keepalive:true})}catch(e){}}});

/* luta entre jogadores: os socos/chutes também acertam nos amigos da sala */
const _strike=strike;
strike=function(range,mul,kd,kb,anim,dur){
  const can=!(P.cd>0||P.busy||P.sleeping||G.paused);
  const r=_strike(range,mul,kd,kb,anim,dur);
  if(can&&Net.on&&Net.ready){
    for(const p of Object.values(Net.peers)){
      if(p.scene!==P.scene||p.ko||!aimHit(p,range))continue;
      const dmg=Math.round(clampN((7+P.str*.22)*mul*(.85+Math.random()*.35),3,20));
      netEmit('hit',{d:dmg},p.id);p.hurt=.22;
      fx.push({x:p.x,z:p.z,s:p.scene,t:.7,txt:dmg,col:kd>0?'#ffb04d':'#ffe08a'});
      P.crime=Math.max(P.crime,3);
    }
  }
  return r;
};

/* reinício limpo a cada ligação / saída */
const _nc=netConnect;netConnect=function(...a){const r=_nc(...a);if(r){Object.assign(Net,{joinT:0,sent:null,fullT:0,sendQ:null,sending:false,lastN:{},lastG:{},ndSent:0,ndN:0,calDone:null,lastPos:'',nT:0,inflight:0,hdm:null,hmn:null,hb:0,hd:0});for(const n of NPC)n.nbuf=null;for(const g of GUARDS)g.nbuf=null}return r};
const _nl=netLeave;netLeave=function(...a){S.speed=1;if(!a[0])Net.manual=1;return _nl(...a)};

/* ---- entrada automática no MUNDO ---- */
function wname(){const e=(AUTH.user&&AUTH.user.email)||'';return(e.split('@')[0]||'Preso').replace(/[^A-Za-z0-9]/g,'').slice(0,12)||'Preso'}
async function pickWorld(start){const t=AUTH.user&&AUTH.user.id?'?auth='+AUTH.user.id:'';
  for(let i=start||1;i<=99;i++){const room='W'+i;let pl=null;try{const r=await fetch(CFG.dbUrl.replace(/\/$/,'')+'/pm/rooms/'+room+'/players.json'+t);pl=await r.json()}catch(e){}
    const act=pl?Object.values(pl).filter(p=>p&&Math.abs(Date.now()-(p.w||0))<40000).length:0;if(act<6)return room}
  return 'W99'}
window.worldNext=async cur=>{try{if(Net.on)return;const r=await pickWorld((+String(cur).slice(1)||0)+1);netConnect(r,wname(),CFG.dbUrl,false)}catch(e){}};
const lastRoom=()=>{try{const r=localStorage.getItem('pm_lastroom');return isW(r)?r:null}catch(e){return null}};
async function activeIn(room){const t=AUTH.user&&AUTH.user.id?'?auth='+AUTH.user.id:'';try{const r=await fetch(CFG.dbUrl.replace(/\/$/,'')+'/pm/rooms/'+room+'/players.json'+t);const pl=await r.json();return pl?Object.values(pl).filter(p=>p&&Math.abs(Date.now()-(p.w||0))<40000).length:0}catch(e){return 0}}
function autoJoin(){
  try{ids();if(Net.on||Net.joining||!AUTH.live()||!AUTH.user||AUTH.user.local||!PAY.has('world')||!CFG.dbUrl)return;Net.joining=1;
    (async()=>{let r=lastRoom();if(r&&(await activeIn(r))>=6)r=null;if(!r)r=await pickWorld(1);return r})()
      .then(r=>{Net.joining=0;if(!Net.on&&netConnect(r,wname(),CFG.dbUrl,false)){Net.manual=0;banner('A entrar na sala '+r+'…','#9fe3a0',2200)}}).catch(()=>{Net.joining=0})}catch(e){Net.joining=0}}
/* guarda a sala; religa sozinho se sair ou perder a ligação */
const _nc2=netConnect;netConnect=function(...a){const r=_nc2(...a);if(r&&isW(Net.room)){try{localStorage.setItem('pm_lastroom',Net.room)}catch(e){}}return r};
async function resub(){if(!Net.on||Net.resubBusy)return;Net.resubBusy=1;try{await AUTH.token();try{Net.es&&Net.es.close()}catch(e){}
  const es=new EventSource(nurl(''));Net.es=es;es.addEventListener('put',e=>netMsg(e,false));es.addEventListener('patch',e=>netMsg(e,true));
  es.onerror=()=>{Net.status=Net.ready?'a reconectar…':'sem ligação';Net.errT=performance.now()};es.addEventListener('cancel',()=>{Net.status='sem permissão'})}catch(e){}finally{Net.resubBusy=0}}
setInterval(()=>{ /* vigia a cada 4 s */
  try{
    if(Net.on&&Net.es&&(Net.es.readyState===2||Net.status==='sem permissão'))resub();
    else if(!Net.on&&!Net.joining&&!Net.manual&&G.started&&!G.over&&!(window.ST&&ST.on)&&AUTH.user&&PAY.has('world')&&navigator.onLine!==false)autoJoin();
  }catch(e){}},4000);
setInterval(()=>{if(Net.on)resub()},25*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Net.on){netSendPos(true);if(Net.es&&Net.es.readyState===2)resub()}});
addEventListener('online',()=>{if(Net.on)resub()});
/* limpeza: o anfitrião apaga jogadores parados há mais de 60 s */
setInterval(()=>{try{if(!Net.on||!Net.ready||!Net.host)return;const pl=Net.mirror.players||{},n=snow();for(const id in pl){if(id===Net.id)continue;const w=pl[id]&&pl[id].w;if(typeof w==='number'&&n-w>60000)ndel('/players/'+id)}}catch(e){}},15000);
const _begin=begin;begin=function(c){_begin(c);Net.manual=0;setTimeout(autoJoin,1500)};

window.__nt=()=>({off:OFF,ok:calOK});
})();
/* ---- etiqueta de diagnóstico (canto inferior esquerdo) ---- */
(function(){
const VER='v13';
const el=document.createElement('div');el.style.cssText='position:fixed;left:6px;bottom:4px;z-index:99;font:600 10px/1.2 system-ui,sans-serif;color:#fff;opacity:.55;pointer-events:none;text-shadow:0 1px 2px #000;white-space:nowrap';document.body.appendChild(el);
setInterval(()=>{
  if(!document.body.classList.contains('ingame')){el.textContent='';return}
  const on=Net.on&&Net.ready,nt=window.__nt?__nt():{off:0,ok:false};
  const pd=on?Math.round(Math.max(0,...Object.values(Net.peers).map(p=>p.bf||0),Net.hb||0)):0;
  el.textContent=VER+' · '+(on?Net.room+' · '+(Object.keys(Net.peers).length+1)+' online · rtt '+(Net.rtt==null?'?':Net.rtt)+'ms · Δ'+Math.round(nt.off)+'ms'+(nt.ok?'':' SEM-RELÓGIO')+' · buffer '+pd+'ms · ':'offline · ')+(window.__perf?__perf().fps:'?')+'fps'+(Net.host?' · anfitrião':'');
},500);
})();

