import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {generateWorld,flood} from '../src/world.js';
import {nextMark,unlockArena} from '../src/campaign.js';
import {decode,encode} from '../src/storage.js';

test('on 64 seeds every campaign clue is reachable and the two mechanisms protect their arenas',()=>{
 for(let chapter=2;chapter<=10;chapter++)for(let seed=1;seed<=64;seed++){
  const outside=generateWorld(seed,chapter),inside=generateWorld(seed,chapter,true);
  const accessible=(cells,p)=>cells.has(Math.floor(p.y)*64+Math.floor(p.x));
  const route=flood(outside);
  for(const p of [...outside.marks,outside.exit])assert.ok(accessible(route,p));
  if(!inside.seal)continue;
  const locked=flood(inside);
  assert.ok(!accessible(locked,inside.princess));
  for(const mark of inside.marks)assert.ok(accessible(locked,mark));
  unlockArena(inside);
  assert.ok(accessible(flood(inside),inside.princess));
 }
});

test('clues, twins, chapter rewards and the final victory persist across the full campaign',()=>{
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const g=new Game();g.newGame(73);
 for(let chapter=1;chapter<=10;chapter++){
  assert.equal(g.state.chapter,chapter);
  const outside=g.world;
  if(nextMark(outside)){
   Object.assign(g.player,outside.exit);g.interact();assert.equal(g.state.area,'outside');
   while(nextMark(outside)){Object.assign(g.player,nextMark(outside));g.interact();}
  }
  Object.assign(g.player,outside.exit);g.interact();assert.equal(g.state.area,'inside');
  while(nextMark(g.world)){Object.assign(g.player,nextMark(g.world));g.interact();}
  if(g.world.seal)assert.ok(g.world.unsealed);
  const bosses=g.world.enemies.filter(e=>e.boss);
  assert.equal(bosses.length,chapter===8?2:1);
  for(const [index,e] of bosses.entries()){g.damageEnemy(e,999999);assert.equal(g.world.bossDead,index===bosses.length-1);}
  Object.assign(g.player,g.world.princess);g.interact();
  assert.equal(decode(encode(g.state)).rescued,chapter);
  if(chapter<10){assert.equal(g.mode,'shop');g.nextChapter();}
 }
 assert.equal(g.mode,'victory');const saved=new Game();assert.ok(saved.resume());assert.equal(saved.mode,'victory');
 saved.nextChapter();assert.equal(saved.state.chapter,10);
});
