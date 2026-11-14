'use strict';
/* Cenas 3D (primeira pessoa) construídas a partir dos dados do jogo antigo: mesmas salas, portas e objectos. */
const UX=70,DZ=6,WH=3.4;
const R3={yaw:0,pitch:0,gl:null,tex:{},cache:{},mode:'stage',chars:new Map(),spr:{},txt:new Map(),bob:0,sceneId:null,items:[],lights:[],solids:[],stageT:0};
const hx=h=>{h=h||'#888888';if(h[0]!='#')h='#888888';if(h.length==4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];return[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255]};
const mixc=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const mulc=(a,k)=>a.map(v=>v*k);
function r3tex(){const g=R3.gl,T=R3.tex;
  for(const k of['tileWall','tileFloor','brick','concrete','metal','vend','graf','court'])T[k]=g.tex(ART[k],256);
  T.glow=g.tex(ART.glow,128,false);T.blob=g.tex(ART.blob,128,false);
  T.fence=g.tex((x,s)=>{x.clearRect(0,0,s,s);x.strokeStyle='rgba(58,64,72,.95)';x.lineWidth=3;for(let i=-s;i<s*2;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i+s,s);x.stroke();x.beginPath();x.moveTo(i+s,0);x.lineTo(i,s);x.stroke()}},128);
  T.asph=g.tex((x,s)=>{x.fillStyle='#34353b';x.fillRect(0,0,s,s);noise(x,s,.16,3200);grime(x,s)},256);
  T.side=g.tex((x,s)=>{x.fillStyle='#8a8c91';x.fillRect(0,0,s,s);noise(x,s,.1,1800);x.strokeStyle='rgba(0,0,0,.4)';x.lineWidth=2;x.strokeRect(0,0,s,s);x.beginPath();x.moveTo(s/2,0);x.lineTo(s/2,s);x.stroke()},256);
  T.wood=g.tex((x,s)=>{x.fillStyle='#8a6a48';x.fillRect(0,0,s,s);for(let i=0;i<s;i+=32){x.fillStyle=`rgba(0,0,0,${.1+arnd()*.12})`;x.fillRect(0,i,s,2)}noise(x,s,.1,900)},128);
  T.sky=g.tex((x,s)=>{const q=x.createLinearGradient(0,0,0,s);q.addColorStop(0,'#5b9bd5');q.addColorStop(.55,'#b9dcf2');q.addColorStop(1,'#eaf3f8');x.fillStyle=q;x.fillRect(0,0,s,s)},64,false);
  T.night=g.tex((x,s)=>{const q=x.createLinearGradient(0,0,0,s);q.addColorStop(0,'#050a18');q.addColorStop(.6,'#142140');q.addColorStop(1,'#26365e');x.fillStyle=q;x.fillRect(0,0,s,s);for(let i=0;i<70;i++){x.fillStyle=`rgba(255,255,255,${.4+arnd()*.6})`;x.fillRect(arnd()*s,arnd()*s*.6,1.4,1.4)}},256,false);
  T.white=g.white;
}
/* ---------- construtor de itens ---------- */
function IT(m,mat,o,cx,dec){R3.items.push({m,mat,o,cx:cx==null?0:cx,dec})}
function box(cx,y0,cz,w,h,d,col,o){const m=M.mul(M.T(cx,y0+h/2,cz),M.S(w,h,d));IT(R3.gl.cube,m,Object.assign({col,toon:1},o||{}),cx);
  if(!(o&&o.noOut))IT(R3.gl.cube,M.mul(M.T(cx,y0+h/2,cz),M.S(w+.05,h+.05,d+.05)),{col:[0,0,0],cf:1},cx)}
