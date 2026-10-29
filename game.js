'use strict';
/* ===== PENA MÁXIMA — jogo original de vida na prisão (Arão Lende Webdesign) ===== */
const T=40,W=64,H=47;
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const dist=(a,b,c,d)=>Math.hypot(c-a,d-b);
const TAU=Math.PI*2;
function hash(x,y){let h=(x*374761393+y*668265263)^0x5bd1e995;h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967295}

/* ---------- mapa ---------- */
const OUT=0,WALL=1,FENCE=2,FLOOR=3,YARD=4,DOOR=5,CUT=6;
const grid=new Uint8Array(W*H),zone=new Array(W*H).fill('out');
const gi=(x,y)=>y*W+x;
function rect(x1,y1,x2,y2,t,z){for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){grid[gi(x,y)]=t;if(z)zone[gi(x,y)]=z}}
rect(0,0,W-1,H-1,OUT,'out');
rect(2,2,61,41,WALL,'wall');
const CELLS=[[3,8],[10,15],[17,22],[24,29]];
CELLS.forEach((c,i)=>rect(c[0],3,c[1],10,FLOOR,'cela'+(i+1)));
rect(32,3,42,10,FLOOR,'refeitorio');
rect(45,3,51,10,FLOOR,'enfermaria');
rect(54,3,56,10,FLOOR,'sol1');rect(58,3,60,10,FLOOR,'sol2');
rect(3,12,60,14,FLOOR,'corredor');
rect(57,12,60,14,FLOOR,'posto');
rect(3,16,14,24,FLOOR,'oficina');
rect(16,16,26,24,FLOOR,'lavandaria');
rect(28,16,38,24,FLOOR,'cozinha');
rect(40,16,47,24,FLOOR,'cantina');
rect(49,16,60,24,FLOOR,'biblioteca');
rect(3,26,60,40,YARD,'patio');
rect(3,41,60,41,FENCE,'cerca');
/* portas */
const DOORS=[];
function door(x,y,id,kind){
  const z=y===11?zone[gi(x,10)]:y===15?zone[gi(x,16)]:y===25?'patio':'posto';
  grid[gi(x,y)]=DOOR;zone[gi(x,y)]=z;DOORS.push({x,y,id,kind,open:false})}
[[6,'cela1'],[12,'cela2'],[19,'cela3'],[26,'cela4']].forEach(d=>door(d[0],11,d[1],'cela'));
door(37,11,'refeitorio','livre');door(48,11,'enfermaria','livre');
door(55,11,'sol1','sol');door(59,11,'sol2','sol');
[[8,'oficina'],[21,'lavandaria'],[33,'cozinha'],[43,'cantina'],[54,'biblioteca']].forEach(d=>door(d[0],15,d[1],'livre'));
door(30,25,'patioA','patio');door(31,25,'patioB','patio');
door(61,13,'portao','portao');
const doorAt=(x,y)=>DOORS.find(d=>d.x===x&&d.y===y);

/* ---------- objectos ---------- */
const OBJ=[];
function ob(type,x,y,w,h,o){const r=Object.assign({type,x,y,w:w||1,h:h||1,solid:true},o||{});OBJ.push(r);return r}
CELLS.forEach((c,i)=>{
  const own=(i===1);
  ob('cama',c[0],4,1,2,{act:own?'cama':null,id:own?'cama_own':'cama_x',label:own?'A tua cama':''});
  ob('cama',c[1],4,1,2,{id:'cama_y'});
  ob('retrete',c[1],9,1,1,{act:'retrete',label:'Retrete'});
  ob('lavatorio',c[0],9,1,1,{act:'lavatorio',label:'Lavatório'});
});
/* refeitório */
[[34,5],[38,5],[34,8],[38,8]].forEach(p=>ob('mesa',p[0],p[1],3,1,{}));
ob('balcao',33,3,9,1,{act:'bandeja',label:'Balcão das refeições'});
/* enfermaria */
ob('camamed',46,5,2,1,{});ob('camamed',46,8,2,1,{});ob('armario',50,3,1,2,{});
/* corredor */
ob('secretaria',22,12,4,1,{act:'secretaria',label:'Secretaria dos trabalhos'});
ob('telefone',40,12,1,1,{act:'telefone',label:'Telefone público'});
ob('banco',8,12,3,1,{});ob('banco',47,12,3,1,{});
ob('secretaria',58,12,2,1,{});
/* oficina */
ob('bancada',4,17,4,1,{act:'trab_oficina',label:'Bancada da oficina'});ob('bancada',9,17,4,1,{act:'trab_oficina',label:'Bancada da oficina'});
ob('maquina',4,21,3,2,{});ob('maquina',10,21,3,2,{});
/* lavandaria */
[17,19,21,23].forEach(x=>ob('lavadora',x,17,1,1,{act:'trab_lav',label:'Lavandaria'}));
ob('mesa',18,21,5,1,{act:'trab_lav',label:'Mesa de dobrar roupa'});
ob('cesto',25,22,1,1,{act:'cesto',label:'Cesto de roupa dos guardas'});
/* cozinha */
ob('balcao',29,17,8,1,{act:'trab_coz',label:'Balcão da cozinha'});
ob('fogao',29,22,3,1,{});
ob('despensa',36,22,2,2,{act:'despensa',label:'Despensa'});
/* cantina */
ob('balcao',41,18,6,1,{act:'cantina',label:'Cantina'});
ob('prateleira',41,23,6,1,{});
/* biblioteca */
ob('estante',50,17,10,1,{act:'trab_bib',label:'Estantes da biblioteca'});
ob('estante',50,20,10,1,{act:'ler',label:'Ler um livro'});
ob('mesa',53,23,3,1,{});
/* pátio */
ob('pesos',8,29,6,2,{act:'pesos',label:'Pesos'});
ob('saco',18,30,1,1,{act:'saco',label:'Saco de boxe'});
ob('barra',22,29,3,1,{act:'barra',label:'Barras'});
ob('tabela',45,28,1,1,{});
ob('banco',30,36,4,1,{});
ob('mesa',50,35,3,2,{});
ob('torre',4,38,2,2,{id:'torreE'});ob('torre',58,38,2,2,{id:'torreD'});
ob('caixote',14,36,2,1,{});ob('caixote',40,31,1,1,{});

/* ---------- tempo e horário ---------- */
const TS=3; /* minutos de jogo por segundo real (1 dia ≈ 8 min) */
const S={ /* estado */
  t:6.5*60,day:1,speed:1,
  px:0,py:0
};
function hh(){return S.t/60}
function sched(h){
  if(h<6.5||h>=21)return'noite';
  if(h<7)return'acordar';
  if(h<7.5)return'chamada';
  if(h<8)return'cafe';
  if(h<12)return'trabalho';
  if(h<13)return'almoco';
  if(h<18)return'livre';
  if(h<19)return'jantar';
  return'livre_noite';
}
const SCHED_NAME={noite:'Recolher / Noite',acordar:'Acordar',chamada:'Chamada na cela',cafe:'Pequeno-almoço',trabalho:'Horário de trabalho',almoco:'Almoço',livre:'Tempo livre / Pátio',jantar:'Jantar',livre_noite:'Tempo livre (bloco)'};
function clock(){const m=Math.floor(S.t)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function isNight(){const h=hh();return h<6||h>=21}
function darkness(){const h=hh();if(h>=21.5||h<5.5)return .8;if(h>=20)return .8*(h-20)/1.5;if(h<6.5)return .8*(6.5-h);return 0}

/* portas: estado */
function updateDoors(){
  const h=hh(),sc=sched(h);
  DOORS.forEach(d=>{
    if(d.kind==='cela')d.open=(h>=6.5&&h<21&&sc!=='chamada');
    else if(d.kind==='patio')d.open=(h>=13&&h<18.5);
    else if(d.kind==='livre')d.open=true;
    else d.open=false; /* sol e portão: trancados */
    if(d.kind==='sol'&&S.solDoor===d.id)d.open=false;
  });
}
function restricted(z,h){
  if(z==='posto'||z==='sol1'||z==='sol2')return true;
  if(z==='patio')return !(h>=13&&h<18.5);
  const night=(h>=21||h<6.5);
  if(night&&z!==('cela2'))return true;
  if(z==='cantina'&&!(h>=13&&h<21))return true;
  return false;
}

/* ---------- colisões ---------- */
const solidObjs=OBJ.filter(o=>o.solid);
function tileSolid(tx,ty,who){
  if(tx<0||ty<0||tx>=W||ty>=H)return true;
  const t=grid[gi(tx,ty)];
  if(t===WALL||t===FENCE)return true;
  if(t===DOOR){const d=doorAt(tx,ty);if(who&&who.guard)return false;return !(d&&d.open)}
  return false;
}
function objHit(px,py,r){
  for(const o of solidObjs){
    const x1=o.x*T,y1=o.y*T,x2=(o.x+o.w)*T,y2=(o.y+o.h)*T;
    if(px+r>x1&&px-r<x2&&py+r>y1&&py-r<y2)return o;
  }
  return null;
}
function blockedAt(px,py,r,who){
  const x1=Math.floor((px-r)/T),x2=Math.floor((px+r)/T),y1=Math.floor((py-r)/T),y2=Math.floor((py+r)/T);
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(tileSolid(x,y,who))return true;
  return !!objHit(px,py,r);
}
function moveE(e,dx,dy){
  const r=e.r||T*.3;
  if(!blockedAt(e.x+dx,e.y,r,e))e.x+=dx;
  if(!blockedAt(e.x,e.y+dy,r,e))e.y+=dy;
}
/* linha de visão entre dois pontos (px) */
function los(x1,y1,x2,y2){
  const d=dist(x1,y1,x2,y2),n=Math.ceil(d/(T*.5));
  for(let i=1;i<n;i++){
    const x=x1+(x2-x1)*i/n,y=y1+(y2-y1)*i/n,tx=Math.floor(x/T),ty=Math.floor(y/T);
    if(tx<0||ty<0||tx>=W||ty>=H)return false;
    const t=grid[gi(tx,ty)];
    if(t===WALL)return false;
    if(t===DOOR){const dd=doorAt(tx,ty);if(!(dd&&dd.open))return false}
  }
  return true;
}
/* BFS de caminhos (tiles) */
const blockedTile=new Uint8Array(W*H);
OBJ.forEach(o=>{if(o.solid)for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)blockedTile[gi(x,y)]=1});
function walkable(x,y,guard){
  if(x<0||y<0||x>=W||y>=H)return false;
  const t=grid[gi(x,y)];
  if(t===WALL||t===FENCE||blockedTile[gi(x,y)])return false;
  if(t===DOOR){if(guard)return true;const d=doorAt(x,y);return !!(d&&d.open)}
  return true;
}
function bfs(sx,sy,tx,ty,guard){
  if(sx===tx&&sy===ty)return[];
  if(!walkable(tx,ty,guard)){ /* procura vizinho livre */
    let f=null;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]])if(walkable(tx+a,ty+b,guard)){f=[tx+a,ty+b];break}
    if(!f)return null;tx=f[0];ty=f[1];
  }
  const prev=new Int32Array(W*H).fill(-1),q=[sy*W+sx];prev[sy*W+sx]=sy*W+sx;
  let h=0,found=false;
  while(h<q.length){
    const c=q[h++],cx=c%W,cy=(c/W)|0;
    if(cx===tx&&cy===ty){found=true;break}
    for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=cx+a,ny=cy+b;
      if(!walkable(nx,ny,guard))continue;
      const k=ny*W+nx;if(prev[k]!==-1)continue;
      prev[k]=c;q.push(k);
    }
  }
  if(!found)return null;
  const path=[];let c=ty*W+tx;
  while(c!==sy*W+sx){path.push([c%W,(c/W)|0]);c=prev[c]}
  return path.reverse();
}

/* ---------- câmara e ecrã ---------- */
const cv=$('#cv'),ctx=cv.getContext('2d');
const dk=document.createElement('canvas'),dctx=dk.getContext('2d');
let VW=0,VH=0,DPR=1,Z=1;
const cam={x:0,y:0};
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  VW=window.innerWidth;VH=window.innerHeight;
  cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);
  cv.style.width=VW+'px';cv.style.height=VH+'px';
  Z=VW<700?VW/(T*12):Math.min(VW/(T*20),1.25);
  Z=Math.max(Z,.55);
  dk.width=Math.round(VW/2);dk.height=Math.round(VH/2);
}
window.addEventListener('resize',resize);resize();

/* ---------- itens ---------- */
const ITEMS={
  pao:{n:'Pão com manteiga',food:22,buy:5,sell:2},
  refeicao:{n:'Prato da cantina',food:45,buy:12,sell:4},
  remedio:{n:'Analgésico',heal:35,buy:25,sell:10},
  proteina:{n:'Barra de proteína',str:1,buy:30,sell:10},
  colher:{n:'Colher afiada',contra:1,buy:30,sell:12,desc:'Serve para cavar.'},
  alicate:{n:'Alicate',contra:1,buy:140,sell:50,desc:'Corta a rede da cerca.'},
  faca:{n:'Faca improvisada',contra:1,buy:70,sell:25,dmg:7,desc:'+7 de dano. Proibida.'},
  mapa:{n:'Planta da prisão',contra:1,buy:60,sell:20,desc:'Mostra o ponto fraco da cerca.'},
  chave:{n:'Chave do portão',contra:1,buy:340,sell:120,desc:'Abre o portão principal.'},
  uniforme:{n:'Uniforme de guarda',contra:1,wear:1,buy:0,sell:60,desc:'Disfarce. Equipa no inventário.'},
  telemovel:{n:'Telemóvel clandestino',contra:1,phone:1,buy:210,sell:70,desc:'Usa-o para pedir dinheiro à família.'},
  bilhete:{n:'Bilhete dobrado',contra:0,buy:0,sell:0}
};
const SHOP=['pao','refeicao','remedio','proteina','colher','alicate','faca','mapa','chave','telemovel'];

