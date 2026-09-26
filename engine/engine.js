// ColorEngine: the shared game (scenes, mixing, boosters, coins, tiers, celebration, sharing).
// A game page loads engine/core.js, then its own levels.js (sets window.GAME), then this file.
(function(){
const {PAINTS,PMAP,mix,hex,lab,dE,matchPct,BLANK,BLANK_STROKE,INK}=CF;
const G=window.GAME, LEVELS=G.levels, GAME_NAME=G.name;
const {t,tn}=I18N; if(G.strings) I18N.add(G.strings);
const HALL=G.hall||null; // optional gallery-hall home screen (ColorGallery)
const T=l=>t(l.title), N=r=>t(r.name), PN=k=>t(PMAP[k].name); // localized level title, part name, paint name
document.body.insertAdjacentHTML('afterbegin',`
<!-- Home (menu) scene -->
<main class="home${HALL?' hallMode':''}" id="home">
  <div class="topbar">
    <div class="pill" id="homeStars">★ 0</div>
    <div class="topr">
      <button class="iconbtn" id="settingsBtn" aria-label="${t('Settings')}"></button>
      <div class="pill coins"><span class="coin"></span><span class="coinCount">0</span></div>
    </div>
  </div>
  <section class="homeMain" id="homeMain">
    <img class="logo" src="${G.logo}" alt="${GAME_NAME}" width="137" height="210">
    <button class="nextPic" id="nextPic" aria-label="${t('Play next picture')}"></button>
    <div class="nextLabel" id="nextLabel"></div>
    <div class="nextTitle" id="nextTitle"></div>
    <div class="hallWrap" id="hallWrap" hidden>
      <div class="hallRoom"><small id="hallRoomNo"></small><b id="hallRoomName"></b><span id="hallRoomProg"></span></div>
      <div class="hall"><div class="hallTrack" id="hallTrack"></div></div>
      <div class="hallDots" id="hallDots"></div>
      <div class="hallPlaque"><div class="t" id="hallTitle"></div><div class="s" id="hallSub"></div></div>
    </div>
    <div class="chbar" id="homeCh" hidden></div>
    <button class="btn play" id="playBtn">${t('Play')}</button>
    <button class="btn quizbtn" id="dailyQuizBtn" hidden></button>
  </section>
  <section class="gallery" id="gallery" hidden>
    <h2>${t(HALL?'Collection':'Gallery')}</h2>
    <div class="ggrid" id="ggrid"></div>
  </section>
  <nav class="tabbar" aria-label="${t('Menu')}">
    <button class="tab" data-tab="home" aria-current="true"></button>
    <button class="tab" data-tab="gallery" aria-current="false"></button>
  </nav>
</main>

<!-- Game scene -->
<div class="wrap" id="game" hidden>
  <div class="gamebar">
    <button class="iconbtn" id="backBtn" aria-label="${t('Back to menu')}"></button>
    <div class="pill" id="progress">0 / 10</div>
    <div class="pill tier" id="tierPill" hidden></div>
    <div class="paintgauge" title="${t('Paint left for this picture')}">
      <div class="bar"><i id="paintFill"></i></div>
      <span id="paintLeft">40</span>
    </div>
    <div class="pill coins" id="coins" title="${t('Coins')}"><span class="coin"></span><span class="coinCount">0</span></div>
  </div>

  <div class="board">
  <div class="stage">
  <div class="frame">
    <svg class="scene" id="scene" viewBox="0 0 320 240" aria-label="${t('Faded picture')}"></svg>
    <div class="stamp" id="stamp" hidden>${t('Restored')}</div>
  </div>
  <div class="credit" id="credit"></div>
  <div class="chbar" id="chBar" hidden></div>
  </div>

  <section class="mixer" aria-label="${t('Mixing table')}">
    <div class="swatches">
      <div class="sw">
        <div class="chip" id="targetChip"></div>
        <div class="target-name" id="targetName"></div>
      </div>
      <div class="sw">
        <div class="chip empty" id="mixChip"></div>
        <div class="drops" id="drops"></div>
      </div>
    </div>
    <div class="meter" id="meter" role="progressbar" aria-label="${t('Match')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div class="bar"><i id="barFill"></i></div>
    </div>
    <div class="msg" id="msg"></div>
    <div class="hint" id="hint"></div>
    <div class="paints" id="paints"></div>
    <div class="coachTip" id="coachTip" hidden></div>
    <div class="actions">
      <div class="boosters">
        <button class="btn boost" id="emptyBtn"></button>
        <button class="btn boost" id="undoBtn"></button>
        <button class="btn boost" id="pickBtn"></button>
        <button class="btn boost" id="hintBtn"></button>
      </div>
    </div>
  </section>
  </div>
</div>

<div class="overlay" id="endOverlay" hidden>
  <div class="card">
    <h2 id="endTitle"></h2>
    <div class="stars" id="endStars"></div>
    <p id="endText"></p>
    <div class="share" id="shareBox" hidden>
      <div class="note" id="shareNote"></div>
      <input id="nameInput" maxlength="16" placeholder="${t('Your name (optional)')}" autocomplete="nickname" aria-label="${t('Your name')}">
      <button class="btn accent" id="shareBtn">${t('Challenge a friend')}</button>
    </div>
    <button class="btn accent" id="quizOfferBtn" hidden></button>
    <button class="btn primary" id="rescueBtn" hidden></button>
    <div class="row">
      <button class="btn iconbtn" id="endHomeBtn" aria-label="${t('Menu')}"></button>
      <button class="btn" id="retryBtn">${t('Replay')}</button>
      <button class="btn primary" id="nextBtn">${t('Next picture')}</button>
    </div>
  </div>
</div>
<div class="overlay" id="introOverlay" hidden>
  <div class="card">
    <h2 id="introTitle"></h2>
    <p id="introText"></p>
    <div class="col" id="introBoosters"></div>
    <button class="btn primary" id="introBtn">${t("Let's paint")}</button>
  </div>
</div>
<div class="overlay" id="quizOverlay" hidden>
  <div class="card quizcard">
    <div class="quizImg" id="quizImg"></div>
    <div class="quizEyebrow" id="quizEyebrow"></div>
    <div class="quizTitle" id="quizTitle"></div>
    <h2 id="quizQ"></h2>
    <div class="quizOpts" id="quizOpts"></div>
    <p class="quizResult" id="quizResult" hidden></p>
    <button class="btn primary" id="quizDone" hidden>${t('Continue')}</button>
  </div>
</div>
<div class="overlay" id="quitOverlay" hidden>
  <div class="card">
    <h2>${t('Leave this picture?')}</h2>
    <p>${t('Parts you restored in this picture will be lost. Coins you earned stay.')}</p>
    <div class="row">
      <button class="btn" id="quitStay">${t('Keep painting')}</button>
      <button class="btn primary" id="quitLeave">${t('Leave')}</button>
    </div>
  </div>
</div>
<div class="overlay" id="settingsOverlay" hidden>
  <div class="card settings">
    <h2>${t('Settings')}</h2>
    <div class="setrow"><span>${t('Theme')}</span>
      <div class="seg" id="setTheme"><button data-v="auto">${t('Auto')}</button><button data-v="light">${t('Light')}</button><button data-v="dark">${t('Dark')}</button></div></div>
    <div class="setrow"><span>${t('Language')}</span>
      <div class="seg" id="setLang"><button data-v="auto">${t('Auto')}</button><button data-v="en">English</button><button data-v="fr">Français</button><button data-v="ru">Русский</button></div></div>
    <div class="setrow"><span>${t('Vibration')}</span><button class="switch" id="setVib" role="switch" aria-checked="true" aria-label="${t('Vibration')}"><i></i></button></div>
    <p class="setnote" id="vibNote" hidden>${t("This browser can't vibrate (iPhone Safari doesn't support it).")}</p>
    <button class="btn primary" id="settingsDone">${t('Done')}</button>
  </div>
</div>
<div class="toast" id="toast"></div>
<div class="coachDim" id="coachDim" hidden></div>
<canvas id="fx" aria-hidden="true"></canvas>
`);

// Tier = paint slack (budget / sum of recipe sizes) and coin multiplier.
const TIERS={easy:{ratio:1.8,mult:1,label:''},normal:{ratio:1.45,mult:1,label:''},hard:{ratio:1.25,mult:2,label:t('Hard')},nightmare:{ratio:1.12,mult:3,label:t('Nightmare')}};
LEVELS.forEach(L=>{
  L.regions.forEach(r=>{r.target=mix(r.recipe);r.min=Object.values(r.recipe).reduce((a,b)=>a+b,0);});
  L.tier=L.tier||'normal';
  if(!L.budget) L.budget=Math.ceil(L.regions.reduce((a,r)=>a+r.min,0)*TIERS[L.tier].ratio);
});

// ---------- Boosters & economy ----------
const ICONS={
  empty:'<path d="M4 10h15a7.5 6.5 0 0 1-15 0Z"/><path d="M6.5 6.5 4.5 4"/><circle cx="3" cy="13.5" r="1.1"/>',
  undo:'<path d="M9 5 4 10l5 5"/><path d="M4 10h10a5 5 0 0 1 0 10h-3"/>',
  pick:'<path d="m14.5 3.5 6 6-2.5 2.5-6-6z"/><path d="m13 8-8.5 8.5V20h3.5l8.5-8.5"/>',
  hint:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  home:'<path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  gallery:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m3.5 18 5.5-5 4 3.5 3-2.5 4.5 4"/>',
  back:'<path d="M15 5 8 12l7 7"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  auto:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  hall:'<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-6 10 6Z"/>',
  quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17h.01"/>'};
const icon=k=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
const BOOSTERS={
  empty:{name:t('Empty'),price:15,text:t('Pours out the whole bowl and gives all its paint back.')},
  undo:{name:t('Undo'),price:20,text:t('Takes back your last drop and refunds its paint.')},
  pick:{name:t('Pick'),price:30,text:t('Tap it, then tap any drop in the bowl to remove just that color. The paint comes back.')},
  hint:{name:t('Hint'),price:40,text:t('Shows the next paint to add for the part you are on. That part can earn at most 2 stars.')}};
const FREE_BOOSTERS=3, RESCUE_PRICE=30, COINS_PER_STAR=3, FIRST_CLEAR_BONUS=20, REPLAY_BONUS=5;
const introAt=b=>LEVELS.findIndex(l=>l.intro===b);
const FIRST_PROPER=LEVELS.findIndex(l=>l.id===G.firstProper); // share/challenge from here on
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---------- Saved progress (per viewer, optional) ----------
let save={best:{},coins:0,inv:{},seen:{},tut:{},challenge:null,name:''};
try{const s=JSON.parse(localStorage.getItem(G.saveKey)||'null');if(s&&s.best)save=Object.assign(save,s);}catch(e){}
function persist(){try{localStorage.setItem(G.saveKey,JSON.stringify(save));}catch(e){}}
const unlocked=i=>i===0||save.best[LEVELS[i-1].id]!=null||save.best[LEVELS[i].id]!=null;

// A challenge link looks like ?c=<level id>&s=<stars to beat>&n=<friend's name>
(function readChallenge(){
  let q; try{q=new URLSearchParams(location.search);}catch(e){return;}
  const c=q.get('c'), sc=parseInt(q.get('s'),10);
  if(!c||!LEVELS.some(l=>l.id===c)||!(sc>=0&&sc<=999)) return;
  save.challenge={level:c,score:sc,from:(q.get('n')||t('A friend')).trim().slice(0,16)||t('A friend'),fresh:true}; persist();
  try{history.replaceState(null,'',location.pathname);}catch(e){}
})();

// ---------- State ----------
const $=id=>document.getElementById(id);
const scene=$('scene');
let L, state;

// ---------- Menu scene: home (next picture + Play) and gallery (replay any picture) ----------
const starRow=b=>[0,1,2].map(i=>`<span class="${i<b?'':'off'}">★</span>`).join('');
function thumbSVG(lv,colored){
  const byId=Object.fromEntries(lv.regions.map(r=>[r.id,r]));
  const reg=r=>r.stroke
    ?`<g fill="none" stroke="${colored?hex(r.target):BLANK_STROKE}" stroke-width="${r.stroke}" stroke-linecap="round">${r.svg}</g>`
    :`<g fill="${colored?hex(r.target):BLANK}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round">${r.svg}</g>`;
  return `<svg viewBox="0 0 320 240" aria-hidden="true">${lv.bg||''}${lv.order.map(id=>reg(byId[id])).join('')}${lv.decor}</svg>`;
}
// Next picture to play: first unfinished one, or the challenged one if it is unlocked.
function nextIndex(){
  if(save.challenge){const ci=LEVELS.findIndex(l=>l.id===save.challenge.level); if(ci>=0&&unlocked(ci)) return ci;}
  const i=LEVELS.findIndex(l=>save.best[l.id]==null);
  return i<0?LEVELS.length-1:i;
}
function renderMenu(){
  const i=nextIndex(), lv=LEVELS[i], b=save.best[lv.id], allDone=LEVELS.every(l=>save.best[l.id]!=null);
  $('nextPic').innerHTML=thumbSVG(lv,false);
  $('nextLabel').textContent=allDone&&!save.challenge?t('All pictures restored'):t('Picture {i} of {n}',{i:i+1,n:LEVELS.length})+(TIERS[lv.tier].label?` · ${TIERS[lv.tier].label}`:'');
  $('nextTitle').innerHTML=esc(T(lv))+(b!=null?`<span class="tstars">${starRow(b)}</span>`:'');
  $('playBtn').textContent=b!=null?t('Play again'):t('Play');
  $('homeStars').textContent='★ '+LEVELS.reduce((a,l)=>a+(save.best[l.id]||0),0);
  const ch=save.challenge; $('homeCh').hidden=!ch;
  if(ch){const cl=LEVELS.find(l=>l.id===ch.level);$('homeCh').textContent='🏆 '+t('{from} challenged you on {title}. Beat {score}★.',{from:ch.from,title:T(cl),score:ch.score});}
  $('ggrid').innerHTML=LEVELS.map((l,k)=>{const bb=save.best[l.id], ok=unlocked(k);
    return `<button class="gcard" data-i="${k}" ${ok?'':'disabled'} aria-label="${esc(T(l))}${ok?'':', '+t('locked')}">${thumbSVG(l,bb!=null)}${ok?'':`<span class="lockico">${icon('lock')}</span>`}<b>${k+1}. ${esc(T(l))}${TIERS[l.tier].label?` <em class="gtier">${TIERS[l.tier].label}</em>`:''}</b><small>${bb!=null?starRow(bb):''}</small></button>`;}).join('');
  renderDailyQuiz();
  if(HALL) renderHall();
  renderCoins();
}
function showTab(t){
  $('homeMain').hidden=t!=='home'; $('gallery').hidden=t!=='gallery';
  document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t));
  if(HALL&&t==='home') requestAnimationFrame(()=>centerOn(hallCenter,false));
}
function goHome(tab){
  state=null; parts=[]; hideCoach();
  ['endOverlay','introOverlay','quitOverlay','quizOverlay','settingsOverlay'].forEach(id=>$(id).hidden=true);
  $('game').hidden=true; $('home').hidden=false;
  renderMenu(); showTab(tab||'home'); scrollTo(0,0);
}
document.querySelectorAll('.tab').forEach(b=>{
  const home=b.dataset.tab==='home';
  b.innerHTML=icon(home?(HALL?'hall':'home'):'gallery')+(home?t(HALL?'Hall':'Home'):t(HALL?'Collection':'Gallery'));
  b.onclick=()=>showTab(b.dataset.tab);
});
$('playBtn').onclick=()=>{ if(HALL){ if(unlocked(hallCenter)) start(hallCenter); } else start(nextIndex()); };
$('nextPic').onclick=()=>start(nextIndex());
$('ggrid').addEventListener('click',e=>{const c=e.target.closest('.gcard');if(c&&!c.disabled)start(+c.dataset.i);});
$('backBtn').innerHTML=icon('back'); $('endHomeBtn').innerHTML=icon('home');
$('backBtn').onclick=()=>{
  if(state&&!state.finished&&Object.keys(state.done).length) $('quitOverlay').hidden=false; else goHome();
};
$('quitStay').onclick=()=>{$('quitOverlay').hidden=true;};
$('quitLeave').onclick=()=>goHome();
$('endHomeBtn').onclick=()=>goHome();

function start(i){
  L=LEVELS[i]; L.index=i;
  state={done:{},stars:{},used:{},hinted:{},rescued:{},drops:[],picking:false,forced:false,hintMsg:null,paint:L.budget,earned:0,finished:false,quizUsed:false};
  $('home').hidden=true; $('game').hidden=false; scrollTo(0,0);
  $('credit').innerHTML=L.credit?t(L.credit):'';
  const ks=L.paints||PAINTS.map(p=>p.k);
  $('paints').style.setProperty('--n',ks.length);
  $('paints').innerHTML=ks.map(k=>PMAP[k]).map(p=>`<button class="paint" data-k="${p.k}" aria-label="${t('Add {paint}',{paint:t(p.name)})}"><span class="blob" style="background:${hex(p.rgb)}"></span>${t(p.name)}</button>`).join('');
  hideCoach(); parts=[];
  document.querySelector('.frame').classList.remove('celebrate'); $('stamp').hidden=true;
  buildScene(); updateHud(); renderCoins();
  $('endOverlay').hidden=true;
  select(L.regions[0].id);
  showIntro();
}
function showIntro(){
  // Hand out boosters whose intro picture has been reached (also covers players who skip ahead).
  const fresh=Object.keys(BOOSTERS).filter(b=>save.inv[b]==null&&introAt(b)>=0&&introAt(b)<=L.index);
  fresh.forEach(b=>save.inv[b]=FREE_BOOSTERS);
  const tip=!save.seen[L.id]&&L.tip;
  const tierKey='tier-'+L.tier, tierNote=TIERS[L.tier].label&&!save.seen[tierKey];
  if(tierNote) save.seen[tierKey]=true;
  const chal=save.challenge&&save.challenge.fresh?save.challenge:null;
  if(chal) chal.fresh=false;
  save.seen[L.id]=true; persist(); renderActions();
  if(!tip&&!fresh.length&&!chal&&!tierNote) return;
  $('introTitle').textContent=chal?t('{from} challenged you!',{from:chal.from}):tip?t(tip.title):tierNote?t('{tier} picture',{tier:TIERS[L.tier].label}):t('New booster');
  $('introText').innerHTML=tip?t(tip.text):'';
  $('introText').hidden=!tip;
  let html='';
  if(chal){
    const ci=LEVELS.findIndex(l=>l.id===chal.level), n=LEVELS.slice(0,ci).filter(l=>save.best[l.id]==null).length;
    html+=`<div class="booster">🏆 ${t('Restore <b>{title}</b> with more than <b>{score}★</b>.',{title:esc(T(LEVELS[ci])),score:chal.score})}`+
      (n&&!unlocked(ci)?' '+t('First, finish the warm-up pictures to unlock it ({pics}).',{pics:tn(n,'picture')}):'')+'</div>';
  }
  if(tierNote) html+=`<div class="booster"><b>${t('{tier} picture.',{tier:TIERS[L.tier].label})}</b> ${L.tier==='nightmare'?t('Very little spare paint and colors that look almost the same.'):t('Less spare paint and closer shades than usual.')} ${t('Boosters help here. Rewards are ×{m}.',{m:TIERS[L.tier].mult})}</div>`;
  html+=fresh.map(b=>`<div class="booster">${icon(b)}<b>${t('New booster: {name}',{name:BOOSTERS[b].name})}</b><br>${BOOSTERS[b].text}<br>${t('You get {n} free. After that, {price} each.',{n:FREE_BOOSTERS,price:BOOSTERS[b].price+' <span class="coin"></span>'})}</div>`).join('');
  $('introBoosters').innerHTML=html;
  $('introOverlay').hidden=false;
}
$('introBtn').onclick=()=>{$('introOverlay').hidden=true;};

function regionEl(r){
  return r.stroke
    ? `<g class="region" data-id="${r.id}" fill="none" stroke="${BLANK_STROKE}" stroke-width="${r.stroke}" stroke-linecap="round">${r.svg}</g>`
    : `<g class="region" data-id="${r.id}" fill="${BLANK}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round">${r.svg}</g>`;
}
function buildScene(){
  const byId=Object.fromEntries(L.regions.map(r=>[r.id,r]));
  scene.innerHTML=`<g pointer-events="none">${L.bg||''}</g>`+L.order.map(id=>regionEl(byId[id])).join('')+L.decor+
    L.regions.filter(r=>r.crack).map(r=>`<path class="crack" data-for="${r.id}" d="${r.crack}"/>`).join('')+
    '<g id="selLayer"></g><g id="fxLayer" pointer-events="none"></g>';
  scene.setAttribute('aria-label',t('Faded picture')+': '+T(L));
  scene.querySelectorAll('.region').forEach(g=>g.addEventListener('click',()=>{if(!state.done[g.dataset.id]&&!state.forced&&!state.applying)select(g.dataset.id);}));
}
const current=()=>L.regions.find(x=>x.id===state.sel);
function select(id){
  if(!state) return;
  state.sel=id; state.drops=[]; state.picking=false; state.hintMsg=null; state.applying=false;
  scene.querySelectorAll('.region').forEach(g=>g.classList.toggle('sel',g.dataset.id===id));
  const r=current();
  $('selLayer').innerHTML=r.stroke?`<g class="selOutline thick" style="stroke-width:${r.stroke+6}">${r.svg}</g>`:`<g class="selOutline">${r.svg}</g>`;
  $('targetChip').style.background=hex(r.target);
  $('targetName').textContent=N(r);
  renderHint(); renderMix();
}
function counts(){const c={};state.drops.forEach(k=>c[k]=(c[k]||0)+1);return c;}
const sumStars=()=>Object.values(state.stars).reduce((a,b)=>a+b,0);

function renderMix(override){
  const m=mix(counts()),chip=$('mixChip'),r=current();
  if(!state.drops.length) state.picking=false;
  chip.classList.toggle('empty',!m); chip.style.background=m?hex(m):'';
  $('drops').classList.toggle('picking',state.picking);
  $('drops').innerHTML=state.drops.length?state.drops.map((k,i)=>`<span data-i="${i}" title="${PN(k)}" style="background:${hex(PMAP[k].rgb)}"></span>`).join(''):`<em>${t('add paint')}</em>`;
  const p=m?matchPct(m,r.target):0;
  $('meter').setAttribute('aria-valuenow',p); $('meter').setAttribute('aria-valuetext',t('{p}% match',{p}));
  const f=$('barFill');f.style.width=p+'%';f.style.background=p>=95?'var(--ok)':p>=75?'var(--gold)':'var(--warn)';
  renderActions();
  const msg=$('msg');
  if(override){msg.textContent=override[0];msg.className='msg '+override[1];}
  else if(state.picking){msg.textContent=t('Tap the drop you want to take out.');msg.className='msg';}
  else if(!m){msg.textContent=t('Mix to match. Every drop uses paint.');msg.className='msg';}
  else if(p>=95){msg.textContent=t('Match! Painting…');msg.className='msg good';}
  else{msg.textContent=advice(m,r.target);msg.className='msg';}
}
function advice(m,t){
  const dl=lab(m)[0]-lab(t)[0];
  const hasBW=!L.paints||L.paints.includes('W');
  if(dl>10) return hasBW?t('Too light. Add color or a touch of black.'):t('Not quite. Check which paints the target needs.');
  if(dl<-10) return hasBW?t('Too dark. Try adding white.'):t('Not quite. Check which paints the target needs.');
  return t('Brightness is close. The hue is off.');
}
// Hint = only the next useful step toward the recipe, given what is already in the bowl.
function nextHint(){
  const r=current(), c=counts();
  const bad=Object.keys(c).find(k=>!r.recipe[k]);
  if(bad) return {k:bad,remove:true};
  let m=1; for(const k in c) m=Math.max(m,Math.ceil(c[k]/r.recipe[k]));
  let best=null,d=0; for(const k in r.recipe){const def=m*r.recipe[k]-(c[k]||0); if(def>d){d=def;best=k;}}
  return best?{k:best}:{done:true};
}
function renderHint(){
  const h=state.hintMsg, el=$('hint');
  el.classList.toggle('on',!!h);
  const dot=h&&h.k?`<span class="dot" style="background:${hex(PMAP[h.k].rgb)}"></span> <b>${PN(h.k)}</b>`:'';
  if(h) el.innerHTML=h.done?t('Hint: your mix is right.')
    :h.remove?t('Hint: take out the {paint}. {part} has none.',{paint:dot,part:esc(N(current()))})
    :t('Hint: add {paint} next.',{paint:dot});
  renderActions();
}
function renderActions(){
  if(!state) return;
  const has=state.drops.length>0;
  for(const b in BOOSTERS){
    const btn=$(b+'Btn'), n=save.inv[b], locked=n==null, lv=introAt(b);
    btn.classList.toggle('locked',locked);
    const badge=locked?'':state.forced&&b==='undo'?`<span class="badge">${t('FREE')}</span>`
      :`<span class="badge${n?'':' buy'}">${n?n:BOOSTERS[b].price+'<span class="coin"></span>'}</span>`;
    btn.innerHTML=icon(locked?'lock':b)+`<span>${locked?t('Pic {n}',{n:lv+1}):BOOSTERS[b].name}</span>`+badge;
    btn.title=locked?t('{name} unlocks in picture {n}: {title}',{name:BOOSTERS[b].name,n:lv+1,title:T(LEVELS[lv])}):BOOSTERS[b].text;
    btn.setAttribute('aria-label',locked?t('{name}, locked until picture {n}',{name:BOOSTERS[b].name,n:lv+1}):`${BOOSTERS[b].name}, ${n?t('{n} left',{n}):tn(BOOSTERS[b].price,'coin')}`);
    btn.disabled=false;
  }
  if(save.inv.empty!=null) $('emptyBtn').disabled=!has;
  if(save.inv.undo!=null) $('undoBtn').disabled=!has;
  if(save.inv.pick!=null){$('pickBtn').disabled=!has; $('pickBtn').classList.toggle('on',state.picking);}
  if(save.inv.hint!=null) $('hintBtn').disabled=!!state.hintMsg||state.finished;
}
function updateHud(){
  $('progress').textContent=Object.keys(state.done).length+' / '+L.regions.length;
  $('tierPill').hidden=!TIERS[L.tier].label; $('tierPill').textContent=TIERS[L.tier].label;
  $('paintLeft').textContent=state.paint;
  const f=$('paintFill'),pc=Math.min(100,state.paint/L.budget*100);
  f.style.width=pc+'%';f.style.background=pc>40?'var(--accent)':pc>15?'var(--gold)':'var(--warn)';
  const ch=save.challenge, bar=$('chBar'); bar.hidden=!ch;
  if(ch){const lv=LEVELS.find(l=>l.id===ch.level);
    bar.textContent='🏆 '+(L.id===ch.level?t('Beat {from}: {score}★  ·  You: {you}★',{from:ch.from,score:ch.score,you:sumStars()}):t('{from} challenged you on {title}. Beat {score}★ there.',{from:ch.from,title:T(lv),score:ch.score}));}
}
function renderCoins(bump){
  document.querySelectorAll('.coinCount').forEach(e=>e.textContent=save.coins);
  const el=$('coins'); if(bump){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
}
function addCoins(n){save.coins+=n; if(n>0&&state) state.earned+=n; persist(); renderCoins(true);}
function isLocked(b){
  if(save.inv[b]!=null) return false;
  const lv=introAt(b); toast(t('{name} unlocks in picture {n}: {title}',{name:BOOSTERS[b].name,n:lv+1,title:T(LEVELS[lv])})); return true;
}
// Use one booster from the inventory, or buy it with coins when the inventory is empty.
function canUse(b){return save.inv[b]>0||save.coins>=BOOSTERS[b].price;}
function spend(b){
  if(save.inv[b]>0){save.inv[b]--;persist();}
  else if(save.coins>=BOOSTERS[b].price){addCoins(-BOOSTERS[b].price);toast(t('{name} bought: {coins}',{name:BOOSTERS[b].name,coins:tn(BOOSTERS[b].price,'coin')}));}
  else{toast(t('{name} costs {price}. You have {have}.',{name:BOOSTERS[b].name,price:tn(BOOSTERS[b].price,'coin'),have:save.coins}));buzz(40);return false;}
  renderActions(); return true;
}
function refundDrop(){state.paint++; state.used[state.sel]--; updateHud();}

// ---------- Forced free Undo (first wrong color on the picture that introduces Undo) ----------
function forceUndo(k){
  state.forced=true;
  $('coachTip').innerHTML=t('Oops! {part} has no <b>{paint}</b> in it.',{part:esc(N(current())),paint:PN(k)})+'<br>'+t('Tap <b>Undo</b> to take that drop back. This one is free.');
  buzz([40,50,40]);
  $('coachTip').hidden=false; $('coachDim').hidden=false;
  $('undoBtn').classList.add('coach'); document.querySelector('.swatches').classList.add('lift');
  document.body.classList.add('coaching');
  renderActions();
}
function hideCoach(){
  $('coachTip').hidden=true; $('coachDim').hidden=true;
  $('undoBtn').classList.remove('coach'); document.querySelector('.swatches').classList.remove('lift');
  document.body.classList.remove('coaching');
}
function nudge(){const t=$('coachTip');t.classList.remove('nudge');void t.offsetWidth;t.classList.add('nudge');}
$('coachDim').onclick=nudge;

// ---------- Input ----------
function addDrop(k){
  if(!state||state.finished||state.applying) return false;
  if(state.forced){nudge();return false;}
  if(state.paint<=0){outOfPaint();return false;}
  if(state.drops.length>=12){renderMix([t('The bowl is full. Take drops out or empty it.'),'bad']);buzz(40);return false;}
  state.picking=false; state.hintMsg=null;
  state.drops.push(k); state.paint--; state.used[state.sel]=(state.used[state.sel]||0)+1; buzz(8);
  updateHud(); renderHint(); renderMix();
  if(L.intro==='undo'&&!save.tut.undo&&!current().recipe[k]) forceUndo(k);
  else afterMixChange();
  return true;
}
// No Paint it button: a mix that reaches 95% paints the part by itself after a short beat.
function afterMixChange(){
  const m=mix(counts()); if(!m||state.finished||state.forced) return;
  if(matchPct(m,current().target)>=95){
    state.applying=true; const st=state;
    setTimeout(()=>{ if(state!==st) return; state.applying=false; apply(); },500);
  }else if(state.paint<=0&&!canUse('undo')&&!canUse('pick')&&!canUse('empty')){
    setTimeout(outOfPaint,900); // nothing left to fix the mix with
  }
}
let dragged=false; // set when a press turned into a drag, so the click that follows is ignored
$('paints').addEventListener('click',e=>{
  const b=e.target.closest('.paint'); if(!b) return;
  if(dragged){dragged=false;return;}
  addDrop(b.dataset.k);
});
// Drag and drop: press a paint, drag it onto the mix circle, let go to add a drop. A short press stays a tap.
(function(){
  let d=null;
  const overMix=(x,y)=>{const r=$('mixChip').getBoundingClientRect(),m=28;return x>r.left-m&&x<r.right+m&&y>r.top-m&&y<r.bottom+m;};
  $('paints').addEventListener('pointerdown',e=>{
    const b=e.target.closest('.paint'); if(!b||!state||state.finished||state.forced||e.button>0) return;
    d={k:b.dataset.k,x:e.clientX,y:e.clientY,ghost:null,id:e.pointerId}; dragged=false;
  });
  addEventListener('pointermove',e=>{
    if(!d||e.pointerId!==d.id) return;
    if(!d.ghost){
      if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<8) return;
      dragged=true;
      d.ghost=document.createElement('div'); d.ghost.className='ghost'+(d.k==='W'?' white':'');
      d.ghost.style.background=hex(PMAP[d.k].rgb); document.body.appendChild(d.ghost);
    }
    d.ghost.style.transform=`translate(${e.clientX-24}px,${e.clientY-24}px)`;
    $('mixChip').classList.toggle('dropping',overMix(e.clientX,e.clientY));
  });
  const end=e=>{
    if(!d||e.pointerId!==d.id) return;
    const g=d.ghost, k=d.k; d=null; $('mixChip').classList.remove('dropping');
    if(!g) return;
    g.remove();
    if(e.type==='pointerup'&&overMix(e.clientX,e.clientY)&&addDrop(k)){
      const r=$('mixChip').getBoundingClientRect();
      burst(r.left+r.width/2,r.top+r.height/2,[hex(PMAP[k].rgb),hex(PMAP[k].rgb),'#ffffff'],12,{speed:4,size:3.5,decay:.035,gravity:.1});
    }
    setTimeout(()=>{dragged=false;},0);
  };
  addEventListener('pointerup',end); addEventListener('pointercancel',end);
})();
$('emptyBtn').onclick=()=>{
  if(state.applying||isLocked('empty')||!state.drops.length) return;
  const n=state.drops.length, paid=canUse('empty');
  if(paid) spend('empty');
  pourOut(()=>{
    state.drops=[]; state.hintMsg=null;
    if(!paid){renderHint();renderMix([t('Bowl poured out. Paint lost: {drops}. An Empty booster gives the paint back.',{drops:tn(n,'drop')}),'bad']);return;}
    state.paint+=n; state.used[state.sel]-=n; updateHud(); renderHint();
    renderMix([t('Bowl emptied. Paint refunded: {drops}.',{drops:tn(n,'drop')}),'']);
  });
};
// Empty animation: the bowl tips, the paint drains and spills over the rim, and the drop row falls away.
function pourOut(done){
  const chip=$('mixChip'), st=state; buzz(15);
  if(reduced){done();return;}
  state.applying=true;
  const col=chip.style.background||INK, r=chip.getBoundingClientRect();
  chip.classList.remove('pour'); void chip.offsetWidth; chip.classList.add('pour');
  $('drops').querySelectorAll('span').forEach((d,i)=>{d.style.animationDelay=(i*40)+'ms'; d.classList.add('fall');});
  setTimeout(()=>{ if(state===st) burst(r.left+r.width*.12,r.top+r.height*.3,[col,col,col,'#ffffff'],16,{angle:Math.PI*1.08,spread:.7,speed:5,size:4,decay:.02,gravity:.3}); },170);
  setTimeout(()=>{ chip.classList.remove('pour'); if(state!==st) return; state.applying=false; done(); },620);
}
$('undoBtn').onclick=()=>{
  if(state.applying||isLocked('undo')||!state.drops.length) return;
  if(state.forced){
    state.drops.pop(); refundDrop(); state.forced=false; save.tut.undo=true; persist(); hideCoach();
    renderMix([t("That's Undo. You have {n} left, then they cost {price}.",{n:save.inv.undo,price:tn(BOOSTERS.undo.price,'coin')}),'good']);
    afterMixChange(); return;
  }
  if(!spend('undo')) return;
  state.drops.pop(); state.picking=false; state.hintMsg=null; refundDrop(); renderHint(); renderMix([t('Drop taken back. Paint refunded.'),'']);
  afterMixChange();
};
$('pickBtn').onclick=()=>{
  if(state.applying||isLocked('pick')) return;
  if(state.picking){state.picking=false;renderMix();return;}
  if(!state.drops.length) return;
  if(!canUse('pick')){spend('pick');return;}
  state.picking=true; renderMix();
};
$('drops').addEventListener('click',e=>{
  const d=e.target.closest('span[data-i]'); if(!d||!state.picking) return;
  if(!spend('pick')) return;
  const k=state.drops.splice(+d.dataset.i,1)[0];
  state.picking=false; state.hintMsg=null; refundDrop(); renderHint(); renderMix([t('{paint} taken out. Paint refunded.',{paint:PN(k)}),'']);
  afterMixChange();
});
$('hintBtn').onclick=()=>{
  if(state.applying||isLocked('hint')||state.finished||state.hintMsg||!spend('hint')) return;
  state.hinted[state.sel]=true; state.hintMsg=nextHint(); renderHint();
};
$('retryBtn').onclick=()=>start(L.index);
$('nextBtn').onclick=()=>start(Math.min(L.index+1,LEVELS.length-1));
$('rescueBtn').onclick=rescue;
$('shareBtn').onclick=share;

function apply(){
  if(state.forced||state.finished) return;
  const r=current(),m=mix(counts()); if(!m) return;
  const p=matchPct(m,r.target);
  if(p<95){
    const chip=$('mixChip');chip.classList.remove('shake');void chip.offsetWidth;chip.classList.add('shake');
    renderMix([t('{p}% is not close enough.',{p})+' '+advice(m,r.target),'bad']);
    if(state.paint<=0) setTimeout(outOfPaint,700);
    return;
  }
  const used=state.used[r.id]||0;
  let s=used<=r.min?3:used<=r.min+2?2:1;
  if(state.hinted[r.id]||state.rescued[r.id]) s=Math.min(s,2);
  state.done[r.id]=true; state.stars[r.id]=s; state.applying=true; // locked until the next part is selected
  const g=scene.querySelector(`.region[data-id="${r.id}"]`);
  g.setAttribute(r.stroke?'stroke':'fill',hex(r.target)); g.classList.remove('sel'); g.classList.add('done');
  const cr=scene.querySelector(`.crack[data-for="${r.id}"]`); if(cr) cr.classList.add('gone');
  const gb=g.getBoundingClientRect();
  burst(gb.left+gb.width/2,gb.top+gb.height/2,[hex(r.target),hex(r.target),'#ffffff'],18,{speed:5,size:4,decay:.028,gravity:.12});
  const c=s*COINS_PER_STAR*TIERS[L.tier].mult; addCoins(c);
  // Like ColorFind: show drops used against the minimum (the recipe size) for this part.
  toast(`${N(r)} ${'★'.repeat(s)}${'☆'.repeat(3-s)} · ${used<=r.min?t('perfect: {drops}',{drops:tn(used,'drop')}):t('{drops}, min {min}',{drops:tn(used,'drop'),min:r.min})} · +${tn(c,'coin')}`);
  buzz(25);
  state.drops=[]; state.picking=false; state.hintMsg=null; updateHud(); renderHint();
  const next=L.regions.find(x=>!state.done[x.id]);
  if(!next){state.finished=true;finishPicture();}
  else if(state.paint<=0){select(next.id);setTimeout(outOfPaint,700);}
  else setTimeout(()=>select(next.id),350);
}

// ---------- Particles (paint drops, confetti, stars) ----------
const fxc=$('fx'), fx=fxc.getContext('2d'); let parts=[], fxRun=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function sizeFx(){const d=devicePixelRatio||1;fxc.width=innerWidth*d;fxc.height=innerHeight*d;fx.setTransform(d,0,0,d,0,0);}
addEventListener('resize',sizeFx); sizeFx();
function burst(x,y,colors,n,o={}){
  if(reduced) return;
  for(let i=0;i<n;i++){
    const a=o.angle!=null?o.angle+(Math.random()-.5)*(o.spread||1):Math.random()*Math.PI*2, sp=(o.speed||6)*(.5+Math.random());
    parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:(o.size||5)*(.6+Math.random()*.8),c:colors[i%colors.length],
      rot:Math.random()*6.3,vr:(Math.random()-.5)*.3,shape:o.shapes?o.shapes[i%o.shapes.length]:'drop',
      life:1,decay:(o.decay||.012)*(.7+Math.random()*.6),g:o.gravity??.18});
  }
  if(!fxRun){fxRun=true;requestAnimationFrame(tick);}
}
function tick(){
  fx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>p.life>0&&p.y<innerHeight+60);
  for(const p of parts){
    p.vx*=.985; p.vy=p.vy*.985+p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.life-=p.decay;
    fx.save(); fx.globalAlpha=Math.max(0,Math.min(1,p.life*2)); fx.translate(p.x,p.y);
    fx.fillStyle=p.c; fx.strokeStyle=INK; fx.lineWidth=1.5; const r=p.r;
    fx.beginPath();
    if(p.shape==='drop'){ // tip trails behind the direction of travel
      fx.rotate(Math.atan2(-p.vx,p.vy));
      fx.moveTo(0,-r*1.7); fx.bezierCurveTo(r*1.1,-r*.2,r,r,0,r); fx.bezierCurveTo(-r,r,-r*1.1,-r*.2,0,-r*1.7);
      fx.fill(); fx.stroke();
    }else if(p.shape==='star'){
      fx.rotate(p.rot); for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=i%2?r*.45:r*1.2;fx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}
      fx.closePath(); fx.fill(); fx.stroke();
    }else if(p.shape==='rect'){
      fx.rotate(p.rot); fx.scale(1,Math.cos(p.rot*3)); fx.fillRect(-r,-r*.45,r*2,r*.9);
    }else{fx.arc(0,0,r,0,Math.PI*2); fx.fill(); fx.stroke();}
    fx.restore();
  }
  if(parts.length) requestAnimationFrame(tick); else {fxRun=false; fx.clearRect(0,0,innerWidth,innerHeight);}
}

