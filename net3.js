/* Online em tempo real: interpolação com buffer, ordem garantida, relógio compensado */
(function(){
const DELAY=140,SEND=.09;
function angl(a,b,t){let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*t}
netSendPos=function(force){
  if(!Net.on||!Net.ready)return;
  const now=performance.now();
  const yaw=Math.round((R3.yaw||0)*50)/50;
  const o={n:Net.name,x:Math.round(P.x),z:Math.round(P.z*1000)/1000,s:P.scene,f:P.face,a:P.atk>0?1:0,k:P.sleeping?1:0,u:P.uniform?1:0,h:Math.round(P.hp),g:P.gang||0,y:yaw,m:P.moving?1:0};
  const key=o.x+','+o.z+','+o.s+','+o.f+','+o.a+','+o.k+','+o.u+','+o.y+','+o.m;
  if(!force&&key===Net.lastPos&&now-Net.posT<2000)return;
  Net.lastPos=key;Net.posT=now;Net.beat++;o.b=Net.beat;
  Net.sendQ=o;if(!Net.sending)flush();
};
function flush(){
  const o=Net.sendQ;if(!o){Net.sending=false;return}
  Net.sendQ=null;Net.sending=true;
  fetch(nurl('/players/'+Net.id,'?print=silent'),{method:'PUT',body:JSON.stringify(o),keepalive:true}).catch(()=>{}).then(()=>{Net.sending=false;if(Net.sendQ)flush()});
}
const oldSync=netSync;
netSync=function(){
  oldSync();
  const now=performance.now(),pl=Net.mirror.players||{};
  for(const id in pl){
    if(id===Net.id)continue;const d=pl[id],q=Net.peers[id];
    if(!d||typeof d.x!=='number'||!q)continue;
    if(q.seen!=null&&d.b<=q.seen)continue;
    q.seen=d.b;q.ryaw=typeof d.y==='number'?Math.PI-d.y:null;q.rm=d.m?1:0;
    const b=q.buf||(q.buf=[]);b.push({t:now,x:d.x,z:d.z,s:d.s,y:q.ryaw});if(b.length>12)b.shift();
  }
  /* guardas do anfitrião */
  const gs=Net.mirror.g;
  if(!Net.host&&Array.isArray(gs)&&gs.t!==Net.gseen){
    const key=JSON.stringify(gs);
    if(key!==Net.gkey){Net.gkey=key;gs.forEach((r,i)=>{if(!r)return;const g=GUARDS[i];if(!g)return;const b=g.nbuf||(g.nbuf=[]);b.push({t:now,s:r[0],x:r[1],z:r[2],f:r[3],c:r[4]});if(b.length>8)b.shift()})}
  }
};
netUpdate=function(dt){
  if(!Net.on||!Net.ready)return;
  const now=performance.now(),rt=now-DELAY;
  for(const p of Object.values(Net.peers)){
    const b=p.buf;
    if(b&&b.length){
      let i=b.length-1;while(i>0&&b[i-1].t>rt)i--;
      const a=b[Math.max(0,i-1)],c=b[i];let x,z,y;
      if(c.t<=rt||a===c){ /* à frente do último: extrapola até 150 ms */
        const l=b[b.length-1],pv=b.length>1?b[b.length-2]:l;const dtm=Math.max(30,l.t-pv.t);
        const ex=Math.min(150,Math.max(0,rt-l.t));
        const vx=l.s===pv.s?(l.x-pv.x)/dtm:0,vz=l.s===pv.s?(l.z-pv.z)/dtm:0;
        x=l.x+vx*ex;z=l.z+vz*ex;y=l.y;p.scene=l.s;
      }else{
        if(a.s!==c.s){x=c.x;z=c.z;y=c.y;p.scene=c.s}
        else{const k=(rt-a.t)/Math.max(1,c.t-a.t);x=a.x+(c.x-a.x)*k;z=a.z+(c.z-a.z)*k;y=(a.y!=null&&c.y!=null)?angl(a.y,c.y,k):c.y;p.scene=c.s}
      }
      const sp=Math.hypot(x-p.x,(z-p.z)*600)/Math.max(dt,.001);
      if(Math.hypot(x-p.x,(z-p.z)*600)>420){p.x=x;p.z=z}else{p.x=x;p.z=z}
      p.moving=p.rm?sp>6:sp>40;if(p.moving)p.walk+=dt;
      if(y!=null)p.ryaw=y;
    }
    if(p.talkT>0)p.talkT-=dt;
  }
  /* seguir guardas do anfitrião (só em patrulha) */
  if(!Net.host){GUARDS.forEach(g=>{
    const b=g.nbuf;if(!b||!b.length||g.fixed||g.state!=='patrol'||g.ko>0||g.down>0)return;
    const l=b[b.length-1];if(l.c){return}
    let i=b.length-1;while(i>0&&b[i-1].t>rt)i--;const a=b[Math.max(0,i-1)],c=b[i];let x,z,sc;
    if(c.t<=rt||a===c||a.s!==c.s){x=l.x;z=l.z;sc=l.s}else{const k=(rt-a.t)/Math.max(1,c.t-a.t);x=a.x+(c.x-a.x)*k;z=a.z+(c.z-a.z)*k;sc=c.s}
    const mv=Math.hypot(x-g.x,(z-g.z)*600);g.moving=mv>1.5;if(mv>1.5&&Math.abs(x-g.x)>.5)g.face=x>g.x?1:-1;
    g.scene=sc;g.x=x;g.z=z;g.tx=null});}
  Net.gT=(Net.gT||0)-dt;
  if(Net.host&&Net.gT<=0){Net.gT=.2;nput('/g',GUARDS.map(g=>[g.scene,Math.round(g.x),Math.round(g.z*1000)/1000,g.face<0?-1:1,g.state==='patrol'&&!(g.ko>0)&&!(g.down>0)?0:1]))}
  Net.posT0=(Net.posT0||0)-dt;
  if(Net.posT0<=0){Net.posT0=SEND;netSendPos(false)}
  Net.clockT-=dt;
  if(Net.clockT<=0){Net.clockT=2;if(Net.host)nput('/clock',{t:S.t,day:S.day,w:Date.now(),sp:S.speed||1})}
};
netAdoptClock=function(force){
  const c=Net.mirror.clock;if(!c||typeof c.t!=='number')return;
  const lag=c.w?Math.max(0,Math.min(5000,Date.now()-c.w))/1000:0;
  const abs=c.day*1440+c.t+lag*TS*(c.sp||1),me=S.day*1440+S.t,d=abs-me;
  if(force||Math.abs(d)>8){const a=abs;S.day=Math.floor(a/1440);S.t=a-S.day*1440;updateDoors();if(force)snapNPCs()}
  else if(Math.abs(d)>.15){S.t+=d*.15;if(S.t<0)S.t=0} /* correção suave */
};

/* ===== MUNDO ONLINE: sala única automática (como o GTA Online) ===== */
const WORLD='MUNDO';
const nk=n=>n.nid;
function ids(){if(NPC.some(n=>n.nid!=null))return;let i=0;for(const n of NPC)if(!n.cop)n.nid=i++}
function wname(){const e=(AUTH.user&&AUTH.user.email)||'';return(e.split('@')[0]||'Preso').replace(/[^A-Za-z0-9]/g,'').slice(0,12)||'Preso'}
function autoJoin(){
  try{ids();if(Net.on||!AUTH.live()||!AUTH.user||!PAY.has('world')||!CFG.dbUrl)return;
    if(netConnect(WORLD,wname(),CFG.dbUrl,false))banner('A entrar no Mundo online…','#9fe3a0',2200)}catch(e){}}
const _begin=begin;begin=function(c){_begin(c);setTimeout(autoJoin,1500)};
const syncA=netSync;
netSync=function(){
  syncA();
  if(Net.room!==WORLD)return;
  const now=performance.now(),st=Net.mirror.nd,mv=Net.mirror.n;
  if(!Net.host){
    if(st&&JSON.stringify(st)!==Net.ndKey){Net.ndKey=JSON.stringify(st);
      for(const n of NPC){const r=st[nk(n)];if(r){n.name=r[3];n.skin=r[0];n.hair=r[1];n.suit=r[2];n.big=r[4]||1;n.work=r[5]||null;if(r[6]&&typeof GANG!=='undefined'&&GANG[r[6]]){n.gang=r[6];n.band=GANG[r[6]].c}if(R3.chars)R3.chars.delete(n)}}}
    if(mv&&typeof mv==='object'){const key=JSON.stringify(mv);
      if(key!==Net.nkey){Net.nkey=key;for(const n of NPC){if(n.nid==null)continue;const r=mv[n.nid];if(!r)continue;const b=n.nbuf||(n.nbuf=[]);b.push({t:now,s:r[0],x:r[1],z:r[2],f:r[3],c:r[4]});if(b.length>8)b.shift()}}}
  }
};
const updA=netUpdate;
netUpdate=function(dt){
  updA(dt);
  if(!Net.on||!Net.ready||Net.room!==WORLD)return;
  const rt=performance.now()-DELAY;
  if(!Net.host){
    for(const n of NPC){
      if(n.nid==null)continue;const b=n.nbuf;if(!b||!b.length||n.fixed||n.cop||n.aggro>0||n.ko>0||n.down>0||n.talkHold>GT)continue;
      const l=b[b.length-1];if(l.c)continue;
      let i=b.length-1;while(i>0&&b[i-1].t>rt)i--;const a=b[Math.max(0,i-1)],c=b[i];let x,z,sc;
      if(c.t<=rt||a===c||a.s!==c.s){x=l.x;z=l.z;sc=l.s}else{const k=(rt-a.t)/Math.max(1,c.t-a.t);x=a.x+(c.x-a.x)*k;z=a.z+(c.z-a.z)*k;sc=c.s}
      const m=Math.hypot(x-n.x,(z-n.z)*600);n.moving=m>1.5;if(m>1.5&&Math.abs(x-n.x)>.5)n.face=x>n.x?1:-1;
      n.scene=sc;n.x=x;n.z=z;n.tx=null;n.tz=null;
    }
  }else{
    Net.nT=(Net.nT||0)-dt;
    if(Net.nT<=0){Net.nT=.25;
      const o={};for(const n of NPC){if(n.nid==null)continue;o[n.nid]=[n.scene,Math.round(n.x),Math.round(n.z*1000)/1000,n.face<0?-1:1,(n.ko>0||n.down>0||n.aggro>0)?1:0]}
      nput('/n',o);
      if(!Net.mirror.nd||Net.ndN!==NPC.length){Net.ndN=NPC.length;const d={};for(const n of NPC){if(n.nid!=null)d[n.nid]=[n.skin,n.hair,n.suit||'#e07a1c',n.name,n.big||1,n.work||0,n.gang||0]}nput('/nd',d)}}
  }
};
})();