/* ---------- estado do jogador ---------- */
const P={x:11.5*T,y:7.5*T,r:T*.3,hp:100,en:100,food:80,str:5,rep:0,heat:0,money:30,
  inv:{pao:1},stash:{},face:Math.PI/2,walk:0,atk:0,cd:0,run:false,gang:null,uniform:false,
  job:null,tasks:0,crime:0,sleeping:false,busy:null,kind:'p',col:'#ff8a1f',hurt:0,name:'Tu'};
const G={sentence:45,tunnel:0,cut:{},missions:[],log:[],stats:{fights:0,days:0,solitary:0,jobs:0},
  chamadaOk:true,solitary:false,over:false,mapa:false,gangRep:{corvos:0,serpentes:0},lastHour:-1,flags:{},stashRevista:0};

/* ---------- zonas e sítios ---------- */
const ZT={};
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const t=grid[gi(x,y)];if(t!==FLOOR&&t!==YARD)continue;
  if(blockedTile[gi(x,y)])continue;
  const z=zone[gi(x,y)];(ZT[z]=ZT[z]||[]).push([x,y]);
}
const spot=z=>{const a=ZT[z];return a?pick(a):[12,13]};
function zoneAt(px,py){const tx=Math.floor(px/T),ty=Math.floor(py/T);if(tx<0||ty<0||tx>=W||ty>=H)return'out';return zone[gi(tx,ty)]}

/* ---------- presos ---------- */
const GANG={corvos:{n:'Corvos',c:'#15151a'},serpentes:{n:'Serpentes',c:'#26b765'}};
const NAMES=['Rui','Bento','Nelito','Chico','Dino','Kiala','Mário','Tó','Joka','Beto','Vasco','Edson','Nando','Lito'];
const COLS=['#ff9a2e','#f08a24','#ff8f3a','#f5a23d'];
const SKINS=['#e8b98f','#b5764c','#8a5634','#d9a273','#6f4529'];
const HAIRS=['#222','#3b2414','#111','#5a3a1c','#1a1a1a'];
const NPC=[],GUARDS=[],NPCS_ALL=[];
const JOBS={oficina:{n:'Oficina (matrículas)',pay:14,zone:'oficina',act:'trab_oficina'},lavandaria:{n:'Lavandaria',pay:12,zone:'lavandaria',act:'trab_lav'},cozinha:{n:'Cozinha',pay:13,zone:'cozinha',act:'trab_coz'},biblioteca:{n:'Biblioteca',pay:9,zone:'biblioteca',act:'trab_bib'}};
function mkNPC(o){
  const n=Object.assign({kind:'in',x:0,y:0,r:T*.3,hp:60,mhp:60,spd:T*2.3,home:1,gang:null,work:null,
    col:pick(COLS),skin:pick(SKINS),hair:pick(HAIRS),path:[],pi:0,nextT:0,aggro:0,cd:0,face:rnd(0,TAU),walk:0,
    ko:0,hurt:0,talkable:true,fixed:null,zonePlan:null,name:pick(NAMES)},o);
  n.mhp=n.hp;return n}
(function(){
  const names=NAMES.slice().sort(()=>Math.random()-.5);
  const homes=[1,3,4,1,3,4,1,3,4,1,3,4];
  const works=['oficina','lavandaria','cozinha','biblioteca',null,'oficina','lavandaria','cozinha',null,'oficina','lavandaria','cozinha'];
  for(let i=0;i<12;i++){
    const gang=i<4?'corvos':i<8?'serpentes':null;
    const n=mkNPC({name:names[i],home:homes[i],work:works[i],gang,hp:50+ri(0,40),spd:T*rnd(1.9,2.5)});
    const s=spot('cela'+n.home);n.x=(s[0]+.5)*T;n.y=(s[1]+.5)*T;
    NPC.push(n);
  }
  /* Zeca, colega de cela */
  const z=mkNPC({name:'Zeca',home:2,work:'cozinha',gang:null,hp:70,col:'#ffa63d',skin:SKINS[1],talkable:true,isZeca:true});
  const s=spot('cela2');z.x=(s[0]+.5)*T;z.y=(s[1]+.5)*T;NPC.push(z);
  /* chefes das gangues */
  const l1=mkNPC({name:'Dom Baltazar',home:3,gang:'corvos',leader:true,hp:110,col:'#ff8f1c',skin:SKINS[3],work:null,spd:T*2.2});
  const l2=mkNPC({name:'Cobra',home:4,gang:'serpentes',leader:true,hp:110,col:'#ff8f1c',skin:SKINS[2],work:null,spd:T*2.2});
  [l1,l2].forEach(l=>{const s=spot('cela'+l.home);l.x=(s[0]+.5)*T;l.y=(s[1]+.5)*T;NPC.push(l)});
  NPC.forEach(n=>{if(n.gang)n.band=GANG[n.gang].c});
  /* especiais fixos */
  const ze=mkNPC({name:'Zé da Cantina',kind:'in',fixed:[44,19],isShop:true,hp:80,col:'#e8e0cf',skin:SKINS[3],hair:'#555',talkable:true});
  ze.x=44.5*T;ze.y=19.5*T;NPC.push(ze);
  const doc=mkNPC({name:'Dra. Luzia',kind:'in',fixed:[49,6],isDoc:true,hp:80,col:'#f2f6f6',skin:SKINS[0],hair:'#3b2414',talkable:true});
  doc.x=49.5*T;doc.y=6.5*T;NPC.push(doc);
  /* guardas */
  const gdef=[
    {name:'Guarda Silva',day:'cor',yard:'patio1'},{name:'Guarda Pinto',day:'cor2',yard:'patio2'},
    {name:'Guarda Matoso',day:'ref',yard:'patio1'},{name:'Guarda Dias',day:'cor',yard:'patio2'},
    {name:'Sr. Mateus',fixedG:[24,13.5],sec:true},{name:'Guarda do Portão',fixedG:[59,13.5],gate:true}];
  const ROUTES={
    cor:[[5,13],[30,13],[55,13],[30,13]],cor2:[[56,13],[35,13],[10,13],[35,13]],
    ref:[[34,6],[41,6],[41,9],[34,9],[37,12],[37,13]],
    patio1:[[6,28],[30,28],[56,28],[56,38],[30,38],[6,38]],patio2:[[56,38],[30,38],[6,38],[6,28],[30,28],[56,28]]};
  gdef.forEach((d,i)=>{
    const g={kind:'g',guard:true,name:d.name,x:0,y:0,r:T*.3,hp:150,mhp:150,spd:T*2.1,col:'#2a4f93',skin:pick(SKINS),hair:'#111',
      path:[],pi:0,nextT:0,face:0,walk:0,state:'patrol',route:0,ko:0,hurt:0,cd:0,lost:0,def:d,ROUTES,
      sus:0,talkable:!!d.sec,fixed:d.fixedG||null,sec:d.sec,gate:d.gate,seeT:0,revT:0};
    const s=d.fixedG?[d.fixedG[0],d.fixedG[1]]:ROUTES[d.day][0];
    g.x=(s[0]+.5)*T;g.y=(s[1]+.5)*T;
    if(d.fixedG){g.x=d.fixedG[0]*T;g.y=d.fixedG[1]*T}
    GUARDS.push(g);
  });
})();
const ALL=()=>NPC.concat(GUARDS);
const SPECIAL_G=()=>GUARDS.filter(g=>g.sec||g.gate);

/* ---------- IA dos presos ---------- */
function planZone(n,h,sc){
  if(n.isShop||n.isDoc)return null;
  if(n.leader&&sc==='livre')return n.gang==='corvos'?'quadra':'pesos';
  if(h>=20.3||sc==='noite'||sc==='acordar'||sc==='chamada')return'cela'+n.home;
  if(sc==='cafe'||sc==='almoco'||sc==='jantar')return'refeitorio';
  if(sc==='trabalho')return n.work?JOBS[n.work].zone:'corredor';
  if(sc==='livre')return Math.random()<.78?'patio':pick(['cantina','biblioteca','corredor']);
  if(sc==='livre_noite')return pick(['corredor','corredor','cantina','cela'+n.home]);
  return'corredor';
}
function nspot(n,z){
  if(z==='quadra')return[ri(40,50),ri(30,36)];
  if(z==='pesos')return[ri(8,13),ri(33,35)];
  return spot(z);
}
function setPath(e,tx,ty,guard){
  const sx=Math.floor(e.x/T),sy=Math.floor(e.y/T);
  const p=bfs(sx,sy,tx,ty,guard);
  e.path=p||[];e.pi=0;
}
function followPath(e,dt,spd){
  if(e.pi>=e.path.length)return true;
  const[tx,ty]=e.path[e.pi],cx=(tx+.5)*T,cy=(ty+.5)*T;
  const dx=cx-e.x,dy=cy-e.y,d=Math.hypot(dx,dy);
  if(d<5){e.pi++;return e.pi>=e.path.length}
  const s=spd*dt;e.face=Math.atan2(dy,dx);
  const mx=dx/d*Math.min(s,d),my=dy/d*Math.min(s,d);
  const ox=e.x,oy=e.y;moveE(e,mx,my);
  e.walk+=dt;
  if(Math.abs(e.x-ox)+Math.abs(e.y-oy)<s*.2){e.stuck=(e.stuck||0)+dt;if(e.stuck>.7){e.stuck=0;e.path=[];e.nextT=0}}else e.stuck=0;
  return false;
}
function unstick(e){
  if(!blockedAt(e.x,e.y,e.r,e))return;
  const cx=Math.floor(e.x/T),cy=Math.floor(e.y/T);
  for(let r=1;r<=4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    const x=cx+dx,y=cy+dy;if(!walkable(x,y,false))continue;
    if(!blockedAt((x+.5)*T,(y+.5)*T,e.r,e)){e.x=(x+.5)*T;e.y=(y+.5)*T;e.path=[];return}
  }
}
function updateNPC(n,dt,now){
  n.uT=(n.uT||0)-dt;if(n.uT<=0){n.uT=1;unstick(n);
    const h0=hh();
    if(!n.fixed&&n.aggro<=0&&zoneAt(n.x,n.y)==='patio'&&!(h0>=13&&h0<18.5)){const z=planZone(n,h0,sched(h0));if(z&&z!=='patio'&&z!=='quadra'&&z!=='pesos'){const s=nspot(n,z);n.x=(s[0]+.5)*T;n.y=(s[1]+.5)*T;n.path=[]}}}
  if(n.hurt>0)n.hurt-=dt;
  if(n.cd>0)n.cd-=dt;
  if(n.ko>0){n.ko-=dt;if(n.ko<=0){n.hp=Math.max(20,n.mhp*.4);n.aggro=0;n.nextT=0}return}
  const h=hh(),sc=sched(h);
  if(n.aggro>0){
    n.aggro-=dt;
    const d=dist(n.x,n.y,P.x,P.y);
    if(n.hp<n.mhp*.3){n.aggro=0;n.talk='Para! Já chega!';n.talkT=2;return}
    if(d>1.05*T){
      n.pathT=(n.pathT||0)-dt;
      if(n.pathT<=0||!n.path.length){setPath(n,Math.floor(P.x/T),Math.floor(P.y/T));n.pathT=.5}
      followPath(n,dt,n.spd*1.25);
    }else{
      n.face=Math.atan2(P.y-n.y,P.x-n.x);
      if(n.cd<=0){n.cd=1.05;n.atk=.25;hurtPlayer(rnd(2.5,5)+(n.leader?3:0),n)}
    }
    return;
  }
  if(n.atk>0)n.atk-=dt;
  if(n.fixed){ /* parado, a olhar para o jogador se perto */
    if(dist(n.x,n.y,P.x,P.y)<T*3)n.face=Math.atan2(P.y-n.y,P.x-n.x);
    return;
  }
  n.nextT-=dt;
  if(n.nextT<=0||!n.path.length){
    if(n.pi>=n.path.length&&n.nextT>0){return}
    const z=planZone(n,h,sc);n.zonePlan=z;
    if(z){const s=nspot(n,z);setPath(n,s[0],s[1])}
    n.nextT=rnd(5,13);
  }
  if(n.path.length&&n.pi<n.path.length)followPath(n,dt,n.spd*.8);
}
function hurtPlayer(d,src){
  if(P.sleeping||G.over)return;
  P.hp-=d;P.hurt=.25;sfx('hit');
  fx.push({x:P.x,y:P.y-T,t:.8,txt:'-'+Math.round(d),col:'#ff6b6b'});
  if(P.hp<=0)knockout();
}