// ---------- Picture complete: celebration ----------
function finishPicture(){
  const st=state; $('selLayer').innerHTML=''; renderMix();
  setTimeout(()=>{ if(state!==st) return; celebrate(st); setTimeout(()=>{if(state===st) win();},2400); },450);
}
function celebrate(st){
  const frame=document.querySelector('.frame');
  frame.classList.remove('celebrate'); void frame.offsetWidth; frame.classList.add('celebrate');
  // 1. light wave: regions flash left to right
  [...scene.querySelectorAll('.region')].map(g=>{const b=g.getBoundingClientRect();return {g,x:b.left+b.width/2};})
    .sort((a,b)=>a.x-b.x).forEach((o,i)=>{o.g.style.animationDelay=(i*80)+'ms';o.g.classList.remove('flash');void o.g.getBoundingClientRect();o.g.classList.add('flash');});
  // 2. shine sweep + twinkling sparkles
  let sp=''; for(let i=0;i<16;i++){const x=15+Math.random()*290,y=12+Math.random()*210,s=(.6+Math.random()*.9).toFixed(2);
    sp+=`<g transform="translate(${x|0} ${y|0}) scale(${s})"><path class="spark" style="animation-delay:${(300+Math.random()*1500)|0}ms" d="M0-9L2.2-2.2L9 0L2.2 2.2L0 9L-2.2 2.2L-9 0L-2.2-2.2Z"/></g>`;}
  $('fxLayer').innerHTML=`<defs><linearGradient id="shineG" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect class="shine" x="-150" y="-80" width="100" height="400" fill="url(#shineG)"/>`+sp;
  // 3. confetti in the picture's own colors: center pop, then two cannons from the bottom corners
  const cols=[...new Set(L.regions.map(r=>hex(r.target)))].concat(['#ffffff']);
  const fr=frame.getBoundingClientRect(), cx=fr.left+fr.width/2, cy=fr.top+fr.height/2;
  setTimeout(()=>{ if(state!==st) return;
    burst(cx,cy,cols,50,{speed:10,shapes:['drop','star','circle'],decay:.012,size:6});
    burst(0,innerHeight,cols,70,{angle:-Math.PI/2.7,spread:.7,speed:22,shapes:['rect','drop','star','rect'],decay:.005,gravity:.35,size:6});
    burst(innerWidth,innerHeight,cols,70,{angle:-Math.PI+Math.PI/2.7,spread:.7,speed:22,shapes:['rect','drop','star','rect'],decay:.005,gravity:.35,size:6});
  },400);
  // 4. "Restored" stamp slams onto the picture
  setTimeout(()=>{ if(state!==st) return; $('stamp').hidden=false; burst(cx,cy,[INK,'#ffffff'],26,{speed:8,shapes:['star'],decay:.03,size:5}); },1350);
}
function countUp(el,to){
  if(reduced||!to){el.textContent=to;return;}
  const t0=performance.now(), d=900;
  (function step(t){const k=Math.min(1,(t-t0)/d);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);})(t0);
}
function pictureStars(){return Math.max(1,Math.round(sumStars()/L.regions.length));}
function win(){
  const st=state, s=pictureStars(), last=L.index===LEVELS.length-1, first=save.best[L.id]==null;
  const total=sumStars(), max=L.regions.length*3;
  const bonus=(first?FIRST_CLEAR_BONUS:REPLAY_BONUS)*TIERS[L.tier].mult; addCoins(bonus);
  save.best[L.id]=Math.max(save.best[L.id]||0,s);
  const ch=save.challenge&&save.challenge.level===L.id?save.challenge:null, beaten=!!ch&&total>ch.score;
  if(beaten) save.challenge=null;
  persist(); renderMenu(); updateHud(); buzz([30,60,30,60,70]);
  $('endTitle').textContent=t('{title} restored',{title:T(L)});
  $('endStars').innerHTML=[0,1,2].map(i=>`<span class="${i<s?'':'off'}" style="animation-delay:${250+i*280}ms">★</span>`).join('');
  const usedAll=L.regions.reduce((a,r)=>a+(state.used[r.id]||0),0), minAll=L.regions.reduce((a,r)=>a+r.min,0);
  $('endText').innerHTML=`${total} / ${max}★  ·  +<b id="earnNum">0</b> <span class="coin"></span> ${t('earned')}`+
    `<br>${t('Drops used <b>{used}</b> · minimum <b>{min}</b>',{used:usedAll,min:minAll})}${usedAll<=minAll?' · '+t('perfect!'):''}`+
    (ch?(beaten?`<br><b>${t("You beat {from}'s {score}★!",{from:esc(ch.from),score:ch.score})}</b>`:'<br>'+t('{from} still leads: {score}★ vs your {you}★. Replay to beat it.',{from:esc(ch.from),score:ch.score,you:total})):'')+
    (L.credit?`<br>${t(L.credit)}.`:'')+(QZ&&factFor(L.id)?`<br><i>${t('Did you know?')}</i> ${esc(t(factFor(L.id).fact))}`:'')+(last?'<br>'+t('That was the last picture.'):'');
  countUp($('earnNum'),state.earned);
  for(let i=0;i<s;i++) setTimeout(()=>{ if(state!==st) return; const b=$('endStars').children[i].getBoundingClientRect();
    burst(b.left+b.width/2,b.top+b.height/2,[INK,'#ffffff'],14,{speed:5,shapes:['star'],decay:.03,size:4,gravity:.1}); },450+i*280);
  if(beaten) setTimeout(()=>{ if(state===st) burst(innerWidth/2,innerHeight/3,[...new Set(L.regions.map(r=>hex(r.target)))],90,{speed:14,shapes:['rect','star','drop'],decay:.007,gravity:.25,size:6}); },900);
  // Share / challenge
  const proper=L.index>=FIRST_PROPER;
  $('shareBox').hidden=!proper;
  if(proper){
    state.shareCtx={total,max,ch,beaten}; state.shareFile=null;
    $('nameInput').value=save.name||'';
    $('shareNote').textContent=ch?(beaten?t('Tell {from} you won.',{from:ch.from}):t('Send {from} your score anyway?',{from:ch.from})):t('Think a friend can beat {score}★? Send them this picture.',{score:total});
    $('shareBtn').textContent=ch?t('Send your score back'):t('Challenge a friend');
    makeShareFile(total,max).then(f=>{if(state===st) state.shareFile=f;}).catch(()=>{});
  }
  $('rescueBtn').hidden=true; $('quizOfferBtn').hidden=true;
  $('endOverlay').classList.add('low');
  $('retryBtn').textContent=t('Replay');
  $('nextBtn').hidden=last;
  $('endOverlay').hidden=false;
}

