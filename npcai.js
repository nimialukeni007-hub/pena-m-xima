'use strict';
/* Vida própria dos NPCs: personalidade, necessidades, memória, relações, conversas, combate com peso, vigilância */
(()=>{
if(typeof NPC==='undefined'||typeof updateNPC!=='function')return;
const rr=(a,b)=>a+Math.random()*(b-a),pk=a=>a[Math.floor(Math.random()*a.length)];
const hash=s=>{let h=7;for(const c of String(s||'x'))h=(h*31+c.charCodeAt(0))>>>0;return h};
const TR=['calmo','violento','ladrao','covarde','sociavel'],GTR=['rigido','preguicoso','corrupto','gentil','agressivo'];
const alive=n=>NPC.indexOf(n)>=0;
let MEM={},memK='',lastDay=-1,offT=0,svT=0,propCd=0,FV=null,HS=0;
function mem(){const k=(typeof SAVEKEY!=='undefined'?SAVEKEY:'pm_v2')+'_npcmem';if(k!==memK){memK=k;try{MEM=JSON.parse(localStorage.getItem(k)||'{}')}catch(e){MEM={}}}return MEM}
function save(force){if(!force&&GT-svT<10)return;svT=GT;try{localStorage.setItem(memK,JSON.stringify(MEM))}catch(e){}}
const clampv=(v,a,b)=>Math.max(a,Math.min(b,v));
/* ---------- rosto e corpo únicos ---------- */
function genLook(n,h){const l={},g=n.guard||n.cop;
  const hx=g?0:[0,0,1,2,3,4,0,0][(h>>3)%8];if(hx){l.hx=hx;l.hair=0}
  l.jaw=.94+((h>>5)%7)*.03;l.nose=.85+((h>>7)%5)*.1;l.brow=.8+((h>>9)%4)*.2;
  let fx=0;const bits=[1,2,4,8,16,32];
  if(!g){if((h>>11)%5<2)fx|=bits[(h>>13)%5];if(n.leader||(h>>16)%4===0)fx|=5}else if((h>>11)%4===0)fx|=1;
  l.fx=fx;if(!g&&(h>>18)%3===0)l.beard=(h>>20)%4;return l}
function brain(n){let b=n._br;if(b)return b;const M=mem(),h=hash(n.name);
  const m=M[n.name]||(M[n.name]={p:0,r:{}});
  b=n._br={m,tr:n.leader?'chefe':n.cop?'duro':n.guard?GTR[h%5]:TR[h%5],hunger:.15+(h%5)/10,energy:rr(.5,1),fear:0,anger:0,mood:.6,goal:null,gT:0,next:rr(3,9),pCd:0,gcd:0};
  n.lk=Object.assign(genLook(n,h),n.lk||{});return b}
function rel(a,o){const m=brain(a).m.r;if(m[o.name]==null){let v=((hash(a.name+o.name)%41)-20);if(a.gang&&o.gang)v+=a.gang===o.gang?30:-40;m[o.name]=v}return m[o.name]}
function addRel(a,o,d){const m=brain(a).m.r;m[o.name]=clampv(rel(a,o)+d,-100,100)}
function pRel(n,d){const m=brain(n).m;m.p=clampv((m.p||0)+d,-100,100)}
/* ---------- linhas de conversa ---------- */
const TALK={calmo:['Hoje está calmo.','Um dia de cada vez.','Isto passa.'],violento:['Se alguém me chatear, leva.','Aqui mandam os fortes.'],ladrao:['Aqui tudo tem preço.','Se vires algo mal posto, avisa.'],covarde:['Não quero problemas.','Eu não vi nada.'],sociavel:['Já comeste?','Há novidades?'],chefe:['Neste pátio há regras.','Respeito primeiro.'],duro:['Em ordem.']};
const ANS=['Pois.','É verdade.','Hmm, não sei…','Ha, boa!','Tens razão.'];
const GOOD=['Respeito, irmão.','Estás bem? Conta comigo.','Bom ver-te.'],BAD=['Não me olhes assim.','Ainda me deves uma.','Afasta-te de mim.'];
/* ---------- barulho e guardas ---------- */
function noise(sc,x){let best=null,bd=1e9;for(const g of GUARDS){if(g.fixed||g.sec||g.state!=='patrol'||g.inv)continue;const d=g.scene===sc?Math.abs(g.x-x):900+Math.random()*900;if(d<bd){bd=d;best=g}}
  if(best)best.inv={scene:sc,x:Math.max(100,x),t:28};
  for(const n of NPC){if(n.scene!==sc||n.fixed||n.ko>0||Math.abs(n.x-x)>800)continue;const b=brain(n);if(GT<(b.hearCd||0))continue;b.hearCd=GT+9;
    if(b.tr==='covarde')b.fear=Math.min(1,b.fear+.35);else if(!b.goal&&n.talkHold<=GT&&b.tr!=='violento'){n.face=Math.sign(x-n.x)||n.face;n.talkHold=GT+2;say(n,pk(['O que foi isso?','Ouviram?','Barulho ali.']),2)}}}
function placeName(sc){return sc==='off'?'a cela (a dormir)':SC[sc]?SC[sc].n:'algures'}
function sees(n,x){return n.scene===P.scene&&Math.abs(x-n.x)<560&&(Math.abs(x-n.x)<190||Math.sign(x-n.x)===n.face)}
const FIGHTS=new Set();
let noG=false;function guardNear(n,r){return !noG&&GUARDS.some(g=>g.scene===n.scene&&!g.ko&&!g.down&&Math.abs(g.x-n.x)<r)}
function breakUp(a,b){[a,b].forEach(n=>{if(!n)return;n.down=Math.max(n.down||0,4);n._br.goal=null;n.foe=null;n._br.anger=0;n._br.fear=.3;n.aggro=Math.min(n.aggro||0,0)});
  if(typeof cm==='function')cm('Separem-se já! Cada um para o seu lado!','Guarda');if(typeof sfx==='function')sfx('alarm')}
/* ---------- necessidades ---------- */
function needs(n,b,dt){
  b.hunger=Math.min(1,b.hunger+dt*.0016);b.energy=Math.max(0,b.energy-dt*.0009);
  if(n.scene==='refeitorio'||n.scene==='cantina')b.hunger=Math.max(0,b.hunger-dt*.04);
  if(n.scene==='cela'||n.scene==='off')b.energy=Math.min(1,b.energy+dt*.01);
  b.anger=Math.max(0,b.anger-dt*.02);b.fear=Math.max(0,b.fear-dt*.05);
  b.mood=clampv(1-b.hunger*.5-(1-b.energy)*.3-b.anger*.3-b.fear*.2,0,1)}
/* ---------- expressões e postura (lidas pelo desenho) ---------- */
function look(n,b,dt){
  let ex=0;const lying=n.ko>0||n.down>0,fight=n.aggro>0||b.goal==='fight'||n.state==='chase'||n.state==='revista';
  if(lying||n.hurt>0)ex=4;else if(fight)ex=2;else if(b.fear>.5||b.goal==='flee')ex=3;else if(b.hunger>.85||b.energy<.22||b.goal==='rest'||n.hp<n.mhp*.3)ex=5;else if(n.talkT>0&&b.mood>.5)ex=1;else if(b.mood>.78)ex=1;
  n.expr=ex;const k=Math.min(1,dt*4);
  const hp=n.hp/n.mhp,hT=(b.goal==='rest'?.9:hp<.35?.8:(b.energy<.3||b.hunger>.9)?.55:0),gT=(fight||b.goal==='steal'&&0)?.85:(b.fear>.5?.7:0);
  n.hunch=(n.hunch||0)+(hT-(n.hunch||0))*k;n.gd=(n.gd||0)+(gT-(n.gd||0))*k;n.gest=(n.gest||0)+((n.talkT>0?1:0)-(n.gest||0))*k;
  n.wound=hp<.55?1:0;n.bld=hp<.3?.9:hp<.5?.5:0}
/* ---------- objetivos ---------- */
function nearestNPC(n,f,r){let best=null,bd=r||900;for(const o of NPC){if(o===n||o.scene!==n.scene||o.ko>0||o.down>0||o.fixed&&!o.isShop)continue;if(f&&!f(o))continue;const d=Math.abs(o.x-n.x);if(d<bd){bd=d;best=o}}return best}
function setGoal(n,b,g,T,extra){b.goal=g;b.gT=T;b.t=0;Object.assign(b,extra||{})}
function endGoal(n,b){b.goal=null;b.next=rr(5,14);b.tgt=null;n.running=false;n.moving=false}
function choose(n,b){
  const sc=n.scene;
  if(b.fear>.65||n.hp<n.mhp*.3){setGoal(n,b,'flee',7);if(!b.shouted){b.shouted=1;say(n,pk(['Socorro!','Alguém ajude!','Não me batam!']),2.2);noise(sc,n.x)}return}
  if(n.foe&&alive(n.foe)&&n.foe.scene===sc&&b.anger>.35){setGoal(n,b,'fight',16,{tgt:n.foe});return}
  if(b.hunger>.88&&sc!=='refeitorio'&&sc!=='cantina'){setGoal(n,b,'eat',40);return}
  if(b.energy<.22){setGoal(n,b,'rest',10);return}
  const p=brain(n).m.p,r=Math.random();
  if(b.tr==='violento'||b.tr==='chefe'){
    const en=nearestNPC(n,o=>rel(n,o)<-25,800);
    if(en&&(r<.3&&!guardNear(n,600)||b.anger>.9)){n.foe=en;b.anger=.8;setGoal(n,b,'fight',16,{tgt:en});if(!en.foe)en.foe=n;return}
    if(sc==='patio'&&r<.5){setGoal(n,b,'train',9);return}}
  if(b.tr==='ladrao'&&r<.35&&brain(n).m.leave!==S.day){
    const tg=(P.scene===sc&&p<20&&P.money>10&&r<.2)?P:nearestNPC(n,o=>!o.leader&&!o.isShop&&!o.cop,700);
    if(tg&&!guardNear(n,450)){setGoal(n,b,'steal',12,{tgt:tg});return}}
  if(P.scene===sc&&GT>propCd&&GT>b.pCd&&Math.abs(P.x-n.x)<900&&!P.sleeping&&!P.busy&&r<.45){setGoal(n,b,'approach',14);return}
  if((b.tr==='sociavel'||b.tr==='calmo'||r<.3)&&r<.7){const o=nearestNPC(n,x=>rel(n,x)>-20&&!x._br?.goal,700);if(o){setGoal(n,b,'chat',16,{tgt:o});return}}
  b.next=rr(4,11)}
function topic(n,b,t){const L=(TALK[b.tr]||TALK.calmo).slice(),hr=hh(),p=b.m.p;
  if(hr>=19)L.push('Já é tarde, daqui a pouco recolhem-nos.');if(hr<8)L.push('Ainda é cedo e já tenho fome.');
  L.push('Estamos aqui em '+placeName(n.scene)+' e ninguém faz nada.');
  if(G.news.length)L.push('Ouviste? '+pk(G.news));
  if(p<-30)L.push('Aquele novato é perigoso, cuidado.');if(p>30)L.push('O novato é de confiança.');
  if(guardNear(n,500))L.push('Fala baixo, o guarda está a olhar.');
  if(b.hunger>.6)L.push('Estou com fome, já passou a hora?');
  const e=NPC.find(o=>o!==n&&rel(n,o)<-40);if(e)L.push(e.name+' que não me apareça à frente. Vi-o por '+placeName(e.scene)+'.');
  return pk(L)}
function face(a,t){a.face=Math.sign(t.x-a.x)||a.face}
function greet(n,b){if(GT<b.gcd||n.talkT>0||Math.abs(n.x-P.x)>170||n.scene!==P.scene)return;b.gcd=GT+45;const p=b.m.p;
  if(n.guard){if(p>35)say(n,pk(['Bom dia, rapaz. Continua assim.','Estás a portar-te bem.']),2.4);else if(p<-35)say(n,pk(['Estou de olho em ti.','Um passo em falso e vais para a solitária.']),2.4)}
  else if(p>35)say(n,pk(GOOD),2.4);else if(p<-35)say(n,pk(BAD),2.4)}
function run(n,b,dt){
  const g=b.goal,t=b.tgt;b.t+=dt;
  if(g==='flee'){const th=n.foe&&alive(n.foe)?n.foe:P,dir=Math.sign(n.x-th.x)||1;n.running=true;stepToward(n,n.x+dir*400,n.z,n.spd*1.5,dt);if(b.fear<.2||b.t>6){b.shouted=0;n.foe=null;return 1}return 0}
  if(g==='rest'){n.moving=false;b.energy=Math.min(1,b.energy+dt*.03);return b.energy>.6}
  if(g==='train'){n.moving=false;if(b.t%1.3<dt&&n.atk<=0){n.atk=.28;n.atkD=.28;n.face=n.x>800?-1:1}return b.t>b.gT}
  if(g==='eat'){if(n.scene==='cantina'){n.moving=false;if(!b.ate){b.ate=1;say(n,'Dá cá um pão.',2)}b.hunger=Math.max(0,b.hunger-dt*.1);if(b.hunger<.3){b.ate=0;return 1}return 0}
    routeStep(n,'cantina',dt);return 0}
  if(g==='chat'){if(!t||!alive(t)||t.scene!==n.scene||t.ko>0||t.down>0||(t._br&&t._br.goal==='fight'))return 1;
    const d=Math.abs(t.x-n.x);if(d>110){stepToward(n,t.x-Math.sign(t.x-n.x)*85,t.z,n.spd*.8,dt);return 0}
    n.moving=false;face(n,t);if(!b.said){b.said=1;b.sayT=0;n.talkHold=GT+7;t.talkHold=GT+7;t.moving=false;face(t,n);
      say(n,topic(n,b,t),3.4);b.said=1;b.ans=2.8}
    if(b.ans>0){b.ans-=dt;if(b.ans<=0){say(t,pk(ANS),2.4);addRel(n,t,3);addRel(t,n,3);b.mood=Math.min(1,b.mood+.1)}}
    if(b.t>7){b.said=0;return 1}return 0}
  if(g==='help'){if(!t||!alive(t)||t.scene!==n.scene)return 1;if(Math.abs(t.x-n.x)>110){stepToward(n,t.x-Math.sign(t.x-n.x)*70,t.z,n.spd*.9,dt);return 0}
    n.moving=false;face(n,t);if(!b.h){b.h=1;say(n,pk(['Estás bem? Aguenta.','Levanta, amigo.','Calma, eu estou aqui.']),2.6);t.hp=Math.min(t.mhp,t.hp+14);t.ko=Math.min(t.ko||0,3);t.down=0;addRel(t,n,8);addRel(n,t,4)}
    if(b.t>4){b.h=0;return 1}return 0}
  if(g==='steal'){if(!t||(t!==P&&!alive(t)))return 1;if(t!==P&&(t.scene!==n.scene))return 1;
    const d=Math.abs(t.x-n.x);if(d>70){stepToward(n,t.x,t.z,n.spd*1.05,dt);return 0}
    n.moving=false;
    if(t===P){const amt=Math.min(P.money,Math.round(rr(8,24)));if(amt>0&&Math.random()<.6&&!P.sleeping){P.money-=amt;n.loot=(n.loot||0)+amt;n.thief=GT+150;toast('Sentiste uma mão no bolso… perdeste '+amt+' Kz!',3200);pRel(n,-6);b.fear=.7;b.shouted=1;setGoal(n,b,'flee',6);return 0}
      say(n,'Desculpa, tropecei.',2);pRel(n,-1);return 1}
    if(Math.random()<.55){say(n,'…',1);t.foe=n;if(t._br){t._br.anger=.8}addRel(t,n,-40);b.fear=.4;noise(n.scene,n.x)}return 1}
  if(g==='approach'){if(P.scene!==n.scene)return 1;const d=Math.abs(P.x-n.x);
    if(d>130){stepToward(n,P.x-Math.sign(P.x-n.x)*100,P.z,n.spd,dt);return 0}
    n.moving=false;face(n,P);
    if(P.moving||P.busy||P.sleeping||G.paused)return b.t>b.gT;
    if(propose(n,b)){b.pCd=GT+160;propCd=GT+70;return 1}return b.t>b.gT}
  if(g==='fight'){const f=t;if(!f||!alive(f)||f.scene!==n.scene||f.ko>0||(n.foe!==f)){n.foe=null;return 1}
    FIGHTS.add(n);if(b.t%4<dt)noise(n.scene,n.x);
    const d=Math.abs(f.x-n.x);n.running=d>200;face(n,f);
    if(d>95||Math.abs(f.z-n.z)>.15){stepToward(n,f.x-Math.sign(f.x-n.x)*70,f.z,n.spd*1.3,dt);return b.t>b.gT}
    n.moving=false;n.running=false;
    if(n.cd<=0&&!(n.atk>0)){n.cd=1.15;n.wind=.3}
    if(n.wind>0){n.wind-=dt;n.gd=Math.max(n.gd||0,.9);if(n.wind<=0){n.atk=.28;n.atkD=.28;const dmg=rr(3,7)*(n.big||1);f.hp-=dmg;f.hurt=.22;f._hBy=GT;f.x+=Math.sign(f.x-n.x)*16;
        if(typeof sfx==='function')sfx('punch');if(f._br){f._br.anger=Math.min(1,f._br.anger+.3);if(!f.foe)f.foe=n}
        if(f.hp<f.mhp*.3){f._br.fear=1;f.foe=null}
        if(f.hp<=0){f.hp=f.mhp*.35;f.ko=40;f.foe=null;n.foe=null;addRel(n,f,-10);addRel(f,n,-20);G.news.push(n.name+' deixou '+f.name+' KO '+SC[n.scene].n.toLowerCase()+'.');if(G.news.length>6)G.news.shift();return 1}}}
    return b.t>b.gT}
  return 1}
function percept(n,b,dt){b.pt=(b.pt||0)-dt;if(b.pt>0||n.scene!==P.scene||b.goal==='fight'||b.goal==='flee'||n.fixed)return;b.pt=.6+Math.random()*.3;
  const tr=b.tr,guard=guardNear(n,600);
  /* denunciar quem anda com coisas proibidas */
  if((tr==='covarde'||tr==='sociavel'||tr==='duro')&&GT>(b.snT||0)&&sees(n,P.x)&&!P.uniform&&P.heat<90&&typeof contraband==='function'&&Object.keys(contraband()).length&&b.m.p<20&&Math.random()<.2){
    b.snT=GT+60;say(n,pk(['Guarda! Aquele tem coisas proibidas!','Eu vi o que ele tem no bolso!']),2.8);P.heat=Math.min(100,P.heat+12);noise(P.scene,P.x);pRel(n,-2);return}
  /* testemunhar lutas */
  for(const f of FIGHTS){if(GT<(b.wT||0)||f===n||f.scene!==n.scene||!f.foe||!sees(n,f.x))continue;b.wT=GT+14;const foe=f.foe;
    if(tr==='covarde'){b.fear=Math.min(1,b.fear+.6);say(n,'Luta! Saiam daí!',2)}
    else if(tr==='sociavel'){n.face=Math.sign(f.x-n.x)||n.face;n.talkHold=GT+3.5;say(n,'Luta! Luta!',2.2)}
    else if(tr==='calmo'||tr==='duro'){say(n,'Guarda! Estão a lutar!',2.2);noise(n.scene,f.x)}
    else if(tr==='violento'||tr==='chefe'){const a=rel(n,f),c=rel(n,foe);if(a>10&&c<10&&alive(foe)){n.foe=foe;b.anger=.85;say(n,'Eu ajudo-te!',2);setGoal(n,b,'fight',14,{tgt:foe});return}}
    else say(n,'Não é comigo.',2);return}
  /* ajudar quem caiu */
  if((tr==='sociavel'||tr==='calmo')&&!b.goal){const v=nearestNPC(n,o=>(o.ko>0||o.hp<o.mhp*.3)&&rel(n,o)>0&&sees(n,o.x),500);if(v){setGoal(n,b,'help',9,{tgt:v});return}}}
function life(n,b,dt){percept(n,b,dt);if(b.goal==='fight'&&0)return;
  if(b.goal){if(run(n,b,dt)||b.t>b.gT){FIGHTS.delete(n);endGoal(n,b)}return true}
  if(n.scene===P.scene&&n.moving===false)greet(n,b);
  b.next-=dt;if(b.next<=0)choose(n,b);return false}
/* ---------- propostas e conversas com escolhas ---------- */
const shut=f=>()=>{closePanel();f()};
function opt(n,b){const p=b.m.p,gang=n.gang&&n.gang!==P.gang;
  if(p<-30&&(b.tr==='violento'||b.tr==='chefe'||n.gang)&&b.m.leave!==S.day)return'confronto';
  if(gang&&p<10&&S.day>1&&b.m.prot!==S.day)return'protecao';
  if(p>=15&&!FV&&NPC.some(o=>o!==n&&killable(o)&&rel(n,o)<0))return'favor';
  return pk(['troca','dica','troca','onde'])}
function propose(n,b){if(panelOpen||G.paused)return false;const k=opt(n,b),nm=n.name,pre='<p><b>'+nm+'</b> aproxima-se de ti.</p>';
  if(k==='confronto'){const amt=Math.max(5,Math.min(P.money,Math.round(10+P.money*.1)));
    openPanel(nm,pre+'<p>“Andas a meter-te comigo. Pagas '+amt+' Kz ou levas.”</p>',[
      {t:'Pagar '+amt+' Kz',dis:P.money<amt,f:shut(()=>{P.money-=amt;b.m.leave=S.day;pRel(n,6);toast('Pagaste. Ele deixa-te em paz por hoje.')})},
      {t:'Intimidar',f:shut(()=>{if(P.str+rr(0,22)>30){b.fear=.9;b.anger=0;pRel(n,-3);say(n,'Calma, estava só a brincar.',2.4);toast('Ele recuou.')}else{n.aggro=14;pRel(n,-6);say(n,'Vais ver!',2)}})},
      {t:'Recusar',f:shut(()=>{pRel(n,-8);b.anger=.8;n.aggro=14;say(n,'Então levas!',2)})}]);return true}
  if(k==='protecao'){const amt=Math.max(6,Math.round(8+S.day*1.5));
    openPanel(nm,pre+'<p>“Neste pátio há donos. Dá-me '+amt+' Kz e hoje ninguém do meu bando te toca.”</p>',[
      {t:'Pagar '+amt+' Kz',dis:P.money<amt,f:shut(()=>{P.money-=amt;b.m.prot=S.day;pRel(n,12);NPC.forEach(o=>{if(o.gang===n.gang)brain(o).m.prot=S.day});toast('Protegido pelos '+(GANG[n.gang]?GANG[n.gang].n:'bando')+' até ao fim do dia.')})},
      {t:'Recusar',f:shut(()=>{pRel(n,-6);b.anger=.5;say(n,'Depois não venhas chorar.',2.4)})}]);return true}
  if(k==='favor'){const tg=pk(NPC.filter(o=>o!==n&&killable(o)&&rel(n,o)<0));if(!tg)return false;const rew=20+Math.round(rr(0,15));
    openPanel(nm,pre+'<p>“'+tg.name+' faltou-me ao respeito. Dá-lhe uma lição (não precisa de morrer) e pago-te '+rew+' Kz.”</p>',[
      {t:'Aceitar',f:shut(()=>{FV={by:n,tg,t:GT+260,rew};toast('Favor aceite: dá uma lição a '+tg.name+'.',3200)})},
      {t:'Recusar',f:shut(()=>{pRel(n,-2)})}]);return true}
  if(k==='dica'){const H=['Ao fundo do pátio a cerca está mais fraca. Mas só se tiveres alicate.','Os guardas descuidam-se com a luz do nascer. Vê o horário.','Quem usa o uniforme certo passa quase sempre sem problemas.','O Zé da cantina vende mais do que pão, se perguntares com jeito.','Uma câmara vê tudo. Mas só se estiveres a fazer o que não deves.'];
    openPanel(nm,pre+'<p>“Gosto de ti. Conto-te uma coisa por '+Math.round(5+S.day)+' Kz?”</p>',[
      {t:'Pagar e ouvir',dis:P.money<5+S.day,f:shut(()=>{P.money-=Math.round(5+S.day);pRel(n,5);openPanel(nm,'<p>“'+pk(H)+'”</p>',[{t:'Obrigado',f:closePanel}])})},
      {t:'Agora não',f:shut(()=>{})}]);return true}
  if(k==='onde'){const L=NPC.filter(o=>o!==n&&!o.cop).sort(()=>Math.random()-.5).slice(0,3);
    openPanel(nm,pre+'<p>“Aqui sei onde cada um anda. Quem procuras?”</p>',L.map(o=>({t:o.name,f:()=>{closePanel();openPanel(nm,'<p>“'+o.name+' anda por: <b>'+placeName(o.scene)+'</b>'+(o.hp<o.mhp*.5?' (está ferido).':'.')+'”</p>',[{t:'Obrigado',f:closePanel}]);pRel(n,2)}})).concat([{t:'Ninguém',f:closePanel}]));return true}
  /* troca */
  const it=pk([['pao',4],['refeicao',9],['remedio',20]]),def=ITEMS[it[0]];
  openPanel(nm,pre+'<p>“Tenho aqui <b>'+def.n+'</b>. '+it[1]+' Kz e é teu.”</p>',[
    {t:'Comprar por '+it[1]+' Kz',dis:P.money<it[1],f:shut(()=>{P.money-=it[1];addItem(it[0],1);pRel(n,4);toast('Recebeste: '+def.n)})},
    {t:'Não, obrigado',f:shut(()=>{})}]);return true}
/* ---------- memória, reputação, fora de cena ---------- */
function onHit(n){if(n._hBy>GT-.5)return;if(!(P.atk>0)||Math.abs(n.x-P.x)>300||n.scene!==P.scene)return;
  const b=brain(n);pRel(n,-6);b.anger=Math.min(1,b.anger+.35);if(b.tr==='covarde')b.fear=Math.min(1,b.fear+.5);
  if(b.tr==='violento'&&n.hp>n.mhp*.4&&!n.aggro&&!n.cop)n.aggro=12;
  if(n.loot){const a=n.loot;n.loot=0;P.money+=a;toast('Recuperaste '+a+' Kz!',2600);pRel(n,-4)}
  for(const w of NPC){if(w===n||w.scene!==n.scene||Math.abs(w.x-n.x)>550)continue;const r=rel(w,n);
    if(r>20){pRel(w,-3);brain(w).anger=Math.min(1,brain(w).anger+.2)}else if(r<-25)pRel(w,2)}}
function onKO(n){if(n._hBy>GT-1)return;if(Math.abs(n.x-P.x)>350||n.scene!==P.scene)return;pRel(n,-8);
  if(n.loot){const a=n.loot;n.loot=0;P.money+=a;toast('Recuperaste '+a+' Kz!',2600)}
  for(const w of NPC){if(w===n||w.scene!==n.scene)continue;const r=rel(w,n);if(r>30){pRel(w,-6);addRel(w,n,0)}else if(r<-25)pRel(w,4)}}
function offscreen(dt){offT-=dt;if(offT>0)return;offT=22;
  const by={};for(const n of NPC){if(n.scene==='off'||n.scene===P.scene||n.fixed||n.ko>0)continue;(by[n.scene]=by[n.scene]||[]).push(n)}
  for(const sc in by){const L=by[sc];if(L.length<2)continue;const a=pk(L),b2=pk(L);if(a===b2)continue;
    const r=rel(a,b2);
    if(r<-30&&Math.random()<.3){const w=Math.random()<.5?a:b2,l=w===a?b2:a;l.hp=Math.max(10,l.hp-rr(8,22));addRel(a,b2,-8);addRel(b2,a,-8);
      G.news.push(a.name+' e '+b2.name+' brigaram '+(SC[sc]?SC[sc].n.toLowerCase():'')+'.');if(G.news.length>6)G.news.shift()}
    else if(r>35&&Math.random()<.2){addRel(a,b2,4);addRel(b2,a,4)}}
  const hn=pk(NPC.filter(n=>n.scene!=='off'&&n.scene!==P.scene&&!n.fixed&&n.ko<=0&&brain(n).tr==='violento'));
  if(hn){const en=NPC.find(o=>o!==hn&&o.scene!=='off'&&o.scene!==hn.scene&&!o.fixed&&rel(hn,o)<-45);
    if(en&&Math.random()<.35){hn.scene=en.scene;hn.x=en.x+(Math.random()<.5?-260:260);G.news.push(hn.name+' foi à procura de '+en.name+' ('+placeName(en.scene)+').');if(G.news.length>6)G.news.shift()}}}
function daily(){if(S.day===lastDay)return;lastDay=S.day;const M=mem();for(const k in M){M[k].p=Math.round((M[k].p||0)*.85);M[k].prot=M[k].prot===S.day?S.day:M[k].prot}save(true)}
function ai(dt){mem();daily();offscreen(dt);
  for(const n of NPC){
    if(n.hurt>.15){if(!n._hz){n._hz=1;onHit(n)}}else n._hz=0;
    if(n.ko>0){if(!n._kz){n._kz=1;onKO(n)}}else n._kz=0}
  if(FV){if(GT>FV.t||!alive(FV.tg)){FV=null}else if(FV.tg.ko>0||FV.tg.hp<FV.tg.mhp*.65){P.money+=FV.rew;pRel(FV.by,15);pRel(FV.tg,-12);toast(FV.by.name+' pagou-te '+FV.rew+' Kz.',3200);P.rep+=1;FV=null}}
  /* guardas intervêm nas lutas entre presos */
  for(const n of Array.from(FIGHTS)){const b=n._br,f=n.foe;if(!b||b.goal!=='fight'||!f||!alive(f)){FIGHTS.delete(n);continue}
    if(n.scene===P.scene&&guardNear(n,650)){n._gw=(n._gw||0)+dt;if(n._gw>2.4){n._gw=0;breakUp(n,f);FIGHTS.delete(n)}}else n._gw=0}
  save()}
/* ---------- ligação ao jogo ---------- */
const _un=updateNPC;updateNPC=function(n,dt){const b=brain(n);needs(n,b,dt);look(n,b,dt);if(n.ko>0&&b.goal){FIGHTS.delete(n);b.goal=null;n.foe=null;b.next=rr(6,12)}
  if(n.scene!==P.scene||n.fixed||n.ko>0||n.down>0||n.aggro>0||n.talkHold>GT){if(b.goal&&n.scene!==P.scene){b.goal=null}return _un(n,dt)}
  if(n.foe&&!alive(n.foe))n.foe=null;
  if(life(n,b,dt))return;
  _un(n,dt)};
if(typeof updateGuard==='function'){const _ug=updateGuard;
 updateGuard=function(g,dt,now){const b=brain(g);needs(g,b,dt);look(g,b,dt);
  if(!g.base)g.base=g.spd;g.spd=g.base*(g.hp<g.mhp*.35?.8:1)*(b.tr==='agressivo'?1.1:1);
  if(g.ko>0||g.down>0)return _ug(g,dt,now);
  if(g.hurt>.15){if(!g._hz){g._hz=1;if(P.atk>0&&Math.abs(g.x-P.x)<300&&g.scene===P.scene){say(g,pk(['Ahh! Reforços!','Está a atacar-me!','Reforços, depressa!']),2.4);noise(P.scene,P.x);pRel(g,-8)}}}else g._hz=0;
  if(g.state!=='chase'&&g.hp<g.mhp)g.hp=Math.min(g.mhp,g.hp+dt*.2);
  if(!g.fixed&&g.state==='patrol'){const see=g.scene===P.scene&&playerSeenBy(g);
    if(b.rest&&GT>=b.rest)b.rest=0;
    if(b.tr==='gentil'&&see&&violation()&&GT>(b.warnT||0)){b.warnT=GT+25;say(g,pk(['Ei! Pára com isso, é o último aviso.','Não me obrigues a chamar reforços.']),2.8);P.heat=Math.max(0,P.heat-8)}
    if(b.tr==='preguicoso'&&!see&&b.energy<.35&&!b.rest){b.rest=GT+7;say(g,'Que sono… cinco minutos.',2.2)}
    if(b.rest&&GT<b.rest){g.moving=false;b.energy=Math.min(1,b.energy+dt*.04);return}
    if(g.scene===P.scene&&!g.moving)greet(g,b)}
  return _ug(g,dt,now)}}
if(typeof doRevista==='function'){const _dr=doRevista;
 doRevista=function(g){const b=brain(g);let ks=[];try{ks=Object.keys(contraband())}catch(e){}
  if(b.tr==='corrupto'&&ks.length&&P.money>=15&&!panelOpen){const amt=Math.min(P.money,20+ks.length*10);
   openPanel(g.name,'<p><b>'+g.name+'</b> olha à volta e baixa a voz.</p><p>“Isso que levas é proibido… mas hoje estou de bom humor. '+amt+' Kz e eu não vi nada.”</p>',[
    {t:'Pagar '+amt+' Kz',f:()=>{closePanel();P.money-=amt;P.heat=Math.max(0,P.heat-20);pRel(g,-2);say(g,'Não vi nada. Circula.',2.4);toast('Subornaste o guarda.')}},
    {t:'Recusar',f:()=>{closePanel();_dr(g)}}]);return}
  _dr(g)}}
const _t7=tick7;tick7=function(dt){_t7(dt);try{ai(dt)}catch(e){}};
if(typeof strike==='function'){const _st=strike;strike=function(){const r=_st.apply(this,arguments);if(r){HS=.07;P.shake=Math.max(P.shake||0,.16)}return r}}
if(typeof update==='function'){const _up=update;update=function(dt,now){if(HS>0){HS-=dt;dt*=.15}return _up(dt,now)}}
if(typeof hurtPlayer==='function'){const _hp=hurtPlayer;hurtPlayer=function(d,src){if(!P.sleeping&&P.moving&&src&&!src.guard&&Math.random()<.2){fx.push({x:P.x,z:P.z,s:P.scene,t:.7,txt:'esquivou',col:'#9fd3ff'});return}
  _hp(d,src);if(d>5){HS=Math.max(HS,.05)}}}
if(typeof placeChar==='function'){const _pc=placeChar;placeChar=function(c,n,dt){_pc(c,n,dt);if(!n._br)return;c.expr=n.expr||0;c.hunch=n.hunch||0;c.gd=n.gd||0;c.gest=n.gest||0;c.wound=n.wound||0;c.bld=n.bld||0;c.ph0=c.ph0||(hash(n.name)%7)}}
window.NPCAI={where:placeName,setNoG:v=>{noG=v},mem,rel,brain,get FV(){return FV},propose:n=>propose(n,brain(n))};
})();