/* ---------- IA dos guardas ---------- */
function guardRoute(g,h,sc){
  const d=g.def,R=g.ROUTES;
  const yardOpen=(h>=13&&h<18.5);
  const night=(h>=21||h<6.5);
  if(d.yard&&(yardOpen||night))return R[d.yard];
  if(d.day==='ref'&&(sc==='cafe'||sc==='almoco'||sc==='jantar'))return R.ref;
  if(d.day==='ref')return R.cor;
  return R[d.day];
}
function playerSeenBy(g){
  const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy);
  const dark=darkness()>.35;
  let range=T*(dark?3.4:7);
  if(dark&&g.lightOn)range=T*8;
  if(inBeam(P.x,P.y))range=Math.max(range,T*10);
  if(P.uniform)range=Math.min(range,T*2.2);
  if(d>range)return false;
  if(d<T*1.3)return los(g.x,g.y,P.x,P.y);
  let a=Math.atan2(dy,dx)-(g.look!==undefined?g.look:g.face);
  while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;
  if(Math.abs(a)>.8)return false;
  return los(g.x,g.y,P.x,P.y);
}
function violation(){
  if(P.crime>0)return true;
  if(P.uniform)return false;
  return restricted(zoneAt(P.x,P.y),hh());
}
let alarm=0;
function raiseAlarm(src){
  if(alarm<=0){sfx('alarm');banner('ALARME!','#ff4d4d')}
  alarm=14;
  GUARDS.forEach(g=>{
    if(g.sec||g.gate&&dist(g.x,g.y,P.x,P.y)>T*8)return;
    if(g.state!=='chase'){g.state='chase';g.lost=0}
  });
}
function updateGuard(g,dt,now){
  if(g.hurt>0)g.hurt-=dt;
  if(g.cd>0)g.cd-=dt;
  if(g.atk>0)g.atk-=dt;
  if(g.ko>0){g.ko-=dt;return}
  const h=hh(),sc=sched(h);
  g.lightOn=darkness()>.3;
  g.look=(g.state==='patrol'&&!g.fixed)?g.face+Math.sin(now*1.5+g.def.name.length)*.7:g.face;
  const see=playerSeenBy(g);
  const viol=violation();
  if(g.state==='patrol'||g.state==='revista'){
    if(see&&viol&&!G.over){
      P.heat+=dt*(dist(g.x,g.y,P.x,P.y)<T*3?60:34);
      g.face=Math.atan2(P.y-g.y,P.x-g.x);
      g.seeT=1;
      if(P.heat>=100)raiseAlarm(g);
    }else g.seeT=Math.max(0,g.seeT-dt);
    /* revista aleatória */
    if(see&&!viol&&g.state==='patrol'&&!g.fixed&&Object.keys(contraband()).length&&P.heat>20&&Math.random()<dt*.12&&dist(g.x,g.y,P.x,P.y)<T*5&&!P.uniform){
      g.state='revista';g.revT=0;toast('O guarda vai revistar-te…');
    }
  }
  if(g.state==='revista'){
    const d=dist(g.x,g.y,P.x,P.y);
    if(d>T*.95){
      g.pathT=(g.pathT||0)-dt;
      if(g.pathT<=0){setPath(g,Math.floor(P.x/T),Math.floor(P.y/T),true);g.pathT=.4}
      followPath(g,dt,g.spd*1.1);g.revT+=dt;
      if(g.revT>9)g.state='patrol';
    }else{g.state='patrol';doRevista(g)}
    return;
  }
  if(g.state==='chase'){
    const d=dist(g.x,g.y,P.x,P.y);
    if(see){g.lost=0;g.face=Math.atan2(P.y-g.y,P.x-g.x)}else g.lost+=dt;
    if(d<T*.95&&!P.sleeping){arrest(g);return}
    g.pathT=(g.pathT||0)-dt;
    if(g.pathT<=0){setPath(g,Math.floor(P.x/T),Math.floor(P.y/T),true);g.pathT=.35}
    followPath(g,dt,g.spd*(P.uniform?1.25:1.55));
    if(g.lost>7){g.state='patrol';g.path=[];g.nextT=0;P.heat=Math.min(P.heat,55)}
    return;
  }
  /* patrulha */
  if(g.fixed){
    const fx_=g.fixed[0]*T,fy_=g.fixed[1]*T;
    if(g.gate||g.sec){
      if(dist(g.x,g.y,P.x,P.y)<T*3.2&&!g.seeT)g.face=Math.atan2(P.y-g.y,P.x-g.x);
    }
    return;
  }
  const rt=guardRoute(g,h,sc);
  if(g.curRoute!==rt){g.curRoute=rt;g.route=0;g.path=[];}
  if(!g.path.length||g.pi>=g.path.length){
    g.wait=(g.wait||0)-dt;
    if(g.wait>0)return;
    g.wait=rnd(.4,2.2);
    g.route=(g.route+1)%rt.length;
    const t=rt[g.route];setPath(g,t[0],t[1],true);
  }
  if(g.path.length&&g.pi<g.path.length)followPath(g,dt,g.spd*.72);
}
function contraband(){
  const o={};for(const k in P.inv)if(ITEMS[k].contra&&P.inv[k]>0&&!(k==='uniforme'&&P.uniform&&false))o[k]=P.inv[k];return o}
function doRevista(g){
  const c=contraband();const ks=Object.keys(c);
  if(!ks.length){toast('Revista: nada de suspeito. O guarda afasta-se.');return}
  sfx('alarm');
  ks.forEach(k=>delete P.inv[k]);
  if(P.uniform){P.uniform=false}
  P.heat=Math.min(100,P.heat+30);
  G.stats.revistas=(G.stats.revistas||0)+1;
  banner('REVISTA! Confiscaram '+ks.map(k=>ITEMS[k].n).join(', '),'#ffb04d',4200);
  if(Math.random()<.5||ks.includes('faca')||ks.includes('chave')){arrest(g,true)}
}

/* ---------- efeitos, áudio, avisos ---------- */
const fx=[];
let GT=0;
let AC=null,muted=false;
function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}
function tone(f,d,type,vol,slide,delay){
  if(!AC||muted)return;
  const t=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);
  g.gain.setValueAtTime(vol||.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02);
}
function sfx(n){
  if(!AC||muted)return;
  if(n==='hit'){tone(140,.12,'sawtooth',.07,-90)}
  else if(n==='punch'){tone(220,.09,'square',.05,-150)}
  else if(n==='coin'){tone(880,.07,'square',.04);tone(1320,.1,'square',.04,0,.07)}
  else if(n==='ok'){tone(520,.08,'triangle',.05);tone(780,.12,'triangle',.05,0,.08)}
  else if(n==='bad'){tone(200,.18,'sawtooth',.05,-80)}
  else if(n==='alarm'){for(let i=0;i<6;i++)tone(i%2?640:880,.18,'square',.045,0,i*.2)}
  else if(n==='door'){tone(90,.15,'triangle',.06,-30)}
  else if(n==='tick'){tone(1200,.03,'square',.03)}
  else if(n==='dig'){tone(110,.07,'sawtooth',.05,-40)}
}
let toastT=0;
function toast(m,ms){const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),ms||2600)}
let banT=0;
function banner(m,c,ms){const e=$('#banner');e.textContent=m;e.style.color=c||'#fff';e.classList.add('on');clearTimeout(banT);banT=setTimeout(()=>e.classList.remove('on'),ms||2200)}

/* ---------- focos de luz ---------- */
const LAMPS=[[8,13],[20,13],[32,13],[44,13],[56,13],[7,6],[13,6],[20,6],[27,6],[37,6],[48,6],[8,20],[21,20],[33,20],[43,20],[54,20],[6,30],[30,30],[54,30],[6,38],[30,38],[54,38],[17,33],[43,33]];
const TOWERS=[{x:5*T,y:39*T,a:-.8,p:0},{x:59*T,y:39*T,a:-2.35,p:1.7}];
function beamAngle(t,now){return t.a+Math.sin(now*.42+t.p)*.95}
function beamsOn(){const h=hh();return h>=19.5||h<6}
function inBeam(px,py){
  if(!beamsOn())return false;
  const now=GT;
  for(const t of TOWERS){
    const dx=px-t.x,dy=py-t.y,d=Math.hypot(dx,dy);if(d>T*32||d<T)continue;
    let a=Math.atan2(dy,dx)-beamAngle(t,now);
    while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;
    if(Math.abs(a)<.17+.5/Math.max(2,d/T))return true;
  }
  return false;
}

/* ---------- desenho do mundo ---------- */
const ZCOL={cela1:'#7a7d84',cela2:'#7f8289',cela3:'#7a7d84',cela4:'#7a7d84',refeitorio:'#938b78',enfermaria:'#a7bcbc',corredor:'#82858c',posto:'#6d7280',
  oficina:'#7f786b',lavandaria:'#778991',cozinha:'#a0a096',cantina:'#8f7e8f',biblioteca:'#80705c',sol1:'#585d64',sol2:'#585d64'};
