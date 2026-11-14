'use strict';
/* Renderização, personagens, câmara em primeira pessoa e controlos (substitui o desenho 2D antigo) */
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
let R3last=0;
function txtTex(text,kind,col){const key=kind+'|'+text+'|'+(col||'');let r=R3.txt.get(key);if(r)return r;
  const c=document.createElement('canvas'),x=c.getContext('2d');let w=256,h=64;
  if(kind==='bubble'){c.width=w=512;c.height=h=160;x.fillStyle='#fffdf0';x.strokeStyle='#111';x.lineWidth=6;x.beginPath();x.roundRect(6,6,w-12,h-40,22);x.fill();x.stroke();x.beginPath();x.moveTo(w/2-16,h-34);x.lineTo(w/2,h-6);x.lineTo(w/2+16,h-34);x.fill();x.fillStyle='#fffdf0';x.fillRect(w/2-14,h-38,28,6);
    x.fillStyle='#111';x.font='700 28px Barlow,system-ui,sans-serif';x.textAlign='center';const words=String(text).split(' ');let line='',y=48,lines=[];for(const wd of words){const t=line?line+' '+wd:wd;if(x.measureText(t).width>w-50){lines.push(line);line=wd}else line=t}lines.push(line);const L=lines.slice(0,3);L.forEach((s,i)=>x.fillText(s,w/2,y+i*(L.length>2?30:34)-(L.length>1?(L.length-1)*6:0)))}
  else if(kind==='sign'){c.width=w=512;c.height=h=96;x.fillStyle='#10161e';x.beginPath();x.roundRect(4,4,w-8,h-8,12);x.fill();x.strokeStyle='#e9e2c8';x.lineWidth=4;x.stroke();x.fillStyle='#f3efe0';x.font='700 44px Barlow Condensed,Impact,sans-serif';x.textAlign='center';x.fillText(text,w/2,h/2+15)}
  else if(kind==='shop'){c.width=w=512;c.height=h=96;x.fillStyle=col||'#c0392b';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='800 50px Barlow Condensed,Impact,sans-serif';x.textAlign='center';x.fillText(text,w/2,h/2+17)}
  else{c.width=w=256;c.height=h=64;x.font='800 34px Barlow Condensed,Impact,sans-serif';x.textAlign='center';x.lineWidth=7;x.strokeStyle='rgba(0,0,0,.85)';x.strokeText(text,w/2,44);x.fillStyle=col||'#fff';x.fillText(text,w/2,44)}
  r={t:R3.gl.texC(c,false),a:w/h};R3.txt.set(key,r);if(R3.txt.size>300){const k=R3.txt.keys().next().value;R3.txt.delete(k)}return r}
function sprTex(k){if(!k)return null;let r=R3.spr[k];if(r)return r;const im=IMG[k];if(!im||!im.complete||!im.naturalWidth)return null;r={t:R3.gl.texC(im,false),a:im.naturalWidth/im.naturalHeight};R3.spr[k]=r;return r}
function bill(g,t,x,y,z,w,h,o){const v=g.view;g.draw(g.quad,new Float32Array([v[0]*w,v[4]*w,v[8]*w,0,v[2],v[6],v[10],0,v[1]*h,v[5]*h,v[9]*h,0,x,y,z,1]),Object.assign({tex:t,col:[1,1,1],em:1,a:1},o||{}))}
/* ---------- personagens ---------- */
function look4(n){const l=defaultLook();const h=Math.abs(((n.name||'x').charCodeAt(0)||5)+((n.name||'xx').charCodeAt(1)||3))%7;l.hair=[1,1,2,0,1,2,1][h];l.height=cl(n.big||1,.85,1.2)*(.97+(h%3)*.03);l.build=.95+(h%4)*.05;if(n.guard||n.cop||n.cap)l.acc=['bone'];return l}
function charFor(n){let c=R3.chars.get(n);if(!c){c=new Char(look4(n),n.name||'');R3.chars.set(n,c);c.yaw=n.face<0?-Math.PI/2:Math.PI/2}
  const gang=n.gang&&typeof GANG!=='undefined'?GANG[n.gang]:null;
  const top=n.cop?'#1b2a55':n.uniform||n.guard?'#243f78':(n.suit||'#e07a1c'),pants=n.cop?'#10162b':n.uniform||n.guard?'#1a2a50':'#c25f12';
  c.c={skin:hx(n.skin||'#d9a273'),hair:hx(n.hair||'#222'),top:hx(top),pants:hx(pants),shoe:[.08,.07,.07]};return c}
