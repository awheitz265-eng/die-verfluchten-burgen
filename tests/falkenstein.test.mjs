import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,weaponTouches} from '../src/game.js';
import {generateWorld,passable,terrainContact,circleContact,flowField} from '../src/world.js';
import {encode,decode} from '../src/storage.js';
import {Renderer} from '../src/render.js';
const memory=new Map();
globalThis.localStorage={setItem:(k,v)=>memory.set(k,v),getItem:k=>memory.get(k)};

test('seven-slot belt and escalating prices survive save and reject excess purchases',()=>{
 const g=new Game();g.newGame(73);g.rescue();g.player.potions=0;g.player.gold=10000;
 const prices=[];
 for(let i=0;i<7;i++){prices.push(g.potionPrice);assert.equal(g.transact('potion'),true);}
 assert.deepEqual(prices,[40,65,90,115,140,165,190]);
 assert.equal(g.player.potions,7);
 const gold=g.player.gold;assert.equal(g.transact('potion'),false);assert.equal(g.player.gold,gold);
 const reloaded=new Game();assert.equal(reloaded.resume(),true);
 assert.equal(reloaded.potionPrice,215);assert.equal(reloaded.player.potions,7);
});

test('full and legacy belts keep ground and chest potions available',()=>{
 const g=new Game();g.newGame(52);g.player.potions=50;
 const drop={x:g.player.x,y:g.player.y,potion:true};g.world.drops.push(drop);
 g.pickup(drop);assert.equal(g.player.potions,50);assert.ok(g.world.drops.includes(drop));
 const c=g.world.chests[0];Object.assign(g.player,{x:c.x,y:c.y});g.interact();
 assert.equal(g.player.potions,50);assert.ok(g.world.drops.some(d=>d.potion&&d.x===c.x));
 const saved=JSON.parse(encode(g.state));delete saved.state.potionPurchases;
 assert.equal(decode(JSON.stringify(saved)).player.potions,50);
 g.player.potions=6;g.pickup(drop);assert.equal(g.player.potions,7);
});

test('trunk clearance, diagonal stone contact and swept projectile collisions',()=>{
 const w={w:8,h:8,grid:Array.from({length:8},()=>Array(8).fill(0)),decor:[{type:'tree',x:3.5,y:3.5}],falkenstein:true};
 w.grid[3][3]=1;
 assert.equal(passable(w,3.5,3.5,.2),false);
 assert.equal(passable(w,3.03,3.03,.2),true);
 assert.ok(terrainContact(w,1,3.5,5,0,.05)<.5);
 assert.equal(terrainContact(w,1,3.03,5,0,.05),Infinity);
 w.inside=true;
 assert.equal(passable(w,2.9,2.9,.2),false);
 assert.equal(passable(w,2.84,2.84,.2),true);
 assert.ok(terrainContact(w,1,3.5,5,0,.05)<circleContact(1,3.5,5,0,5,3.5,.3));
 assert.equal(circleContact(1,1,5,0,3,1,.3),.34);
});

test('melee arc includes a grazed target and excludes targets behind the hero',()=>{
 const p={x:0,y:0},face={x:1,y:0};
 assert.equal(weaponTouches(p,face,2,Math.PI/2,{x:1,y:1.1,radius:.25}),true);
 assert.equal(weaponTouches(p,face,2,Math.PI/2,{x:-1,y:0,radius:.25}),false);
 assert.equal(weaponTouches(p,face,2,Math.PI/2,{x:2.4,y:0,radius:.25}),false);
});

test('Falkenstein landmarks, varied gates and radius-aware routes across 128 seeds',()=>{
 const gates=new Set(),layouts=new Set();
 for(let seed=0;seed<128;seed++){
  const w=generateWorld(seed,1),f=flowField(w,w.start);
  for(const target of [w.exit,w.sign,w.ford,...w.chests,...w.enemies]){
   assert.ok(f[Math.floor(target.y)*w.w+Math.floor(target.x)]>=0);
   assert.ok(passable(w,target.x,target.y,target.radius||.23));
  }
  gates.add(w.exit.x+','+w.exit.y);
  const inside=generateWorld(seed,1,true),field=flowField(inside,inside.start);
  assert.ok(field[Math.floor(inside.princess.y)*inside.w+Math.floor(inside.princess.x)]>=0);
  layouts.add(JSON.stringify(inside.rooms));
 }
 assert.ok(gates.size>20);assert.ok(layouts.size>4);
});

test('map keeps unexplored gate hidden and reveals visited surroundings',()=>{
 const g=new Game();g.newGame(73);
 const r=Object.create(Renderer.prototype),w=g.world,p=g.player;
 const at=o=>Math.floor(o.y)*w.w+Math.floor(o.x);
 assert.equal(r.knownTerrain(w,p)[at(w.exit)],0);
 w.explored.push(at(w.exit));
 assert.equal(r.knownTerrain(w,p)[at(w.exit)],1);
});

test('preview completes first chapter and can restart without advancing',()=>{
 const g=new Game();g.newGame(73);g.rescue();globalThis.FALKENSTEIN_PREVIEW=true;
 try{g.nextChapter();assert.equal(g.state.chapter,1);assert.equal(g.mode,'play');}
 finally{delete globalThis.FALKENSTEIN_PREVIEW;}
});
