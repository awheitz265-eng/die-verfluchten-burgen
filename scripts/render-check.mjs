import {createRequire} from 'node:module';import {writeFile,mkdir} from 'node:fs/promises';
// Renders the real runtime scenes: every biome outdoors, every boss arena mid-attack, plus the static sprite atlas.
const require=createRequire(process.env.RUNTIME_PACKAGE_ROOT+'/package.json');const {createCanvas}=require('@napi-rs/canvas');
globalThis.document={createElement:()=>createCanvas(160,200)};globalThis.window={addEventListener:()=>{}};globalThis.innerWidth=1600;globalThis.innerHeight=1000;globalThis.devicePixelRatio=1;
const data=new Map();globalThis.localStorage={setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)};
const {Game}=await import('../src/game.js');const {Renderer}=await import('../src/render.js');
const g=new Game(),canvas=createCanvas(1600,1000);canvas.style={};const r=new Renderer(canvas,g);await mkdir('qa',{recursive:true});
const only=process.argv[2]?process.argv[2].split(',').map(Number):[1,2,3,4,5,6];
const shot=async(name,format='jpeg')=>{r.camera={x:0,y:0};r.lastWorld=null;r.draw(.016);r.draw(.016);await writeFile('qa/'+name+(format==='png'?'.png':'.jpg'),format==='png'?canvas.toBuffer('image/png'):canvas.toBuffer('image/jpeg',82));};
for(const chapter of only){
 g.newGame(73);g.state.chapter=chapter;g.createChapter();g.time=4;
 // Stand on the trail near the middle of the map so path, liquid and decoration are all visible.
 g.player.x=24.5;g.player.y=30.5;g.player.face={x:1,y:-1};
 await shot('biome-'+chapter);
 if(chapter===1){await shot('forest','png');Object.assign(g.player,{x:g.world.exit.x+1.5,y:g.world.exit.y+2.5,face:{x:-1,y:-1}});await shot('castle-outside');}
 g.enter();const boss=g.world.enemies.find(e=>e.boss);Object.assign(g.player,{x:boss.x-3,y:boss.y+3,hp:9999,face:{x:1,y:-1}});g.player.invulnerable=1;
 boss.cooldown=0;g.world.enemies=[boss];
 for(let i=0;i<400&&boss.state!=='windup';i++){g.player.invulnerable=1;g.update(.05);}
 await shot('boss-'+chapter);
 if(chapter===1){g.world.enemies=[];g.player.x=35.5;g.player.y=11.5;await shot('castle','png');
  // Death animation: three foes killed at staggered moments show buckling, falling and fading.
  const {enemy}=await import('../src/world.js');const foes=[['skeleton',1.6,.4,.25],['knight',1.4,-1.2,.62],['bandit',-.3,1.7,1.0]].map(([t,dx,dy,age],i)=>{const e=enemy(t,g.player.x+dx,g.player.y+dy,1,'d'+i);g.world.enemies.push(e);g.damageEnemy(e,9999,false,g.player);e.deadAt=g.time-age;return e;});await shot('death');}
}
const atlas=createCanvas(1800,900),c=atlas.getContext('2d');c.fillStyle='#283a34';c.fillRect(0,0,1800,900);let i=0;for(const[name,sprite]of Object.entries(r.art)){const x=(i%9)*200,y=Math.floor(i/9)*400;c.drawImage(sprite,x,y,180,250);c.fillStyle='#eee2c3';c.font='18px sans-serif';c.fillText(name,x+15,y+280);i++;}await writeFile('qa/sprites.png',atlas.toBuffer('image/png'));
console.log('Rendered biome and boss scenes to qa/.');