function placeChar(c,n,dt){const tx=n.x/UX,tz=n.z*DZ;c.x=tx;c.z=tz;
  let want=c.yaw;const dxp=P.x-n.x,near=Math.abs(dxp)<420&&n.scene===P.scene;
  if(n.talkT>0||n.aggro>0||(near&&!n.moving))want=Math.atan2((P.x-n.x)/UX,(P.z-n.z)*DZ);else want=(n.face<0?-1:1)*Math.PI/2;
  let d=want-c.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));c.yaw+=d*Math.min(1,dt*9);
  const run=n.running||(n.state==='chase'&&n.moving)||(n.aggro>0&&n.moving);
  const lying=n.ko>0||n.down>0;c.dead=lying?1:0;if(!lying&&c.fall>0)c.fall=Math.max(0,c.fall-dt*2.5);
  c.pose(dt,n.moving?(run?4.4:1.9):0);
  c.punch=n.atk>0?cl(n.atk/(n.atkD||.28),0,1):0;
  if(n.hurt>0)c.stun=.1}
/* ---------- ambiente ---------- */
function setEnv(g,sc){const d=cl(darkness()/.8,0,1),out=!!sc.out;
  if(out){g.env={ambS:mixc([.82,.86,.96],[.14,.17,.3],d),ambG:mixc([.4,.36,.3],[.06,.07,.12],d),sun:[.4,-.8,.3],sunC:mixc([.78,.7,.55],[.1,.13,.22],d),fog:mixc([.72,.84,.93],[.04,.07,.15],d),fogD:out&&sc.id==='rua'?.011:.01}}
  else g.env={ambS:mixc([1.0,1.0,1.04],[.42,.45,.6],d),ambG:mixc([.7,.66,.6],[.24,.24,.3],d),sun:[.3,-.9,.2],sunC:[.1,.1,.1],fog:mixc([.14,.14,.17],[.03,.03,.05],d),fogD:.016};
  g.lights=R3.lights}
function finishScene(){const g=R3.gl;
  for(const d of R3.dyn){
    if(d.t==='doorsign'){const tt=txtTex((d.d.lbl||d.d.label||'').toUpperCase(),'sign');IT(g.quad,M.mul(M.T(d.x,2.8,.05),M.mul(M.RX(Math.PI/2),M.mul(M.RY(Math.PI),M.S(1.9,1,1.9/tt.a)))),{tex:tt.t,col:[1,1,1],em:.35,a:1},d.x,1)}
    if(d.t==='shop'){const tt=txtTex(d.text,'shop',cssc(d.col));IT(g.quad,M.mul(M.T(d.x,2.9,.67),M.mul(M.RX(Math.PI/2),M.mul(M.RY(Math.PI),M.S(5.6,1,5.6/tt.a*.4)))),{tex:txtTex(d.text,'shop',cssc(d.col)).t,col:[1,1,1],em:.5,a:1},d.x,1)}}}