function cyl(cx,y0,cz,r,h,col,o){IT(R3.gl.cyl,M.mul(M.T(cx,y0+h,cz),M.S(r,h,r)),Object.assign({col,toon:1},o||{}),cx);if(!(o&&o.noOut))IT(R3.gl.cyl,M.mul(M.T(cx,y0+h+.015,cz),M.S(r+.025,h+.03,r+.025)),{col:[0,0,0],cf:1},cx)}
function ball(cx,cy,cz,r,col,o){IT(R3.gl.sph,M.mul(M.T(cx,cy,cz),M.S(r,r,r)),Object.assign({col,toon:1},o||{}),cx)}
function plane(cx,cy,cz,w,h,rx,ry,col,o){IT(R3.gl.quad,M.mul(M.T(cx,cy,cz),M.mul(M.RY(ry||0),M.mul(M.RX(rx==null?Math.PI/2:rx),M.S(w,1,h)))),Object.assign({col},o||{}),cx,o&&o.dec)}
function addLight(x,y,z,c,f){R3.lights.push({p:[x,y,z],c,f})}
function solid(cx,cz,w,d){R3.solids.push([cx-w/2,cz-d/2,cx+w/2,cz+d/2])}
function tbl(cx,cz,w,d,h,col){box(cx,h-.07,cz,w,.07,d,col||[.55,.4,.26]);for(const sx of[-1,1])for(const sz of[-1,1])box(cx+sx*(w/2-.07),0,cz+sz*(d/2-.07),.07,h-.07,.07,[.25,.2,.17],{noOut:1});solid(cx,cz,w,d)}
const SIZE={bunk:[2.1,1.1,1.75],toilet:[.5,.6,.45],sink:[.7,.4,.9],desk:[1.6,.8,.78],deskSec:[2.2,.9,.8],phone:[.5,.2,.5],bench:[2,.5,.5],counter:[5,.8,1],table:[2,1,.75],stove:[1.8,.85,.95],pantry:[1.6,.5,2.1],medbed:[1,2,.6],cabinet:[1,.5,1.8],workbench:[2.4,.8,.95],machine:[1.6,1,1.5],washer:[1,.85,1.05],foldtable:[2.4,1,.9],basket:[.8,.8,.55],shopcounter:[4.2,.9,1.1],bookcase:[2.4,.4,2.2],weights:[2,1.2,.55],bag:[.5,.5,2.2],pullup:[2.4,.3,2.5],hoop:[.3,.3,3.2],fence:[0,.1,3.4],cot:[1.9,.9,.45],gate:[3,.4,3]};
function buildProp(p){
  const sz=SIZE[p.t]||[1,1,1];let W=sz[0],Dp=sz[1],Hh=sz[2];
  if(p.t==='counter'||p.t==='shopcounter')W=Math.min(W,p.w/UX);
  const cx=p.x/UX;let cz=p.z<.3?Dp/2+.12:p.z*DZ;
  switch(p.t){
  case'bunk':{box(cx,0,cz,W,.12,Dp,[.3,.3,.34]);box(cx,.14,cz,W-.1,.2,Dp-.1,[.3,.42,.62]);box(cx,.9,cz,W,.1,Dp,[.3,.3,.34]);box(cx,1.0,cz,W-.1,.2,Dp-.1,[.55,.55,.5]);for(const sx of[-1,1])for(const sz2 of[-1,1])box(cx+sx*(W/2-.05),0,cz+sz2*(Dp/2-.05),.07,1.75,.07,[.2,.2,.24],{noOut:1});solid(cx,cz,W,Dp);break}
  case'toilet':box(cx,0,cz,.45,.38,.5,[.92,.93,.94]);box(cx,.38,cz-.18,.4,.45,.14,[.88,.9,.9]);solid(cx,cz,.5,.55);break;
  case'sink':box(cx,.8,cz,.6,.12,.4,[.9,.92,.93]);box(cx,0,cz,.14,.8,.14,[.8,.82,.84]);cyl(cx,.92,cz-.1,.02,.18,[.7,.72,.75]);break;
  case'desk':case'deskSec':tbl(cx,cz,W,Dp,Hh);if(p.t==='deskSec'){box(cx,Hh,cz,.5,.04,.35,[.2,.3,.45]);box(cx-.5,Hh,cz,.3,.12,.2,[.9,.9,.85])}break;
  case'phone':for(let i=0;i<1;i++){box(cx,1.1,.14,.35,.45,.18,[.75,.1,.1]);box(cx,1.2,.25,.18,.05,.08,[.1,.1,.1]);box(cx,0,.2,.06,1.1,.06,[.4,.4,.45],{noOut:1})}break;
  case'bench':box(cx,.42,cz,W,.08,Dp,[.5,.36,.22]);for(const sx of[-1,1])box(cx+sx*(W/2-.1),0,cz,.08,.42,Dp-.08,[.3,.3,.33],{noOut:1});solid(cx,cz,W,Dp);break;
  case'counter':case'shopcounter':box(cx,0,cz,W,Hh*0+.95,Dp,p.t==='counter'?[.62,.62,.6]:[.45,.3,.55]);box(cx,.95,cz,W+.1,.06,Dp+.1,[.8,.8,.78]);solid(cx,cz,W,Dp);
    if(p.t==='shopcounter'){box(cx,0,.2,W,2.4,.35,[.4,.3,.25]);for(let i=0;i<6;i++){box(cx-W/2+.4+i*.7,1.0,.4,.3,.35,.25,[(i%3)*.3+.3,.4,.3+(i%2)*.4])}}
    if(p.food){for(let i=0;i<5;i++)box(cx-W/2+.6+i*.9,1.01,cz,.5,.04,.35,[.8,.55,.2])}break;
  case'table':tbl(cx,cz,W,Dp,Hh,[.62,.5,.36]);break;
  case'stove':box(cx,0,cz,W,.9,Dp,[.7,.72,.74]);for(let i=0;i<4;i++)cyl(cx-.6+(i%2)*1.2,.91,cz-.15+Math.floor(i/2)*.3,.15,.02,[.1,.1,.1],{noOut:1});box(cx,1.0,cz+.3,.6,.4,.3,[.2,.2,.22]);solid(cx,cz,W,Dp);break;
  case'pantry':box(cx,0,cz,W,Hh,Dp,[.5,.38,.26]);for(let i=0;i<4;i++)box(cx,.4+i*.5,cz+.02,W-.1,.04,Dp-.02,[.35,.25,.18],{noOut:1});for(let i=0;i<10;i++)box(cx-.6+(i%5)*.3,.45+Math.floor(i/5)*.5,cz+.12,.2,.26,.2,[.8,.7-(i%3)*.15,.3],{noOut:1});solid(cx,cz,W,Dp);break;
  case'medbed':box(cx,.3,cz,W,.12,Dp,[.9,.9,.95]);box(cx,0,cz,W-.1,.3,Dp-.1,[.55,.6,.65],{noOut:1});box(cx,.42,cz-Dp/2+.3,.8,.12,.4,[1,1,1]);solid(cx,cz,W,Dp);break;
  case'cabinet':box(cx,0,cz,W,Hh,Dp,[.78,.85,.85]);box(cx,1.0,cz+Dp/2,.04,.3,.02,[.9,.1,.1],{noOut:1});solid(cx,cz,W,Dp);break;
  case'workbench':box(cx,0,cz,W,.95,Dp,[.5,.4,.3]);box(cx,.95,cz,W+.1,.06,Dp+.1,[.7,.55,.35]);for(let i=0;i<4;i++)box(cx-.8+i*.55,1.02,cz,.3,.06+.04*(i%2),.14,[.55,.55,.6],{noOut:1});solid(cx,cz,W,Dp);break;
  case'machine':box(cx,0,cz,W,Hh*.6,Dp,[.3,.45,.5]);box(cx,Hh*.6,cz,W*.5,Hh*.4,Dp*.8,[.9,.6,.1]);cyl(cx+.4,Hh*.6,cz+.1,.14,.2,[.7,.1,.1]);solid(cx,cz,W,Dp);break;
  case'washer':box(cx,0,cz,W,Hh,Dp,[.85,.88,.9]);cyl(cx,.35,cz+Dp/2+.01,.3,.04,[.25,.35,.5],{noOut:1,rx:1});solid(cx,cz,W,Dp);break;
  case'foldtable':tbl(cx,cz,W,Dp,Hh,[.85,.85,.88]);for(let i=0;i<3;i++)box(cx-.6+i*.6,Hh,cz,.4,.07+i*.02,.5,[.3+.2*i,.5,.7-.2*i],{noOut:1});break;
  case'basket':box(cx,0,cz,W,Hh,Dp,[.7,.55,.3]);box(cx,Hh,cz,W-.1,.1,Dp-.1,[.3,.4,.7],{noOut:1});solid(cx,cz,W,Dp);break;
  case'bookcase':box(cx,0,cz,W,Hh,Dp,[.42,.3,.2]);for(let r=0;r<5;r++)for(let i=0;i<14;i++){const c=[[.7,.2,.2],[.2,.4,.7],[.8,.7,.2],[.3,.6,.4],[.6,.3,.6]][(i+r*3)%5];box(cx-W/2+.12+i*(W-.2)/14,.2+r*.42,cz+.1,.12,.32,.22,c,{noOut:1})}solid(cx,cz,W,Dp);break;
  case'weights':box(cx,.35,cz,.5,.08,1.2,[.2,.2,.22]);box(cx-.7,.7,cz,.08,.08,.08,[.5,.5,.5]);box(cx+.2,.8,cz,1.6,.05,.05,[.7,.7,.72],{noOut:1});for(const sx of[-1,1]){cyl(cx+.2+sx*.75,.62,cz,.22,.04,[.08,.08,.1]);}box(cx,0,cz,.15,.35,.15,[.2,.2,.22],{noOut:1});solid(cx,cz,W,Dp);break;
  case'bag':cyl(cx,.5,cz,.24,1.5,[.7,.12,.1]);box(cx,2.2,cz,.04,.8,.04,[.6,.6,.6],{noOut:1});break;
  case'pullup':for(const sx of[-1,1])box(cx+sx*1.1,0,cz,.1,2.5,.1,[.5,.5,.55]);box(cx,2.45,cz,2.3,.07,.07,[.75,.75,.78]);break;
  case'hoop':box(cx,0,cz,.1,3.0,.1,[.4,.4,.45]);box(cx,2.8,cz+.4,1.2,.8,.05,[.95,.95,.95]);box(cx,2.7,cz+.5,.46,.03,.46,[.9,.4,.1],{noOut:1});break;
  case'cot':box(cx,.3,cz,W,.14,Dp,[.4,.4,.44]);box(cx,.44,cz,W-.1,.1,Dp-.1,[.55,.55,.5]);solid(cx,cz,W,Dp);break;
  case'gate':{const gx=cx;for(let i=-4;i<=4;i++)box(gx+i*.34,0,.35,.07,3,.07,[.2,.2,.24]);box(gx,2.9,.35,3,.1,.1,[.2,.2,.24]);box(gx,1.5,.35,3,.07,.07,[.2,.2,.24],{noOut:1});break}
  }
}
function buildFence(sc,p){const cut=G.cut||{};const x0=(p.x-p.w/2)/UX,x1=(p.x+p.w/2)/UX;
  for(let sx=Math.floor((p.x-p.w/2)/150);sx*150<p.x+p.w/2;sx++){const a=Math.max(x0,sx*150/UX),b=Math.min(x1,(sx+1)*150/UX);if(b<=a)continue;
    const seg=sx;const key='f'+seg;R3.fenceSegs.push({seg,a,b});
    plane((a+b)/2,1.7,.35,b-a,3.4,Math.PI/2,0,[.8,.82,.85],{tex:R3.tex.fence,uv:[(b-a)/1.6,2],a:1,dec:1,seg})}
  for(let i=Math.ceil(x0/3);i*3<=x1;i++)box(i*3,0,.35,.1,3.5,.1,[.35,.36,.4],{noOut:1,cx:i*3});}
