/* Perfil com foto, pesquisa de jogadores, classificação com fotos. */
(function(){
const q=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const uid=()=>(AUTH.user&&AUTH.user.uid)||'x';
const online=()=>AUTH.live()&&AUTH.user&&!AUTH.user.local;
const AV={};          /* uid -> {src,img,st} */
const AVK='pm_av_';
function setSrc(u,src){const o=AV[u]||(AV[u]={});o.src=src;o.st=2;const im=new Image();im.onload=()=>{o.img=im;try{R3&&R3.txt&&[...R3.txt.keys()].forEach(k=>{if(k.indexOf('ptag|')===0)R3.txt.delete(k)})}catch(e){}};im.src=src}
window.AVload=function(u){if(!u)return;const o=AV[u];if(o&&o.st)return;AV[u]={st:1};
  if(u===uid()){const l=localStorage.getItem(AVK+u);if(l){setSrc(u,l);return}}
  if(!online()){AV[u]={st:3};return}
  DB.get('profiles/'+u+'/p').then(p=>{if(typeof p==='string'&&p.indexOf('data:image/')===0)setSrc(u,p);else AV[u]={st:3}}).catch(()=>{AV[u]={st:0}})};
window.AVH=function(u,size,name){size=size||28;AVload(u);const o=AV[u];
  if(o&&o.src)return '<img src="'+o.src+'" width="'+size+'" height="'+size+'" style="border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px">';
  return '<span style="display:inline-grid;place-items:center;width:'+size+'px;height:'+size+'px;border-radius:50%;background:rgba(120,160,255,.25);font:700 '+Math.round(size*.45)+'px system-ui;margin-right:6px;vertical-align:middle">'+esc((name||'?').trim().charAt(0).toUpperCase())+'</span>'};
/* etiqueta 3D com foto */
window.AVT=function(n,col){const u=n.pu,o=AV[u];if(!o||!o.img)return null;const key='ptag|'+n.name+'|'+u+'|'+(col||'');let r=R3.txt.get(key);if(r)return r;
  const c=document.createElement('canvas');c.width=320;c.height=64;const x=c.getContext('2d');
  x.save();x.beginPath();x.arc(32,32,26,0,7);x.clip();x.drawImage(o.img,6,6,52,52);x.restore();x.lineWidth=3;x.strokeStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(32,32,27,0,7);x.stroke();
  x.font='800 34px Barlow Condensed,Impact,sans-serif';x.textAlign='left';x.lineWidth=7;x.strokeStyle='rgba(0,0,0,.85)';x.strokeText(n.name,70,44);x.fillStyle=col||'#fff';x.fillText(n.name,70,44);
  r={t:R3.gl.texC(c,false),a:5};R3.txt.set(key,r);return r};

/* ---------- foto: recorte quadrado 96x96, JPEG leve ---------- */
function toAvatar(file){return new Promise((res,rej)=>{const im=new Image(),url=URL.createObjectURL(file);
  im.onload=()=>{URL.revokeObjectURL(url);const s=Math.min(im.naturalWidth,im.naturalHeight),sx=(im.naturalWidth-s)/2,sy=(im.naturalHeight-s)/2;
    const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');x.drawImage(im,sx,sy,s,s,0,0,96,96);
    let d,qy=.78;do{d=c.toDataURL('image/jpeg',qy);qy-=.1}while(d.length>8500&&qy>.2);res(d)};
  im.onerror=()=>{URL.revokeObjectURL(url);rej(Error('Imagem inválida'))};im.src=url})}
async function saveProfile(extra){if(!online())return;const n=String(AUTH.user.name||AUTH.user.email||'Jogador').replace(/[<>&]/g,'').slice(0,20);
  await DB.patch('profiles/'+uid(),Object.assign({n,l:n.toLowerCase(),ts:Date.now()},extra||{}))}
async function syncProfile(){try{if(!online())return;const p=localStorage.getItem(AVK+uid());await saveProfile(p&&localStorage.getItem('pm_avs_'+uid())!==String(p.length)?{p}:null);if(p)localStorage.setItem('pm_avs_'+uid(),String(p.length))}catch(e){}}
const _al=afterLogin;afterLogin=async function(){const r=await _al.apply(this,arguments);syncProfile();return r};

/* ---------- ecrã Comunidade ---------- */
const css=document.createElement('style');
css.textContent=`#comm .side{width:min(440px,100%);max-height:100%;overflow-y:auto}#comm .tabs2{display:flex;gap:6px}#comm .tabs2 button{flex:1;min-height:40px;border:0;border-radius:12px;background:rgba(255,255,255,.07);color:var(--n5);font:600 13px var(--tx);cursor:pointer}#comm .tabs2 button.on{background:rgba(120,170,255,.28);color:#fff;box-shadow:inset 0 0 0 1px rgba(160,200,255,.45)}
#comm .me{display:flex;flex-direction:column;align-items:center;gap:10px;padding:8px 0}#comm .big{width:112px;height:112px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 3px rgba(255,255,255,.7),0 10px 30px rgba(0,0,0,.5);background:rgba(120,160,255,.25);display:grid;place-items:center;font:700 44px var(--tx);color:#fff}
#comm .li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:14px}#comm .li small{display:block;color:var(--n4);font-size:12px}#comm .li i{font-style:normal;color:#ffe08a}#comm .li.off{opacity:.45}#comm .li .nm{display:flex;align-items:center;min-width:0}
#comm input[type=search]{height:46px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(6,20,27,.5);color:#fff;font:500 16px var(--tx);padding:0 14px;width:100%;box-sizing:border-box;user-select:text;-webkit-user-select:text}`;
document.head.appendChild(css);
const sec=document.createElement('section');sec.id='comm';sec.className='scr';
sec.innerHTML='<div class="side glass"><h3>Comunidade</h3><div class="tabs2"><button data-t="p">Perfil</button><button data-t="s">Procurar</button><button data-t="r">Ranking</button><button data-t="a">Conquistas</button></div><div id="cBody2"></div><button class="btn s ghost" id="cmBack">Voltar</button></div>';
document.body.appendChild(sec);
const body=()=>q('#cBody2');
function tab(t){sec.querySelectorAll('.tabs2 button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));({p:vPerfil,s:vSearch,r:vRank,a:vAch})[t]()}
sec.querySelectorAll('.tabs2 button').forEach(b=>b.onclick=()=>tab(b.dataset.t));
q('#cmBack').onclick=()=>toMenu();
function vPerfil(){const B=body(),u=uid(),nm=AUTH.user.name||AUTH.user.email||'Jogador';AVload(u);const o=AV[u];
  B.innerHTML='<div class="me">'+(o&&o.src?'<img class="big" src="'+o.src+'">':'<div class="big">'+esc(nm.charAt(0).toUpperCase())+'</div>')+'<b style="font-size:18px;color:#fff">'+esc(nm)+'</b><span class="sub">'+esc(AUTH.user.email||'')+'</span>'+
   '<button class="btn" id="pFoto">Escolher foto</button><input id="pFile" type="file" accept="image/*" hidden><p class="sub" id="pMsg2">A foto aparece para os outros jogadores, nas salas e na pesquisa.</p></div>';
  q('#pFoto').onclick=()=>q('#pFile').click();
  q('#pFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;const m=q('#pMsg2');m.textContent='A preparar a foto…';
    try{const d=await toAvatar(f);localStorage.setItem(AVK+u,d);setSrc(u,d);if(online()){await saveProfile({p:d});localStorage.setItem('pm_avs_'+u,String(d.length));m.textContent='Foto guardada. Os outros jogadores já a veem.'}else m.textContent='Foto guardada neste telemóvel. Entra com conta online para os outros a verem.';
      setTimeout(vPerfil,600)}catch(er){m.textContent=er.message||'Não foi possível guardar a foto.'}}}
let st=0;
function vSearch(){const B=body();B.innerHTML='<input type="search" id="sQ" placeholder="Procurar jogador pelo nome" maxlength="20"><div id="sR"></div>';
  q('#sQ').oninput=()=>{clearTimeout(st);st=setTimeout(doSearch,350)};if(!online())q('#sR').innerHTML='<p class="sub">A pesquisa precisa de uma conta online.</p>'}
async function doSearch(){const R=q('#sR');if(!R)return;const t=q('#sQ').value.trim().toLowerCase().replace(/[<>&"\\]/g,'');if(t.length<2){R.innerHTML='<p class="sub">Escreve pelo menos 2 letras.</p>';return}
  if(!online()){R.innerHTML='<p class="sub">A pesquisa precisa de uma conta online.</p>';return}
  R.innerHTML='<p class="sub">A procurar…</p>';
  try{const tk=await AUTH.token();const u=CFG.dbUrl+'/profiles.json?orderBy='+encodeURIComponent('"l"')+'&startAt='+encodeURIComponent('"'+t+'"')+'&endAt='+encodeURIComponent('"'+t+'\uf8ff"')+'&limitToFirst=20&auth='+tk;
    const r=await fetch(u);if(!r.ok)throw Error('x');const o=await r.json()||{};const L=Object.entries(o).filter(([k,v])=>v&&v.n);
    if(!L.length){R.innerHTML='<p class="sub">Nenhum jogador encontrado.</p>';return}
    L.forEach(([k,v])=>{if(v.p&&!AV[k])setSrc(k,v.p)});
    R.innerHTML='';for(const [k,v] of L){const d=document.createElement('div');d.className='li';d.innerHTML='<span class="nm">'+AVH(k,34,v.n)+'<span>'+esc(v.n)+'<small>'+(k===uid()?'és tu':'jogador')+'</small></span></span><i id="sc_'+k+'"></i>';R.appendChild(d);
      DB.get('rank/'+k).then(x=>{const e=document.getElementById('sc_'+k);if(e&&x&&x.s)e.textContent=x.s+' pts'}).catch(()=>{})}
  }catch(e){R.innerHTML='<p class="sub">Não foi possível pesquisar agora.</p>'}}
async function vRank(){const B=body();B.innerHTML='<p class="sub">A carregar…</p>';
  try{if(!online()){B.innerHTML='<p class="sub">A classificação precisa de uma conta online.</p>';return}
    const r=await DB.get('rank')||{};const L=Object.entries(r).filter(([k,v])=>v&&typeof v.s==='number').sort((a,b)=>b[1].s-a[1].s).slice(0,15);
    if(!L.length){B.innerHTML='<p class="sub">Ainda sem pontuações. Foge ou termina a história para entrares.</p>';return}
    B.innerHTML='';L.forEach(([k,v],i)=>{const d=document.createElement('div');d.className='li';d.innerHTML='<span class="nm"><b style="width:26px">'+(i+1)+'.</b>'+AVH(k,32,v.n)+'<span>'+esc(v.n)+'<small>'+(v.m==='story'?'História':'Fuga')+' · dia '+(v.d||'?')+'</small></span></span><i>'+v.s+'</i>';B.appendChild(d)});
    const meIdx=L.findIndex(([k])=>k===uid());if(meIdx>=0)B.insertAdjacentHTML('afterbegin','<p class="sub">Estás em '+(meIdx+1)+'º lugar.</p>')}catch(e){B.innerHTML='<p class="sub">Não foi possível carregar a classificação.</p>'}}
function vAch(){const B=body();const X=window.STX||{ACH:[],getAch:()=>({})},a=X.getAch();
  B.innerHTML=X.ACH.map(([id,n,d])=>'<div class="li'+(a[id]?'':' off')+'"><span>'+(a[id]?'★ ':'☆ ')+esc(n)+'<small>'+esc(d)+'</small></span><i>'+(a[id]?'feito':'')+'</i></div>').join('')}
/* botão no menu (substitui "Conquistas e classificação") */
const old=q('#bMore');if(old){old.textContent='Perfil e jogadores';old.onclick=()=>{showScr('comm');tab('p')}}
window.openComm=t=>{showScr('comm');tab(t||'p')};
/* fotos na lista da sala */
if(typeof friendsPanel==='function'){const _fp=friendsPanel;friendsPanel=function(){_fp.apply(this,arguments);try{const ps=peersList(),B=q('#pB');if(B&&ps.length){B.querySelectorAll('p').forEach(p=>{const b=p.querySelector('b');if(!b)return;const nm=p.textContent.replace(/^●\s*/,'').split(' · ')[0].trim();const pe=ps.find(x=>(x.name||'Amigo')===nm);if(pe&&pe.pu)b.insertAdjacentHTML('beforebegin',AVH(pe.pu,22,nm))})}}catch(e){}}}
})();
