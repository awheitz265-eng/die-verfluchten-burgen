import {createRequire} from 'node:module';import {writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
const require=createRequire(process.env.RUNTIME_PACKAGE_ROOT+'/package.json');const {createCanvas}=require('@napi-rs/canvas');
globalThis.document={createElement:()=>createCanvas(1,1)};
const {makeArt}=await import('../src/art.js'),{makeForestArt}=await import('../src/forest-art.js');
const art=makeArt(),forest=makeForestArt(),sheet=createCanvas(1792,1200),c=sheet.getContext('2d');c.fillStyle='#273a35';c.fillRect(0,0,1792,1200);
const rows=['hero-sword-walk','hero-sword-attack','hero-bow-attack','knight-walk','boss0-attack'];
rows.forEach((r,y)=>{for(let f=0;f<8;f++)c.drawImage(art[r+'-'+f],f*224,y*240);c.fillStyle='#ecdfb8';c.font='18px sans-serif';c.fillText(r,8,y*240+23);});
await mkdir('qa',{recursive:true});await writeFile('qa/animation-frames.png',sheet.toBuffer('image/png'));
const hash=a=>createHash('sha256').update(a.toBuffer('image/png')).digest('hex');
for(const r of rows){const unique=new Set(Array.from({length:8},(_,f)=>hash(art[r+'-'+f])));if(unique.size<(r.endsWith('walk')?8:6))throw Error(r+' duplicate frames');}
let clipped=[];for(const[n,a]of Object.entries(art)){if(!/-attack-|-walk-/.test(n))continue;const data=a.getContext('2d').getImageData(0,0,a.width,a.height).data;let edge=0;for(let x=0;x<a.width;x++)edge+=data[x*4+3]+data[((a.height-1)*a.width+x)*4+3];for(let y=0;y<a.height;y++)edge+=data[(y*a.width)*4+3]+data[(y*a.width+a.width-1)*4+3];if(edge)clipped.push(n);}
console.log(JSON.stringify({animationFrames:Object.keys(art).filter(n=>/-walk-|-idle-|-attack-|-hit-|-block-/.test(n)).length,forestAssets:Object.keys(forest).length,clippedFrames:clipped}));