/* ---------- salas ---------- */
function buildScene(id){
  const sc=SC[id];R3.items=[];R3.lights=[];R3.solids=[];R3.fenceSegs=[];R3.sceneId=id;R3.dyn=[];
  const g=R3.gl,T=R3.tex,w=sc.w/UX,out=!!sc.out,th=sc.th||{};
  const w0=hx(th.w0),w1=hx(th.w1),f0=hx(th.f0),f1=hx(th.f1);
  const fz0=out?-30:0,fz1=out?DZ+8:DZ+.4;
  if(id==='rua'){buildStreet(sc);return}
  /* chão */
  plane(w/2,0,(fz0+fz1)/2,w+8,fz1-fz0,0,0,out?mulc(f0,1.1):mulc(mixc(f0,[1,1,1],.6),1.5),{tex:out?T.concrete:T.tileFloor,uv:[(w+8)/2.4,(fz1-fz0)/2.4]});
  if(!out){
    plane(w/2,WH,DZ/2,w+.4,DZ+.4,Math.PI,0,mixc(w0,[1,1,1],.4),{tex:T.concrete,uv:[w/3,2]});
    /* paredes: parte de cima clara, rodapé escuro */
    for(const [zz,ry] of [[0,0],[DZ+.4,Math.PI]]){
      plane(w/2,WH*.62,zz,w,WH*.76,Math.PI/2,ry,mulc(mixc(w0,[1,1,1],.7),1.7),{tex:T.concrete,uv:[w/3,1]});
      plane(w/2,.55,zz+(ry?-.01:.01),w,1.1,Math.PI/2,ry,w1.map(v=>(.25+v*.6)*1.6),{tex:T.concrete,uv:[w/3,.5]});
      box(w/2,1.1,zz+(ry?-.03:.03),w,.07,.06,[.15,.15,.18],{noOut:1})}
    for(const [xx,ry] of [[0,Math.PI/2],[w,-Math.PI/2]])plane(xx,WH/2,DZ/2+.2,DZ+.4,WH,Math.PI/2,ry,mixc(w0,[.9,.9,.9],.3),{tex:T.concrete,uv:[2,1]});
  }else{
    for(const [xx,ry] of [[0,Math.PI/2],[w,-Math.PI/2]])plane(xx,5,DZ/2-8,DZ+40,10,Math.PI/2,ry,[.55,.5,.46],{tex:T.brick,uv:[14,2]});
    cityBackdrop(w);
    /* muro baixo à frente */
    box(w/2,0,DZ+.5,w,1.1,.3,[.45,.4,.36],{noOut:1});
  }
  /* decoração */
  for(const d of sc.decor||[]){const dx=d.x/UX;
    if(d.t==='lamp'){const y=out?3.6:WH-.1;box(dx,y-.04,DZ/2,.2,.08,2.2,[.25,.25,.28],{noOut:1});IT(g.cube,M.mul(M.T(dx,y-.09,DZ/2),M.S(.14,.05,2)),{col:[1,.97,.85],em:1.2},dx);addLight(dx,y-.4,DZ/2,[1.4,1.25,1.0],()=>1-.45*darkness())}
    if(d.t==='window'){const ww=Math.min(d.w/UX,3),dc=darkness();plane(dx,2.1,.03,ww,1.5,Math.PI/2,0,dc>.4?[.06,.09,.2]:[.65,.85,1],{em:dc>.4?0:.8});box(dx,1.35,.06,ww+.1,.07,.1,[.12,.12,.14],{noOut:1});box(dx,2.85,.06,ww+.1,.07,.1,[.12,.12,.14],{noOut:1});for(let i=0;i<=4;i++)box(dx-ww/2+i*ww/4,1.35,.07,.05,1.55,.05,[.1,.1,.12],{noOut:1})}
    if(d.t==='poster')plane(dx,1.9,.03,.9,1.2,Math.PI/2,0,hx(d.c||'#c9b27a'));
    if(d.t==='notice')plane(dx,1.9,.03,.7,.9,Math.PI/2,0,[.95,.93,.85]);
    if(d.t==='stripe')plane(w/2,.012,DZ/2+.9,w,.22,Math.PI/2*0+Math.PI/2*0,0,[.95,.8,.15],{dec:0});
    if(d.t==='speaker')box(dx,2.7,.12,.4,.3,.22,[.12,.12,.14]);
    if(d.t==='vent')box(dx,2.7,.04,.9,.5,.05,[.3,.3,.33],{noOut:1});
    if(d.t==='cross'){plane(dx,2.1,.03,.9,.9,Math.PI/2,0,[.95,.95,.95]);box(dx,2.1,.05,.5,.18,.03,[.85,.1,.1],{noOut:1});box(dx,2.1,.05,.18,.5,.03,[.85,.1,.1],{noOut:1})}
    if(d.t==='pegboard'){plane(dx,1.8,.03,1.8,1.1,Math.PI/2,0,[.55,.45,.3]);for(let i=0;i<6;i++)box(dx-.7+i*.28,1.75,.06,.05,.4,.03,[.7,.7,.75],{noOut:1})}
    if(d.t==='shelves'){for(let r=0;r<3;r++){box(dx,1.0+r*.6,.18,Math.min(d.w/UX,5),.05,.3,[.4,.3,.22],{noOut:1});for(let i=0;i<10;i++)box(dx-2+i*.4,1.08+r*.6,.18,.22,.3,.2,[(i%3)*.35+.25,.5-(i%2)*.2,.3+(i%4)*.15],{noOut:1})}}
  }
  /* portas */
  for(const d of sc.doors||[]){const dx=d.x/UX,k=d.k;const col=!d.to?[.35,.2,.15]:(k==='cela'||k==='sol')?[.35,.4,.48]:k==='patio'?[.3,.45,.3]:[.6,.4,.2];
    if(out&&id==='patio')box(dx,0,.2,6,WH+.6,.4,[.5,.45,.4],{tex:T.brick,uv:[3,1.5]});
    box(dx,0,.1,1.5,2.5,.15,[.12,.12,.15],{noOut:1});box(dx,0,.16,1.2,2.35,.08,col);
    if(k!=='dead')box(dx,1.6,.21,.3,.3,.02,[.1,.15,.2],{noOut:1});
    cyl(dx+.4,.95,.24,.04,.03,[.85,.8,.4],{noOut:1});
    R3.dyn.push({t:'doorsign',x:dx,d});
  }
  /* adereços */
  for(const p of sc.props||[]){if(p.t==='fence')buildFence(sc,p);else buildProp(p)}
  /* mobília e câmaras da v3 */
  for(const f of(typeof FURN!=='undefined'?FURN:[]))if(f.scene===id){const fx=f.x/UX;
    if(f.k==='fridge'){box(fx,0,.45,.85,1.8,.7,[.9,.92,.93]);box(fx+.3,1.0,.82,.04,.5,.04,[.4,.4,.45],{noOut:1});solid(fx,.45,.9,.75)}
    if(f.k==='wardrobe'){box(fx,0,.4,1.3,2.0,.6,[.5,.36,.24]);box(fx,0,.71,.02,1.9,.02,[.1,.08,.06],{noOut:1});solid(fx,.4,1.3,.65)}
    if(f.k==='sanita'){box(fx,0,.45,.5,.4,.55,[.93,.94,.95]);solid(fx,.45,.55,.6)}}
  for(const m of(typeof CAMS!=='undefined'?CAMS:[]))if(m.scene===id){const mx=m.x/UX;if(out)box(mx,0,.5,.1,3.6,.1,[.3,.3,.33],{noOut:1});box(mx,2.9,.3,.3,.22,.5,[.18,.18,.2]);R3.dyn.push({t:'cam',x:mx})}
  if(out)for(let i=0;i<Math.floor(w/9);i++){const lx=6+i*9;box(lx,0,DZ+.2,.12,4.5,.12,[.3,.3,.33],{noOut:1});box(lx,4.4,DZ-.1,.12,.12,.8,[.3,.3,.33],{noOut:1});addLight(lx,4.3,DZ-.5,[1.6,1.55,1.3],()=>darkness()>.3?1:.15)}
  if(out&&id==='patio'){/* campo de basquete pintado */ plane(1950/UX-.8,.01,3.2,10,6,0,0,[.9,.9,.9],{tex:T.court,uv:[1,1],a:.6,dec:1})}
}
function cityBackdrop(w){for(let i=0;i<Math.ceil(w/6)+4;i++){const h=hashn(i,3);const bh=8+h*22,bx=i*6-6,bz=-20-hashn(i,7)*30;const dark=darkness();
  box(bx,0,bz,6,bh,6,mulc([.28,.34,.46],dark>.4?.35:1),{noOut:1});
  if(dark>.3)for(let r=0;r<Math.floor(bh/3);r++)for(let k=0;k<3;k++)if(hashn(i*13+r,k)>.5)IT(R3.gl.quad,M.mul(M.T(bx-2+k*2,2+r*3,bz+3.02),M.mul(M.RX(Math.PI/2),M.S(1,1,1.3))),{col:[1,.85,.5],em:1.1},bx)}}
