import {createRequire} from 'node:module';import {writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
const require=createRequire(process.env.RUNTIME_PACKAGE_ROOT+'/package.json');const {createCanvas}=require('@napi-rs/canvas');
globalThis.document={createElement:()=>createCanvas(1,1)};
const {makeFigures}=await import('../src/figures.js');
const fig=makeFigures();const arg=process.argv[2]||'all';
const hash=a=>createHash('sha256').update(a.toBuffer('image/png')).digest('hex');
const t0=performance.now();
// edge check + uniqueness over every frame
const all=fig.names();const bad=[];const seen=new Map();let slowest=0;
for(const n of all){const t=performance.now();const a=fig.get(n);slowest=Math.max(slowest,performance.now()-t);const d=a.getContext('2d').getImageData(0,0,a.width,a.height).data;let T=0,B=0,Lf=0,R=0;for(let x=0;x<a.width;x++){T+=d[x*4+3];B+=d[((a.height-1)*a.width+x)*4+3];}for(let y=0;y<a.height;y++){Lf+=d[(y*a.width)*4+3];R+=d[(y*a.width+a.width-1)*4+3];}if(T+B+Lf+R)bad.push(n+':'+(T?'T':'')+(B?'B':'')+(Lf?'L':'')+(R?'R':''));}
const total=performance.now()-t0;
const unique=(prefix,count)=>new Set(Array.from({length:count},(_,i)=>hash(fig.get(prefix+'-'+i)))).size;
const weak=[];for(const n of all){const m=/^(.*-(walk|attack))-0$/.exec(n);if(m){const u=unique(m[1],8);if(u<8)weak.push(m[1]+':'+u);}}
if(arg==='zoom'){const list=process.argv[3].split(','),z=Number(process.argv[4]||1.15),sh=createCanvas(Math.ceil(list.length*256*z),Math.ceil(280*z)),g=sh.getContext('2d');g.fillStyle='#2e4238';g.fillRect(0,0,sh.width,sh.height);list.forEach((n,i)=>g.drawImage(fig.get(n),i*256*z,0,256*z,280*z));await writeFile('qa/zoom.png',sh.toBuffer('image/png'));process.exit(0);}
const S=1;
const rows=arg==='all'?[['hero-sword-walk',8],['hero-sword-attack',8],['hero-bow-attack',8],['hero-greatsword-attack',8],['hero-axe-attack',8],['hero-spear-attack',8]]:[[arg,8]];
const kinds=['hero-sword','hero-bow','archer','bandit','skeleton','knight','mage','brute','assassin','cultist','princess','boss0','boss1','boss2','boss3','boss4','boss5'];
const cw=200,ch=220;let cols=8,rowsList=[];
if(arg==='all'){for(const[r,n]of rows)rowsList.push(Array.from({length:n},(_,i)=>r+'-'+i));
 for(const k of kinds)rowsList.push([k+'-idle-0',k+'-walk-2',k+'-attack-1',k+'-attack-3',k+'-attack-4',k+'-attack-6',k+'-hit-0',k+'-block-0'].filter(n=>fig.get(n)));
}else rowsList.push(...[arg+'-walk',arg+'-attack'].map(r=>Array.from({length:8},(_,i)=>r+'-'+i)).filter(r=>fig.get(r[0])));
const sheet=createCanvas(cols*cw,rowsList.length*ch),c=sheet.getContext('2d');c.fillStyle='#2e4238';c.fillRect(0,0,sheet.width,sheet.height);
rowsList.forEach((row,y)=>row.forEach((n,x)=>{const a=fig.get(n);c.drawImage(a,40,70,176,190,x*cw+10,y*ch+14,176*1.05,190*1.05);c.fillStyle='#ecdfb8';c.font='11px sans-serif';c.fillText(n,x*cw+4,y*ch+12);}));
await mkdir('qa',{recursive:true});await writeFile(arg==='all'?'qa/figures.png':'qa/figures-'+arg+'.png',sheet.toBuffer('image/png'));
console.log(JSON.stringify({frames:all.length,renderMs:Math.round(total),slowestMs:Math.round(slowest*10)/10,touchingEdge:bad,duplicateOrStatic:weak}));
if(bad.length||weak.length)process.exitCode=1;
