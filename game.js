/* Mundo 3D, jogador, NPCs, câmara e controlos (teclado, rato, toque, comando PS4/PS5) */
const G={mode:'menu',look:defaultLook(),P:null,npcs:[],cam:{yaw:0,pitch:.28,dist:5.2},keys:{},joy:{x:0,y:0},tdx:0,tdy:0,run:false,banner:'',bt:0,time:0};
let gl,tex={},walls=[],items=[],colls=[],labels=new Map(),pad=null;
const H=4;
function init(canvas){gl=new GL(canvas);
for(const k of['tileWall','tileFloor','brick','concrete','metal','vend','graf','court'])tex[k]=gl.tex(ART[k],256);tex.glow=gl.tex(ART.glow,128,false);tex.blob=gl.tex(ART.blob,128,false);
gl.env={ambS:[.30,.33,.40],ambG:[.12,.10,.09],sun:[.35,-.85,.4],sunC:[.22,.22,.26],fog:[.06,.06,.08],fogD:.018};
build();G.P=new Char(G.look,'Tu');G.P.x=-12;G.P.z=2.4;G.P.yaw=Math.PI/2;spawnNPCs()}
function box(x0,y0,z0,x1,y1,z1,o,solid=true){items.push({m:gl.cube,mat:M.mul(M.T((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),M.S(x1-x0,y1-y0,z1-z0)),o,box:[x0,y0,z0,x1,y1,z1]});if(solid&&y1-y0>.4)colls.push([x0,z0,x1,z1])}
function wall(x0,z0,x1,z1,h,t,o){box(x0,0,z0,x1,h,z1,Object.assign({spec:.04},o))}
const tw=(w,h)=>({tex:tex.tileWall,uv:[w/2.2,h/2.2]}),br=(w,h)=>({tex:tex.brick,uv:[w/3,h/3]});
function build(){
/* SALÃO (x -16..16, z -4..4) */
box(-16,-.3,-4,16,0,4,{tex:tex.tileFloor,uv:[16,4],spec:.55},false);
box(-16,H,-4,16,H+.3,4,{col:[.28,.27,.27]},false);
wall(-16.3,-4.3,16,-4,H,0,Object.assign(tw(32,H),{}));wall(-16.3,4,16,4.3,H,0,tw(32,H));wall(-16.3,-4,-16,4,H,0,tw(8,H));
wall(16,-4.3,16.3,-1.6,H,0,tw(3,H));wall(16,1.6,16.3,4.3,H,0,tw(3,H));box(16,3,-1.6,16.3,H,1.6,tw(3,1),false);
/* CELAS na parede norte: grades e divisórias, com portas abertas */
for(let i=0;i<5;i++){const x=-15+i*3.2;wall(x,-4,x+.12,-1.2,H,0,tw(3,H));
for(let k=0;k<7;k++)if(!(k>=2&&k<=4))box(x+.12+k*.43,0,-1.2,x+.2+k*.43,3.2,-1.15,{tex:tex.metal,spec:.7},k%3==0);
box(x+.12,3.15,-1.2,x+3.2,3.3,-1.1,{tex:tex.metal},false);
box(x+.4,0,-3.8,x+1.7,.5,-2.4,{col:[.45,.4,.34]});box(x+.4,.5,-3.8,x+1.7,.62,-2.4,{col:[.7,.68,.6]},false);
box(x+2.2,0,-3.9,x+2.8,.5,-3.3,{tex:tex.metal,spec:.9});
}wall(-15+5*3.2,-4,-15+5*3.2+.12,-1.2,H,0,tw(3,H));
/* mobiliário do salão: máquina de bebidas + bancos + caixas (referência da vossa imagem) */
box(11.6,0,-3.9,12.9,2.1,-3.0,{tex:tex.vend,spec:.5});
for(let i=0;i<3;i++){box(8.2+i*.95,.45,-3.8,9+i*.95,.55,-3.2,{col:[.3,.28,.5],spec:.3},false);box(8.4+i*.95,0,-3.65,8.5+i*.95,.45,-3.55,{tex:tex.metal},false)}
box(6.2,0,-3.8,6.9,.55,-3.1,{col:[.6,.48,.3]});box(5.3,0,-3.7,5.95,.4,-3.15,{col:[.55,.43,.26]});
for(let i=0;i<3;i++)box(-13+i*9,0,3.1,-11.4+i*9,.5,3.9,{tex:tex.metal,spec:.5});
/* grafitis nas paredes */
items.push({m:gl.quad,mat:M.mul(M.T(1,2.2,-3.97),M.mul(M.RX(Math.PI/2),M.S(5,1,2.6))),o:{tex:tex.graf,em:.2,a:1,blend:1},dec:1});
items.push({m:gl.quad,mat:M.mul(M.T(-8,2.1,3.97),M.mul(M.RX(-Math.PI/2),M.S(4,1,2.2))),o:{tex:tex.graf,em:.2,blend:1},dec:1});
/* luzes do salão */
gl.lights=[];for(const x of[-13,-6,1,8])gl.lights.push({p:[x,3.7,0],c:[.9,.95,1.0],f:()=>x==1?.82+.18*Math.sin(G.time*31+Math.sin(G.time*7)*5):1,tube:1});
gl.lights.push({p:[12.2,3.2,-3.2],c:[1.4,.35,1.0],neon:1});
/* PÁTIO (x 16..48, z -14..14) */
box(16,-.3,-14,48,0,14,{tex:tex.concrete,uv:[10,9],spec:.15},false);
items.push({m:gl.quad,mat:M.mul(M.T(32,.02,0),M.S(14,1,24)),o:{tex:tex.court,spec:.1},dec:1});
wall(16,-14.4,48.4,-14,6.5,0,br(32,6));wall(16,14,48.4,14.4,6.5,0,br(32,6));wall(48,-14,48.4,14,6.5,0,br(28,6));
wall(15.7,-14.4,16,-1.6,6.5,0,br(13,6));wall(15.7,1.6,16,14.4,6.5,0,br(13,6));
items.push({m:gl.quad,mat:M.mul(M.T(47.9,3,0),M.mul(M.RZ(Math.PI/2),M.mul(M.RX(Math.PI/2),M.S(5,1,9)))),o:{tex:tex.graf,em:.15,blend:1},dec:1});
box(47.4,0,-12,47.9,.05,12,{col:[0,0,0]},false);
/* cesto de basquete */
box(41.9,0,-.1,42.1,3.4,.1,{tex:tex.metal});box(41.2,2.7,-.6,41.35,3.7,.6,{col:[.9,.9,.9],spec:.4},false);box(40.5,3.05,-.04,41.2,3.1,.04,{col:[.9,.3,.1]},false);
/* barris, bancos, caixas */
for(const [x,z] of[[19,-12],[20.3,-12.2],[19.6,-10.8]])items.push({m:gl.cyl,mat:M.mul(M.T(x,.95,z),M.S(.42,.95,.42)),o:{tex:tex.metal,spec:.5}}),colls.push([x-.4,z-.4,x+.4,z+.4]);
box(21,0,10.8,24,.5,11.6,{col:[.8,.3,.08],spec:.2});box(21,0,11.6,24,.1,12,{col:[.3,.1,.05]},false);
for(let i=0;i<4;i++)box(30+i*3,0,-13.4,32+i*3,1.0,-12.6,{col:[.5,.42,.3]},i%2==0);
gl.lights.push({p:[22,5.5,-8],c:[1,.85,.6]},{p:[40,6,8],c:[1,.85,.6]},{p:[32,6,0],c:[.8,.85,1]});
}
function spawnNPCs(){const names=['Mateus','Kiala','Domingos','Beto','Zeca','Nando','Bento','Tchizé'];
const sets=[0,0,0,0,0,2,1,1];G.npcs=[];names.forEach((n,i)=>{const l=defaultLook();l.skin=i%6;l.hair=i%5;l.hairc=i%4;l.set=sets[i];l.build=.92+Math.random()*.25;l.height=.94+Math.random()*.14;
if(i==3)l.acc=['oculos'];const c=new Char(l,n);c.guard=sets[i]==1;c.npc=1;const area=i%3==0?[17,-12,47,12]:[-14,-2.8,15,3];c.area=area;c.x=area[0]+Math.random()*(area[2]-area[0]);c.z=area[1]+Math.random()*(area[3]-area[1]);c.tx=c.x;c.tz=c.z;c.wait=Math.random()*3;c.yaw=Math.random()*6;G.npcs.push(c)})}
function collide(c,r=.32){for(let k=0;k<2;k++)for(const b of colls){const cx=Math.max(b[0],Math.min(c.x,b[2])),cz=Math.max(b[1],Math.min(c.z,b[3])),dx=c.x-cx,dz=c.z-cz,d=Math.hypot(dx,dz);
if(d<r){if(d>1e-4){c.x+=dx/d*(r-d);c.z+=dz/d*(r-d)}else c.x+=r}}}
function say(t){G.banner=t;G.bt=4}
function update(dt){G.time+=dt;const P=G.P;
if(G.mode=='game'){readPad();let ix=(G.keys.d||G.keys.ArrowRight?1:0)-(G.keys.a||G.keys.ArrowLeft?1:0)+G.joy.x,iz=(G.keys.s||G.keys.ArrowDown?1:0)-(G.keys.w||G.keys.ArrowUp?1:0)+G.joy.y;
const m=Math.hypot(ix,iz);if(m>1){ix/=m;iz/=m}
const run=G.keys.Shift||G.run||G.padRun,spd=(run?4.4:1.9)*Math.min(1,m);
if(m>.08&&!P.dead&&P.stun<=0){const cy=G.cam.yaw,dx=ix*Math.cos(cy)+iz*Math.sin(cy),dz=-ix*Math.sin(cy)+iz*Math.cos(cy);
const want=Math.atan2(dx,dz);let d=want-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));P.yaw+=d*Math.min(1,dt*12);P.x+=Math.sin(P.yaw)*spd*dt;P.z+=Math.cos(P.yaw)*spd*dt;collide(P);P.pose(dt,spd)}else P.pose(dt,0);
if(P.stun>0)P.stun-=dt;
G.cam.yaw-=G.tdx*.006+G.padCX*dt*2.4;G.cam.pitch=Math.max(.05,Math.min(1.1,G.cam.pitch+G.tdy*.004+G.padCY*dt*1.6));G.tdx=G.tdy=0}
else{G.cam.yaw+=dt*.25;P.pose(dt,0)}
for(const n of G.npcs)npc(n,dt);
if(G.bt>0)G.bt-=dt}
function npc(n,dt){if(n.dead){n.pose(dt,0);return}
if(n.stun>0){n.stun-=dt;n.pose(dt,0);return}
const d=Math.hypot(n.tx-n.x,n.tz-n.z);
if(d<.4||n.wait>0){n.wait-=dt;if(n.wait<=0&&d<.4){n.tx=n.area[0]+Math.random()*(n.area[2]-n.area[0]);n.tz=n.area[1]+Math.random()*(n.area[3]-n.area[1]);n.wait=1+Math.random()*4}n.pose(dt,0);return}
const w=Math.atan2(n.tx-n.x,n.tz-n.z);let df=w-n.yaw;df=Math.atan2(Math.sin(df),Math.cos(df));n.yaw+=df*Math.min(1,dt*5);const s=n.guard?1.5:1.25;n.x+=Math.sin(n.yaw)*s*dt;n.z+=Math.cos(n.yaw)*s*dt;collide(n);n.pose(dt,s)}
function punch(){const P=G.P;if(G.mode!='game'||P.punch>0||P.dead)return;P.punch=1;
setTimeout(()=>{for(const n of G.npcs){if(n.dead)continue;const dx=n.x-P.x,dz=n.z-P.z,d=Math.hypot(dx,dz);if(d<1.2&&(Math.sin(P.yaw)*dx+Math.cos(P.yaw)*dz)/d>.3){n.hp-=18;n.stun=.7;n.x+=dx/d*.35;n.z+=dz/d*.35;if(n.hp<=0){n.dead=1;say(n.name+' foi encontrado morto no pátio.')}}}},180)}
/* comando PS4/PS5 (mapeamento padrão): stick esq. move, stick dir. câmara, R1/L3 corre, Quadrado/R2 soco */
function readPad(){G.padCX=G.padCY=0;G.padRun=false;const gs=navigator.getGamepads?navigator.getGamepads():[];const p=[...gs].find(x=>x&&x.connected);if(!p){return}
const dz=v=>Math.abs(v)<.14?0:v;G.joy.x=dz(p.axes[0]||0);G.joy.y=dz(p.axes[1]||0);G.padCX=dz(p.axes[2]||0);G.padCY=dz(p.axes[3]||0);
G.padRun=!!(p.buttons[5]&&p.buttons[5].pressed||p.buttons[10]&&p.buttons[10].pressed);
const b=i=>p.buttons[i]&&p.buttons[i].pressed;const a=b(2)||b(7);if(a&&!pad)punch();pad=a;
if(b(9)&&!G._opt){G._opt=1;window.togglePause&&togglePause()}if(!b(9))G._opt=0}
function render(){const P=G.P,c=G.cam;let ex,ey,ez,tx,ty,tz;
if(G.mode=='game'){const d=c.dist;tx=P.x;ty=1.35;tz=P.z;ex=tx-Math.sin(c.yaw)*Math.cos(c.pitch)*d;ez=tz-Math.cos(c.yaw)*Math.cos(c.pitch)*d;ey=ty+Math.sin(c.pitch)*d;if(ey<.3)ey=.3}
else{const a=c.yaw;tx=P.x;ty=1.1;tz=P.z;const wide=innerWidth>700,k=G.mode=='custom'?(wide?.9:0):(wide?-.9:0);tx+=Math.cos(a)*k;tz-=Math.sin(a)*k;const dd=wide?3.4:5.2;if(!wide)ty=.3;ex=tx+Math.sin(a)*dd;ez=tz+Math.cos(a)*dd;ey=wide?1.5:1.3}
gl.focus=[P.x,1.5,P.z];gl.begin([ex,ey,ez],[tx,ty,tz],G.mode=='menu'?.7:.95);
for(const it of items)if(!it.dec)gl.draw(it.m,it.mat,it.o);
gl.alpha(true);for(const it of items)if(it.dec)gl.draw(it.m,it.mat,it.o);gl.alpha(false);
/* personagens */
const all=[P,...G.npcs];for(const ch of all)ch.draw(gl);
gl.shadowBegin();for(const ch of all)ch.drawShadow(gl);gl.shadowEnd();
/* luz de néon/tubos (brilho aditivo), contacto no chão e nomes */
gl.additive(true);const bb=(p,s,c,a)=>{const v=gl.view,rx=[v[0],v[4],v[8]],ry=[v[1],v[5],v[9]];const m=new Float32Array([rx[0]*s,rx[1]*s,rx[2]*s,0,0,0,0,0,0,0,0,0,p[0],p[1],p[2],1]);
/* quad no plano XZ -> orientar para a câmara */
const f=Math.atan2(ex-p[0],ez-p[2]);gl.draw(gl.quad,M.mul(M.T(p[0],p[1],p[2]),M.mul(M.RY(f),M.mul(M.RX(Math.PI/2),M.S(s,1,s)))),{tex:tex.glow,col:c,em:1.2,a})};
for(const l of gl.lights)if(l.tube||l.neon)bb(l.p,l.neon?2.0:1.0,l.neon?[1,.2,.8]:[.8,.9,1],(l.f?l.f():1)*.35*Math.min(1,Math.max(0,(Math.hypot(ex-l.p[0],ey-l.p[1],ez-l.p[2])-1.5)/3)));
gl.additive(false);
gl.alpha(true);for(const ch of all){if(ch.dead)continue;const y=ch.look.height*1.9+.28,f=Math.atan2(ex-ch.x,ez-ch.z);
if(!ch.npc||Math.hypot(ch.x-P.x,ch.z-P.z)<9){let t=labels.get(ch.name);if(!t){t=label(gl,ch.name,ch.guard?'#8fb4ff':'#ffe9b0');labels.set(ch.name,t)}
{const v=gl.view,w=1.1,h=.28,fw=[v[2],v[6],v[10]];gl.draw(gl.quad,new Float32Array([v[0]*w,v[4]*w,v[8]*w,0,fw[0],fw[1],fw[2],0,v[1]*h,v[5]*h,v[9]*h,0,ch.x,y,ch.z,1]),{tex:t,em:1,a:1})}}}
gl.alpha(false)}
