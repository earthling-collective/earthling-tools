// Fragment shaders for the palette preview and the four examples, written as
// WebGL2 (GLSL ES 3.00) sources. The glslify includes the originals pulled in
// are inlined below so the tool has no build-step dependency.

const header = `#version 300 es
precision highp float;
precision highp int;

uniform float time;
uniform float seed;
uniform vec2 resolution;
uniform vec3 palette[4];

out vec4 fragColor;

vec3 paletteColor(float t){
  vec3 a=palette[0];
  vec3 b=palette[1];
  vec3 c=palette[2];
  vec3 d=palette[3];
  return a+b*cos(6.28318*(c*t+d));
}
`;

// Cheap hash noise, the original includes/noise/3d
const noise3d = `
float noise3d(vec3 p){
  return fract(sin(dot(p,vec3(12.9898,78.233,128.852)))*43758.5453)*2.-1.;
}
`;

// Simplex noise 3D after Ashima Arts / Ian McEwan, MIT licensed
const simplex = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

float noise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);

  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);

  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);

  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;

  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.,i1.z,i2.z,1.))
    +i.y+vec4(0.,i1.y,i2.y,1.))
    +i.x+vec4(0.,i1.x,i2.x,1.));

  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;

  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);

  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);

  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);

  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));

  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;

  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);

  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;

  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

// 2D rotation about the centre of the unit square
const rotate = `
vec2 rotate(vec2 p,float a){
  float mid=.5;
  return vec2(
    cos(a)*(p.x-mid)+sin(a)*(p.y-mid)+mid,
    cos(a)*(p.y-mid)-sin(a)*(p.x-mid)+mid
  );
}
`;

// Polynomial smooth minimum
const smoothUnion = `
float smoothUnion(float d1,float d2,float k){
  float h=clamp(.5+.5*(d2-d1)/k,0.,1.);
  return mix(d2,d1,h)-k*h*(1.-h);
}
`;

// Per-pixel film grain, driven by the drawing buffer size so it stays fine
const grain = `
float grain(vec2 uv,vec2 res,float t){
  return fract(sin(dot(uv*res+t,vec2(12.9898,78.233)))*43758.5453);
}
`;

// The palette itself, swept left to right
export const stripFrag = `${header}
void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  fragColor=vec4(paletteColor(uv.x),1.);
}`;

// Wobbly functions: smoothly undulating sums of modulated sine waves
const wobbleFrag = `${header}
const float timeScale=.05;

// Exponential smooth min, after Inigo Quilez
float smin(float a,float b){
  float k=10.;
  float res=exp2(-k*a)+exp2(-k*b);
  return sin(-log2(res)/k)*.5+.5;
}

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  float st=time*timeScale+seed*1000.;

  uv-=vec2(.5);
  uv*=min(vec2(resolution.x/resolution.y,1.),vec2(1.,resolution.y/resolution.x));

  vec3 wobble=vec3(
    sin(1.1837*st-.82184*sin(.62626*uv.x+st*3.3198-sin(st*.4138+uv.y*.591))-.32578*uv.x-2.1847*sin(1.245847*uv.x+1.182467*st+.23872*uv.y+1.239*sin(-1.59*st+.15534*uv.y)-1.1248*sin(.1848*uv.y+st*.19518)+1.43726*sin(.145*uv.x+.8157*st)+1.43726*sin(.8217*uv.y+4.8157*st))),
    sin(-.91957*st+1.15136*sin(2.2158*uv.x+st*5.1259)+1.15131*sin(5.37683*uv.x-1.26574*sin(1.1257*uv.x)+1.425642*st-1.32156*sin(7.9372*uv.x+st*.92784)+sin(1.58127*st)+1.1237*sin(7.62161*uv.y-3.43616*st))),
    sin(.9145*st-.598*sin(1.15418*uv.x+sin(4.2184*st))+1.29847*sin(3.245847*uv.x-5.1215*uv.x+1.582467*st+1.23872*sin(1.148*uv.y+.9127*st)+1.43726+1.2536*sin(1.5827*uv.y-1.3581*st)*sin(1.8217*uv.x+1.8157*st)))
  );

  vec3 color=max(
    paletteColor(smin(wobble.r,wobble.b)),
    max(paletteColor(smin(wobble.b,wobble.g)),paletteColor(smin(wobble.g,wobble.r)))
  );

  fragColor=vec4(color,1.);
}`;