const cssc=c=>'rgb('+c.map(v=>Math.round(v*255)).join(',')+')';
function ensureScene(){if(R3.sceneId!==P.scene){buildScene(P.scene);finishScene()}}
/* ---------- desenho do jogo ---------- */
function drawItems(g,ex,alpha){for(const it of R3.items){if(!!it.dec!==alpha)continue;if(Math.abs(it.cx-ex)>75)continue;if(it.o.seg!==undefined&&G.cut&&G.cut[it.o.seg])continue;g.draw(it.m,it.mat,it.o)}}
function dArms(g,col,sleeve){const t=0}
function renderGame(now,dt){
  const g=R3.gl,sc=SC[P.scene];ensureScene();setEnv(g,sc);
  const sl=!!P.sleeping;
  let ex=P.x/UX,ez=P.z*DZ,ey=sl?.55:1.62+Math.sin(R3.bob)*.035*(P.moving?1:0)+(P.crouch?-.4:0);
  if(P.shake>0){ex+=(Math.random()-.5)*.05;ey+=(Math.random()-.5)*.05}
  const yaw=R3.yaw,pit=sl?.7:R3.pitch,cp=Math.cos(pit),f=[Math.sin(yaw)*cp,Math.sin(pit),-Math.cos(yaw)*cp];
  P.face=Math.abs(f[0])>.25?(f[0]>0?1:-1):P.face;
  g.focus=[ex,1.5,ez];
  g.cvfov=g.asp<1?1.5:1.15;
  g.begin([ex,ey,ez],[ex+f[0],ey+f[1],ez+f[2]],g.cvfov);
  /* céu */
  if(sc.out){const dk=darkness()>.4;g.draw(g.sph,M.mul(M.T(ex,0,ez),M.S(110,110,110)),{tex:dk?R3.tex.night:R3.tex.sky,col:[1,1,1],em:1,cf:1,a:1});g.gl.clear(g.gl.DEPTH_BUFFER_BIT)}
  drawItems(g,ex,false);
  /* personagens */
  const list=[];for(const n of ALL())if(n.scene===P.scene&&!n.car)list.push(n);
  if(typeof Net==='object'&&Net.on)for(const id in Net.peers){const r=Net.peers[id];if(r.scene===P.scene)list.push(r)}
  const chs=[];for(const n of list){const c=charFor(n);placeChar(c,n,dt);c.scale=1;chs.push([c,n])}
  for(const b of BODIES)if(b.scene===P.scene){let c=R3.chars.get(b);if(!c){c=new Char(look4(b),b.name);c.dead=1;c.fall=1;R3.chars.set(b,c)}c.c={skin:hx(b.skin),hair:hx(b.hair),top:hx(b.suit||'#e07a1c'),pants:hx('#c25f12'),shoe:[.08,.07,.07]};c.x=b.x/UX;c.z=b.z*DZ;c.yaw=1.2;chs.push([c,null])}
  for(const [c] of chs)c.draw(g);
  drawCars(g);
  /* decalques */
  g.alpha(true);drawItems(g,ex,true);
  for(const b of BLOOD)if(b.s===P.scene)g.draw(g.quad,M.mul(M.T(b.x/UX,.02,b.z*DZ),M.S(b.sz/UX*2.4,1,b.sz/UX*2.4)),{tex:R3.tex.blob,col:[.5,.03,.03],a:.9,em:.2});
  g.alpha(false);
  g.shadowBegin();for(const [c] of chs)c.drawShadow(g);g.shadowEnd();
  /* pickups, brilho, texto */
  g.alpha(true);
  for(const k of PICKS)if(k.scene===P.scene){const s=sprTex(SPR_OF[k.id]);const h=(PK_H[k.id]||40)/70*.8,bb=Math.sin(R3.t*3+k.x)*.06;
    if(s)bill(g,s.t,k.x/UX,.55+bb,k.z*DZ,h*s.a,h,{});}
  g.alpha(false);
  g.additive(true);
  for(const k of PICKS)if(k.scene===P.scene)g.draw(g.quad,M.mul(M.T(k.x/UX,.04,k.z*DZ),M.S(1.1,1,1.1)),{tex:R3.tex.glow,col:[1,.9,.5],em:1,a:.5+.3*Math.sin(R3.t*4)});
  if(sc.out&&beamsOn())for(let i=0;i<2;i++){const bx=beamX(i)/UX;g.draw(g.quad,M.mul(M.T(bx,.05,3.5),M.S(9,1,9)),{tex:R3.tex.glow,col:[1,.95,.75],em:1.4,a:.55})}
  for(const d of R3.dyn){if(d.t==='doorsign'&&Math.abs(d.x-ex)<30){const lk=doorLocked(P.scene,d.d)||!d.d.to;bill(g,R3.tex.glow,d.x,3.25,.2,.5,.5,{col:lk?[1,.15,.1]:[.2,1,.4],em:1.2,a:.9})}
    if(d.t==='cam'&&Math.abs(d.x-ex)<40&&(camSeen>0||Math.floor(R3.t*2)%2))bill(g,R3.tex.glow,d.x,2.9,.62,.4,.4,{col:[1,.1,.1],em:1.3,a:.9})}
  g.additive(false);
  g.alpha(true);
  for(const [c,n] of chs){if(!n||c.dead)continue;const dd=Math.hypot(c.x-ex,c.z-ez);const y=c.look.height*1.95*1.12+.35;
    if(n.talk&&n.talkT>0){const t=txtTex(n.talk,'bubble');bill(g,t.t,c.x,y+.55,c.z,1.9,1.9/t.a,{})}
    else if(dd<7&&n.name&&!n.fixed){const t=txtTex(n.name,'name',n.guard?'#9fc0ff':n.aggro>0?'#ff8c7a':'#ffe9b0');bill(g,t.t,c.x,y,c.z,.9,.9/t.a,{})}}
  for(const q of fx)if(q.s===P.scene){const t=txtTex(String(q.txt),'name',q.col||'#ffe08a');bill(g,t.t,q.x/UX,2.1+(1-q.t)*.9,q.z*DZ,1,1/t.a,{a:cl(q.t*2,0,1)})}
  g.alpha(false);
  viewmodel(g,ex,ey,ez,yaw,pit);
  const v=document.getElementById('hurt');if(v)v.style.opacity=P.hurt>0?Math.min(.55,P.hurt*2.5):0;
  const sv=document.getElementById('sleepV');if(sv)sv.style.opacity=sl?.55:0;
}
function drawCars(g){if(P.scene!=='rua')return;for(const k of CARS){const x=k.x/UX,z=k.z*DZ+1.2;if(k.taken&&P.car!==k)continue;const col=hx(k.col);const m=M.T(x,0,z);
    const B=(cx,cy,cz,w,h,d,c,o)=>{const mm=M.mul(m,M.mul(M.T(cx,cy+h/2,cz),M.S(w,h,d)));g.draw(g.cube,mm,Object.assign({col:c,toon:1,spec:.3},o||{}));g.draw(g.cube,M.mul(mm,M.S(1.04,1.04,1.04)),{col:[0,0,0],cf:1})};
    B(0,.35,0,4.2,.6,1.8,col);B(-.2,.95,0,2.3,.6,1.6,mulc(col,.9));B(-.2,1.0,0,2.15,.45,1.64,[.6,.8,.9],{em:.15});B(2.05,.5,.5,.05,.2,.3,[1,.95,.6],{em:1});B(2.05,.5,-.5,.05,.2,.3,[1,.95,.6],{em:1});B(-2.1,.5,.5,.05,.2,.3,[.9,.1,.1],{em:.8});B(-2.1,.5,-.5,.05,.2,.3,[.9,.1,.1],{em:.8});
    for(const sx of[-1.3,1.3])for(const sz of[-.9,.9]){g.draw(g.cyl,M.mul(m,M.mul(M.T(sx,.34,sz),M.mul(M.RX(Math.PI/2),M.S(.34,.2,.34)))),{col:[.07,.07,.08],toon:1})}}}