const hashn=(a,b)=>{let h=(a*374761393+b*668265263)^0x5bd1e995;h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967295};
function buildStreet(sc){const w=sc.w/UX,T=R3.tex,dark=darkness();
  plane(w/2,0,3,w+60,40,0,0,[.9,.9,.95],{tex:T.asph,uv:[(w+60)/4,10]});
  plane(w/2,.1,-.4,w+60,2.2,0,0,[.9,.9,.95],{tex:T.side,uv:[(w+60)/2,1]});
  for(let x=0;x<w;x+=6)plane(x+1.5,.012,4.4,2.4,.18,0,0,[.95,.95,.9]);
  const names=SHOPN;
  for(let b=0;b*8<w+16;b++){const x=b*8,bh=7+hashn(b,3)*14,base=[[.55,.43,.35],[.43,.5,.56],[.6,.54,.42],[.48,.37,.4],[.37,.48,.42]][Math.floor(hashn(b,5)*5)];
    box(x+4,0,-6,7.4,bh,10,mulc(base,dark>.4?.35:1),{noOut:1});
    for(let r=0;r<Math.floor((bh-3.5)/2.6);r++)for(let k=0;k<3;k++){const lit=hashn(b*7+r,k)>.5;IT(R3.gl.quad,M.mul(M.T(x+1.6+k*2.2,4.6+r*2.6,-.98),M.mul(M.RX(Math.PI/2),M.S(1.1,1,1.5))),{col:dark>.4?(lit?[1,.85,.5]:[.05,.06,.1]):[.5,.7,.85],em:dark>.4&&lit?1:0},x)}
    const col=[[.75,.22,.17],[.18,.5,.76],[.15,.68,.36],[.83,.63,.1],[.56,.27,.68]][Math.floor(hashn(b,9)*5)];
    box(x+4,0,-.5,6.4,3.2,1.4,[.2,.22,.27],{noOut:1});IT(R3.gl.quad,M.mul(M.T(x+3.4,1.6,.22),M.mul(M.RX(Math.PI/2),M.S(3.8,1,2.2))),{col:dark>.4?[1,.9,.65]:[.75,.85,.9],em:dark>.4?.9:.2},x);
    box(x+4,2.9,.25,6.4,.1,.8,col,{noOut:1});R3.dyn.push({t:'shop',x:x+4,text:names[Math.floor(hashn(b,11)*names.length)],col})}
  for(let x=12;x<w;x+=18){box(x,0,4.8,.14,5.5,.14,[.2,.2,.23],{noOut:1});box(x-.5,5.4,4.8,1.0,.12,.12,[.2,.2,.23],{noOut:1});addLight(x-.9,5.2,4.8,[1.6,1.5,1.1],()=>dark>.3?1:.1)}
  for(let i=0;i<8;i++)box(w/2+i*8-26,0,-1.6,.5,.5+hashn(i,2),.5,[.3,.4,.3],{noOut:1});
}
