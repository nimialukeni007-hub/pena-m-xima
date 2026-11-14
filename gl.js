/* Mini motor 3D WebGL (sem dependências): luzes, texturas, sombras, nevoeiro */
const M={
id:()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),
mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
T(x,y,z){const m=M.id();m[12]=x;m[13]=y;m[14]=z;return m},
S(x,y,z){const m=M.id();m[0]=x;m[5]=y;m[10]=z;return m},
RX(a){const c=Math.cos(a),s=Math.sin(a),m=M.id();m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m},
RY(a){const c=Math.cos(a),s=Math.sin(a),m=M.id();m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m},
RZ(a){const c=Math.cos(a),s=Math.sin(a),m=M.id();m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m},
persp(f,a,n,r){const t=1/Math.tan(f/2),m=new Float32Array(16);m[0]=t/a;m[5]=t;m[10]=(r+n)/(n-r);m[11]=-1;m[14]=2*r*n/(n-r);return m},
look(e,c,u){let zx=e[0]-c[0],zy=e[1]-c[1],zz=e[2]-c[2],l=Math.hypot(zx,zy,zz);zx/=l;zy/=l;zz/=l;
let xx=u[1]*zz-u[2]*zy,xy=u[2]*zx-u[0]*zz,xz=u[0]*zy-u[1]*zx;l=Math.hypot(xx,xy,xz);xx/=l;xy/=l;xz/=l;
const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
return new Float32Array([xx,yx,zx,0,xy,yy,zy,0,xz,yz,zz,0,-(xx*e[0]+xy*e[1]+xz*e[2]),-(yx*e[0]+yy*e[1]+yz*e[2]),-(zx*e[0]+zy*e[1]+zz*e[2]),1])},
nm(m){const a=m[0],b=m[1],c=m[2],d=m[4],e=m[5],f=m[6],g=m[8],h=m[9],i=m[10];
const A=e*i-f*h,B=f*g-d*i,C=d*h-e*g,det=a*A+b*B+c*C||1,k=1/det;
return new Float32Array([A*k,(c*h-b*i)*k,(b*f-c*e)*k,B*k,(a*i-c*g)*k,(c*d-a*f)*k,C*k,(b*g-a*h)*k,(a*e-b*d)*k])}};
const VS=`attribute vec3 aP;attribute vec3 aN;attribute vec2 aT;uniform mat4 uM,uVP;uniform mat3 uNM;uniform vec2 uUV;uniform float uOut;varying vec3 vW,vN;varying vec2 vT;
void main(){vec4 w=uM*vec4(aP,1.);vN=normalize(uNM*aN);w.xyz+=vN*uOut;vW=w.xyz;vT=aT*uUV;gl_Position=uVP*w;}`;
const FS=`precision mediump float;varying vec3 vW,vN;varying vec2 vT;uniform vec3 uCol,uCam,uAmbS,uAmbG,uSun,uSunC,uFog;uniform sampler2D uTex;uniform float uUseTex,uEm,uSpec,uAlpha,uFogD,uToon;float tn(float x){return uToon>.5?floor(x*3.+.5)/3.:x;}
uniform vec3 uLp[6];uniform vec3 uLc[6];
void main(){vec3 n=normalize(vN);vec3 base=uCol;float ta=1.;if(uUseTex>.5){vec4 tc=texture2D(uTex,vT);base*=tc.rgb;ta=tc.a;}
vec3 V=normalize(uCam-vW);vec3 c=mix(uAmbG,uAmbS,n.y*.5+.5)*base+uSunC*tn(max(dot(n,-uSun),0.))*base;
for(int i=0;i<6;i++){vec3 d=uLp[i]-vW;float L=length(d);d/=L;float att=1./(1.+.10*L+.035*L*L);float df=tn(max(dot(n,d),0.));
float sp=pow(max(dot(n,normalize(d+V)),0.),40.)*uSpec;c+=(base*df+sp)*uLc[i]*att;}
c+=base*uEm;float dist=length(uCam-vW);c=mix(c,uFog,1.-exp(-dist*uFogD));
c=pow(c,vec3(.92));gl_FragColor=vec4(c,uAlpha*ta);}`;
class GL{
constructor(cv){const o={antialias:true,stencil:true,alpha:false,powerPreference:'high-performance'};this.gl=cv.getContext('webgl',o)||cv.getContext('experimental-webgl',o);if(!this.gl)throw Error('WebGL indisponível');
const g=this.gl;this.cv=cv;this.p=this.prog(VS,FS);g.useProgram(this.p);this.u={};for(const n of['uM','uVP','uNM','uUV','uCol','uCam','uAmbS','uAmbG','uSun','uSunC','uFog','uTex','uUseTex','uEm','uSpec','uAlpha','uFogD','uLp','uLc','uOut','uToon'])this.u[n]=g.getUniformLocation(this.p,n);
this.a={P:g.getAttribLocation(this.p,'aP'),N:g.getAttribLocation(this.p,'aN'),T:g.getAttribLocation(this.p,'aT')};
g.enable(g.DEPTH_TEST);g.enable(g.CULL_FACE);this.env={ambS:[.34,.36,.42],ambG:[.14,.12,.1],sun:[.3,-.8,.4],sunC:[.5,.5,.5],fog:[.05,.05,.07],fogD:.02};
this.lights=[];this.white=this.tex(c=>{c.fillStyle='#fff';c.fillRect(0,0,4,4)},4);
this.cube=this.mesh(...cubeG());this.sph=this.mesh(...sphereG(14,20));this.cyl=this.mesh(...cylG(18,1,1));this.limb=this.mesh(...cylG(14,1,.78));this.quad=this.mesh(...quadG());this.cone=this.mesh(...cylG(16,1,.0))}
prog(v,f){const g=this.gl,s=(t,c)=>{const h=g.createShader(t);g.shaderSource(h,c);g.compileShader(h);if(!g.getShaderParameter(h,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(h));return h},p=g.createProgram();g.attachShader(p,s(g.VERTEX_SHADER,v));g.attachShader(p,s(g.FRAGMENT_SHADER,f));g.linkProgram(p);return p}
mesh(P,N,T,I){const g=this.gl,b=a=>{const x=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,x);g.bufferData(g.ARRAY_BUFFER,new Float32Array(a),g.STATIC_DRAW);return x},ib=g.createBuffer();g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,ib);g.bufferData(g.ELEMENT_ARRAY_BUFFER,new Uint16Array(I),g.STATIC_DRAW);return{p:b(P),n:b(N),t:b(T),i:ib,c:I.length}}
tex(fn,s=256,rep=true){const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');fn(x,s);return this.texC(c,rep)}
texC(c,rep=true){const g=this.gl,t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,c);const pot=!(c.width&(c.width-1))&&!(c.height&(c.height-1));
if(pot){g.generateMipmap(g.TEXTURE_2D);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR_MIPMAP_LINEAR)}else g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);
g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);const w=rep&&pot?g.REPEAT:g.CLAMP_TO_EDGE;g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,w);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,w);return t}
resize(){const d=Math.min(devicePixelRatio||1,2),w=innerWidth*d|0,h=innerHeight*d|0;if(this.cv.width!==w||this.cv.height!==h){this.cv.width=w;this.cv.height=h}this.gl.viewport(0,0,w,h);this.asp=w/h}
begin(eye,tgt,fov=.95){const g=this.gl;this.resize();const e=this.env;g.clearColor(e.fog[0],e.fog[1],e.fog[2],1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT|g.STENCIL_BUFFER_BIT);
this.eye=eye;this.vp=M.mul(M.persp(fov,this.asp,.1,160),M.look(eye,tgt,[0,1,0]));this.view=M.look(eye,tgt,[0,1,0]);
g.useProgram(this.p);const u=this.u;g.uniformMatrix4fv(u.uVP,false,this.vp);g.uniform3fv(u.uCam,eye);g.uniform3fv(u.uAmbS,e.ambS);g.uniform3fv(u.uAmbG,e.ambG);g.uniform3fv(u.uSun,e.sun);g.uniform3fv(u.uSunC,e.sunC);g.uniform3fv(u.uFog,e.fog);g.uniform1f(u.uFogD,e.fogD);
const L=this.lights.slice().sort((a,b)=>d2(a.p,this.focus||eye)-d2(b.p,this.focus||eye)).slice(0,6),lp=new Float32Array(18),lc=new Float32Array(18);L.forEach((l,i)=>{lp.set(l.p,i*3);lc.set(l.c.map(v=>v*(l.f?l.f():1)),i*3)});g.uniform3fv(u.uLp,lp);g.uniform3fv(u.uLc,lc);g.enable(g.CULL_FACE);g.disable(g.BLEND)}
draw(m,mat,o={}){const g=this.gl,u=this.u,a=this.a;g.bindBuffer(g.ARRAY_BUFFER,m.p);g.enableVertexAttribArray(a.P);g.vertexAttribPointer(a.P,3,g.FLOAT,false,0,0);g.bindBuffer(g.ARRAY_BUFFER,m.n);g.enableVertexAttribArray(a.N);g.vertexAttribPointer(a.N,3,g.FLOAT,false,0,0);g.bindBuffer(g.ARRAY_BUFFER,m.t);g.enableVertexAttribArray(a.T);g.vertexAttribPointer(a.T,2,g.FLOAT,false,0,0);g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,m.i);
g.uniformMatrix4fv(u.uM,false,mat);g.uniformMatrix3fv(u.uNM,false,M.nm(mat));const c=o.col||[1,1,1];g.uniform3f(u.uCol,c[0],c[1],c[2]);g.uniform2f(u.uUV,o.uv?o.uv[0]:1,o.uv?o.uv[1]:1);g.uniform1f(u.uEm,o.em||0);g.uniform1f(u.uSpec,o.spec||0);g.uniform1f(u.uAlpha,o.a==null?1:o.a);
g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,o.tex||this.white);g.uniform1i(u.uTex,0);g.uniform1f(u.uUseTex,o.tex?1:0);g.uniform1f(u.uToon,o.toon?1:0);g.uniform1f(u.uOut,o.out||0);if(o.out||o.cf)g.cullFace(g.FRONT);g.drawElements(g.TRIANGLES,m.c,g.UNSIGNED_SHORT,0);if(o.out||o.cf)g.cullFace(g.BACK)}
/* sombra projetada no chão (um só toque por pixel via stencil) */
shadowBegin(){const g=this.gl;g.enable(g.STENCIL_TEST);g.stencilFunc(g.EQUAL,0,255);g.stencilOp(g.KEEP,g.KEEP,g.INCR);g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.depthMask(false);g.disable(g.CULL_FACE)}
shadowEnd(){const g=this.gl;g.disable(g.STENCIL_TEST);g.depthMask(true);g.disable(g.BLEND);g.enable(g.CULL_FACE);g.clear(g.STENCIL_BUFFER_BIT)}
additive(on){const g=this.gl;if(on){g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE);g.depthMask(false);g.disable(g.CULL_FACE)}else{g.disable(g.BLEND);g.depthMask(true);g.enable(g.CULL_FACE)}}
alpha(on){const g=this.gl;if(on){g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.depthMask(false);g.disable(g.CULL_FACE)}else{g.disable(g.BLEND);g.depthMask(true);g.enable(g.CULL_FACE)}}
}
const d2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;
function cubeG(){const P=[],N=[],T=[],I=[],f=[[0,0,1,[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[0,0,-1,[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],[1,0,0,[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[-1,0,0,[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],[0,1,0,[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[0,-1,0,[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]];
f.forEach((q,i)=>{for(let k=0;k<4;k++){P.push(q[3+k][0]/2,q[3+k][1]/2,q[3+k][2]/2);N.push(q[0],q[1],q[2]);T.push(k==1||k==2?1:0,k>1?1:0)}I.push(i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3)});return[P,N,T,I]}
function sphereG(a,b){const P=[],N=[],T=[],I=[];for(let i=0;i<=a;i++){const v=i/a,t=v*Math.PI;for(let j=0;j<=b;j++){const u=j/b,p=u*Math.PI*2,x=Math.sin(t)*Math.cos(p),y=Math.cos(t),z=Math.sin(t)*Math.sin(p);P.push(x,y,z);N.push(x,y,z);T.push(u,1-v)}}
for(let i=0;i<a;i++)for(let j=0;j<b;j++){const A=i*(b+1)+j,B=A+b+1;I.push(A,A+1,B,A+1,B+1,B)}return[P,N,T,I]}
function cylG(s,rt,rb){const P=[],N=[],T=[],I=[];const sl=(rb-rt)/1;for(let j=0;j<=s;j++){const u=j/s,p=u*Math.PI*2,c=Math.cos(p),n=Math.sin(p),l=Math.hypot(1,sl);P.push(c*rt,0,n*rt,c*rb,-1,n*rb);N.push(c/l*1,sl/l,n/l,c/l,sl/l,n/l);T.push(u,1,u,0)}
for(let j=0;j<s;j++){const a=j*2;I.push(a,a+2,a+1,a+1,a+2,a+3)}
const o=P.length/3;P.push(0,0,0);N.push(0,1,0);T.push(.5,.5);for(let j=0;j<=s;j++){const p=j/s*Math.PI*2;P.push(Math.cos(p)*rt,0,Math.sin(p)*rt);N.push(0,1,0);T.push(.5,.5)}for(let j=0;j<s;j++)I.push(o,o+2+j,o+1+j);
const o2=P.length/3;P.push(0,-1,0);N.push(0,-1,0);T.push(.5,.5);for(let j=0;j<=s;j++){const p=j/s*Math.PI*2;P.push(Math.cos(p)*rb,-1,Math.sin(p)*rb);N.push(0,-1,0);T.push(.5,.5)}for(let j=0;j<s;j++)I.push(o2,o2+1+j,o2+2+j);return[P,N,T,I]}
function quadG(){return[[-.5,0,-.5,.5,0,-.5,.5,0,.5,-.5,0,.5],[0,1,0,0,1,0,0,1,0,0,1,0],[0,0,1,0,1,1,0,1],[0,2,1,0,3,2]]}
