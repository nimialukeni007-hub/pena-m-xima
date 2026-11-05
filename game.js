'use strict';
/* ===== PENA MÁXIMA v2 — vista lateral (Arão Lende Webdesign). Jogo original. ===== */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const TAU=Math.PI*2;
function hash(x,y){let h=(x*374761393+y*668265263)^0x5bd1e995;h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967295}

/* ---------- geometria lógica ---------- */
const LH=600;               /* altura lógica do ecrã */
const FY0=330,FY1=545;      /* chão: do fundo (z=0) ao primeiro plano (z=1) */
const zY=z=>FY0+z*(FY1-FY0);
const zS=z=>.84+.3*z;

/* ---------- cenas (salas) ---------- */
const SC={};
function scene(id,o){SC[id]=Object.assign({id,props:[],doors:[],decor:[],w:1500,out:false},o)}
const D=(x,to,label,k,o)=>Object.assign({x,to,label,k:k||'livre',w:140},o||{});
const PR=(t,x,z,o)=>Object.assign({t,x,z,w:120,act:null,label:''},o||{});

scene('cela',{n:'A tua cela',w:1500,th:{w0:'#9a9a94',w1:'#7d7d78',f0:'#6a6c72',f1:'#4c4e55'},
  decor:[{t:'window',x:760,y:70,w:170,h:120},{t:'lamp',x:760},{t:'poster',x:1000,y:80,c:'#c9b27a'}],
  props:[PR('bunk',420,.16,{w:340,act:'cama',label:'A tua cama',id:'cama_own'}),PR('toilet',1060,.1,{w:80,act:'retrete',label:'Retrete'}),PR('sink',1190,.1,{w:80,act:'lavatorio',label:'Lavatório'}),PR('desk',800,.45,{w:200})],
  doors:[D(1400,'corredor','Corredor','cela')]});
scene('corredor',{n:'Corredor do bloco',w:4500,th:{w0:'#8b8a80',w1:'#6f6e66',f0:'#767a82',f1:'#51555d'},
  decor:[{t:'lamp',x:300},{t:'lamp',x:900},{t:'lamp',x:1500},{t:'lamp',x:2100},{t:'lamp',x:2700},{t:'lamp',x:3300},{t:'lamp',x:3900},{t:'stripe'},{t:'notice',x:1130,y:80},{t:'notice',x:2420,y:90}],
  props:[PR('deskSec',1760,.3,{w:300,act:'secretaria',label:'Secretaria dos trabalhos'}),
    PR('phone',2050,.1,{w:70,act:'telefone',label:'Telefone público'}),PR('phone',2150,.1,{w:70,act:'telefone',label:'Telefone público'}),PR('phone',2250,.1,{w:70,act:'telefone',label:'Telefone público'}),
    PR('bench',650,.7,{w:240}),PR('bench',3000,.75,{w:240})],
  doors:[D(250,'cela','Tua cela','cela',{lbl:'CELA 2'}),D(520,null,'Cela 3','dead',{lbl:'CELA 3'}),D(850,'refeitorio','Refeitório',null,{lbl:'REFEITÓRIO'}),D(1130,'cozinha','Cozinha',null,{lbl:'COZINHA'}),D(1410,'enfermaria','Enfermaria',null,{lbl:'ENFERMARIA'}),
    D(2650,'oficina','Oficina',null,{lbl:'OFICINA'}),D(2930,'lavandaria','Lavandaria',null,{lbl:'LAVANDARIA'}),D(3210,'cantina','Cantina','cantina',{lbl:'CANTINA'}),D(3490,'biblioteca','Biblioteca',null,{lbl:'BIBLIOTECA'}),
    D(3800,'patio','Pátio','patio',{lbl:'PÁTIO',w:220}),D(4060,'solitaria','Solitária','sol',{lbl:'SOLITÁRIA'}),D(4340,'posto','Posto da guarda',null,{lbl:'POSTO',w:160})]});
scene('refeitorio',{n:'Refeitório',w:1700,th:{w0:'#b3a98e',w1:'#928a72',f0:'#8b8574',f1:'#5f5b4f'},
  decor:[{t:'window',x:900,y:60,w:200,h:110},{t:'window',x:1250,y:60,w:200,h:110},{t:'lamp',x:600},{t:'lamp',x:1100},{t:'speaker',x:1450,y:40}],
  props:[PR('counter',520,.16,{w:520,act:'bandeja',label:'Balcão das refeições',food:1}),PR('table',760,.62,{w:300}),PR('table',1150,.78,{w:300})],
  doors:[D(110,'corredor','Corredor')]});
scene('cozinha',{n:'Cozinha',w:1500,th:{w0:'#d9dcd8',w1:'#b5b9b4',f0:'#a4a8a3',f1:'#74786f'},
  decor:[{t:'lamp',x:600},{t:'lamp',x:1100},{t:'vent',x:900,y:60}],
  props:[PR('counter',520,.16,{w:420,act:'trab_coz',label:'Balcão da cozinha'}),PR('stove',930,.14,{w:200}),PR('pantry',1250,.12,{w:170,act:'despensa',label:'Despensa'})],
  doors:[D(110,'corredor','Corredor')]});
scene('enfermaria',{n:'Enfermaria',w:1300,th:{w0:'#c8dedd',w1:'#a5bfbf',f0:'#b7c4c6',f1:'#7f8d90'},
  decor:[{t:'lamp',x:500},{t:'lamp',x:900},{t:'cross',x:650,y:70}],
  props:[PR('medbed',420,.2,{w:230}),PR('medbed',900,.28,{w:230}),PR('cabinet',1150,.12,{w:130})],
  doors:[D(110,'corredor','Corredor')]});
scene('oficina',{n:'Oficina',w:1500,th:{w0:'#938b7e',w1:'#756e63',f0:'#6f6b66',f1:'#4a4845'},
  decor:[{t:'lamp',x:550},{t:'lamp',x:1000},{t:'window',x:1250,y:70,w:160,h:100},{t:'pegboard',x:700,y:70}],
  props:[PR('workbench',480,.18,{w:270,act:'trab_oficina',label:'Bancada da oficina'}),PR('workbench',860,.2,{w:270,act:'trab_oficina',label:'Bancada da oficina'}),PR('machine',1200,.3,{w:200})],
  doors:[D(110,'corredor','Corredor')]});
scene('lavandaria',{n:'Lavandaria',w:1600,th:{w0:'#aebfc7',w1:'#8ba0a9',f0:'#8f9a9e',f1:'#626d71'},
  decor:[{t:'lamp',x:600},{t:'lamp',x:1100},{t:'vent',x:1350,y:60}],
  props:[PR('washer',420,.14,{w:110,act:'trab_lav',label:'Lavandaria'}),PR('washer',560,.14,{w:110,act:'trab_lav',label:'Lavandaria'}),PR('washer',700,.14,{w:110,act:'trab_lav',label:'Lavandaria'}),
    PR('foldtable',1040,.5,{w:300,act:'trab_lav',label:'Mesa de dobrar roupa'}),PR('basket',1420,.35,{w:110,act:'cesto',label:'Cesto da roupa dos guardas'})],
  doors:[D(110,'corredor','Corredor')]});
scene('cantina',{n:'Cantina',w:1300,th:{w0:'#a893a0',w1:'#85708a',f0:'#837a83',f1:'#5a525b'},
  decor:[{t:'lamp',x:500},{t:'lamp',x:900},{t:'shelves',x:1050,y:60,w:320}],
  props:[PR('shopcounter',640,.22,{w:440,act:'cantina',label:'Cantina do Zé'})],
  doors:[D(110,'corredor','Corredor')]});
scene('biblioteca',{n:'Biblioteca',w:1500,th:{w0:'#9c8466',w1:'#7a644c',f0:'#8a6e52',f1:'#5e4936'},
  decor:[{t:'lamp',x:600},{t:'lamp',x:1100},{t:'window',x:850,y:70,w:150,h:110}],
  props:[PR('bookcase',480,.13,{w:300,act:'ler',label:'Ler um livro'}),PR('bookcase',1000,.13,{w:300,act:'trab_bib',label:'Arrumar os livros'}),PR('table',760,.7,{w:240})],
  doors:[D(110,'corredor','Corredor')]});
scene('patio',{n:'Pátio',w:3300,out:true,th:{w0:'#9aa2a6',w1:'#7c8387',f0:'#8c7b5e',f1:'#6d5f46'},
  decor:[],
  props:[PR('weights',650,.55,{w:230,act:'pesos',label:'Pesos'}),PR('bag',1050,.45,{w:90,act:'saco',label:'Saco de boxe'}),PR('pullup',1360,.3,{w:230,act:'barra',label:'Barras'}),
    PR('hoop',1950,.1,{w:120}),PR('bench',2400,.75,{w:240}),PR('fence',2400,.06,{w:1800,act:'cerca',label:'Cerca de arame',zr:.35})],
  doors:[D(150,'corredor','Corredor')]});
scene('solitaria',{n:'Solitária',w:800,th:{w0:'#6c6d70',w1:'#55565a',f0:'#505156',f1:'#38393d'},
  decor:[{t:'lamp',x:400}],props:[PR('cot',300,.2,{w:220})],doors:[D(110,'corredor','Corredor','dead')]});
scene('posto',{n:'Posto da guarda',w:1400,th:{w0:'#95a0a8',w1:'#78838b',f0:'#6f747a',f1:'#4a4e53'},
  decor:[{t:'lamp',x:500},{t:'lamp',x:900},{t:'window',x:700,y:70,w:190,h:110}],
  props:[PR('desk',460,.25,{w:260}),PR('gate',1210,.1,{w:200,act:'portao',label:'Portão principal'})],
  doors:[D(110,'corredor','Corredor')]});
const SCENE_IDS=Object.keys(SC);
function doorTo(inScene,toScene){return SC[inScene].doors.find(d=>d.to===toScene)}

/* ---------- tempo e horário ---------- */
const TS=3;
const S={t:6.5*60,day:1,speed:1};
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
function darkness(){const h=hh();if(h>=21.5||h<5.5)return .8;if(h>=20)return .8*(h-20)/1.5;if(h<6.5)return .8*(6.5-h);return 0}
function doorLocked(sid,d){
  const h=hh(),sc=sched(h);
  if(d.k==='dead'||d.k==='sol')return true;
  if(d.k==='cela')return !(h>=6.5&&h<21&&sc!=='chamada');
  if(d.k==='patio'&&sid==='corredor')return !(h>=13&&h<18.5);
  if(d.k==='cantina'&&sid==='corredor')return !(h>=13&&h<21);
  return false;
}
function restricted(sid,h){
  if(sid==='posto'||sid==='solitaria')return true;
  if(sid==='patio')return !(h>=13&&h<18.5);
  if((h>=21||h<6.5)&&sid!=='cela')return true;
  if(sid==='cantina'&&!(h>=13&&h<21))return true;
  return false;
}
function updateDoors(){}

/* ---------- itens ---------- */
const ITEMS={
  pao:{n:'Pão com manteiga',food:22,buy:5,sell:2},
  refeicao:{n:'Prato da cantina',food:45,buy:12,sell:4},
  remedio:{n:'Analgésico',heal:35,buy:25,sell:10},
  proteina:{n:'Barra de proteína',str:2,buy:30,sell:10},
  colher:{n:'Colher afiada',contra:1,buy:30,sell:12,desc:'Serve para cavar.'},
  alicate:{n:'Alicate',contra:1,buy:140,sell:50,desc:'Corta a rede da cerca.'},
  faca:{n:'Faca improvisada',contra:1,buy:70,sell:25,dmg:7,desc:'+7 de dano. Proibida.'},
  mapa:{n:'Planta da prisão',contra:1,buy:60,sell:20,desc:'Marca o ponto fraco da cerca.'},
  chave:{n:'Chave do portão',contra:1,buy:340,sell:120,desc:'Abre o portão principal.'},
  uniforme:{n:'Uniforme de guarda',contra:1,wear:1,buy:0,sell:60,desc:'Disfarce. Equipa no inventário.'},
  telemovel:{n:'Telemóvel clandestino',contra:1,phone:1,buy:210,sell:70,desc:'Usa-o para pedir dinheiro à família.'},
  bilhete:{n:'Bilhete dobrado',contra:0,buy:0,sell:0}
};
const SHOP=['pao','refeicao','remedio','proteina','colher','alicate','faca','mapa','chave','telemovel'];

/* ---------- estado ---------- */
const P={scene:'cela',x:760,z:.62,face:1,hp:100,mhp:100,en:100,food:80,str:35,agi:40,int:30,rep:5,heat:0,money:30,
  inv:{pao:1},stash:{},walk:0,atk:0,cd:0,combo:0,comboT:0,run:false,gang:null,uniform:false,
  job:null,tasks:0,crime:0,sleeping:false,busy:null,kind:'p',name:'Tu',hurt:0,moving:false,vx:0,vz:0};
const G={sentence:60,tunnel:0,cut:{},missions:[],stats:{fights:0,days:0,solitary:0,jobs:0},
  chamadaOk:true,workOk:false,solitary:false,over:false,paused:false,started:false,gangRep:{corvos:0,serpentes:0},flags:{},mealT:{}};
let alarm=0,rondaT=0,GT=0;

/* ---------- personagens ---------- */
const GANG={corvos:{n:'Corvos',c:'#16161c'},serpentes:{n:'Serpentes',c:'#26b765'}};
const NAMES=['Rui','Bento','Nelito','Chico','Dino','Kiala','Mário','Tó','Joka','Beto','Vasco','Edson','Nando','Lito'];
const SKINS=['#e8b98f','#c58a5c','#9a6038','#d9a273','#6f4529','#f0c9a6'];
const HAIRS=['#1b1b1b','#3b2414','#111','#5a3a1c','#b8b8b8','#6b4a22'];
const NPC=[],GUARDS=[];
const JOBS={oficina:{n:'Oficina (matrículas)',pay:14,scene:'oficina',act:'trab_oficina'},lavandaria:{n:'Lavandaria',pay:12,scene:'lavandaria',act:'trab_lav'},cozinha:{n:'Cozinha',pay:13,scene:'cozinha',act:'trab_coz'},biblioteca:{n:'Biblioteca',pay:9,scene:'biblioteca',act:'trab_bib'}};
function mkNPC(o){
  const n=Object.assign({kind:'in',scene:'off',x:300,z:.6,face:1,hp:60,mhp:60,spd:150,gang:null,work:null,
    suit:'#e07a1c',skin:pick(SKINS),hair:pick(HAIRS),walk:0,nextT:rnd(1,5),tx:null,tz:null,aggro:0,cd:0,atk:0,ko:0,hurt:0,
    talkable:true,fixed:null,looted:false,big:1,name:pick(NAMES)},o);
  n.mhp=n.hp;return n}
(function(){
  const names=NAMES.slice().sort(()=>Math.random()-.5);
  const works=['oficina','lavandaria','cozinha','biblioteca',null,'oficina','lavandaria','cozinha',null,'oficina','lavandaria','cozinha'];
  for(let i=0;i<12;i++){
    const gang=i<4?'corvos':i<8?'serpentes':null;
    NPC.push(mkNPC({name:names[i],work:works[i],gang,hp:50+ri(0,40),spd:rnd(130,175),suit:i%3===0?'#3f8f4f':'#e07a1c',big:rnd(.95,1.08)}));
  }
  const z=mkNPC({name:'Zeca',work:'cozinha',hp:70,suit:'#e07a1c',skin:SKINS[1],isZeca:true,scene:'cela',x:1000,z:.7});
  NPC.push(z);
  NPC.push(mkNPC({name:'Dom Baltazar',gang:'corvos',leader:true,hp:120,suit:'#3f8f4f',skin:SKINS[3],big:1.12,spd:140}));
  NPC.push(mkNPC({name:'Cobra',gang:'serpentes',leader:true,hp:120,suit:'#3f8f4f',skin:SKINS[2],big:1.12,spd:140}));
  NPC.forEach(n=>{if(n.gang)n.band=GANG[n.gang].c});
  NPC.push(mkNPC({name:'Zé da Cantina',isShop:true,fixed:true,scene:'cantina',x:640,z:.08,hp:90,suit:'#e9e2d0',skin:SKINS[3],hair:'#777'}));
  NPC.push(mkNPC({name:'Dra. Luzia',isDoc:true,fixed:true,scene:'enfermaria',x:650,z:.4,hp:80,suit:'#f4f7f7',skin:SKINS[5],hair:'#3b2414',fem:1}));
  const gd=[{name:'Guarda Silva',role:'hall'},{name:'Guarda Pinto',role:'rot'},{name:'Guarda Matoso',role:'yard'},{name:'Guarda Dias',role:'yard2'},
    {name:'Sr. Mateus',fixed:['corredor',1790,.2],sec:true},{name:'Guarda do Portão',fixed:['posto',760,.5],gate:true}];
  gd.forEach(d=>{
    const g={kind:'g',guard:true,name:d.name,scene:d.fixed?d.fixed[0]:'corredor',x:d.fixed?d.fixed[1]:rnd(300,3000),z:d.fixed?d.fixed[2]:rnd(.35,.8),face:1,hp:160,mhp:160,spd:105,
      suit:'#243f78',skin:pick(SKINS),hair:'#111',walk:0,state:'patrol',role:d.role,nextT:0,ko:0,hurt:0,cd:0,atk:0,lost:0,seeT:0,revT:0,
      talkable:!!d.sec,fixed:!!d.fixed,home:d.fixed||null,sec:d.sec,gate:d.gate,tx:null,big:1.08,dir:1,rot:0,looted:false,hasKey:!!d.gate};
    GUARDS.push(g);
  });
})();
const ALL=()=>NPC.concat(GUARDS);

/* ---------- deslocação entre cenas ---------- */
function hopTo(from,dst){
  if(from==='off')return'corredor';
  if(from==='corredor')return dst;
  return'corredor';
}
function enterScene(e,hop,from){
  if(hop==='off'){e.scene='off';return}
  e.scene=hop;
  const d=doorTo(hop,from);
  if(hop==='corredor'){e.x=(d?d.x:520)+rnd(-60,60)}
  else{e.x=(d?d.x:110)+(d&&d.x<SC[hop].w/2?100:-100)+rnd(-20,20)}
  e.z=rnd(.4,.85);e.tx=null;e.nextT=rnd(1,3);
}
function routeStep(e,dst,dt,openAll){
  if(e.scene===dst)return true;
  const hop=hopTo(e.scene,dst);
  if(e.scene==='off'){
    e.hopT=(e.hopT==null?rnd(1,9):e.hopT)-dt;
    if(e.hopT<=0){e.hopT=null;e.scene='corredor';e.x=520+rnd(-50,50);e.z=rnd(.4,.8);e.tx=null}
    return false;
  }
  const door=hop==='off'?SC.corredor.doors[1]:doorTo(e.scene,hop);
  if(!door){e.scene=dst==='off'?'off':'corredor';return false}
  if(!openAll&&doorLocked(e.scene,door)&&hop!=='off'){e.tx=null;return false}
  if(e.scene===P.scene){
    stepToward(e,door.x,Math.min(e.z,.42),e.spd,dt);
    if(Math.abs(e.x-door.x)<35){const from=e.scene;enterScene(e,hop,from)}
  }else{
    e.hopT=(e.hopT==null?rnd(.6,6):e.hopT)-dt;
    if(e.hopT<=0){e.hopT=null;enterScene(e,hop,e.scene)}
  }
  return false;
}
function stepToward(e,tx,tz,spd,dt){
  const dx=tx-e.x,dz=tz-e.z;
  let mv=false;
  if(Math.abs(dx)>6){const s=Math.sign(dx);e.x+=s*Math.min(Math.abs(dx),spd*dt);e.face=s;mv=true}
  if(Math.abs(dz)>.02){e.z+=Math.sign(dz)*Math.min(Math.abs(dz),spd/260*dt);mv=true}
  const w=SC[e.scene]?SC[e.scene].w:1500;e.x=clamp(e.x,70,w-70);e.z=clamp(e.z,.02,1);
  if(mv)e.walk+=dt;e.moving=mv;
  return !mv||(Math.abs(dx)<=6&&Math.abs(dz)<=.02);
}

