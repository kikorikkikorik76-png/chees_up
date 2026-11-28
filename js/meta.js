/* CHEES.UP — прогресс игрока: серии, квесты, уровни, достижения, монеты и лавка */
const Meta=(()=>{
 const DAY=864e5;
 const key=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const num=k=>{const[y,m,d]=k.split('-').map(Number);return Math.round(Date.UTC(y,m-1,d)/DAY)};
 const weekKey=(d=new Date())=>{const x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()-(x.getDay()+6)%7);return key(x)};
 const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};

 const blank=()=>({v:1,ts:0,xp:0,coins:0,day:{last:'',streak:0,best:0,freeze:1,total:0},win:{cur:0,best:0},reward:{last:'',step:0},
  daily:{key:'',ids:[],p:{},got:{}},weekly:{key:'',ids:[],p:{},got:{},bonus:false},ach:{},c:{},own:['b:club','b:blue','b:green','b:wood','b:violet','b:gray','o:scarf','p:classic'],
  equip:{o:'scarf',p:'classic'},stars:{},hist:[],rush:0,path:0,dp:'',brills:[]});
 let m=blank(),hooks={save(){},news(){},ready(){}};
 const merge=x=>{const b=blank();if(!x||x.v!==1)return b;for(const k in b)if(x[k]!==undefined)b[k]=b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])?Object.assign(b[k],x[k]):x[k];return b};

 /* ---------- квесты ---------- */
 /* ev — счётчик, n — цель, max — берётся лучший результат, а не сумма */
 const DAILY=[
  [{id:'play2',t:'Сыграй 2 партии с ботом',ev:'games',n:2},{id:'win1',t:'Выиграй партию',ev:'wins',n:1},{id:'black1',t:'Выиграй чёрными',ev:'winsBlack',n:1},{id:'mate1',t:'Поставь мат',ev:'mates',n:1}],
  [{id:'pz5',t:'Реши 5 задач',ev:'puzzles',n:5},{id:'pzc3',t:'Реши 3 задачи без ошибок и подсказок',ev:'clean',n:3},{id:'daily1',t:'Реши задачу дня',ev:'daily',n:1},{id:'rush5',t:'Набери 5 очков в блице задач',ev:'rushBest',n:5,max:1}],
  [{id:'cap12',t:'Возьми 12 фигур в партиях',ev:'captures',n:12},{id:'chk5',t:'Объяви 5 шахов',ev:'checks',n:5},{id:'castle2',t:'Сделай рокировку в 2 партиях',ev:'castles',n:2},{id:'rev1',t:'Разбери одну партию',ev:'reviews',n:1}]];
 const WEEKLY=[
  {id:'w_brill',t:'Поставь блестящий ход в любой партии (исход не важен)',ev:'brilliant',n:1,big:1},
  {id:'w_win7',t:'Выиграй 7 партий',ev:'wins',n:7},{id:'w_pz40',t:'Реши 40 задач',ev:'puzzles',n:40},{id:'w_play12',t:'Сыграй 12 партий',ev:'games',n:12},
  {id:'w_row3',t:'Выиграй 3 партии подряд',ev:'winRow',n:3,max:1},{id:'w_mate5',t:'Поставь 5 матов',ev:'mates',n:5},{id:'w_rush10',t:'Набери 10 очков в блице задач',ev:'rushBest',n:10,max:1},
  {id:'w_rev4',t:'Разбери 4 партии',ev:'reviews',n:4},{id:'w_days5',t:'Заходи и играй 5 разных дней',ev:'days',n:5},{id:'w_promo2',t:'Проведи 2 пешки в фигуры',ev:'promos',n:2}];
 const DR={coins:30,xp:40},WR={coins:100,xp:150},BR={coins:250,xp:300},ALL={coins:300,xp:300};
 const questById=id=>DAILY.flat().find(q=>q.id===id)||WEEKLY.find(q=>q.id===id);
 const reward=(id,weekly)=>{const q=questById(id);return weekly?(q.big?BR:WR):DR};
 function roll(){
  const d=key(),w=weekKey();let changed=false;
  if(m.daily.key!==d){const h=hash('d'+d);m.daily={key:d,ids:DAILY.map((g,i)=>g[(h>>>(i*5))%g.length].id),p:{},got:{}};changed=true}
  if(m.weekly.key!==w){let h=hash('w'+w);const pool=WEEKLY.slice(1),ids=['w_brill'];while(ids.length<4){const i=h%pool.length;ids.push(pool.splice(i,1)[0].id);h=hash(w+ids.length+h)}m.weekly={key:w,ids,p:{},got:{},bonus:false};changed=true}
  return changed;
 }
 function quests(kind){
  roll();const box=m[kind];
  return box.ids.map(id=>{const q=questById(id),p=Math.min(q.n,box.p[id]||0);return Object.assign({},q,{p,done:p>=q.n,got:!!box.got[id],reward:reward(id,kind==='weekly')})});
 }
 const claimable=()=>['daily','weekly'].reduce((a,k)=>a+quests(k).filter(q=>q.done&&!q.got).length,0)+(rewardReady()?1:0);

 /* ---------- уровни ---------- */
 const TITLES=[[1,'Новичок'],[3,'Ученик'],[5,'Любитель'],[8,'Разрядник'],[12,'Кандидат в мастера'],[16,'Мастер клуба'],[22,'Гроссмейстер клуба'],[30,'Легенда клуба']];
 function level(){let l=1,x=m.xp,need=100;while(x>=need){x-=need;l++;need=100+(l-1)*40}return{n:l,x,need,title:TITLES.filter(t=>t[0]<=l).pop()[1]}}
 function gain(r){
  const before=level().n;m.xp+=r.xp||0;m.coins+=r.coins||0;const after=level();
  if(after.n>before){m.coins+=50*(after.n-before);hooks.news({icon:'crown',title:`Уровень ${after.n}`,text:`Звание: ${after.title}. Бонус ${50*(after.n-before)} монет.`,say:'m_level'})}
 }

 /* ---------- достижения ---------- */
 const c=k=>m.c[k]||0,starsTotal=()=>Object.values(m.stars).reduce((a,b)=>a+b,0);
 const ACH=[
  ['win1','Первая победа','Выиграй партию','trophy',()=>c('wins'),1],['win10','Боец','Выиграй 10 партий','trophy',()=>c('wins'),10],['win50','Гроза клуба','Выиграй 50 партий','trophy',()=>c('wins'),50],
  ['row3','Разогрев','3 победы подряд','bolt',()=>m.win.best,3],['row5','В ударе','5 побед подряд','bolt',()=>m.win.best,5],['row10','Неудержимый','10 побед подряд','bolt',()=>m.win.best,10],
  ['day3','Привычка','Серия 3 дня','flame',()=>m.day.best,3],['day7','Неделя в строю','Серия 7 дней','flame',()=>m.day.best,7],['day30','Железная воля','Серия 30 дней','flame',()=>m.day.best,30],['day100','Сотня','Серия 100 дней','flame',()=>m.day.best,100],
  ['pz10','Разминка','Реши 10 задач','puzzle',()=>c('puzzles'),10],['pz50','Тактик','Реши 50 задач','puzzle',()=>c('puzzles'),50],['pz200','Решатель','Реши 200 задач','puzzle',()=>c('puzzles'),200],
  ['path50','Путник','Пройди 50 задач на пути','target',()=>m.path,50],['rush5','Быстрые руки','5 очков в блице задач','clock',()=>m.rush,5],['rush12','Молния','12 очков в блице задач','clock',()=>m.rush,12],['rush20','Шторм','20 очков в блице задач','clock',()=>m.rush,20],
  ['br1','Бриллиант','Первый блестящий ход','gem',()=>c('brilliant'),1],['br5','Ювелир','5 блестящих ходов','gem',()=>c('brilliant'),5],
  ['mate1','Мат!','Поставь мат','sword',()=>c('mates'),1],['mate25','Охотник на королей','Поставь 25 матов','sword',()=>c('mates'),25],['promo1','Из пешек в ферзи','Преврати пешку','crown',()=>c('promos'),1],['quick1','Блицкриг','Выиграй за 20 ходов','bolt',()=>c('quick'),1],
  ['lv3','Выше среднего','Победи бота 3 уровня','shield',()=>c('maxBeat'),3],['lv5','Серьёзный соперник','Победи бота 5 уровня','shield',()=>c('maxBeat'),5],['lv8','Покоритель машины','Победи бота 8 уровня','shield',()=>c('maxBeat'),8],
  ['st12','Звездочёт','Собери 12 звёзд','star',()=>starsTotal(),12],['st24','Все звёзды','Собери все 24 звезды','star',()=>starsTotal(),24],
  ['rev5','Аналитик','Разбери 5 партий','target',()=>c('reviews'),5],['week1','Чемпион недели','Выполни все квесты недели','crown',()=>c('weeksFull'),1]
 ].map(([id,n,t,icon,val,goal])=>({id,n,t,icon,val,goal}));
 const achievements=()=>ACH.map(a=>({id:a.id,n:a.n,t:a.t,icon:a.icon,goal:a.goal,p:Math.min(a.goal,a.val()),done:!!m.ach[a.id]}));
 function checkAch(){
  for(const a of ACH)if(!m.ach[a.id]&&a.val()>=a.goal){m.ach[a.id]=key();gain({xp:60,coins:40});hooks.news({icon:a.icon,title:'Достижение: '+a.n,text:a.t+'. +40 монет',say:'m_ach'})}
 }

 /* ---------- серия дней ---------- */
 function dayState(){
  const d=m.day;if(!d.last)return{streak:0,today:false,risk:false};
  const gap=num(key())-num(d.last);
  if(gap<=0)return{streak:d.streak,today:true,risk:false};
  if(gap-1>d.freeze)return{streak:0,today:false,risk:false};
  return{streak:d.streak,today:false,risk:true};
 }
 function active(){
  const d=m.day,t=key();if(d.last===t)return;
  const gap=d.last?num(t)-num(d.last):0;if(d.last&&gap<0)return;/* часы перевели назад */
  const missed=gap-1;
  if(d.last&&missed===0)d.streak++;
  else if(d.last&&missed<=d.freeze){d.freeze-=missed;d.streak++;hooks.news({icon:'shield',title:'Серия спасена',text:`Заморозки закрыли пропущенные дни: ${missed}.`,say:'m_freeze'})}
  else d.streak=1;
  d.last=t;d.total++;d.best=Math.max(d.best,d.streak);
  bump('days',1);
  if(d.streak%7===0){const r={coins:100,xp:100};gain(r);if(d.freeze<2)d.freeze++;hooks.news({icon:'flame',title:`${d.streak} дней подряд!`,text:'+100 монет и заморозка серии',say:'m_streak'})}
  else if(d.streak>1)hooks.news({icon:'flame',title:`Серия: ${d.streak}`,text:'Сегодняшний день засчитан',say:'m_streak',small:true});
 }

 /* ---------- ежедневный подарок ---------- */
 const REWARDS=[{coins:20},{coins:30},{coins:40},{freeze:1},{coins:60},{coins:80},{coins:200,xp:100}];
 const rewardReady=()=>m.reward.last!==key()&&!(m.reward.last&&num(m.reward.last)>num(key()));
 function rewardStep(){const r=m.reward;if(!r.last)return 0;const gap=num(key())-num(r.last);if(gap===0)return r.step;return gap===1?r.step%7+1:1}
 /* step: номер полученного дня 1..7 */
 const rewardView=()=>{const ready=rewardReady();let s=rewardStep();if(ready&&!s)s=1;return{ready,step:s,list:REWARDS}};
 function claimReward(){
  if(!rewardReady())return null;const step=m.reward.last&&num(key())-num(m.reward.last)===1?m.reward.step%7+1:1;
  let r=REWARDS[step-1];m.reward={last:key(),step};
  if(r.freeze){if(m.day.freeze<2)m.day.freeze++;else r={coins:60}}
  gain(r);commit();return r;
 }

 /* ---------- события ---------- */
 function bump(ev,v){
  const isMax=ev==='rushBest'||ev==='winRow'||ev==='maxBeat';
  m.c[ev]=isMax?Math.max(c(ev),v):c(ev)+v;
  for(const kind of['daily','weekly']){const box=m[kind];for(const id of box.ids){const q=questById(id);if(q.ev!==ev)continue;const was=box.p[id]||0;box.p[id]=q.max?Math.max(was,v):was+v;
   if(was<q.n&&box.p[id]>=q.n)hooks.news({icon:q.ev==='brilliant'?'gem':'check',title:kind==='weekly'?'Квест недели выполнен':'Квест дня выполнен',text:q.t,say:'m_quest',small:kind==='daily'})}}
 }
 function commit(){checkAch();m.ts=Date.now();hooks.save(m)}
 function event(type,d={}){
  roll();
  if(type==='game'){
   active();bump('games',1);
   if(d.result==='w'){
    m.win.cur++;m.win.best=Math.max(m.win.best,m.win.cur);bump('wins',1);bump('winRow',m.win.cur);bump('maxBeat',d.level);
    if(d.color==='b')bump('winsBlack',1);if(d.mate)bump('mates',1);if(d.moves<=20)bump('quick',1);
    const stars=d.assisted?1:d.moves<=40?3:2;if(stars>(m.stars[d.level]||0))m.stars[d.level]=stars;
    const bonus=Math.min(50,(m.win.cur-1)*10);gain({xp:40+d.level*12+bonus,coins:15+d.level*4});
    if([3,5,10].includes(m.win.cur)){const coins=m.win.cur*20;gain({coins,xp:coins});hooks.news({icon:'bolt',title:`Серия побед: ${m.win.cur}`,text:`Бонус ${coins} монет`,say:'g_streak'+m.win.cur})}
   }else{m.win.cur=0;gain({xp:d.result==='d'?25:12,coins:d.result==='d'?8:3})}
  }else if(type==='break')m.win.cur=0;
  else if(type==='move'){if(d.capture)bump('captures',1);if(d.check)bump('checks',1);if(d.castle)bump('castles',1);if(d.promo)bump('promos',1)}
  else if(type==='brilliant'){if(m.brills.includes(d.id))return false;m.brills=[d.id,...m.brills].slice(0,20);active();bump('brilliant',1);gain({xp:80,coins:50});hooks.news({icon:'gem',title:'Блестящий ход!',text:`${d.san}: +50 монет`,say:'g_brill'})}
  else if(type==='puzzle'){active();bump('puzzles',1);if(d.clean)bump('clean',1);
   if(d.daily&&m.dp!==key()){m.dp=key();bump('daily',1);gain({xp:50,coins:30});hooks.news({icon:'target',title:'Задача дня решена',text:'+30 монет',say:'p_daily'})}
   gain({xp:d.clean?10:4,coins:d.clean?3:1})}
  else if(type==='rush'){active();const rec=d.score>m.rush;if(rec)m.rush=d.score;bump('rushBest',d.score);gain({xp:d.score*4,coins:d.score*2});commit();return rec}
  else if(type==='path'){if(d.pos>m.path){m.path=d.pos;if(m.path%10===0){gain({xp:100,coins:80});hooks.news({icon:'target',title:`Глава ${m.path/10} пройдена`,text:'+80 монет',say:'p_chapter'})}}}
  else if(type==='review'){active();bump('reviews',1);gain({xp:10})}
  else if(type==='rating'){const t=key(),h=m.hist;if(h.length&&h[h.length-1][0]===t)h[h.length-1][1]=d.value;else h.push([t,d.value]);if(h.length>30)h.shift()}
  commit();return true;
 }
 function claim(kind,id){
  roll();const q=quests(kind).find(x=>x.id===id);if(!q||!q.done||q.got)return false;
  m[kind].got[id]=1;gain(q.reward);
  if(kind==='weekly'&&!m.weekly.bonus&&m.weekly.ids.every(i=>m.weekly.got[i])){m.weekly.bonus=true;bump('weeksFull',1);gain(ALL);hooks.news({icon:'crown',title:'Все квесты недели!',text:`Главный сундук: ${ALL.coins} монет`,say:'m_weekall'})}
  commit();return true;
 }

 /* ---------- лавка ---------- */
 const SHOP=[
  ...[['club','Орех',0],['blue','Синяя',0],['green','Зелёная',0],['wood','Дерево',0],['violet','Фиолетовая',0],['gray','Серая',0],['ocean','Океан',300],['candy','Карамель',350],['night','Полночь',500],['gold','Золотой зал',800]].map(([id,n,price])=>({id:'b:'+id,g:'b',key:id,n,price})),
  ...[['scarf',0],['forest',200],['night',350],['royal',900]].map(([k,price])=>({id:'o:'+k,g:'o',key:k,n:Art.OUTFITS[k].n,price})),
  {id:'p:classic',g:'p',key:'classic',n:'Классика',price:0},{id:'p:amber',g:'p',key:'amber',n:'Янтарь',price:450},{id:'p:ruby',g:'p',key:'ruby',n:'Рубин и лёд',price:600},
  {id:'freeze',g:'f',key:'freeze',n:'Заморозка серии',price:200}];
 function buy(id){
  const it=SHOP.find(x=>x.id===id);if(!it)return 'нет такого';
  if(it.g!=='f'&&m.own.includes(id))return null;
  if(it.g==='f'&&m.day.freeze>=2)return 'Больше двух заморозок хранить нельзя';
  if(m.coins<it.price)return `Не хватает монет: ${it.price-m.coins}`;
  m.coins-=it.price;if(it.g==='f')m.day.freeze++;else m.own.push(id);commit();return null;
 }
 function equip(g,k){if(!m.own.includes(g+':'+k))return false;if(g!=='b'){m.equip[g]=k;commit()}return true}

 return{init(saved,h){hooks=Object.assign(hooks,h);m=merge(saved);roll()},get data(){return m},load(x){m=merge(x);roll()},reset(){m=blank();roll();m.ts=Date.now();hooks.save(m)},
  key,quests,claim,claimable,level,achievements,dayState,rewardView,claimReward,event,SHOP,buy,equip,starsTotal,hash,
  msLeft(kind){const n=new Date(),e=new Date(n);e.setHours(24,0,0,0);if(kind==='weekly')e.setDate(e.getDate()+(7-(n.getDay()||7)));return e-n}};
})();
if(typeof module!=='undefined')module.exports=Meta;
