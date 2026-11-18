import {selectBowTarget,bowDirection} from './archery.js';
import {makeArt} from './art.js';
import {makeForestArt} from './forest-art.js';
import {makeFigures} from './figures.js';
import {heroFrame,enemyFrame,deathFrame} from './animation.js';
import {generateWorld,BIOMES} from './world.js';
import {RARITIES} from './items.js';
const chapterPaint={
 6:{ground:'#4e6566',ground2:'#667c72',fog:'#a4c3c5',water:{deep:'#264d64',mid:'#3d7684',shore:'#839b96',shine:'#b7dde0'},weather:{color:'#c5eceb',vx:29,vy:16,size:1.1,count:35}},
 7:{ground:'#50514b',ground2:'#635f4b',fog:'#bfb096',weather:{color:'#e9c88d',vx:3,vy:6,size:1.5,count:24}},
 8:{ground:'#676878',ground2:'#9290a0',fog:'#c5bed9',water:{deep:'#53526f',mid:'#858398',shore:'#b9b6c8',shine:'#eceafa'}},
 9:{ground:'#48483e',ground2:'#6b6653',fog:'#b9bb9b',water:{deep:'#344b48',mid:'#546d60',shore:'#81795a',shine:'#c0c9a0'},weather:{color:'#abb7a2',vx:11,vy:12,size:1.4,count:29}}
};
const paintedBiomes={};
function sceneBiome(w){
 const base=BIOMES[w.biome??(w.chapter-1)%6];
 if(!w.campaign||!chapterPaint[w.chapter])return base;
 return paintedBiomes[w.chapter]??=( {...base,...chapterPaint[w.chapter],accent:chapterSpec(w.chapter).color} );
}
const TILE_X=42,TILE_Y=21;
// Sprite size on screen (px at zoom 1). Figures are 170 units tall on a 200-unit scale.
const RD_SIZE={hero:140,bandit:130,archer:130,skeleton:130,knight:140,mage:132,brute:165,assassin:124,cultist:135,princess:135,boss0:188,boss1:178,boss2:210,boss3:182,boss4:190,boss5:222,boss6:203,boss7:217,boss8:178,boss9:218};
const RD_BOSS_COLOR=['#e0a070','#a8e8a0','#ff9a50','#9fe0ff','#c590ff','#ff7a3a','#8cdad9','#e4bb73','#cbc9ff','#87b9ab'];
const RD_HEAD=112,RD_HAND=[24,80];
const rdRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const rdMix=(a,b,t)=>{const A=rdRgb(a),B=rdRgb(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
const rdRgba=(h,a)=>{const [r,g,b]=rdRgb(h);return `rgba(${r},${g},${b},${a})`;};
const RD_BANNER=['#7a2a30','#2d5a3a','#8a4a1e','#2a4a7a','#4a2a6a','#5a1a1a'];
const RD_PROP_H={crate:96,weaponrack:142,brazier:118,statue:150,bookshelf:140,barrel:78,column:150};
const RD_TALL=['statue','bookshelf','weaponrack','column'];
const rdRand=n=>{let s=n>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};
import {chapterSpec} from './campaign.js';
export class Renderer{
 constructor(canvas,game){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.game=game;this.art={...makeArt(),...makeForestArt()};this.mobile=!!window.matchMedia?.('(any-pointer: coarse)').matches;this.figures=makeFigures(this.mobile);this.sceneryCache=new WeakMap();this.actorPositions=new WeakMap();this.forestCache=new WeakMap();this.propCache=new WeakMap();this.wallCache={};this.floorCache={};this.particles=[];this.lights=[];this.dt=.016;this.lastStep=0;this.blobs={};this.shades={};this.camera={x:0,y:0};this.zoom=1;this.preview=generateWorld(728194,1);this.lastWorld=null;this.shake=0;this.resize();window.addEventListener('resize',()=>this.resize());window.visualViewport?.addEventListener('resize',()=>this.resize());if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>this.resize()).observe(canvas);canvas.addEventListener?.('contextlost',e=>{e.preventDefault();this.contextLost=true;});canvas.addEventListener?.('contextrestored',()=>{this.contextLost=false;this.groundCache=null;this.resize();});}
 resize(){
  const width=Math.max(1,this.canvas.clientWidth||innerWidth),height=Math.max(1,this.canvas.clientHeight||innerHeight);
  const dpr=Math.min(globalThis.devicePixelRatio||1,this.mobile?1.25:2,this.mobile?Math.sqrt(1100000/(width*height)):Infinity);
  const bw=Math.round(width*dpr),bh=Math.round(height*dpr);
  if(this.width===width&&this.height===height&&this.canvas.width===bw&&this.canvas.height===bh)return;
  this.width=width;this.height=height;this.dpr=dpr;
  this.canvas.width=bw;this.canvas.height=bh;
  this.zoom=Math.max(.65,Math.min(1.15,width/1450));
  this.groundCache=null;this.lastWorld=null;
 }
 project(x,y){return{x:(x-y)*TILE_X*this.zoom+this.width/2-this.camera.x,y:(x+y)*TILE_Y*this.zoom+this.height/2-this.camera.y};}
 pointerAim(pointer){
  const game=this.game,p=game.player;
  if(game.stats.kind==='bow'){
   const e=selectBowTarget(game,enemy=>{
    const feet=this.project(enemy.x,enemy.y),height=(RD_SIZE[enemy.type]||104)*this.zoom;
    const x=(pointer.x-feet.x)/Math.max(11,height*.20);
    const y=(pointer.y-(feet.y-height*.43))/Math.max(18,height*.49);
    const d=x*x+y*y;return d<=1?d:Infinity;
   });
   if(e)return bowDirection(game.world,p,e);
  }
  const ground=this.unproject(pointer.x,pointer.y+26*this.zoom);
  return {x:ground.x-p.x,y:ground.y-p.y};
 }
 unproject(x,y){const a=(x-this.width/2+this.camera.x)/(TILE_X*this.zoom),b=(y-this.height/2+this.camera.y)/(TILE_Y*this.zoom);return{x:(a+b)/2,y:(b-a)/2};}
 diamond(x,y,rx,ry,color){const c=this.ctx;c.fillStyle=color;c.beginPath();c.moveTo(x,y-ry);c.lineTo(x+rx,y);c.lineTo(x,y+ry);c.lineTo(x-rx,y);c.closePath();c.fill();}
 // Soft elliptical brush: overlapping brushes merge into smooth, organic shapes (paths, rivers, lakes).
 blob(color){if(this.blobs[color])return this.blobs[color];const k=document.createElement('canvas');k.width=192;k.height=96;const g=k.getContext('2d');g.translate(96,48);g.scale(1,.5);const q=g.createRadialGradient(0,0,0,0,0,96);q.addColorStop(0,rdRgba(color,1));q.addColorStop(.74,rdRgba(color,1));q.addColorStop(.9,rdRgba(color,.5));q.addColorStop(1,rdRgba(color,0));g.fillStyle=q;g.beginPath();g.arc(0,0,96,0,Math.PI*2);g.fill();return this.blobs[color]=k;}
 brush(color,x,y,rx,alpha=1){const c=this.ctx,a=this.blob(color);if(alpha!==1)c.globalAlpha=alpha;c.drawImage(a,x-rx,y-rx*.5,rx*2,rx);if(alpha!==1)c.globalAlpha=1;}
 shadeList(index,biome){if(this.shades[index])return this.shades[index];return this.shades[index]=Array.from({length:12},(_,i)=>rdMix(biome.ground,biome.ground2,i/11));}
 sprite(name,x,y,height,alpha=1,flip=false){const a=this.art[name];if(!a)return;const c=this.ctx,width=height*a.width/a.height;
  if(!flip){const previous=c.globalAlpha;if(alpha!==1)c.globalAlpha=alpha;c.drawImage(a,x-width/2,y-height,width,height);if(alpha!==1)c.globalAlpha=previous;return;}
  c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(-1,1);c.drawImage(a,-width/2,-height,width,height);c.restore();}
 // Soft contact shadow: a cached radial blob reads as a real shadow instead of a flat disc.
 shadowBlob(){if(this._shadow)return this._shadow;const k=document.createElement('canvas');k.width=128;k.height=64;const g=k.getContext('2d');g.translate(64,32);g.scale(1,.5);const q=g.createRadialGradient(0,0,0,0,0,64);q.addColorStop(0,'rgba(6,12,16,.62)');q.addColorStop(.45,'rgba(6,12,16,.38)');q.addColorStop(1,'rgba(6,12,16,0)');g.fillStyle=q;g.beginPath();g.arc(0,0,64,0,7);g.fill();return this._shadow=k;}
 // o.tilt leans the figure into its movement, o.rot tips it over (death), o.sx/o.sy squash on impact.
 actor(name,x,y,height,flip=false,roll=0,o={}){const a=this.art[name]||this.figures.get(name);if(!a)return;const c=this.ctx,k=height/200;c.save();if(o.alpha!==undefined)c.globalAlpha*=o.alpha;const sw=height*(o.rot?.5:.44);c.drawImage(this.shadowBlob(),x-sw/2,y-height*.06,sw,height*.12);c.translate(x,y);if(o.rot)c.rotate(o.rot);else if(o.tilt)c.rotate(o.tilt);c.scale((flip?-1:1)*(o.sx||1),o.sy||1);if(roll>0){c.translate(0,-height*.3);c.rotate((1-roll/.28)*Math.PI*2);c.scale(.82,.82);c.translate(0,height*.3);}c.drawImage(a,-128*k,-250*k,256*k,280*k);c.restore();}
 dust(x,y,n=1,col='#a99c84',power=1){if(this.particles.length>160)this.particles.splice(0,n);const R=Math.random;for(let i=0;i<n;i++)this.particles.push({x:x+(R()-.5)*.3,y:y+(R()-.5)*.3,vx:(R()-.5)*26*power,vy:-(6+R()*12)*power,life:.55+R()*.4,max:.95,r:(5+R()*6)*power,col});}
 drawParticles(dt){const c=this.ctx,z=this.zoom;c.save();for(const q of this.particles){q.life-=dt;if(q.life<=0)continue;q.ox=(q.ox||0)+q.vx*dt;q.oy=(q.oy||0)+q.vy*dt;q.vy*=.96;const s=this.project(q.x,q.y),f=1-q.life/q.max;c.globalAlpha=.32*(1-f);c.fillStyle=q.col;c.beginPath();c.ellipse(s.x+q.ox*z,s.y-4*z+q.oy*z,q.r*z*(1+f*1.6),q.r*z*(.6+f),0,0,7);c.fill();}c.restore();this.particles=this.particles.filter(q=>q.life>0);}
 woodland(w){if(this.forestCache.has(w))return this.forestCache.get(w);const list=[],B=sceneBiome(w);if(!w.inside)for(let y=2;y<w.h-2;y++)for(let x=2;x<w.w-2;x++){const n=(Math.imul(x+43,374761393)^Math.imul(y+91,668265263)^w.seed)>>>0,tile=w.grid[y][x];if(tile!==0||n%4!==0)continue;const xx=x+.2+(n%67)/100,yy=y+.2+((n>>>9)%67)/100;if(Math.hypot(xx-w.start.x,yy-w.start.y)<1.5||Math.hypot(xx-w.exit.x,yy-w.exit.y)<3)continue;const water=['river','bog'].includes(B.liquid)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>w.grid[y+dy][x+dx]===2);list.push({x:xx,y:yy,type:water?'reeds0':B.under[n%B.under.length],scale:.65+(n%40)/100,sort:xx+yy});}this.forestCache.set(w,list);return list;}
 foliage(name,x,y,h,alpha,phase){const a=this.art[name];if(!a)return;const c=this.ctx;c.save();c.globalAlpha=alpha;c.translate(x,y);c.transform(1,0,Math.sin(this.game.time*.9+phase)*.016,1,0,0);c.drawImage(a,-h*a.width/a.height/2,-h,h*a.width/a.height,h);c.restore();}
 // Terrain for the open world: flat ground first, then soft brushes for liquids and trails, then bridges.
 paintGround(w,B,bi,vis,t){
  const c=this.ctx,z=this.zoom,shades=this.shadeList(B.ground,B),W=B.water,P=B.path,at=(x,y)=>w.grid[y]?.[x];
  for(const v of vis){const n=(Math.sin(v.x*.31+w.seed%97)+Math.sin(v.y*.37+v.x*.11)+Math.sin((v.x+v.y)*.17)+3)/6;this.diamond(v.s.x,v.s.y,TILE_X*z+.7,TILE_Y*z+.5,shades[Math.max(0,Math.min(11,Math.floor(n*11+(v.hash%3)-1)))]);}
  for(const v of vis){if(v.tile!==0)continue;const {s,hash,x,y}=v,vv=hash%9;
   c.save();c.globalAlpha=.24;for(let k=0;k<(this.mobile?5:14);k++){const n=(Math.imul(hash+k*71,1664525)+1013904223)>>>0,ax=((n%100)/100-.5),ay=(((n>>>9)%100)/100-.5),xx=(ax-ay)*38*z,yy=(ax+ay)*18*z;c.fillStyle=k%3?B.light:rdMix(B.ground,'#0c1a12',.55);c.beginPath();c.ellipse(s.x+xx,s.y+yy,(1+n%4)*z,.65*z,0,0,7);c.fill();if(k%2===0){c.strokeStyle=c.fillStyle;c.lineWidth=.8*z;c.beginPath();c.moveTo(s.x+xx,s.y+yy);c.quadraticCurveTo(s.x+xx-2*z,s.y+yy-4*z,s.x+xx+(Math.sin(t+x+y)*1.5)*z,s.y+yy-6*z);c.stroke();}}c.restore();
   if(vv===5){c.fillStyle=rdRgba(B.light,.5);c.fillRect(s.x+8*z,s.y,2*z,2*z);c.fillRect(s.x-12*z,s.y+4*z,2*z,2*z);}}
  const jit=v=>({x:v.s.x+((v.hash%21)-10)*.7*z,y:v.s.y+(((v.hash>>>5)%11)-5)*.7*z,r:(.92+((v.hash>>>9)%25)/100)*z});
  // Liquids: shore, deep core, shimmering mid layer.
  for(const v of vis)if(v.tile===2){const j=jit(v);this.brush(W.shore,j.x,j.y,80*j.r,.7);}
  for(const v of vis)if(v.tile===2){const j=jit(v);this.brush(W.deep,j.x,j.y,66*j.r);}
  for(const v of vis)if(v.tile===2){const j=jit(v),sh=Math.sin(t*.9+v.x*.8+v.y*.6);this.brush(W.mid,j.x+sh*3*z,j.y,58*j.r,.26);}
  // Trails: trampled rim, packed core, bright centre.
  for(const v of vis)if(v.tile>=3){const j=jit(v);this.brush(P.rim,j.x,j.y,70*j.r,.4);}
  for(const v of vis)if(v.tile>=3){const j=jit(v);this.brush(P.mid,j.x,j.y,58*j.r);}
  for(const v of vis)if(v.tile>=3){const j=jit(v);this.brush(P.hi,j.x-4*z,j.y-1*z,46*j.r,.2);}
  for(const v of vis){if(v.tile<3)continue;const {s,hash}=v;c.save();for(let k=0;k<7;k++){const n=(Math.imul(hash+k*97,1664525)+1013904223)>>>0,ax=((n%100)/100-.5),ay=(((n>>>9)%100)/100-.5),xx=(ax-ay)*34*z,yy=(ax+ay)*16*z;c.globalAlpha=.55;c.fillStyle=k%2?P.hi:P.rim;c.beginPath();c.ellipse(s.x+xx,s.y+yy,(1+n%3)*z,.7*z,0,0,7);c.fill();}c.restore();}
  // Grass tufts where trails meet the meadow.
  for(const v of vis){if(v.tile!==3)continue;const {s,x,y,hash}=v;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy],i)=>{if(at(x+dx,y+dy)!==0)return;const mx=s.x+(dx-dy)*21*z,my=s.y+(dx+dy)*10.5*z;c.strokeStyle=(hash>>i)&1?rdRgba(B.light,.7):rdRgba(B.ground,.9);c.lineWidth=1.1*z;for(let k=0;k<3;k++){const ox=((hash>>(k*3+i))%13-6)*z,bx=mx+ox,by=my+((hash>>(k+i))%7-3)*z*.5;c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx-1.5*z,by-4*z,bx+Math.sin(t+x+k)*1.5*z,by-7*z);c.stroke();}});}
 }
 liquidDetail(w,B,vis,t){
  const c=this.ctx,z=this.zoom,W=B.water;
  // Liquid detail by kind.
  for(const v of vis){if(v.tile!==2)continue;const {s,x,y,hash}=v;c.save();if(B.liquid==='river'||B.liquid==='bog'){c.strokeStyle=rdRgba(W.shine,.38);c.lineWidth=.9;for(let k=0;k<3;k++){const a=Math.sin(t*1.5+x+y+k)*6;c.beginPath();c.moveTo(s.x+(-18+k*8+a)*z,s.y+(-6+k*5)*z);c.lineTo(s.x+(k*8+a)*z,s.y+(-6+k*5)*z);c.stroke();}if(B.liquid==='bog'&&hash%4===0){const r=((t*.6+hash%7)%1);c.strokeStyle=rdRgba(W.shine,.5*(1-r));c.beginPath();c.arc(s.x+((hash%17)-8)*z,s.y+((hash%9)-4)*z*.5,r*5*z,0,7);c.stroke();}}
   else if(B.liquid==='ice'){c.strokeStyle=rdRgba('#ffffff',.5);c.lineWidth=.8;if(hash%3===0){c.beginPath();c.moveTo(s.x-14*z,s.y-3*z);c.lineTo(s.x+(hash%9-2)*z,s.y+4*z);c.lineTo(s.x+14*z,s.y-1*z);c.stroke();}if(hash%5===0){c.fillStyle=rdRgba('#ffffff',.5+Math.sin(t*3+hash)*.3);c.fillRect(s.x+(hash%13-6)*z,s.y-4*z,2*z,2*z);}}
   else{const glow=.5+.5*Math.sin(t*2.4+x*1.7+y*1.3);c.strokeStyle=rdRgba(W.shine,.35+glow*.5);c.lineWidth=1.3*z;for(let k=0;k<2;k++){const a=((hash>>k*4)%9-4)*z;c.beginPath();c.moveTo(s.x-16*z+a,s.y+(k*6-4)*z);c.quadraticCurveTo(s.x+a,s.y+(k*6-9)*z,s.x+14*z+a,s.y+(k*6-3)*z);c.stroke();}}
   c.restore();}
  if(W.glow&&!this.mobile){c.save();c.globalCompositeOperation='lighter';for(const v of vis)if(v.tile===2){const j={x:v.s.x+((v.hash%21)-10)*.7*z,y:v.s.y+(((v.hash>>>5)%11)-5)*.7*z,r:(.92+((v.hash>>>9)%25)/100)*z};this.brush(W.shine,j.x,j.y-6*z,92*j.r,.07+.04*Math.sin(t*2+v.x+v.y));}c.restore();}
 }
 bufferedGround(w,paint){
   const pad=56;
   let cache=this.groundCache;
   if(!cache||cache.world!==w||cache.unsealed!==w.unsealed||Math.abs(cache.x-this.camera.x)>pad-2||Math.abs(cache.y-this.camera.y)>pad-2){
    const surface=cache?.surface||document.createElement('canvas');
    const scale=this.mobile?1:this.dpr;
    const width=Math.ceil((this.width+2*pad)*scale),height=Math.ceil((this.height+2*pad)*scale);
    if(surface.width!==width||surface.height!==height){surface.width=width;surface.height=height;}
    const main=this.ctx,ground=surface.getContext('2d');
    ground.setTransform(scale,0,0,scale,pad*scale,pad*scale);ground.clearRect(-pad,-pad,width/scale,height/scale);
    try{this.ctx=ground;paint();}finally{this.ctx=main;}
    cache=this.groundCache={surface,world:w,unsealed:w.unsealed,x:this.camera.x,y:this.camera.y,scale};
   }
   this.ctx.drawImage(cache.surface,cache.x-this.camera.x-pad,cache.y-this.camera.y-pad,cache.surface.width/cache.scale,cache.surface.height/cache.scale);
 }
 castleGround(w,B,bi,vis){
  const paint=()=>{for(const tile of vis)this.indoorTile(tile,B,w);for(const room of w.rooms.slice(1,4))this.rug(room,bi);};
  this.bufferedGround(w,paint);
 }
 outdoorTerrain(w,B,bi,vis,t){
  this.bufferedGround(w,()=>{this.paintGround(w,B,bi,vis,0);this.treeShadows(w);});
  this.liquidDetail(w,B,vis,t);
  // Bridges over liquid: each connected stretch of bridge tiles becomes one straight plank bridge with rails.
  for(const br of this.bridgesOf(w)){
   const mid=this.project(br.mx,br.my),margin=(Math.max(Math.abs(br.t0),Math.abs(br.t1))+2)*60*this.zoom;
   if(mid.x+margin<0||mid.x-margin>this.width||mid.y+margin<0||mid.y-margin>this.height)continue;
   this.bridge(br,B,t);
  }
 }
 treeShadows(w){const c=this.ctx,z=this.zoom;c.save();for(const d of w.decor||[]){if(!['tree','pine','deadtree'].includes(d.type))continue;const a=this.project(d.x,d.y);if(a.x<-240||a.x>this.width+240||a.y<-150||a.y>this.height+200)continue;if(this.mobile){c.save();c.globalAlpha=.35;c.drawImage(this.shadowBlob(),a.x-55*z,a.y-32*z,170*z,61*z);c.restore();continue;}const q=c.createRadialGradient(a.x+25*z,a.y-8*z,4,a.x+25*z,a.y-8*z,80*z);q.addColorStop(0,'#10231848');q.addColorStop(1,'#10231800');c.fillStyle=q;c.save();c.translate(a.x,a.y);c.scale(1,.45);c.translate(-a.x,-a.y);c.fillRect(a.x-60*z,a.y-90*z,180*z,180*z);c.restore();}c.restore();}
 bridgesOf(w){if(!this.bridgeCache)this.bridgeCache=new WeakMap();if(this.bridgeCache.has(w))return this.bridgeCache.get(w);const seen=new Set(),out=[];
  for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++){if(w.grid[y][x]!==4||seen.has(y*64+x))continue;const cells=[],q=[[x,y]];seen.add(y*64+x);for(let h=0;h<q.length;h++){const [a,b]=q[h];cells.push([a+.5,b+.5]);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const u=a+dx,v=b+dy;if(w.grid[v]?.[u]===4&&!seen.has(v*64+u)){seen.add(v*64+u);q.push([u,v]);}}}
   const n=cells.length,mx=cells.reduce((s,c)=>s+c[0],0)/n,my=cells.reduce((s,c)=>s+c[1],0)/n;let sxx=0,syy=0,sxy=0;for(const [a,b] of cells){sxx+=(a-mx)**2;syy+=(b-my)**2;sxy+=(a-mx)*(b-my);}
   let ang=.5*Math.atan2(2*sxy,sxx-syy);if(n<3){const s=(w.grid[Math.floor(my)]?.[Math.floor(mx)-1]>=3)||(w.grid[Math.floor(my)]?.[Math.floor(mx)+1]>=3);ang=s?0:Math.PI/2;}
   const ux=Math.cos(ang),uy=Math.sin(ang);let t0=Infinity,t1=-Infinity;for(const [a,b] of cells){const t=(a-mx)*ux+(b-my)*uy;t0=Math.min(t0,t);t1=Math.max(t1,t);}
   out.push({mx,my,ux,uy,t0:t0-.75,t1:t1+.75,hw:.78});}
  this.bridgeCache.set(w,out);return out;}
 bridge(br,B,t){const c=this.ctx,z=this.zoom,Br=B.bridge,{mx,my,ux,uy,t0,t1,hw}=br,nx=-uy,ny=ux,P=(tt,ss,lift=0)=>{const q=this.project(mx+ux*tt+nx*ss,my+uy*tt+ny*ss);return{x:q.x,y:q.y-lift*z};},quad=(a,b,d,e,fill)=>{c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(d.x,d.y);c.lineTo(e.x,e.y);c.closePath();c.fillStyle=fill;c.fill();};
  c.save();c.globalAlpha=.35;quad(P(t0,-hw-.15,-6),P(t1,-hw-.15,-6),P(t1,hw+.25,-6),P(t0,hw+.25,-6),'#06100f');c.globalAlpha=1;
  quad(P(t0,-hw,-4),P(t1,-hw,-4),P(t1,hw,-4),P(t0,hw,-4),Br.dark);
  const L=t1-t0,n=Math.max(3,Math.round(L/.3));for(let i=0;i<n;i++){const a=t0+L*i/n+.02,b=t0+L*(i+1)/n-.02,h=((i*2654435761)>>>0)%5;quad(P(a,-hw),P(b,-hw),P(b,hw),P(a,hw),rdMix(Br.plank,i%2?Br.dark:'#ffffff',h/30+(i%2?.08:0)));c.strokeStyle=rdRgba('#000000',.25);c.lineWidth=.7;c.beginPath();const s=P(b,-hw),e=P(b,hw);c.moveTo(s.x,s.y);c.lineTo(e.x,e.y);c.stroke();if(h===2){c.fillStyle=rdRgba('#1a120a',.6);const m=P((a+b)/2,hw*.4);c.beginPath();c.arc(m.x,m.y,.9*z,0,7);c.fill();}}
  // rails and posts
  for(const side of [-1,1]){const ss=side*hw*.96;c.strokeStyle=Br.dark;c.lineWidth=3*z;for(let k=0;k<=Math.ceil(L/1.1);k++){const tt=Math.min(t1,t0+k*1.1),a=P(tt,ss),b=P(tt,ss,15);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
   const a=P(t0,ss,14),b=P(t1,ss,14);c.strokeStyle=rdMix(Br.plank,'#000000',.15);c.lineWidth=2.6*z;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle=rdRgba('#ffffff',.18);c.lineWidth=.8*z;c.beginPath();c.moveTo(a.x,a.y-1*z);c.lineTo(b.x,b.y-1*z);c.stroke();}
  c.restore();}
 // ---------- castle interior ----------
 // Flagstone tiles, painted once per biome and variant at 2x and reused: bevelled stones in dark grout.
 floorSprite(bi,B,v){const key=bi+':'+v;if(this.floorCache[key])return this.floorCache[key];const R=2,k=document.createElement('canvas');k.width=86*R;k.height=44*R;const c=k.getContext('2d');c.scale(R,R);const rnd=rdRand(bi*977+v*131+7);
  const P=(u,w)=>[43+(u-w)*42.6,22+(u+w-1)*21.3],poly=(pts,fill)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill();};
  const base=rdMix(B.floor[v%4],'#b9bbc0',.15);poly([P(0,0),P(1,0),P(1,1),P(0,1)],rdMix(base,'#05070a',.45));
  const cuts=[[[0,0,.5,.5],[.5,0,1,.5],[0,.5,.5,1],[.5,.5,1,1]],[[0,0,1,.5],[0,.5,.55,1],[.55,.5,1,1]],[[0,0,.6,.6],[.6,0,1,.6],[0,.6,1,1]],[[0,0,.5,1],[.5,0,1,.45],[.5,.45,1,1]]][v%4];
  for(const [u0,w0,u1,w1] of cuts){const g=.035,a=[u0+g,w0+g],b=[u1-g,w0+g],d=[u1-g,w1-g],e=[u0+g,w1-g],tone=rdMix(base,rnd()<.5?'#ffffff':'#000000',rnd()*.16);
   poly([P(...a),P(...b),P(...d),P(...e)],tone);
   c.strokeStyle='rgba(255,255,255,.13)';c.lineWidth=.8;c.beginPath();c.moveTo(...P(...e));c.lineTo(...P(...a));c.lineTo(...P(...b));c.stroke();
   c.strokeStyle='rgba(0,0,0,.3)';c.beginPath();c.moveTo(...P(...b));c.lineTo(...P(...d));c.lineTo(...P(...e));c.stroke();
   for(let i=0;i<7;i++){const q=P(u0+(u1-u0)*(.15+rnd()*.7),w0+(w1-w0)*(.15+rnd()*.7));c.fillStyle=rnd()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.12)';c.beginPath();c.ellipse(q[0],q[1],1+rnd()*2.4,.6+rnd(),0,0,7);c.fill();}}
  if(v>=4){c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=.9;const s0=P(.2+rnd()*.3,.2+rnd()*.2);c.beginPath();c.moveTo(...s0);c.lineTo(s0[0]+8,s0[1]+4);c.lineTo(s0[0]+5,s0[1]+9);c.lineTo(s0[0]+12,s0[1]+13);c.stroke();}
  if(v===6){c.fillStyle='rgba(90,120,70,.28)';for(let i=0;i<5;i++){const q=P(rnd(),rnd());c.beginPath();c.ellipse(q[0],q[1],3+rnd()*4,1.5+rnd()*2,0,0,7);c.fill();}}
  return this.floorCache[key]=k;}
 // Wall blocks: brick courses on both faces, a stone coping on top and a dark footing; variants add moss and windows.
 wallSprite(bi,B,v){const key=bi+':'+v;if(this.wallCache[key])return this.wallCache[key];const R=2,k=document.createElement('canvas');k.width=86*R;k.height=113*R;const c=k.getContext('2d');c.scale(R,R);const rnd=rdRand(bi*313+v*71+3),W=B.wall,H=67;
  const L=(u,y)=>[u*43,23+u*21+y],Rf=(u,y)=>[43+u*43,44-u*21+y],quad=(f,u0,y0,u1,y1,fill)=>{const p=[f(u0,y0),f(u1,y0),f(u1,y1),f(u0,y1)];c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fillStyle=fill;c.fill();};
  for(const [f,col] of [[L,W.l],[Rf,W.r]]){quad(f,0,0,1,H,rdMix(col,'#000000',.4));const rows=6,rh=H/rows;for(let r=0;r<rows;r++){const off=r%2?.17:0;for(let u=-off;u<1;u+=.34){const u0=Math.max(0,u+.012),u1=Math.min(1,u+.34-.012);if(u1<=u0)continue;const tone=rdMix(col,rnd()<.55?'#ffffff':'#000000',rnd()*.14);quad(f,u0,r*rh+.9,u1,(r+1)*rh-.9,tone);c.strokeStyle='rgba(255,255,255,.1)';c.lineWidth=.7;const a=f(u0,r*rh+1),b=f(u1,r*rh+1);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();}}
   const g=c.createLinearGradient(0,23+H-14,0,23+H+21);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.4)');quad(f,0,H-12,1,H,g);}
  // the right face sits in shadow
  quad(Rf,0,0,1,H,'rgba(8,10,18,.18)');
  if(v===4||v===5){const f=v===4?L:Rf;quad(f,.36,12,.64,44,'#0d1218');const a=f(.36,12),b=f(.64,12),m=f(.5,4);c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(m[0],m[1]-2,b[0],b[1]);c.closePath();c.fillStyle='#0d1218';c.fill();const g=c.createLinearGradient(0,a[1]-8,0,a[1]+34);g.addColorStop(0,'rgba(150,190,230,.55)');g.addColorStop(1,'rgba(80,110,150,.12)');quad(f,.39,12,.61,42,g);c.strokeStyle='#1b232a';c.lineWidth=1.2;for(const u of [.45,.5,.55]){const p0=f(u,10),p1=f(u,42);c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);c.stroke();}const s0=f(.33,45),s1=f(.67,45);c.strokeStyle=rdMix(W.top,'#ffffff',.15);c.lineWidth=2.4;c.beginPath();c.moveTo(s0[0],s0[1]);c.lineTo(s1[0],s1[1]);c.stroke();}
  if(v===3||v===6){for(let i=0;i<9;i++){const f=i%2?L:Rf,p=f(rnd(),H*(.45+rnd()*.55));c.fillStyle=['rgba(80,110,60,.45)','rgba(100,130,70,.35)','rgba(60,80,50,.5)'][i%3];c.beginPath();c.ellipse(p[0],p[1],2+rnd()*4,1.4+rnd()*2.6,0,0,7);c.fill();}c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=.9;const p=L(.3+rnd()*.4,10);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0]+3,p[1]+9);c.lineTo(p[0]-1,p[1]+17);c.lineTo(p[0]+4,p[1]+27);c.stroke();}
  // coping: a slightly overhanging cap stone with a lit front edge
  const top=[[43,1],[87,23],[43,45],[-1,23]];c.beginPath();top.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fillStyle=W.top;c.fill();
  c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.moveTo(43,9);c.lineTo(71,23);c.lineTo(43,37);c.lineTo(15,23);c.closePath();c.fill();c.fillStyle=rdMix(W.top,'#000000',.1);c.beginPath();c.moveTo(43,11);c.lineTo(67,23);c.lineTo(43,35);c.lineTo(19,23);c.closePath();c.fill();
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.beginPath();c.moveTo(-1,23);c.lineTo(43,45);c.lineTo(87,23);c.stroke();c.strokeStyle='rgba(0,0,0,.35)';c.beginPath();c.moveTo(-1,25);c.lineTo(43,47);c.lineTo(87,25);c.stroke();
  return this.wallCache[key]=k;}
 indoorTile(v,B,w){const c=this.ctx,z=this.zoom,s=v.s,bi=w.biome??(w.chapter-1)%6,var_=v.hash%11<7?v.hash%4:v.hash%11===7?4:v.hash%11===8?5:v.hash%11===9?6:v.hash%4;c.drawImage(this.floorSprite(bi,B,var_),s.x-43*z,s.y-22*z,86*z,44*z);
  // contact shadow where the floor meets the back walls
  const at=(x,y)=>w.grid[y]?.[x],{x,y}=v;c.fillStyle='rgba(0,0,0,.2)';
  if(at(x,y-1)===1){for(const d of [.34,.16]){const a=this.project(x,y),b=this.project(x+1,y),e=this.project(x+1,y+d),f=this.project(x,y+d);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(f.x,f.y);c.fill();}}
  if(at(x-1,y)===1){for(const d of [.34,.16]){const a=this.project(x,y),b=this.project(x,y+1),e=this.project(x+d,y+1),f=this.project(x+d,y);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(f.x,f.y);c.fill();}}
  // a carpet runner follows the halls (tile 3), its edges inset where the hall ends
  const inRoom=(w.rooms||[]).some(r=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h);
  if(v.tile===3&&!inRoom){const o=k=>at(...k)===3&&!(w.rooms||[]).some(r=>k[0]>=r.x&&k[1]>=r.y&&k[0]<r.x+r.w&&k[1]<r.y+r.h),lx=!o([x-1,y]),rx=!o([x+1,y]),ty=!o([x,y-1]),by=!o([x,y+1]);let x0=lx?.72:0,x1=rx?.28:1,y0=ty?.72:0,y1=by?.28:1;if(lx&&rx){x0=.22;x1=.78;}if(ty&&by){y0=.22;y1=.78;}if(x0<x1&&y0<y1){const q=(u,w2)=>this.project(x+u,y+w2),pts=[q(x0,y0),q(x1,y0),q(x1,y1),q(x0,y1)];c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=rdMix(RD_BANNER[bi],'#1a0c0c',.25);c.fill();c.strokeStyle=rdRgba('#d9b765',.75);c.lineWidth=1.4*z;const edge=(a,b)=>{c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();},ins=.06;if(lx||x0>0)edge(q(x0+ins,y0),q(x0+ins,y1));if(rx||x1<1)edge(q(x1-ins,y0),q(x1-ins,y1));if(ty||y0>0)edge(q(x0,y0+ins),q(x1,y0+ins));if(by||y1<1)edge(q(x0,y1-ins),q(x1,y1-ins));c.fillStyle='rgba(0,0,0,.12)';if(v.hash%3===0){const m=q((x0+x1)/2,(y0+y1)/2);c.beginPath();c.ellipse(m.x,m.y,9*z,4.5*z,0,0,7);c.fill();}}}}
 // Woven rugs in the side rooms: border, field and a lozenge medallion.
 rug(room,bi){const c=this.ctx,z=this.zoom,x0=room.x+2.2,y0=room.y+2.2,x1=room.x+room.w-2.2,y1=room.y+room.h-2.2,q=(u,w)=>this.project(u,w),poly=(a,b,d,e,fill,stroke)=>{c.beginPath();[a,b,d,e].forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3*z;c.stroke();}};
  const base=['#5c2326','#24425a','#4a3a1e','#2f4a3a'][(bi+room.x)%4],rim=q;poly(rim(x0,y0),rim(x1,y0),rim(x1,y1),rim(x0,y1),rdMix(base,'#000000',.2),rdRgba('#d9b765',.6));poly(q(x0+.4,y0+.4),q(x1-.4,y0+.4),q(x1-.4,y1-.4),q(x0+.4,y1-.4),base,rdRgba('#d9b765',.5));
  const mx=(x0+x1)/2,my=(y0+y1)/2,rx=(x1-x0)/2-.9,ry=(y1-y0)/2-.9;if(rx>.3&&ry>.3){poly(q(mx,my-ry),q(mx+rx,my),q(mx,my+ry),q(mx-rx,my),rdMix(base,'#d9b765',.22),rdRgba('#e8cf93',.55));poly(q(mx,my-ry*.45),q(mx+rx*.45,my),q(mx,my+ry*.45),q(mx-rx*.45,my),rdMix(base,'#000000',.3));}
  c.strokeStyle=rdRgba('#e8cf93',.35);c.lineWidth=1*z;for(let i=0;i<=8;i++){const a=q(x0+(x1-x0)*i/8,y0),b=q(x0+(x1-x0)*i/8,y0-.18);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();const d=q(x0+(x1-x0)*i/8,y1),e=q(x0+(x1-x0)*i/8,y1+.18);c.beginPath();c.moveTo(d.x,d.y);c.lineTo(e.x,e.y);c.stroke();}}
 propsOf(w){if(this.propCache.has(w))return this.propCache.get(w);const set=new Set();for(const d of w.decor)if(d.solid)set.add(Math.floor(d.y)*64+Math.floor(d.x));this.propCache.set(w,set);return set;}
 // Wall-mounted torch (sconce) and banner drawn flat onto the wall face they hang on.
 wallDecor(o,s,B,bi,t){const c=this.ctx,z=this.zoom,slope=o.wall==='l'?.5:-.5;
  if(o.type==='torch'){const fl=Math.sin(t*13+o.x*3)*.5+Math.sin(t*7.3+o.y)*.5,fy=s.y-50*z;c.save();c.translate(s.x,s.y);c.transform(1,slope,0,1,0,0);c.fillStyle='#2a2522';c.fillRect(-2.5*z,-40*z,5*z,10*z);c.fillRect(-1.5*z,-46*z,3*z,8*z);c.restore();
   c.save();c.fillStyle='#3a312a';c.beginPath();c.moveTo(s.x-4*z,fy+4*z);c.lineTo(s.x+4*z,fy+4*z);c.lineTo(s.x+2.5*z,fy+10*z);c.lineTo(s.x-2.5*z,fy+10*z);c.fill();
   const g=c.createRadialGradient(s.x,fy-4*z,0,s.x,fy-4*z,26*z);g.addColorStop(0,rdRgba(B.accent,.55));g.addColorStop(1,rdRgba(B.accent,0));c.globalCompositeOperation='lighter';c.fillStyle=g;c.fillRect(s.x-26*z,fy-30*z,52*z,52*z);c.globalCompositeOperation='source-over';
   c.fillStyle='#ff9a3c';c.beginPath();c.moveTo(s.x-4*z,fy+4*z);c.quadraticCurveTo(s.x-5*z,fy-6*z,s.x+fl*1.5*z,fy-(14+fl*2)*z);c.quadraticCurveTo(s.x+5*z,fy-5*z,s.x+4*z,fy+4*z);c.fill();c.fillStyle='#ffe6a8';c.beginPath();c.moveTo(s.x-2*z,fy+3*z);c.quadraticCurveTo(s.x-2*z,fy-3*z,s.x+fl*z,fy-(8+fl)*z);c.quadraticCurveTo(s.x+2.5*z,fy-2*z,s.x+2*z,fy+3*z);c.fill();c.restore();
   this.lights.push({x:s.x,y:s.y-30*z,r:(250+fl*12)*z,a:.95,col:B.accent});return;}
  // banner
  const col=RD_BANNER[bi],sway=Math.sin(t*1.3+o.x+o.y)*1.2*z;c.save();c.translate(s.x,s.y);c.transform(1,slope,0,1,0,0);
  c.strokeStyle='#3a2a1c';c.lineWidth=2.4*z;c.beginPath();c.moveTo(-13*z,-66*z);c.lineTo(13*z,-66*z);c.stroke();
  c.beginPath();c.moveTo(-11*z,-65*z);c.lineTo(11*z,-65*z);c.lineTo(11*z+sway,-24*z);c.lineTo(sway,-16*z);c.lineTo(-11*z+sway,-24*z);c.closePath();const g=c.createLinearGradient(-11*z,0,11*z,0);g.addColorStop(0,rdMix(col,'#ffffff',.12));g.addColorStop(1,rdMix(col,'#000000',.35));c.fillStyle=g;c.fill();c.strokeStyle='#d9b765';c.lineWidth=1.2*z;c.stroke();
  c.fillStyle='#d9b765';c.beginPath();c.arc(sway*.5,-46*z,5*z,0,7);c.fill();c.fillStyle=rdMix(col,'#000000',.3);c.beginPath();c.arc(sway*.5,-46*z,3*z,0,7);c.fill();c.restore();}
 // Darkness with light pools: torches, braziers, windows, the hero and glowing projectiles cut holes in it.
 lighting(w){const c=this.ctx,divisor=this.mobile?4:2,W=Math.ceil(this.width/divisor),H=Math.ceil(this.height/divisor);if(!this.lightCanvas)this.lightCanvas=document.createElement('canvas');const lc=this.lightCanvas;if(lc.width!==W||lc.height!==H){lc.width=W;lc.height=H;}const l=lc.getContext('2d');l.globalCompositeOperation='source-over';l.clearRect(0,0,W,H);l.fillStyle='rgba(12,16,23,.40)';l.fillRect(0,0,W,H);l.globalCompositeOperation='destination-out';
  if(!this.lightMask){
   const mask=document.createElement('canvas');mask.width=mask.height=96;
   const mc=mask.getContext('2d'),glow=mc.createRadialGradient(48,48,0,48,48,48);
   glow.addColorStop(0,'#000');glow.addColorStop(.5,'rgba(0,0,0,.6)');glow.addColorStop(1,'transparent');
   mc.fillStyle=glow;mc.fillRect(0,0,96,96);this.lightMask=mask;
  }
  for(const L of this.lights){
   const x=L.x/divisor,y=L.y/divisor,r=L.r/divisor;if(x<-r||y<-r||x>W+r||y>H+r)continue;
   l.globalAlpha=L.a;l.drawImage(this.lightMask,x-r,y-r,r*2,r*2);
  }
  l.globalAlpha=1;
  c.drawImage(lc,0,0,this.width,this.height);
  if(!this.mobile&&(this.game.state?.settings.quality||'high')==='high'){c.save();c.globalCompositeOperation='lighter';for(const L of this.lights){if(!L.col)continue;const r=L.r*.55,g=c.createRadialGradient(L.x,L.y,0,L.x,L.y,r);g.addColorStop(0,rdRgba(L.col,.13*L.a));g.addColorStop(1,rdRgba(L.col,0));c.fillStyle=g;c.fillRect(L.x-r,L.y-r,r*2,r*2);}c.restore();}}
 draw(dt){if(this.contextLost)return;const g=this.game,w=g.world||this.preview,p=g.player||{x:38,y:15,face:{x:1,y:0}},c=this.ctx,z=this.zoom,t=g.time;const target={x:(p.x-p.y)*TILE_X*z,y:(p.x+p.y)*TILE_Y*z-35*z};if(!g.state){target.x-=this.width*.13;target.y-=10;}
  if(this.lastWorld!==w){this.camera={...target};this.heroFlip=false;this.lastWorld=w;}
  if(this.mobile){
   // Keep the cached floor on a fixed raster phase when a camera buffer is rebuilt.
   this.camera.x=Math.round(target.x);this.camera.y=Math.round(target.y);
  }else{
   this.camera.x+=(target.x-this.camera.x)*Math.min(1,dt*8);
   this.camera.y+=(target.y-this.camera.y)*Math.min(1,dt*8);
  }
  const bi=w.biome??(w.chapter-1)%6,B=sceneBiome(w);
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.width,this.height);c.fillStyle=w.inside?'#263034':rdMix(B.ground,'#050d0b',.55);c.fillRect(0,0,this.width,this.height);c.save();if(this.shake>0){c.translate(Math.sin(t*75)*this.shake,Math.cos(t*89)*this.shake);this.shake=Math.max(0,this.shake-dt*28);}
  let objects=[];const vis=[];this.lights=[];this.dt=dt;const props=w.inside?this.propsOf(w):null;
  const left=this.unproject(-160,-180),right=this.unproject(this.width+160,this.height+240);
  const top=this.unproject(this.width+160,-180),bottom=this.unproject(-160,this.height+240);
  const minX=Math.max(0,Math.floor(left.x)-1),maxX=Math.min(w.w-1,Math.ceil(right.x));
  const minY=Math.max(0,Math.floor(top.y)-1),maxY=Math.min(w.h-1,Math.ceil(bottom.y));
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const s=this.project(x+.5,y+.5);if(s.x<-160||s.x>this.width+160||s.y<-180||s.y>this.height+240)continue;const tile=w.grid[y][x],hash=((Math.imul(x+13,374761393)^Math.imul(y+7,668265263)^w.seed)>>>0);
   if(w.inside&&tile===1&&!props.has(y*64+x)){const at=(dx,dy)=>w.grid[y+dy]?.[x+dx],open=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>at(dx,dy)!==undefined&&at(dx,dy)!==1).length;
    if(open===4){vis.push({x,y,s,tile:0,hash});objects.push({sort:x+y+.9,type:'column',x:x+.5,y:y+.5,hash});continue;}
    if(open){const lf=at(0,1)!==undefined&&at(0,1)!==1,rf=at(1,0)!==undefined&&at(1,0)!==1;let v=hash%4;if(hash%13===0&&lf)v=4;else if(hash%13===1&&rf)v=5;else if(hash%9===2)v=6;else if(hash%7===3)v=3;objects.push({sort:x+y+.9,type:'wall',x:x+.5,y:y+.5,hash,v});if(v===4){const q=this.project(x+.5,y+1);this.lights.push({x:q.x,y:q.y-10*z,r:150*z,a:.5,col:'#9cc4ff'});}if(v===5){const q=this.project(x+1,y+.5);this.lights.push({x:q.x,y:q.y-10*z,r:150*z,a:.5,col:'#9cc4ff'});}}continue;}
   vis.push({x,y,s,tile:w.inside&&tile===1?0:tile,hash});}
  if(w.inside)this.castleGround(w,B,bi,vis);else this.outdoorTerrain(w,B,bi,vis,t);
  if(w.inside){const bc=RD_BOSS_COLOR[bi];for(const room of w.rooms||[]){const bossRoom=room.x>28;if(!bossRoom)continue;const a=this.project(room.x+2,room.y+2),b=this.project(room.x+room.w-2,room.y+2),d=this.project(room.x+room.w-2,room.y+room.h-2),e=this.project(room.x+2,room.y+room.h-2);c.fillStyle=bossRoom?rdRgba(bc,.14):rdRgba(B.accent,.06);c.strokeStyle=bossRoom?rdRgba(bc,.32):rdRgba(B.accent,.14);c.lineWidth=3*z;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(d.x,d.y);c.lineTo(e.x,e.y);c.closePath();c.fill();c.stroke();if(bossRoom){const m=this.project(35.5,8.5);c.strokeStyle=rdRgba(bc,.35);c.lineWidth=1.4*z;for(let j=0;j<2;j++){c.beginPath();c.ellipse(m.x,m.y,(88+j*10)*z,(44+j*5)*z,0,0,Math.PI*2);c.stroke();}for(let j=0;j<8;j++){const a2=j*Math.PI/4;c.beginPath();c.moveTo(m.x+Math.cos(a2)*75*z,m.y+Math.sin(a2)*37.5*z);c.lineTo(m.x+Math.cos(a2)*98*z,m.y+Math.sin(a2)*49*z);c.stroke();}}}}
  for(const trap of w.traps){const s=this.project(trap.x,trap.y),active=(t+trap.phase)%4<.7;c.strokeStyle=active?'#ec9c70':'#7d8985';c.fillStyle=active?'#da87594d':'#10171955';c.beginPath();c.ellipse(s.x,s.y,22*z,11*z,0,0,Math.PI*2);c.fill();c.stroke();for(let k=0;k<4;k++){c.fillStyle=active?'#d8d9cf':'#6b7672';c.beginPath();c.moveTo(s.x+(k*10-17)*z,s.y+3*z);c.lineTo(s.x+(k*10-13)*z,s.y-(active?14:4)*z);c.lineTo(s.x+(k*10-10)*z,s.y+4*z);c.fill();}}
  let scenery=this.sceneryCache.get(w);
  if(!scenery){scenery=[...this.woodland(w),...w.decor.map(d=>({...d,sort:d.sort??d.x+d.y}))];this.sceneryCache.set(w,scenery);}
  for(const d of scenery){
   const pos=this.project(d.x,d.y);
   // Sprites use a foot anchor. Cull small props tightly but leave full room for tall gate silhouettes.
   const margin=d.type==='gate'?360:d.type==='tree'||d.type==='pine'||d.type==='deadtree'?175*(d.scale||1)*z:85*(d.scale||1)*z;
   const height=d.type==='gate'?510*z:margin*2.2;
   if(pos.x>=-margin&&pos.x<=this.width+margin&&pos.y>=-40&&pos.y<=this.height+height)objects.push(d);
  }
  for(const ch of w.chests)objects.push({...ch,type:'chest',sort:ch.x+ch.y});if(w.princess)objects.push({...w.princess,type:'princess',sort:w.princess.x+w.princess.y});for(const e of w.enemies){if(!e.dead)objects.push({...e,type:'enemy',sort:e.x+e.y,enemy:e});else if(e.deadAt!==undefined&&t-e.deadAt>=0&&t-e.deadAt<1.5)objects.push({x:e.x,y:e.y,type:'dying',sort:e.x+e.y-.02,enemy:e});}if(g.state)objects.push({type:'hero',...p,sort:p.x+p.y+.05});objects.sort((a,b)=>a.sort-b.sort);
  // Footstep and roll dust.
  if(g.state&&g.mode==='play'){const col=w.inside?'#8f897c':rdMix(B.path.mid,'#ffffff',.15);if(p.roll>0)this.dust(p.x,p.y,1,col,1.2);else if(p.moving&&(p.step||0)-this.lastStep>.55){this.dust(p.x-p.face.x*.15,p.y-p.face.y*.15,1,col,.8);this.lastStep=p.step;}if(Math.abs((p.step||0)-this.lastStep)>2)this.lastStep=p.step||0;}
  this.drawParticles(dt);
  if(g.state){const hs=this.project(p.x,p.y);this.lights.push({x:hs.x,y:hs.y-40*z,r:310*z,a:.8});}
  for(const o of objects){const s=this.project(o.x,o.y);if(s.x<-280||s.x>this.width+280||s.y<-40||s.y>this.height+420)continue;if(o.type==='wall'){this.wall(s,o,p,B,bi);continue;}
   if(o.type==='landmark'){this.landmark(s,w,o,t);continue;}
   if(w.campaign&&o.type==='gate'){this.campaignGate(s,w,t);continue;}
   if(o.type==='fallenSign'){this.sprite(o.type,s.x,s.y,50*z);continue;}
   if(o.type==='fordStones'){this.sprite(o.type,s.x,s.y+26*z,55*z);continue;}
   if(w.falkenstein&&o.type==='gate'){
    const height=390*z*(o.scale||1);
    this.sprite('falconGate',s.x,s.y,height);
    this.falconPennants(s,height,t);continue;
   }
   if(o.type==='column'){this.propSprite('column',s,o,p);continue;}
   if(o.type==='enemy'){this.drawEnemy(o.enemy,s,p,t);continue;}
   if(o.type==='dying'){this.drawDying(o.enemy,s,p,t,w,B);continue;}
   if(o.wall&&(o.type==='torch'||o.type==='banner')){this.wallDecor(o,s,B,bi,t);continue;}
   if(o.solid){this.propSprite(o.type,s,o,p);if(o.type==='brazier'){const fl=Math.sin(t*11+o.x)*.5+Math.sin(t*6.1+o.y)*.5;this.lights.push({x:s.x,y:s.y-80*z,r:(340+fl*18)*z,a:1,col:'#ff9a48'});c.save();c.globalCompositeOperation='lighter';for(let k=0;k<3;k++){const ph=(t*1.6+k*.33+o.x)%1;c.fillStyle=rdRgba('#ffb060',.5*(1-ph));c.beginPath();c.arc(s.x+Math.sin(t*3+k*2)*6*z,s.y-(78+ph*40)*z,(2-ph)*z,0,7);c.fill();}c.restore();}continue;}
   if(o.type==='hero'){c.save();if(p.invulnerable>0&&p.roll<=0)c.globalAlpha=.65+Math.sin(t*50)*.3;const H=RD_SIZE.hero*z,k=H/200,vs=(p.vx||0)-(p.vy||0);const facing=p.face.x-p.face.y;
    if(!this.mobile||Math.abs(facing)>.18)this.heroFlip=facing<0;
    const heroX=this.mobile?Math.round((this.width/2)*this.dpr)/this.dpr:s.x;
    const heroY=this.mobile?Math.round((this.height/2+35*z)*this.dpr)/this.dpr:s.y;
    this.actor(heroFrame(p,g.stats,g.input,t),heroX,heroY,H,this.heroFlip,p.roll,{tilt:p.moving?Math.max(-.07,Math.min(.07,vs*.014)):0});const eq=p.equipment,flip=this.heroFlip?-1:1;if(eq.helmet){c.strokeStyle=RARITIES[eq.helmet.rarity].color;c.lineWidth=2*z;c.beginPath();c.arc(s.x,s.y-(RD_HEAD-10)*k,8*k*1.6,Math.PI*1.1,Math.PI*1.9);c.stroke();}if(eq.weapon?.rarity>=2){c.shadowColor=RARITIES[eq.weapon.rarity].color;c.shadowBlur=10;c.fillStyle=c.shadowColor;c.beginPath();c.arc(s.x+flip*RD_HAND[0]*k,s.y-RD_HAND[1]*k,2.2*z,0,Math.PI*2);c.fill();}if(g.input.block&&g.stats.kind!=='bow'){c.strokeStyle='#9fd5dfae';c.lineWidth=3*z;c.beginPath();c.ellipse(s.x+flip*10*k,s.y-85*k,28*k*1.2,45*k,0,flip>0?-.9:Math.PI-.9+.0,flip>0?.9:Math.PI+.9);c.stroke();}c.restore();continue;}
   let h=o.type==='gate'?345:o.type==='tree'?210:o.type==='pine'?225:o.type==='deadtree'?190:o.type==='rock'?88:o.type==='bush'?57:o.type==='torch'?95:o.type==='princess'?98:o.type==='statue'?145:o.type==='bookshelf'?135:o.type==='banner'?145:o.type==='barrel'?74:60;h*=z*(o.scale||1);let alpha=1;const ps=this.project(p.x,p.y);if(['tree','pine','deadtree'].includes(o.type)&&s.y>ps.y-10&&s.y<ps.y+h&&Math.abs(s.x-ps.x)<h*.4)alpha=.35;if(o.opened)alpha=.38;const woodland=['tree','pine'].includes(o.type),under=['fern0','fern1','flowers0','mushrooms0','log0','reeds0'].includes(o.type);
   if(woodland){const n=((Math.imul(Math.floor(o.x*19),73856093)^Math.imul(Math.floor(o.y*19),19349663))>>>0),name=o.type==='pine'?'fir'+n%2:['oak0','oak1','oak2','birch0','birch1'][n%5];h=(name.startsWith('birch')?250:275)*z*(o.scale||1);alpha=s.y>ps.y-10&&s.y<ps.y+h&&Math.abs(s.x-ps.x)<h*.42?.26:1;this.foliage(name,s.x,s.y,h,alpha,o.x+o.y);}else if(under){
    const h=(o.type==='reeds0'?67:o.type==='log0'?42:48)*z*(o.scale||1);
    if(this.mobile&&o.type!=='reeds0')this.sprite(o.type,s.x,s.y,h);else this.foliage(o.type,s.x,s.y,h,1,o.x);
   }else if(o.type==='princess'){this.actor('princess-idle-'+Math.floor(t*4)%8,s.x,s.y,RD_SIZE.princess*z);this.lights.push({x:s.x,y:s.y-50*z,r:170*z,a:.55,col:'#f4e2b0'});}else this.sprite(o.type,s.x,s.y,h,alpha);
   if(o.type==='torch'){this.lights.push({x:s.x,y:s.y-h*.48,r:240*z,a:.9,col:B.accent});const flameY=s.y-h*.48,glow=c.createRadialGradient(s.x,flameY,2,s.x,flameY,110*z);glow.addColorStop(0,rdRgba(B.accent,.33));glow.addColorStop(1,rdRgba(B.accent,0));c.fillStyle=glow;c.fillRect(s.x-110*z,s.y-170*z,220*z,220*z);c.fillStyle='#ffe0a0';c.beginPath();c.ellipse(s.x,flameY,1.3*z,(3+Math.sin(t*15))*z,0,0,7);c.fill();}if(o.type==='princess'){c.strokeStyle='#e5cf9e70';c.beginPath();c.ellipse(s.x,s.y,31*z,15*z,0,0,Math.PI*2);c.stroke();}}
  for(const drop of w.drops){const s=this.project(drop.x,drop.y);if(drop.item){const color=RARITIES[drop.item.rarity].color;const glow=c.createLinearGradient(0,s.y-55*z,0,s.y);glow.addColorStop(0,color+'00');glow.addColorStop(1,color+'99');c.fillStyle=glow;c.fillRect(s.x-3*z,s.y-55*z,6*z,55*z);this.diamond(s.x,s.y-4*z,8*z,5*z,color);}else{c.fillStyle=drop.gold?'#ebc979':'#c87063';c.strokeStyle='#ffedbf';c.beginPath();c.ellipse(s.x,s.y-4*z,5*z,drop.gold?3*z:7*z,0,0,7);c.fill();c.stroke();}}
  for(const a of g.projectiles){const s=this.project(a.x,a.y),tail=this.project(a.x-a.vx*.07,a.y-a.vy*.07);if(a.owner!=='player')this.lights.push({x:s.x,y:s.y-26*z,r:80*z,a:.55,col:a.color});const gr=c.createLinearGradient(tail.x,tail.y,s.x,s.y);gr.addColorStop(0,rdRgba(a.color,0));gr.addColorStop(1,a.color);c.strokeStyle=gr;c.lineWidth=(a.owner==='player'?2:4)*z;c.shadowColor=a.color;c.shadowBlur=9;c.beginPath();c.moveTo(tail.x,tail.y-26*z);c.lineTo(s.x,s.y-26*z);c.stroke();c.shadowBlur=0;if(a.owner!=='player'){c.fillStyle='#fff6e0';c.beginPath();c.arc(s.x,s.y-26*z,1.8*z,0,7);c.fill();}}
  for(const f of g.effects){this.effect(f);if(f.type==='shock'&&!f.dusted){f.dusted=true;this.dust(f.x,f.y,6,w.inside?'#8f897c':rdMix(B.path.mid,'#ffffff',.15),1.4);}}
  if(w.inside)this.lighting(w);
  c.restore();
  const vignette=c.createRadialGradient(this.width*.5,this.height*.45,Math.min(this.height,this.width)*.2,this.width*.5,this.height*.5,Math.max(this.width*.7,this.height*.58));vignette.addColorStop(0,'#08131400');vignette.addColorStop(1,w.inside?'#0b142044':rdRgba(rdMix(B.ground,'#030806',.7),.64));c.fillStyle=vignette;c.fillRect(0,0,this.width,this.height);
  if((g.state?.settings.quality||'high')==='high'){c.globalAlpha=.1;for(let k=0;k<(this.mobile?1:5);k++){const x=(t*8+k*390)% (this.width+600)-300,y=this.height*.25+Math.sin(t*.07+k)*this.height*.35;const fog=c.createRadialGradient(x,y,10,x,y,350);fog.addColorStop(0,B.fog);fog.addColorStop(1,B.fog+'00');c.fillStyle=fog;c.fillRect(x-350,y-350,700,700);}c.globalAlpha=1;const Wt=w.inside?{color:'#e9d7a8',vy:-4,vx:3,size:.9,count:30}:B.weather;for(let k=0;k<Wt.count;k+=this.mobile?2:1){const x=((k*137.3+Math.sin(t*.3+k)*25+t*Wt.vx)%this.width+this.width)%this.width,y=((k*97.7+t*Wt.vy+this.height*100)%this.height+this.height)%this.height;c.fillStyle=rdRgba(Wt.color,w.inside?.25+.2*Math.sin(t*1.7+k):.55);c.beginPath();c.arc(x,y,Wt.size*(k%3===0?1.2:.7),0,7);c.fill();}}
  if(g.state){this.objectiveArrow();const it=g.interaction();if(it&&g.mode==='play'){const s=this.project(it.target.x,it.target.y);c.font='12px Georgia';c.textAlign='center';const text=(g.touchEnabled?'Aktion: ':'[E]  ')+it.label,tw=c.measureText(text).width;c.fillStyle='#10201feb';c.fillRect(s.x-tw/2-14,s.y+15,tw+28,29);c.strokeStyle='#bba47699';c.strokeRect(s.x-tw/2-14,s.y+15,tw+28,29);c.fillStyle='#eee1be';c.fillText(text,s.x,s.y+34);}}}
 drawEnemy(e,s,p,t){
  const c=this.ctx,z=this.zoom,boss=e.boss,size=(RD_SIZE[e.type]||104)*(e.elite?1.12:1)*z;
  if(e.root){c.save();c.translate(s.x,s.y);c.scale(z,z);for(let k=0;k<5;k++){c.strokeStyle=k%2?'#96a454':'#664c36';c.lineWidth=5-k*.4;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo((k-2)*16,-17,(k-2)*9+Math.sin(t+k)*2,-34-k*3);c.stroke();}c.restore();return;}
  if(e.state==='windup')this.telegraph(e,t);
  if(e.elite){c.strokeStyle='#f1c668';c.lineWidth=2*z;c.shadowColor='#f1c668';c.shadowBlur=8;c.beginPath();c.ellipse(s.x,s.y-2*z,size*.24,size*.085,0,0,7);c.stroke();c.shadowBlur=0;}
  c.save();if(e.hit>0&&!this.mobile)c.filter='brightness(1.75)';
  // Track the distance each enemy really covers: drives its walk cycle and a slight lean into the movement.
  const prev=this.actorPositions.get(e),dist=prev?Math.hypot(e.x-prev.x,e.y-prev.y):0,moving=dist>.0005,step=(prev?.step||0)+(dist<1?dist:0),vs=prev&&this.dt>0?((e.x-prev.x)-(e.y-prev.y))/this.dt:0,tilt=(prev?.tilt||0)*.8+Math.max(-.08,Math.min(.08,vs*.014))*.2;this.actorPositions.set(e,{x:e.x,y:e.y,step,tilt});
  if((e.state==='charge'||e.state==='leap')&&Math.random()<.5)this.dust(e.x,e.y,1,'#9a907e',1.1);
  const sq=e.hit>0?e.hit/.16:0;this.actor(enemyFrame(e,t,moving,step),s.x,s.y,size,(p.x-e.x)-(p.y-e.y)<0,0,{tilt:moving?tilt:0,sx:1+sq*.05,sy:1-sq*.04});c.restore();
  const target=this.game.bowTarget;
  if(target&&target.world===this.game.world&&target.entity===e){
   c.save();c.strokeStyle='#ffdf85';c.lineWidth=2*z;c.beginPath();
   c.ellipse(s.x,s.y-2*z,17*z,7*z,0,0,2*Math.PI);c.stroke();c.restore();
  }
  if(boss&&this.game.world?.inside){this.lights.push({x:s.x,y:s.y-size*.45,r:size*1.4,a:.45,col:RD_BOSS_COLOR[Number(e.type.slice(4))]});}
  if(e.hp<e.maxHp||Math.hypot(e.x-p.x,e.y-p.y)<6){const bw=(boss?96:e.elite?46:38)*z,by=s.y-size*(boss?.93:.86);c.fillStyle='#101b1ce6';c.fillRect(s.x-bw/2,by,bw,4*z);c.fillStyle=boss?'#d7a966':e.elite?'#e8c46a':'#b86754';c.fillRect(s.x-bw/2,by,bw*e.hp/e.maxHp,4*z);}
 }
 // Death: the figure buckles (6 frames), tips over away from the blow, hits the ground in a puff of dust and fades.
 drawDying(e,s,p,t,w,B){const z=this.zoom,since=t-e.deadAt,size=(RD_SIZE[e.type]||104)*(e.elite?1.12:1)*z,fall=Math.max(0,Math.min(1,(since-.42)/.36)),rot=(e.fall||1)*fall*fall*1.38,alpha=since<.95?1:Math.max(0,1-(since-.95)/.55);
  if(fall>=1&&!e.dusted){e.dusted=true;this.dust(e.x+(e.fall||1)*.5,e.y-(e.fall||1)*.5,7,w.inside?'#8f897c':rdMix(B.path.mid,'#ffffff',.15),1.3);}
  this.actor(deathFrame(e,since),s.x,s.y+fall*4*z,size,(p.x-e.x)-(p.y-e.y)<0,0,{rot,alpha});}
 propSprite(type,s,o,p){const z=this.zoom,h=(RD_PROP_H[type]||100)*z*(o.scale||1),ps=this.project(p.x,p.y),hide=RD_TALL.includes(type)&&o.x+o.y>p.x+p.y&&Math.abs(s.x-ps.x)<h*.32&&s.y-ps.y<h*.9&&s.y>ps.y;this.sprite(type,s.x,s.y,h,hide?.35:1);}
 telegraph(e,t){
  const c=this.ctx,z=this.zoom,list=e.tele||[{k:'c',x:e.x,y:e.y,r:e.boss?2.1:1.05}],progress=e.windup?Math.max(0,Math.min(1,1-e.timer/e.windup)):.5;
  for(const s of list){c.save();const pulse=(this.game.world.inside?.23:.13)+Math.sin(t*14)*.04;
   if(s.k==='c'){const a=this.project(s.x,s.y);c.fillStyle=s.soft?'rgba(210,150,255,'+(.07+progress*.12)+')':'rgba(229,112,75,'+pulse+')';c.strokeStyle=s.soft?'#cfa6f0':'#f1ad79';c.lineWidth=1.5;c.beginPath();c.ellipse(a.x,a.y,s.r*42*z,s.r*21*z,0,0,Math.PI*2);c.fill();c.stroke();if(!s.soft){c.fillStyle='rgba(240,120,70,.27)';c.beginPath();c.ellipse(a.x,a.y,s.r*42*z*progress,s.r*21*z*progress,0,0,Math.PI*2);c.fill();}}
   else if(s.k==='cone'){const edge=r=>{const pts=[this.project(s.x,s.y)];for(let i=0;i<=14;i++){const a=s.a-s.arc/2+s.arc*i/14;pts.push(this.project(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r));}return pts;};const poly=pts=>{c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.closePath();};c.fillStyle='rgba(229,112,75,'+pulse+')';c.strokeStyle='#f1ad79';c.lineWidth=1.5;poly(edge(s.range));c.fill();c.stroke();c.fillStyle='rgba(240,120,70,.27)';poly(edge(s.range*progress));c.fill();}
   else if(s.k==='line'){const dx=s.x2-s.x,dy=s.y2-s.y,l=Math.hypot(dx,dy)||1,nx=-dy/l*s.w/2,ny=dx/l*s.w/2,quad=(f)=>{const a=this.project(s.x+nx,s.y+ny),b=this.project(s.x+dx*f+nx,s.y+dy*f+ny),d=this.project(s.x+dx*f-nx,s.y+dy*f-ny),q=this.project(s.x-nx,s.y-ny);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(d.x,d.y);c.lineTo(q.x,q.y);c.closePath();};c.fillStyle='rgba(229,112,75,'+pulse+')';c.strokeStyle='#f1ad79';c.lineWidth=1.5;quad(1);c.fill();c.stroke();c.fillStyle='rgba(240,120,70,.27)';quad(progress);c.fill();}
   c.restore();}
 }
 // Walls between the camera and the hero turn see-through so the hero is never hidden.
 wall(s,o,p,B,bi){const c=this.ctx,z=this.zoom,ps=this.project(p.x,p.y),front=o.x+o.y>p.x+p.y&&Math.abs(s.x-ps.x)<90*z&&s.y-ps.y<100*z;c.save();c.globalAlpha=front?.26:1;c.drawImage(this.wallSprite(bi,B,o.v||0),s.x-43*z,s.y-90*z,86*z,113*z);c.restore();}
 effect(f){const c=this.ctx,z=this.zoom,s=this.project(f.x,f.y),progress=1-f.life/f.maxLife;c.save();c.globalAlpha=Math.min(1,f.life/f.maxLife*2);if(f.type==='text'){c.font='bold '+Math.round(17*z)+'px Georgia';c.textAlign='center';c.strokeStyle='#182329';c.lineWidth=3;c.strokeText(f.text,s.x,s.y-70*z-progress*35*z);c.fillStyle=f.color;c.fillText(f.text,s.x,s.y-70*z-progress*35*z);}else if(f.type==='slash'){
   // Weapon trail: a crescent that sweeps open, thick at the leading edge and fading behind it.
   const N=18,sweep=Math.min(1,.25+progress*2.4),a0=f.angle-f.arc/2,ring=(r)=>{const out=[];for(let i=0;i<=N;i++){const a=a0+f.arc*sweep*i/N,q=this.project(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r);out.push([q.x,q.y-28*z]);}return out;};
   const outer=ring(f.range),inner=ring(f.range*(.5+progress*.25)).reverse();c.globalAlpha=Math.max(0,1-progress)*.85;
   const head=outer[outer.length-1],tail=outer[0],g=c.createLinearGradient(tail[0],tail[1],head[0],head[1]);g.addColorStop(0,rdRgba(f.color,0));g.addColorStop(1,rdRgba(f.color,.5));c.fillStyle=g;c.beginPath();[...outer,...inner].forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill();
   c.strokeStyle='#fffaf0';c.lineWidth=2.2*z*(1-progress)+.6;c.shadowBlur=12;c.shadowColor=f.color;c.beginPath();outer.slice(Math.floor(N*.35)).forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();}else if(f.type==='spark'){for(let i=0;i<8;i++){const a=i*Math.PI/4,dist=progress*35*z;c.strokeStyle=f.color;c.lineWidth=2;c.beginPath();c.moveTo(s.x+Math.cos(a)*dist*.5,s.y-35*z+Math.sin(a)*dist*.5);c.lineTo(s.x+Math.cos(a)*dist,s.y-35*z+Math.sin(a)*dist);c.stroke();}}else{c.strokeStyle=f.color;c.lineWidth=3*z;c.beginPath();c.ellipse(s.x,s.y,(f.range||1)*42*z*progress,(f.range||1)*21*z*progress,0,0,7);c.stroke();}c.restore();}
 campaignGate(s,w,t){
  const c=this.ctx,z=this.zoom,spec=chapterSpec(w.chapter),ch=w.chapter;
  // Backlit skyline behind the full masonry gate. Each crown has a different profile.
  const crowns={2:[[-115,250,34],[-55,325,27],[76,279,38]],3:[[-112,272,38],[82,319,29]],4:[[-108,332,24],[105,360,23]],5:[[-96,283,35],[46,302,40]],6:[[-120,359,31],[72,281,46]],7:[[-70,358,44],[88,258,30]],8:[[-104,330,32],[104,330,32]],9:[[-112,271,46],[94,284,53]],10:[[-120,344,34],[-32,385,39],[87,320,41]]};
  c.save();c.translate(s.x,s.y);c.scale(z,z);
  for(const [x,h,r] of crowns[ch]){
   const shade=c.createLinearGradient(x-r,0,x+r,0);shade.addColorStop(0,'#273137');shade.addColorStop(.52,spec.color);shade.addColorStop(1,'#354246');
   c.fillStyle=shade;c.fillRect(x-r,-h,r*2,h-36);
   c.fillStyle='#24313b';c.beginPath();c.moveTo(x-r-5,-h);
   if([2,4,7,8,10].includes(ch)){c.lineTo(x,-h-r*1.8);c.lineTo(x+r+5,-h);}
   else for(let k=0;k<5;k++){const a=x-r+k*r*.4;c.lineTo(a,-h-10);c.lineTo(a+r*.2,-h-10);c.lineTo(a+r*.2,-h);}
   c.fill();for(let y=-h+18;y<-210;y+=23){c.fillStyle='#263033';c.fillRect(x-3,y,6,13);}
  }
  c.restore();this.sprite('gate',s.x,s.y,300*z);
  c.save();c.translate(s.x,s.y-134*z);c.scale(z,z);c.fillStyle=spec.color;
  c.beginPath();c.moveTo(-11,-24);c.lineTo(11,-24);c.lineTo(9,0);c.lineTo(0,8);c.lineTo(-9,0);c.fill();c.restore();
 }
 landmark(s,w,o,t){
  const c=this.ctx,z=this.zoom,m=w.marks[o.mark],spec=chapterSpec(w.chapter);if(!m)return;
  c.save();c.translate(s.x,s.y);c.scale(z,z);
  const col=m.done?'#889388':spec.color;
  c.fillStyle='#273532';c.beginPath();c.ellipse(0,0,17,6,0,0,7);c.fill();
  c.fillStyle='#665647';c.fillRect(-4,-28,8,28);c.strokeStyle=col;c.lineWidth=3;c.fillStyle=col;c.beginPath();
  switch(w.chapter){
   case 2:case 3:case 6:c.moveTo(-8,-28);c.quadraticCurveTo(-14,-39,1,-48+Math.sin(t*7)*4);c.quadraticCurveTo(13,-33,6,-28);break;
   case 4:case 8:c.moveTo(0,-52);c.lineTo(12,-37);c.lineTo(0,-23);c.lineTo(-12,-36);break;
   case 5:c.moveTo(-10,-29);c.bezierCurveTo(-17,-45,3,-33,10,-52);c.quadraticCurveTo(15,-29,-10,-29);break;
   case 7:c.moveTo(-13,-28);c.quadraticCurveTo(-8,-30,-8,-38);c.bezierCurveTo(-8,-53,8,-53,8,-38);c.quadraticCurveTo(8,-30,13,-28);break;
   case 9:c.arc(0,-32,10,0,7);c.stroke();c.beginPath();c.moveTo(-9,-32);c.lineTo(9,-32);c.moveTo(0,-42);c.lineTo(0,-22);c.stroke();break;
   default:c.moveTo(0,-52);c.lineTo(23,-47+Math.sin(t*2)*2);c.lineTo(14,-39);c.lineTo(0,-40);break;
  }c.fill();if(!m.done){c.globalAlpha=.35;c.beginPath();c.ellipse(0,0,20+Math.sin(t*3)*2,7,0,0,7);c.stroke();}
  c.restore();
 }
 falconPennants(s,height,t){
  const c=this.ctx,k=height/476;c.save();c.translate(s.x,s.y-height);c.scale(k,k);
  for(const [x,y] of [[112-260,27],[376-260,7]]){
   c.strokeStyle='#c5ae78';c.lineWidth=2;c.beginPath();c.moveTo(x,y+5);c.lineTo(x,y-12);c.stroke();
   const wave=Math.sin(3*t+x)*3;
   c.fillStyle='#84353d';c.beginPath();c.moveTo(x,y-12);
   c.bezierCurveTo(x+11,y-16+wave,x+23,y-6-wave,x+35,y-10+wave);
   c.lineTo(x+27,y-4+wave);c.lineTo(x+34,y+wave);c.quadraticCurveTo(x+18,y+5-wave,x,y-2);c.fill();
   c.strokeStyle='#ddc389';c.lineWidth=1.4;c.beginPath();c.moveTo(x+3,y-9);c.quadraticCurveTo(x+12,y-12+wave,x+23,y-6);c.stroke();
  }
  c.restore();
 }
 knownTerrain(w,p){
  if(!w.falkenstein&&!w.campaign)return null;
  if(this.knownWorld!==w){this.knownWorld=w;this.knownCount=0;this.chart=new Uint8Array(w.w*w.h);this.chartCells=[];this.lastRevealedCell=-1;}
  const reveal=cell=>{
   const cx=cell%w.w,cy=Math.floor(cell/w.w);
   for(let y=Math.max(0,cy-3);y<=Math.min(w.h-1,cy+3);y++)
    for(let x=Math.max(0,cx-3);x<=Math.min(w.w-1,cx+3);x++)
     if((x-cx)**2+(y-cy)**2<=10){
      const id=y*w.w+x;
      if(!this.chart[id]){this.chart[id]=1;this.chartCells.push(id);}
     }
  };
  while(this.knownCount<w.explored.length)reveal(w.explored[this.knownCount++]);
  const cell=Math.floor(p.y)*w.w+Math.floor(p.x);
  if(cell!==this.lastRevealedCell){reveal(cell);this.lastRevealedCell=cell;}
  return this.chart;
 }
 objectiveArrow(){const g=this.game;if(g.mode!=='play')return;const w=g.world,target=w.inside?(w.bossDead?w.princess:w.enemies.find(e=>e.boss&&!e.dead)):w.exit;if(!target||(w.falkenstein||w.campaign)&&(!w.inside?!w.gateSeen:!this.knownTerrain(w,g.player)[Math.floor(target.y)*w.w+Math.floor(target.x)]))return;const s=this.project(target.x,target.y);if(s.x>60&&s.x<this.width-60&&s.y>125&&s.y<this.height-110)return;const dx=s.x-this.width/2,dy=s.y-this.height/2,a=Math.atan2(dy,dx),r=Math.min((this.width/2-65)/Math.max(.01,Math.abs(Math.cos(a))),(this.height/2-140)/Math.max(.01,Math.abs(Math.sin(a)))),x=this.width/2+Math.cos(a)*r,y=this.height/2+Math.sin(a)*r,c=this.ctx;c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#e8cf93';c.beginPath();c.moveTo(10,0);c.lineTo(-6,-6);c.lineTo(-3,0);c.lineTo(-6,6);c.fill();c.restore();}
 map(canvas,large=false){if(!this.game.state)return;const w=this.game.world,p=this.game.player,B=sceneBiome(w),c=canvas.getContext('2d'),size=canvas.width,scale=(size-16)/Math.max(w.w,w.h),ox=8,oy=8,known=this.knownTerrain(w,p);
  this.mapLayers??=new WeakMap();
  let layer=this.mapLayers.get(canvas);
  const cells=known?this.chartCells:null;
  if(!layer||layer.world!==w||layer.size!==size||layer.cells!==cells||layer.unsealed!==w.unsealed){
   const surface=layer?.surface||document.createElement('canvas');
   if(surface.width!==size||surface.height!==size)surface.width=surface.height=size;
   const bg=surface.getContext('2d');
   bg.fillStyle='#111f20';bg.fillRect(0,0,size,size);
   layer={surface,world:w,size,cells,painted:0,unsealed:w.unsealed};this.mapLayers.set(canvas,layer);
  }
  const count=cells?cells.length:w.w*w.h;
  if(layer.painted<count){
   const bg=layer.surface.getContext('2d'),floor=w.inside?'#859499':rdMix(B.ground,'#ffffff',.12);
   while(layer.painted<count){
    const index=layer.painted++,cell=cells?cells[index]:index,x=cell%w.w,y=Math.floor(cell/w.w);
    const tile=w.grid[y][x];
    bg.fillStyle=tile===1?'#283737':tile===2?B.water.mid:tile>=3?(w.inside?'#b4a87e':B.path.hi):floor;
    const left=Math.round(x*scale),top=Math.round(y*scale);
    bg.fillRect(ox+left,oy+top,Math.round((x+1)*scale)-left,Math.round((y+1)*scale)-top);
   }
  }
  c.drawImage(layer.surface,0,0);
  const dot=(o,color,r)=>{if(known&&!known[Math.floor(o.y)*w.w+Math.floor(o.x)])return;c.fillStyle=color;c.beginPath();c.arc(ox+o.x*scale,oy+o.y*scale,r,0,7);c.fill();};if(!(w.falkenstein||w.campaign)||w.inside||w.gateSeen)dot(w.exit,'#e9cd8e',large?6:3);for(const ch of w.chests)if(!ch.opened)dot(ch,'#c9a964',large?3:1.5);for(const e of w.enemies)if(!e.dead&&(large||Math.hypot(e.x-p.x,e.y-p.y)<8))dot(e,e.boss?'#e393c4':e.elite?'#e8c46a':'#c67b67',e.boss?4:large?2.5:1.5);if(w.princess)dot(w.princess,'#eadcc3',large?4:2);dot(p,'#c6edee',large?5:3);}
}