/* ---------- IA dos presos ---------- */
function planScene(n,h,sc){
  if(n.fixed)return n.scene;
  if(n.isZeca&&(h>=20.5||sc==='noite'||sc==='acordar'||sc==='chamada'))return'cela';
  if(h>=20.4||sc==='noite'||sc==='acordar'||sc==='chamada')return'off';
  if(sc==='cafe'||sc==='almoco'||sc==='jantar')return'refeitorio';
  if(sc==='trabalho')return n.work?JOBS[n.work].scene:'corredor';
  if(n.leader&&sc==='livre')return'patio';
  if(sc==='livre')return n.pl&&n.plDay===S.day&&n.plH===Math.floor(h)?n.pl:(n.plDay=S.day,n.plH=Math.floor(h),n.pl=Math.random()<.78?'patio':pick(['cantina','biblioteca','corredor']));
  if(sc==='livre_noite')return n.pl2&&n.pl2D===S.day?n.pl2:(n.pl2D=S.day,n.pl2=pick(['corredor','corredor','cantina']));
  return'corredor';
}
function wander(e,dt,spdMul){
  if(e.tx==null||Math.abs(e.x-e.tx)<8&&Math.abs(e.z-e.tz)<.03){
    e.wT=(e.wT||0)-dt;
    if(e.wT>0){e.moving=false;return}
    const w=SC[e.scene].w;
    e.tx=clamp(e.x+rnd(-500,500),160,w-160);e.tz=rnd(.3,.92);e.wT=rnd(1,5);
  }
  stepToward(e,e.tx,e.tz,e.spd*(spdMul||.6),dt);
}
function updateNPC(n,dt){
  if(n.hurt>0)n.hurt-=dt;if(n.cd>0)n.cd-=dt;if(n.atk>0)n.atk-=dt;if(n.talkT>0)n.talkT-=dt;
  if(n.ko>0){n.ko-=dt;if(n.ko<=0){n.hp=Math.max(20,n.mhp*.4);n.aggro=0}return}
  if(n.down>0){n.down-=dt;return}
  if(n.scene==='off'){const sc=sched(hh());if(!n.fixed){const p=planScene(n,hh(),sc);if(p!=='off')routeStep(n,p,dt)}return}
  const h=hh(),sc=sched(h);
  if(n.aggro>0){
    if(n.scene===P.scene&&!P.sleeping){
      n.aggro-=dt;
      if(n.hp<n.mhp*.3){n.aggro=0;n.talk='Para! Já chega!';n.talkT=2;return}
      const dx=P.x-n.x,dz=P.z-n.z;
      n.face=Math.sign(dx)||n.face;
      if(Math.abs(dx)>95||Math.abs(dz)>.15){stepToward(n,P.x-Math.sign(dx)*70,P.z,n.spd*1.45,dt)}
      else{n.moving=false;if(n.cd<=0){n.cd=1.1;n.atk=.28;hurtPlayer(rnd(2.5,5)+(n.leader?3:0)+(n.big-1)*8,n)}}
    }else n.aggro-=dt*3;
    return;
  }
  if(n.fixed){n.moving=false;if(n.scene===P.scene&&Math.abs(P.x-n.x)<420)n.face=Math.sign(P.x-n.x)||n.face;return}
  const dst=planScene(n,h,sc);
  if(routeStep(n,dst,dt))wander(n,dt,.55);
}

/* ---------- guardas ---------- */
const YARD_LIST=['oficina','lavandaria','cozinha','biblioteca','cantina','refeitorio'];
function guardScene(g,h,sc){
  const yardOpen=(h>=13&&h<18.5),night=(h>=21||h<6.5);
  if(g.role==='hall')return'corredor';
  if(g.role==='rot'){if(night||sc==='livre'||sc==='livre_noite')return'corredor';return YARD_LIST[Math.floor(S.t/50)%YARD_LIST.length]}
  if(yardOpen||night)return'patio';
  if(sc==='cafe'||sc==='almoco'||sc==='jantar')return g.role==='yard'?'refeitorio':'corredor';
  return'corredor';
}
function inBeam(x,sid){
  if(!beamsOn()||(sid&&sid!=='patio'))return false;
  for(let i=0;i<2;i++){const c=beamX(i);if(Math.abs(x-c)<150)return true}
  return false;
}
function beamsOn(){const h=hh();return h>=19.5||h<6}
function beamX(i){return 1700+ (1500)*(.5+.5*Math.sin(GT*.55+i*2.3))}
function playerSeenBy(g){
  if(g.scene!==P.scene)return false;
  const dx=P.x-g.x,adx=Math.abs(dx);
  const outdoorDark=SC[g.scene].out&&darkness()>.35;
  let range=640;
  if(outdoorDark)range=g.flash?520:150;
  if(inBeam(P.x,P.scene))range=Math.max(range,1500);
  if(P.uniform)range=Math.min(range,230);
  if(adx>range)return false;
  if(adx<150)return true;
  return Math.sign(dx)===g.face;
}
function violation(){
  if(P.crime>0)return true;
  if(P.uniform)return false;
  return restricted(P.scene,hh());
}
function raiseAlarm(){
  if(alarm<=0){sfx('alarm');banner('ALARME!','#ff4d4d');if(typeof netEmit==='function')netEmit('alarm',{s:P.scene,x:Math.round(P.x)})}
  alarm=14;cm('Alarme! Há um recluso à solta! Cerquem-no!','Altifalante');
  GUARDS.forEach(g=>{
    if(g.sec||g.gate&&g.scene!==P.scene)return;
    if(g.state!=='chase'){g.state='chase';g.lost=0}
    if(g.scene!==P.scene&&g.scene!=='off'){g.pend={scene:P.scene,t:rnd(1.5,4)}}
  });
}
function guardLeaveFollow(from,to){
  GUARDS.forEach(g=>{
    if(g.state==='chase'&&g.scene===from&&!g.sec){
      const d=doorTo(from,to)||doorTo(to,from);
      g.pend={scene:to,t:rnd(.5,1.1)};
    }
  });
}
function updateGuard(g,dt,now){
  if(g.hurt>0)g.hurt-=dt;if(g.cd>0)g.cd-=dt;if(g.atk>0)g.atk-=dt;if(g.talkT>0)g.talkT-=dt;
  if(g.ko>0){g.ko-=dt;return}
  if(g.down>0){g.down-=dt;return}
  const h=hh(),sc=sched(h);
  g.flash=darkness()>.3;
  /* a seguir o jogador entre cenas */
  if(g.pend){g.pend.t-=dt;if(g.pend.t<=0){const from=g.scene;g.scene=g.pend.scene;g.pend=null;
      const d=doorTo(g.scene,from)||doorTo(g.scene,'corredor');g.x=(d?d.x:200)+(d&&d.x<SC[g.scene].w/2?90:-90);g.z=rnd(.4,.8);g.tx=null}return}
  const same=g.scene===P.scene;
  const see=same&&playerSeenBy(g);
  const viol=violation();
  if(g.state==='patrol'||g.state==='revista'){
    if(see&&viol&&!G.over&&!G.arresting){
      P.heat+=dt*(Math.abs(P.x-g.x)<350?40:22);
      g.face=Math.sign(P.x-g.x)||g.face;g.seeT=1;
      if(P.heat>=100)raiseAlarm();
    }else g.seeT=Math.max(0,g.seeT-dt);
    if(see&&!viol&&g.state==='patrol'&&!g.fixed&&Object.keys(contraband()).length&&P.heat>20&&Math.random()<dt*.12&&Math.abs(P.x-g.x)<500&&!P.uniform){
      g.state='revista';g.revT=0;toast('O guarda vai revistar-te…');
    }
  }
  if(g.state==='revista'){
    if(!same){g.state='patrol';return}
    const dx=P.x-g.x,dz=P.z-g.z;g.revT+=dt;
    if(Math.abs(dx)>90||Math.abs(dz)>.14){stepToward(g,P.x-Math.sign(dx)*60,P.z,g.spd*1.2,dt);if(g.revT>9)g.state='patrol'}
    else{g.state='patrol';doRevista(g)}
    return;
  }
  if(g.state==='chase'){
    if(same){
      g.lost=see?0:g.lost+dt;g.face=Math.sign(P.x-g.x)||g.face;
      const dx=P.x-g.x,dz=P.z-g.z;
      if(Math.abs(dx)<85&&Math.abs(dz)<.17&&!P.sleeping&&!G.arresting){guardEngage(g,dt);return}
      stepToward(g,P.x-Math.sign(dx)*55,P.z,g.spd*(P.uniform?1.3:1.55),dt);
    }else{g.lost+=dt}
    if(g.lost>5){g.state='patrol';g.tx=null;P.heat=Math.min(P.heat,55)}
    return;
  }
  /* fixos */
  if(g.fixed){
    g.moving=false;
    if(g.scene===P.scene&&Math.abs(P.x-g.x)<450&&!g.seeT)g.face=Math.sign(P.x-g.x)||g.face;
    if(g.scene!==g.home[0]||Math.abs(g.x-g.home[1])>40){
      if(g.scene!==g.home[0]){g.scene=g.home[0];g.x=g.home[1]}else stepToward(g,g.home[1],g.home[2],g.spd,dt)}
    return;
  }
  /* investigar (alarme de um amigo) */
  if(g.inv&&g.inv.t>0){
    g.inv.t-=dt;
    if(routeStep(g,g.inv.scene,dt,true)){if(Math.abs(g.x-g.inv.x)>40)stepToward(g,g.inv.x,.6,g.spd*1.3,dt);else g.moving=false}
    return;
  }
  /* patrulha */
  const dst=guardScene(g,h,sc);
  if(routeStep(g,dst,dt,true)){
    const w=SC[g.scene].w;
    if(g.tx==null){g.tx=g.dir>0?w-170:170;g.tz=rnd(.35,.8);g.dir*=-1}
    if(stepToward(g,g.tx,g.tz,g.spd*.7,dt)){g.wT=(g.wT||0)+dt;g.moving=false;if(g.wT>rnd(.8,2.6)){g.wT=0;g.tx=null}}
  }
}
function contraband(){const o={};for(const k in P.inv)if(ITEMS[k].contra&&P.inv[k]>0)o[k]=P.inv[k];return o}
function doRevista(g){
  const c=contraband(),ks=Object.keys(c);
  if(!ks.length){toast('Revista: nada de suspeito.');return}
  sfx('alarm');ks.forEach(k=>delete P.inv[k]);P.uniform=false;P.heat=Math.min(100,P.heat+30);
  banner('REVISTA! Confiscaram '+ks.map(k=>ITEMS[k].n).join(', '),'#ffb04d',4200);
  if(Math.random()<.5||ks.includes('faca')||ks.includes('chave'))arrest(g,true);
}
function hurtPlayer(d,src){
  if(P.sleeping||G.over)return;
  const dodge=P.agi/400;if(Math.random()<dodge){fx.push({x:P.x,y:P.z,t:.7,txt:'esquivou',col:'#9fd3ff',z:P.z,s:P.scene});return}
  P.hp-=d;P.hurt=.25;P.shake=.15;sfx('hit');
  fx.push({x:P.x,t:.8,txt:'-'+Math.round(d),col:'#ff6b6b',z:P.z,s:P.scene,dy:0});
  if(P.hp<=0)knockout();
}

/* ---------- efeitos, áudio, avisos ---------- */
const fx=[];
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
  else if(n==='pa'){tone(660,.14,'sine',.06);tone(520,.2,'sine',.06,0,.16)}
}
let toastT=0;
function toast(m,ms){const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),ms||2600)}
let banT=0;
function banner(m,c,ms){const e=$('#banner');e.textContent=m;e.style.color=c||'#fff';e.classList.add('on');clearTimeout(banT);banT=setTimeout(()=>e.classList.remove('on'),ms||2200)}
/* anúncio da PA (balão de fala no topo, como nos jogos do género) */
let paT=0;
function pa(m,ms){const e=$('#pa');if(!e)return;e.querySelector('span').textContent=m;e.classList.add('on');sfx('pa');clearTimeout(paT);paT=setTimeout(()=>e.classList.remove('on'),ms||4200)}

/* ---------- câmara ---------- */
const cam={x:0,sx:0};
let VW=900,KK=1;
const cv=$('#cv'),c=cv.getContext('2d');
function resize(){
  const dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.floor(innerWidth*dpr);cv.height=Math.floor(innerHeight*dpr);
  cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';
}
window.addEventListener('resize',resize);resize();
const lightCv=document.createElement('canvas'),lc=lightCv.getContext('2d');

