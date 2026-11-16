/* Modo História, vídeo de abertura, conquistas, classificação, mercado clandestino, diretor e sons de passos. */
(function(){
const q=s=>document.querySelector(s);
const ST=window.ST={on:false,c:{},ev:{},ok:{}};
const css=document.createElement('style');
css.textContent=`#cine{position:fixed;inset:0;z-index:99;background:#000;display:none;touch-action:manipulation}#cine.on{display:block}#cine canvas{position:absolute;inset:0;width:100%;height:100%}
#cine .cap{position:absolute;left:0;right:0;bottom:0;padding:18px max(18px,env(safe-area-inset-left,0px)) calc(22px + env(safe-area-inset-bottom,0px));background:linear-gradient(transparent,rgba(0,0,0,.88) 40%);color:#f2efe6;font:600 19px/1.4 'Barlow Condensed',Inter,system-ui,sans-serif;letter-spacing:.3px;min-height:76px;text-wrap:balance}
#cine .skip{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));right:max(12px,env(safe-area-inset-right,0px));background:rgba(20,22,28,.7);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:8px 14px;font-weight:700}
#stObj{position:fixed;left:max(10px,env(safe-area-inset-left,0px));top:150px;z-index:5;max-width:230px;background:rgba(10,14,20,.72);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:7px 10px;color:#e8e6df;font:500 11.5px/1.35 Inter,system-ui,sans-serif;pointer-events:none;display:none}
body.ingame #stObj.on{display:block}#stObj b{display:block;color:#ffcf8a;font-size:11px;letter-spacing:.8px;text-transform:uppercase;margin-bottom:2px}#stObj .d{color:#9fe3a0}
#more .row2{display:flex;gap:8px;margin:6px 0}#more .tab{flex:1}#more .li{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:14px}#more .li i{font-style:normal;color:#ffcf8a}#more .li.off{opacity:.45}`;
document.head.appendChild(css);
const cvEl=document.createElement('div');cvEl.id='cine';cvEl.innerHTML='<canvas></canvas><div class="cap"></div><button class="skip">Saltar</button>';document.body.appendChild(cvEl);
const objEl=document.createElement('div');objEl.id='stObj';document.body.appendChild(objEl);

/* ---------- vídeo (cenas desenhadas) ---------- */
function sil(x,px,py,s,col,pose){x.fillStyle=col;x.beginPath();x.arc(px,py-s*1.55,s*.22,0,7);x.fill();x.fillRect(px-s*.26,py-s*1.32,s*.52,s*.82);x.fillRect(px-s*.23,py-s*.52,s*.19,s*.52);x.fillRect(px+s*.04,py-s*.52,s*.19,s*.52);
  x.strokeStyle=col;x.lineWidth=s*.15;x.lineCap='round';x.beginPath();
  if(pose==='up'){x.moveTo(px-s*.26,py-s*1.2);x.lineTo(px-s*.5,py-s*1.75);x.moveTo(px+s*.26,py-s*1.2);x.lineTo(px+s*.5,py-s*1.75)}
  else if(pose==='cuff'){x.moveTo(px-s*.26,py-s*1.2);x.lineTo(px-s*.1,py-s*.7);x.moveTo(px+s*.26,py-s*1.2);x.lineTo(px+s*.1,py-s*.7)}
  else if(pose==='punch'){x.moveTo(px+s*.26,py-s*1.2);x.lineTo(px+s*.9,py-s*1.3);x.moveTo(px-s*.26,py-s*1.2);x.lineTo(px-s*.4,py-s*.7)}
  else{x.moveTo(px-s*.26,py-s*1.2);x.lineTo(px-s*.34,py-s*.65);x.moveTo(px+s*.26,py-s*1.2);x.lineTo(px+s*.34,py-s*.65)}x.stroke()}
function drawCine(cv,k,t){const x=cv.getContext('2d'),w=cv.width,h=cv.height,u=h/10;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,w,h);
  const sky=(a,b)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,w,h)};
  const lights=(on)=>{const ph=Math.floor(t*5)%2,c1=ph?'255,40,50':'40,90,255',c2=ph?'40,90,255':'255,40,50';for(const [px,c] of [[w*.12,c1],[w*.88,c2]]){const g=x.createRadialGradient(px,h*.35,5,px,h*.35,w*.55);g.addColorStop(0,'rgba('+c+','+(.5*on)+')');g.addColorStop(1,'rgba('+c+',0)');x.fillStyle=g;x.fillRect(0,0,w,h)}};
  const city=()=>{let r=7;const rn=()=>(r=(r*9301+49297)%233280)/233280;x.fillStyle='#0b0f18';for(let i=0;i<22;i++){const bw=w/22*(1+rn()*.6),bh=u*(2+rn()*4);const bx=i*w/22;x.fillRect(bx,h*.72-bh,bw,bh);x.fillStyle='rgba(255,210,120,.55)';for(let j=0;j<6;j++)if(rn()>.55)x.fillRect(bx+bw*.2+rn()*bw*.5,h*.72-bh+rn()*bh*.9,3,4);x.fillStyle='#0b0f18'}};
  const shake=(a)=>x.translate((Math.random()-.5)*a,(Math.random()-.5)*a);
  if(k==='black'){sky('#05060a','#000');const g=x.createRadialGradient(w/2,h*.4,10,w/2,h*.4,w*.5);g.addColorStop(0,'rgba(60,70,100,'+(.18+.06*Math.sin(t*2))+')');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}
  else if(k==='street'){sky('#0d1426','#1b2236');x.fillStyle='rgba(230,230,255,.85)';x.beginPath();x.arc(w*.78,h*.18,u*.35,0,7);x.fill();city();x.fillStyle='#141824';x.fillRect(0,h*.72,w,h*.28);x.fillStyle='#2a3040';for(let i=0;i<10;i++)x.fillRect(i*w/9-((t*40)%(w/9)),h*.9,w/20,5);
    const g=x.createRadialGradient(w*.3,h*.6,5,w*.3,h*.6,u*3);g.addColorStop(0,'rgba(255,220,140,.35)');g.addColorStop(1,'rgba(255,220,140,0)');x.fillStyle=g;x.fillRect(0,0,w,h);sil(x,w*.2+t*u*.55,h*.88,u*1.5,'#05070b','down');lights(Math.min(1,t/3))}
  else if(k==='car'){sky('#0a1020','#171c2c');city();x.fillStyle='#12161f';x.fillRect(0,h*.72,w,h*.28);const cx=w*.64,cy=h*.86;x.fillStyle='#06080d';x.beginPath();x.roundRect(cx-u*2.6,cy-u*1.2,u*5.2,u*1.15,u*.3);x.fill();x.beginPath();x.roundRect(cx-u*1.5,cy-u*2.0,u*3,u*1,u*.4);x.fill();
    const ph=Math.floor(t*6)%2;x.fillStyle=ph?'#ff2c3c':'#2c5cff';x.fillRect(cx-u*.9,cy-u*2.18,u*.8,u*.2);x.fillStyle=ph?'#2c5cff':'#ff2c3c';x.fillRect(cx+u*.1,cy-u*2.18,u*.8,u*.2);
    sil(x,w*.3,h*.92,u*1.6,'#04050a','up');sil(x,w*.18,h*.92,u*1.7,'#0a0e18','down');lights(1)}
  else if(k==='cuffs'){sky('#07090e','#10131b');const g=x.createRadialGradient(w/2,h*.5,10,w/2,h*.5,u*5);g.addColorStop(0,'rgba(120,140,200,.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle='#7b4b2f';for(const sx of[-1,1]){x.beginPath();x.ellipse(w/2+sx*u*1.4,h*.52,u*.9,u*.5,sx*.5,0,7);x.fill()}x.strokeStyle='#b9c0cc';x.lineWidth=u*.13;for(const sx of[-1,1]){x.beginPath();x.ellipse(w/2+sx*u*.7,h*.52,u*.26,u*.4,0,0,7);x.stroke()}
    x.lineWidth=u*.07;x.setLineDash([u*.15,u*.05]);x.beginPath();x.moveTo(w/2-u*.45,h*.52);x.lineTo(w/2+u*.45,h*.52);x.stroke();x.setLineDash([]);lights(.5)}
  else if(k==='cell'){sky('#14161b','#0b0c10');x.fillStyle='#1a1d23';x.fillRect(0,h*.68,w,h*.32);const g=x.createLinearGradient(w*.62,0,w*.4,h*.8);g.addColorStop(0,'rgba(170,190,220,.32)');g.addColorStop(1,'rgba(170,190,220,0)');x.fillStyle=g;x.beginPath();x.moveTo(w*.62,h*.1);x.lineTo(w*.78,h*.1);x.lineTo(w*.5,h*.78);x.lineTo(w*.3,h*.78);x.fill();
    x.fillStyle='#8da2c0';x.fillRect(w*.62,h*.1,w*.16,h*.28);x.fillStyle='#0b0c10';for(let i=1;i<4;i++)x.fillRect(w*.62+i*w*.04-2,h*.1,4,h*.28);x.fillRect(w*.62,h*.23,w*.16,4);
    x.fillStyle='#262a33';x.fillRect(w*.08,h*.58,w*.3,u*.4);x.fillRect(w*.08,h*.58,u*.3,h*.3);sil(x,w*.3,h*.7,u*1.4,'#07080b','down')}
  else if(k==='fight'){sky('#0b0b10','#050507');x.save();shake(Math.max(0,8-(t%1.2)*10));const fl=(t%1.2)<.08;if(fl){x.fillStyle='rgba(255,255,255,.55)';x.fillRect(0,0,w,h)}
    x.fillStyle='#14161c';x.fillRect(0,h*.78,w,h*.22);sil(x,w*.38,h*.9,u*1.9,'#030305','punch');sil(x,w*.62,h*.9,u*1.4,'#12121a','down');sil(x,w*.8,h*.9,u*1.9,'#030305','punch');x.restore();
    const ph=Math.floor(t*3)%2;x.fillStyle='rgba('+(ph?'255,40,50':'40,90,255')+',.12)';x.fillRect(0,0,w,h)}
  const v=x.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,w*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.65)');x.fillStyle=v;x.fillRect(0,0,w,h)}
