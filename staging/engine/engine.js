// ColorEngine: the shared game (scenes, mixing, boosters, coins, tiers, celebration, sharing).
// A game page loads engine/core.js, then its own levels.js (sets window.GAME), then this file.
(function(){
const {PAINTS,PMAP,mix,hex,lab,dE,matchPct,BLANK,BLANK_STROKE,INK}=CF;
const G=window.GAME, LEVELS=G.levels, GAME_NAME=G.name;
const {t,tn}=I18N; if(G.strings) I18N.add(G.strings);
const HALL=G.hall||null; // optional gallery-hall home screen (ColorGallery)
const DAILY=G.daily||null; // optional daily picture with a streak (ColorBook)
const V2=!!G.v2; // redesigned home and play screen (ColorBook): parts strip, one mixing card, Undo/Magic/+5 paint/Free boosters
const CHAPTERS=G.chapters||null; // optional chapters of the main path, each with a reward (ColorBook)
const CHESTS=G.chests||null; // optional star chests: {every, coins, boosters} (ColorBook)
// Bonus pictures (`bonus:true`, palette variants of a `base` picture) come after the main path in LEVELS and are bought with coins.
const MAIN=LEVELS.filter(l=>!l.bonus&&!l.dream&&!l.season).length; // dream pictures (daily challenge, ColorBook) come last and stay out of the main path
// Staging builds live under /staging/: they keep their own save and get the cheat menu (also on localhost or with ?cheats).
const STAGING=/\/staging\//.test(location.pathname);
const CHEATS=STAGING||/[?&]cheats\b/.test(location.search)||/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const SAVE_KEY=G.saveKey+(STAGING?'-staging':'');
const sfx=(n,a)=>{if(window.SFX) SFX.play(n,a);};
const T=l=>l.look?t('{title} · {look}',{title:t(l.title),look:t(l.look)}):t(l.title), N=r=>t(r.name), PN=k=>t(PMAP[k].name); // localized level title, part name, paint name
if(V2) document.body.classList.add('v2');
document.body.insertAdjacentHTML('afterbegin',(V2?v2Scenes():`
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
    <button class="btn quizbtn" id="dailyPicBtn" hidden></button>
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
        <button class="btn boost" id="undoBtn"></button>
        <button class="btn boost" id="hintBtn"></button>
        <button class="btn boost" id="pickBtn"></button>
        <button class="btn boost" id="emptyBtn"></button>
      </div>
    </div>
  </section>
  </div>
</div>
`)+`
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
    <button class="btn adbtn" id="adRescueBtn" hidden></button>
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
<div class="overlay" id="buyOverlay" hidden>
  <div class="card">
    <div class="buyImg" id="buyImg"></div>
    <h2 id="buyTitle"></h2>
    <p id="buyText"></p>
    <div class="row">
      <button class="btn" id="buyCancel">${t('Not now')}</button>
      <button class="btn primary" id="buyOk"></button>
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
    <div class="setrow"><span>${t('Sound')}</span><button class="switch" id="setSound" role="switch" aria-checked="true" aria-label="${t('Sound')}"><i></i></button></div>
    <div class="setrow"><span>${t('Vibration')}</span><button class="switch" id="setVib" role="switch" aria-checked="true" aria-label="${t('Vibration')}"><i></i></button></div>
    <p class="setnote" id="vibNote" hidden>${t("This browser can't vibrate (iPhone Safari doesn't support it).")}</p>
    <p class="setlinks"><a id="setPrivacy" target="_blank" rel="noopener">${t('Privacy policy')}</a><a id="setTerms" target="_blank" rel="noopener">${t('Terms of use')}</a></p>
    <button class="btn primary" id="settingsDone">${t('Done')}</button>
  </div>
</div>
<div class="toast" id="toast"></div>
<div class="coachDim" id="coachDim" hidden></div>
<canvas id="fx" aria-hidden="true"></canvas>
`+(CHEATS?`
<button class="cheatBtn" id="cheatBtn" aria-label="Cheats"></button>
<div class="overlay" id="cheatOverlay" hidden>
  <div class="card cheats">
    <h2>Cheats</h2>
    <button class="btn primary" data-c="newgame" id="cheatNew">New game: start over from picture 1</button>
    <p>Staging only. This build has its own save, so nothing here touches the live game.</p>
    <div class="cgrid">
      <button class="btn" data-c="coins100">+100 coins</button><button class="btn" data-c="coins1000">+1000 coins</button>
      <button class="btn" data-c="boosters">+5 every booster</button><button class="btn" data-c="paint">+20 paint</button>
      <button class="btn" data-c="solve">Solve this part</button><button class="btn" data-c="finish">Finish picture ★★★</button>
      <button class="btn" data-c="unlock">Unlock all pictures</button><button class="btn" data-c="restoreAll">Restore all ★★★</button>
      <button class="btn" data-c="newDay">Daily: new day</button><button class="btn" data-c="tutorials">Replay tutorials</button>
      <button class="btn" data-c="hl" id="cheatHl">Highlight: aura</button><button class="btn" data-c="s-halloween">Season: Halloween</button><button class="btn" data-c="s-thanksgiving">Season: Thanksgiving</button><button class="btn" data-c="s-christmas">Season: Christmas</button>
      <button class="btn" data-c="s-off">Season: none</button><button class="btn" data-c="s-auto">Season: by date</button>
    </div>
    <div class="cjump"><select id="cheatLevel" aria-label="Picture"></select><button class="btn primary" data-c="jump">Play</button></div>
    <div class="csnd"><div class="csndhead"><b>Sounds</b><div class="seg" id="sfxSet"><button data-v="v1">Old</button><button data-v="v2">New</button></div></div>
      <div class="cgrid c3" id="sfxGrid"></div></div>
    <details class="cev"><summary>Analytics events (last 40)</summary><pre id="cheatEvents"></pre></details>
    <button class="btn primary" data-c="close">Close</button>
  </div>
</div>`:''));
// Redesigned scenes. Ids the shared logic uses stay the same; old controls it still wires up sit in a hidden box.
function v2Scenes(){ return `
<main class="home v2" id="home">
  <div class="topbar">
    <div class="topl"><div class="pill" id="homeStars">★ 0</div><div class="pill coins"><span class="coin"></span><span class="coinCount">0</span></div></div>
    <button class="iconbtn" id="settingsBtn" aria-label="${t('Settings')}"></button>
  </div>
  <section class="homeMain" id="homeMain">
    <div class="v2hero">
      <button class="nextPic" id="nextPic" aria-label="${t('Play next picture')}"></button>
      <div class="v2info">
        <div class="nextLabel" id="nextLabel"></div>
        <div class="v2row"><div class="nextTitle" id="nextTitle"></div><span id="heroMeta"></span></div>
        <div class="heroSw" id="heroSw" aria-hidden="true"></div>
        <div class="bar" aria-hidden="true"><i id="heroBar"></i></div>
      </div>
      <button class="btn play" id="playBtn">${t('Play')}</button>
    </div>
    <button class="btn quizbtn evcard seasoncard" id="seasonBtn" hidden></button>
    <button class="btn quizbtn evcard daily" id="dailyPicBtn" hidden></button>
    <div class="chbar" id="homeCh" hidden></div>
    <div class="progcards" id="progCards" hidden><div class="pcard" id="chapterCard"></div><div class="pcard" id="chestCard"></div></div>
    <button class="btn quizbtn" id="dailyQuizBtn" hidden></button>
    <div hidden><img class="logo" alt=""><div class="hallWrap" id="hallWrap"></div></div>
  </section>
  <section class="gallery" id="gallery" hidden>
    <h2>${t('Gallery')}</h2>
    <button class="btn quizbtn bonusbtn" id="bonusBtn" hidden></button>
    <div class="ggrid" id="ggrid"></div>
  </section>
  <section class="gallery holidays" id="holidays" hidden></section>
  <nav class="tabbar" aria-label="${t('Menu')}">
    <button class="tab" data-tab="home" aria-current="true"></button>
    <button class="tab" data-tab="gallery" aria-current="false"></button>
    ${LEVELS.some(l=>l.season)?'<button class="tab" data-tab="holidays" aria-current="false"></button>':''}
  </nav>
</main>

<div class="wrap v2" id="game" hidden>
  <div class="gamebar">
    <button class="iconbtn" id="backBtn" aria-label="${t('Back to menu')}"></button>
    <div class="gtitle"><b id="gTitle"></b><small id="progress"></small></div>
    <div class="pill tier" id="tierPill" hidden></div>
    <div class="hearts" id="hearts" hidden></div>
    <div class="pill coins" id="coins" title="${t('Coins')}"><span class="coin"></span><span class="coinCount">0</span></div>
  </div>
  <div class="board">
    <div class="stage">
      <div class="frame">
        <svg class="scene" id="scene" viewBox="0 0 320 240" aria-label="${t('Faded picture')}"></svg>
        <div class="stamp" id="stamp" hidden>${t('Restored')}</div>
        <div class="mtip" id="mixTip" role="status" hidden></div>
      </div>
      <div class="credit" id="credit"></div>
      <div class="chbar" id="chBar" hidden></div>
    </div>
    <div class="ctrl">
      <section class="mixer" aria-label="${t('Mixing table')}">
        <div class="mxhead"><b id="targetName"></b><div class="mxpace"><div class="counter" id="counter"></div><div class="pstars" id="paceStars"></div></div></div>
        <div class="swatches">
          <div class="sw"><div class="chip target" id="targetChip"></div><small>${t('Target')}</small></div>
          <div class="mxmid"><div id="pctNum"></div><div class="msg" id="msg"></div><button class="btn primary brushok" id="brushOk" hidden>${t('Paint it')}</button></div>
          <div class="sw"><button class="chip empty" id="mixChip" aria-label="${t('Your mix. Tap to pour out the bowl.')}"></button><small id="mixLab">${t('Mix')}</small></div>
        </div>
        <div class="drops" id="drops"></div>
        <div id="meter" hidden><div class="bar"><i id="barFill"></i></div></div>
        <div class="hint" id="hint" hidden></div>
      </section>
      <div class="paintrow" id="paintRow" title="${t('Paint left for this picture')}"><span class="plab"><span class="potico"></span><span><b>${t('Paint')}</b><small id="paintNeed"></small></span></span><div class="bar"><i id="paintFill"></i></div><b id="paintLeft"></b></div>
      <div class="paints" id="paints"></div>
      <div class="coachTip" id="coachTip" hidden></div>
      <div class="actions">
        <div class="noboost">${t('No boosters today: every drop counts.')}</div>
        <div class="boosters">
          <button class="btn boost" id="undoBtn"></button>
          <button class="btn boost" id="magicBtn"></button>
          <button class="btn boost" id="paletteBtn"></button>
          <button class="btn boost" id="brushBtn"></button>
        </div>
      </div>
      <div hidden><button id="hintBtn"></button><button id="pickBtn"></button><button id="emptyBtn"></button></div>
    </div>
  </div>
</div>
`;}

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
  daily:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9.5 15 2 2 3.5-4"/>',
  quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17h.01"/>',
  magic:'<path d="M4 20 14 10"/><path d="M16 3v3M16 12v3M11.5 7.5H10M22 7.5h-1.5M19.2 4.3l-1 1M13.8 4.3l1 1"/>',
  palette:'<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-1 2-2 0-1.3-1.2-1.6-1.2-2.8 0-1 .8-1.7 1.8-1.7h2.2a3.7 3.7 0 0 0 3.7-3.7C20.5 6.7 16.700 3.5 12 3.5Z"/><circle cx="7.5" cy="11.5" r="1.2"/><circle cx="10" cy="7.5" r="1.2"/><circle cx="14.5" cy="7.5" r="1.2"/>',
  brush:'<path d="M14.5 4.5 19.5 9.5 11 18l-5-5Z"/><path d="M6 13c-2 .5-2.5 2-2.5 3.5S3 19.5 2.5 20.5c2.5.3 5.5-.4 6.6-1.6S10 15.5 8.6 15.3"/><path d="m16 3 5 5"/>',
  pot:'<path d="M5 9h14l-1.4 9.5a2 2 0 0 1-2 1.5H8.4a2 2 0 0 1-2-1.5Z"/><path d="M4 9h16M9 9V6.5a3 3 0 0 1 6 0V9"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  gift:'<rect x="3.5" y="9" width="17" height="11.5" rx="1.5"/><path d="M2.5 9h19v-3.5h-19ZM12 5.5v15M12 5.5C10 2 6 2.5 6.5 5c.3 1 3 .5 5.5.5M12 5.5c2-3.5 6-3 5.5-.5-.3 1-3 .5-5.5.5"/>',
  wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.3-.4-.4-2.3Z"/>'};
const icon=k=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
const BOOSTERS={
  undo:{name:t('Undo'),price:20,text:t('Takes back your last drop and refunds its paint.')},
  hint:{name:t('Hint'),price:40,text:t('Shows the next paint to add for the part you are on. That part can earn at most 2 stars.')},
  pick:{name:t('Pick'),price:30,text:t('Tap it, then tap any drop in the bowl to remove just that color. The paint comes back.')},
  empty:{name:t('Empty'),price:15,text:t('Pours out the whole bowl and gives all its paint back.')}};
// Redesign: Pick folds into Undo (tap a drop to take it out), pouring out is a free tap on the bowl, and Hint becomes
// Magic (does the step instead of showing it, so a screenshot gains nothing). Two paint boosters fill the freed slots.
// They are introduced on the pictures that used to introduce Hint, Pick and Empty.
if(V2){
  delete BOOSTERS.hint; delete BOOSTERS.pick; delete BOOSTERS.empty;
  BOOSTERS.undo.text=t('Takes back your last drop. The paint comes back to the pot.');
  Object.assign(BOOSTERS,{
    magic:{name:t('Magic'),price:40,text:t('Puts the next right drop in the bowl, or takes a wrong one out. That part can earn at most 2 stars.')},
    palette:{name:t('Palette'),price:25,text:t('Dims the paints this part does not use, until the part is painted. The part can still earn 3 stars.')},
    brush:{name:t('Brush'),price:60,text:t('Mixes the exact recipe for the part you are on, drop by drop, then you tap Paint it. It uses that paint from the pot, and the part earns at most 2 stars.')}});
}
const INTRO_ALIAS=V2?{magic:'hint',palette:'pick',brush:'empty'}:{};
// Economy: a game can override any of these with G.economy (ColorBook pays 1 coin per star so boosters keep their value).
const EC=Object.assign({coinsPerStar:3,firstClear:20,replay:5,rescue:30,chapterCoins:60,bonusPrice:{easy:30,normal:40,hard:60,nightmare:80}},G.economy||{});
const FREE_BOOSTERS=3, RESCUE_PRICE=EC.rescue, COINS_PER_STAR=EC.coinsPerStar, FIRST_CLEAR_BONUS=EC.firstClear, REPLAY_BONUS=EC.replay;
const introAt=b=>LEVELS.findIndex(l=>l.intro===(INTRO_ALIAS[b]||b));
const FIRST_PROPER=LEVELS.findIndex(l=>l.id===G.firstProper); // share/challenge from here on
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---------- Saved progress (per viewer, optional) ----------
let save={best:{},coins:0,inv:{},seen:{},tut:{},challenge:null,name:'',bought:{},chapters:{},chests:0};
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s&&s.best)save=Object.assign(save,s);}catch(e){}
// Players who had the old boosters keep their counts under the new ones.
if(V2){ Object.entries(INTRO_ALIAS).forEach(([nb,ob])=>{ if(save.inv[nb]==null&&save.inv[ob]!=null) save.inv[nb]=save.inv[ob]; });
  [['palette','refill'],['brush','free']].forEach(([nb,ob])=>{ if(save.inv[nb]==null&&save.inv[ob]!=null) save.inv[nb]=save.inv[ob]; }); }
let respot=()=>{}; // redraws the selected part's highlight (set by the redesign)
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){}}
// Soft shading (GAME.shading, ColorBook): every filled part gets a light from the top left, drawn as an overlay of
// its own shape (.shade, right after the part), so the part itself stays one flat target color. Faded parts get a
// lighter, pencil-like version (CSS picks it by fill). Line parts (`stroke`) get none.
const SHADE=!!G.shading;
if(SHADE) document.body.insertAdjacentHTML('beforeend',`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="cbShade" cx=".5" cy=".5" r=".75" fx=".3" fy=".25"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/><stop offset=".66" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
<radialGradient id="cbShadeF" cx=".5" cy=".5" r=".75" fx=".3" fy=".25"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".66" stop-color="#4a5070" stop-opacity="0"/><stop offset="1" stop-color="#4a5070" stop-opacity=".12"/></radialGradient>
</defs></svg>`);
const shadeEl=r=>!SHADE||r.stroke?'':`<g class="shade" data-for="${r.id}" pointer-events="none">${r.svg}</g>`;
const unlocked=i=>{const l=LEVELS[i];
  if(l.season) return seasonOpen(l);
  if(l.bonus) return save.best[l.id]!=null||!!save.unlockAll||!!save.bought[l.id];
  return i===0||!!save.unlockAll||save.best[LEVELS[i-1].id]!=null||save.best[l.id]!=null;};
// ---------- Seasons (ColorBook): pictures with l.season live in the Holidays tab ----------
// Halloween runs Oct 1 to Oct 31, Thanksgiving from Nov 1 to the day after US Thanksgiving (4th Thursday of November),
// Christmas from Dec 1 to Jan 6, by the device date. A season's pictures open during it and stay playable once played.
// The staging cheat can force a season (save.forceSeason: 'halloween' | 'thanksgiving' | 'christmas' | 'off').
function thanksgivingDay(y){ const d=new Date(y,10,1); return 1+(4-d.getDay()+7)%7+21; }
function seasonOn(d){
  if(save.forceSeason) return save.forceSeason==='off'?null:save.forceSeason;
  d=d||new Date(); const y=d.getFullYear(), m=d.getMonth(), day=d.getDate();
  if(m===9) return 'halloween';
  if(m===10&&day<=thanksgivingDay(y)+1) return 'thanksgiving';
  if(m===11||(m===0&&day<=6)) return 'christmas';
  return null;
}
const SEASON_MONTH={halloween:9,thanksgiving:10,christmas:11};
// the next first day of season s that is still ahead of d
function seasonStart(s,d){ d=d||new Date(); const at=new Date(d.getFullYear(),SEASON_MONTH[s],1); if(at<=d) at.setFullYear(at.getFullYear()+1); return at; }
function seasonNext(d){ return Object.keys(SEASON_MONTH).map(s=>({s,at:seasonStart(s,d)})).sort((a,b)=>a.at-b.at)[0]; }
function seasonEnd(s,d){ d=d||new Date(); const y=d.getFullYear();
  return s==='halloween'?new Date(y,9,31):s==='thanksgiving'?new Date(y,10,thanksgivingDay(y)+1):new Date(d.getMonth()===0?y:y+1,0,6); }
function seasonOpen(l){ return seasonOn()===l.season||save.best[l.id]!=null||!!(save.partial&&save.partial[l.id])||!!save.unlockAll; }
const baseDone=l=>!l.bonus||save.best[l.base]!=null; // a bonus picture can be bought once its base picture is restored
const bonusPrice=l=>EC.bonusPrice[l.tier]||40;
const buyable=i=>LEVELS[i].bonus&&!unlocked(i)&&baseDone(LEVELS[i]);

