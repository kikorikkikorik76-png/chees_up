const Engine = (() => {
'use strict';
const P=1,N=2,B=3,R=4,Q=5,K=6,W=0,BL=8;
const LET=' pnbrqk';
const START='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const DIRS={2:[-33,-31,-18,-14,14,18,31,33],3:[-17,-15,15,17],4:[-16,-1,1,16],5:[-17,-16,-15,-1,1,15,16,17],6:[-17,-16,-15,-1,1,15,16,17]};
let seed=1234567;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
const table=n=>Array.from({length:n},rnd);
const Z1=table(16*128),Z2=table(16*128),ZC1=table(16),ZC2=table(16),ZE1=table(129),ZE2=table(129),ZS1=rnd(),ZS2=rnd();
const CMASK=new Array(128).fill(15);
CMASK[0]=7;CMASK[7]=11;CMASK[4]=3;CMASK[112]=13;CMASK[119]=14;CMASK[116]=12;
const sqName=s=>'abcdefgh'[s&7]+(8-(s>>4));
const sqIdx=n=>(8-+n[1])*16+n.charCodeAt(0)-97;

class Chess{
  constructor(fen){if(!this.load(fen||START))this.load(START)}
  load(fen){
    const a=String(fen).trim().split(/\s+/);const rows=(a[0]||'').split('/');
    if(rows.length!==8)return false;
    const b=new Array(128).fill(0),kings=[[],[]];
    for(let r=0;r<8;r++){let f=0;for(const ch of rows[r]){
      if(/[1-8]/.test(ch)){f+=+ch;continue}
      const t=LET.indexOf(ch.toLowerCase());if(t<1||f>7)return false;
      const c=ch===ch.toLowerCase()?BL:W,s=r*16+f;
      if(t===P&&(r===0||r===7))return false;
      b[s]=t|c;if(t===K)kings[c>>3].push(s);f++}
      if(f!==8)return false}
    if(kings[0].length!==1||kings[1].length!==1)return false;
    const turn=a[1]==='b'?BL:W;
    let cr=0;const c=a[2]||'-';
    if(c.includes('K')&&b[116]===K&&b[119]===R)cr|=1;
    if(c.includes('Q')&&b[116]===K&&b[112]===R)cr|=2;
    if(c.includes('k')&&b[4]===(K|8)&&b[7]===(R|8))cr|=4;
    if(c.includes('q')&&b[4]===(K|8)&&b[0]===(R|8))cr|=8;
    let ep=-1;
    if(/^[a-h][36]$/.test(a[3]||'')){const e=sqIdx(a[3]),d=turn===W?16:-16;
      if(a[3][1]===(turn===W?'6':'3')&&!b[e]&&b[e+d]===(P|(turn^8)))ep=e}
    const old=[this.b,this.turn,this.kings];
    this.b=b;this.turn=turn;this.kings=[kings[0][0],kings[1][0]];
    if(this.attacked(this.kings[(turn^8)>>3],turn)){[this.b,this.turn,this.kings]=old;return false}
    this.cr=cr;this.ep=ep;this.half=+a[4]||0;this.full=+a[5]||1;this.stack=[];this.startFen=null;
    this.hash();this.startFen=this.fen();return true;
  }
  hash(){
    let h1=0,h2=0;
    for(let s=0;s<120;s++){if(s&136)continue;const p=this.b[s];if(p){h1^=Z1[p*128+s];h2^=Z2[p*128+s]}}
    h1^=ZC1[this.cr]^ZE1[this.ep+1];h2^=ZC2[this.cr]^ZE2[this.ep+1];
    if(this.turn){h1^=ZS1;h2^=ZS2}
    this.h1=h1;this.h2=h2;
  }
  key(){return (this.h1>>>0)*2097152+((this.h2>>>0)>>>11)}
  fen(){
    const rows=[];
    for(let r=0;r<8;r++){let s='',e=0;for(let f=0;f<8;f++){const p=this.b[r*16+f];
      if(!p){e++;continue}if(e){s+=e;e=0}const l=LET[p&7];s+=p&8?l:l.toUpperCase()}
      rows.push(s+(e||''))}
    const c=((this.cr&1?'K':'')+(this.cr&2?'Q':'')+(this.cr&4?'k':'')+(this.cr&8?'q':''))||'-';
    return `${rows.join('/')} ${this.turn?'b':'w'} ${c} ${this.ep<0?'-':sqName(this.ep)} ${this.half} ${this.full}`;
  }
  attacked(s,by){
    const b=this.b;
    const pd=by===W?[15,17]:[-15,-17];
    for(const d of pd){const x=s+d;if(!(x&136)&&b[x]===(P|by))return true}
    for(const d of DIRS[2]){const x=s+d;if(!(x&136)&&b[x]===(N|by))return true}
    for(const d of DIRS[6]){const x=s+d;if(!(x&136)&&b[x]===(K|by))return true}
    for(const d of DIRS[3]){for(let x=s+d;!(x&136);x+=d){const p=b[x];if(p){if(p===(B|by)||p===(Q|by))return true;break}}}
    for(const d of DIRS[4]){for(let x=s+d;!(x&136);x+=d){const p=b[x];if(p){if(p===(R|by)||p===(Q|by))return true;break}}}
    return false;
  }
  inCheck(){return this.attacked(this.kings[this.turn>>3],this.turn^8)}
  pseudo(capsOnly){
    const out=[],b=this.b,us=this.turn,them=us^8;
    const add=(f,t,c,fl,pr)=>out.push({f,t,p:b[f]&7,c,fl,pr:pr||0});
    for(let s=0;s<120;s++){
      if(s&136)continue;const p=b[s];if(!p||(p&8)!==us)continue;const t=p&7;
      if(t===P){
        const d=us?16:-16,start=us?1:6,last=us?7:0;
        const push=(to,c,fl)=>{if((to>>4)===last){for(const pr of(capsOnly?[Q]:[Q,R,B,N]))add(s,to,c,fl,pr)}else add(s,to,c,fl)};
        let to=s+d;
        if(!(to&136)&&!b[to]){
          if(!capsOnly||(to>>4)===last)push(to,0,0);
          if(!capsOnly&&(s>>4)===start&&!b[to+d])add(s,to+d,0,2);
        }
        for(const dd of[d-1,d+1]){to=s+dd;if(to&136)continue;
          if(b[to]&&(b[to]&8)===them)push(to,b[to]&7,0);else if(to===this.ep)add(s,to,P,1)}
        continue;
      }
      const slide=t===B||t===R||t===Q;
      for(const d of DIRS[t]){
        for(let to=s+d;!(to&136);to+=d){
          const q=b[to];
          if(!q){if(!capsOnly)add(s,to,0,0)}
          else{if((q&8)===them)add(s,to,q&7,0);break}
          if(!slide)break;
        }
      }
      if(t===K&&!capsOnly){
        const home=us?4:116,k=us?4:1,q=us?8:2;
        if(s===home&&(this.cr&(k|q))&&!this.attacked(home,them)){
          if((this.cr&k)&&!b[home+1]&&!b[home+2]&&!this.attacked(home+1,them))add(s,home+2,0,4);
          if((this.cr&q)&&!b[home-1]&&!b[home-2]&&!b[home-3]&&!this.attacked(home-1,them))add(s,home-2,0,8);
        }
      }
    }
    return out;
  }
  make(m){
    const b=this.b,us=this.turn,p=b[m.f];
    this.stack.push({m,cr:this.cr,ep:this.ep,half:this.half,h1:this.h1,h2:this.h2,cap:b[m.t]});
    let h1=this.h1^ZC1[this.cr]^ZE1[this.ep+1]^ZS1,h2=this.h2^ZC2[this.cr]^ZE2[this.ep+1]^ZS2;
    const tog=(pc,s)=>{h1^=Z1[pc*128+s];h2^=Z2[pc*128+s]};
    if(b[m.t])tog(b[m.t],m.t);
    const np=m.pr?(m.pr|us):p;
    tog(p,m.f);tog(np,m.t);b[m.t]=np;b[m.f]=0;
    if(m.fl===1){const s=m.t+(us?-16:16);tog(b[s],s);b[s]=0}
    if(m.fl===4||m.fl===8){const rf=m.fl===4?m.f+3:m.f-4,rt=m.fl===4?m.f+1:m.f-1;tog(b[rf],rf);tog(b[rf],rt);b[rt]=b[rf];b[rf]=0}
    if(m.p===K)this.kings[us>>3]=m.t;
    this.cr&=CMASK[m.f]&CMASK[m.t];
    this.ep=-1;
    if(m.fl===2){const e=(m.f+m.t)>>1;for(const d of[-1,1]){const x=m.t+d;if(!(x&136)&&b[x]===(P|(us^8))){this.ep=e;break}}}
    this.half=(m.p===P||m.c)?0:this.half+1;
    if(us)this.full++;
    this.turn^=8;
    this.h1=h1^ZC1[this.cr]^ZE1[this.ep+1];this.h2=h2^ZC2[this.cr]^ZE2[this.ep+1];
  }
  unmake(){
    const u=this.stack.pop(),m=u.m,b=this.b;this.turn^=8;const us=this.turn;
    b[m.f]=m.pr?(P|us):b[m.t];b[m.t]=u.cap;
    if(m.fl===1)b[m.t+(us?-16:16)]=P|(us^8);
    if(m.fl===4||m.fl===8){const rf=m.fl===4?m.f+3:m.f-4,rt=m.fl===4?m.f+1:m.f-1;b[rf]=b[rt];b[rt]=0}
    if(m.p===K)this.kings[us>>3]=m.f;
    if(us)this.full--;
    this.cr=u.cr;this.ep=u.ep;this.half=u.half;this.h1=u.h1;this.h2=u.h2;
  }
  legalMade(){return !this.attacked(this.kings[(this.turn^8)>>3],this.turn)}
  moves(){return this.pseudo(false).filter(m=>{this.make(m);const ok=this.legalMade();this.unmake();return ok})}
  uci(m){return sqName(m.f)+sqName(m.t)+(m.pr?LET[m.pr]:'')}
  findUci(u){return this.moves().find(m=>this.uci(m)===u)||null}
  san(m,list){
    list=list||this.moves();let s;
    if(m.fl===4)s='O-O';else if(m.fl===8)s='O-O-O';else{
      if(m.p===P)s=m.c?sqName(m.f)[0]+'x':'';
      else{
        s=LET[m.p].toUpperCase();
        const amb=list.filter(x=>x.p===m.p&&x.t===m.t&&x.f!==m.f);
        if(amb.length){const n=sqName(m.f);
          if(!amb.some(x=>(x.f&7)===(m.f&7)))s+=n[0];else if(!amb.some(x=>(x.f>>4)===(m.f>>4)))s+=n[1];else s+=n}
        if(m.c)s+='x';
      }
      s+=sqName(m.t);if(m.pr)s+='='+LET[m.pr].toUpperCase();
    }
    this.make(m);if(this.inCheck())s+=this.moves().length?'+':'#';this.unmake();
    return s;
  }
  findSan(str){
    const clean=x=>x.replace(/0/g,'O').replace(/[+#!?=]/g,'');
    const want=clean(str),list=this.moves();
    return list.find(m=>clean(this.san(m,list))===want)||list.find(m=>this.uci(m)===str.toLowerCase())||null;
  }
  repetitions(){let n=1;for(let i=this.stack.length-2;i>=0;i-=2){const u=this.stack[i];if(u.h1===this.h1&&u.h2===this.h2)n++}return n}
  insufficient(){
    const minor=[];
    for(let s=0;s<120;s++){if(s&136)continue;const t=this.b[s]&7;if(!t||t===K)continue;if(t===P||t===R||t===Q)return false;minor.push({t,c:((s>>4)+(s&7))&1})}
    return minor.length<2||minor.every(x=>x.t===B&&x.c===minor[0].c);
  }
  status(){
    if(!this.moves().length)return this.inCheck()?'mate':'stalemate';
    if(this.insufficient())return 'material';
    if(this.half>=100)return 'fifty';
    if(this.repetitions()>=3)return 'repetition';
    return null;
  }
}

/* ---------- оценка позиции ---------- */
const VAL=[0,100,320,335,500,950,0];
const PST={
1:[0,0,0,0,0,0,0,0, 60,60,60,60,60,60,60,60, 15,20,25,35,35,25,20,15, 5,8,12,28,28,12,8,5, 0,0,8,24,24,0,0,0, 4,-3,-6,4,4,-8,-3,4, 4,8,8,-22,-22,10,8,4, 0,0,0,0,0,0,0,0],
2:[-50,-35,-28,-28,-28,-28,-35,-50, -35,-18,0,3,3,0,-18,-35, -28,5,12,18,18,12,5,-28, -26,2,18,22,22,18,2,-26, -26,2,16,22,22,16,2,-26, -28,3,12,14,14,12,3,-28, -35,-18,0,4,4,0,-18,-35, -50,-28,-28,-26,-26,-28,-28,-50],
3:[-18,-8,-8,-8,-8,-8,-8,-18, -8,0,0,0,0,0,0,-8, -8,0,6,10,10,6,0,-8, -8,8,6,12,12,6,8,-8, -8,0,12,12,12,12,0,-8, -8,10,10,10,10,10,10,-8, -8,10,0,2,2,0,10,-8, -18,-8,-14,-8,-8,-14,-8,-18],
4:[0,0,0,0,0,0,0,0, 10,15,15,15,15,15,15,10, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,4,10,10,6,0,0],
5:[-18,-10,-8,-4,-4,-8,-10,-18, -10,0,0,0,0,0,0,-10, -8,0,4,4,4,4,0,-8, -4,0,4,4,4,4,0,-4, -4,0,4,4,4,4,0,-4, -8,4,4,4,4,4,0,-8, -10,0,4,0,0,0,0,-10, -18,-10,-8,0,-4,-8,-10,-18],
6:[-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,-5,-5,-5,-5,20,20, 20,32,12,-5,0,8,35,20],
7:[-50,-30,-30,-30,-30,-30,-30,-50, -30,-10,0,0,0,0,-10,-30, -30,0,20,28,28,20,0,-30, -30,0,28,38,38,28,0,-30, -30,0,28,38,38,28,0,-30, -30,0,20,28,28,20,0,-30, -30,-20,0,0,0,0,-20,-30, -50,-30,-30,-30,-30,-30,-30,-50]};
const PHASE=[0,0,1,1,2,4,0];
function evaluate(g){
  const b=g.b;let score=0,phase=0;const pawns=[[],[]],rooks=[],bishops=[0,0],passed=[];
  for(let f=0;f<8;f++){pawns[0][f]=[];pawns[1][f]=[]}
  for(let s=0;s<120;s++){
    if(s&136){s+=7;continue}const p=b[s];if(!p)continue;const t=p&7,c=p>>3,r=s>>4,f=s&7,sg=c?-1:1;
    phase+=PHASE[t];
    if(t!==K)score+=sg*(VAL[t]+PST[t][(c?7-r:r)*8+f]);
    if(t===P)pawns[c][f].push(r);else if(t===R)rooks.push([c,f]);else if(t===B)bishops[c]++;
  }
  const m=Math.min(24,phase)/24;
  for(let c=0;c<2;c++){
    const sg=c?-1:1,ks=g.kings[c],idx=(c?7-(ks>>4):ks>>4)*8+(ks&7);
    score+=sg*(PST[6][idx]*m+PST[7][idx]*(1-m));
    if(bishops[c]>1)score+=sg*35;
    const d=c?16:-16;
    for(const x of[-1,0,1]){const s=ks+d+x;if(!(s&136)&&b[s]===(P|(c*8)))score+=sg*10*m}
    for(let f=0;f<8;f++){
      const col=pawns[c][f];if(!col.length)continue;
      if(col.length>1)score-=sg*14*(col.length-1);
      if(!(f>0&&pawns[c][f-1].length)&&!(f<7&&pawns[c][f+1].length))score-=sg*12*col.length;
      for(const r of col){
        let ok=true;
        for(let x=Math.max(0,f-1);x<=Math.min(7,f+1);x++)if(pawns[1-c][x].some(er=>c?er>r:er<r))ok=false;
        if(ok){const adv=c?r-1:6-r;score+=sg*(8+adv*adv*(3+4*(1-m)))}
      }
    }
  }
  for(const[c,f]of rooks)if(!pawns[c][f].length)score+=(c?-1:1)*(pawns[1-c][f].length?12:24);
  score=Math.round(score);
  return (g.turn?-score:score)+8;
}

/* ---------- поиск ---------- */
const MATE=30000;
function search(g,opts={}){
  const deadline=Date.now()+(opts.time||1000),maxDepth=opts.depth||40;
  const tt=new Map(),killers=[],hist={};let nodes=0,stop=false,canStop=false;
  const code=m=>m.f*16384+m.t*8+m.pr;
  const order=(list,best,ply)=>{for(const m of list){const c=code(m);
    m.s=c===best?1e9:m.c?1e7+VAL[m.c]*10-VAL[m.p]/10:m.pr?9e6+m.pr:(killers[ply]&&killers[ply].includes(c))?8e6:(hist[c]||0)}
    return list.sort((a,b)=>b.s-a.s)};
  const tick=()=>{if((++nodes&1023)===0&&canStop&&Date.now()>deadline)stop=true};
  function quiet(a,b,ply){
    tick();if(stop)return 0;
    const check=g.inCheck();
    if(ply>60)return evaluate(g);
    let best=-MATE+ply;
    if(!check){const e=evaluate(g);if(e>=b)return e;best=e;if(e>a)a=e}
    let legal=0;
    for(const m of order(g.pseudo(!check),0,ply)){
      if(!check&&!m.pr&&best+VAL[m.c]+200<a)continue;
      g.make(m);if(!g.legalMade()){g.unmake();continue}
      legal++;const s=-quiet(-b,-a,ply+1);g.unmake();
      if(stop)return 0;
      if(s>best){best=s;if(s>a){a=s;if(a>=b)break}}
    }
    return check&&!legal?-MATE+ply:best;
  }
  function ab(depth,a,b,ply,canNull){
    tick();if(stop)return 0;
    if(g.half>=100||g.repetitions()>1||g.insufficient())return 0;
    const check=g.inCheck();
    if(check&&ply<30)depth++;
    if(depth<=0)return quiet(a,b,ply);
    const k=g.key(),e=tt.get(k);
    if(e&&e.d>=depth){
      let s=e.s;if(s>MATE-500)s-=ply;else if(s<-MATE+500)s+=ply;
      if(e.f===0||(e.f===1&&s>=b)||(e.f===2&&s<=a))return s;
    }
    if(canNull&&!check&&depth>=3&&b<MATE-500&&g.pseudo(false).some(m=>m.p!==P&&m.p!==K)&&evaluate(g)>=b){
      const ep=g.ep,h1=g.h1,h2=g.h2,half=g.half;
      g.turn^=8;g.ep=-1;g.half=0;g.hash();
      const s=-ab(depth-3,-b,-b+1,ply+1,false);
      g.turn^=8;g.ep=ep;g.half=half;g.h1=h1;g.h2=h2;
      if(stop)return 0;if(s>=b)return b;
    }
    const a0=a;let best=-Infinity,bm=0,n=0;
    for(const m of order(g.pseudo(false),e?e.m:0,ply)){
      g.make(m);if(!g.legalMade()){g.unmake();continue}
      let s;
      if(n===0)s=-ab(depth-1,-b,-a,ply+1,true);
      else{
        const red=(depth>=3&&n>=4&&!m.c&&!m.pr&&!check&&!g.inCheck())?1:0;
        s=-ab(depth-1-red,-a-1,-a,ply+1,true);
        if(s>a&&(red||s<b))s=-ab(depth-1,-b,-a,ply+1,true);
      }
      g.unmake();n++;if(stop)return 0;
      if(s>best){best=s;bm=code(m)}
      if(s>a)a=s;
      if(a>=b){if(!m.c){(killers[ply]=killers[ply]||[]).unshift(code(m));killers[ply].length=Math.min(2,killers[ply].length);hist[code(m)]=(hist[code(m)]||0)+depth*depth}break}
    }
    if(!n)return check?-MATE+ply:0;
    let st=best;if(st>MATE-500)st+=ply;else if(st<-MATE+500)st-=ply;
    if(tt.size>400000)tt.clear();
    tt.set(k,{d:depth,s:st,m:bm,f:best>=b?1:best<=a0?2:0});
    return best;
  }
  let root=g.moves();
  if(opts.exclude)root=root.filter(m=>g.uci(m)!==opts.exclude);
  if(!root.length)return {best:null,score:g.inCheck()?-MATE:0,depth:0,pv:[],legal:0};
  let result={best:root[0],score:evaluate(g),depth:0};
  order(root,0,0);
  for(let d=1;d<=maxDepth&&!stop;d++){
    let a=-Infinity,bm=null;
    for(const m of root){
      g.make(m);
      let s;
      if(!bm)s=-ab(d-1,-Infinity,Infinity,1,true);
      else{s=-ab(d-1,-a-1,-a,1,true);if(s>a&&!stop)s=-ab(d-1,-Infinity,-a,1,true)}
      g.unmake();if(stop)break;
      if(s>a){a=s;bm=m}
    }
    if(bm&&!stop){result={best:bm,score:a,depth:d};root.splice(root.indexOf(bm),1);root.unshift(bm)}
    canStop=true;
    if(Math.abs(result.score)>MATE-500&&d>=MATE-Math.abs(result.score))break;
    if(Date.now()>deadline)break;
  }
  const pv=[];let n=0,m=result.best;
  while(m&&n<8){pv.push(g.san(m));g.make(m);n++;const e=tt.get(g.key());m=e?g.moves().find(x=>code(x)===e.m):null;if(g.repetitions()>1)break}
  while(n--)g.unmake();
  return {best:g.uci(result.best),score:result.score,depth:result.depth,pv,legal:root.length};
}

/* уровни бота: чем ниже, тем больше случайности */
const LEVELS=[
 {name:'Новичок',depth:1,noise:350,blunder:.35},
 {name:'Ученик',depth:1,noise:180,blunder:.2},
 {name:'Любитель',depth:2,noise:110,blunder:.1},
 {name:'Клубный',depth:2,noise:50,blunder:.04},
 {name:'Сильный',depth:3,time:700},
 {name:'Эксперт',depth:5,time:1500},
 {name:'Мастер',time:2500},
 {name:'Максимум',time:5000}];
function botMove(g,level){
  const L=LEVELS[level-1];
  if(!L.noise)return search(g,{time:L.time,depth:L.depth}).best;
  const list=g.moves();if(!list.length)return null;
  if(Math.random()<L.blunder)return g.uci(list[Math.random()*list.length|0]);
  let best=null,bs=-Infinity;
  for(const m of list){
    g.make(m);let s;
    const st=g.status();
    if(st==='mate')s=MATE;else if(st)s=0;else{
      const r=search(g,{depth:L.depth-1||1,time:200});
      s=L.depth===1?-quickEval(g):-r.score}
    g.unmake();s+=Math.random()*L.noise;
    if(s>bs){bs=s;best=m}
  }
  return g.uci(best);
}
/* жадная оценка: учитывает только ближайшее взятие */
function quickEval(g){
  let v=evaluate(g),top=0;
  for(const m of g.pseudo(true)){if(m.c){g.make(m);if(g.legalMade())top=Math.max(top,VAL[m.c]-(g.attacked(m.t,g.turn)?VAL[m.p]:0));g.unmake()}}
  return v+top;
}
/* есть ли форсированный мат не более чем в n ходов */
function mateIn(g,n){
  for(const m of g.moves()){g.make(m);const ok=mated(g,n);g.unmake();if(ok)return g.uci(m)}
  return null;
}
function mated(g,n){
  const r=g.moves();
  if(!r.length)return g.inCheck();
  if(n<=1)return false;
  for(const m of r){g.make(m);const ok=mateIn(g,n-1);g.unmake();if(!ok)return false}
  return true;
}
return {Chess,search,botMove,evaluate,mateIn,mated,LEVELS,MATE,VAL,START,sqName,sqIdx};
})();