// VHS: curved tube, tape creases and rolling glitch
const vhsFrag = `${header}${noise3d}${rotate}${smoothUnion}
#define V vec2(0.,1.)
#define PI 3.14159265
#define VHSRES vec2(480.,240.)

vec2 curve(vec2 p,float curvature,float power){
  p.y+=(p.y-.5)*curvature*pow(abs(p.x-.5),power);
  p.x+=(p.x-.5)*curvature*pow(abs(p.y-.5),power);
  return p;
}

float sdWindows(vec2 p){
  return smoothUnion(.2-abs(.5-p.x)+pow(abs(.5-p.y),1.3+p.y*p.x),-.12+abs(.5-p.y),.2);
}

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  float st=seed*-200.+time;

  uv=curve(uv,3.,6.);
  vec2 uv2=uv;

  uv.x+=(noise3d(vec3(uv.y/10.,st/10.,1.))-.5)/VHSRES.x;
  uv.x+=(noise3d(vec3(uv.y,st*10.,1.))-.5)/VHSRES.x;

  vec3 col=vec3(0.);

  float d=smoothstep(-.1,.2,sdWindows(rotate(uv+vec2(uv.x+uv.y,0.)*sin(st*.085),st*.1)));
  col=mix(col,paletteColor(sin(d*.2+st*.1+uv.x*.7)*.5+.5),d);

  // tape crease
  float tcPhase=smoothstep(.9,.99,sin(uv.y*3.-(st*.3+.03*noise3d(vec3(st*vec2(.67,.59),1.)))*PI*1.2));
  float tcNoise=smoothstep(.6,1.,noise3d(vec3(uv.y*4.77,st*.5,1.)));
  float cn=tcNoise*(.3+.7*tcPhase);
  if(.29<cn){
    vec2 uvt=(uv+V.yx*noise3d(vec3(uv.y,st,1.)))*vec2(.1,1.);
    float n0=noise3d(vec3(uvt,1.));
    float n1=noise3d(vec3(uvt+V.yx/VHSRES.x,1.));
    if(n1<n0)col=mix(col,2.*V.yyy,pow(n0,10.)*.4);
  }

  col+=vec3(1.)*noise3d(vec3(uv,st*.1))*.15;

  // fade out past the curved edge
  col=(1.-smoothstep(.475,.525,abs(uv2.x-.5)))*(1.-smoothstep(.475,.525,abs(uv2.y-.5)))*col;

  fragColor=vec4(col,1.);
}`;

// Chaotic system: a folded, rotated orbit trap
const chaosFrag = `${header}
const int iterations=20;

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;

  uv-=vec2(.5);
  uv*=min(vec2(resolution.x/resolution.y,1.),vec2(1.,resolution.y/resolution.x));

  float a=40.;
  mat2 rot=mat2(cos(a),sin(a),-sin(a),cos(a));

  float ot=1.;
  float l=length(uv);

  vec2 r=vec2(0.);
  float st=120.+time*.1;
  for(int i=0;i<iterations;++i){
    uv=abs(uv*rot)*1.3-1.;
    r=uv+vec2(sin(st),cos(st))*.5;
    ot=min(ot,abs(dot(r,r)-l*.015-.5));
  }

  float c=pow(ot,.15)+l*1.5;
  vec3 col=paletteColor(max(c,.75))*(2.-c);

  fragColor=vec4(col,1.);
}`;

// Hexagonal grid lit by simplex noise
const hexFrag = `${header}${simplex}${grain}
const vec2 s=vec2(1,1.7320508);

vec4 getHex(vec2 p){
  vec4 hC=floor(vec4(p,p-vec2(.5,1))/s.xyxy)+.5;
  vec4 h=vec4(p-hC.xy*s,p-(hC.zw+.5)*s);
  return dot(h.xy,h.xy)<dot(h.zw,h.zw)?vec4(h.xy,hC.xy):vec4(h.zw,hC.zw+.5);
}

void main(){
  vec2 uv=gl_FragCoord.xy/resolution;
  vec2 uv0=uv;

  uv-=vec2(.5);
  uv*=min(vec2(resolution.x/resolution.y,1.),vec2(1.,resolution.y/resolution.x));
  uv*=40.;

  vec4 hex=getHex(uv);
  vec2 id=hex.zw;
  vec2 c=hex.xy;

  float a=time*.1;
  mat2 rot=mat2(cos(a),sin(a),-sin(a),cos(a));

  float n=max(0.,noise(vec3(id*.05*rot,time*.1))*.5+.5);
  float shift=n*4.+c.x;
  vec3 col=paletteColor(sin(max(shift,.1))*.5+.5);

  col=mix(vec3(0.),col,smoothstep(.4,1.,smoothstep(shift,0.,.4)));
  col*=1.-.08*grain(uv0,resolution,time);

  fragColor=pow(vec4(col,1.),vec4(.5));
}`;

export const exampleFrags = [
  { label: "VHS", frag: vhsFrag },
  { label: "Wobble", frag: wobbleFrag },
  { label: "Hexagons", frag: hexFrag },
  { label: "Chaos", frag: chaosFrag },
];