// ---------- Analytics ----------
// track(event, props) sends to GA4 through gtag when G.analytics.ga4 is set (not on staging or localhost),
// else to window.dataLayer if a portal or tag manager set one up. The staging cheat menu lists the last events.
const AN=G.analytics||{}, EVENTS=[];
if(AN.ga4&&!CHEATS){
  window.dataLayer=window.dataLayer||[]; window.gtag=window.gtag||function(){dataLayer.push(arguments);};
  gtag('js',new Date()); gtag('config',AN.ga4,{allow_google_signals:false,allow_ad_personalization_signals:false});
  const sc=document.createElement('script'); sc.async=true; sc.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(AN.ga4); document.head.appendChild(sc);
}
function track(ev,p){
  const d=Object.assign({game:GAME_NAME},p||{});
  try{ if(typeof window.gtag==='function') gtag('event',ev,d); else if(Array.isArray(window.dataLayer)) dataLayer.push(Object.assign({event:ev},d)); }catch(e){}
  EVENTS.unshift(new Date().toTimeString().slice(0,8)+' '+ev+' '+JSON.stringify(p||{})); if(EVENTS.length>40) EVENTS.length=40;
}
const lvProps=()=>L?{level:L.id,index:L.index+1,tier:L.tier,bonus:!!L.bonus,daily:!!(state&&state.daily)}:{};

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
function thumbSVG(lv,colored,part){
  const byId=Object.fromEntries(lv.regions.map(r=>[r.id,r]));
  // part: ids of the parts already painted in a picture left half-way (shown colored on Home and in the gallery)
  const on=r=>colored||!!(part&&part[r.id]);
  const reg=r=>r.stroke
    ?`<g fill="none" stroke="${on(r)?hex(r.target):BLANK_STROKE}" stroke-width="${r.stroke}" stroke-linecap="round">${r.svg}</g>`
    :`<g fill="${on(r)?hex(r.target):BLANK}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round">${r.svg}</g>${shadeEl(r)}`;
  return `<svg viewBox="0 0 320 240" aria-hidden="true">${lv.bg||''}${lv.order.map(id=>reg(byId[id])).join('')}${lv.decor}</svg>`;
}
// Next picture to play: first unfinished one, or the challenged one if it is unlocked.
function nextIndex(){
  if(save.challenge){const ci=LEVELS.findIndex(l=>l.id===save.challenge.level); if(ci>=0&&unlocked(ci)) return ci;}
  const i=LEVELS.findIndex((l,k)=>k<MAIN&&save.best[l.id]==null);
  return i<0?MAIN-1:i;
}
function renderMenu(){
  const i=nextIndex(), lv=LEVELS[i], b=save.best[lv.id], allDone=LEVELS.slice(0,MAIN).every(l=>save.best[l.id]!=null);
  $('nextPic').innerHTML=thumbSVG(lv,false);
  $('nextLabel').textContent=allDone&&!save.challenge?t('All pictures restored'):t('Picture {i} of {n}',{i:i+1,n:MAIN})+(TIERS[lv.tier].label?` · ${TIERS[lv.tier].label}`:'');
  $('nextTitle').innerHTML=esc(T(lv))+(b!=null?`<span class="tstars">${starRow(b)}</span>`:'');
  $('playBtn').textContent=b!=null?t('Play again'):t('Play');
  $('homeStars').textContent='★ '+LEVELS.reduce((a,l)=>a+(save.best[l.id]||0),0);
  const ch=save.challenge; $('homeCh').hidden=!ch;
  if(ch){const cl=LEVELS.find(l=>l.id===ch.level);$('homeCh').textContent='🏆 '+t('{from} challenged you on {title}. Beat {score}★.',{from:ch.from,title:T(cl),score:ch.score});}
  const card=k=>{const l=LEVELS[k], bb=save.best[l.id], ok=unlocked(k), buy=buyable(k);
    const lab=ok?'':buy?', '+t('unlock for {coins}',{coins:tn(bonusPrice(l),'coin')}):l.bonus?', '+t('restore {title} first',{title:t(l.title)}):', '+t('locked');
    return `<button class="gcard${l.bonus?' bonus':''}${buy?' buy':''}" data-i="${k}" ${ok||buy?'':'disabled'} aria-label="${esc(T(l))}${lab}">${thumbSVG(l,bb!=null,save.partial&&save.partial[l.id]&&save.partial[l.id].stars)}${ok?'':`<span class="lockico">${icon('lock')}</span>`}<b>${l.bonus?'':(k+1)+'. '}${esc(T(l))}${TIERS[l.tier].label?` <em class="gtier">${TIERS[l.tier].label}</em>`:''}</b><small>${bb!=null?starRow(bb):buy?`${bonusPrice(l)} <span class="coin"></span>`:l.bonus?esc(t('Bonus')):''}</small></button>`;};
  if(CHAPTERS) $('ggrid').innerHTML=CHAPTERS.map((c,ci)=>{const [a,z]=chapterRange(ci), ids=LEVELS.slice(a,z).map(l=>l.id);
      const got=ids.filter(id=>save.best[id]!=null).length, bonus=LEVELS.map((l,k)=>k).filter(k=>LEVELS[k].bonus&&ids.includes(LEVELS[k].base));
      return `<h3 class="gch"><span>${t('Chapter {n}',{n:ci+1})}</span>${esc(t(c.name))}<small>${got} / ${z-a}</small></h3>`+[...Array(z-a).keys()].map(x=>card(a+x)).join('')+bonus.map(card).join('');}).join('');
  else $('ggrid').innerHTML=LEVELS.map((l,k)=>card(k)).join('');
  renderDailyQuiz(); renderDailyPic();
  if(HALL) renderHall();
  renderCoins();
}
let renderHolidays=()=>{};
function showTab(t){
  $('homeMain').hidden=t!=='home'; $('gallery').hidden=t!=='gallery';
  if($('holidays')){ $('holidays').hidden=t!=='holidays'; if(t==='holidays') renderHolidays(); }
  document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t));
  if(HALL&&t==='home') requestAnimationFrame(()=>centerOn(hallCenter,false));
}
function goHome(tab){
  hideHand(); state=null; parts=[]; hideCoach();
  ['endOverlay','introOverlay','quitOverlay','quizOverlay','settingsOverlay','buyOverlay'].forEach(id=>$(id).hidden=true);
  $('game').hidden=true; $('home').hidden=false;
  renderMenu(); showTab(tab||'home'); $('homeMain').scrollTop=0;
}
document.querySelectorAll('.tab').forEach(b=>{
  const home=b.dataset.tab==='home';
  b.innerHTML=icon(home?(HALL?'hall':'home'):'gallery')+(home?t(HALL?'Hall':'Home'):t(HALL?'Collection':'Gallery'));
  b.onclick=()=>showTab(b.dataset.tab);
});
$('playBtn').onclick=()=>{ if(HALL){ if(unlocked(hallCenter)) start(hallCenter); } else start(nextIndex()); };
$('nextPic').onclick=()=>start(nextIndex());
$('ggrid').addEventListener('click',e=>{const c=e.target.closest('.gcard'); if(!c||c.disabled) return; const i=+c.dataset.i; if(unlocked(i)) start(i); else if(buyable(i)) openBuy(i);});
// ---------- Chapters, star chests and bonus pictures ----------
function chapterRange(ci){let a=0; for(let c=0;c<ci;c++) a+=CHAPTERS[c].count; return [a,Math.min(MAIN,a+CHAPTERS[ci].count)];}
function chapterOf(i){const l=LEVELS[i], k=l.bonus?LEVELS.findIndex(x=>x.id===l.base):i; for(let c=0;c<CHAPTERS.length;c++){const [a,z]=chapterRange(c); if(k>=a&&k<z) return c;} return CHAPTERS.length-1;}
const chapterDone=ci=>{const [a,z]=chapterRange(ci); return LEVELS.slice(a,z).every(l=>save.best[l.id]!=null);};
const totalStars=()=>LEVELS.reduce((a,l)=>a+(save.best[l.id]||0),0);
const unlockedBoosters=()=>Object.keys(BOOSTERS).filter(b=>save.inv[b]!=null);
// Rewards earned since the last check: finished chapters and star chests. Paid out once, listed on the result card
// (lastRewards keeps them as data for the redesign's reward reveal).
let lastRewards=[];
function claimRewards(){
  const out=[]; lastRewards=[];
  if(CHAPTERS) CHAPTERS.forEach((c,ci)=>{ if(save.chapters[ci]||!chapterDone(ci)) return; save.chapters[ci]=true;
    const bs=unlockedBoosters(); bs.forEach(b=>save.inv[b]++); addCoins(EC.chapterCoins);
    lastRewards.push({kind:'chapter',n:ci+1,name:t(c.name),coins:EC.chapterCoins,boosters:bs});
    out.push(t('Chapter {n} complete: {name}! +{coins}',{n:ci+1,name:t(c.name),coins:tn(EC.chapterCoins,'coin')})+(bs.length?' '+t('and +1 of every booster.'):'.'));
    track('chapter_complete',{chapter:ci+1}); });
  if(CHESTS) while(Math.floor(totalStars()/CHESTS.every)>save.chests){ save.chests++;
    const bs=unlockedBoosters(), got=[]; for(let j=0;j<CHESTS.boosters&&bs.length;j++){const b=bs[Math.random()*bs.length|0]; save.inv[b]++; got.push(BOOSTERS[b].name);}
    addCoins(CHESTS.coins); lastRewards.push({kind:'chest',n:save.chests,coins:CHESTS.coins,boosters:got.map(nm=>Object.keys(BOOSTERS).find(b=>BOOSTERS[b].name===nm))});
    out.push(t('Star chest {n} opened: +{coins}',{n:save.chests,coins:tn(CHESTS.coins,'coin')})+(got.length?', '+got.join(', '):'')+'.');
    track('chest_open',{n:save.chests,stars:totalStars()}); }
  if(out.length) persist();
  return out;
}
let buyIdx=-1;
function openBuy(i){
  const l=LEVELS[i], p=bonusPrice(l), ok=save.coins>=p; buyIdx=i;
  $('buyImg').innerHTML=thumbSVG(l,false);
  $('buyTitle').textContent=T(l);
  $('buyText').innerHTML=t('A bonus page: {title} in new colors. {parts}.',{title:esc(t(l.title)),parts:tn(l.regions.length,'part')})+' '+
    (ok?t('Unlock it for {coins}?',{coins:tn(p,'coin')}):t('It costs {price}. You have {have}. Restore pictures and open star chests to earn more.',{price:tn(p,'coin'),have:save.coins}));
  $('buyOk').innerHTML=ok?`${t('Unlock')} · ${p} <span class="coin"></span>`:t('OK');
  $('buyOverlay').hidden=false;
}
$('buyCancel').onclick=()=>{$('buyOverlay').hidden=true;};
$('buyOk').onclick=()=>{
  const i=buyIdx, l=LEVELS[i]; $('buyOverlay').hidden=true; if(!l||!buyable(i)) return;
  const p=bonusPrice(l); if(save.coins<p) return;
  addCoins(-p); save.bought[l.id]=true; persist(); sfx('coin'); track('bonus_unlock',{level:l.id,price:p});
  start(i);
};
$('backBtn').innerHTML=icon('back'); $('endHomeBtn').innerHTML=icon('home');
$('backBtn').onclick=()=>{
  if(state&&!state.finished&&Object.keys(state.done).length) $('quitOverlay').hidden=false; else goHome();
};
$('quitStay').onclick=()=>{$('quitOverlay').hidden=true;};
$('quitLeave').onclick=()=>{track('level_quit',Object.assign(lvProps(),{parts_done:state?Object.keys(state.done).length:0,parts:L.regions.length,paint_left:state?state.paint:0})); goHome();};
$('endHomeBtn').onclick=()=>goHome();

function start(i,o={}){
  L=LEVELS[i]; L.index=i;
  const daily=!!(o.daily&&DAILY), twist=daily?dailyTwist():null, budget=daily?dailyBudget(L,twist):L.budget;
  state={twist,done:{},stars:{},used:{},hinted:{},rescued:{},drops:[],fr:[],freeLeft:0,picking:false,forced:false,hintMsg:null,paint:budget,budget,daily,earned:0,finished:false,quizUsed:false};
  $('home').hidden=true; $('game').hidden=false; document.querySelector('.board').scrollTop=0;
  $('credit').innerHTML=L.credit?t(L.credit):'';
  const ks=L.paints||PAINTS.map(p=>p.k);
  $('paints').style.setProperty('--n',ks.length);
  $('paints').innerHTML=ks.map(k=>PMAP[k]).map(p=>`<button class="paint" data-k="${p.k}" aria-label="${t('Add {paint}',{paint:t(p.name)})}"><span class="blob" style="background:${hex(p.rgb)}"></span>${t(p.name)}</button>`).join('');
  hideHand(); hideCoach(); parts=[];
  document.querySelector('.frame').classList.remove('celebrate'); $('stamp').hidden=true;
  buildScene(); updateHud(); renderCoins();
  $('endOverlay').hidden=true;
  select(L.regions[0].id);
  showIntro();
  track('level_start',Object.assign(lvProps(),{twist:twist||undefined,budget,replay:save.best[L.id]!=null}));
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
  state.freshBoosters=fresh;
  if(!tip&&!fresh.length&&!chal&&!tierNote&&!state.daily){ startHands(); return; }
  $('introTitle').textContent=state.daily&&!tip?t('Daily picture'):chal?t('{from} challenged you!',{from:chal.from}):tip?t(tip.title):tierNote?t('{tier} picture',{tier:TIERS[L.tier].label}):t('New booster');
  $('introText').innerHTML=tip?t(tip.text):'';
  $('introText').hidden=!tip;
  let html='';
  if(state.daily){
    const s=dailyStreakNext();
    html+=`<div class="booster">${icon('daily')}<b>${t('Daily picture: {title}',{title:esc(T(L))})}</b><br>${twistText(state.twist,state.budget)} ${dailyDone()?t('Today\'s reward is already yours. This one is for fun.'):t('Restore it for {coins}. Streak: {days}.',{coins:tn(dailyReward(s),'coin'),days:tn(s,'day')})}</div>`;
  }
  if(chal){
    const ci=LEVELS.findIndex(l=>l.id===chal.level), n=LEVELS.slice(0,ci).filter(l=>save.best[l.id]==null).length;
    html+=`<div class="booster">🏆 ${t('Restore <b>{title}</b> with more than <b>{score}★</b>.',{title:esc(T(LEVELS[ci])),score:chal.score})}`+
      (n&&!unlocked(ci)?' '+t('First, finish the warm-up pictures to unlock it ({pics}).',{pics:tn(n,'picture')}):'')+'</div>';
  }
  if(tierNote) html+=`<div class="booster"><b>${t('{tier} picture.',{tier:TIERS[L.tier].label})}</b> ${L.tier==='nightmare'?t('Very little spare paint and colors that look almost the same.'):t('Less spare paint and closer shades than usual.')} ${t('Boosters help here. Rewards are ×{m}.',{m:TIERS[L.tier].mult})}</div>`;
  html+=fresh.map(b=>`<div class="booster">${icon(b)}<b>${t('New booster: {name}',{name:BOOSTERS[b].name})}</b><br>${BOOSTERS[b].text}<br>${t('You get {n} free. After that, {price} each.',{n:FREE_BOOSTERS,price:BOOSTERS[b].price+' <span class="coin"></span>'})}</div>`).join('');
  $('introBoosters').innerHTML=html; $('introBtn').textContent=t("Let's paint");
  $('introOverlay').hidden=false;
}
$('introBtn').onclick=()=>{$('introOverlay').hidden=true; if(state) startHands();};