/* ---------- utilitários de desenho ---------- */
function rr(x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.stroke()}}
function R(x,y,w,h,f){c.fillStyle=f;c.fillRect(x,y,w,h)}
function shade(col,a){/* a>0 clareia, a<0 escurece */
  const n=parseInt(col.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,f=v=>Math.max(0,Math.min(255,Math.round(a>0?v+(255-v)*a:v*(1+a))));
  return'rgb('+f(r)+','+f(g)+','+f(b)+')';
}
function grad(y0,y1,a,b){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g}

/* ---------- fundo da cena ---------- */
function drawBG(sc,x0,x1){
  if(sc.street)return drawStreet(sc,x0,x1);
  const th=sc.th,w=sc.w;
  if(sc.out){
    const d=darkness();
    const top=d>.4?'#0b1226':'#8fc3e8',bot=d>.4?'#1b2440':'#dcecf5';
    c.fillStyle=grad(0,FY0,top,bot);c.fillRect(x0,0,x1-x0,FY0);
    if(d>.4){for(let i=0;i<60;i++){const sx=Math.floor(hash(i,7)*w);if(sx<x0-4||sx>x1+4)continue;c.fillStyle='rgba(255,255,255,'+(.4+.5*hash(i,3))+')';c.fillRect(sx,hash(i,9)*190,2,2)}}
    else{c.fillStyle='rgba(255,255,255,.65)';for(let i=0;i<6;i++){const sx=((hash(i,1)*w+now_*6)%w);c.beginPath();c.ellipse(sx,50+hash(i,2)*80,70,16,0,0,TAU);c.fill()}}
    /* muro do pátio */
    const wall=d>.4?'#2e3340':'#8c8f95';
    R(x0,170,x1-x0,FY0-170+4,wall);
    for(let x=Math.floor(x0/80)*80;x<x1;x+=80){R(x,170,2,164,'rgba(0,0,0,.18)')}
    for(let y=190;y<334;y+=34)R(x0,y,x1-x0,2,'rgba(0,0,0,.14)');
    /* arame farpado */
    c.strokeStyle='#555';c.lineWidth=2;c.beginPath();for(let x=Math.floor(x0/30)*30;x<x1;x+=30){c.moveTo(x,166);c.arc(x+15,166,10,Math.PI,0)}c.stroke();
    /* zona da cerca: vê-se o exterior */
    const fx0=1500,fx1=3300;
    if(x1>fx0){
      const a=Math.max(x0,fx0),b=Math.min(x1,fx1);
      c.fillStyle=grad(190,FY0,d>.4?'#0a1a14':'#5d9a58',d>.4?'#050d0a':'#3f7a43');c.fillRect(a,190,b-a,FY0-190+4);
      for(let x=Math.floor(a/90)*90;x<b;x+=90){c.fillStyle=d>.4?'#07130d':'#2f6a3a';c.beginPath();c.arc(x+30,250,34+hash(x,4)*20,0,TAU);c.fill();R(x+27,270,6,60,d>.4?'#080808':'#4a3520')}
    }
    /* torres */
    for(const tx of[250,w-250]){
      R(tx-26,40,52,300,d>.4?'#2a2e38':'#7b7f87');R(tx-44,22,88,40,d>.4?'#1c1f27':'#555a63');R(tx-34,34,68,20,d>.4?'#ffe9a0':'#b9d3e0');
    }
    c.fillStyle=grad(FY0,LH,th.f0,th.f1);c.fillRect(x0,FY0,x1-x0,LH-FY0);
    c.fillStyle=d>.4?'rgba(40,60,30,.6)':'rgba(70,120,60,.45)';c.fillRect(x0,FY0,x1-x0,22);
    /* linhas do campo */
    c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=3;c.strokeRect(1850,FY0+30,900,FY1-FY0+10);c.beginPath();c.moveTo(2300,FY0+30);c.lineTo(2300,FY1+40);c.stroke();
    return;
  }
  c.fillStyle=grad(0,FY0,th.w0,th.w1);c.fillRect(x0,0,x1-x0,FY0+4);
  /* painéis da parede */
  c.fillStyle='rgba(0,0,0,.07)';for(let x=Math.floor(x0/220)*220;x<x1;x+=220)c.fillRect(x,0,3,FY0);
  R(x0,FY0-26,x1-x0,30,'rgba(0,0,0,.14)');R(x0,FY0-28,x1-x0,3,'rgba(255,255,255,.12)');
  c.fillStyle=grad(FY0,LH,th.f0,th.f1);c.fillRect(x0,FY0+4,x1-x0,LH-FY0-4);
  c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=2;
  for(let i=1;i<6;i++){const y=zY(i/6*1.2);c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke()}
  for(let x=Math.floor(x0/160)*160;x<x1;x+=160){c.beginPath();c.moveTo(x,FY0+4);c.lineTo(x-(x-w/2)*.12,LH);c.stroke()}
}
let now_=0;
function drawDecor(sc,x0,x1){
  for(const d of sc.decor){
    if(d.x<x0-300||d.x>x1+300)continue;
    if(d.t==='window'){
      const dk=darkness()>.4;
      rr(d.x-d.w/2,d.y,d.w,d.h,6,dk?'#0d1530':'#9fd0ee','#2a2a2a');
      c.strokeStyle='#2a2a2a';c.lineWidth=5;c.beginPath();c.moveTo(d.x,d.y);c.lineTo(d.x,d.y+d.h);c.stroke();
      c.lineWidth=3;for(let i=1;i<5;i++){const xx=d.x-d.w/2+d.w*i/5;c.beginPath();c.moveTo(xx,d.y);c.lineTo(xx,d.y+d.h);c.stroke()}
      if(!dk){c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(d.x-d.w/2,d.y+d.h);c.lineTo(d.x-d.w/2+60,d.y+d.h);c.lineTo(d.x-d.w/2+10,d.y);c.lineTo(d.x-d.w/2,d.y);c.fill()}
    }else if(d.t==='lamp'){
      R(d.x-1,0,2,40,'#222');rr(d.x-22,38,44,12,5,'#444');
      const n=darkness()>.1;c.fillStyle=n?'#fff4b8':'#e8e8d8';c.beginPath();c.ellipse(d.x,52,18,6,0,0,TAU);c.fill();
    }else if(d.t==='poster'){rr(d.x-34,d.y,68,92,3,d.c,'#3a2d12');R(d.x-24,d.y+10,48,10,'rgba(0,0,0,.4)');R(d.x-24,d.y+30,48,40,'rgba(0,0,0,.18)')}
    else if(d.t==='notice'){rr(d.x-46,d.y,92,70,4,'#6e5a3a');for(let i=0;i<3;i++)R(d.x-36+i*28,d.y+10,22,28,'#f4efe0')}
    else if(d.t==='speaker'){rr(d.x-30,d.y,60,44,6,'#2c2c30');c.fillStyle='#111';c.beginPath();c.arc(d.x,d.y+22,15,0,TAU);c.fill()}
    else if(d.t==='vent'){rr(d.x-50,d.y,100,50,4,'#8d928f');for(let i=0;i<6;i++)R(d.x-44,d.y+6+i*7,88,3,'#555')}
    else if(d.t==='cross'){R(d.x-8,d.y,16,52,'#d33');R(d.x-26,d.y+18,52,16,'#d33')}
    else if(d.t==='pegboard'){rr(d.x-110,d.y,220,120,4,'#a98a5c');for(let i=0;i<7;i++){R(d.x-95+i*30,d.y+18,5,60,'#444');R(d.x-100+i*30,d.y+78,16,10,'#777')}}
    else if(d.t==='shelves'){for(let i=0;i<3;i++){R(d.x-d.w/2,d.y+i*58,d.w,6,'#5a4630');for(let j=0;j<8;j++){R(d.x-d.w/2+10+j*38,d.y+i*58-26,28,26,['#d94','#4a8','#58c','#c55'][(i+j)%4])}}}
  }
}
function drawDoor(d,sid){
  const lock=doorLocked(sid,d),w=d.w>150?d.w:110,x=d.x;
  const base=FY0+10;
  R(x-w/2-8,base-210,w+16,214,'#2b2d33');
  const col=d.k==='cela'?'#8c6a42':d.k==='dead'?'#555':d.k==='sol'?'#44464c':sid!=='corredor'?'#7a7e86':'#6f7b86';
  rr(x-w/2,base-200,w,198,3,col);
  if(sid==='corredor'||d.k==='dead'){/* janela de vidro */R(x-w/2+w*.3,base-170,w*.4,44,'#10141c');c.strokeStyle='#999';c.lineWidth=2;for(let i=1;i<4;i++){c.beginPath();c.moveTo(x-w/2+w*.3+w*.4*i/4,base-170);c.lineTo(x-w/2+w*.3+w*.4*i/4,base-126);c.stroke()}}
  else R(x-w/2+w*.2,base-170,w*.6,70,'rgba(255,255,255,.12)');
  R(x+w/2-16,base-90,7,22,'#d9c28a');
  if(d.lbl){rr(x-52,base-246,104,26,4,'#e8e1c8','#222');c.fillStyle='#222';c.font='bold 14px system-ui';c.textAlign='center';c.fillText(d.lbl,x,base-228)}
  if(d.k!=='dead'&&d.to){c.fillStyle=lock?'#ff5a4a':'#5aff8a';c.beginPath();c.arc(x,base-206,5,0,TAU);c.fill()}
}

/* ---------- adereços ---------- */
function P_(t,p,gy,s){
  const w=p.w;
  c.save();c.translate(p.x,gy);c.scale(s,s);
  const B=(x,y,ww,hh,f)=>R(x,y,ww,hh,f);
  switch(t){
    case'bunk':{const hw=w/2;B(-hw,-150,10,150,'#4a4d55');B(hw-10,-150,10,150,'#4a4d55');
      rr(-hw+6,-62,w-12,18,4,'#6a6e78');rr(-hw+10,-84,w-20,22,6,'#3d6aa8');rr(-hw+14,-80,60,14,5,'#e8e8e8');
      rr(-hw+6,-132,w-12,16,4,'#6a6e78');rr(-hw+10,-154,w-20,22,6,'#5a7fc0');rr(-hw+14,-150,60,14,5,'#eee');
      B(hw-34,-132,6,132,'#555');for(let i=0;i<5;i++)B(hw-34,-120+i*24,24,4,'#555');break}
    case'toilet':rr(-26,-40,52,40,8,'#d7dadd');rr(-18,-60,36,24,6,'#c4c8cc');B(-12,-92,24,34,'#cfd3d6');break;
    case'sink':rr(-34,-58,68,22,8,'#d7dadd');B(-4,-92,8,34,'#999');B(-24,-36,48,36,'#b4b8bb');break;
    case'desk':case'table':{const hw=w/2;rr(-hw,-84,w,14,3,p.t==='desk'?'#8a6a44':'#b49a74');B(-hw+12,-70,10,70,'#5b4630');B(hw-22,-70,10,70,'#5b4630');
      if(p.t==='table'){rr(-hw+10,-44,w-20,8,3,'#8a7656');B(-hw+30,-36,8,36,'#4a3d2c');B(hw-38,-36,8,36,'#4a3d2c')}break}
    case'bench':rr(-w/2,-44,w,12,3,'#9a7a50');B(-w/2+14,-32,10,32,'#4a3d2c');B(w/2-24,-32,10,32,'#4a3d2c');break;
    case'deskSec':{const hw=w/2;rr(-hw,-96,w,70,6,'#5c4631');rr(-hw-6,-104,w+12,14,4,'#7a5d3e');B(-hw+10,-26,16,26,'#3d2e1f');B(hw-26,-26,16,26,'#3d2e1f');
      rr(-60,-122,70,18,3,'#e8dfc0');B(-40,-118,8,8,'#333');B(40,-134,5,30,'#555');rr(30,-142,24,12,4,'#e8c45a');for(let i=0;i<3;i++)B(-hw+20+i*28,-112,22,10,'#f4efe0');break}
    case'phone':rr(-26,-150,52,80,6,'#6a6f78');rr(-18,-138,36,22,3,'#222');rr(-20,-104,40,26,3,'#333');B(-22,-76,44,6,'#999');for(let i=0;i<3;i++)for(let j=0;j<3;j++)B(-14+i*10,-98+j*8,6,5,'#ccc');rr(-30,-130,10,40,5,'#111');break;
    case'counter':{const hw=w/2;rr(-hw,-84,w,84,4,'#7e848c');B(-hw,-92,w,12,'#cfd3d8');for(let i=0;i<w/70;i++)B(-hw+12+i*70,-86,50,6,'rgba(0,0,0,.12)');
      for(let i=0;i<w/120;i++){rr(-hw+30+i*120,-108,70,16,3,'#aeb4ba');B(-hw+40+i*120,-118,50,10,['#c9a45a','#7ab35a','#c66'][i%3])}break}
    case'stove':rr(-w/2,-96,w,96,4,'#9ea3a9');B(-w/2+10,-106,w-20,10,'#444');rr(-50,-136,40,30,4,'#bbb');rr(14,-128,44,22,4,'#999');for(let i=0;i<3;i++)B(-w/2+16+i*50,-60,28,10,'#222');break;
    case'pantry':{rr(-w/2,-170,w,170,4,'#7a6a4e');for(let i=0;i<4;i++){B(-w/2+8,-160+i*40,w-16,5,'#5a4a34');for(let j=0;j<3;j++)B(-w/2+16+j*46,-190+i*40+30,36,26,['#c9a45a','#cc8','#7a9'][(i+j)%3])}break}
    case'medbed':rr(-w/2,-52,w,18,4,'#dfe6e8');rr(-w/2+6,-70,w-12,22,8,'#f4f8f8');rr(-w/2+10,-84,54,18,7,'#fff');B(-w/2+8,-34,8,34,'#888');B(w/2-16,-34,8,34,'#888');break;
    case'cabinet':rr(-w/2,-150,w,150,4,'#e8efef');B(-2,-150,4,150,'#9ab');B(-w/2+10,-96,6,16,'#555');B(w/2-16,-96,6,16,'#555');B(-9,-140,18,6,'#d33');B(-3,-146,6,18,'#d33');break;
    case'workbench':{const hw=w/2;rr(-hw,-86,w,16,3,'#a5815a');B(-hw+10,-70,12,70,'#5b4630');B(hw-22,-70,12,70,'#5b4630');rr(-hw+14,-48,w-28,10,3,'#8a6a44');
      for(let i=0;i<3;i++){rr(-hw+30+i*70,-108,50,22,2,'#c8ccd0','#777');B(-hw+38+i*70,-102,34,4,'#333')}B(hw-60,-100,30,14,'#555');break}
    case'machine':rr(-w/2,-170,w,170,6,'#6b7078');B(-w/2+16,-150,w-32,40,'#3c4048');B(-w/2+20,-96,30,50,'#c33');B(w/2-60,-96,40,70,'#999');B(-w/2,-20,w,20,'#444');break;
    case'washer':rr(-w/2,-110,w,110,6,'#dfe3e6');c.fillStyle='#4a7aa8';c.beginPath();c.arc(0,-58,34,0,TAU);c.fill();c.strokeStyle='#aab';c.lineWidth=5;c.stroke();B(-w/2+8,-104,24,8,'#888');break;
    case'foldtable':{const hw=w/2;rr(-hw,-80,w,12,3,'#b6b9be');B(-hw+10,-68,10,68,'#666');B(hw-20,-68,10,68,'#666');for(let i=0;i<5;i++)rr(-hw+20+i*52,-100+((i%2)*-6),44,22,3,['#e07a1c','#eee','#3f8f4f','#eee','#243f78'][i]);break}
    case'basket':rr(-w/2,-54,w,54,8,'#b48a52');for(let i=0;i<4;i++)B(-w/2,-46+i*12,w,3,'#8a6a3a');rr(-w/2+8,-76,w-16,28,10,'#243f78');break;
    case'shopcounter':{const hw=w/2;rr(-hw,-90,w,90,4,'#8f5a8f');B(-hw-8,-98,w+16,12,'#d8c8d8');for(let i=0;i<7;i++){B(-hw+14+i*60,-130,36,32,['#d94','#4a8','#58c','#c55','#ecb','#9b6','#a6c'][i])}
      c.fillStyle='#c33';for(let i=0;i<9;i++){c.fillRect(-hw-10+i*(w+20)/9,-176,(w+20)/9,26);c.fillStyle=i%2?'#c33':'#f1e8d0'}B(-hw,-150,6,150,'#555');B(hw-6,-150,6,150,'#555');break}
    case'bookcase':{rr(-w/2,-190,w,190,4,'#6d4e32');for(let i=0;i<4;i++){B(-w/2+6,-184+i*46+40,w-12,6,'#4a3420');for(let j=0;j<12;j++)B(-w/2+12+j*(w-24)/12,-182+i*46+8,(w-24)/12-2,32,['#c44','#48a','#4a6','#ca4','#84a','#4aa'][(i*3+j)%6])}break}
    case'weights':B(-w/2,-60,w,10,'#333');B(-w/2+16,-60,10,60,'#444');B(w/2-26,-60,10,60,'#444');B(-w/2+4,-120,w-8,8,'#aaa');B(-w/2+8,-160,16,92,'#222');B(w/2-24,-160,16,92,'#222');B(-w/2+30,-146,10,64,'#222');B(w/2-40,-146,10,64,'#222');break;
    case'bag':B(-2,-260,4,100,'#555');rr(-24,-168,48,120,16,'#8a3a2a','#3a1a10');B(-24,-120,48,8,'#222');break;
    case'pullup':B(-w/2,-200,10,200,'#666');B(w/2-10,-200,10,200,'#666');B(-w/2,-200,w,10,'#777');break;
    case'hoop':B(-4,-300,8,300,'#555');rr(-48,-320,72,50,3,'#ddd','#444');c.strokeStyle='#e66';c.lineWidth=5;c.beginPath();c.ellipse(-52,-262,18,6,0,0,TAU);c.stroke();break;
    case'fence':{
      const hw=w/2,h=150;c.strokeStyle='rgba(190,195,200,.75)';c.lineWidth=2;
      const seg=[];
      for(let x=-hw;x<hw;x+=150){const idx=Math.floor((p.x+x)/150);if(G.cut[idx])continue;
        c.beginPath();for(let i=0;i<=15;i++){c.moveTo(x+i*10,-h);c.lineTo(x+i*10+(i%2?20:-20),0)}c.stroke();
        c.beginPath();for(let i=0;i<=8;i++){c.moveTo(x,-h+i*h/8);c.lineTo(x+150,-h+i*h/8)}c.stroke();}
      for(let x=-hw;x<=hw;x+=150)B(x-3,-h-10,6,h+10,'#6a6e74');B(-hw,-h-10,w,6,'#6a6e74');break}
    case'cot':rr(-w/2,-40,w,16,3,'#555');rr(-w/2+8,-58,w-16,18,5,'#7a7a60');B(-w/2+6,-24,8,24,'#444');B(w/2-14,-24,8,24,'#444');break;
    case'gate':{const hw=w/2;B(-hw-14,-220,14,220,'#3a3d44');B(hw,-220,14,220,'#3a3d44');B(-hw-14,-230,w+28,14,'#3a3d44');
      c.fillStyle='#555a63';for(let i=0;i<=10;i++)B(-hw+i*(w/10)-3,-216,8,216,'#59606a');B(-hw,-110,w,8,'#59606a');c.fillStyle=G.flags.gateOpen?'#5aff8a':'#ff5a4a';c.beginPath();c.arc(0,-240,7,0,TAU);c.fill();break}
  }
  c.restore();
}

/* ---------- personagens ---------- */
function drawChar(e,sx,gy,s,opt){
  opt=opt||{};
  const f=e.face||1,mov=e.moving,ph=mov?Math.sin(e.walk*11):0,big=(e.big||1)*s;
  c.save();c.translate(sx,gy);
  c.fillStyle='rgba(0,0,0,.32)';c.beginPath();c.ellipse(0,0,30*big,8*big,0,0,TAU);c.fill();
  c.scale(f*big,big);
  const suit=e.uniform?'#243f78':e.suit||'#e07a1c',skin=e.skin||'#d9a273',hair=e.hair||'#222';
  const hurt=e.hurt>0&&Math.floor(GT*30)%2===0;
  if(e.ko>0){
    c.rotate(-Math.PI/2);c.translate(-55,0);
    rr(-18,-18,60,36,10,suit);rr(-14,-96,28,60,10,suit);c.fillStyle=skin;c.beginPath();c.arc(-18,-8,15,0,TAU);c.fill();
    c.fillStyle='#000';c.font='bold 14px system-ui';c.fillText('x',-10,-38);
    c.restore();return;
  }
  const fall=e.sleeping?0:0;
  /* pernas */
  const lk=ph*13;
  rr(-17,-48+0,15,48,6,shade(suit,-.25));rr(2,-48,15,48,6,shade(suit,-.25));
  c.save();c.translate(-9,-2);c.rotate(ph*.5);rr(-8,-46,16,46,6,shade(suit,-.22));rr(-9,-6,20,8,3,'#222');c.restore();
  c.save();c.translate(9,-2);c.rotate(-ph*.5);rr(-8,-46,16,46,6,shade(suit,-.1));rr(-7,-6,20,8,3,'#222');c.restore();
  /* tronco */
  rr(-21,-98,42,58,12,hurt?'#fff':suit);
  if(e.guard){R(-21,-52,42,7,'#222');R(-3,-95,6,40,'rgba(255,255,255,.12)');c.fillStyle='#ffd54a';c.beginPath();c.arc(8,-82,4,0,TAU);c.fill()}
  else{R(-12,-86,24,16,'rgba(255,255,255,.88)');c.fillStyle='#222';c.font='bold 11px system-ui';c.textAlign='center';c.fillText(String(e.num||(e.name?e.name.length*37+101:'007')),0,-74)}
  if(e.band){R(-21,-92,42,7,e.band)}
  /* braços */
  const atk=e.atk>0;
  c.save();c.translate(-19,-90);c.rotate(-ph*.6);rr(-6,0,12,40,6,shade(suit,-.15));c.fillStyle=skin;c.beginPath();c.arc(0,42,7,0,TAU);c.fill();c.restore();
  c.save();c.translate(19,-90);
  if(atk){c.rotate(-1.45);rr(-6,0,12,44,6,suit);c.fillStyle=skin;c.beginPath();c.arc(0,48,8,0,TAU);c.fill()}
  else{c.rotate(ph*.6);rr(-6,0,12,40,6,suit);c.fillStyle=skin;c.beginPath();c.arc(0,42,7,0,TAU);c.fill()}
  c.restore();
  /* cabeça */
  R(-6,-106,12,10,skin);
  c.fillStyle=hurt?'#fff':skin;c.beginPath();c.arc(0,-118,16,0,TAU);c.fill();
  if(e.guard||e.uniform){c.fillStyle='#1b2a52';c.beginPath();c.arc(0,-124,17,Math.PI,0);c.fill();R(2,-126,22,6,'#14203f');R(-17,-126,34,5,'#14203f')}
  else if(e.fem){c.fillStyle=hair;c.beginPath();c.arc(0,-122,17,Math.PI*.9,Math.PI*2.1);c.fill();rr(-18,-122,10,38,5,hair)}
  else{c.fillStyle=hair;c.beginPath();c.arc(0,-123,16,Math.PI,0);c.fill()}
  c.fillStyle='#111';c.beginPath();c.arc(7,-119,2.2,0,TAU);c.fill();
  if(e.sleeping){c.restore();return}
  c.restore();
  /* indicadores */
  const topY=gy-150*big;
  if(e.talkT>0&&e.talk){
    c.font='bold 15px system-ui';const tw=c.measureText(e.talk).width+20;
    rr(sx-tw/2,topY-34,tw,28,10,'#fff');c.beginPath();c.moveTo(sx-6,topY-6);c.lineTo(sx,topY+4);c.lineTo(sx+6,topY-6);c.fillStyle='#fff';c.fill();
    c.fillStyle='#111';c.textAlign='center';c.fillText(e.talk,sx,topY-14);
  }
  if(opt.name){c.font='bold 13px system-ui';c.textAlign='center';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.7)';c.strokeText(opt.name,sx,topY+0);c.fillStyle=opt.col||'#fff';c.fillText(opt.name,sx,topY+0)}
  if(e.mhp&&e.hp<e.mhp&&(e.aggro>0||e.state==='chase'||e.hurt>0)&&e.hp>0){const bw=56;R(sx-bw/2,topY+6,bw,6,'rgba(0,0,0,.6)');R(sx-bw/2,topY+6,bw*Math.max(0,e.hp/e.mhp),6,e.guard?'#4a7aff':'#e55')}
  if(e.state==='chase'||e.state==='revista'){c.font='900 26px system-ui';c.textAlign='center';c.fillStyle=e.state==='chase'?'#ff3b3b':'#ffb04d';c.fillText('!',sx,topY-8)}
}

/* ---------- luz / escuridão ---------- */
function drawLight(sc,x0,x1){
  const d=sc.out?darkness():darkness()*.72;
  if(d<.03)return;
  const W=cv.width,H=cv.height;
  if(lightCv.width!==W||lightCv.height!==H){lightCv.width=W;lightCv.height=H}
  lc.setTransform(1,0,0,1,0,0);lc.globalCompositeOperation='source-over';lc.clearRect(0,0,W,H);
  lc.fillStyle='rgba(4,7,22,'+d+')';lc.fillRect(0,0,W,H);
  lc.globalCompositeOperation='destination-out';
  lc.setTransform(KK,0,0,KK,-cam.x*KK+cam.sx*KK,0);
  const hole=(x,y,r,a)=>{const g=lc.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(1,'rgba(0,0,0,0)');lc.fillStyle=g;lc.fillRect(x-r,y-r,r*2,r*2)};
  for(const dc of sc.decor)if(dc.t==='lamp'&&dc.x>x0-300&&dc.x<x1+300)hole(dc.x,200,330,.95);
  if(sc.out){for(let x=300;x<sc.w;x+=620)hole(x,260,300,.8);
    if(beamsOn()&&!sc.street){
      for(let i=0;i<2;i++){const bx=beamX(i),tx=i?sc.w-250:250;
        lc.beginPath();lc.moveTo(tx-12,40);lc.lineTo(tx+12,40);lc.lineTo(bx+170,FY1+55);lc.lineTo(bx-170,FY1+55);lc.closePath();
        const g=lc.createLinearGradient(0,40,0,FY1);g.addColorStop(0,'rgba(0,0,0,.9)');g.addColorStop(1,'rgba(0,0,0,.95)');lc.fillStyle=g;lc.fill()}
    }}
  hole(P.x,zY(P.z)-70,170,.55);
  lc.setTransform(1,0,0,1,0,0);
  c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(lightCv,0,0);c.restore();
}
function drawBeamGlow(sc){
  if(!sc.out||sc.street||!beamsOn())return;
  for(let i=0;i<2;i++){const bx=beamX(i),tx=i?sc.w-250:250;
    c.fillStyle='rgba(255,244,190,.13)';c.beginPath();c.moveTo(tx-12,40);c.lineTo(tx+12,40);c.lineTo(bx+170,FY1+55);c.lineTo(bx-170,FY1+55);c.closePath();c.fill();
    c.fillStyle='rgba(255,244,190,.14)';c.beginPath();c.ellipse(bx,FY1+30,170,30,0,0,TAU);c.fill()}
}
function drawCone(g,sc){/* cone de lanterna do guarda (exterior de noite) */
  if(!sc.out||darkness()<.35||g.scene!==sc.id)return;
  const x=g.x,y=zY(g.z)-90,d=g.face;
  const gr=c.createLinearGradient(x,0,x+d*520,0);gr.addColorStop(0,'rgba(255,246,200,.3)');gr.addColorStop(1,'rgba(255,246,200,0)');
  c.fillStyle=gr;c.beginPath();c.moveTo(x+d*14,y);c.lineTo(x+d*520,y-90);c.lineTo(x+d*520,y+130);c.closePath();c.fill();
}

/* ---------- cena completa ---------- */
function render(now){
  now_=now;
  const W=cv.width,H=cv.height;KK=H/LH;VW=W/KK;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#07080b';c.fillRect(0,0,W,H);
  const sc=SC[P.scene];if(!sc)return;
  /* câmara */
  let target=P.x-VW/2;
  if(sc.w<=VW)target=-(VW-sc.w)/2;else target=clamp(target,0,sc.w-VW);
  cam.x+=(target-cam.x)*(G.started?.14:1);
  if(P.shake>0)cam.sx=(Math.random()-.5)*10;else cam.sx=0;
  const x0=cam.x-60,x1=cam.x+VW+60;
  c.setTransform(KK,0,0,KK,(-cam.x+cam.sx)*KK,0);
  drawBG(sc,Math.max(-200,x0),Math.min(sc.w+200,x1));
  /* limites da sala (parede esquerda/direita fora do mundo) */
  drawDecor(sc,x0,x1);
  for(const d of sc.doors)if(d.x>x0-120&&d.x<x1+120)drawDoor(d,sc.id);
  drawBeamGlow(sc);
  /* entidades */
  const L=[];
  for(const p of sc.props)if(p.x+p.w/2>x0&&p.x-p.w/2<x1)L.push({z:p.z,k:'p',o:p});
  for(const n of NPC)if(n.scene===P.scene&&n.x>x0-100&&n.x<x1+100)L.push({z:n.z,k:'e',o:n});
  for(const g of GUARDS)if(g.scene===P.scene&&g.x>x0-100&&g.x<x1+100)L.push({z:g.z,k:'e',o:g});
  if(typeof Net==='object')for(const id in Net.peers){const r=Net.peers[id];if(r.scene===P.scene)L.push({z:r.z,k:'r',o:r})}
  L.push({z:P.z,k:'me',o:P});
  L.sort((a,b)=>a.z-b.z);
  for(const it of L){
    const o=it.o,gy=zY(o.z),s=zS(o.z);
    if(it.k==='p')P_(o.t,o,gy-(o.t==='bag'||o.t==='hoop'||o.t==='fence'?0:0),(o.t==='fence'?1:s));
    else if(it.k==='me'){
      if(P.sleeping){c.font='bold 22px system-ui';c.fillStyle='#bcd';c.textAlign='center';c.fillText('Z z z',P.x,gy-150)}
      else drawChar(Object.assign({},P,{atk:P.atk,band:P.gang?GANG[P.gang].c:null,uniform:P.uniform,guard:false}),P.x,gy,s,{name:null})}
    else if(it.k==='r'){drawChar(o,o.x,gy,s,{name:o.name,col:o.tag||'#9fd3ff'})}
    else{
      const near=Math.abs(o.x-P.x)<260&&Math.abs(o.z-P.z)<.5;
      drawChar(o,o.x,gy,s,{name:near&&(o.talkable||o.guard)&&!o.ko?o.name:null,col:o.guard?'#9fb8ff':'#ffe9a0'});
      if(o.guard)drawCone(o,sc);
    }
  }
  /* efeitos de texto */
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t-=1/60;if(f.t<=0){fx.splice(i,1);continue}
    if(f.s&&f.s!==P.scene)continue;
    const y=zY(f.z||P.z)-150-(1-f.t)*40;c.font='bold 18px system-ui';c.textAlign='center';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.75)';c.strokeText(f.txt,f.x,y);c.fillStyle=f.col||'#fff';c.fillText(f.txt,f.x,y)}
  /* escuro + luz */
  c.setTransform(1,0,0,1,0,0);
  drawLight(sc,x0,x1);
  /* vinheta de alarme */
  if(alarm>0){c.setTransform(1,0,0,1,0,0);const a=.12+.1*Math.sin(now*8);c.fillStyle='rgba(255,40,40,'+a+')';c.fillRect(0,0,W,H)}
  c.setTransform(1,0,0,1,0,0);
}

