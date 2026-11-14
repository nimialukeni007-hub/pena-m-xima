'use strict';
/* Ecrãs: login, menu, personalizar, loja/pagamento e ligação ao jogo antigo */
const $$=s=>[...document.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const fmtKz=n=>(n||0).toLocaleString('pt-PT').replace(/ /g,' ')+' Kz';
function showScr(id){$$('.scr').forEach(s=>s.classList.toggle('on',s.id===id));}
let tabMode='in',payItem=null,payRef='',custTmp=null,LOOK=defaultLook();
/* ---------- login ---------- */
function setMsg(t,ok){const m=$('#msg');m.textContent=t||'';m.className='msg'+(ok?' ok':'')}
function setTab(t){tabMode=t;$$('#login .tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));$('#go').textContent=t=='in'?'Entrar':'Criar conta';$('#meter').hidden=t!='up';setMsg('')}
$$('#login .tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.t));
$('#eye').onclick=()=>{const p=$('#pw'),v=p.type=='password';p.type=v?'text':'password';$('#eye').textContent=v?'Ocultar':'Ver'};
$('#pw').addEventListener('input',()=>{const p=$('#pw').value;let s=0;if(p.length>=8)s++;if(/[A-Za-z]/.test(p)&&/\d/.test(p))s++;if(p.length>=12&&/[^A-Za-z0-9]/.test(p))s++;$('#meter i').style.setProperty('--w',(s/3*100)+'%')});
$('#mode').textContent=AUTH.live()?'':'Modo de teste: contas guardadas só neste aparelho.';
async function busy(btn,fn){btn.disabled=true;try{await fn()}catch(e){setMsg(e.message||'Erro.')}finally{btn.disabled=false}}
$('#go').onclick=()=>busy($('#go'),async()=>{const e=$('#em').value,p=$('#pw').value;setMsg('');if(!e||!p)throw Error('Preenche o email e a senha.');if(tabMode=='in')await AUTH.login(e,p);else await AUTH.register(e,p);await afterLogin()});
$('#gg').onclick=()=>busy($('#gg'),async()=>{await AUTH.google();await afterLogin()});
$('#fg').onclick=ev=>{ev.preventDefault();busy($('#fg'),async()=>{const e=$('#em').value;if(!e)throw Error('Escreve o teu email primeiro.');await AUTH.reset(e);setMsg('Enviámos um email para recuperar a senha. Vê também o spam.',1)})};
['em','pw'].forEach(i=>$('#'+i).addEventListener('keydown',e=>{if(e.key=='Enter')$('#go').click()}));
async function afterLogin(){await PAY.load();loadLook();toMenu();pollEnt()}
/* ---------- aspecto ---------- */
const lookKey=()=>'pm_look_'+AUTH.user.uid;
function sanitize(l){l=Object.assign(defaultLook(),l||{});
  if(SETS[l.set]&&SETS[l.set][2]&&!PAY.has('pack_'+SETS[l.set][0]))l.set=0;
  if(CHAIR[l.hair]&&CHAIR[l.hair][2]&&!PAY.has('hair_'+CHAIR[l.hair][0]))l.hair=1;
  l.acc=(l.acc||[]).filter(a=>PAY.has('acc_'+a));return l}
function applyLook(l){LOOK=l;if(STG.ch)STG.ch.setLook(l);else STG.ch=new Char(l,'');
  window.PLC={skin:hx(CSKIN[l.skin]),top:hx((SETS[l.set]||SETS[0])[3])}}
function loadLook(){let l=null;try{l=JSON.parse(store.get(lookKey())||'null')}catch(e){}applyLook(sanitize(l))}
/* ---------- menu ---------- */
function toMenu(){G.started=false;G.paused=true;document.body.classList.remove('ingame');STG.mode='menu';
  $('#who').textContent=AUTH.user.name||AUTH.user.email;const w=PAY.has('world');$('#bWorld b').textContent=w?'desbloqueado':'bloqueado';$('#bWorld b').className=w?'lk ok':'lk';
  $('#bCont').style.display=hasSave()?'flex':'none';showScr('menu')}
function showTitle(){if(AUTH.user){loadLook();toMenu()}else{STG.mode='login';showScr('login')}}
function begin(cont){document.body.classList.add('ingame');showScr('none');R3.yaw=0;R3.pitch=0;startGame(cont);if(R3.sceneId)R3.sceneId=null}
$('#bCont').onclick=()=>begin(true);
$('#bPlay').onclick=()=>{if(hasSave()&&!confirm_('Começar um novo jogo apaga o progresso guardado. Tocar outra vez para confirmar.'))return;try{localStorage.removeItem('pm_v2')}catch(e){}begin(false)};
let cfT=0;function confirm_(m){const now=Date.now();if(now-cfT<4000){cfT=0;return true}cfT=now;$('#who').textContent=m;return false}
$('#bWorld').onclick=()=>{if(!PAY.has('world'))return openPay('world');begin(hasSave());setTimeout(()=>{try{netPanel()}catch(e){}},700)};
$('#bOut').onclick=()=>{AUTH.logout();PAY.ent={world:false,items:{}};STG.mode='login';showScr('login')};
$('#bCust').onclick=()=>openCustom();
/* ---------- personalizar ---------- */
function opt(txt,on,locked,fn){const b=document.createElement('button');b.className='op'+(on?' on':'')+(locked?' locked':'');b.textContent=txt;if(locked){const i=document.createElement('i');i.textContent='1000 Kz';b.appendChild(i)}b.onclick=fn;return b}
function grp(title){const g=document.createElement('div');g.className='grp';g.innerHTML='<small>'+title+'</small>';const o=document.createElement('div');o.className='opts';g.appendChild(o);return[g,o]}
function openCustom(){custTmp=JSON.parse(JSON.stringify(LOOK));STG.mode='custom';showScr('custom');renderCust()}
const tmpApply=()=>{STG.ch.setLook(custTmp)};
function renderCust(){const B=$('#cbody');B.innerHTML='';const L=custTmp;let g,o;
  [g,o]=grp('Pele');CSKIN.forEach((c,i)=>{const s=document.createElement('button');s.className='sw'+(L.skin==i?' on':'');s.style.background=c;s.setAttribute('aria-label','Pele '+(i+1));s.onclick=()=>{L.skin=i;tmpApply();renderCust()};o.appendChild(s)});B.appendChild(g);
  [g,o]=grp('Cabelo');CHAIR.forEach((h,i)=>{const lk=h[2]&&!PAY.has('hair_'+h[0]);o.appendChild(opt(h[1],L.hair==i,lk,()=>{if(lk)return openPay('hair_'+h[0]);L.hair=i;tmpApply();renderCust()}))});B.appendChild(g);
  [g,o]=grp('Cor do cabelo');HAIRC.forEach((c,i)=>{const s=document.createElement('button');s.className='sw'+(L.hairc==i?' on':'');s.style.background=c;s.setAttribute('aria-label','Cabelo '+(i+1));s.onclick=()=>{L.hairc=i;tmpApply();renderCust()};o.appendChild(s)});B.appendChild(g);
  [g,o]=grp('Roupa');SETS.forEach((s,i)=>{const lk=s[2]&&!PAY.has('pack_'+s[0]);o.appendChild(opt(s[1],L.set==i,lk,()=>{if(lk)return openPay('pack_'+s[0]);L.set=i;tmpApply();renderCust()}))});B.appendChild(g);
  [g,o]=grp('Acessórios');ACCS.forEach(a=>{const lk=!PAY.has('acc_'+a[0]),on=L.acc.includes(a[0]);o.appendChild(opt(a[1],on,lk,()=>{if(lk)return openPay('acc_'+a[0]);L.acc=on?L.acc.filter(x=>x!=a[0]):[...L.acc,a[0]];tmpApply();renderCust()}))});B.appendChild(g);
  [g,o]=grp('Corpo e altura');for(const[k,lab,mn,mx]of[['build','Corpo',.85,1.2],['height','Altura',.9,1.1]]){const r=document.createElement('input');r.type='range';r.min=mn;r.max=mx;r.step=.01;r.value=L[k];r.setAttribute('aria-label',lab);r.oninput=()=>{L[k]=+r.value;tmpApply()};const w=document.createElement('div');w.style.width='100%';w.innerHTML='<small style="color:var(--n4);font-size:12px">'+lab+'</small>';w.appendChild(r);o.appendChild(w)}B.appendChild(g)}
$('#cSave').onclick=()=>{applyLook(custTmp);store.set(lookKey(),JSON.stringify(custTmp));toMenu()};
$('#cBack').onclick=()=>{STG.ch.setLook(LOOK);toMenu()};
/* ---------- pagamento ---------- */
const ua=navigator.userAgent,isAnd=/android/i.test(ua),isIos=/iphone|ipad|ipod/i.test(ua);
function openPay(item){const it=PAY.list().find(x=>x[0]==item);if(!it)return;payItem=item;payRef=PAY.ref();$('#pTitle').textContent=it[1];$('#pPrice').textContent=fmtKz(it[2]);$('#pRef').textContent=payRef;$('#pMsg').textContent='';$('#pMsg').className='msg';$('#pNote').textContent='';$('#pWa').hidden=true;$('#pDemo').hidden=AUTH.live();$('#pPaid').disabled=true;payM=null;showScr('pay')}
let payM=null;
async function goPay(m){payM=m;const num=CFG.pay[m],ap=CFG.apps[m];let ok=false;
  try{await navigator.clipboard.writeText(num);ok=true}catch(e){}
  $('#pNote').textContent=ok?'Número de pagamento copiado. Cola-o na app.':'Abre a app e usa o número que te enviamos por WhatsApp.';
  $('#pPaid').disabled=false;
  setTimeout(()=>{let url;
    if(isAnd&&ap.android)url='intent://#Intent;package='+ap.android+';S.browser_fallback_url='+encodeURIComponent(ap.store)+';end';
    else if(isIos)url=ap.ios;else url=ap.store;
    if(isAnd||isIos)location.href=url;else window.open(url,'_blank','noopener')},450)}
$('#payExp').onclick=()=>goPay('express');$('#payPpy').onclick=()=>goPay('paypay');
$('#pX').onclick=()=>{if(STG.mode==='custom')showScr('custom'),renderCust();else toMenu()};
$('#pPaid').onclick=async()=>{const b=$('#pPaid');b.disabled=true;try{await PAY.request(payItem,payM||'express',payRef);const it=PAY.list().find(x=>x[0]==payItem);$('#pMsg').className='msg ok';$('#pMsg').textContent='Pedido enviado. O item desbloqueia depois de confirmarmos o pagamento.';const t=encodeURIComponent('Pagamento Pena Máxima\nItem: '+it[1]+'\nValor: '+fmtKz(it[2])+'\nMétodo: '+(payM||'')+'\nReferência: '+payRef+'\nConta: '+(AUTH.user.email||''));const a=$('#pWa');a.href='https://wa.me/'+CFG.whatsapp+'?text='+t;a.hidden=false;pollEnt(true)}catch(e){$('#pMsg').className='msg';$('#pMsg').textContent=e.message;b.disabled=false}};
$('#pDemo').onclick=()=>{PAY.demoApprove(payItem);$('#pMsg').className='msg ok';$('#pMsg').textContent='Desbloqueado (modo de teste).';setTimeout(()=>$('#pX').click(),700)};
let polling=0;function pollEnt(fast){if(!AUTH.live()||polling)return;polling=setInterval(async()=>{if(!AUTH.user){clearInterval(polling);polling=0;return}const before=JSON.stringify(PAY.ent);await PAY.load();if(JSON.stringify(PAY.ent)!=before){if($('#pay').classList.contains('on')){$('#pMsg').className='msg ok';$('#pMsg').textContent='Pagamento confirmado. Item desbloqueado.';setTimeout(()=>$('#pX').click(),1200)}else if($('#menu').classList.contains('on'))toMenu();else if($('#custom').classList.contains('on'))renderCust()}},fast?8000:30000)}
/* ---------- Modo World só com desbloqueio ---------- */
document.getElementById('netB').addEventListener('click',e=>{if(!PAY.has('world')){e.stopImmediatePropagation();e.preventDefault();document.body.classList.remove('ingame');G.paused=true;openPay('world')}},true);
const _netConnect=netConnect;netConnect=function(...a){if(!PAY.has('world')){toast('Modo World bloqueado. Desbloqueia no menu.');return false}return _netConnect(...a)};
function nurl(path,q){const t=AUTH.user&&AUTH.user.id?'auth='+AUTH.user.id:'';const qq=q?(t?q+'&'+t:q):(t?'?'+t:'');return Net.db.replace(/\/$/,'')+'/pm/rooms/'+Net.room+path+'.json'+qq}
setInterval(()=>{if(AUTH.user&&AUTH.live())AUTH.token().catch(()=>{})},240000);
/* ---------- arranque ---------- */
function boot3(){initR3();STG.ch=new Char(defaultLook(),'');
  if(AUTH.restore()){PAY.load().then(afterLogin).catch(()=>{STG.mode='login'})}else{STG.mode='login'}
  window.__pm={G,P,S,R3,STG,AUTH,PAY,begin,toMenu,buildScene}}
window.addEventListener('resize',()=>{});
boot3();
