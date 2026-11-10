/* Personagem humanoide com esqueleto procedural: caminhar, correr, respirar, soco, queda */
const SKINS=['#f1c9a5','#d9a47c','#b57a52','#8a5636','#6b3f26','#4a2a18'];
const HAIRC=['#0d0a08','#2b1b12','#5a3a20','#b88a45','#8a8a8a','#c43b3b'];
const HAIRS=[['bald','Careca',0],['short','Curto',0],['afro','Afro',0],['tranca','Tranças',1],['coque','Coque',1]];
const SETS=[['pris','Prisional laranja',0,'#d9741c','#d9741c'],['guard','Guarda',0,'#27406e','#1c2c4a'],['white','Branco simples',0,'#e8e6e0','#3d5a8a'],['ouro','Pack Ouro',1,'#d7b25a','#3b2a14'],['neon','Pack Neon',1,'#d8409a','#2a1f4d'],['preto','Pack Preto',1,'#1d1d22','#1d1d22']];
const ACCS=[['oculos','Óculos escuros',1],['bone','Boné',1],['corrente','Corrente de ouro',1]];
const defaultLook=()=>({skin:1,hair:1,hairc:0,set:0,build:1,height:1,acc:[]});
const hex=h=>[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255];
function look2cols(l){const s=SETS[l.set]||SETS[0];return{skin:hex(SKINS[l.skin]),hair:hex(HAIRC[l.hairc]),top:hex(s[3]),pants:hex(s[4]),shoe:[.08,.07,.07]}}
class Char{
constructor(look,name){this.name=name||'';this.x=0;this.z=0;this.yaw=0;this.ph=0;this.sp=0;this.punch=0;this.dead=0;this.hp=100;this.fall=0;this.stun=0;this.setLook(look)}
setLook(l){this.look=l;this.c=look2cols(l)}
pose(dt,speed){this.sp+=(speed-this.sp)*Math.min(1,dt*9);this.ph+=this.sp*dt*(2.7/Math.max(.7,this.look.height));if(this.punch>0)this.punch=Math.max(0,this.punch-dt*3.2);if(this.dead)this.fall=Math.min(1,this.fall+dt*2.2)}
draw(g,tint){
const l=this.look,c=this.c,S=l.height,b=l.build,t=performance.now()/1000;
const sw=Math.sin(this.ph),sw2=Math.sin(this.ph+Math.PI),run=Math.min(1,this.sp/4.2),a=Math.min(1,this.sp/1.2),br=Math.sin(t*1.8)*.012*(1-a);
const bob=Math.abs(Math.sin(this.ph))*.045*a*S,pk=this.punch>0?Math.sin(this.punch*Math.PI):0;
const col=k=>tint?[k[0]*tint,k[1]*tint,k[2]*tint]:k;
const D=(mesh,m,c2,o)=>g.draw(mesh,m,Object.assign({col:col(c2),spec:.05},o||{}));
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
D(g.sph,M.mul(sm,M.S(.07*S,.07*S,.07*S)),c.top);D(g.limb,M.mul(sm,M.S(.06*b*S,ua,.06*b*S)),c.top);D(g.limb,M.mul(el,M.S(.052*b*S,fa,.052*b*S)),c.skin);D(g.sph,M.mul(M.mul(el,M.T(0,-fa,0)),M.S(.056*S,.062*S,.056*S)),c.skin);
if(sd>0&&this.hand)this.hand(g,M.mul(el,M.T(0,-fa-.05,0)))}
const nk=M.mul(chest,M.T(0,.02*S,0));D(g.limb,M.mul(nk,M.S(.046*S,.09*S,.046*S)),c.skin);
const hd=M.mul(nk,M.mul(M.T(0,.09*S+.12*S,0),M.RY(-pk*.3)));
D(g.sph,M.mul(hd,M.S(.1*S,.125*S,.11*S)),c.skin,{spec:.12});
for(const sd of[-1,1]){D(g.sph,M.mul(hd,M.mul(M.T(sd*.042*S,.015*S,.1*S),M.S(.016*S,.016*S,.012*S))),[.04,.03,.03]);D(g.sph,M.mul(hd,M.mul(M.T(sd*.105*S,0,0),M.S(.018*S,.03*S,.02*S))),c.skin)}
D(g.sph,M.mul(hd,M.mul(M.T(0,-.01*S,.107*S),M.S(.016*S,.02*S,.014*S))),c.skin.map(v=>v*.88));
const hs=HAIRS[l.hair][0],cap=M.mul(hd,M.mul(M.T(0,.035*S,-.006*S),M.S(.108*S,.12*S,.115*S)));
if(hs=='short'||hs=='tranca'||hs=='coque')D(g.sph,cap,c.hair);
if(hs=='afro')D(g.sph,M.mul(hd,M.mul(M.T(0,.05*S,-.01*S),M.S(.15*S,.15*S,.15*S))),c.hair);
if(hs=='coque')D(g.sph,M.mul(hd,M.mul(M.T(0,.15*S,-.03*S),M.S(.055*S,.055*S,.055*S))),c.hair);
if(hs=='tranca')for(let i=-3;i<=3;i++)D(g.limb,M.mul(hd,M.mul(M.T(i*.03*S,0,-.085*S),M.mul(M.RX(.08+Math.sin(this.ph+i)*.05*a),M.S(.014*S,.22*S,.014*S)))),c.hair);
if(l.acc.includes('oculos'))D(g.cube,M.mul(hd,M.mul(M.T(0,.017*S,.1*S),M.S(.2*S,.036*S,.02*S))),[.02,.02,.025],{spec:.9});
if(l.acc.includes('bone')){D(g.cyl,M.mul(hd,M.mul(M.T(0,.1*S,0),M.S(.112*S,.06*S,.12*S))),[.1,.1,.14]);D(g.cube,M.mul(hd,M.mul(M.T(0,.075*S,.115*S),M.S(.12*S,.012*S,.09*S))),[.1,.1,.14])}
if(l.acc.includes('corrente'))for(let i=0;i<12;i++){const an=i/12*Math.PI*2;D(g.sph,M.mul(chest,M.mul(M.T(Math.cos(an)*.09*b*S,Math.sin(an)*.02*S-.04*S,(.1*Math.abs(Math.sin(an))+.03)*S),M.S(.011*S,.011*S,.011*S))),[.95,.75,.25],{spec:.9,em:.2})}
}
/* sombra projetada no chão: mesmo desenho, achatado segundo a direção do sol */
drawShadow(g){const s=g.env.sun,m=M.id();m[4]=-s[0]/s[1];m[5]=0;m[6]=-s[2]/s[1];m[13]=.015;const keep=g.draw;g.draw=(mesh,mat,o)=>keep.call(g,mesh,M.mul(m,mat),{col:[0,0,0],a:.38,spec:0});this.draw(g);g.draw=keep}
}
