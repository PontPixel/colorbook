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
'Undo':'Annuler','Very little spare paint and colors that look almost the same.':'Très peu de peinture en réserve et des couleurs presque identiques.','Vibration':'Vibration','Where does {title} hang today?':'Où est exposé {title} aujourd’hui ?',
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
'Undo':'Отменить','Very little spare paint and colors that look almost the same.':'Очень мало запаса краски и почти одинаковые цвета.','Vibration':'Вибрация','Where does {title} hang today?':'Где сейчас хранится «{title}»?',
'Which country was the artist from?':'Из какой страны художник?','Which country was the artist of {title} from?':'Из какой страны автор картины «{title}»?','Which museum holds it today?':'В каком музее она сейчас?','Which style is it?':'Какой это стиль?',
'Which style is {title}?':'В каком стиле «{title}»?','White':'Белая','Who painted this?':'Кто автор?','Who painted {title}?':'Кто написал «{title}»?','Yellow':'Жёлтая',"You beat {from}'s {score}★!":'Вы побили {score}★ ({from})!',
'You get {n} free. After that, {price} each.':'{n} бесплатно. Дальше — {price} за штуку.','Your move.':'Твой ход.','Your name':'Ваше имя','Your name (optional)':'Ваше имя (необязательно)','add paint':'добавьте краску',
'day {n}':'день {n}','earned':'заработано','locked':'закрыто','perfect!':'идеально!','perfect: {drops}':'идеально: {drops}','{done} of {all} restored':'восстановлено {done} из {all}','{drops}, min {min}':'{drops}, минимум {min}',
'{from} challenged you on {title}. Beat {score}★ there.':'{from} бросает вызов: «{title}». Наберите больше {score}★.','{from} challenged you on {title}. Beat {score}★.':'{from} бросает вызов: «{title}». Наберите больше {score}★.','{from} challenged you!':'{from} бросает вам вызов!',
'{from} still leads: {score}★ vs your {you}★. Replay to beat it.':'{from} пока впереди: {score}★ против ваших {you}★. Сыграйте ещё раз.','{name} bought: {coins}':'Куплено «{name}»: {coins}','{name} costs {price}. You have {have}.':'«{name}» стоит {price}. У вас {have}.',
'{name} unlocks in picture {n}: {title}':'«{name}» откроется на картинке {n}: {title}','{name}, locked until picture {n}':'«{name}» закрыт до картинки {n}','{n} left':'осталось {n}','{paint} taken out. Paint refunded.':'Убрано: {paint}. Краска возвращена.',
'{part} restarted. Paint refilled.':'«{part}» заново. Краска пополнена.','{p}% is not close enough.':'{p}% — недостаточно близко.','{p}% match':'совпадение {p}%','{tier} picture':'Картинка: {tier}','{tier} picture.':'Картинка: {tier}.','{title} restored':'«{title}» восстановлена'
}});