function regionEl(r){
  return r.stroke
    ? `<g class="region" data-id="${r.id}" fill="none" stroke="${BLANK_STROKE}" stroke-width="${r.stroke}" stroke-linecap="round">${r.svg}</g>`
    : `<g class="region" data-id="${r.id}" fill="${BLANK}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round">${r.svg}</g>${shadeEl(r)}`;
}
function buildScene(){
  const byId=Object.fromEntries(L.regions.map(r=>[r.id,r]));
  scene.innerHTML=`<g pointer-events="none">${L.bg||''}</g>`+L.order.map(id=>regionEl(byId[id])).join('')+L.decor+
    L.regions.filter(r=>r.crack).map(r=>`<path class="crack" data-for="${r.id}" d="${r.crack}"/>`).join('')+
    '<g id="selLayer"></g><g id="fxLayer" pointer-events="none"></g>';
  scene.setAttribute('aria-label',t('Faded picture')+': '+T(L));
  scene.querySelectorAll('.region').forEach(g=>g.addEventListener('click',()=>{if(!state.done[g.dataset.id]&&!state.forced&&!state.lesson&&!state.applying){handDone('tapPart');select(g.dataset.id);}}));
}
const current=()=>L.regions.find(x=>x.id===state.sel);
function select(id){
  if(!state) return;
  state.sel=id; state.drops=[]; state.fr=[]; state.picking=false; state.hintMsg=null; state.applying=false;
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
function advice(m,tg){
  const dl=lab(m)[0]-lab(tg)[0];
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
  if(save.inv.undo!=null) $('undoBtn').disabled=!has;
  if(V2){
    if(save.inv.magic!=null) $('magicBtn').disabled=state.finished;
    const pl=$('paletteBtn'), on=!!(state.palette&&state.palette[state.sel]); pl.classList.toggle('on',on);
    if(save.inv.palette!=null) pl.disabled=on||state.finished;
    if(save.inv.brush!=null) $('brushBtn').disabled=state.finished||!!state.applying;
    return;
  }
  if(save.inv.empty!=null) $('emptyBtn').disabled=!has;
  if(save.inv.pick!=null){$('pickBtn').disabled=!has; $('pickBtn').classList.toggle('on',state.picking);}
  if(save.inv.hint!=null) $('hintBtn').disabled=!!state.hintMsg||state.finished;
}
function updateHud(){
  $('progress').textContent=Object.keys(state.done).length+' / '+L.regions.length;
  const tl=state.daily?t('Daily'):TIERS[L.tier].label; $('tierPill').hidden=!tl; $('tierPill').textContent=tl;
  $('paintLeft').textContent=state.paint;
  const f=$('paintFill'),pc=Math.min(100,state.paint/state.budget*100);
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
function canUse(b){return !(state&&state.twist==='noboost')&&(save.inv[b]>0||save.coins>=BOOSTERS[b].price);}
function spend(b){
  if(state&&state.twist==='noboost'){toast(t("No boosters in today's challenge."));buzz(40);sfx('wrong');return false;}
  const had=save.inv[b]>0;
  if(had){save.inv[b]--;persist();}
  else if(save.coins>=BOOSTERS[b].price){addCoins(-BOOSTERS[b].price); sfx('coin');toast(t('{name} bought: {coins}',{name:BOOSTERS[b].name,coins:tn(BOOSTERS[b].price,'coin')}));}
  else{toast(t('{name} costs {price}. You have {have}.',{name:BOOSTERS[b].name,price:tn(BOOSTERS[b].price,'coin'),have:save.coins}));buzz(40);sfx('wrong');return false;}
  track('booster_used',Object.assign(lvProps(),{booster:b,bought:!had}));
  renderActions(); return true;
}
// A drop poured under Free drops never came out of the pot, so taking it out refunds nothing.
function refundDrop(free){if(!free) state.paint++; state.used[state.sel]--; updateHud();}

// ---------- Hand tutorial: an animated hand shows a gesture instead of a text tip ----------
// A level lists its demos in `coach` (default on a game's first picture: 'tapPaint', then 'drag'). Each shows once per save.
//  tapPaint: forced first step: the screen dims, only the part's paint works, the hand taps it
//  drag    : forced next step (the next part): only dragging that paint into the bowl works, the hand shows it
//  tapPart : tap another faded part (`coachPart` or the second part); a drop instead hides it for now
//  booster : after its intro card, a freshly unlocked booster gets two taps
const HAND='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 30V7.5a3.5 3.5 0 0 1 7 0V20a3.3 3.3 0 0 1 6.6 0V22a3.3 3.3 0 0 1 6.6 0V24a3.3 3.3 0 0 1 6.6 0V33c0 7-5 12-12 12h-5c-4 0-7-2-9.5-5.5L9.8 30.8a3 3 0 0 1 4.6-3.8Z"/></svg>';
const HX=22, HY=4; // fingertip inside the 52px hand box
let handEls=[], handAnims=[];
function hideHand(){ handAnims.forEach(a=>a.cancel()); handAnims=[]; handEls.forEach(e=>e.remove()); handEls=[]; if(state) state.hand=null; }
function handDone(kind){ if(!state||!state.hand||state.hand.kind!==kind) return; save.tut[kind]=true; persist(); hideHand(); }
const centerOf=el=>{const r=el.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2];};
function handEl(cls,html){const e=document.createElement('div'); e.className=cls; if(html) e.innerHTML=html; document.body.appendChild(e); handEls.push(e); return e;}
const at=(x,y,dx,dy,sc=1)=>`translate(${x-dx}px,${y-dy}px) scale(${sc})`;
function playHand(cfg){
  hideHand(); state.hand=cfg;
  const hand=handEl('hand',HAND), [ax,ay]=centerOf(cfg.from), [bx,by]=cfg.to?centerOf(cfg.to):[ax,ay];
  if(reduced){ hand.style.transform=at(ax,ay,HX,HY); return; }
  if(cfg.drag){
    const drop=handEl('handDrop'); drop.style.background=cfg.color;
    handAnims.push(hand.animate([
      {offset:0,transform:at(ax,ay,HX,HY),opacity:0},{offset:.12,transform:at(ax,ay,HX,HY),opacity:1},
      {offset:.22,transform:at(ax,ay,HX,HY,.86)},{offset:.66,transform:at(bx,by,HX,HY,.86),opacity:1},
      {offset:.76,transform:at(bx,by,HX,HY),opacity:1},{offset:1,transform:at(bx,by,HX,HY),opacity:0}],
      {duration:2200,iterations:Infinity,easing:'ease-in-out'}));
    handAnims.push(drop.animate([
      {offset:0,transform:at(ax,ay,15,15,.4),opacity:0},{offset:.22,transform:at(ax,ay,15,15),opacity:1},
      {offset:.66,transform:at(bx,by,15,15),opacity:1},{offset:.74,transform:at(bx,by,15,15,.3),opacity:0},{offset:1,opacity:0}],
      {duration:2200,iterations:Infinity,easing:'ease-in-out'}));
  }else{ // tap
    const ring=handEl('handRing'), n=cfg.times||Infinity;
    const a=hand.animate([
      {offset:0,transform:at(ax,ay,HX,HY),opacity:0},{offset:.15,transform:at(ax,ay,HX,HY),opacity:1},
      {offset:.35,transform:at(ax,ay,HX,HY,.84)},{offset:.5,transform:at(ax,ay,HX,HY)},
      {offset:.65,transform:at(ax,ay,HX,HY,.84)},{offset:.8,transform:at(ax,ay,HX,HY),opacity:1},{offset:1,transform:at(ax,ay,HX,HY),opacity:0}],
      {duration:1800,iterations:n,easing:'ease-in-out'});
    handAnims.push(a, ring.animate([
      {offset:0,transform:at(ax,ay,22,22,.3),opacity:0},{offset:.35,transform:at(ax,ay,22,22,.4),opacity:.9},
      {offset:.6,transform:at(ax,ay,22,22,1.5),opacity:0},{offset:1,opacity:0}],{duration:1800,iterations:n}));
    if(n!==Infinity) a.onfinish=hideHand;
  }
}
function startLesson(kind){
  const r=current(), k=Object.keys(r.recipe)[0], btn=$('paints').querySelector(`.paint[data-k="${k}"]`);
  if(!btn||state.drops.length) return false;
  state.lesson={kind,k};
  $('coachTip').innerHTML=kind==='tapPaint'?t('Tap <b>{paint}</b> to put a drop in the bowl.',{paint:PN(k)}):t('Now drag <b>{paint}</b> into the bowl.',{paint:PN(k)});
  $('coachTip').hidden=false; $('coachDim').hidden=false;
  btn.classList.add('coach'); document.querySelector('.swatches').classList.add('lift'); document.body.classList.add('coaching');
  playHand(kind==='tapPaint'?{kind:'lessonTap',from:btn}:{kind:'lessonDrag',drag:1,from:btn,to:$('mixChip'),color:hex(PMAP[k].rgb)});
  revealInBoard($('coachTip'));
  return true;
}
function lessonDone(){ const l=state.lesson; state.lesson=null; save.tut[l.kind]=true; persist(); hideHand(); hideCoach(); }
function startHands(){
  if(!state||state.finished||state.forced||state.lesson) return;
  const want=L.coach||(L.index===0?['tapPaint','drag']:[]);
  if(want.includes('tapPaint')&&!save.tut.tapPaint){ if(startLesson('tapPaint')) return; }
  else if(want.includes('drag')&&!save.tut.drag){ if(startLesson('drag')) return; }
  if(want.includes('tapPart')&&!save.tut.tapPart){
    const id=L.coachPart&&!state.done[L.coachPart]&&L.coachPart!==state.sel?L.coachPart:(L.regions.find(x=>!state.done[x.id]&&x.id!==state.sel)||{}).id;
    const g=id&&scene.querySelector(`.region[data-id="${id}"]`);
    if(g){ playHand({kind:'tapPart',from:g}); renderMix([t('Tap any faded part to paint it next.'),'']); return; }
  }
  // the hand only shows a fresh booster that can be used right now (never a greyed-out one)
  const b=(state.freshBoosters||[]).find(x=>$(x+'Btn')&&!$(x+'Btn').disabled);
  if(b){ state.freshBoosters=[]; playHand({kind:'booster',from:$(b+'Btn'),times:2}); }
}
addEventListener('resize',()=>{ if(state&&state.hand&&state.hand.kind!=='booster') playHand(state.hand); });

// ---------- Forced free Undo (first wrong color on the picture that introduces Undo) ----------
function forceUndo(k){
  state.forced=true;
  $('coachTip').innerHTML=t('Oops! {part} has no <b>{paint}</b> in it.',{part:esc(N(current())),paint:PN(k)})+'<br>'+t('Tap <b>Undo</b> to take that drop back. This one is free.');
  buzz([40,50,40]); sfx('wrong');
  $('coachTip').hidden=false; $('coachDim').hidden=false;
  $('undoBtn').classList.add('coach'); document.querySelector('.swatches').classList.add('lift');
  document.body.classList.add('coaching');
  renderActions();
  revealInBoard($('undoBtn'));
}
function hideCoach(){
  $('coachTip').hidden=true; $('coachDim').hidden=true;
  document.querySelectorAll('.coach').forEach(e=>e.classList.remove('coach')); document.querySelector('.swatches').classList.remove('lift');
  document.body.classList.remove('coaching');
}
// Bring a coached control into view inside the board: on short phones the tip can push it below the screen,
// and the dim layer blocks scrolling.
function revealInBoard(el){
  requestAnimationFrame(()=>{ const r=el.getBoundingClientRect(), b=document.querySelector('.board');
    if(r.bottom>innerHeight-8||r.top<0) b.scrollBy({top:r.bottom-innerHeight+16,behavior:reduced?'auto':'smooth'}); });
}
function nudge(){const t=$('coachTip');t.classList.remove('nudge');void t.offsetWidth;t.classList.add('nudge');}
// A tap on the dim layer over a coached control counts as a tap on it: if a browser still stacks the dim above
// the lifted control (iPhone Safari did), the lesson stays playable.
$('coachDim').onclick=e=>{
  const c=[...document.querySelectorAll('.coach')].find(el=>{const r=el.getBoundingClientRect();
    return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;});
  if(c) c.click(); else nudge();
};

// ---------- Input ----------
function addDrop(k,via){
  if(!state||state.finished||state.applying) return false;
  if(state.forced){nudge();return false;}
  if(state.lesson){ // forced first steps: only the shown paint, and in the drag lesson only by dragging
    // after two failed drags (a phone can cancel the gesture), a tap on the right paint counts too, so nobody gets stuck
    if(k!==state.lesson.k||(state.lesson.kind==='drag'&&via!=='drag'&&(state.lesson.misses||0)<2)){
      if(k===state.lesson.k) state.lesson.misses=(state.lesson.misses||0)+1;
      nudge();buzz(30);return false;
    }
    lessonDone();
  }
  if(state.paint<=0&&!(state.freeLeft>0)){outOfPaint();return false;}
  if(state.drops.length>=12){renderMix([t('The bowl is full. Take drops out or empty it.'),'bad']);buzz(40);sfx('wrong');return false;}
  state.picking=false; state.hintMsg=null;
  const free=state.freeLeft>0; state.drops.push(k); state.fr.push(free); if(free) state.freeLeft--; else state.paint--;
  state.used[state.sel]=(state.used[state.sel]||0)+1; buzz(8); sfx('drop',k);
  if(state.hand) hideHand();
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
  }else if(state.paint<=0&&!(state.freeLeft>0)&&!(V2?['undo','refill','free']:['undo','pick','empty']).some(canUse)){
    setTimeout(outOfPaint,900); // nothing left to fix the mix with
  }
}
let dragged=false; // set when a press turned into a drag, so the click that follows is ignored
$('paints').addEventListener('click',e=>{
  const b=e.target.closest('.paint'); if(!b) return;
  if(dragged){dragged=false;return;}
  addDrop(b.dataset.k,'tap');
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
    if(e.type==='pointercancel'&&state&&state.lesson&&state.lesson.k===k) state.lesson.misses=(state.lesson.misses||0)+1;
    if(e.type==='pointerup'&&overMix(e.clientX,e.clientY)&&addDrop(k,'drag')){
      const r=$('mixChip').getBoundingClientRect();
      burst(r.left+r.width/2,r.top+r.height/2,[hex(PMAP[k].rgb),hex(PMAP[k].rgb),'#ffffff'],12,{speed:4,size:3.5,decay:.035,gravity:.1});
    }
    setTimeout(()=>{dragged=false;},0);
  };
  addEventListener('pointerup',end); addEventListener('pointercancel',end);
  // iPhone Safari can still hand a drag to the scrolling board (pointercancel, the drop never lands): block touch scrolling while a paint is held
  addEventListener('touchmove',e=>{ if(d) e.preventDefault(); },{passive:false});
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
  const chip=$('mixChip'), st=state; buzz(15); sfx('pour');
  if(reduced){done();return;}
  state.applying=true;
  const col=chip.style.background||INK, r=chip.getBoundingClientRect();
  chip.classList.remove('pour'); void chip.offsetWidth; chip.classList.add('pour');
  $('drops').querySelectorAll(V2?'.dchip':'span').forEach((d,i)=>{d.style.animationDelay=(i*40)+'ms'; d.classList.add('fall');});
  setTimeout(()=>{ if(state===st) burst(r.left+r.width*.12,r.top+r.height*.3,[col,col,col,'#ffffff'],16,{angle:Math.PI*1.08,spread:.7,speed:5,size:4,decay:.02,gravity:.3}); },170);
  setTimeout(()=>{ chip.classList.remove('pour'); if(state!==st) return; state.applying=false; done(); },620);
}
$('undoBtn').onclick=()=>{
  if(state.applying||isLocked('undo')||!state.drops.length) return;
  if(state.forced){
    state.drops.pop(); refundDrop(); sfx('undo'); state.forced=false; save.tut.undo=true; persist(); hideCoach();
    renderMix([t("That's Undo. You have {n} left, then they cost {price}.",{n:save.inv.undo,price:tn(BOOSTERS.undo.price,'coin')}),'good']);
    afterMixChange(); return;
  }
  if(!spend('undo')) return;
  state.drops.pop(); state.picking=false; state.hintMsg=null; refundDrop(); sfx('undo'); renderHint(); renderMix([t('Drop taken back. Paint refunded.'),'']);
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
  state.picking=false; state.hintMsg=null; refundDrop(); sfx('undo'); renderHint(); renderMix([t('{paint} taken out. Paint refunded.',{paint:PN(k)}),'']);
  afterMixChange();
});
$('hintBtn').onclick=()=>{
  if(state.applying||isLocked('hint')||state.finished||state.hintMsg||!spend('hint')) return;
  state.hinted[state.sel]=true; state.hintMsg=nextHint(); renderHint();
};
$('retryBtn').onclick=()=>start(L.index,{daily:state&&state.daily});
// Next: the next main picture, or after a bonus picture the next unlocked bonus one not yet restored (-1: none).
function nextAfter(i){
  if(LEVELS[i].season) return LEVELS.findIndex((l,k)=>k!==i&&l.season===LEVELS[i].season&&unlocked(k)&&save.best[l.id]==null);
  if(!LEVELS[i].bonus) return i+1<MAIN?i+1:-1;
  return LEVELS.findIndex((l,k)=>k>i&&l.bonus&&unlocked(k)&&save.best[l.id]==null);
}
$('nextBtn').onclick=()=>{const n=nextAfter(L.index); if(n<0) goHome(); else start(n);};
$('rescueBtn').onclick=()=>rescue();
$('shareBtn').onclick=share;

function apply(){
  if(state.forced||state.finished) return;
  const r=current(),m=mix(counts()); if(!m) return;
  const p=matchPct(m,r.target);
  if(p<95){
    const chip=$('mixChip');chip.classList.remove('shake');void chip.offsetWidth;chip.classList.add('shake'); sfx('wrong');
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
  track('part_complete',Object.assign(lvProps(),{part:r.id,part_index:Object.keys(state.done).length,stars:s,drops:used,par:r.min}));
  // Like ColorFind: show drops used against the minimum (the recipe size) for this part.
  sfx('restore',Object.keys(state.done).length/L.regions.length);
  toast(`${N(r)} ${'★'.repeat(s)}${'☆'.repeat(3-s)} · ${used<=r.min?t('perfect: {drops}',{drops:tn(used,'drop')}):t('{drops}, min {min}',{drops:tn(used,'drop'),min:r.min})} · +${tn(c,'coin')}`);
  buzz(25);
  state.drops=[]; state.picking=false; state.hintMsg=null; updateHud(); renderHint();
  const next=L.regions.find(x=>!state.done[x.id]), st=state;
  if(!next){state.finished=true;finishPicture();}
  else if(state.paint<=0){select(next.id);setTimeout(outOfPaint,700);}
  else setTimeout(()=>{ if(state!==st) return; select(next.id); startHands(); },350);
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
    p.vx*=.985; p.vy=p.vy*.985+p.g;
    if(p.sway){ p.ph+=.045; p.vx+=Math.sin(p.ph)*.045; if(p.vy>p.vmax) p.vy=p.vmax; p.flip+=p.vf; } // paper: flutters and drifts
    p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.life-=p.decay;
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
    }else if(p.shape==='ribbon'){ // a paper strip turning over: its back side is a little darker
      const c=Math.cos(p.flip); fx.rotate(p.rot); fx.scale(1,c); if(c<0) fx.globalAlpha*=.78; fx.fillRect(-r,-r*.34,r*2,r*.68);
    }else{fx.arc(0,0,r,0,Math.PI*2); fx.fill(); fx.stroke();}
    fx.restore();
  }
  if(parts.length) requestAnimationFrame(tick); else {fxRun=false; fx.clearRect(0,0,innerWidth,innerHeight);}
}

