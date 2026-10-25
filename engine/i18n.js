// ColorEngine localization. Loaded before a game's levels.js.
// Strings are keyed by their English text: t('Play') → 'Jouer'. Missing keys fall back to English.
// A game adds its content strings (titles, part names, tips, quiz facts) with I18N.add({fr:{…}, ru:{…}}).
window.I18N=(function(){
  const LANGS=['en','fr','ru'], KEY='pontpixel-lang';
  let pref='auto'; try{pref=localStorage.getItem(KEY)||'auto';}catch(e){}
  const sys=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'en'])
    .map(l=>String(l).slice(0,2).toLowerCase()).find(l=>LANGS.includes(l))||'en';
  const lang=LANGS.includes(pref)?pref:sys;
  document.documentElement.lang=lang;
  const D={fr:{},ru:{}};
  function add(dict){for(const l in dict) if(D[l]) Object.assign(D[l],dict[l]);}
  // t('Hello {name}', {name:'Ann'})
  function t(s,vars){
    let v=(lang!=='en'&&D[lang][s])||s;
    return vars?String(v).replace(/\{(\w+)\}/g,(m,k)=>vars[k]!=null?vars[k]:m):v;
  }
  // Plural noun with its number: tn(5,'drop') → '5 drops' / '5 gouttes' / '5 капель'
  const PL={en:{drop:['drop','drops'],coin:['coin','coins'],day:['day','days'],picture:['picture','pictures'],part:['part','parts'],star:['star','stars']}};
  function form(n){
    n=Math.abs(n);
    if(lang==='ru'){const a=n%10,b=n%100; return a===1&&b!==11?0:a>=2&&a<=4&&(b<12||b>14)?1:2;}
    if(lang==='fr') return n<2?0:1;
    return n===1?0:1;
  }
  function tn(n,noun){const f=(PL[lang]&&PL[lang][noun])||PL.en[noun]; return n+' '+(f[Math.min(form(n),f.length-1)]);}
  function setPref(p){try{localStorage.setItem(KEY,p);}catch(e){}}
  return {LANGS,lang,pref,sys,add,t,tn,PL,setPref};
})();

