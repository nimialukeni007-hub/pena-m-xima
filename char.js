/* Personagem humanoide com esqueleto procedural: caminhar, correr, respirar, soco, queda */
const CSKIN=['#f1c9a5','#d9a47c','#b57a52','#8a5636','#6b3f26','#4a2a18'];
const HAIRC=['#0d0a08','#2b1b12','#5a3a20','#b88a45','#8a8a8a','#c43b3b'];
const CHAIR=[['bald','Careca',0],['short','Curto',0],['afro','Afro',0],['tranca','Tranças',1],['coque','Coque',1]];
const SETS=[['pris','Prisional laranja',0,'#d9741c','#d9741c'],['guard','Guarda',0,'#27406e','#1c2c4a'],['white','Branco simples',0,'#e8e6e0','#3d5a8a'],['ouro','Pack Ouro',1,'#d7b25a','#3b2a14'],['neon','Pack Neon',1,'#d8409a','#2a1f4d'],['preto','Pack Preto',1,'#1d1d22','#1d1d22']];
SETS.push(['civil','Civil casual',1,'#e7e4dc','#32507f'],['corvos','Traje dos Corvos',1,'#101012','#1b1b1f'],['serp','Traje das Serpentes',1,'#1f7a45','#242b27'],['farda','Farda de guarda',1,'#233459','#16203a'],['fato','Fato do Responsável',1,'#0f0f12','#101013'],['choque','Polícia de choque',1,'#16203a','#141b30']);
const SETINFO={preto:{usd:1,perk:'De noite os guardas veem-te 25% menos; de dia desconfiam 15% mais.'},civil:{usd:1,perk:'Só estilo, sem vantagem.'},neon:{usd:2,perk:'Cantina 8% mais barata, mas a suspeita sobe 10% mais depressa.'},corvos:{usd:2,group:'corvos',perk:'Suspeita sobe 15% mais devagar. Os rivais atacam-te mais.'},serp:{usd:2,group:'serpentes',perk:'Suspeita sobe 15% mais devagar. Os rivais atacam-te mais.'},farda:{usd:2,perk:'Suspeita sobe 25% mais devagar. Se o alarme tocar, ganhas +1 dia de pena.'},ouro:{usd:3,perk:'Cantina 12% mais barata, mas os rivais atacam-te mais.'},fato:{usd:3,perk:'Cantina 20% mais barata, mas a suspeita sobe 10% mais depressa.'},choque:{usd:3,perk:'Levas 15% menos dano, mas corres 7% mais devagar.'}};
function lookStr(l){return [l.skin,l.hair,l.hairc,l.set,Math.round((l.build||1)*100),Math.round((l.height||1)*100),(l.acc||[]).join('+')].join(',')}
function lookFromStr(t){if(typeof t!=='string')return null;const a=t.split(',');if(a.length<7)return null;const n=(i,d,m)=>{const v=parseInt(a[i]);return isFinite(v)?Math.max(0,Math.min(m,v)):d};const l=defaultLook();l.skin=n(0,1,CSKIN.length-1);l.hair=n(1,1,CHAIR.length-1);l.hairc=n(2,0,HAIRC.length-1);l.set=n(3,0,SETS.length-1);l.build=Math.max(.8,Math.min(1.25,n(4,100,200)/100));l.height=Math.max(.85,Math.min(1.2,n(5,100,200)/100));l.acc=a[6]?a[6].split('+').filter(x=>ACCS.some(q=>q[0]===x)):[];return l}
const ACCS=[['oculos','Óculos escuros',1],['bone','Boné',1],['corrente','Corrente de ouro',1]];
const defaultLook=()=>({skin:1,hair:1,hairc:0,set:0,build:1,height:1,acc:[],beard:0});
const hex=h=>[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255];
function look2cols(l){const s=SETS[l.set]||SETS[0];return{skin:hex(CSKIN[l.skin]),hair:hex(HAIRC[l.hairc]),top:hex(s[3]),pants:hex(s[4]),shoe:[.08,.07,.07]}}
class Char{
constructor(look,name){this.name=name||'';this.x=0;this.z=0;this.yaw=0;this.ph=0;this.sp=0;this.punch=0;this.dead=0;this.hp=100;this.fall=0;this.stun=0;this.setLook(look)}
setLook(l){this.look=l;this.c=look2cols(l)}
pose(dt,speed){this.sp+=(speed-this.sp)*Math.min(1,dt*9);this.ph+=this.sp*dt*(2.7/Math.max(.7,this.look.height));if(this.punch>0)this.punch=Math.max(0,this.punch-dt*3.2);if(this.dead)this.fall=Math.min(1,this.fall+dt*2.2)}
draw(g,tint){
const l=this.look,c=this.c,S=l.height,b=l.build,t=performance.now()/1000;
const sw=Math.sin(this.ph),sw2=Math.sin(this.ph+Math.PI),run=Math.min(1,this.sp/4.2),a=Math.min(1,this.sp/1.2),br=Math.sin(t*1.8)*.012*(1-a);
const bob=Math.abs(Math.sin(this.ph))*.045*a*S,pk=this.punch>0?Math.sin(this.punch*Math.PI):0;
const col=k=>tint?[k[0]*tint,k[1]*tint,k[2]*tint]:k;
const D=(mesh,m,c2,o)=>{g.draw(mesh,m,Object.assign({col:col(c2),spec:.05,toon:1},o||{}));if(!this._sh&&!(o&&o.noOut))g.draw(mesh,m,{col:[0,0,0],out:.011*S*(this.big||1)})};
let root=M.mul(M.T(this.x,0,this.z),M.RY(this.yaw));
if(this.fall>0)root=M.mul(root,M.mul(M.T(0,.14*this.fall,-.3*this.fall),M.RX(-1.5*this.fall)));
const hip=.92*S,leg=.46*S,sh=.44*S,tor=.56*S,ua=.3*S,fa=.28*S;
const pel=M.mul(root,M.T(0,hip+bob,0));
const torso=M.mul(pel,M.mul(M.RX(-.05*run),M.RY(pk*.55)));
for(const sd of[-1,1]){const s=sd>0?sw:sw2,kn=Math.max(0,-s)*(.5+run*.9)*a+.04;
const hm=M.mul(pel,M.mul(M.T(sd*.095*b*S,0,0),M.RX(s*(.5+run*.45)*a)));
const km=M.mul(hm,M.mul(M.T(0,-leg,0),M.RX(kn)));
D(g.limb,M.mul(hm,M.S(.078*b*S,leg,.078*b*S)),c.pants);D(g.limb,M.mul(km,M.S(.064*b*S,sh,.064*b*S)),c.pants);D(g.sph,M.mul(km,M.S(.07*S,.07*S,.07*S)),c.pants);
const fm=M.mul(km,M.mul(M.T(0,-sh-.02*S,.04*S),M.RX(-.1*s*a)));D(g.cube,M.mul(fm,M.S(.1*S,.07*S,.26*S)),c.shoe,{spec:.25})}
D(g.sph,M.mul(torso,M.mul(M.T(0,.1*S,0),M.S(.15*b*S,.13*S,.11*b*S))),c.pants);
D(g.limb,M.mul(torso,M.mul(M.T(0,tor+br,0),M.S(.205*b*S,tor,.12*b*S))),c.top);
D(g.sph,M.mul(torso,M.mul(M.T(0,tor*.8,0),M.S(.205*b*S,.17*S,.125*b*S))),c.top);
const chest=M.mul(torso,M.T(0,tor+br,0));
for(const sd of[-1,1]){const ps=sd>0?pk:0,s=(sd>0?sw2:sw)*(.5+run*.5)*a;
const sm=M.mul(chest,M.mul(M.T(sd*.225*b*S,-.04*S,0),M.mul(M.RX(s-ps*1.75),M.RZ(sd*(.09+ps*.15)))));
const el=M.mul(sm,M.mul(M.T(0,-ua,0),M.RX(-.25-run*.9*a-ps*.2)));
D(g.sph,M.mul(sm,M.S(.07*S,.07*S,.07*S)),c.top);D(g.limb,M.mul(sm,M.S(.06*b*S,ua,.06*b*S)),c.top);D(g.limb,M.mul(el,M.S(.052*b*S,fa,.052*b*S)),c.skin);D(g.sph,M.mul(M.mul(el,M.T(0,-fa,0)),M.S(.056*S,.062*S,.056*S)),c.skin);{const hh2=M.mul(el,M.T(0,-fa,0));D(g.sph,M.mul(hh2,M.mul(M.T(0,-.045*S,.004*S),M.S(.05*S,.05*S,.034*S))),c.skin);D(g.limb,M.mul(hh2,M.mul(M.T(-sd*.04*S,-.01*S,.01*S),M.mul(M.RZ(sd*.7),M.S(.016*S,.045*S,.016*S)))),c.skin,{noOut:1})}
if(sd>0&&this.hand)this.hand(g,M.mul(el,M.T(0,-fa-.05,0)))}
const nk=M.mul(chest,M.T(0,.02*S,0));D(g.limb,M.mul(nk,M.S(.046*S,.09*S,.046*S)),c.skin);
const hd=M.mul(M.mul(nk,M.mul(M.T(0,.09*S+.15*S,0),M.RY(-pk*.3))),M.S(1.3,1.3,1.3));
D(g.sph,M.mul(hd,M.S(.1*S,.125*S,.11*S)),c.skin,{spec:.12});
for(const sd of[-1,1]){D(g.sph,M.mul(hd,M.mul(M.T(sd*.045*S,.02*S,.092*S),M.S(.03*S,.034*S,.02*S))),[.97,.97,.95],{noOut:1});D(g.sph,M.mul(hd,M.mul(M.T(sd*.045*S,.018*S,.108*S),M.S(.014*S,.018*S,.01*S))),[.03,.02,.02],{noOut:1});D(g.sph,M.mul(hd,M.mul(M.T(sd*.105*S,0,0),M.S(.018*S,.03*S,.02*S))),c.skin)}
D(g.sph,M.mul(hd,M.mul(M.T(0,-.01*S,.107*S),M.S(.016*S,.02*S,.014*S))),c.skin.map(v=>v*.88));
const hs=CHAIR[l.hair][0],cap=M.mul(hd,M.mul(M.T(0,.035*S,-.006*S),M.S(.108*S,.12*S,.115*S)));
if(hs=='short'||hs=='tranca'||hs=='coque')D(g.sph,cap,c.hair);
if(hs=='afro')D(g.sph,M.mul(hd,M.mul(M.T(0,.05*S,-.01*S),M.S(.15*S,.15*S,.15*S))),c.hair);
if(hs=='coque')D(g.sph,M.mul(hd,M.mul(M.T(0,.15*S,-.03*S),M.S(.055*S,.055*S,.055*S))),c.hair);
if(hs=='tranca')for(let i=-3;i<=3;i++)D(g.limb,M.mul(hd,M.mul(M.T(i*.03*S,0,-.085*S),M.mul(M.RX(.08+Math.sin(this.ph+i)*.05*a),M.S(.014*S,.22*S,.014*S)))),c.hair);
const bd=l.beard||0;
if(bd==2)D(g.sph,M.mul(hd,M.mul(M.T(0,-.058*S,.036*S),M.S(.1*S,.086*S,.09*S))),c.hair);
if(bd==1)D(g.sph,M.mul(hd,M.mul(M.T(0,-.052*S,.03*S),M.S(.099*S,.08*S,.092*S))),c.skin.map((v,i)=>v*.55+c.hair[i]*.45),{noOut:1});
if(bd==3||bd==4)D(g.sph,M.mul(hd,M.mul(M.T(0,-.032*S,.104*S),M.S(.05*S,.013*S,.02*S))),c.hair,{noOut:1});
if(bd==3)D(g.sph,M.mul(hd,M.mul(M.T(0,-.09*S,.085*S),M.S(.028*S,.036*S,.03*S))),c.hair,{noOut:1});
if(l.acc.includes('oculos'))D(g.cube,M.mul(hd,M.mul(M.T(0,.017*S,.1*S),M.S(.2*S,.036*S,.02*S))),[.02,.02,.025],{spec:.9});
if(l.acc.includes('bone')){D(g.cyl,M.mul(hd,M.mul(M.T(0,.1*S,0),M.S(.112*S,.06*S,.12*S))),[.1,.1,.14]);D(g.cube,M.mul(hd,M.mul(M.T(0,.075*S,.115*S),M.S(.12*S,.012*S,.09*S))),[.1,.1,.14])}
if(l.acc.includes('corrente'))for(let i=0;i<12;i++){const an=i/12*Math.PI*2;D(g.sph,M.mul(chest,M.mul(M.T(Math.cos(an)*.09*b*S,Math.sin(an)*.02*S-.04*S,(.1*Math.abs(Math.sin(an))+.03)*S),M.S(.011*S,.011*S,.011*S))),[.95,.75,.25],{spec:.9,em:.2})}
}
/* sombra projetada no chão: mesmo desenho, achatado segundo a direção do sol */
drawShadow(g){this._sh=1;const s=g.env.sun,m=M.id();m[4]=-s[0]/s[1];m[5]=0;m[6]=-s[2]/s[1];m[13]=.015;const keep=g.draw;g.draw=(mesh,mat,o)=>keep.call(g,mesh,M.mul(m,mat),{col:[0,0,0],a:.38,spec:0});this.draw(g);g.draw=keep;this._sh=0}
}