function drawTile(x,y){
  const t=grid[gi(x,y)],px=x*T,py=y*T,z=zone[gi(x,y)],v=hash(x,y);
  if(t===OUT){
    if(y>=44){ctx.fillStyle='#46464d';ctx.fillRect(px,py,T,T);ctx.fillStyle='rgba(255,255,255,.06)';if(x%3===0)ctx.fillRect(px+T/2-2,py+T/2-1,4,3)}
    else{ctx.fillStyle=v>.5?'#33572f':'#38612f';ctx.fillRect(px,py,T,T);if(v>.8){ctx.fillStyle='#4a7a3a';ctx.fillRect(px+8,py+12,3,5)}}
    return}
  if(t===WALL){
    const below=y+1<H&&grid[gi(x,y+1)]!==WALL;
    ctx.fillStyle='#5b6070';ctx.fillRect(px,py,T,T);
    ctx.fillStyle='#737a8c';ctx.fillRect(px,py,T,T-(below?12:0));
    if(below){ctx.fillStyle='#363a46';ctx.fillRect(px,py+T-12,T,12);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(px,py+T-12,T,2)}
    ctx.fillStyle='rgba(0,0,0,.08)';if((x+y)%2)ctx.fillRect(px,py,T,T-(below?12:0));
    return}
  if(t===YARD||(t===CUT&&y>=26)){
    ctx.fillStyle=v>.6?'#8e7954':v>.3?'#897450':'#92805a';ctx.fillRect(px,py,T,T);
    if(v>.85){ctx.fillStyle='rgba(60,40,20,.25)';ctx.fillRect(px+10,py+14,6,3)}
    if(t===CUT){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(px,py+T-6,T,6)}
    return}
  /* chão interior */
  ctx.fillStyle=ZCOL[z]||'#808389';ctx.fillRect(px,py,T,T);
  if((x+y)%2===0){ctx.fillStyle='rgba(255,255,255,.035)';ctx.fillRect(px,py,T,T)}
  ctx.fillStyle='rgba(0,0,0,.07)';ctx.fillRect(px,py+T-1,T,1);ctx.fillRect(px+T-1,py,1,T);
  if(z==='refeitorio'||z==='cozinha'||z==='enfermaria'){ctx.fillStyle='rgba(255,255,255,.04)';if((x+y)%2)ctx.fillRect(px,py,T,T)}
}
function drawFence(x,y){
  const px=x*T,py=y*T;
  ctx.fillStyle='#8e7954';ctx.fillRect(px,py,T,T);
  ctx.strokeStyle='rgba(205,210,220,.85)';ctx.lineWidth=1.4;
  ctx.beginPath();
  for(let i=-T;i<T*2;i+=10){ctx.moveTo(px+i,py);ctx.lineTo(px+i+T,py+T);ctx.moveTo(px+i+T,py);ctx.lineTo(px+i,py+T)}
  ctx.stroke();
  ctx.fillStyle='#4b505b';ctx.fillRect(px,py,3,T);ctx.fillRect(px+T-3,py,3,T);
  ctx.fillStyle='#2f333c';ctx.fillRect(px,py,T,4);
  if(P.inv.mapa&&x>=26&&x<=36&&!G.cut[x+','+y]){ctx.strokeStyle='rgba(255,70,70,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px+8,py+8);ctx.lineTo(px+T-8,py+T-8);ctx.moveTo(px+T-8,py+8);ctx.lineTo(px+8,py+T-8);ctx.stroke()}
}
function drawDoor(d){
  const px=d.x*T,py=d.y*T;
  const z=ZCOL[zone[gi(d.x,d.y)]]||'#808389';
  ctx.fillStyle=z;ctx.fillRect(px,py,T,T);
  if(d.open){
    ctx.fillStyle='#4a4f5c';ctx.fillRect(px,py,5,T);ctx.fillRect(px+T-5,py,5,T);
    ctx.fillStyle='rgba(80,230,140,.9)';ctx.fillRect(px+T/2-3,py+3,6,4);
  }else{
    ctx.fillStyle='#2f343e';ctx.fillRect(px,py,T,T);
    ctx.fillStyle='#8a909d';for(let i=3;i<T;i+=8)ctx.fillRect(px+i,py+2,3,T-4);
    ctx.fillStyle='#d65151';ctx.fillRect(px+T/2-3,py+T-7,6,4);
    if(d.kind==='portao'){ctx.fillStyle='#f0c24b';ctx.fillRect(px,py,T,4)}
  }
}
function box(x,y,w,h,top,side,hg){
  ctx.fillStyle=side;ctx.fillRect(x,y+h-hg,w,hg);
  ctx.fillStyle=top;ctx.fillRect(x,y-hg,w,h);
  ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(x,y-hg,w,2);
}
function drawObj(o,now){
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T;
  switch(o.type){
    case'cama':{const own=o.id==='cama_own';box(x+3,y+2,w-6,h-4,own?'#3470b8':'#8a8f9a','#2a2f3a',7);
      ctx.fillStyle='#f4f4f2';ctx.fillRect(x+6,y-3,w-12,12);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(x+6,y+h*.45,w-12,3);break}
    case'retrete':box(x+8,y+6,w-16,h-10,'#eef0f2','#c3c8ce',8);ctx.fillStyle='#d8dde2';ctx.beginPath();ctx.ellipse(x+w/2,y+h*.55-8,9,8,0,0,TAU);ctx.fill();break;
    case'lavatorio':box(x+6,y+8,w-12,h-12,'#e6eaee','#b9c0c8',8);ctx.fillStyle='#9ec7e0';ctx.beginPath();ctx.ellipse(x+w/2,y+h/2-6,8,6,0,0,TAU);ctx.fill();break;
    case'mesa':box(x+2,y+4,w-4,h-8,'#a07a4e','#6a4d2c',8);ctx.fillStyle='rgba(0,0,0,.12)';for(let i=T;i<w;i+=T)ctx.fillRect(x+i,y-4,1,h-8);break;
    case'bancada':box(x+2,y+4,w-4,h-6,'#6d5a45','#3d3125',9);ctx.fillStyle='#b8bec6';ctx.fillRect(x+8,y-5,10,6);ctx.fillStyle='#d65151';ctx.fillRect(x+26,y-5,8,6);ctx.fillStyle='#f0c24b';ctx.fillRect(x+w-26,y-5,12,6);break;
    case'maquina':box(x+3,y+3,w-6,h-6,'#6d7b8a','#3c4753',12);ctx.fillStyle='#2b333c';ctx.fillRect(x+10,y-6,w-20,14);ctx.fillStyle=(Math.floor(now*2)%2)?'#6bff9a':'#2a7a49';ctx.fillRect(x+w-16,y-8,6,6);break;
    case'lavadora':box(x+4,y+4,w-8,h-6,'#f1f3f5','#bcc3cb',10);ctx.fillStyle='#5e7f99';ctx.beginPath();ctx.arc(x+w/2,y+h/2-6,10,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(x+w/2-3,y+h/2-9,4,0,TAU);ctx.fill();break;
    case'cesto':ctx.fillStyle='#8a6a40';ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,15,12,0,0,TAU);ctx.fill();ctx.fillStyle='#2a4f93';ctx.beginPath();ctx.ellipse(x+w/2,y+h/2-4,11,7,0,0,TAU);ctx.fill();break;
    case'balcao':box(x+1,y+4,w-2,h-6,'#c1c8d0','#7d8691',10);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(x+4,y-4,w-8,3);
      if(o.act==='bandeja'||o.act==='cantina'){ctx.fillStyle='#e0b97a';for(let i=12;i<w-12;i+=34)ctx.fillRect(x+i,y-9,16,7)}break;
    case'fogao':box(x+2,y+3,w-4,h-6,'#2b2e34','#16181c',10);ctx.fillStyle='#555a63';for(let i=12;i<w-6;i+=30){ctx.beginPath();ctx.arc(x+i+6,y+h/2-8,7,0,TAU);ctx.fill()}break;
    case'despensa':box(x+2,y+2,w-4,h-4,'#9aa3ad','#5a626b',12);ctx.fillStyle='#6a7380';ctx.fillRect(x+w/2-1,y-8,2,h-6);break;
    case'prateleira':case'estante':box(x+1,y+3,w-2,h-4,'#7a5a3a','#43301d',12);
      for(let i=4;i<w-4;i+=6){ctx.fillStyle=['#b8423b','#3b7ab8','#d8b23d','#4a9a5a','#8a5ab8'][(i/6|0)%5];ctx.fillRect(x+i,y-9,4,10)}break;
    case'secretaria':box(x+2,y+4,w-4,h-6,'#8a6a46','#4e3a22',9);ctx.fillStyle='#f4f1e6';ctx.fillRect(x+8,y-6,12,8);ctx.fillRect(x+24,y-5,10,7);break;
    case'telefone':box(x+8,y+8,w-16,h-14,'#2b60a0','#1d3f6b',10);ctx.fillStyle='#e6e9ef';ctx.fillRect(x+12,y-4,16,5);break;
    case'banco':box(x+2,y+8,w-4,h-14,'#6a727e','#3d434c',6);break;
    case'camamed':box(x+2,y+4,w-4,h-6,'#f2f5f7','#b8c3cb',7);ctx.fillStyle='#5aa6d8';ctx.fillRect(x+6,y-3,w*.55,h-8);break;
    case'armario':box(x+4,y+3,w-8,h-6,'#e7ecee','#a3adb2',12);ctx.fillStyle='#d65151';ctx.fillRect(x+w/2-3,y-6,6,2);ctx.fillRect(x+w/2-1,y-8,2,6);break;
    case'pesos':box(x+4,y+10,w-8,h-12,'#3c424c','#1f2329',6);ctx.fillStyle='#bfc5ce';ctx.fillRect(x+10,y-2,w-20,3);ctx.fillStyle='#262a31';[14,w-26].forEach(a=>{ctx.fillRect(x+a,y-8,6,16)});break;
    case'saco':ctx.fillStyle='#4a4f5a';ctx.fillRect(x+w/2-2,y,4,8);ctx.fillStyle='#c83b3b';ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,9,14,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(x+w/2-5,y+5,3,12);break;
    case'barra':ctx.fillStyle='#4a4f5a';ctx.fillRect(x+2,y-6,5,T+4);ctx.fillRect(x+w-7,y-6,5,T+4);ctx.fillStyle='#cfd5dd';ctx.fillRect(x+2,y-8,w-4,4);break;
    case'tabela':ctx.fillStyle='#3a3f4a';ctx.fillRect(x+T/2-2,y-14,4,T+10);ctx.fillStyle='#f4f4f2';ctx.fillRect(x+T/2-12,y-22,24,14);ctx.strokeStyle='#e0592b';ctx.strokeRect(x+T/2-12,y-22,24,14);break;
    case'torre':{ctx.fillStyle='#3a3f4a';ctx.fillRect(x+6,y+8,w-12,h-6);box(x+2,y-26,w-4,26,'#5f6674','#363b46',14);
      ctx.fillStyle=beamsOn()?'#fff3b0':'#9aa0a8';ctx.beginPath();ctx.arc(x+w/2,y-30,7,0,TAU);ctx.fill();break}
    case'caixote':box(x+3,y+4,w-6,h-6,'#a07a4e','#5e4527',9);ctx.strokeStyle='rgba(0,0,0,.25)';ctx.strokeRect(x+6,y-3,w-12,h-12);break;
  }
}
function drawDecals(){
  /* quadra */
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;
  ctx.strokeRect(40*T,29*T,10*T,8*T);ctx.beginPath();ctx.moveTo(45*T,29*T);ctx.lineTo(45*T,37*T);ctx.stroke();
  ctx.beginPath();ctx.arc(45*T,33*T,T*1.3,0,TAU);ctx.stroke();
  /* pesos */
  ctx.fillStyle='rgba(40,40,40,.25)';ctx.fillRect(7*T,28*T,8*T,5*T);
  /* corredor: faixa */
  ctx.fillStyle='rgba(255,230,120,.10)';ctx.fillRect(3*T,13*T-2,58*T,4);
  /* sítio da chamada */
  ctx.fillStyle='rgba(70,140,230,.35)';ctx.fillRect(11*T,7*T,3*T,2*T);ctx.strokeStyle='rgba(120,180,255,.7)';ctx.lineWidth=1.5;ctx.strokeRect(11*T+3,7*T+3,3*T-6,2*T-6);
  /* letreiros */
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='bold 13px system-ui';ctx.textAlign='center';
  [['REFEITÓRIO',37,3.35],['ENFERMARIA',48,3.35],['OFICINA',8.5,16.45],['LAVANDARIA',21,16.45],['COZINHA',33,16.45],['CANTINA',43.5,16.45],['BIBLIOTECA',54.5,16.45],['PÁTIO',31,26.7],['SOLITÁRIA',57,3.35],['POSTO',58.5,12.4]].forEach(s=>ctx.fillText(s[0],s[1]*T,s[2]*T));
  ctx.fillStyle='rgba(255,255,255,.4)';ctx.font='bold 11px system-ui';
  [[6,'CELA 1'],[12.5,'CELA 2 (tua)'],[19.5,'CELA 3'],[26.5,'CELA 4']].forEach(s=>ctx.fillText(s[1],s[0]*T,3.4*T));
  ctx.fillStyle='rgba(255,230,120,.8)';ctx.fillText('PORTÃO',61.5*T-4,12.3*T);
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillText('LIBERDADE',31*T,43.4*T);
  ctx.textAlign='start';
}
function drawPerson(e,now){
  const x=e.x,y=e.y,mv=e.path&&e.pi<e.path.length||e===P&&P.moving;
  const bob=mv?Math.sin(e.walk*11)*1.8:0;
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y+10,11,5,0,0,TAU);ctx.fill();
  if(e.ko>0){ /* caído */
    ctx.save();ctx.translate(x,y+4);ctx.rotate(1.57);ctx.fillStyle=e.col;ctx.fillRect(-8,-6,16,14);ctx.fillStyle=e.skin;ctx.beginPath();ctx.arc(0,-12,6,0,TAU);ctx.fill();ctx.restore();return}
  const col=e===P?(P.uniform?'#2a4f93':P.col):e.col;
  /* pernas */
  const ls=mv?Math.sin(e.walk*11)*4:0;
  ctx.fillStyle=e.guard?'#1b2e57':'#d97a16';
  ctx.fillRect(x-6,y+2+(ls>0?0:-1),5,9);ctx.fillRect(x+1,y+2+(ls>0?-1:0),5,9);
  ctx.fillStyle='#222';ctx.fillRect(x-6,y+10,5,3);ctx.fillRect(x+1,y+10,5,3);
  /* corpo */
  ctx.fillStyle=col;
  ctx.beginPath();ctx.roundRect?ctx.roundRect(x-8,y-14+bob,16,18,4):ctx.rect(x-8,y-14+bob,16,18);ctx.fill();
  if(e.guard||(e===P&&P.uniform)){ctx.fillStyle='#111';ctx.fillRect(x-8,y-3+bob,16,3);ctx.fillStyle='#f0c24b';ctx.fillRect(x+2,y-10+bob,4,4)}
  else{ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(x-8,y-8+bob,16,2.5)}
  if(e.band){ctx.fillStyle=e.band;ctx.fillRect(x-9,y-13+bob,5,7);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(x-9,y-9+bob,5,1.5)}
  if(e===P&&P.gang){ctx.fillStyle=GANG[P.gang].c;ctx.fillRect(x-9,y-13+bob,5,7)}
  /* braços / soco */
  const sw=e.atk>0?1:0;
  ctx.fillStyle=e.skin||'#e8b98f';
  const fx_=Math.cos(e.face||0),fy_=Math.sin(e.face||0);
  if(sw){ctx.beginPath();ctx.arc(x+fx_*15,y-6+fy_*10+bob,4.5,0,TAU);ctx.fill()}
  /* cabeça */
  ctx.beginPath();ctx.arc(x,y-20+bob,7.5,0,TAU);ctx.fill();
  ctx.fillStyle=e.hair||'#222';ctx.beginPath();ctx.arc(x,y-22+bob,7.5,Math.PI,TAU);ctx.fill();
  if(e.guard||(e===P&&P.uniform)){ctx.fillStyle='#1c3566';ctx.fillRect(x-8,y-27+bob,16,4);ctx.fillRect(x-5+fx_*4,y-24+bob,12,2.5)}
  /* olhos na direção */
  ctx.fillStyle='#111';ctx.fillRect(x-3+fx_*2.5,y-20+bob+fy_*1.5,2,2);ctx.fillRect(x+2+fx_*2.5,y-20+bob+fy_*1.5,2,2);
  if(e.hurt>0){ctx.fillStyle='rgba(255,60,60,.45)';ctx.fillRect(x-8,y-28,16,38)}
  if(e===P){ctx.fillStyle='#ffd24a';ctx.beginPath();ctx.moveTo(x,y-33);ctx.lineTo(x-5,y-40);ctx.lineTo(x+5,y-40);ctx.closePath();ctx.fill()}
  /* barra de vida se ferido */
  if(!e.guard&&e!==P&&e.hp<e.mhp&&e.hp>0){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x-12,y-34,24,4);ctx.fillStyle='#e85a5a';ctx.fillRect(x-12,y-34,24*e.hp/e.mhp,4)}
  if(e.talk&&e.talkT>0){ctx.font='bold 12px system-ui';ctx.textAlign='center';const tw=ctx.measureText(e.talk).width+12;
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(x-tw/2,y-54,tw,18);ctx.fillStyle='#111';ctx.fillText(e.talk,x,y-41);ctx.textAlign='start'}
}
let nearAct=null;
function render(now){
  const k=DPR*Z;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0a0c10';ctx.fillRect(0,0,cv.width,cv.height);
  const vw=VW/Z,vh=VH/Z;
  let tx=P.x-vw/2,ty=P.y-vh/2+T*.5;
  const mw=W*T,mh=H*T;
  tx=vw>=mw?(mw-vw)/2:clamp(tx,0,mw-vw);ty=vh>=mh?(mh-vh)/2:clamp(ty,0,mh-vh);
  cam.x+=(tx-cam.x)*.18;cam.y+=(ty-cam.y)*.18;
  const sh=P.shake>0?(Math.random()-.5)*6:0;
  ctx.setTransform(k,0,0,k,-cam.x*k+sh,-cam.y*k+sh);
  const x0=Math.max(0,Math.floor(cam.x/T)-1),x1=Math.min(W-1,Math.ceil((cam.x+vw)/T)+1);
  const y0=Math.max(0,Math.floor(cam.y/T)-1),y1=Math.min(H-1,Math.ceil((cam.y+vh)/T)+1);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const t=grid[gi(x,y)];
    if(t===FENCE)drawFence(x,y);
    else if(t===DOOR)drawDoor(doorAt(x,y));
    else drawTile(x,y);
  }
  /* cerca cortada */
  for(const k2 in G.cut){const[cx,cy]=k2.split(',').map(Number);if(cx>=x0&&cx<=x1&&cy>=y0&&cy<=y1){
    ctx.fillStyle='#8e7954';ctx.fillRect(cx*T,cy*T,T,T);ctx.strokeStyle='rgba(205,210,220,.8)';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(cx*T,cy*T);ctx.lineTo(cx*T+8,cy*T+T*.5);ctx.moveTo(cx*T+T,cy*T);ctx.lineTo(cx*T+T-9,cy*T+T*.5);ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(cx*T+8,cy*T,T-16,T)}}
  drawDecals();
  /* túnel (marca no chão da cela) */
  if(G.tunnel>0){ctx.fillStyle='rgba(30,20,12,.55)';ctx.beginPath();ctx.ellipse(11.5*T,8.4*T,T*.55,T*.25,0,0,TAU);ctx.fill()}
  /* itens ordenados por profundidade */
  const dr=[];
  for(const o of OBJ)if(o.x+o.w>=x0&&o.x<=x1&&o.y+o.h>=y0-1&&o.y<=y1+1)dr.push({y:(o.y+o.h)*T-4,o});
  for(const n of ALL())dr.push({y:n.y,n});
  dr.push({y:P.y,n:P});
  dr.sort((a,b)=>a.y-b.y);
  for(const d of dr){if(d.o)drawObj(d.o,now);else drawPerson(d.n,now)}
  /* realce de interacção */
  if(nearAct&&nearAct.o){const o=nearAct.o;ctx.strokeStyle='rgba(255,230,120,'+(.55+.35*Math.sin(now*6))+')';ctx.lineWidth=2.5;ctx.strokeRect(o.x*T-3,o.y*T-14,o.w*T+6,o.h*T+16)}
  if(nearAct&&nearAct.n){const n=nearAct.n;ctx.strokeStyle='rgba(255,230,120,'+(.6+.35*Math.sin(now*6))+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(n.x,n.y+9,16,8,0,0,TAU);ctx.stroke()}
  /* texto flutuante */
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t-=1/60;f.y-=.5;if(f.t<=0){fx.splice(i,1);continue}
    ctx.globalAlpha=Math.min(1,f.t*2);ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(f.txt,f.x+1,f.y+1);ctx.fillStyle=f.col||'#fff';ctx.fillText(f.txt,f.x,f.y);ctx.globalAlpha=1;ctx.textAlign='start'}
  /* escuridão */
  const dA=darkness();
  if(dA>.02){
    const dw=dk.width,dh=dk.height,ks=Z*.5;
    dctx.setTransform(1,0,0,1,0,0);dctx.globalCompositeOperation='source-over';dctx.clearRect(0,0,dw,dh);
    dctx.fillStyle='rgba(3,6,20,'+dA+')';dctx.fillRect(0,0,dw,dh);
    dctx.globalCompositeOperation='destination-out';
    dctx.setTransform(ks,0,0,ks,-cam.x*ks,-cam.y*ks);
    const lamp=(x,y,r,a)=>{const g=dctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(1,'rgba(0,0,0,0)');dctx.fillStyle=g;dctx.beginPath();dctx.arc(x,y,r,0,TAU);dctx.fill()};
    lamp(P.x,P.y,T*3.3,.95);
    for(const l of LAMPS){const lx=(l[0]+.5)*T,ly=(l[1]+.5)*T;if(lx>cam.x-T*8&&lx<cam.x+vw+T*8&&ly>cam.y-T*8&&ly<cam.y+vh+T*8)lamp(lx,ly,T*5.2,.62)}
    for(const g of GUARDS){const cone=(x,y,a,len,w,al)=>{const gr=dctx.createRadialGradient(x,y,0,x,y,len);gr.addColorStop(0,'rgba(0,0,0,'+al+')');gr.addColorStop(1,'rgba(0,0,0,0)');dctx.fillStyle=gr;dctx.beginPath();dctx.moveTo(x,y);dctx.arc(x,y,len,a-w,a+w);dctx.closePath();dctx.fill()};
      cone(g.x,g.y,g.look!==undefined?g.look:g.face,T*8,.38,.9);lamp(g.x,g.y,T*1.6,.5)}
    if(beamsOn())for(const t of TOWERS){const a=beamAngle(t,GT),len=T*32,w=.1;const gr=dctx.createRadialGradient(t.x,t.y,0,t.x,t.y,len);gr.addColorStop(0,'rgba(0,0,0,.98)');gr.addColorStop(1,'rgba(0,0,0,.35)');dctx.fillStyle=gr;dctx.beginPath();dctx.moveTo(t.x,t.y);dctx.arc(t.x,t.y,len,a-w,a+w);dctx.closePath();dctx.fill()}
    ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(dk,0,0,cv.width,cv.height);
  }
  /* vinheta de perigo */
  if(P.heat>35||alarm>0){
    ctx.setTransform(1,0,0,1,0,0);
    const a=alarm>0?.28+.14*Math.sin(now*10):Math.min(.3,(P.heat-35)/200);
    const g=ctx.createRadialGradient(cv.width/2,cv.height/2,Math.min(cv.width,cv.height)*.3,cv.width/2,cv.height/2,Math.max(cv.width,cv.height)*.7);
    g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,'rgba(255,40,40,'+a+')');ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height)}
  if(P.hurt>0){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(255,0,0,'+P.hurt+')';ctx.fillRect(0,0,cv.width,cv.height)}
}