// ---------- Engine strings ----------
I18N.PL.fr={drop:['goutte','gouttes'],coin:['pièce','pièces'],day:['jour','jours'],picture:['image','images'],part:['partie','parties'],star:['étoile','étoiles']};
I18N.PL.ru={drop:['капля','капли','капель'],coin:['монета','монеты','монет'],day:['день','дня','дней'],picture:['картинка','картинки','картинок'],part:['часть','части','частей'],star:['звезда','звезды','звёзд']};
I18N.add({
fr:{
'+{n} paint':'+{n} de peinture','A friend':'Un ami','Add {paint}':'Ajouter {paint}','All pictures restored':'Toutes les images sont restaurées',
'Art quiz · +{n} paint':'Quiz d’art · +{n} de peinture','Art quiz: answer for +{n} paint':'Quiz d’art : répondez pour +{n} de peinture','Auto':'Auto','Back to menu':'Retour au menu',
'Beat {from}: {score}★  ·  You: {you}★':'Battez {from} : {score}★  ·  Vous : {you}★','Black':'Noir','Boosters help here. Rewards are ×{m}.':'Les bonus aident ici. Récompenses ×{m}.',
'Bowl emptied. Paint refunded: {drops}.':'Bol vidé. Peinture remboursée : {drops}.','Bowl poured out. Paint lost: {drops}. An Empty booster gives the paint back.':'Bol renversé. Peinture perdue : {drops}. Le bonus Vider rend la peinture.',
'Brightness is close. The hue is off.':'La luminosité est proche. La teinte n’y est pas.','Can you beat me?':'Tu peux faire mieux ?','Can you beat my score?':'Tu peux battre mon score ?',
'Challenge a friend':'Défier un ami','Challenge copied. Paste it to your friend.':'Défi copié. Collez-le pour votre ami.','Coins':'Pièces','Collection':'Collection','Continue':'Continuer',
'Copy this and send it to your friend:':'Copiez ceci et envoyez-le à votre ami :','Correct! +{coins} · streak: {days}.':'Bravo ! +{coins} · série : {days}.','Correct! +{n} paint.':'Bravo ! +{n} de peinture.',
'Cyan':'Cyan','Daily art quiz':'Quiz d’art du jour','Daily quiz done · streak: {days}':'Quiz du jour fait · série : {days}','Dark':'Sombre','Did you know?':'Le saviez-vous ?','Done':'OK',
'Drop taken back. Paint refunded.':'Goutte reprise. Peinture remboursée.','Drops used <b>{used}</b> · minimum <b>{min}</b>':'Gouttes utilisées <b>{used}</b> · minimum <b>{min}</b>','Empty':'Vider','FREE':'GRATUIT',
'Faded picture':'Image décolorée','First, finish the warm-up pictures to unlock it ({pics}).':'Terminez d’abord les images d’entraînement pour la débloquer ({pics}).','Gallery':'Galerie','Hall':'Salle','Hard':'Difficile','Hint':'Indice',
'Hint: add {paint} next.':'Indice : ajoutez {paint}.','Hint: take out the {paint}. {part} has none.':'Indice : retirez {paint}. {part} n’en contient pas.','Hint: your mix is right.':'Indice : votre mélange est bon.','Home':'Accueil',
'I beat your {score}★! I got {total}/{max}★ on "{title}" in {game}.':'J’ai battu tes {score}★ ! J’ai eu {total}/{max}★ sur « {title} » dans {game}.',
"I got {total}/{max}★ on \"{title}\" in {game}. You're still ahead with {score}★, for now.":'J’ai eu {total}/{max}★ sur « {title} » dans {game}. Tu mènes encore avec {score}★, pour l’instant.',
'I restored "{title}" in {game} with {total}/{max}★':'J’ai restauré « {title} » dans {game} avec {total}/{max}★',
'In which century was it made?':'De quel siècle date-t-elle ?','In which century was {title} made?':'De quel siècle date {title} ?','Keep painting':'Continuer à peindre','Language':'Langue','Leave':'Quitter',
'Leave this picture?':'Quitter cette image ?','Less spare paint and closer shades than usual.':'Moins de peinture en réserve et des teintes plus proches que d’habitude.',"Let's paint":'À vos pinceaux','Light':'Clair','Locked':'Verrouillé',
'Magenta':'Magenta','Match':'Correspondance','Match! Painting…':'Trouvé ! Peinture…','Menu':'Menu','Mix to match. Every drop uses paint.':'Mélangez pour retrouver la couleur. Chaque goutte coûte de la peinture.','Mixing table':'Table de mélange',
'New booster':'Nouveau bonus','New booster: {name}':'Nouveau bonus : {name}','Next':'Suivante','Next picture':'Image suivante','Nightmare':'Cauchemar','Not quite. Check which paints the target needs.':'Pas tout à fait. Vérifiez quelles peintures il faut.',
"Not quite. It's {answer}.":'Pas tout à fait. C’est {answer}.',"Not quite. It's {answer}. Your streak continues: {days}.":'Pas tout à fait. C’est {answer}. Votre série continue : {days}.',
'Oops! {part} has no <b>{paint}</b> in it.':'Oups ! {part} ne contient pas de <b>{paint}</b>.','Open':'Ouverte','Out of paint':'Plus de peinture','Paint left for this picture':'Peinture restante pour cette image',
'Parts restored: {done} of {all}.':'Parties restaurées : {done} sur {all}.','Parts you restored in this picture will be lost. Coins you earned stay.':'Les parties restaurées de cette image seront perdues. Vos pièces restent.',
'Pic {n}':'Img {n}','Pick':'Retirer','Picture {i} of {n}':'Image {i} sur {n}','Play':'Jouer','Play again':'Rejouer','Play next picture':'Jouer l’image suivante',
'Pours out the whole bowl and gives all its paint back.':'Vide tout le bol et rend toute sa peinture.','Replay':'Rejouer','Restart <b>{part}</b> with fresh paint and keep the rest of your work.':'Recommencez <b>{part}</b> avec de la peinture neuve et gardez le reste de votre travail.',
'Restart {part}':'Recommencer {part}','Restarting a part costs {price}. You have {have}.':'Recommencer une partie coûte {price}. Vous en avez {have}.','Restore <b>{title}</b> with more than <b>{score}★</b>.':'Restaurez <b>{title}</b> avec plus de <b>{score}★</b>.',
'Restore again':'Restaurer à nouveau','Restore it':'Restaurer','Restored':'Restauré','Room {n}':'Salle {n}','Send your score back':'Renvoyer votre score','Send {from} your score anyway?':'Envoyer quand même votre score à {from} ?','Settings':'Réglages',
'Shows the next paint to add for the part you are on. That part can earn at most 2 stars.':'Montre la prochaine peinture à ajouter. Cette partie rapporte au plus 2 étoiles.','Start picture over':'Recommencer l’image',
'Takes back your last drop and refunds its paint.':'Reprend votre dernière goutte et rend sa peinture.','Tap <b>Undo</b> to take that drop back. This one is free.':'Touchez <b>Annuler</b> pour reprendre cette goutte. C’est gratuit cette fois.',
'Tap it, then tap any drop in the bowl to remove just that color. The paint comes back.':'Touchez-le, puis une goutte du bol pour retirer juste cette couleur. La peinture est rendue.','Tap the drop you want to take out.':'Touchez la goutte à retirer.',
'Tell {from} you won.':'Dites à {from} que vous avez gagné.','That was the last picture.':'C’était la dernière image.',"That's Undo. You have {n} left, then they cost {price}.":'Voilà Annuler. Il vous en reste {n}, ensuite ils coûtent {price}.',
'The bowl is full. Take drops out or empty it.':'Le bol est plein. Retirez des gouttes ou videz-le.','Theme':'Thème','Think a friend can beat {score}★? Send them this picture.':'Un ami peut battre {score}★ ? Envoyez-lui cette image.',
"This browser can't vibrate (iPhone Safari doesn't support it).":'Ce navigateur ne peut pas vibrer (Safari sur iPhone ne le permet pas).','Too dark. Try adding white.':'Trop sombre. Ajoutez du blanc.','Too light. Add color or a touch of black.':'Trop clair. Ajoutez de la couleur ou une touche de noir.',
'Undo':'Annuler','Privacy policy':'Politique de confidentialité','Terms of use':'Conditions d’utilisation','Very little spare paint and colors that look almost the same.':'Très peu de peinture en réserve et des couleurs presque identiques.','Vibration':'Vibration','Where does {title} hang today?':'Où est exposé {title} aujourd’hui ?',
'Which country was the artist from?':'De quel pays venait l’artiste ?','Which country was the artist of {title} from?':'De quel pays venait l’auteur de {title} ?','Which museum holds it today?':'Quel musée la conserve aujourd’hui ?','Which style is it?':'Quel est son style ?',
'Which style is {title}?':'Quel est le style de {title} ?','White':'Blanc','Who painted this?':'Qui l’a peinte ?','Who painted {title}?':'Qui a peint {title} ?','Yellow':'Jaune',"You beat {from}'s {score}★!":'Vous avez battu les {score}★ de {from} !',
'You get {n} free. After that, {price} each.':'Vous en recevez {n} gratuits. Ensuite, {price} l’unité.','Your move.':'À toi de jouer.','Your name':'Votre nom','Your name (optional)':'Votre nom (facultatif)','add paint':'ajoutez de la peinture',
'day {n}':'jour {n}','earned':'gagnées','locked':'verrouillé','perfect!':'parfait !','perfect: {drops}':'parfait : {drops}','{done} of {all} restored':'{done} sur {all} restaurées','{drops}, min {min}':'{drops}, min {min}',
'{from} challenged you on {title}. Beat {score}★ there.':'{from} vous défie sur {title}. Battez {score}★.','{from} challenged you on {title}. Beat {score}★.':'{from} vous défie sur {title}. Battez {score}★.','{from} challenged you!':'{from} vous défie !',
'{from} still leads: {score}★ vs your {you}★. Replay to beat it.':'{from} mène encore : {score}★ contre vos {you}★. Rejouez pour gagner.','{name} bought: {coins}':'{name} acheté : {coins}','{name} costs {price}. You have {have}.':'{name} coûte {price}. Vous en avez {have}.',
'{name} unlocks in picture {n}: {title}':'{name} se débloque à l’image {n} : {title}','{name}, locked until picture {n}':'{name}, verrouillé jusqu’à l’image {n}','{n} left':'{n} restants','{paint} taken out. Paint refunded.':'{paint} retiré. Peinture remboursée.',
'{part} restarted. Paint refilled.':'{part} recommencé. Peinture rechargée.','{p}% is not close enough.':'{p} %, ce n’est pas assez proche.','{p}% match':'{p} % de correspondance','{tier} picture':'Image : {tier}','{tier} picture.':'Image : {tier}.','{title} restored':'{title} restauré'
},
ru:{
'+{n} paint':'+{n} краски','A friend':'Друг','Add {paint}':'Добавить: {paint}','All pictures restored':'Все картинки восстановлены',
'Art quiz · +{n} paint':'Арт-викторина · +{n} краски','Art quiz: answer for +{n} paint':'Арт-викторина: ответьте и получите +{n} краски','Auto':'Авто','Back to menu':'В меню',
'Beat {from}: {score}★  ·  You: {you}★':'Обойдите {from}: {score}★  ·  У вас: {you}★','Black':'Чёрная','Boosters help here. Rewards are ×{m}.':'Здесь помогут бустеры. Награды ×{m}.',
'Bowl emptied. Paint refunded: {drops}.':'Миска вылита. Краска возвращена: {drops}.','Bowl poured out. Paint lost: {drops}. An Empty booster gives the paint back.':'Миска вылита. Краска потеряна: {drops}. Бустер «Вылить» возвращает краску.',
'Brightness is close. The hue is off.':'Яркость почти та, но оттенок не тот.','Can you beat me?':'Сможешь лучше?','Can you beat my score?':'Сможешь побить мой счёт?',
'Challenge a friend':'Бросить вызов другу','Challenge copied. Paste it to your friend.':'Вызов скопирован. Отправьте его другу.','Coins':'Монеты','Collection':'Коллекция','Continue':'Продолжить',
'Copy this and send it to your friend:':'Скопируйте и отправьте другу:','Correct! +{coins} · streak: {days}.':'Верно! +{coins} · серия: {days}.','Correct! +{n} paint.':'Верно! +{n} краски.',
'Cyan':'Голубая','Daily art quiz':'Арт-викторина дня','Daily quiz done · streak: {days}':'Викторина дня пройдена · серия: {days}','Dark':'Тёмная','Did you know?':'А вы знали?','Done':'Готово',
'Drop taken back. Paint refunded.':'Капля убрана. Краска возвращена.','Drops used <b>{used}</b> · minimum <b>{min}</b>':'Потрачено капель <b>{used}</b> · минимум <b>{min}</b>','Empty':'Вылить','FREE':'БЕСПЛАТНО',
'Faded picture':'Выцветшая картинка','First, finish the warm-up pictures to unlock it ({pics}).':'Сначала пройдите разминочные картинки, чтобы открыть её ({pics}).','Gallery':'Галерея','Hall':'Зал','Hard':'Сложно','Hint':'Подсказка',
'Hint: add {paint} next.':'Подсказка: добавьте {paint}.','Hint: take out the {paint}. {part} has none.':'Подсказка: уберите {paint}. В «{part}» её нет.','Hint: your mix is right.':'Подсказка: смесь правильная.','Home':'Главная',
'I beat your {score}★! I got {total}/{max}★ on "{title}" in {game}.':'Я побил твои {score}★! У меня {total}/{max}★ за «{title}» в {game}.',
"I got {total}/{max}★ on \"{title}\" in {game}. You're still ahead with {score}★, for now.":'У меня {total}/{max}★ за «{title}» в {game}. Ты пока впереди с {score}★.',
'I restored "{title}" in {game} with {total}/{max}★':'Я восстановил «{title}» в {game}: {total}/{max}★',
'In which century was it made?':'В каком веке она создана?','In which century was {title} made?':'В каком веке создана картина «{title}»?','Keep painting':'Рисовать дальше','Language':'Язык','Leave':'Выйти',
'Leave this picture?':'Выйти из картинки?','Less spare paint and closer shades than usual.':'Меньше запаса краски и более близкие оттенки, чем обычно.',"Let's paint":'Начать','Light':'Светлая','Locked':'Закрыто',
'Magenta':'Пурпурная','Match':'Совпадение','Match! Painting…':'Совпало! Раскрашиваем…','Menu':'Меню','Mix to match. Every drop uses paint.':'Смешайте нужный цвет. Каждая капля тратит краску.','Mixing table':'Стол для смешивания',
'New booster':'Новый бустер','New booster: {name}':'Новый бустер: {name}','Next':'Следующая','Next picture':'Следующая картинка','Nightmare':'Кошмар','Not quite. Check which paints the target needs.':'Не совсем. Проверьте, какие краски нужны.',
"Not quite. It's {answer}.":'Не совсем. Правильный ответ: {answer}.',"Not quite. It's {answer}. Your streak continues: {days}.":'Не совсем. Правильный ответ: {answer}. Серия продолжается: {days}.',
'Oops! {part} has no <b>{paint}</b> in it.':'Ой! В «{part}» нет краски <b>{paint}</b>.','Open':'Открыта','Out of paint':'Краска закончилась','Paint left for this picture':'Осталось краски на картинку',
'Parts restored: {done} of {all}.':'Восстановлено частей: {done} из {all}.','Parts you restored in this picture will be lost. Coins you earned stay.':'Восстановленные части этой картинки пропадут. Заработанные монеты останутся.',
'Pic {n}':'Карт. {n}','Pick':'Убрать','Picture {i} of {n}':'Картинка {i} из {n}','Play':'Играть','Play again':'Сыграть ещё','Play next picture':'Играть следующую картинку',
'Pours out the whole bowl and gives all its paint back.':'Выливает всю миску и возвращает всю краску.','Replay':'Ещё раз','Restart <b>{part}</b> with fresh paint and keep the rest of your work.':'Начните «<b>{part}</b>» заново со свежей краской, остальное сохранится.',
'Restart {part}':'Заново: {part}','Restarting a part costs {price}. You have {have}.':'Перезапуск части стоит {price}. У вас {have}.','Restore <b>{title}</b> with more than <b>{score}★</b>.':'Восстановите «<b>{title}</b>» больше чем на <b>{score}★</b>.',
'Restore again':'Восстановить снова','Restore it':'Восстановить','Restored':'Восстановлено','Room {n}':'Зал {n}','Send your score back':'Отправить свой счёт','Send {from} your score anyway?':'Всё равно отправить счёт ({from})?','Settings':'Настройки',
'Shows the next paint to add for the part you are on. That part can earn at most 2 stars.':'Показывает, какую краску добавить дальше. За эту часть будет не больше 2 звёзд.','Start picture over':'Начать картинку заново',
'Takes back your last drop and refunds its paint.':'Убирает последнюю каплю и возвращает краску.','Tap <b>Undo</b> to take that drop back. This one is free.':'Нажмите <b>Отменить</b>, чтобы убрать эту каплю. Сейчас бесплатно.',
'Tap it, then tap any drop in the bowl to remove just that color. The paint comes back.':'Нажмите его, потом любую каплю в миске, чтобы убрать только этот цвет. Краска вернётся.','Tap the drop you want to take out.':'Нажмите каплю, которую нужно убрать.',
'Tell {from} you won.':'Расскажите {from}, что вы победили.','That was the last picture.':'Это была последняя картинка.',"That's Undo. You have {n} left, then they cost {price}.":'Это «Отменить». Осталось {n}, дальше они стоят {price}.',
'The bowl is full. Take drops out or empty it.':'Миска полна. Уберите капли или вылейте её.','Theme':'Тема','Think a friend can beat {score}★? Send them this picture.':'Друг сможет больше {score}★? Отправьте ему эту картинку.',
"This browser can't vibrate (iPhone Safari doesn't support it).":'Этот браузер не умеет вибрировать (Safari на iPhone не поддерживает).','Too dark. Try adding white.':'Слишком темно. Добавьте белой.','Too light. Add color or a touch of black.':'Слишком светло. Добавьте цвета или немного чёрной.',
'Undo':'Отменить','Privacy policy':'Политика конфиденциальности','Terms of use':'Условия использования','Very little spare paint and colors that look almost the same.':'Очень мало запаса краски и почти одинаковые цвета.','Vibration':'Вибрация','Where does {title} hang today?':'Где сейчас хранится «{title}»?',
'Which country was the artist from?':'Из какой страны художник?','Which country was the artist of {title} from?':'Из какой страны автор картины «{title}»?','Which museum holds it today?':'В каком музее она сейчас?','Which style is it?':'Какой это стиль?',
'Which style is {title}?':'В каком стиле «{title}»?','White':'Белая','Who painted this?':'Кто автор?','Who painted {title}?':'Кто написал «{title}»?','Yellow':'Жёлтая',"You beat {from}'s {score}★!":'Вы побили {score}★ ({from})!',
'You get {n} free. After that, {price} each.':'{n} бесплатно. Дальше — {price} за штуку.','Your move.':'Твой ход.','Your name':'Ваше имя','Your name (optional)':'Ваше имя (необязательно)','add paint':'добавьте краску',
'day {n}':'день {n}','earned':'заработано','locked':'закрыто','perfect!':'идеально!','perfect: {drops}':'идеально: {drops}','{done} of {all} restored':'восстановлено {done} из {all}','{drops}, min {min}':'{drops}, минимум {min}',
'{from} challenged you on {title}. Beat {score}★ there.':'{from} бросает вызов: «{title}». Наберите больше {score}★.','{from} challenged you on {title}. Beat {score}★.':'{from} бросает вызов: «{title}». Наберите больше {score}★.','{from} challenged you!':'{from} бросает вам вызов!',
'{from} still leads: {score}★ vs your {you}★. Replay to beat it.':'{from} пока впереди: {score}★ против ваших {you}★. Сыграйте ещё раз.','{name} bought: {coins}':'Куплено «{name}»: {coins}','{name} costs {price}. You have {have}.':'«{name}» стоит {price}. У вас {have}.',
'{name} unlocks in picture {n}: {title}':'«{name}» откроется на картинке {n}: {title}','{name}, locked until picture {n}':'«{name}» закрыт до картинки {n}','{n} left':'осталось {n}','{paint} taken out. Paint refunded.':'Убрано: {paint}. Краска возвращена.',
'{part} restarted. Paint refilled.':'«{part}» заново. Краска пополнена.','{p}% is not close enough.':'{p}% — недостаточно близко.','{p}% match':'совпадение {p}%','{tier} picture':'Картинка: {tier}','{tier} picture.':'Картинка: {tier}.','{title} restored':'«{title}» восстановлена'
}});
// Sound and daily picture
I18N.add({
fr:{
'Sound':'Son','Daily':'Du jour','Daily picture':'Image du jour','Daily picture: {title}':'Image du jour : {title}',
'Less paint than usual: {drops}.':'Moins de peinture que d’habitude : {drops}.',
"Today's reward is already yours. This one is for fun.":'La récompense du jour est déjà à vous. Celle-ci, c’est pour le plaisir.',
'Restore it for {coins}. Streak: {days}.':'Restaurez-la pour {coins}. Série : {days}.',
'Daily picture done! +{coins} · streak: {days}.':'Image du jour terminée ! +{coins} · série : {days}.',
'Daily picture done · streak: {days}':'Image du jour faite · série : {days}'
},
ru:{
'Sound':'Звук','Daily':'Сегодня','Daily picture':'Картинка дня','Daily picture: {title}':'Картинка дня: {title}',
'Less paint than usual: {drops}.':'Краски меньше обычного: {drops}.',
"Today's reward is already yours. This one is for fun.":'Сегодняшняя награда уже ваша. Эта — просто для удовольствия.',
'Restore it for {coins}. Streak: {days}.':'Восстановите её и получите {coins}. Серия: {days}.',
'Daily picture done! +{coins} · streak: {days}.':'Картинка дня готова! +{coins} · серия: {days}.',
'Daily picture done · streak: {days}':'Картинка дня пройдена · серия: {days}'
}});
// Hand tutorial lessons
I18N.add({
fr:{'Tap <b>{paint}</b> to put a drop in the bowl.':'Touchez <b>{paint}</b> pour verser une goutte dans le bol.','Now drag <b>{paint}</b> into the bowl.':'Maintenant, faites glisser <b>{paint}</b> dans le bol.','Tap any faded part to paint it next.':'Touchez une partie décolorée pour la peindre ensuite.'},
ru:{'Tap <b>{paint}</b> to put a drop in the bowl.':'Нажмите <b>{paint}</b>, чтобы капнуть в миску.','Now drag <b>{paint}</b> into the bowl.':'Теперь перетащите <b>{paint}</b> в миску.','Tap any faded part to paint it next.':'Нажмите на любую выцветшую часть, чтобы раскрасить её следующей.'}
});
// Redesigned screens (GAME.v2): parts strip, mixing card, new boosters, daily card, tips
I18N.add({
fr:{'Takes back your last drop. You can also tap a paint in the bowl to take out just that one. The paint comes back.':'Reprend votre dernière goutte. Vous pouvez aussi toucher une peinture dans le bol pour retirer seulement celle-là. La peinture revient.',
'Magic':'Magie','Puts the next right drop in the bowl, or takes a wrong one out. That part can earn at most 2 stars.':'Verse la bonne goutte suivante dans le bol, ou retire une mauvaise. Cette partie rapporte au plus 2 étoiles.',
'+5 paint':'+5 peinture','Adds 5 drops to the paint pot.':'Ajoute 5 gouttes au pot de peinture.',
'Free ×3':'Gratuit ×3',"Your next 3 drops don't use paint from the pot. They still count for stars.":'Vos 3 prochaines gouttes ne prennent pas de peinture dans le pot. Elles comptent quand même pour les étoiles.',
'{n} free':'{n} gratuites','Parts of the picture':'Parties de l’image','Target':'Cible','Mix':'Mélange','Paint':'Peinture',
'Your mix. Tap to pour out the bowl.':'Votre mélange. Touchez pour vider le bol.','Tap to pour out':'Touchez pour vider',
'done':'terminée','selected':'sélectionnée','to do':'à faire','So close':'Presque','Too light':'Trop clair','Too dark':'Trop foncé','The color is off':'La teinte n’y est pas',
'{n} {paint}. Tap to take one out.':'{n} {paint}. Touchez pour en retirer une.','Your drops show up here':'Vos gouttes apparaissent ici',
'over par':'au-dessus du par','{used} drops used, par {min}':'{used} gouttes utilisées, par {min}','{n} of 3 stars at this pace':'{n} étoiles sur 3 à ce rythme',
'Tap a paint to start':'Touchez une peinture pour commencer','{done} of {all} parts restored':'{done} parties restaurées sur {all}',
'Further off. Try Undo.':'Plus loin de la cible. Essayez Annuler.','Bowl poured out. Paint refunded.':'Bol vidé. Peinture rendue.',
'Your mix is already right.':'Votre mélange est déjà juste.','The pot is empty.':'Le pot est vide.','Took out {paint}':'{paint} retiré',
'+5 drops in the pot':'+5 gouttes dans le pot','{n} free drops left.':'Encore {n} gouttes gratuites.','Your next 3 drops are free.':'Vos 3 prochaines gouttes sont gratuites.',
'Done · streak: {days}':'Fait · série : {days}','Streak: {days}':'Série : {days}','Next tip':'Astuce suivante'},
ru:{'Takes back your last drop. You can also tap a paint in the bowl to take out just that one. The paint comes back.':'Забирает последнюю каплю. Можно и нажать на краску в миске, чтобы убрать только её. Краска возвращается.',
'Magic':'Магия','Puts the next right drop in the bowl, or takes a wrong one out. That part can earn at most 2 stars.':'Добавляет в миску следующую нужную каплю или убирает лишнюю. Эта часть принесёт не больше 2 звёзд.',
'+5 paint':'+5 краски','Adds 5 drops to the paint pot.':'Добавляет 5 капель в банку с краской.',
'Free ×3':'Бесплатно ×3',"Your next 3 drops don't use paint from the pot. They still count for stars.":'Следующие 3 капли не расходуют краску из банки. Для звёзд они всё равно считаются.',
'{n} free':'{n} бесплатно','Parts of the picture':'Части картинки','Target':'Цель','Mix':'Смесь','Paint':'Краска',
'Your mix. Tap to pour out the bowl.':'Ваша смесь. Нажмите, чтобы вылить миску.','Tap to pour out':'Нажмите, чтобы вылить',
'done':'готово','selected':'выбрано','to do':'осталось','So close':'Почти','Too light':'Слишком светло','Too dark':'Слишком темно','The color is off':'Оттенок не тот',
'{n} {paint}. Tap to take one out.':'{paint}: {n}. Нажмите, чтобы убрать одну.','Your drops show up here':'Здесь появятся ваши капли',
'over par':'больше нормы','{used} drops used, par {min}':'Потрачено капель: {used}, норма {min}','{n} of 3 stars at this pace':'{n} из 3 звёзд при таком темпе',
'Tap a paint to start':'Нажмите на краску, чтобы начать','{done} of {all} parts restored':'Восстановлено частей: {done} из {all}',
'Further off. Try Undo.':'Стало дальше от цели. Попробуйте «Отменить».','Bowl poured out. Paint refunded.':'Миска вылита. Краска возвращена.',
'Your mix is already right.':'Смесь уже правильная.','The pot is empty.':'Банка пуста.','Took out {paint}':'Убрано: {paint}',
'+5 drops in the pot':'+5 капель в банке','{n} free drops left.':'Осталось бесплатных капель: {n}.','Your next 3 drops are free.':'Следующие 3 капли бесплатны.',
'Done · streak: {days}':'Готово · серия: {days}','Streak: {days}':'Серия: {days}','Next tip':'Следующий совет'}
});
// Chapters, star chests, bonus pages, daily twists
I18N.add({
fr:{'Not now':'Plus tard','unlock for {coins}':'à débloquer pour {coins}','restore {title} first':'restaurez d’abord {title}','Bonus':'Bonus',
'Chapter {n}':'Chapitre {n}','Chapter {n} of {all}':'Chapitre {n} sur {all}','Chapter {n} complete: {name}! +{coins}':'Chapitre {n} terminé : {name} ! +{coins}',
'and +1 of every booster.':'et +1 de chaque bonus.','Star chest {n} opened: +{coins}':'Coffre d’étoiles {n} ouvert : +{coins}',
'A bonus page: {title} in new colors. {parts}.':'Une page bonus : {title} dans de nouvelles couleurs. {parts}.','Unlock it for {coins}?':'La débloquer pour {coins} ?',
'It costs {price}. You have {have}. Restore pictures and open star chests to earn more.':'Elle coûte {price}. Vous avez {have}. Restaurez des images et ouvrez des coffres d’étoiles pour en gagner plus.',
'Unlock':'Débloquer','OK':'OK',"No boosters in today's challenge.":'Pas de bonus dans le défi du jour.',
'That was the last picture of the book. Bonus pages wait in the gallery.':'C’était la dernière image du cahier. Des pages bonus vous attendent dans la galerie.',
'Less paint':'Moins de peinture','No boosters':'Sans bonus','No match %':'Sans %',
"Today's twist: no boosters. Plan every drop.":'Défi du jour : pas de bonus. Prévoyez chaque goutte.',
"Today's twist: the match % stays hidden. Trust your eyes.":'Défi du jour : le % de correspondance reste caché. Fiez-vous à vos yeux.',
'Trust your eyes':'Fiez-vous à vos yeux','Finish it: +{coins} and a booster of each kind':'À la fin : +{coins} et un bonus de chaque sorte',
'Chapter {n}: {name}, {done} of {all} pictures':'Chapitre {n} : {name}, {done} images sur {all}','Star chest':'Coffre d’étoiles',
'+{coins} and {n} boosters':'+{coins} et {n} bonus','Bonus pages':'Pages bonus','{n} ready to unlock with coins':'{n} à débloquer avec des pièces','Tap to collect':'Touchez pour récupérer','Tap to open':'Touchez pour ouvrir','Rewards':'Récompenses','Nice!':'Super !'},
ru:{'Not now':'Не сейчас','unlock for {coins}':'открыть за {coins}','restore {title} first':'сначала восстановите «{title}»','Bonus':'Бонус',
'Chapter {n}':'Глава {n}','Chapter {n} of {all}':'Глава {n} из {all}','Chapter {n} complete: {name}! +{coins}':'Глава {n} пройдена: {name}! +{coins}',
'and +1 of every booster.':'и +1 каждого бустера.','Star chest {n} opened: +{coins}':'Звёздный сундук {n} открыт: +{coins}',
'A bonus page: {title} in new colors. {parts}.':'Бонусная страница: «{title}» в новых цветах. {parts}.','Unlock it for {coins}?':'Открыть за {coins}?',
'It costs {price}. You have {have}. Restore pictures and open star chests to earn more.':'Стоит {price}. У вас {have}. Восстанавливайте картинки и открывайте звёздные сундуки, чтобы заработать больше.',
'Unlock':'Открыть','OK':'OK',"No boosters in today's challenge.":'В сегодняшнем испытании бустеров нет.',
'That was the last picture of the book. Bonus pages wait in the gallery.':'Это была последняя картинка раскраски. В галерее ждут бонусные страницы.',
'Less paint':'Меньше краски','No boosters':'Без бустеров','No match %':'Без процентов',
"Today's twist: no boosters. Plan every drop.":'Сегодня без бустеров. Планируйте каждую каплю.',
"Today's twist: the match % stays hidden. Trust your eyes.":'Сегодня процент совпадения скрыт. Доверьтесь глазам.',
'Trust your eyes':'Доверьтесь глазам','Finish it: +{coins} and a booster of each kind':'За прохождение: +{coins} и по бустеру каждого вида',
'Chapter {n}: {name}, {done} of {all} pictures':'Глава {n}: {name}, картинок {done} из {all}','Star chest':'Звёздный сундук',
'+{coins} and {n} boosters':'+{coins} и бустеров: {n}','Bonus pages':'Бонусные страницы','{n} ready to unlock with coins':'Можно открыть за монеты: {n}','Tap to collect':'Нажмите, чтобы забрать','Tap to open':'Нажмите, чтобы открыть','Rewards':'Награды','Nice!':'Отлично!'}
});
// Playtest round 2: Palette and Brush boosters, factual mix advice, paint warning, saved progress
I18N.add({
fr:{'Palette':'Palette','Dims the paints this part does not use, until the part is painted. The part can still earn 3 stars.':'Estompe les peintures que cette partie n’utilise pas, jusqu’à ce qu’elle soit peinte. La partie peut toujours rapporter 3 étoiles.',
'Brush':'Pinceau','Paints the part you are on for you, with the exact recipe. It uses that paint from the pot, and the part earns at most 2 stars.':'Peint pour vous la partie en cours avec la recette exacte. Il prend cette peinture dans le pot, et la partie rapporte au plus 2 étoiles.',
'{part} uses {n} of the paints.':'{part} utilise {n} des peintures.','Brush needs {drops} of paint.':'Le pinceau a besoin de {drops} de peinture.','Brushed!':'Peint !',
'Too strong':'Trop vif','Too dull':'Trop terne','Aim for a more {hue} tone':'Visez un ton plus {hue}',
'pink':'rose','red':'rouge','orange':'orangé','yellow':'jaune','green':'vert','teal':'bleu-vert','blue':'bleu','violet':'violet',
'That took it further away':'Ça s’éloigne de la cible','Rest needs {n}':'Il en faut {n} pour le reste','{done} of {all} parts':'{done} parties sur {all}',
'Welcome back: {n} of {all} parts already painted.':'Bon retour : {n} parties sur {all} sont déjà peintes.'},
ru:{'Palette':'Палитра','Dims the paints this part does not use, until the part is painted. The part can still earn 3 stars.':'Приглушает краски, которых нет в этой части, пока она не раскрашена. Часть всё ещё может принести 3 звезды.',
'Brush':'Кисть','Paints the part you are on for you, with the exact recipe. It uses that paint from the pot, and the part earns at most 2 stars.':'Раскрашивает текущую часть по точному рецепту. Краска берётся из банки, а часть принесёт не больше 2 звёзд.',
'{part} uses {n} of the paints.':'{part}: нужно красок — {n}.','Brush needs {drops} of paint.':'Кисти нужно {drops} краски.','Brushed!':'Готово!',
'Too strong':'Слишком ярко','Too dull':'Слишком блёкло','Aim for a more {hue} tone':'Нужен более {hue} оттенок',
'pink':'розовый','red':'красный','orange':'оранжевый','yellow':'жёлтый','green':'зелёный','teal':'бирюзовый','blue':'синий','violet':'фиолетовый',
'That took it further away':'Стало дальше от цели','Rest needs {n}':'Для остального нужно {n}','{done} of {all} parts':'Частей: {done} из {all}',
'Welcome back: {n} of {all} parts already painted.':'С возвращением: уже раскрашено частей — {n} из {all}.'}
});
// Playtest round 3: paint pot tip
I18N.add({
fr:{'This is your <b>paint pot</b>. Every drop you add comes out of it, and Undo puts it back.':'Voici votre <b>pot de peinture</b>. Chaque goutte ajoutée y est prise, et Annuler la remet.',
'<b>Rest needs</b> is what the unpainted parts take at par. If the pot runs dry, a refill costs coins, so make every drop count.':'<b>Il en faut</b> indique ce que demandent les parties restantes au par. Si le pot est vide, le remplir coûte des pièces : chaque goutte compte.',
'Got it':'Compris'},
ru:{'This is your <b>paint pot</b>. Every drop you add comes out of it, and Undo puts it back.':'Это ваша <b>банка с краской</b>. Каждая капля берётся из неё, а «Отменить» возвращает каплю обратно.',
'<b>Rest needs</b> is what the unpainted parts take at par. If the pot runs dry, a refill costs coins, so make every drop count.':'<b>Для остального нужно</b> — столько краски нужно оставшимся частям по норме. Если банка опустеет, пополнение стоит монет, так что берегите каждую каплю.',
'Got it':'Понятно'}
});
// Playtest round 4: drops on the paints, Home tutorials, Undo demo
I18N.add({
fr:{'Takes back your last drop. Or tap the minus on any paint to take out one drop of just that paint. The paint comes back.':'Reprend votre dernière goutte. Ou touchez le moins sur une peinture pour retirer une goutte de cette peinture seulement. La peinture revient.',
'Take out one drop of {paint}':'Retirer une goutte de {paint}','Undo: last drop':'Annuler : dernière goutte','Minus: that paint':'Moins : cette peinture',
'<b>Chapters.</b> Pictures come in chapters of five. Finish a chapter for coins and one booster of each kind.':'<b>Chapitres.</b> Les images vont par chapitres de cinq. Terminez un chapitre pour des pièces et un bonus de chaque sorte.',
'<b>Star chest.</b> Every star you earn goes in here. When it fills up, it opens: coins and boosters.':'<b>Coffre à étoiles.</b> Chaque étoile gagnée y va. Quand il est plein, il s’ouvre : pièces et bonus.',
'<b>Daily picture.</b> Each day a picture you restored comes back with a twist: less paint, no boosters or a hidden match %. Play on days in a row to grow your streak and the reward.':'<b>Image du jour.</b> Chaque jour, une image restaurée revient avec une contrainte : moins de peinture, pas de bonus ou % caché. Jouez plusieurs jours de suite pour allonger la série et la récompense.',
'<b>Mixing tips.</b> A new one every day. Tap the arrow to read more.':'<b>Astuces de mélange.</b> Une nouvelle chaque jour. Touchez la flèche pour en lire d’autres.'},
ru:{'Takes back your last drop. Or tap the minus on any paint to take out one drop of just that paint. The paint comes back.':'Забирает последнюю каплю. Или нажмите минус на краске, чтобы убрать одну каплю только этой краски. Краска возвращается.',
'Take out one drop of {paint}':'Убрать одну каплю: {paint}','Undo: last drop':'Отменить: последняя капля','Minus: that paint':'Минус: эта краска',
'<b>Chapters.</b> Pictures come in chapters of five. Finish a chapter for coins and one booster of each kind.':'<b>Главы.</b> Картинки идут главами по пять. Пройдите главу — получите монеты и по одному бустеру каждого вида.',
'<b>Star chest.</b> Every star you earn goes in here. When it fills up, it opens: coins and boosters.':'<b>Звёздный сундук.</b> Сюда идут все заработанные звёзды. Когда он заполнится, откроется: монеты и бустеры.',
'<b>Daily picture.</b> Each day a picture you restored comes back with a twist: less paint, no boosters or a hidden match %. Play on days in a row to grow your streak and the reward.':'<b>Картинка дня.</b> Каждый день одна из восстановленных картинок возвращается с условием: меньше краски, без бустеров или без процента совпадения. Играйте несколько дней подряд — серия и награда растут.',
'<b>Mixing tips.</b> A new one every day. Tap the arrow to read more.':'<b>Советы по смешиванию.</b> Каждый день новый. Нажмите на стрелку, чтобы прочитать ещё.'}
});
I18N.add({
fr:{'Takes back your last drop. The paint comes back to the pot.':'Reprend votre dernière goutte. La peinture retourne dans le pot.','Tap any faded part to paint it next':'Touchez une partie décolorée pour la peindre'},
ru:{'Takes back your last drop. The paint comes back to the pot.':'Забирает последнюю каплю. Краска возвращается в банку.','Tap any faded part to paint it next':'Нажмите на любую выцветшую часть, чтобы раскрасить её'}
});
I18N.add({
fr:{'<b>Chapter complete!</b> Pictures come in chapters of five, and each finished chapter pays coins and one booster of each kind. Tap the card to collect.':'<b>Chapitre terminé !</b> Les images vont par chapitres de cinq, et chaque chapitre terminé rapporte des pièces et un bonus de chaque sorte. Touchez la carte pour récupérer.',
'<b>Your star chest is full!</b> Every star you earn goes in here, and a full chest opens with coins and boosters. Tap it to open.':'<b>Votre coffre à étoiles est plein !</b> Chaque étoile gagnée y va, et un coffre plein s’ouvre avec des pièces et des bonus. Touchez-le pour l’ouvrir.',
'Collect your reward':'Récupérer la récompense','Close':'Fermer','Chapter {n}: {name}':'Chapitre {n} : {name}','Locked':'Verrouillée',
'{done} of {all} restored. Finish them all: +{coins} and one booster of each kind.':'{done} sur {all} restaurées. Terminez-les toutes : +{coins} et un bonus de chaque sorte.',
'{n} more stars to open it. Every star from every picture counts; a part restored at par earns 3.':'Encore {n} étoiles pour l’ouvrir. Chaque étoile compte ; une partie restaurée au par en rapporte 3.',
'Inside: +{coins} and {n} boosters.':'Dedans : +{coins} et {n} bonus.'},
ru:{'<b>Chapter complete!</b> Pictures come in chapters of five, and each finished chapter pays coins and one booster of each kind. Tap the card to collect.':'<b>Глава пройдена!</b> Картинки идут главами по пять, и за каждую главу дают монеты и по бустеру каждого вида. Нажмите на карточку, чтобы забрать.',
'<b>Your star chest is full!</b> Every star you earn goes in here, and a full chest opens with coins and boosters. Tap it to open.':'<b>Звёздный сундук полон!</b> Сюда идут все заработанные звёзды, а полный сундук открывается с монетами и бустерами. Нажмите, чтобы открыть.',
'Collect your reward':'Забрать награду','Close':'Закрыть','Chapter {n}: {name}':'Глава {n}: {name}','Locked':'Закрыто',
'{done} of {all} restored. Finish them all: +{coins} and one booster of each kind.':'Восстановлено {done} из {all}. Пройдите все: +{coins} и по бустеру каждого вида.',
'{n} more stars to open it. Every star from every picture counts; a part restored at par earns 3.':'До открытия ещё звёзд: {n}. Считаются звёзды со всех картинок; часть, восстановленная по норме, даёт 3.',
'Inside: +{coins} and {n} boosters.':'Внутри: +{coins} и бустеров: {n}.'}
});
I18N.add({
fr:{'Daily challenge':'Défi du jour','{n} of 3 hearts left':'{n} cœurs sur 3','The dream faded':'Le rêve s’est effacé','Try again':'Réessayer',
"You ran out of hearts. Dreams come back: try again, or wait for tomorrow's page.":'Vous n’avez plus de cœurs. Les rêves reviennent : réessayez, ou attendez la page de demain.',
"Grandma's dream journal · page {n}":'Journal des rêves de Grand-mère · page {n}',
"3 hearts: a paint this part doesn't use, or a drop that takes the mix further away, costs one.":'3 cœurs : une peinture que cette partie n’utilise pas, ou une goutte qui éloigne le mélange, en coûte un.',
'No boosters, and only a little spare paint.':'Pas de bonus, et très peu de peinture en réserve.',
"<b>Daily challenge.</b> Every day a new page from Grandma's dream journal: a strange picture you won't find in the book, with 3 hearts and no boosters. Play on days in a row to grow your streak and the reward.":'<b>Défi du jour.</b> Chaque jour, une nouvelle page du journal des rêves de Grand-mère : une image étrange qu’on ne trouve pas dans le livre, avec 3 cœurs et sans bonus. Jouez plusieurs jours de suite pour allonger la série et la récompense.',
'{n} {paint}':'{n} {paint}'},
ru:{'Daily challenge':'Испытание дня','{n} of 3 hearts left':'Осталось сердец: {n} из 3','The dream faded':'Сон растаял','Try again':'Ещё раз',
"You ran out of hearts. Dreams come back: try again, or wait for tomorrow's page.":'Сердца закончились. Сны возвращаются: попробуйте ещё раз или дождитесь завтрашней страницы.',
"Grandma's dream journal · page {n}":'Бабушкин дневник снов · страница {n}',
"3 hearts: a paint this part doesn't use, or a drop that takes the mix further away, costs one.":'3 сердца: краска, которой нет в этой части, или капля, уводящая смесь дальше от цели, стоит одно сердце.',
'No boosters, and only a little spare paint.':'Без бустеров и почти без запаса краски.',
"<b>Daily challenge.</b> Every day a new page from Grandma's dream journal: a strange picture you won't find in the book, with 3 hearts and no boosters. Play on days in a row to grow your streak and the reward.":'<b>Испытание дня.</b> Каждый день новая страница бабушкиного дневника снов: странная картинка, которой нет в книге, с 3 сердцами и без бустеров. Играйте несколько дней подряд — серия и награда растут.',
'{n} {paint}':'{paint}: {n}'}
});
I18N.add({fr:{'No boosters today: every drop counts.':'Pas de bonus aujourd’hui : chaque goutte compte.'},ru:{'No boosters today: every drop counts.':'Сегодня без бустеров: каждая капля на счету.'}});
// Holidays tab (seasonal pictures)
I18N.add({
fr:{'Holidays':'Fêtes','Christmas':'Noël','Thanksgiving':'Thanksgiving','Now':'En ce moment','Last season':'Saison passée',
'{season} pictures, here until {date}.':'Images de {season}, ici jusqu’au {date}.','{season} pictures arrive on {date}.':'Les images de {season} arrivent le {date}.',
'Holiday pictures open only in their season. The ones you played stay here.':'Les images des fêtes ne s’ouvrent qu’à leur saison. Celles que vous avez jouées restent ici.',
'{season} pictures':'Images de {season}','until {date}':'jusqu’au {date}','All restored. Happy holidays!':'Tout est restauré. Joyeuses fêtes !','{done} of {all} restored':'{done} sur {all} restaurées',
'<b>{season} pictures.</b> Holiday pictures to restore, here only until {date}. Tap the card, or the Holidays tab below.':'<b>Images de {season}.</b> Des images de fête à restaurer, ici seulement jusqu’au {date}. Touchez la carte, ou l’onglet Fêtes en bas.',
'Merry Christmas!':'Joyeux Noël !','Happy Thanksgiving!':'Joyeux Thanksgiving !','Halloween':'Halloween','Happy Halloween!':'Joyeux Halloween !'},
ru:{'Holidays':'Праздники','Christmas':'Рождество','Thanksgiving':'День благодарения','Now':'Сейчас','Last season':'Прошлый сезон',
'{season} pictures, here until {date}.':'Картинки к празднику «{season}», здесь до {date}.','{season} pictures arrive on {date}.':'Картинки к празднику «{season}» появятся {date}.',
'Holiday pictures open only in their season. The ones you played stay here.':'Праздничные картинки открываются только в свой сезон. Те, что вы уже начали, остаются здесь.',
'{season} pictures':'Праздник: {season}','until {date}':'до {date}','All restored. Happy holidays!':'Всё восстановлено. С праздниками!','{done} of {all} restored':'Восстановлено {done} из {all}',
'<b>{season} pictures.</b> Holiday pictures to restore, here only until {date}. Tap the card, or the Holidays tab below.':'<b>Праздник: {season}.</b> Праздничные картинки, только до {date}. Нажмите на карточку или на вкладку «Праздники» внизу.',
'Merry Christmas!':'Счастливого Рождества!','Happy Thanksgiving!':'С Днём благодарения!','Halloween':'Хэллоуин','Happy Halloween!':'Счастливого Хэллоуина!'}
});
I18N.add({
fr:{'{season} collection':'Collection {season}','Open until {date}':'Ouverte jusqu’au {date}','Opens on {date}':'Ouvre le {date}','Back to Holidays':'Retour aux fêtes',
'Outside its season, only the pictures you already started can be played.':'Hors saison, seules les images déjà commencées peuvent être jouées.',
'Holiday collections open in their season. Pictures you started stay playable.':'Les collections des fêtes ouvrent à leur saison. Les images commencées restent jouables.'},
ru:{'{season} collection':'Коллекция: {season}','Open until {date}':'Открыта до {date}','Opens on {date}':'Откроется {date}','Back to Holidays':'Назад к праздникам',
'Outside its season, only the pictures you already started can be played.':'Вне сезона можно играть только в уже начатые картинки.',
'Holiday collections open in their season. Pictures you started stay playable.':'Праздничные коллекции открываются в свой сезон. Начатые картинки остаются доступны.'}
});
// Brush confirm and the Home season banner
I18N.add({
fr:{'Paint it':'Peindre','The brush is mixing…':'Le pinceau mélange…','Mixes the exact recipe for the part you are on, drop by drop, then you tap Paint it. It uses that paint from the pot, and the part earns at most 2 stars.':'Mélange la recette exacte de la partie en cours, goutte à goutte, puis touchez Peindre. La peinture vient du pot, et la partie gagne au plus 2 étoiles.',
'{n} days left':'Encore {n} jours','Last day!':'Dernier jour !','View':'Voir'},
ru:{'Paint it':'Покрасить','The brush is mixing…':'Кисть смешивает…','Mixes the exact recipe for the part you are on, drop by drop, then you tap Paint it. It uses that paint from the pot, and the part earns at most 2 stars.':'Смешивает точный рецепт для текущей части, капля за каплей, а потом вы нажимаете «Покрасить». Краска берётся из банки, и часть получает не больше 2 звёзд.',
'{n} days left':'Осталось дней: {n}','Last day!':'Последний день!','View':'Смотреть'}
});
// Reward reveal
I18N.add({
fr:{'Collect':'Récupérer','Chapter {n} complete':'Chapitre {n} terminé','Star chest {n}':'Coffre à étoiles {n}','Chest opened!':'Coffre ouvert !','Coins':'Pièces'},
ru:{'Collect':'Забрать','Chapter {n} complete':'Глава {n} пройдена','Star chest {n}':'Звёздный сундук {n}','Chest opened!':'Сундук открыт!','Coins':'Монеты'}
});
// Rewarded ad placeholders
I18N.add({
fr:{'Advertisement':'Publicité','Ad':'Pub','Close the ad and get the reward':'Fermer la pub et recevoir la récompense','Ad placeholder':'Emplacement publicitaire','A short video ad will play here. The reward comes when it ends.':'Une courte vidéo publicitaire passera ici. La récompense arrive à la fin.',
'Out of {name}':'Plus de {name}','Get one more':'En obtenir un de plus','Watch an ad':'Regarder une pub','Free':'Gratuit','Buy':'Acheter','{price} coins needed':'{price} pièces nécessaires','+1 {name}':'+1 {name}',
'Get free coins':'Pièces gratuites','Watch a short ad for +{n} coins. {left} left today.':'Regardez une courte pub pour +{n} pièces. Encore {left} aujourd’hui.','That was all for today. Come back tomorrow for more.':'C’est tout pour aujourd’hui. Revenez demain.',
'+{n} coins':'+{n} pièces','Watch an ad: restart {part} free':'Regarder une pub : recommencer {part} gratuitement','Watch an ad: +{n} coins':'Regarder une pub : +{n} pièces'},
ru:{'Advertisement':'Реклама','Ad':'Реклама','Close the ad and get the reward':'Закрыть рекламу и получить награду','Ad placeholder':'Место для рекламы','A short video ad will play here. The reward comes when it ends.':'Здесь будет короткий рекламный ролик. Награда — после его окончания.',
'Out of {name}':'{name}: закончились','Get one more':'Получить ещё','Watch an ad':'Смотреть рекламу','Free':'Бесплатно','Buy':'Купить','{price} coins needed':'Нужно монет: {price}','+1 {name}':'+1 {name}',
'Get free coins':'Бесплатные монеты','Watch a short ad for +{n} coins. {left} left today.':'Посмотрите короткую рекламу и получите +{n} монет. Сегодня осталось: {left}.','That was all for today. Come back tomorrow for more.':'На сегодня всё. Возвращайтесь завтра.',
'+{n} coins':'+{n} монет','Watch an ad: restart {part} free':'Реклама: начать «{part}» заново бесплатно','Watch an ad: +{n} coins':'Реклама: +{n} монет'}
});

