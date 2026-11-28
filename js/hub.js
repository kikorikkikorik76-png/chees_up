/* ---------- клуб: главная, квесты, профиль, лавка и награды ---------- */
const BOTS=[
 {n:'Пешка Тоша',d:'Только учится и часто зевает',p:1,c:'#5f9d62'},
 {n:'Конёк Боря',d:'Скачет куда попало',p:2,c:'#4f93a8'},
 {n:'Слониха Мила',d:'Любит диагонали, но спешит',p:3,c:'#5b74b8'},
 {n:'Ладья Захар',d:'Играет прямо и крепко',p:4,c:'#8466b0'},
 {n:'Дядя Гамбит',d:'Видит тактику на пару ходов',p:2,c:'#b0618e'},
 {n:'Графиня Вилка',d:'Не прощает висящих фигур',p:5,c:'#c0585a'},
 {n:'Проф. Цугцванг',d:'Долго думает и больно бьёт',p:5,c:'#b9702f'},
 {n:'Железный Мат',d:'Максимальная сила движка',p:6,c:'#4a4f57'}];
const botAva=l=>`<span class="botava" style="background:${BOTS[l-1].c}">${pieceSvg(BOTS[l-1].p)}</span>`;
const BOARDS={club:['#eadcc0','#9a6b47'],blue:['#eadcc0','#9a6b47'],green:['#eef0d8','#6f8f5a'],wood:['#f0d9b5','#a9764f'],violet:['#e9e4f5','#7d6ba8'],gray:['#dfe3e6','#74808a'],ocean:['#d6ecef','#3f7f93'],candy:['#fbe6ea','#c9708c'],night:['#8f9bb8','#3b4563'],gold:['#fbecc0','#b58a2e']};
BOARDS.blue=['#e2ebf2','#5f86a8'];
const Hub={
 qtab:'daily',ptab:'me',queue:[],ready:false,cloudTimer:0,
 init(){
  Voice.inTelegram=()=>TG.on;
  Voice.onMissing=()=>toast('Озвучка ещё не записана — нужен запуск «Озвучить тренера» на GitHub');
  Meta.init(store.get('meta',null),{save:m=>{store.set('meta',m);this.push()},news:n=>this.news(n)});
  const css=document.createElement('style');css.textContent=Object.entries(BOARDS).map(([k,[l,d]])=>`body[data-theme=${k}]{--light:${l};--dark:${d}}`).join('');document.head.appendChild(css);
  this.equip();this.themes();
  const row=$('#botRow');BOTS.forEach((b,i)=>{const x=document.createElement('button');x.type='button';x.style.setProperty('--c',b.c);x.onclick=e=>{e.preventDefault();$('#level').value=i+1;this.bot()};row.appendChild(x)});
  setTimeout(()=>{this.bot();this.pull()});
  setInterval(()=>this.badge(),30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&['home','quests'].includes(Ctl.view))Ctl.go(Ctl.view)});
 },
 equip(){
  if(!Meta.data.own.includes('b:'+cfg.theme)){cfg.theme='club';store.set('cfg',cfg)}
  document.body.dataset.theme=cfg.theme;setPieces(Meta.data.equip.p);
 },
 themes(){
  const s=$('#sTheme');s.innerHTML=Meta.SHOP.filter(x=>x.g==='b'&&Meta.data.own.includes(x.id)).map(x=>`<option value="${x.key}">${x.n}</option>`).join('');s.value=cfg.theme;
 },
 changed(){},
 /* ---- облако Telegram: прогресс переезжает между устройствами ---- */
 pull(){
  if(!TG.cloud)return;
  TG.cloud.get('save').then(v=>{
   if(v===undefined)return;this.ready=true;
   let x=null;try{x=v&&JSON.parse(v)}catch(e){}
   if(x&&x.m&&x.m.ts>Meta.data.ts){Meta.load(x.m);Object.assign(stats,x.s);store.set('stats',stats);store.set('meta',Meta.data);this.equip();this.themes();if(['home','quests','profile','puzzles'].includes(Ctl.view))Ctl.go(Ctl.view)}
   else if(Meta.data.ts)this.push();
  });
 },
 push(){
  if(!this.ready||!TG.cloud)return;clearTimeout(this.cloudTimer);
  this.cloudTimer=setTimeout(()=>{const m=Object.assign({},Meta.data);let v=JSON.stringify({m,s:stats});
   if(v.length>4000){m.hist=m.hist.slice(-10);m.brills=m.brills.slice(0,8);v=JSON.stringify({m,s:stats})}
   if(v.length<=4096)TG.cloud.set('save',v)},1500);
 },
 /* ---- сообщения о наградах ---- */
 playing(){return(Ctl.view==='play'&&Play.active())||Puzzles.busy()},
 news(n){
  if(this.playing()){if(n.say==='g_brill'){toast('!! Блестящий ход! Квест засчитан');speak([Voice.s('g_brill')])}else this.queue.push(n);return}
  this.queue.push(n);clearTimeout(this.ft);this.ft=setTimeout(()=>this.flush(),700);
 },
 flush(){
  this.badge();
  if(this.playing()||$('#party').classList.contains('on')||$('#modal').classList.contains('on')||!this.queue.length)return;
  if(['analysis','solve'].includes(Ctl.view)){const n=this.queue.shift();toast(n.title);return this.queue.length?void setTimeout(()=>this.flush(),2300):null}
  const small=this.queue.filter(n=>n.small),big=this.queue.filter(n=>!n.small);
  if(!big.length){this.queue=[];toast(small.map(n=>n.title).join(' · '));return}
  this.queue=big.slice(1).concat(small);const n=big[0];
  this.party(`<div class="medal">${Art.ico(n.icon)}</div><h2>${esc(n.title)}</h2><p>${esc(n.text)}</p>`,[['Отлично',null,1]],true);
  if(n.say)speak([Voice.s(n.say)]);
 },
 party(html,buttons,confetti){
  const p=$('#party');p.innerHTML=`<div>${confetti?'<div class="confetti">'+'<i></i>'.repeat(18)+'</div>':''}${html}<div class="row"></div></div>`;
  const r=p.querySelector('.row');
  for(const[t,fn,main]of buttons){const b=document.createElement('button');b.textContent=t;if(main)b.className='primary';b.onclick=()=>{p.classList.remove('on');fn&&fn();setTimeout(()=>this.flush(),300)};r.appendChild(b)}
  p.classList.add('on');
 },
 gameOver(over,reward){
  if(Ctl.view!=='play')return;
  const bot=Play.opt.mode==='bot',res=!bot||over.winner==='d'?'draw':over.winner===Play.opt.color?'win':'loss';
  const id=bot?`g_${res}_${Play.id.charCodeAt(Play.id.length-1)%(res==='draw'?2:3)}`:'g_draw_1';
  const stars=Meta.data.stars[Play.opt.level]||0;
  const gain=reward?`<div class="gains"><span>${Art.ico('star')}+${reward.xp} опыта</span><span>${Art.ico('coin')}+${reward.coins}</span>${reward.row>1&&res==='win'?`<span>${Art.ico('bolt')}серия ${reward.row}</span>`:''}</div>${res==='win'?`<div class="stars big">${'★'.repeat(stars)}<i>${'★'.repeat(3-stars)}</i></div>`:''}`
   :bot?'<p class="note">Партия слишком короткая или начата не с начальной позиции — без наград.</p>':'';
  this.party(`<div class="coachface">${owl(res==='win'?'happy':res==='loss'?'sad':'calm')}</div><h2>${esc(over.title)}</h2><p>${esc(over.reason)} · ${over.res}</p>${bot?`<p class="quote">${Voice.P[id][0]}</p>`:''}${gain}`,
   [['Разбор партии',()=>Play.review(),1],['Реванш',()=>Play.rematch()],['Закрыть']],res==='win'&&!cfg.lite);
  if(bot)speak([Voice.s(id)]);
 },
 badge(){const n=Meta.claimable(),e=$('#qBadge');if(e){e.textContent=n||'';e.style.display=n?'':'none'}},
 /* ---- выбор соперника ---- */
 bot(){
  const l=+$('#level').value,b=BOTS[l-1],s=Meta.data.stars[l]||0;
  $('#botCard').innerHTML=`${botAva(l)}<span class="grow"><b>${b.n}</b><small>${b.d}</small><small>Уровень ${l} из 8</small></span><span class="stars">${'★'.repeat(s)}<i>${'★'.repeat(3-s)}</i></span>`;
  [...$('#botRow').children].forEach((x,i)=>{const st=Meta.data.stars[i+1]||0;x.innerHTML=`<b>${i+1}</b><small>${st?'★'.repeat(st):'·'}</small>`;x.classList.toggle('on',i+1===l)});
 },
 /* ---- общие кусочки ---- */
 left(kind){const m=Meta.msLeft(kind)/60000|0,d=m/1440|0,h=(m/60|0)%24;return d?`${d} дн ${h} ч`:h?`${h} ч ${m%60} мин`:`${m} мин`},
 quest(q,kind){
  return `<div class="quest ${q.done?'done':''} ${q.big?'big':''}">${Art.ico(q.got?'check':q.big?'gem':kind==='weekly'?'trophy':'target')}<span class="grow"><b>${q.t}</b><span class="bar"><i style="width:${q.p/q.n*100}%"></i></span><small>${q.p} из ${q.n} · ${q.reward.coins} монет · ${q.reward.xp} опыта</small></span>${q.done&&!q.got?`<button class="primary" data-claim="${kind}:${q.id}">Забрать</button>`:''}</div>`;
 },
 head(title){return `<header class="shead"><h1>${title}</h1><span class="pill">${Art.ico('coin')}<b>${Meta.data.coins}</b></span><span class="pill">${Art.ico('flame')}<b>${Meta.dayState().streak}</b></span></header>`},
 tabs(list,cur){return `<div class="seg">${list.map(([k,n])=>`<button data-tab="${k}" class="${cur===k?'on':''}">${n}</button>`).join('')}</div>`},
 greeting(){
  const d=Meta.dayState(),m=Meta.data,h=Meta.hash(Meta.key());
  if(!m.xp)return'm_hello';
  if(Meta.rewardView().ready)return'hi_reward';if(d.risk)return'hi_streak';if(m.win.cur>=2)return'hi_winstreak';
  const b=Meta.quests('weekly')[0];if(!b.done&&h%2)return'hi_brill';return d.today?'hi_streakdone':'hi_'+h%5;
 },
 /* ---- главная ---- */
 home(){
  const l=Meta.level(),d=Meta.dayState(),m=Meta.data,rw=Meta.rewardView(),g=this.greeting(),dp=PUZZLES[Puzzles.daily()],dpDone=m.dp===Meta.key();
  const lv=Math.max(1,Math.min(8,+$('#level').value)),daily=Meta.quests('daily'),brill=Meta.quests('weekly')[0],on=Play.started&&!Play.over;
  $('#v-home .wrap').innerHTML=`
  <header class="me"><button class="lvl" data-go="profile" style="--p:${l.x/l.need*100}%"><b>${l.n}</b></button><span class="grow"><b>${esc(cfg.name)}</b><small>${l.title}</small><span class="bar"><i style="width:${l.x/l.need*100}%"></i></span></span><span class="pill">${Art.ico('coin')}<b>${m.coins}</b></span></header>
  <button class="hello" id="hello"><span class="coachface">${owl(d.risk?'think':rw.ready?'happy':'calm')}</span><span class="bubble"><span>${Voice.P[g][0]}</span><i>${icon('sound')}</i></span></button>
  <div class="streaks">
   <button data-go="quests" class="${d.today?'hot':d.risk?'risk':''}">${Art.ico('flame')}<span><b>${d.streak}</b><small>${d.today?'дней подряд ✓':d.risk?'сыграй сегодня!':'серия дней'}</small></span></button>
   <button data-go="quests" class="${m.win.cur?'hot':''}">${Art.ico('bolt')}<span><b>${m.win.cur}</b><small>серия побед · рекорд ${m.win.best}</small></span></button>
  </div>
  <button class="cta" id="hPlay"><span class="grow"><b>${on?'Продолжить партию':'Играть'}</b><small>${on?Play.names().join(' — '):BOTS[lv-1].n+' · уровень '+lv}</small></span>${botAva(on&&Play.opt.mode==='bot'?Play.opt.level:lv)}</button>
  <div class="pair">
   <button class="tile" id="hDaily">${miniBoard(dp[0])}<span><b>Задача дня</b><small>${dpDone?'решена ✓':'+30 монет'}</small></span></button>
   <button class="tile ${rw.ready?'glow':''}" id="hGift">${Art.ico('gift','big')}<span><b>Подарок</b><small>${rw.ready?'забрать!':'завтра ещё'}</small></span></button>
  </div>
  <button class="tile qsum" data-go="quests"><span class="qtitle"><b>Квесты дня</b><small>${daily.filter(q=>q.done).length} из 3</small></span>${daily.map(q=>`<span class="qline ${q.done?'done':''}"><span>${q.t}</span><span class="bar"><i style="width:${q.p/q.n*100}%"></i></span></span>`).join('')}<span class="qline week ${brill.done?'done':''}">${Art.ico('gem')}<span>Квест недели: блестящий ход</span><b>${brill.done?'✓':'0/1'}</b></span></button>
  <div class="tools3"><button data-go="analysis">${icon('search')}<span>Анализ</span></button><button data-go="editor">${icon('edit')}<span>Редактор</span></button><button data-go="settings">${icon('gear')}<span>Настройки</span></button></div>`;
  $$('#v-home [data-go]').forEach(b=>b.onclick=()=>Ctl.go(b.dataset.go));
  $('#hello').onclick=()=>Voice.say([Voice.s(g)]);
  $('#hPlay').onclick=()=>{if(Play.over)Play.started=false;Ctl.go('play')};
  $('#hDaily').onclick=()=>Puzzles.open('daily');
  $('#hGift').onclick=()=>this.gift();
  this.badge();
 },
 gift(){
  if(!Meta.rewardView().ready){this.qtab='daily';return Ctl.go('quests')}
  const r=Meta.claimReward();if(!r)return;sound('good');
  const text=r.freeze?'Заморозка серии':`${r.coins} монет${r.xp?' и '+r.xp+' опыта':''}`;
  this.party(`<div class="medal">${Art.ico(r.freeze?'shield':'gift')}</div><h2>Подарок дня</h2><p>${text}</p>`,[['Забрать',()=>Ctl.go(Ctl.view),1]],true);speak([Voice.s('m_reward')]);
 },
 /* ---- квесты ---- */
 quests(){
  const t=this.qtab,m=Meta.data,d=Meta.dayState(),rw=Meta.rewardView();let body='';
  if(t==='daily'){
   body=`<div class="card"><div class="qtitle"><b>Подарок за вход</b><small>7 дней подряд — большой приз</small></div><div class="week7">${rw.list.map((r,i)=>{const n=i+1,got=rw.ready?n<rw.step:n<=rw.step;return `<span class="${got?'got':''} ${rw.ready&&n===rw.step?'now':''}"><small>День ${n}</small>${Art.ico(got?'check':r.freeze?'shield':n===7?'gift':'coin')}<b>${r.freeze?'❄':r.coins}</b></span>`}).join('')}</div>${rw.ready?'<button class="primary big" id="qGift">Забрать подарок</button>':''}</div>
   <div class="qtitle"><b>Квесты дня</b><small>обновятся через ${this.left('daily')}</small></div>${Meta.quests('daily').map(q=>this.quest(q,'daily')).join('')}
   <div class="duo"><div class="card">${Art.ico('flame')}<b>${d.streak}</b><small>серия дней · рекорд ${m.day.best}</small><small>заморозки: ${'❄'.repeat(m.day.freeze)||'нет'}</small></div><div class="card">${Art.ico('bolt')}<b>${m.win.cur}</b><small>серия побед · рекорд ${m.win.best}</small><small>бонус за 3, 5 и 10</small></div></div>`;
  }else if(t==='weekly'){
   const q=Meta.quests('weekly'),got=q.filter(x=>x.got).length;
   body=`<div class="qtitle"><b>Квесты недели</b><small>осталось ${this.left('weekly')}</small></div>${q.map(x=>this.quest(x,'weekly')).join('')}
   <div class="chest ${m.weekly.bonus?'done':''}">${Art.ico(m.weekly.bonus?'check':'gift')}<span class="grow"><b>Главный сундук недели</b><span class="bar"><i style="width:${got*25}%"></i></span><small>${m.weekly.bonus?'Получен!':`Забери все 4 квеста: +300 монет (${got}/4)`}</small></span></div>
   <p class="note">Награды даются за партии с ботом из начальной позиции. Блестящий ход засчитывается сразу, даже если партию потом проиграть или сдать.</p>`;
  }else{
   const a=Meta.achievements();
   body=`<div class="qtitle"><b>Достижения</b><small>${a.filter(x=>x.done).length} из ${a.length}</small></div><div class="achs">${a.sort((x,y)=>y.done-x.done||y.p/y.goal-x.p/x.goal).map(x=>`<div class="ach ${x.done?'done':''}">${Art.ico(x.icon)}<b>${x.n}</b><small>${x.t}</small><span class="bar"><i style="width:${x.done?100:x.p/x.goal*100}%"></i></span></div>`).join('')}</div>`;
  }
  const el=$('#v-quests .wrap');el.innerHTML=this.head('Квесты')+this.tabs([['daily','Сегодня'],['weekly','Неделя'],['ach','Достижения']],t)+body;
  el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{this.qtab=b.dataset.tab;this.quests();$('#v-quests').scrollTop=0});
  el.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{const[k,id]=b.dataset.claim.split(':');if(Meta.claim(k,id)){sound('good');toast('Награда получена!');this.quests();this.badge()}});
  const g=$('#qGift');if(g)g.onclick=()=>this.gift();
  this.badge();
 },
 /* ---- профиль, лавка, партии ---- */
 profile(){
  const t=this.ptab,m=Meta.data,l=Meta.level();let body='';
  if(t==='me'){
   const h=m.hist.map(x=>x[1]),lo=Math.min(...h)-20,hi=Math.max(...h)+20;
   const graph=h.length>1?`<svg class="rgraph" viewBox="0 0 100 40" preserveAspectRatio="none"><polyline points="${h.map((v,i)=>`${i/(h.length-1)*100},${38-(v-lo)/(hi-lo)*36}`).join(' ')}" fill="none" stroke="#d9a441" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`:'<p class="note">График появится, когда порешаешь задачи в разные дни.</p>';
   body=`<div class="card hero"><div class="lvl" style="--p:${l.x/l.need*100}%"><b>${l.n}</b></div><span class="grow"><b>${esc(cfg.name)}</b><small>${l.title}</small><small>${l.x} / ${l.need} опыта до уровня ${l.n+1}</small></span><span class="coachface">${owl('happy')}</span></div>
   <div class="stats">${[['Победы',stats.w],['Ничьи',stats.d],['Поражения',stats.l],['Звёзды',Meta.starsTotal()+'/24'],['Задачи',stats.solved],['Блиц',m.rush],['!! ходы',m.c.brilliant||0],['Дней в клубе',m.day.total]].map(([a,b])=>`<div><b>${b}</b><small>${a}</small></div>`).join('')}</div>
   <div class="card"><div class="qtitle"><b>Рейтинг задач</b><small>${stats.rating}</small></div>${graph}</div>
   <div class="tools3"><button data-go="analysis">${icon('search')}<span>Анализ</span></button><button data-go="editor">${icon('edit')}<span>Редактор</span></button><button data-go="settings">${icon('gear')}<span>Настройки</span></button></div>`;
  }else if(t==='shop'){
   const preview=it=>it.g==='b'?`<span class="swatch" style="--l:${BOARDS[it.key][0]};--d:${BOARDS[it.key][1]}"></span>`:it.g==='o'?`<span class="coachface">${Art.owl('calm',it.key)}</span>`:it.g==='p'?`<span class="sets">${PIECE_SETS[it.key].map(c=>`<i style="background:linear-gradient(90deg,${c.join()})"></i>`).join('')}</span>`:Art.ico('shield','big');
   body=[['f','Для серии'],['b','Доски'],['p','Фигуры'],['o','Наряды Филина']].map(([g,n])=>`<h2>${n}</h2><div class="shop">${Meta.SHOP.filter(x=>x.g===g).map(it=>{
    const own=m.own.includes(it.id),used=own&&(g==='b'?cfg.theme===it.key:m.equip[g]===it.key);
    return `<button class="item ${used?'used':''}" data-item="${it.id}">${preview(it)}<b>${it.n}</b><small>${used?'Выбрано ✓':own?'Выбрать':Art.ico('coin')+it.price}${g==='f'?` · есть ${m.day.freeze}/2`:''}</small></button>`}).join('')}</div>`).join('')+'<p class="note">Монеты зарабатываются игрой и квестами. Платежей в приложении нет.</p>';
  }else{
   const a=store.get('archive',[]);
   body=a.length?a.map((g,i)=>`<button class="gamerow" data-g="${i}"><b class="res">${g.res}</b><span class="grow"><b>${esc(g.white)} — ${esc(g.black)}</b><small>${esc(g.reason)} · ходов: ${g.n}</small></span><span class="go">Разбор</span></button>`).join(''):'<div class="card"><p class="note">Здесь появятся сыгранные партии.</p></div>';
  }
  const el=$('#v-profile .wrap');el.innerHTML=this.head('Профиль')+this.tabs([['me','Я'],['shop','Лавка'],['games','Партии']],t)+body;
  el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{this.ptab=b.dataset.tab;this.profile();$('#v-profile').scrollTop=0});
  el.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>Ctl.go(b.dataset.go));
  el.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>this.item(b.dataset.item));
  el.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{try{const g=store.get('archive',[])[+b.dataset.g],l=Line.fromPgn(g.pgn);Ctl.go('analysis');Analysis.open(l,g.color,g.id?{id:g.id,color:g.color}:null);Analysis.review()}catch(e){toast('Не удалось открыть партию')}});
 },
 item(id){
  const it=Meta.SHOP.find(x=>x.id===id),own=Meta.data.own.includes(id);
  const use=()=>{if(it.g==='b'){cfg.theme=it.key;store.set('cfg',cfg)}else Meta.equip(it.g,it.key);this.equip();this.themes();this.profile()};
  if(own)return use();
  modal(it.n,`Купить за ${it.price} монет?`,[['Купить',()=>{const err=Meta.buy(id);if(err)return toast(err);sound('good');speak([Voice.s('m_buy')]);if(it.g==='f')this.profile();else use()},1],['Не сейчас']]);
 }
};
init();
