'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const {Chess,MATE,sqName,sqIdx,START}=Engine;
const store={get(k,d){try{const v=JSON.parse(localStorage.getItem('chees.'+k));return v===null||v===undefined?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('chees.'+k,JSON.stringify(v))}catch(e){}}};
const cfg=Object.assign({name:'Ты',theme:'blue',sound:true,coords:true,legal:true,queen:false,talk:true,lite:(navigator.deviceMemory||8)<=3||(navigator.hardwareConcurrency||8)<=2},store.get('cfg',{}));
if(!cfg.club){cfg.club=1;cfg.theme='club';store.set('cfg',cfg)}
if(store.get('voice',null)!==null){cfg.talk=true;try{localStorage.removeItem('chees.voice')}catch(e){}}
function lite(){document.body.classList.toggle('lite',cfg.lite)}
const stats=Object.assign({w:0,l:0,d:0,rating:800,streak:0,best:0,solved:0},store.get('stats',{}));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- фигуры (оригинальные рисунки CHEES.UP в классической форме) ---------- */
function pieceSvg(p){
 const dark=p&8,line=dark?'#0e1114':'#2b2f33',det=dark?'#c9d1d9':'#2b2f33',g=dark?'url(#gB)':'url(#gW)';
 const base='<path d="M27 76H73Q76 76 76 79.5Q76 83 73 83H27Q24 83 24 79.5Q24 76 27 76Z"/><path d="M22 83H78Q83 85 83 90V93Q83 95 81 95H19Q17 95 17 93V90Q17 85 22 83Z"/>';
 const cut=d=>`<path d="${d}" fill="none" stroke="${det}" stroke-width="2.6"/>`;
 const t=[,
 '<path d="M42 47C42 60 37 68 29 76H71C63 68 58 60 58 47Z"/><path d="M36 42H64Q67 45.5 64 49H36Q33 45.5 36 42Z"/><circle cx="50" cy="29" r="14"/>'+base,
 '<path d="M32 76C31 64 40 59 46 51C47 49 47 47 45 46C40 48 37 53 31 55C28 60 24 63 19 60C13 57 14 51 17 47C22 40 27 33 30 26C32 22 34 20 37 19L38 7L47 15L54 6L57 17C71 22 78 37 77 52C76 63 70 68 69 76Z"/><ellipse cx="35" cy="31" rx="3.6" ry="2.8" fill="'+det+'" stroke="none"/><circle cx="21" cy="53" r="1.8" fill="'+det+'" stroke="none"/>'+cut('M55 24C66 31 69 45 66 57C64 65 62 69 62 73')+base,
 '<path d="M41 62C40 68 36 72 30 76H70C64 72 60 68 59 62Z"/><path d="M50 18C61 25 69 36 68 45C67 52 63 56 60 58H40C37 56 33 52 32 45C31 36 39 25 50 18Z"/><path d="M37 57H63Q66 60.5 63 64H37Q34 60.5 37 57Z"/><circle cx="50" cy="13" r="6"/>'+cut('M50 31V47M42 39H58')+base,
 '<path d="M33 37H67L65 66L72 76H28L35 66Z"/><path d="M23 14H35V22H44V14H56V22H65V14H77V31L68 39H32L23 31Z"/>'+cut('M34 39H66M35 66H65')+base,
 '<path d="M29 76L25 59L13 27L32 47L31 19L44 44L50 14L56 44L69 19L68 47L87 27L75 59L71 76Z"/><circle cx="12" cy="24" r="5.5"/><circle cx="31" cy="15" r="5.5"/><circle cx="50" cy="10" r="5.5"/><circle cx="69" cy="15" r="5.5"/><circle cx="88" cy="24" r="5.5"/>'+cut('M27 60Q50 53 73 60M29 69Q50 63 71 69')+base,
 '<path d="M46 4H54V11H61V19H54V31H46V19H39V11H46Z"/><path d="M50 40C54 29 64 26 73 29C86 34 86 48 76 58L69 65L72 76H28L31 65L24 58C14 48 14 34 27 29C36 26 46 29 50 40Z"/>'+cut('M50 40V58M31 65Q50 57 69 65')+base][p&7];
 return `<svg viewBox="0 0 100 100"><g fill="${g}" stroke="${line}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${t}</g></svg>`;
}
document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="gW" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="85" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#f6f5f1"/><stop offset="1" stop-color="#c6c3bb"/></linearGradient><linearGradient id="gB" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="85" y2="0"><stop offset="0" stop-color="#646a70"/><stop offset=".45" stop-color="#43484d"/><stop offset="1" stop-color="#24272b"/></linearGradient></defs></svg>');

const pieceCache={};
const PIECE_SETS={classic:[['#fff','#f6f5f1','#c6c3bb'],['#646a70','#43484d','#24272b']],amber:[['#fff6d8','#f8dc92','#d3a24a'],['#8a5434','#603620','#34190e']],ruby:[['#ffffff','#e4f4fb','#a9cfe0'],['#c4505a','#95303d','#561620']]};
function setPieces(name){
 const set=PIECE_SETS[name]||PIECE_SETS.classic;
 ['#gW','#gB'].forEach((id,i)=>[...$(id).children].forEach((st,j)=>st.setAttribute('stop-color',set[i][j])));
 for(const k in pieceCache)delete pieceCache[k];
 Board.pieces.forEach(o=>o.el.remove());Board.pieces.clear();
 $$('#palette button').forEach(x=>{if(+x.dataset.p)x.innerHTML=pieceSvg(+x.dataset.p)});
}
/* реплика тренера «сама по себе»: молчит, если голос выключен или не записан */
const speak=(segs,done)=>{if(cfg.talk)Voice.say(segs,done,true);else done&&done(false)};
const owl=mood=>Art.owl(mood,Meta.data.equip.o);
const pieceSrc=p=>pieceUrl(p).slice(5,-2);
function pieceUrl(p){
 if(!pieceCache[p]){
  const defs=document.querySelector('#gW').parentNode.outerHTML;
  const s=pieceSvg(p).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" ').replace('<g ',defs+'<g ');
  pieceCache[p]=`url("data:image/svg+xml,${encodeURIComponent(s)}")`;
 }
 return pieceCache[p];
}

const ICONS={'home': 'M3 11L12 4L21 11M6 10V20H18V10M10 20V14H14V20', 'play': 'M7 20H18M8 20C8 15 14 13 13 10L7 13L5 10L11 5V3L14 5C18 7 19 12 17 20', 'puzzle': 'M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5Z', 'search': 'M10.5 4A6.5 6.5 0 1 0 10.6 4M15.5 15.5L21 21', 'edit': 'M4 20L5 15L16 4L20 8L9 19ZM13 7L17 11', 'gear': 'M4 7H20M4 17H20M9 4V10M15 14V20', 'flag': 'M6 21V4M6 5H18L15 9L18 13H6', 'left': 'M15 5L8 12L15 19', 'right': 'M9 5L16 12L9 19', 'repeat': 'M5 12A7 7 0 1 0 8 6M8 2V7H13', 'plus': 'M12 5V19M5 12H19', 'sound': 'M4 10V14H8L13 19V5L8 10ZM16 9Q19 12 16 15M18.5 6Q23 12 18.5 18'};
const icon=n=>`<svg class="ic" viewBox="0 0 24 24"><path d="${ICONS[n]}"/></svg>`;

/* ---------- звук ---------- */
let ac;
function sound(kind){
 TG.haptic(kind);
 if(!cfg.sound)return;
 try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();ac.resume();
 const tone=(f,t,d,v=.18,type='triangle')=>{const o=ac.createOscillator(),g=ac.createGain(),s=ac.currentTime+t;o.type=type;o.frequency.setValueAtTime(f,s);g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.001,s+d);o.connect(g).connect(ac.destination);o.start(s);o.stop(s+d)};
 ({move:()=>tone(240,0,.08,.3),capture:()=>{tone(160,0,.1,.35,'square');tone(300,.02,.06)},check:()=>{tone(620,0,.12);tone(880,.07,.12)},end:()=>{tone(520,0,.2);tone(390,.15,.2);tone(260,.3,.35)},good:()=>{tone(520,0,.1);tone(780,.09,.2)},bad:()=>tone(150,0,.25,.2,'sawtooth'),low:()=>tone(900,0,.07,.1)})[kind]()}catch(e){}
}

/* ---------- движок в фоне ---------- */
const AI=(()=>{
 let id=0,broken=false;
 const run=m=>{const g=replay(m.fen,m.moves);return m.cmd==='bot'?{best:Engine.botMove(g,m.level)}:Engine.search(g,m.opts)};
 const local=j=>{j.timer=setTimeout(()=>{const m=Object.assign({},j.msg);
  if(m.cmd==='bot')m.level=Math.min(m.level,5);else m.opts=Object.assign({},m.opts,{time:Math.min(m.opts.time,220),depth:12});
  j.res(run(m))},260)};
 function make(){
  if(broken)return null;
  try{return new Worker('js/worker.js?v=4')}catch(e){broken=true;return null}
 }
 /* отдельный поток на каждый канал */
 function chan(){let w=null;const wait=new Map();
  const fail=()=>{broken=true;w=null;for(const j of wait.values())local(j);wait.clear()};
  return{ask(msg){return new Promise(res=>{msg.id=++id;if(cfg.lite){if(msg.opts)msg.opts=Object.assign({},msg.opts,{time:Math.round(msg.opts.time*.5)});if(msg.cmd==='bot')msg.level=Math.min(msg.level,6)}const j={msg,res};if(!w&&(w=make())){w.onmessage=e=>{const k=wait.get(e.data.id);if(k){wait.delete(e.data.id);k.res(e.data.r)}};w.onerror=fail}wait.set(msg.id,j);if(!w)return local(j);w.postMessage(msg)})},
  cancel(){if(w){w.terminate();w=null}for(const j of wait.values())clearTimeout(j.timer);wait.clear()}}}
 return{game:chan(),analysis:chan(),meta:chan()};
})();
function replay(fen,moves){const g=new Chess(fen);for(const u of moves)g.make(g.findUci(u));return g}