/* ================= SISTEMAS ================= */
P.int=0;
const mc=n=>Math.round(n)+' mç';
const invCount=()=>Object.values(P.inv).reduce((a,b)=>a+b,0);
function addItem(id,n,to){const t=to||P.inv;t[id]=(t[id]||0)+(n||1)}
function takeItem(id,n,from){const t=from||P.inv;if((t[id]||0)<(n||1))return false;t[id]-=(n||1);if(t[id]<=0)delete t[id];return true}
function say(n,m,t){n.talk=m;n.talkT=t||2.6}

/* ---------- relógio ---------- */
let lastEvt=S.t;
function stepClock(dm,sim){
  let rem=dm;
  while(rem>0){
    const c=Math.min(rem,5);rem-=c;
    const before=S.t;S.t+=c;
    /* decaimento */
    const slp=P.sleeping;if(slp)P.sleepLeft-=c;
    P.food=Math.max(0,P.food-(slp?.025:.055)*c);
    if(slp)P.en=Math.min(100,P.en+.13*c);else P.en=Math.max(0,P.en-.028*c);
    if(P.food<=0)P.hp=Math.max(1,P.hp-.12*c);
    else if(P.food>45&&!G.over)P.hp=Math.min(100,P.hp+.03*c*(slp?3:1));
    if(S.t>=1440){S.t-=1440;S.day++;newDay()}
    evts(before,S.t<before?S.t+1440:S.t);
  }
}
function crossed(a,b,m){return(a<m&&b>=m)||(a<m+1440&&b>=m+1440)}
function evts(a,b){
  const E=(m,f)=>{if(crossed(a,b,m))f()};
  E(390,()=>{updateDoors();banner('Acordar! As celas abriram.','#9fd3ff');G.mealT={}});
  E(420,()=>{if(!G.solitary){banner('CHAMADA! Volta à tua cela.','#ffd36b',3200);sfx('alarm')}updateDoors()});
  E(450,()=>{updateDoors();if(G.solitary)return;
    if(zoneAt(P.x,P.y)!=='cela2'&&!P.sleeping){G.chamadaOk=false;G.sentence+=1;P.heat=Math.min(100,P.heat+30);banner('Faltaste à chamada! +1 dia de pena.','#ff7b7b',3500)}
    else banner('Chamada concluída.','#9fe3a0')});
  E(480,()=>{if(!G.solitary&&hh()<12)toast('Horário de trabalho. Fala com o Sr. Mateus na secretaria (corredor).',3500)});
  E(720,()=>{G.workOk=!!(P.job&&P.tasks>=2);if(P.job&&!G.workOk&&!G.solitary)toast('Não cumpriste o trabalho da manhã.');if(G.workOk)toast('Trabalho cumprido: conta para a pena.');P.tasks=0});
  E(780,()=>{updateDoors();if(!G.solitary)banner('Tempo livre: o pátio abriu.','#9fe3a0',2800)});
  E(930,()=>{if(!G.solitary&&Math.random()<(P.gang?.34:.18))rivalAttack()});
  E(1110,()=>{updateDoors();});
  E(1155,()=>{if(!G.solitary)toast('A cantina fecha às 21:00. Volta à cela antes das 21:00.',3000)});
  E(1260,()=>{updateDoors();if(!G.solitary)banner('RECOLHER! Vai para a tua cela.','#ff9f6b',3200)});
  [1410,90,210].forEach(m=>E(m,()=>ronda()));
  if(Math.floor(a/60)!==Math.floor(b/60))hourHook();
}
function hourHook(){updateDoors();saveGame()}
function newDay(){
  G.stats.days++;
  const good=G.chamadaOk&&G.workOk&&!G.solDay;
  G.sentence-=good?2:1;
  if(P.gang){P.money+=8;toast('O teu bando mandou-te 8 mç.')}
  G.chamadaOk=true;G.workOk=false;G.solDay=false;G.famCall=false;
  P.heat=Math.max(0,P.heat-20);
  if(G.sentence<=0&&!G.over)endGame('legal');
}
function rivalAttack(){
  const enemy=P.gang==='corvos'?'serpentes':P.gang==='serpentes'?'corvos':pick(['corvos','serpentes']);
  const pool=NPC.filter(n=>n.gang===enemy&&!n.leader&&!n.ko);
  if(!pool.length||P.sleeping)return;
  if(zoneAt(P.x,P.y)!=='patio')return;
  pool.sort(()=>Math.random()-.5).slice(0,2).forEach(n=>{n.aggro=22;setPath(n,Math.floor(P.x/T),Math.floor(P.y/T))});
  banner('Os '+GANG[enemy].n+' vêm atrás de ti!','#ff7b7b',3000);sfx('bad');
}
let rondaT=0;
function ronda(){
  if(G.solitary)return;
  rondaT=9;
  banner('RONDA NOS CORREDORES…','#ffd36b',2600);
  if(G.tunnel>25&&Math.random()<.3+G.tunnel/300){
    G.tunnel=Math.max(0,G.tunnel-22);
    if(takeItem('colher',1)||takeItem('colher',1,P.stash)){}
    G.sentence+=2;G.flags.found=true;
    banner('Os guardas encontraram o buraco! Perdeste a colher e parte do túnel. +2 dias.','#ff7b7b',4800);sfx('bad');
  }
}
function advance(min){
  /* avança o tempo sem simular entidades */
  stepClock(min);updateDoors();snapNPCs();
}
function snapNPCs(){
  const h=hh(),sc=sched(h);
  NPC.forEach(n=>{
    if(n.fixed||n.aggro>0)return;
    const z=planZone(n,h,sc);if(!z)return;
    const s=nspot(n,z);n.x=(s[0]+.5)*T;n.y=(s[1]+.5)*T;n.path=[];n.nextT=rnd(1,6);
  });
  GUARDS.forEach(g=>{
    if(g.fixed){if(g.state==='chase')g.state='patrol';return}
    g.state='patrol';const rt=guardRoute(g,h,sc);g.curRoute=rt;g.route=ri(0,rt.length-1);
    const s=rt[g.route];g.x=(s[0]+.5)*T;g.y=(s[1]+.5)*T;g.path=[];
  });
}

/* ---------- fade ---------- */
function fade(fn,ms){
  const f=$('#fade');f.classList.add('on');
  setTimeout(()=>{fn&&fn();setTimeout(()=>f.classList.remove('on'),ms||400)},520);
}

/* ---------- capturado, KO, fim ---------- */
function arrest(g,silent){
  if(G.over||G.arresting)return;
  G.arresting=true;G.paused=true;P.busy=null;
  sfx('alarm');
  banner('APANHADO!','#ff4d4d',2200);
  fade(()=>{
    alarm=0;P.heat=0;P.crime=0;P.sleeping=false;S.speed=1;
    const c=contraband();const ks=Object.keys(c);
    ks.forEach(k=>delete P.inv[k]);P.uniform=false;
    P.money=Math.floor(P.money*.85);P.hp=Math.max(20,P.hp-12);
    G.sentence+=2;G.stats.solitary++;G.solitary=true;G.solDay=true;
    /* revistam a cela? */
    if(G.tunnel>0){G.tunnel=Math.max(0,G.tunnel-30);takeItem('colher',1,P.stash)}
    for(const k in P.stash)if(ITEMS[k].contra&&Math.random()<.5)delete P.stash[k];
    const s=Math.random()<.5?[55,7]:[59,7];P.x=(s[0]+.5)*T;P.y=(s[1]+.5)*T;
    GUARDS.forEach(gg=>{gg.state='patrol';gg.path=[]});
    advance(720);
    G.solitary=false;
    P.food=Math.max(P.food,40);
    P.x=11.5*T;P.y=8.5*T;
    snapNPCs();G.arresting=false;G.paused=false;
    banner('Passaste 12 horas na solitária. +2 dias de pena'+(ks.length?' e perdeste '+ks.length+' tipo(s) de contrabando.':'.'),'#ffb04d',5200);
    saveGame();
  });
}
function knockout(){
  if(G.arresting||G.over)return;
  G.arresting=true;G.paused=true;P.busy=null;P.sleeping=false;S.speed=1;
  fade(()=>{
    NPC.forEach(n=>{if(n.aggro>0)n.aggro=0});
    P.hp=45;P.money=Math.floor(P.money*.85);alarm=0;
    const ks=Object.keys(P.inv).filter(k=>ITEMS[k].contra);
    if(ks.length&&Math.random()<.5){const k=pick(ks);takeItem(k,1);toast('Alguém te roubou: '+ITEMS[k].n)}
    P.x=48.5*T;P.y=8.5*T;
    advance(180);snapNPCs();
    G.arresting=false;G.paused=false;
    banner('Acordaste na enfermaria. Perdeste dinheiro.','#9fd3ff',3600);
  });
}
function endGame(kind){
  if(G.over)return;G.over=true;G.paused=true;
  localStorage.removeItem('pm_v1');
  const T_={legal:['Liberdade!','Cumpriste a pena com bom comportamento e saíste pela porta da frente.'],
    portao:['Fugiste pelo portão!','Com a chave e o disfarce, o guarda abriu-te o portão. Ninguém desconfiou… por agora.'],
    cerca:['Fugiste pela cerca!','Cortaste a rede de noite e desapareceste na escuridão.'],
    tunel:['Fugiste pelo túnel!','Cada noite, uma colher de terra. Esta noite, a liberdade.']}[kind];
  $('#endT').textContent=T_[0];$('#endP').textContent=T_[1];
  $('#endS').innerHTML='Dia '+S.day+' · Respeito '+Math.round(P.rep)+' · Força '+P.str.toFixed(1)+' · Solitárias '+G.stats.solitary+' · Combates '+G.stats.fights;
  $('#end').classList.add('on');
  sfx('ok');
}

/* ---------- combate ---------- */
function attack(){
  if(P.cd>0||P.busy||P.sleeping||G.paused)return;
  P.cd=.42;P.atk=.2;P.en=Math.max(0,P.en-1.2);sfx('punch');
  let hit=false;
  for(const n of ALL()){
    if(n.ko>0||n.fixed&&!n.guard&&!n.isShop)continue;
    const dx=n.x-P.x,dy=n.y-P.y,d=Math.hypot(dx,dy);
    if(d>1.3*T)continue;
    let a=Math.atan2(dy,dx)-P.face;while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;
    if(Math.abs(a)>1.05)continue;
    hit=true;
    const dmg=(6+P.str*.95+(P.inv.faca?7:0))*rnd(.8,1.2)*(P.en<10?.6:1);
    n.hp-=dmg;n.hurt=.2;n.x+=Math.cos(P.face)*6;n.y+=Math.sin(P.face)*6;
    fx.push({x:n.x,y:n.y-T,t:.7,txt:Math.round(dmg),col:'#ffe08a'});
    P.crime=Math.max(P.crime,5);G.stats.fights++;
    if(n.guard){
      n.state='chase';n.lost=0;raiseAlarm(n);P.heat=100;
      if(n.hp<=0){n.ko=25;n.hp=n.mhp*.5;n.state='patrol';banner('Deitaste um guarda abaixo!','#ffb04d')}
    }else{
      if(n.gang&&n.gang===P.gang&&!n.leader){n.aggro=0;say(n,'Ei! Somos do mesmo bando!');n.hp+=dmg}
      else{n.aggro=18;P.rep+=.05}
      if(n.hp<=0){n.ko=45;n.aggro=0;P.rep+=1.5;banner(n.name+' está KO','#ffe08a',1400);missionHook('ko',n)}
    }
  }
  if(!hit)P.crime=Math.max(P.crime,0);
}

