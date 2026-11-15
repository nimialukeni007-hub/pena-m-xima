/* Qualidade automática: ajusta resolução, luzes, sombras e contornos para manter fluidez */
(function(){
const mob=/android|iphone|ipad|ipod/i.test(navigator.userAgent);
const RS=[.4,.5,.6,.7,.8,.9,1],NL=[2,3,3,6];
let ri=mob?2:4,q=mob?1:2,ema=33,cool=1.5,good=0,last=performance.now();
function apply(){R3.rs=RS[ri];R3.q=q;if(R3.gl){R3.gl.nl=q>=2?6:(q===1?3:2);R3.gl.noOut=q<1}}
R3.rs=RS[ri];R3.q=q;
const _r=render;
render=function(now){
  const t=performance.now(),dt=Math.min(250,t-last);last=t;
  ema+=(dt-ema)*.12;cool-=dt/1000;
  if(cool<=0){
    if(ema>40){ /* lento: baixa */
      if(ri>1){ri--;}else if(q>0){q--;ri=Math.min(ri+2,RS.length-1)}else if(ri>0)ri--;
      cool=1.2;good=0;apply();R3.perf=Math.round(1000/ema);
    }else if(ema<21){ /* folga: sobe devagar */
      good+=1;if(good>=4){good=0;
        if(ri<(mob?4:6)){ri++;cool=2;apply()}
        else if(q<(mob?1:2)){q++;ri=Math.max(ri-2,1);cool=3;apply()}}
      cool=Math.max(cool,.5)
    }else good=0;
  }
  if(R3.gl&&R3.gl.nl==null)apply();
  _r(now)};
window.__perf=()=>({fps:Math.round(1000/ema),scale:R3.rs,q:R3.q});
})();
