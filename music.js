/* Música de fundo: só no menu (depois do login), repete sempre e para quando o jogo começa. */
(function(){
const q=s=>document.querySelector(s);
const a=new Audio('musica.mp3?v=2');a.loop=true;a.preload='auto';a.volume=0;
let pref=true;try{pref=localStorage.getItem('pm_music')!=='0'}catch(e){}
let started=false,tgt=0;
const onLogin=()=>{const l=q('#login');return !l||l.classList.contains('on')};
const inMenu=()=>!!q('.scr.on')&&!document.body.classList.contains('ingame')&&!(window.G&&G.started);
const vol=()=>!pref||onLogin()||!inMenu()||document.hidden?0:(document.body.classList.contains('ingame')?0:.38);
function tick(){const v=vol();
  if(v>0&&a.paused){a.play().then(()=>{started=true}).catch(()=>{})}
  a.volume=a.volume+(v-a.volume)*.25;if(Math.abs(a.volume-v)<.01)a.volume=v;
  if(v===0&&a.volume===0&&!a.paused)a.pause()}
setInterval(tick,250);
['pointerdown','keydown','touchend'].forEach(ev=>addEventListener(ev,()=>{if(vol()>0&&a.paused)a.play().catch(()=>{})},{passive:true}));
document.addEventListener('visibilitychange',tick);
const mn=q('#menu .side');
if(mn){const b=document.createElement('button');b.type='button';b.className='lglk';b.id='bMusic';const up=()=>{b.textContent='Música: '+(pref?'ligada':'desligada')};up();
  b.onclick=()=>{pref=!pref;try{localStorage.setItem('pm_music',pref?'1':'0')}catch(e){}up();tick()};mn.appendChild(b)}
})();