// ---------- Sharing ----------
const EMOJI={'🟥':[.87,.18,.18],'🟧':[.96,.55,.13],'🟨':[.99,.83,.2],'🟩':[.33,.69,.3],'🟦':[.2,.5,.87],'🟪':[.6,.35,.75],'🟫':[.55,.35,.2],'⬛':[.15,.15,.15],'⬜':[.95,.95,.95]};
const emojiRow=()=>L.regions.map(r=>Object.keys(EMOJI).reduce((a,b)=>dE(EMOJI[a],r.target)<=dE(EMOJI[b],r.target)?a:b)).join('');
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
// Renders the restored picture as a 1080×1080 PNG card. Built ahead of time so the share tap stays a direct user gesture.
async function makeShareFile(total,max){
  const c=scene.cloneNode(true);
  c.querySelectorAll('#selLayer,#fxLayer,.crack').forEach(e=>e.remove());
  c.querySelectorAll('.region').forEach(g=>g.removeAttribute('style'));
  c.setAttribute('xmlns','http://www.w3.org/2000/svg'); c.setAttribute('width','960'); c.setAttribute('height','720');
  const load=src=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src;});
  const pic=await load('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(c)));
  const logo=await load(G.shareLogo).catch(()=>null);
  try{await document.fonts.load('700 60px Inter');}catch(e){}
  const W=1080,cv=document.createElement('canvas'); cv.width=cv.height=W; const x=cv.getContext('2d');
  x.fillStyle='#dfe3ea'; x.fillRect(0,0,W,W);
  if(logo) x.drawImage(logo,60,42,65,100);
  x.textBaseline='middle'; x.fillStyle=INK; x.font='700 64px Inter, sans-serif'; x.fillText(GAME_NAME,145,92);
  x.textAlign='right'; x.fillStyle=INK; x.font='700 40px Inter, sans-serif'; x.fillText(`★ ${total} / ${max}`,W-60,92);
  const X=48,Y=170,FW=984,FH=744;
  rr(x,X,Y+10,FW,FH,28); x.fillStyle=INK; x.fill();
  rr(x,X,Y,FW,FH,28); x.fillStyle='#fff'; x.fill(); x.lineWidth=8; x.strokeStyle=INK; x.stroke();
  x.save(); rr(x,X+12,Y+12,FW-24,FH-24,18); x.clip(); x.drawImage(pic,X+12,Y+12,FW-24,FH-24); x.restore();
  x.textAlign='center'; x.fillStyle=INK; x.font='700 46px Inter, sans-serif'; x.fillText(t('{title} restored',{title:T(L)}),W/2,984);
  x.fillStyle='#646b80'; x.font='800 32px Inter, sans-serif'; x.fillText(t('Can you beat my score?'),W/2,1036);
  const blob=await new Promise(r=>cv.toBlob(r,'image/png'));
  return new File([blob],`${GAME_NAME.toLowerCase()}-${L.id}.png`,{type:'image/png'});
}
function share(){
  const name=$('nameInput').value.trim().slice(0,16); save.name=name; persist();
  const {total,max,ch,beaten}=state.shareCtx;
  const u=new URL(location.pathname,location.origin); u.searchParams.set('c',L.id); u.searchParams.set('s',total); if(name) u.searchParams.set('n',name);
  const link=u.href, row=emojiRow();
  const v={score:ch&&ch.score,total,max,title:T(L),game:GAME_NAME};
  const text=ch?(beaten?t('I beat your {score}★! I got {total}/{max}★ on "{title}" in {game}.',v)+`\n${row}\n`+t('Your move.')
                      :t('I got {total}/{max}★ on "{title}" in {game}. You\'re still ahead with {score}★, for now.',v)+`\n${row}`)
               :t('I restored "{title}" in {game} with {total}/{max}★',v)+`\n${row}\n`+t('Can you beat me?');
  const f=state.shareFile, fail=e=>{if(!e||e.name!=='AbortError') copyText(text+'\n'+link);};
  try{
    if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:GAME_NAME,text:text+'\n'+link}).catch(fail);return;}
    if(navigator.share){navigator.share({title:GAME_NAME,text,url:link}).catch(fail);return;}
  }catch(e){}
  copyText(text+'\n'+link);
}
function copyText(t){
  const ok=()=>toast(I18N.t('Challenge copied. Paste it to your friend.')), no=()=>prompt(I18N.t('Copy this and send it to your friend:'),t);
  try{navigator.clipboard.writeText(t).then(ok,no);}catch(e){no();}
}

