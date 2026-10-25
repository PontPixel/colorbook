// ColorEngine sound: small effects synthesized with Web Audio (no audio files to download).
// Loaded before engine.js. The engine calls SFX.play(name, arg); the Settings switch sets SFX.enabled.
// The on/off choice is shared by all games on this site (localStorage['pontpixel-sound']).
// Two sound sets: 'v2' (default: water drops, marimba, glockenspiel, through a soft room and a compressor)
// and 'v1' (the original beeps), kept so the staging cheat menu can compare them (localStorage['pontpixel-sfx']).
window.SFX=(function(){
  const KEY='pontpixel-sound', SET_KEY='pontpixel-sfx', AC=window.AudioContext||window.webkitAudioContext;
  let on=true, set='v2'; try{on=localStorage.getItem(KEY)!=='off'; set=localStorage.getItem(SET_KEY)==='v1'?'v1':'v2';}catch(e){}
  // iPhone: 'ambient' makes Web Audio follow the silent switch and mix with the player's music.
  try{if(navigator.audioSession) navigator.audioSession.type='ambient';}catch(e){}
  let ctx=null, out=null, bus=null, noiseBuf=null;
  // Browsers only allow audio after a user gesture, so the context is created (or resumed) on the first tap.
  function unlock(){
    if(!AC||!on) return;
    try{
      if(!ctx){
        ctx=new AC();
        out=ctx.createGain(); out.gain.value=.5; out.connect(ctx.destination); // v1: straight out, as before
        // v2 mix: everything goes through a compressor (even levels, no clipping on phone speakers),
        // with a little sent to a short generated room so the sounds don't feel dry.
        const comp=ctx.createDynamicsCompressor();
        comp.threshold.value=-20; comp.knee.value=12; comp.ratio.value=4; comp.attack.value=.003; comp.release.value=.2;
        const master=ctx.createGain(); master.gain.value=.85; comp.connect(master); master.connect(ctx.destination);
        bus={dry:ctx.createGain(), send:ctx.createGain()};
        bus.dry.connect(comp);
        const verb=ctx.createConvolver(), wet=ctx.createGain(); wet.gain.value=.22;
        verb.buffer=room(1.3); bus.send.connect(verb); verb.connect(wet); wet.connect(comp);
      }
      if(ctx.state==='suspended') ctx.resume();
    }catch(e){ctx=null;}
  }
  addEventListener('pointerdown',unlock,true); addEventListener('keydown',unlock,true);
  // Room impulse: stereo noise fading out, darker toward the tail.
  function room(sec){
    const n=Math.floor(ctx.sampleRate*sec), b=ctx.createBuffer(2,n,ctx.sampleRate);
    for(let c=0;c<2;c++){const d=b.getChannelData(c); let lp=0; for(let i=0;i<n;i++){const k=i/n; lp+=(Math.random()*2-1-lp)*(.9-.7*k); d[i]=lp*Math.pow(1-k,2.6);}}
    return b;
  }
  function noiseBuffer(){
    if(!noiseBuf){noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
    return noiseBuf;
  }

  // ---------- v1: the original sounds ----------
  // One enveloped oscillator. f can slide to o.to; o.at delays the start (seconds).
  function tone(f,dur,o={}){
    const t=ctx.currentTime+(o.at||0), g=ctx.createGain(), osc=ctx.createOscillator(), v=o.gain||.3;
    osc.type=o.type||'sine'; osc.frequency.setValueAtTime(f,t);
    if(o.to) osc.frequency.exponentialRampToValueAtTime(o.to,t+(o.slide||dur));
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+(o.attack||.005));
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    osc.connect(g); g.connect(out); osc.start(t); osc.stop(t+dur+.05);
  }
  // Filtered white noise (splashes, pours, thuds). The filter can sweep from o.f to o.to.
  function noise(dur,o={}){
    const t=ctx.currentTime+(o.at||0), src=ctx.createBufferSource(), fl=ctx.createBiquadFilter(), g=ctx.createGain();
    src.buffer=noiseBuffer(); fl.type=o.type||'lowpass'; fl.Q.value=o.q||1; fl.frequency.setValueAtTime(o.f||1200,t);
    if(o.to) fl.frequency.exponentialRampToValueAtTime(o.to,t+dur);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(o.gain||.2,t+(o.attack||.01)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(fl); fl.connect(g); g.connect(out); src.start(t); src.stop(t+dur+.05);
  }
  // A soft bell: fundamental plus a quiet octave-and-a-fifth partial.
  const bell=(f,at,dur=.6,v=.22)=>{tone(f,dur,{type:'triangle',gain:v,at}); tone(f*3,dur*.5,{gain:v*.18,at});};
  const NOTE=n=>440*Math.pow(2,(n-69)/12); // MIDI note → Hz
  const PENTA=[72,74,76,79,81,84,86,88,91,93]; // C major pentatonic from C5: parts climb as the picture fills
  const DROP={W:1175,C:988,M:880,Y:1319,K:659}; // each paint has its own "plip"
  const V1={
    drop:k=>{const f=DROP[k]||988; tone(f*.62,.14,{to:f,slide:.05,gain:.28}); noise(.05,{type:'bandpass',f:f*2,q:3,gain:.05});},
    undo:()=>tone(1100,.14,{to:520,slide:.1,gain:.22}),
    wrong:()=>{tone(196,.18,{type:'square',to:150,gain:.07}); tone(98,.2,{gain:.12});},
    pour:()=>{noise(.55,{f:1800,to:260,gain:.22}); [0,.09,.19,.3].forEach((at,i)=>tone(300-i*40,.08,{to:180-i*25,gain:.12,at}));},
    restore:p=>{const i=Math.min(PENTA.length-2,Math.floor((p||0)*(PENTA.length-2))); bell(NOTE(PENTA[i]),0,.5); bell(NOTE(PENTA[i+1]),.09,.7); noise(.12,{type:'highpass',f:5000,gain:.03,at:.05});},
    coin:()=>{tone(1319,.09,{type:'square',gain:.05}); tone(1760,.3,{type:'square',gain:.05,at:.07});},
    fanfare:()=>{[72,76,79,84,88].forEach((n,i)=>bell(NOTE(n),i*.1,.9,.2)); for(let i=0;i<8;i++) tone(NOTE(96+[0,4,7,12][i%4]),.25,{gain:.05,at:.6+i*.09});},
    stamp:()=>{tone(130,.3,{to:45,slide:.2,gain:.5}); noise(.14,{f:900,to:120,gain:.25});},
    star:i=>bell(NOTE([79,83,86][i]||86),0,.45,.2),
    fail:()=>{bell(NOTE(67),0,.4,.18); bell(NOTE(62),.18,.7,.18);},
    daily:()=>{[76,79,83,88].forEach((n,i)=>bell(NOTE(n),i*.08,.7,.18));}
  };
  V1.magic=V1.daily; V1.snap=V1.undo; V1.starLost=V1.fail; // the redesign's new events, mapped onto old sounds

  // ---------- v2: water, wood and metal ----------
  // Small random spread on pitch and level so repeated sounds never sound mechanical.
  const vary=(x,p)=>x*(1+(Math.random()*2-1)*p);
  // Sine/triangle partial with an exponential decay, into the mix and (some of it) into the room.
  function part(f,dur,o={}){
    const t=ctx.currentTime+(o.at||0), osc=ctx.createOscillator(), g=ctx.createGain(), v=o.gain||.2;
    osc.type=o.type||'sine'; osc.frequency.setValueAtTime(f,t);
    if(o.to) osc.frequency.exponentialRampToValueAtTime(o.to,t+(o.slide||dur*.4));
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+(o.attack||.003)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    osc.connect(g); route(g,o.send); osc.start(t); osc.stop(t+dur+.05);
  }
  function hiss(dur,o={}){
    const t=ctx.currentTime+(o.at||0), src=ctx.createBufferSource(), fl=ctx.createBiquadFilter(), g=ctx.createGain();
    src.buffer=noiseBuffer(); src.loop=true; fl.type=o.type||'bandpass'; fl.Q.value=o.q||1; fl.frequency.setValueAtTime(o.f||1200,t);
    if(o.to) fl.frequency.exponentialRampToValueAtTime(o.to,t+dur);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(o.gain||.1,t+(o.attack||.01)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(fl); fl.connect(g); route(g,o.send); src.start(t); src.stop(t+dur+.05);
  }
  function route(node,send){ node.connect(bus.dry); const s=ctx.createGain(); s.gain.value=send==null?.5:send; node.connect(s); s.connect(bus.send); }
  // Water drop: a short sine whose pitch jumps up fast, like a bubble closing (plus a faint splash).
  function bloop(f,at=0,v=.32){ part(f*.5,.16,{to:f,slide:.035,gain:v,at,send:.35}); part(f*2.02,.05,{gain:v*.12,at:at+.004,send:.2}); hiss(.04,{f:f*3,q:4,gain:.03,at,send:.2}); }
  // Marimba bar: warm fundamental, the 4× "tone bar" partial and a brief wooden knock.
  function marimba(f,at=0,v=.26,dur=.7){ part(f,dur,{gain:v,at,send:.45}); part(f*3.98,dur*.18,{gain:v*.32,at,send:.3}); part(f*9.2,.03,{gain:v*.08,at}); hiss(.012,{type:'highpass',f:2500,gain:v*.15,at,send:0}); }
  // Glockenspiel: bright metal bar with its inharmonic 2.76× and 5.4× partials and a long ring.
  function glock(f,at=0,v=.16,dur=1.3){ part(f,dur,{gain:v,at,send:.7}); part(f*2.76,dur*.35,{gain:v*.32,at,send:.6}); part(f*5.4,dur*.12,{gain:v*.12,at,send:.5}); }
  // Harp pluck: triangle with a quick decay and a softer octave.
  function pluck(f,at=0,v=.18,dur=.9){ part(f,dur,{type:'triangle',gain:v,at,send:.6}); part(f*2,dur*.4,{gain:v*.25,at,send:.5}); }
  // Whoosh: noise through a band-pass that sweeps up, swelling then fading, panned across; plus a thin airy top.
  function whoosh(dur){
    const t=ctx.currentTime, src=ctx.createBufferSource(), bp=ctx.createBiquadFilter(), g=ctx.createGain();
    src.buffer=noiseBuffer(); src.loop=true; bp.type='bandpass'; bp.Q.value=1.3;
    bp.frequency.setValueAtTime(320,t); bp.frequency.exponentialRampToValueAtTime(2600,t+dur*.75);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vary(.26,.1),t+dur*.3); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(bp); bp.connect(g);
    let last=g;
    if(ctx.createStereoPanner){ const p=ctx.createStereoPanner(); p.pan.setValueAtTime(-.5,t); p.pan.linearRampToValueAtTime(.6,t+dur); g.connect(p); last=p; }
    route(last,.35); src.start(t); src.stop(t+dur+.05);
    hiss(dur*.8,{type:'highpass',f:4000,to:7000,gain:.035,attack:dur*.3,send:.5});
  }
  const DROP2={W:1046,C:880,M:784,Y:1175,K:587}; // per paint; black is the lowest, yellow the brightest
  const V2={
    drop:k=>bloop(vary(DROP2[k]||880,.03),0,vary(.32,.12)),
    // the drop goes back up the dropper: falling pitch and a little suck of air
    undo:()=>{part(vary(900,.03),.16,{to:420,slide:.12,gain:.2,send:.3}); hiss(.12,{f:2400,to:700,q:2,gain:.05,send:.2});},
    // a soft wooden "nope" (two low bars a semitone apart) instead of a buzzer
    wrong:()=>{marimba(NOTE(52),0,.22,.35); marimba(NOTE(51),.07,.2,.45);},
    // slosh down the drain, then a few bubbles
    pour:()=>{hiss(.6,{f:1800,to:350,q:1.4,gain:.16,send:.4}); [0,.08,.17,.27,.36].forEach((at,i)=>bloop(vary(520-i*55,.05),at+.05,.16));},
    // parts still climb the pentatonic scale as the picture fills; a faint glockenspiel sparkle on top
    restore:p=>{const i=Math.min(PENTA.length-2,Math.floor((p||0)*(PENTA.length-2)));
      marimba(NOTE(PENTA[i]),0,.26); marimba(NOTE(PENTA[i+1]),.09,.26,.9); glock(NOTE(PENTA[i+1]+12),.12,.05,.8);},
    coin:()=>{glock(NOTE(88),0,.12,.35); glock(NOTE(95),.07,.13,.9);},
    // harp run up the chord, then a glockenspiel shimmer
    fanfare:()=>{[60,64,67,72,76,79,84].forEach((n,i)=>pluck(NOTE(n),i*.065,.17)); [96,100,103,108].forEach((n,i)=>glock(NOTE(n),.5+i*.09,.07,1.4)); marimba(NOTE(48),.45,.2,1.2);},
    // a heavy rubber stamp: low thump plus a paper slap
    stamp:()=>{part(120,.28,{to:48,slide:.15,gain:.5,send:.2}); hiss(.09,{type:'lowpass',f:1400,to:200,gain:.22,send:.15}); hiss(.03,{type:'highpass',f:3000,gain:.06,send:0});},
    star:i=>{glock(NOTE([84,88,91][i]||91),0,.15,1.1);},
    fail:()=>{[67,64,60].forEach((n,i)=>marimba(NOTE(n),i*.16,.2,.8));},
    daily:()=>{[76,79,83,88].forEach((n,i)=>glock(NOTE(n),i*.08,.12,1));},
    // Magic: a quick sparkle run with a breath of air
    magic:()=>{[84,88,91,96,100].forEach((n,i)=>glock(NOTE(n),i*.04,.06,.7)); hiss(.35,{type:'highpass',f:6000,gain:.025,send:.6});},
    // a removed paint blows away as dust: an airy whoosh that sweeps up and drifts left to right, like the grains
    snap:()=>whoosh(.62),
    // a star falls off the pace row
    starLost:()=>{part(NOTE(91),.4,{to:NOTE(79),slide:.35,gain:.09,send:.6}); glock(NOTE(79),.12,.05,.5);}
  };
  const SETS={v1:V1,v2:V2};
  function play(name,arg){
    if(!on||!AC) return; unlock(); if(!ctx) return;
    const fn=SETS[set][name]; if(!fn) return;
    try{fn(arg);}catch(e){}
  }
  return {
    play, supported:!!AC, names:Object.keys(V2),
    get enabled(){return on;},
    set enabled(v){on=!!v; try{localStorage.setItem(KEY,on?'on':'off');}catch(e){} if(on) unlock(); else if(ctx) ctx.suspend();},
    get set(){return set;},
    set set(v){set=v==='v1'?'v1':'v2'; try{localStorage.setItem(SET_KEY,set);}catch(e){}}
  };
})();