// ---------- Picture complete: celebration ----------
function finishPicture(){
  hideHand(); const st=state; $('selLayer').innerHTML=''; scene.querySelectorAll('.spotUnder').forEach(e=>e.remove()); renderMix();
  setTimeout(()=>{ if(state!==st) return; celebrate(st); setTimeout(()=>{if(state===st) win();},2400); },450);
}
function celebrate(st){
  const frame=document.querySelector('.frame');
  frame.classList.remove('celebrate'); void frame.offsetWidth; frame.classList.add('celebrate'); setTimeout(()=>{if(state===st) sfx('fanfare');},350);
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
  setTimeout(()=>{ if(state!==st) return; $('stamp').hidden=false; sfx('stamp'); burst(cx,cy,[INK,'#ffffff'],26,{speed:8,shapes:['star'],decay:.03,size:5}); },1350);
}
function countUp(el,to){
  if(reduced||!to){el.textContent=to;return;}
  const t0=performance.now(), d=900;
  (function step(t){const k=Math.min(1,(t-t0)/d);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);})(t0);
}
function pictureStars(){return Math.max(1,Math.round(sumStars()/L.regions.length));}
function win(){
  const st=state, s=pictureStars(), last=!L.bonus&&L.index===MAIN-1, first=save.best[L.id]==null;
  const total=sumStars(), max=L.regions.length*3;
  const bonus=(first?FIRST_CLEAR_BONUS:REPLAY_BONUS)*TIERS[L.tier].mult; addCoins(bonus);
  save.best[L.id]=Math.max(save.best[L.id]||0,s);
  const ch=save.challenge&&save.challenge.level===L.id?save.challenge:null, beaten=!!ch&&total>ch.score;
  if(beaten) save.challenge=null;
  let daily=null;
  if(state.daily&&!dailyDone()){const streak=dailyStreakNext(), c=dailyReward(streak); save.daily={last:dayKey(),streak}; addCoins(c); daily={streak,c};
    setTimeout(()=>{if(state===st) sfx('daily');},1400);}
  const rewards=claimRewards();
  persist(); renderMenu(); updateHud(); buzz([30,60,30,60,70]);
  $('endTitle').textContent=t('{title} restored',{title:T(L)});
  $('endStars').innerHTML=[0,1,2].map(i=>`<span class="${i<s?'':'off'}" style="animation-delay:${250+i*280}ms">★</span>`).join('');
  const usedAll=L.regions.reduce((a,r)=>a+(state.used[r.id]||0),0), minAll=L.regions.reduce((a,r)=>a+r.min,0);
  $('endText').innerHTML=`${total} / ${max}★  ·  +<b id="earnNum">0</b> <span class="coin"></span> ${t('earned')}`+
    `<br>${t('Drops used <b>{used}</b> · minimum <b>{min}</b>',{used:usedAll,min:minAll})}${usedAll<=minAll?' · '+t('perfect!'):''}`+
    (daily?`<br><b>${t('Daily picture done! +{coins} · streak: {days}.',{coins:tn(daily.c,'coin'),days:tn(daily.streak,'day')})}</b>`:'')+
    (ch?(beaten?`<br><b>${t("You beat {from}'s {score}★!",{from:esc(ch.from),score:ch.score})}</b>`:'<br>'+t('{from} still leads: {score}★ vs your {you}★. Replay to beat it.',{from:esc(ch.from),score:ch.score,you:total})):'')+
    (L.credit?`<br>${t(L.credit)}.`:'')+(QZ&&factFor(L.id)?`<br><i>${t('Did you know?')}</i> ${esc(t(factFor(L.id).fact))}`:'')+(last?'<br>'+t('That was the last picture of the book. Bonus pages wait in the gallery.'):'')+
    rewards.map(x=>`<br><b>${esc(x)}</b>`).join('');
  countUp($('earnNum'),state.earned);
  for(let i=0;i<s;i++) setTimeout(()=>{ if(state!==st) return; sfx('star',i); const b=$('endStars').children[i].getBoundingClientRect();
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
  $('nextBtn').hidden=last||nextAfter(L.index)<0;
  $('endOverlay').hidden=false;
  fitEndCard();
  const usedPaint=state.budget-state.paint;
  track('level_complete',Object.assign(lvProps(),{stars:s,total_stars:total,max_stars:max,drops:usedAll,min_drops:minAll,paint_used:usedPaint,budget:state.budget,first,coins:state.earned}));
}
// Desktop: the result card fills the right column (mixer top to picture bottom), so the restored picture stays in view with no gaps.
function fitEndCard(){
  const o=$('endOverlay'), m=document.querySelector('#game .mixer'), f=document.querySelector('#game .frame');
  if(o.hidden||!o.classList.contains('low')||!m) return;
  const r=m.getBoundingClientRect(), bottom=Math.max(r.bottom,f?f.getBoundingClientRect().bottom:0);
  o.style.setProperty('--mx-top',r.top+'px'); o.style.setProperty('--mx-left',r.left+'px');
  o.style.setProperty('--mx-w',r.width+'px'); o.style.setProperty('--mx-h',(bottom-r.top)+'px');
}
addEventListener('resize',fitEndCard);

// ---------- Sharing ----------
const EMOJI={'🟥':[.87,.18,.18],'🟧':[.96,.55,.13],'🟨':[.99,.83,.2],'🟩':[.33,.69,.3],'🟦':[.2,.5,.87],'🟪':[.6,.35,.75],'🟫':[.55,.35,.2],'⬛':[.15,.15,.15],'⬜':[.95,.95,.95]};
const emojiRow=()=>L.regions.map(r=>Object.keys(EMOJI).reduce((a,b)=>dE(EMOJI[a],r.target)<=dE(EMOJI[b],r.target)?a:b)).join('');
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
// Renders the restored picture as a 1080×1080 PNG card. Built ahead of time so the share tap stays a direct user gesture.
async function makeShareFile(total,max){
  const c=scene.cloneNode(true);
  c.querySelectorAll('#selLayer,#fxLayer,.crack,.spotUnder').forEach(e=>e.remove());
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
  hideHand();
  const r=current(), ok=save.coins>=RESCUE_PRICE;
  $('endTitle').textContent=t('Out of paint'); buzz([60,40,60]); sfx('fail');
  track('out_of_paint',Object.assign(lvProps(),{part:r.id,parts_done:Object.keys(state.done).length,parts:L.regions.length,coins:save.coins}));
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
// Pay coins (or watch an ad: free) to retry the current part: refund the paint spent on it, topped up so it is always winnable.
function rescue(free){
  if(free!==true&&save.coins<RESCUE_PRICE) return;
  if(free!==true) addCoins(-RESCUE_PRICE);
  const r=current(); track('rescue',Object.assign(lvProps(),{part:r.id}));
  state.paint=Math.max(state.paint+(state.used[r.id]||0),r.min+4);
  state.used[r.id]=0; state.rescued[r.id]=true;
  $('endOverlay').hidden=true;
  updateHud(); select(r.id);
  toast(t('{part} restarted. Paint refilled.',{part:N(r)}));
}
// ---------- Daily picture (only for games that define G.daily) ----------
// Every day one restored picture comes back with less paint. Restoring it pays coins that grow with the streak.
const dayHash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
// The pool: restored pictures plus bonus pictures whose base is restored (a daily bonus picture is a free try; restoring it unlocks it).
function dailyPool(){
  const done=LEVELS.map((l,i)=>i).filter(i=>{const l=LEVELS[i]; return l.bonus?baseDone(l):save.best[l.id]!=null;}), hard=done.filter(i=>LEVELS[i].tier!=='easy');
  return hard.length>=2?hard:done; // skip the tutorials once there is enough else to pick from
}
// Each day has a twist: less paint (lean), no boosters (noboost) or no match % shown (blind).
const TWISTS=['lean','noboost','blind'];
const DREAMS=LEVELS.map((l,i)=>i).filter(i=>LEVELS[i].dream);
// the dream-journal daily challenge never allows boosters; its budget is already tight
const dailyTwist=()=>V2&&DREAMS.length?'noboost':TWISTS[dayHash('twist'+dayKey())%TWISTS.length];
const twistName=w=>({lean:t('Less paint'),noboost:t('No boosters'),blind:t('No match %')})[w]||'';
function twistText(w,budget){
  return w==='noboost'?t("Today's twist: no boosters. Plan every drop."):w==='blind'?t("Today's twist: the match % stays hidden. Trust your eyes."):t('Less paint than usual: {drops}.',{drops:tn(budget,'drop')});
}
function dailyIndex(){const p=dailyPool(); return p.length?p[dayHash(GAME_NAME+dayKey())%p.length]:-1;}
function dailyBudget(l,w){return w&&w!=='lean'?l.budget:Math.min(l.budget,Math.ceil(l.regions.reduce((a,r)=>a+r.min,0)*DAILY.ratio));}
const dailyDone=()=>!!save.daily&&save.daily.last===dayKey();
function dailyStreakNext(){const d=save.daily; if(!d) return 1; if(d.last===dayKey()) return d.streak; return d.last===dayKey(new Date(Date.now()-864e5))?d.streak+1:1;}
const dailyReward=s=>DAILY.coins[Math.min(s,DAILY.coins.length)-1];
function renderDailyPic(){
  const b=$('dailyPicBtn'), i=DAILY?dailyIndex():-1; b.hidden=i<0; $('home').classList.toggle('hasDaily',i>=0); if(i<0) return;
  const s=dailyStreakNext(), lv=LEVELS[i];
  b.classList.toggle('done',dailyDone());
  b.innerHTML=icon('daily')+`<span class="dlab"><b>${dailyDone()?t('Daily picture done · streak: {days}',{days:tn(s,'day')}):t('Daily picture')+(s>1?' · '+t('day {n}',{n:s}):'')}</b>`+
    `<small>${esc(T(lv))}${dailyDone()?'':` · +${dailyReward(s)} <span class="coin"></span>`}</small></span>`;
}
$('dailyPicBtn').onclick=()=>{const i=dailyIndex(); if(i>=0) start(i,{daily:true});};
if($('bonusBtn')) $('bonusBtn').onclick=()=>{showTab('gallery'); const c=$('ggrid').querySelector('.gcard.buy'); if(c) c.scrollIntoView({block:'center'});};
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
  persist(); buzz(ok?[25,40,25]:60); sfx(ok?'coin':'wrong');
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
  const snd=!!window.SFX&&SFX.supported; $('setSound').setAttribute('aria-checked',snd&&SFX.enabled); $('setSound').disabled=!snd;
  $('setVib').setAttribute('aria-checked',vibOn&&canVibrate); $('setVib').disabled=!canVibrate; $('vibNote').hidden=canVibrate;
}
$('settingsBtn').innerHTML=icon('gear');
$('settingsBtn').onclick=()=>{renderSettings(); $('settingsOverlay').hidden=false;};
$('settingsDone').onclick=()=>{$('settingsOverlay').hidden=true;};
$('setTheme').onclick=e=>{const b=e.target.closest('button'); if(!b) return; theme=b.dataset.v; try{localStorage.setItem(THEME_KEY,theme);}catch(err){} applyTheme(); renderSettings();};
$('setLang').onclick=e=>{const b=e.target.closest('button'); if(!b||b.dataset.v===I18N.pref) return; I18N.setPref(b.dataset.v); location.reload();};
$('setSound').onclick=()=>{ if(!window.SFX) return; SFX.enabled=!SFX.enabled; renderSettings(); sfx('drop','Y'); };
$('setVib').onclick=()=>{vibOn=!vibOn; try{localStorage.setItem(VIB_KEY,vibOn?'on':'off');}catch(e){} renderSettings(); buzz(30);};
// Privacy policy and terms on pontpixel.com, in French when the game is. Portals want outgoing links through their SDK
// (Poki: PokiSDK.openExternalLink; CrazyGames allows plain privacy/terms links), so every link goes through openExternal().
function openExternal(url){
  if(window.PokiSDK&&typeof PokiSDK.openExternalLink==='function'){PokiSDK.openExternalLink(url); return;}
  window.open(url,'_blank','noopener');
}
const LEGAL=I18N.lang==='fr'?{privacy:'fr/confidentialite/',terms:'fr/conditions/'}:{privacy:'privacy/',terms:'terms/'};
[['setPrivacy',LEGAL.privacy],['setTerms',LEGAL.terms]].forEach(([id,path])=>{
  const a=$(id); a.href='https://pontpixel.com/'+path;
  a.onclick=e=>{e.preventDefault(); openExternal(a.href);};
});
applyTheme();
let tt;function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('show'),1800);}

