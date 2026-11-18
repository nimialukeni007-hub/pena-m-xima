/* Aviso legal: termos, privacidade, armazenamento local, consentimento, apagar conta, acessibilidade. */
(function(){
const q=s=>document.querySelector(s);
const VER='2026-11';
const css=document.createElement('style');
css.textContent=`#legal{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(3,6,12,.9);padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom));font-family:var(--tx,system-ui)}#legal.on{display:flex}
#legal .lc{width:min(560px,100%);max-height:100%;display:flex;flex-direction:column;border-radius:22px;background:linear-gradient(165deg,#18253a,#0b121e);border:1px solid rgba(160,200,255,.22);color:#e6edf5;overflow:hidden}
#legal .lb{overflow-y:auto;padding:18px 20px;font-size:14px;line-height:1.55;-webkit-overflow-scrolling:touch}#legal h3{margin:0 0 4px;font-size:20px;color:#fff}#legal h4{margin:16px 0 4px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8fc0ff}#legal p{margin:4px 0}#legal a{color:#ffcf8a}
#legal .lf{display:flex;gap:8px;flex-wrap:wrap;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid rgba(255,255,255,.1)}#legal .lf button{flex:1;min-height:46px;min-width:120px;border:0;border-radius:13px;background:#4f9bff;color:#fff;font:700 14px var(--tx,system-ui);cursor:pointer}#legal .lf button.g{background:rgba(255,255,255,.12)}#legal .lf button.d{background:#c23b45}
.lglk{display:block;text-align:center;margin:10px auto 0;color:#9fb0c3;font:600 12px var(--tx,system-ui);background:none;border:0;text-decoration:underline;cursor:pointer;min-height:36px}
:focus-visible{outline:3px solid #ffcf8a;outline-offset:2px}@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}`;
document.head.appendChild(css);
const wa=(CFG.whatsapp||'244929966303');
const TXT=`<h3>Termos, Privacidade e Segurança</h3><p style="color:#93a4b8">Versão ${VER}. Pena Máxima é um jogo de ficção. Qualquer semelhança com pessoas ou instituições reais é coincidência.</p>
<h4>Quem somos</h4><p>Pena Máxima é desenvolvido e operado por Arão Lende Web Design, Luanda, Angola. Contacto para qualquer questão, pedido de dados ou denúncia: <a href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp ${wa}</a>.</p>
<h4>Que dados recolhemos</h4><p>Email e nome da conta, foto de perfil (opcional), pontuações do ranking, lista de amigos, mensagens entre amigos, pedidos de compra (item, valor, referência) e a data da última atividade. Não pedimos dados bancários: o pagamento é feito por Express ou PayPay e confirmado manualmente. Não vendemos dados a ninguém.</p>
<h4>Para que usamos</h4><p>Para a conta e o progresso, o modo online, o ranking, amigos e mensagens, confirmar compras e manter o jogo seguro. A base legal é a execução do serviço que pediste e o teu consentimento.</p>
<h4>Armazenamento no teu dispositivo</h4><p>O jogo guarda no teu telemóvel o progresso, a sessão, definições e fotos. Não usamos cookies de publicidade nem de rastreio. Os anúncios mostrados são de parceiros locais e não recolhem dados teus através do jogo. Ao abrir ligações de parceiros sais do jogo e aplica-se a política deles.</p>
<h4>Serviços de terceiros</h4><p>Google Firebase (contas e base de dados em tempo real) e, se usares, Entrar com Google. Chamadas de voz usam ligação direta entre jogadores, com servidores de apoio (STUN/TURN) apenas para estabelecer a ligação; a voz não é gravada por nós.</p>
<h4>Os teus direitos</h4><p>Podes aceder, corrigir ou apagar os teus dados. Em Termos, usa "Apagar a minha conta" para remover a conta, o perfil, o ranking e as ligações de amizade. Também podes pedir ajuda pelo WhatsApp. Aplicam-se os direitos previstos na Lei n.º 22/11 de Angola (Proteção de Dados Pessoais) e, quando aplicável, no RGPD.</p>
<h4>Idade</h4><p>O jogo contém violência fictícia e linguagem de prisão. Recomendado para maiores de 16 anos. Menores devem ter autorização de um responsável.</p>
<h4>Regras de conduta</h4><p>Não uses o jogo para assediar, ameaçar, partilhar conteúdo ilegal, enganar jogadores ou tentar aceder a contas e dados de outros. Contas que o façam podem ser removidas. Mensagens só são possíveis entre amigos.</p>
<h4>Compras, gift cards e reembolsos</h4><p>Os preços são mostrados em dólares e em Kz. Itens digitais são ativados depois de confirmarmos o pagamento. Gift cards têm um código único de uso único; depois de resgatado não pode ser devolvido nem trocado. Se pagaste e o item não foi ativado em 48 horas, ou foi cobrado em duplicado, contacta-nos com a referência para reembolso. O Passe Premium dura 30 dias e não renova sozinho.</p>
<h4>Propriedade intelectual</h4><p>O jogo, os gráficos, os sons e o código são da Arão Lende Web Design. Os nomes das personagens são fictícios. Marcas de parceiros pertencem aos respetivos donos.</p>
<h4>Segurança</h4><p>As ligações usam HTTPS. As senhas são geridas pelo Google Firebase (nunca guardadas em texto por nós). Há bloqueio temporário após tentativas falhadas, regras de acesso na base de dados por conta, limites de tamanho e de frequência, e proteção contra injeção de código nas mensagens e nomes. Nenhum sistema é totalmente imune: usa uma senha única e forte, não partilhes o teu código de gift card e denuncia qualquer abuso.</p>
<h4>Responsabilidade e alterações</h4><p>O serviço é oferecido como está e pode ter interrupções. Podemos atualizar estes termos; quando mudarem de forma relevante pedimos nova aceitação.</p>`;
const box=document.createElement('div');box.id='legal';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Termos e privacidade');
box.innerHTML='<div class="lc"><div class="lb">'+TXT+'</div><div class="lf" id="lF"></div></div>';document.body.appendChild(box);
const F=q('#lF');
const accepted=()=>{try{return localStorage.getItem('pm_terms')===VER}catch(e){return true}};
function gate(){F.innerHTML='<button id="lOk">Aceitar e continuar</button>';box.classList.add('on');q('#lOk').onclick=()=>{try{localStorage.setItem('pm_terms',VER)}catch(e){}box.classList.remove('on')}}
function info(){const on=(window.AUTH&&AUTH.user&&!AUTH.user.local&&AUTH.live());F.innerHTML='<button class="g" id="lCl">Fechar</button>'+(on?'<button class="d" id="lDel">Apagar a minha conta</button>':'');box.classList.add('on');q('#lCl').onclick=()=>box.classList.remove('on');
  const d=q('#lDel');if(d)d.onclick=()=>{d.textContent='Toca de novo para confirmar';d.onclick=wipe}}
async function wipe(){const d=q('#lDel');d.disabled=true;d.textContent='A apagar…';
  try{const u=AUTH.user.uid;try{const f=(await DB.get('box/'+u+'/f'))||{};const o={};for(const k in f){o['box/'+u+'/f/'+k]=null;o['box/'+k+'/f/'+u]=null}if(Object.keys(o).length)await DB.f('','PATCH',o)}catch(e){}
    try{await DB.set('profiles/'+u,null)}catch(e){}try{await DB.set('rank/'+u,null)}catch(e){}
    await AUTH.call('accounts:delete',{idToken:await AUTH.token()});
    try{Object.keys(localStorage).filter(k=>/^pm_/.test(k)&&k!=='pm_terms').forEach(k=>localStorage.removeItem(k))}catch(e){}
    AUTH.logout();location.reload()}
  catch(e){d.disabled=false;d.textContent='Falhou. Sai e entra de novo, depois tenta outra vez.'}}
window.openLegal=info;
/* ligações */
const lg=q('#login .gcard');if(lg){const b=document.createElement('button');b.type='button';b.className='lglk';b.textContent='Termos, privacidade e segurança';b.onclick=info;lg.appendChild(b)}
const mn=q('#menu .side');if(mn){const b=document.createElement('button');b.type='button';b.className='lglk';b.textContent='Termos, privacidade e apagar conta';b.onclick=info;mn.appendChild(b)}
if(!accepted())gate();
/* o login só avança com os termos aceites */
const go=q('#go'),gg=q('#gg');[go,gg].forEach(b=>{if(b)b.addEventListener('click',e=>{if(!accepted()){e.stopImmediatePropagation();e.preventDefault();gate()}},true)});
})();
