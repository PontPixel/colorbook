// ColorEngine sound: small effects synthesized with Web Audio (no audio files to download).
// Loaded before engine.js. The engine calls SFX.play(name, arg); the Settings switch sets SFX.enabled.
// The on/off choice is shared by all games on this site (localStorage['pontpixel-sound']).
window.SFX=(function(){
  const KEY='pontpixel-sound', AC=window.AudioContext||window.webkitAudioContext;
  let on=true; try{on=localStorage.getItem(KEY)!=='off';}catch(e){}
  // iPhone: 'ambient' makes Web Audio follow the silent switch and mix with the player's music.
  try{if(navigator.audioSession) navigator.audioSession.type='ambient';}catch(e){}
  let ctx=null, out=null, noiseBuf=null;
  // Browsers only allow audio after a user gesture, so the context is created (or resumed) on the first tap.
  function unlock(){
    if(!AC||!on) return;
    try{
      if(!ctx){ctx=new AC(); out=ctx.createGain(); out.gain.value=.5; out.connect(ctx.destination);}
      if(ctx.state==='suspended') ctx.resume();
    }catch(e){ctx=null;}
  }
  addEventListener('pointerdown',unlock,true); addEventListener('keydown',unlock,true);

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
    if(!noiseBuf){noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
    const t=ctx.currentTime+(o.at||0), src=ctx.createBufferSource(), fl=ctx.createBiquadFilter(), g=ctx.createGain();
    src.buffer=noiseBuf; fl.type=o.type||'lowpass'; fl.Q.value=o.q||1; fl.frequency.setValueAtTime(o.f||1200,t);
    if(o.to) fl.frequency.exponentialRampToValueAtTime(o.to,t+dur);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(o.gain||.2,t+(o.attack||.01)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(fl); fl.connect(g); g.connect(out); src.start(t); src.stop(t+dur+.05);
  }
  // A soft bell: fundamental plus a quiet octave-and-a-fifth partial.
  const bell=(f,at,dur=.6,v=.22)=>{tone(f,dur,{type:'triangle',gain:v,at}); tone(f*3,dur*.5,{gain:v*.18,at});};
  const NOTE=n=>440*Math.pow(2,(n-69)/12); // MIDI note → Hz
  const PENTA=[72,74,76,79,81,84,86,88,91,93]; // C major pentatonic from C5: parts climb as the picture fills
  const DROP={W:1175,C:988,M:880,Y:1319,K:659}; // each paint has its own "plip"

  const S={
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
  function play(name,arg){
    if(!on||!AC) return; unlock(); if(!ctx||!S[name]) return;
    try{S[name](arg);}catch(e){}
  }
  return {
    play, supported:!!AC,
    get enabled(){return on;},
    set enabled(v){on=!!v; try{localStorage.setItem(KEY,on?'on':'off');}catch(e){} if(on) unlock(); else if(ctx) ctx.suspend();}
  };
})();
