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
const rects=(xs,ys,w,h)=>xs.flatMap(x=>ys.map(y=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1"/>`)).join('');
const LEVELS=[
{ id:'balloons', title:'Balloons', sub:'Each balloon needs just one paint.', budget:8, tier:'easy', paints:['C','M','Y'], intro:'empty',
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
{ id:'fruit', title:'Fruit bowl', sub:'Two paints make a new color.', budget:12, tier:'easy', paints:['C','M','Y'], intro:'undo',
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
{ id:'penguin', title:'Penguin', sub:'Only white and black. Mix them for gray.', budget:8, tier:'easy', paints:['W','K'],
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
{ id:'beach', title:'Beach', sub:'White lightens. Black darkens.', tier:'easy', intro:'pick',
  tip:{title:'All five paints',text:'All five paints are open now. Mix a color, then add <b>White</b> to make it lighter or <b>Black</b> to make it darker.'},
  regions:[
    {id:'sun',name:'Sun',recipe:{M:1,Y:3},svg:'<circle cx="62" cy="46" r="22"/>'},
    {id:'sea',name:'Sea',recipe:{C:3,M:1},svg:'<path d="M0 118H320V168Q240 158 160 166T0 160Z"/>'},
    {id:'sky',name:'Sky',recipe:{W:2,C:1},svg:'<rect x="0" y="0" width="320" height="130"/>'},
    {id:'sand',name:'Sand',recipe:{W:1,Y:1},svg:'<path d="M0 158Q80 150 160 160T320 156V240H0Z"/>'},
    {id:'umbrella',name:'Umbrella',recipe:{W:1,M:2,Y:1},svg:'<path d="M70 150A52 36 0 0 1 174 150Q161 142 148 150Q135 142 122 150Q109 142 96 150Q83 142 70 150Z"/>'},
    {id:'rock',name:'Rock',recipe:{W:2,K:1},svg:'<path d="M232 170q6-24 28-26q20 0 28 24q-2 6-28 6t-28-4z"/>'},
  ],
  order:['sky','sun','sea','sand','rock','umbrella'],
  decor:`<g fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" pointer-events="none">
    <line x1="122" y1="146" x2="122" y2="214" stroke-width="3"/><path d="M122 114L109 146M122 114L135 146"/>
    <path d="M196 52q8-8 16 0q8-8 16 0"/><path d="M236 70q6-6 12 0q6-6 12 0"/>
    <path d="M20 138q10-6 20 0M130 130q10-6 20 0M240 136q10-6 20 0"/></g>`
},
{ id:'house', title:'Cottage', sub:'Tap a faded part, mix its color, paint it back.', tier:'normal', intro:'hint',
  tip:{title:'A bigger picture',text:'Ten parts share one paint pot, so plan your drops. You can tap any faded part to work on it. If the pot runs dry, coins can rescue the part you are on.'},
  regions:[
    {id:'sun',name:'Sun',recipe:{W:1,Y:2},svg:'<circle cx="264" cy="46" r="24"/>'},
    {id:'flower',name:'Flowers',recipe:{W:1,M:1},svg:petals(284,196)+petals(304,206)},
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
    {id:'sun',name:'Sun',recipe:{W:2,Y:5},svg:'<circle cx="256" cy="46" r="22"/>'},
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
    {id:'scoop3',name:'Vanilla',recipe:{W:5,Y:2},svg:'<circle cx="180" cy="76" r="22"/>'},
    {id:'scoop2',name:'Mint',recipe:{W:3,C:1,Y:2},svg:'<circle cx="142" cy="80" r="22"/>'},
    {id:'scoop1',name:'Strawberry',recipe:{W:2,M:1},svg:'<circle cx="160" cy="112" r="30"/>'},
    {id:'cone',name:'Cone',recipe:{M:1,Y:3,K:1},svg:'<path d="M132 116L160 214L188 116Z"/>'},
    {id:'table',name:'Counter',recipe:{W:2,C:1,M:1},svg:'<path d="M0 196H320V240H0Z"/>'},
    {id:'wallp',name:'Wall',recipe:{W:5,M:1},svg:'<rect x="0" y="0" width="320" height="240"/>'},
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
    {id:'puddle',name:'Puddle',recipe:{W:2,C:2,K:3},svg:'<ellipse cx="236" cy="214" rx="40" ry="7"/>'},
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
    {id:'body',name:'Peacock',recipe:{C:4,M:1},svg:'<circle cx="152" cy="68" r="10"/><path d="M146 72Q160 72 162 90Q162 116 178 150Q182 190 160 198Q138 190 142 150Q150 116 146 72Z"/>'},
    {id:'wing',name:'Wing',recipe:{C:4,M:1,K:1},svg:'<path d="M160 132Q184 150 176 188Q160 178 156 152Z"/>'},
    {id:'spots',name:'Feather eyes',recipe:{M:1,Y:4,K:1},svg:fanDots(160,170,120,9,-166,-14,8)},
    {id:'centers',name:'Eye centers',recipe:{C:3,M:2,K:2},svg:fanDots(160,170,120,4.5,-166,-14,8)},
    {id:'tailOuter',name:'Outer feathers',recipe:{C:3,Y:3,K:1},svg:fan(160,170,106,17,36,-166,-14,8)},
    {id:'tailMid',name:'Middle feathers',recipe:{C:5,M:1,Y:2},svg:fan(160,170,72,15,28,-150,-30,7)},
    {id:'tailInner',name:'Inner feathers',recipe:{C:4,M:1,Y:1},svg:fan(160,170,42,12,20,-160,-20,6)},
    {id:'grass',name:'Grass',recipe:{C:1,Y:2,K:1},svg:'<path d="M0 196Q160 184 320 196V240H0Z"/>'},
    {id:'bg',name:'Garden',recipe:{W:5,C:1,Y:1},svg:'<rect x="0" y="0" width="320" height="240"/>'},
  ],
  order:['bg','grass','tailOuter','spots','centers','tailMid','tailInner','body','wing','beak'],
  decor:`<g pointer-events="none"><circle cx="150" cy="66" r="2" fill="${INK}"/>
    <g fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"><path d="M150 58l-4-12M154 58l0-13M158 59l4-12"/><path d="M152 198l-2 14M166 198l2 14"/></g>
    <g fill="${INK}"><circle cx="146" cy="45" r="2"/><circle cx="154" cy="44" r="2"/><circle cx="162" cy="46" r="2"/></g></g>`
}
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
'Belly':'Ventre','Ice':'Glace','Beach':'Plage','All five paints':'Les cinq peintures',
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
'Peacock':'Paon','Feather eyes':'Ocelles','Eye centers':'Cœurs des ocelles','Outer feathers':'Plumes extérieures','Middle feathers':'Plumes du milieu','Inner feathers':'Plumes intérieures','Garden':'Jardin'
},
ru:{
'Balloons':'Воздушные шары','Welcome, restorer':'Добро пожаловать, реставратор',
'Each faded part has a target color. Tap a paint to drop it in the bowl, the part paints itself as soon as the match reaches 95%. Every drop uses paint from your pot. Restored parts earn coins.':'У каждой выцветшей части есть нужный цвет. Нажмите на краску, чтобы капнуть её в миску: часть раскрасится, как только совпадение дойдёт до 95%. Каждая капля тратит краску. За восстановленные части дают монеты.',
'Magenta balloon':'Пурпурный шар','Yellow balloon':'Жёлтый шар','Cyan balloon':'Голубой шар',
'Fruit bowl':'Ваза с фруктами','Mixing two colors':'Смешиваем два цвета',
'Red, green and blue are not in your paint set. Mix them: one drop of each of two paints.':'Красной, зелёной и синей краски нет в наборе. Смешайте их: по одной капле двух красок.',
'Apple':'Яблоко','Pear':'Груша','Plum':'Слива','Penguin':'Пингвин','Light and dark':'Светлое и тёмное',
'This picture needs only <b>White</b> and <b>Black</b>. One drop of each makes <b>gray</b>. More white makes it lighter, more black makes it darker.':'Здесь нужны только <b>белая</b> и <b>чёрная</b>. По капле каждой дают <b>серый</b>. Больше белой — светлее, больше чёрной — темнее.',
'Belly':'Животик','Ice':'Лёд','Beach':'Пляж','All five paints':'Все пять красок',
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
'Peacock':'Павлин','Feather eyes':'Глазки на перьях','Eye centers':'Серединки глазков','Outer feathers':'Внешние перья','Middle feathers':'Средние перья','Inner feathers':'Внутренние перья','Garden':'Сад'
}};
// Daily picture: coins by streak day (day 7 and later pay the last value); budget = sum of recipe sizes × ratio.
const DAILY={ratio:1.2, coins:[15,20,25,30,40,50,60]};
window.GAME={name:'ColorBook', saveKey:'paintMender', firstProper:'house', daily:DAILY,
  logo:'img/logo-hero.jpg', shareLogo:'img/logo-card.jpg', levels:LEVELS, strings:STRINGS};
})();