/* ================= SISTEMAS ================= */
const mc=n=>Math.round(n)+' Kz';
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
  E(420,()=>{if(!G.solitary){pa('Atenção, reclusos: chamada nas celas.');banner('CHAMADA! Volta à tua cela.','#ffd36b',3200);sfx('alarm')}updateDoors()});
  E(450,()=>{updateDoors();if(G.solitary)return;
    if(zoneAt(P.x,P.y)!=='cela2'&&!P.sleeping){G.chamadaOk=false;G.sentence+=1;P.heat=Math.min(100,P.heat+30);banner('Faltaste à chamada! +1 dia de pena.','#ff7b7b',3500)}
    else banner('Chamada concluída.','#9fe3a0')});
  E(480,()=>{if(!G.solitary&&hh()<12)toast('Horário de trabalho. Fala com o Sr. Mateus na secretaria (corredor).',3500)});
  E(720,()=>{G.workOk=!!(P.job&&P.tasks>=2);if(P.job&&!G.workOk&&!G.solitary)toast('Não cumpriste o trabalho da manhã.');if(G.workOk)toast('Trabalho cumprido: conta para a pena.');P.tasks=0});
  E(780,()=>{updateDoors();if(!G.solitary)pa('O pátio está aberto. Boa tarde, reclusos.');banner('Tempo livre: o pátio abriu.','#9fe3a0',2800)});
  E(930,()=>{if(!G.solitary&&Math.random()<(P.gang?.34:.18))rivalAttack()});
  E(1110,()=>{updateDoors();if(!G.solitary)pa('O pátio fecha em dez minutos.')});
  E(1155,()=>{if(!G.solitary)toast('A cantina fecha às 21:00. Volta à cela antes das 21:00.',3000)});
  E(1260,()=>{updateDoors();if(!G.solitary)pa('Recolher. Todos os reclusos para as celas.');banner('RECOLHER! Vai para a tua cela.','#ff9f6b',3200)});
  [1410,90,210].forEach(m=>E(m,()=>ronda()));
  if(Math.floor(a/60)!==Math.floor(b/60))hourHook();
}
function hourHook(){updateDoors();saveGame()}
function newDay(){
  G.stats.days++;
  const good=G.chamadaOk&&G.workOk&&!G.solDay;
  G.sentence-=good?2:1;
  if(P.gang){P.money+=8;toast('O teu bando mandou-te 8 Kz.')}
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
function endGame0(kind){
  if(G.over)return;G.over=true;G.paused=true;
  localStorage.removeItem('pm_v2');
  const T_={legal:['Liberdade!','Cumpriste a pena com bom comportamento e saíste pela porta da frente.'],
    portao:['Fugiste pelo portão!','Com a chave e o disfarce, o guarda abriu-te o portão. Ninguém desconfiou… por agora.'],
    cerca:['Fugiste pela cerca!','Cortaste a rede de noite e desapareceste na escuridão.'],
    rua:['Liberdade total!','Despistaste a polícia e desapareceste na cidade. Ninguém te vai encontrar… por agora.'],
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
    const dmg=(6+P.str*.95+wpn())*rnd(.8,1.2)*(P.en<10?.6:1);
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
    if(m.state==='ready'){m.state='done';P.money+=m.reward;P.rep+=m.rep;any=true;toast('Missão concluída: +'+m.reward+' Kz, +'+m.rep+' respeito',3400);sfx('coin');
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
function doAct0(a){
  if(!a||G.paused||P.busy||P.sleeping)return;
  if(a.kind==='talk')return talk(a.n);
  if(a.kind==='loot'){
    P.crime=Math.max(P.crime,3);
    const n=a.n;
    if(n.guard){
      if(!n.looted){n.looted=true;if(Math.random()<.6){addItem('chave',1);banner('Encontraste uma chave no guarda!','#ffe08a')}else toast('Nada de útil.')}else toast('Já revistaste este guarda.');
      return}
    if(n.looted){toast('Já não tem nada.');return}
    n.looted=true;const g=ri(6,26);P.money+=g;fx.push({x:P.x,y:P.y-T,t:1,txt:'+'+g+' Kz',col:'#ffe08a'});sfx('coin');
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
function objAct0(o){
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
    if(P.money<5){toast('Precisas de 5 Kz para telefonar.');return}
    if(G.famCall){toast('Já falaste hoje com a família.');return}
    P.money-=5;G.famCall=true;const g=ri(10,25);P.money+=g;banner('A tua família mandou '+g+' Kz!','#ffe08a');sfx('coin');return}
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
    if(ok>=2){const pay=J.pay+Math.floor(P.str*.0);P.money+=pay;P.tasks++;G.stats.jobs++;P.rep+=.1;fx.push({x:P.x,y:P.y-T,t:1.1,txt:'+'+pay+' Kz',col:'#ffe08a'});sfx('coin')}
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
  b.push({t:'Perguntar as novidades',f:()=>{say(n,newsLine(),4);closePanel()}});
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
  else if(it.phone){if(G.fam2===S.day){toast('Já usaste hoje.')}else{G.fam2=S.day;const g=ri(15,35);P.money+=g;P.heat=Math.min(100,P.heat+12);banner('A família mandou '+g+' Kz.','#ffe08a');sfx('coin')}}
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
  const h=act.length?act.map(m=>'<p>• '+m.title+' <span class="sm">['+(m.state==='ready'?'pronta: volta ao '+m.giver:'em curso')+' · '+m.reward+' Kz]</span></p>').join(''):'<p>Sem missões. Fala com o Zeca ou com os chefes dos bandos.</p>';
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
    localStorage.setItem('pm_v2',JSON.stringify(d));
  }catch(e){}
}
function loadGame(){
  try{
    const d=JSON.parse(localStorage.getItem('pm_v2')||'null');if(!d)return false;
    S.t=d.S.t;S.day=d.S.day;Object.assign(P,d.P);P.sleeping=false;
    Object.assign(G,d.G);
    for(const k in G.cut){const[x,y]=k.split(',').map(Number);grid[gi(x,y)]=CUT}
    return true;
  }catch(e){return false}
}
function hasSave(){try{return!!localStorage.getItem('pm_v2')}catch(e){return false}}

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
  $('#hMoney').textContent=Math.round(P.money)+' Kz';$('#hPena').textContent=Math.max(0,Math.round(G.sentence))+' dias de pena';
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
  try{localStorage.removeItem('pm_v2')}catch(e){}
  location.hash='#novo';location.reload();
});
$('#cont').addEventListener('click',()=>{audioInit();startGame(true)});
$('#againB').addEventListener('click',()=>{try{localStorage.removeItem('pm_v2')}catch(e){}location.hash='#novo';location.reload()});
window.addEventListener('beforeunload',saveGame);
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame()});

/* ================= MODO ONLINE (amigos) =================
   Usa a Realtime Database do Firebase por HTTPS (REST + SSE), sem bibliotecas.
   Cada jogador corre a sua prisão; os amigos veem-se, falam, lutam, trocam itens
   e os alarmes de um distraem os guardas dos outros. */
const Net={on:false,db:'',room:'',id:'',name:'',es:null,mirror:{},peers:{},host:false,seq:0,lastSeq:{},ready:false,
  chat:[],lastPos:'',posT:0,beat:0,clockT:0,errT:0,status:'',t0:0};