function outOfPaint(){
  if(!state||!$('endOverlay').hidden||state.finished) return;
  const r=current(), ok=save.coins>=RESCUE_PRICE;
  $('endTitle').textContent=t('Out of paint'); buzz([60,40,60]);
  $('endStars').textContent='';
  $('endText').innerHTML=t('Parts restored: {done} of {all}.',{done:Object.keys(state.done).length,all:L.regions.length})+' '+
    (ok?t('Restart <b>{part}</b> with fresh paint and keep the rest of your work.',{part:esc(N(r))}):t('Restarting a part costs {price}. You have {have}.',{price:tn(RESCUE_PRICE,'coin'),have:save.coins}));
  const qb=$('quizOfferBtn'), canQuiz=rescueQuizAvailable(); qb.hidden=!canQuiz;
  if(canQuiz) qb.innerHTML=`${icon('quiz')} ${t('Art quiz: answer for +{n} paint',{n:QZ.rescuePaint})}`;
  const rb=$('rescueBtn'); rb.hidden=false; rb.disabled=!ok;
  rb.innerHTML=`${t('Restart {part}',{part:esc(N(r))})} · ${RESCUE_PRICE} <span class="coin"></span>`;
  $('shareBox').hidden=true;
  $('endOverlay').classList.remove('low');
  $('retryBtn').textContent=t('Start picture over');
  $('nextBtn').hidden=true;
  $('endOverlay').hidden=false;
}
// Pay coins to retry the current part: refund the paint spent on it, topped up so it is always winnable.
function rescue(){
  if(save.coins<RESCUE_PRICE) return;
  addCoins(-RESCUE_PRICE);
  const r=current();
  state.paint=Math.max(state.paint+(state.used[r.id]||0),r.min+4);
  state.used[r.id]=0; state.rescued[r.id]=true;
  $('endOverlay').hidden=true;
  updateHud(); select(r.id);
  toast(t('{part} restarted. Paint refilled.',{part:N(r)}));
}
// ---------- Art quiz (only for games that define G.quiz) ----------
const QZ=G.quiz||null;
const levelOf=id=>LEVELS.find(l=>l.id===id);
const factFor=id=>QZ&&QZ.facts.find(f=>f.id===id);
const dayKey=d=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
function qstate(){const q=save.quiz=save.quiz||{}, t=dayKey(); if(q.outDay!==t){q.outDay=t;q.outCount=0;} return q;}
function nextStreak(){const q=qstate(); if(q.lastDaily===dayKey()) return q.streak||1; return q.lastDaily===dayKey(new Date(Date.now()-864e5))?(q.streak||0)+1:1;}
const ordinal=n=>n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th')+' century';
const ROMAN=n=>['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'][n]||String(n);
// Answers are stored in English; this shows them in the player's language (centuries are generated).
function showAns(q,v){
  if(q.t==='century'){const n=parseInt(v,10); return I18N.lang==='fr'?ROMAN(n)+'e siècle':I18N.lang==='ru'?ROMAN(n)+' век':v;}
  return t(v);
}
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const QTYPES={
  artist:f=>levelOf(f.id)?t('Who painted this?'):t('Who painted {title}?',{title:t(f.title)}),
  century:f=>levelOf(f.id)?t('In which century was it made?'):t('In which century was {title} made?',{title:t(f.title)}),
  style:f=>levelOf(f.id)?t('Which style is it?'):t('Which style is {title}?',{title:t(f.title)}),
  museum:f=>levelOf(f.id)?t('Which museum holds it today?'):t('Where does {title} hang today?',{title:t(f.title)}),
  country:f=>levelOf(f.id)?t('Which country was the artist from?'):t('Which country was the artist of {title} from?',{title:t(f.title)})};
