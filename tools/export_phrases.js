// node tools/export_phrases.js — выгружает все кусочки реплик в voice/phrases.json
const fs=require('fs'),path=require('path');
const V=require('../js/voice.js');
const out={};for(const id in V.P)out[id]=V.P[id][1];
fs.writeFileSync(path.join(__dirname,'../voice/phrases.json'),JSON.stringify(out,null,1)+'\n');
console.log(Object.keys(out).length+' фраз');