const ROOM_CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function dbOK(u){return /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(firebaseio\.com|firebasedatabase\.app)\/?$/i.test(u)||/^http:\/\/(127\.0\.0\.1|localhost):\d+\/?$/.test(u)}
function clean(s,n){return String(s||'').replace(/[<>&"'`\\]/g,'').trim().slice(0,n||12)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function nurl(path,q){return Net.db.replace(/\/$/,'')+'/pm/rooms/'+Net.room+path+'.json'+(q||'')}
function nput(path,data){return fetch(nurl(path,'?print=silent'),{method:'PUT',body:JSON.stringify(data),keepalive:true}).catch(()=>{})}
function ndel(path){return fetch(nurl(path,'?print=silent'),{method:'DELETE',keepalive:true}).catch(()=>{})}
function peerColor(id){let h=0;for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))%360;return'hsl('+h+',85%,62%)'}
const SAVED=()=>{try{return JSON.parse(localStorage.getItem('pm_net')||'{}')}catch(e){return{}}};
function saveNet(o){try{localStorage.setItem('pm_net',JSON.stringify(Object.assign(SAVED(),o)))}catch(e){}}

/* mirror: aplica put/patch do Firebase */
function applyPath(path,data,merge){
  const seg=path.split('/').filter(Boolean);
  if(!seg.length){if(merge&&data&&typeof data==='object'){for(const k in data){if(data[k]===null)delete Net.mirror[k];else Net.mirror[k]=data[k]}}else Net.mirror=data||{};return}
  let o=Net.mirror;
  for(let i=0;i<seg.length-1;i++){if(typeof o[seg[i]]!=='object'||o[seg[i]]===null)o[seg[i]]={};o=o[seg[i]]}
  const last=seg[seg.length-1];
  if(merge&&data&&typeof data==='object'){if(typeof o[last]!=='object'||o[last]===null)o[last]={};for(const k in data){if(data[k]===null)delete o[last][k];else o[last][k]=data[k]}}
  else if(data===null||data===undefined)delete o[last];else o[last]=data;
}
function netConnect(room,name,db,create){
  if(Net.on)netLeave(true);
  db=String(db||'').trim();
  if(!dbOK(db)){toast('Endereço da base de dados inválido. Tem de acabar em firebaseio.com ou firebasedatabase.app.',4200);return false}
  room=clean(room,6).toUpperCase();
  if(!room){toast('Escreve o código da sala.');return false}
  name=clean(name,12)||'Preso'+ri(10,99);
  Object.assign(Net,{db,room,name,id:Math.random().toString(36).slice(2,8),mirror:{},peers:{},lastSeq:{},ready:false,seq:0,chat:[],host:false,beat:0,lastPos:'',t0:performance.now(),status:'a ligar…',create:!!create});
  saveNet({db,name,room});
  try{
    const es=new EventSource(nurl(''));Net.es=es;
    es.addEventListener('put',e=>netMsg(e,false));es.addEventListener('patch',e=>netMsg(e,true));
    es.onerror=()=>{Net.status=Net.ready?'a reconectar…':'sem ligação';Net.errT=performance.now()};
    es.addEventListener('cancel',()=>{Net.status='sem permissão (regras da base de dados)';toast('A base de dados recusou a ligação. Vê as regras (leitura/escrita).',5000)});
  }catch(e){toast('Não consegui ligar.');return false}
  Net.on=true;return true;
}
function netMsg(e,merge){
  let d;try{d=JSON.parse(e.data)}catch(_){return}
  if(!d)return;
  applyPath(d.path||'/',d.data,merge);
  if(d.path==='/'&&!merge&&!Net.ready){
    /* primeiro snapshot */
    const pl=Net.mirror.players||{};
    const n=Object.keys(pl).filter(k=>k!==Net.id).length;
    if(n>=6){toast('Sala cheia (máximo 6 jogadores).');netLeave(true);return}
    if(!Net.create&&n===0&&!Net.mirror.clock){toast('Sala '+Net.room+' vazia: és o primeiro a entrar.',3200)}
    for(const sid in(Net.mirror.ev||{})){let m=0;for(const k in Net.mirror.ev[sid])m=Math.max(m,Net.mirror.ev[sid][k].seq||0);Net.lastSeq[sid]=m}
    Net.ready=true;Net.status='online';
    netSendPos(true);
    if(Net.mirror.clock&&n>0)netAdoptClock(true);
    banner('Sala '+Net.room+' · '+(n+1)+' jogador(es)','#9fe3a0',2400);sfx('ok');
  }
  if(Net.ready)netSync();
}
function netSync(){
  const now=performance.now(),pl=Net.mirror.players||{};
  for(const id in pl){
    if(id===Net.id)continue;
    const d=pl[id];if(!d||typeof d.x!=='number')continue;
    let p=Net.peers[id];
    if(!p){p=Net.peers[id]={id,remote:true,x:d.x,z:d.z,tx:d.x,tz:d.z,scene:d.s,suit:'#e07a1c',face:1,walk:0,col:'#ff8a1f',skin:SKINS[(id.charCodeAt(0)+id.charCodeAt(1))%SKINS.length],hair:HAIRS[id.charCodeAt(2)%HAIRS.length],hp:100,mhp:100,last:now,beat:-1,name:'',tag:peerColor(id)};
      toast((clean(d.n)||'Um amigo')+' entrou na prisão.',2600);sfx('ok')}
    p.name=clean(d.n);p.tx=d.x;p.tz=d.z;p.scene=d.s;p.face=d.f<0?-1:1;p.atk=d.a?.25:0;p.ko=d.k?1:0;p.uniform=!!d.u;p.hp=d.h||0;p.zone=SC[d.s]?SC[d.s].n:'';p.gang=d.g||null;
    if(d.b!==p.beat){p.beat=d.b;p.last=now}
  }
  for(const id in Net.peers)if(!pl[id]||now-Net.peers[id].last>14000){toast((Net.peers[id].name||'Um amigo')+' saiu.',2200);delete Net.peers[id]}
  /* anfitrião = menor id */
  const ids=Object.keys(Net.peers).concat([Net.id]).sort();Net.host=ids[0]===Net.id;
  if(!Net.host)netAdoptClock(false);
  /* eventos */
  const ev=Net.mirror.ev||{};
  for(const sid in ev){
    if(sid===Net.id)continue;
    const list=Object.values(ev[sid]||{}).filter(x=>x&&x.seq>(Net.lastSeq[sid]||0)).sort((a,b)=>a.seq-b.seq);
    list.forEach(x=>{Net.lastSeq[sid]=x.seq;if(!x.to||x.to===Net.id||x.to==='all')netEvent(sid,x)});
  }
}
function netAdoptClock(force){
  const c=Net.mirror.clock;if(!c||typeof c.t!=='number')return;
  const abs=c.day*1440+c.t,me=S.day*1440+S.t;
  if(force||Math.abs(abs-me)>6){S.day=c.day;S.t=c.t;updateDoors();if(force)snapNPCs()}
}
function netSendPos(force){
  if(!Net.on||!Net.ready)return;
  const now=performance.now();
  const o={n:Net.name,x:Math.round(P.x),z:Math.round(P.z*1000)/1000,s:P.scene,f:P.face,a:P.atk>0?1:0,k:P.sleeping?1:0,u:P.uniform?1:0,h:Math.round(P.hp),g:P.gang||0};
  const key=o.x+','+o.z+','+o.s+','+o.f+','+o.a+','+o.k+','+o.u;
  if(!force&&key===Net.lastPos&&now-Net.posT<2000)return;
  Net.lastPos=key;Net.posT=now;Net.beat++;o.b=Net.beat;
  nput('/players/'+Net.id,o);
}
function netEmit(type,extra,to){
  if(!Net.on||!Net.ready)return;
  Net.seq++;const o=Object.assign({seq:Net.seq,type,to:to||'all',n:Net.name,ts:Date.now()},extra||{});
  nput('/ev/'+Net.id+'/'+(Net.seq%8),o);
}
function netEvent(sid,x){
  const p=Net.peers[sid],nm=clean(x.n)||(p&&p.name)||'Um amigo';
  if(x.type==='chat'){
    const m=clean(x.m,80);if(!m)return;
    Net.chat.push({n:nm,m});if(Net.chat.length>30)Net.chat.shift();
    if(p){p.talk=m.slice(0,40);p.talkT=5}
    toast(nm+': '+m,3200);sfx('tick');
  }else if(x.type==='hit'){
    if(x.to!==Net.id||G.over||P.sleeping&&false)return;
    hurtPlayer(clamp(+x.d||3,1,20),p);P.shake=.2;
    toast(nm+' bateu-te!',1500);
    if(P.hp<=0){}
  }else if(x.type==='give'){
    if(x.to!==Net.id)return;
    if(x.mc){P.money+=Math.round(clamp(+x.mc||0,0,500));banner(nm+' deu-te '+Math.round(x.mc)+' Kz','#ffe08a');sfx('coin')}
    if(x.it&&ITEMS[x.it]){addItem(x.it,1);banner(nm+' deu-te: '+ITEMS[x.it].n,'#ffe08a');sfx('coin')}
  }else if(x.type==='alarm'){
    banner(nm+' fez soar o alarme! Os guardas foram ver.','#ffb04d',3200);
    distractGuards(+x.x,x.s);
  }else if(x.type==='jail'){toast(nm+' foi apanhado e levado para a solitária.',3200)}
  else if(x.type==='escape'){banner(nm+' FUGIU DA PRISÃO!','#9fe3a0',4500);sfx('ok')}
}
function distractGuards(px,sid){
  if(!isFinite(px)||!SC[sid]||sid==='off')return;
  GUARDS.forEach(g=>{
    if(g.fixed||g.state==='chase'||g.state==='revista')return;
    g.inv={t:14,scene:sid,x:clamp(px,100,SC[sid].w-100)};
  });
}
function netLeave(silent){
  if(Net.es){try{Net.es.close()}catch(e){}}
  if(Net.on&&Net.id)ndel('/players/'+Net.id);
  Net.on=false;Net.ready=false;Net.peers={};Net.es=null;Net.status='';
  if(!silent)toast('Saíste da sala.');
}
const peersList=()=>Object.values(Net.peers);
function netUpdate(dt){
  if(!Net.on||!Net.ready)return;
  for(const p of peersList()){
    const dx=p.tx-p.x,dy=(p.tz-p.z)*600,d=Math.hypot(dx,dy);
    p.moving=d>3;if(d>400){p.x=p.tx;p.z=p.tz}else{p.x+=dx*Math.min(1,dt*10);p.z+=(p.tz-p.z)*Math.min(1,dt*10)}
    if(p.moving)p.walk+=dt;
    if(p.talkT>0)p.talkT-=dt;
  }
  Net.posT0=(Net.posT0||0)-dt;
  if(Net.posT0<=0){Net.posT0=.2;netSendPos(false)}
  Net.clockT-=dt;
  if(Net.clockT<=0){Net.clockT=4;if(Net.host)nput('/clock',{t:Math.floor(S.t),day:S.day})}
}

/* ================= INTERFACE ================= */
function shareLink(){
  const u=location.origin+location.pathname+'?sala='+Net.room+'&db='+encodeURIComponent(Net.db);
  return u;
}
function netPanel(){
  if(Net.on&&Net.ready)return friendsPanel();
  const sv=SAVED(),q=new URLSearchParams(location.search);
  const room=clean(q.get('sala')||sv.room||'',6).toUpperCase();
  const db=q.get('db')||sv.db||'https://pena-maxima-default-rtdb.firebaseio.com';
  openPanel('Jogar com amigos',
   '<p>Até 6 jogadores na mesma sala. Cada um vê os amigos, fala, luta, troca itens e os alarmes de um distraem os guardas dos outros.</p>'+
   '<p class="sm">O teu nome</p><input id="nName" maxlength="12" value="'+esc(sv.name||'')+'" placeholder="ex.: Arão">'+
   '<p class="sm">Endereço da base de dados (Firebase). Só precisas de o pôr uma vez.</p><input id="nDb" value="'+esc(db)+'" placeholder="https://o-teu-projeto-default-rtdb.firebaseio.com">'+
   '<p class="sm">Código da sala (4 letras). Deixa vazio para criar uma nova.</p><input id="nRoom" maxlength="6" value="'+esc(room)+'" placeholder="ABCD" style="text-transform:uppercase">',
   [{t:'Criar sala nova',f:()=>doConnect(true)},{t:'Entrar na sala do código',f:()=>doConnect(false)},{t:'Como configurar (1 vez)',f:setupHelp},{t:'Fechar',f:closePanel}]);
}
function doConnect(create){
  const name=$('#nName').value,db=$('#nDb').value;let room=$('#nRoom').value;
  if(create||!room){room='';for(let i=0;i<4;i++)room+=ROOM_CH[ri(0,ROOM_CH.length-1)];create=true}
  if(!G.started)startGame(hasSave());
  if(netConnect(room,name,db,create)){closePanel();toast('A ligar à sala '+room.toUpperCase()+'…',2500)}
  else if(!G.started){/* continua no título */}
}
function setupHelp(){
  openPanel('Configurar o online (1 vez, grátis)',
   '<p>1. No Chrome abre <b>console.firebase.google.com</b> e entra com o teu Gmail.</p>'+
   '<p>2. <b>Criar projeto</b> (nome à tua escolha, podes desligar o Analytics) e espera acabar.</p>'+
   '<p>3. No menu da esquerda: <b>Criação → Realtime Database → Criar base de dados</b>. Escolhe a região e depois <b>Iniciar em modo de teste</b>.</p>'+
   '<p>4. No topo vês um endereço tipo <b>https://xxxx-default-rtdb.firebaseio.com</b>. Copia-o e cola aqui no jogo.</p>'+
   '<p>5. No separador <b>Regras</b> cola isto e toca em <b>Publicar</b> (assim só o jogo escreve):</p>'+
   '<p class="sm" style="user-select:text;-webkit-user-select:text">{"rules":{"pm":{".read":true,".write":true},".read":false,".write":false}}</p>'+
   '<p>Depois cria a sala e envia o link aos amigos pelo WhatsApp. Eles só tocam no link.</p>',
   [{t:'Voltar',f:netPanel}]);
}
function friendsPanel(){
  const ps=peersList();
  const roster=ps.length?ps.map(p=>'<p><b style="color:'+p.tag+'">●</b> '+esc(p.name||'Amigo')+' <span class="sm">· '+(p.hp<=0?'KO':Math.round(p.hp)+' de vida')+(p.zone?' · '+esc(p.zone):'')+'</span></p>').join(''):'<p class="sm">Ainda ninguém além de ti. Envia o link.</p>';
  const log=Net.chat.slice(-5).map(c=>'<p class="sm"><b>'+esc(c.n)+':</b> '+esc(c.m)+'</p>').join('');
  openPanel('Sala '+Net.room+' · '+(ps.length+1)+' online',
   '<p>Tu: <b>'+esc(Net.name)+'</b>'+(Net.host?' (anfitrião do relógio)':'')+'</p>'+roster+(log?'<hr style="border:0;border-top:1px solid rgba(255,255,255,.15);margin:8px 0">'+log:''),
   [{t:'Enviar mensagem',f:chatPanel},{t:'Partilhar o link da sala',f:shareRoom},{t:'Sair da sala',f:()=>{netLeave();closePanel()}},{t:'Fechar',f:closePanel}]);
}
function shareRoom(){
  const u=shareLink(),txt='Vem para a prisão comigo! Pena Máxima, sala '+Net.room+': '+u;
  if(navigator.share){navigator.share({title:'Pena Máxima',text:txt,url:u}).catch(()=>{})}
  else if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>toast('Link copiado.')).catch(()=>toast(u,6000))}
  else toast(u,6000);
}
function chatPanel(){
  const q=['Ajuda!','Estou no pátio','Cuidado, guarda!','Bora fugir!','Quem tem uma colher?','Vamos ao refeitório'];
  const b=q.map(m=>({t:m,f:()=>{sendChat(m);closePanel()}}));
  b.unshift({t:'Enviar',f:()=>{const v=$('#cIn').value;if(v.trim()){sendChat(v);closePanel()}}});
  b.push({t:'Voltar',f:friendsPanel});
  openPanel('Mensagem para a sala','<input id="cIn" maxlength="80" placeholder="Escreve aqui…">',b);
  setTimeout(()=>{const i=$('#cIn');if(i)i.focus()},60);
}
function sendChat(m){
  m=clean(m,80);if(!m)return;
  netEmit('chat',{m});Net.chat.push({n:Net.name,m});P.talk=m.slice(0,40);P.talkT=5;toast('Tu: '+m,2200);
}
function friendActPanel(p){
  const b=[{t:'Dar 20 Kz',dis:P.money<20,f:()=>{P.money-=20;netEmit('give',{mc:20},p.id);toast('Deste 20 Kz a '+p.name);sfx('coin');friendActPanel(p)}},
           {t:'Dar 100 Kz',dis:P.money<100,f:()=>{P.money-=100;netEmit('give',{mc:100},p.id);toast('Deste 100 Kz a '+p.name);sfx('coin');friendActPanel(p)}}];
  Object.keys(P.inv).forEach(k=>{if(k!=='bilhete')b.push({t:'Dar '+ITEMS[k].n+' (x'+P.inv[k]+')',f:()=>{takeItem(k);if(k==='uniforme')P.uniform=false;netEmit('give',{it:k},p.id);toast('Deste '+ITEMS[k].n+' a '+p.name);sfx('coin');friendActPanel(p)}})});
  b.push({t:'Dizer algo',f:chatPanel});b.push({t:'Sair',f:closePanel});
  openPanel(esc(p.name||'Amigo'),'<p>Tens '+mc(P.money)+'. Cuidado: se lhe bateres, ele sente.</p>',b);
}
/* botões e entrada */
$('#netB').addEventListener('click',()=>{audioInit();netPanel()});
$('#bC').addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();audioInit();if(panelOpen){closePanel();return}if(Net.on&&Net.ready)chatPanel();else netPanel()});
window.addEventListener('beforeunload',()=>{if(Net.on)netLeave(true)});
(function autoJoin(){
  const q=new URLSearchParams(location.search);
  if(q.get('sala')&&q.get('db')){setTimeout(()=>{if(!G.started)netPanel()},300)}
})();

