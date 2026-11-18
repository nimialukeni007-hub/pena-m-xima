/* Telemóvel do jogo: amigos, mensagens, chamadas de voz, pesquisa, ranking global, sala própria. */
(function(){
const q=s=>document.querySelector(s);
const E=s=>String(s==null?'':s).replace(/[<>&"'`]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
const me=()=>(AUTH.user&&AUTH.user.uid)||'';
const online=()=>AUTH.live()&&AUTH.user&&!AUTH.user.local;
const myName=()=>String(AUTH.user&&(AUTH.user.name||AUTH.user.email)||'Jogador').replace(/[<>&"'`]/g,'').slice(0,20);
const SV={'.sv':'timestamp'};
const say=(t,ms)=>{try{toast(t,ms||2600)}catch(e){}};
const pair=(a,b)=>a<b?[a,b]:[b,a];

/* ---------- nomes ---------- */
const NM={};
async function nameOf(u){if(NM[u])return NM[u];try{const n=await DB.get('profiles/'+u+'/n');NM[u]=typeof n==='string'?n:'Jogador'}catch(e){NM[u]='Jogador'}return NM[u]}

/* ---------- ligação em tempo real (um único canal por jogador) ---------- */
function sse(path,cb){let es=null,obj=null,dead=false,tm=0;
  const set=(p,v)=>{const k=p.split('/').filter(Boolean);if(!k.length){obj=v;return}if(obj==null||typeof obj!=='object')obj={};let o=obj;for(let i=0;i<k.length-1;i++){if(o[k[i]]==null||typeof o[k[i]]!=='object')o[k[i]]={};o=o[k[i]]}
    if(v===null)delete o[k[k.length-1]];else o[k[k.length-1]]=v};
  async function open(){if(dead)return;let t=null;try{t=await AUTH.token()}catch(e){}if(dead||!t){tm=setTimeout(open,6000);return}
    try{es=new EventSource(CFG.dbUrl+'/'+path+'.json?auth='+encodeURIComponent(t))}catch(e){tm=setTimeout(open,6000);return}
    es.addEventListener('put',e=>{try{const d=JSON.parse(e.data);set(d.path,d.data);cb(obj)}catch(x){}});
    es.addEventListener('patch',e=>{try{const d=JSON.parse(e.data);for(const k in d.data)set((d.path==='/'?'':d.path)+'/'+k,d.data[k]);cb(obj)}catch(x){}});
    es.addEventListener('auth_revoked',()=>{try{es.close()}catch(x){}tm=setTimeout(open,800)});
    es.onerror=()=>{try{es.close()}catch(x){}if(!dead)tm=setTimeout(open,5000)}}
  open();
  return{close(){dead=true;clearTimeout(tm);try{es&&es.close()}catch(e){}}}}

/* ---------- estilo ---------- */
const css=document.createElement('style');
css.textContent=`#ph{position:fixed;inset:0;z-index:130;display:none;align-items:center;justify-content:center;background:rgba(3,6,12,.74);padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));font-family:var(--tx,system-ui)}#ph.on{display:flex}
#ph .phc{width:min(420px,100%);height:min(660px,calc(100dvh - 20px));display:flex;flex-direction:column;border-radius:30px;background:linear-gradient(165deg,#18253a,#0b121e);border:1px solid rgba(160,200,255,.22);box-shadow:0 24px 80px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.12);overflow:hidden;color:#eaf1f7}
#ph .pht{display:flex;align-items:center;justify-content:space-between;padding:14px 18px 8px;font:700 16px var(--tx,system-ui)}#ph .pht button{background:rgba(255,255,255,.09);border:0;color:#fff;border-radius:12px;min-height:36px;padding:0 14px;font:600 13px var(--tx,system-ui);cursor:pointer}
#ph .phb{flex:1;min-height:0;overflow-y:auto;padding:4px 16px 12px;-webkit-overflow-scrolling:touch}
#ph .phn{display:flex;gap:2px;padding:6px 8px calc(8px + env(safe-area-inset-bottom,0px));background:rgba(0,0,0,.28);border-top:1px solid rgba(255,255,255,.08)}
#ph .phn button{flex:1;position:relative;min-height:46px;border:0;border-radius:14px;background:transparent;color:#9fb0c3;font:600 11.5px var(--tx,system-ui);cursor:pointer}#ph .phn button.on{background:rgba(79,155,255,.22);color:#fff}
#ph .phn b,.phbadge{position:absolute;top:2px;right:6px;min-width:18px;height:18px;border-radius:9px;background:#ff5a5f;color:#fff;font:700 11px/18px var(--tx,system-ui);text-align:center;padding:0 4px}
#ph h4{margin:12px 0 4px;font:700 11px var(--tx,system-ui);letter-spacing:.14em;text-transform:uppercase;color:#8fc0ff}
#ph .li{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:14px}#ph .li .nm{display:flex;align-items:center;min-width:0;flex:1}#ph .li .nm>span{min-width:0;overflow:hidden;text-overflow:ellipsis}#ph .li small{display:block;color:#93a4b8;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#ph .ac{display:flex;gap:6px;flex:none}#ph .ac button,#ph .bt{min-height:36px;padding:0 12px;border:0;border-radius:11px;background:rgba(79,155,255,.28);color:#fff;font:600 12.5px var(--tx,system-ui);cursor:pointer}#ph .ac button.g,#ph .bt.g{background:rgba(255,255,255,.1)}#ph .ac button.r{background:rgba(255,90,95,.35)}#ph .ac button:disabled{opacity:.45}
#ph input[type=search],#ph input[type=text]{height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(6,14,24,.6);color:#fff;font:500 16px var(--tx,system-ui);padding:0 14px;width:100%;box-sizing:border-box;user-select:text;-webkit-user-select:text}
#ph .sub{color:#93a4b8;font-size:13px;margin:8px 0}
#ph .th{display:flex;flex-direction:column;gap:6px;padding:6px 0}#ph .bb{max-width:78%;padding:8px 12px;border-radius:16px;font-size:14px;line-height:1.35;overflow-wrap:anywhere;background:rgba(255,255,255,.1);align-self:flex-start}#ph .bb.m{align-self:flex-end;background:rgba(79,155,255,.4)}#ph .bb small{display:block;opacity:.6;font-size:10.5px;margin-top:2px}
#ph .sd{display:flex;gap:8px;padding:8px 12px calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid rgba(255,255,255,.08)}#ph .sd .bt{min-width:76px}
#ph .rk{display:flex;gap:5px;margin:6px 0}#ph .rk button{flex:1;min-height:34px;border:0;border-radius:10px;background:rgba(255,255,255,.08);color:#b9c7d8;font:600 12px var(--tx,system-ui);cursor:pointer}#ph .rk button.on{background:rgba(79,155,255,.3);color:#fff}
#ph .code{font:800 30px/1.2 var(--tx,system-ui);letter-spacing:.18em;text-align:center;padding:14px;margin:8px 0;border-radius:16px;background:rgba(79,155,255,.14);border:1px dashed rgba(160,200,255,.5);user-select:all;-webkit-user-select:all}
body.ingame #ph{background:rgba(3,6,12,.9)}
#phB{pointer-events:auto;position:relative;padding:6px 12px;border-radius:12px;font-weight:600;font-size:12px;background:rgba(14,17,24,.85);border:1px solid rgba(255,255,255,.22);color:#fff}
.phbadge{top:-6px;right:-6px}
#cl{position:fixed;left:50%;top:max(12px,env(safe-area-inset-top));transform:translateX(-50%);z-index:150;display:none;width:min(360px,calc(100% - 20px));padding:14px 16px;border-radius:22px;background:rgba(12,20,34,.96);border:1px solid rgba(160,200,255,.3);box-shadow:0 16px 50px rgba(0,0,0,.6);color:#fff;font-family:var(--tx,system-ui);text-align:center}#cl.on{display:block}#cl b{font-size:17px;display:block}#cl span{color:#9fb0c3;font-size:13px}#cl .ac{display:flex;gap:10px;justify-content:center;margin-top:12px}#cl button{min-height:44px;min-width:110px;border:0;border-radius:14px;font:700 14px var(--tx,system-ui);color:#fff;cursor:pointer;background:#2f9e5b}#cl button.r{background:#d64550}#cl button.g{background:rgba(255,255,255,.14)}`;
document.head.appendChild(css);

/* ---------- estado ---------- */
const ST={f:{},i:{},tab:'c',thread:null,tsub:null};
let boxSub=null,boxInit=false,lastI={},lastIn=0;
const phone=document.createElement('div');phone.id='ph';
phone.innerHTML='<div class="phc"><div class="pht"><span id="phT">Telemóvel</span><button id="phX">Fechar</button></div><div class="phb" id="phB2"></div><div class="phn"><button data-t="c">Contactos</button><button data-t="m">Mensagens</button><button data-t="s">Procurar</button><button data-t="r">Ranking</button><button data-t="o">Sala</button></div></div>';
document.body.appendChild(phone);
const callUI=document.createElement('div');callUI.id='cl';document.body.appendChild(callUI);
const audio=document.createElement('audio');audio.autoplay=true;audio.setAttribute('playsinline','');document.body.appendChild(audio);
const B=()=>q('#phB2');
function counts(){let inr=0,unread=0;for(const k in ST.f)if(ST.f[k]==='in')inr++;for(const k in ST.i)unread++;return{inr,unread}}
function badges(){const c=counts(),n=c.inr+c.unread;
  const hb=q('#phB');if(hb){let s=hb.querySelector('.phbadge');if(n){if(!s){s=document.createElement('i');s.className='phbadge';s.style.fontStyle='normal';hb.appendChild(s)}s.textContent=n}else if(s)s.remove()}
  const nb=(t,v)=>{const b=phone.querySelector('.phn [data-t="'+t+'"]');if(!b)return;let s=b.querySelector('b');if(v){if(!s){s=document.createElement('b');b.appendChild(s)}s.textContent=v}else if(s)s.remove()};
  nb('c',c.inr);nb('m',c.unread);
  const mb=q('#bPhone');if(mb)mb.textContent=n?'Telemóvel ('+n+')':'Telemóvel'}

/* ---------- canal único ---------- */
function startBox(){if(boxSub||!online())return;const u=me();
  boxSub=sse('box/'+u,o=>{o=o||{};const nf=o.f||{},ni=o.i||{};
    let inn=0;for(const k in nf)if(nf[k]==='in')inn++;
    if(boxInit&&inn>lastIn)say('Novo pedido de amizade.',3000);lastIn=inn;
    if(boxInit)for(const k in ni){const a=lastI[k];if((!a||a.t!==ni[k].t)&&!(ST.thread&&ST.thread===k&&phone.classList.contains('on')))say(E(ni[k].n)+': '+E(ni[k].x||'mensagem'),3200)}
    lastI=ni;ST.f=nf;ST.i=ni;boxInit=true;badges();
    if(phone.classList.contains('on')&&!ST.thread&&(ST.tab==='c'||ST.tab==='m'))view();
    if(ST.thread&&ST.i[ST.thread]&&phone.classList.contains('on'))DB.f('box/'+u+'/i/'+ST.thread,'DELETE').catch(()=>{});
    callsIn(o.c||{})})}
function stopBox(){if(boxSub)boxSub.close();boxSub=null;boxInit=false;ST.f={};ST.i={};lastI={};lastIn=0;badges()}

/* ---------- amizades ---------- */
async function patchRoot(o){await DB.f('','PATCH',o)}
async function addFriend(o){const u=me();if(ST.f[o]==='in')return acceptFriend(o);if(ST.f[o])return;
  await patchRoot({['box/'+u+'/f/'+o]:'out',['box/'+o+'/f/'+u]:'in'})}
async function acceptFriend(o){const u=me();await patchRoot({['box/'+u+'/f/'+o]:'ok',['box/'+o+'/f/'+u]:'ok'})}
async function dropFriend(o){const u=me();await patchRoot({['box/'+u+'/f/'+o]:null,['box/'+o+'/f/'+u]:null})}
function fbtn(o,name,B2){const s=ST.f[o];
  if(o===me())return '<small>és tu</small>';
  if(s==='ok')return '<button class="g" disabled>Amigos</button>';
  if(s==='out')return '<button class="g" disabled>Pedido enviado</button>';
  if(s==='in')return '<button data-a="acc" data-o="'+o+'">Aceitar</button>';
  return '<button data-a="add" data-o="'+o+'">Adicionar</button>'}
async function act(e){const b=e.target.closest('button[data-a]');if(!b)return;const a=b.dataset.a,o=b.dataset.o;if(!o&&a!=='send')return;b.disabled=true;
  try{
    if(a==='add'){await addFriend(o);say('Pedido de amizade enviado.')}
    else if(a==='acc'){await acceptFriend(o);say('Agora são amigos.')}
    else if(a==='no'||a==='del'||a==='cancel'){await dropFriend(o)}
    else if(a==='msg'){openThread(o);return}
    else if(a==='call'){startCall(o);return}
    else if(a==='inv'){await sendMsg(o,'@sala '+roomCode());say('Convite enviado.')}
    else if(a==='join'){joinRoom(b.dataset.c);return}
  }catch(er){say('Não foi possível agora. Tenta de novo.')}
  b.disabled=false;if(phone.classList.contains('on'))view()}
phone.addEventListener('click',act);document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#comm'))act(e)});

/* ---------- mensagens ---------- */
async function sendMsg(o,m){const u=me(),[a,b]=pair(u,o);m=String(m).slice(0,300);if(!m.trim())return;
  await DB.post('dm/'+a+'/'+b,{f:u,m,t:SV});
  await DB.f('box/'+o+'/i/'+u,'PUT',{t:SV,n:myName(),x:m.slice(0,60)})}
async function openThread(o){ST.thread=o;ST.tab='m';tabsOn();const u=me(),[a,b]=pair(u,o),nm=await nameOf(o);
  q('#phT').textContent=nm;
  B().innerHTML='<div style="display:flex;gap:8px;margin:6px 0"><button class="bt g" id="tBk">Voltar</button><button class="bt" data-a="call" data-o="'+E(o)+'">Ligar</button><button class="bt g" data-a="inv" data-o="'+E(o)+'">Convidar para a minha sala</button></div><div class="th" id="tH"></div>';
  const wrap=B();let box=q('#phSd');if(box)box.remove();
  box=document.createElement('div');box.className='sd';box.id='phSd';box.innerHTML='<input type="text" id="tI" maxlength="300" placeholder="Escreve uma mensagem" autocomplete="off"><button class="bt" id="tS">Enviar</button>';
  wrap.after(box);q('#tBk').onclick=()=>{closeThread();ST.tab='m';view()};
  DB.f('box/'+u+'/i/'+o,'DELETE').catch(()=>{});
  if(ST.tsub)ST.tsub.close();
  ST.tsub=sse('dm/'+a+'/'+b+'?orderBy='+encodeURIComponent('"$key"')+'&limitToLast=60',d=>{const H=q('#tH');if(!H)return;const L=Object.entries(d||{}).filter(([k,v])=>v&&typeof v.m==='string').sort((x,y)=>x[0]<y[0]?-1:1);
    H.innerHTML=L.map(([k,v])=>{const mine=v.f===u,r=/^@sala (P[A-Z0-9]{5})$/.exec(v.m),tm=v.t?new Date(v.t).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):'';
      return '<div class="bb'+(mine?' m':'')+'">'+(r?E(mine?'Convite enviado para a tua sala ':nm+' convidou-te para a sala ')+'<b>'+r[1]+'</b><br><button class="bt" data-a="join" data-c="'+r[1]+'" data-o="x" style="margin-top:6px">Entrar na sala</button>':E(v.m))+'<small>'+tm+'</small></div>'}).join('')||'<p class="sub">Sem mensagens. Diz olá.</p>';
    wrap.scrollTop=wrap.scrollHeight});
  const send=async()=>{const i=q('#tI'),m=i.value.trim();if(!m)return;i.value='';try{await sendMsg(o,m)}catch(e){say('Mensagem não enviada.');i.value=m}};
  q('#tS').onclick=send;q('#tI').onkeydown=e=>{if(e.key==='Enter')send()}}
function closeThread(){ST.thread=null;if(ST.tsub){ST.tsub.close();ST.tsub=null}const s=q('#phSd');if(s)s.remove();q('#phT').textContent='Telemóvel'}

/* ---------- pesquisa e ranking (também usados no ecrã Comunidade) ---------- */
let st1=0;
window.searchInto=function(el){el.innerHTML='<input type="search" id="qS" placeholder="Procurar jogador pelo nome" maxlength="20"><div id="qR"></div>';
  const R=el.querySelector('#qR'),I=el.querySelector('#qS');
  if(!online()){R.innerHTML='<p class="sub">A pesquisa precisa de uma conta online.</p>';return}
  const go=async()=>{const t=I.value.trim().toLowerCase().replace(/[<>&"'`\\]/g,'');if(t.length<2){R.innerHTML='<p class="sub">Escreve pelo menos 2 letras.</p>';return}
    R.innerHTML='<p class="sub">A procurar…</p>';
    try{const tk=await AUTH.token();const r=await fetch(CFG.dbUrl+'/profiles.json?orderBy='+encodeURIComponent('"l"')+'&startAt='+encodeURIComponent('"'+t+'"')+'&endAt='+encodeURIComponent('"'+t+'"')+'&limitToFirst=20&auth='+tk);if(!r.ok)throw 0;
      const o=await r.json()||{},L=Object.entries(o).filter(([k,v])=>v&&v.n);if(!L.length){R.innerHTML='<p class="sub">Nenhum jogador encontrado.</p>';return}
      R.innerHTML='';for(const [k,v] of L){NM[k]=v.n;const d=document.createElement('div');d.className='li';d.innerHTML='<span class="nm">'+AVH(k,36,v.n)+'<span>'+E(v.n)+'<small id="sc_'+E(k)+'"></small></span></span><span class="ac">'+(ST.f[k]==='ok'?'<button data-a="msg" data-o="'+E(k)+'">Mensagem</button>':'')+fbtn(k)+'</span>';R.appendChild(d);
        DB.get('rank/'+k).then(x=>{const e=document.getElementById('sc_'+k);if(e&&x&&x.s)e.textContent=x.s+' pontos'}).catch(()=>{})}
    }catch(e){R.innerHTML='<p class="sub">Não foi possível pesquisar agora.</p>'}};
  I.oninput=()=>{clearTimeout(st1);st1=setTimeout(go,350)}};
const RKT={s:['Geral','s','pontos'],r:['Respeito','r','respeito'],mo:['Dinheiro','mo','Kz'],st:['Força','st','de força']};
window.rankInto=async function(el,key){key=key||'s';
  el.innerHTML='<div class="rk">'+Object.entries(RKT).map(([k,v])=>'<button data-k="'+k+'" class="'+(k===key?'on':'')+'">'+v[0]+'</button>').join('')+'</div><div id="rkL"><p class="sub">A carregar…</p></div>';
  el.querySelectorAll('.rk button').forEach(b=>b.onclick=ev=>{ev.stopPropagation();rankInto(el,b.dataset.k)});
  const L0=el.querySelector('#rkL');
  try{if(!online()){L0.innerHTML='<p class="sub">O ranking precisa de uma conta online.</p>';return}
    const tk=await AUTH.token();const r=await fetch(CFG.dbUrl+'/rank.json?orderBy='+encodeURIComponent('"'+key+'"')+'&limitToLast=30&auth='+tk);if(!r.ok)throw 0;
    const o=await r.json()||{},L=Object.entries(o).filter(([k,v])=>v&&typeof v[key]==='number').sort((a,b)=>b[1][key]-a[1][key]);
    if(!L.length){L0.innerHTML='<p class="sub">Ainda sem pontuações. Joga para entrares no ranking.</p>';return}
    const unit=RKT[key][2];L0.innerHTML='';
    L.forEach(([k,v],i)=>{const d=document.createElement('div');d.className='li';d.innerHTML='<span class="nm"><b style="width:28px;flex:none">'+(i+1)+'.</b>'+AVH(k,32,v.n)+'<span>'+E(v.n)+(k===me()?' (tu)':'')+'<small>respeito '+Math.round(v.r||0)+' · '+Math.round(v.mo||0)+' Kz · força '+Math.round(v.st||0)+'</small></span></span><i style="font-style:normal;color:#ffe08a;flex:none">'+Math.round(v[key])+' '+(key==='s'?'':'')+'</i>';
      if(k!==me()){const a=document.createElement('span');a.className='ac';a.innerHTML=ST.f[k]?'':'<button data-a="add" data-o="'+E(k)+'">Adicionar</button>';d.appendChild(a)}L0.appendChild(d)});
  }catch(e){L0.innerHTML='<p class="sub">Não foi possível carregar o ranking.</p>'}};

/* ---------- vistas do telemóvel ---------- */
function tabsOn(){phone.querySelectorAll('.phn button').forEach(b=>b.classList.toggle('on',b.dataset.t===ST.tab))}
function view(){if(!online()){B().innerHTML='<p class="sub">O telemóvel precisa de uma conta online. Termina a sessão do modo de teste e entra com a tua conta.</p>';return}
  tabsOn();const t=ST.tab;q('#phT').textContent='Telemóvel';
  if(t==='c')vContacts();else if(t==='m')vChats();else if(t==='s'){searchInto(B())}else if(t==='r')rankInto(B());else vRoom()}
async function vContacts(){const L=Object.entries(ST.f),inn=L.filter(x=>x[1]==='in'),ok=L.filter(x=>x[1]==='ok'),out=L.filter(x=>x[1]==='out');
  await Promise.all(L.map(x=>nameOf(x[0])));if(ST.tab!=='c'||ST.thread)return;
  const row=(u,acts)=>'<div class="li"><span class="nm">'+AVH(u,38,NM[u])+'<span>'+E(NM[u])+'</span></span><span class="ac">'+acts+'</span></div>';
  let h='';
  if(inn.length)h+='<h4>Pedidos recebidos</h4>'+inn.map(([u])=>row(u,'<button data-a="acc" data-o="'+E(u)+'">Aceitar</button><button class="r" data-a="no" data-o="'+E(u)+'">Recusar</button>')).join('');
  h+='<h4>Amigos ('+ok.length+')</h4>'+(ok.length?ok.map(([u])=>row(u,'<button data-a="msg" data-o="'+E(u)+'">Msg</button><button data-a="call" data-o="'+E(u)+'">Ligar</button><button class="g" data-a="del" data-o="'+E(u)+'">Remover</button>')).join(''):'<p class="sub">Ainda não tens amigos. Usa Procurar para adicionar jogadores.</p>');
  if(out.length)h+='<h4>Pedidos enviados</h4>'+out.map(([u])=>row(u,'<button class="g" data-a="cancel" data-o="'+E(u)+'">Cancelar</button>')).join('');
  B().innerHTML=h}
async function vChats(){const ok=Object.entries(ST.f).filter(x=>x[1]==='ok');await Promise.all(ok.map(x=>nameOf(x[0])));if(ST.tab!=='m'||ST.thread)return;
  ok.sort((a,b)=>((ST.i[b[0]]||{}).t||0)-((ST.i[a[0]]||{}).t||0));
  B().innerHTML=ok.length?ok.map(([u])=>{const i=ST.i[u];return '<div class="li" style="cursor:pointer" data-a="msg" data-o="'+E(u)+'"><span class="nm">'+AVH(u,38,NM[u])+'<span>'+E(NM[u])+'<small>'+(i?E(i.x||'Nova mensagem'):'Toca para conversar')+'</small></span></span>'+(i?'<span class="phbadge" style="position:static">1</span>':'')+'</div>'}).join(''):'<p class="sub">Só podes trocar mensagens com amigos. Adiciona jogadores em Procurar.</p>';
  B().querySelectorAll('.li[data-a]').forEach(d=>d.onclick=()=>openThread(d.dataset.o))}
function roomCode(){let h=2166136261;const s=me()+'pm';for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}
  return 'P'+h.toString(36).toUpperCase().padStart(5,'0').slice(-5)}
function vRoom(){const c=roomCode(),on=window.Net&&Net.on;
  B().innerHTML='<h4>A tua sala</h4><p class="sub">Esta é a tua sala própria. Só entra quem tiver o código. Convida amigos pela conversa ou envia o link.</p><div class="code">'+c+'</div>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="bt" id="rJ">'+(on&&Net.room===c?'Já estás na sala':'Entrar na minha sala')+'</button><button class="bt g" id="rC">Copiar link</button></div><p class="sub" id="rM">Sala atual: '+(on?E(Net.room):'nenhuma')+'. Máximo de 6 jogadores por sala.</p>';
  q('#rJ').onclick=()=>joinRoom(c);
  q('#rC').onclick=async()=>{const u=location.origin+location.pathname+'?sala='+c+'&db='+encodeURIComponent(CFG.dbUrl);try{await navigator.clipboard.writeText(u);q('#rM').textContent='Link copiado.'}catch(e){q('#rM').textContent=u}}}
function joinRoom(c){if(!/^P[A-Z0-9]{5}$/.test(c||''))return;if(!window.G||!G.started){say('Começa o jogo primeiro, depois entra na sala.',3200);return}
  closePhone();try{netConnect(c,(AUTH.user.email||'Preso').split('@')[0].replace(/[^A-Za-z0-9]/g,'').slice(0,12)||'Preso',CFG.dbUrl,true)}catch(e){}}

/* ---------- abrir e fechar ---------- */
function openPhone(t){if(!online()){say('Entra com uma conta online para usar o telemóvel.',3200);return}
  startBox();ST.thread=null;ST.tab=t||(counts().inr?'c':counts().unread?'m':'c');phone.classList.add('on');
  try{if(window.G&&G.started&&!G.over&&!Net.on)G.paused=true}catch(e){}view()}
function closePhone(){phone.classList.remove('on');closeThread();try{if(!panelOpen&&!G.arresting&&!TM)G.paused=false}catch(e){}}
q('#phX').onclick=closePhone;
phone.addEventListener('click',e=>{if(e.target===phone)closePhone()});
phone.querySelectorAll('.phn button').forEach(b=>b.onclick=()=>{closeThread();ST.tab=b.dataset.t;view()});
window.openPhone=openPhone;

/* botões: no HUD e no menu */
const nb=q('#netB');if(nb){const b=document.createElement('button');b.id='phB';b.textContent='Telemóvel';b.addEventListener('click',()=>{try{audioInit()}catch(e){}openPhone()});nb.before(b)}
const bl=q('#menu .side #bLoja')||q('#menu .side #bCust');
if(bl){const b=document.createElement('button');b.className='btn s';b.id='bPhone';b.textContent='Telemóvel';bl.after(b);b.onclick=()=>openPhone()}

/* ---------- chamadas de voz (WebRTC) ---------- */
const ICE=[{urls:'stun:stun.l.google.com:19302'},{urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}];
let CALL=null,ring=0;
const gather=pc=>new Promise(r=>{if(pc.iceGatheringState==='complete')return r();const f=()=>{if(pc.iceGatheringState==='complete'){pc.removeEventListener('icegatheringstatechange',f);r()}};pc.addEventListener('icegatheringstatechange',f);setTimeout(r,3500)});
function showCall(h){callUI.innerHTML=h;callUI.classList.add('on')}
function hideCall(){callUI.classList.remove('on');callUI.innerHTML=''}
function beep(on){clearInterval(ring);ring=0;if(!on)return;const go=()=>{try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.frequency.value=480;g.gain.value=.08;o.connect(g);g.connect(a.destination);o.start();setTimeout(()=>{o.stop();a.close()},350);if(navigator.vibrate)navigator.vibrate(200)}catch(e){}};go();ring=setInterval(go,1600)}
async function newPc(peer,role){const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const pc=new RTCPeerConnection({iceServers:ICE});stream.getTracks().forEach(t=>pc.addTrack(t,stream));
  pc.ontrack=e=>{audio.srcObject=e.streams[0];audio.play().catch(()=>{})};
  pc.onconnectionstatechange=()=>{const s=pc.connectionState;if(CALL&&CALL.pc===pc){if(s==='connected')connected();if(s==='failed'||s==='closed')endCall(true)}};
  CALL={pc,peer,role,stream,t0:0,tm:0};return pc}
function connected(){if(!CALL||CALL.t0)return;CALL.t0=Date.now();clearTimeout(CALL.to);beep(false);drawActive()}
async function drawActive(){if(!CALL)return;const nm=await nameOf(CALL.peer);if(!CALL)return;
  const tick=()=>{if(!CALL||!CALL.t0)return;const s=Math.floor((Date.now()-CALL.t0)/1000);const e=q('#clT');if(e)e.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
  showCall('<b>Em chamada com '+E(nm)+'</b><span id="clT">00:00</span><div class="ac"><button class="g" id="clM">Silenciar</button><button class="r" id="clE">Desligar</button></div>');
  clearInterval(CALL.tm);CALL.tm=setInterval(tick,1000);tick();
  q('#clE').onclick=()=>endCall();q('#clM').onclick=()=>{const t=CALL.stream.getAudioTracks()[0];t.enabled=!t.enabled;q('#clM').textContent=t.enabled?'Silenciar':'Ativar som'}}
async function startCall(peer){if(CALL){say('Já estás numa chamada.');return}
  if(!navigator.mediaDevices||!window.RTCPeerConnection){say('Este navegador não suporta chamadas.',3200);return}
  const u=me(),nm=await nameOf(peer);
  try{const pc=await newPc(peer,'out');showCall('<b>A chamar '+E(nm)+'…</b><span>Aguarda que atenda</span><div class="ac"><button class="r" id="clE">Cancelar</button></div>');q('#clE').onclick=()=>endCall();beep(true);
    const off=await pc.createOffer();await pc.setLocalDescription(off);await gather(pc);if(!CALL||CALL.pc!==pc)return;
    await DB.f('box/'+peer+'/c/'+u,'PUT',{o:pc.localDescription.sdp,n:myName(),t:SV});
    let seen=false;CALL.sub=sse('box/'+peer+'/c/'+u,d=>{if(!CALL||CALL.pc!==pc)return;if(d&&d.o)seen=true;
      if(d&&d.a&&!CALL.ans){CALL.ans=1;beep(false);pc.setRemoteDescription({type:'answer',sdp:d.a}).catch(()=>endCall(true))}
      else if(!d&&seen){say('Chamada recusada ou terminada.');endCall(true)}});
    CALL.to=setTimeout(()=>{if(CALL&&!CALL.t0){say('Sem resposta.');endCall()}},45000)
  }catch(e){say(e&&e.name==='NotAllowedError'?'Permite o microfone para ligar.':'Não foi possível iniciar a chamada.',3400);endCall(true)}}
async function endCall(remote){const c=CALL;CALL=null;beep(false);hideCall();if(!c)return;
  try{clearInterval(c.tm);clearTimeout(c.to);c.sub&&c.sub.close();c.pc.close();c.stream.getTracks().forEach(t=>t.stop())}catch(e){}
  audio.srcObject=null;const u=me();
  if(!remote||true){try{await DB.f(c.role==='out'?'box/'+c.peer+'/c/'+u:'box/'+u+'/c/'+c.peer,'DELETE')}catch(e){}}}
let incoming=null;
function callsIn(all){const u=me();
  if(CALL&&CALL.role==='in'&&!all[CALL.peer]){say('A chamada terminou.');endCall(true)}
  if(incoming&&!all[incoming]){incoming=null;if(!CALL){beep(false);hideCall()}}
  for(const from in all){const c=all[from];if(!c||!c.o||c.a)continue;
    if(typeof c.t!=='number'||Date.now()-c.t>70000){DB.f('box/'+u+'/c/'+from,'DELETE').catch(()=>{});continue}
    if(CALL||incoming===from)continue;
    incoming=from;(async()=>{const nm=await nameOf(from);if(incoming!==from)return;
      showCall('<b>'+E(nm)+' está a ligar</b><span>Chamada de voz</span><div class="ac"><button id="clA">Atender</button><button class="r" id="clR">Recusar</button></div>');beep(true);
      q('#clR').onclick=()=>{incoming=null;beep(false);hideCall();DB.f('box/'+u+'/c/'+from,'DELETE').catch(()=>{})};
      q('#clA').onclick=async()=>{incoming=null;beep(false);
        try{const pc=await newPc(from,'in');await pc.setRemoteDescription({type:'offer',sdp:c.o});const an=await pc.createAnswer();await pc.setLocalDescription(an);await gather(pc);
          await DB.f('box/'+u+'/c/'+from,'PATCH',{a:pc.localDescription.sdp});showCall('<b>A ligar…</b><span>Aguarda</span><div class="ac"><button class="r" id="clE">Desligar</button></div>');q('#clE').onclick=()=>endCall();
          CALL.to=setTimeout(()=>{if(CALL&&!CALL.t0)endCall()},30000)}
        catch(e){say(e&&e.name==='NotAllowedError'?'Permite o microfone para atender.':'Não foi possível atender.',3400);endCall()}}})()}}

/* ---------- ranking global (respeito, dinheiro, força, fugas) ---------- */
const RK={peak:null,busy:0};
async function rkPush(ev){if(!online()||RK.busy||!window.G||!G.started)return;RK.busy=1;
  try{if(!RK.peak)RK.peak=(await DB.get('rank/'+me()))||{};const o=RK.peak,cap=(v,m)=>Math.max(0,Math.min(m,v||0));
    const r=Math.round(Math.max(o.r||0,cap(P.rep,3000))),mo=Math.round(Math.max(o.mo||0,cap(P.money,300000))),st=Math.round(Math.max(o.st||0,cap(P.str,500))*10)/10;
    const e=Math.min(5000,(o.e||0)+(ev&&ev.esc?1:0)),b=Math.round(Math.max(o.b||0,ev&&ev.score||0));
    const s=Math.min(899999,Math.round(r*10+mo/5+st*20+e*500+b/4));
    const n=((window.PAY&&PAY.left&&PAY.left('passe')>0)?'★ ':'')+myName().slice(0,18);
    const v={n,s,r,mo,st,e,b,m:ev&&ev.mode||o.m||'fuga',d:(window.S&&S.day)||o.d||1,ts:SV};
    await DB.set('rank/'+me(),v);RK.peak=Object.assign({},v,{ts:Date.now()})}catch(x){}
  RK.busy=0}
window.RKend=(mode,score)=>rkPush({esc:score>=1500,score,mode});
setInterval(()=>{if(G.started&&!G.over&&!document.hidden)rkPush()},45000);
const _bg=begin;begin=function(){const r=_bg.apply(this,arguments);setTimeout(rkPush,8000);if(online())startBox();return r};
const _al=afterLogin;afterLogin=async function(){const r=await _al.apply(this,arguments);RK.peak=null;startBox();return r};
const _tm=toMenu;toMenu=function(){const r=_tm.apply(this,arguments);if(phone.classList.contains('on'))closePhone();return r};
const _lo=AUTH.logout;AUTH.logout=function(){try{stopBox();RK.peak=null}catch(e){}return _lo.apply(AUTH,arguments)};
window.SOC={openPhone,roomCode,stopBox,startBox};
})();