/* ---------- партия как список ходов ---------- */
class Line{
 constructor(fen=START){this.fen=fen;this.list=[];this.g=new Chess(fen)}
 push(uci){const m=this.g.findUci(uci);if(!m)return null;const san=this.g.san(m);this.g.make(m);const r={uci,san,m,fen:this.g.fen()};this.list.push(r);return r}
 pop(){if(!this.list.length)return;this.g.unmake();return this.list.pop()}
 cut(n){while(this.list.length>n)this.pop()}
 at(n){return replay(this.fen,this.list.slice(0,n).map(x=>x.uci))}
 pgn(h={}){
  const g=new Chess(this.fen);let no=g.full,t=g.turn,body='';
  this.list.forEach((x,i)=>{if(!t)body+=no+'. ';else if(!i)body+=no+'... ';body+=x.san+' ';if(t)no++;t^=8});
  const head=Object.assign({Event:'CHEES.UP',Date:new Date().toISOString().slice(0,10).replace(/-/g,'.'),Result:'*'},h);
  if(this.fen!==START){head.SetUp='1';head.FEN=this.fen}
  return Object.entries(head).map(([k,v])=>`[${k} "${String(v).replace(/["\\]/g,'')}"]`).join('\n')+'\n\n'+body+head.Result;
 }
 static fromPgn(text){
  const f=text.match(/\[FEN\s+"([^"]+)"\]/);const g=new Chess();if(f&&!g.load(f[1]))throw Error('неверный FEN в PGN');
  const line=new Line(g.fen());
  let s=text.replace(/\[[^\]]*\]/g,' ').replace(/\{[^}]*\}/g,' ').replace(/;[^\n]*/g,' ');
  while(/\([^()]*\)/.test(s))s=s.replace(/\([^()]*\)/g,' ');
  for(let tok of s.split(/\s+/)){tok=tok.replace(/^\d+\.+/,'').replace(/[!?]+$/,'');if(!tok||/^(1-0|0-1|1\/2-1\/2|\*|\$\d+|\.+)$/.test(tok))continue;
   const m=line.g.findSan(tok);if(!m)throw Error('не понял ход «'+tok+'»');line.push(line.g.uci(m))}
  if(!line.list.length)throw Error('нет ходов');return line;
 }
}
const OPENINGS=`Испанская партия|e4 e5 Nf3 Nc6 Bb5
Итальянская партия|e4 e5 Nf3 Nc6 Bc4
Защита двух коней|e4 e5 Nf3 Nc6 Bc4 Nf6
Шотландская партия|e4 e5 Nf3 Nc6 d4
Дебют четырёх коней|e4 e5 Nf3 Nc6 Nc3 Nf6
Русская партия|e4 e5 Nf3 Nf6
Защита Филидора|e4 e5 Nf3 d6
Королевский гамбит|e4 e5 f4
Венская партия|e4 e5 Nc3
Открытый дебют|e4 e5
Сицилианская защита|e4 c5
Сицилианская, вариант дракона|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6
Сицилианская, вариант Найдорфа|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6
Французская защита|e4 e6 d4 d5
Защита Каро — Канн|e4 c6 d4 d5
Скандинавская защита|e4 d5 exd5 Qxd5 Nc3
Защита Алехина|e4 Nf6 e5 Nd5
Защита Пирца|e4 d6 d4 Nf6 Nc3 g6
Дебют королевской пешки|e4
Ферзевый гамбит|d4 d5 c4
Отказанный ферзевый гамбит|d4 d5 c4 e6
Принятый ферзевый гамбит|d4 d5 c4 dxc4
Славянская защита|d4 d5 c4 c6
Лондонская система|d4 d5 Bf4
Староиндийская защита|d4 Nf6 c4 g6 Nc3 Bg7
Защита Грюнфельда|d4 Nf6 c4 g6 Nc3 d5
Защита Нимцовича|d4 Nf6 c4 e6 Nc3 Bb4
Голландская защита|d4 f5
Дебют ферзевой пешки|d4
Английское начало|c4
Дебют Рети|Nf3 d5 c4`.split('\n').map(x=>{const[n,m]=x.split('|');return{n,m:m.split(' ')}});
function opening(sans){let best=null;for(const o of OPENINGS)if(o.m.length<=sans.length&&o.m.every((x,i)=>sans[i]===x)&&(!best||o.m.length>best.m.length))best=o;return best}
const isBook=sans=>OPENINGS.some(o=>o.m.length>=sans.length&&sans.every((x,i)=>o.m[i]===x));

/* ---------- доска ---------- */
const Board={
 el:null,g:null,flip:false,sel:-1,moves:[],last:null,arrows:[],user:[],marks:{},mark:null,pre:null,pieces:new Map(),drag:null,
 init(){
  this.el=$('#board');
  this.el.innerHTML='<div></div><div></div><svg class="arrows" viewBox="0 0 8 8"></svg>';
  [this.squares,this.layer,this.svg]=this.el.children;
  this.el.addEventListener('contextmenu',e=>e.preventDefault());
  this.el.addEventListener('pointerdown',e=>this.down(e));
  addEventListener('pointermove',e=>{const d=this.drag;if(!d||!e.isPrimary)return;if(!d.on){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<8)return;d.on=true;d.el.classList.add('drag')}this.place(d.el,e)});
  addEventListener('pointerup',e=>this.up(e));
  addEventListener('pointercancel',()=>{this.drag=null;this.render()});
 },
 xy(s){const f=s&7,r=s>>4;return this.flip?[7-f,7-r]:[f,r]},
 at(e){const b=this.el.getBoundingClientRect();let f=Math.floor((e.clientX-b.left)/b.width*8),r=Math.floor((e.clientY-b.top)/b.height*8);if(f<0||f>7||r<0||r>7)return -1;if(this.flip){f=7-f;r=7-r}return r*16+f},
 place(el,e){const b=this.el.getBoundingClientRect();el.style.left=((e.clientX-b.left)/b.width*100-6.25)+'%';el.style.top=((e.clientY-b.top)/b.height*100-6.25)+'%'},
 set(g,o={}){this.g=g;this.sel=-1;this.moves=[];this.last=o.last||null;this.mark=o.mark||null;this.arrows=[];this.user=[];this.marks={};this.closePromo();this.render()},
 render(){
  const g=this.g;if(!g)return;
  let h='';const check=Ctl.view!=='editor'&&g.inCheck()?g.kings[g.turn>>3]:-1;
  for(let r=0;r<8;r++)for(let f=0;f<8;f++){
   const s=r*16+f,[x,y]=this.xy(s),c=['sq'];
   if((r+f)&1)c.push('d');
   if(this.last&&(this.last.f===s||this.last.t===s))c.push('last');
   if(this.sel===s)c.push('sel');if(check===s)c.push('check');if(this.marks[s])c.push('hl');
   if(this.pre&&(this.pre.f===s||this.pre.t===s))c.push('pre');
   if(cfg.legal&&this.moves.some(m=>m.t===s))c.push(g.b[s]?'cap':'dot');
   let co='';if(cfg.coords){const n=sqName(s);if(x===0)co+=`<span class="coord r">${n[1]}</span>`;if(y===7)co+=`<span class="coord f">${n[0]}</span>`}
   h+=`<div class="${c.join(' ')}" style="left:${x*12.5}%;top:${y*12.5}%">${co}</div>`;
  }
  this.squares.innerHTML=h;
  /* фигуры переиспользуются, чтобы ходы плавно анимировались */
  const want=[];for(let s=0;s<120;s++)if(!(s&136)&&g.b[s])want.push({s,p:g.b[s]});
  const free=[...this.pieces.values()],next=new Map(),todo=[];
  for(const w of want){const i=free.findIndex(x=>x.s===w.s&&x.p===w.p);if(i>=0)next.set(w.s,free.splice(i,1)[0]);else todo.push(w)}
  for(const w of todo){
   let bi=-1,bd=99;free.forEach((x,i)=>{if(x.p!==w.p)return;const d=Math.hypot((x.s&7)-(w.s&7),(x.s>>4)-(w.s>>4));if(d<bd){bd=d;bi=i}});
   let o;if(bi>=0)o=free.splice(bi,1)[0];else{const el=document.createElement('div');el.className='pc';el.style.backgroundImage=pieceUrl(w.p);this.layer.appendChild(el);o={el,p:w.p}}
   o.s=w.s;next.set(w.s,o);
  }
  free.forEach(x=>x.el.remove());this.pieces=next;
  for(const o of next.values()){if(this.drag&&this.drag.el===o.el)continue;const[x,y]=this.xy(o.s);o.el.style.left=x*12.5+'%';o.el.style.top=y*12.5+'%'}
  this.el.querySelectorAll('.mark').forEach(x=>x.remove());
  if(this.mark){const[x,y]=this.xy(this.mark.s),d=document.createElement('div');d.className='mark';d.innerHTML=badge(this.mark.tag);d.style.left=Math.min(97,(x+1)*12.5)+'%';d.style.top=Math.max(2.5,y*12.5)+'%';this.el.appendChild(d)}
  this.drawArrows();
 },
 drawArrows(){
  this.svg.innerHTML=[...this.arrows,...this.user].map(a=>{const[x1,y1]=this.xy(a.f).map(v=>v+.5),[x2,y2]=this.xy(a.t).map(v=>v+.5),an=Math.atan2(y2-y1,x2-x1),c=Math.cos(an),s=Math.sin(an),ex=x2-c*.38,ey=y2-s*.38;
   return `<g opacity=".75" fill="${a.c}" stroke="${a.c}"><line x1="${x1+c*.3}" y1="${y1+s*.3}" x2="${ex}" y2="${ey}" stroke-width=".16"/><polygon stroke="none" points="${x2},${y2} ${ex-s*.26},${ey+c*.26} ${ex+s*.26},${ey-c*.26}"/></g>`}).join('');
 },
 down(e){
  if(e.target.closest('.promo')||!e.isPrimary)return;
  if(this.drag){this.drag.el.classList.remove('drag');this.drag=null;this.render()}
  const s=this.at(e);if(s<0)return;e.preventDefault();
  if(e.button===2){this.rfrom=s;return}
  this.closePromo();
  if(this.user.length||Object.keys(this.marks).length){this.user=[];this.marks={};this.render()}
  if(Ctl.view==='editor')return Editor.down(s,e);
  const who=Ctl.canMove();
  if(this.sel>=0&&s!==this.sel&&this.tryMove(this.sel,s,who))return;
  const p=this.g.b[s];
  if(p&&who&&(p&8)===who.color){
   const was=this.sel===s;this.sel=s;this.pre=null;
   this.moves=who.pre?[]:this.g.moves().filter(m=>m.f===s);
   this.render();const o=this.pieces.get(s);this.drag={el:o.el,from:s,was,x:e.clientX,y:e.clientY};
  }else{this.sel=-1;this.moves=[];this.pre=null;this.render()}
 },
 up(e){
  if(e.button===2){const s=this.at(e),f=this.rfrom;this.rfrom=null;if(f==null||s<0)return;
   if(s===f){this.marks[s]?delete this.marks[s]:this.marks[s]=1}else{const i=this.user.findIndex(a=>a.f===f&&a.t===s);i>=0?this.user.splice(i,1):this.user.push({f,t:s,c:'#f5a623'})}
   return this.render()}
  const d=this.drag;if(!d||!e.isPrimary)return;this.drag=null;d.el.classList.remove('drag');
  const s=this.at(e);
  if(Ctl.view==='editor')return Editor.drop(d.from,s);
  if(s>=0&&s!==d.from&&this.tryMove(d.from,s,Ctl.canMove()))return;
  if(s===d.from&&d.was){this.sel=-1;this.moves=[]}
  this.render();
 },
 tryMove(f,t,who){
  if(!who)return false;
  if(who.pre){const p=this.g.b[t];if(p&&(p&8)===who.color)return false;this.pre={f,t};this.sel=-1;this.moves=[];this.render();return true}
  const ms=this.g.moves().filter(m=>m.f===f&&m.t===t);if(!ms.length)return false;
  this.sel=-1;this.moves=[];
  if(ms.length>1&&!cfg.queen){this.render();this.promo(ms);return true}
  Ctl.move(this.g.uci(ms.find(m=>!m.pr||m.pr===5)));return true;
 },
 promo(ms){
  const[x,y]=this.xy(ms[0].t),d=document.createElement('div'),g=this.g;d.className='promo';d.style.left=x*12.5+'%';d.style[y<4?'top':'bottom']='0';
  for(const pr of[5,2,4,3]){const b=document.createElement('button');b.innerHTML=pieceSvg(pr|g.turn);fresh(b,()=>{d.remove();Ctl.move(g.uci(ms.find(m=>m.pr===pr)))});d.appendChild(b)}
  const c=document.createElement('button');c.className='x';c.textContent='✕';fresh(c,()=>{d.remove();this.render()});d.appendChild(c);this.el.appendChild(d);
 },
 closePromo(){const p=this.el.querySelector('.promo');if(p)p.remove()}
};

