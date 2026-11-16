import test from 'node:test';
import assert from 'node:assert/strict';
import {heroFrame,enemyFrame} from '../src/animation.js';
test('hero contact pose matches immediate damage and recovers before idle',()=>{
 const stats={kind:'spear',weapon:{cooldown:.58}},p={cooldown:.58};
 assert.equal(heroFrame(p,stats,{},0),'hero-spear-attack-4');p.cooldown=.01;
 assert.equal(heroFrame(p,stats,{},0),'hero-spear-attack-7');p.cooldown=0;
 assert.equal(heroFrame(p,stats,{},0),'hero-spear-idle-0');
});
test('enemy anticipates damage during windup and shows contact during recovery',()=>{
 const e={type:'knight',state:'windup',timer:.95,x:0};
 assert.equal(enemyFrame(e,0,false),'knight-attack-0');e.timer=.01;
 assert.equal(enemyFrame(e,0,false),'knight-attack-3');e.state='recover';e.cooldown=1.8;
 assert.equal(enemyFrame(e,0,false),'knight-attack-4');e.hit=.16;
 assert.equal(enemyFrame(e,0,false),'knight-hit-0');
});
