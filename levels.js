// ColorBook: simple drawn pictures on the shared ColorEngine.
(function(){
const {INK,petals,circ,ring,holeRect}=CF;
// Wavy bottom edge (cake frosting): a band from x0 to x1, top at y0, n drips hanging to y.
const drips=(x0,x1,y0,y,n)=>{const w=(x1-x0)/n;let d=`M${x0} ${y0}H${x1}V${y}`;for(let i=0;i<n;i++){const x=x1-i*w;d+=`Q${x-w/2} ${y+14} ${x-w} ${y}`;}return `<path d="${d}V${y0}Z"/>`;};
const leaf=(cx,cy,rx,ry,a)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${cx} ${cy})"/>`;
// Feathers fanned around (cx,cy): n ellipses at distance d, from angle a0 to a1 (degrees, -90 = up), long axis pointing outward.
const fanAngles=(a0,a1,n)=>Array.from({length:n},(_,i)=>a0+(a1-a0)*i/(n-1));
const fan=(cx,cy,d,rx,ry,a0,a1,n)=>fanAngles(a0,a1,n).map(a=>{const r=a*Math.PI/180;return leaf(+(cx+d*Math.cos(r)).toFixed(1),+(cy+d*Math.sin(r)).toFixed(1),rx,ry,+(a+90).toFixed(1));}).join('');
const fanDots=(cx,cy,d,rad,a0,a1,n)=>fanAngles(a0,a1,n).map(a=>{const r=a*Math.PI/180;return `<circle cx="${(cx+d*Math.cos(r)).toFixed(1)}" cy="${(cy+d*Math.sin(r)).toFixed(1)}" r="${rad}"/>`;}).join('');
// Pie slice of a circle (umbrella panels): angles in degrees, 180 → 360 is the upper half.
const slice=(cx,cy,r,a1,a2)=>{const p=a=>[(cx+r*Math.cos(a*Math.PI/180)).toFixed(1),(cy+r*Math.sin(a*Math.PI/180)).toFixed(1)];const[x1,y1]=p(a1),[x2,y2]=p(a2);return `<path d="M${cx} ${cy}L${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}Z"/>`;};
const rects=(xs,ys,w,h)=>xs.flatMap(x=>ys.map(y=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1"/>`)).join('');
const LEVELS=[
{ id:'balloons', title:'Balloons', sub:'Each balloon needs just one paint.', budget:8, tier:'easy', paints:['C','M','Y'], coach:['tapPaint','drag'],
  tip:{title:'Welcome, restorer',text:'Each faded part has a target color. Tap a paint to drop it in the bowl, the part paints itself as soon as the match reaches 95%. Every drop uses paint from your pot. Restored parts earn coins.'},
  bg:`<rect width="320" height="240" fill="#eaf1fa"/><g fill="#fff" stroke="${INK}" stroke-width="1.5"><path d="M18 212a14 14 0 0 1 26-8a11 11 0 0 1 20 8z"/><path d="M252 214a16 16 0 0 1 30-8a12 12 0 0 1 22 8z"/></g>`,
  regions:[
    {id:'magenta',name:'Magenta balloon',recipe:{M:1},svg:'<ellipse cx="90" cy="98" rx="30" ry="38"/><path d="M85 142L90 134L95 142Z"/>'},
    {id:'yellow',name:'Yellow balloon',recipe:{Y:1},svg:'<ellipse cx="168" cy="74" rx="30" ry="38"/><path d="M163 118L168 110L173 118Z"/>'},
    {id:'cyan',name:'Cyan balloon',recipe:{C:1},svg:'<ellipse cx="246" cy="100" rx="30" ry="38"/><path d="M241 144L246 136L251 144Z"/>'},
  ],
  order:['magenta','yellow','cyan'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.5" pointer-events="none"><path d="M90 142q-8 30 6 50t4 40"/><path d="M168 118q10 30-4 56t6 58"/><path d="M246 144q-6 30 6 50t-2 38"/></g>
    <g fill="#fff" opacity=".55" pointer-events="none"><ellipse cx="78" cy="82" rx="6" ry="11" transform="rotate(20 78 82)"/><ellipse cx="156" cy="58" rx="6" ry="11" transform="rotate(20 156 58)"/><ellipse cx="234" cy="84" rx="6" ry="11" transform="rotate(20 234 84)"/></g>`
},
{ id:'penguin', title:'Penguin', sub:'Only white and black. Mix them for gray.', budget:8, tier:'easy', paints:['W','K'], intro:'undo',
  tip:{title:'Light and dark',text:'This picture needs only <b>White</b> and <b>Black</b>. One drop of each makes <b>gray</b>. More white makes it lighter, more black makes it darker.'},
  bg:`<rect width="320" height="240" fill="#e6eef5"/>`,
  regions:[
    {id:'body',name:'Penguin',recipe:{K:1},svg:'<path d="M160 36C198 36 214 80 214 130C214 182 196 208 160 208C124 208 106 182 106 130C106 80 122 36 160 36Z"/><path d="M110 104C92 124 88 150 94 170L112 160Z"/><path d="M210 104C228 124 232 150 226 170L208 160Z"/>'},
    {id:'belly',name:'Belly',recipe:{W:1},svg:'<path d="M160 82C184 82 196 110 196 142C196 178 182 200 160 200C138 200 124 178 124 142C124 110 136 82 160 82Z"/>'},
    {id:'ice',name:'Ice',recipe:{W:1,K:1},svg:'<path d="M0 198Q80 188 160 198T320 196V240H0Z"/>'},
  ],
  order:['ice','body','belly'],
  decor:`<g pointer-events="none" stroke="${INK}" stroke-width="1.5"><circle cx="146" cy="62" r="6" fill="#fff"/><circle cx="174" cy="62" r="6" fill="#fff"/><circle cx="147" cy="63" r="2.5" fill="${INK}"/><circle cx="173" cy="63" r="2.5" fill="${INK}"/><path d="M152 74L168 74L160 86Z" fill="#fff" stroke-linejoin="round"/><path d="M136 206q10-8 20 0zM164 206q10-8 20 0z" fill="#fff"/></g>`
},
{ id:'umbrellas', title:'Umbrellas', sub:'White lightens a color. Black darkens it.', tier:'easy', intro:'hint',
  tip:{title:'Lighter and darker',text:'All five paints are open now. Add <b>White</b> to a color to make it lighter, <b>Black</b> to make it darker. One drop of each is enough here.'},
  bg:`<rect width="320" height="240" fill="#eef1f6"/><rect y="200" width="320" height="40" fill="#d9dde6"/><line x1="0" y1="200" x2="320" y2="200" stroke="${INK}" stroke-width="2"/>`,
  regions:[
    {id:'cyanL',name:'Light blue panels',recipe:{C:1,W:1},svg:slice(70,122,48,180,225)+slice(70,122,48,270,315)},
    {id:'cyanD',name:'Dark blue panels',recipe:{C:1,K:1},svg:slice(70,122,48,225,270)+slice(70,122,48,315,360)},
    {id:'magL',name:'Pink panels',recipe:{M:1,W:1},svg:slice(160,100,48,180,225)+slice(160,100,48,270,315)},
    {id:'magD',name:'Dark magenta panels',recipe:{M:1,K:1},svg:slice(160,100,48,225,270)+slice(160,100,48,315,360)},
    {id:'yelL',name:'Light yellow panels',recipe:{Y:1,W:1},svg:slice(250,126,48,180,225)+slice(250,126,48,270,315)},
    {id:'yelD',name:'Olive panels',recipe:{Y:1,K:1},svg:slice(250,126,48,225,270)+slice(250,126,48,315,360)},
  ],
  order:['cyanL','cyanD','magL','magD','yelL','yelD'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" pointer-events="none">
    <path d="M70 122V190q0 8-8 8"/><path d="M160 100V178q0 8-8 8"/><path d="M250 126V194q0 8-8 8"/>
    <path d="M70 74v-6M160 52v-6M250 78v-6"/></g>
    <g pointer-events="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" opacity=".45"><path d="M30 30l-4 9M110 20l-4 9M205 34l-4 9M290 22l-4 9M20 150l-4 9M300 168l-4 9M120 160l-4 9M205 172l-4 9"/></g>`
},
{ id:'fruit', title:'Fruit bowl', sub:'Two paints make a new color.', budget:12, tier:'easy', paints:['C','M','Y'], intro:'pick',
  tip:{title:'Mixing two colors',text:'Red, green and blue are not in your paint set. Mix them: one drop of each of two paints.'},
  bg:`<rect width="320" height="240" fill="#f4eee4"/><rect y="188" width="320" height="52" fill="#dcc7aa"/><line x1="0" y1="188" x2="320" y2="188" stroke="${INK}" stroke-width="2"/>`,
  regions:[
    {id:'apple',name:'Apple',recipe:{M:1,Y:1},svg:'<circle cx="116" cy="146" r="30"/>'},
    {id:'pear',name:'Pear',recipe:{C:1,Y:1},svg:'<path d="M160 70c10 0 12 14 14 24c4 12 20 22 20 40c0 22-16 32-34 32s-34-10-34-32c0-18 16-28 20-40c2-10 4-24 14-24z"/>'},
    {id:'plum',name:'Plum',recipe:{C:1,M:1},svg:'<circle cx="204" cy="150" r="27"/>'},
  ],
  order:['pear','apple','plum'],
  decor:`<g pointer-events="none"><path d="M160 72q1-10 8-15" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M62 162H258Q252 216 160 216Q68 216 62 162Z" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M70 180H250" stroke="#8fb3e0" stroke-width="5"/><g fill="${INK}"><circle cx="106" cy="132" r="1.5"/><circle cx="124" cy="126" r="1.5"/></g></g>`
},
{ id:'beach', title:'Beach', sub:'Mix a color, then lighten or darken it.', tier:'easy', intro:'empty',
  tip:{title:'Mix, then shade',text:'Mix two paints to get the color, then add <b>White</b> to make it lighter or <b>Black</b> to make it darker.'},
  regions:[
    {id:'sun',name:'Sun',recipe:{M:1,Y:3},svg:'<circle cx="62" cy="46" r="22"/>'},
    {id:'sea',name:'Sea',recipe:{C:3,M:1},svg:'<path d="M0 118H320V168Q240 158 160 166T0 160Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:2,C:1},svg:'<rect x="0" y="0" width="320" height="130"/>'},
    {id:'sand',name:'Sand',recipe:{W:3,Y:2},svg:'<path d="M0 158Q80 150 160 160T320 156V240H0Z"/>'},
    {id:'umbrella',name:'Umbrella',recipe:{W:1,M:2,Y:1},svg:'<path d="M70 150A52 36 0 0 1 174 150Q161 142 148 150Q135 142 122 150Q109 142 96 150Q83 142 70 150Z"/>'},
    {id:'rock',name:'Rock',recipe:{W:2,K:1},svg:'<path d="M232 170q6-24 28-26q20 0 28 24q-2 6-28 6t-28-4z"/>'},
  ],
  order:['sky','sun','sea','sand','rock','umbrella'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" pointer-events="none">
    <line x1="122" y1="146" x2="122" y2="214" stroke-width="3"/><path d="M122 114L109 146M122 114L135 146"/>
    <path d="M196 52q8-8 16 0q8-8 16 0"/><path d="M236 70q6-6 12 0q6-6 12 0"/>
    <path d="M20 138q10-6 20 0M130 130q10-6 20 0M240 136q10-6 20 0"/></g>`
},
{ id:'house', title:'Cottage', sub:'Tap a faded part, mix its color, paint it back.', tier:'normal', coach:['tapPart'], coachPart:'roof',
  tip:{title:'A bigger picture',text:'Ten parts share one paint pot, so plan your drops. You can tap any faded part to work on it. If the pot runs dry, coins can rescue the part you are on.'},
  regions:[
    {id:'sun',name:'Sun',recipe:{W:1,Y:2},svg:'<circle cx="264" cy="46" r="24"/>'},
    {id:'flower',name:'Flowers',recipe:{W:2,M:3},svg:petals(284,196)+petals(304,206)},
    {id:'window',name:'Lit windows',recipe:{W:1,M:1,Y:4},svg:'<rect x="134" y="124" width="26" height="22" rx="2"/><rect x="206" y="124" width="26" height="22" rx="2"/>'},
    {id:'door',name:'Door',recipe:{C:2,M:3},svg:'<path d="M168 190V156a13 13 0 0 1 26 0V190Z"/>'},
    {id:'roof',name:'Roof',recipe:{W:1,C:1,M:3,Y:2},svg:'<path d="M106 114L180 60L254 114Z"/>'},
    {id:'wall',name:'Walls',recipe:{W:2,M:1,Y:2},svg:'<rect x="118" y="112" width="124" height="78"/>'},
    {id:'tree',name:'Treetop',recipe:{C:1,Y:1,K:1},svg:'<circle cx="46" cy="104" r="24"/><circle cx="72" cy="96" r="26"/><circle cx="60" cy="74" r="22"/>'},
    {id:'trunk',name:'Tree trunk',recipe:{C:1,M:1,Y:1},svg:'<rect x="52" y="118" width="14" height="60" rx="2"/>'},
    {id:'grass',name:'Grass',recipe:{C:2,Y:3},svg:'<path d="M0 176Q80 158 160 174T320 170V240H0Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:3,C:1,M:1},svg:'<rect x="0" y="0" width="320" height="185"/>'},
  ],
  order:['sky','sun','grass','trunk','tree','wall','roof','door','window','flower'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" pointer-events="none">
    <line x1="284" y1="202" x2="284" y2="226"/><line x1="304" y1="212" x2="304" y2="230"/>
    <line x1="147" y1="124" x2="147" y2="146"/><line x1="134" y1="135" x2="160" y2="135"/>
    <line x1="219" y1="124" x2="219" y2="146"/><line x1="206" y1="135" x2="232" y2="135"/></g>
    <g fill="#fff" stroke="${INK}" stroke-width="1.5" pointer-events="none"><circle cx="284" cy="196" r="3"/><circle cx="304" cy="206" r="3"/><circle cx="189" cy="174" r="2" fill="${INK}"/></g>`
},
{ id:'shelf', title:'Kitchen shelf', sub:'Everything on the shelf is cracked and faded. Mend it.', tier:'normal',
  regions:[
    {id:'lemon',name:'Lemon',recipe:{Y:1},svg:'<ellipse cx="211" cy="162" rx="11" ry="8"/>',crack:'M205 157l4 4-2 3 5 2'},
    {id:'mug',name:'Mug',recipe:{W:1,C:1,M:1},svg:'<rect x="148" y="130" width="36" height="40" rx="4"/><path d="M184 138q14 0 14 12t-14 12v-6q8 0 8-6t-8-6z"/>',crack:'M160 130l4 10-5 6 7 8-3 6'},
    {id:'leaves',name:'Leaves',recipe:{C:1,Y:2},svg:'<ellipse cx="263" cy="104" rx="9" ry="26"/><ellipse cx="246" cy="112" rx="8" ry="21" transform="rotate(-32 246 112)"/><ellipse cx="280" cy="112" rx="8" ry="21" transform="rotate(32 280 112)"/>',crack:'M263 84l3 8-4 5 3 7'},
    {id:'teapot',name:'Teapot',recipe:{W:1,C:1,M:2},svg:'<path d="M44 135Q24 128 20 110L28 108Q34 124 48 126Z"/><path d="M116 122q22 0 22 18t-22 18v-8q13 0 13-10t-13-10z"/><ellipse cx="80" cy="140" rx="38" ry="30"/><path d="M62 113Q80 100 98 113Z"/><circle cx="80" cy="103" r="4"/>',crack:'M72 112l6 12-6 8 8 10-4 10 6 8'},
    {id:'pot',name:'Flower pot',recipe:{M:2,Y:3},svg:'<path d="M230 142H296L288 170H238Z"/><rect x="226" y="132" width="74" height="11" rx="2"/>',crack:'M252 143l5 9-4 6 6 8'},
    {id:'frame',name:'Picture frame',recipe:{M:1,Y:1,K:1},svg:'<path fill-rule="evenodd" d="M118 28h84v60h-84zM128 38v40h64v-40z"/>',crack:'M118 50l6 3-2 5 4 4'},
    {id:'plank',name:'Shelf',recipe:{W:1,C:1,M:1,Y:2},svg:'<rect x="8" y="170" width="304" height="14" rx="2"/><path d="M40 184h10l-10 24zM270 184h10v24z"/>',crack:'M120 170l5 7-4 7M230 170l-3 6 5 8'},
    {id:'wallp',name:'Wall',recipe:{W:3,C:1},svg:'<rect x="0" y="0" width="320" height="240"/>'},
  ],
  order:['wallp','plank','frame','teapot','mug','lemon','pot','leaves'],
  decor:`<g pointer-events="none"><rect x="128" y="38" width="64" height="40" fill="#f4f1ea" stroke="${INK}" stroke-width="1.5"/>
    <path d="M132 74l14-18 10 11 8-8 24 15" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="178" cy="48" r="4" fill="none" stroke="${INK}" stroke-width="1.5"/>
    <path d="M160 18l-2 10M160 18l2 10" stroke="${INK}" stroke-width="1.5"/><circle cx="160" cy="16" r="2" fill="${INK}"/>
    <line x1="263" y1="130" x2="263" y2="92" stroke="${INK}" stroke-width="1.5"/></g>`
},
{ id:'fishbowl', title:'Fishbowl', sub:'Two fish, some weed and a lot of water.', tier:'normal',
  regions:[
    {id:'fish1',name:'Goldfish',recipe:{M:1,Y:2},svg:'<ellipse cx="134" cy="112" rx="22" ry="14"/><path d="M113 112L98 101V123Z"/>'},
    {id:'fish2',name:'Little fish',recipe:{W:1,C:1,M:3},svg:'<ellipse cx="190" cy="146" rx="15" ry="10"/><path d="M204 146L216 137V155Z"/>'},
    {id:'weed',name:'Water weed',recipe:{C:3,Y:4,K:1},svg:'<path d="M150 182Q136 150 148 118Q158 146 156 182Z"/><path d="M162 182Q178 146 170 108Q160 146 158 182Z"/>'},
    {id:'pebbles',name:'Pebbles',recipe:{W:2,M:1,K:1},svg:'<path d="M111 182Q135 172 160 178T209 182A76 76 0 0 1 111 182Z"/>'},
    {id:'water',name:'Water',recipe:{W:3,C:2,Y:1},svg:'<path d="M104.6 72H215.4A76 76 0 1 1 104.6 72Z"/>'},
    {id:'table',name:'Table',recipe:{M:1,Y:2,K:1},svg:'<path d="M0 190H320V240H0Z"/>'},
    {id:'wallp',name:'Wall',recipe:{W:4,Y:1},svg:'<rect x="0" y="0" width="320" height="240"/>'},
  ],
  order:['wallp','table','water','pebbles','weed','fish1','fish2'],
  decor:`<g pointer-events="none" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round">
    <path d="M104.6 72A76 76 0 0 1 135.7 52M215.4 72A76 76 0 0 0 184.3 52"/><ellipse cx="160" cy="52" rx="24.3" ry="4"/>
    <path d="M118 150q-8-24 6-50" stroke="#fff" stroke-width="4" opacity=".6"/>
    <circle cx="176" cy="92" r="3"/><circle cx="182" cy="80" r="2"/><circle cx="178" cy="68" r="1.5"/></g>
    <g pointer-events="none" fill="${INK}"><circle cx="146" cy="108" r="2.2"/><circle cx="181" cy="143" r="1.8"/></g>`
},
{ id:'sunset', title:'Sunset sail', sub:'Warm shades, close together. Count every drop.', tier:'hard',
  regions:[
    {id:'sun',name:'Sun',recipe:{W:1,Y:4},svg:'<circle cx="160" cy="140" r="34"/>'},
    {id:'skyTop',name:'Upper sky',recipe:{W:3,C:1,M:2},svg:'<rect x="0" y="0" width="320" height="62"/>'},
    {id:'skyMid',name:'Middle sky',recipe:{W:3,M:2,Y:1},svg:'<rect x="0" y="62" width="320" height="46"/>'},
    {id:'skyLow',name:'Lower sky',recipe:{W:3,M:1,Y:2},svg:'<rect x="0" y="108" width="320" height="32"/>'},
    {id:'sea',name:'Sea',recipe:{C:2,M:2,K:1},svg:'<path d="M0 140H320V240H0Z"/>'},
    {id:'shine',name:'Sun on the water',recipe:{W:3,M:1,Y:3},svg:'<path d="M134 150H186L178 158H142Z"/><path d="M142 168H178L172 175H148Z"/><path d="M149 186H171L167 192H153Z"/>'},
    {id:'sail',name:'Sails',recipe:{W:4,M:1},svg:'<path d="M113 188V108L152 188Z"/><path d="M107 188V122L80 188Z"/>'},
    {id:'hull',name:'Boat',recipe:{C:1,M:1,K:2},svg:'<path d="M68 194H156L140 214H84Z"/>'},
  ],
  order:['skyTop','skyMid','skyLow','sun','sea','shine','sail','hull'],
  decor:`<g pointer-events="none" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round">
    <line x1="110" y1="102" x2="110" y2="194" stroke-width="3"/>
    <path d="M226 50q7-7 14 0q7-7 14 0"/><path d="M262 70q5-5 10 0q5-5 10 0"/>
    <path d="M24 170q10-5 20 0M232 180q10-5 20 0M270 216q10-5 20 0"/></g>`
},
{ id:'cake', title:'Birthday cake', sub:'Pastel colors need a lot of white.', tier:'normal',
  regions:[
    {id:'flames',name:'Flames',recipe:{M:1,Y:4},svg:'<path d="M128 78Q136 90 128 96Q120 90 128 78Z"/><path d="M160 72Q168 84 160 90Q152 84 160 72Z"/><path d="M192 78Q200 90 192 96Q184 90 192 78Z"/>'},
    {id:'candles',name:'Candles',recipe:{W:3,C:2},svg:'<rect x="124" y="98" width="8" height="28" rx="1"/><rect x="156" y="92" width="8" height="34" rx="1"/><rect x="188" y="98" width="8" height="28" rx="1"/>'},
    {id:'cherries',name:'Cherries',recipe:{M:3,Y:1,K:1},svg:'<circle cx="104" cy="118" r="7"/><circle cx="216" cy="118" r="7"/>'},
    {id:'frosting',name:'Frosting',recipe:{W:3,M:2},svg:drips(88,232,124,144,9)},
    {id:'sponge',name:'Sponge',recipe:{W:4,M:1,Y:4},svg:'<rect x="94" y="124" width="132" height="68"/>'},
    {id:'plate',name:'Plate',recipe:{W:4,K:1},svg:'<ellipse cx="160" cy="194" rx="96" ry="13"/>'},
    {id:'cloth',name:'Tablecloth',recipe:{W:2,C:1,Y:1},svg:'<path d="M0 178H320V240H0Z"/>'},
    {id:'wallp',name:'Wall',recipe:{W:4,C:1,M:1},svg:'<rect x="0" y="0" width="320" height="240"/>'},
  ],
  order:['wallp','cloth','plate','sponge','frosting','cherries','candles','flames'],
  decor:`<g pointer-events="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round">
    <path d="M128 98v-4M160 92v-4M192 98v-4"/>
    <path d="M110 168l6-3M134 176l5 3M158 164l6 2M182 174l5-3M206 166l6 2" stroke-width="2.5"/>
    <path d="M100 112q4-8 10-10M222 112q-4-8-10-10" fill="none"/>
    <path d="M0 0L40 26L80 0M80 0L120 26L160 0M160 0L200 26L240 0M240 0L280 26L320 0" fill="none"/></g>`
},
{ id:'fox', title:'Autumn fox', sub:'Reds, oranges and browns of autumn.', tier:'normal',
  regions:[
    {id:'chest',name:'White chest',recipe:{W:1},svg:'<path d="M108 146Q121 158 134 146Q134 176 121 196Q108 176 108 146Z"/><path d="M194 148Q199 158 196 168Q190 164 187 160Q192 156 194 148Z"/>'},
    {id:'fox',name:'Fox',recipe:{M:3,Y:5},svg:'<path d="M148 196Q200 196 194 148Q186 180 150 178Z"/><ellipse cx="121" cy="180" rx="30" ry="24"/><path d="M96 128L102 102L116 118H126L140 102L146 128Q148 148 121 154Q94 148 96 128Z"/>'},
    {id:'leaves',name:'Falling leaves',recipe:{W:1,M:1,Y:5},svg:leaf(200,60,7,4,30)+leaf(186,110,7,4,-20)+leaf(60,70,7,4,50)+leaf(300,150,7,4,10)+leaf(40,120,7,4,-40)},
    {id:'treetop',name:'Treetop',recipe:{M:3,Y:2},svg:'<circle cx="252" cy="78" r="34"/><circle cx="226" cy="96" r="22"/><circle cx="280" cy="98" r="22"/>'},
    {id:'trunk',name:'Tree trunk',recipe:{C:1,M:2,Y:2,K:2},svg:'<path d="M246 100H260V190H246Z"/>'},
    {id:'ground',name:'Ground',recipe:{M:1,Y:3,K:2},svg:'<path d="M0 192Q160 174 320 190V240H0Z"/>'},
    {id:'hills',name:'Hills',recipe:{W:2,C:1,Y:3},svg:'<path d="M0 150Q80 118 160 140T320 128V200H0Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:3,C:1,Y:1},svg:'<rect x="0" y="0" width="320" height="170"/>'},
  ],
  order:['sky','hills','ground','trunk','treetop','leaves','fox','chest'],
  decor:`<g pointer-events="none" fill="${INK}"><circle cx="112" cy="130" r="2.5"/><circle cx="130" cy="130" r="2.5"/><path d="M117 142h8l-4 4z"/></g>
    <g pointer-events="none" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"><path d="M104 108l6 8M138 108l-6 8"/><path d="M110 196v6M132 196v6"/></g>`
},
{ id:'lighthouse', title:'Lighthouse', sub:'Night colors are dark. A little black goes a long way.', tier:'hard',
  regions:[
    {id:'lamp',name:'Lamp',recipe:{W:1,M:1,Y:3},svg:'<rect x="160" y="64" width="20" height="18" rx="1"/>'},
    {id:'moon',name:'Moon',recipe:{W:3,Y:1},svg:'<circle cx="262" cy="44" r="18"/>'},
    {id:'beam',name:'Light beam',recipe:{W:2,Y:1},svg:'<path d="M160 68L0 22V88L160 78Z"/>'},
    {id:'stripes',name:'Red stripes',recipe:{M:2,Y:1,K:1},svg:'<path d="M155.6 110H184.4L185.6 124H154.4Z"/><path d="M152.7 142H187.3L188.5 156H151.5Z"/><path d="M154 64L170 50L186 64Z"/>'},
    {id:'tower',name:'Tower',recipe:{W:4,C:1,K:1},svg:'<path d="M150 172L158 84H182L190 172Z"/>'},
    {id:'rocks',name:'Rocks',recipe:{W:1,C:1,K:2},svg:'<path d="M108 204Q112 178 138 170H206Q232 176 238 204Z"/>'},
    {id:'sea',name:'Sea',recipe:{C:3,M:1,K:2},svg:'<path d="M0 162Q80 154 160 162T320 160V240H0Z"/>'},
    {id:'sky',name:'Night sky',recipe:{C:2,M:1,K:3},svg:'<rect x="0" y="0" width="320" height="170"/>'},
  ],
  order:['sky','beam','moon','sea','rocks','tower','stripes','lamp'],
  decor:`<g pointer-events="none" fill="#fff"><circle cx="40" cy="120" r="1.5"/><circle cx="90" cy="130" r="1.2"/><circle cx="220" cy="100" r="1.5"/><circle cx="300" cy="120" r="1.2"/><circle cx="210" cy="30" r="1.2"/><circle cx="296" cy="84" r="1.5"/></g>
    <g pointer-events="none" fill="none" stroke="${INK}" stroke-width="1.5"><line x1="156" y1="84" x2="184" y2="84" stroke-width="3"/><path d="M170 64V82"/></g>
    <g pointer-events="none" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".6"><path d="M30 190q10-4 20 0M250 200q10-4 20 0M60 222q10-4 20 0"/></g>`
},
{ id:'parrot', title:'Jungle parrot', sub:'Greens that look almost the same. Take your time.', tier:'nightmare',
  regions:[
    {id:'face',name:'Face',recipe:{W:1},svg:'<ellipse cx="160" cy="76" rx="8" ry="7"/>'},
    {id:'beak',name:'Beak',recipe:{W:3,K:2},svg:'<path d="M152 70Q134 72 138 94Q144 84 153 84Z"/>'},
    {id:'band',name:'Yellow feathers',recipe:{M:1,Y:5},svg:'<path d="M176 94Q196 100 198 118Q186 112 174 108Z"/>'},
    {id:'wing',name:'Wing',recipe:{C:3,M:2},svg:'<path d="M174 108Q200 114 198 118Q204 136 194 162Q180 150 170 128Z"/>'},
    {id:'body',name:'Parrot',recipe:{M:4,Y:3},svg:'<path d="M150 100Q140 58 170 56Q196 58 192 96Q196 140 178 170H160Q146 140 150 100Z"/>'},
    {id:'tail',name:'Tail',recipe:{C:4,Y:3},svg:'<path d="M162 168L156 228H168L180 168Z"/>'},
    {id:'branch',name:'Branch',recipe:{C:1,M:1,Y:2,K:1},svg:'<path d="M20 176Q160 158 304 168V180Q160 172 20 190Z"/>'},
    {id:'leaves1',name:'Dark leaves',recipe:{C:3,Y:5,K:1},svg:leaf(40,50,46,15,30)+leaf(70,16,40,13,-10)+leaf(290,210,40,14,-30)},
    {id:'leaves2',name:'Bright leaves',recipe:{C:3,Y:7},svg:leaf(270,40,44,14,-35)+leaf(30,210,40,13,25)+leaf(250,120,34,11,15)},
    {id:'leaves3',name:'Green leaves',recipe:{C:3,Y:4},svg:leaf(60,110,38,12,-25)+leaf(300,80,34,11,40)+leaf(100,220,34,11,-15)},
    {id:'bg',name:'Jungle',recipe:{W:4,C:1,Y:2},svg:'<rect x="0" y="0" width="320" height="240"/>'},
  ],
  order:['bg','leaves3','leaves2','leaves1','branch','tail','body','wing','band','beak','face'],
  decor:`<g pointer-events="none"><circle cx="162" cy="75" r="2.5" fill="${INK}"/>
    <path d="M160 170l-4 10M170 170l2 10M176 170l4 10" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/></g>`
},
{ id:'snowman', title:'Snowman', sub:'Winter whites are never quite white.', tier:'normal',
  regions:[
    {id:'body',name:'Snowman',recipe:{W:1},svg:'<circle cx="160" cy="184" r="38"/><circle cx="160" cy="124" r="28"/><circle cx="160" cy="78" r="20"/>'},
    {id:'hat',name:'Hat',recipe:{K:1},svg:'<rect x="146" y="30" width="28" height="26" rx="2"/><rect x="136" y="54" width="48" height="6" rx="2"/>'},
    {id:'nose',name:'Carrot nose',recipe:{M:2,Y:5},svg:'<path d="M160 78L184 82L160 86Z"/>'},
    {id:'scarf',name:'Scarf',recipe:{M:2,Y:1},svg:'<path d="M138 94Q160 104 182 94V104Q160 114 138 104Z"/><path d="M166 104L172 134H182L176 102Z"/>'},
    {id:'buttons',name:'Buttons',recipe:{C:1,M:1,Y:1,K:1},svg:'<circle cx="160" cy="118" r="3.5"/><circle cx="160" cy="132" r="3.5"/><circle cx="160" cy="146" r="3.5"/>'},
    {id:'pines',name:'Pine trees',recipe:{C:2,Y:1,K:2},svg:'<path d="M20 172L46 90L72 172Z"/><path d="M60 178L80 120L100 178Z"/><path d="M250 172L276 100L302 172Z"/>'},
    {id:'ground',name:'Snow',recipe:{W:5,C:1},svg:'<path d="M0 176Q160 156 320 176V240H0Z"/>'},
    {id:'sky',name:'Winter sky',recipe:{W:3,C:2,M:1},svg:'<rect x="0" y="0" width="320" height="180"/>'},
  ],
  order:['sky','pines','ground','body','buttons','scarf','nose','hat'],
  decor:`<g pointer-events="none" fill="${INK}"><circle cx="153" cy="72" r="2.5"/><circle cx="167" cy="72" r="2.5"/></g>
    <g pointer-events="none" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"><path d="M134 118L104 100M104 100l-6-8M104 100l-10 0M186 118L216 98M216 98l4-9M216 98l9 2"/></g>
    <g pointer-events="none" fill="#fff" stroke="${INK}" stroke-width="1"><circle cx="110" cy="40" r="3"/><circle cx="220" cy="30" r="3"/><circle cx="240" cy="70" r="2.5"/><circle cx="90" cy="70" r="2.5"/><circle cx="300" cy="40" r="3"/><circle cx="30" cy="40" r="2.5"/></g>`
},
{ id:'desert', title:'Desert', sub:'Sand, sand and more sand, in close shades.', tier:'hard',
  regions:[
    {id:'flowers',name:'Cactus flowers',recipe:{W:1,M:3},svg:'<circle cx="208" cy="98" r="5"/><circle cx="180" cy="120" r="4"/><circle cx="236" cy="108" r="4"/>'},
    {id:'cactus',name:'Cactus',recipe:{C:2,Y:3,K:1},svg:'<path d="M196 200V110a12 12 0 0 1 24 0V200Z"/><path d="M196 162H184Q174 162 174 152V128Q174 122 180 122Q186 122 186 128V150H196Z"/><path d="M220 146H230V116Q230 110 236 110Q242 110 242 116V146Q242 158 230 158H220Z"/>'},
    {id:'sun',name:'Sun',recipe:{W:1,Y:3},svg:'<circle cx="256" cy="46" r="22"/>'},
    {id:'stones',name:'Stones',recipe:{W:2,M:1,Y:1,K:1},svg:'<ellipse cx="100" cy="212" rx="14" ry="7"/><ellipse cx="122" cy="218" rx="9" ry="5"/><ellipse cx="272" cy="214" rx="12" ry="6"/>'},
    {id:'mesa',name:'Rock',recipe:{M:3,Y:3,K:1},svg:'<path d="M14 150L34 96H104L124 150Z"/>'},
    {id:'far',name:'Far dunes',recipe:{W:2,M:1,Y:4},svg:'<path d="M0 150Q80 124 160 142T320 132V240H0Z"/>'},
    {id:'near',name:'Near dunes',recipe:{W:2,M:2,Y:5},svg:'<path d="M0 196Q120 164 320 190V240H0Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:4,C:1,Y:1},svg:'<rect x="0" y="0" width="320" height="160"/>'},
  ],
  order:['sky','sun','mesa','far','near','stones','cactus','flowers'],
  decor:`<g pointer-events="none" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"><path d="M208 118v70M202 124v4M214 140v4M202 160v4M214 176v4"/><path d="M50 60q7-7 14 0q7-7 14 0"/><path d="M40 176q20-8 40-2M240 208q20-6 40 0"/></g>`
},
{ id:'rocket', title:'Rocket', sub:'Off to the stars.', tier:'normal',
  regions:[
    {id:'body',name:'Rocket',recipe:{W:1},svg:'<path d="M102 176V100Q102 70 120 52Q138 70 138 100V176Z"/>'},
    {id:'nose',name:'Nose cone',recipe:{M:4,Y:1},svg:'<path d="M106 84Q110 66 120 52Q130 66 134 84Z"/>'},
    {id:'window',name:'Window',recipe:{W:1,C:2},svg:'<circle cx="120" cy="120" r="11"/>'},
    {id:'fins',name:'Fins',recipe:{C:1,M:3},svg:'<path d="M102 146L84 186L102 176Z"/><path d="M138 146L156 186L138 176Z"/>'},
    {id:'flame',name:'Flame',recipe:{W:1,M:2,Y:3},svg:'<path d="M108 176Q120 224 132 176Z"/>'},
    {id:'moon',name:'Moon',recipe:{W:3,K:1},svg:'<circle cx="58" cy="52" r="16"/>'},
    {id:'ring',name:'Planet ring',recipe:{W:1,M:1,Y:2},svg:'<path fill-rule="evenodd" transform="rotate(-15 250 176)" d="M180 176a70 13 0 1 0 140 0a70 13 0 1 0-140 0ZM192 176a58 8 0 1 0 116 0a58 8 0 1 0-116 0Z"/>'},
    {id:'planet',name:'Planet',recipe:{W:2,C:1,M:3},svg:'<circle cx="250" cy="176" r="44"/>'},
    {id:'space',name:'Space',recipe:{C:1,M:1,K:3},svg:'<rect x="0" y="0" width="320" height="240"/>'},
  ],
  order:['space','moon','planet','ring','flame','fins','body','nose','window'],
  decor:`<g pointer-events="none" fill="#fff"><circle cx="30" cy="120" r="1.5"/><circle cx="180" cy="30" r="1.5"/><circle cx="220" cy="90" r="1.2"/><circle cx="300" cy="40" r="1.5"/><circle cx="40" cy="200" r="1.2"/><circle cx="170" cy="210" r="1.5"/><circle cx="290" cy="110" r="1.2"/></g>
    <g pointer-events="none" fill="none" stroke="${INK}" stroke-width="1.5"><circle cx="120" cy="120" r="14"/><path d="M52 46a4 4 0 1 0 1 0M64 58a3 3 0 1 0 1 0"/></g>`
},
{ id:'icecream', title:'Ice cream', sub:'Three scoops of pastel.', tier:'normal',
  regions:[
    {id:'cherry',name:'Cherry',recipe:{M:3,Y:1},svg:'<circle cx="162" cy="50" r="7"/>'},
    {id:'scoop3',name:'Vanilla',recipe:{W:3,Y:1},svg:'<circle cx="180" cy="76" r="22"/>'},
    {id:'scoop2',name:'Mint',recipe:{W:3,C:1,Y:2},svg:'<circle cx="142" cy="80" r="22"/>'},
    {id:'scoop1',name:'Strawberry',recipe:{W:2,M:1},svg:'<circle cx="160" cy="112" r="30"/>'},
    {id:'cone',name:'Cone',recipe:{M:1,Y:3,K:1},svg:'<path d="M132 116L160 214L188 116Z"/>'},
    {id:'table',name:'Counter',recipe:{W:2,C:1,M:1},svg:'<path d="M0 196H320V240H0Z"/>'},
    {id:'wallp',name:'Wall',recipe:{W:4,M:1},svg:'<rect x="0" y="0" width="320" height="240"/>'},
  ],
  order:['wallp','table','cone','scoop1','scoop2','scoop3','cherry'],
  decor:`<g pointer-events="none" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"><path d="M142 146L166 190M160 146L172 168M178 146L154 190M160 146L148 168"/><path d="M162 43q2-8 8-12"/></g>
    <g pointer-events="none" stroke-width="2.5" stroke-linecap="round"><path d="M148 104l5 2M166 96l4-3M170 118l5 1M150 124l3 3" stroke="${INK}"/></g>`
},
{ id:'rain', title:'Rainy street', sub:'Grays with a hint of color. Look closely.', tier:'hard',
  regions:[
    {id:'umbrella',name:'Umbrella',recipe:{M:4,Y:2,K:1},svg:'<path d="M116 146A44 30 0 0 1 204 146Q193 140 182 146Q171 140 160 146Q149 140 138 146Q127 140 116 146Z"/>'},
    {id:'coat',name:'Coat',recipe:{M:1,Y:2,K:2},svg:'<path d="M150 150L142 204H178L170 150Z"/>'},
    {id:'windows',name:'Lit windows',recipe:{W:2,Y:3},svg:rects([30,64],[76,106,136],18,18)+rects([222,258],[52,82,112,142],18,18)},
    {id:'bldgL',name:'Left house',recipe:{W:3,C:1,K:2},svg:'<rect x="16" y="60" width="96" height="120"/>'},
    {id:'bldgR',name:'Right house',recipe:{W:3,M:1,K:2},svg:'<rect x="208" y="36" width="96" height="144"/>'},
    {id:'puddle',name:'Puddle',recipe:{W:1,C:1,K:2},svg:'<ellipse cx="236" cy="214" rx="40" ry="7"/>'},
    {id:'street',name:'Street',recipe:{C:1,K:3},svg:'<path d="M0 178H320V240H0Z"/>'},
    {id:'sky',name:'Rainy sky',recipe:{W:3,C:1,K:1},svg:'<rect x="0" y="0" width="320" height="180"/>'},
  ],
  order:['sky','bldgL','bldgR','windows','street','puddle','coat','umbrella'],
  decor:`<g pointer-events="none" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"><path d="M160 116V172q0 6-6 6"/><path d="M152 204v10M168 204v10"/></g>
    <g pointer-events="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"><path d="M20 20l-4 10M60 40l-4 10M100 16l-4 10M140 36l-4 10M190 20l-4 10M240 14l-4 10M290 24l-4 10M40 150l-4 10M126 176l-4 10M200 110l-4 10M300 186l-4 10M80 196l-4 10M190 196l-4 10"/></g>`
},
{ id:'peacock', title:'Peacock', sub:'Blues and greens that shimmer into each other.', tier:'nightmare',
  regions:[
    {id:'beak',name:'Beak',recipe:{W:2,Y:3,K:1},svg:'<path d="M144 66L132 70L144 73Z"/>'},
    {id:'body',name:'Peacock',recipe:{C:3,M:1},svg:'<circle cx="152" cy="68" r="10"/><path d="M146 72Q160 72 162 90Q162 116 178 150Q182 190 160 198Q138 190 142 150Q150 116 146 72Z"/>'},
    {id:'wing',name:'Wing',recipe:{C:3,M:1,K:1},svg:'<path d="M160 132Q184 150 176 188Q160 178 156 152Z"/>'},
    {id:'spots',name:'Feather eyes',recipe:{M:1,Y:4,K:1},svg:fanDots(160,170,120,9,-166,-14,8)},
    {id:'centers',name:'Eye centers',recipe:{C:3,M:2,K:2},svg:fanDots(160,170,120,4.5,-166,-14,8)},
    {id:'tailOuter',name:'Outer feathers',recipe:{C:2,Y:2,K:1},svg:fan(160,170,106,17,36,-166,-14,8)},
    {id:'tailMid',name:'Middle feathers',recipe:{C:3,Y:1,K:1},svg:fan(160,170,72,15,28,-150,-30,7)},
    {id:'tailInner',name:'Inner feathers',recipe:{C:4,M:1,Y:1},svg:fan(160,170,42,12,20,-160,-20,6)},
    {id:'grass',name:'Grass',recipe:{C:1,Y:2,K:1},svg:'<path d="M0 196Q160 184 320 196V240H0Z"/>'},
    {id:'bg',name:'Garden',recipe:{W:4,C:1,Y:1},svg:'<rect x="0" y="0" width="320" height="240"/>'},
  ],
  order:['bg','grass','tailOuter','spots','centers','tailMid','tailInner','body','wing','beak'],
  decor:`<g pointer-events="none"><circle cx="150" cy="66" r="2" fill="${INK}"/>
    <g fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"><path d="M150 58l-4-12M154 58l0-13M158 59l4-12"/><path d="M152 198l-2 14M166 198l2 14"/></g>
    <g fill="${INK}"><circle cx="146" cy="45" r="2"/><circle cx="154" cy="44" r="2"/><circle cx="162" cy="46" r="2"/></g></g>`
},
{ id:'balloonride', title:'Hot-air balloons', sub:'', tier:'normal',
  regions:[
    {id:'gore',name:'Balloon center',recipe:{C:2,M:1},svg:'<path d="M150 28C140 44 138 72 140 96C142 122 148 146 149 160H151C152 146 158 122 160 96C162 72 160 44 150 28Z"/>'},
    {id:'stripes',name:'Yellow stripes',recipe:{Y:1},svg:'<path d="M150 28C124 40 118 70 122 96C126 124 140 146 144 160H156C160 146 174 124 178 96C182 70 176 40 150 28Z"/>'},
    {id:'envelope',name:'Big balloon',recipe:{M:1,Y:1},svg:'<path d="M138 160C118 136 92 118 92 86A58 58 0 0 1 208 86C208 118 182 136 162 160Z"/>'},
    {id:'small',name:'Small balloon',recipe:{W:1,M:2,Y:4},svg:'<path d="M257 94C250 86 242 80 242 68A20 20 0 0 1 282 68C282 80 274 86 267 94Z"/>'},
    {id:'far',name:'Far balloon',recipe:{W:1,C:2,M:3},svg:'<path d="M48 141C43 136 38 131 38 124A14 14 0 0 1 66 124C66 131 61 136 56 141Z"/>'},
    {id:'basket',name:'Basket',recipe:{W:1,M:1,Y:2,K:3},svg:'<path d="M138 178H162L159 198H141Z"/>'},
    {id:'clouds',name:'Clouds',recipe:{W:1},svg:'<path d="M36 62a12 12 0 0 1 10-18a16 16 0 0 1 30-4a12 12 0 0 1 16 22Z"/><path d="M226 144a10 10 0 0 1 8-14a13 13 0 0 1 24-4a10 10 0 0 1 14 18Z"/>'},
    {id:'hills',name:'Hills',recipe:{W:1,C:2,Y:3},svg:'<path d="M0 200Q60 176 130 194T260 188T320 192V240H0Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:3,C:1},svg:'<rect width="320" height="240"/>'},
  ],
  order:['sky','clouds','hills','far','small','envelope','stripes','gore','basket'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" pointer-events="none"><path d="M141 160L141 178M159 160L159 178M139 160H161"/><path d="M258 94L259 100M266 94L265 100"/><path d="M49 141L50 145M55 141L54 145"/><path d="M142 186H158"/></g><g fill="${INK}" pointer-events="none"><rect x="258" y="100" width="8" height="6" rx="1"/><rect x="49" y="145" width="6" height="4" rx="1"/></g>`
},
{ id:'teaparty', title:'Tea party', sub:'', tier:'normal', paints:['W','C','M'],
  tip:{title:'Three paints only',text:'No yellow and no black today. Cyan and magenta make every blue and purple here, and white softens them.'},
  regions:[
    {id:'flowers',name:'Flowers',recipe:{M:1},svg:petals(292,112)+petals(306,122)},
    {id:'cups',name:'Cups',recipe:{W:3,C:3,M:1},svg:'<path d="M58 124H96L92 150Q77 158 62 150Z"/><path d="M96 130Q108 130 106 140Q104 148 94 146L95 142Q101 142 101 139Q101 134 96 134Z"/><path d="M224 124H262L258 150Q243 158 228 150Z"/><path d="M262 130Q274 130 272 140Q270 148 260 146L261 142Q267 142 267 139Q267 134 262 134Z"/>'},
    {id:'teapot',name:'Teapot',recipe:{W:1,C:3,M:4},svg:'<path d="M196 120Q214 118 222 100L229 104Q224 130 200 140Z"/><path d="M124 110Q100 110 102 130Q104 150 126 146L126 137Q111 139 111 130Q111 119 124 120Z"/><ellipse cx="160" cy="128" rx="40" ry="32"/>'},
    {id:'lid',name:'Lid',recipe:{W:1,C:3,M:3},svg:'<path d="M138 100Q160 84 182 100Z"/><circle cx="160" cy="88" r="5"/>'},
    {id:'vase',name:'Vase',recipe:{C:1},svg:'<path d="M288 160Q282 142 290 130H302Q310 142 304 160Z"/>'},
    {id:'saucers',name:'Saucers',recipe:{W:5,C:1,M:2},svg:'<ellipse cx="77" cy="155" rx="30" ry="7"/><ellipse cx="243" cy="155" rx="30" ry="7"/>'},
    {id:'window',name:'Window',recipe:{W:3,C:1},svg:'<rect x="30" y="22" width="84" height="72" rx="6"/>'},
    {id:'cloth',name:'Tablecloth',recipe:{W:2,M:1},svg:'<path d="M0 150H320V240H0Z"/>'},
    {id:'wall',name:'Wall',recipe:{W:1},svg:'<rect width="320" height="152"/>'},
  ],
  order:['wall','window','cloth','saucers','cups','teapot','lid','vase','flowers'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" pointer-events="none"><path d="M72 22V94M30 58H114"/><path d="M292 130L292 116M300 130L302 122"/><path d="M0 176Q20 184 40 176T80 176T120 176T160 176T200 176T240 176T280 176T320 176"/></g>`
},
{ id:'reef', title:'Coral reef', sub:'', tier:'hard',
  regions:[
    {id:'fish',name:'Fish',recipe:{W:1,M:2,Y:5},svg:'<path d="M100 80Q116 64 136 80Q116 96 100 80Z"/><path d="M101 80L88 70V90Z"/><path d="M240 58Q224 42 204 58Q224 74 240 58Z"/><path d="M239 58L252 48V68Z"/>'},
    {id:'fan',name:'Fan coral',recipe:{M:1,Y:2},svg:'<path d="M210 198L172 150A48 48 0 0 1 248 150Z"/>'},
    {id:'branch',name:'Branch coral',recipe:{W:3,M:3,Y:1},stroke:6,svg:'<path d="M58 184V142M58 162L42 138M58 150L74 124M42 138V120M74 124L82 108"/>'},
    {id:'anemone',name:'Anemone',recipe:{W:1,M:2},svg:petals(262,178)+petals(280,184)},
    {id:'brain',name:'Brain coral',recipe:{W:4,M:3,Y:2},svg:'<path d="M96 206Q98 170 134 168Q170 170 172 206Z"/>'},
    {id:'weed',name:'Seaweed',recipe:{C:3,Y:4,K:2},stroke:5,svg:'<path d="M26 206Q18 186 28 170T26 132"/><path d="M302 204Q310 184 300 168T304 132"/><path d="M186 206Q180 192 188 180"/>'},
    {id:'rocks',name:'Rocks',recipe:{W:3,C:1,M:1,K:2},svg:'<path d="M20 212Q24 182 52 184Q78 186 82 212Z"/><path d="M236 208Q244 184 268 186Q292 190 294 208Z"/>'},
    {id:'sand',name:'Sand',recipe:{W:3,Y:1,K:1},svg:'<path d="M0 204Q80 192 160 202T320 198V240H0Z"/>'},
    {id:'water',name:'Water',recipe:{C:3,K:1},svg:'<rect width="320" height="240"/>'},
  ],
  order:['water','sand','weed','rocks','brain','fan','branch','anemone','fish'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" pointer-events="none"><path d="M108 196Q116 186 126 194T146 188T162 196"/><path d="M114 184Q124 178 134 184T154 182"/><path d="M210 198L188 158M210 198L210 150M210 198L232 158"/></g><g fill="${INK}" pointer-events="none"><circle cx="128" cy="78" r="2"/><circle cx="212" cy="56" r="2"/></g><g fill="none" stroke="#fff" stroke-width="1.5" opacity=".8" pointer-events="none"><circle cx="146" cy="60" r="4"/><circle cx="152" cy="44" r="3"/><circle cx="196" cy="40" r="3.5"/><circle cx="190" cy="24" r="2.5"/></g>`
},
{ id:'veggies', title:'Vegetable garden', sub:'', tier:'normal',
  regions:[
    {id:'sun',name:'Sun',recipe:{W:1,Y:1},svg:'<circle cx="276" cy="42" r="22"/>'},
    {id:'tomatoes',name:'Tomatoes',recipe:{M:2,Y:2,K:1},svg:'<circle cx="252" cy="130" r="9"/><circle cx="286" cy="118" r="9"/><circle cx="270" cy="152" r="9"/><circle cx="296" cy="146" r="8"/>'},
    {id:'carrots',name:'Carrots',recipe:{W:1,M:3,Y:5},svg:'<path d="M34 170H50L42 206Z"/><path d="M72 170H88L80 210Z"/><path d="M110 170H126L118 204Z"/>'},
    {id:'tops',name:'Carrot tops',recipe:{C:3,Y:4},svg:leaf(37,160,3.5,11,-25)+leaf(47,160,3.5,11,25)+leaf(42,157,3.5,12,0)+leaf(75,160,3.5,11,-25)+leaf(85,160,3.5,11,25)+leaf(80,157,3.5,12,0)+leaf(113,160,3.5,11,-25)+leaf(123,160,3.5,11,25)+leaf(118,157,3.5,12,0)},
    {id:'cabbage',name:'Cabbages',recipe:{W:1,C:1,Y:2},svg:'<circle cx="168" cy="176" r="18"/><circle cx="214" cy="180" r="16"/>'},
    {id:'tleaves',name:'Tomato leaves',recipe:{C:3,M:1,Y:3},svg:'<ellipse cx="262" cy="118" rx="16" ry="9" transform="rotate(-20 262 118)"/><ellipse cx="282" cy="138" rx="16" ry="9" transform="rotate(20 282 138)"/><ellipse cx="258" cy="148" rx="14" ry="8" transform="rotate(-10 258 148)"/><ellipse cx="292" cy="104" rx="12" ry="7" transform="rotate(-30 292 104)"/>'},
    {id:'fence',name:'Fence',recipe:{W:1},svg:rects([6,28,50,72,94,116,138,160,182,204,226,248,270,292],[112],14,58)+'<rect x="0" y="130" width="320" height="8"/>'},
    {id:'soil',name:'Soil',recipe:{C:1,M:1,Y:1},svg:'<path d="M0 168H320V240H0Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:3,C:1},svg:'<rect width="320" height="170"/>'},
  ],
  order:['sky','sun','fence','soil','carrots','tops','cabbage','tleaves','tomatoes'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" pointer-events="none"><path d="M274 176V92"/><path d="M0 196Q80 190 160 196T320 196M0 220Q80 214 160 220T320 220" stroke-width="1.2" opacity=".5"/><path d="M168 190V166M168 178L159 170M168 178L177 170M214 192V170M214 181L206 174M214 181L222 174" stroke-width="1.2"/></g>`
},
{ id:'nightcity', title:'City at night', sub:'', tier:'hard',
  regions:[
    {id:'moon',name:'Moon',recipe:{W:4,Y:1},svg:'<circle cx="262" cy="42" r="18"/>'},
    {id:'windows',name:'Lit windows',recipe:{W:2,M:1,Y:5},svg:rects([28,44],[154,170],8,8)+rects([96,110,124],[144,160,176],8,8)+rects([188,206],[158,174],8,8)+rects([258,272,286],[148,164,180],8,8)+rects([154],[84,100,116,132,148,164],8,8)},
    {id:'reflect',name:'Reflections',recipe:{W:2,M:1,Y:4,K:2},stroke:3,svg:'<path d="M30 208h14M102 214h18M192 210h14M262 216h18M150 226h16M60 228h10"/>'},
    {id:'tower',name:'Tower',recipe:{C:2,M:1,Y:1,K:1},svg:'<path d="M146 196V72H170V196Z"/><path d="M150 72L158 38L166 72Z"/>'},
    {id:'near',name:'Near buildings',recipe:{C:1,K:2},svg:'<path d="M20 196V146H60V196Z"/><path d="M88 196V136H136V196Z"/><path d="M180 196V150H222V196Z"/><path d="M250 196V140H300V196Z"/>'},
    {id:'far',name:'Far buildings',recipe:{C:2,M:2,Y:1},svg:'<path d="M0 196V120H26V100H48V130H70V90H96V118H118V196Z"/><path d="M200 196V110H224V84H246V122H270V100H296V130H320V196Z"/>'},
    {id:'river',name:'River',recipe:{C:2,M:1,K:2},svg:'<path d="M0 196H320V240H0Z"/>'},
    {id:'sky',name:'Night sky',recipe:{C:1,M:1,K:3},svg:'<rect width="320" height="200"/>'},
  ],
  order:['sky','moon','far','near','tower','windows','river','reflect'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" pointer-events="none"><path d="M158 38V24"/></g><g fill="#fff" pointer-events="none"><circle cx="30" cy="30" r="1.5"/><circle cx="80" cy="54" r="1.2"/><circle cx="118" cy="22" r="1.5"/><circle cx="200" cy="36" r="1.2"/><circle cx="226" cy="64" r="1.5"/><circle cx="300" cy="80" r="1.2"/><circle cx="56" cy="80" r="1.2"/></g>`
},
{ id:'bakery', title:'Bakery window', sub:'', tier:'normal',
  regions:[
    {id:'frosting',name:'Frosting',recipe:{W:1,M:1},svg:'<path d="M230 133Q232 112 246 112Q260 112 262 133Z"/><path d="M266 133Q268 112 282 112Q296 112 298 133Z"/>'},
    {id:'cases',name:'Cupcake cases',recipe:{W:1,C:1},svg:'<path d="M236 150L232 132H260L256 150Z"/><path d="M272 150L268 132H296L292 150Z"/>'},
    {id:'croissants',name:'Croissants',recipe:{W:1,M:1,Y:3,K:1},svg:'<path d="M128 149Q148 116 168 149Q158 140 148 143Q138 140 128 149Z"/><path d="M172 149Q192 116 212 149Q202 140 192 143Q182 140 172 149Z"/>'},
    {id:'loaf',name:'Loaf',recipe:{C:1,M:2,Y:3},svg:'<ellipse cx="70" cy="134" rx="34" ry="17"/>'},
    {id:'baguettes',name:'Baguettes',recipe:{W:3,M:1,Y:3,K:1},svg:'<ellipse cx="96" cy="198" rx="64" ry="8" transform="rotate(-6 96 198)"/><ellipse cx="100" cy="186" rx="58" ry="7" transform="rotate(-12 100 186)"/>'},
    {id:'pie',name:'Pie',recipe:{W:1,M:1,Y:2,K:1},svg:'<path d="M186 208Q188 188 232 186Q276 188 278 208Z"/>'},
    {id:'shelf',name:'Shelf',recipe:{M:1,Y:2,K:5},svg:'<rect x="16" y="150" width="288" height="8"/>'},
    {id:'awning',name:'Awning',recipe:{W:1,M:2,Y:2},svg:'<path d="M0 0H320V34Q310 46 300 34Q290 46 280 34Q270 46 260 34Q250 46 240 34Q230 46 220 34Q210 46 200 34Q190 46 180 34Q170 46 160 34Q150 46 140 34Q130 46 120 34Q110 46 100 34Q90 46 80 34Q70 46 60 34Q50 46 40 34Q30 46 20 34Q10 46 0 34Z"/>'},
    {id:'window',name:'Window',recipe:{W:1},svg:'<rect x="16" y="52" width="288" height="160"/>'},
    {id:'wall',name:'Wall',recipe:{W:3,C:1,M:1,Y:1},svg:'<rect width="320" height="240"/>'},
  ],
  order:['wall','window','shelf','loaf','croissants','cases','frosting','baguettes','pie','awning'],
  decor:`<g fill="#fff" opacity=".85" pointer-events="none"><rect x="10" y="0" width="20" height="34"/><rect x="50" y="0" width="20" height="34"/><rect x="90" y="0" width="20" height="34"/><rect x="130" y="0" width="20" height="34"/><rect x="170" y="0" width="20" height="34"/><rect x="210" y="0" width="20" height="34"/><rect x="250" y="0" width="20" height="34"/><rect x="290" y="0" width="20" height="34"/></g><g fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" pointer-events="none"><path d="M54 128l8-9M68 130l8-9M82 128l8-9"/><path d="M60 192l6-5M84 190l6-5M108 188l6-5M132 186l6-5"/><path d="M200 200L214 190M222 204L240 188M246 204L262 190M204 192L262 204" stroke-width="1.2"/><path d="M240 150L238 134M248 150V134M256 150L258 134M276 150L274 134M284 150V134M292 150L294 134" stroke-width="1"/><path d="M0 34H320" stroke-width="1.6"/></g><g fill="#e0352b" pointer-events="none"><circle cx="246" cy="110" r="3.5"/><circle cx="282" cy="110" r="3.5"/></g>`
},
{ id:'tropical', title:'Tropical fish', sub:'', tier:'normal',
  regions:[
    {id:'starfish',name:'Starfish',recipe:{W:1,M:3,Y:4},svg:'<path d="M240 192L244.1 202.3L255.2 203.1L246.7 210.2L249.4 220.9L240 215L230.6 220.9L233.3 210.2L224.8 203.1L235.9 202.3Z"/>'},
    {id:'shell',name:'Shell',recipe:{W:4,M:2,Y:1},svg:'<path d="M60 216L40 198A24 24 0 0 1 80 198Z"/>'},
    {id:'tang',name:'Small fish',recipe:{C:4,M:3},svg:'<path d="M214 70Q236 50 262 70Q236 90 214 70Z"/><path d="M261 70L280 58V82Z"/>'},
    {id:'stripes',name:'Stripes',recipe:{C:1,M:1,K:3},stroke:5,svg:'<path d="M106 84Q100 110 106 136"/><path d="M130 76Q124 110 130 144"/><path d="M154 86Q150 110 154 134"/>'},
    {id:'fish',name:'Big fish',recipe:{Y:1},svg:'<path d="M80 110Q120 60 172 110Q120 160 80 110Z"/>'},
    {id:'fins',name:'Fins',recipe:{M:1,Y:3},svg:'<path d="M171 110L200 86V134Z"/><path d="M104 90Q118 52 152 80Q128 76 104 90Z"/><path d="M104 130Q118 168 152 140Q128 144 104 130Z"/>'},
    {id:'weed',name:'Seaweed',recipe:{C:1,Y:1},stroke:5,svg:'<path d="M292 210Q284 190 294 174T290 136"/><path d="M20 208Q28 190 18 174T22 142"/><path d="M190 212Q184 196 192 184"/>'},
    {id:'sand',name:'Sand',recipe:{W:2,Y:1,K:1},svg:'<path d="M0 206Q80 196 160 204T320 200V240H0Z"/>'},
    {id:'water',name:'Water',recipe:{W:1,C:2,K:1},svg:'<rect width="320" height="240"/>'},
  ],
  order:['water','sand','weed','shell','starfish','fins','fish','stripes','tang'],
  decor:`<g fill="${INK}" pointer-events="none"><circle cx="92" cy="106" r="3"/><circle cx="224" cy="67" r="2"/></g><g fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round" pointer-events="none"><path d="M60 216L50 200M60 216L60 196M60 216L70 200"/></g><g fill="none" stroke="#fff" stroke-width="1.5" opacity=".8" pointer-events="none"><circle cx="70" cy="90" r="4"/><circle cx="62" cy="72" r="3"/><circle cx="68" cy="56" r="2.5"/><circle cx="276" cy="40" r="3"/></g>`
},
{ id:'blossoms', title:'Cherry blossoms', sub:'', tier:'hard',
  regions:[
    {id:'pale',name:'Pale blossoms',recipe:{W:3,M:1},svg:'<circle cx="28" cy="60" r="10"/><circle cx="17" cy="64" r="8"/><circle cx="39" cy="63" r="8"/><circle cx="23" cy="51" r="8"/><circle cx="35" cy="51" r="7"/><circle cx="28" cy="69" r="7"/><circle cx="282" cy="94" r="10"/><circle cx="271" cy="98" r="8"/><circle cx="293" cy="97" r="8"/><circle cx="277" cy="85" r="8"/><circle cx="289" cy="85" r="7"/><circle cx="282" cy="103" r="7"/><circle cx="204" cy="34" r="9"/><circle cx="194.1" cy="37.6" r="7.2"/><circle cx="213.9" cy="36.7" r="7.2"/><circle cx="199.5" cy="25.9" r="7.2"/><circle cx="210.3" cy="25.9" r="6.3"/><circle cx="204" cy="42.1" r="6.3"/><circle cx="80" cy="36" r="9"/><circle cx="70.1" cy="39.6" r="7.2"/><circle cx="89.9" cy="38.7" r="7.2"/><circle cx="75.5" cy="27.9" r="7.2"/><circle cx="86.3" cy="27.9" r="6.3"/><circle cx="80" cy="44.1" r="6.3"/><ellipse cx="40" cy="150" rx="4" ry="2.5" transform="rotate(-30 40 150)"/><ellipse cx="70" cy="176" rx="4" ry="2.5" transform="rotate(20 70 176)"/><ellipse cx="250" cy="140" rx="4" ry="2.5" transform="rotate(40 250 140)"/><ellipse cx="276" cy="172" rx="4" ry="2.5" transform="rotate(-20 276 172)"/><ellipse cx="210" cy="190" rx="4" ry="2.5" transform="rotate(30 210 190)"/><ellipse cx="110" cy="200" rx="4" ry="2.5" transform="rotate(-40 110 200)"/><ellipse cx="300" cy="128" rx="4" ry="2.5" transform="rotate(10 300 128)"/>'},
    {id:'pink',name:'Pink blossoms',recipe:{W:5,M:2,Y:1},svg:'<circle cx="60" cy="92" r="11"/><circle cx="47.9" cy="96.4" r="8.8"/><circle cx="72.1" cy="95.3" r="8.8"/><circle cx="54.5" cy="82.1" r="8.8"/><circle cx="67.7" cy="82.1" r="7.7"/><circle cx="60" cy="101.9" r="7.7"/><circle cx="250" cy="58" r="11"/><circle cx="237.9" cy="62.4" r="8.8"/><circle cx="262.1" cy="61.3" r="8.8"/><circle cx="244.5" cy="48.1" r="8.8"/><circle cx="257.7" cy="48.1" r="7.7"/><circle cx="250" cy="67.9" r="7.7"/><circle cx="180" cy="64" r="10"/><circle cx="169" cy="68" r="8"/><circle cx="191" cy="67" r="8"/><circle cx="175" cy="55" r="8"/><circle cx="187" cy="55" r="7"/><circle cx="180" cy="73" r="7"/><circle cx="122" cy="98" r="9"/><circle cx="112.1" cy="101.6" r="7.2"/><circle cx="131.9" cy="100.7" r="7.2"/><circle cx="117.5" cy="89.9" r="7.2"/><circle cx="128.3" cy="89.9" r="6.3"/><circle cx="122" cy="106.1" r="6.3"/>'},
    {id:'deep',name:'Deep pink blossoms',recipe:{W:4,M:3,Y:1},svg:'<circle cx="96" cy="64" r="11"/><circle cx="83.9" cy="68.4" r="8.8"/><circle cx="108.1" cy="67.3" r="8.8"/><circle cx="90.5" cy="54.1" r="8.8"/><circle cx="103.7" cy="54.1" r="7.7"/><circle cx="96" cy="73.9" r="7.7"/><circle cx="214" cy="90" r="10"/><circle cx="203" cy="94" r="8"/><circle cx="225" cy="93" r="8"/><circle cx="209" cy="81" r="8"/><circle cx="221" cy="81" r="7"/><circle cx="214" cy="99" r="7"/><circle cx="150" cy="40" r="9"/><circle cx="140.1" cy="43.6" r="7.2"/><circle cx="159.9" cy="42.7" r="7.2"/><circle cx="145.5" cy="31.9" r="7.2"/><circle cx="156.3" cy="31.9" r="6.3"/><circle cx="150" cy="48.1" r="6.3"/>'},
    {id:'trunk',name:'Trunk',recipe:{C:1,M:1,Y:1},svg:'<path d="M150 214L156 140L110 96L118 92L158 128L160 96L166 96L166 128L208 90L214 96L170 140L176 214Z"/>'},
    {id:'snow',name:'Snowy peak',recipe:{W:1},svg:'<path d="M230 116L252 94L274 116L264 112L256 118L248 112L238 118Z"/>'},
    {id:'mountain',name:'Mountain',recipe:{W:4,C:1,M:1,K:1},svg:'<path d="M180 170L252 94L324 170Z"/>'},
    {id:'grass',name:'Grass',recipe:{W:3,C:2,Y:4},svg:'<path d="M0 168Q80 158 160 168T320 164V240H0Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:3,C:1},svg:'<rect width="320" height="240"/>'},
  ],
  order:['sky','mountain','snow','grass','trunk','pale','pink','deep'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round" opacity=".6" pointer-events="none"><path d="M20 200q6-6 12 0M260 206q6-6 12 0M120 222q6-6 12 0"/></g>`
},
{ id:'butterflies', title:'Butterfly garden', sub:'', tier:'nightmare',
  regions:[
    {id:'b1spots',name:'Orange spots',recipe:{M:2,Y:5,K:1},svg:'<ellipse cx="63.2" cy="60.2" rx="7" ry="4.8" transform="rotate(-30 63.2 60.2)"/><ellipse cx="96.8" cy="60.2" rx="7" ry="4.8" transform="rotate(30 96.8 60.2)"/>'},
    {id:'b1',name:'Orange butterfly',recipe:{M:3,Y:5,K:1},svg:'<ellipse cx="64.6" cy="61.6" rx="15.4" ry="11.2" transform="rotate(-30 64.6 61.6)"/><ellipse cx="95.4" cy="61.6" rx="15.4" ry="11.2" transform="rotate(30 95.4 61.6)"/><ellipse cx="68.8" cy="79.8" rx="9.8" ry="7.7" transform="rotate(30 68.8 79.8)"/><ellipse cx="91.2" cy="79.8" rx="9.8" ry="7.7" transform="rotate(-30 91.2 79.8)"/>'},
    {id:'b2spots',name:'Light blue spots',recipe:{W:1,C:2,M:1},svg:'<ellipse cx="219.6" cy="47.6" rx="6" ry="4.1" transform="rotate(-30 219.6 47.6)"/><ellipse cx="248.4" cy="47.6" rx="6" ry="4.1" transform="rotate(30 248.4 47.6)"/>'},
    {id:'b2',name:'Blue butterfly',recipe:{W:1,C:3,M:2},svg:'<ellipse cx="220.8" cy="48.8" rx="13.2" ry="9.6" transform="rotate(-30 220.8 48.8)"/><ellipse cx="247.2" cy="48.8" rx="13.2" ry="9.6" transform="rotate(30 247.2 48.8)"/><ellipse cx="224.4" cy="64.4" rx="8.4" ry="6.6" transform="rotate(30 224.4 64.4)"/><ellipse cx="243.6" cy="64.4" rx="8.4" ry="6.6" transform="rotate(-30 243.6 64.4)"/>'},
    {id:'b3',name:'Pink butterfly',recipe:{W:1,M:3,Y:1},svg:'<ellipse cx="159" cy="110" rx="11" ry="8" transform="rotate(-30 159 110)"/><ellipse cx="181" cy="110" rx="11" ry="8" transform="rotate(30 181 110)"/><ellipse cx="162" cy="123" rx="7" ry="5.5" transform="rotate(30 162 123)"/><ellipse cx="178" cy="123" rx="7" ry="5.5" transform="rotate(-30 178 123)"/>'},
    {id:'tulips',name:'Tulips',recipe:{W:1,M:4,Y:3},svg:'<path d="M76 196Q73 179 78 176L81 183L84 175L87 183L90 176Q95 179 92 196Q84 202 76 196Z"/><path d="M156 188Q153 171 158 168L161 175L164 167L167 175L170 168Q175 171 172 188Q164 194 156 188Z"/><path d="M244 198Q241 181 246 178L249 185L252 177L255 185L258 178Q263 181 260 198Q252 204 244 198Z"/>'},
    {id:'daisies',name:'Daisy petals',recipe:{W:1},svg:'<circle cx="40" cy="176" r="6"/><circle cx="47.6" cy="181.5" r="6"/><circle cx="44.7" cy="190.5" r="6"/><circle cx="35.3" cy="190.5" r="6"/><circle cx="32.4" cy="181.5" r="6"/><circle cx="124" cy="192" r="6"/><circle cx="131.6" cy="197.5" r="6"/><circle cx="128.7" cy="206.5" r="6"/><circle cx="119.3" cy="206.5" r="6"/><circle cx="116.4" cy="197.5" r="6"/><circle cx="208" cy="176" r="6"/><circle cx="215.6" cy="181.5" r="6"/><circle cx="212.7" cy="190.5" r="6"/><circle cx="203.3" cy="190.5" r="6"/><circle cx="200.4" cy="181.5" r="6"/><circle cx="296" cy="182" r="6"/><circle cx="303.6" cy="187.5" r="6"/><circle cx="300.7" cy="196.5" r="6"/><circle cx="291.3" cy="196.5" r="6"/><circle cx="288.4" cy="187.5" r="6"/>'},
    {id:'centers',name:'Daisy centers',recipe:{W:1,Y:4,K:1},svg:'<circle cx="40" cy="184" r="4.5"/><circle cx="124" cy="200" r="4.5"/><circle cx="208" cy="184" r="4.5"/><circle cx="296" cy="190" r="4.5"/>'},
    {id:'lavender',name:'Lavender',recipe:{W:2,C:2,M:3},svg:'<ellipse cx="16" cy="196" rx="3" ry="4.5"/><ellipse cx="20" cy="189" rx="3" ry="4.5"/><ellipse cx="16" cy="182" rx="3" ry="4.5"/><ellipse cx="20" cy="175" rx="3" ry="4.5"/><ellipse cx="16" cy="168" rx="3" ry="4.5"/><ellipse cx="140" cy="176" rx="3" ry="4.5"/><ellipse cx="144" cy="169" rx="3" ry="4.5"/><ellipse cx="140" cy="162" rx="3" ry="4.5"/><ellipse cx="144" cy="155" rx="3" ry="4.5"/><ellipse cx="140" cy="148" rx="3" ry="4.5"/><ellipse cx="228" cy="178" rx="3" ry="4.5"/><ellipse cx="232" cy="171" rx="3" ry="4.5"/><ellipse cx="228" cy="164" rx="3" ry="4.5"/><ellipse cx="232" cy="157" rx="3" ry="4.5"/><ellipse cx="228" cy="150" rx="3" ry="4.5"/><ellipse cx="310" cy="170" rx="3" ry="4.5"/><ellipse cx="314" cy="163" rx="3" ry="4.5"/><ellipse cx="310" cy="156" rx="3" ry="4.5"/><ellipse cx="314" cy="149" rx="3" ry="4.5"/><ellipse cx="310" cy="142" rx="3" ry="4.5"/>'},
    {id:'stems',name:'Stems',recipe:{W:1,C:2,Y:3,K:1},stroke:3,svg:'<path d="M40 192V240M124 208V240M208 192V240M296 198V240M84 200V240M164 192V240M252 202V240M18 200V240M142 180V240M230 182V240M312 174V240"/>'},
    {id:'meadow',name:'Meadow',recipe:{W:2,C:2,Y:3},svg:'<path d="M0 152Q80 142 160 152T320 148V240H0Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:3,C:1},svg:'<rect width="320" height="240"/>'},
  ],
  order:['sky','meadow','stems','lavender','tulips','daisies','centers','b3','b2','b2spots','b1','b1spots'],
  decor:`<g fill="none" stroke="${INK}" stroke-linecap="round" pointer-events="none"><path d="M80 57.4V86.8" stroke-width="4.2"/><path d="M80 57.4q-3 -8 -7 -10M80 57.4q3 -8 7 -10" stroke-width="1.2"/><path d="M234 45.2V70.4" stroke-width="3.6"/><path d="M234 45.2q-3 -8 -7 -10M234 45.2q3 -8 7 -10" stroke-width="1.2"/><path d="M170 107V128" stroke-width="3"/><path d="M170 107q-3 -8 -7 -10M170 107q3 -8 7 -10" stroke-width="1.2"/></g>`
},
{ id:'picnic', title:'Picnic', sub:'', tier:'normal',
  regions:[
    {id:'lemonade',name:'Lemonade',recipe:{Y:1},svg:'<path d="M250 152V118Q250 110 258 110H274Q282 110 282 118V152Z"/>'},
    {id:'melon',name:'Watermelon',recipe:{W:1,M:3,Y:2},svg:'<path d="M192 166A24 24 0 0 0 240 166Z"/>'},
    {id:'rind',name:'Rind',recipe:{C:1,Y:1},svg:'<path d="M186 166A30 30 0 0 0 246 166Z"/>'},
    {id:'apples',name:'Apples',recipe:{C:1,Y:2},svg:'<circle cx="146" cy="160" r="8"/><circle cx="164" cy="166" r="8"/><circle cx="140" cy="174" r="8"/>'},
    {id:'basket',name:'Basket',recipe:{W:1,M:1,Y:2,K:1},svg:'<path d="M58 152L64 118H122L128 152Z"/>'},
    {id:'checks',name:'Checks',recipe:{W:1},svg:'<path d="M40 150L70 150L64.4 168L32.5 168Z"/><path d="M100 150L130 150L128.1 168L96.3 168Z"/><path d="M160 150L190 150L191.9 168L160 168Z"/><path d="M220 150L250 150L255.6 168L223.8 168Z"/><path d="M64.4 168L96.3 168L92.5 186L58.8 186Z"/><path d="M128.1 168L160 168L160 186L126.3 186Z"/><path d="M191.9 168L223.8 168L227.5 186L193.8 186Z"/><path d="M255.6 168L287.5 168L295 186L261.3 186Z"/><path d="M25 186L58.8 186L53.1 204L17.5 204Z"/><path d="M92.5 186L126.3 186L124.4 204L88.8 204Z"/><path d="M160 186L193.8 186L195.6 204L160 204Z"/><path d="M227.5 186L261.3 186L266.9 204L231.3 204Z"/><path d="M53.1 204L88.8 204L85 222L47.5 222Z"/><path d="M124.4 204L160 204L160 222L122.5 222Z"/><path d="M195.6 204L231.3 204L235 222L197.5 222Z"/><path d="M266.9 204L302.5 204L310 222L272.5 222Z"/>'},
    {id:'blanket',name:'Blanket',recipe:{M:4,Y:3,K:1},svg:'<path d="M40 150H280L310 222H10Z"/>'},
    {id:'grass',name:'Grass',recipe:{W:1,C:2,Y:3},svg:'<path d="M0 120Q80 112 160 120T320 116V240H0Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:3,C:1},svg:'<rect width="320" height="124"/>'},
  ],
  order:['sky','grass','blanket','checks','basket','apples','rind','melon','lemonade'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" pointer-events="none"><path d="M70 118Q93 86 116 118"/><path d="M282 120Q294 122 292 134Q290 146 282 144"/><path d="M60 136H126" stroke-width="1.2"/></g><g fill="${INK}" pointer-events="none"><ellipse cx="204" cy="174" rx="1.6" ry="2.4"/><ellipse cx="216" cy="180" rx="1.6" ry="2.4"/><ellipse cx="228" cy="174" rx="1.6" ry="2.4"/></g><g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7" pointer-events="none"><path d="M256 124V144"/></g>`
},
{ id:'lake', title:'Mountain lake', sub:'', tier:'hard',
  regions:[
    {id:'snow',name:'Snow caps',recipe:{W:1},svg:'<path d="M48 74L60 60L72 74L66 70L60 76L54 70Z"/><path d="M154 64L170 46L186 64L178 60L170 68L162 60Z"/><path d="M270 92L280 80L290 92L285 89L280 94L275 89Z"/>'},
    {id:'pines',name:'Pines',recipe:{W:1,C:2,Y:2,K:4},svg:'<path d="M11 140L20 110L29 140Z"/><path d="M27 140L36 118L45 140Z"/><path d="M201 140L210 112L219 140Z"/><path d="M217 140L226 104L235 140Z"/><path d="M235 140L244 116L253 140Z"/><path d="M291 140L300 110L309 140Z"/>'},
    {id:'mountains',name:'Mountains',recipe:{W:4,C:3,M:2,K:1},svg:'<path d="M0 132L60 60L110 110L170 46L240 120L280 80L320 110L320 132Z"/>'},
    {id:'glow',name:'Dawn glow',recipe:{W:4,M:1,Y:2},svg:'<rect x="0" y="86" width="320" height="48"/>'},
    {id:'shore',name:'Shore',recipe:{W:2,C:2,Y:3,K:1},svg:'<rect x="0" y="130" width="320" height="12"/>'},
    {id:'pinesR',name:'Pine reflections',recipe:{C:3,M:2,Y:2},svg:'<path d="M11 143.5L20 166L29 143.5Z"/><path d="M27 143.5L36 160L45 143.5Z"/><path d="M201 143.5L210 164.5L219 143.5Z"/><path d="M217 143.5L226 170.5L235 143.5Z"/><path d="M235 143.5L244 161.5L253 143.5Z"/><path d="M291 143.5L300 166L309 143.5Z"/>'},
    {id:'mountainsR',name:'Mountain reflection',recipe:{W:2,C:1,M:1,K:2},svg:'<path d="M0 149.5L60 203.5L110 166L170 214L240 158.5L280 188.5L320 166L320 149.5Z"/>'},
    {id:'lake',name:'Lake',recipe:{W:1,C:3,M:1,K:1},svg:'<rect x="0" y="142" width="320" height="98"/>'},
    {id:'sky',name:'Sky',recipe:{W:4,C:2,M:1},svg:'<rect width="320" height="132"/>'},
  ],
  order:['sky','glow','mountains','snow','shore','lake','mountainsR','pinesR','pines'],
  decor:`<g fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".7" pointer-events="none"><path d="M30 170h30M120 186h46M220 176h36M70 214h28M250 222h40M150 230h24"/></g>`
},
{ id:'robot', title:'Toy robot', sub:'', tier:'normal', paints:['W','C','K'],
  tip:{title:'Cool grays',text:'Only white, black and cyan this time. Mix them for the tinted grays of a metal toy.'},
  regions:[
    {id:'light',name:'Antenna light',recipe:{C:1},svg:'<circle cx="160" cy="28" r="6"/>'},
    {id:'eyes',name:'Eyes',recipe:{W:3,C:1},svg:'<circle cx="148" cy="62" r="7"/><circle cx="172" cy="62" r="7"/>'},
    {id:'panel',name:'Chest panel',recipe:{W:1,C:1,K:3},svg:'<rect x="138" y="106" width="44" height="30" rx="4"/>'},
    {id:'head',name:'Head',recipe:{W:1},svg:'<rect x="130" y="40" width="60" height="46" rx="8"/>'},
    {id:'body',name:'Body',recipe:{W:4,C:1,K:2},svg:'<rect x="120" y="92" width="80" height="74" rx="10"/>'},
    {id:'limbs',name:'Arms and legs',recipe:{W:2,C:1,K:3},svg:'<rect x="98" y="96" width="18" height="58" rx="9"/><rect x="204" y="96" width="18" height="58" rx="9"/><rect x="134" y="166" width="18" height="38" rx="4"/><rect x="168" y="166" width="18" height="38" rx="4"/><rect x="126" y="200" width="30" height="10" rx="4"/><rect x="164" y="200" width="30" height="10" rx="4"/>'},
    {id:'rug',name:'Rug',recipe:{W:2,C:2,K:1},svg:'<ellipse cx="160" cy="218" rx="110" ry="14"/>'},
    {id:'floor',name:'Floor',recipe:{W:1,K:3},svg:'<path d="M0 196H320V240H0Z"/>'},
    {id:'wall',name:'Wall',recipe:{W:1,C:1},svg:'<rect width="320" height="198"/>'},
  ],
  order:['wall','floor','rug','limbs','body','panel','head','eyes','light'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" pointer-events="none"><path d="M160 40V34"/><path d="M150 76h20"/><path d="M146 122h6M158 122h6M170 122h6" stroke-width="3"/></g><g fill="${INK}" pointer-events="none"><circle cx="148" cy="62" r="2.5"/><circle cx="172" cy="62" r="2.5"/></g>`
},
{ id:'pumpkins', title:'Pumpkin patch', sub:'', tier:'normal',
  regions:[
    {id:'pumpkins',name:'Pumpkins',recipe:{M:1,Y:2},svg:'<ellipse cx="79" cy="192" rx="15.6" ry="18.2"/><ellipse cx="105" cy="192" rx="15.6" ry="18.2"/><ellipse cx="92" cy="192" rx="16.9" ry="19.5"/><ellipse cx="210" cy="200" rx="16.8" ry="19.6"/><ellipse cx="238" cy="200" rx="16.8" ry="19.6"/><ellipse cx="224" cy="200" rx="18.2" ry="21"/>'},
    {id:'small',name:'Small pumpkins',recipe:{W:1,M:1,Y:2},svg:'<ellipse cx="148" cy="208" rx="9.6" ry="11.2"/><ellipse cx="164" cy="208" rx="9.6" ry="11.2"/><ellipse cx="156" cy="208" rx="10.4" ry="12"/><ellipse cx="268" cy="174" rx="9.6" ry="11.2"/><ellipse cx="284" cy="174" rx="9.6" ry="11.2"/><ellipse cx="276" cy="174" rx="10.4" ry="12"/><ellipse cx="30" cy="176" rx="9.6" ry="11.2"/><ellipse cx="46" cy="176" rx="9.6" ry="11.2"/><ellipse cx="38" cy="176" rx="10.4" ry="12"/>'},
    {id:'stems',name:'Stems',recipe:{Y:1,K:3},svg:'<rect x="88" y="166" width="8" height="10" rx="2"/><rect x="220" y="172" width="8" height="10" rx="2"/><rect x="153" y="192" width="6" height="6" rx="1"/><rect x="273" y="158" width="6" height="6" rx="1"/><rect x="35" y="160" width="6" height="6" rx="1"/>'},
    {id:'leaves',name:'Leaves',recipe:{C:2,Y:3,K:2},svg:'<ellipse cx="122" cy="212" rx="12" ry="6" transform="rotate(-20 122 212)"/><ellipse cx="60" cy="196" rx="12" ry="6" transform="rotate(25 60 196)"/><ellipse cx="186" cy="218" rx="12" ry="6" transform="rotate(15 186 218)"/><ellipse cx="256" cy="196" rx="11" ry="6" transform="rotate(-25 256 196)"/><ellipse cx="300" cy="186" rx="10" ry="5" transform="rotate(20 300 186)"/>'},
    {id:'hay',name:'Hay bale',recipe:{W:1,Y:2,K:1},svg:'<rect x="236" y="116" width="56" height="34" rx="6"/>'},
    {id:'fence',name:'Fence',recipe:{W:1,C:1,M:1,Y:1},svg:'<rect x="0" y="128" width="200" height="6"/><rect x="10" y="118" width="8" height="30" rx="1"/><rect x="50" y="118" width="8" height="30" rx="1"/><rect x="90" y="118" width="8" height="30" rx="1"/><rect x="130" y="118" width="8" height="30" rx="1"/><rect x="170" y="118" width="8" height="30" rx="1"/>'},
    {id:'field',name:'Field',recipe:{C:1,M:1,Y:1},svg:'<path d="M0 148Q160 132 320 148V240H0Z"/>'},
    {id:'glow',name:'Sunset glow',recipe:{W:3,M:2,Y:3},svg:'<rect x="0" y="92" width="320" height="58"/>'},
    {id:'sky',name:'Dusk sky',recipe:{C:1,M:1,K:1},svg:'<rect width="320" height="150"/>'},
  ],
  order:['sky','glow','field','fence','hay','leaves','pumpkins','small','stems'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round" pointer-events="none"><path d="M244 128h40M244 138h40"/><path d="M96 178Q110 168 118 176M228 186Q240 178 250 186"/></g><g fill="#fff" pointer-events="none"><circle cx="40" cy="30" r="1.5"/><circle cx="120" cy="18" r="1.2"/><circle cx="210" cy="40" r="1.5"/><circle cx="290" cy="22" r="1.2"/></g>`
},
{ id:'aurora', title:'Northern lights', sub:'', tier:'hard',
  regions:[
    {id:'window',name:'Window light',recipe:{W:2,M:1,Y:5,K:1},svg:'<rect x="232" y="174" width="12" height="10"/>'},
    {id:'cabin',name:'Cabin',recipe:{M:1,Y:1,K:2},svg:'<rect x="220" y="168" width="44" height="28"/><path d="M214 170L242 148L270 170Z"/>'},
    {id:'green',name:'Green lights',recipe:{W:1,C:2,Y:2},stroke:14,svg:'<path d="M-10 92Q60 40 140 74T330 52"/>'},
    {id:'teal',name:'Teal lights',recipe:{W:1,C:3,Y:2},stroke:10,svg:'<path d="M-10 118Q80 80 160 104T330 84"/>'},
    {id:'violet',name:'Violet lights',recipe:{W:2,C:3,M:4},stroke:8,svg:'<path d="M-10 60Q90 20 180 46T330 22"/>'},
    {id:'pines',name:'Pines',recipe:{K:1},svg:'<path d="M13 200L24 148L35 200Z"/><path d="M33 200L44 158L55 200Z"/><path d="M51 200L62 144L73 200Z"/><path d="M275 200L286 150L297 200Z"/><path d="M293 200L304 158L315 200Z"/>'},
    {id:'snow',name:'Snow',recipe:{W:1},svg:'<path d="M0 194Q90 182 170 194T320 190V240H0Z"/>'},
    {id:'hills',name:'Far hills',recipe:{W:1,C:1,M:1,K:3},svg:'<path d="M0 170Q70 140 150 164T320 150V200H0Z"/>'},
    {id:'sky',name:'Night sky',recipe:{C:1,M:1,K:3},svg:'<rect width="320" height="200"/>'},
  ],
  order:['sky','violet','green','teal','hills','snow','pines','cabin','window'],
  decor:`<g fill="#fff" pointer-events="none"><circle cx="30" cy="20" r="1.4"/><circle cx="110" cy="14" r="1.2"/><circle cx="160" cy="130" r="1.2"/><circle cx="250" cy="120" r="1.4"/><circle cx="80" cy="138" r="1.2"/><circle cx="300" cy="104" r="1.2"/><circle cx="200" cy="10" r="1.4"/></g><g fill="none" stroke="${INK}" stroke-width="1.4" pointer-events="none"><path d="M238 174V184M232 179h12"/></g>`
},
{ id:'flowers', title:'Flower market', sub:'', tier:'normal',
  regions:[
    {id:'red',name:'Roses',recipe:{W:1,M:3,Y:3},svg:'<circle cx="48" cy="104" r="8"/><circle cx="37" cy="110" r="8"/><circle cx="59" cy="110" r="8"/><circle cx="41" cy="95" r="8"/><circle cx="55" cy="95" r="8"/>'},
    {id:'yellow',name:'Sunflowers',recipe:{Y:1},svg:'<circle cx="104" cy="104" r="8"/><circle cx="93" cy="110" r="8"/><circle cx="115" cy="110" r="8"/><circle cx="97" cy="95" r="8"/><circle cx="111" cy="95" r="8"/>'},
    {id:'purple',name:'Irises',recipe:{C:3,M:4},svg:'<circle cx="160" cy="104" r="8"/><circle cx="149" cy="110" r="8"/><circle cx="171" cy="110" r="8"/><circle cx="153" cy="95" r="8"/><circle cx="167" cy="95" r="8"/>'},
    {id:'pink',name:'Peonies',recipe:{W:1,M:1},svg:'<circle cx="216" cy="104" r="8"/><circle cx="205" cy="110" r="8"/><circle cx="227" cy="110" r="8"/><circle cx="209" cy="95" r="8"/><circle cx="223" cy="95" r="8"/>'},
    {id:'orange',name:'Marigolds',recipe:{M:1,Y:2},svg:'<circle cx="272" cy="104" r="8"/><circle cx="261" cy="110" r="8"/><circle cx="283" cy="110" r="8"/><circle cx="265" cy="95" r="8"/><circle cx="279" cy="95" r="8"/>'},
    {id:'bunting',name:'Bunting',recipe:{C:3,M:1},svg:'<path d="M20 34L60 38L40 62Z"/><path d="M60 38L100 34L80 62Z"/><path d="M100 34L140 38L120 62Z"/><path d="M140 38L180 34L160 62Z"/><path d="M180 34L220 38L200 62Z"/><path d="M220 38L260 34L240 62Z"/><path d="M260 34L300 38L280 62Z"/>'},
    {id:'leaves',name:'Leaves',recipe:{C:1,Y:1},svg:'<ellipse cx="33" cy="120" rx="9" ry="4" transform="rotate(-30 33 120)"/><ellipse cx="63" cy="120" rx="9" ry="4" transform="rotate(30 63 120)"/><ellipse cx="89" cy="120" rx="9" ry="4" transform="rotate(-30 89 120)"/><ellipse cx="119" cy="120" rx="9" ry="4" transform="rotate(30 119 120)"/><ellipse cx="145" cy="120" rx="9" ry="4" transform="rotate(-30 145 120)"/><ellipse cx="175" cy="120" rx="9" ry="4" transform="rotate(30 175 120)"/><ellipse cx="201" cy="120" rx="9" ry="4" transform="rotate(-30 201 120)"/><ellipse cx="231" cy="120" rx="9" ry="4" transform="rotate(30 231 120)"/><ellipse cx="257" cy="120" rx="9" ry="4" transform="rotate(-30 257 120)"/><ellipse cx="287" cy="120" rx="9" ry="4" transform="rotate(30 287 120)"/>'},
    {id:'buckets',name:'Buckets',recipe:{W:2,K:1},svg:'<path d="M30 120L66 120L62 150L34 150Z"/><path d="M86 120L122 120L118 150L90 150Z"/><path d="M142 120L178 120L174 150L146 150Z"/><path d="M198 120L234 120L230 150L202 150Z"/><path d="M254 120L290 120L286 150L258 150Z"/>'},
    {id:'stall',name:'Stall',recipe:{W:1,M:1,Y:2,K:2},svg:'<rect x="16" y="150" width="288" height="10"/><rect x="24" y="160" width="272" height="50"/>'},
    {id:'ground',name:'Pavement',recipe:{W:1,K:1},svg:'<path d="M0 206H320V240H0Z"/>'},
    {id:'wall',name:'Wall',recipe:{W:1},svg:'<rect width="320" height="208"/>'},
  ],
  order:['wall','bunting','ground','stall','buckets','leaves','red','yellow','purple','pink','orange'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round" pointer-events="none"><path d="M0 30Q160 44 320 30" stroke-width="1.6"/><path d="M24 176H296M24 192H296" opacity=".5"/><path d="M32 132H64"/><path d="M88 132H120"/><path d="M144 132H176"/><path d="M200 132H232"/><path d="M256 132H288"/></g><g fill="${INK}" pointer-events="none"><circle cx="104" cy="104" r="2.5"/><circle cx="93" cy="110" r="2.5"/><circle cx="115" cy="110" r="2.5"/><circle cx="97" cy="95" r="2.5"/><circle cx="111" cy="95" r="2.5"/></g>`
},
{ id:'hummingbird', title:'Hummingbird', sub:'', tier:'hard',
  regions:[
    {id:'throat',name:'Throat',recipe:{M:1},svg:'<ellipse cx="184" cy="96" rx="10" ry="8" transform="rotate(-20 184 96)"/>'},
    {id:'flower',name:'Flower',recipe:{W:1,M:3,Y:1},svg:'<path d="M246 40Q262 40 262 56L268 92Q258 100 246 96Q236 100 226 92L232 56Q232 40 246 40Z"/>'},
    {id:'head',name:'Head and back',recipe:{W:1,C:2,Y:2,K:1},svg:'<circle cx="180" cy="82" r="14"/><ellipse cx="150" cy="108" rx="34" ry="18" transform="rotate(-25 150 108)"/>'},
    {id:'wing',name:'Wing',recipe:{W:1,C:1,Y:1,K:1},svg:'<path d="M150 96Q120 40 72 34Q110 70 128 110Z"/>'},
    {id:'tail',name:'Tail',recipe:{W:1,C:2,Y:2,K:3},svg:'<path d="M124 124L92 168L112 162L118 176L132 132Z"/>'},
    {id:'belly',name:'Belly',recipe:{W:1},svg:'<ellipse cx="156" cy="120" rx="22" ry="10" transform="rotate(-25 156 120)"/>'},
    {id:'leaves',name:'Leaves',recipe:{C:3,Y:4,K:3},svg:'<ellipse cx="282" cy="70" rx="18" ry="7" transform="rotate(-40 282 70)"/><ellipse cx="220" cy="120" rx="16" ry="6" transform="rotate(30 220 120)"/><ellipse cx="276" cy="130" rx="18" ry="7" transform="rotate(-20 276 130)"/>'},
    {id:'stem',name:'Stem',recipe:{C:2,M:1,Y:3},stroke:4,svg:'<path d="M246 40Q250 10 280 0M246 96Q240 150 270 240M270 160Q262 140 220 120"/>'},
    {id:'sky',name:'Sky',recipe:{W:3,C:1},svg:'<rect width="320" height="240"/>'},
  ],
  order:['sky','stem','leaves','flower','wing','tail','head','belly','throat'],
  decor:`<g fill="none" stroke="${INK}" stroke-linecap="round" pointer-events="none"><path d="M192 78L230 68" stroke-width="2.5"/></g><g fill="${INK}" pointer-events="none"><circle cx="184" cy="78" r="2.5"/></g>`
},
{ id:'stainedglass', title:'Stained-glass window', sub:'', tier:'nightmare',
  tip:{title:'Mend the glass',text:'Every cracked pane closes up when you match its color. Eleven parts, and many shades sit close together.'},
  regions:[
    {id:'center',name:'Rose center',recipe:{M:1,Y:5,K:1},svg:'<circle cx="160" cy="100" r="14"/>'},
    {id:'petals',name:'Rose petals',recipe:{M:3,Y:3,K:1},svg:'<circle cx="160" cy="74" r="11"/><circle cx="178.4" cy="81.6" r="11"/><circle cx="186" cy="100" r="11"/><circle cx="178.4" cy="118.4" r="11"/><circle cx="160" cy="126" r="11"/><circle cx="141.6" cy="118.4" r="11"/><circle cx="134" cy="100" r="11"/><circle cx="141.6" cy="81.6" r="11"/>'},
    {id:'jewels',name:'Jewels',recipe:{M:2,Y:1,K:2},svg:'<path d="M100 154L108 162L100 170L92 162Z"/><path d="M140 154L148 162L140 170L132 162Z"/><path d="M180 154L188 162L180 170L172 162Z"/><path d="M220 154L228 162L220 170L212 162Z"/>',crack:'M96 158l6 4-3 6'},
    {id:'amber',name:'Amber panes',recipe:{M:2,Y:4,K:1},svg:'<rect x="80" y="168" width="40" height="52"/><rect x="160" y="168" width="40" height="52"/>',crack:'M90 176l12 10-4 10 10 12'},
    {id:'blue',name:'Upper glass',recipe:{C:3,M:2},svg:'<path d="M80 100A80 80 0 0 1 240 100Z"/>',crack:'M120 40l10 16-8 8 12 14'},
    {id:'deepblue',name:'Deep blue panes',recipe:{C:1,M:1},svg:'<rect x="120" y="168" width="40" height="52"/><rect x="200" y="168" width="40" height="52"/>'},
    {id:'green',name:'Green panes',recipe:{C:1,Y:1},svg:'<rect x="80" y="100" width="40" height="68"/><rect x="160" y="100" width="40" height="68"/>',crack:'M170 110l8 14-6 10 10 12'},
    {id:'purple',name:'Purple panes',recipe:{C:2,M:3,K:1},svg:'<rect x="120" y="100" width="40" height="68"/><rect x="200" y="100" width="40" height="68"/>'},
    {id:'violet',name:'Violet petals ring',recipe:{W:1,C:3,M:5},svg:'<circle cx="160" cy="100" r="40"/>'},
    {id:'frame',name:'Stone frame',recipe:{W:1,K:1},svg:'<path d="M66 228V100A94 94 0 0 1 254 100V228Z"/>'},
    {id:'wall',name:'Wall',recipe:{W:3,K:1},svg:'<rect width="320" height="240"/>'},
  ],
  order:['wall','frame','blue','violet','green','purple','amber','deepblue','petals','center','jewels'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" pointer-events="none"><path d="M80 220V100A80 80 0 0 1 240 100V220Z"/><path d="M80 100H240M80 168H240M120 100V220M160 140V220M200 100V220"/></g>`
},
{ id:'seaside', title:'Seaside village', sub:'', tier:'normal',
  regions:[
    {id:'boat',name:'Boat',recipe:{M:3,Y:2,K:1},svg:'<path d="M226 186H274L266 198H234Z"/>'},
    {id:'yellow',name:'Yellow houses',recipe:{Y:1},svg:'<rect x="70" y="104" width="34" height="34"/><rect x="198" y="96" width="30" height="40"/>'},
    {id:'pink',name:'Pink houses',recipe:{W:2,M:1},svg:'<rect x="108" y="98" width="30" height="40"/><rect x="232" y="104" width="34" height="32"/>'},
    {id:'blue',name:'Blue houses',recipe:{C:1},svg:'<rect x="142" y="108" width="32" height="30"/><rect x="36" y="110" width="30" height="28"/>'},
    {id:'roofs',name:'Roofs',recipe:{M:2,Y:3,K:2},svg:'<path d="M66 104L87 88L108 104Z"/><path d="M104 98L123 82L142 98Z"/><path d="M138 108L158 92L178 108Z"/><path d="M32 110L51 96L70 110Z"/><path d="M194 96L213 80L232 96Z"/><path d="M228 104L249 88L270 104Z"/>'},
    {id:'hill',name:'Hill',recipe:{W:1,C:1,Y:2,K:1},svg:'<path d="M0 140Q60 70 160 90T320 120V150H0Z"/>'},
    {id:'sand',name:'Beach',recipe:{W:4,Y:2,K:1},svg:'<path d="M0 138H320V158H0Z"/>'},
    {id:'sea',name:'Sea',recipe:{C:2,K:1},svg:'<path d="M0 156H320V240H0Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:3,C:1},svg:'<rect width="320" height="150"/>'},
  ],
  order:['sky','hill','sand','sea','blue','yellow','pink','roofs','boat'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" pointer-events="none"><path d="M250 186V150"/><path d="M252 152L272 182H252Z" fill="#fff"/></g><g fill="${INK}" pointer-events="none"><rect x="80" y="116" width="8" height="9"/><rect x="118" y="110" width="8" height="9"/><rect x="152" y="118" width="8" height="9"/><rect x="46" y="120" width="8" height="9"/><rect x="206" y="108" width="8" height="9"/><rect x="242" y="114" width="8" height="9"/></g><g fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".7" pointer-events="none"><path d="M30 180h26M110 200h30M190 214h28M60 226h20"/></g>`
},
{ id:'chameleon', title:'Chameleon', sub:'', tier:'hard',
  regions:[
    {id:'eye',name:'Eye',recipe:{M:1,Y:2},svg:'<circle cx="90" cy="104" r="8"/>'},
    {id:'headc',name:'Head',recipe:{W:1,C:3,Y:4},svg:'<path d="M64 120Q66 92 98 90Q118 92 118 116Q110 132 86 132Q66 130 64 120Z"/>'},
    {id:'front',name:'Front of body',recipe:{W:1,C:3,Y:5},svg:'<ellipse cx="142" cy="120" rx="30" ry="28"/><rect x="128" y="138" width="10" height="20" rx="4"/>'},
    {id:'back',name:'Back of body',recipe:{C:1,Y:2},svg:'<ellipse cx="186" cy="118" rx="30" ry="26"/><rect x="186" y="134" width="10" height="24" rx="4"/>'},
    {id:'tail',name:'Tail',recipe:{W:1,C:2,Y:5},stroke:12,svg:'<path d="M212 124Q250 130 250 160Q250 186 228 186Q212 186 212 172Q212 160 224 160"/>'},
    {id:'branch',name:'Branch',recipe:{W:1,M:1,Y:2,K:4},svg:'<path d="M0 160L320 146V160L0 174Z"/>'},
    {id:'leaves',name:'Leaves',recipe:{C:2,M:1,Y:2},svg:'<ellipse cx="40" cy="60" rx="26" ry="10" transform="rotate(-30 40 60)"/><ellipse cx="280" cy="60" rx="26" ry="10" transform="rotate(30 280 60)"/><ellipse cx="300" cy="200" rx="24" ry="9" transform="rotate(-20 300 200)"/><ellipse cx="30" cy="210" rx="24" ry="9" transform="rotate(20 30 210)"/><ellipse cx="250" cy="30" rx="20" ry="8" transform="rotate(-10 250 30)"/>'},
    {id:'bg',name:'Jungle mist',recipe:{W:4,C:1,Y:2,K:1},svg:'<rect width="320" height="240"/>'},
  ],
  order:['bg','leaves','branch','tail','back','front','headc','eye'],
  decor:`<g fill="${INK}" pointer-events="none"><circle cx="91" cy="104" r="3"/></g><g fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" pointer-events="none"><path d="M70 122Q84 126 100 122"/><path d="M98 90Q108 78 122 92"/></g>`
},
{ id:'cabin', title:'Winter cabin', sub:'', tier:'normal',
  regions:[
    {id:'window',name:'Window light',recipe:{W:2,M:1,Y:3},svg:'<rect x="148" y="140" width="24" height="20"/>'},
    {id:'door',name:'Door',recipe:{C:1,M:1,Y:1},svg:'<rect x="190" y="146" width="22" height="40"/>'},
    {id:'walls',name:'Log walls',recipe:{M:1,Y:2,K:3},svg:'<rect x="120" y="120" width="120" height="66"/>'},
    {id:'roof',name:'Roof',recipe:{K:1},svg:'<path d="M108 124L180 76L252 124Z"/>'},
    {id:'chimney',name:'Chimney',recipe:{W:1,K:1},svg:'<rect x="214" y="72" width="16" height="34"/>'},
    {id:'pines',name:'Pines',recipe:{W:1,C:1,Y:1,K:3},svg:'<path d="M28 186L52 116L76 186Z"/><path d="M66 186L84 136L102 186Z"/><path d="M260 186L282 122L304 186Z"/>'},
    {id:'hills',name:'Far hills',recipe:{W:2,C:1,K:1},svg:'<path d="M0 150Q80 110 160 140T320 130V190H0Z"/>'},
    {id:'snow',name:'Snow',recipe:{W:1},svg:'<path d="M0 184Q160 172 320 184V240H0Z"/><path d="M104 126L180 72L256 126L246 128L180 82L114 128Z"/>'},
    {id:'sky',name:'Evening sky',recipe:{C:2,M:1,K:1},svg:'<rect width="320" height="190"/>'},
  ],
  order:['sky','hills','pines','walls','door','window','chimney','roof','snow'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round" pointer-events="none"><path d="M120 136H240M120 152H148M172 152H190M120 168H190M212 168H240" opacity=".6"/><path d="M160 140V160M148 150H172"/></g><g fill="#fff" opacity=".75" pointer-events="none"><circle cx="226" cy="58" r="7"/><circle cx="236" cy="44" r="9"/><circle cx="250" cy="30" r="10"/></g><g fill="#fff" pointer-events="none"><circle cx="40" cy="30" r="1.4"/><circle cx="100" cy="50" r="1.2"/><circle cx="300" cy="40" r="1.4"/><circle cx="160" cy="20" r="1.2"/></g>`
},
{ id:'koi', title:'Koi pond', sub:'', tier:'nightmare',
  tip:{title:'The last pond',text:'Oranges that sit side by side, and two waters a shade apart. Take your time: this is the finale.'},
  regions:[
    {id:'spots',name:'Black spots',recipe:{K:1},svg:'<g transform="rotate(12 118 96)"><circle cx="108.4" cy="91.2" r="4"/><circle cx="124.4" cy="100.8" r="3.2"/></g><g transform="rotate(-165 214 148)"><circle cx="201.2" cy="144.8" r="4"/><circle cx="217.2" cy="141.6" r="3.2"/><circle cx="226.8" cy="152.8" r="3.2"/></g><g transform="rotate(-25 108 178)"><circle cx="91.2" cy="180.8" r="2.8"/></g>'},
    {id:'centers',name:'Flower centers',recipe:{Y:1},svg:'<circle cx="262" cy="64" r="4"/><circle cx="56" cy="176" r="4"/>'},
    {id:'lilies',name:'Lilies',recipe:{W:5,M:3,Y:1},svg:'<circle cx="262" cy="56" r="6"/><circle cx="268.9" cy="60" r="6"/><circle cx="268.9" cy="68" r="6"/><circle cx="262" cy="72" r="6"/><circle cx="255.1" cy="68" r="6"/><circle cx="255.1" cy="60" r="6"/><circle cx="56" cy="168" r="6"/><circle cx="62.9" cy="172" r="6"/><circle cx="62.9" cy="180" r="6"/><circle cx="56" cy="184" r="6"/><circle cx="49.1" cy="180" r="6"/><circle cx="49.1" cy="172" r="6"/>'},
    {id:'red',name:'Red patches',recipe:{M:3,Y:4,K:1},svg:'<g transform="rotate(-25 108 178)"><ellipse cx="119.2" cy="176.6" rx="11.2" ry="7"/><ellipse cx="99.6" cy="179.4" rx="8.4" ry="5.6"/></g><g transform="rotate(12 118 96)"><ellipse cx="137.2" cy="96" rx="9.6" ry="6.4"/></g>'},
    {id:'orange',name:'Orange koi',recipe:{W:1,M:3,Y:5},svg:'<g transform="rotate(12 118 96)"><path d="M79.6 96Q118 76.8 153.2 96Q118 115.2 79.6 96Z"/><path d="M82.8 96L63.599999999999994 81.6L68.4 96L63.599999999999994 110.4Z"/></g><g transform="rotate(-165 214 148)"><path d="M175.6 148Q214 128.8 249.2 148Q214 167.2 175.6 148Z"/><path d="M178.8 148L159.6 133.6L164.4 148L159.6 162.4Z"/></g>'},
    {id:'white',name:'White koi',recipe:{W:1},svg:'<g transform="rotate(-25 108 178)"><path d="M74.4 178Q108 161.2 138.8 178Q108 194.8 74.4 178Z"/><path d="M77.2 178L60.400000000000006 165.4L64.6 178L60.400000000000006 190.6Z"/></g>'},
    {id:'pads',name:'Lily pads',recipe:{W:1,C:3,Y:4,K:1},svg:'<path d="M262 70L245.1 84.1A22 22 0 1 1 251 89.1Z"/><path d="M56 182L68.9 166.7A20 20 0 1 1 62.8 163.2Z"/><path d="M70 40L56.1 32A16 16 0 1 1 54.2 37.2Z"/><path d="M286 190L279.8 173.1A18 18 0 1 1 274.4 176.2Z"/>'},
    {id:'reeds',name:'Reeds',recipe:{W:1,C:3,Y:5,K:2},stroke:4,svg:'<path d="M10 240Q12 200 6 170M22 240Q20 196 28 160M300 0Q304 30 296 60M312 0Q308 36 316 70"/>'},
    {id:'deep',name:'Deep water',recipe:{C:2,M:1,Y:1},svg:'<ellipse cx="160" cy="128" rx="104" ry="62"/>'},
    {id:'water',name:'Water',recipe:{W:1,C:2,Y:1,K:2},svg:'<rect width="320" height="240"/>'},
    {id:'stones',name:'Stones',recipe:{W:1,K:1},svg:'<circle cx="0" cy="0" r="30"/><circle cx="40" cy="-6" r="22"/><circle cx="320" cy="240" r="34"/><circle cx="280" cy="248" r="22"/><circle cx="0" cy="240" r="24"/><circle cx="320" cy="0" r="24"/>'},
  ],
  order:['water','deep','reeds','stones','pads','lilies','centers','orange','white','red','spots'],
  decor:`<g fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".5" pointer-events="none"><path d="M60 120q10-6 20 0M230 100q10-6 20 0M120 230q10-6 20 0"/></g>`
},
];
// Content translations (keys = the English text above)
const STRINGS={
fr:{
'Balloons':'Ballons','Welcome, restorer':'Bienvenue, restaurateur',
'Each faded part has a target color. Tap a paint to drop it in the bowl, the part paints itself as soon as the match reaches 95%. Every drop uses paint from your pot. Restored parts earn coins.':'Chaque partie décolorée a une couleur cible. Touchez une peinture pour en verser une goutte dans le bol : la partie se colore dès que la correspondance atteint 95 %. Chaque goutte coûte de la peinture. Les parties restaurées rapportent des pièces.',
'Magenta balloon':'Ballon magenta','Yellow balloon':'Ballon jaune','Cyan balloon':'Ballon cyan',
'Fruit bowl':'Coupe de fruits','Mixing two colors':'Mélanger deux couleurs',
'Red, green and blue are not in your paint set. Mix them: one drop of each of two paints.':'Le rouge, le vert et le bleu ne sont pas dans vos peintures. Mélangez-les : une goutte de deux peintures différentes.',
'Apple':'Pomme','Pear':'Poire','Plum':'Prune','Penguin':'Pingouin','Light and dark':'Clair et foncé',
'This picture needs only <b>White</b> and <b>Black</b>. One drop of each makes <b>gray</b>. More white makes it lighter, more black makes it darker.':'Cette image ne demande que du <b>Blanc</b> et du <b>Noir</b>. Une goutte de chaque donne du <b>gris</b>. Plus de blanc éclaircit, plus de noir assombrit.',
'Belly':'Ventre','Ice':'Glace','Beach':'Plage','All five paints':'Les cinq peintures','Mix, then shade':'Mélanger, puis nuancer',
'Mix two paints to get the color, then add <b>White</b> to make it lighter or <b>Black</b> to make it darker.':'Mélangez deux peintures pour obtenir la couleur, puis ajoutez du <b>Blanc</b> pour l’éclaircir ou du <b>Noir</b> pour l’assombrir.',
'Umbrellas':'Parapluies','Lighter and darker':'Plus clair, plus foncé',
'All five paints are open now. Add <b>White</b> to a color to make it lighter, <b>Black</b> to make it darker. One drop of each is enough here.':'Les cinq peintures sont disponibles. Ajoutez du <b>Blanc</b> à une couleur pour l’éclaircir, du <b>Noir</b> pour l’assombrir. Une goutte de chaque suffit ici.',
'Light blue panels':'Pans bleu clair','Dark blue panels':'Pans bleu foncé','Pink panels':'Pans roses','Dark magenta panels':'Pans magenta foncé','Light yellow panels':'Pans jaune clair','Olive panels':'Pans olive',
'All five paints are open now. Mix a color, then add <b>White</b> to make it lighter or <b>Black</b> to make it darker.':'Les cinq peintures sont disponibles. Mélangez une couleur, puis ajoutez du <b>Blanc</b> pour l’éclaircir ou du <b>Noir</b> pour l’assombrir.',
'Sun':'Soleil','Sea':'Mer','Sky':'Ciel','Sand':'Sable','Umbrella':'Parasol','Rock':'Rocher',
'Cottage':'Chaumière','A bigger picture':'Une image plus grande',
'Ten parts share one paint pot, so plan your drops. You can tap any faded part to work on it. If the pot runs dry, coins can rescue the part you are on.':'Dix parties partagent un seul pot de peinture : prévoyez vos gouttes. Touchez n’importe quelle partie décolorée pour la travailler. Si le pot est vide, des pièces peuvent sauver la partie en cours.',
'Flowers':'Fleurs','Lit windows':'Fenêtres éclairées','Door':'Porte','Roof':'Toit','Walls':'Murs','Treetop':'Feuillage','Tree trunk':'Tronc','Grass':'Herbe',
'Kitchen shelf':'Étagère de cuisine','Lemon':'Citron','Mug':'Tasse','Leaves':'Feuilles','Teapot':'Théière','Flower pot':'Pot de fleurs','Picture frame':'Cadre','Shelf':'Étagère','Wall':'Mur',
'Fishbowl':'Bocal à poissons','Goldfish':'Poisson rouge','Little fish':'Petit poisson','Water weed':'Algue','Pebbles':'Cailloux','Water':'Eau','Table':'Table',
'Sunset sail':'Voile au couchant','Upper sky':'Haut du ciel','Middle sky':'Milieu du ciel','Lower sky':'Bas du ciel','Sun on the water':'Soleil sur l’eau','Sails':'Voiles','Boat':'Bateau',
'Birthday cake':'Gâteau d’anniversaire','Flames':'Flammes','Candles':'Bougies','Cherries':'Cerises','Frosting':'Glaçage','Sponge':'Génoise','Plate':'Assiette','Tablecloth':'Nappe',
'Autumn fox':'Renard d’automne','White chest':'Poitrail blanc','Fox':'Renard','Falling leaves':'Feuilles qui tombent','Ground':'Sol','Hills':'Collines',
'Lighthouse':'Phare','Lamp':'Lanterne','Moon':'Lune','Light beam':'Faisceau','Red stripes':'Bandes rouges','Tower':'Tour','Rocks':'Rochers','Night sky':'Ciel de nuit',
'Jungle parrot':'Perroquet de la jungle','Face':'Visage','Beak':'Bec','Yellow feathers':'Plumes jaunes','Wing':'Aile','Parrot':'Perroquet','Tail':'Queue','Branch':'Branche','Dark leaves':'Feuilles sombres','Bright leaves':'Feuilles claires','Green leaves':'Feuilles vertes','Jungle':'Jungle',
'Snowman':'Bonhomme de neige','Hat':'Chapeau','Carrot nose':'Nez en carotte','Scarf':'Écharpe','Buttons':'Boutons','Pine trees':'Sapins','Snow':'Neige','Winter sky':'Ciel d’hiver',
'Desert':'Désert','Cactus flowers':'Fleurs de cactus','Cactus':'Cactus','Stones':'Pierres','Far dunes':'Dunes lointaines','Near dunes':'Dunes proches',
'Rocket':'Fusée','Nose cone':'Coiffe','Window':'Hublot','Fins':'Ailerons','Flame':'Flamme','Planet ring':'Anneau','Planet':'Planète','Space':'Espace',
'Ice cream':'Cornet de glace','Cherry':'Cerise','Vanilla':'Vanille','Mint':'Menthe','Strawberry':'Fraise','Cone':'Cornet','Counter':'Comptoir',
'Rainy street':'Rue sous la pluie','Coat':'Manteau','Left house':'Maison de gauche','Right house':'Maison de droite','Puddle':'Flaque','Street':'Rue','Rainy sky':'Ciel pluvieux',
'Peacock':'Paon','Feather eyes':'Ocelles','Eye centers':'Cœurs des ocelles','Outer feathers':'Plumes extérieures','Middle feathers':'Plumes du milieu','Inner feathers':'Plumes intérieures','Garden':'Jardin',
'Hot-air balloons':'Montgolfières','Balloon center':'Centre du ballon','Yellow stripes':'Bandes jaunes','Big balloon':'Grand ballon','Small balloon':'Petit ballon','Far balloon':'Ballon lointain','Basket':'Nacelle','Clouds':'Nuages','Tea party':'Heure du thé','Three paints only':'Trois peintures seulement','No yellow and no black today. Cyan and magenta make every blue and purple here, and white softens them.':'Ni jaune ni noir aujourd’hui. Le cyan et le magenta font tous les bleus et violets de l’image, et le blanc les adoucit.','Cups':'Tasses','Lid':'Couvercle','Vase':'Vase','Saucers':'Soucoupes','Coral reef':'Récif de corail','Fish':'Poissons','Fan coral':'Corail éventail','Branch coral':'Corail branchu','Anemone':'Anémone','Brain coral':'Corail cerveau','Seaweed':'Algues','Vegetable garden':'Potager','Tomatoes':'Tomates','Carrots':'Carottes','Carrot tops':'Fanes de carottes','Cabbages':'Choux','Tomato leaves':'Feuilles de tomate','Fence':'Clôture','Soil':'Terre','City at night':'Ville la nuit','Reflections':'Reflets','Near buildings':'Immeubles proches','Far buildings':'Immeubles lointains','River':'Rivière',
'Bakery window':'Vitrine de boulangerie','Cupcake cases':'Caissettes','Croissants':'Croissants','Loaf':'Pain','Baguettes':'Baguettes','Pie':'Tarte','Awning':'Store','Tropical fish':'Poissons tropicaux','Starfish':'Étoile de mer','Shell':'Coquillage','Small fish':'Petit poisson','Stripes':'Rayures','Big fish':'Gros poisson','Cherry blossoms':'Cerisiers en fleurs','Pale blossoms':'Fleurs pâles','Pink blossoms':'Fleurs roses','Deep pink blossoms':'Fleurs rose vif','Trunk':'Tronc','Snowy peak':'Sommet enneigé','Mountain':'Montagne','Butterfly garden':'Jardin aux papillons','Orange spots':'Taches orange','Orange butterfly':'Papillon orange','Light blue spots':'Taches bleu clair','Blue butterfly':'Papillon bleu','Pink butterfly':'Papillon rose','Tulips':'Tulipes','Daisy petals':'Pétales de marguerite','Daisy centers':'Cœurs de marguerite','Lavender':'Lavande','Stems':'Tiges','Meadow':'Prairie','Picnic':'Pique-nique','Lemonade':'Limonade','Watermelon':'Pastèque','Rind':'Écorce','Apples':'Pommes','Checks':'Carreaux','Blanket':'Couverture',
'Mountain lake':'Lac de montagne','Snow caps':'Neiges éternelles','Pines':'Pins','Mountains':'Montagnes','Dawn glow':'Lueur de l’aube','Shore':'Rive','Pine reflections':'Reflets des pins','Mountain reflection':'Reflet des montagnes','Lake':'Lac','Toy robot':'Robot jouet','Cool grays':'Gris froids','Only white, black and cyan this time. Mix them for the tinted grays of a metal toy.':'Seulement du blanc, du noir et du cyan cette fois. Mélange-les pour les gris teintés d’un jouet en métal.','Antenna light':'Lampe d’antenne','Eyes':'Yeux','Chest panel':'Panneau','Head':'Tête','Body':'Corps','Arms and legs':'Bras et jambes','Rug':'Tapis','Floor':'Sol','Pumpkin patch':'Champ de citrouilles','Pumpkins':'Citrouilles','Small pumpkins':'Petites citrouilles','Hay bale':'Botte de foin','Field':'Champ','Sunset glow':'Lueur du couchant','Dusk sky':'Ciel du soir','Northern lights':'Aurores boréales','Window light':'Fenêtre éclairée','Cabin':'Cabane','Green lights':'Lueurs vertes','Teal lights':'Lueurs turquoise','Violet lights':'Lueurs violettes','Far hills':'Collines lointaines','Flower market':'Marché aux fleurs','Roses':'Roses','Sunflowers':'Tournesols','Irises':'Iris','Peonies':'Pivoines','Marigolds':'Soucis','Bunting':'Fanions','Buckets':'Seaux','Stall':'Étal','Pavement':'Trottoir',
'Hummingbird':'Colibri','Throat':'Gorge','Flower':'Fleur','Head and back':'Tête et dos','Stem':'Tige','Stained-glass window':'Vitrail','Mend the glass':'Répare le verre','Every cracked pane closes up when you match its color. Eleven parts, and many shades sit close together.':'Chaque vitre fêlée se referme quand tu trouves sa couleur. Onze parties, et beaucoup de teintes très proches.','Rose center':'Cœur de la rosace','Rose petals':'Pétales de la rosace','Jewels':'Joyaux','Amber panes':'Vitres ambre','Upper glass':'Verre du haut','Deep blue panes':'Vitres bleu foncé','Green panes':'Vitres vertes','Purple panes':'Vitres violettes','Violet petals ring':'Anneau violet','Stone frame':'Encadrement de pierre','Seaside village':'Village au bord de la mer','Yellow houses':'Maisons jaunes','Pink houses':'Maisons roses','Blue houses':'Maisons bleues','Roofs':'Toits','Hill':'Colline','Chameleon':'Caméléon','Eye':'Œil','Front of body':'Avant du corps','Back of body':'Arrière du corps','Jungle mist':'Brume de la jungle','Winter cabin':'Chalet en hiver','Log walls':'Murs en rondins','Chimney':'Cheminée','Evening sky':'Ciel du soir','Koi pond':'Bassin aux carpes koï','The last pond':'Le dernier bassin','Oranges that sit side by side, and two waters a shade apart. Take your time: this is the finale.':'Des oranges côte à côte et deux eaux presque pareilles. Prends ton temps : c’est la finale.','Black spots':'Taches noires','Flower centers':'Cœurs des fleurs','Lilies':'Nénuphars','Red patches':'Taches rouges','Orange koi':'Carpes orange','White koi':'Carpe blanche','Lily pads':'Feuilles de nénuphar','Reeds':'Roseaux','Deep water':'Eau profonde'
},
ru:{
'Balloons':'Воздушные шары','Welcome, restorer':'Добро пожаловать, реставратор',
'Each faded part has a target color. Tap a paint to drop it in the bowl, the part paints itself as soon as the match reaches 95%. Every drop uses paint from your pot. Restored parts earn coins.':'У каждой выцветшей части есть нужный цвет. Нажмите на краску, чтобы капнуть её в миску: часть раскрасится, как только совпадение дойдёт до 95%. Каждая капля тратит краску. За восстановленные части дают монеты.',
'Magenta balloon':'Пурпурный шар','Yellow balloon':'Жёлтый шар','Cyan balloon':'Голубой шар',
'Fruit bowl':'Ваза с фруктами','Mixing two colors':'Смешиваем два цвета',
'Red, green and blue are not in your paint set. Mix them: one drop of each of two paints.':'Красной, зелёной и синей краски нет в наборе. Смешайте их: по одной капле двух красок.',
'Apple':'Яблоко','Pear':'Груша','Plum':'Слива','Penguin':'Пингвин','Light and dark':'Светлое и тёмное',
'This picture needs only <b>White</b> and <b>Black</b>. One drop of each makes <b>gray</b>. More white makes it lighter, more black makes it darker.':'Здесь нужны только <b>белая</b> и <b>чёрная</b>. По капле каждой дают <b>серый</b>. Больше белой — светлее, больше чёрной — темнее.',
'Belly':'Животик','Ice':'Лёд','Beach':'Пляж','All five paints':'Все пять красок','Mix, then shade':'Смешать и затемнить',
'Mix two paints to get the color, then add <b>White</b> to make it lighter or <b>Black</b> to make it darker.':'Смешайте две краски, чтобы получить цвет, потом добавьте <b>белой</b>, чтобы осветлить, или <b>чёрной</b>, чтобы затемнить.',
'Umbrellas':'Зонтики','Lighter and darker':'Светлее и темнее',
'All five paints are open now. Add <b>White</b> to a color to make it lighter, <b>Black</b> to make it darker. One drop of each is enough here.':'Теперь открыты все пять красок. Добавьте к цвету <b>белую</b>, чтобы он стал светлее, или <b>чёрную</b>, чтобы темнее. Здесь хватит одной капли каждой.',
'Light blue panels':'Светло-голубые клинья','Dark blue panels':'Тёмно-синие клинья','Pink panels':'Розовые клинья','Dark magenta panels':'Тёмно-пурпурные клинья','Light yellow panels':'Светло-жёлтые клинья','Olive panels':'Оливковые клинья',
'All five paints are open now. Mix a color, then add <b>White</b> to make it lighter or <b>Black</b> to make it darker.':'Теперь открыты все пять красок. Смешайте цвет, потом добавьте <b>белой</b>, чтобы осветлить, или <b>чёрной</b>, чтобы затемнить.',
'Sun':'Солнце','Sea':'Море','Sky':'Небо','Sand':'Песок','Umbrella':'Зонтик','Rock':'Камень',
'Cottage':'Домик','A bigger picture':'Картинка побольше',
'Ten parts share one paint pot, so plan your drops. You can tap any faded part to work on it. If the pot runs dry, coins can rescue the part you are on.':'У десяти частей один запас краски, так что планируйте капли. Нажмите на любую выцветшую часть, чтобы заняться ею. Если краска кончится, монеты помогут спасти текущую часть.',
'Flowers':'Цветы','Lit windows':'Светящиеся окна','Door':'Дверь','Roof':'Крыша','Walls':'Стены','Treetop':'Крона','Tree trunk':'Ствол','Grass':'Трава',
'Kitchen shelf':'Кухонная полка','Lemon':'Лимон','Mug':'Кружка','Leaves':'Листья','Teapot':'Чайник','Flower pot':'Цветочный горшок','Picture frame':'Рамка','Shelf':'Полка','Wall':'Стена',
'Fishbowl':'Аквариум','Goldfish':'Золотая рыбка','Little fish':'Маленькая рыбка','Water weed':'Водоросли','Pebbles':'Камешки','Water':'Вода','Table':'Стол',
'Sunset sail':'Парус на закате','Upper sky':'Верх неба','Middle sky':'Середина неба','Lower sky':'Низ неба','Sun on the water':'Солнце на воде','Sails':'Паруса','Boat':'Лодка',
'Birthday cake':'Праздничный торт','Flames':'Огоньки','Candles':'Свечи','Cherries':'Вишни','Frosting':'Глазурь','Sponge':'Бисквит','Plate':'Тарелка','Tablecloth':'Скатерть',
'Autumn fox':'Осенняя лиса','White chest':'Белая грудка','Fox':'Лиса','Falling leaves':'Падающие листья','Ground':'Земля','Hills':'Холмы',
'Lighthouse':'Маяк','Lamp':'Фонарь','Moon':'Луна','Light beam':'Луч света','Red stripes':'Красные полосы','Tower':'Башня','Rocks':'Скалы','Night sky':'Ночное небо',
'Jungle parrot':'Попугай в джунглях','Face':'Мордочка','Beak':'Клюв','Yellow feathers':'Жёлтые перья','Wing':'Крыло','Parrot':'Попугай','Tail':'Хвост','Branch':'Ветка','Dark leaves':'Тёмные листья','Bright leaves':'Светлые листья','Green leaves':'Зелёные листья','Jungle':'Джунгли',
'Snowman':'Снеговик','Hat':'Шляпа','Carrot nose':'Нос-морковка','Scarf':'Шарф','Buttons':'Пуговицы','Pine trees':'Ёлки','Snow':'Снег','Winter sky':'Зимнее небо',
'Desert':'Пустыня','Cactus flowers':'Цветы кактуса','Cactus':'Кактус','Stones':'Камни','Far dunes':'Дальние дюны','Near dunes':'Ближние дюны',
'Rocket':'Ракета','Nose cone':'Нос ракеты','Window':'Иллюминатор','Fins':'Стабилизаторы','Flame':'Пламя','Planet ring':'Кольцо планеты','Planet':'Планета','Space':'Космос',
'Ice cream':'Мороженое','Cherry':'Вишенка','Vanilla':'Ванильное','Mint':'Мятное','Strawberry':'Клубничное','Cone':'Рожок','Counter':'Прилавок',
'Rainy street':'Улица под дождём','Coat':'Пальто','Left house':'Левый дом','Right house':'Правый дом','Puddle':'Лужа','Street':'Улица','Rainy sky':'Дождливое небо',
'Peacock':'Павлин','Feather eyes':'Глазки на перьях','Eye centers':'Серединки глазков','Outer feathers':'Внешние перья','Middle feathers':'Средние перья','Inner feathers':'Внутренние перья','Garden':'Сад',
'Hot-air balloons':'Воздушные шары','Balloon center':'Середина шара','Yellow stripes':'Жёлтые полосы','Big balloon':'Большой шар','Small balloon':'Маленький шар','Far balloon':'Дальний шар','Basket':'Корзина','Clouds':'Облака','Tea party':'Чаепитие','Three paints only':'Только три краски','No yellow and no black today. Cyan and magenta make every blue and purple here, and white softens them.':'Сегодня без жёлтой и чёрной. Голубая и пурпурная дают все синие и фиолетовые оттенки, а белая делает их мягче.','Cups':'Чашки','Lid':'Крышка','Vase':'Ваза','Saucers':'Блюдца','Coral reef':'Коралловый риф','Fish':'Рыбки','Fan coral':'Коралл-веер','Branch coral':'Ветвистый коралл','Anemone':'Актиния','Brain coral':'Коралл-мозговик','Seaweed':'Водоросли','Vegetable garden':'Огород','Tomatoes':'Помидоры','Carrots':'Морковь','Carrot tops':'Ботва','Cabbages':'Капуста','Tomato leaves':'Листья помидоров','Fence':'Забор','Soil':'Земля','City at night':'Ночной город','Reflections':'Отражения','Near buildings':'Ближние дома','Far buildings':'Дальние дома','River':'Река',
'Bakery window':'Витрина пекарни','Cupcake cases':'Формочки','Croissants':'Круассаны','Loaf':'Батон','Baguettes':'Багеты','Pie':'Пирог','Awning':'Навес','Tropical fish':'Тропические рыбки','Starfish':'Морская звезда','Shell':'Ракушка','Small fish':'Маленькая рыбка','Stripes':'Полоски','Big fish':'Большая рыба','Cherry blossoms':'Цветущая сакура','Pale blossoms':'Бледные цветы','Pink blossoms':'Розовые цветы','Deep pink blossoms':'Ярко-розовые цветы','Trunk':'Ствол','Snowy peak':'Снежная вершина','Mountain':'Гора','Butterfly garden':'Сад бабочек','Orange spots':'Оранжевые пятна','Orange butterfly':'Оранжевая бабочка','Light blue spots':'Голубые пятна','Blue butterfly':'Синяя бабочка','Pink butterfly':'Розовая бабочка','Tulips':'Тюльпаны','Daisy petals':'Лепестки ромашек','Daisy centers':'Серединки ромашек','Lavender':'Лаванда','Stems':'Стебли','Meadow':'Луг','Picnic':'Пикник','Lemonade':'Лимонад','Watermelon':'Арбуз','Rind':'Корка','Apples':'Яблоки','Checks':'Клетки','Blanket':'Плед',
'Mountain lake':'Горное озеро','Snow caps':'Снежные шапки','Pines':'Сосны','Mountains':'Горы','Dawn glow':'Рассвет','Shore':'Берег','Pine reflections':'Отражения сосен','Mountain reflection':'Отражение гор','Lake':'Озеро','Toy robot':'Игрушечный робот','Cool grays':'Холодные серые','Only white, black and cyan this time. Mix them for the tinted grays of a metal toy.':'На этот раз только белая, чёрная и голубая. Смешивай их, чтобы получить серые оттенки металлической игрушки.','Antenna light':'Огонёк антенны','Eyes':'Глаза','Chest panel':'Панель','Head':'Голова','Body':'Корпус','Arms and legs':'Руки и ноги','Rug':'Коврик','Floor':'Пол','Pumpkin patch':'Тыквенное поле','Pumpkins':'Тыквы','Small pumpkins':'Маленькие тыквы','Hay bale':'Тюк сена','Field':'Поле','Sunset glow':'Закат','Dusk sky':'Вечернее небо','Northern lights':'Северное сияние','Window light':'Свет в окне','Cabin':'Домик','Green lights':'Зелёное сияние','Teal lights':'Бирюзовое сияние','Violet lights':'Фиолетовое сияние','Far hills':'Дальние холмы','Flower market':'Цветочный рынок','Roses':'Розы','Sunflowers':'Подсолнухи','Irises':'Ирисы','Peonies':'Пионы','Marigolds':'Бархатцы','Bunting':'Флажки','Buckets':'Вёдра','Stall':'Прилавок','Pavement':'Тротуар',
'Hummingbird':'Колибри','Throat':'Горлышко','Flower':'Цветок','Head and back':'Голова и спинка','Stem':'Стебель','Stained-glass window':'Витраж','Mend the glass':'Почини стекло','Every cracked pane closes up when you match its color. Eleven parts, and many shades sit close together.':'Каждое треснувшее стекло срастается, когда ты подбираешь его цвет. Одиннадцать частей, и многие оттенки очень похожи.','Rose center':'Центр розетки','Rose petals':'Лепестки розетки','Jewels':'Самоцветы','Amber panes':'Янтарные стёкла','Upper glass':'Верхнее стекло','Deep blue panes':'Тёмно-синие стёкла','Green panes':'Зелёные стёкла','Purple panes':'Фиолетовые стёкла','Violet petals ring':'Фиолетовое кольцо','Stone frame':'Каменная рама','Seaside village':'Приморская деревня','Yellow houses':'Жёлтые дома','Pink houses':'Розовые дома','Blue houses':'Голубые дома','Roofs':'Крыши','Hill':'Холм','Chameleon':'Хамелеон','Eye':'Глаз','Front of body':'Перед туловища','Back of body':'Зад туловища','Jungle mist':'Туман джунглей','Winter cabin':'Зимний домик','Log walls':'Бревенчатые стены','Chimney':'Труба','Evening sky':'Вечернее небо','Koi pond':'Пруд с карпами кои','The last pond':'Последний пруд','Oranges that sit side by side, and two waters a shade apart. Take your time: this is the finale.':'Оранжевые оттенки рядом и две почти одинаковые воды. Не торопись: это финал.','Black spots':'Чёрные пятна','Flower centers':'Серединки цветов','Lilies':'Кувшинки','Red patches':'Красные пятна','Orange koi':'Оранжевые карпы','White koi':'Белый карп','Lily pads':'Листья кувшинок','Reeds':'Камыш','Deep water':'Глубокая вода'
}};
// Daily picture: coins by streak day (day 7 and later pay the last value); budget = sum of recipe sizes × ratio.
const DAILY={ratio:1.2, coins:[15,20,25,30,40,50,60]};
window.GAME={name:'ColorBook', saveKey:'paintMender', firstProper:'house', daily:DAILY,
  logo:'img/logo-hero.jpg', shareLogo:'img/logo-card.jpg', levels:LEVELS, strings:STRINGS};
})();