/* ---------- общее ---------- */
/* касание, открывшее меню, не должно сразу нажимать кнопку под пальцем */
function fresh(b,fn){
 let armed=false;b.addEventListener('pointerdown',()=>armed=true);b.addEventListener('pointercancel',()=>armed=false);
 b.addEventListener('pointerup',()=>{if(armed){armed=false;fn()}});
 b.onclick=e=>{if(e.detail===0)fn()};
}
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',2200)}
function modal(title,text,buttons){$('#mTitle').textContent=title;$('#mText').textContent=text;const r=$('#mBtns');r.innerHTML='';for(const[n,fn,p]of buttons){const b=document.createElement('button');b.textContent=n;if(p)b.className='primary';b.onclick=()=>{$('#modal').classList.remove('on');fn&&fn()};r.appendChild(b)}$('#modal').classList.add('on')}
function copy(t){const fail=()=>toast('Не удалось скопировать — выдели текст вручную');try{navigator.clipboard.writeText(t).then(()=>toast('Скопировано'),fail)}catch(e){fail()}}
function moveSound(g,m){sound(g.inCheck()?'check':(m.c?'capture':'move'))}
function moveList(el,line,cur,tags,onClick){
 const g=new Chess(line.fen);let no=g.full,t=g.turn,h='',open=false;
 line.list.forEach((x,i)=>{
  if(!t){h+=`<div class="ml"><em>${no}.</em>`;open=true}else if(!open){h+=`<div class="ml"><em>${no}.</em><span></span>`;open=true}
  const tag=tags&&tags[i];
  h+=`<button data-i="${i+1}" class="${cur===i+1?'on':''}">${esc(x.san)}${tag?badge(tag):''}</button>`;
  if(t){h+='</div>';open=false;no++}t^=8});
 if(open)h+='</div>';
 el.innerHTML=h||'<span class="muted small">Пока нет ходов</span>';
 el.querySelectorAll('button').forEach(b=>b.onclick=()=>onClick(+b.dataset.i));
 const on=el.querySelector('.on');if(on)el.scrollTop=on.offsetTop-el.offsetTop-el.clientHeight/2;
}
function playerBar(el,{name,sub,icon,color,g,clock,active}){
 let taken='',diff=0;
 if(g){const start=[0,8,2,2,2,1],have=[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];for(let s=0;s<120;s++)if(!(s&136)&&g.b[s])have[g.b[s]>>3][g.b[s]&7]++;
  const other=(color^8);for(let t=1;t<6;t++){for(let i=have[other>>3][t];i<start[t];i++)taken+=`<span>${pieceSvg(t|other)}</span>`;diff+=[0,1,3,3,5,9][t]*(have[color>>3][t]-have[other>>3][t])}}
 el.innerHTML=`<div class="ava ${String(icon).indexOf('<img')===0?(color?'k':'w'):''}">${icon}</div><div class="who"><b>${esc(name)}</b> <span class="small muted">${esc(sub||'')}</span><div class="taken">${taken}${diff>0?`<b>+${diff}</b>`:''}</div></div>${clock!=null?`<div class="clock ${active?'on':''} ${clock<20000?'low':''}">${fmt(clock)}</div>`:''}`;
}
function fmt(ms){ms=Math.max(0,ms);if(ms<20000)return (Math.floor(ms/100)/10).toFixed(1);const s=Math.ceil(ms/1000),h=s/3600|0,m=(s/60|0)%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s%60).padStart(2,'0')}

