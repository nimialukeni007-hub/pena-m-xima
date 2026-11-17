/* Monetização: Passe Premium, pacotes de dinheiro, promoções, anúncios de parceiros e anúncio com recompensa. */
(function(){
const q=s=>document.querySelector(s);
const today=()=>new Date().toISOString().slice(0,10);
const enc=encodeURIComponent;
const COINS=[['coin_s',600,1],['coin_m',1500,2],['coin_l',4000,4]];
const PASSE_USD=4,AD_REWARD=25,AD_MAX=5,AD_SECS=8;
CFG.ads=[];CFG.promo=null;
const uid=()=>(AUTH.user&&AUTH.user.uid)||'x';
const passeOn=()=>PAY.left('passe')>0;
const promoPct=()=>{const p=CFG.promo;return p&&p.pct>0&&p.pct<=90&&p.until>Date.now()?p.pct/100:0};

/* ---------- catálogo ---------- */
const _list=PAY.list;
PAY.list=function(){let L=_list.call(PAY);
  L.push(['passe','Passe Premium',PAY.kz(PASSE_USD),PASSE_USD,'Todos os trajes, cabelos e acessórios individuais, 60 Kz por dia, 10% de desconto na cantina e uma estrela no ranking. Dura 30 dias.','']);
  for(const [k,n,u] of COINS)L.push([k,'+'+n+' Kz no jogo',PAY.kz(u),u,'Dinheiro do jogo. Entra na tua conta quando abrires o jogo.','']);
  const pr=promoPct();
  if(pr)L=L.map(x=>{if(x[0]==='world'||!x[3])return x;const u=Math.round(x[3]*(1-pr)*100)/100,y=x.slice();y[3]=u;y[2]=PAY.kz(u);return y});
  return L};
const _has=PAY.has;
PAY.has=function(k){if(_has.call(PAY,k))return true;
  if(/^(hair_|acc_|pack_)/.test(k)&&passeOn()){const it=_list.call(PAY).find(x=>x[0]===k);return !(it&&it[5])}return false};
const _ld=PAY.load;
PAY.load=async function(){await _ld.apply(PAY,arguments);
  try{if(AUTH.live()&&AUTH.user&&!AUTH.user.local){const c=await DB.get('config');if(c){CFG.ads=c.ads?Object.values(c.ads).filter(a=>a&&a.t):[];CFG.promo=(c.promo&&c.promo.pct&&c.promo.until>Date.now())?c.promo:null}}}catch(e){}
  try{renderSpons()}catch(e){}};
const _da=PAY.demoApprove;
PAY.demoApprove=function(item){const c=COINS.find(x=>x[0]===item);if(!c)return _da.call(PAY,item);PAY.ent.coinsTotal=(PAY.ent.coinsTotal||0)+c[1];localStorage.setItem('pm_ent_'+uid(),JSON.stringify(PAY.ent))};
const _op=openPay;
openPay=function(item){_op(item);if(/^coin_/.test(item)){const it=PAY.list().find(x=>x[0]===item);if(it)q('#pPrice').textContent=fmtUsd(it[3])+'  (≈ '+fmtKz(it[2])+')'}};

/* ---------- vantagens no jogo ---------- */
const _pk=perk;
perk=function(){const o=_pk.apply(this,arguments);if(o&&passeOn())o.disc=(o.disc||0)+.1;return o};
async function claim(){
  if(!G.started||G.over)return;
  try{let add=0;const notes=[];
    const b=+localStorage.getItem('pm_bonus')||0;if(b>0){add+=b;localStorage.setItem('pm_bonus','0')}
    if(passeOn()&&localStorage.getItem('pm_gift_'+uid())!==today()){localStorage.setItem('pm_gift_'+uid(),today());add+=60;notes.push('presente diário do Passe')}
    if(AUTH.live()&&!AUTH.user.local){try{await PAY.load()}catch(e){}
      const tot=PAY.ent.coinsTotal||0;if(tot>0){const cl=(await DB.get('users/'+uid()+'/claimed'))||0;if(tot>cl){await DB.set('users/'+uid()+'/claimed',tot);add+=tot-cl;notes.push('pacote comprado')}}}
    else{const tot=PAY.ent.coinsTotal||0,cl=+localStorage.getItem('pm_claimed_'+uid())||0;if(tot>cl){localStorage.setItem('pm_claimed_'+uid(),tot);add+=tot-cl;notes.push('pacote comprado')}}
    if(add>0){P.money+=add;banner('+'+add+' Kz'+(notes.length?' ('+notes.join(', ')+')':''),'#ffe08a',3600);try{sfx('coin')}catch(e){}}
  }catch(e){}}
const _bg=begin;begin=function(){const r=_bg.apply(this,arguments);setTimeout(claim,2600);return r};

/* ---------- parceiros (anúncios) ---------- */
const ownAd=()=>({t:'O teu negócio pode aparecer aqui. Fala com a Arão Lende Web Design.',u:'https://wa.me/'+CFG.whatsapp+'?text='+enc('Quero anunciar no Pena Máxima'),c:'Anuncie aqui'});
const adList=()=>CFG.ads&&CFG.ads.length?CFG.ads:[ownAd()];
let ai=0;
const css=document.createElement('style');
css.textContent=`#spons{display:none;font:500 13px/1.35 var(--tx,system-ui);color:var(--n5,#ccd0cf);background:rgba(204,208,207,.07);border-radius:12px;padding:8px 12px}#spons.on{display:block}#spons b{color:#ffcf8a;font-weight:700}#spons{overflow-wrap:anywhere}#spons a{color:#ffcf8a;margin-left:6px;display:inline-block}
#menu .side,#more .side,#loja .side{max-height:100%;overflow-y:auto}#more .tab{font-size:12px;letter-spacing:.3px;padding:0 6px;min-height:44px}
#loja h4{margin:10px 0 2px;font:700 12px var(--tx,system-ui);letter-spacing:.14em;text-transform:uppercase;color:#ffcf8a}#loja .it{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:14px}#loja .it small{display:block;color:var(--n4,#9ba8ab);font-size:12px}#loja .it span{flex:1 1 0;min-width:0}#loja .it .btn{width:auto!important;min-height:38px;padding:0 12px;font-size:13px;letter-spacing:.05em;flex:none}
#adv{position:fixed;inset:0;z-index:99;background:rgba(5,7,11,.94);display:none;align-items:center;justify-content:center;padding:18px;text-align:center;color:#eee;font-family:var(--tx,system-ui)}#adv.on{display:flex}#adv .box{max-width:420px;display:flex;flex-direction:column;gap:12px;align-items:center}#adv .tx{font-size:20px;line-height:1.35}#adv .cd{font-size:13px;color:#9ba8ab}`;
document.head.appendChild(css);
const sp=document.createElement('div');sp.id='spons';
const ex=q('#expN');if(ex)ex.after(sp);
function renderSpons(){let h='';const pr=promoPct();
  if(pr)h+='<div><b>Promoção -'+Math.round(pr*100)+'%</b> '+(CFG.promo.label||'')+' até '+new Date(CFG.promo.until).toLocaleDateString('pt-PT')+'</div>';
  const a=adList()[ai%adList().length];
  h+='<div><b>Parceiro</b> '+String(a.t).replace(/[<>&]/g,'')+'<a href="'+String(a.u||'#').replace(/"/g,'')+'" target="_blank" rel="noopener">'+String(a.c||'Ver').replace(/[<>&]/g,'')+'</a></div>';
  sp.innerHTML=h;sp.classList.add('on')}
setInterval(()=>{ai++;if(q('#menu.on'))renderSpons()},9000);
renderSpons();

/* ---------- ecrã Loja ---------- */
const loja=document.createElement('section');loja.id='loja';loja.className='scr';
loja.innerHTML='<div class="side glass"><h3>Loja</h3><div id="lBody"></div><button class="btn s ghost" id="lBack">Voltar</button></div>';
document.body.appendChild(loja);
const mm=q('#more>div');if(mm)mm.className='side glass';
const advDone=()=>+localStorage.getItem('pm_adv_'+today())||0;
function row(t,sub,btn,fn,dis){const d=document.createElement('div');d.className='it';const s=document.createElement('span');s.textContent=t;if(sub){const m=document.createElement('small');m.textContent=sub;s.appendChild(m)}d.appendChild(s);
  if(btn){const b=document.createElement('button');b.className='btn s';b.textContent=btn;b.disabled=!!dis;b.onclick=fn;d.appendChild(b)}return d}
function renderLoja(){const B=q('#lBody');B.innerHTML='';const L=PAY.list(),by=k=>L.find(x=>x[0]===k);
  const h=t=>{const e=document.createElement('h4');e.textContent=t;B.appendChild(e)};
  const pr=promoPct();if(pr){const p=document.createElement('p');p.className='note';p.style.color='#ffcf8a';p.textContent='Promoção -'+Math.round(pr*100)+'% em todos os itens (menos Modo World).';B.appendChild(p)}
  h('Passe Premium');const ps=by('passe'),l=PAY.left('passe');
  B.appendChild(row('Passe Premium · '+fmtUsd(ps[3])+' (≈ '+fmtKz(ps[2])+')',l>0?'Ativo: faltam '+Math.ceil(l/864e5)+' dias':'Todos os trajes, 60 Kz por dia, 10% desconto, estrela no ranking',l>0?'Renovar':'Comprar',()=>openPay('passe')));
  h('Dinheiro do jogo');for(const [k,n] of COINS){const c=by(k);B.appendChild(row('+'+n+' Kz no jogo',fmtUsd(c[3])+' (≈ '+fmtKz(c[2])+')','Comprar',()=>openPay(k)))}
  if(!PAY.has('world')){h('Online');const w=by('world');B.appendChild(row('Modo World (online)',fmtKz(w[2])+' · para sempre','Comprar',()=>openPay('world')))}
  h('Aparência');B.appendChild(row('Trajes, cabelos e acessórios','Compra individual de 1 a 3 $ ou todos com o Passe','Ver',()=>openCustom()));
  h('Ganhar dinheiro do jogo');const n=advDone();B.appendChild(row('Ver um anúncio · +'+AD_REWARD+' Kz','Hoje: '+n+' de '+AD_MAX,'Ver',showAd,n>=AD_MAX))}
q('#lBack').onclick=()=>toMenu();
const bM=q('#menu .side #bCust');
if(bM){const b=document.createElement('button');b.className='btn s';b.id='bLoja';b.textContent='Loja e Passe';bM.after(b);b.onclick=()=>{showScr('loja');renderLoja()}}

/* ---------- anúncio com recompensa ---------- */
const adv=document.createElement('div');adv.id='adv';adv.innerHTML='<div class="box"><div class="cd" id="aT"></div><div class="tx" id="aX"></div><a class="btn s" id="aL" target="_blank" rel="noopener">Abrir</a><button class="btn" id="aOk" disabled></button><button class="btn s ghost" id="aX2">Fechar</button></div>';document.body.appendChild(adv);
let advT=0;
function showAd(){if(advDone()>=AD_MAX)return;const a=adList()[Math.floor(Math.random()*adList().length)];let s=AD_SECS;
  q('#aX').textContent=a.t;const L=q('#aL');L.href=a.u||'#';L.textContent=a.c||'Abrir';q('#aT').textContent='Anúncio de parceiro';
  const ok=q('#aOk');ok.disabled=true;ok.textContent='Aguarda '+s+' s';adv.classList.add('on');clearInterval(advT);
  advT=setInterval(()=>{s--;if(s>0){ok.textContent='Aguarda '+s+' s';return}clearInterval(advT);ok.disabled=false;ok.textContent='Receber '+AD_REWARD+' Kz'},1000);
  ok.onclick=()=>{if(ok.disabled)return;if(advDone()<AD_MAX){localStorage.setItem('pm_adv_'+today(),String(advDone()+1));localStorage.setItem('pm_bonus',String((+localStorage.getItem('pm_bonus')||0)+AD_REWARD))}adv.classList.remove('on');renderLoja();};
  q('#aX2').onclick=()=>{clearInterval(advT);adv.classList.remove('on')}}
})();