let CI=null;
window.cine=function(slides,done){if(CI)return;const cv=cvEl.querySelector('canvas'),cap=cvEl.querySelector('.cap');const dpr=Math.min(window.devicePixelRatio||1,1.5);
  const fit=()=>{cv.width=Math.round(innerWidth*dpr);cv.height=Math.round(innerHeight*dpr)};fit();
  CI={i:0,t:0,done,raf:0,last:performance.now(),fit};cvEl.classList.add('on');try{G.paused=true}catch(e){}
  const slide=()=>slides[CI.i];
  const start=()=>{CI.t=0;const s=slide();if(s.snd)try{audioInit();sfx(s.snd)}catch(e){}};
  const end=()=>{cancelAnimationFrame(CI.raf);cvEl.classList.remove('on');const d=CI.done;CI=null;window.removeEventListener('resize',fit);if(d)d()};
  const next=()=>{const s=slide();const full=(s.text||'').length;if(CI.t*32<full&&CI.t<s.dur){CI.t=full/32+.01;return}CI.i++;if(CI.i>=slides.length)end();else start()};
  const loop=(n)=>{if(!CI)return;const dt=Math.min(.1,(n-CI.last)/1000);CI.last=n;CI.t+=dt;const s=slide();drawCine(cv,s.k,CI.t);const nc=Math.min((s.text||'').length,Math.floor(CI.t*32));cap.textContent=(s.text||'').slice(0,nc);if(CI.t>s.dur+Math.max(0,((s.text||'').length/32))&&CI.t>1)next();CI.raf=requestAnimationFrame(loop)};
  cvEl.onclick=e=>{if(e.target.classList.contains('skip'))return;next()};cvEl.querySelector('.skip').onclick=e=>{e.stopPropagation();CI.i=slides.length;end()};
  window.addEventListener('resize',fit);start();CI.raf=requestAnimationFrame(loop);window.__cine=()=>CI};