function viewmodel(g,ex,ey,ez,yaw,pit){const gl=g.gl;gl.clear(gl.DEPTH_BUFFER_BIT);
  const pc=window.PLC||{skin:hx('#d9a273'),top:hx('#e07a1c')};
  const cam=M.mul(M.T(ex,ey,ez),M.mul(M.RY(-yaw),M.RX(pit)));
  const k=P.atk>0?Math.sin((1-P.atk/(P.atkD||.26))*Math.PI):0,kick=P.atkK==='k';
  const bob=P.moving?Math.sin(R3.bob*1)*.012:0;
  const arm=(side,ext,idle)=>{const sx=side*.26;let tx=sx-side*ext*.12,ty=-.42+idle*.03+bob,tz=-.42-ext*.55;
    const m=M.mul(cam,M.mul(M.T(tx,ty,tz),M.mul(M.RX(1.2+ext*.2),M.RY(-side*.12))));
    g.draw(g.limb,M.mul(m,M.S(.045,.45,.045)),{col:pc.top,toon:1});g.draw(g.limb,M.mul(m,M.S(.05,.45,.05)),{col:[0,0,0],cf:1});
    const hm=M.mul(m,M.T(0,-.46,0));g.draw(g.sph,M.mul(hm,M.S(.052,.056,.056)),{col:pc.skin,toon:1});g.draw(g.sph,M.mul(hm,M.S(.06,.064,.064)),{col:[0,0,0],cf:1});return hm};
  if(!P.sleeping){
    const comb=P.combo||1;const rext=(P.atk>0&&P.atkK!=='p2'?k:0),lext=(P.atk>0&&P.atkK==='p2'?k:0);
    const hr=arm(1,rext,Math.sin(R3.t*1.7));arm(-1,lext,Math.sin(R3.t*1.7+1));
    if(P.hand&&!(P.atk>0)){const s=sprTex(SPR_OF[P.hand]);if(s){const hh_=PK_H[P.hand]||40;const hs=.42;g.alpha(true);g.draw(g.quad,M.mul(hr,M.mul(M.T(0,-.02,-.12),M.mul(M.RY(0),M.mul(M.RX(.25),M.S(hs*s.a,1,hs))))),{tex:s.t,col:[1,1,1],em:.9,a:1});g.alpha(false)}}}
}
/* ---------- palco (login, menu, personalizar) ---------- */
const STG={t:0,ch:null,orbit:0,mode:'menu',tx:0};
function renderStage(now,dt){const g=R3.gl;STG.t+=dt;
  g.env={ambS:[.34,.42,.55],ambG:[.1,.12,.16],sun:[.4,-.8,.4],sunC:[.5,.46,.4],fog:[.03,.07,.1],fogD:.03};
  g.lights=[{p:[2.2,2.6,2.4],c:[2.2,1.8,1.3]},{p:[-2.6,1.8,-1.6],c:[.5,.9,1.8]},{p:[0,3.4,0],c:[.8,.8,.9]}];
  const wide=innerWidth>760,m=STG.mode;
  let a=STG.orbit+(m==='login'?STG.t*.18:Math.sin(STG.t*.5)*.25);
  const dist=m==='custom'?(wide?3.4:3.9):(wide?4.4:3.9);
  const sh=m==='login'?0:(wide?(m==='custom'?-.9:.9):0);
  const ty=wide?1.0:-.45;
  const ex=Math.sin(a)*dist+Math.cos(a)*sh*0,ez=Math.cos(a)*dist;
  g.focus=[0,1.4,0];
  const tgx=Math.cos(a)*(-sh)*.9,tgz=-Math.sin(a)*(-sh)*.9;
  g.begin([ex+tgx,1.5,ez+tgz],[tgx,ty,tgz],wide?.95:1.25);
  g.draw(g.sph,M.mul(M.T(0,0,0),M.S(60,60,60)),{tex:R3.tex.night,col:[.7,.9,1.1],em:1,cf:1,a:1});g.gl.clear(g.gl.DEPTH_BUFFER_BIT);
  /* plataforma */
  g.draw(g.cyl,M.mul(M.T(0,.06,0),M.S(1.5,.06,1.5)),{col:[.12,.2,.28],toon:1,spec:.4});
  g.draw(g.cyl,M.mul(M.T(0,.065,0),M.S(1.56,.062,1.56)),{col:[0,0,0],cf:1});
  g.additive(true);g.draw(g.quad,M.mul(M.T(0,.08,0),M.S(3.4,1,3.4)),{tex:R3.tex.glow,col:[1,.6,.25],em:1,a:.5});g.additive(false);
  if(STG.ch){const c=STG.ch;c.x=0;c.z=0;c.yaw=STG.spin||0;c.pose(dt,0);c.draw(g);g.shadowBegin();c.drawShadow(g);g.shadowEnd()}
}
/* ---------- ciclo ---------- */
R3.t=0;
function render(now){if(!R3.gl)return;const t=performance.now()/1000,dt=Math.min(.05,t-R3last||.016);R3last=t;R3.t=t;
  if(G.started&&!G.over){R3.bob+=dt*(P.moving?(P.run?11:8):0);pollPad(dt);renderGame(now,dt)}else renderStage(now,dt)}