/* ---------- missões ---------- */
const FETCH=[['pao',2],['remedio',1],['colher',1],['proteina',1],['refeicao',2]];
function newMission(giver){
  if(G.missions.filter(m=>m.state!=='done').length>=3){toast('Já tens 3 missões abertas.');return}
  const t=pick(['fetch','fetch','beat','deliver']);
  const id=Date.now()+Math.random();
  if(t==='fetch'){const f=pick(FETCH);G.missions.push({id,type:'fetch',giver:giver.name,item:f[0],qty:f[1],reward:ri(25,50),rep:2,state:'open',title:'Traz '+f[1]+'× '+ITEMS[f[0]].n+' ao '+giver.name})}
  else if(t==='beat'){const pool=NPC.filter(n=>!n.fixed&&!n.leader&&n.gang!==giver.gang&&n!==giver);const tg=pick(pool);G.missions.push({id,type:'beat',giver:giver.name,target:tg.name,reward:ri(35,60),rep:3,state:'open',title:'Dá uma lição ao '+tg.name+' (deixa-o KO)'})}
  else{const pool=NPC.filter(n=>!n.fixed&&n!==giver);const tg=pick(pool);addItem('bilhete',1);G.missions.push({id,type:'deliver',giver:giver.name,target:tg.name,reward:ri(20,40),rep:1.5,state:'open',title:'Entrega o bilhete ao '+tg.name+', depois volta ao '+giver.name})}
  sfx('ok');toast('Nova missão: '+G.missions[G.missions.length-1].title,3600);
}
function missionHook(kind,n){
  G.missions.forEach(m=>{
    if(m.state!=='open')return;
    if(m.type==='beat'&&kind==='ko'&&n.name===m.target){m.state='ready';toast('Missão cumprida. Volta ao '+m.giver+'.')}
    if(m.type==='deliver'&&kind==='talk'&&n.name===m.target&&P.inv.bilhete){takeItem('bilhete');m.state='ready';toast('Bilhete entregue. Volta ao '+m.giver+'.')}
  });
}
function missionTurnIn(giver){
  let any=false;
  G.missions.forEach(m=>{
    if(m.giver!==giver.name||m.state==='done')return;
    if(m.type==='fetch'&&m.state==='open'&&(P.inv[m.item]||0)>=m.qty){takeItem(m.item,m.qty);m.state='ready'}
    if(m.state==='ready'){m.state='done';P.money+=m.reward;P.rep+=m.rep;any=true;toast('Missão concluída: +'+m.reward+' mç, +'+m.rep+' respeito',3400);sfx('coin');
      if(giver.gang&&P.gang===giver.gang)G.gangRep[giver.gang]+=1}
  });
  return any;
}

/* ---------- minijogo de tempo ---------- */
let TM=null;
function timing(o){
  /* o: {title,sub,zone,speed,rounds,onEnd(successes)} */
  G.paused=true;
  TM={o,i:0,ok:0,pos:0,dir:1,speed:o.speed||1.1,zone:o.zone||.22,cx:rnd(.25,.75),res:''};
  $('#tmT').textContent=o.title;$('#tmS').textContent=o.sub||'Prime PARAR quando o marcador estiver na zona verde.';
  $('#tm').classList.add('on');drawTM();
}
function tmStop(){
  if(!TM)return;
  const hit=Math.abs(TM.pos-TM.cx)<=TM.zone/2;
  TM.i++;if(hit){TM.ok++;sfx('ok')}else sfx('bad');
  TM.res=hit?'Boa!':'Falhou';
  TM.cx=rnd(.2,.8);TM.speed*=1.12;
  $('#tmR').textContent=TM.res+'  ('+TM.ok+'/'+TM.i+' de '+TM.o.rounds+')';
  if(TM.i>=TM.o.rounds){
    const o=TM.o,ok=TM.ok;TM=null;
    $('#tm').classList.remove('on');G.paused=false;o.onEnd(ok);
  }
}
function tmUpdate(dt){
  if(!TM)return;
  TM.pos+=TM.dir*TM.speed*dt;
  if(TM.pos>1){TM.pos=1;TM.dir=-1}if(TM.pos<0){TM.pos=0;TM.dir=1}
  drawTM();
}
function drawTM(){
  if(!TM)return;
  const c=$('#tmc'),x=c.getContext('2d'),w=c.width,h=c.height;
  x.clearRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(0,h/2-14,w,28);
  x.fillStyle='#41c26e';x.fillRect((TM.cx-TM.zone/2)*w,h/2-14,TM.zone*w,28);
  x.fillStyle='#fff';x.fillRect(TM.pos*w-3,h/2-22,6,44);
}

/* ---------- acções com tempo real (cavar / cortar / portão) ---------- */
function startBusy(type,dur,label){
  P.busy={type,t:0,dur,label};
  $('#prog').classList.add('on');$('#progT').textContent=label;
}
function cancelBusy(msg){
  if(!P.busy)return;P.busy=null;$('#prog').classList.remove('on');if(msg)toast(msg)}
function busyTick(dt){
  const b=P.busy;if(!b)return;
  b.t+=dt;$('#progB').style.width=Math.min(100,b.t/b.dur*100)+'%';
  if(b.type==='dig'){P.crime=0;if(Math.random()<dt*3)sfx('dig');if(rondaT>0){const g=GUARDS.find(x=>!x.sec&&!x.gate)||GUARDS[0];P.busy=null;$('#prog').classList.remove('on');arrest(g);return}}
  if(b.type==='cut'){P.crime=Math.max(P.crime,1.2);if(Math.random()<dt*4)sfx('dig')}
  if(b.type==='gate'){P.crime=0}
  if(b.t>=b.dur){
    P.busy=null;$('#prog').classList.remove('on');
    if(b.type==='dig'){
      G.tunnel=Math.min(100,G.tunnel+9);advance(25);P.en=Math.max(0,P.en-4);
      toast('Cavaste. Túnel: '+Math.round(G.tunnel)+'%',1800);
      if(G.tunnel>=100)endGame('tunel');
    }else if(b.type==='cut'){
      const tx=b.tx,ty=b.ty;G.cut[tx+','+ty]=true;grid[gi(tx,ty)]=CUT;P.heat=Math.min(100,P.heat+20);
      banner('Cerca cortada! Corre para sul!','#9fe3a0',3000);sfx('ok');
    }else if(b.type==='gate'){endGame('portao')}
  }
}

/* ---------- interacção ---------- */
function nearestAct(){
  let best=null,bd=1e9;
  for(const n of ALL()){
    if(n.ko>0){const d=dist(P.x,P.y,n.x,n.y);if(d<1.2*T&&d<bd){bd=d;best={n,label:'Revistar '+n.name,kind:'loot'}}continue}
    if(!n.talkable&&!n.guard)continue;
    if(n.aggro>0)continue;
    const d=dist(P.x,P.y,n.x,n.y);
    if(d>1.45*T)continue;
    if(n.guard){
      if(n.sec){if(d<bd){bd=d;best={n,label:'Falar com o Sr. Mateus',kind:'talk'}}continue}
      /* furtar por trás */
      let a=Math.atan2(P.y-n.y,P.x-n.x)-n.face;while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;
      if(Math.abs(a)>2.0&&d<1.25*T&&!G.pick){if(d<bd){bd=d;best={n,label:'Furtar chave (arriscado)',kind:'pick'}}}
      continue;
    }
    if(d-10<bd){bd=d-10;best={n,label:'Falar com '+n.name,kind:'talk'}}
  }
  for(const o of OBJ){
    if(!o.act)continue;
    const x1=o.x*T,y1=o.y*T,x2=(o.x+o.w)*T,y2=(o.y+o.h)*T;
    const dx=Math.max(x1-P.x,0,P.x-x2),dy=Math.max(y1-P.y,0,P.y-y2),d=Math.hypot(dx,dy);
    if(d<.95*T&&d<bd){bd=d;best={o,label:o.label||'Usar',kind:'obj'}}
  }
  /* cerca e portão */
  const tx=Math.floor(P.x/T),ty=Math.floor(P.y/T);
  if(ty>=40&&tx>=3&&tx<=60&&grid[gi(tx,41)]===FENCE){best={fence:true,tx,ty:41,label:P.inv.alicate?'Cortar a cerca':'Cerca de arame',kind:'fence'};bd=0}
  if(tx>=60&&ty===13){best={gate:true,label:'Portão principal',kind:'gate'};bd=0}
  return best;
}
function doAct(a){
  if(!a||G.paused||P.busy||P.sleeping)return;
  if(a.kind==='talk')return talk(a.n);
  if(a.kind==='loot'){
    P.crime=Math.max(P.crime,3);
    const n=a.n;
    if(n.guard){
      if(!n.looted){n.looted=true;if(Math.random()<.6){addItem('chave',1);banner('Encontraste uma chave no guarda!','#ffe08a')}else toast('Nada de útil.')}else toast('Já revistaste este guarda.');
      return}
    if(n.looted){toast('Já não tem nada.');return}
    n.looted=true;const g=ri(6,26);P.money+=g;fx.push({x:P.x,y:P.y-T,t:1,txt:'+'+g+' mç',col:'#ffe08a'});sfx('coin');
    if(Math.random()<.3){const k=pick(['pao','remedio','colher']);addItem(k,1);toast('Encontraste: '+ITEMS[k].n)}
    return}
  if(a.kind==='pick'){
    G.pick=true;setTimeout(()=>G.pick=false,25000);
    timing({title:'Furtar a chave do guarda',sub:'Zona estreita. Falha e o guarda apanha-te.',zone:.12,speed:1.25,rounds:2,onEnd(ok){
      if(ok>=2){addItem('chave',1);banner('Chave roubada!','#ffe08a');sfx('ok')}
      else{P.heat=100;P.crime=6;banner('O guarda deu pelo furto!','#ff7b7b');a.n.state='chase';raiseAlarm(a.n)}}});
    return}
  if(a.kind==='fence'){
    if(!P.inv.alicate){toast('Precisas de um alicate. Compra na cantina ao Zé.');return}
    if(!(hh()>=21||hh()<5.5)&&true)toast('É de dia: vai ser visto. Melhor à noite.');
    startBusy('cut',Math.max(2.5,6-P.int*.5)*((P.inv.mapa&&a.tx>=26&&a.tx<=36)?.5:1),(P.inv.mapa&&a.tx>=26&&a.tx<=36)?'A cortar no ponto fraco…':'A cortar a cerca…');P.busy.tx=a.tx;P.busy.ty=a.ty;return}
  if(a.kind==='gate'){
    if(!P.inv.chave){toast('O portão está trancado. Precisas da chave.');return}
    if(!P.uniform)toast('Sem uniforme os guardas vão desconfiar!');
    startBusy('gate',3,'A abrir o portão…');return}
  if(a.kind==='obj')return objAct(a.o);
}
function mealSlot(){const sc=sched(hh());return sc==='cafe'||sc==='almoco'||sc==='jantar'?sc:null}
function objAct(o){
  const act=o.act,h=hh(),sc=sched(h);
  if(act==='cama')return bedPanel();
  if(act==='retrete'){toast('Pois… é a vida na prisão.');return}
  if(act==='lavatorio'){P.hp=Math.min(100,P.hp+1);toast('Lavaste a cara. Melhor.');return}
  if(act==='bandeja'){
    const s=mealSlot();
    if(!s){toast('O refeitório só serve às refeições (7:30, 12:00, 18:00).');return}
    G.mealT=G.mealT||{};if(G.mealT[s]===S.day){toast('Já comeste nesta refeição.');return}
    G.mealT[s]=S.day;P.food=Math.min(100,P.food+38);P.hp=Math.min(100,P.hp+3);toast('Comeste a refeição da prisão. Fome +38');sfx('ok');return}
  if(act==='telefone'){
    if(P.money<5){toast('Precisas de 5 mç para telefonar.');return}
    if(G.famCall){toast('Já falaste hoje com a família.');return}
    P.money-=5;G.famCall=true;const g=ri(10,25);P.money+=g;banner('A tua família mandou '+g+' mç!','#ffe08a');sfx('coin');return}
  if(act==='secretaria')return jobPanel();
  if(act==='cantina'){const z=NPC.find(n=>n.isShop);return talk(z)}
  if(act==='ler'){
    if(P.en<15){toast('Estás cansado demais para ler.');return}
    P.en-=10;P.int+=.5;advance(60);P.rep+=.2;toast('Estudaste uma hora. Inteligência '+P.int.toFixed(1));return}
  if(act==='pesos'||act==='saco'||act==='barra'){
    if(P.en<25||P.food<12){toast(P.en<25?'Sem energia para treinar.':'Estás com demasiada fome.');return}
    const g=act==='pesos'?.55:act==='saco'?.35:.4;
    P.en-=22;P.food-=7;P.str+=g;advance(45);P.rep+=.1;fx.push({x:P.x,y:P.y-T,t:1.1,txt:'Força +'+g,col:'#9fe3a0'});sfx('ok');return}
  if(act.startsWith('trab_'))return workAct(act);
  if(act==='cesto'){
    if(!(sc==='trabalho'&&P.job==='lavandaria')){toast('Só consegues mexer nisto enquanto trabalhas na lavandaria.');return}
    if(P.inv.uniforme){toast('Já tens um uniforme.');return}
    timing({title:'Roubar um uniforme',sub:'Zona estreita.',zone:.14,speed:1.2,rounds:2,onEnd(ok){
      if(ok>=2){addItem('uniforme',1);banner('Uniforme de guarda roubado!','#ffe08a');sfx('ok')}else{P.heat=Math.min(100,P.heat+50);P.crime=4;toast('Quase te viram!')}}});return}
  if(act==='despensa'){
    if(!(sc==='trabalho'&&P.job==='cozinha')){toast('Só consegues entrar na despensa quando trabalhas na cozinha.');return}
    timing({title:'Assaltar a despensa',sub:'Rápido e silencioso.',zone:.15,speed:1.2,rounds:2,onEnd(ok){
      if(ok>=2){const k=pick(['colher','colher','faca','pao','pao','remedio']);addItem(k,1);banner('Roubaste: '+ITEMS[k].n,'#ffe08a');sfx('ok')}else{P.heat=Math.min(100,P.heat+50);P.crime=4;toast('Quase te apanharam!')}}});return}
}
function workAct(act){
  const sc=sched(hh());
  const jn=Object.keys(JOBS).find(k=>JOBS[k].act===act);
  if(sc!=='trabalho'){toast('Só se trabalha das 08:00 às 12:00.');return}
  if(P.job!==jn){toast(P.job?'O teu emprego é: '+JOBS[P.job].n+'.':'Pede trabalho ao Sr. Mateus (secretaria no corredor).');return}
  if(P.en<10){toast('Estás exausto.');return}
  if(P.tasks>=6){toast('Já fizeste o suficiente por hoje. O chefe manda-te descansar.');return}
  const J=JOBS[jn];
  timing({title:J.n,sub:'3 rondas. Acerta na zona verde para concluir a tarefa.',zone:.28-Math.min(.1,0)+P.int*.01,speed:1.0,rounds:3,onEnd(ok){
    P.en=Math.max(0,P.en-6);advance(20);
    if(ok>=2){const pay=J.pay+Math.floor(P.str*.0);P.money+=pay;P.tasks++;G.stats.jobs++;P.rep+=.1;fx.push({x:P.x,y:P.y-T,t:1.1,txt:'+'+pay+' mç',col:'#ffe08a'});sfx('coin')}
    else toast('Trabalho mal feito. Sem pagamento.')}});
}

