/* ---------- задачи: задача дня, путь, блиц и тренировка ---------- */
const CHAPTERS=['Первые шаги','Открытая линия','Двойной удар','Слабое поле','Охота на короля','Тихий ход','Жертва','Атака на фланге','Связка','Эндшпиль мастера','Ловушка'];
const TYPES={1:{n:'Мат в 1',i:'target'},2:{n:'Мат в 2',i:'sword'},3:{n:'Мат в 3',i:'crown'},w:{n:'Выиграй материал',i:'gem'}};
function miniBoard(fen){
 const g=new Chess(fen);let h='';
 for(let r=0;r<8;r++)for(let f=0;f<8;f++){const s=g.turn?(7-r)*16+7-f:r*16+f,p=g.b[s];h+=`<i class="${(r+f)&1?'d':''}"${p?` style='background-image:${pieceUrl(p)}'`:''}></i>`}
 return `<span class="mini">${h}</span>`;
}
const task=p=>(p[1]==='w'?'Выиграй материал':TYPES[p[1]].n)+' · ходят '+(p[0].split(' ')[1]==='b'?'чёрные':'белые');
const Puzzles={
 mode:'path',i:0,g:null,left:0,done:false,failed:false,shown:false,last:null,token:0,start:0,type:'1',flipped:false,rush:null,
 daily(){const pool=PUZZLES.map((p,i)=>i).filter(i=>PUZZLES[i][3]>=850&&PUZZLES[i][3]<=1500);return pool[Meta.hash('p'+Meta.key())%pool.length]},
 hub(){
  const d=this.daily(),dp=PUZZLES[d],done=Meta.data.dp===Meta.key(),pos=Math.min(Meta.data.path,PUZZLES.length-1),ch=pos/10|0,all=Meta.data.path>=PUZZLES.length;
  const dots=Array.from({length:10},(_,k)=>`<i class="${ch*10+k<Meta.data.path?'on':ch*10+k===pos?'cur':''}"></i>`).join('');
  $('#v-puzzles .wrap').innerHTML=`
  <header class="shead"><h1>Задачи</h1><span class="pill">${Art.ico('target')}<b>${stats.rating}</b></span><span class="pill">${Art.ico('bolt')}<b>${stats.streak}</b></span></header>
  <button class="tile daily ${done?'done':''}" data-p="daily">${miniBoard(dp[0])}<span class="grow"><small>Задача дня</small><b>${done?'Решена!':task(dp).split(' · ')[0]}</b><em>${done?'Новая появится завтра':task(dp).split(' · ')[1]+' · +30 монет'}</em></span>${Art.ico(done?'check':'star','big')}</button>
  <button class="tile path" data-p="path"><span class="node">${ch+1}</span><span class="grow"><small>Путь · глава ${ch+1}</small><b>${all?'Весь путь пройден!':CHAPTERS[ch%CHAPTERS.length]}</b><span class="dots">${dots}</span></span><span class="go">▶</span></button>
  <button class="tile rush" data-p="rush">${Art.ico('clock','big')}<span class="grow"><small>3 минуты · 3 ошибки</small><b>Блиц задач</b><em>Рекорд: ${Meta.data.rush}</em></span><span class="go">▶</span></button>
  <h2>Тренировка</h2>
  <div class="types">${Object.entries(TYPES).map(([k,t])=>`<button class="tile" data-p="train" data-t="${k}">${Art.ico(t.i)}<b>${t.n}</b><em>${PUZZLES.filter(p=>p[1]===k).length} задач</em></button>`).join('')}</div>
  <p class="note">Решено: ${stats.solved} · лучшая серия без ошибок: ${stats.best}</p>`;
  $$('#v-puzzles [data-p]').forEach(b=>b.onclick=()=>this.open(b.dataset.p,b.dataset.t));
 },
 open(mode,type){
  this.mode=mode;this.type=type||this.type;this.flipped=false;
  if(mode==='daily')this.i=this.daily();
  if(mode==='path')this.i=Math.min(Meta.data.path,PUZZLES.length-1);
  if(mode==='train')this.i=this.pickTrain();
  if(mode==='rush')this.rush={score:0,lives:3,end:0,at:Math.random()*4|0,over:false};
  Ctl.go('solve');
  if(mode==='rush'){this.rush.end=Date.now()+180000;this.rush.timer=setInterval(()=>this.tickRush(),250);this.i=this.rush.at}
  this.load();speak(mode==='rush'?[Voice.s('p_rush_go')]:[Voice.s(PUZZLES[this.i][1]==='w'?'p_start_win':'p_start_mate')]);
 },
 pickTrain(){
  const recent=store.get('recent',[]);
  let pool=PUZZLES.map((p,i)=>i).filter(i=>PUZZLES[i][1]===this.type&&!recent.includes(i));
  if(!pool.length){store.set('recent',[]);pool=PUZZLES.map((p,i)=>i).filter(i=>PUZZLES[i][1]===this.type)}
  pool.sort((a,b)=>Math.abs(PUZZLES[a][3]-stats.rating)-Math.abs(PUZZLES[b][3]-stats.rating));
  return pool[Math.random()*Math.min(15,pool.length)|0];
 },
 load(){
  this.token++;const[fen,type,sol]=PUZZLES[this.i];this.g=new Chess(fen);this.left=type==='w'?1:+type;this.sol=sol;this.done=false;this.failed=false;this.shown=false;this.last=null;this.start=this.g.turn;
  Board.flip=!!this.start!==this.flipped;this.say((type==='w'?'Найди ход, который выигрывает материал.':`Найди мат в ${type} ${type==='1'?'ход':'хода'}.`)+` Ходят ${this.start?'чёрные':'белые'}.`,'calm');
  this.show();this.actions();
 },
 leave(){this.token++;const r=this.rush;if(r&&!r.over){r.over=true;clearInterval(r.timer);if(r.score)Meta.event('rush',{score:r.score})}if(this.mode==='rush')this.rush=null},
 flip(){this.flipped=!this.flipped;Board.flip=!!this.start!==this.flipped;this.show()},
 busy(){return Ctl.view==='solve'&&this.mode==='rush'&&this.rush&&!this.rush.over},
 canMove(){return this.done||!this.g||this.g.turn!==this.start||(this.rush&&this.mode==='rush'&&this.rush.over)?null:{color:this.g.turn}},
 say(text,mood,cls=''){const e=$('#pMsg');e.textContent=text;e.parentNode.className='bubble '+cls;$('#pOwl').innerHTML=owl(mood)},
 line(id,mood,cls){this.say(Voice.P[id][0],mood,cls);speak([Voice.s(id)])},
 show(){
  Board.set(this.g,{last:this.last});
  const p=PUZZLES[this.i],r=this.mode==='rush'&&this.rush,ch=this.i/10|0;
  const title={daily:'Задача дня',path:`Задача ${this.i+1}`,train:TYPES[this.type].n,rush:'Блиц задач'}[this.mode];
  const sub={daily:task(p),path:`Глава ${ch+1} · ${CHAPTERS[ch%CHAPTERS.length]}`,train:'Сложность '+p[3],rush:r?`Счёт: ${r.score}`:''}[this.mode];
  $('#pHead').innerHTML=`<button class="back" aria-label="Назад">‹</button><span class="grow"><b>${title}</b><small>${sub}</small></span>${r?`<span class="pill clockpill" id="rTime">${fmt(r.end-Date.now())}</span>`:`<span class="pill">${Art.ico('target')}<b>${stats.rating}</b></span>`}`;
  $('#pHead .back').onclick=()=>Ctl.back();
  let dots='';
  if(this.mode==='path')dots=Array.from({length:10},(_,k)=>`<i class="${ch*10+k<Meta.data.path?'on':''} ${ch*10+k===this.i?'cur':''}"></i>`).join('');
  if(r)dots=[0,1,2].map(k=>`<span class="life ${k<r.lives?'':'lost'}">♥</span>`).join('');
  $('#pDots').innerHTML=dots;
 },
 actions(){
  const box=$('#pActions');box.innerHTML='';
  const add=(t,fn,c)=>{const b=document.createElement('button');b.innerHTML=t;b.onclick=fn;if(c)b.className=c;box.appendChild(b)};
  if(this.mode==='rush'){const r=this.rush;if(!r||r.over){add('Ещё раз',()=>this.open('rush'),'primary');add('К задачам',()=>Ctl.back())}else add('Закончить',()=>this.endRush());return}
  if(this.done){
   if(this.mode==='daily'){add('К задачам',()=>Ctl.back(),'primary');add('Решить ещё раз',()=>this.load())}
   else if(this.mode==='path'&&this.i>=PUZZLES.length-1)add('К задачам',()=>Ctl.back(),'primary');
   else{add('Дальше ▶',()=>this.next(),'primary wide');add('↺',()=>this.load())}
   return;
  }
  add('💡 Подсказка',()=>this.hint());add('Решение',()=>this.solution());add('↺',()=>this.load());
  if(this.mode==='train')add('Пропустить',()=>this.next());
 },
 next(){
  if(this.mode==='path')this.i=Math.min(this.i+1,PUZZLES.length-1);else this.i=this.pickTrain();
  this.load();
 },
 rate(win){
  const e=1/(1+Math.pow(10,(PUZZLES[this.i][3]-stats.rating)/400));
  if(win)stats.rating+=Math.max(4,Math.round(24*(1-e)));else stats.rating=Math.max(100,stats.rating-Math.max(4,Math.round(18*e)));
  store.set('stats',stats);Meta.event('rating',{value:stats.rating});
 },
 fail(){if(!this.failed){this.failed=true;if(this.mode!=='rush'){stats.streak=0;this.rate(false)}}},
 apply(m){this.g.make(m);this.last=m;moveSound(this.g,m)},
 move(uci){
  const m=this.g.findUci(uci),type=PUZZLES[this.i][1],tk=this.token;this.apply(m);
  const ok=type==='w'?uci===this.sol:Engine.mated(this.g,this.left);
  if(!ok){
   this.done=true;this.show();Board.mark={s:m.t,tag:TAGS.mistake};Board.render();sound('bad');
   if(this.mode==='rush'){this.rush.lives--;this.line('p_bad_1','sad','bad');this.show();return setTimeout(()=>{if(tk!==this.token)return;this.rush.lives?this.advance():this.endRush()},900)}
   this.fail();this.show();Board.mark={s:m.t,tag:TAGS.mistake};Board.render();this.line('p_bad_'+(m.t&1),'sad','bad');
   return setTimeout(()=>{if(tk!==this.token)return;this.g.unmake();this.last=null;this.done=false;this.show()},1100);
  }
  this.left--;
  if(type==='w'||this.g.status()==='mate')return this.solved(m);
  this.show();this.say('Верно! Продолжай.','happy','good');speak([Voice.s('p_good_'+(m.t%3)),Voice.s('p_next')]);
  setTimeout(()=>{if(tk!==this.token)return;
   /* защита: выбираем ответ, при котором мат приходит позже всего */
   const rs=this.g.moves();let pick=rs[0];
   for(const r of rs){this.g.make(r);const quick=this.left>1&&Engine.mateIn(this.g,this.left-1);this.g.unmake();if(!quick){pick=r;break}}
   this.apply(pick);this.show()},600);
 },
 solved(m){
  this.done=true;sound('good');const clean=!this.failed&&!this.shown,daily=this.mode==='daily'&&Meta.data.dp!==Meta.key();
  if(clean&&this.mode!=='rush'){stats.streak++;stats.best=Math.max(stats.best,stats.streak);this.rate(true)}
  if(!this.shown){stats.solved++;store.set('stats',stats)}
  store.set('recent',[this.i,...store.get('recent',[]).filter(x=>x!==this.i)].slice(0,150));
  this.show();Board.mark={s:m.t,tag:TAGS.best};Board.render();
  if(this.mode==='rush'){this.rush.score++;Meta.event('puzzle',{clean:true,mode:'rush'});this.show();this.line('p_good_'+(m.t%3),'happy','good');const tk=this.token;return setTimeout(()=>{if(tk===this.token)this.advance()},650)}
  this.line('p_solved_'+(m.t&1),'happy','good');
  if(this.mode==='path')Meta.event('path',{pos:this.i+1});
  /* повторное решение уже засчитанной задачи дня и решение после подсмотренного ответа наград не дают */
  if(!this.shown&&(this.mode!=='daily'||daily))Meta.event('puzzle',{clean,daily,mode:this.mode});
  this.show();Board.mark={s:m.t,tag:TAGS.best};Board.render();this.actions();setTimeout(()=>Hub.flush(),900);
 },
 /* блиц: сложность растёт с каждой решённой или проваленной задачей */
 advance(){const r=this.rush;if(!r||r.over)return;r.at+=3+(Math.random()*6|0);this.i=Math.min(r.at,PUZZLES.length-1);this.load()},
 tickRush(){
  const r=this.rush;if(!r||r.over)return;const left=r.end-Date.now(),e=$('#rTime');if(e){e.textContent=fmt(left);e.classList.toggle('low',left<20000)}
  if(left<=0)this.endRush();
 },
 endRush(){
  const r=this.rush;if(!r||r.over)return;r.over=true;this.token++;this.done=true;clearInterval(r.timer);
  const record=r.score>Meta.data.rush;Meta.event('rush',{score:r.score});
  this.show();this.actions();this.say(`Решено задач: ${r.score}. ${record?'Новый рекорд!':'Рекорд: '+Meta.data.rush+'.'}`,record?'happy':'calm',record?'good':'');
  speak([Voice.s(record?'p_rush_record':'p_rush_end')]);sound('end');setTimeout(()=>Hub.flush(),900);
 },
 hint(){if(!this.canMove())return;const u=PUZZLES[this.i][1]==='w'?this.sol:Engine.mateIn(this.g,this.left);if(!u)return;this.fail();this.show();const m=this.g.findUci(u);Board.marks[m.f]=1;Board.render();this.line('p_hint','think')},
 solution(){if(!this.canMove())return;const u=PUZZLES[this.i][1]==='w'?this.sol:Engine.mateIn(this.g,this.left);if(!u)return;this.fail();this.shown=true;this.show();const m=this.g.findUci(u),san=this.g.san(m);Board.arrows=[{f:m.f,t:m.t,c:'#35c46a'}];Board.drawArrows();this.say(`Решение: ${san}. Сделай этот ход.`,'think');speak([Voice.s('p_sol'),...Voice.mv(san)])}
};