const INTRO=[{k:'black',dur:2.2,text:'Luanda. 03:12 da manhã.'},{k:'street',dur:3,text:'Kiala voltava para casa quando as luzes azuis e vermelhas o cercaram.',snd:'pa'},{k:'car',dur:3.2,text:'— Mãos onde as possamos ver! — Preso? Mas eu não fiz nada!',snd:'alarm'},{k:'cuffs',dur:3,text:'Alguém tinha preparado tudo: provas falsas e uma denúncia anónima.',snd:'tick'},{k:'cell',dur:3.2,text:'Dia 1. Uma cela fria. Uma pena de 45 dias por um crime que nunca cometeu.',snd:'door'},{k:'black',dur:3,text:'Alguém quis que ele estivesse aqui. Kiala vai descobrir quem.'}];
const AMBUSH=[{k:'cell',dur:2.6,text:'Era a noite da fuga. Tudo estava pronto: a planta, a chave, o alicate.',snd:'door'},{k:'fight',dur:3,text:'Dois presos de 2 anos, pagos para te matar, saíram da sombra e destruíram o plano.',snd:'alarm'},{k:'fight',dur:2.6,text:'Zeca atirou-se à frente. Um golpe. Dois. Tu tentaste levantar-te.',snd:'hit'},{k:'black',dur:3,text:'Escuridão. A última coisa que ouviste foi a voz do Zeca a dizer o teu nome.',snd:'bad'},{k:'black',dur:3.4,text:'Quando acordaste, o Zeca já não estava lá. E o responsável por tudo ainda anda lá fora.'}];