/* ---------- controlos ---------- */
function fpsMove(ix,iy,sp,dt){const y=R3.yaw,fx=Math.sin(y),fz=-Math.cos(y),rx=Math.cos(y),rz=Math.sin(y);
  let vx=ix*rx-iy*fx,vz=ix*rz-iy*fz;const m=Math.hypot(vx,vz);if(m>1){vx/=m;vz/=m}
  const w=sceneW(P.scene);let nx=P.x+vx*sp*dt,nz=P.z+vz*sp/UX/DZ*dt;
  const zmin=(P.scene==='patio'&&G.cut[Math.floor(nx/150)])?0:.02;nx=cl(nx,70,w-70);nz=cl(nz,zmin,1);
  let mx=nx/UX,mz=nz*DZ;if(!P.car)for(const s of R3.solids){const qx=cl(mx,s[0],s[2]),qz=cl(mz,s[1],s[3]),dx=mx-qx,dz=mz-qz,d=Math.hypot(dx,dz);if(d<.36){if(d>1e-4){mx+=dx/d*(.36-d);mz+=dz/d*(.36-d)}else mz+=.4}}
  P.x=cl(mx*UX,70,w-70);P.z=cl(mz/DZ,zmin,1)}
function aimHit(n,range){const dx=(n.x-P.x)/UX,dz=(n.z-P.z)*DZ,d=Math.hypot(dx,dz),r=range/UX*1.2;if(d>r)return false;if(d<.45)return true;const fx=Math.sin(R3.yaw),fz=-Math.cos(R3.yaw);return(dx*fx+dz*fz)/d>.5}
const PAD={look:[0,0],prev:[]};
function inputVec(){let x=0,y=0;
  if(keys.ArrowLeft||keys.a||keys.A)x-=1;if(keys.ArrowRight||keys.d||keys.D)x+=1;if(keys.ArrowUp||keys.w||keys.W)y-=1;if(keys.ArrowDown||keys.s||keys.S)y+=1;
  if(joy.on){x=joy.x;y=joy.y}
  if(PAD.mv&&(PAD.mv[0]||PAD.mv[1])){x=PAD.mv[0];y=PAD.mv[1]}
  const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}return[x,y]}
