/* Verificação do email: a conta só entra no jogo depois de provar que o email é do dono. */
(function(){
const q=s=>document.querySelector(s);
const BAD=/@(mailinator|guerrillamail|10minutemail|tempmail|temp-mail|yopmail|trashmail|sharklasers|getnada|dispostable|maildrop|throwawaymail|fakeinbox|mintemail|mohmal|emailondeck|moakt|burnermail|spamgourmet)\./i;
/* bloquear emails descartáveis ao criar conta */
const _reg=AUTH.register;AUTH.register=function(email){if(BAD.test(String(email)))return Promise.reject(Error('Este tipo de email não é aceite. Usa o teu Gmail ou outro email pessoal.'));return _reg.apply(AUTH,arguments).then(u=>{try{if(AUTH.user&&AUTH.user.uid)sessionStorage.setItem('pm_vsent_'+AUTH.user.uid,'1')}catch(e){}return u})};
const css=document.createElement('style');
css.textContent=`#vf{position:fixed;inset:0;z-index:220;display:none;align-items:center;justify-content:center;background:rgba(3,6,12,.94);padding:16px;font-family:var(--tx,system-ui)}#vf.on{display:flex}#vf .vc{width:min(440px,100%);border-radius:22px;background:linear-gradient(165deg,#18253a,#0b121e);border:1px solid rgba(160,200,255,.22);color:#e6edf5;padding:22px;display:flex;flex-direction:column;gap:12px}#vf h3{margin:0;font-size:22px;color:#fff}#vf p{margin:0;font-size:14px;line-height:1.5;color:#b9c7d8}#vf b{color:#ffcf8a;overflow-wrap:anywhere}#vf button{min-height:48px;border:0;border-radius:13px;background:#4f9bff;color:#fff;font:700 15px var(--tx,system-ui);cursor:pointer}#vf button.g{background:rgba(255,255,255,.12)}#vf button:disabled{opacity:.5}#vm{min-height:18px;font-size:13px}`;
document.head.appendChild(css);
const box=document.createElement('div');box.id='vf';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
box.innerHTML='<div class="vc"><h3>Confirma o teu email</h3><p>Enviámos uma mensagem para <b id="vE"></b> com um link de confirmação. Abre o email, toca no link e volta aqui. Isto prova que o email é mesmo teu.</p><p>Não vês o email? Procura no spam.</p><button id="vOk">Já confirmei</button><button class="g" id="vRe">Reenviar email</button><button class="g" id="vOut">Sair</button><p id="vm"></p></div>';
document.body.appendChild(box);
let cool=0,tm=0;
const msg=(t,ok)=>{const m=q('#vm');m.textContent=t;m.style.color=ok?'#9fe3a0':'#ff9c9c'};
async function verified(){const j=await AUTH.call('accounts:lookup',{idToken:await AUTH.token()});return !!(j.users&&j.users[0]&&j.users[0].emailVerified)}
async function send(){const b=q('#vRe');b.disabled=true;
  try{await AUTH.call('accounts:sendOobCode',{requestType:'VERIFY_EMAIL',idToken:await AUTH.token()});msg('Email enviado. Pode demorar um minuto.',true)}catch(e){msg(/Demasiadas/.test(String(e&&e.message))?'O email já foi enviado há pouco. Procura na caixa de entrada e no spam e espera uns minutos antes de reenviar.':'Não foi possível enviar agora. Tenta daqui a pouco.')}
  cool=60;clearInterval(tm);tm=setInterval(()=>{cool--;b.textContent=cool>0?'Reenviar email ('+cool+')':'Reenviar email';if(cool<=0){clearInterval(tm);b.disabled=false}},1000)}
q('#vRe').onclick=send;
q('#vOut').onclick=()=>{try{AUTH.logout()}catch(e){}location.reload()};
q('#vOk').onclick=async()=>{const b=q('#vOk');b.disabled=true;msg('A verificar…',true);
  try{if(await verified()){AUTH.user.exp=0;await AUTH.token();location.reload()}else{msg('Ainda não está confirmado. Abre o link no email primeiro.')}}catch(e){msg('Não foi possível verificar agora.')}b.disabled=false};
async function check(){if(!AUTH.live()||!AUTH.user||AUTH.user.local)return true;
  try{if(await verified()){return true}}catch(e){return true}
  q('#vE').textContent=AUTH.user.email;box.classList.add('on');if(!sessionStorage.getItem('pm_vsent_'+AUTH.user.uid)){try{sessionStorage.setItem('pm_vsent_'+AUTH.user.uid,'1')}catch(e){}send()}return false}
const _al=afterLogin;afterLogin=async function(){if(!(await check()))return;return _al.apply(this,arguments)};
})();