/* ---------- dias da história ---------- */
const hasI=k=>(P.inv[k]>0)||((P.stash||{})[k]>0);
const DAY=[null,
{t:'Preso sem perceber',intro:'Acordas numa cela que não é tua, sem saber o que fizeste. Alguém quis isto.',obj:[['Sai da cela e explora o bloco',()=>ST.c.out],['Fala com o Zeca',()=>ST.c.zeca>=1]]},
{t:'O primeiro passo',intro:'O Zeca decide ensinar-te as regras da cadeia.',obj:[['Fala com o Zeca e aprende as regras',()=>ST.c.regras],['Trabalha uma vez de manhã (08:00 às 12:00)',()=>G.stats.jobs>=1],['Come na cantina ou no refeitório',()=>ST.c.meals>=1]]},
{t:'Escolhe um lado',intro:'Aqui ninguém sobrevive sozinho. Mamba lidera os Corvos. Naja lidera as Serpentes.',obj:[['Fala com o Mamba ou com a Naja',()=>ST.c.leader>=1],['Junta-te a um bando (respeito 4)',()=>!!P.gang]]},
{t:'Ganhar confiança',intro:'O bando quer ver o que vales. Faz favores.',obj:[['Entrega uma missão',()=>(ST.c.md||0)>=1],['Junta 60 Kz',()=>P.money>=60]]},
{t:'Mostrar força',intro:'Os rivais estão a medir-te.',obj:[['Ganha uma luta',()=>G.stats.fights>=1],['Respeito 6',()=>P.rep>=6]]},
{t:'Tarefas do bando',intro:'Os chefes começam a falar em guerra.',obj:[['Entrega mais missões (3 no total)',()=>(ST.c.md||0)>=3],['Força 40',()=>P.str>=40]]},
{t:'Preparar a saída',intro:'O Zeca sussurra: há uma maneira de sair antes do fim da pena.',obj:[['Arranja uma ferramenta de fuga (colher, alicate ou planta)',()=>hasI('colher')||hasI('alicate')||hasI('mapa')],['Junta 120 Kz',()=>P.money>=120]]},
{t:'A tensão sobe',intro:'Os bandos preparam armas. Falta pouco para estourar.',obj:[['Respeito 8',()=>P.rep>=8],['Esconde uma ferramenta debaixo da cama',()=>Object.values(P.stash||{}).some(v=>v>0)]]},
{t:'Véspera do caos',intro:'Amanhã é o dia 10. Todos sabem. Ninguém fala.',obj:[['Tem 80 de vida e 60 de comida',()=>P.hp>=80&&P.food>=60],['Fala com o Zeca sobre amanhã',()=>ST.c.zeca9]]},
{t:'O CAOS',intro:'Motim! Os bandos atacam-se e a polícia de choque entra. Sobrevive.',obj:[['Sobrevive até às 22:00',()=>ST.c.survive10],['Pega no último item com o Zeca',()=>ST.c.lastItem]]},
{t:'O plano',intro:'Com o motim, as defesas estão frágeis. Esta é a hora.',obj:[['Reúne planta, chave e alicate',()=>hasI('mapa')&&hasI('chave')&&hasI('alicate')],['Planeia a fuga com o Zeca',()=>ST.c.plan]]},
{t:'A emboscada',intro:'Esta noite fugem. Mas há alguém à espera.',obj:[['Espera pela noite com o Zeca (19:30)',()=>ST.ev.ambush]]}];
const ZL=[null,'Estás perdido, rapaz. Todos começamos assim.','Aqui as regras são simples: trabalha, come, não incomodes os guardas e nunca digas o teu nome a quem não conheces.','Tens de escolher um lado. Ninguém aguenta isto sozinho.','Faz favores e eles confiam em ti.','Um dia vais ter de bater para que não batam em ti.','Os chefes querem sangue. Mantém-te perto de mim.','Sei de uma saída. Preciso de ti vivo e com as ferramentas.','Esconde o que importa. Os guardas fazem revistas.','Amanhã vai ser o inferno. Fica vivo.','Aguenta! Quando acabar, temos a nossa hora.','Planta, chave, alicate. Com isto saímos.','Esta noite. Só nós dois.'];