/* ===== adaptações à vista lateral (substituem as versões anteriores) ===== */
let nearAct=null;
function dist(a,b,c_,d){return Math.hypot(a-c_,b-d)}
function zoneAt(){return P.scene==='cela'?'cela2':P.scene}
function say(n,m,t){n.talk=m;n.talkT=t||2.6}
const sceneW=id=>SC[id]?SC[id].w:1500;
function snapNPCs(){
  const h=hh(),sc=sched(h);
  NPC.forEach(n=>{
    if(n.fixed||n.aggro>0||n.ko>0)return;
    const d=planScene(n,h,sc);n.scene=d;n.tx=null;n.hopT=null;n.wT=0;
    if(d!=='off'){n.x=rnd(300,sceneW(d)-300);n.z=rnd(.4,.85)}
  });
  GUARDS.forEach(g=>{
    g.pend=null;g.inv=null;g.tx=null;
    if(g.fixed){g.state='patrol';return}
    g.state='patrol';g.scene=guardScene(g,h,sc);g.x=rnd(300,sceneW(g.scene)-300);g.z=rnd(.4,.8);
  });
}
function rivalAttack(){
  const enemy=P.gang==='corvos'?'serpentes':P.gang==='serpentes'?'corvos':pick(['corvos','serpentes']);
  const pool=NPC.filter(n=>n.gang===enemy&&!n.leader&&!n.ko);
  if(!pool.length||P.sleeping||P.scene!=='patio')return;
  pool.sort(()=>Math.random()-.5).slice(0,2).forEach(n=>{n.scene='patio';n.aggro=22;n.x=clamp(P.x+(Math.random()<.5?-1:1)*600,100,3200);n.z=rnd(.4,.8)});
  banner('Os '+GANG[enemy].n+' vêm atrás de ti!','#ff7b7b',3000);sfx('bad');
}
function changeScene(to){
  const from=P.scene;if(!SC[to])return;
  guardLeaveFollow(from,to);
  P.scene=to;const d=doorTo(to,from);
  P.x=d?d.x+(d.x<SC[to].w/2?95:-95):300;P.z=.55;P.face=d&&d.x<SC[to].w/2?1:-1;
  cam.x=P.x-VW/2;sfx('door');P.crime=Math.max(0,P.crime);
}
function goDoor(d){
  if(!d.to){toast('Trancada.');return}
  if(doorLocked(P.scene,d)){
    const m=d.k==='cela'?(hh()>=21||hh()<6.5?'A cela está trancada de noite.':'Está a decorrer a chamada: as celas estão fechadas.'):d.k==='patio'?'O pátio só abre das 13:00 às 18:30.':d.k==='cantina'?'A cantina só abre das 13:00 às 21:00.':'Trancada.';
    toast(m);sfx('bad');return}
  changeScene(d.to);
}
function arrest(g,silent){
  if(G.over||G.arresting)return;
  G.arresting=true;G.paused=true;P.busy=null;$('#prog').classList.remove('on');
  if(typeof netEmit==='function'&&Net.on)netEmit('jail',{});cm('Parado aí, recluso! Foste apanhado e a solitária espera por ti.','Guarda');sfx('alarm');banner('APANHADO!','#ff4d4d',2200);pa('Recluso capturado. Solitária.');
  fade(()=>{
    alarm=0;P.heat=0;P.crime=0;P.sleeping=false;S.speed=1;
    const ks=Object.keys(contraband());ks.forEach(k=>delete P.inv[k]);P.uniform=false;
    P.money=Math.floor(P.money*.85);P.hp=Math.max(20,P.hp-12);
    G.sentence+=2;G.stats.solitary++;G.solitary=true;G.solDay=true;
    if(G.tunnel>0){G.tunnel=Math.max(0,G.tunnel-30);takeItem('colher',1,P.stash)}
    for(const k in P.stash)if(ITEMS[k].contra&&Math.random()<.5)delete P.stash[k];
    GUARDS.forEach(gg=>{gg.state='patrol';gg.pend=null});
    advance(720);G.solitary=false;P.food=Math.max(P.food,40);
    P.scene='cela';P.x=760;P.z=.62;cam.x=P.x-VW/2;
    snapNPCs();G.arresting=false;G.paused=false;
    banner('12 horas na solitária. +2 dias de pena'+(ks.length?' e perdeste contrabando.':'.'),'#ffb04d',5200);saveGame();
  });
}
function knockout(){
  if(G.arresting||G.over)return;
  if(P.scene==='rua'){arrest(null);return}
  G.arresting=true;G.paused=true;P.busy=null;P.sleeping=false;S.speed=1;$('#prog').classList.remove('on');
  fade(()=>{
    NPC.forEach(n=>{if(n.aggro>0)n.aggro=0});
    P.hp=45;P.money=Math.floor(P.money*.85);alarm=0;
    const ks=Object.keys(P.inv).filter(k=>ITEMS[k].contra);
    if(ks.length&&Math.random()<.5){const k=pick(ks);takeItem(k,1);toast('Alguém te roubou: '+ITEMS[k].n)}
    P.scene='enfermaria';P.x=640;P.z=.6;cam.x=P.x-VW/2;
    advance(180);snapNPCs();G.arresting=false;G.paused=false;
    banner('Acordaste na enfermaria. Perdeste dinheiro.','#9fd3ff',3600);
  });
}
function attack(){
  if(P.cd>0||P.busy||P.sleeping||G.paused)return;
  P.cd=.4;P.atk=.2;P.en=Math.max(0,P.en-1.2);sfx('punch');
  for(const n of ALL()){
    if(n.scene!==P.scene||n.ko>0||(n.fixed&&!n.guard&&!n.isShop))continue;
    const dx=n.x-P.x,dz=n.z-P.z;
    if(Math.abs(dx)>120||Math.abs(dz)>.17||dx*P.face<-25)continue;
    const dmg=(7+P.str*.22+wpn())*rnd(.8,1.2)*(P.en<10?.6:1);
    n.hp-=dmg;n.hurt=.2;n.x+=P.face*18;
    fx.push({x:n.x,z:n.z,s:n.scene,t:.7,txt:Math.round(dmg),col:'#ffe08a'});
    P.crime=Math.max(P.crime,5);G.stats.fights++;
    if(n.guard){
      n.state='chase';n.lost=0;raiseAlarm();P.heat=100;
      if(n.hp<=0){n.ko=25;n.hp=n.mhp*.5;n.state='patrol';banner('Deitaste um guarda abaixo!','#ffb04d')}
    }else{
      if(n.gang&&n.gang===P.gang&&!n.leader){n.aggro=0;say(n,'Ei! Somos do mesmo bando!');n.hp+=dmg}
      else{n.aggro=18;P.rep+=.05}
      if(n.hp<=0){n.ko=45;n.aggro=0;P.rep+=1.5;banner(n.name+' está KO','#ffe08a',1400);missionHook('ko',n)}
    }
  }
}
function busyTick(dt){
  const b=P.busy;if(!b)return;
  b.t+=dt;$('#progB').style.width=Math.min(100,b.t/b.dur*100)+'%';
  if(b.type==='dig'){P.crime=0;if(Math.random()<dt*3)sfx('dig');if(rondaT>0){const g=GUARDS.find(x=>!x.sec&&!x.gate)||GUARDS[0];P.busy=null;$('#prog').classList.remove('on');arrest(g);return}}
  if(b.type==='cut'){P.crime=Math.max(P.crime,1.2);if(Math.random()<dt*4)sfx('dig')}
  if(b.type==='gate')P.crime=0;
  if(b.t>=b.dur){
    P.busy=null;$('#prog').classList.remove('on');
    if(b.type==='dig'){G.tunnel=Math.min(100,G.tunnel+9);advance(25);P.en=Math.max(0,P.en-4);toast('Cavaste. Túnel: '+Math.round(G.tunnel)+'%',1800);if(G.tunnel>=100)endGame('tunel')}
    else if(b.type==='cut'){G.cut[b.seg]=true;P.heat=Math.min(100,P.heat+20);banner('Cerca cortada! Corre para o fundo!','#9fe3a0',3000);sfx('ok')}
    else if(b.type==='gate'){endGame('portao')}
  }
}
function nearestAct(){
  let best=null,bd=1e9;const sc=SC[P.scene];
  for(const n of ALL()){
    if(n.scene!==P.scene)continue;
    const dx=Math.abs(n.x-P.x),dz=Math.abs(n.z-P.z);if(dx>130||dz>.3)continue;const d=dx+dz*300;
    if(n.ko>0){if(d<bd){bd=d;best={n,label:'Revistar '+n.name,kind:'loot'}}continue}
    if(n.aggro>0)continue;
    if(n.guard){
      if(n.sec){if(d<bd){bd=d;best={n,label:'Falar com o Sr. Mateus',kind:'talk'}}continue}
      if(Math.sign(P.x-n.x)!==n.face&&dx<110&&!G.pick&&n.state==='patrol'){if(d<bd){bd=d;best={n,label:'Furtar chave (arriscado)',kind:'pick'}}}
      continue}
    if(n.talkable&&d-60<bd){bd=d-60;best={n,label:'Falar com '+n.name,kind:'talk'}}
  }
  for(const p of sc.props){
    if(!p.act)continue;
    if(Math.abs(P.x-p.x)>p.w/2+50||Math.abs(P.z-p.z)>(p.zr||.5))continue;
    const d=Math.abs(P.x-p.x)*.5;
    if(d<bd+80){bd=d;best={o:p,label:p.label||'Usar',kind:p.act==='cerca'?'cerca':p.act==='portao'?'portao':'obj'}}
  }
  for(const d of sc.doors){
    if(Math.abs(P.x-d.x)<d.w/2+40&&P.z<.75){const dd=Math.abs(P.x-d.x)*.3;if(dd<bd+60||!best){bd=dd;best={d,label:d.to?(doorLocked(P.scene,d)?'🔒 ':'')+d.label:'Trancada',kind:'door'}}}
  }
  return best;
}
function doAct(a){
  if(!a||G.paused||P.busy||P.sleeping)return;
  if(a.kind==='door')return goDoor(a.d);
  if(a.kind==='cerca'){
    if(!P.inv.alicate){toast('Precisas de um alicate. Compra na cantina ao Zé.');return}
    if(!(hh()>=21||hh()<5.5))toast('É de dia: vais ser visto. Melhor à noite.');
    const seg=Math.floor(P.x/150);if(G.cut[seg]){toast('Já cortaste aqui. Corre para o fundo!');return}
    const weak=P.inv.mapa&&P.x>1700&&P.x<2600;
    startBusy('cut',Math.max(2.5,6-P.int*.04)*(weak?.5:1),weak?'A cortar no ponto fraco…':'A cortar a cerca…');P.busy.seg=seg;return}
  if(a.kind==='portao'){
    if(!P.inv.chave){toast('O portão está trancado. Precisas da chave.');return}
    if(!P.uniform)toast('Sem uniforme os guardas vão desconfiar!');
    startBusy('gate',3,'A abrir o portão…');return}
  return doAct0(a);
}
function objAct(o){return objAct0(o)}
function update(dt,now){
  GT+=dt;P.heat=Math.min(100,P.heat);
  if(!G.arresting)stepClock(dt*TS*S.speed);
  if(P.sleeping&&P.sleepLeft<=0)wake(P.nap?'Descansaste.':'Bom dia.');
  const[ix,iy]=inputVec();P.moving=false;
  if(!P.sleeping&&!P.busy||P.busy&&(ix||iy)){
    if(P.busy&&(ix||iy))cancelBusy('Interrompeste a ação.');
    if(ix||iy){
      const sp=(P.run&&P.en>3?330:210)*(P.en<8?.6:1)*(P.hp<25?.8:1)*(P.skate?1.35:1)*(P.car?2.3:1);
      if(ix)P.face=ix>0?1:-1;
      const w=sceneW(P.scene);
      P.x=clamp(P.x+ix*sp*dt,70,w-70);
      const zmin=(P.scene==='patio'&&G.cut[Math.floor(P.x/150)])?0:.02;
      P.z=clamp(P.z+iy*sp/260*dt,zmin,1);
      P.walk+=dt;P.moving=true;
      if(P.run&&P.en>3)P.en=Math.max(0,P.en-3.2*dt);
    }
  }
  if(P.busy)busyTick(dt);
  if(P.cd>0)P.cd-=dt;if(P.atk>0)P.atk-=dt;if(P.hurt>0)P.hurt-=dt;if(P.crime>0)P.crime-=dt;if(P.shake>0)P.shake-=dt;
  if(alarm>0){alarm-=dt;if(alarm<=0)alarm=0}
  if(rondaT>0)rondaT-=dt;
  for(const n of NPC)updateNPC(n,dt);
  for(const g of GUARDS)updateGuard(g,dt,now);
  const lit=beamsOn()&&P.scene==='patio'&&inBeam(P.x,'patio')&&violation();
  if(lit&&!G.over){P.heat+=dt*42;if(P.heat>=100)raiseAlarm()}
  if(!GUARDS.some(g=>g.seeT>0||g.state==='chase')&&!lit&&P.heat>0)P.heat=Math.max(0,P.heat-dt*4);
  if(P.scene==='patio'&&P.z<=.03&&G.cut[Math.floor(P.x/150)]&&!G.over)endGame('cerca');
  nearAct=(P.sleeping||P.busy)?null:nearestAct();
  tick7(dt);
  if(typeof netUpdate==='function'){netUpdate(dt);netSendPos(false)}
  if(P.en<=0&&!P.sleeping&&Math.random()<dt*.2){P.en=8;toast('Estás exausto. Descansa!')}
}
function saveGame(){
  if(G.over||!G.started)return;
  try{localStorage.setItem('pm_v2',JSON.stringify({S:{t:S.t,day:S.day},P:{scene:P.scene,x:P.x,z:P.z,hp:P.hp,en:P.en,food:P.food,str:P.str,agi:P.agi,rep:P.rep,money:P.money,inv:P.inv,stash:P.stash,gang:P.gang,job:P.job,int:P.int,uniform:P.uniform},
    G:{sentence:G.sentence,tunnel:G.tunnel,cut:G.cut,missions:G.missions,stats:G.stats,chamadaOk:G.chamadaOk,workOk:G.workOk,mealT:G.mealT||{}}}))}catch(e){}
}
function loadGame(){
  try{const d=JSON.parse(localStorage.getItem('pm_v2')||'null');if(!d)return false;
    S.t=d.S.t;S.day=d.S.day;Object.assign(P,d.P);P.sleeping=false;P.heat=0;Object.assign(G,d.G);return true}catch(e){return false}
}
function hasSave(){try{return!!localStorage.getItem('pm_v2')}catch(e){return false}}
function startGame(cont){
  audioInit();
  if(!(cont&&loadGame())){S.t=6.5*60;S.day=1;P.scene='cela';P.x=760;P.z=.62}
  G.started=true;G.paused=false;G.over=false;
  $('#title').classList.remove('on');$('#end').classList.remove('on');
  snapNPCs();cam.x=P.x-VW/2;
  if(!cont||!hasSave())setTimeout(helpPanel,400);
}
function hud(){
  const h=hh(),sc=sched(h);
  $('#hClock').textContent=clock();$('#hDay').textContent='Dia '+S.day;$('#hSch').textContent=SCHED_NAME[sc];
  $('#bHp').style.width=clamp(P.hp,0,100)+'%';$('#bEn').style.width=clamp(P.en,0,100)+'%';$('#bFd').style.width=clamp(P.food,0,100)+'%';$('#bHt').style.width=clamp(P.heat,0,100)+'%';
  $('#hMoney').textContent=Math.round(P.money)+' Kz';$('#hPena').textContent='Pena: '+Math.max(0,Math.round(G.sentence))+' dias · '+SC[P.scene].n;
  $('#hHint').textContent=hintText(sc,h);
  const a=nearAct,bA=$('#bA');bA.querySelector('small').textContent=a?a.label:'';bA.classList.toggle('hot',!!a);
}
/* cena de teste/remoto: atribuição simples */
(function boot(){
  requestAnimationFrame(frame);
  if(location.hash==='#novo'){history.replaceState(null,'',location.pathname);startGame(false);return}
  showTitle();
})();

/* ===== v2.1: movimentos realistas, golpes, sombras, rua e polícia ===== */
let cmT=0;
function cm(m,who){const e=$('#cm');if(!e)return;e.querySelector('b').textContent=who||'';e.querySelector('span').textContent=m;e.classList.add('on');clearTimeout(cmT);cmT=setTimeout(()=>e.classList.remove('on'),4200)}

/* ---------- cena: rua ---------- */
scene('rua',{n:'A rua',w:3300,out:true,street:true,th:{w0:'#555',w1:'#333',f0:'#6b6b70',f1:'#3a3a40'},decor:[],props:[],doors:[]});
const SHOPN=['MERCEARIA','FARMÁCIA','ELECTRO LUANDA','BAR 24H','OFICINA','PADARIA','LOJA DESPORTO','CABELEIREIRO','TELEMÓVEIS','CANTINHO'];
function drawStreet(sc,x0,x1){
  const d=darkness(),night=d>.4;
  c.fillStyle=grad(0,FY0,night?'#0a1024':'#a7cfe8',night?'#1d2744':'#e3eef4');c.fillRect(x0,0,x1-x0,FY0);
  const bw=420;
  for(let b=Math.floor(x0/bw);b*bw<x1;b++){
    const x=b*bw,h=hash(b,3),top=30+h*70;
    const base=['#8a6f5a','#6e7f8f','#9a8a6a','#7a5f66','#5f7a6c'][Math.floor(hash(b,5)*5)];
    c.fillStyle=grad(top,FY0,night?shade(base,-.6):base,night?shade(base,-.75):shade(base,-.15));c.fillRect(x,top,bw-6,FY0-top+4);
    c.fillStyle='rgba(0,0,0,.18)';c.fillRect(x,top,bw-6,8);
    for(let r=0;r<2;r++)for(let k=0;k<3;k++){const wx=x+34+k*118,wy=top+24+r*62;const lit=hash(b*7+r,k)>.5;
      c.fillStyle=night?(lit?'#ffd98a':'#10131c'):'#7fb4d8';c.fillRect(wx,wy,64,44);c.strokeStyle='#222';c.lineWidth=3;c.strokeRect(wx,wy,64,44);c.beginPath();c.moveTo(wx+32,wy);c.lineTo(wx+32,wy+44);c.stroke()}
    /* loja */
    const sy=FY0-130,col=['#c0392b','#2e86c1','#27ae60','#d4a017','#8e44ad'][Math.floor(hash(b,9)*5)];
    c.fillStyle=night?'#1a1d26':'#2a2f3a';c.fillRect(x+16,sy,bw-38,134);
    c.fillStyle=night?'#ffe9a8':'#bcd6e6';c.fillRect(x+30,sy+34,bw-150,92);
    c.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<4;i++)c.fillRect(x+30+i*60,sy+34,3,92);
    c.fillStyle=col;c.beginPath();c.moveTo(x+10,sy+30);c.lineTo(x+bw-16,sy+30);c.lineTo(x+bw-30,sy+6);c.lineTo(x+24,sy+6);c.fill();
    c.fillStyle='#fff';c.font='bold 17px system-ui';c.textAlign='center';c.fillText(SHOPN[Math.floor(hash(b,11)*SHOPN.length)],x+bw/2-10,sy+24);
    R(x+bw-100,sy+34,52,100,night?'#1d2a3c':'#516a85');R(x+bw-60,sy+84,6,10,'#d9c28a');
    if(hash(b,13)>.55){c.fillStyle='rgba(255,255,255,.85)';c.font='italic bold 30px system-ui';c.fillText('♪',x+60,sy-18)}
  }
  c.fillStyle='#8d8f94';c.fillRect(x0,FY0,x1-x0,34);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x0,FY0+30,x1-x0,6);
  c.fillStyle=grad(FY0+34,LH,'#4a4b52','#2c2d33');c.fillRect(x0,FY0+34,x1-x0,LH-FY0-34);
  c.fillStyle='rgba(255,255,255,.55)';for(let x=Math.floor(x0/220)*220;x<x1;x+=220)c.fillRect(x,FY0+150,110,6);
  for(let x=Math.floor(x0/620)*620+300;x<x1;x+=620){R(x-3,70,6,270,'#2a2a2e');R(x-34,66,40,8,'#2a2a2e');c.fillStyle=night?'#fff0b0':'#ddd';c.beginPath();c.ellipse(x-32,78,14,5,0,0,TAU);c.fill()}
}

