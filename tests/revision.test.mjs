import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {encode,decode} from '../src/storage.js';
import {updateErrand} from '../src/errands.js';
import {AudioEngine} from '../src/audio.js';
import {flowField,direction,move,enemy,DIFFICULTY} from '../src/world.js';
import {updateEnemies} from '../src/ai.js';

function chapter(n,seed=73){
 const g=new Game();g.persist=()=>true;g.newGame(seed);g.state.chapter=n;g.createChapter();return g;
}
test('level five save without optional quest resumes and awards the two seals exactly once',()=>{
 const g=chapter(5),w=g.world;w.marks[0].done=true;w.chests[0].opened=true;
 const copy=decode(encode(g.state));g.state=copy;const gold=g.player.gold;
 updateErrand(g,.05);assert.equal(g.world.errand.progress,1);
 g.world.chests[1].opened=true;updateErrand(g,.05);
 assert.ok(g.world.errand.done);g.state=decode(encode(g.state));updateErrand(g,.05);
 assert.equal(g.player.gold,gold+18);assert.ok(g.world.marks[0].done);
});
test('beacon resets outside the circle and moth requires arrival at the gate',()=>{
 const g=chapter(4),post=g.world.marks[0];post.done=true;Object.assign(g.player,{x:post.x,y:post.y});
 updateErrand(g,2);g.player.x+=5;updateErrand(g,.05);assert.equal(g.world.errand.progress,0);
 g.player.x=post.x;updateErrand(g,4);assert.ok(g.world.errand.done);
 const h=chapter(6);h.world.marks[0].done=true;updateErrand(h,.05);
 Object.assign(h.player,h.world.exit);updateErrand(h,.05);assert.ok(!h.world.errand.done);
 for(let i=0;i<1000;i++)updateErrand(h,.05);
 assert.ok(h.world.errand.done);
});
test('navigation in chapter eight gets past the trunk on the route to the castle',()=>{
 const g=chapter(8,14297),w=g.world,p=g.player;
 Object.assign(p,{x:38.073249190601786,y:13.230315929407977});
 const field=flowField(w,w.exit);
 for(let i=0;i<1200&&Math.hypot(p.x-w.exit.x,p.y-w.exit.y)>1;i++){
  const d=direction(w,p,w.exit,field),l=Math.hypot(d.x,d.y)||1;move(w,p,.14*d.x/l,.14*d.y/l);
 }
 assert.ok(Math.hypot(p.x-w.exit.x,p.y-w.exit.y)<1);
});
test('sharpshooter locks its shot and drummer shortens an ally recovery',()=>{
 function setup(type,variant){
  const g=chapter(5),w=g.world;w.grid=w.grid.map(row=>row.map(()=>0));
  Object.assign(g.player,{x:14,y:10});const e=enemy(type,10,10,5,'test',DIFFICULTY.normal);
  Object.assign(e,{variant,cooldown:0});w.enemies=[e];return {g,w,e};
 }
 const {g,e}=setup('archer','sharpshooter');updateEnemies(g,.05);assert.equal(e.atk,'snipe');
 const angle=e.aim;g.player.y+=3;e.timer=.01;updateEnemies(g,.05);
 assert.equal(g.projectiles.length,1);assert.equal(Math.atan2(g.projectiles[0].vy,g.projectiles[0].vx),angle);
 const d=setup('skeleton','drummer'),ally=enemy('bandit',11,10,5,'friend');
 ally.cooldown=3;d.w.enemies.push(ally);updateEnemies(d.g,.05);assert.equal(d.e.atk,'rally');
 d.e.timer=.01;updateEnemies(d.g,.05);assert.ok(ally.cooldown<2.4);assert.ok(d.e.rallyCd>6);
});
test('four music cues have distinct patterns, pause silences the score and resuming skips missed beats',()=>{
 const a=new AudioEngine();a.context={state:'running',currentTime:0};let volume;
 a.scoreBus={gain:{setTargetAtTime(v){volume=v;}}};let sounds=[];
 a.tone=(...args)=>sounds.push(args);
 const patterns=new Set();
 for(const [boss,inside,combat] of [[false,false,false],[false,true,false],[false,false,true],[true,true,true]]){
  a.update(false);sounds=[];
  for(let i=0;i<48;i++){a.context.currentTime+=.1;a.update(true,boss,inside,5,combat);}
  patterns.add(JSON.stringify(sounds.map(x=>[x[0],x[1],x[3]])));assert.ok(sounds.length>10);
 }
 assert.equal(patterns.size,4);a.update(false);assert.equal(volume,0);
 sounds=[];a.context.currentTime+=300;a.update(true);assert.ok(sounds.length>0&&sounds.length<6);
});
