// @ts-nocheck
// Envelope opening: the imperative animation timeline (Web Animations API, transform + opacity only).
// It is a straight port of the approved preview, wired to the real page: tapping starts the music, the light
// ball swells into the page's own orb and hands the stage over via hooks.onEnter / hooks.onDone.
import markup from './envelope.html?raw';
import { sfx } from '../../lib/sfx';

export interface EnvelopeHooks {
  onStartMusic: () => void;
  onEnter: () => void;
  onDone: () => void;
}

export function mountEnvelope(root, hooks) {
root.innerHTML=markup;
const timers=[];let musicOn=false;
const TO=(fn,ms)=>{const id=window.setTimeout(fn,ms);timers.push(id);return id};

const st=root.querySelector('#stars');
for(let i=0;i<60;i++){const e=document.createElement('span');e.className='star';const z=1+((i*37)%30)/15;e.style.cssText=`left:${(i*53.7)%100}%;top:${(i*29.3+7)%100}%;width:${z}px;height:${z}px;animation-delay:${(i%9)*.45}s;opacity:.3`;st.appendChild(e)}
// wax seal drawn once, used for both halves
const SEAL=`<svg viewBox="0 0 100 100"><defs><radialGradient id="wg" cx="35%" cy="28%" r="85%"><stop offset="0" stop-color="#f4dc98"/><stop offset=".42" stop-color="#d4aa52"/><stop offset="1" stop-color="#8a6526"/></radialGradient><radialGradient id="wi" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#e3be74"/><stop offset="1" stop-color="#9a722c"/></radialGradient></defs>
<path d="M50 5c9 0 13 5 20 7s14 7 17 15 2 15 5 23-3 14-7 21-13 11-21 14-14 5-22 5-17-4-23-9-12-12-14-20-1-15 1-22 7-14 13-19S41 5 50 5z" fill="url(#wg)"/>
<circle cx="50" cy="52" r="31" fill="url(#wi)" stroke="rgba(110,76,24,.55)" stroke-width="1.2"/><circle cx="50" cy="52" r="26" fill="none" stroke="rgba(255,236,180,.45)" stroke-width=".8"/>
<path d="M50 38l11 14-11 14-11-14z" fill="rgba(110,76,24,.6)" stroke="rgba(255,236,180,.55)" stroke-width=".8"/><path d="M50 38l11 14H39z" fill="rgba(255,236,180,.22)"/>
<path d="M24 34c6-12 18-17 30-15" fill="none" stroke="rgba(255,246,210,.7)" stroke-width="2" stroke-linecap="round"/></svg>`;
root.querySelectorAll('.seal .sl,.seal .sr').forEach(e=>e.innerHTML=SEAL);
const $=id=>root.querySelector('#'+id),stage=root,env=$('env'),flap=$('flap'),seal=$('seal');
// rays texture, drawn once (a static picture that only rotates: very cheap)
(function(){const c=$('rays'),x=c.getContext('2d'),N=1024,C=N/2;x.translate(C,C);
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2+Math.sin(i*7.3)*.04,w=(.012+((i*37)%10)/10*.03),len=C*(.55+((i*53)%10)/10*.45);
  const g=x.createRadialGradient(0,0,0,0,0,len);g.addColorStop(0,'rgba(255,240,196,.55)');g.addColorStop(.35,'rgba(255,226,150,.22)');g.addColorStop(1,'rgba(255,226,150,0)');
  x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.arc(0,0,len,a-w,a+w);x.closePath();x.fill()}})();