/* ---------- personagem realista ---------- */
function limb(x0,y0,ang,len,w,col){
  const x1=x0+Math.sin(ang)*len,y1=y0+Math.cos(ang)*len;c.lineCap='round';
  c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=w+3;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
  c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();return[x1,y1];
}
function arm(sx,sy,a1,a2,suit,skin,glove){
  const k=limb(sx,sy,a1,25,11,suit),h=limb(k[0],k[1],a2,23,9.5,shade(suit,.05));
  c.fillStyle=glove||skin;c.beginPath();c.arc(h[0],h[1],6.2,0,TAU);c.fill();c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1.5;c.stroke();return h;
}
function leg(hx,hy,a1,a2,suit,boot){
  const k=limb(hx,hy,a1,25,13,suit),f=limb(k[0],k[1],a2,25,11.5,shade(suit,-.1));
  c.save();c.translate(f[0],f[1]);c.rotate(-a2*.4);c.fillStyle=boot||'#1c1c20';c.beginPath();c.ellipse(7,2,12,5.5,0,0,TAU);c.fill();c.restore();
}
function drawChar(e,sx,gy,s,opt){
  opt=opt||{};
  const f=e.face||1,big=(e.big||1)*s,moving=!!e.moving;
  const run=e.running||(e.state==='chase'&&moving)||(e.aggro>0&&moving&&e.kind!=='p');
  const t=(e.walk||0)*(run?15:10),hurtF=e.hurt>0,hurtFlash=hurtF&&Math.floor(GT*30)%2===0;
  const lying=e.ko>0||e.down>0;
  c.save();c.translate(sx,gy);
  /* sombra suave (luz de cima) */
  const sg=c.createRadialGradient(6*big,0,2,6*big,0,(lying?60:38)*big);sg.addColorStop(0,'rgba(0,0,0,.5)');sg.addColorStop(1,'rgba(0,0,0,0)');
  c.save();c.scale(1,.28);c.fillStyle=sg;c.beginPath();c.arc(6*big,0,(lying?60:38)*big,0,TAU);c.fill();c.restore();
  c.scale(f*big,big);
  const suit=e.uniform?'#243f78':e.suit||'#e07a1c',skin=e.skin||'#d9a273',hair=e.hair||'#222',cap=e.guard||e.uniform||e.cap;
  /* queda */
  if(lying){const ang=e.ko>0?1.52:1.52*Math.min(1,Math.min(e.down,.28)/.28);c.translate(0,-14*Math.min(1,ang));c.rotate(-ang)}
  const bob=moving?Math.abs(Math.sin(t))*(run?5:2.6):Math.sin(GT*2+(e.x||0))*1.1;
  const lean=(run?.2:moving?.05:0)+(hurtF&&!lying?-.18:0);
  const K=e.atk>0?(e.atkK||'p1'):null,u=K?1-clamp(e.atk/(e.atkD||.28),0,1):0,sn=Math.sin(u*Math.PI);
  /* pernas */
  const hipY=-50-bob*.6,A=run?.95:.55;
  for(let sd=0;sd<2;sd++){
    const ph=t+sd*Math.PI;let a1,a2;
    if(lying){a1=sd?.2:-.1;a2=a1-.2}
    else if(K==='k'&&sd===0){a1=1.55*sn;a2=a1-.15}
    else if(moving){a1=Math.sin(ph)*A;a2=a1-Math.max(0,-Math.cos(ph))*(run?1.3:.7)}
    else{const stance=K?.22:.1;a1=sd?stance:-stance;a2=a1*.6}
    leg(sd?6:-6,hipY,a1,a2,sd?shade(suit,-.15):shade(suit,-.3));
  }
  /* tronco */
  c.save();c.translate(0,hipY);c.rotate(lean);
  const torsoH=48-bob*.3;
  const tg=c.createLinearGradient(-17,0,17,0);tg.addColorStop(0,shade(suit,.18));tg.addColorStop(.55,suit);tg.addColorStop(1,shade(suit,-.35));
  c.fillStyle=hurtFlash?'#fff':tg;c.beginPath();c.moveTo(-14,0);c.lineTo(14,0);c.lineTo(19,-torsoH+6);c.quadraticCurveTo(0,-torsoH-5,-19,-torsoH+6);c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=2;c.stroke();
  c.fillStyle='rgba(0,0,0,.18)';c.fillRect(-1,-torsoH+8,2,torsoH-14);
  if(e.guard||e.cap){c.fillStyle='#16161c';c.fillRect(-15,-10,30,7);c.fillStyle='#ffd54a';c.fillRect(-3,-9,6,5);c.fillStyle='#ffd54a';c.beginPath();c.arc(8,-torsoH+16,3.5,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.14)';c.fillRect(-16,-torsoH+10,32,4)}
  else if(!e.uniform){c.fillStyle='rgba(255,255,255,.9)';c.fillRect(-9,-torsoH+14,18,13);c.fillStyle='#222';c.font='bold 10px system-ui';c.textAlign='center';c.fillText(String(e.num||(e.name?e.name.length*37+101:'007')),0,-torsoH+24)}
  if(e.band){c.fillStyle=e.band;c.fillRect(-19,-torsoH+8,38,6)}
  /* braços */
  const shY=-torsoH+8;
  let fa1,fa2,ba1,ba2;
  if(lying){fa1=.6;fa2=.8;ba1=-.4;ba2=-.2}
  else if(K==='p1'||K==='p3'){fa1=1.5*sn+.1;fa2=fa1+.1;ba1=.9;ba2=2.2}
  else if(K==='p2'){ba1=1.5*sn+.1;ba2=ba1+.1;fa1=.9;fa2=2.2}
  else if(K==='k'){fa1=.8;fa2=2;ba1=-.6;ba2=.4}
  else if(K==='throw'){fa1=ba1=2.8-2.3*u;fa2=ba2=fa1+.1}
  else if(K==='grab'||e.grabbing){fa1=ba1=1.45;fa2=ba2=1.5}
  else if(moving){const sw=Math.sin(t)*(run?1.1:.55);fa1=-sw;fa2=fa1+(run?1.7:.4);ba1=sw;ba2=ba1+(run?1.5:.3)}
  else if(e.aggro>0||e.state==='chase'||(e.fightT>0)){fa1=.9;fa2=2.1;ba1=.6;ba2=2.0}
  else{fa1=.12+Math.sin(GT*2)*.03;fa2=fa1+.2;ba1=-.12;ba2=ba1+.15}
  if(e.busyArm){fa1=1.3;fa2=1.9}
  arm(-12,shY,ba1,ba2,shade(suit,-.3),skin);
  c.restore();
  /* cabeça */
  c.save();c.translate(Math.sin(lean)*-6+(K&&!lying?4*sn:0),hipY-torsoH-4+bob*.2);c.rotate(lean*.8+(hurtF?-.15:0));
  c.fillStyle=shade(skin,-.3);c.fillRect(-5,2,10,9);
  const hg=c.createRadialGradient(4,-10,2,0,-8,19);hg.addColorStop(0,shade(skin,.18));hg.addColorStop(1,shade(skin,-.18));
  c.fillStyle=hurtFlash?'#fff':hg;c.beginPath();c.ellipse(0,-9,14,16.5,0,0,TAU);c.fill();c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=1.8;c.stroke();
  c.fillStyle=shade(skin,-.1);c.beginPath();c.ellipse(-12,-8,3,5,0,0,TAU);c.fill();
  if(cap){c.fillStyle='#16224a';c.beginPath();c.ellipse(0,-17,15,10,0,Math.PI,0);c.fill();c.fillRect(-15,-19,30,6);c.fillStyle='#0c1530';c.fillRect(3,-14,19,5);c.fillStyle='#ffd54a';c.fillRect(-3,-25,6,5)}
  else if(e.fem){c.fillStyle=hair;c.beginPath();c.ellipse(0,-14,15,12,0,Math.PI,0);c.fill();c.fillRect(-16,-16,9,36)}
  else{c.fillStyle=hair;c.beginPath();c.ellipse(0,-15,14.5,9,0,Math.PI,0);c.fill()}
  /* cara */
  c.fillStyle='#fff';c.beginPath();c.ellipse(6,-9,3.4,2.6,0,0,TAU);c.fill();c.fillStyle='#111';c.beginPath();c.arc(7.2,-9,1.6,0,TAU);c.fill();
  c.strokeStyle='rgba(0,0,0,.65)';c.lineWidth=2;c.beginPath();c.moveTo(2,-14+(e.aggro>0||e.state==='chase'?2:0));c.lineTo(10,-14-(e.aggro>0||e.state==='chase'?1:0));c.stroke();
  c.beginPath();if(hurtF||lying){c.ellipse(7,0,3,2.2,0,0,TAU);c.fillStyle='#411';c.fill()}else{c.moveTo(3,0);c.lineTo(10,0);c.stroke()}
  c.restore();
  /* braço da frente por cima */
  c.save();c.translate(0,hipY);c.rotate(lean);
  arm(13,-torsoH+8,fa1,fa2,suit,skin,K==='p1'||K==='p2'||K==='p3'?'#8a1d1d':null);
  c.restore();
  c.restore();
  /* indicadores (espaço do ecrã) */
  const topY=gy-(lying?60:150)*big;
  if(e.talkT>0&&e.talk){c.font='bold 15px system-ui';const tw=c.measureText(e.talk).width+20;
    rr(sx-tw/2,topY-34,tw,28,10,'#fff','#111');c.beginPath();c.moveTo(sx-6,topY-6);c.lineTo(sx,topY+4);c.lineTo(sx+6,topY-6);c.fillStyle='#fff';c.fill();
    c.fillStyle='#111';c.textAlign='center';c.fillText(e.talk,sx,topY-14)}
  if(opt.name&&!lying){c.font='bold 13px system-ui';c.textAlign='center';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.7)';c.strokeText(opt.name,sx,topY);c.fillStyle=opt.col||'#fff';c.fillText(opt.name,sx,topY)}
  if(e.mhp&&e.hp<e.mhp&&(e.aggro>0||e.state==='chase'||e.hurt>0)&&e.hp>0){const bw=56;R(sx-bw/2,topY+6,bw,6,'rgba(0,0,0,.6)');R(sx-bw/2,topY+6,bw*Math.max(0,e.hp/e.mhp),6,e.guard||e.cap?'#4a7aff':'#e55')}
  if(e.state==='chase'||e.state==='revista'){c.font='900 26px system-ui';c.textAlign='center';c.fillStyle=e.state==='chase'?'#ff3b3b':'#ffb04d';c.fillText('!',sx,topY-8)}
}

/* ---------- combate: soco (combo de 3), chute, agarrar e atirar, placagem ---------- */
function strike(range,mul,kd,kb,anim,dur){
  if(P.cd>0||P.busy||P.sleeping||G.paused)return false;
  P.atkK=anim;P.atkD=dur;P.atk=dur;P.cd=dur+.1;P.en=Math.max(0,P.en-1.4*mul);sfx(anim==='k'?'hit':'punch');
  let any=false;
  for(const n of ALL()){
    if(n.scene!==P.scene||n.ko>0||n.down>0||(n.fixed&&!n.guard&&!n.isShop))continue;
    const dx=n.x-P.x,dz=n.z-P.z;
    if(Math.abs(dx)>range||Math.abs(dz)>.17||dx*P.face<-25)continue;
    any=true;
    const dmg=(7+P.str*.22+wpn())*mul*rnd(.85,1.2)*(P.en<10?.6:1);
    n.hp-=dmg;n.hurt=.22;n.x+=P.face*kb;if(kd>0&&n.hp>0)n.down=kd;
    fx.push({x:n.x,z:n.z,s:n.scene,t:.7,txt:Math.round(dmg),col:kd>0?'#ffb04d':'#ffe08a'});
    P.crime=Math.max(P.crime,5);G.stats.fights++;P.shake=Math.max(P.shake||0,.08);
    if(n.guard){n.state='chase';n.lost=0;raiseAlarm();P.heat=100;if(n.hp<=0){n.ko=25;n.hp=n.mhp*.5;n.state='patrol';banner('Deitaste um guarda abaixo!','#ffb04d')}}
    else{
      if(n.gang&&n.gang===P.gang&&!n.leader){n.aggro=0;say(n,'Ei! Somos do mesmo bando!');n.hp+=dmg;n.down=0}
      else{n.aggro=n.cop?999:18;P.rep+=.05}
      if(n.hp<=0){n.ko=45;n.aggro=0;P.rep+=1.5;banner(n.name+' está KO','#ffe08a',1400);missionHook('ko',n)}
    }
  }
  return any;
}
function punch(){
  if(P.cd>0)return;
  P.comboT>0&&P.combo<3?P.combo++:(P.combo=1);P.comboT=.75;
  const n=P.combo,run=P.run&&P.moving&&P.en>3;
  if(run){strike(150,1.4,1.3,90,'p1',.32);P.combo=0;return}
  strike(115,n===3?1.5:1,n===3?1.2:0,n===3?60:14,n===1?'p1':n===2?'p2':'p3',.26);
  if(n===3)P.combo=0;
}
function kick(){strike(145,1.6,.9,50,'k',.4)}
function grab(){
  if(P.cd>0||P.busy||P.sleeping||G.paused)return;
  const t=ALL().find(n=>n.scene===P.scene&&n.ko<=0&&!(n.fixed&&!n.guard)&&Math.abs(n.x-P.x)<105&&Math.abs(n.z-P.z)<.17&&(n.x-P.x)*P.face>-20);
  if(!t){P.atkK='grab';P.atkD=.25;P.atk=.25;P.cd=.3;return}
  /* agarrar → atirar */
  P.atkK='throw';P.atkD=.45;P.atk=.45;P.cd=.6;sfx('hit');P.shake=.14;
  const dmg=(14+P.str*.35)*rnd(.9,1.2);t.hp-=dmg;t.hurt=.3;t.down=2.2;t.x=clamp(t.x+P.face*170,70,sceneW(t.scene)-70);
  fx.push({x:t.x,z:t.z,s:t.scene,t:.9,txt:'ATIRADO! '+Math.round(dmg),col:'#ffb04d'});
  P.crime=Math.max(P.crime,6);G.stats.fights++;
  if(t.guard){t.state='chase';t.lost=0;raiseAlarm();P.heat=100;if(t.hp<=0){t.ko=25;t.hp=t.mhp*.5;t.state='patrol'}}
  else{if(!(t.gang&&t.gang===P.gang))t.aggro=t.cop?999:18;if(t.hp<=0){t.ko=45;t.aggro=0;P.rep+=1.5;missionHook('ko',t)}}
}
function attack(){punch()}

/* ---------- fuga: leva à rua com polícia ---------- */
function endGame(kind){
  if(kind==='legal'||kind==='rua'||G.escaped)return endGame0(kind);
  startStreet(kind);
}
function startStreet(kind){
  if(G.escaped||G.over)return;
  G.escaped=kind;G.paused=true;P.busy=null;$('#prog').classList.remove('on');
  banner('FUGISTE! Corre para a direita!','#9fe3a0',3200);sfx('ok');
  fade(()=>{
    P.scene='rua';P.x=220;P.z=.6;P.heat=0;P.crime=0;alarm=0;S.t=(S.t<1380&&S.t>300)?23*60:S.t;cam.x=0;
    GUARDS.forEach(g=>{g.state='patrol';g.pend=null});
    for(let i=0;i<5;i++){
      const cop=mkNPC({name:'Agente '+['Faria','Gomes','Neto','Pires','Costa'][i],cop:true,cap:true,scene:'rua',x:900+i*480,z:rnd(.4,.85),suit:'#1c2a55',hp:90,spd:rnd(150,185),big:1.06,talkable:false});
      cop.aggro=999;NPC.push(cop)}
    G.paused=false;
    cm('Fugitivo à vista! Todas as unidades à Rua da Missão!','Rádio da polícia');
  },500);
}
function clearCops(){for(let i=NPC.length-1;i>=0;i--)if(NPC[i].cop)NPC.splice(i,1);G.escaped=false}
const _arrest0=arrest;
arrest=function(g,silent){clearCops();_arrest0(g,silent)};

/* ---------- ciclo extra (chamado a partir de update) ---------- */
function tick7(dt){
  P.running=!!(P.run&&P.moving&&P.en>3);
  if(P.comboT>0){P.comboT-=dt;if(P.comboT<=0)P.combo=0}
  if(P.scene==='rua'){
    NPC.forEach(n=>{if(n.cop&&n.ko<=0&&n.aggro<50)n.aggro=999});
    if(P.x>3200&&!G.over)endGame0('rua');
  }
  for(const n of NPC)n.running=n.aggro>0&&n.moving;
}
/* ---------- botões ---------- */
(function(){
  const bind=(id,fn)=>{const e=$(id);if(!e)return;e.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();audioInit();e.classList.add('dn');fn()});['pointerup','pointerleave','pointercancel'].forEach(t=>e.addEventListener(t,()=>e.classList.remove('dn')))};
  bind('#bK',kick);bind('#bG',grab);
  window.addEventListener('keydown',e=>{if(e.key==='k'||e.key==='K')kick();if(e.key==='l'||e.key==='L'||e.key==='g'||e.key==='G')grab()});
})();

/* ===== Pena Máxima v3: itens, polícia, conversas, mortes, novos presos, sons ===== */
const IMG={};
(function(){const d=window.SPR_DATA||{};for(const k in d){const i=new Image();i.src=d[k];IMG[k]=i}})();
function spr(k,x,gy,h,fl,al){const i=IMG[k];if(!i||!i.complete||!i.naturalWidth)return;const w=i.naturalWidth*h/i.naturalHeight;
  c.save();c.translate(x,gy);if(fl)c.scale(-1,1);if(al!=null)c.globalAlpha=al;c.drawImage(i,-w/2,-h,w,h);c.restore()}

/* ---------- sons reais (cortados dos vídeos) ---------- */
const SND={};let sndLoaded=false;
function loadSnd(){if(sndLoaded||!AC||!window.SND_DATA)return;sndLoaded=true;
  for(const k in SND_DATA){try{const b=Uint8Array.from(atob(SND_DATA[k]),ch=>ch.charCodeAt(0));AC.decodeAudioData(b.buffer,buf=>{SND[k]=buf},()=>{})}catch(e){}}}
function play(k,vol,rate){const b=SND[k];if(!b||!AC||muted)return false;
  const s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;s.playbackRate.value=rate||1;g.gain.value=vol||.8;s.connect(g);g.connect(AC.destination);s.start();return true}
const _audioInit=audioInit;audioInit=function(){_audioInit();loadSnd()};
const _sfx=sfx;sfx=function(n){
  if(AC&&!muted){
    if(n==='hit'&&play(pick(['hitA','hitB','hitC']),.9,rnd(.92,1.08)))return;
    if(n==='punch'&&play(pick(['thudA','thudB']),.8,rnd(.92,1.1)))return;
    if((n==='coin'||n==='ok')&&play('ding',.5))return;
    if(n==='door'&&play('clickA',.8,.8))return;
    if(n==='tick'&&play('clickA',.35,1.4))return;
    if(n==='bad'&&play('boom',.6))return;
    if(n==='boom'&&play('boom',1))return}
  _sfx(n)};

/* ---------- novos itens ---------- */
Object.assign(ITEMS,{
  chips:{n:'Batatas fritas',food:26,buy:8,sell:3},
  energia:{n:'Bebida energética',en:45,buy:18,sell:6},
  skate:{n:'Skate',skate:1,buy:240,sell:90,desc:'Equipa para andar mais depressa.'},
  cigarro:{n:'Cigarro artesanal',contra:1,buy:0,sell:40,desc:'Contrabando. Vende bem na cantina.'},
  corrente:{n:'Corrente de ouro',contra:1,buy:0,sell:170,desc:'Vale muito dinheiro.'},
  motosserra:{n:'Motosserra velha',contra:1,buy:0,sell:200,dmg:26,desc:'+26 de dano. Muito barulhenta e proibida.'},
  telemovel2:{n:'Smartphone roubado',contra:1,phone:1,buy:0,sell:120,desc:'Pede dinheiro à família.'}});
SHOP.push('chips','energia','skate');
function wpn(){return P.inv.motosserra?26:P.inv.faca?7:0}
const _useItem=useItem;useItem=function(k){const it=ITEMS[k];
  if(it.skate){P.skate=!P.skate;toast(P.skate?'Skate equipado: mais rápido!':'Skate guardado.');sfx('ok');return}
  if(it.en){P.en=Math.min(100,P.en+it.en);takeItem(k);toast('Energia +'+it.en);sfx('ok');return}
  _useItem(k)};
const _drawChar=drawChar;drawChar=function(e,sx,gy,s,opt){if(e&&e.skate)spr('skate',sx,gy+6,30*s);_drawChar(e,sx,gy,s,opt)};

/* ---------- objetos no mundo ---------- */
const SPR_OF={chips:'chips',energia:'energy',faca:'knife',motosserra:'chainsaw',telemovel:'phoneA',telemovel2:'phoneB',skate:'skate',cigarro:'joint',corrente:'chain',notas:'money'};
const PK_H={chips:46,energia:50,faca:40,motosserra:50,telemovel:34,telemovel2:34,skate:30,cigarro:26,corrente:46,notas:40};
const PICKS=[];
const PK_SPOTS={cozinha:['chips','energia'],oficina:['faca','faca','motosserra'],patio:['notas','corrente','skate','energia'],lavandaria:['cigarro','telemovel2'],biblioteca:['telemovel','notas'],refeitorio:['chips','energia'],cantina:['notas']};
function spawnPickups(){PICKS.length=0;
  for(const s in PK_SPOTS){if(Math.random()<.65){let id=pick(PK_SPOTS[s]);if(id==='motosserra'&&Math.random()>.35)id='faca';if(id==='skate'&&Math.random()>.4)id='notas';
    PICKS.push({id,scene:s,x:rnd(260,SC[s].w-260),z:rnd(.5,.85)})}}}
spawnPickups();
const FURN=[{scene:'cozinha',k:'fridge',x:270,z:.1,h:175,label:'Abrir o frigorífico'},{scene:'cantina',k:'fridge',x:1200,z:.1,h:175,label:'Abrir o frigorífico'},{scene:'cela',k:'wardrobe',x:690,z:.1,h:195,label:'Armário (esconderijo)'}];
const CAMS=[['corredor',900],['corredor',2600],['patio',600],['patio',2400],['posto',300],['refeitorio',800],['cantina',300]].map(a=>({scene:a[0],x:a[1]}));
const BLOOD=[],BODIES=[];
function addBlood(s,x,z,sz){BLOOD.push({s,x,z,sz:sz||70,d:S.day});if(BLOOD.length>26)BLOOD.shift()}
let camSeen=0;
const _drawDecor=drawDecor;drawDecor=function(sc,x0,x1){
  _drawDecor(sc,x0,x1);
  for(const b of BLOOD)if(b.s===sc.id&&b.x>x0-80&&b.x<x1+80){const i=IMG.blood;if(!i||!i.naturalWidth)continue;
    c.save();c.translate(b.x,zY(b.z)-2);c.scale(1,.3);c.globalAlpha=.85;c.drawImage(i,-b.sz,-b.sz,b.sz*2,b.sz*2);c.restore()}
  for(const f of FURN)if(f.scene===sc.id&&f.x>x0-150&&f.x<x1+150){const gy=zY(f.z);
    c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(f.x,gy,58,10,0,0,TAU);c.fill();spr(f.k,f.x,gy,f.h)}
  for(const m of CAMS)if(m.scene===sc.id&&m.x>x0-100&&m.x<x1+100){
    if(sc.out)R(m.x-3,210,6,125,'#4a4d52');
    const fl=Math.sin(GT*.5+m.x)>0;spr('camera',m.x,214,58,fl);
    c.fillStyle=(camSeen>0||Math.floor(GT*2)%2)?'#ff3b3b':'#5a1111';c.beginPath();c.arc(m.x+(fl?14:-14),186,2.6,0,TAU);c.fill()}
  for(const k of PICKS)if(k.scene===sc.id&&k.x>x0-60&&k.x<x1+60){const gy=zY(k.z);
    c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(k.x,gy,22,6,0,0,TAU);c.fill();
    const bob=Math.sin(GT*3+k.x)*2;spr(SPR_OF[k.id],k.x,gy-4+bob,PK_H[k.id]||40);
    c.globalAlpha=.25+.15*Math.sin(GT*4);c.fillStyle='#fff';c.beginPath();c.arc(k.x,gy-20,26,0,TAU);c.fill();c.globalAlpha=1}
  for(const b of BODIES)if(b.scene===sc.id&&b.x>x0-100&&b.x<x1+100){
    const gy=zY(b.z);c.save();c.translate(b.x,gy);c.rotate(Math.PI/2);
    _drawChar({suit:b.suit,skin:b.skin,hair:b.hair,face:1,big:1,moving:false,walk:0},0,0,zS(b.z)*.95,{name:null});c.restore();
    c.font='bold 13px system-ui';c.textAlign='center';c.fillStyle='#ffd0d0';c.fillText('✝ '+b.name,b.x,gy-52)}
};

const _nearestAct=nearestAct;nearestAct=function(){
  const b=_nearestAct();
  for(const k of PICKS)if(k.scene===P.scene&&Math.abs(k.x-P.x)<85&&Math.abs(k.z-P.z)<.25)return{pk:k,kind:'pickup',label:'Pegar: '+(k.id==='notas'?'Maço de notas':ITEMS[k.id].n)};
  for(const f of FURN)if(f.scene===P.scene&&Math.abs(f.x-P.x)<95&&P.z<.5)return{fu:f,kind:'furn',label:f.label};
  return b};
const _doAct=doAct;doAct=function(a){
  if(a&&a.kind==='pickup'&&!G.paused&&!P.busy&&!P.sleeping){const k=a.pk,i=PICKS.indexOf(k);if(i<0)return;PICKS.splice(i,1);
    if(k.id==='notas'){const v=ri(25,70);P.money+=v;banner('+'+v+' Kz','#ffe08a',1400)}else{addItem(k.id);toast('Apanhaste: '+ITEMS[k.id].n)}
    sfx('coin');return}
  if(a&&a.kind==='furn'&&!G.paused&&!P.busy&&!P.sleeping){const f=a.fu;
    if(f.k==='wardrobe')return stashPanel();
    G.fridge=G.fridge||{};const key=f.scene;
    if(G.fridge[key]===S.day){toast('O frigorífico está vazio por hoje.');return}
    G.fridge[key]=S.day;const it=pick(['chips','energia','pao']);addItem(it);toast('Tiraste do frigorífico: '+ITEMS[it].n);sfx('ok');
    if(GUARDS.some(g=>g.scene===P.scene&&playerSeenBy(g)&&!g.fixed)){P.heat=Math.min(100,P.heat+30);toast('Um guarda viu-te a roubar comida!')}return}
  _doAct(a)};