/* ---------- estado e objetivos ---------- */
ST.reset=()=>{ST.c={out:0,zeca:0,meals:0,leader:0,md:0};ST.ev={};ST.ok={};ST.day=0};
function persist(){try{if(ST.on)localStorage.setItem('pm_story_st',JSON.stringify({c:ST.c,ev:ST.ev,ok:ST.ok}))}catch(e){}}
function restore(){try{const d=JSON.parse(localStorage.getItem('pm_story_st')||'null');if(d){ST.c=d.c||{};ST.ev=d.ev||{};ST.ok=d.ok||{}}else ST.reset()}catch(e){ST.reset()}}
let objTxt='';
function drawObj(){if(!ST.on||!G.started||G.over){objEl.classList.remove('on');return}const d=DAY[Math.min(12,S.day)];if(!d){objEl.classList.remove('on');return}
  let h='<b>Dia '+S.day+' · '+d.t+'</b>';d.obj.forEach((o,i)=>{const ok=ST.ok[S.day+':'+i];h+='<div class="'+(ok?'d':'')+'">'+(ok?'✓ ':'○ ')+o[0]+'</div>'});
  if(d.obj.every((o,i)=>ST.ok[S.day+':'+i])&&S.day<12)h+='<div class="d">Dia completo: dorme para avançar.</div>';
  if(h!==objTxt){objTxt=h;objEl.innerHTML=h}objEl.classList.add('on')}
function evalObj(){const d=DAY[Math.min(12,S.day)];if(!d)return;d.obj.forEach((o,i)=>{const k=S.day+':'+i;if(!ST.ok[k]&&o[1]()){ST.ok[k]=1;P.money+=15;P.rep+=.4;banner('Objetivo cumprido: '+o[0],'#9fe3a0',2800);sfx('ok');fx.push({x:P.x,z:P.z,s:P.scene,t:1.2,txt:'+15 Kz',col:'#ffe08a'})}})}

/* ---------- eventos ---------- */
ST.cops=[];
function riot(){ST.ev.riot=1;banner('MOTIM! A polícia de choque entrou na prisão.','#ff7b7b',4200);sfx('alarm');
  const sc=['corredor','refeitorio','patio','cozinha','lavandaria'];
  for(let i=0;i<6;i++){const n=mkNPC({name:'Polícia de choque',cop:true,cap:true,scene:sc[i%sc.length],x:rnd(500,2600),z:rnd(.4,.8),suit:'#16203a',pants:'#141b30',hp:120,spd:rnd(160,195),big:1.08,talkable:false,lk:{height:1.06,build:1.22,acc:['bone','oculos']}});n.rr=1;NPC.push(n);ST.cops.push(n);
    if(!n.gang)n.band=null}
  toast('Os bandos atacam-se. Não te metas, ou foge para a cela.',5000)}
function endRiot(){for(const n of ST.cops){const i=NPC.indexOf(n);if(i>=0)NPC.splice(i,1)}ST.cops=[];ST.c.survive10=1;banner('O motim acabou. Sobreviveste.','#9fe3a0',3200)}
function ambush(){ST.ev.ambush=1;G.paused=true;try{closePanel()}catch(e){}
  ['alicate','chave','mapa','colher'].forEach(k=>{delete P.inv[k];if(P.stash)delete P.stash[k]});
  const z=NPC.findIndex(n=>n.isZeca);if(z>=0)NPC.splice(z,1);
  cine(AMBUSH,()=>storyEnd('Fim da parte 1','Perdeste o plano e o Zeca. Mas agora sabes que alguém pagou para te calar. Quem foi o Responsável? Isso fica para a próxima parte.'))}
function storyEnd(t,p){G.over=true;G.paused=true;try{localStorage.removeItem(SAVEKEY);localStorage.removeItem('pm_story_st')}catch(e){}
  q('#endT').textContent=t;q('#endP').textContent=p;q('#endS').innerHTML='Dia '+S.day+' · Respeito '+Math.round(P.rep)+' · Força '+P.str.toFixed(1)+' · Combates '+G.stats.fights;q('#end').classList.add('on');sfx('ok');rankSend('story',2500+Math.round(P.rep*20+P.str*5))}

