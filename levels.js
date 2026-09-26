// ColorBook: simple drawn pictures on the shared ColorEngine.
(function(){
const {INK,petals,circ,ring,holeRect}=CF;
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
'Kitchen shelf':'Étagère de cuisine','Lemon':'Citron','Mug':'Tasse','Leaves':'Feuilles','Teapot':'Théière','Flower pot':'Pot de fleurs','Picture frame':'Cadre','Shelf':'Étagère','Wall':'Mur'
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
'Kitchen shelf':'Кухонная полка','Lemon':'Лимон','Mug':'Кружка','Leaves':'Листья','Teapot':'Чайник','Flower pot':'Цветочный горшок','Picture frame':'Рамка','Shelf':'Полка','Wall':'Стена'
}};
window.GAME={name:'ColorBook', saveKey:'paintMender', firstProper:'house',
  logo:'img/logo-hero.jpg', shareLogo:'img/logo-card.jpg', levels:LEVELS, strings:STRINGS};
})();
