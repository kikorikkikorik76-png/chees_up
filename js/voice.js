/* CHEES.UP — реплики тренера. Каждая фраза собирается из кусочков; для каждого кусочка есть voice/<id>.mp3.
   Текст на экране и звук строятся из одного списка, поэтому не расходятся. */
const Voice=(()=>{
 const P={};/* id -> [что на экране, что произнести] */
 const add=(id,show,say)=>P[id]=[show,say||show];

 /* оценки ходов */
 const V={
  brilliant:['Блестяще! Ты отдаёшь материал, и это работает.','Вот это жертва! Очень сильно и смело.'],
  great:['Отличная находка: только этот ход держит позицию на таком уровне.','Прекрасно! Остальные ходы были заметно слабее.'],
  best:['Это лучший ход в позиции.','Точно в цель, сильнее здесь не сыграть.','Именно так сыграл бы и я.'],
  excellent:['Очень сильный ход, почти лучший.','Отлично, разница с лучшим ходом крошечная.'],
  good:['Нормальный, крепкий ход.','Хороший ход, хотя было чуть сильнее.'],
  book:['Книжный ход из дебютной теории.','Известная дебютная дорожка.'],
  inacc:['Неточность. Играть можно, но было лучше.','Чуть неаккуратно.'],
  mistake:['Ошибка: позиция заметно ухудшилась.','А вот это уже серьёзный промах.'],
  miss:['Соперник ошибся, а ты этим не воспользовался.','Был отличный шанс, и он упущен.'],
  blunder:['Зевок! Это грубая ошибка.','Ой-ой. Такой ход может стоить партии.']};
 for(const k in V)V[k].forEach((t,i)=>add(`v_${k}_${i}`,t));

 /* фигуры и поля */
 ['пешка','конь','слон','ладья','ферзь','король'].forEach((t,i)=>add('n_'+(i+1),t));
 ['пешку','коня','слона','ладью','ферзя','короля'].forEach((t,i)=>add('a_'+(i+1),t));
 const L={a:'а',b:'бэ',c:'цэ',d:'дэ',e:'е',f:'эф',g:'жэ',h:'аш'},D=['','один','два','три','четыре','пять','шесть','семь','восемь'];
 for(const f in L)for(let r=1;r<=8;r++)add('sq_'+f+r,f+r,L[f]+' '+D[r]);
 for(let n=0;n<=200;n++)add('num_'+n,String(n));

 const W={
  w_to:'на',w_takes:'бьёт на',w_and:'и',w_short:'короткая рокировка',w_long:'длинная рокировка',w_check:'шах',w_mate:'мат',w_promo:'с превращением в',
  i_this:'Этот ход',i_mate:'ставит мат',i_castle:'уводит короля в безопасность рокировкой',i_takes:'берёт',i_on:'на',i_promo:'превращает пешку',i_check:'объявляет шах',i_develop:'вводит фигуру в игру',i_center:'захватывает центр',i_attacks:'нападает на',
  x_nosave:'Спасения уже не было: даже лучший ход ведёт к мату.',x_oppmate:'Теперь соперник ставит мат в',x_missmate:'Упущен мат в',x_reply:'Соперник отвечает',x_lose:'В этом варианте ты теряешь материал. Разница в пешках:',x_better:'Лучше было',x_thismove:'этот ход',x_wins:'Он выигрывает материал.',
  x_stronger:'Сильнее было',x_nextback:'Нажми «Дальше» или «Назад», чтобы вернуться к партии.',x_try:'Попробуй сам: найди ход сильнее. Он на доске, просто сделай его.',x_right:'Верно! Это и есть лучший ход.',x_notyet:'Пока не то. Попробуй ещё раз.',
  s_ready:'Разбор готов.',s_white:'Точность белых',s_black:'Точность чёрных',s_pct0:'процентов',s_pct1:'процент',s_pct2:'процента',s_brilliant:'Блестящих ходов:',s_blunder:'Зевков:',s_mistake:'Ошибок:',s_miss:'Упущенных шансов:',s_clean:'Грубых ошибок не было, отличная партия.',s_go:'Нажимай «Дальше», пройдём ходы по очереди.',

  hi_0:'Привет! Сыграем партию?',hi_1:'Рад тебя видеть. С чего начнём?',hi_2:'Доска расставлена, твой ход.',hi_3:'Одна задача в день делает чудеса.',hi_4:'Загляни в квесты, там ждут награды.',
  hi_streak:'Серия горит! Не дай ей погаснуть сегодня.',hi_streakdone:'Сегодняшний день в серии засчитан. Так держать!',hi_reward:'Забери ежедневную награду, она уже ждёт.',hi_winstreak:'У тебя серия побед. Продолжим?',hi_brill:'Квест недели: найди блестящий ход. Отдай фигуру с умом!',
  g_win_0:'Победа! Отличная работа.',g_win_1:'Вот это игра! Ты победил.',g_win_2:'Чисто сыграно. Поздравляю!',g_loss_0:'Не расстраивайся. Разберём партию и станем сильнее.',g_loss_1:'Бывает. В следующий раз получится.',g_loss_2:'Каждое поражение учит. Заглянем в разбор?',g_draw_0:'Ничья. Силы оказались равны.',g_draw_1:'Мирный исход. Тоже результат.',
  g_streak3:'Три победы подряд! Ты разогрелся.',g_streak5:'Пять побед подряд! Тебя не остановить.',g_streak10:'Десять побед подряд! Невероятно.',g_brill:'Блестящий ход! Вот это красота.',
  p_start_mate:'Найди мат.',p_start_win:'Найди ход, который выигрывает материал.',p_good_0:'Верно!',p_good_1:'Отлично!',p_good_2:'Точно в цель!',p_next:'Продолжай.',p_bad_0:'Нет, это не решение. Попробуй ещё.',p_bad_1:'Мимо. Подумай ещё раз.',p_solved_0:'Задача решена!',p_solved_1:'Красиво решено.',p_hint:'Подсказка: ходи подсвеченной фигурой.',p_sol:'Вот решение.',p_daily:'Задача дня решена. Приходи завтра за новой!',
  p_rush_go:'Время пошло. Три ошибки, и конец.',p_rush_end:'Время вышло. Хорошая попытка!',p_rush_record:'Новый рекорд! Блестящий результат.',p_chapter:'Глава пройдена. Открыта следующая!',
  m_quest:'Квест выполнен! Забирай награду.',m_level:'Новый уровень! Ты растёшь.',m_ach:'Новое достижение!',m_reward:'Награда получена. До встречи завтра!',m_streak:'Серия дней продлена.',m_freeze:'Заморозка спасла твою серию.',m_weekall:'Все квесты недели выполнены. Ты чемпион!',m_buy:'Отличный выбор.',m_hello:'Меня зовут Филин. Я буду разбирать твои партии.'};
 for(const k in W)add(k,W[k]);

 const s=id=>({id,show:P[id][0]});
 const t=show=>({show});                       /* только текст/знак препинания */
 const num=n=>s('num_'+Math.max(0,Math.min(200,Math.round(n))));
 const sq=n=>s('sq_'+n);
 const pct=n=>{const a=n%10,b=n%100;return s(a===1&&b!==11?'s_pct1':a>=2&&a<=4&&(b<12||b>14)?'s_pct2':'s_pct0')};
 /* ход в записи SAN -> на экране запись, в голосе «конь бьёт на е пять» */
 function mv(san){
  const mark=san.endsWith('#')?'w_mate':san.endsWith('+')?'w_check':null;let ids;
  if(san.startsWith('O-O-O'))ids=['w_long'];else if(san.startsWith('O-O'))ids=['w_short'];
  else{const m=san.match(/^([KQRBN])?[a-h]?[1-8]?(x)?([a-h][1-8])(?:=([QRBN]))?/);if(!m)return[t(san)];
   const type={N:2,B:3,R:4,Q:5,K:6};ids=['n_'+(type[m[1]]||1),m[2]?'w_takes':'w_to','sq_'+m[3]];if(m[4])ids.push('w_promo','a_'+type[m[4]])}
  if(mark)ids.push(mark);
  return ids.map((id,i)=>({id,show:i?'':san}));
 }
 const text=segs=>segs.map(x=>x.show).filter(Boolean).join(' ').replace(/ ([.,:!?])/g,'$1');

 /* ---------- проигрывание ---------- */
 const BASE='voice/';
 let ctx=null,manifest,token=0,sources=[],endTimer=0;
 const cache=new Map();
 function unlock(){try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();if(ctx.state!=='running')ctx.resume()}catch(e){}}
 function loadManifest(){
  if(!manifest)manifest=fetch(BASE+'manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>j&&j.ids&&j.ids.length?{ids:new Set(j.ids),v:j.version||1}:null).catch(()=>null).then(m=>{if(!m)setTimeout(()=>manifest=null,60000);return m});
  return manifest;
 }
 /* срезаем тишину по краям, чтобы кусочки звучали слитно */
 function bounds(b){
  const d=b.getChannelData(0),th=.012;let a=0,z=d.length-1;
  while(a<z&&Math.abs(d[a])<th)a++;while(z>a&&Math.abs(d[z])<th)z--;
  const r=b.sampleRate;a=Math.max(0,a/r-.015);z=Math.min(b.duration,z/r+.04);return[a,Math.max(.05,z-a)];
 }
 function clip(id,v){
  if(!cache.has(id))cache.set(id,fetch(BASE+id+'.mp3?v='+v).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(a=>new Promise((ok,no)=>ctx.decodeAudioData(a,ok,no))).then(b=>({b,at:bounds(b)})).catch(()=>{cache.delete(id);return null}));
  return cache.get(id);
 }
 function stop(){token++;clearTimeout(endTimer);for(const x of sources)try{x.stop()}catch(e){}sources=[];try{speechSynthesis.cancel()}catch(e){}}
 /* запасной вариант для обычного браузера, пока файлы не записаны */
 function browserSpeech(segs,done){
  if(!('speechSynthesis' in window)||(api.inTelegram&&api.inTelegram()))return false;
  const u=new SpeechSynthesisUtterance(segs.filter(x=>x.id).map(x=>P[x.id][1]).join(' '));u.lang='ru-RU';
  const tk=token;u.onend=()=>{if(tk===token&&done)done(true)};u.onerror=()=>{if(tk===token&&done)done(false)};
  speechSynthesis.speak(u);return true;
 }
 async function say(segs,done,quiet){
  stop();const tk=token;unlock();
  const fail=()=>{if(api.onMissing&&!quiet)api.onMissing();done&&done(false)};
  const m=await loadManifest();if(tk!==token)return;
  if(!m||!ctx){if(!browserSpeech(segs,done))fail();return}
  const list=await Promise.all(segs.map(x=>x.id&&m.ids.has(x.id)?clip(x.id,m.v):null));if(tk!==token)return;
  if(!list.some(Boolean))return fail();
  let at=ctx.currentTime+.06;
  segs.forEach((x,i)=>{
   const c=list[i];
   if(c){const src=ctx.createBufferSource();src.buffer=c.b;src.connect(ctx.destination);src.start(at,c.at[0],c.at[1]);sources.push(src);at+=c.at[1]+(/[.!?]$/.test(P[x.id][0])?.22:.015)}
   else if(/^[.!?:]/.test(x.show))at+=.2;else if(x.show===',')at+=.12;
  });
  endTimer=setTimeout(()=>{if(tk===token)done&&done(true)},(at-ctx.currentTime)*1000+60);
 }
 if(typeof addEventListener==='function')addEventListener('pointerdown',unlock,{once:true,capture:true});
 const api={P,s,t,num,sq,pct,mv,text,say,stop,variants:k=>V[k].length,inTelegram:null,onMissing:null};
 return api;
})();
if(typeof module!=='undefined')module.exports=Voice;