/* ---------- игра ---------- */
const Play={
 line:new Line(),opt:null,id:'',assisted:false,over:null,ply:0,clock:null,token:0,started:false,thinking:false,tick:0,
 options(){let c=$('#color').value;if(c==='r')c=Math.random()<.5?'w':'b';return{mode:$('#mode').value,level:+$('#level').value,color:c,tc:$('#tc').value}},
 start(opt,fen){
  this.stop();this.opt=opt||this.options();store.set('last',{mode:$('#mode').value,level:$('#level').value,color:$('#color').value,tc:$('#tc').value});
  this.line=new Line(fen||START);this.over=null;this.id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);this.assisted=false;this.ply=0;this.started=true;Board.pre=null;
  const[b,i]=this.opt.tc==='0'?[0,0]:this.opt.tc.split('+').map(Number);
  this.clock=b?{t:[b*1000,b*1000],inc:i*1000,since:null}:null;
  Board.flip=this.opt.mode==='bot'&&this.opt.color==='b';
  this.checkEnd();this.show();this.save();this.think();$('.side').scrollTop=0;
 },
 stop(){this.token++;this.thinking=false;AI.game.cancel()},
 human(){return this.opt.color==='b'?8:0},
 live(){return this.ply===this.line.list.length},
 canMove(){
  if(!this.started||this.over||!this.live())return null;
  const t=this.line.g.turn;
  if(this.opt.mode==='local')return{color:t};
  return{color:this.human(),pre:t!==this.human()};
 },
 left(c){const k=this.clock;let v=k.t[c];if(k.since&&!this.over&&(this.line.g.turn>>3)===c)v-=Date.now()-k.since;return v},
 move(uci){
  if(this.over)return;const g=this.line.g,c=g.turn>>3;
  if(this.clock&&this.clock.since&&this.left(c)<=0)return this.timeout(c);
  const mine=this.counts()&&g.turn===this.human();
  const probe=mine?this.probe(uci):null;
  const r=this.line.push(uci);if(!r)return;
  if(mine){Meta.event('move',{capture:!!r.m.c,check:g.inCheck(),castle:r.m.fl===4||r.m.fl===8,promo:!!r.m.pr});if(probe)this.brilliant(probe)}
  const k=this.clock;
  if(k){if(k.since){k.t[c]-=Date.now()-k.since;k.t[c]+=k.inc}if(this.line.list.length>=1)k.since=Date.now()}
  const follow=this.ply===this.line.list.length-1;if(follow)this.ply++;
  moveSound(g,r.m);this.checkEnd();if(Ctl.view==='play')this.show();this.save();this.think();
 },
 /* в квесты и награды идут только партии с ботом из начальной позиции */
 counts(){return !!this.opt&&this.opt.mode==='bot'&&this.line.fen===START},
 /* дешёвая проверка «это похоже на жертву» до хода; дальше решает движок */
 probe(uci){
  const g=this.line.g,m=g.findUci(uci);if(!m||g.moves().length<2||!sacrificed(g,m))return null;
  const moves=this.line.list.map(x=>x.uci),sans=this.line.list.map(x=>x.san).concat(g.san(m));
  if(isBook(sans))return null;
  return{id:this.id+':'+moves.length,fen:this.line.fen,moves,uci,san:sans[sans.length-1]};
 },
 async brilliant(p){
  const ask=(moves)=>AI.meta.ask({cmd:'search',fen:p.fen,moves,opts:{time:900}});
  this.queue=(this.queue||Promise.resolve()).then(async()=>{
   const a=await ask(p.moves),isBest=a.best===p.uci;let after=a.score,loss=0;
   if(!isBest){const b=await ask(p.moves.concat(p.uci));after=-b.score;loss=a.score+b.score}
   if((isBest||loss<=10)&&winPct(after)>=45&&winPct(a.score)<95)Meta.event('brilliant',{id:p.id,san:p.san});
  }).catch(()=>{});
 },
 think(){
  if(!this.started||this.over||this.opt.mode!=='bot'||this.line.g.turn===this.human()||this.thinking)return;
  this.thinking=true;const tk=++this.token,start=Date.now();let level=this.opt.level;
  if(this.clock){const t=this.left(this.line.g.turn>>3);if(t<8000)level=Math.min(level,5);else if(t<40000)level=Math.min(level,6)}
  AI.game.ask({cmd:'bot',fen:this.line.fen,moves:this.line.list.map(x=>x.uci),level}).then(r=>{
   setTimeout(()=>{if(tk!==this.token)return;this.thinking=false;this.move(r.best);
    const p=Board.pre;Board.pre=null;
    if(p&&!this.over){const ms=this.line.g.moves().filter(m=>m.f===p.f&&m.t===p.t);if(ms.length&&this.live()&&Ctl.view==='play'){Board.tryMove(p.f,p.t,this.canMove());return}}
    if(Ctl.view==='play')Board.render()},Math.max(0,450-(Date.now()-start)))})
 },
 checkEnd(){
  const g=this.line.g,s=g.status();if(!s)return;
  const w=g.turn?'w':'b';
  const map={mate:[w,'Мат'],stalemate:['d','Пат'],material:['d','Недостаточно материала'],fifty:['d','Правило 50 ходов'],repetition:['d','Троекратное повторение']};
  this.finish(...map[s]);
 },
 timeout(c){
  const other=c?0:8;let can=false;for(let s=0;s<120;s++){const p=s&136?0:this.line.g.b[s];if(p&&(p&8)===other&&(p&7)!==6)can=true}
  this.clock.t[c]=0;this.finish(can?(c?'w':'b'):'d',can?'Время вышло':'Время вышло, но матовать нечем');
 },
 finish(winner,reason){
  if(this.over)return;
  if(this.clock&&this.clock.since){const c=this.line.g.turn>>3;this.clock.t[c]=Math.max(0,this.clock.t[c]-(Date.now()-this.clock.since));this.clock.since=null}
  this.stop();Board.pre=null;
  const res={w:'1-0',b:'0-1',d:'1/2-1/2'}[winner];
  const title=winner==='d'?'Ничья':(this.opt.mode==='bot'?(winner===this.opt.color?'Ты победил!':'Поражение'):'Победили '+(winner==='w'?'белые':'чёрные'));
  this.over={winner,reason,res,title};
  if(!this.line.list.length){this.show();return}
  let reward=null;
  if(this.opt.mode==='bot'){
   if(winner==='d')stats.d++;else if(winner===this.opt.color)stats.w++;else stats.l++;store.set('stats',stats);
   const plies=this.line.list.length,mate=reason==='Мат';
   if(this.counts()&&(plies>=10||mate)){
    const before={xp:Meta.data.xp,coins:Meta.data.coins};
    Meta.event('game',{result:winner==='d'?'d':winner===this.opt.color?'w':'l',level:this.opt.level,color:this.opt.color,moves:Math.ceil(plies/2),mate,assisted:this.assisted});
    reward={xp:Meta.data.xp-before.xp,coins:Meta.data.coins-before.coins,row:Meta.data.win.cur};
   }else if(this.counts()&&winner!==this.opt.color)Meta.event('break');/* быстрая сдача тоже обрывает серию */
  }
  const names=this.names();
  const arch=store.get('archive',[]);arch.unshift({white:names[0],black:names[1],res,reason,n:Math.ceil(this.line.list.length/2),pgn:this.line.pgn({White:names[0],Black:names[1],Result:res}),id:this.id,color:this.counts()?this.opt.color:null});store.set('archive',arch.slice(0,20));
  sound('end');this.save();
  if(Ctl.view==='play'){Board.sel=-1;Board.moves=[];this.show();const id=this.id;setTimeout(()=>{if(id===this.id&&this.over)Hub.gameOver(this.over,reward)},600)}
 },
 rematch(){const o=Object.assign({},this.opt);if(o.mode==='bot')o.color=o.color==='w'?'b':'w';this.start(o,this.line.fen)},
 names(){if(this.opt.mode==='local')return['Белые','Чёрные'];const bot=BOTS[this.opt.level-1].n;return this.opt.color==='w'?[cfg.name,bot]:[bot,cfg.name]},
 undo(){
  if(this.over||!this.line.list.length)return toast('Отменять нечего');
  this.stop();this.line.pop();
  if(this.opt.mode==='bot'&&this.line.g.turn!==this.human()&&this.line.list.length)this.line.pop();
  this.ply=this.line.list.length;Board.pre=null;this.assisted=true;if(this.clock)this.clock.since=this.ply?Date.now():null;
  this.show();this.save();this.think();
 },
 hint(){
  const who=this.canMove();if(!who||who.pre)return toast('Подсказка доступна в твой ход');
  const n=this.line.list.length;this.assisted=true;$('#status').textContent='Думаю над подсказкой…';
  AI.analysis.ask({cmd:'search',fen:this.line.fen,moves:this.line.list.map(x=>x.uci),opts:{time:1200}}).then(r=>{
   if(Ctl.view!=='play'||n!==this.line.list.length||!this.live()||!r.best)return;
   const m=this.line.g.findUci(r.best);Board.arrows=[{f:m.f,t:m.t,c:'#35c46a'}];Board.drawArrows();$('#status').textContent='Лучший ход: '+this.line.g.san(m)});
 },
 offerDraw(){
  if(this.over||!this.line.list.length)return toast('Сейчас нельзя предложить ничью');
  if(this.opt.mode==='local')return modal('Ничья?','Оба игрока согласны?',[['Да, ничья',()=>this.finish('d','По согласию'),1],['Нет']]);
  const e=Engine.evaluate(this.line.g)*(this.line.g.turn===this.human()?-1:1);
  if(this.line.list.length>=30&&e<30)this.finish('d','По согласию');else toast('Бот отклонил ничью');
 },
 resign(){
  if(!this.active())return;
  const loser=this.opt.mode==='bot'?this.opt.color:(this.line.g.turn?'b':'w');
  modal('Сдаться?',this.line.list.length?'Партия будет засчитана как поражение.':'Ходов ещё не было, партия просто отменится.',[['Сдаюсь',()=>{if(!this.line.list.length)return this.leave();this.finish(loser==='w'?'b':'w',(loser==='w'?'Белые':'Чёрные')+' сдались')},1],['Играть дальше']]);
 },
 nav(n){this.ply=Math.max(0,Math.min(this.line.list.length,n));this.show()},
 mbar(){
  const box=$('#mbar');box.innerHTML='';if(!this.started)return;
  const add=(t,fn,c)=>{const b=document.createElement('button');b.innerHTML=t;b.onclick=fn;if(c)b.className=c;box.appendChild(b)};
  if(!this.over)return add(icon('flag')+' Сдаться',()=>this.resign(),'danger');
  add(icon('search')+' Разбор партии',()=>this.review(),'primary wide');
  add(icon('left'),()=>this.nav(this.ply-1));box.lastChild.title='Назад';add(icon('right'),()=>this.nav(this.ply+1));box.lastChild.title='Вперёд';
  add(icon('repeat'),()=>this.rematch());box.lastChild.title='Реванш';add(icon('plus'),()=>this.leave());box.lastChild.title='Новая партия';
 },
 active(){return this.started&&!this.over},
 lock(){document.body.dataset.lock=Ctl.view==='play'&&this.active()?1:0},
 leave(){this.stop();this.started=false;this.over=null;store.set('game',null);this.show()},
 review(){if(!this.line.list.length)return toast('В партии нет ходов');const l=this.line,s=this.opt.color,game={id:this.id,color:this.counts()?s:null,over:!!this.over};Ctl.go('analysis');Analysis.open(l,s,game);Analysis.review()},
 show(){
  document.body.dataset.live=this.started?1:0;this.mbar();this.lock();layout();TG.sync();
  $('#setup').style.display=this.started?'none':'';$('#live').style.display=this.started?'block':'none';$('#evbar').classList.remove('on');
  if(!this.started){Board.flip=$('#color').value==='b';Board.set(new Chess());this.bars();return}
  const g=this.live()?this.line.g:this.line.at(this.ply),prev=this.line.list[this.ply-1];
  const pre=Board.pre;Board.set(g,{last:prev&&prev.m});Board.pre=pre;if(pre)Board.render();
  moveList($('#moves'),this.line,this.ply,null,n=>this.nav(n));
  const o=opening(this.line.list.map(x=>x.san));$('#opening').textContent=o&&this.line.fen===START?o.n:'';
  const st=$('#status');st.className='status';
  if(this.over){st.textContent=this.over.title+' — '+this.over.reason+' ('+this.over.res+')'}
  else if(!this.live())st.textContent='Просмотр прошлых ходов. Нажми ⏭, чтобы вернуться.';
  else st.textContent=(g.inCheck()?'Шах! ':'')+(this.opt.mode==='bot'?(g.turn===this.human()?'Твой ход.':'Бот думает…'):'Ход '+(g.turn?'чёрных.':'белых.'));
  $('#undo').disabled=$('#hint').disabled=$('#draw').disabled=$('#resign').disabled=!!this.over;
  this.bars(g);
 },
 bars(g){
  const bottom=Board.flip?8:0,names=this.started?this.names():['Белые','Чёрные'];
  for(const[el,c]of[[$('#pBot'),bottom],[$('#pTop'),bottom^8]]){
   const bot=this.started&&this.opt.mode==='bot'&&c!==this.human();
   playerBar(el,{name:this.started?names[c>>3]:(c===bottom?cfg.name:'Соперник'),sub:bot?'уровень '+this.opt.level:'',icon:bot?botAva(this.opt.level):`<img alt="" src='${pieceSrc(6|c)}'>`,color:c,g,clock:this.started&&this.clock?this.left(c>>3):null,active:this.started&&!this.over&&this.line.g.turn===c});
  }
 },
 timer(){
  if(!this.started||this.over||!this.clock||!this.clock.since)return;
  const c=this.line.g.turn>>3,v=this.left(c);
  if(v<=0){this.timeout(c);return}
  if(v<10000&&Math.ceil(v/1000)!==this.tick){this.tick=Math.ceil(v/1000);sound('low')}
  if(Ctl.view==='play'){const el=$((c===(Board.flip?1:0))?'#pBot':'#pTop').querySelector('.clock');if(el){el.textContent=fmt(v);el.classList.toggle('low',v<20000)}}
 },
 save(){
  if(!this.started)return;
  const k=this.clock;
  store.set('game',this.over?null:{opt:this.opt,id:this.id,assisted:this.assisted,fen:this.line.fen,moves:this.line.list.map(x=>x.uci),clock:k&&{t:[this.left(0),this.left(1)],inc:k.inc,on:!!k.since}});
 },
 restore(){
  const s=store.get('game',null);if(!s)return;
  try{this.opt=s.opt;this.id=s.id||Date.now().toString(36);this.assisted=!!s.assisted;this.line=new Line(s.fen);for(const u of s.moves)if(!this.line.push(u))throw 0;
   this.clock=s.clock&&{t:s.clock.t,inc:s.clock.inc,since:s.clock.on?Date.now():null};this.started=true;this.over=null;this.ply=this.line.list.length;
  }catch(e){this.line=new Line();this.started=false}
 }
};

