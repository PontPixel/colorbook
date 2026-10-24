// ColorEngine core: color model and shared drawing helpers.
// Loaded first; a game's levels.js reads what it needs from window.CF.
window.CF=(function(){
// ---------- Color model: CMY pigment cube + white/black tint & shade ----------
// Subtractive primaries: C+Y = green, M+Y = red, C+M = blue-violet, C+M+Y = brown.
const C={w:[1,1,1],c:[0,0.66,0.92],m:[0.89,0.07,0.52],y:[1,0.9,0.05],
  cm:[0.24,0.22,0.62],cy:[0.05,0.63,0.32],my:[0.93,0.18,0.14],cmy:[0.36,0.25,0.16]};
function cmy2rgb(c,m,y){
  const L=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  return L(L(L(C.w,C.y,y),L(C.m,C.my,y),m),L(L(C.c,C.cy,y),L(C.cm,C.cmy,y),m),c);
}
const PAINTS=[
  {k:'W',name:'White',rgb:[0.98,0.98,0.97]},{k:'C',name:'Cyan',rgb:C.c},{k:'M',name:'Magenta',rgb:C.m},
  {k:'Y',name:'Yellow',rgb:C.y},{k:'K',name:'Black',rgb:[0.13,0.13,0.15]}];
const PMAP=Object.fromEntries(PAINTS.map(p=>[p.k,p]));
function mix(c){
  const Cy=c.C||0,M=c.M||0,Y=c.Y||0,W=c.W||0,K=c.K||0,total=Cy+M+Y+W+K; if(!total) return null;
  const ch=Cy+M+Y; let out=[0,0,0];
  if(ch){let v=[Cy/ch,M/ch,Y/ch];const m=Math.max(...v);v=v.map(x=>x/m);
    const base=cmy2rgb(...v);out=out.map((o,i)=>o+base[i]*ch/total);}
  return out.map((o,i)=>o+PMAP.W.rgb[i]*W/total+PMAP.K.rgb[i]*K/total);
}
const hex=rgb=>'#'+rgb.map(v=>Math.round(Math.max(0,Math.min(1,v))*255).toString(16).padStart(2,'0')).join('');
function lab(rgb){
  const l=rgb.map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  const f=t=>t>0.008856?Math.cbrt(t):7.787*t+16/116;
  const X=f((l[0]*0.4124+l[1]*0.3576+l[2]*0.1805)/0.95047),Y=f(l[0]*0.2126+l[1]*0.7152+l[2]*0.0722),Z=f((l[0]*0.0193+l[1]*0.1192+l[2]*0.9505)/1.08883);
  return [116*Y-16,500*(X-Y),200*(Y-Z)];
}
const dE=(a,b)=>{const A=lab(a),B=lab(b);return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]);};
const matchPct=(a,b)=>Math.max(0,Math.round(100-dE(a,b)*1.1));
// Unrestored parts look like an uncolored coloring-book page: white fills, pale gray strokes.
const BLANK='#fbfbfc', BLANK_STROKE='#e2e4ea';

// ---------- Pictures ----------
function petals(cx,cy){let s='';for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;s+=`<circle cx="${(cx+Math.cos(a)*7).toFixed(1)}" cy="${(cy+Math.sin(a)*7).toFixed(1)}" r="5.5"/>`;}return s;}
const INK='#23283a';
const circ=(cx,cy,r)=>`M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`;
const ring=(cx,cy,r1,r2)=>`<path fill-rule="evenodd" d="${circ(cx,cy,r1)}${circ(cx,cy,r2)}"/>`;
const holeRect=(x,y,w,h,cx,cy,r)=>`<path fill-rule="evenodd" d="M${x} ${y}h${w}v${h}h${-w}Z${circ(cx,cy,r)}"/>`;
return {C,cmy2rgb,PAINTS,PMAP,mix,hex,lab,dE,matchPct,BLANK,BLANK_STROKE,petals,INK,circ,ring,holeRect};
})();