I18N.add({fr:{'New':'Nouveau'},ru:{'New':'Новое'}});
I18N.add({
fr:{'Empty · free':'Vider · gratuit','Drops':'Gouttes','So close.':'Presque.','3 hearts: a paint this part doesn\'t use costs one. Tuning the mix is free.':'3 cœurs : une peinture que cette partie n’utilise pas en coûte un. Ajuster le mélange est gratuit.','Your first Magic is on the house: no star lost.':'Votre première Magie est offerte : aucune étoile perdue.'},
ru:{'Empty · free':'Вылить · бесплатно','Drops':'Капли','So close.':'Почти.','3 hearts: a paint this part doesn\'t use costs one. Tuning the mix is free.':'3 сердца: краска, которой нет в этой части, стоит одно. Подбирать смесь — бесплатно.','Your first Magic is on the house: no star lost.':'Первая Магия бесплатна: звезда не теряется.'}
});
I18N.add({
fr:{'Holiday pictures mix like the later chapters. Take your time: emptying the bowl is free, and Hard ones are marked.':'Les images des fêtes se mélangent comme les chapitres avancés. Prenez votre temps : vider le bol est gratuit, et les difficiles sont signalées.',
'Holiday pictures':'Images des fêtes','These mix like the later chapters, so the shades are closer. Each part starts with its easiest mix; Palette and Magic help, and emptying the bowl is free.':'Elles se mélangent comme les chapitres avancés : les teintes sont plus proches. Chaque image commence par son mélange le plus simple ; Palette et Magie aident, et vider le bol est gratuit.',
'Later in your book':'Plus loin dans votre livre'},
ru:{'Holiday pictures mix like the later chapters. Take your time: emptying the bowl is free, and Hard ones are marked.':'Праздничные картинки смешиваются как поздние главы. Не спешите: вылить миску можно бесплатно, а сложные отмечены.',
'Holiday pictures':'Праздничные картинки','These mix like the later chapters, so the shades are closer. Each part starts with its easiest mix; Palette and Magic help, and emptying the bowl is free.':'Они смешиваются как поздние главы, оттенки ближе. Каждая картинка начинается с самой простой смеси; помогают Палитра и Магия, а вылить миску можно бесплатно.',
'Later in your book':'Дальше в вашей книге'}
});
I18N.add({
fr:{'Your Brush came back: its mix was never painted.':'Votre Pinceau est revenu : son mélange n’a jamais été peint.','Perfect mix! Every part at 3 stars.':'Mélange parfait ! Chaque partie à 3 étoiles.','Perfect':'Parfait'},
ru:{'Your Brush came back: its mix was never painted.':'Кисть вернулась: её смесь так и не была нанесена.','Perfect mix! Every part at 3 stars.':'Идеальная смесь! Каждая часть на 3 звезды.','Perfect':'Идеально'}
});
I18N.add({
fr:{'Your mix':'Votre mélange','The bowl is full. Take drops out with Undo.':'Le bol est plein. Retirez des gouttes avec Annuler.','These mix like the later chapters, so the shades are closer. Each picture starts with its easiest mix, and Palette and Magic help.':'Elles se mélangent comme les chapitres avancés : les teintes sont plus proches. Chaque image commence par son mélange le plus simple, et Palette et Magie aident.','Holiday pictures mix like the later chapters. Take your time: Hard ones are marked.':'Les images des fêtes se mélangent comme les chapitres avancés. Prenez votre temps : les difficiles sont signalées.'},
ru:{'Your mix':'Ваша смесь','The bowl is full. Take drops out with Undo.':'Миска полна. Уберите капли с помощью «Отменить».','These mix like the later chapters, so the shades are closer. Each picture starts with its easiest mix, and Palette and Magic help.':'Они смешиваются как поздние главы, оттенки ближе. Каждая картинка начинается с самой простой смеси, помогают Палитра и Магия.','Holiday pictures mix like the later chapters. Take your time: Hard ones are marked.':'Праздничные картинки смешиваются как поздние главы. Не спешите: сложные отмечены.'}
});
I18N.add({
fr:{'No boosters today. Tap a drop in the bowl to take it out: its paint stays used.':'Pas de bonus aujourd’hui. Touchez une goutte du bol pour la retirer : sa peinture reste utilisée.',
'You have 3 hearts. A paint this color doesn\'t need costs one heart.':'Vous avez 3 cœurs. Une peinture dont cette couleur n’a pas besoin coûte un cœur.',
'No boosters, and only a little spare paint. To fix a mix, tap a drop in the bowl to take it out. Its paint stays used.':'Pas de bonus, et peu de peinture en réserve. Pour corriger un mélange, touchez une goutte du bol pour la retirer. Sa peinture reste utilisée.',
'{paint} taken out. Its paint stays used.':'{paint} retiré. Sa peinture reste utilisée.','The bowl is full. Tap a drop below to take it out.':'Le bol est plein. Touchez une goutte en dessous pour la retirer.',
'{paint} isn\'t in this color. Tap it below to take it out.':'Il n’y a pas de {paint} dans cette couleur. Touchez-le en dessous pour le retirer.'},
ru:{'No boosters today. Tap a drop in the bowl to take it out: its paint stays used.':'Сегодня без бустеров. Нажмите на каплю в миске, чтобы убрать её: краска остаётся потраченной.',
'You have 3 hearts. A paint this color doesn\'t need costs one heart.':'У вас 3 сердца. Краска, которой нет в этом цвете, стоит одно сердце.',
'No boosters, and only a little spare paint. To fix a mix, tap a drop in the bowl to take it out. Its paint stays used.':'Без бустеров и почти без запаса краски. Чтобы исправить смесь, нажмите на каплю в миске — она уберётся, а краска останется потраченной.',
'{paint} taken out. Its paint stays used.':'{paint}: капля убрана, краска потрачена.','The bowl is full. Tap a drop below to take it out.':'Миска полна. Нажмите на каплю ниже, чтобы убрать её.',
'{paint} isn\'t in this color. Tap it below to take it out.':'{paint} нет в этом цвете. Нажмите на неё ниже, чтобы убрать.'}
});
I18N.add({
fr:{'You have 3 hearts. You lose one when you add a paint that doesn\'t belong in the color, like black in a pale yellow.':'Vous avez 3 cœurs. Vous en perdez un en ajoutant une peinture qui n’a pas sa place dans la couleur, comme du noir dans un jaune pâle.',
'{paint} doesn\'t belong in this color. Tap it below to take it out.':'Le {paint} n’a pas sa place dans cette couleur. Touchez-le en dessous pour le retirer.'},
ru:{'You have 3 hearts. You lose one when you add a paint that doesn\'t belong in the color, like black in a pale yellow.':'У вас 3 сердца. Одно теряется, если добавить краску, которой нет в этом цвете, например чёрную в бледно-жёлтый.',
'{paint} doesn\'t belong in this color. Tap it below to take it out.':'{paint} не входит в этот цвет. Нажмите на неё ниже, чтобы убрать.'}
});
I18N.add({
fr:{'Paint pot':'Pot de peinture','Not enough paint to finish':'Pas assez de peinture pour finir','The parts left need at least {need} drops and the pot has {have}. Top it up, or start the picture over.':'Les parties restantes demandent au moins {need} gouttes et le pot en a {have}. Remplissez-le, ou recommencez l’image.','+{n} paint':'+{n} peinture','paint':'peinture','Start the picture over':'Recommencer l’image',
'Too light: add more color, or a touch of Black':'Trop clair : ajoutez de la couleur, ou une pointe de Noir','Too light: add more color':'Trop clair : ajoutez de la couleur','Too dark: add White':'Trop foncé : ajoutez du Blanc','Too dark: use less of the darker paint':'Trop foncé : moins de la peinture la plus foncée','Too strong: add a little White':'Trop vif : ajoutez un peu de Blanc','Too strong: add a touch of Black':'Trop vif : ajoutez une pointe de Noir','Too dull: add more of the main color':'Trop terne : ajoutez de la couleur principale'},
ru:{'Paint pot':'Банка краски','Not enough paint to finish':'Краски не хватит до конца','The parts left need at least {need} drops and the pot has {have}. Top it up, or start the picture over.':'Оставшимся частям нужно минимум {need} капель, а в банке {have}. Пополните её или начните картинку заново.','+{n} paint':'+{n} краски','paint':'краски','Start the picture over':'Начать картинку заново',
'Too light: add more color, or a touch of Black':'Слишком светло: добавьте цвета или каплю Чёрной','Too light: add more color':'Слишком светло: добавьте цвета','Too dark: add White':'Слишком темно: добавьте Белую','Too dark: use less of the darker paint':'Слишком темно: меньше тёмной краски','Too strong: add a little White':'Слишком ярко: добавьте немного Белой','Too strong: add a touch of Black':'Слишком ярко: добавьте каплю Чёрной','Too dull: add more of the main color':'Слишком блёкло: добавьте основного цвета'}
});
I18N.add({
fr:{'Auto paint':'Peinture auto','Paints a part as soon as the mix matches. Off: tap Paint it yourself.':'Peint une partie dès que le mélange correspond. Désactivé : touchez Peindre vous-même.','Tip':'Astuce','Painted at {p}%. To fine-tune to 100% first, turn off Auto paint and tap Paint it yourself.':'Peint à {p} %. Pour ajuster jusqu’à 100 % d’abord, désactivez la peinture auto et touchez Peindre vous-même.'},
ru:{'Auto paint':'Автопокраска','Paints a part as soon as the mix matches. Off: tap Paint it yourself.':'Красит часть, как только смесь совпала. Выключено: нажимайте «Покрасить» сами.','Tip':'Совет','Painted at {p}%. To fine-tune to 100% first, turn off Auto paint and tap Paint it yourself.':'Покрашено на {p}%. Чтобы сначала довести до 100%, выключите автопокраску и нажимайте «Покрасить» сами.'}
});