/* ---------- diálogos ---------- */
const LINES=['Aqui dentro, quem manda é o tempo.','Cuidado com o Matoso: ele vê tudo.','Leva maços para a cantina, o Zé tem de tudo.','Dizem que a rede ao fundo do pátio está fraca… à noite.','Uma colher chega para um túnel. Paciência é o que falta.','Não corras no corredor. Os guardas reparam.','Quem treina no pátio ganha respeito.','Os Corvos e as Serpentes nunca fazem as pazes.','O uniforme da lavandaria? Eu não te disse nada.','As rondas da noite são às 23:30, 01:30 e 03:30.'];
function talk(n){
  if(!n)return;
  if(n.isShop)return shopPanel(n);
  if(n.isDoc)return docPanel(n);
  if(n.sec)return jobPanel();
  missionHook('talk',n);
  const b=[];
  const turned=missionTurnIn(n);
  b.push({t:'Conversar',f:()=>{say(n,pick(LINES));P.rep+=.05;closePanel()}});
  if(n.isZeca||n.leader)b.push({t:'Pedir uma missão',f:()=>{newMission(n);closePanel()}});
  if(n.isZeca)b.push({t:'Dicas para fugir',f:()=>{closePanel();zecaTips()}});
  if(n.leader&&!P.gang)b.push({t:'Juntar-me aos '+GANG[n.gang].n+' (respeito ≥ 4)',dis:P.rep<4,f:()=>{P.gang=n.gang;P.rep+=1;banner('Agora és dos '+GANG[n.gang].n+'.','#ffe08a');closePanel()}});
  if(n.leader&&P.gang===n.gang)b.push({t:'Sou dos teus (já estás no bando)',dis:true,f:()=>{}});
  b.push({t:'Provocar (lutar)',f:()=>{if(n.gang&&n.gang===P.gang){toast('É do teu bando.');closePanel();return}n.aggro=20;closePanel();banner('Luta!','#ff7b7b',1000)}});
  b.push({t:'Despedir-me',f:closePanel});
  openPanel(n.name+(n.gang?' · '+GANG[n.gang].n:''),turned?'<p>Missão entregue. Respeito e dinheiro recebidos.</p>':'<p>'+(n.leader?'Chefe do bando '+GANG[n.gang].n+'.':n.isZeca?'O teu colega de cela. Conhece a prisão como as palmas das mãos.':'Preso.')+'</p>',b);
}
function zecaTips(){
  openPanel('Zeca: três maneiras de sair',
   '<p><b>Túnel:</b> compra ou rouba uma <i>colher afiada</i>. À noite (22:00 às 05:00) escava na tua cama. Para quando o aviso de ronda aparecer!</p>'+
   '<p><b>Cerca:</b> compra um <i>alicate</i> na cantina. À noite, no fundo do pátio, corta a cerca sem a luz das torres te apanhar. O pátio fica trancado depois das 18:30, por isso tens de te esconder lá.</p>'+
   '<p><b>Portão:</b> arranja a <i>chave</i> (compra ou furta a um guarda) e um <i>uniforme</i> (rouba na lavandaria). Equipa o uniforme no inventário e abre o portão do posto.</p>'+
   '<p>Ou cumpre a pena: bom comportamento corta 2 dias por dia.</p>',[{t:'Obrigado',f:closePanel}]);
}
function docPanel(n){
  const cost=P.hp<35?0:20;
  openPanel('Dra. Luzia · Enfermaria','<p>Vida: '+Math.round(P.hp)+'/100.</p>',[
    {t:'Tratar ferimentos ('+(cost?mc(cost):'grátis')+')',dis:P.hp>=95||P.money<cost,f:()=>{P.money-=cost;P.hp=100;toast('Estás tratado.');sfx('ok');closePanel()}},
    {t:'Sair',f:closePanel}]);
}
function shopOpen(){const h=hh();return h>=13&&h<21}
function shopPanel(n){
  if(!shopOpen()){openPanel('Zé da Cantina','<p>A cantina só abre das 13:00 às 21:00.</p>',[{t:'Sair',f:closePanel}]);return}
  const disc=Math.min(.25,P.rep*.012)+(P.gang?.08:0);
  const price=k=>Math.max(1,Math.round(ITEMS[k].buy*(1-disc)));
  const b=[];
  SHOP.forEach(k=>b.push({t:ITEMS[k].n+' — '+mc(price(k)),dis:P.money<price(k),f:()=>{P.money-=price(k);addItem(k);sfx('coin');shopPanel(n)}}));
  Object.keys(P.inv).forEach(k=>{if(ITEMS[k].sell>0)b.push({t:'Vender '+ITEMS[k].n+' (x'+P.inv[k]+') — '+mc(ITEMS[k].sell),f:()=>{takeItem(k);P.money+=ITEMS[k].sell;sfx('coin');shopPanel(n)}})});
  b.push({t:'Sair',f:closePanel});
  openPanel('Zé da Cantina','<p>Tens '+mc(P.money)+'.'+(disc>0?' Desconto: '+Math.round(disc*100)+'%.':'')+'</p><p class="sm">Contrabando (colher, alicate, faca, chave…) é arriscado de trazer ao bolso. Esconde-o debaixo da cama.</p>',b);
}
function jobPanel(){
  const b=Object.keys(JOBS).map(k=>({t:JOBS[k].n+' — '+mc(JOBS[k].pay)+'/tarefa'+(P.job===k?' (atual)':''),dis:P.job===k,f:()=>{P.job=k;toast('Emprego: '+JOBS[k].n);closePanel()}}));
  if(P.job)b.push({t:'Deixar o emprego',f:()=>{P.job=null;closePanel()}});
  b.push({t:'Sair',f:closePanel});
  openPanel('Sr. Mateus · Secretaria','<p>Pena restante: <b>'+Math.max(0,Math.round(G.sentence))+' dias</b>. Quem trabalha de manhã e vai à chamada vê a pena reduzida em 2 dias por dia.</p>',b);
}
function bedPanel(){
  const h=hh(),night=(h>=21||h<6.5),sc=sched(h);
  const b=[];
  b.push({t:night?'Dormir até de manhã':'Dormir a sesta (2 h)',dis:!night&&P.en>75,f:()=>{closePanel();sleep(night)}});
  b.push({t:'Esconderijo debaixo da cama',f:()=>stashPanel()});
  const dnight=(h>=22||h<5);
  b.push({t:'Cavar o túnel ('+Math.round(G.tunnel)+'%)'+(P.inv.colher?'':' — precisas de colher'),dis:!P.inv.colher||!dnight||zoneAt(P.x,P.y)!=='cela2'||P.en<8,f:()=>{closePanel();startBusy('dig',5.5,'A cavar o túnel…')}});
  b.push({t:'Fechar',f:closePanel});
  openPanel('A tua cama','<p>Energia '+Math.round(P.en)+'. Dormir só dá energia à noite ou quando estás cansado.'+(dnight?'':' O túnel só se cava das 22:00 às 05:00.')+'</p>',b);
}
function stashPanel(){
  const b=[];
  Object.keys(P.inv).forEach(k=>b.push({t:'Esconder '+ITEMS[k].n+' (x'+P.inv[k]+')',f:()=>{takeItem(k);addItem(k,1,P.stash);if(k==='uniforme')P.uniform=false;stashPanel()}}));
  Object.keys(P.stash).forEach(k=>b.push({t:'Pegar '+ITEMS[k].n+' (x'+P.stash[k]+')',f:()=>{takeItem(k,1,P.stash);addItem(k);stashPanel()}}));
  b.push({t:'Voltar',f:bedPanel});
  openPanel('Esconderijo','<p>O que está aqui não é encontrado nas revistas aos bolsos. Mas se te apanharem, podem revistar a cela.</p>',b);
}
function sleep(night){
  P.sleeping=true;P.nap=!night;P.sleepLeft=night?(S.t>=21*60?(1440-S.t)+390:Math.max(10,390-S.t)):120;
  S.speed=16;$('#sleepB').classList.add('on');
}
function wake(msg){
  if(!P.sleeping)return;
  P.sleeping=false;S.speed=1;$('#sleepB').classList.remove('on');
  snapNPCs();updateDoors();
  if(msg)toast(msg);
}

/* ================= PAINÉIS ================= */
let panelOpen=false;
function openPanel(title,html,btns){
  panelOpen=true;G.paused=true;
  $('#pT').textContent=title;$('#pB').innerHTML=html||'';
  const bx=$('#pBtn');bx.innerHTML='';
  (btns||[]).forEach(b=>{const e=document.createElement('button');e.className='pb'+(b.dis?' dis':'');e.textContent=b.t;
    if(!b.dis)e.addEventListener('click',()=>{audioInit();sfx('tick');b.f()});bx.appendChild(e)});
  $('#panel').classList.add('on');$('#pBox').scrollTop=0;
}
function closePanel(){panelOpen=false;if(!G.arresting&&!TM)G.paused=false;$('#panel').classList.remove('on')}

function useItem(k){
  const it=ITEMS[k];
  if(it.food){P.food=Math.min(100,P.food+it.food);takeItem(k);toast(it.n+': fome +'+it.food);sfx('ok')}
  else if(it.heal){P.hp=Math.min(100,P.hp+it.heal);takeItem(k);toast('Vida +'+it.heal);sfx('ok')}
  else if(it.str){P.str+=it.str;takeItem(k);toast('Força +'+it.str);sfx('ok')}
  else if(it.wear){P.uniform=!P.uniform;toast(P.uniform?'Uniforme equipado. Os guardas só reparam de muito perto.':'Uniforme retirado.')}
  else if(it.phone){if(G.fam2===S.day){toast('Já usaste hoje.')}else{G.fam2=S.day;const g=ri(15,35);P.money+=g;P.heat=Math.min(100,P.heat+12);banner('A família mandou '+g+' mç.','#ffe08a');sfx('coin')}}
  else toast(it.desc||'Sem uso direto.');
}
function invPanel(){
  const ks=Object.keys(P.inv);const b=[];
  ks.forEach(k=>{const it=ITEMS[k];
    const lbl=it.food||it.heal||it.str?'Usar':it.wear?(P.uniform?'Tirar':'Vestir'):'Ver';
    b.push({t:it.n+' x'+P.inv[k]+' · '+lbl+(it.contra?' (contrabando)':''),f:()=>{useItem(k);invPanel()}});
    if(k!=='bilhete')b.push({t:'   Largar '+it.n,f:()=>{takeItem(k);if(k==='uniforme')P.uniform=false;invPanel()}});
  });
  b.push({t:'Voltar ao menu',f:menuPanel});
  openPanel('Inventário','<p>'+(ks.length?'Contrabando no bolso pode ser confiscado numa revista. Esconde-o debaixo da cama.':'Os teus bolsos estão vazios.')+'</p>',b);
}
function missionPanel(){
  const act=G.missions.filter(m=>m.state!=='done');
  const h=act.length?act.map(m=>'<p>• '+m.title+' <span class="sm">['+(m.state==='ready'?'pronta: volta ao '+m.giver:'em curso')+' · '+m.reward+' mç]</span></p>').join(''):'<p>Sem missões. Fala com o Zeca ou com os chefes dos bandos.</p>';
  openPanel('Missões',h,[{t:'Voltar ao menu',f:menuPanel}]);
}
function statusPanel(){
  const s=G.sentence;
  openPanel('Estado',
   '<p><b>Dia '+S.day+'</b> · Pena restante: <b>'+Math.max(0,Math.round(s))+' dias</b></p>'+
   '<p>Vida '+Math.round(P.hp)+' · Energia '+Math.round(P.en)+' · Fome '+Math.round(100-P.food)+'%</p>'+
   '<p>Força '+P.str.toFixed(1)+' · Inteligência '+P.int.toFixed(1)+' · Respeito '+Math.round(P.rep)+'</p>'+
   '<p>Bando: '+(P.gang?GANG[P.gang].n:'nenhum')+' · Emprego: '+(P.job?JOBS[P.job].n:'nenhum')+'</p>'+
   '<p>Túnel: '+Math.round(G.tunnel)+'% · Solitárias: '+G.stats.solitary+'</p>'+
   '<p class="sm">Cada dia com chamada cumprida e trabalho feito tira 2 dias à pena. Faltas e castigos somam dias.</p>',
   [{t:'Voltar ao menu',f:menuPanel}]);
}
function helpPanel(){
  openPanel('Como jogar',
   '<p><b>Objetivo:</b> sai da prisão. Cumpre a pena com bom comportamento ou foge (túnel, cerca ou portão).</p>'+
   '<p><b>Mexer:</b> joystick à esquerda (ou WASD/setas). <b>Ação</b>: falar e usar o que está à frente. <b>Bater</b>: socos (cuidado com os guardas). <b>Correr</b>: gasta energia.</p>'+
   '<p><b>Rotina:</b> 07:00 chamada na cela (zona azul) · 08:00 trabalho · 12:00 almoço · 13:00 pátio · 18:00 jantar · 21:00 recolher.</p>'+
   '<p><b>Dinheiro:</b> trabalha, telefona à família, faz missões. Compra na cantina (13:00 às 21:00).</p>'+
   '<p><b>Suspeita:</b> a barra vermelha sobe quando os guardas te veem onde não deves estar ou a fazer algo proibido. A 100% é alarme.</p>'+
   '<p>Fala com o <b>Zeca</b>, o teu colega de cela, para saberes como fugir.</p>',
   [{t:'Percebi',f:closePanel}]);
}
function menuPanel(){
  openPanel('Menu',null,[
    {t:'Inventário',f:invPanel},{t:'Missões',f:missionPanel},{t:'Estado',f:statusPanel},{t:'Como jogar',f:helpPanel},
    {t:muted?'Ligar som':'Desligar som',f:()=>{muted=!muted;menuPanel()}},
    {t:'Guardar e sair para o ecrã inicial',f:()=>{saveGame();closePanel();showTitle()}},
    {t:'Continuar',f:closePanel}]);
}