// dust motes drifting in the beam
const env0=$('float');
const motes=Array.from({length:16},(_,i)=>{const m=document.createElement('i');m.className='mote';m.style.left=(30+Math.random()*40)+'%';m.style.top=(10+Math.random()*30)+'%';env0.appendChild(m);return m});
const crumbs=Array.from({length:8},()=>{const m=document.createElement('i');m.className='crumb';seal.appendChild(m);return m});
const A=(el,kf,o)=>el.animate(kf,Object.assign({fill:'forwards'},o));
const E1='cubic-bezier(.45,0,.2,1)',E2='cubic-bezier(.22,1,.36,1)';
// ---- wrappers: rings group + pointer-tilt group, words split for the title ----
const wrapEl=$('wrap'),rings=document.createElement('div');rings.id='rings';wrapEl.querySelectorAll('.erng').forEach(x=>rings.appendChild(x));wrapEl.insertBefore(rings,env);const halo=document.createElement('div');halo.id='ehalo';wrapEl.insertBefore(halo,env);
const tilt=document.createElement('div');tilt.id='tilt';env.insertBefore(tilt,env0);tilt.appendChild(env0);
const h1=root.querySelector('h1.t');h1.querySelectorAll('span').forEach(sp=>{sp.className='l';sp.innerHTML=sp.textContent.split(' ').map(w=>'<span class="w">'+w+'</span>').join(' ')});
const pillEl=root.querySelector('.pill'),skipEl=root.querySelector('.skip');
let ready=false,pending=false;
function arrive(){
 const W=innerWidth,H=innerHeight,wr=wrapEl.getBoundingClientRect(),cx=wr.left+wr.width/2,cy=wr.top+wr.height/2;
 // sound cues, timed to the same clock as the animations below (they queue until the guest unlocks sound)
 sfx.tryAuto();
 const IMs=1800,SDs=IMs+2500;
 sfx.cue('comet',300);sfx.cue('impact',IMs);sfx.cue('ping1',IMs+60);sfx.cue('ping2',IMs+280);
 sfx.cue('spin',IMs+80);sfx.cue('settle',IMs+1740);
 h1.querySelectorAll('.w').forEach((w,i)=>sfx.cue('pip',IMs+900+i*190,{i:i*1+2}));
 sfx.cue('stamp',SDs+390);sfx.cue('cue',SDs+560);
 // 0. the night sky wakes up
 A($('stars'),[{opacity:0},{opacity:1}],{duration:2200,easing:'ease-out'});
 // 1. a golden comet crosses the sky and falls to where the envelope will be
 const sx=W*.86,sy=-30,ex=cx,ey=cy,cm=$('comet'),rr=cm.firstElementChild;
 rr.style.transform=`rotate(${Math.atan2(sx-ex,ey-sy)}rad)`;
 const kf=[];for(let i=0;i<=28;i++){const u=i/28,p=Math.pow(u,1.6),bx=(1-p)*(1-p)*sx+2*(1-p)*p*(sx-W*.5)+p*p*ex,by=(1-p)*(1-p)*sy+2*(1-p)*p*(H*.12)+p*p*ey;kf.push({translate:`${bx}px ${by}px`,offset:u})}
 A(cm,kf,{duration:1500,delay:300,easing:'linear'});
 A(cm,[{opacity:0},{opacity:1,offset:.1},{opacity:1,offset:.9},{opacity:0}],{duration:1500,delay:300});
 // 2. impact: two shock rings, a burst of sparks, the rings of the scene bloom open
 const IM=1800;
 [$('arr1'),$('arr2')].forEach((a,i)=>{a.style.left=cx+'px';a.style.top=cy+'px';A(a,[{opacity:.95,transform:'scale(.15)'},{opacity:0,transform:'scale(7)'}],{duration:1700,delay:IM+i*220,easing:'cubic-bezier(.15,.7,.25,1)'})});
 const bx=$('sparks');for(let i=0;i<30;i++){const p=document.createElement('i');p.className='xspark';p.style.left=cx+'px';p.style.top=cy+'px';bx.appendChild(p);const a=i/30*Math.PI*2+Math.random()*.3,r=(.35+Math.random()*.7)*Math.min(W,H)*.45;
  A(p,[{opacity:0,transform:'rotate(45deg) translate(0,0) scale(.3)'},{opacity:1,offset:.12},{opacity:0,transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r}px) rotate(45deg) scale(.9)`}],{duration:1500+Math.random()*900,delay:IM+Math.random()*120,easing:'cubic-bezier(.15,.7,.25,1)'})}
 A(rings,[{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'scale(1)'}],{duration:2200,delay:IM,easing:E2});
 // 3. the envelope condenses out of the light: it spins in on its vertical axis and settles with a little overshoot
 A(env,[{opacity:0,transform:'perspective(900px) translateY(40px) rotateY(-120deg) rotateX(24deg) scale(.25)',offset:0},
        {opacity:1,offset:.25},
        {transform:'perspective(900px) translateY(-8px) rotateY(14deg) rotateX(-4deg) scale(1.06)',offset:.72},
        {opacity:1,transform:'perspective(900px) translateY(0) rotateY(0deg) rotateX(0deg) scale(1)',offset:1}],{duration:2300,delay:IM+80,easing:'cubic-bezier(.22,.9,.28,1)'});
 A(root.querySelector('.eshadow'),[{opacity:0,transform:'scaleX(.3)'},{opacity:1,transform:'scaleX(1)'}],{duration:1600,delay:IM+1200,easing:E2});
 // 4. the wax seal is stamped on, with a small pulse of light
 const SD=IM+2500;
 A(seal,[{opacity:0,scale:2.6},{opacity:1,scale:.9,offset:.6},{opacity:1,scale:1}],{duration:650,delay:SD,easing:'cubic-bezier(.3,.9,.3,1)'});
 const sy2=wr.top+wr.height*.554;A($('arr1'),[{opacity:.7,transform:'scale(.2)'},{opacity:0,transform:'scale(2.4)'}],{duration:900,delay:SD+420,easing:'ease-out'});
 TO(()=>{const a=$('arr1');a.style.top=sy2+'px'},SD+380);
 // 5. title words rise one by one, then the skip link and the tap hint
 h1.querySelectorAll('.w').forEach((w,i)=>A(w,[{opacity:0,transform:'translateY(26px) scale(.9)'},{opacity:1,transform:'none'}],{duration:1300,delay:IM+900+i*190,easing:E2}));
 A(skipEl,[{opacity:0},{opacity:1}],{duration:900,delay:IM+2600});
 A(pillEl,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:1100,delay:SD+500,easing:E2});
 TO(()=>{ready=true;if(pending)go();else startIdle()},SD+900);
}
// ---- idle loop: two shooting stars (blue + pink) circle the envelope, meet at the button, then fly into the seal and merge ----
let idle=null;
function ease(u){return .5-.5*Math.cos(Math.PI*u)}
function bez(a,b,c,u){return (1-u)*(1-u)*a+2*(1-u)*u*b+u*u*c}
function loopOnce(){
 if(started)return;
 const wr=wrapEl.getBoundingClientRect(),cx=wr.left+wr.width/2,cy=wr.top+wr.height/2,R=wr.width*.78;
 const pr=pillEl.getBoundingClientRect(),px=pr.left+pr.width/2,py=pr.top+pr.height/2;
 const sr=seal.getBoundingClientRect(),qx=sr.left+sr.width/2,qy=sr.top+sr.height/2;
 const box=$('ssbox'),DUR=4400,T1=2150,T2=3050,T3=4250;
 sfx.cue('starPass',0,{side:1,dur:T1/1000});sfx.cue('starPass',0,{side:-1,dur:T1/1000});sfx.cue('pillHit',T2-60);sfx.cue('toSeal',T2);sfx.cue('merge',T3-120);
 const cfg=[{c:'#8fc4f0',a0:Math.PI,a1:Math.PI*2+1.15,rad:R,px:px-26},{c:'#f4a9c6',a0:0,a1:-Math.PI-1.15,rad:R*1.1,px:px+26}];
 const els=[];
 cfg.forEach((q,si)=>{
  const pts=[];const N=44;
  for(let i=0;i<=N;i++){const t=i/N*DUR;let x,y;
   if(t<=T1){const u=ease(t/T1),a=q.a0+(q.a1-q.a0)*u,rd=q.rad*(1-.1*Math.sin(Math.PI*u));x=cx+Math.cos(a)*rd;y=cy+Math.sin(a)*rd*.92}
   else if(t<=T2){const u=ease((t-T1)/(T2-T1)),a=q.a1,sx=cx+Math.cos(a)*q.rad*.9,sy=cy+Math.sin(a)*q.rad*.92*.9;x=bez(sx,sx+(q.px-sx)*.2,q.px,u);y=bez(sy,sy+(py-sy)*.7,py,u)}
   else{const u=ease(Math.min(1,(t-T2)/(T3-T2))),ox=q.px,oy=py;x=bez(ox,ox+(si?60:-60),qx,u);y=bez(oy,(oy+qy)/2-30,qy,u)}
   pts.push([x,y,t/DUR])}
  // heading follows the path; unwrap so it never spins the long way round
  let prev=0;const kf=[],kr=[];
  pts.forEach((p,i)=>{const n=pts[Math.min(i+1,pts.length-1)],m=pts[Math.max(i-1,0)];let ang=Math.atan2(-(n[0]-m[0]),(n[1]-m[1]));while(ang-prev>Math.PI)ang-=2*Math.PI;while(ang-prev<-Math.PI)ang+=2*Math.PI;prev=ang;
   kf.push({translate:`${p[0]}px ${p[1]}px`,offset:p[2]});kr.push({rotate:`${ang}rad`,offset:p[2]})});
  const el=document.createElement('div');el.className='ss';el.style.setProperty('--c',q.c);el.innerHTML='<div class="r"><i class="tl"></i><i class="hd"></i></div>';box.appendChild(el);els.push(el);
  A(el,kf,{duration:DUR,easing:'linear'});
  A(el,[{opacity:0},{opacity:1,offset:.07},{opacity:1,offset:.93},{opacity:0}],{duration:DUR});
  A(el.firstElementChild,kr,{duration:DUR,easing:'linear'});
  A(el.firstElementChild,[{scale:1},{scale:1,offset:.9},{scale:.35}],{duration:DUR});
 });
 // the button reacts when the stars arrive
 const ring=document.createElement('i');ring.className='pr';ring.style.cssText=`left:${pr.left}px;top:${pr.top}px;width:${pr.width}px;height:${pr.height}px`;box.appendChild(ring);els.push(ring);
 A(ring,[{opacity:.9,transform:'scale(1)'},{opacity:0,transform:'scale(1.45,1.9)'}],{duration:900,delay:T2-60,easing:'cubic-bezier(.2,.7,.3,1)'});
 A(pillEl,[{scale:1},{scale:1.1,offset:.22},{scale:.97,offset:.5},{scale:1.04,offset:.72},{scale:1}],{duration:1300,delay:T2-60,easing:E2,fill:'none'});
 const ring2=ring.cloneNode();box.appendChild(ring2);els.push(ring2);A(ring2,[{opacity:.7,transform:'scale(1)'},{opacity:0,transform:'scale(1.7,2.4)'}],{duration:1200,delay:T2+180,easing:'cubic-bezier(.2,.7,.3,1)'});
 // merge in the seal: bright core, shock ring, seal pulse, tiny squash of the whole envelope, sparks
 const mg=document.createElement('i');mg.className='mg';mg.style.left=qx+'px';mg.style.top=qy+'px';box.appendChild(mg);els.push(mg);
 A(mg,[{opacity:0,transform:'scale(.2)'},{opacity:1,offset:.3,transform:'scale(1.1)'},{opacity:0,transform:'scale(2.4)'}],{duration:760,delay:T3-120,easing:'cubic-bezier(.2,.8,.3,1)'});
 const mr=document.createElement('i');mr.className='arr';mr.style.cssText=`left:${qx}px;top:${qy}px;z-index:31`;box.appendChild(mr);els.push(mr);
 A(mr,[{opacity:.9,transform:'scale(.2)'},{opacity:0,transform:'scale(4.2)'}],{duration:1100,delay:T3-60,easing:'cubic-bezier(.15,.7,.25,1)'});
 A(seal,[{scale:1},{scale:1.22,offset:.3},{scale:.96,offset:.62},{scale:1}],{duration:760,delay:T3-120,easing:E2,fill:'none'});
 A(env,[{scale:1},{scale:1.035,offset:.3},{scale:.995,offset:.65},{scale:1}],{duration:800,delay:T3-120,easing:E2,fill:'none'});
 for(let i=0;i<12;i++){const p=document.createElement('i');p.className='xspark';p.style.left=qx+'px';p.style.top=qy+'px';p.style.zIndex=32;box.appendChild(p);els.push(p);const a=i/12*Math.PI*2,rd=30+Math.random()*40;
  A(p,[{opacity:0,transform:'rotate(45deg) scale(.3)'},{opacity:1,offset:.15},{opacity:0,transform:`translate(${Math.cos(a)*rd}px,${Math.sin(a)*rd}px) rotate(45deg) scale(.8)`}],{duration:900,delay:T3-60,easing:'cubic-bezier(.2,.7,.3,1)'})}
 // ---- the strike: more reaction from the envelope itself ----
 const T=T3-100;
 // a ring the shape of the envelope ripples outward
 const er=env.getBoundingClientRect();
 for(let i=0;i<2;i++){const o=document.createElement('i');o.style.cssText=`position:absolute;z-index:29;pointer-events:none;border-radius:8px;border:1.5px solid rgba(255,230,160,.9);opacity:0;left:${er.left}px;top:${er.top}px;width:${er.width}px;height:${er.height}px`;box.appendChild(o);els.push(o);
  A(o,[{opacity:.8,transform:'scale(1)'},{opacity:0,transform:'scale(1.55,1.7)'}],{duration:1300,delay:T+i*220,easing:'cubic-bezier(.15,.7,.25,1)'})}
 // a golden sheen sweeps across the paper
 const sh=document.createElement('i');sh.style.cssText=`position:absolute;z-index:28;pointer-events:none;overflow:hidden;left:${er.left}px;top:${er.top}px;width:${er.width}px;height:${er.height}px;border-radius:5px;opacity:0;background:linear-gradient(105deg,transparent 35%,rgba(255,243,200,.75) 50%,transparent 65%);`;box.appendChild(sh);els.push(sh);
 A(sh,[{opacity:0,transform:'translateX(-60%)'},{opacity:1,offset:.25},{opacity:0,transform:'translateX(60%)'}],{duration:1200,delay:T+80,easing:'ease-in-out'});
 // eight thin rays flare out of the seal
 for(let i=0;i<8;i++){const ry=document.createElement('i');ry.style.cssText=`position:absolute;z-index:31;pointer-events:none;left:${qx-1}px;top:${qy-34}px;width:2px;height:34px;transform-origin:50% 100%;opacity:0;background:linear-gradient(transparent,rgba(255,240,190,.95));rotate:${i*45}deg`;box.appendChild(ry);els.push(ry);
  A(ry,[{opacity:0,transform:'scaleY(.2)'},{opacity:1,offset:.25,transform:'scaleY(1.4)'},{opacity:0,transform:'scaleY(2.2) translateY(-14px)'}],{duration:900,delay:T+60,easing:'ease-out'})}
 // the envelope rocks a little, like it was knocked, and the rings around it ripple
 A(env,[{rotate:'0deg'},{rotate:'-1.6deg',offset:.2},{rotate:'1.2deg',offset:.45},{rotate:'-.6deg',offset:.7},{rotate:'0deg'}],{duration:1100,delay:T,easing:'ease-out',fill:'none'});
 A($('rings'),[{scale:1},{scale:1.06,offset:.25},{scale:.99,offset:.6},{scale:1}],{duration:1400,delay:T,easing:E2,fill:'none'});
 // a second, wider spark shower
 for(let i=0;i<22;i++){const p=document.createElement('i');p.className='xspark';p.style.left=qx+'px';p.style.top=qy+'px';p.style.zIndex=32;box.appendChild(p);els.push(p);const a=Math.random()*Math.PI*2,rd=50+Math.random()*90;
  A(p,[{opacity:0,transform:'rotate(45deg) scale(.4)'},{opacity:1,offset:.12},{opacity:0,transform:`translate(${Math.cos(a)*rd}px,${Math.sin(a)*rd+30}px) rotate(45deg) scale(.7)`}],{duration:1200+Math.random()*600,delay:T+Math.random()*160,easing:'cubic-bezier(.15,.6,.3,1)'})}
 TO(()=>els.forEach(e=>e.remove()),DUR+1800);
}
function startIdle(){loopOnce();idle=window.setInterval(loopOnce,6800)}
let started=false;
let hintOut=()=>{};
function go(){
 if(started)return;if(!ready){pending=true;return}clearInterval(idle);stage.style.pointerEvents='none';startMusic();sfx.unlock();sfx.stopScheduled();hintOut();
 sfx.cue('charge',0);sfx.cue('crack',380);sfx.cue('flap',550);sfx.cue('leak',650);sfx.cue('swell',900,{dur:3.7});
 for(let i=0;i<6;i++)sfx.cue('ringPing',1250+i*170,{i});
 for(let i=0;i<16;i+=2)sfx.cue('twinkle',1300+i*150);
 sfx.cue('release',1650);
 A($('ssbox'),[{opacity:1},{opacity:0}],{duration:350});started=true;stage.classList.add('go');tilt.style.transition='transform 1.2s ease';tilt.style.transform='none';[h1,pillEl,skipEl].forEach(e=>A(e,[{opacity:1},{opacity:0}],{duration:700}));try{navigator.vibrate&&navigator.vibrate([14,40,14,60])}catch(e){}
 // 0. camera leans in over the envelope
 A(env,[{transform:'perspective(900px) rotateX(0deg) scale(1)'},{transform:'perspective(900px) rotateX(16deg) scale(1.08)'}],{duration:1500,easing:E1});
 // 1. the wax seal cracks, halves fall, little crumbs fly
 seal.classList.add('crack');TO(()=>seal.classList.add('broke'),380);
 crumbs.forEach((c,i)=>A(c,[{opacity:1,transform:'translate(0,0)'},{opacity:1,offset:.6},{opacity:0,transform:`translate(${(i-3.5)*16}px,${40+Math.random()*50}px) rotate(${Math.random()*360}deg)`}],{duration:900,delay:380+i*20,easing:'cubic-bezier(.3,.6,.4,1)'}));
 // 2. the flap lifts: a thin line of light escapes first, then it swings fully open
 A(flap,[{transform:'rotateX(0deg)',zIndex:4},{transform:'rotateX(14deg)',zIndex:4,offset:.14},{transform:'rotateX(96deg)',zIndex:4,offset:.5},{transform:'rotateX(180deg)',zIndex:1}],{duration:1500,delay:550,easing:'cubic-bezier(.4,0,.2,1)'});
 A($('shadeO'),[{opacity:0},{opacity:.42,offset:.5},{opacity:.2}],{duration:1500,delay:550});
 A($('cast'),[{opacity:1},{opacity:0}],{duration:600,delay:550});
 A($('leak'),[{opacity:0},{opacity:1,offset:.25},{opacity:1,offset:.7},{opacity:0}],{duration:1500,delay:650});
 // 3. light fills the inside and rises as a beam
 A($('inner'),[{opacity:0,transform:'scaleY(.35)'},{opacity:1,transform:'scaleY(1)'}],{duration:1400,delay:900,easing:E2});
 A($('shaft'),[{opacity:0,transform:'scaleY(.08)'},{opacity:1,transform:'scaleY(1)'}],{duration:1600,delay:1100,easing:E2});
 motes.forEach((m,i)=>A(m,[{opacity:0,transform:'translate(0,0) scale(.6)'},{opacity:.95,offset:.3},{opacity:0,transform:`translate(${(Math.random()-.5)*70}px,${-120-Math.random()*130}px) scale(1)`}],{duration:1800+Math.random()*900,delay:1100+i*90,easing:'ease-out'}));
 // ---- extra drama while the flap opens and the light is released ----
 A(env,[{scale:1},{scale:.965,offset:.3},{scale:1.05,offset:.65},{scale:1}],{duration:950,delay:150,easing:E1,fill:'none'});
 A($('ehalo'),[{opacity:0,transform:'scale(.45)'},{opacity:1,offset:.45,transform:'scale(1)'},{opacity:0,transform:'scale(1.9)'}],{duration:3200,delay:700,easing:'ease-out'});
 A($('warm'),[{opacity:0},{opacity:1,offset:.45},{opacity:.35}],{duration:4200,delay:1300,easing:'ease-in-out'});
 {const er0=env.getBoundingClientRect(),mx0=er0.left+er0.width/2,my0=er0.top+er0.height*.2,sb=$('sparks');
  for(let i=0;i<6;i++){const g=document.createElement('i');g.className='ering';g.style.cssText=`left:${mx0-er0.width*.3}px;top:${my0}px;width:${er0.width*.6}px;height:${er0.width*.16}px`;sb.appendChild(g);
   A(g,[{opacity:0,transform:'translateY(0) scale(.7,.7)'},{opacity:.85,offset:.2},{opacity:0,transform:`translateY(${-er0.height*(1.2+i*.08)}px) scale(${1.6+i*.15},1.3)`}],{duration:1700,delay:1250+i*170,easing:'cubic-bezier(.2,.7,.3,1)'})}
  for(let i=0;i<16;i++){const t=document.createElement('i');t.className='t4';const ax=mx0+(Math.random()-.5)*er0.width*1.3,ay=my0-er0.height*(.2+Math.random()*1.1);t.style.left=ax+'px';t.style.top=ay+'px';sb.appendChild(t);
   A(t,[{opacity:0,transform:'scale(.2) rotate(0deg)'},{opacity:1,offset:.4,transform:'scale(1.1) rotate(45deg)'},{opacity:0,transform:'scale(.2) rotate(90deg)'}],{duration:900+Math.random()*700,delay:1300+i*150,easing:'ease-in-out'})}
  // a soft tremor as the light is released, and a bigger swell as it blooms
  const shake=(d,m)=>A(stage,[{translate:'0 0'},{translate:`${m}px ${-m*.6}px`,offset:.15},{translate:`${-m}px ${m*.5}px`,offset:.35},{translate:`${m*.6}px ${m*.3}px`,offset:.55},{translate:`${-m*.3}px ${-m*.2}px`,offset:.78},{translate:'0 0'}],{duration:520,delay:d,easing:'ease-out'});
  shake(1650,2.2);shake(1700+5600*.52,2.8);}
 emerge(1700);
}
function emerge(T){
 const er=env.getBoundingClientRect(),W=innerWidth,H=innerHeight;
 const rays=$('rays'),flash=$('flash'),streak=$('streak');
 // the light ball swells into exactly where the page's own gold orb sits (same size, same spot)
 const D=Math.min(W*.72,440),cx=W/2,cy=H*.09+D/2;
 root.style.setProperty('--cy',cy+'px');
 const mx=er.left+er.width/2,my=er.top+er.height*0.2;
 const dx=mx-cx,dy=my-cy,s0=(er.width*0.15)/D;
 const dur=5600;
 sfx.cue('bloom',T+dur*.52);sfx.cue('landing',T+dur*.78);
 // 1) a small ball of light is born in the envelope, rises, hovers and pulses, then swells and drifts to centre
 const lb=$('lball');const bs=64,k=D/bs,ease='cubic-bezier(.4,0,.2,1)';
 const TR=[{translate:`${dx}px ${dy+er.height*.1}px`,offset:0},{translate:`${dx}px ${dy-er.height*.1}px`,offset:.1},{translate:`${dx}px ${dy-er.height*.42}px`,offset:.26},{translate:`${dx+8}px ${dy-er.height*.52}px`,offset:.4},{translate:`${dx*.7}px ${dy-er.height*.5}px`,offset:.5},{translate:`${dx*.12}px ${dy*.1-12}px`,offset:.78},{translate:'0px 0px',offset:1}];
 const SC=[{scale:s0*.15,offset:0},{scale:s0*.55,offset:.1},{scale:s0*.9,offset:.26},{scale:s0*1.05,offset:.4},{scale:s0*1.25,offset:.5},{scale:.74,offset:.76},{scale:1.04,offset:.9},{scale:1,offset:1}];
 A(lb,TR,{duration:dur,delay:T,easing:ease});
 A(lb,SC.map(f=>({scale:f.scale*k,offset:f.offset})),{duration:dur,delay:T,easing:ease});
 // it dissolves as the real orb (already fading in underneath) takes its place
 A(lb,[{opacity:0},{opacity:1,offset:.06},{opacity:1,offset:.56},{opacity:0,offset:.9},{opacity:0}],{duration:dur,delay:T});
 A(lb.firstElementChild,[{transform:'scale(1)'},{transform:'scale(1.22)',offset:.15},{transform:'scale(.95)',offset:.3},{transform:'scale(1.3)',offset:.45},{transform:'scale(1)',offset:.6},{transform:'scale(1.1)',offset:.8},{transform:'scale(1)'}],{duration:dur,delay:T,easing:'ease-in-out'});
 // the dark backdrop melts away so the real page (orb + wording) is revealed behind the light
 A($('bgx'),[{opacity:1},{opacity:1,offset:.3},{opacity:0,offset:.8},{opacity:0}],{duration:dur,delay:T,easing:'ease-in-out'});
 // trail of embers following the ball up out of the envelope
 const tb=$('sparks');
 for(let i=0;i<18;i++){const p=document.createElement('i');p.className='xspark';p.style.left=mx+'px';p.style.top=my+'px';tb.appendChild(p);
  const dd=(Math.random()-.5)*60;A(p,[{opacity:0,transform:'rotate(45deg) translate(0,0) scale(.4)'},{opacity:1,offset:.25},{opacity:0,transform:`translate(${dd}px,${-er.height*(.4+Math.random()*.5)}px) rotate(45deg) scale(.8)`}],{duration:1400+Math.random()*800,delay:T+i*130,easing:'ease-out'})}
 // rays, lens streak, shock rings
 A(rays,[{opacity:0,transform:'scale(.15) rotate(0deg)'},{opacity:.9,offset:.4,transform:'scale(.6) rotate(18deg)'},{opacity:0,transform:'scale(1.1) rotate(48deg)'}],{duration:dur+1000,delay:T+200,easing:'ease-out'});
 A(streak,[{opacity:0,transform:'scaleX(.05)'},{opacity:1,offset:.4,transform:'scaleX(.8)'},{opacity:0,transform:'scaleX(1.2)'}],{duration:1500,delay:T+dur*.5,easing:'ease-out'});
 [['sh1',0],['sh2',260],['sh3',520]].forEach(([id,d])=>A($(id),[{opacity:.9,transform:'scale(.2)'},{opacity:0,transform:'scale(3.4)'}],{duration:1600,delay:T+dur*.52+d,easing:'cubic-bezier(.2,.7,.3,1)'}));
 // the light washes the screen; the intro scene leans in, fades, and stars stream outward
 A(flash,[{opacity:0},{opacity:0,offset:.4},{opacity:.7,offset:.64},{opacity:0}],{duration:dur+600,delay:T,easing:'ease-in-out'});
 A($('intro'),[{opacity:1,transform:'scale(1)'},{opacity:1,offset:.22,transform:'scale(1.05)'},{opacity:0,transform:'scale(1.55)'}],{duration:dur*.95,delay:T+200,easing:'cubic-bezier(.5,0,.4,1)'});
 A(env,[{opacity:1},{opacity:1,offset:.5},{opacity:0}],{duration:1600,delay:T+300,easing:'ease-in'});
 // sparkle burst from the orb as it lands
 const box=$('sparks');
 for(let i=0;i<34;i++){const p=document.createElement('i');p.className='xspark';box.appendChild(p);const a=i/34*Math.PI*2+Math.random()*.3,r=(.5+Math.random()*.8)*Math.min(W,H)*.55;
  A(p,[{opacity:0,transform:'rotate(45deg) translate(0,0) scale(.3)'},{opacity:1,offset:.2},{opacity:0,transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r}px) rotate(45deg) scale(1)`}],{duration:1600+Math.random()*700,delay:T+dur*.78+Math.random()*200,easing:'cubic-bezier(.2,.7,.3,1)'})}
 // hand the stage to the real page: it starts its own entrance while the light is still swelling, then this overlay is removed
 TO(()=>hooks.onEnter(),T+dur*.34);
 TO(()=>hooks.onDone(),T+dur+1900);
}

