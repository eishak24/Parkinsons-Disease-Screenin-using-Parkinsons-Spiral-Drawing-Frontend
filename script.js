const $=id=>document.getElementById(id);
$('yr').textContent=new Date().getFullYear();

/* ---------- Optional background video: removed automatically if file is missing ---------- */
(()=>{const v=$('bgvid');if(!v)return;const s=v.querySelector('source');
  s.addEventListener('error',()=>v.remove());})();

/* ---------- Animated neural-network brain ---------- */
(()=>{
  const cv=$('brain'),ctx=cv.getContext('2d');
  const brain=new Path2D("M110,190 C70,180 50,140 70,105 C80,65 130,40 175,48 C205,20 265,25 290,55 C335,55 365,95 352,135 C362,165 340,195 305,198 C295,225 260,235 240,222 C225,240 190,245 175,225 C150,235 120,222 110,190 Z");
  const stem=new Path2D("M205,222 C210,250 215,270 222,285 L240,285 C238,262 240,240 246,222 Z");
  // sample nodes inside brain (done in untransformed 400x300 space)
  const N=[];const probe=document.createElement('canvas').getContext('2d');
  let tries=0;while(N.length<95&&tries<20000){tries++;
    const x=50+Math.random()*320,y=20+Math.random()*230;
    if(probe.isPointInPath(brain,x,y))N.push({x,y,ox:x,oy:y,p:Math.random()*6.28,s:.4+Math.random()*.8,r:1.4+Math.random()*1.8});}
  const E=[];for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){
    const d=Math.hypot(N[i].x-N[j].x,N[i].y-N[j].y);if(d<38)E.push([i,j,d]);}
  const pulses=[];
  let W,H,dpr;
  function size(){dpr=Math.min(devicePixelRatio||1,2);const b=cv.getBoundingClientRect();W=b.width;H=b.height;cv.width=W*dpr;cv.height=H*dpr;}
  addEventListener('resize',size);size();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t=0;
  function frame(){
    t+=.012;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const sc=Math.min(W/400,H/300)*.95, offx=(W-400*sc)/2, offy=(H-300*sc)/2-4;
    ctx.save();ctx.translate(offx,offy);ctx.scale(sc,sc);
    // outline glow
    ctx.lineWidth=1.6;ctx.strokeStyle='rgba(167,139,250,.7)';ctx.shadowColor='rgba(139,92,246,.95)';ctx.shadowBlur=18;
    ctx.stroke(brain);ctx.strokeStyle='rgba(192,132,252,.5)';ctx.stroke(stem);ctx.shadowBlur=0;
    const g=ctx.createRadialGradient(200,130,10,200,130,190);g.addColorStop(0,'rgba(139,92,246,.20)');g.addColorStop(1,'rgba(99,102,241,.03)');
    ctx.fillStyle=g;ctx.fill(brain);
    // drift
    N.forEach(n=>{n.x=n.ox+Math.sin(t*n.s+n.p)*2.2;n.y=n.oy+Math.cos(t*n.s*1.1+n.p)*2.2;});
    // edges
    ctx.lineWidth=.6;
    E.forEach(([i,j,d])=>{ctx.strokeStyle=`rgba(170,150,255,${(1-d/38)*.5})`;ctx.beginPath();ctx.moveTo(N[i].x,N[i].y);ctx.lineTo(N[j].x,N[j].y);ctx.stroke();});
    // pulses
    if(!reduce&&Math.random()<.18&&pulses.length<26){const e=E[(Math.random()*E.length)|0];if(e)pulses.push({e,k:0});}
    for(let i=pulses.length-1;i>=0;i--){const p=pulses[i];p.k+=.035;if(p.k>=1){pulses.splice(i,1);continue;}
      const a=N[p.e[0]],b=N[p.e[1]],x=a.x+(b.x-a.x)*p.k,y=a.y+(b.y-a.y)*p.k;
      ctx.fillStyle='rgba(233,213,255,.98)';ctx.shadowColor='#a78bfa';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y,2,0,6.28);ctx.fill();ctx.shadowBlur=0;}
    // nodes
    N.forEach(n=>{const a=.55+.45*Math.sin(t*2*n.s+n.p);ctx.fillStyle=`rgba(196,160,255,${a})`;ctx.shadowColor='#a78bfa';ctx.shadowBlur=6;
      ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,6.28);ctx.fill();});
    ctx.shadowBlur=0;ctx.restore();
    if(!reduce)requestAnimationFrame(frame);
  }
  frame();
})();

