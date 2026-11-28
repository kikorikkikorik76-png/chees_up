/* расчёты движка в отдельном потоке */
importScripts('engine.js?v=4');
onmessage=e=>{
 const m=e.data,g=new Engine.Chess(m.fen);
 for(const u of m.moves)g.make(g.findUci(u));
 postMessage({id:m.id,r:m.cmd==='bot'?{best:Engine.botMove(g,m.level)}:Engine.search(g,m.opts)});
};
