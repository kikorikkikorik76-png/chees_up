/* CHEES.UP — рисунки: тренер Филин и значки наград (всё нарисовано для этого приложения) */
const Art=(()=>{
 /* перо-«язычок»: из точки (x,y) под углом a */
 const feather=(x,y,len,w,a,fill)=>`<path transform="translate(${x} ${y}) rotate(${a})" d="M${-w} 0C${-w} ${len*.55} ${-w*.35} ${len*.86} 0 ${len}C${w*.35} ${len*.86} ${w} ${len*.55} ${w} 0Z" fill="${fill}"/>`;
 const row=(list,len,w,fill)=>list.map(([x,y,a])=>feather(x,y,len,w,a,fill)).join('');
 const OUTFITS={
  scarf:{n:'Бордовый шарф',a:'#9c3b34',b:'#7a2a27',c:'#e8c069'},
  forest:{n:'Лесной шарф',a:'#2f6b52',b:'#22503d',c:'#e6dcc0'},
  night:{n:'Ночной шарф',a:'#34477e',b:'#25345f',c:'#f0c64f'},
  royal:{n:'Мантия чемпиона',a:'#6a3a86',b:'#4c2863',c:'#ffd45c'}
 };
 function owl(mood='calm',outfit='scarf'){
  const o=OUTFITS[outfit]||OUTFITS.scarf;
  const happy=mood==='happy',shock=mood==='shock',think=mood==='think',sad=mood==='sad';
  /* глаз: янтарная радужка, зрачок, блик, веко по настроению */
  const eye=(cx,side)=>{
   const px=cx+(think?3.5:0)-side*(shock?0:1),py=78+(think?-4:sad?2.5:0),R=shock?15.5:14.5;
   let s=`<circle cx="${cx}" cy="78" r="${R+2.6}" fill="#2a170d"/><circle cx="${cx}" cy="78" r="${R}" fill="url(#owI)"/><circle cx="${px}" cy="${py}" r="${shock?4.6:8}" fill="#140b06"/><circle cx="${px+3}" cy="${py-3.4}" r="${shock?1.8:2.8}" fill="#fff"/><circle cx="${px-3}" cy="${py+3}" r="1.2" fill="#fff" opacity=".7"/>`;
   if(happy)s=`<circle cx="${cx}" cy="78" r="17" fill="#c9955c"/><path d="M${cx-13} 82Q${cx} 64 ${cx+13} 82" fill="none" stroke="#2a170d" stroke-width="5.5" stroke-linecap="round"/>`;
   if(sad)s+=`<path d="M${cx-side*19} 70Q${cx-side*2} 66 ${cx+side*19} 80L${cx+side*19} 57L${cx-side*19} 57Z" fill="#9a6335"/><path d="M${cx-side*17} 70.5Q${cx-side*1} 68 ${cx+side*16} 78.5" fill="none" stroke="#2a170d" stroke-width="2.6" stroke-linecap="round"/>`;
   if(think&&side<0)s+=`<path d="M${cx-18} 74Q${cx} 66 ${cx+18} 72L${cx+18} 58L${cx-18} 58Z" fill="#9a6335"/><path d="M${cx-16} 73.5Q${cx} 68 ${cx+16} 72" fill="none" stroke="#2a170d" stroke-width="2.6" stroke-linecap="round"/>`;
   return s;
  };
  /* брови-перья задают выражение */
  const by=shock?-7:happy?-3:0,tilt=sad?-13:think?0:shock?-4:9;
  const brow=(side)=>{const t=think&&side>0?-14:tilt,y=by+(think&&side>0?-5:0);
   return `<g transform="translate(0 ${y}) rotate(${side<0?t:-t} ${80+side*27} 57)"><path d="M${80+side*5} 66C${80+side*13} 55 ${80+side*30} 50 ${80+side*52} 40C${80+side*47} 50 ${80+side*46} 54 ${80+side*50} 55C${80+side*38} 58 ${80+side*22} 61 ${80+side*5} 66Z" fill="#3d2414"/><path d="M${80+side*9} 62C${80+side*19} 55 ${80+side*31} 52 ${80+side*42} 48" fill="none" stroke="#e8cfa4" stroke-width="2.2" stroke-linecap="round" opacity=".75"/></g>`};
  const beak=shock||happy
   ?`<path d="M72 106Q80 120 88 106Q80 111 72 106Z" fill="#7b2f26"/><path d="M73 108Q80 125 87 108Q80 116 73 108Z" fill="#6d5237"/><path d="M80 82C88 87 91 96 87 104C84 108 82 109 80 113C78 109 76 108 73 104C69 96 72 87 80 82Z" fill="url(#owB)" stroke="#2a170d" stroke-width="1.8"/>`
   :`<path d="M80 83C89 89 91 99 86 106C83 110 82 112 80 118C78 112 77 110 74 106C69 99 71 89 80 83Z" fill="url(#owB)" stroke="#2a170d" stroke-width="1.8"/><path d="M75.5 105Q80 108 84.5 105" fill="none" stroke="#2a170d" stroke-width="1.3"/>`;
  return `<svg class="owl m-${mood}" viewBox="0 0 160 180" aria-hidden="true"><defs>
<linearGradient id="owBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8713f"/><stop offset="1" stop-color="#5a3720"/></linearGradient>
<radialGradient id="owI" cx=".5" cy=".62" r=".65"><stop offset="0" stop-color="#ffd357"/><stop offset=".6" stop-color="#f59a1d"/><stop offset="1" stop-color="#b9560c"/></radialGradient>
<linearGradient id="owB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d7759"/><stop offset=".5" stop-color="#57452f"/><stop offset="1" stop-color="#2f2418"/></linearGradient></defs>
<ellipse cx="80" cy="172" rx="48" ry="6" fill="#000" opacity=".25"/>
<path d="M80 36C61 36 50 31 38 22C30 16 22 9 14 5C17 22 20 33 25 43C19 54 18 68 22 83C15 99 17 125 29 143C42 162 61 168 80 168C99 168 118 162 131 143C143 125 145 99 138 83C142 68 141 54 135 43C140 33 143 22 146 5C138 9 130 16 122 22C110 31 99 36 80 36Z" fill="url(#owBody)" stroke="#2a170d" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M18 9C27 20 35 28 49 36L34 44C27 34 22 22 18 9ZM142 9C133 20 125 28 111 36L126 44C133 34 138 22 142 9Z" fill="#3d2414"/>
<path d="M24 18C30 27 36 32 42 36M136 18C130 27 124 32 118 36" stroke="#d9a86b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M80 105C57 105 44 122 45 138C47 156 62 165 80 165C98 165 113 156 115 138C116 122 103 105 80 105Z" fill="#e6c795"/>
<g stroke="#8a5a33" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M62 132l5 6 5-6M88 132l5 6 5-6M75 141l5 6 5-6M62 150l5 6 5-6M88 150l5 6 5-6M52 141l4 5 4-5M100 141l4 5 4-5"/></g>
<g stroke="#2a170d" stroke-width="1.4">${row([[27,100,14],[31,113,6],[37,124,-3]],38,9,'#6b4124')}${row([[133,100,-14],[129,113,-6],[123,124,3]],38,9,'#6b4124')}${row([[27,92,22],[33,100,10],[41,108,0]],27,8,'#8d5a31')}${row([[133,92,-22],[127,100,-10],[119,108,0]],27,8,'#8d5a31')}</g>
<g stroke="#d9a86b" stroke-width="1.5" stroke-linecap="round" opacity=".8"><path d="M24 108l-3 18M32 121l-1 19M136 108l3 18M128 121l1 19"/></g>
<path d="M80 58C70 47 47 47 36 60C25 73 28 96 43 107C54 115 70 114 80 104C90 114 106 115 117 107C132 96 135 73 124 60C113 47 90 47 80 58Z" fill="#c9955c" stroke="#4a2c17" stroke-width="2.4"/>
<path d="M80 63C71 55 54 55 45 65C37 75 39 92 50 101C59 108 72 106 80 97C88 106 101 108 110 101C121 92 123 75 115 65C106 55 89 55 80 63Z" fill="#ecd6ac"/>
<g stroke="#b98a55" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".75"><path d="M40 90l8-3M42 98l8-6M50 105l5-7M120 90l-8-3M118 98l-8-6M110 105l-5-7"/></g>
<path d="M80 38C76 46 75 53 77 60L80 57L83 60C85 53 84 46 80 38Z" fill="#e8cfa4"/>
<g stroke="#4a2c17" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"><path d="M66 41l3 8M94 41l-3 8M56 44l4 6M104 44l-4 6"/></g>
${eye(57,-1)}${eye(103,1)}${brow(-1)}${brow(1)}${beak}
<path d="M37 114C52 126 66 130 80 130C94 130 108 126 123 114L127 126C113 139 97 144 80 144C63 144 47 139 33 126Z" fill="${o.a}" stroke="#2a170d" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M100 137L113 134L119 165L111 162L105 168Z" fill="${o.b}" stroke="#2a170d" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M40 123C54 133 67 137 80 137C93 137 106 133 120 123" fill="none" stroke="${o.c}" stroke-width="2.2" stroke-dasharray="1 6" stroke-linecap="round"/>
<circle cx="105" cy="136" r="7" fill="${o.c}" stroke="#2a170d" stroke-width="1.8"/><path d="M105 131.6l1.3 2.9 3.1.3-2.3 2.1.7 3.1-2.8-1.6-2.8 1.6.7-3.1-2.3-2.1 3.1-.3Z" fill="${o.b}"/>
<g fill="#e0a33c" stroke="#2a170d" stroke-width="1.6" stroke-linejoin="round"><path d="M55 163q1-7 8-6q4-5 9 0q7 0 6 7l-5 7-3-6-3 7-3-7-5 6Z"/><path d="M82 163q1-7 8-6q4-5 9 0q7 0 6 7l-5 7-3-6-3 7-3-7-5 6Z"/></g>
</svg>`;
 }
 /* маленькие значки интерфейса: заливные, в одном стиле */
 const ICO={
  flame:'<path fill="#e8652b" d="M25 3C28 13 40 18 40 30C40 40 33 46 24 46S8 40 8 30C8 23 12 19 15 15C15 20 17 23 20 24C18 15 20 9 25 3Z"/><path fill="#ffc94d" d="M25 22C27 28 33 30 33 36C33 41 29 44 24 44S15 41 15 36C15 32 18 29 20 27C20 31 22 32 23 33C22 28 23 25 25 22Z"/>',
  coin:'<circle cx="24" cy="24" r="20" fill="#d9a12e"/><circle cx="24" cy="24" r="15" fill="#f6cd5a"/><path fill="#a86f14" d="M24 13L33 22H28V25H20V22H15ZM19 28H29V31H27L31 36H17L21 31H19Z"/>',
  gift:'<path fill="#c8503a" d="M7 20H41V43Q41 45 39 45H9Q7 45 7 43Z"/><path fill="#e0674c" d="M5 13H43V22H5Z"/><path fill="#f6cd5a" d="M21 13H27V45H21Z"/><path fill="none" stroke="#f6cd5a" stroke-width="4" d="M24 13C19 3 9 5 14 11C17 14 24 13 24 13S31 14 34 11C39 5 29 3 24 13Z"/>',
  trophy:'<path fill="#f6cd5a" d="M13 5H35V19C35 27 30 31 24 31S13 27 13 19Z"/><path fill="none" stroke="#d9a12e" stroke-width="4" d="M13 9H6C6 18 9 21 15 22M35 9H42C42 18 39 21 33 22"/><path fill="#d9a12e" d="M21 30H27L29 38H19ZM13 38H35V44H13Z"/>',
  shield:'<path fill="#4a8fd0" d="M24 3L42 10V22C42 34 34 42 24 46C14 42 6 34 6 22V10Z"/><path fill="#9fd0f5" d="M24 10L35 14V23C35 30 31 36 24 39Z"/>',
  bolt:'<path fill="#f6cd5a" stroke="#d9a12e" stroke-width="2" stroke-linejoin="round" d="M28 3L9 27H21L18 45L39 19H26Z"/>',
  star:'<path fill="#f6cd5a" stroke="#d9a12e" stroke-width="2" stroke-linejoin="round" d="M24 4L30 17L44 19L34 29L36 43L24 36L12 43L14 29L4 19L18 17Z"/>',
  lock:'<rect x="9" y="21" width="30" height="23" rx="4" fill="#8d8272"/><path d="M15 22V15C15 3 33 3 33 15V22" fill="none" stroke="#8d8272" stroke-width="5"/><circle cx="24" cy="32" r="4" fill="#38312a"/>',
  check:'<circle cx="24" cy="24" r="20" fill="#3fa36b"/><path d="M13 25L21 33L36 17" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
  target:'<circle cx="24" cy="24" r="20" fill="#c8503a"/><circle cx="24" cy="24" r="13" fill="#f2ebdf"/><circle cx="24" cy="24" r="6" fill="#c8503a"/>',
  gem:'<path fill="#14b8b0" d="M12 7H36L45 18L24 43L3 18Z"/><path fill="#7ee6df" d="M12 7L18 18H3ZM18 18H30L24 43ZM18 18L24 7L30 18Z"/>',
  clock:'<circle cx="24" cy="24" r="20" fill="#4a8fd0"/><circle cx="24" cy="24" r="15" fill="#f2ebdf"/><path d="M24 14V24L31 29" fill="none" stroke="#25201b" stroke-width="4" stroke-linecap="round"/>',
  crown:'<path fill="#f6cd5a" stroke="#d9a12e" stroke-width="2" stroke-linejoin="round" d="M6 13L16 23L24 7L32 23L42 13L38 36H10ZM10 39H38V44H10Z"/>',
  puzzle:'<path fill="#7c68c4" d="M7 13H18C14 3 34 3 30 13H41V24C31 20 31 40 41 36V43H7Z"/>',
  sword:'<path fill="#cfd6dd" d="M38 4H44V10L22 32L16 26Z"/><path fill="none" stroke="#a86f14" stroke-width="5" stroke-linecap="round" d="M11 25L23 37M15 33L7 41"/>'
 };
 const ico=(n,c='')=>`<svg class="i ${c}" viewBox="0 0 48 48" aria-hidden="true">${ICO[n]||ICO.star}</svg>`;
 return{owl,ico,OUTFITS};
})();