function startMusic(){if(musicOn)return;musicOn=true;try{hooks.onStartMusic()}catch(e){}}
function skipNow(){
 if(started)return;started=true;window.clearInterval(idle);stage.style.pointerEvents='none';startMusic();sfx.unlock();sfx.stopScheduled();hintOut();sfx.cue('whoosh',0);sfx.cue('landing',300);
 A($('ssbox'),[{opacity:1},{opacity:0}],{duration:300});
 hooks.onEnter();A(stage,[{opacity:1},{opacity:0}],{duration:700,easing:'ease-in-out'});TO(()=>hooks.onDone(),800);
}
const onClick=(e)=>{if(e.target.closest&&e.target.closest('.sndhint'))return;if(e.target.closest&&e.target.closest('.skip')){e.stopPropagation();skipNow();return}startMusic();sfx.unlock();go()};
const onMove=(e)=>{if(!ready||started)return;const nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;tilt.style.transform=`rotateY(${nx*16}deg) rotateX(${-ny*12}deg)`};
stage.addEventListener('click',onClick);
stage.addEventListener('pointermove',onMove);
arrive();
// Sound button on the first screen. Sound is "on" by default; browsers keep pages silent until a tap, so until then it
// reads "Tap for sound". Once sound is running it reads "Sound on · tap to mute" and toggles the mute.
const hint=document.createElement('div');hint.className='sndhint';hint.setAttribute('role','button');hint.tabIndex=0;
hint.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg><span></span>';
stage.appendChild(hint);
const hintLabel=hint.querySelector('span');
const refreshHint=()=>{hintLabel.textContent=sfx.isMuted()?'Sound off · tap to unmute':'Sound on · tap to mute'};
refreshHint();
const hintAct=(e)=>{e.stopPropagation();sfx.toggle();refreshHint()};
hintOut=()=>{A(hint,[{opacity:1},{opacity:0}],{duration:500,fill:'forwards'});hint.style.pointerEvents='none'};
hint.addEventListener('click',hintAct);
hint.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();hintAct(e)}});
const offUnlock=sfx.subscribe(refreshHint);
A(hint,[{opacity:0,transform:'translate(-50%,8px)'},{opacity:1,transform:'translate(-50%,0)'}],{duration:900,delay:900,fill:'both',easing:E2});
return function cleanup(){
 offUnlock();sfx.clearQueue();
 timers.forEach(id=>window.clearTimeout(id));window.clearInterval(idle);
 stage.removeEventListener('click',onClick);stage.removeEventListener('pointermove',onMove);
 try{stage.getAnimations({subtree:true}).forEach(a=>a.cancel())}catch(e){}
 stage.innerHTML='';
};
}