/* ================= GUARDAR ================= */
function saveGame(){
  if(G.over||!G.started)return;
  try{
    const d={S:{t:S.t,day:S.day},P:{x:P.x,y:P.y,hp:P.hp,en:P.en,food:P.food,str:P.str,rep:P.rep,heat:0,money:P.money,inv:P.inv,stash:P.stash,gang:P.gang,job:P.job,int:P.int,uniform:P.uniform},
      G:{sentence:G.sentence,tunnel:G.tunnel,cut:G.cut,missions:G.missions,stats:G.stats,chamadaOk:G.chamadaOk,workOk:G.workOk,mealT:G.mealT||{}}};
    localStorage.setItem('pm_v1',JSON.stringify(d));
  }catch(e){}
}
function loadGame(){
  try{
    const d=JSON.parse(localStorage.getItem('pm_v1')||'null');if(!d)return false;
    S.t=d.S.t;S.day=d.S.day;Object.assign(P,d.P);P.sleeping=false;
    Object.assign(G,d.G);
    for(const k in G.cut){const[x,y]=k.split(',').map(Number);grid[gi(x,y)]=CUT}
    return true;
  }catch(e){return false}
}
function hasSave(){try{return!!localStorage.getItem('pm_v1')}catch(e){return false}}

/* ================= ENTRADA ================= */
const keys={};
let joy={on:false,id:null,ox:0,oy:0,x:0,y:0};
function inputVec(){
  let x=0,y=0;
  if(keys.ArrowLeft||keys.a||keys.A)x-=1;if(keys.ArrowRight||keys.d||keys.D)x+=1;
  if(keys.ArrowUp||keys.w||keys.W)y-=1;if(keys.ArrowDown||keys.s||keys.S)y+=1;
  if(joy.on){x=joy.x;y=joy.y}
  const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}
  return[x,y];
}
window.addEventListener('keydown',e=>{
  audioInit();keys[e.key]=true;
  if(e.key==='Escape'){if(panelOpen)closePanel();else if(G.started&&!G.over)menuPanel()}
  if(e.key===' '||e.key==='e'||e.key==='E'){e.preventDefault();if(TM)tmStop();else pressAct()}
  if(e.key==='f'||e.key==='F'||e.key==='j'||e.key==='J')attack();
  if(e.key==='Shift')P.run=true;
  if(e.key==='m'||e.key==='M')muted=!muted;
});
window.addEventListener('keyup',e=>{keys[e.key]=false;if(e.key==='Shift')P.run=false});
function pressAct(){
  audioInit();
  if(P.sleeping){wake('Acordaste.');return}
  if(TM){tmStop();return}
  if(panelOpen||G.paused)return;
  doAct(nearAct);
}
function bindBtn(id,fn){
  const e=$(id);
  e.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();audioInit();e.classList.add('dn');fn()});
  ['pointerup','pointerleave','pointercancel'].forEach(t=>e.addEventListener(t,()=>e.classList.remove('dn')));
}
bindBtn('#bA',pressAct);bindBtn('#bB',attack);
$('#bR').addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();audioInit();P.run=!P.run;$('#bR').classList.toggle('on',P.run)});
$('#bM').addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();audioInit();if(G.started&&!G.over&&!G.arresting){if(panelOpen)closePanel();else menuPanel()}});
$('#tmB').addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();tmStop()});
$('#sleepB').addEventListener('pointerdown',ev=>{ev.preventDefault();wake('Acordaste.')});
/* joystick flutuante na metade esquerda */
const zoneEl=$('#touch');
zoneEl.addEventListener('pointerdown',e=>{
  audioInit();
  if(e.clientX>window.innerWidth*.55&&e.pointerType==='touch')return;
  if(panelOpen||joy.on&&joy.id!==e.pointerId&&e.pointerType==='touch')return;
  joy.on=true;joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.x=0;joy.y=0;
  const b=$('#joyB'),k=$('#joyK');b.style.left=e.clientX+'px';b.style.top=e.clientY+'px';k.style.left=e.clientX+'px';k.style.top=e.clientY+'px';b.classList.add('on');k.classList.add('on');
  try{zoneEl.setPointerCapture(e.pointerId)}catch(_){}
});
zoneEl.addEventListener('pointermove',e=>{
  if(!joy.on||e.pointerId!==joy.id)return;
  let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const R=48,m=Math.hypot(dx,dy);
  if(m>R){dx=dx/m*R;dy=dy/m*R}
  joy.x=dx/R;joy.y=dy/R;if(Math.hypot(joy.x,joy.y)<.18){joy.x=0;joy.y=0}
  const k=$('#joyK');k.style.left=(joy.ox+dx)+'px';k.style.top=(joy.oy+dy)+'px';
});
function joyEnd(e){if(e.pointerId!==joy.id)return;joy.on=false;joy.id=null;joy.x=joy.y=0;$('#joyB').classList.remove('on');$('#joyK').classList.remove('on')}
zoneEl.addEventListener('pointerup',joyEnd);zoneEl.addEventListener('pointercancel',joyEnd);
document.addEventListener('contextmenu',e=>e.preventDefault());

/* ================= HUD ================= */
let hudT=0;
function hud(){
  const h=hh(),sc=sched(h);
  $('#hClock').textContent=clock();$('#hDay').textContent='Dia '+S.day;
  $('#hSch').textContent=SCHED_NAME[sc];
  $('#bHp').style.width=clamp(P.hp,0,100)+'%';$('#bEn').style.width=clamp(P.en,0,100)+'%';$('#bFd').style.width=clamp(P.food,0,100)+'%';$('#bHt').style.width=clamp(P.heat,0,100)+'%';
  $('#hMoney').textContent=Math.round(P.money)+' mç';$('#hPena').textContent=Math.max(0,Math.round(G.sentence))+' dias de pena';
  const hint=hintText(sc,h);$('#hHint').textContent=hint;
  const a=nearAct;const bA=$('#bA');bA.querySelector('small').textContent=a?a.label:'';bA.classList.toggle('hot',!!a);
}
function hintText(sc,h){
  if(P.sleeping)return'A dormir… toca para acordar.';
  if(alarm>0)return'ALARME! Foge dos guardas ou esconde-te fora da vista.';
  if(sc==='chamada')return'Chamada: fica na tua cela (zona azul no chão).';
  if(sc==='acordar')return'Bom dia. Às 07:00 há chamada: fica na tua cela.';
  if(sc==='cafe')return'Pequeno-almoço no refeitório (balcão do fundo).';
  if(sc==='trabalho')return P.job?'Vai trabalhar: '+JOBS[P.job].n+'.':'Pede trabalho ao Sr. Mateus (secretaria, no corredor).';
  if(sc==='almoco'||sc==='jantar')return'Refeição no refeitório.';
  if(sc==='livre')return'Tempo livre: pátio, cantina, biblioteca… e cuidado com os rivais.';
  if(sc==='livre_noite')return'Antes das 21:00 volta à tua cela.';
  if(h>=21||h<6.5)return rondaT>0?'RONDA! Pára o que estás a fazer.':'É de noite. Dorme na tua cama (ou arrisca algo…).';
  return'';
}

/* ================= CICLO PRINCIPAL ================= */
let last=0;
function frame(ts){
  requestAnimationFrame(frame);
  const now=ts/1000;let dt=Math.min(.05,(ts-last)/1000||0);last=ts;
  if(!G.started){render(now);return}
  if(TM)tmUpdate(dt);
  if(!G.paused){update(dt,now)}
  render(now);
  hudT-=dt;if(hudT<=0){hudT=.12;hud()}
}
function update(dt,now){
  GT+=dt;P.heat=Math.min(100,P.heat);
  /* relógio */
  if(!G.arresting)stepClock(dt*TS*S.speed);
  if(S.speed===1&&Math.random()<dt*2)updateDoors();
  /* dormir */
  if(P.sleeping){if(P.sleepLeft<=0)wake(P.nap?'Descansaste.':'Bom dia.')}
  /* movimento */
  P.uT=(P.uT||0)-dt;if(P.uT<=0){P.uT=.5;unstick(P)}
  const[ix,iy]=inputVec();
  P.moving=false;
  if(!P.sleeping&&!P.busy||P.busy&&(ix||iy)){
    if(P.busy&&(ix||iy)){cancelBusy('Interrompeste a ação.')}
    if(ix||iy){
      const sp=T*(P.run&&P.en>3?4.6:2.9)*(P.en<8?.6:1)*(P.hp<25?.8:1);
      P.face=Math.atan2(iy,ix);moveE(P,ix*sp*dt,iy*sp*dt);P.walk+=dt;P.moving=true;
      if(P.run&&P.en>3)P.en=Math.max(0,P.en-3.2*dt);
    }
  }
  if(P.busy)busyTick(dt);
  if(P.cd>0)P.cd-=dt;if(P.atk>0)P.atk-=dt;if(P.hurt>0)P.hurt-=dt;
  if(P.crime>0)P.crime-=dt;
  if(P.shake>0)P.shake-=dt;
  if(alarm>0){alarm-=dt;if(alarm<=0){alarm=0;GUARDS.forEach(g=>{if(g.state==='chase'&&!g.lost){}})}}
  if(rondaT>0)rondaT-=dt;
  /* entidades */
  for(const n of NPC){updateNPC(n,dt,now);if(n.talkT>0)n.talkT-=dt}
  for(const g of GUARDS){updateGuard(g,dt,now);if(g.talkT>0)g.talkT-=dt;
    if(g.fixed&&g.state==='patrol'&&!g.path.length){const fx_=g.fixed[0]*T,fy_=g.fixed[1]*T;if(dist(g.x,g.y,fx_,fy_)>T*.6){setPath(g,Math.floor(fx_/T),Math.floor(fy_/T),true)}}}
  /* torres de vigia */
  if(beamsOn()&&!G.over&&violation()&&inBeam(P.x,P.y)){P.heat+=dt*42;if(P.heat>=100)raiseAlarm(null)}
  /* suspeita desce se ninguém vê */
  if(!GUARDS.some(g=>g.seeT>0||g.state==='chase')&&!(beamsOn()&&violation()&&inBeam(P.x,P.y))&&P.heat>0)P.heat=Math.max(0,P.heat-dt*4);
  /* fuga pelo sul */
  if(P.y>43*T&&!G.over)endGame('cerca');
  /* interacção próxima */
  nearAct=(P.sleeping||P.busy)?null:nearestAct();
  /* desmaio por exaustão */
  if(P.en<=0&&!P.sleeping&&Math.random()<dt*.2){P.en=8;toast('Estás exausto. Descansa!')}
}

/* ================= ARRANQUE ================= */
function startGame(cont){
  audioInit();
  if(cont&&loadGame()){/* ok */}
  else{
    S.t=6.5*60;S.day=1;P.x=11.5*T;P.y=8.5*T;
  }
  G.started=true;G.paused=false;G.over=false;
  $('#title').classList.remove('on');$('#end').classList.remove('on');
  updateDoors();snapNPCs();
  P.x=Math.min(P.x,(W-3)*T);cam.x=P.x-VW/Z/2;cam.y=P.y-VH/Z/2;
  if(!cont||!hasSave())setTimeout(()=>{helpPanel()},400);
}
function showTitle(){
  G.started=false;G.paused=true;
  $('#cont').style.display=hasSave()?'block':'none';
  $('#title').classList.add('on');
}
$('#newB').addEventListener('click',()=>{
  audioInit();
  try{localStorage.removeItem('pm_v1')}catch(e){}
  location.hash='#novo';location.reload();
});
$('#cont').addEventListener('click',()=>{audioInit();startGame(true)});
$('#againB').addEventListener('click',()=>{try{localStorage.removeItem('pm_v1')}catch(e){}location.hash='#novo';location.reload()});
window.addEventListener('beforeunload',saveGame);
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame()});
requestAnimationFrame(frame);
(function boot(){
  updateDoors();
  if(location.hash==='#novo'){history.replaceState(null,'',location.pathname);startGame(false);return}
  showTitle();
})();
