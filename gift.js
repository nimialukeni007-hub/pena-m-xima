/* Gift cards: compra (código enviado pelo admin) e resgate seguro (o código desaparece ao ser usado). */
(function(){
const q=s=>document.querySelector(s);
const me=()=>(AUTH.user&&AUTH.user.uid)||'';
const online=()=>AUTH.live()&&AUTH.user&&!AUTH.user.local;
const SV={'.sv':'timestamp'};
const TYPES={A:['c',600,'gift_c1',1,'600 Kz no jogo'],B:['c',1500,'gift_c2',2,'1500 Kz no jogo'],C:['c',4000,'gift_c3',4,'4000 Kz no jogo'],P:['p',30,'gift_p',4,'Passe Premium 30 dias']};
window.GIFTTYPES=TYPES;
const GIFT={list:{}};
/* catálogo */
const _list=PAY.list;
PAY.list=function(){const L=_list.call(PAY);for(const k in TYPES){const t=TYPES[k];L.push([t[2],'Gift card: '+t[4],PAY.kz(t[3]),t[3],'Recebes um código único por WhatsApp. Podes usar ou oferecer a um amigo.',''])}return L};
const _da=PAY.demoApprove;PAY.demoApprove=function(item){if(/^gift_/.test(item))return;return _da.apply(PAY,arguments)};
/* passe vindo de gift card */
const _left=PAY.left;PAY.left=function(k){let l=_left.call(PAY,k);if(k==='passe'){for(const c in GIFT.list){const g=GIFT.list[c];if(g&&g.k==='p'&&typeof g.t==='number'){const r=g.t+g.v*864e5-Date.now();if(r>l)l=r}}}return l};
async function load(){if(!online())return;try{GIFT.list=(await DB.get('users/'+me()+'/gifts'))||{}}catch(e){}}
async function apply(){if(!online()||!window.G||!G.started||G.over)return;await load();let add=0;
  for(const c in GIFT.list){const g=GIFT.list[c];if(g&&g.k==='c'&&!g.u&&g.v>0&&g.v<=4000){try{await DB.f('users/'+me()+'/gifts/'+c,'PATCH',{u:1});g.u=1;add+=g.v}catch(e){}}}
  if(add>0){P.money+=add;try{banner('Gift card: +'+add+' Kz','#ffe08a',3600);sfx('coin')}catch(e){}}}
const _bg=begin;begin=function(){const r=_bg.apply(this,arguments);setTimeout(apply,3400);return r};
const _al=afterLogin;afterLogin=async function(){const r=await _al.apply(this,arguments);load();return r};

/* resgate */
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
function fmt(s){s=norm(s);if(s.slice(0,2)!=='PM')return null;const b=s.slice(2);if(b.length!==12)return null;const c='PM-'+b.slice(0,4)+'-'+b.slice(4,8)+'-'+b.slice(8);return /^PM-[ABCP][A-Z2-9]{3}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(c)?c:null}
const lock=()=>{try{return JSON.parse(localStorage.getItem('pm_gl')||'{"n":0,"u":0}')}catch(e){return{n:0,u:0}}};
async function redeem(raw){if(!online())throw Error('Entra com uma conta online para resgatar.');
  const l=lock();if(l.u>Date.now())throw Error('Demasiadas tentativas. Tenta daqui a '+Math.ceil((l.u-Date.now())/60000)+' min.');
  const code=fmt(raw);if(!code){fail(l);throw Error('Código inválido. Formato: PM-XXXX-XXXX-XXXX')}
  const t=TYPES[code[3]];
  try{await DB.f('giftclaim/'+code,'PUT',{uid:me(),t:SV})}catch(e){}
  try{await DB.f('','PATCH',{['giftcards/'+code]:null,['users/'+me()+'/gifts/'+code]:{k:t[0],v:t[1],t:SV}})}
  catch(e){fail(l);throw Error('Código inexistente ou já utilizado.')}
  localStorage.setItem('pm_gl','{"n":0,"u":0}');await load();
  if(t[0]==='c'&&window.G&&G.started)await apply();
  return t}
function fail(l){l.n=(l.n||0)+1;if(l.n>=5){l.u=Date.now()+5*60000;l.n=0}localStorage.setItem('pm_gl',JSON.stringify(l))}

/* ecrã */
const sec=document.createElement('section');sec.id='gc';sec.className='scr';
sec.innerHTML='<div class="side glass" style="overflow-y:auto;max-height:100%"><h3>Gift card</h3><p class="sub">Tens um código? Escreve-o aqui.</p><input id="gcI" type="text" maxlength="20" placeholder="PM-XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" spellcheck="false" style="height:48px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(6,20,27,.5);color:#fff;font:600 17px var(--tx);letter-spacing:.06em;padding:0 14px;width:100%;box-sizing:border-box;user-select:text;-webkit-user-select:text"><button class="btn" id="gcR">Resgatar</button><p class="note" id="gcM"></p><h4 style="margin:14px 0 4px;font:700 12px var(--tx);letter-spacing:.14em;text-transform:uppercase;color:#ffcf8a">Comprar um gift card</h4><p class="sub">Pagas por Express ou PayPay. O administrador envia-te o código único por WhatsApp. Cada código só pode ser usado uma vez.</p><div id="gcL"></div><button class="btn s ghost" id="gcB">Voltar</button></div>';
document.body.appendChild(sec);
const L=q('#gcL');
for(const k in TYPES){const t=TYPES[k],d=document.createElement('div');d.className='it';d.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:14px';
  const s=document.createElement('span');s.textContent=t[4];const sm=document.createElement('small');sm.style.cssText='display:block;color:var(--n4,#9ba8ab);font-size:12px';sm.textContent=t[3]+' USD';s.appendChild(sm);
  const b=document.createElement('button');b.className='btn s';b.style.cssText='width:auto;min-height:38px;padding:0 14px;font-size:13px;flex:none';b.textContent='Comprar';b.onclick=()=>openPay(t[2]);d.append(s,b);L.appendChild(d)}
q('#gcR').onclick=async()=>{const m=q('#gcM'),b=q('#gcR');b.disabled=true;m.style.color='';m.textContent='A verificar…';
  try{const t=await redeem(q('#gcI').value);m.style.color='#9fe3a0';m.textContent='Resgatado: '+t[4]+'.'+(t[0]==='c'&&!(window.G&&G.started)?' O dinheiro entra quando começares o jogo.':'');q('#gcI').value=''}
  catch(e){m.style.color='#ff9c9c';m.textContent=e.message}b.disabled=false};
q('#gcB').onclick=()=>toMenu();
const bl=q('#menu .side #bPhone')||q('#menu .side #bLoja')||q('#menu .side #bCust');
if(bl){const b=document.createElement('button');b.className='btn s';b.id='bGift';b.textContent='Gift card';bl.after(b);b.onclick=()=>{showScr('gc');q('#gcM').textContent=''}}
})();
