import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {makeItem} from '../src/items.js';
import {Renderer} from '../src/render.js';
import {enemy} from '../src/world.js';
import {touchAim} from '../src/touch.js';
import {trackBowTargets} from '../src/archery.js';

function range(){
 const g=new Game();g.persist=()=>true;g.newGame(73);
 const w=g.world,p=g.player;
 w.grid=w.grid.map(row=>row.map(()=>0));w.decor=[];w.enemies=[];w.traps=[];w.drops=[];w.chests=[];
 Object.assign(p,{x:12.5,y:12.5,face:{x:1,y:0}});
 p.equipment.weapon=makeItem(()=>.2,1,'practice-bow',{slot:'weapon',kind:'bow'});
 const target=(x,y)=>{
  const e=enemy('bandit',x,y,1,'target'+w.enemies.length);
  e.root=true;w.enemies.push(e);return e;
 };
 return {g,w,p,target};
}

test('touch bow leads a crossing enemy, hits at three distances and does not home after release',()=>{
 for(const distance of [4,7,10])for(const speed of [-2,2]){
  const {g,w,p,target}=range(),e=target(p.x+distance,p.y-speed*.04);
  trackBowTargets(w.enemies,.04);e.y+=speed*.04;trackBowTargets(w.enemies,.04);
  g.input.aim=touchAim(g,{x:1,y:0});assert.equal(g.bowTarget.entity,e);
  assert.ok(g.input.aim.y*speed>0);g.attack();
  const shot=g.projectiles[0],dir=[shot.vx,shot.vy];
  for(let i=0;i<45;i++){e.y+=speed/60;g.update(1/60);}
  assert.deepEqual([shot.vx,shot.vy],dir);
  assert.ok(e.hp<e.maxHp,`distance ${distance} speed ${speed}`);
 }
});
test('wall blocks assistance and arrows, narrow grazing shots hit and clean misses pass',()=>{
 for(const [wall,offset,shouldHit] of [[true,0,false],[false,.38,true],[false,1,false]]){
  const {g,w,p,target}=range(),e=target(p.x+5,p.y+offset);
  if(wall){w.grid[Math.floor(p.y)][Math.floor(p.x)+2]=1;
   touchAim(g,{x:1,y:0});assert.equal(g.bowTarget,null);}
  g.input.aim={x:1,y:0};g.attack();
  for(let i=0;i<30;i++)g.update(1/60);
  assert.equal(e.hp<e.maxHp,shouldHit);
 }
});
test('mouse can aim at the visible torso, aim into empty space and ignore a hidden or distant target',()=>{
 const {g,w,p,target}=range(),e=target(p.x+5,p.y);
 const r=Object.create(Renderer.prototype);
 Object.assign(r,{game:g,width:812,height:740,zoom:.8,camera:{x:0,y:0}});
 const feet=r.project(e.x,e.y),pointer={x:feet.x,y:feet.y-130*.8*.45};
 const hit=r.pointerAim(pointer);assert.equal(g.bowTarget.entity,e);assert.equal(hit.y,0);
 r.pointerAim({x:pointer.x+150,y:pointer.y});assert.equal(g.bowTarget,null);
 w.grid[Math.floor(p.y)][Math.floor(p.x)+2]=1;
 r.pointerAim(pointer);assert.equal(g.bowTarget,null);
 w.grid[Math.floor(p.y)][Math.floor(p.x)+2]=0;e.x=p.x+12;
 touchAim(g,{x:1,y:0});assert.equal(g.bowTarget,null);
});
test('touch prefers the intended side and drops a lock when its target dies',()=>{
 const {g,p,target}=range(),back=target(p.x-6,p.y),front=target(p.x+6,p.y);
 touchAim(g,{x:1,y:0});assert.equal(g.bowTarget.entity,front);
 front.dead=true;touchAim(g,{x:-1,y:0});assert.equal(g.bowTarget.entity,back);
});