/* ---------- ciclo ---------- */
let acc=0,lastFood=null,lastScene=null,lastX=0,stepT=0,rivT=0,achT=0;
ST.tick=function(dt){if(!G.started||G.over||G.paused&&!CI)return;
  if(lastScene&&P.scene!==lastScene){try{sfx('door')}catch(e){}}lastScene=P.scene;
  const mv=Math.abs(P.x-lastX);lastX=P.x;if(mv>.6&&!P.sleeping&&!G.paused){stepT-=dt;if(stepT<=0){stepT=P.run?.27:.42;try{if(AC&&!muted)tone(62+Math.random()*30,.05,'triangle',.03,-18)}catch(e){}}}
  achT+=dt;if(achT>2){achT=0;checkAch()}
  if(!ST.on)return;
  acc+=dt;if(acc<.5)return;acc=0;
  if(P.scene!=='cela')ST.c.out=1;
  if(lastFood!=null&&P.food-lastFood>=15)ST.c.meals=(ST.c.meals||0)+1;lastFood=P.food;
  evalObj();drawObj();persist();
  const h=hh();
  if(S.day===10){if(h>=15&&!ST.ev.riot)riot();
    if(ST.ev.riot&&!ST.c.survive10){for(const n of ST.cops){if(n.scene===P.scene&&Math.abs(n.x-P.x)<520&&n.ko<=0)n.aggro=Math.max(n.aggro||0,5)}rivT+=.5;if(rivT>40){rivT=0;try{rivalAttack()}catch(e){}}
      if(h>=22||h<5)endRiot()}}
  else if(S.day>=4&&S.day!==10){rivT+=.5;if(rivT>70){rivT=0;if(Math.random()<Math.min(.6,(S.day-3)*.08))try{rivalAttack()}catch(e){}}}
  if(S.day>=12&&!ST.ev.ambush&&(h>=19.5||S.day>12)&&!panelOpen)ambush()};
const _u=update;update=function(dt,now){_u.apply(this,arguments);try{ST.tick(dt)}catch(e){}};
const _nd=newDay;newDay=function(){_nd.apply(this,arguments);if(!ST.on)return;const d=DAY[Math.min(12,S.day)];if(d){setTimeout(()=>{banner('Dia '+S.day+': '+d.t,'#ffcf8a',3600);setTimeout(()=>toast(d.intro,6500),1200)},900)}objTxt=''};
const _mt=missionTurnIn;missionTurnIn=function(n){const r=_mt(n);if(r)ST.c.md=(ST.c.md||0)+1;return r};

/* ---------- diálogos ---------- */
const _tk=talk;talk=function(n){if(n&&n.isDir)return dirPanel(n);if(n&&n.isMarket)return marketPanel(n);if(ST.on&&n){if(n.isZeca)ST.c.zeca=(ST.c.zeca||0)+1;if(n.leader)ST.c.leader=(ST.c.leader||0)+1}return _tk(n)};
const _op=openPanel;openPanel=function(t,h,b){if(ST.on&&/^Zeca/.test(t)){const z=ZL[Math.min(12,S.day)];if(z)h='<p><i>“'+z+'”</i></p>'+h;b=(b||[]).slice();const ex=[];const d=S.day;
  if(d===2)ex.push({t:'Aprender as regras da cadeia',f:()=>{ST.c.regras=1;say(zNpc(),'Trabalha de manhã, come ao almoço e vai à chamada.',5);closePanel()}});
  if(d===9)ex.push({t:'Falar do que vem amanhã',f:()=>{ST.c.zeca9=1;say(zNpc(),'Fica vivo. O resto vemos depois.',5);closePanel()}});
  if(d===10&&ST.ev.riot)ex.push({t:'Pegar no último item (planta incompleta)',f:()=>{ST.c.lastItem=1;addItem('mapa',1);banner('Último item na mão.','#ffe08a',2400);closePanel()}});
  if(d===11)ex.push({t:'Planear a fuga',dis:!(hasI('mapa')&&hasI('chave')&&hasI('alicate')),f:()=>{ST.c.plan=1;say(zNpc(),'Amanhã, às 19:30. Aguenta mais um dia.',5);closePanel()}});
  b.splice(0,0,...ex)}return _op(t,h,b)};
