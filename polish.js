'use strict';
/* Acabamento: HUD sem sobreposições no telemóvel + tutorial curto na primeira partida */
(()=>{
const st=document.createElement('style');st.textContent='#hHint{white-space:normal!important;line-height:1.25;overflow:hidden}#hR .card{max-width:46vw}';document.head.appendChild(st);
function fit(){try{const hR=document.getElementById('hR'),bU=document.getElementById('bU'),bH=document.getElementById('bH'),hint=document.getElementById('hHint'),hL=document.getElementById('hL');
  if(!hR||!bU)return;const r=hR.getBoundingClientRect();if(r.height<10)return;const S=(e,k,v)=>e&&e.style.setProperty(k,v,'important');
  if(innerHeight<=430){ /* paisagem: USAR/MÃO ao lado esquerdo do painel direito */
    const rt=Math.round(innerWidth-r.left+8);S(bU,'right',rt+'px');S(bU,'top',Math.round(r.top+4)+'px');
    if(bH){S(bH,'right',(rt+bU.offsetWidth+8)+'px');S(bH,'top',Math.round(r.top+4)+'px')}}
  else{S(bU,'right','14px');S(bU,'top',Math.round(r.bottom+8)+'px');if(bH){S(bH,'right','14px');S(bH,'top',Math.round(r.bottom+8+bU.offsetHeight+6)+'px')}}
  if(hint&&hL&&innerWidth<900&&innerHeight>430){const l=hL.getBoundingClientRect();S(hint,'left','12px');S(hint,'transform','none');S(hint,'text-align','left');S(hint,'top',Math.round(l.bottom+8)+'px');S(hint,'max-width',Math.max(140,Math.round(r.left-24))+'px')}}catch(e){}}
setInterval(fit,600);addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,300));
/* tutorial */
const KEY='pm_tut1',STEPS=[
 ['Bem-vindo à Pena Máxima','<p>Estás preso. O objetivo: sobreviver, ganhar respeito e, se conseguires, fugir.</p><p>Vamos ver o essencial em 30 segundos.</p>'],
 ['Mover e olhar','<p><b>Lado esquerdo do ecrã:</b> andar.<br><b>Lado direito:</b> arrasta para olhar à volta.<br><b>CORRER</b> gasta energia.</p>'],
 ['Agir','<p><b>AÇÃO</b> abre portas, fala com pessoas e apanha coisas.<br><b>SOCO</b> e <b>CHUTE</b> servem para lutar. Cuidado: bater perto de guardas sobe a SUSPEITA.<br><b>USAR</b> e <b>MÃO</b> usam o item que levas.</p>'],
 ['Sobreviver','<p>Vigia <b>VIDA</b>, <b>ENERGIA</b> e <b>COMIDA</b>. Come na cantina e dorme na cela.<br>Os presos têm vontade própria: alguns ajudam, outros roubam ou pedem protecção. Escolhe bem com quem falas.</p>']];
function show(i){if(i>=STEPS.length){try{localStorage.setItem(KEY,'1')}catch(e){}return}
  if(typeof openPanel!=='function')return;
  openPanel(STEPS[i][0],STEPS[i][1],[{t:i<STEPS.length-1?'Seguinte':'Começar',f:()=>{closePanel();setTimeout(()=>show(i+1),250)}},{t:'Saltar tutorial',f:()=>{closePanel();try{localStorage.setItem(KEY,'1')}catch(e){}}}])}
if(typeof begin==='function'){const _b=begin;begin=function(){const r=_b.apply(this,arguments);let seen=0;try{seen=localStorage.getItem(KEY)}catch(e){}
  if(!seen)setTimeout(()=>{if(typeof panelOpen==='undefined'||!panelOpen)show(0)},2200);setTimeout(fit,500);return r}}
/* menu: qualidade + rever tutorial */
const QN={auto:'Auto',low:'Baixa',mid:'Média',high:'Alta'},QO=['auto','low','mid','high'];
if(typeof menuPanel==='function'){const _m=menuPanel;menuPanel=function(){_m.apply(this,arguments);
  try{const q=window.PMQ?PMQ.get():'auto';
   openPanel('Menu',null,[{t:'Inventário',f:invPanel},{t:'Missões',f:missionPanel},{t:'Estado',f:statusPanel},{t:'Como jogar',f:helpPanel},
    {t:'Qualidade gráfica: '+QN[q],f:()=>{PMQ.set(QO[(QO.indexOf(q)+1)%4]);menuPanel()}},
    {t:'Rever tutorial',f:()=>{closePanel();setTimeout(()=>show(0),250)}},
    {t:muted?'Ligar som':'Desligar som',f:()=>{muted=!muted;menuPanel()}},
    {t:'Guardar e sair para o ecrã inicial',f:()=>{saveGame();closePanel();showTitle()}},
    {t:'Continuar',f:closePanel}])}catch(e){}}}
/* registo de erros (últimos 30, local) */
const LOG=[];function lg(m){LOG.push(new Date().toISOString().slice(11,19)+' '+String(m).slice(0,160));if(LOG.length>30)LOG.shift();try{localStorage.setItem('pm_log',JSON.stringify(LOG))}catch(e){}}
addEventListener('error',e=>lg(e.message+' @'+(e.filename||'').split('/').pop()+':'+e.lineno));addEventListener('unhandledrejection',e=>lg('promise '+(e.reason&&e.reason.message||e.reason)));
window.PMLOG=()=>LOG.slice();
window.PMTUT={reset:()=>{try{localStorage.removeItem(KEY)}catch(e){}},fit};
})();