// ---------- Redesigned screens (G.v2): replaces the menu, HUD and mixer renderers, adds the new boosters ----------
if(V2){
  const STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z"/></svg>';
  const v2={pace:3,over:false,tip:0};
  const restart=(el,cls)=>{ if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  // Stars the current part would get right now (same rule as apply()).
  const paceOf=r=>{const u=state.used[r.id]||0; let s=u<=r.min?3:u<=r.min+2?2:1; return state.hinted[r.id]||state.rescued[r.id]?Math.min(s,2):s;};
  // The selected part shows the live mix on the picture itself; while the bowl is empty it breathes toward a pale
  // tint of its target color. Only the selected part ever breathes.
  function paintRegion(id,col){
    const g=scene.querySelector(`.region[data-id="${id}"]`), r=L.regions.find(x=>x.id===id); if(!g||!r) return;
    g.setAttribute(r.stroke?'stroke':'fill',col||(r.stroke?BLANK_STROKE:BLANK));
    const wait=!col&&!r.stroke&&state.sel===id&&!state.done[id];
    g.classList.toggle('v2wait',wait);
    if(wait) g.style.setProperty('--tint',hex(r.target.map(v=>0.984*0.75+v*0.25)));
  }
  // Spotlight on the selected part: the rest of the picture dims a little, the part gets a soft glow in its
  // target color and a crisp outline. Parts are switched by tapping them on the picture.
  // Glow and outline sit right above the part in the drawing order, so things drawn in front of it (a bowl over a
  // plum) still cover them; the dim layer on top leaves a hole for the part minus those front shapes and the decor.
  // Highlight on the selected part: 'aura' (default: a white die-cut border with a soft shadow and a pale halo in the
  // part's color). The staging cheat cycles the others to compare (save.hl): dim (old dark spotlight), wash, halo, sticker.
  const HL=['dim','wash','halo','sticker','aura'], hlStyle=()=>HL.includes(save.hl)?save.hl:'aura';
  respot=()=>{ if(state&&state.sel&&!state.done[state.sel]) $('selLayer').innerHTML=spotlight(current()); };
  function spotlight(r){
    scene.querySelectorAll('.spotUnder,.spotBack').forEach(e=>e.remove());
    const hl=hlStyle(); $('game').dataset.hl=hl;
    const shape=(o,col,extra)=>o.stroke?`<g fill="none" stroke="${col}" stroke-width="${o.stroke+extra}" stroke-linecap="round">${o.svg}</g>`:`<g fill="${col}" stroke="${col}" stroke-width="${1.6+extra}" stroke-linejoin="round">${o.svg}</g>`;
    const front=L.order.slice(L.order.indexOf(r.id)+1).map(id=>L.regions.find(x=>x.id===id)).filter(Boolean);
    const g=scene.querySelector(`.region[data-id="${r.id}"]`);
    if(g){
      const u=document.createElementNS('http://www.w3.org/2000/svg','g'); u.setAttribute('class','spotUnder'); u.setAttribute('pointer-events','none');
      const glow=hl==='dim'?hex(r.target):'#fff';
      u.innerHTML=(hl==='sticker'||hl==='aura'?'':`<g class="spotGlow" filter="url(#spotF)" style="stroke:${glow};stroke-width:${r.stroke?r.stroke+8:hl==='dim'?7:10}px">${r.svg}</g>`)+
        `<g class="selOutline${r.stroke?' thick':''}"${r.stroke?` style="stroke-width:${r.stroke+6}px"`:''}>${r.svg}</g>`;
      const sh=g.nextElementSibling; (sh&&sh.classList.contains('shade')?sh:g).after(u);
      if(hl==='sticker'||hl==='aura'){ // a white die-cut border with a soft shadow, right under the part (aura: plus a pale halo in its color)
        const b=document.createElementNS('http://www.w3.org/2000/svg','g'); b.setAttribute('class','spotBack'); b.setAttribute('pointer-events','none');
        const tint=hex(r.target.map(v=>0.984*0.55+v*0.45));
        b.innerHTML=(hl==='aura'?`<g class="spotAura" filter="url(#spotF)" style="stroke:${tint};fill:${tint};stroke-width:${r.stroke?r.stroke+18:18}px">${r.svg}</g>`:'')+
          `<g filter="url(#spotS)" style="stroke-width:${r.stroke?r.stroke+9:9}px">${r.svg}</g>`; g.before(b); }
    }
    return `<defs><mask id="spotM" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="240"><rect width="320" height="240" fill="#fff"/>${shape(r,'#000',2)}`+
      `${front.map(o=>shape(o,'#fff',0)).join('')}<g class="occ">${L.decor||''}</g></mask>`+
      `<filter id="spotF" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6"/></filter>`+
      `<filter id="spotS" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#1d2233" flood-opacity=".35"/></filter></defs>`+
      `<rect class="spotDim" width="320" height="240" mask="url(#spotM)"/>`;
  }
  // Switching parts with paint in the bowl gives the paid drops back (the old screen dropped them).
  const _select=select;
  select=function(id){
    if(!state) return;
    const prev=state.sel;
    const leaving=prev&&prev!==id&&!state.done[prev];
    if(leaving&&state.drops.length){ state.paint+=state.fr.filter(x=>!x).length; state.used[prev]=Math.max(0,(state.used[prev]||0)-state.drops.length); }
    if(leaving){ state.drops=[]; state.fr=[]; }
    const r=L.regions.find(x=>x.id===id); v2.pace=3; v2.over=false;
    if(r){ state.sel=id; v2.pace=paceOf(r); v2.over=(state.used[id]||0)>r.min; }
    // repaint the part we left only after the selection moved, or it keeps breathing (two parts looked selected)
    if(leaving) paintRegion(prev,null);
    scene.querySelectorAll('.region.v2wait').forEach(g=>{ if(g.dataset.id!==id) g.classList.remove('v2wait'); });
    _select(id); state.brushOk=false; brushReady(false); $('mixTip').hidden=true; state.worse=state.worse||{};
    if(r) $('selLayer').innerHTML=spotlight(r);
    $('targetChip').style.setProperty('--tc',hex(current().target));
    updateHud();
  };
  // Advice states only what is true of the mix against the target, so it never steers you off a valid path:
  // the biggest of the lightness, strength (chroma) and hue differences, with the hue named from the target.
  const HUE=[[25,'pink'],[50,'red'],[78,'orange'],[112,'yellow'],[170,'green'],[235,'teal'],[290,'blue'],[330,'violet'],[361,'pink']];
  function v2advice(m,tg,p){
    if(p>=85) return t('So close');
    const A=lab(m), B=lab(tg), dL=A[0]-B[0], cA=Math.hypot(A[1],A[2]), cB=Math.hypot(B[1],B[2]), dC=cA-cB;
    let dH=0;
    if(cA>8&&cB>8){ const d=Math.atan2(Math.sin(Math.atan2(B[2],B[1])-Math.atan2(A[2],A[1])),Math.cos(Math.atan2(B[2],B[1])-Math.atan2(A[2],A[1]))); dH=2*Math.sqrt(cA*cB)*Math.abs(Math.sin(d/2)); }
    if(dH>=Math.abs(dL)&&dH>=Math.abs(dC)){ const h=(Math.atan2(B[2],B[1])*180/Math.PI+360)%360; return t('Aim for a more {hue} tone',{hue:t(HUE.find(x=>h<x[0])[1])}); }
    if(Math.abs(dL)>=Math.abs(dC)) return dL>0?t('Too light'):t('Too dark');
    return dC>0?t('Too strong'):t('Too dull');
  }
  // Magic's next step: of every single add or take-out, the one that leads to the smallest finished bowl
  // (fewest drops, so the best stars). A paint the recipe doesn't use always comes out first.
  function bestStep(){
    const r=current(), c=counts(), R=r.recipe;
    const bad=Object.keys(c).find(k=>!R[k]); if(bad) return {k:bad,remove:true};
    const m=mix(c); if(m&&matchPct(m,r.target)>=95) return {done:true};
    const final=cc=>{let k=1; for(const q in cc) k=Math.max(k,Math.ceil(cc[q]/R[q])); return k;};
    const kNow=final(c); let add=null,gap=0;
    for(const q in R){const d=kNow*R[q]-(c[q]||0); if(d>gap){gap=d;add=q;}}
    let best={k:add,size:kNow*r.min};
    for(const q in c){ const c2=Object.assign({},c); if(!--c2[q]) delete c2[q]; const sz=final(c2)*r.min; if(sz<best.size) best={k:q,remove:true,size:sz}; }
    return best.k?best:{done:true};
  }
  renderMix=function(override){
    const r=current(); if(!state||!r) return;
    const c=counts(), m=mix(c), p=m?matchPct(m,r.target):null;
    if(!state.drops.length) state.picking=false;
    const chip=$('mixChip'); chip.classList.toggle('empty',!m); chip.style.background=m?hex(m):'';
    $('mixLab').textContent=state.drops.length&&!state.applying?t('Tap to pour out'):t('Mix');
    const ks=L.paints||PAINTS.map(x=>x.k);
    // drops in the bowl: a count and a minus on each paint, and a ring around the bowl split by paint
    wrapPaints();
    $('paints').querySelectorAll('.pwrap').forEach(w=>{ const k=w.querySelector('.paint').dataset.k, n=c[k]||0, pc=w.querySelector('.pcount');
      if(n){ if(pc.textContent!==String(n)) restart(pc,'bump'); pc.textContent=String(n); } pc.hidden=!n; });
    // the bowl's ring repeats the mix color, like the target's ring repeats its own frame
    $('mixChip').style.setProperty('--ring',m?hex(m):'none');
    // chips in the order each paint first went in: Undo always takes the newest drop, so a chip that empties is the
    // last one and nothing slides under its dust
    const seen=[...new Set(state.drops)];
    // a div, not a span: the old screen's `.drops span` rule draws small rotated teardrops
    $('drops').innerHTML=seen.map(k=>`<div class="dchip" data-k="${k}" role="img" aria-label="${t('{n} {paint}',{n:c[k],paint:PN(k)})}"><i style="background:${hex(PMAP[k].rgb)}"></i>×${c[k]}</div>`).join('')
      ||`<em>${t('Your drops show up here')}</em>`;
    const blind=state.twist==='blind'&&p!=null&&p<95;
    $('pctNum').textContent=p==null?'':blind?'?':p+'%';
    $('meter').setAttribute('aria-valuenow',p||0);
    if(!state.done[r.id]) paintRegion(r.id,m?hex(m):null);
    const used=state.used[r.id]||0, pace=paceOf(r), over=used>r.min;
    const ct=$('counter'); ct.innerHTML=`<b>${used}</b><span>/ ${r.min}</span>${over?`<em>${t('over par')}</em>`:''}`;
    ct.classList.toggle('over',over); ct.setAttribute('aria-label',t('{used} drops used, par {min}',{used,min:r.min}));
    if(over&&!v2.over) restart(ct,'shake'); v2.over=over;
    const ps=$('paceStars'); ps.innerHTML=[0,1,2].map(i=>`<span class="${i<pace?'on':''}">${STAR}</span>`).join('');
    ps.setAttribute('aria-label',t('{n} of 3 stars at this pace',{n:pace}));
    if(pace<v2.pace) for(let i=pace;i<v2.pace;i++) starFall(ps.children[i]);
    v2.pace=pace;
    renderActions();
    const msg=$('msg');
    if(override){msg.textContent=override[0];msg.className='msg '+override[1];}
    else if(!m){msg.textContent=t('Tap a paint to start');msg.className='msg';}
    else if(p>=95){msg.textContent=t('Match! Painting…');msg.className='msg good';}
    else{msg.textContent=blind?t('Trust your eyes'):v2advice(m,r.target,p);msg.className='msg';}
  };
  const _updateHud=updateHud;
  updateHud=function(){
    _updateHud(); if(!state) return;
    $('progress').textContent=t('{done} of {all} parts restored',{done:Object.keys(state.done).length,all:L.regions.length});
    $('paintLeft').textContent=tn(state.paint,'drop');
    // every change of the pot floats off the counter (−1 for a drop, +1 for a refund)
    if(v2.lastPaint!=null&&v2.lastL===L&&state.paint!==v2.lastPaint&&!reduced){
      const d=state.paint-v2.lastPaint, f=document.createElement('span'); f.className='pfloat'+(d>0?' up':''); f.textContent=(d>0?'+':'−')+Math.abs(d);
      $('paintRow').appendChild(f); setTimeout(()=>f.remove(),900); }
    v2.lastPaint=state.paint; v2.lastL=L;
    // How much the unpainted parts need at par (minus the paid drops already in the bowl), and a warning when short.
    const r=current(), undone=L.regions.filter(x=>!state.done[x.id]);
    let need=undone.reduce((a,x)=>a+x.min,0); if(r&&!state.done[r.id]) need-=Math.min(r.min,state.fr.filter(x=>!x).length);
    need=Math.max(0,need);
    const short=undone.length&&state.paint<need, tight=undone.length&&!short&&state.paint<need+Math.max(2,Math.ceil(need*.15)), lv=short?2:tight?1:0;
    const row=$('paintRow'); row.classList.toggle('short',!!short); row.classList.toggle('tight',!!tight);
    if(lv>(v2.paintLv||0)) restart(row,'pulse'); v2.paintLv=lv;
    $('paintNeed').textContent=undone.length?t('Rest needs {n}',{n:need}):'';
    dimPaints();
  };
  // Bubble that flies out of the bowl when Magic acts, lingers, then dissolves.
  function bubble(k,text){
    const r=$('mixChip').getBoundingClientRect(), b=document.createElement('div');
    b.className='mbubble'; b.setAttribute('role','status'); b.innerHTML=`<i style="background:${hex(PMAP[k].rgb)}"></i>${esc(text)}`;
    document.body.appendChild(b);
    b.style.left=Math.max(8,Math.min(innerWidth-b.offsetWidth-8,r.left+r.width/2-b.offsetWidth/2))+'px';
    b.style.top=Math.max(8,r.top-b.offsetHeight-6)+'px';
    setTimeout(()=>b.remove(),1900);
  }
  // A removed paint blows away as dust (and its chip dissolves when it was the last drop of that paint).
  // Each paint gets a count of its drops in the bowl and a minus that takes one out (it uses an Undo).
  function wrapPaints(){
    $('paints').querySelectorAll('.paint').forEach(b=>{ if(b.parentElement.classList.contains('pwrap')) return;
      const w=document.createElement('div'); w.className='pwrap'; b.before(w); w.appendChild(b); const k=b.dataset.k;
      w.insertAdjacentHTML('beforeend',`<span class="pcount" hidden></span>`); });
  }
  // The removed drop's paint turns into dust that blows away to the right, with a whoosh: grains packed in the
  // chip's swatch. When it was the last drop of that paint, the empty chip fades out under the dust.
  function snap(k){
    sfx('snap');
    if(reduced) return;
    const ch=$('drops').querySelector(`.dchip[data-k="${k}"]`); if(!ch) return;
    const cr=ch.getBoundingClientRect(), sw=ch.querySelector('i').getBoundingClientRect(), col=hex(PMAP[k].rgb), ink=getComputedStyle(ch).color;
    const last=state.drops.filter(x=>x===k).length===1;
    const layer=document.createElement('div'); layer.className='dustLayer'; layer.style.left=cr.left+'px'; layer.style.top=cr.top+'px';
    const W=cr.width, rad=sw.width/2, cx=sw.left-cr.left+rad, cy=sw.top-cr.top+rad;
    const grain=(x,y,c)=>{const sz=(1.4+Math.random()*2.2).toFixed(1);
      return `<span style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${sz}px;height:${sz}px;background:${c};--dx:${40+Math.random()*110|0}px;--dy:${-110+Math.random()*80|0}px;animation-delay:${(x/W*.55+Math.random()*.12).toFixed(2)}s"></span>`;};
    let h='';
    for(let i=0;i<120;i++){const a=Math.random()*Math.PI*2, d=Math.sqrt(Math.random())*rad; h+=grain(cx+Math.cos(a)*d-1,cy+Math.sin(a)*d-1,col);}
    layer.innerHTML=h; document.body.appendChild(layer);
    // only the paint turns to dust; the rest of the chip (pill and count) just fades away quietly
    if(last){ const g=ch.cloneNode(true); g.className='dchip chipFade'; g.querySelector('i').style.visibility='hidden';
      g.style.left=cr.left+'px'; g.style.top=cr.top+'px'; g.style.width=cr.width+'px'; document.body.appendChild(g); setTimeout(()=>g.remove(),500); }
    setTimeout(()=>layer.remove(),2600);
  }

  function starFall(el){
    if(el) sfx('starLost');
    if(reduced||!el) return;
    const r=el.getBoundingClientRect(), s=document.createElement('div');
    s.className='starFall'; s.innerHTML=STAR; s.style.left=r.left+'px'; s.style.top=r.top+'px';
    document.body.appendChild(s); setTimeout(()=>s.remove(),900);
  }
  function removeAt(i,msg){
    const k=state.drops[i], free=state.fr[i];
    snap(k);
    state.drops.splice(i,1); state.fr.splice(i,1); state.picking=false; state.hintMsg=null;
    refundDrop(free); renderMix(msg); afterMixChange();
  }
  // Mixing tips (GAME.tips) show up when they help: after two drops that took the mix further away, or a few drops
  // over par, a bubble over the bottom of the picture shows the tip that fits this part's recipe (paints it uses);
  // over par with nothing better, the "only the ratio counts" one. Once per part; it goes away on the next part.
  const TIPS=(G.tips||[]).filter(x=>x.out);
  function tipFor(r,over){
    const rk=Object.keys(r.recipe).filter(k=>k!=='W'), fits=TIPS.filter(x=>Object.keys(x.out).every(k=>k==='W'?r.recipe.W:rk.includes(k)));
    const chroma=fits.filter(x=>!x.out.W).sort((a,b)=>Object.keys(b.out).length-Object.keys(a.out).length);
    return over?(fits.find(x=>x.out.W)||TIPS.find(x=>x.out.W)||chroma[0]):chroma[0]||null;
  }
  function mixTip(r,over){
    state.tipped=state.tipped||{}; if(state.tipped[r.id]||state.done[r.id]) return;
    const tp=tipFor(r,over); if(!tp) return; state.tipped[r.id]=true;
    const sw=x=>`<i style="background:${hex(mix(x))}"></i>`, eq=tp.parts.map(sw).join('<b>+</b>')+'<b>=</b>'+sw(tp.out);
    const el=$('mixTip'); el.innerHTML=`<span class="mteq" aria-hidden="true">${eq}</span><span class="mttext"><small>${t(tp.kind)}</small>${esc(t(tp.text))}</span><button class="mtx" aria-label="${t('Close')}">✕</button>`;
    el.hidden=false; restart(el,'mtin'); track('tip_shown',Object.assign(lvProps(),{part:r.id,tip:TIPS.indexOf(tp)}));
  }
  $('mixTip').addEventListener('click',e=>{ if(e.target.closest('.mtx')) $('mixTip').hidden=true; });
  // A drop that takes the mix further from the target gets called out right away.
  const _addDrop=addDrop;
  addDrop=function(k,via){
    if(state&&state.failed) return false;
    const r=state&&L?current():null, before=r&&state.drops.length?matchPct(mix(counts()),r.target):null;
    const ok=_addDrop(k,via);
    if(ok&&state&&state.hearts&&r&&!state.forced){
      const after=state.drops.length?matchPct(mix(counts()),r.target):0;
      if(!r.recipe[k]||(before!=null&&after<before&&!state.applying)) loseHeart();
    }
    if(ok&&via!=='magic'&&state&&!state.applying&&!state.forced&&r){
      const used=state.used[r.id]||0;
      if(before!=null&&matchPct(mix(counts()),r.target)<=before-3) state.worse[r.id]=(state.worse[r.id]||0)+1;
      if(state.worse[r.id]>=2) mixTip(r); else if(used>=r.min+3) mixTip(r,true);
    }
    if(ok&&via!=='magic'&&before!=null&&state&&!state.applying&&!state.forced){
      const after=matchPct(mix(counts()),r.target);
      if(after<=before-3){ renderMix([t('That took it further away'),'bad']); restart($('pctNum'),'worse');
        clearTimeout(v2.wt); v2.wt=setTimeout(()=>$('pctNum').classList.remove('worse'),1400); }
    }
    return ok;
  };
  $('undoBtn').onclick=()=>{
    if(!state||state.applying||isLocked('undo')||!state.drops.length) return;
    const i=state.drops.length-1;
    if(state.forced){
      state.forced=false; save.tut.undo=true; persist(); hideCoach();
      removeAt(i,[t("That's Undo. You have {n} left, then they cost {price}.",{n:save.inv.undo,price:tn(BOOSTERS.undo.price,'coin')}),'good']);
      return;
    }
    if(!spend('undo')) return;
    removeAt(i,[t('Drop taken back. Paint refunded.'),'']);
  };
  // Tapping the bowl pours it out for free and gives back the paid drops.
  $('mixChip').addEventListener('click',()=>{
    if(!state||state.applying||state.forced||state.lesson||state.finished||!state.drops.length||dragged) return;
    const paid=state.fr.filter(x=>!x).length, n=state.drops.length;
    pourOut(()=>{ state.drops=[]; state.fr=[]; state.hintMsg=null; state.paint+=paid; state.used[state.sel]-=n;
      updateHud(); renderMix([t('Bowl poured out. Paint refunded.'),'']); });
  });
  $('magicBtn').onclick=()=>{
    if(!state||state.applying||state.finished||state.forced||isLocked('magic')) return;
    const h=bestStep();
    if(h.done){toast(t('Your mix is already right.'));return;}
    if(!h.remove&&state.paint<=0&&!(state.freeLeft>0)){toast(t('The pot is empty.'));return;}
    if(!spend('magic')) return;
    state.hinted[state.sel]=true; sfx('magic');
    if(h.remove){ bubble(h.k,t('Took out {paint}',{paint:PN(h.k)})); removeAt(state.drops.lastIndexOf(h.k)); }
    else{ bubble(h.k,'+1 '+PN(h.k)); addDrop(h.k,'magic'); }
  };
  document.querySelector('#paintRow .potico').innerHTML=icon('pot');
  // Palette: for the rest of this part, paints its recipe doesn't use are dimmed (they stay tappable).
  function dimPaints(){
    const r=current(), on=!!(state&&r&&state.palette&&state.palette[r.id]);
    $('paints').querySelectorAll('.paint').forEach(b=>b.classList.toggle('dim',on&&!r.recipe[b.dataset.k]));
  }
  $('paletteBtn').onclick=()=>{
    if(!state||state.finished||state.applying||state.forced||isLocked('palette')) return;
    state.palette=state.palette||{}; if(state.palette[state.sel]) return;
    if(!spend('palette')) return;
    state.palette[state.sel]=true; sfx('magic'); dimPaints(); renderActions();
    const n=Object.keys(current().recipe).length; toast(t('{part} uses {n} of the paints.',{part:N(current()),n}));
  };
  // Brush: the exact recipe flows into the bowl one drop at a time (each one flies from its paint as a glowing drop,
  // paid from the pot) while the part fills in on the picture; then "Paint it" confirms. The part earns 2 stars at most.
  function flyDrop(k){
    if(reduced) return;
    const from=$('paints').querySelector(`.paint[data-k="${k}"]`), to=$('mixChip'); if(!from) return;
    const a=from.getBoundingClientRect(), b=to.getBoundingClientRect(), d=document.createElement('div');
    d.className='bfly'; d.style.setProperty('--c',hex(PMAP[k].rgb)); d.style.left=(a.left+a.width/2-9)+'px'; d.style.top=(a.top+a.height/2-9)+'px';
    document.body.appendChild(d);
    const dx=b.left+b.width/2-a.left-a.width/2, dy=b.top+b.height/2-a.top-a.height/2;
    d.animate([{transform:'translate(0,0) scale(.5)',opacity:0},{transform:`translate(${dx*.45}px,${dy*.45-70}px) scale(1.15)`,opacity:1,offset:.45},
      {transform:`translate(${dx}px,${dy}px) scale(.55)`,opacity:.9}],{duration:520,easing:'cubic-bezier(.35,.6,.4,1)'}).onfinish=()=>{ d.remove(); restart(to,'brushpop'); };
  }
  function brushReady(on){
    $('brushOk').hidden=!on; $('msg').hidden=on;
    if(on) restart($('brushOk'),'brushin');
  }
  $('brushBtn').onclick=()=>{
    if(!state||state.finished||state.applying||state.forced||state.lesson||isLocked('brush')) return;
    const r=current(), paid=state.fr.filter(x=>!x).length;
    if(state.paint+paid<r.min){toast(t('Brush needs {drops} of paint.',{drops:tn(r.min,'drop')}));buzz(40);sfx('wrong');return;}
    if(!spend('brush')) return;
    // the bowl empties (paid drops go back to the pot), then the recipe drops in, paint by paint
    state.paint+=paid; state.drops=[]; state.fr=[]; state.used[r.id]=0; state.hinted[r.id]=true;
    state.applying=true; state.brushing=true; sfx('magic');
    const seq=[]; (L.paints||PAINTS.map(x=>x.k)).forEach(k=>{ for(let j=0;j<(r.recipe[k]||0);j++) seq.push(k); });
    const st=state, msg=[t('The brush is mixing…'),'good'];
    const g=scene.querySelector(`.region[data-id="${r.id}"]`); if(g) g.classList.add('brushing');
    updateHud(); renderMix(msg);
    // drops leave one after another (a new one takes off before the last lands) and count once they land
    const gap=reduced?60:Math.max(240,Math.min(520,2400/seq.length)), fly=reduced?0:440;
    let landed=0;
    seq.forEach((k,i)=>setTimeout(()=>{ if(state!==st||st.finished||st.sel!==r.id) return; flyDrop(k);
      setTimeout(()=>{ if(state!==st||st.sel!==r.id) return;
        st.drops.push(k); st.fr.push(false); st.paint--; st.used[r.id]++; sfx('drop',k); buzz(8); landed++;
        updateHud(); renderMix(landed<seq.length?msg:[t('Brushed!'),'good']);
        if(landed===seq.length) setTimeout(()=>{ if(state!==st) return; st.brushing=false; st.brushOk=true; if(g){ g.classList.remove('brushing'); restart(g,'brushed'); } sfx('magic'); brushReady(true); },350);
      },fly); },300+i*gap));
  };
  $('brushOk').onclick=()=>{ if(!state||!state.brushOk) return; state.brushOk=false; brushReady(false); state.applying=false; apply(); };
  // Entrance: the picture grows into place, then the controls rise in one after another.
  const enter=el=>{ if(reduced) return; el.classList.remove('entering'); void el.offsetWidth; el.classList.add('entering');
    clearTimeout(el._et); el._et=setTimeout(()=>el.classList.remove('entering'),1100); };
  // A picture left half-way keeps its painted parts (not for the daily picture, which has its own budget).
  function savePartial(){
    if(!state||state.daily) return; save.partial=save.partial||{};
    const ids=Object.keys(state.done);
    if(state.finished||!ids.length) delete save.partial[L.id];
    else{ const pick=o=>Object.fromEntries(ids.filter(id=>o[id]!=null).map(id=>[id,o[id]]));
      save.partial[L.id]={stars:pick(state.stars),used:pick(state.used),hinted:pick(state.hinted),rescued:pick(state.rescued),paint:state.paint,at:Date.now()}; }
    persist();
  }
  const _apply=apply; apply=function(){ _apply(); savePartial();
    if(save.tut.drag&&!save.tut.paint&&state&&!state.finished) setTimeout(paintTip,800); };
  // One-time guided tip on the paint pot: what it is, what "Rest needs" means, why it matters.
  function paintTip(){
    if(save.tut.paint||!state||state.finished||state.forced||state.lesson||state.applying||!$('introOverlay').hidden||!$('endOverlay').hidden) return;
    save.tut.paint=true; persist(); hideHand();
    $('game').classList.remove('entering');
    const row=$('paintRow'); row.classList.add('coach');
    $('coachTip').innerHTML=t('This is your <b>paint pot</b>. Every drop you add comes out of it, and Undo puts it back.')+'<br>'+
      t('<b>Rest needs</b> is what the unpainted parts take at par. If the pot runs dry, a refill costs coins, so make every drop count.')+
      `<br><button class="btn primary coachOk">${t('Got it')}</button>`;
    $('coachTip').hidden=false; $('coachDim').hidden=false; document.body.classList.add('coaching');
    revealInBoard($('coachTip'));
    $('coachTip').querySelector('.coachOk').onclick=()=>{ hideCoach(); startHands(); };
  }
  // Home leads with the picture you left half-way (the latest one), unless a friend's challenge is waiting.
  const _nextIndex=nextIndex;
  nextIndex=function(){
    if(save.challenge) return _nextIndex();
    const ps=Object.entries(save.partial||{}).sort((a,b)=>(b[1].at||0)-(a[1].at||0));
    for(const [id] of ps){ const i=LEVELS.findIndex(l=>l.id===id); if(i>=0&&save.best[id]==null) return i; }
    return _nextIndex();
  };
  function resume(){
    const pt=!state.daily&&save.partial&&save.partial[L.id]; if(!pt) return;
    Object.keys(pt.stars).forEach(id=>{ const r=L.regions.find(x=>x.id===id); if(!r) return;
      state.done[id]=true; state.stars[id]=pt.stars[id]; state.used[id]=pt.used[id]!=null?pt.used[id]:r.min;
      if(pt.hinted[id]) state.hinted[id]=true; if(pt.rescued[id]) state.rescued[id]=true;
      const g=scene.querySelector(`.region[data-id="${id}"]`); if(g){ g.setAttribute(r.stroke?'stroke':'fill',hex(r.target)); g.classList.remove('sel','v2wait'); g.classList.add('done'); }
      const cr=scene.querySelector(`.crack[data-for="${id}"]`); if(cr) cr.classList.add('gone'); });
    state.paint=Math.max(0,pt.paint);
    const nx=L.regions.find(x=>!state.done[x.id]); if(nx) select(nx.id);
    updateHud(); toast(t('Welcome back: {n} of {all} parts already painted.',{n:Object.keys(state.done).length,all:L.regions.length}));
  }
  const _start=start;
  start=function(i,o){ v2.quiet=false; v2.paintLv=0; _start(i,o); resume(); $('gTitle').textContent=T(L); enter($('game'));
    state.hearts=state.daily&&L.dream?3:0; renderHearts(); $('game').classList.toggle('dreamday',!!(state.daily&&L.dream)); };
  // ---------- Daily challenge: a page from Grandma's dream journal ----------
  // One dream per day (same for everyone), 3 hearts, no boosters, tight paint. A drop of a paint the part doesn't
  // use, or one that takes the mix further from the target, costs a heart; at zero the dream fades (try again).
  const HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.6C1.5 7.4 3.8 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.4 0 5.7 3.4 4.5 6.9-1.8 5-9.3 9.6-9.3 9.6Z"/></svg>';
  function renderHearts(){
    const h=$('hearts'), on=!!(state&&state.daily&&L&&L.dream); h.hidden=!on; if(!on) return;
    $('tierPill').hidden=true;
    h.innerHTML=[0,1,2].map(i=>`<span class="${i<state.hearts?'on':''}">${HEART}</span>`).join('');
    h.setAttribute('aria-label',t('{n} of 3 hearts left',{n:state.hearts}));
  }
  function loseHeart(){
    if(!state||!state.hearts) return;
    const el=$('hearts').children[state.hearts-1]; state.hearts--;
    if(el&&!reduced){ const r=el.getBoundingClientRect(), b=document.createElement('div'); b.className='heartBreak'; b.innerHTML=HEART+HEART;
      b.style.left=r.left+'px'; b.style.top=r.top+'px'; document.body.appendChild(b); setTimeout(()=>b.remove(),900); }
    renderHearts(); buzz([40,60,40]); sfx('starLost');
    if(!state.hearts) setTimeout(dreamFaded,600);
  }
  function dreamFaded(){
    if(!state||state.finished) return; state.failed=true; hideHand(); hideCoach();
    $('endTitle').textContent=t('The dream faded'); $('endStars').textContent=''; sfx('fail');
    $('endText').innerHTML=t('You ran out of hearts. Dreams come back: try again, or wait for tomorrow\'s page.');
    $('rescueBtn').hidden=true; $('quizOfferBtn').hidden=true; $('shareBox').hidden=true;
    $('endOverlay').classList.remove('low'); $('retryBtn').textContent=t('Try again'); $('nextBtn').hidden=true; $('endOverlay').hidden=false;
  }
  dailyIndex=function(){ if(!DREAMS.length) return -1; if(LEVELS.slice(0,MAIN).filter(l=>save.best[l.id]!=null).length<3) return -1; return DREAMS[dayHash('dream'+dayKey())%DREAMS.length]; };
  // Progress is kept now, so leaving needs no warning (except on the daily picture, which isn't kept).
  $('backBtn').onclick=()=>{ if(state&&state.daily&&!state.finished&&Object.keys(state.done).length) $('quitOverlay').hidden=false; else goHome(); };
  // "Start picture over" really starts over.
  $('retryBtn').onclick=()=>{ if(save.partial&&L){ delete save.partial[L.id]; persist(); } start(L.index,{daily:state&&state.daily}); };
  // Start-of-picture cards come one at a time: the picture's own news first, then each new booster with a demo.
  const DEMO={
    undo:'<div class="dm dm-undo"><span class="dmbowl"></span><i class="dmdrop"></i></div>',
    magic:'<div class="dm dm-magic"><span class="dmbowl"></span><i class="dmdrop"></i><span class="dmwand">'+icon('magic')+'</span></div>',
    palette:'<div class="dm dm-palette">'+['#fafaf7','#00a8eb','#e31285','#ffe60d','#212126'].map((c,i)=>`<i style="background:${c}" class="${i===2||i===3?'keep':'fade'}"></i>`).join('')+'</div>',
    brush:'<div class="dm dm-brush"><svg viewBox="0 0 120 80" aria-hidden="true"><path class="dmshape" d="M20 60Q20 20 60 20T100 60Z"/><path class="dmfill" d="M20 60Q20 20 60 20T100 60Z"/><path class="dmline" d="M20 60Q20 20 60 20T100 60Z"/></svg><span class="dmbrush">'+icon('brush')+'</span></div>'};
  showIntro=function(){
    // no boosters on a dream: none are handed out, introduced or pointed at there
    // holiday pictures sit after the main path, so they would hand out every booster at once: they don't
    const fresh=L.dream||L.season?[]:Object.keys(BOOSTERS).filter(b=>save.inv[b]==null&&introAt(b)>=0&&introAt(b)<=L.index);
    fresh.forEach(b=>save.inv[b]=FREE_BOOSTERS);
    const tip=!save.seen[L.id]&&L.tip;
    const tierKey='tier-'+L.tier, tierNote=TIERS[L.tier].label&&!save.seen[tierKey];
    if(tierNote) save.seen[tierKey]=true;
    const chal=save.challenge&&save.challenge.fresh?save.challenge:null;
    if(chal) chal.fresh=false;
    save.seen[L.id]=true; persist(); renderActions();
    state.freshBoosters=fresh;
    const cards=[];
    if(state.daily&&L.dream){ const s=dailyStreakNext(), page=DREAMS.indexOf(L.index)+1;
      cards.push({title:t('Daily challenge'),html:`<div class="dream"><small>${t('Grandma\'s dream journal · page {n}',{n:page})}</small><b>${esc(T(L))}</b><p>${esc(t(L.story))}</p></div>`+
        `<ul class="drules"><li>${HEART}${t('3 hearts: a paint this part doesn\'t use, or a drop that takes the mix further away, costs one.')}</li><li>${icon('lock')}${t('No boosters, and only a little spare paint.')}</li>`+
        `<li>${icon('daily')}${dailyDone()?t('Today\'s reward is already yours. This one is for fun.'):t('Restore it for {coins}. Streak: {days}.',{coins:tn(dailyReward(s),'coin'),days:tn(s,'day')})}</li></ul>`}); }
    else if(state.daily){ const s=dailyStreakNext();
      cards.push({title:t('Daily picture'),html:`<div class="booster">${icon('daily')}<b>${t('Daily picture: {title}',{title:esc(T(L))})}</b><br>${twistText(state.twist,state.budget)} ${dailyDone()?t('Today\'s reward is already yours. This one is for fun.'):t('Restore it for {coins}. Streak: {days}.',{coins:tn(dailyReward(s),'coin'),days:tn(s,'day')})}</div>`}); }
    if(chal){ const ci=LEVELS.findIndex(l=>l.id===chal.level), n=LEVELS.slice(0,ci).filter(l=>save.best[l.id]==null).length;
      cards.push({title:t('{from} challenged you!',{from:chal.from}),html:`<div class="booster">🏆 ${t('Restore <b>{title}</b> with more than <b>{score}★</b>.',{title:esc(T(LEVELS[ci])),score:chal.score})}`+
        (n&&!unlocked(ci)?' '+t('First, finish the warm-up pictures to unlock it ({pics}).',{pics:tn(n,'picture')}):'')+'</div>'}); }
    if(tip) cards.push({title:t(tip.title),text:t(tip.text)});
    if(tierNote) cards.push({title:t('{tier} picture',{tier:TIERS[L.tier].label}),text:(L.tier==='nightmare'?t('Very little spare paint and colors that look almost the same.'):t('Less spare paint and closer shades than usual.'))+' '+t('Boosters help here. Rewards are ×{m}.',{m:TIERS[L.tier].mult})});
    fresh.forEach(b=>cards.push({title:t('New booster: {name}',{name:BOOSTERS[b].name}),
      html:`<div class="bdemo">${DEMO[b]||icon(b)}</div><p class="btext">${BOOSTERS[b].text}</p><p class="bfree">${t('You get {n} free. After that, {price} each.',{n:FREE_BOOSTERS,price:BOOSTERS[b].price+' <span class="coin"></span>'})}</p>`}));
    v2.cards=cards;
    if(!cards.length){ startHands(); return; }
    showCard();
  };
  function showCard(){
    const c=v2.cards.shift();
    $('introTitle').textContent=c.title; $('introText').innerHTML=c.text||''; $('introText').hidden=!c.text;
    $('introBoosters').innerHTML=c.html||''; $('introBtn').textContent=v2.cards.length?t('Next'):t("Let's paint");
    $('introOverlay').hidden=false; restart($('introOverlay').querySelector('.card'),'swap');
  }
  $('introBtn').onclick=()=>{ if(v2.cards&&v2.cards.length){ showCard(); return; } $('introOverlay').hidden=true; if(state) startHands(); };
  // One calm finale: the wave of light over the picture, paper confetti drifting down in the picture's colors, the stamp.
  // The result card then adds nothing but its stars popping in.
  function confettiRain(cols){
    if(reduced) return;
    for(let i=0;i<80;i++) parts.push({x:Math.random()*innerWidth,y:-10-Math.random()*160,vx:(Math.random()-.5)*.8,vy:1.2+Math.random()*1.4,
      r:3.5+Math.random()*3,c:cols[i%cols.length],rot:Math.random()*6.3,vr:(Math.random()-.5)*.06,shape:'ribbon',life:1,decay:.0028+Math.random()*.0018,
      g:.025,sway:1,ph:Math.random()*6.3,flip:Math.random()*6.3,vf:.06+Math.random()*.1,vmax:1.6+Math.random()*1.2});
    if(!fxRun){fxRun=true;requestAnimationFrame(tick);}
  }
  celebrate=function(st){
    const frame=document.querySelector('.frame');
    frame.classList.remove('celebrate'); void frame.offsetWidth; frame.classList.add('celebrate'); setTimeout(()=>{if(state===st) sfx('fanfare');},350);
    [...scene.querySelectorAll('.region')].map(g=>{const b=g.getBoundingClientRect();return {g,x:b.left+b.width/2};})
      .sort((a,b)=>a.x-b.x).forEach((o,i)=>{o.g.style.animationDelay=(i*70)+'ms';o.g.classList.remove('flash');void o.g.getBoundingClientRect();o.g.classList.add('flash');});
    let sp=''; for(let i=0;i<9;i++){const x=20+Math.random()*280,y=16+Math.random()*200,sc=(.6+Math.random()*.7).toFixed(2);
      sp+=`<g transform="translate(${x|0} ${y|0}) scale(${sc})"><path class="spark" style="animation-delay:${(300+Math.random()*1200)|0}ms" d="M0-9L2.2-2.2L9 0L2.2 2.2L0 9L-2.2 2.2L-9 0L-2.2-2.2Z"/></g>`;}
    $('fxLayer').innerHTML=`<defs><linearGradient id="shineG" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect class="shine" x="-150" y="-80" width="100" height="400" fill="url(#shineG)"/>`+sp;
    const fest=L.season==='halloween'?['#f08a24','#6b3fa0','#9bd14a','#f4cf3a','#23283a']:L.season==='christmas'?['#ffffff','#ffffff','#d1423a','#2e7a4c','#f4cf3a']:L.season==='thanksgiving'?['#e57d22','#c23b2c','#efc12a','#8c5a38','#f3b23d']:null;
    setTimeout(()=>{ if(state===st) confettiRain(fest||[...new Set(L.regions.map(r=>hex(r.target)))].concat(['#ffffff'])); },450);
    setTimeout(()=>{ if(state!==st) return; $('stamp').hidden=false; sfx('stamp'); },1300);
    v2.quiet=true; // from here until the next picture, no more bursts (the result card stays calm)
  };
  const _burst=burst; burst=function(x,y,c,n,o){ if(v2.quiet) return; _burst(x,y,c,n,o); };
  const _win=win; win=function(){ v2.quiet=true; if(save.partial) delete save.partial[L.id]; _win(); };
  // Lessons lift controls above the dim layer; a running entrance animation would trap them under it.
  const _startLesson=startLesson; startLesson=function(k){ $('game').classList.remove('entering'); return _startLesson(k); };
  const _forceUndo=forceUndo; forceUndo=function(k){ $('game').classList.remove('entering'); _forceUndo(k); };
  // The "tap another part" hand gets words too: a label over the picture, gone with the hand.
  $('stamp').insertAdjacentHTML('afterend',`<div class="picHint" id="picHint" hidden>${t('Tap any faded part to paint it next')}</div>`);
  const _playHand=playHand; playHand=function(cfg){ _playHand(cfg); $('picHint').hidden=cfg.kind!=='tapPart'; };
  const _hideHand=hideHand; hideHand=function(){ _hideHand(); const h=$('picHint'); if(h) h.hidden=true; };
  const _goHome=goHome; goHome=function(tab){ _goHome(tab); enter($('home')); clearTimeout(v2.ht); v2.ht=setTimeout(homeCoach,1250); };
  // Home tutorials: the first time each card shows up (after a first picture is restored), one card per visit is
  // lifted above a dim layer with a short note on what it is and why it matters.
  document.body.insertAdjacentHTML('beforeend','<div class="htip" id="homeTip" role="dialog" hidden></div>');
  const HOMETIPS=[
    {key:'hSeason',el:'seasonBtn',when:()=>!!seasonOn(),text:()=>t('<b>{season} pictures.</b> Holiday pictures to restore, here only until {date}. Tap the card, or the Holidays tab below.',{season:seasonName(seasonOn()),date:seasonDate(seasonEnd(seasonOn()))})},
    {key:'hChapter',el:'chapterCard',when:()=>chapterReady(),text:()=>t('<b>Chapter complete!</b> Pictures come in chapters of five, and each finished chapter pays coins and one booster of each kind. Tap the card to collect.')},
    {key:'hChest',el:'chestCard',when:()=>chestReady(),text:()=>t('<b>Your star chest is full!</b> Every star you earn goes in here, and a full chest opens with coins and boosters. Tap it to open.')},
    {key:'hDaily',el:'dailyPicBtn',text:()=>t('<b>Daily challenge.</b> Every day a new page from Grandma\'s dream journal: a strange picture you won\'t find in the book, with 3 hearts and no boosters. Play on days in a row to grow your streak and the reward.')},
    ];
  function homeCoach(){
    if($('home').hidden||!$('homeMain').offsetParent||!LEVELS.some(l=>save.best[l.id]!=null)) return;
    if(['introOverlay','settingsOverlay','buyOverlay','quizOverlay'].some(id=>$(id)&&!$(id).hidden)) return;
    const h=HOMETIPS.find(x=>!save.tut[x.key]&&(!x.when||x.when())&&$(x.el)&&!$(x.el).hidden&&$(x.el).offsetParent&&!$(x.el).closest('[hidden]'));
    if(!h) return;
    const el=$(h.el); $('home').classList.remove('entering');
    el.scrollIntoView({block:'center'}); // instant, so the note is placed against the card's final position
    setTimeout(()=>{
      if($('home').hidden) return;
      el.classList.add('hlift'); $('coachDim').hidden=false;
      const tip=$('homeTip'); tip.innerHTML=h.text()+`<button class="btn primary">${t('Got it')}</button>`; tip.hidden=false;
      const r=el.getBoundingClientRect(), th=tip.offsetHeight, below=r.bottom+12+th<innerHeight-90;
      tip.style.top=(below?r.bottom+12:Math.max(12,r.top-12-th))+'px';
      v2.homeTipDone=()=>{ save.tut[h.key]=true; persist(); el.classList.remove('hlift'); $('coachDim').hidden=true; tip.hidden=true; v2.homeTipDone=null; };
      tip.querySelector('button').onclick=()=>v2.homeTipDone();
    },reduced?0:350);
  }
  // Home: the next picture as a hero card, the season banner, the daily picture with its streak, chapter and chest.
  const DAILY_DECO='<path class="moon" d="M300 10a16 16 0 1 0 12 26a13 13 0 1 1-12-26Z"/><g class="star"><path d="M236 16l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><path d="M268 50l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5Z"/><circle cx="214" cy="40" r="1.4"/><circle cx="318" cy="60" r="1.2"/></g><path class="cloud" d="M226 88q0-12 14-10q6-10 18-4q12-2 12 10q8 2 6 10h-50q-6-2 0-6Z"/>';
  renderDailyPic=function(){
    const b=$('dailyPicBtn'), i=DAILY?dailyIndex():-1; b.hidden=i<0; if(i<0) return;
    const s=dailyStreakNext(), lv=LEVELS[i], done=dailyDone(), filled=Math.min(7,done?s:s-1);
    b.classList.toggle('done',done);
    // a banner like the season one: dreamy dawn gradient, moon and sparkles, today's dream picture, the streak
    b.innerHTML=`<svg class="sdeco" viewBox="0 0 320 100" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">${DAILY_DECO}</svg><span class="sshine" aria-hidden="true"></span>`+
      `<span class="scover">${thumbSVG(lv,done)}</span><span class="sbody"><span class="stag">${done?t('Done · streak: {days}',{days:tn(s,'day')}):`<span class="dh">${HEART}${HEART}${HEART}</span> +${dailyReward(s)} <span class="coin"></span>`}</span>`+
      `<b>${t('Daily challenge')}</b><small>${esc(T(lv))}</small>`+
      `<span class="dbars" aria-label="${t('Streak: {days}',{days:tn(done?s:s-1,'day')})}">${[0,1,2,3,4,5,6].map(k=>`<i class="${k<filled?'on':''}"></i>`).join('')}</span></span>`+
      `<span class="sgo">${done?'✓':t('Play')}</span>`;
  };

  // Rewards wait on Home: the result card of the picture that finishes a chapter (or fills the chest) sends you
  // there with "Collect your reward", and the card pays out on a tap. Before that, the cards open their details.
  const chapterReady=()=>!!CHAPTERS&&CHAPTERS.some((c,k)=>chapterDone(k)&&!save.chapters[k]);
  const chestReady=()=>!!CHESTS&&Math.floor(totalStars()/CHESTS.every)>save.chests;
  const _claim=claimRewards; claimRewards=function(){ return v2.inWin?[]:_claim(); };
  const _winR=win; win=function(){ v2.inWin=true; try{ _winR(); } finally{ v2.inWin=false; }
    if(L.season) $('endText').insertAdjacentHTML('afterbegin',`<b class="fest">${t({halloween:'Happy Halloween!',thanksgiving:'Happy Thanksgiving!',christmas:'Merry Christmas!'}[L.season])}</b><br>`);
    v2.collect=chapterReady()||chestReady();
    const nb=$('nextBtn'); nb.textContent=v2.collect?t('Collect your reward'):t('Next picture'); if(v2.collect) nb.hidden=false; };
  $('nextBtn').onclick=()=>{ if(v2.collect){ v2.collect=false; goHome(); return; } const n=nextAfter(L.index); if(n<0) goHome(); else start(n); };
  ['chapterCard','chestCard'].forEach(id=>{ $(id).setAttribute('role','button'); $(id).tabIndex=0; $(id).addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); $(id).click(); } }); });
  function infoSheet(title,html){
    v2.cards=[]; $('introTitle').textContent=title; $('introText').hidden=true; $('introBoosters').innerHTML=html; $('introBtn').textContent=t('Close');
    $('introOverlay').hidden=false; restart($('introOverlay').querySelector('.card'),'swap');
  }
  function chapterInfo(){
    const ci=chapterOf(nextIndex()), [a,z]=chapterRange(ci), got=LEVELS.slice(a,z).filter(l=>save.best[l.id]!=null).length;
    const rows=LEVELS.slice(a,z).map((l,k)=>{ const i=a+k, b=save.best[l.id], ok=unlocked(i), pt=save.partial&&save.partial[l.id];
      return `<button class="crow" data-i="${i}" ${ok?'':'disabled'}><span class="cth">${thumbSVG(l,b!=null,pt&&pt.stars)}</span><span class="cnm"><b>${esc(T(l))}</b><small>${b!=null?starRow(b):pt?t('{done} of {all} parts',{done:Object.keys(pt.stars).length,all:l.regions.length}):ok?t('Next'):t('Locked')}</small></span></button>`; }).join('');
    infoSheet(t('Chapter {n}: {name}',{n:ci+1,name:t(CHAPTERS[ci].name)}),
      `<div class="clist">${rows}</div><p class="cnote">${t('{done} of {all} restored. Finish them all: +{coins} and one booster of each kind.',{done:got,all:z-a,coins:tn(EC.chapterCoins,'coin')})}</p>`);
  }
  function chestInfo(){
    const st=totalStars(), next=(save.chests+1)*CHESTS.every, from=save.chests*CHESTS.every, pc=Math.max(0,Math.min(100,(st-from)/(next-from)*100));
    infoSheet(t('Star chest'),`<div class="chestinfo"><b>${STAR}${Math.min(st,next)} / ${next}</b><span class="bar"><i style="width:${pc}%"></i></span>`+
      `<p>${t('{n} more stars to open it. Every star from every picture counts; a part restored at par earns 3.',{n:Math.max(0,next-st)})}</p>`+
      `<p>${t('Inside: +{coins} and {n} boosters.',{coins:tn(CHESTS.coins,'coin'),n:CHESTS.boosters})}</p></div>`);
  }
  $('introBoosters').addEventListener('click',e=>{ const r=e.target.closest('.crow'); if(!r||r.disabled) return; $('introOverlay').hidden=true; start(+r.dataset.i); });
  $('progCards').addEventListener('click',e=>{
    const card=e.target.closest('.pcard'); if(!card) return;
    if(v2.homeTipDone) v2.homeTipDone();
    if(!card.classList.contains('ready')){ if(card.id==='chapterCard') chapterInfo(); else chestInfo(); return; }
    const got=claimRewards(); if(!got.length) return;
    sfx('fanfare'); buzz([30,60,30]); renderMenu(); rewardReveal(lastRewards);
  });
  // Reward reveal: a sunburst behind a trophy (chapter) or a chest, the chapter's name, then the rewards pop in one by
  // one (coins count up, each booster with its icon); Collect closes it with confetti.
  document.body.insertAdjacentHTML('beforeend',`<div class="overlay rwOverlay" id="rwOverlay" hidden><div class="rwcard" role="dialog" aria-modal="true" aria-labelledby="rwTitle">
    <div class="rwrays" aria-hidden="true"></div><div class="rwicon" id="rwIcon" aria-hidden="true"></div><small class="rwkick" id="rwKick"></small><h2 id="rwTitle"></h2>
    <div class="rwitems" id="rwItems"></div><button class="btn primary rwgo" id="rwGo">${t('Collect')}</button></div></div>`);
  const RW_ICON={chapter:'<svg viewBox="0 0 64 64"><path d="M20 8h24v14a12 12 0 0 1-24 0Z" fill="#f4c542" stroke="#8a5a0b" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 12H10q0 14 12 16M44 12h10q0 14-12 16" fill="none" stroke="#8a5a0b" stroke-width="2.5" stroke-linecap="round"/><path d="M28 34h8v10h-8Z" fill="#e0a92a" stroke="#8a5a0b" stroke-width="2.5"/><rect x="18" y="44" width="28" height="9" rx="2" fill="#f4c542" stroke="#8a5a0b" stroke-width="2.5"/><path d="M26 14q2 8 6 10" stroke="#fff6d0" stroke-width="3" stroke-linecap="round" fill="none"/></svg>',
    chest:'<svg viewBox="0 0 64 64"><path d="M8 28q0-16 24-16t24 16Z" fill="#c4692c" stroke="#5c2c0e" stroke-width="2.5" stroke-linejoin="round"/><rect x="8" y="28" width="48" height="26" rx="3" fill="#a9541f" stroke="#5c2c0e" stroke-width="2.5"/><path d="M8 34h48M20 13v41M44 13v41" stroke="#f4c542" stroke-width="4"/><rect x="27" y="29" width="10" height="12" rx="2" fill="#f4c542" stroke="#5c2c0e" stroke-width="2"/></svg>'};
  function rewardReveal(list){
    if(!list.length) return;
    const head=list[0], coins=list.reduce((a,x)=>a+x.coins,0), bc={};
    list.forEach(x=>x.boosters.forEach(b=>{ if(b) bc[b]=(bc[b]||0)+1; }));
    $('rwIcon').innerHTML=RW_ICON[head.kind];
    $('rwKick').textContent=head.kind==='chapter'?t('Chapter {n} complete',{n:head.n}):t('Star chest {n}',{n:head.n});
    $('rwTitle').textContent=head.kind==='chapter'?head.name:t('Chest opened!');
    $('rwItems').innerHTML=`<div class="rwitem coins" style="--d:0"><span class="rwbig"><span class="coin"></span></span><b>+<span id="rwCoins">0</span></b><small>${t('Coins')}</small></div>`+
      Object.entries(bc).map(([b,n],i)=>`<div class="rwitem" style="--d:${i+1}"><span class="rwbig">${icon(b)}</span><b>+${n}</b><small>${esc(BOOSTERS[b].name)}</small></div>`).join('');
    const ov=$('rwOverlay'); ov.hidden=false; restart(ov.querySelector('.rwcard'),'rwin');
    const el=$('rwCoins'), t0=performance.now()+350, dur=reduced?0:800;
    const tick=now=>{ const k=dur?Math.max(0,Math.min(1,(now-t0)/dur)):1; el.textContent=Math.round(coins*(1-Math.pow(1-k,3))); if(k<1&&!ov.hidden) requestAnimationFrame(tick); else sfx('coin'); };
    requestAnimationFrame(tick);
    Object.keys(bc).forEach((b,i)=>setTimeout(()=>{ if(!ov.hidden) sfx('star'); },500+i*140));
  }
  $('rwGo').onclick=()=>{ const r=$('rwIcon').getBoundingClientRect(); $('rwOverlay').hidden=true;
    burst(r.left+r.width/2,r.top+r.height/2,['#f4c542','#ffffff','#e0a92a'],40,{speed:8,shapes:['star','circle'],decay:.018,size:5}); sfx('coin'); renderCoins(true); };

  // ---------- Rewarded ads (placeholders: no ad network yet) ----------
  // watchAd(placement, reward) shows a stand-in ad screen for AD.secs seconds, then a close button that gives the
  // reward. Placements: an empty booster (+1 of it, then it is used), the coin pill (+AD.coins, AD.coinsPerDay a day),
  // Out of paint (restart the part free) and a bonus page you can't afford yet (+AD.coins). Tracked as ad_start and
  // ad_reward {placement}. An ad SDK replaces only the screen inside watchAd().
  const AD=Object.assign({secs:5,coins:25,coinsPerDay:5},G.ads||{});
  const adDay=()=>{ const k=dayKey(); if(!save.ads||save.ads.day!==k) save.ads={day:k,coins:0}; return save.ads; };
  const AD_PLAY='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/></svg>';
  document.body.insertAdjacentHTML('beforeend',`<div class="adScreen" id="adScreen" hidden role="dialog" aria-modal="true" aria-label="${t('Advertisement')}">
    <span class="adtag">${t('Ad')}</span><button class="adclose" id="adClose" hidden aria-label="${t('Close the ad and get the reward')}">✕</button>
    <div class="admid"><div class="adring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28"/><circle class="adprog" id="adProg" cx="32" cy="32" r="28"/></svg><b id="adSecs"></b></div>
    <b class="adtitle">${t('Ad placeholder')}</b><small>${t('A short video ad will play here. The reward comes when it ends.')}</small></div>
    <div class="adbar"><i id="adBar"></i></div></div>
    <div class="overlay offerOverlay" id="offerOverlay" hidden><div class="offercard" role="dialog" aria-modal="true" aria-labelledby="offerTitle">
    <div class="offericon" id="offerIcon" aria-hidden="true"></div><small class="rwkick" id="offerKick"></small><h2 id="offerTitle"></h2><p id="offerText"></p>
    <div class="offerbtns" id="offerBtns"></div><button class="btn offerno" id="offerNo">${t('Not now')}</button></div></div>`);
  let adReward=null;
  function watchAd(placement,reward){
    const el=$('adScreen'); el.hidden=false; $('adClose').hidden=true; adReward=null; track('ad_start',{placement});
    const t0=performance.now(), dur=AD.secs*1000, done=()=>{ if(el.hidden||adReward) return; adReward=()=>{ track('ad_reward',{placement}); reward(); };
      $('adClose').hidden=false; $('adSecs').textContent='✓'; $('adBar').style.width='100%'; $('adProg').style.strokeDashoffset=0; };
    const tick=now=>{ if(el.hidden||adReward) return; const k=Math.min(1,(now-t0)/dur);
      $('adSecs').textContent=Math.ceil(AD.secs*(1-k)); $('adBar').style.width=k*100+'%'; $('adProg').style.strokeDashoffset=176*(1-k);
      if(k<1) requestAnimationFrame(tick); else done(); };
    requestAnimationFrame(tick); setTimeout(done,dur+50);
  }
  $('adClose').onclick=()=>{ const f=adReward; adReward=null; $('adScreen').hidden=true; if(f) f(); };
  // A small sheet with a choice: buttons [{html, cls, disabled, go}]
  function offerSheet(o){
    $('offerIcon').innerHTML=o.icon; $('offerKick').textContent=o.kick||''; $('offerTitle').textContent=o.title; $('offerText').innerHTML=o.text||'';
    $('offerBtns').innerHTML=o.buttons.map((b,i)=>`<button class="btn ${b.cls||''}" data-i="${i}"${b.disabled?' disabled':''}>${b.html}</button>`).join('');
    $('offerBtns').onclick=e=>{ const x=e.target.closest('button'); if(!x||x.disabled) return; $('offerOverlay').hidden=true; o.buttons[+x.dataset.i].go(); };
    $('offerOverlay').hidden=false; restart($('offerOverlay').querySelector('.offercard'),'rwin');
  }
  $('offerNo').onclick=()=>{ $('offerOverlay').hidden=true; };
  $('offerOverlay').addEventListener('click',e=>{ if(e.target.id==='offerOverlay') $('offerOverlay').hidden=true; });
  const popAt=(el,colors)=>{ if(!el) return; const r=el.getBoundingClientRect(); burst(r.left+r.width/2,r.top+r.height/2,colors,24,{speed:6,shapes:['star','circle'],decay:.025,size:4}); };
  // Empty booster: watch an ad for one, or buy it with coins; its counter goes up and the player uses it when ready.
  const _spend=spend;
  spend=function(b){
    if(!(state&&state.twist==='noboost')&&!(save.inv[b]>0)){ boosterOffer(b); return false; }
    return _spend(b);
  };
  function boosterOffer(b){
    const B=BOOSTERS[b], ok=save.coins>=B.price, use=()=>{ renderActions(); popAt($(b+'Btn'),['#f4c542','#ffffff']); restart($(b+'Btn').querySelector('.badge'),'bump'); };
    offerSheet({icon:icon(b),kick:t('Out of {name}',{name:B.name}),title:t('Get one more'),text:esc(B.text),buttons:[
      {cls:'primary adgo',html:`${AD_PLAY}${t('Watch an ad')}<em>${t('Free')}</em>`,go:()=>watchAd('booster_'+b,()=>{ save.inv[b]=(save.inv[b]||0)+1; persist(); toast(t('+1 {name}',{name:B.name})); use(); })},
      {cls:'',disabled:!ok,html:ok?`${t('Buy')} · ${B.price} <span class="coin"></span>`:t('{price} coins needed',{price:B.price}),go:()=>{ addCoins(-B.price); sfx('coin'); save.inv[b]=(save.inv[b]||0)+1; persist(); use(); }}]});
  }
  // Empty boosters show a plus instead of a price: tapping opens the choice above.
  const _renderActions=renderActions;
  renderActions=function(){ _renderActions(); if(!state) return; document.querySelectorAll('.actions .badge.buy').forEach(e=>e.textContent='+'); };
  // Coins: the coin pill offers a few ads a day.
  function coinOffer(after){
    const left=AD.coinsPerDay-adDay().coins;
    offerSheet({icon:'<span class="coin big"></span>',kick:t('Coins'),title:t('Get free coins'),
      text:left>0?t('Watch a short ad for +{n} coins. {left} left today.',{n:AD.coins,left}):t('That was all for today. Come back tomorrow for more.'),
      buttons:left>0?[{cls:'primary adgo',html:`${AD_PLAY}${t('Watch an ad')}<em>+${AD.coins}</em>`,go:()=>watchAd('coins',()=>{ adDay().coins++; addCoins(AD.coins); sfx('coin');
        popAt(document.querySelector('.pill.coins:not([hidden])'),['#f4c542','#ffffff']); toast(t('+{n} coins',{n:AD.coins})); if(after) after(); })}]:[]});
  }
  document.querySelectorAll('.pill.coins').forEach(p=>{ p.setAttribute('role','button'); p.tabIndex=0; p.addEventListener('click',()=>coinOffer()); });
  // Out of paint: watch an ad to restart the part for free.
  const _outOfPaint=outOfPaint;
  outOfPaint=function(){ _outOfPaint(); if(!state||$('endOverlay').hidden) return; const r=current(), ab=$('adRescueBtn');
    ab.hidden=false; ab.className='btn adbtn'+(save.coins<RESCUE_PRICE?' primary':''); ab.innerHTML=`${AD_PLAY}${t('Watch an ad: restart {part} free',{part:esc(N(r))})}`;
    // short of coins: the ad comes first
    if(save.coins<RESCUE_PRICE) $('rescueBtn').before(ab); else $('rescueBtn').after(ab); };
  $('adRescueBtn').onclick=()=>watchAd('rescue',()=>rescue(true));
  const _win2=win; win=function(){ $('adRescueBtn').hidden=true; _win2(); };
  const _start2=start; start=function(i,o){ $("adRescueBtn").hidden=true; return _start2(i,o); };
  // A bonus page you can't afford yet: an ad for coins, then the sheet opens again.
  const _openBuy=openBuy;
  openBuy=function(i){ _openBuy(i); const l=LEVELS[i], left=AD.coinsPerDay-adDay().coins; let ab=$('buyAd');
    if(!ab){ $('buyOk').parentElement.insertAdjacentHTML('beforebegin',`<button class="btn adbtn" id="buyAd" hidden></button>`); ab=$('buyAd');
      ab.onclick=()=>{ const k=buyIdx; $('buyOverlay').hidden=true; watchAd('bonus_coins',()=>{ adDay().coins++; addCoins(AD.coins); sfx('coin'); toast(t('+{n} coins',{n:AD.coins})); openBuy(k); }); }; }
    ab.hidden=save.coins>=bonusPrice(l)||left<=0; ab.innerHTML=`${AD_PLAY}${t('Watch an ad: +{n} coins',{n:AD.coins})}`; };
  // Chapter progress (dots for its pictures) and the next star chest; a button for bonus pages ready to unlock.
  function renderProgress(i){
    $('progCards').hidden=!CHAPTERS&&!CHESTS;
    if(CHAPTERS){
      const ci=chapterOf(i), [a,z]=chapterRange(ci), got=LEVELS.slice(a,z).filter(l=>save.best[l.id]!=null).length;
      $('nextLabel').textContent=t('Chapter {n}',{n:ci+1})+' · '+t(CHAPTERS[ci].name)+(TIERS[LEVELS[i].tier].label?' · '+TIERS[LEVELS[i].tier].label:'');
      // the card keeps showing a finished chapter until its reward is collected
      const rc=CHAPTERS.findIndex((c,k)=>chapterDone(k)&&!save.chapters[k]), cc=rc>=0?rc:ci, [ca,cz]=chapterRange(cc), cgot=LEVELS.slice(ca,cz).filter(l=>save.best[l.id]!=null).length;
      $('chapterCard').innerHTML=`<span class="pico">${RW_ICON.chapter}</span><small>${t('Chapter {n} of {all}',{n:cc+1,all:CHAPTERS.length})}</small><b>${esc(t(CHAPTERS[cc].name))}</b>`+
        `<span class="pdots">${LEVELS.slice(ca,cz).map((l,k)=>`<i class="${save.best[l.id]!=null?'on':ca+k===i?'cur':''}"></i>`).join('')}</span>`+
        `<small>${rc>=0?`<b class="ready">${t('Tap to collect')}</b>`:t('Finish it: +{coins} and a booster of each kind',{coins:tn(EC.chapterCoins,'coin')})}</small>`;
      $('chapterCard').setAttribute('aria-label',t('Chapter {n}: {name}, {done} of {all} pictures',{n:cc+1,name:t(CHAPTERS[cc].name),done:cgot,all:cz-ca}));
    }
    $('chapterCard').hidden=!CHAPTERS; $('chestCard').hidden=!CHESTS;
    if(CHESTS){
      const st=totalStars(), next=(save.chests+1)*CHESTS.every, from=save.chests*CHESTS.every, pc=Math.max(0,Math.min(100,(st-from)/(next-from)*100));
      $('chestCard').innerHTML=`<span class="pico">${RW_ICON.chest}</span><small>${t('Star chest')}</small><b class="gold">${STAR}${Math.min(st,next)} / ${next}</b><span class="bar gold"><i style="width:${pc}%"></i></span>`+
        `<small>${st>=next?`<b class="ready">${t('Tap to open')}</b>`:t('+{coins} and {n} boosters',{coins:tn(CHESTS.coins,'coin'),n:CHESTS.boosters})}</small>`;
      $('chestCard').classList.toggle('ready',st>=next);
    }
    if(CHAPTERS) $('chapterCard').classList.toggle('ready',CHAPTERS.some((c,k)=>chapterDone(k)&&!save.chapters[k]));
    const nb=LEVELS.filter((l,k)=>buyable(k)).length, bb=$('bonusBtn'); bb.hidden=!nb;
    // the Gallery tab's dot means "new bonus pages since you last opened the Gallery"; the button there says New
    v2.bonusN=nb; if((save.bonusSeen||0)>nb){ save.bonusSeen=nb; persist(); }
    const fresh=nb>(save.bonusSeen||0), gt=document.querySelector('.tab[data-tab="gallery"]'); if(gt) gt.classList.toggle('hasnew',fresh);
    if(nb&&fresh) bb.insertAdjacentHTML('beforeend',`<em class="newtag">${t('New')}</em>`);
    if(nb) bb.innerHTML=icon('gallery')+`<span class="dlab"><b>${t('Bonus pages')}</b><small>${t('{n} ready to unlock with coins',{n:nb})}</small></span>`;
  }
  // ---------- Holidays tab and Home card ----------
  const seasonName=s=>t({halloween:'Halloween',thanksgiving:'Thanksgiving',christmas:'Christmas'}[s]);
  const seasonDate=d=>{ try{ return d.toLocaleDateString(I18N.lang,{month:'long',day:'numeric'}); }catch(e){ return d.toDateString(); } };
  const seasonPics=s=>LEVELS.map((l,i)=>i).filter(i=>LEVELS[i].season===s);
  const holTab=document.querySelector('.tab[data-tab="holidays"]'); if(holTab) holTab.innerHTML=icon('gift')+t('Holidays');
  function holCard(k){
    const l=LEVELS[k], b=save.best[l.id], ok=unlocked(k), pt=save.partial&&save.partial[l.id];
    return `<button class="gcard" data-i="${k}" ${ok?'':'disabled'} aria-label="${esc(T(l))}${ok?'':', '+t('locked')}">${thumbSVG(l,b!=null,pt&&pt.stars)}${ok?'':`<span class="lockico">${icon('lock')}</span>`}`+
      `<b>${esc(T(l))}${TIERS[l.tier].label?` <em class="gtier">${TIERS[l.tier].label}</em>`:''}</b><small>${b!=null?starRow(b):pt?t('{done} of {all} parts',{done:Object.keys(pt.stars).length,all:l.regions.length}):''}</small></button>`;
  }
  // Separate collections, each with its own card (dates, progress); a card opens that collection's pictures.
  const SEASONS=['halloween','thanksgiving','christmas'];
  function seasonStatus(s){
    const on=seasonOn();
    if(on===s) return t('Open until {date}',{date:seasonDate(seasonEnd(s))});
    return t('Opens on {date}',{date:seasonDate(seasonStart(s))});
  }
  renderHolidays=function(){
    const el=$('holidays'); if(!el) return; const on=seasonOn(), view=v2.holView;
    if(view){
      const ids=seasonPics(view), got=ids.filter(i=>save.best[LEVELS[i].id]!=null).length;
      el.innerHTML=`<button class="holback" aria-label="${t('Back to Holidays')}">${icon('back')}${t('Holidays')}</button>`+
        `<h2>${t('{season} collection',{season:seasonName(view)})}</h2><p class="hsub">${seasonStatus(view)} · ${t('{done} of {all} restored',{done:got,all:ids.length})}</p>`+
        (on===view?'':`<p class="hsub">${t('Outside its season, only the pictures you already started can be played.')}</p>`)+
        `<div class="ggrid">${ids.map(holCard).join('')}</div>`;
      return;
    }
    el.innerHTML=`<h2>${t('Holidays')}</h2><p class="hsub">${t('Holiday collections open in their season. Pictures you started stay playable.')}</p><div class="hcols">`+
      SEASONS.map(s=>{ const ids=seasonPics(s), got=ids.filter(i=>save.best[LEVELS[i].id]!=null).length, live=on===s, cover=LEVELS[ids[0]];
        return `<button class="hcol ${s}${live?' live':''}" data-s="${s}"><span class="hcov">${thumbSVG(cover,got>0)}</span><span class="hinfo"><b>${t('{season} collection',{season:seasonName(s)})}</b>`+
          `<small>${live?`<em>${t('Now')}</em> `:''}${seasonStatus(s)}</small><span class="dbars">${ids.map(i=>`<i class="${save.best[LEVELS[i].id]!=null?'on':''}"></i>`).join('')}</span>`+
          `<small>${t('{done} of {all} restored',{done:got,all:ids.length})}</small></span></button>`; }).join('')+`</div>`;
  };

  $('holidays').addEventListener('click',e=>{
    if(e.target.closest('.holback')){ v2.holView=null; renderHolidays(); return; }
    const col=e.target.closest('.hcol'); if(col){ v2.holView=col.dataset.s; renderHolidays(); $('holidays').scrollTop=0; return; }
    const c=e.target.closest('.gcard'); if(c&&!c.disabled) start(+c.dataset.i); });
  // The live season's banner sits right under Play: a themed gradient with a few animated decorations, the next
  // picture in color, days left and the collection's progress.
  const SEASON_DECO={
    halloween:'<circle class="moon" cx="292" cy="22" r="13"/><path class="bat b1" d="M236 14q8-8 14 0q3-5 6 0q6-8 14 0q-8 0-11 7q-5-3-8 0q-3-7-15-7Z"/><path class="bat b2" d="M262 44q6-6 10 0q2-4 4 0q4-6 10 0q-6 0-8 5q-3-2-6 0q-2-5-10-5Z"/><g class="star"><circle cx="196" cy="16" r="1.4"/><circle cx="270" cy="88" r="1.2"/><circle cx="314" cy="56" r="1.2"/></g>',
    thanksgiving:'<g transform="translate(212 16) rotate(-20) scale(1)"><g class="leaf l1"><path d="M0 -11L3 -4 9 -7 7 0 11 2 4 4 5 10 0 7-5 10-4 4-11 2-7 0-9-7-3-4Z"/><path class="stem" d="M0 7v7"/></g></g><g transform="translate(256 30) rotate(25) scale(1.25)"><g class="leaf l2"><path d="M0 -11L3 -4 9 -7 7 0 11 2 4 4 5 10 0 7-5 10-4 4-11 2-7 0-9-7-3-4Z"/><path class="stem" d="M0 7v7"/></g></g><g transform="translate(300 14) rotate(-40) scale(1.05)"><g class="leaf l3"><path d="M0 -11L3 -4 9 -7 7 0 11 2 4 4 5 10 0 7-5 10-4 4-11 2-7 0-9-7-3-4Z"/><path class="stem" d="M0 7v7"/></g></g><g transform="translate(312 52) rotate(15) scale(0.8)"><g class="leaf l1"><path d="M0 -11L3 -4 9 -7 7 0 11 2 4 4 5 10 0 7-5 10-4 4-11 2-7 0-9-7-3-4Z"/><path class="stem" d="M0 7v7"/></g></g><g transform="translate(236 58) rotate(60) scale(0.7)"><g class="leaf l3"><path d="M0 -11L3 -4 9 -7 7 0 11 2 4 4 5 10 0 7-5 10-4 4-11 2-7 0-9-7-3-4Z"/><path class="stem" d="M0 7v7"/></g></g><g class="star"><circle cx="190" cy="40" r="1.2"/><circle cx="280" cy="72" r="1.2"/></g>',
    christmas:'<path class="wire" d="M160 4Q200 26 250 8T330 10"/><circle class="bulb r" cx="170" cy="13" r="3.6"/><circle class="bulb g" cx="190" cy="20" r="3.6"/><circle class="bulb y" cx="210" cy="23" r="3.6"/><circle class="bulb b" cx="230" cy="20" r="3.6"/><circle class="bulb r" cx="250" cy="14" r="3.6"/><circle class="bulb g" cx="270" cy="17" r="3.6"/><circle class="bulb y" cx="290" cy="23" r="3.6"/><circle class="bulb b" cx="310" cy="20" r="3.6"/><g class="flake f1"><path d="M246 38v16M238 46h16M240 40l12 12M252 40l-12 12"/></g><g class="flake f2"><path d="M300 46v12M294 52h12M296 48l8 8M304 48l-8 8"/></g><g class="snow"><circle cx="200" cy="40" r="1.6"/><circle cx="222" cy="64" r="1.3"/><circle cx="276" cy="36" r="1.5"/><circle cx="316" cy="78" r="1.3"/><circle cx="186" cy="74" r="1.2"/></g>'
  };
  function renderSeasonCard(){
    const b=$('seasonBtn'), on=seasonOn(); b.hidden=!on; if(!on) return;
    const ids=seasonPics(on), got=ids.filter(i=>save.best[LEVELS[i].id]!=null).length, next=ids.find(i=>save.best[LEVELS[i].id]==null), lv=LEVELS[next!=null?next:ids[0]];
    const now=new Date(), left=Math.round((seasonEnd(on)-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/864e5)+1;
    b.className='btn quizbtn evcard seasoncard '+({christmas:'xmas',thanksgiving:'tg',halloween:'hw'}[on]);
    b.innerHTML=`<svg class="sdeco" viewBox="0 0 320 100" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">${SEASON_DECO[on]||''}</svg><span class="sshine" aria-hidden="true"></span>`+
      `<span class="scover">${thumbSVG(lv,true)}</span><span class="sbody"><span class="stag">${left<=1?t('Last day!'):left<=31?t('{n} days left',{n:left}):t('until {date}',{date:seasonDate(seasonEnd(on))})}</span>`+
      `<b>${t('{season} pictures',{season:seasonName(on)})}</b>`+
      `<span class="dbars">${ids.map(i=>`<i class="${save.best[LEVELS[i].id]!=null?'on':''}"></i>`).join('')}</span>`+
      `<small>${got===ids.length?t('All restored. Happy holidays!'):t('{done} of {all} restored',{done:got,all:ids.length})}</small></span>`+
      `<span class="sgo">${got===ids.length?t('View'):t('Play')}</span>`;
  }
  $('seasonBtn').onclick=()=>{ v2.holView=seasonOn(); showTab('holidays'); };
  // the Holidays tab itself opens on the collections
  if(holTab) holTab.addEventListener('click',()=>{ if(v2.holView){ v2.holView=null; renderHolidays(); } });
  const CH_COLORS=['#e8505b','#e8962a','#3fa65a','#3a7bd5','#e05a9a','#8e55cc','#d9682a','#c9a227'];
  const galTab=document.querySelector('.tab[data-tab="gallery"]');
  if(galTab) galTab.addEventListener('click',()=>{ if((v2.bonusN||0)>(save.bonusSeen||0)){ save.bonusSeen=v2.bonusN; persist(); setTimeout(()=>galTab.classList.remove('hasnew'),600); } });
  const _renderMenu=renderMenu;
  renderMenu=function(){
    _renderMenu(); renderSeasonCard(); if(!$('holidays').hidden) renderHolidays();
    const i=nextIndex(), lv=LEVELS[i], doneN=LEVELS.filter(l=>save.best[l.id]!=null).length;
    const pt=save.partial&&save.partial[lv.id];
    if(pt){ const n=Object.keys(pt.stars).length;
      $('nextPic').innerHTML=thumbSVG(lv,false,pt.stars);
      $('heroMeta').textContent=t('{done} of {all} parts',{done:n,all:lv.regions.length});
      $('heroBar').style.width=(n/lv.regions.length*100)+'%'; $('playBtn').textContent=t('Continue');
    }else{
      $('heroMeta').textContent=tn(lv.regions.length,'part');
      const doneMain=LEVELS.slice(0,MAIN).filter(l=>save.best[l.id]!=null).length;
      $('heroBar').style.width=(doneMain/MAIN*100)+'%';
    }
    // the chapter's accent color, and one dot per part in the color it will be (done parts get a check)
    const ci=CHAPTERS?chapterOf(i):0; document.querySelector('.v2hero').style.setProperty('--chc',CH_COLORS[ci%CH_COLORS.length]);
    // one filled dot per part in its color; restored parts get a check and a ring
    $('heroSw').innerHTML=lv.regions.map(r=>`<i class="${pt&&pt.stars[r.id]!=null?'on':''}" style="--pc:${hex(r.target)}"></i>`).join('');
    renderProgress(i);
    $('homeStars').innerHTML=STAR+LEVELS.reduce((a,l)=>a+(save.best[l.id]||0),0);
  };
}