function pollPad(dt){const gs=navigator.getGamepads?navigator.getGamepads():[];const p=[...gs].find(q=>q&&q.connected&&q.mapping==='standard')||[...gs].find(q=>q&&q.connected);
  if(!p){PAD.mv=null;return}
  const dz=v=>Math.abs(v)<.16?0:v;PAD.mv=[dz(p.axes[0]||0),dz(p.axes[1]||0)];
  R3.yaw+=dz(p.axes[2]||0)*dt*2.8;R3.pitch=cl(R3.pitch-dz(p.axes[3]||0)*dt*1.9,-1.2,1.2);
  const b=i=>!!(p.buttons[i]&&p.buttons[i].pressed),edge=(i,fn)=>{if(b(i)&&!PAD.prev[i])fn();PAD.prev[i]=b(i)};
  if(!panelOpen&&!G.paused){edge(0,()=>pressAct());edge(2,()=>{punch();rumble(p)});edge(7,()=>{punch();rumble(p)});edge(1,()=>kick());edge(3,()=>useHand());edge(5,()=>{});edge(4,()=>grab());edge(6,()=>{});edge(9,()=>menuPanel());edge(10,()=>{});P.run=b(5)||b(10)||keys.Shift}
  else{edge(0,()=>{if(panelOpen){const bt=document.querySelector('#pBtn .pb:not(.dis)');bt&&bt.click()}});edge(1,()=>{if(panelOpen)closePanel()});edge(9,()=>{if(panelOpen)closePanel()})}}
function rumble(p){try{p.vibrationActuator&&p.vibrationActuator.playEffect('dual-rumble',{duration:90,strongMagnitude:.6,weakMagnitude:.3})}catch(e){}}
function initControls(){const cv3=document.getElementById('gl'),zone=document.getElementById('touch');
  document.addEventListener('mousemove',e=>{if(document.pointerLockElement===cv3||document.pointerLockElement===zone){R3.yaw+=e.movementX*.0024;R3.pitch=cl(R3.pitch-e.movementY*.0022,-1.2,1.2)}});
  let ld=null;
  zone.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'){e.stopImmediatePropagation();if(!G.started||panelOpen)return;if(document.pointerLockElement){if(e.button===0)punch()}else if(zone.requestPointerLock)zone.requestPointerLock();return}
    if(e.clientX>innerWidth*.5&&!ld){ld={id:e.pointerId,x:e.clientX,y:e.clientY};e.stopImmediatePropagation()}},true);
  zone.addEventListener('pointermove',e=>{if(!ld||e.pointerId!==ld.id)return;R3.yaw+=(e.clientX-ld.x)*.0052;R3.pitch=cl(R3.pitch-(e.clientY-ld.y)*.004,-1.2,1.2);ld.x=e.clientX;ld.y=e.clientY});
  const up=e=>{if(ld&&e.pointerId===ld.id)ld=null};zone.addEventListener('pointerup',up);zone.addEventListener('pointercancel',up);
  document.addEventListener('mousedown',e=>{if(document.pointerLockElement&&e.button===2)kick()});
}
function initR3(){const cv3=document.getElementById('gl');R3.gl=new GL(cv3);r3tex();initControls()}