/* ---------- polícia/guardas à Hard Time ---------- */
function guardEngage(g,dt){
  if(GT-(g.engLast||-9)>1.5){g.eng=false}g.engLast=GT;
  if(!g.eng){g.eng=true;g.hits=0;g.engT=1.5;say(g,pick(['Pára aí, recluso!','Mãos onde as veja!','Não faças asneira!','Encosta-te à parede!']),1.8)}
  g.moving=false;if(g.hurt>.15)g.engT=Math.max(g.engT,.6);
  if(g.engT>0){g.engT-=dt;return}
  if(g.cd<=0){g.cd=rnd(1.0,1.5);g.atk=.28;g.hits++;hurtPlayer(rnd(3,6.5),g)}
  if(P.hp<=26||g.hits>=9){g.eng=false;arrest(g)}
}
const _knockout=knockout;knockout=function(){
  if(P.scene!=='rua'&&GUARDS.some(g=>g.scene===P.scene&&g.state==='chase'&&g.ko<=0&&!g.sec)){P.hp=Math.max(P.hp,20);return arrest(null)}
  return _knockout()};
function showMug(){
  const d=document.createElement('div');d.id='mug';
  d.style.cssText='position:fixed;inset:0;z-index:60;background:#222 url('+(IMG.mug?IMG.mug.src:'')+') center/cover;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:12vh;color:#fff;font:bold 20px system-ui;text-shadow:0 2px 6px #000;opacity:0;transition:opacity .35s;pointer-events:none';
  d.innerHTML='<div style="background:#000a;padding:10px 22px;border-radius:8px;text-align:center">FICHA POLICIAL<br><span style="font-size:15px">Recluso '+esc(P.name||'Tu')+' · Nº '+ri(1000,9999)+'</span></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>{d.style.opacity='1'});
  sfx('boom');setTimeout(()=>{d.style.opacity='0';setTimeout(()=>d.remove(),400)},2300)}
const _arrestV=arrest;arrest=function(g,silent){if(G.over||G.arresting)return;showMug();_arrestV(g,silent)};

/* ---------- mortes e chegadas ---------- */
G.news=G.news||[];
function killable(n){return!n.fixed&&!n.leader&&!n.isZeca&&!n.isShop&&!n.isDoc&&!n.cop&&NPC.indexOf(n)>=0}
function killNPC(n,by){
  if(!killable(n))return;const i=NPC.indexOf(n);NPC.splice(i,1);
  const sc=(n.scene==='off'||!SC[n.scene])?'corredor':n.scene;
  BODIES.push({scene:sc,x:n.x,z:n.z,name:n.name,suit:n.suit,skin:n.skin,hair:n.hair,day:S.day});addBlood(sc,n.x,n.z,90);
  const loc=SC[sc].n.toLowerCase();
  const msg=n.name+' foi encontrado morto: '+loc+'.';G.news.push(msg);if(G.news.length>6)G.news.shift();
  sfx('boom');pa('Atenção. Recluso morto: '+n.name+', '+loc+'. Todos os guardas ao local. Investigação em curso.',7000);
  banner('✝ '+n.name+' foi encontrado morto','#ff9b9b',4200);cm(msg+' Os guardas estão em alerta.','Altifalante');
  GUARDS.forEach(g=>{if(!g.fixed&&!g.sec&&g.state==='patrol'){g.inv={scene:sc,x:n.x,t:30}}});
  if(by==='player'){P.heat=100;P.crime=Math.max(P.crime,30);G.sentence+=15;banner('HOMICÍDIO! +15 dias de pena','#ff4d4d',4200);raiseAlarm()}
}
function morningDeath(){
  if(S.day<2||Math.random()>.32)return;const pool=NPC.filter(killable);if(pool.length<11)return;
  const v=pick(pool);v.scene=['cela','corredor','patio'].includes(v.scene)?v.scene:'corredor';v.x=rnd(300,SC[v.scene].w-300);v.z=rnd(.5,.85);killNPC(v,'noite')}
const FIRST=['Ngunga','Domingos','Lucrécio','Fula','Zeferino','Mambo','Quim','Toni','Sebas','Ginga','Mussa','Nandi','Pedrito','Hélder','Nelson','Wilson','Telmo','Gelson','Adilson','Yuri','Kito','Mingas','Zito','Armindo'];
function newArrivals(){
  const alive=NPC.filter(killable).length;if(alive>=19)return;
  const k=alive<13?2:(Math.random()<.5?1:0);if(!k)return;const out=[];
  for(let i=0;i<k;i++){
    const nm=pick(FIRST.filter(f=>!NPC.some(n=>n.name===f)));if(!nm)break;
    const gang=Math.random()<.35?pick(['corvos','serpentes']):null;
    const n=mkNPC({name:nm,work:pick(['oficina','lavandaria','cozinha','biblioteca',null]),gang,scene:'corredor',x:rnd(350,900),z:rnd(.5,.8),hp:50+ri(0,35),spd:rnd(130,175),suit:'#e07a1c',big:rnd(.95,1.08),newbie:true});
    if(gang)n.band=GANG[gang].c;NPC.push(n);out.push(nm+' ('+ri(2,15)+' anos)')}
  if(!out.length)return;const m='Chegaram novos reclusos: '+out.join(', ')+'.';G.news.push(m);if(G.news.length>6)G.news.shift();
  pa('Atenção. '+m+' Dêem-lhes as boas-vindas.',6000);toast(m,4200);sfx('door')}
const _evts=evts;evts=function(a,b){_evts(a,b);const E=(m,f)=>{if(crossed(a,b,m))f()};
  E(400,morningDeath);E(540,newArrivals);E(1380,()=>{BODIES.length=0});
  E(380,()=>spawnPickups())};
function newsLine(){return G.news.length?pick(G.news):pick(['Está tudo calmo. Demasiado calmo.','Ninguém me diz nada.','Ouvi dizer que vão fazer revistas.'])}

/* ---------- conversas ---------- */
const CH_GEN=[['Já almoçaste hoje?','Ainda não. A fila da cantina está enorme.'],['Ouviste o barulho esta noite?','Ouvi. Aqui dentro é melhor não saber de nada.'],['Quantos dias te faltam?','Perdi a conta. Cada dia parece uma semana.'],['Tens um cigarro?','Só se tiveres Kz para pagar.'],['O Zé da Cantina subiu os preços.','Ladrão! Eu só compro o pão.'],['Cuidado com o Matoso, anda a ver tudo.','Eu sei. Hoje portei-me bem.'],['Sonhei que saía pelo portão.','Eu sonho com a minha mãe a cozinhar.'],['Alguém viu a minha colher?','Perguntaste ao teu colega de cela?'],['Este sítio já foi pior.','Pior? Conta lá como.'],['Hoje há jogo no pátio?','Se os guardas deixarem…'],['Dizem que há câmaras novas.','Então não me peguem a fazer asneira.'],['Sinto falta do sol de Luanda.','Aqui só temos o holofote.']];
const CH_RIVAL=[['Os Corvos mandam aqui!','Os Serpentes não têm medo de ninguém!'],['Sai do nosso lado do pátio.','Faz-me sair, se és homem.']];
const CH_GU=[['Circula, recluso!','Já vou, chefe.'],['Perdido?','Só estou a esticar as pernas.'],['Sem confusões hoje, ouviste?','Sempre, chefe.']];
const GREET=['E aí, novato!','Bom dia. Cuidado com os guardas.','Anda por aqui de olhos abertos.','Respeito é tudo aqui dentro.','Tens Kz para a cantina?'];
let chatT=4;const DLG=[];
function idleOK(n){return n.ko<=0&&!(n.down>0)&&!(n.aggro>0)&&n.scene===P.scene&&!n.cop&&!n.sec&&!(n.fixed&&!n.guard)&&!(n.state&&n.state!=='patrol')}
function chatter(dt){
  for(let i=DLG.length-1;i>=0;i--){const d=DLG[i];d.t-=dt;if(d.t<=0){say(d.w,d.l,2.8);if(d.o)d.o.face=Math.sign(d.w.x-d.o.x)||d.o.face;DLG.splice(i,1)}}
  chatT-=dt;if(chatT>0||DLG.length)return;chatT=rnd(6,11);
  const L=ALL().filter(n=>idleOK(n)&&Math.abs(n.x-P.x)<750);
  for(let tries=0;tries<6&&L.length>1;tries++){
    const a=pick(L),b=L.find(o=>o!==a&&Math.abs(o.x-a.x)<280&&Math.abs(o.z-a.z)<.3);if(!b)continue;
    let ln;
    if(a.guard!==b.guard)ln=pick(CH_GU);
    else if(a.gang&&b.gang&&a.gang!==b.gang)ln=pick(CH_RIVAL);
    else if(G.news.length&&Math.random()<.4)ln=['Soubeste? '+pick(G.news),pick(['Mau sinal.','Aqui acontece de tudo.','Que descanse, ou que se cuide.'])];
    else ln=pick(CH_GEN);
    const g=a.guard&&!b.guard?b:a,gg=a.guard&&!b.guard?a:b; /* guarda fala primeiro */
    const first=a.guard!==b.guard?(a.guard?a:b):a,second=first===a?b:a;
    first.face=Math.sign(second.x-first.x)||first.face;second.face=Math.sign(first.x-second.x)||second.face;
    first.talkHold=second.talkHold=GT+6.5;
    DLG.push({t:0,w:first,l:ln[0],o:second},{t:3,w:second,l:ln[1],o:first});return}
  /* cumprimentar o jogador */
  for(const n of L)if(!n.guard&&Math.abs(n.x-P.x)<200&&Math.abs(n.z-P.z)<.3&&GT>(n.gcd||0)){
    n.gcd=GT+30;
    say(n,n.newbie?pick(['Onde é que eu estou?','Primeira noite aqui… tenho medo.']):(n.gang&&n.gang===P.gang?'Irmão! Tudo bem?':pick(GREET)),2.6);break}
}
const _updateNPC=updateNPC;updateNPC=function(n,dt){
  if(n.talkHold>GT&&!(n.aggro>0)&&!(n.ko>0)){if(n.talkT>0)n.talkT-=dt;n.moving=false;return}
  _updateNPC(n,dt)};
const _updateGuard=updateGuard;updateGuard=function(g,dt,now){
  if(g.talkHold>GT&&g.state==='patrol'&&!alarm){if(g.talkT>0)g.talkT-=dt;if(g.cd>0)g.cd-=dt;g.moving=false;return}
  _updateGuard(g,dt,now)};

/* ---------- ciclo extra ---------- */
let bloodChk=0;
const _tick7=tick7;tick7=function(dt){
  _tick7(dt);
  chatter(dt);
  if(camSeen>0)camSeen-=dt;
  if(!P.inv.skate)P.skate=false;
  if(P.inv.motosserra&&P.atk>0)P.crime=Math.max(P.crime,12);
  for(const m of CAMS)if(m.scene===P.scene&&Math.abs(P.x-m.x)<520&&!G.over&&!G.arresting&&!P.uniform&&violation()){
    P.heat=Math.min(100,P.heat+dt*14);if(camSeen<=0)toast('📹 Câmara de vigilância a gravar!',1600);camSeen=.4;if(P.heat>=100)raiseAlarm()}
  for(const g of GUARDS)if(g.eng&&g.hurt>.15)g.engT=Math.max(g.engT||0,.6);
  for(const n of ALL()){
    if(n.hurt>.18&&n.hp<n.mhp*.65&&!n._b){n._b=1;addBlood(n.scene,n.x,n.z,50)}else if(!(n.hurt>0))n._b=0;
    if(!n.guard&&n.hp<=-8&&killable(n)){killNPC(n,'player');break}}
  if(P.hurt>.2&&P.hp<65&&!P._b){P._b=1;addBlood(P.scene,P.x,P.z,46)}else if(!(P.hurt>0))P._b=0;
};

/* ===== v4: mão/usar, carros, sanita, frango, online estável ===== */
const DEFAULT_DB='https://pena-maxima-default-rtdb.firebaseio.com';
Object.assign(ITEMS,{frango:{n:'Frango assado',food:42,buy:14,sell:5}});
SHOP.push('frango');PK_SPOTS.cozinha.push('frango');PK_SPOTS.refeitorio.push('frango');
const EMO={pao:'🍞',refeicao:'🍲',remedio:'💊',proteina:'🍫',colher:'🥄',alicate:'🔧',mapa:'🗺️',chave:'🔑',bilhete:'📄',frango:'🍗',uniforme:'👕'};
SPR_OF.frango=null;
const _spr0=spr;
/* ---- mão ---- */
P.hand=null;
function cycleHand(){const ks=Object.keys(P.inv).filter(k=>P.inv[k]>0);if(!ks.length){P.hand=null;toast('Bolsos vazios.');return}
  const i=ks.indexOf(P.hand);P.hand=ks[(i+1)%ks.length];toast('Na mão: '+ITEMS[P.hand].n);sfx('tick')}
function useHand(){audioInit();const k=P.hand;if(!k||!P.inv[k]){cycleHand();return}
  const it=ITEMS[k];
  if(it.food||it.heal||it.str||it.en||it.phone||it.skate||it.wear){useItem(k);return}
  if(it.dmg||k==='colher'||k==='alicate')return punch();
  toast(it.desc||it.n)}
const _addItem=addItem;addItem=function(id,n,to){_addItem(id,n,to);if(!to||to===P.inv){if(!P.hand||!P.inv[P.hand])P.hand=id}};
function wpn(){return P.hand==='motosserra'&&P.inv.motosserra?26:P.hand==='faca'&&P.inv.faca?7:0}
const _dc4=drawChar;drawChar=function(e,sx,gy,s,opt){
  if(e&&e.car){carShape(sx,gy,'#c0392b',s*1.15,e.face||1);return}
  _dc4(e,sx,gy,s,opt);
  if(e&&e.kind==='p'&&e.hand&&!e.sleeping){const f=e.face||1,b=(e.big||1)*s;
    c.save();c.translate(sx+f*30*b,gy-60*b);
    const sw=e.atk>0?Math.sin((1-e.atk/(e.atkD||.3))*3.1)*1.5:.25;c.rotate(f*(sw-.2));
    if(SPR_OF[e.hand]&&IMG[SPR_OF[e.hand]])spr(SPR_OF[e.hand],0,14*b,36*b,f<0);
    else{c.font=(26*b)+'px system-ui';c.textAlign='center';c.fillText(EMO[e.hand]||'📦',0,8*b)}
    c.restore()}};
/* ---- carros, sanita ---- */
function carShape(x,gy,col,s,f){c.save();c.translate(x,gy);c.scale(f*s,s);
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,0,95,12,0,0,TAU);c.fill();
  rr(-90,-48,180,34,10,col);rr(-52,-84,104,42,14,col);
  c.fillStyle='#bfe3f2';rr(-44,-78,40,30,6,'#bfe3f2');rr(2,-78,40,30,6,'#bfe3f2');
  R(86,-40,8,10,'#ffe9a0');R(-94,-40,8,10,'#ff5a5a');
  for(const wx of[-52,52]){c.fillStyle='#111';c.beginPath();c.arc(wx,-12,17,0,TAU);c.fill();c.fillStyle='#999';c.beginPath();c.arc(wx,-12,7,0,TAU);c.fill()}
  c.restore()}
const CARS=[{x:1500,z:.2,col:'#2c6fb5'},{x:2150,z:.15,col:'#e0b020'},{x:2750,z:.25,col:'#3a9d5d'}];
FURN.push({scene:'solitaria',k:'sanita',x:600,z:.15,h:70,label:'Sanita (esconder/pegar)'},{scene:'enfermaria',k:'sanita',x:1100,z:.12,h:70,label:'Sanita (esconder/pegar)'});
IMG.sanita={};
const _spr4=spr;spr=function(k,x,gy,h,fl,al){
  if(k==='sanita'){c.save();c.translate(x,gy);rr(-26,-h*.5,52,h*.5,14,'#eef2f4');rr(-20,-h,40,h*.55,6,'#dfe6e9');rr(-30,-h*.55,60,10,5,'#cfd8dc');c.restore();return}
  _spr4(k,x,gy,h,fl,al)};
const _dd4=drawDecor;drawDecor=function(sc,x0,x1){_dd4(sc,x0,x1);
  if(sc.id==='rua')for(const k of CARS)if(!k.taken&&k.x>x0-150&&k.x<x1+150)carShape(k.x,zY(k.z),k.col,1.1,1)};
const _na4=nearestAct;nearestAct=function(){
  if(P.car)return{kind:'carout',label:'Sair do carro'};
  if(P.scene==='rua')for(const k of CARS)if(!k.taken&&Math.abs(k.x-P.x)<130&&Math.abs(k.z-P.z)<.3)return{car:k,kind:'carin',label:'Entrar no carro'};
  return _na4()};
const _da4=doAct;doAct=function(a){
  if(a&&a.kind==='carin'){P.car=a.car;a.car.taken=true;toast('Carro! Foge para a direita!');sfx('boom');return}
  if(a&&a.kind==='carout'){const k=P.car;k.taken=false;k.x=P.x;k.z=P.z;P.car=null;return}
  _da4(a)};
const _t4=tick7;tick7=function(dt){_t4(dt);
  if(P.car){P.car.x=P.x;if(P.scene!=='rua'){P.car.taken=false;P.car=null}}
  if(P.hand&&!P.inv[P.hand])P.hand=null;
  const u=$('#bU');if(u){const t='USAR<small>'+(P.hand?ITEMS[P.hand].n:'mão vazia')+'</small>';if(u._t!==t){u._t=t;u.innerHTML=t}}};
(function(){const bind=(id,fn)=>{const e=$(id);if(!e)return;e.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();audioInit();fn()})};
  bind('#bU',useHand);bind('#bH',cycleHand);
  window.addEventListener('keydown',e=>{if(e.key==='e'||e.key==='E')useHand();if(e.key==='q'||e.key==='Q')cycleHand()})})();
/* ---- online estável ---- */
function netRevive(){
  if(!Net.on)return;try{Net.es&&Net.es.close()}catch(e){}
  try{const es=new EventSource(nurl(''));Net.es=es;
    es.addEventListener('put',e=>{Net.lastMsg=performance.now();netMsg(e,false)});es.addEventListener('patch',e=>{Net.lastMsg=performance.now();netMsg(e,true)});
    es.onerror=()=>{Net.status='a reconectar…'};es.onopen=()=>{Net.status='online';Net.lastMsg=performance.now()}}catch(e){}}
setInterval(()=>{if(!Net.on)return;const now=performance.now();
  if(!Net.es||Net.es.readyState===2||(Net.lastMsg&&now-Net.lastMsg>45000)){Net.lastMsg=now;netRevive()}},4000);
const _nput=nput;nput=function(p,d){return _nput(p,d).catch(()=>{Net.status='a reconectar…'})};
const _nu4=netUpdate;netUpdate=function(dt){_nu4(dt);if(Net.posT0>.28)Net.posT0=.28};