const zNpc=()=>NPC.find(n=>n.isZeca)||{};
function dirPanel(n){const L=['Mantém-te longe de problemas, recluso.','Ordens vêm de cima. Eu só as cumpro.','Alguém muito importante pediu para te vigiarem.'];openPanel('Director Matoso · Posto',
  '<p><i>“'+L[(S.day||1)%3]+'”</i></p><p class="sm">Dá-te pena e castigos. Se te meteres em confusão, ele sabe.</p>',[{t:'Ver a minha pena ('+Math.max(0,Math.round(G.sentence))+' dias)',f:()=>{toast('Pena restante: '+Math.round(G.sentence)+' dias.');closePanel()}},{t:'Sair',f:closePanel}])}
const MK=['colher','alicate','faca','mapa','chave','energetico','suplemento','telemovel'];
function marketPanel(n){const h=hh();if(h<20&&h>=6&&!(ST.on&&S.day>=9)){openPanel('Tio Bento · Mercado clandestino','<p>O Tio Bento só negoceia à noite, depois das 20:00.</p>',[{t:'Sair',f:closePanel}]);return}
  const pr=k=>Math.round(ITEMS[k].buy*1.25);const sp=k=>Math.round(ITEMS[k].sell*1.3);
  const b=MK.map(k=>({t:ITEMS[k].n+' — '+pr(k)+' Kz',dis:P.money<pr(k),f:()=>{P.money-=pr(k);addItem(k);sfx('coin');marketPanel(n)}}));
  Object.keys(P.inv).filter(k=>ITEMS[k]&&ITEMS[k].contra&&P.inv[k]>0&&k!=='uniforme').forEach(k=>b.push({t:'Vender '+ITEMS[k].n+' por '+sp(k)+' Kz',f:()=>{takeItem(k);P.money+=sp(k);sfx('coin');marketPanel(n)}}));
  b.push({t:'Sair',f:closePanel});openPanel('Tio Bento · Mercado clandestino','<p>Tens '+Math.round(P.money)+' Kz. Tudo o que vês é proibido. Não deixes um guarda ver.</p>',b)}
Object.assign(ITEMS,{energetico:{n:'Energético',en:60,buy:35,sell:12},suplemento:{n:'Suplemento',str:2.5,buy:60,sell:20}});
try{if(!NPC.some(n=>n.isMarket))NPC.push(mkNPC({name:'Tio Bento',isMarket:true,fixed:true,talkable:true,scene:'lavandaria',x:260,z:.6,hp:90,suit:'#3a3a3f',pants:'#2a2a2e',skin:'#5a3825',hair:'#777',lk:{hair:0,beard:2,height:.96,build:1.05,acc:['bone']}}))}catch(e){}