/* ---------- Spiral illustrations ---------- */
function spiral(id,tremor){
  const c=$(id),x=c.getContext('2d'),S=c.width,cx=S/2,cy=S/2;
  x.fillStyle='#fff';x.fillRect(0,0,S,S);
  x.strokeStyle='#111827';x.lineWidth=tremor?3.2:2.6;x.lineCap='round';x.lineJoin='round';
  // deterministic pseudo-random
  let seed=tremor?7:3;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  x.beginPath();const turns=4.2,steps=1400;
  for(let i=0;i<=steps;i++){
    const th=i/steps*turns*2*Math.PI, r=6+th*(S*.40/(turns*2*Math.PI));
    let dr=0;
    if(tremor){dr=Math.sin(th*14)*3.6+(rnd()-.5)*5+Math.sin(th*2.3)*r*.05;}
    const px=cx+(r+dr)*Math.cos(th),py=cy+(r+dr)*Math.sin(th);
    i?x.lineTo(px,py):x.moveTo(px,py);
  }
  x.stroke();
}
spiral('sp-healthy',false);spiral('sp-park',true);

/* ---------- Upload + predict ---------- */
const drop=$('drop'),fileInput=$('file'),preview=$('preview'),empty=$('empty'),btn=$('btn'),reset=$('reset'),result=$('result'),placeholder=$('placeholder');
let selected=null;
function setFile(f){
  if(!f)return;
  if(!/^image\/(png|jpe?g)$/.test(f.type)){showError('Unsupported file type. Please upload a PNG or JPG image.');return;}
  selected=f;preview.src=URL.createObjectURL(f);preview.style.display='block';empty.style.display='none';btn.disabled=false;clearResult();
}
function clearAll(){selected=null;fileInput.value='';preview.style.display='none';preview.removeAttribute('src');empty.style.display='block';btn.disabled=true;clearResult();}
function clearResult(){result.style.display='none';result.innerHTML='';placeholder.style.display='block';}
function showError(m){placeholder.style.display='none';result.style.display='block';result.innerHTML=`<div class="verdict error"><small>Error</small><div class="label">${m}</div></div>`;}
drop.addEventListener('click',()=>fileInput.click());
drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click();}});
fileInput.addEventListener('change',e=>setFile(e.target.files[0]));
['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over');}));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over');}));
drop.addEventListener('drop',e=>setFile(e.dataTransfer.files[0]));
reset.addEventListener('click',clearAll);
btn.addEventListener('click',async()=>{
  if(!selected)return;
  btn.disabled=true;btn.innerHTML='<span class="spinner"></span>Analyzing…';
  const fd=new FormData();fd.append('image',selected);
  try{
    const res=await fetch(API_URL,{method:'POST',body:fd});const data=await res.json();
    if(!res.ok)throw new Error(data.error||'Server error');
    const cls=data.label.toLowerCase();
    const meters=Object.entries(data.probabilities).map(([k,v])=>{const pct=(v*100).toFixed(1);
      return `<div class="meter"><div class="top"><span>${k}</span><span>${pct}%</span></div><div class="track"><div class="fill ${k.toLowerCase()}" data-w="${pct}"></div></div></div>`;}).join('');
    placeholder.style.display='none';result.style.display='block';
    result.innerHTML=`<div class="verdict ${cls}"><small>Predicted class</small><div class="label">${data.label}</div>
      <div style="font-size:.88rem;margin-top:2px">Confidence ${(data.confidence*100).toFixed(1)}%</div></div>${meters}
      <div class="meta">Generated by a CNN from a single image. Treat as an indication only, not a diagnosis.</div>`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>result.querySelectorAll('.fill').forEach(f=>f.style.width=f.dataset.w+'%')));
  }catch(err){
    showError(err instanceof TypeError?'Cannot reach the analysis server. Please start the backend (python app.py) and try again.':err.message);
  }
  finally{btn.disabled=false;btn.textContent='Analyze drawing';}
});