// ---------- Cheat menu (staging, localhost or ?cheats) ----------
if(CHEATS){
  $('cheatBtn').innerHTML=icon('wrench');
  const sel=$('cheatLevel'); sel.innerHTML=LEVELS.map((l,i)=>`<option value="${i}">${l.bonus?'Bonus':i+1}. ${esc(T(l))}${TIERS[l.tier].label?' · '+TIERS[l.tier].label:''}</option>`).join('');
  let armed=false;
  const refresh=()=>{ persist(); renderCoins(true); if(state){ updateHud(); renderActions(); } else renderMenu(); };
  const open=()=>{ const g=!!state&&!state.finished; ['paint','solve','finish'].forEach(c=>$('cheatOverlay').querySelector(`[data-c="${c}"]`).disabled=!g);
    if(L) sel.value=L.index; armed=false; $('cheatEvents').textContent=EVENTS.join('\n')||'No events yet'; $('cheatHl').textContent='Highlight: '+(save.hl||'aura'); $('cheatNew').textContent='New game: start over from picture 1'; $('cheatOverlay').hidden=false; };
  $('cheatBtn').onclick=open;
  // Sound test: play every effect in the old or the new set to compare them on a phone.
  const SND=[['drop','W','Drop White'],['drop','C','Drop Cyan'],['drop','M','Drop Magenta'],['drop','Y','Drop Yellow'],['drop','K','Drop Black'],
    ['undo',null,'Undo'],['wrong',null,'Wrong paint'],['pour',null,'Pour out'],['restore',.1,'Part restored'],['restore',.9,'Last part'],
    ['coin',null,'Coin'],['star','all','Stars'],['fanfare',null,'Fanfare'],['stamp',null,'Stamp'],['fail',null,'Out of paint'],
    ['daily',null,'Daily'],['magic',null,'Magic'],['snap',null,'Snap'],['starLost',null,'Star lost']];
  $('sfxGrid').innerHTML=SND.map((x,i)=>`<button class="btn" data-s="${i}">${x[2]}</button>`).join('');
  const sfxSeg=()=>document.querySelectorAll('#sfxSet button').forEach(b=>b.setAttribute('aria-pressed',window.SFX&&SFX.set===b.dataset.v));
  sfxSeg();
  $('sfxSet').onclick=e=>{const b=e.target.closest('button'); if(!b||!window.SFX) return; SFX.set=b.dataset.v; sfxSeg();};
  $('sfxGrid').onclick=e=>{const b=e.target.closest('[data-s]'); if(!b) return; const [n,a]=SND[+b.dataset.s];
    if(!window.SFX||!SFX.enabled){toast('Sound is off in Settings'); return;}
    if(a==='all') [0,1,2].forEach(i=>setTimeout(()=>sfx(n,i),i*280)); else sfx(n,a); };
  $('cheatOverlay').addEventListener('click',e=>{
    const b=e.target.closest('[data-c]'); if(!b){ if(e.target===$('cheatOverlay')) $('cheatOverlay').hidden=true; return; }
    const c=b.dataset.c, close=()=>{$('cheatOverlay').hidden=true;};
    if(c==='close') return close();
    if(c==='coins100'||c==='coins1000'){ addCoins(c==='coins100'?100:1000); refresh(); toast('Coins added'); return; }
    if(c==='boosters'){ Object.keys(BOOSTERS).forEach(k=>save.inv[k]=(save.inv[k]||0)+5); refresh(); toast('+5 of every booster'); return; }
    if(c==='paint'&&state){ state.paint+=20; refresh(); close(); toast('+20 paint'); return; }
    if(c==='solve'&&state&&!state.applying){ // put the exact recipe in the bowl, free
      const r=current(); state.drops=[]; state.fr=[]; Object.entries(r.recipe).forEach(([k,n])=>{for(let j=0;j<n;j++){state.drops.push(k);state.fr.push(true);}});
      state.used[r.id]=r.min; close(); renderMix(); afterMixChange(); return; }
    if(c==='finish'&&state&&!state.finished){
      close(); hideHand(); hideCoach(); state.forced=false; state.lesson=null;
      L.regions.forEach(r=>{ if(state.done[r.id]) return; state.done[r.id]=true; state.stars[r.id]=3; state.used[r.id]=r.min;
        const g=scene.querySelector(`.region[data-id="${r.id}"]`); g.setAttribute(r.stroke?'stroke':'fill',hex(r.target)); g.classList.remove('sel','v2wait'); g.classList.add('done');
        const cr=scene.querySelector(`.crack[data-for="${r.id}"]`); if(cr) cr.classList.add('gone'); });
      state.drops=[]; state.fr=[]; state.finished=true; updateHud(); finishPicture(); return; }
    if(c==='unlock'){ save.unlockAll=true; refresh(); toast('All pictures unlocked'); return; }
    if(c==='restoreAll'){ LEVELS.forEach(l=>save.best[l.id]=3); refresh(); toast('All pictures restored'); return; }
    if(c==='newDay'){ if(save.daily) save.daily.last=dayKey(new Date(Date.now()-864e5)); refresh(); toast('Daily picture is open again, streak kept'); return; }
    if(c==='tutorials'){ save.tut={}; save.seen={}; persist(); toast('Tutorials and tip cards will show again'); return; }
    if(c==='jump'){ close(); start(+sel.value); return; }
    if(c==='hl'){ const L5=['dim','wash','halo','sticker','aura'], v=L5[(L5.indexOf(save.hl||'aura')+1)%L5.length]; save.hl=v; persist();
      $('cheatHl').textContent='Highlight: '+v; respot(); toast('Highlight: '+v); return; }
    if(c.startsWith('s-')){ const v=c.slice(2); if(v==='auto') delete save.forceSeason; else save.forceSeason=v; persist();
      if(!state) renderMenu(); toast(v==='auto'?'Season follows the date':'Season: '+v); return; }
    // Wipes this build's save (coins, stars, boosters, tutorials, progress) and opens picture 1, as a first-time player.
    if(c==='newgame'){
      if(!armed){ armed=true; b.textContent='Tap again: erase this save and start over'; return; }
      try{localStorage.removeItem(SAVE_KEY); sessionStorage.setItem('pp-newgame','1');}catch(err){} location.reload();
    }
  });
}

goHome();
if(CHEATS){ try{ if(sessionStorage.getItem('pp-newgame')){ sessionStorage.removeItem('pp-newgame'); start(0); } }catch(e){} }
track('game_open',{lang:I18N.lang,restored:LEVELS.filter(l=>save.best[l.id]!=null).length,coins:save.coins});
})();