/* ---------- conquistas e classificação ---------- */
const ACH=[['pl','Primeira luta','Ganha uma luta',()=>G.stats.fights>=1],['tb','Trabalhador','Faz 10 tarefas',()=>G.stats.jobs>=10],['rc','Bolso cheio','Junta 500 Kz',()=>P.money>=500],['rs','Respeitado','Respeito 10',()=>P.rep>=10],['bd','Do bando','Junta-te a um bando',()=>!!P.gang],['fo','Forte','Força 60',()=>P.str>=60],['mi','Missionário','Entrega 5 missões',()=>(ST.c.md||0)>=5],['d10','Sobrevivente','Sobrevive ao motim do dia 10',()=>!!ST.c.survive10],['d30','Veterano','Chega ao dia 30',()=>S.day>=30],['fg','Fugitivo','Foge da prisão',()=>!!G.escaped],['hs','Memória','Chega ao fim da parte 1 da história',()=>!!ST.ev.ambush]];
const getAch=()=>{try{return JSON.parse(localStorage.getItem('pm_ach')||'{}')}catch(e){return{}}};
function checkAch(){const a=getAch();let ch=0;for(const [id,n,d,f] of ACH){if(!a[id]&&f()){a[id]=Date.now();ch=1;try{banner('Conquista: '+n,'#ffcf8a',3200);sfx('ok')}catch(e){}}}if(ch)try{localStorage.setItem('pm_ach',JSON.stringify(a))}catch(e){}}
function rankSend(mode,score){try{if(!AUTH.user||AUTH.user.local||!AUTH.live())return;DB.get('rank/'+AUTH.user.uid).then(o=>{if(o&&o.s>=score)return;return DB.set('rank/'+AUTH.user.uid,{n:String(AUTH.user.name||AUTH.user.email||'Jogador').slice(0,20),s:Math.round(score),m:mode,d:S.day,ts:Date.now()})}).catch(()=>{})}catch(e){}}
const _e0=endGame0;endGame0=function(kind){const was=G.over;_e0.apply(this,arguments);if(!was)rankSend(ST.on?'story':'fuga',(kind==='legal'?1500:3000+Math.max(0,60-S.day)*20)+Math.round(P.rep*10+P.money/5))};
const more=document.createElement('section');more.id='more';more.className='scr';more.innerHTML='<div class="panel glass"><h3>Conquistas e classificação</h3><div class="row2"><button class="btn s tab" id="mA">Conquistas</button><button class="btn s tab" id="mR">Classificação</button></div><div id="mBody"></div><div class="row"><button class="btn s ghost" id="mBack">Voltar</button></div></div>';
document.body.appendChild(more);
function showAch(){const a=getAch();q('#mBody').innerHTML=ACH.map(([id,n,d])=>'<div class="li'+(a[id]?'':' off')+'"><span>'+(a[id]?'★ ':'☆ ')+n+'<br><small>'+d+'</small></span><i>'+(a[id]?'feito':'')+'</i></div>').join('')}
async function showRank(){const B=q('#mBody');B.textContent='A carregar…';try{if(!AUTH.live()){B.textContent='Classificação só com ligação ao servidor.';return}const r=await DB.get('rank')||{};const L=Object.values(r).filter(x=>x&&typeof x.s==='number').sort((a,b)=>b.s-a.s).slice(0,10);B.innerHTML=L.length?L.map((x,i)=>'<div class="li"><span>'+(i+1)+'. '+String(x.n||'').replace(/[<>&]/g,'')+'<br><small>'+(x.m==='story'?'História':'Fuga')+' · dia '+(x.d||'?')+'</small></span><i>'+x.s+'</i></div>').join(''):'Ainda sem pontuações. Foge ou termina a história para entrares.'}catch(e){B.textContent='Não foi possível carregar a classificação.'}}
q('#mA').onclick=showAch;q('#mR').onclick=showRank;q('#mBack').onclick=()=>toMenu();

/* ---------- menu ---------- */
const side=q('#menu .side'),bPlay=q('#bPlay');
if(side&&bPlay){bPlay.textContent='Modo Fuga';
  const bS=document.createElement('button');bS.className='btn';bS.id='bStory';bS.textContent='Modo História';bPlay.after(bS);
  const bM=document.createElement('button');bM.className='btn s';bM.id='bMore';bM.textContent='Conquistas e classificação';q('#bCust').after(bM);
  bM.onclick=()=>{showScr('more');showAch()};
  bS.onclick=()=>{let has=false;try{has=!!localStorage.getItem('pm_story')}catch(e){}
    if(!has)return startStory(false);
    SAVEKEY='pm_story';showScr('none');document.body.classList.add('ingame');G.paused=true;
    openPanel('Modo História','<p>Tens uma história guardada.</p>',[{t:'Continuar a história',f:()=>{closePanel();startStory(true)}},{t:'Começar de novo (apaga a guardada)',f:()=>{try{localStorage.removeItem('pm_story');localStorage.removeItem('pm_story_st')}catch(e){}closePanel();startStory(false)}},{t:'Voltar ao menu',f:()=>{closePanel();toMenu()}}])}}
function startStory(cont){SAVEKEY='pm_story';const go=()=>{begin(cont);ST.on=true;if(cont)restore();else{ST.reset();G.sentence=45;P.money=Math.max(P.money,30)}lastFood=null;objTxt='';setTimeout(()=>{const d=DAY[Math.min(12,S.day)];if(d){banner('Dia '+S.day+': '+d.t,'#ffcf8a',3600);setTimeout(()=>toast(d.intro,6500),1200)}},900)};
  if(cont)go();else{showScr('none');cine(INTRO,go)}}
window.startStory=startStory;
const _tm=toMenu;toMenu=function(){const r=_tm.apply(this,arguments);ST.on=false;SAVEKEY='pm_v2';objEl.classList.remove('on');try{q('#bCont').style.display=hasSave()?'flex':'none'}catch(e){}return r};
})();