// One question: the right answer plus plausible wrong ones (same art group, neighboring centuries).
function makeQuestion(f,types){
  const avail=types.filter(t=>f[t]); const t=avail[Math.random()*avail.length|0], right=f[t];
  let pool;
  if(t==='artist') pool=QZ.artistGroups[f.group]||[].concat(...Object.values(QZ.artistGroups));
  else if(t==='century'){const c=parseInt(right,10); pool=[c-2,c-1,c+1,c+2].filter(n=>n>=12&&n<=21).map(ordinal);}
  else pool=QZ.pools[{style:'styles',museum:'museums',country:'countries'}[t]];
  const wrong=shuffle(pool.filter(x=>x!==right)).slice(0,QZ.options-1);
  return {f,t,q:QTYPES[t](f),right,opts:shuffle([right,...wrong])};
}
// Out-of-paint quiz asks about paintings the player has met: restored ones plus the current one.
function rescuePool(){return QZ.facts.filter(f=>levelOf(f.id)&&(save.best[f.id]!=null||(L&&f.id===L.id))&&QZ.easyTypes.some(t=>f[t]));}
function rescueQuizAvailable(){return !!QZ&&!!state&&!state.quizUsed&&qstate().outCount<QZ.rescuePerDay&&rescuePool().length>0;}
function dailyAvailable(){return !!QZ&&qstate().lastDaily!==dayKey();}
function renderDailyQuiz(){
  const b=$('dailyQuizBtn'); $('home').classList.toggle('hasQuiz',!!QZ); b.hidden=!QZ; if(!QZ) return;
  const s=nextStreak();
  b.disabled=!dailyAvailable();
  b.innerHTML=icon('quiz')+(b.disabled?t('Daily quiz done · streak: {days}',{days:tn(s,'day')}):t('Daily art quiz')+(s>1?' · '+t('day {n}',{n:s}):''));
}
let quizCtx=null;
function openQuiz(kind){
  const pool=kind==='rescue'?rescuePool():QZ.facts, types=kind==='rescue'?QZ.easyTypes:QZ.allTypes;
  const f=pool[Math.random()*pool.length|0], q=makeQuestion(f,types), lv=levelOf(f.id);
  quizCtx={kind,q,answered:false,ok:false};
  if(kind==='rescue') $('endOverlay').hidden=true;
  $('quizImg').innerHTML=lv?thumbSVG(lv,true):`<div class="quizTitleCard">${esc(t(f.title))}</div>`;
  $('quizEyebrow').textContent=kind==='daily'?t('Daily art quiz')+' · '+t('day {n}',{n:nextStreak()}):t('Art quiz · +{n} paint',{n:QZ.rescuePaint});
  const gives=f.title.toLowerCase().includes(String(q.right).toLowerCase())||String(q.right).toLowerCase().includes(f.title.toLowerCase());
  $('quizTitle').textContent=lv&&!gives?t(f.title):''; // hide the title when it would give the answer away
  $('quizQ').textContent=q.q;
  $('quizOpts').innerHTML=q.opts.map((o,i)=>`<button class="btn qopt" data-i="${i}">${esc(showAns(q,o))}</button>`).join('');
  $('quizResult').hidden=true; $('quizDone').hidden=true;
  $('quizOverlay').hidden=false;
}
$('quizOpts').addEventListener('click',e=>{
  const b=e.target.closest('.qopt'); if(!b||!quizCtx||quizCtx.answered) return;
  quizCtx.answered=true;
  const {q,kind}=quizCtx, ok=q.opts[+b.dataset.i]===q.right; quizCtx.ok=ok;
  [...$('quizOpts').children].forEach((el,i)=>{el.disabled=true; if(q.opts[i]===q.right) el.classList.add('right'); else if(el===b) el.classList.add('wrong');});
  let msg;
  if(kind==='rescue'){
    qstate().outCount++; state.quizUsed=true;
    if(ok){state.paint+=QZ.rescuePaint; msg=t('Correct! +{n} paint.',{n:QZ.rescuePaint});} else msg=t("Not quite. It's {answer}.",{answer:esc(showAns(q,q.right))});
  }else{
    const qs=qstate(), st=nextStreak(); qs.streak=st; qs.lastDaily=dayKey();
    const reward=QZ.dailyCoins[Math.min(st,QZ.dailyCoins.length)-1];
    if(ok){addCoins(reward); msg=t('Correct! +{coins} · streak: {days}.',{coins:tn(reward,'coin'),days:tn(st,'day')});} else msg=t("Not quite. It's {answer}. Your streak continues: {days}.",{answer:esc(showAns(q,q.right)),days:tn(st,'day')});
  }
  persist(); buzz(ok?[25,40,25]:60);
  $('quizResult').innerHTML=`<b>${msg}</b><br>${esc(t(q.f.fact))}`; $('quizResult').hidden=false;
  $('quizDone').textContent=kind==='rescue'&&ok?t('Keep painting'):t('Continue'); $('quizDone').hidden=false;
});
$('quizDone').onclick=()=>{
  const c=quizCtx; quizCtx=null; $('quizOverlay').hidden=true; if(!c) return;
  if(c.kind==='rescue'){ if(c.ok){updateHud(); renderMix(); toast(t('+{n} paint',{n:QZ.rescuePaint}));} else outOfPaint(); }
  else renderMenu();
};
$('quizOfferBtn').onclick=()=>{if(rescueQuizAvailable()) openQuiz('rescue');};
$('dailyQuizBtn').onclick=()=>{if(dailyAvailable()) openQuiz('daily');};
// ---------- Gallery hall: home screen for games with G.hall (paintings hang in rooms, in level order) ----------
let hallCenter=0;
const CLOTH=`<svg class="cloth" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true"><path d="M-2 -2H102V78Q86 71 72 80T44 75T18 80T-2 75Z" fill="#2a2c34"/><path d="M16 0Q13 40 20 78M40 0Q36 40 44 77M64 0Q68 40 61 78M86 0Q84 40 90 76" stroke="#1d1f25" stroke-width="3" fill="none"/></svg>`;
const ROPE=`<svg class="rope" viewBox="0 0 140 30" aria-hidden="true"><path d="M8 7V30M132 7V30" stroke="#b8a46a" stroke-width="3" stroke-linecap="round"/><circle cx="8" cy="6" r="4" fill="#c9a45a"/><circle cx="132" cy="6" r="4" fill="#c9a45a"/><path d="M8 11Q70 27 132 11" fill="none" stroke="#7a1f2b" stroke-width="4"/></svg>`;
function roomOf(i){let k=0; for(let r=0;r<HALL.rooms.length;r++){const c=HALL.rooms[r].count; if(i<k+c) return {room:HALL.rooms[r],idx:r,start:k,count:c}; k+=c;} return {room:{name:''},idx:0,start:0,count:LEVELS.length};}
function renderHall(){
  $('hallWrap').hidden=false; ['nextPic','nextLabel','nextTitle'].forEach(id=>$(id).hidden=true); document.querySelector('.homeMain .logo').hidden=true;
  const ni=nextIndex();
  $('hallTrack').innerHTML=LEVELS.map((l,i)=>{
    const done=save.best[l.id]!=null, ok=unlocked(i), next=i===ni&&!done;
    const cls=done?'done':!ok?'locked':next?'next':'open';
    const lab=done?starRow(save.best[l.id]):!ok?t('Locked'):next?t('Next'):t('Open');
    return `<button class="slot ${cls}" data-i="${i}" aria-label="${esc(T(l))}"><i class="cone"></i><i class="lamp"></i><span class="hframe">${thumbSVG(l,done)}${ok?'':CLOTH}</span><span class="hplaque">${lab}</span>${next?ROPE:''}</button>`;
  }).join('');
  requestAnimationFrame(()=>centerOn(ni,false));
}
function centerOn(i,smooth){
  const tr=$('hallTrack'), el=tr.children[i]; if(!el) return;
  tr.scrollTo({left:el.offsetLeft-(tr.clientWidth-el.offsetWidth)/2,behavior:smooth?'smooth':'auto'});
  setCenter(i);
}
function setCenter(i){
  hallCenter=i; const l=LEVELS[i], f=factFor(l.id), ro=roomOf(i), ok=unlocked(i), done=save.best[l.id]!=null;
  [...$('hallTrack').children].forEach((el,k)=>el.classList.toggle('center',k===i));
  $('hallRoomNo').textContent=t('Room {n}',{n:ROMAN(ro.idx+1)});
  $('hallRoomName').textContent=t(ro.room.name);
  const got=LEVELS.slice(ro.start,ro.start+ro.count).filter(x=>save.best[x.id]!=null).length;
  $('hallRoomProg').textContent=t('{done} of {all} restored',{done:got,all:ro.count});
  $('hallDots').innerHTML=LEVELS.slice(ro.start,ro.start+ro.count).map((x,k)=>`<i class="${ro.start+k===i?'on':save.best[x.id]!=null?'got':''}"></i>`).join('');
  $('hallTitle').textContent=t(f?f.title:l.title);
  $('hallSub').textContent=[f&&t(f.artist),TIERS[l.tier].label,tn(l.regions.length,'part')].filter(Boolean).join(' · ');
  const pb=$('playBtn'); pb.disabled=!ok; pb.textContent=!ok?t('Locked'):done?t('Restore again'):t('Restore it');
}
if(HALL){
  let raf=0;
  $('hallTrack').addEventListener('scroll',()=>{ cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{
    const tr=$('hallTrack'), mid=tr.scrollLeft+tr.clientWidth/2; let best=0,bd=1e9;
    [...tr.children].forEach((el,k)=>{const d=Math.abs(el.offsetLeft+el.offsetWidth/2-mid); if(d<bd){bd=d;best=k;}});
    if(best!==hallCenter) setCenter(best);
  });});
  $('hallTrack').addEventListener('click',e=>{const sl=e.target.closest('.slot'); if(!sl) return; const i=+sl.dataset.i;
    if(i!==hallCenter) centerOn(i,true); else if(unlocked(i)) start(i);});
  addEventListener('resize',()=>{ if(!$('home').hidden) centerOn(hallCenter,false); });
}
// ---------- Settings: theme, language, vibration (shared by all games on this site) ----------
const THEME_KEY='pontpixel-theme', VIB_KEY='pontpixel-vibration';
let theme='auto', vibOn=true; try{theme=localStorage.getItem(THEME_KEY)||'auto'; vibOn=localStorage.getItem(VIB_KEY)!=='off';}catch(e){}
const canVibrate=typeof navigator.vibrate==='function';
function buzz(p){ if(vibOn&&canVibrate){try{navigator.vibrate(p);}catch(e){}} }
function applyTheme(){ if(theme==='auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme=theme; }
function renderSettings(){
  document.querySelectorAll('#setTheme button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===theme));
  document.querySelectorAll('#setLang button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===I18N.pref||(I18N.pref==='auto'&&b.dataset.v==='auto')));
  $('setVib').setAttribute('aria-checked',vibOn&&canVibrate); $('setVib').disabled=!canVibrate; $('vibNote').hidden=canVibrate;
}
$('settingsBtn').innerHTML=icon('gear');
$('settingsBtn').onclick=()=>{renderSettings(); $('settingsOverlay').hidden=false;};
$('settingsDone').onclick=()=>{$('settingsOverlay').hidden=true;};
$('setTheme').onclick=e=>{const b=e.target.closest('button'); if(!b) return; theme=b.dataset.v; try{localStorage.setItem(THEME_KEY,theme);}catch(err){} applyTheme(); renderSettings();};
$('setLang').onclick=e=>{const b=e.target.closest('button'); if(!b||b.dataset.v===I18N.pref) return; I18N.setPref(b.dataset.v); location.reload();};
$('setVib').onclick=()=>{vibOn=!vibOn; try{localStorage.setItem(VIB_KEY,vibOn?'on':'off');}catch(e){} renderSettings(); buzz(30);};
applyTheme();
let tt;function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('show'),1800);}

goHome();
})();