/* ---------- анализ и разбор ---------- */
const TAGS={
 brilliant:{n:'Блестящий',i:'!!',c:'#14b8b0'},
 great:{n:'Отличный',i:'!',c:'#4a7fe0'},
 best:{n:'Лучший',i:'★',c:'#3da350'},
 excellent:{n:'Превосходный',i:'✦',c:'#6cb044'},
 good:{n:'Хороший',i:'✓',c:'#7e9f78'},
 book:{n:'Теория',i:'📖',c:'#a8805c'},
 inacc:{n:'Неточность',i:'?!',c:'#d6a51c'},
 mistake:{n:'Ошибка',i:'?',c:'#e57a28'},
 miss:{n:'Упущенный шанс',i:'✕',c:'#e0607e'},
 blunder:{n:'Зевок',i:'??',c:'#d9363e'}};
for(const k in TAGS)TAGS[k].k=k;
const BAD=[TAGS.inacc,TAGS.mistake,TAGS.miss,TAGS.blunder];
/* ход оставляет ценную фигуру под боем и получает за неё заметно меньше */
function sacrificed(g,m){
 g.make(m);const moved=m.pr||m.p,sac=Engine.VAL[moved]-Engine.VAL[m.c],defended=g.attacked(m.t,g.turn^8);
 const hung=moved>1&&moved<6&&sac>=180&&g.moves().some(x=>x.t===m.t&&(!defended||Engine.VAL[x.p]<Engine.VAL[moved]));g.unmake();return hung;
}
/* значки CHEES.UP: скруглённые ромбы с шахматными обозначениями */
function badge(t){
 const white='fill="#fff"',line='fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"';
 const art={
  '★':`<path ${white} d="M24 11L28 20L38 21L30.5 28L33 38L24 32.5L15 38L17.5 28L10 21L20 20Z"/>`,
  '✦':`<path ${white} d="M24 9Q26.5 21.5 39 24Q26.5 26.5 24 39Q21.5 26.5 9 24Q21.5 21.5 24 9Z"/>`,
  '✓':`<path ${line} d="M13 25L21 33L35 16"/>`,'✕':`<path ${line} d="M16 16L32 32M32 16L16 32"/>`,
  '📖':`<path ${line} stroke-width="3" d="M24 17Q18 12 11 15V32Q18 29 24 34Q30 29 37 32V15Q30 12 24 17V33"/>`}[t.i]
  ||`<text x="24" y="33" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${t.i.length>1?23:27}" font-weight="900" ${white}>${t.i}</text>`;
 return `<svg class="bdg" viewBox="0 0 48 48"><rect x="8" y="8" width="32" height="32" rx="9" transform="rotate(45 24 24)" fill="${t.c}"/><circle cx="24" cy="24" r="19" fill="${t.c}"/>${art}</svg>`;
}

