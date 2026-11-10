/* Ecrãs, estados e ciclo principal */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const fmt=n=>(n||0).toLocaleString('pt-PT').replace(/ /g,' ')+' Kz';
function show(id){$$('.scr').forEach(s=>s.classList.toggle('on',s.id==id));}
let tabMode='in',paused=false,payItem=null,payMeth='express',payRef='',custTmp=null;

/* ---------- login ---------- */
function setMsg(t,ok){const m=$('#msg');m.textContent=t||'';m.className='msg'+(ok?' ok':'')}
function setTab(t){tabMode=t;$$('#login .tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));$('#go').textContent=t=='in'?'Entrar':'Criar conta';$('#meter').hidden=t!='up';$('#pw').autocomplete=t=='in'?'current-password':'new-password';setMsg('')}
$$('#login .tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.t));
$('#eye').onclick=()=>{const p=$('#pw'),v=p.type=='password';p.type=v?'text':'password';$('#eye').textContent=v?'Ocultar':'Ver'};
$('#pw').addEventListener('input',()=>{const p=$('#pw').value;let s=0;if(p.length>=8)s++;if(/[A-Za-z]/.test(p)&&/\d/.test(p))s++;if(p.length>=12&&/[^A-Za-z0-9]/.test(p))s++;$('#meter i').style.setProperty('--w',(s/3*100)+'%')});
$('#mode').textContent=AUTH.live()?'':'Modo de teste: contas guardadas só neste aparelho.';
async function busy(btn,fn){btn.disabled=true;try{await fn()}catch(e){setMsg(e.message||'Erro.')}finally{btn.disabled=false}}
$('#go').onclick=()=>busy($('#go'),async()=>{const e=$('#em').value,p=$('#pw').value;setMsg('');if(!e||!p)throw Error('Preenche o email e a senha.');if(tabMode=='in')await AUTH.login(e,p);else await AUTH.register(e,p);await afterLogin()});
$('#gg').onclick=()=>busy($('#gg'),async()=>{await AUTH.google();await afterLogin()});
$('#fg').onclick=ev=>{ev.preventDefault();busy($('#fg'),async()=>{const e=$('#em').value;if(!e)throw Error('Escreve o teu email primeiro.');await AUTH.reset(e);setMsg('Enviámos um email para recuperar a senha. Vê também o spam.',1)})};
['em','pw'].forEach(i=>$('#'+i).addEventListener('keydown',e=>{if(e.key=='Enter')$('#go').click()}));

async function afterLogin(){await SHOP.load();loadLook();toMenu()}
function lookKey(){return 'pm_look_'+AUTH.user.uid}
function sanitize(l){const d=defaultLook();l=Object.assign(d,l||{});
if(SETS[l.set]&&SETS[l.set][2]&&!SHOP.has('pack_'+SETS[l.set][0]))l.set=0;
if(HAIRS[l.hair]&&HAIRS[l.hair][2]&&!SHOP.has('hair_'+HAIRS[l.hair][0]))l.hair=1;
l.acc=(l.acc||[]).filter(a=>SHOP.has('acc_'+a));return l}
function loadLook(){let l=null;try{l=JSON.parse(store.get(lookKey())||'null')}catch(e){}G.look=sanitize(l);G.P.setLook(G.look)}
function toMenu(){G.mode='menu';paused=false;const P=G.P;P.x=31;P.z=0;P.yaw=0;P.hp=100;P.dead=0;P.fall=0;$('#who').textContent=AUTH.user.name||AUTH.user.email;$('#bWorld b').textContent=SHOP.has('world')?'desbloqueado':'bloqueado';$('#bWorld b').className=SHOP.has('world')?'lk ok':'lk';show('menu')}
$('#bOut').onclick=()=>{AUTH.logout();SHOP.ent={world:false,items:{}};G.mode='menu';show('login')};
$('#bPlay').onclick=()=>startGame();
$('#bWorld').onclick=()=>{if(!SHOP.has('world'))openPay('world');else{show('menu');alert_('Modo World desbloqueado. O online está em preparação.')}};
$('#bShop').onclick=()=>openCustom();$('#bCust').onclick=()=>openCustom();
function alert_(t){const b=$('#who');b.textContent=t;setTimeout(()=>{b.textContent=AUTH.user?AUTH.user.name||AUTH.user.email:''},3500)}

/* ---------- personalizar ---------- */
function opt(txt,on,locked,fn,price){const b=document.createElement('button');b.className='op'+(on?' on':'')+(locked?' locked':'');b.textContent=txt;if(locked){const i=document.createElement('i');i.textContent='Premium';b.appendChild(i)}b.onclick=fn;return b}
function grp(title){const g=document.createElement('div');g.className='grp';g.innerHTML='<small>'+title+'</small>';const o=document.createElement('div');o.className='opts';g.appendChild(o);return[g,o]}
function openCustom(){custTmp=JSON.parse(JSON.stringify(G.look));G.mode='custom';show('custom');renderCust()}
function applyTmp(){G.look=custTmp;G.P.setLook(custTmp)}
function renderCust(){const B=$('#cbody');B.innerHTML='';const L=custTmp;
let [g,o]=grp('Pele');SKINS.forEach((c,i)=>{const s=document.createElement('button');s.className='sw'+(L.skin==i?' on':'');s.style.background=c;s.setAttribute('aria-label','Pele '+(i+1));s.onclick=()=>{L.skin=i;applyTmp();renderCust()};o.appendChild(s)});B.appendChild(g);
[g,o]=grp('Cabelo');HAIRS.forEach((h,i)=>{const lk=h[2]&&!SHOP.has('hair_'+h[0]);o.appendChild(opt(h[1],L.hair==i,lk,()=>{if(lk)return openPay('hair_'+h[0]);L.hair=i;applyTmp();renderCust()}))});B.appendChild(g);
[g,o]=grp('Cor do cabelo');HAIRC.forEach((c,i)=>{const s=document.createElement('button');s.className='sw'+(L.hairc==i?' on':'');s.style.background=c;s.setAttribute('aria-label','Cabelo '+(i+1));s.onclick=()=>{L.hairc=i;applyTmp();renderCust()};o.appendChild(s)});B.appendChild(g);
[g,o]=grp('Roupa');SETS.forEach((s,i)=>{const lk=s[2]&&!SHOP.has('pack_'+s[0]);o.appendChild(opt(s[1],L.set==i,lk,()=>{if(lk)return openPay('pack_'+s[0]);L.set=i;applyTmp();renderCust()}))});B.appendChild(g);
[g,o]=grp('Acessórios');ACCS.forEach(a=>{const lk=!SHOP.has('acc_'+a[0]),on=L.acc.includes(a[0]);o.appendChild(opt(a[1],on,lk,()=>{if(lk)return openPay('acc_'+a[0]);L.acc=on?L.acc.filter(x=>x!=a[0]):[...L.acc,a[0]];applyTmp();renderCust()}))});B.appendChild(g);
[g,o]=grp('Corpo e altura');for(const[k,lab,mn,mx]of[['build','Corpo',.85,1.2],['height','Altura',.9,1.1]]){const r=document.createElement('input');r.type='range';r.min=mn;r.max=mx;r.step=.01;r.value=L[k];r.setAttribute('aria-label',lab);r.oninput=()=>{L[k]=+r.value;applyTmp()};const w=document.createElement('div');w.style.width='100%';w.innerHTML='<small style="color:var(--n4);font-size:12px">'+lab+'</small>';w.appendChild(r);o.appendChild(w)}B.appendChild(g)}
$('#cSave').onclick=()=>{store.set(lookKey(),JSON.stringify(custTmp));toMenu()};
$('#cBack').onclick=()=>{loadLook();toMenu()};

/* ---------- pagamento ---------- */
function openPay(item){const it=SHOP.list().find(x=>x[0]==item);if(!it)return;payItem=item;payRef=SHOP.ref();$('#pTitle').textContent=it[1];$('#pPrice').textContent=fmt(it[2]);$('#pRef').textContent=payRef;$('#pMsg').textContent='';$('#pMsg').className='msg';$('#pWa').hidden=true;$('#pDemo').hidden=AUTH.live();$('#pPaid').disabled=false;setMeth('express');show('pay')}
function setMeth(m){payMeth=m;$$('#pay .tabs button').forEach(b=>b.classList.toggle('on',b.dataset.m==m));$('#pMeth').textContent=m=='express'?'Multicaixa Express':'PayPay';$('#pNum').textContent=CFG.pay[m]}
$$('#pay .tabs button').forEach(b=>b.onclick=()=>setMeth(b.dataset.m));
$('#pCopy').onclick=async()=>{try{await navigator.clipboard.writeText(CFG.pay[payMeth]);$('#pCopy').textContent='Copiado'}catch(e){$('#pCopy').textContent='Seleciona o número'}setTimeout(()=>$('#pCopy').textContent='Copiar',1800)};
$('#pX').onclick=()=>{show(G.mode=='custom'?'custom':'menu');if(G.mode=='custom')renderCust()};
$('#pPaid').onclick=async()=>{const b=$('#pPaid');b.disabled=true;try{await SHOP.request(payItem,payMeth,payRef);const it=SHOP.list().find(x=>x[0]==payItem);$('#pMsg').className='msg ok';$('#pMsg').textContent='Pedido enviado. Envia o comprovativo para acelerar a confirmação.';const t=encodeURIComponent('Pagamento Pena Máxima\nItem: '+it[1]+'\nValor: '+fmt(it[2])+'\nMétodo: '+payMeth+'\nReferência: '+payRef+'\nConta: '+(AUTH.user.email||''));const a=$('#pWa');a.href='https://wa.me/'+CFG.whatsapp+'?text='+t;a.hidden=false;pollEnt()}catch(e){$('#pMsg').className='msg';$('#pMsg').textContent=e.message;b.disabled=false}};
$('#pDemo').onclick=()=>{SHOP.demoApprove(payItem);$('#pMsg').className='msg ok';$('#pMsg').textContent='Desbloqueado (modo de teste).';setTimeout(()=>$('#pX').click(),700)};
let polling=0;function pollEnt(){if(polling||!AUTH.live())return;polling=setInterval(async()=>{if(!AUTH.user){clearInterval(polling);polling=0;return}const before=JSON.stringify(SHOP.ent);await SHOP.load();if(JSON.stringify(SHOP.ent)!=before){clearInterval(polling);polling=0;if($('#pay').classList.contains('on')){$('#pMsg').className='msg ok';$('#pMsg').textContent='Pagamento confirmado. Item desbloqueado.';setTimeout(()=>$('#pX').click(),1200)}if(G.mode=='menu')toMenu();else if(G.mode=='custom')renderCust()}},15000)}

/* ---------- jogo ---------- */
function startGame(){G.mode='game';paused=false;{const P=G.P;P.x=-12;P.z=2.4;P.yaw=Math.PI/2}G.cam.yaw=Math.PI/2*-1;show('hud');$('#hn').textContent=AUTH.user.name||'Tu';say('Chegaste à prisão. Fala com os outros e explora o pátio.')}
window.togglePause=()=>{if(G.mode!='game')return;paused=!paused;show(paused?'pause':'hud')};
$('#pz').onclick=togglePause;$('#pRes').onclick=togglePause;$('#pMenu').onclick=()=>{paused=false;toMenu()};
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test((e.target||{}).tagName))return;const k=e.key.length==1?e.key.toLowerCase():e.key;G.keys[k]=1;if(k=='f'||k==' ')punch();if(k=='Escape')togglePause();if(k.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>{const k=e.key.length==1?e.key.toLowerCase():e.key;G.keys[k]=0});
/* câmara: arrastar (rato e toque) */
const cv=$('#cv');let drag=null;
cv.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(!drag||drag.id!=e.pointerId)return;if(G.mode=='game'){G.tdx+=e.clientX-drag.x;G.tdy+=e.clientY-drag.y}else{G.cam.yaw-=(e.clientX-drag.x)*.01}drag.x=e.clientX;drag.y=e.clientY});
cv.addEventListener('pointerup',()=>drag=null);cv.addEventListener('pointercancel',()=>drag=null);
/* joystick virtual */
(()=>{const j=$('#joy'),k=j.firstElementChild;let id=null;const mv=e=>{const r=j.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=(e.clientX-cx)/(r.width/2),dy=(e.clientY-cy)/(r.height/2);const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}G.joy.x=Math.abs(dx)<.12?0:dx;G.joy.y=Math.abs(dy)<.12?0:dy;k.style.transform='translate('+dx*38+'px,'+dy*38+'px)'};
j.addEventListener('pointerdown',e=>{id=e.pointerId;j.setPointerCapture(id);mv(e);e.preventDefault()});j.addEventListener('pointermove',e=>{if(e.pointerId==id)mv(e)});
const up=e=>{if(e.pointerId!=id)return;id=null;G.joy.x=G.joy.y=0;k.style.transform=''};j.addEventListener('pointerup',up);j.addEventListener('pointercancel',up)})();
$('#tp').addEventListener('pointerdown',e=>{e.preventDefault();punch()});
$('#tr').addEventListener('pointerdown',e=>{e.preventDefault();G.run=!G.run;$('#tr').classList.toggle('on',G.run)});

/* ---------- ciclo ---------- */
function resize(){gl.resize()}
let last=performance.now();
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;
if(!paused)update(dt);
const P=G.P;$('#hpb').style.width=Math.max(0,P.hp)+'%';const b=$('#ban');b.textContent=G.banner;b.classList.toggle('on',G.bt>0&&G.mode=='game');
render()}
function boot(){init(cv);addEventListener('resize',resize);resize();window.__pm={G,SHOP,AUTH,show,toMenu};
if(AUTH.restore()){SHOP.load().then(afterLogin)}requestAnimationFrame(loop)}
boot();
