import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {Renderer} from '../src/render.js';
import {makeFigures} from '../src/figures.js';

function installDocument(t,createElement){
 const original=Object.getOwnPropertyDescriptor(globalThis,'document');
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement}});
 t.after(()=>{if(original)Object.defineProperty(globalThis,'document',original);else delete globalThis.document;});
}

test('revisiting explored ground costs zero map tile paints and unlocking refreshes both maps',t=>{
 let paints=0;
 const context={fillRect(){paints++;},drawImage(){},beginPath(){},arc(){},fill(){}};
 const canvas=(width=160)=>({width,height:width,getContext:()=>context});
 installDocument(t,()=>canvas());
 const g=new Game();g.newGame(73);
 const r=Object.assign(Object.create(Renderer.prototype),{game:g});
 const small=canvas(),large=canvas(550),w=g.world;
 w.explored=[];
 function visit(x,y){Object.assign(g.player,{x:x+.5,y:y+.5});w.explored.push(y*w.w+x);r.map(small);}
 visit(12,12);const initial=paints;
 visit(13,12);assert.ok(paints>initial&&paints-initial<initial);
 r.map(large,true);const complete=paints;
 Object.assign(g.player,{x:12.5,y:12.5});
 for(let n=0;n<100;n++){r.map(small);r.map(large,true);}
 assert.equal(paints,complete);
 w.unsealed=!w.unsealed;r.map(small);const repainted=paints-complete;
 assert.ok(repainted>initial);r.map(large,true);assert.equal(paints-complete,2*repainted);
 g.enter();r.map(small);assert.equal(r.knownWorld,g.world);
 g.enter();r.map(small);assert.ok(r.chart[12*w.w+12]);
});

test('summoned corpses expire after their animation, original opponents keep their state',()=>{
 const g=new Game();g.newGame(73);
 const w=g.world,base={...w.enemies[0],hp:0,dead:true,deadAt:0},minion={...base,minion:true};
 w.enemies=[base,minion];g.update(.05);assert.ok(w.enemies.includes(minion));
 for(let frame=0;frame<65;frame++)g.update(.05);
 assert.deepEqual(w.enemies,[base]);
});

test('desktop animation frame eviction releases old bitmaps and respects the RGBA budget',t=>{
 const surfaces=[],grad=()=>({addColorStop(){}});
 const ctx=new Proxy({createRadialGradient:grad,createLinearGradient:grad},{get:(o,k)=>o[k]??(()=>{})});
 const cv=()=>{const surface={width:0,height:0,getContext:()=>ctx};surfaces.push(surface);return surface;};
 installDocument(t,cv);
 const figures=makeFigures(false),names=figures.names();
 const first=figures.get(names[0]);
 for(const name of names.slice(1,250))figures.get(name);
 assert.equal(first.width,1);
 const active=surfaces.filter(s=>s.width>1).slice(); // includes two finishing layers
 assert.ok((active.length-2)*256*280*4<=48*1024*1024);
 assert.ok(figures.get(names[0]).width===256);
});