const NOM=[,'пешка','конь','слон','ладья','ферзь','король'];
/* разница материала в пользу стороны c после варианта */
function swing(g,pv,c){
 const mat=()=>{let v=0;for(let s=0;s<120;s++){const p=s&136?0:g.b[s];if(p)v+=((p&8)===c?1:-1)*[0,1,3,3,5,9,0][p&7]}return v};
 const start=mat();let n=0,last=start,quiet=start;
 for(const san of pv.slice(0,6)){const m=g.findSan(san);if(!m)break;g.make(m);n++;last=mat();const next=pv[n]&&g.findSan(pv[n]);if(!next||!next.c)quiet=last}
 while(n--)g.unmake();return quiet-start;
}
/* объяснения собираются из кусочков реплик: тот же список идёт и на экран, и в озвучку */
function idea(g,m){
 const r=[],S=Voice.s,to=sqName(m.t);
 g.make(m);const check=g.inCheck(),mate=g.status()==='mate';g.unmake();
 if(mate)return[[S('i_mate')]];
 if(m.fl===4||m.fl===8)r.push([S('i_castle')]);
 if(m.c)r.push([S('i_takes'),S('a_'+m.c),S('i_on'),Voice.sq(to)]);
 if(m.pr)r.push([S('i_promo')]);
 if(check)r.push([S('i_check')]);
 const home=g.turn?0:7;
 if((m.p===2||m.p===3)&&(m.f>>4)===home)r.push([S('i_develop')]);
 if(m.p===1&&['d4','e4','d5','e5'].includes(to))r.push([S('i_center')]);
 g.make(m);const hit=[];const us=g.turn^8;g.turn=us;const ep=g.ep;g.ep=-1;
 for(const x of g.pseudo(true))if(x.f===m.t&&x.c>1&&x.c<6&&(Engine.VAL[x.c]>Engine.VAL[m.p]||!g.attacked(x.t,us^8)))hit.push(x.c);
 g.turn=us^8;g.ep=ep;g.unmake();
 if(hit.length){const a=[S('i_attacks')];hit.forEach((t,i)=>{if(i)a.push(S('w_and'));a.push(S('a_'+t))});r.push(a)}
 return r;
}
const listed=parts=>parts.flatMap((p,i)=>i?[Voice.t(','),...p]:p);
function explain(g,m,tag,now,next){
 const S=Voice.s,T=Voice.t,c=g.turn,isBest=now.best===g.uci(m),M=Engine.MATE;
 const mateAfter=next.score>M-500&&next.best;
 const out=[S(`v_${tag.k}_${g.stack.length%Voice.variants(tag.k)}`)];
 if(isBest&&next.score>M-500)out[0]=S('x_nosave');
 const mine=idea(g,m);if(mine.length)out.push(S('i_this'),...listed(mine),T('.'));
 const bad=BAD.includes(tag);
 if(mateAfter&&now.score>-M+500){out.push(S('x_oppmate'),Voice.num(Math.ceil((M-next.score)/2)),T(':'),...next.pv.slice(0,5).flatMap(Voice.mv),T('.'))}
 if(!isBest&&now.score>M-500&&!(next.score<-M+500))out.push(S('x_missmate'),Voice.num(Math.ceil((M-now.score)/2)),T('.'));
 if(bad&&!mateAfter&&next.pv&&next.pv.length){
  g.make(m);const lost=-swing(g,next.pv,c);
  const r=g.findSan(next.pv[0]),why=r?idea(g,r):[];g.unmake();
  out.push(S('x_reply'),...Voice.mv(next.pv[0]));if(why.length)out.push(S('w_and'),...listed(why));out.push(T('.'));
  const total=lost-(m.c?[0,1,3,3,5,9,0][m.c]:0);
  if(total>0)out.push(S('x_lose'),Voice.num(total),T('.'));
 }
 if(!isBest&&now.best&&tag!==TAGS.book){
  const b=g.findUci(now.best),why=idea(g,b),gain=swing(g,now.pv,c);
  out.push(S('x_better'),...Voice.mv(now.san),T(`(${NOM[b.p]} ${sqName(b.f)} → ${sqName(b.t)})`));
  if(why.length)out.push(T(':'),S('x_thismove'),...listed(why));out.push(T('.'));
  if(gain>=2)out.push(S('x_wins'));
 }
 return out;
}
const winPct=s=>100/(1+Math.exp(-0.00368*Math.max(-2000,Math.min(2000,s))));
function scoreText(s){if(Math.abs(s)>MATE-500){const n=Math.ceil((MATE-Math.abs(s))/2);return n?(s>0?'+':'−')+'M'+n:'#'}return (s>0?'+':'')+(s/100).toFixed(1)}
const Analysis={
 line:new Line(),game:null,ply:0,on:true,cache:new Map(),token:0,data:null,busy:false,side:'w',
 open(line,side,game){this.halt();Voice.stop();this.game=game||null;this.line=new Line(line.fen);for(const x of line.list)this.line.push(x.uci);this.ply=this.line.list.length;this.data=null;this.busy=false;this.token++;this.cache.clear();Board.flip=side==='b';$('#reviewOut').innerHTML='';this.show()},
 canMove(){const g=Board.g;return{color:g.turn}},
 move(uci){
  if(this.retry!=null){
   const i=this.retry,g=Board.g,m=g.findUci(uci),good=uci===this.data.best[i].uci;g.make(m);
   Board.set(g,{last:m,mark:{s:m.t,tag:good?TAGS.best:TAGS.mistake}});sound(good?'good':'bad');
   this.tell([Voice.s(good?'x_right':'x_notyet')]);
   if(good)this.retry=null;else setTimeout(()=>{if(this.retry===i)Board.set(this.line.at(i))},900);
   return;
  }
  const next=this.line.list[this.ply];
  if(!next||next.uci!==uci){this.game=null;this.line.cut(this.ply);if(!this.line.push(uci))return;this.data=null;this.busy=false;this.token++;this.cache.clear();$('#reviewOut').innerHTML=''}
  this.ply++;this.show();moveSound(Board.g,this.line.list[this.ply-1].m);
 },
 nav(n){const o=this.ply;this.ply=Math.max(0,Math.min(this.line.list.length,n));this.show();if(this.ply===o+1)moveSound(Board.g,this.line.list[o].m)},
 show(){
  this.retry=null;
  const g=this.line.at(this.ply),prev=this.line.list[this.ply-1],d=this.data,tag=d&&prev&&d.tags[this.ply-1];
  Board.set(g,{last:prev&&prev.m,mark:tag?{s:prev.m.t,tag}:null});
  moveList($('#amoves'),this.line,this.ply,d&&d.tags,n=>this.nav(n));
  const bottom=Board.flip?8:0;
  for(const[el,c]of[[$('#pBot'),bottom],[$('#pTop'),bottom^8]])playerBar(el,{name:c?'Чёрные':'Белые',icon:`<img alt="" src='${pieceSrc(6|c)}'>`,color:c,g,sub:g.turn===c?'ходят':''});
  $('#evbar').classList.toggle('on',this.on);$('#evbar').classList.toggle('flip',Board.flip);
  this.coach();
  if(d){this.graph();this.bar(d.evals[this.ply]);
   const i=this.ply-1,t=d.tags[i];
   if(t&&BAD.includes(t)&&d.best[i].uci){const m=this.line.at(i).findUci(d.best[i].uci);Board.arrows=[{f:m.f,t:m.t,c:'#35c46a'}];Board.drawArrows()}
   return}
  this.engine(g);
 },
 bar(white){$('#evbar div').style.height=winPct(white)+'%';$('#evbar span').textContent=scoreText(white).replace(/[+−-]/,'')},
 engine(g){
  const out=$('#engineOut');
  if(this.busy)return;
  AI.analysis.cancel();const tk=++this.token;
  const st=g.status();
  if(st){out.textContent={mate:'Мат на доске.',stalemate:'Пат.',material:'Ничья: не хватает материала.',fifty:'Ничья: правило 50 ходов.',repetition:'Ничья: повторение позиции.'}[st];this.bar(st==='mate'?(g.turn?MATE:-MATE):0);return}
  if(!this.on){out.textContent='Движок выключен.';return}
  out.textContent='Считаю…';
  const moves=this.line.list.slice(0,this.ply).map(x=>x.uci),key=moves.join();
  const paint=r=>{
   const w=g.turn?-r.score:r.score,m=g.findUci(r.best);
   out.innerHTML=`<b style="font-size:20px">${scoreText(w)}</b> <span class="small muted">глубина ${r.depth}</span><br>Лучший ход: <b>${esc(g.san(m))}</b><br><span class="small muted">${esc(r.pv.join(' '))}</span>`;
   this.bar(w);Board.arrows=[{f:m.f,t:m.t,c:'#35c46a'}];Board.drawArrows();
  };
  if(this.cache.has(key))return paint(this.cache.get(key));
  /* пауза, чтобы быстрое листание не запускало расчёты */
  setTimeout(()=>{if(tk!==this.token||Ctl.view!=='analysis')return;
   AI.analysis.ask({cmd:'search',fen:this.line.fen,moves,opts:{time:900}}).then(r=>{if(tk!==this.token||Ctl.view!=='analysis')return;this.cache.set(key,r);paint(r)})},250);
 },
 async review(){
  const n=this.line.list.length;if(!n)return toast('В партии нет ходов');
  if(this.busy)return;
  AI.analysis.cancel();this.busy=true;const tk=++this.token,out=$('#reviewOut');this.data=null;
  const uci=this.line.list.map(x=>x.uci),sans=this.line.list.map(x=>x.san),time=Math.max(200,Math.min(1000,50000/(n+1)));
  const pos=[];
  for(let i=0;i<=n;i++){
   out.innerHTML=`<div class="status">Разбираю партию: ${i}/${n}</div>`;
   const g=this.line.at(i),st=g.status();
   if(st){pos.push({score:st==='mate'?-MATE:0,best:null,legal:0});continue}
   const r=await AI.analysis.ask({cmd:'search',fen:this.line.fen,moves:uci.slice(0,i),opts:{time}});
   if(tk!==this.token)return;
   r.san=g.san(g.findUci(r.best));pos.push(r);
  }
  const tags=[],best=[],evals=[],texts=[],acc=[[],[]];let theory=this.line.fen===START;
  for(let i=0;i<=n;i++)evals.push((this.line.at(i).turn?-1:1)*pos[i].score);
  for(let i=0;i<n;i++){
   const g=this.line.at(i),c=g.turn>>3,m=this.line.list[i].m;
   const before=winPct(pos[i].score),isBest=pos[i].best===uci[i];
   const cpLoss=isBest?0:pos[i].score+pos[i+1].score;
   let after=isBest?before:winPct(-pos[i+1].score),loss=Math.max(0,before-after);
   best.push({uci:pos[i].best,san:pos[i].san});
   theory=theory&&isBook(sans.slice(0,i+1));
   let t;
   const prevBad=i>0&&[TAGS.mistake,TAGS.blunder,TAGS.miss].includes(tags[i-1]);
   if(theory)t='book';
   else if(pos[i].legal===1)t='good';
   /* ход сам пропускает мат (или приближает его), хотя этого можно было избежать */
   else if(!isBest&&pos[i+1].score>MATE-500&&(pos[i].score>-MATE+500||-pos[i].score-pos[i+1].score>=2))t='blunder';
   else if(isBest||cpLoss<=10){
    t='best';
    if(sacrificed(g,m)&&after>=45&&before<95)t='brilliant';
    else if(g.moves().length>1&&before>15&&before<92&&!(i>0&&m.c&&this.line.list[i-1].m.t===m.t)){
     out.innerHTML=`<div class="status">Проверяю ход ${i+1}/${n}</div>`;
     const r=await AI.analysis.ask({cmd:'search',fen:this.line.fen,moves:uci.slice(0,i),opts:{time,exclude:uci[i]}});
     if(tk!==this.token)return;
     if(before-winPct(r.score)>=15)t='great';
    }
   }
   else if(loss<2)t=cpLoss<80?'excellent':cpLoss<200?'good':'inacc';else if(loss<5)t='good';
   else if(loss>=10&&prevBad&&after>=40)t='miss';
   else t=loss<10?'inacc':loss<20?'mistake':'blunder';
   if(t==='blunder')loss=Math.max(loss,25);
   tags.push(TAGS[t]);texts.push(explain(g,m,TAGS[t],pos[i],pos[i+1],sans[i]));
   acc[c].push(t==='book'?100:Math.max(0,Math.min(100,103.17*Math.exp(-.04354*loss)-3.17)));
  }
  this.busy=false;this.data={tags,best,evals,texts};
  const avg=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):'—';
  const rows=Object.values(TAGS).map(t=>{const c=[0,0];tags.forEach((x,i)=>{if(x===t)c[this.line.at(i).turn>>3]++});return `<tr><td>${c[0]}</td><td style="color:${t.c};text-align:center">${badge(t)} ${t.n}</td><td style="text-align:right">${c[1]}</td></tr>`}).join('');
  out.innerHTML=`<div class="grid"><div class="card"><span class="small muted">Точность белых</span><div class="stat">${avg(acc[0])}</div></div><div class="card"><span class="small muted">Точность чёрных</span><div class="stat">${avg(acc[1])}</div></div></div><svg class="graph" id="graph" viewBox="0 0 100 100" preserveAspectRatio="none"></svg><table>${rows}</table><p class="small muted">Оценки считает встроенный движок. Он слабее Stockfish, поэтому в сложных позициях возможны неточности.</p>`;
  $('#graph').onclick=e=>{const b=e.currentTarget.getBoundingClientRect();this.nav(Math.round((e.clientX-b.left)/b.width*n))};
  this.acc=[avg(acc[0]),avg(acc[1])];this.ply=0;this.show();$('.side').scrollTop=0;speak(this.summary());
  this.credit(tags);
 },
 /* награды за разбор своей партии: каждая партия и каждый ход засчитываются один раз */
 credit(tags){
  const g=this.game;if(!g||!g.color||g.over===false||tags.length<10&&!tags.includes(TAGS.brilliant))return;
  tags.forEach((t,i)=>{if(t===TAGS.brilliant&&(this.line.at(i).turn?'b':'w')===g.color)Meta.event('brilliant',{id:g.id+':'+i,san:this.line.list[i].san})});
  const seen=store.get('reviewed',[]);if(tags.length>=10&&!seen.includes(g.id)){store.set('reviewed',[g.id,...seen].slice(0,60));Meta.event('review')}
 },
 tell(segs){const e=$('#say');if(e)e.textContent=Voice.text(segs);speak(segs)},
 summary(){
  const t=this.data.tags,S=Voice.s,T=Voice.t,count=x=>t.filter(y=>y===x).length,out=[S('s_ready')];
  this.acc.forEach((a,i)=>{if(a==='—')return;const n=Math.round(+a);out.push(S(i?'s_black':'s_white'),Voice.num(n),Voice.pct(n),T('.'))});
  const bits=['brilliant','blunder','mistake','miss'].filter(k=>count(TAGS[k]));
  for(const k of bits)out.push(S('s_'+k),Voice.num(count(TAGS[k])),T('.'));
  if(!bits.some(k=>k!=='brilliant'))out.push(S('s_clean'));
  out.push(S('s_go'));return out;
 },
 text(){return this.ply?this.data.texts[this.ply-1]:this.summary()},
 coach(){
  const box=$('#coach'),d=this.data;$('#p-analysis').classList.toggle('reviewed',!!d);document.body.dataset.reviewed=d?1:0;layout();
  if(!d){box.innerHTML='';return}
  const i=this.ply-1,t=d.tags[i],n=this.line.list.length,bad=t&&BAD.includes(t)&&d.best[i].uci;
  const mood=!t?'calm':t===TAGS.blunder?'shock':BAD.includes(t)?(t===TAGS.inacc?'think':'sad'):t===TAGS.brilliant||t===TAGS.great||t===TAGS.best?'happy':'calm';
  box.innerHTML=`<div class="talk"><div class="coachface">${owl(mood)}</div><div class="bubble">${t?`<div class="verdict">${badge(t)}<b>${esc(this.line.list[i].san)} — <span style="color:${t.c}">${t.n}</span></b><span class="score">${scoreText(d.evals[this.ply])}</span></div>`:'<div class="verdict"><b>Тренер Филин</b></div>'}<p id="say">${esc(Voice.text(this.text()))}</p></div></div>
  <div class="tools"><button id="cSay">${icon('sound')} Слушать</button><button id="cAuto" class="${cfg.talk?'on':''}">Авто-голос</button><button id="cPlay" class="${this.playing?'on':''}">${this.playing?'⏸ Стоп':'▶ Вся партия'}</button><button id="cClose" class="x" title="Закрыть разбор" aria-label="Закрыть разбор">✕</button></div>
  <div class="tools nav"><button id="cPrev">◀</button><button id="cErr">К ошибке</button><button id="cNext" class="primary">Дальше ▶</button></div>
  ${bad?'<div class="tools"><button id="cBest">★ Показать лучший</button><button id="cTry">↺ Найти самому</button></div>':''}`;
  const on=(id,f)=>{const e=$('#'+id);if(e)e.onclick=f};
  on('cPrev',()=>this.step(this.ply-1));on('cNext',()=>this.step(this.ply+1));
  on('cSay',()=>{this.halt();Voice.say(this.text())});
  on('cAuto',()=>{cfg.talk=!cfg.talk;store.set('cfg',cfg);$('#sTalk').checked=cfg.talk;$('#cAuto').classList.toggle('on',cfg.talk);cfg.talk?Voice.say(this.text()):Voice.stop()});
  on('cPlay',()=>{if(this.playing){this.halt();Voice.stop();this.coach()}else{this.playing=true;if(this.ply===n)this.nav(0);this.autoplay()}});
  on('cErr',()=>{for(let k=1;k<=n;k++){const j=(this.ply+k-1)%n;if(BAD.includes(d.tags[j]))return this.step(j+1)}toast('Ошибок в партии нет')});
  on('cClose',()=>{this.halt();Voice.stop();this.data=null;$('#reviewOut').innerHTML='';this.show()});on('cBest',()=>this.showBest());on('cTry',()=>this.tryAgain());
  $('#cPrev').disabled=!this.ply;$('#cNext').disabled=this.ply===n;
 },
 halt(){this.playing=false;clearTimeout(this.timer)},
 step(n){this.halt();Voice.stop();this.nav(n);speak(this.text())},
 autoplay(){
  if(!this.playing||!this.data||Ctl.view!=='analysis')return;
  this.coach();
  const next=ok=>{if(!this.playing)return;this.timer=setTimeout(()=>{if(!this.playing)return;if(this.ply>=this.line.list.length){this.halt();return this.coach()}this.nav(this.ply+1);this.autoplay()},ok?500:Math.max(2500,Voice.text(this.text()).length*45))};
  speak(this.text(),next);
 },
 showBest(){
  this.halt();const i=this.ply-1,g=this.line.at(i),b=this.data.best[i],m=g.findUci(b.uci);g.make(m);
  Board.set(g,{last:m,mark:{s:m.t,tag:TAGS.best}});Board.arrows=[{f:m.f,t:m.t,c:'#35c46a'}];Board.drawArrows();
  const why=idea(this.line.at(i),m),S=Voice.s,T=Voice.t;
  sound('move');this.tell([S('x_stronger'),...Voice.mv(b.san),T('.'),...(why.length?[S('i_this'),...listed(why),T('.')]:[]),S('x_nextback')]);
 },
 tryAgain(){
  this.halt();const i=this.ply-1;this.retry=i;
  Board.set(this.line.at(i));this.tell([Voice.s('x_try')]);
 },
 graph(){
  const s=$('#graph');if(!s)return;const e=this.data.evals,n=e.length-1||1;
  const pts=e.map((v,i)=>`${i/n*100},${100-winPct(v)}`).join(' ');
  s.innerHTML=`<polygon fill="#eef4f9" points="0,100 ${pts} 100,100"/><line x1="0" x2="100" y1="50" y2="50" stroke="#888" vector-effect="non-scaling-stroke"/><line x1="${this.ply/n*100}" x2="${this.ply/n*100}" y1="0" y2="100" stroke="#f2a93b" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
 },
 load(){
  const t=$('#io').value.trim();if(!t)return toast('Вставь PGN или FEN');
  const g=new Chess();
  if(/^[pnbrqkPNBRQK1-8]+(\/[pnbrqkPNBRQK1-8]+){7}/.test(t)){if(!g.load(t))return toast('Некорректная позиция FEN');this.open(new Line(g.fen()))}
  else try{this.open(Line.fromPgn(t));this.nav(0)}catch(e){toast('Ошибка PGN: '+e.message)}
 }
};

/* ---------- редактор ---------- */
const Editor={
 b:new Array(128).fill(0),pick:1,g:null,
 init(){
  const p=$('#palette');
  for(const v of[6,5,4,3,2,1,0,14,13,12,11,10,9]){const x=document.createElement('button');x.innerHTML=v?pieceSvg(v):'⌫';x.dataset.p=v;x.onclick=()=>{this.pick=v;this.mark()};p.appendChild(x)}
  this.set(START);this.mark();
 },
 mark(){$$('#palette button').forEach(x=>x.classList.toggle('on',+x.dataset.p===this.pick))},
 set(fen){
  const a=fen.trim().split(/\s+/),rows=a[0].split('/');this.b.fill(0);
  rows.forEach((row,r)=>{let f=0;for(const c of row){if(+c){f+=+c;continue}const t=' pnbrqk'.indexOf(c.toLowerCase());this.b[r*16+f++]=t|(c===c.toLowerCase()?8:0)}});
  $('#eTurn').value=a[1]==='b'?'b':'w';this.sync();
 },
 fen(){
  const rows=[];for(let r=0;r<8;r++){let s='',e=0;for(let f=0;f<8;f++){const p=this.b[r*16+f];if(!p){e++;continue}if(e){s+=e;e=0}const l=' pnbrqk'[p&7];s+=p&8?l:l.toUpperCase()}rows.push(s+(e||''))}
  const b=this.b;let c='';if(b[116]===6){if(b[119]===4)c+='K';if(b[112]===4)c+='Q'}if(b[4]===14){if(b[7]===12)c+='k';if(b[0]===12)c+='q'}
  return `${rows.join('/')} ${$('#eTurn').value} ${c||'-'} - 0 1`;
 },
 sync(){
  const fen=this.fen();$('#fen').value=fen;const ok=new Chess().load(fen);
  $('#eMsg').textContent=ok?'Позиция корректна.':'Недопустимая позиция: нужны по одному королю, пешки не на крайних рядах, и король не ходящей стороны не под шахом.';
  $('#eMsg').className='status '+(ok?'good':'bad');$('#eAn').disabled=$('#ePlay').disabled=!ok;
 },
 show(){this.g={b:this.b,turn:0};Board.set(this.g);for(const el of[$('#pTop'),$('#pBot')])el.innerHTML=''},
 down(s,e){
  if(this.b[s]){const o=Board.pieces.get(s);Board.drag={el:o.el,from:s,x:e.clientX,y:e.clientY}}
  else if(this.pick){this.b[s]=this.pick;Board.render();this.sync()}
 },
 drop(f,t){
  if(t===f)this.b[f]=this.b[f]===this.pick?0:this.pick;
  else{if(t>=0)this.b[t]=this.b[f];this.b[f]=0}
  Board.render();this.sync();
 }
};

/* ---------- навигация ---------- */
const Ctl={
 view:'home',
 prev:'home',
 go(v){
  if(v!=='play'&&this.view==='play'&&Play.active())return toast('Сначала закончи партию или сдайся');
  if(this.view==='analysis'&&v!=='analysis'){Analysis.token++;Analysis.busy=false;Analysis.halt();Analysis.retry=null;AI.analysis.cancel();if(!Analysis.data)$('#reviewOut').innerHTML=''}
  if(this.view==='solve'&&v!=='solve')Puzzles.leave();
  if(v!==this.view){Voice.stop();if(this.view!=='solve')this.prev=this.view}
  this.view=v;document.body.dataset.view=v;document.body.dataset.lock=0;Board.pre=null;Board.drag=null;$('#modal').classList.remove('on');
  const board=['play','solve','analysis','editor'].includes(v);
  $$('.view').forEach(x=>x.classList.toggle('on',x.id==='v-'+(board?'board':v)));
  const tab=v==='solve'?'puzzles':['analysis','editor','settings'].includes(v)&&innerWidth<=900?'home':v;
  $$('nav button').forEach(x=>x.classList.toggle('on',x.dataset.v===tab));
  for(const p of['play','solve','analysis','editor'])$('#p-'+p).style.display=p===v?'':'none';
  $('#evbar').classList.remove('on');
  if(v==='home')Hub.home();
  if(v==='puzzles')Puzzles.hub();
  if(v==='quests')Hub.quests();
  if(v==='profile')Hub.profile();
  if(v==='play'){if(Play.started)Board.flip=Play.opt.mode==='bot'&&Play.opt.color==='b';Play.show();Play.think()}
  if(v==='analysis')Analysis.show();
  if(v==='editor'){Board.flip=false;Editor.show()}
  if(v==='settings')Hub.themes();
  layout();TG.sync();scrollTo(0,0);if(board)$('.side').scrollTop=0;const sec=$('.view.on');if(sec)sec.scrollTop=0;
  Hub.flush();
 },
 back(){this.go(this.view==='solve'?'puzzles':this.view==='analysis'&&this.prev==='play'?'play':['analysis','editor','settings'].includes(this.view)&&this.prev==='profile'?'profile':'home')},
 canMove(){const o={play:Play,analysis:Analysis,solve:Puzzles}[this.view];return o?o.canMove():null},
 move(u){({play:Play,analysis:Analysis,solve:Puzzles})[this.view].move(u)}
};

function chips(id){
 const s=$('#'+id),box=document.createElement('div');box.className='chips c-'+id;s.after(box);s.classList.add('hidden');
 const draw=()=>[...box.children].forEach((b,i)=>b.classList.toggle('on',s.options[i].value===s.value));
 [...s.options].forEach(o=>{const b=document.createElement('button');b.type='button';b.textContent=id==='level'?o.value:o.textContent;b.onclick=e=>{e.preventDefault();s.value=o.value;s.dispatchEvent(new Event('change'));draw();if(id==='level')$('#lvlName').textContent=Engine.LEVELS[o.value-1].name};box.appendChild(b)});
 draw();
}
function init(){
 document.body.dataset.theme=cfg.theme;
 $('#level').innerHTML=BOTS.map((l,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
 const last=store.get('last',{level:'3',mode:'bot',color:'w',tc:'600+0'}); /* label заменяется на div, иначе нажатие по подписи жмёт первую плитку */
 $$('#setup label').forEach(l=>{const d=document.createElement('div');d.className='field';d.id=l.id;d.innerHTML=l.innerHTML;l.replaceWith(d)});
 for(const k of['mode','level','color','tc'])$('#'+k).value=last[k];
 ['mode','color','tc'].forEach(chips);
 addEventListener('resize',layout);lite();Hub.init();
 Board.init();Editor.init();Play.restore();
 $$('nav button').forEach(b=>b.onclick=()=>Ctl.go(b.dataset.v));
 $$('[data-go]').forEach(b=>b.onclick=()=>Ctl.go(b.dataset.go));
 const on=(id,fn)=>$('#'+id).onclick=fn;
 on('start',()=>Play.start());
 $('#mode').onchange=()=>$('#lvlL').style.display=$('#mode').value==='bot'?'':'none';$('#mode').onchange();
 $('#color').onchange=()=>Play.show();
 on('undo',()=>Play.undo());on('hint',()=>Play.hint());on('draw',()=>Play.offerDraw());on('resign',()=>Play.resign());on('rematch',()=>{const go=()=>Play.rematch();Play.over||!Play.line.list.length?go():modal('Начать заново?','Текущая партия будет удалена.',[['Да',go,1],['Нет']])});
 on('newg',()=>{const go=()=>{Play.stop();Play.started=false;store.set('game',null);Play.show()};Play.over||!Play.line.list.length?go():modal('Новая партия?','Текущая партия будет удалена.',[['Да',go,1],['Нет']])});
 on('toAn',()=>{if(!Play.over&&Play.opt.mode==='bot')return toast('Анализ откроется после окончания партии');const l=Play.line,s=Play.opt.color;Ctl.go('analysis');Analysis.open(l,s)});
 $$('.navb').forEach(d=>{['⏮','◀','▶','⏭'].forEach((t,i)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>navigate(i);d.appendChild(b)})});
 $$('.flip').forEach(b=>b.onclick=flip);
 on('engToggle',()=>{Analysis.on=!Analysis.on;$('#engToggle').classList.toggle('on',Analysis.on);$('#engToggle').textContent='Движок '+(Analysis.on?'вкл.':'выкл.');Analysis.show()});
 on('review',()=>Analysis.review());on('load',()=>Analysis.load());on('aReset',()=>Analysis.open(new Line()));
 on('getPgn',()=>{$('#io').value=Analysis.line.pgn();copy($('#io').value)});on('getFen',()=>{$('#io').value=Board.g.fen();copy($('#io').value)});
 on('dl',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([Analysis.line.pgn()],{type:'text/plain'}));a.download='chees-up.pgn';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)});
 const fromFen=(fen)=>{const go=()=>{Play.start({mode:'bot',level:+$('#level').value,color:fen.split(' ')[1],tc:'0'},fen);Ctl.go('play')};Play.started&&!Play.over&&Play.line.list.length?modal('Начать новую?','Незаконченная партия будет удалена.',[['Да',go,1],['Нет']]):go()};
 on('playHere',()=>{const g=Board.g;if(g.status())return toast('В этой позиции игра окончена');fromFen(g.fen())});
 on('eStart',()=>{Editor.set(START);Board.render()});on('eClear',()=>{Editor.set('8/8/8/8/8/8/8/8 w');Board.render()});
 on('eLoad',()=>{const v=$('#fen').value;if(!new Chess().load(v))return toast('Некорректный FEN');Editor.set(v);Board.render()});
 $('#eTurn').onchange=()=>Editor.sync();
 on('eAn',()=>{const l=new Line(Editor.fen());Ctl.go('analysis');Analysis.open(l)});on('ePlay',()=>fromFen(new Chess(Editor.fen()).fen()));
 $('#sName').value=cfg.name;$('#sTheme').value=cfg.theme;
 const save=()=>{cfg.name=$('#sName').value.trim()||'Ты';cfg.theme=$('#sTheme').value;for(const k of['sound','talk','coords','legal','queen','lite'])cfg[k]=$('#s'+k[0].toUpperCase()+k.slice(1)).checked;document.body.dataset.theme=cfg.theme;lite();store.set('cfg',cfg);Hub.changed()};
 for(const k of['sound','talk','coords','legal','queen','lite']){const e=$('#s'+k[0].toUpperCase()+k.slice(1));e.checked=cfg[k];e.onchange=save}
 $('#sName').oninput=save;$('#sTheme').onchange=save;
 on('sReset',()=>modal('Сбросить всё?','Статистика, архив и текущая партия будут удалены.',[['Удалить',()=>{Object.assign(stats,{w:0,l:0,d:0,rating:800,streak:0,best:0,solved:0});store.set('stats',stats);store.set('reviewed',[]);Meta.reset();Hub.equip();store.set('archive',[]);store.set('game',null);Play.stop();Play.started=false;Play.line=new Line();toast('Сброшено')},1],['Отмена']]));
 addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k={ArrowLeft:1,ArrowRight:2,ArrowUp:0,ArrowDown:3}[e.key];if(k!==undefined&&(Ctl.view==='play'||Ctl.view==='analysis')){e.preventDefault();navigate(k)}if(e.code==='KeyF'&&Board.g&&['play','analysis','solve','editor'].includes(Ctl.view))flip();if(e.key==='Escape')$('#modal').classList.remove('on')});
 setInterval(()=>Play.timer(),100);addEventListener('pagehide',()=>Play.save());
 TG.init();
 Ctl.go(Play.active()?'play':'home');
}
function layout(){
 const W=document.documentElement.clientWidth,H=window.innerHeight,d=document.body.dataset,mobile=W<=900,land=mobile&&W>H;
 const root=document.documentElement.style,main=$('main');let size;
 if(!mobile)size=Math.max(320,Math.min(H-(d.view==='solve'?190:140),W-640,760));
 else{
  const h=main.clientHeight||H-62,review=d.view==='analysis'&&d.reviewed==='1';
  if(land)size=Math.min(W*.55,h-(d.view==='play'?76:d.view==='analysis'&&!review?76:d.view==='solve'?4:4));
  else{
   const small=H<=600,tiny=H<=580;
   /* высота всего, что должно поместиться вместе с доской */
   const rest={play:small?176:210,solve:small?196:236,analysis:review?(tiny?228:small?210:236):(small?226:260),editor:small?236:260}[d.view]||200;
   size=Math.min(W-(d.view==='analysis'?10:0),h-rest,640);
  }
  size=Math.max(144,size);
 }
 size=Math.floor(size/8)*8;
 root.setProperty('--b',size+'px');root.setProperty('--u',size/100+'px');
}
/* ---------- Telegram Mini App ---------- */
const TG=(()=>{
 const w=window.Telegram&&window.Telegram.WebApp;
 if(!w||!w.platform||w.platform==='unknown')return{sync(){},haptic(){},init(){},on:false,cloud:null};
 const v=x=>w.isVersionAtLeast(x),safe=f=>{try{f()}catch(e){}};
 const cloud=v('6.9')&&w.CloudStorage?{
  get:k=>new Promise(res=>{try{w.CloudStorage.getItem(k,(e,val)=>res(e?undefined:val||''))}catch(e){res(undefined)}}),
  set:(k,val)=>safe(()=>w.CloudStorage.setItem(k,val))}:null;
 return{on:true,cloud,
  init(){
   safe(()=>w.ready());safe(()=>w.expand());
   if(v('6.1')){safe(()=>w.setHeaderColor('#1b1815'));safe(()=>w.setBackgroundColor('#1b1815'));safe(()=>w.BackButton.onClick(()=>Ctl.back()))}
   if(v('7.7'))safe(()=>w.disableVerticalSwipes());
   safe(()=>w.onEvent('viewportChanged',layout));
   const u=w.initDataUnsafe&&w.initDataUnsafe.user;
   if(u&&u.first_name&&cfg.name==='Ты'){cfg.name=u.first_name.slice(0,20);$('#sName').value=cfg.name}
   $('#dl').style.display='none';
  },
  sync(){
   const playing=Play.active();
   if(v('6.1'))safe(()=>Ctl.view==='home'||(Ctl.view==='play'&&playing)?w.BackButton.hide():w.BackButton.show());
   if(v('6.2'))safe(()=>playing?w.enableClosingConfirmation():w.disableClosingConfirmation());
  },
  haptic(kind){if(!v('6.1'))return;safe(()=>{const h=w.HapticFeedback;if(kind==='good'||kind==='end')h.notificationOccurred('success');else if(kind==='bad')h.notificationOccurred('error');else h.impactOccurred(kind==='move'?'light':'medium')})}
 };
})();

function navigate(i){
 const o=Ctl.view==='analysis'?Analysis:Play;if(o===Play&&!Play.started)return;if(o===Analysis){Analysis.halt();Voice.stop()}
 o.nav([0,o.ply-1,o.ply+1,o.line.list.length][i]);
}
function flip(){
 Board.flip=!Board.flip;
 if(Ctl.view==='play')Play.show();else if(Ctl.view==='analysis')Analysis.show();else if(Ctl.view==='solve')Puzzles.flip();else Board.render();
}
