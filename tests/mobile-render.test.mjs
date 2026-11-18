import test from 'node:test';
import assert from 'node:assert/strict';
import {Renderer} from '../src/render.js';

test('fold, rotation, same-size resize and desktop preserve projection and bitmap limits',()=>{
 const renderer=Object.create(Renderer.prototype);
 renderer.canvas={style:{},clientWidth:812,clientHeight:740};
 renderer.mobile=true;
 const old=Object.getOwnPropertyDescriptor(globalThis,'devicePixelRatio');
 Object.defineProperty(globalThis,'devicePixelRatio',{value:3,configurable:true});
 try{
  for(const [width,height] of [[812,740],[740,812],[360,790],[865,714],[1000,920]]){
   Object.assign(renderer.canvas,{clientWidth:width,clientHeight:height});
   renderer.resize();
   assert.ok(renderer.canvas.width*renderer.canvas.height<=1102000);
   assert.equal(renderer.width,width);assert.equal(renderer.height,height);
   renderer.camera={x:419,y:713};
   const point=renderer.project(12,17),world=renderer.unproject(point.x,point.y);
   assert.ok(Math.abs(world.x-12)<1e-7&&Math.abs(world.y-17)<1e-7);
   renderer.groundCache={};const cache=renderer.groundCache;
   renderer.resize();assert.equal(renderer.groundCache,cache);
  }
  renderer.mobile=false;renderer.resize();assert.equal(renderer.dpr,2);
 }finally{if(old)Object.defineProperty(globalThis,'devicePixelRatio',old);else delete globalThis.devicePixelRatio;}
});

test('mobile terrain reuses stationary frames, follows the camera and refreshes across worlds',()=>{
 const prev=globalThis.document;
 const context={setTransform(){},clearRect(){}};
 globalThis.document={createElement:()=>({getContext:()=>context})};
 try{
  const renderer=Object.create(Renderer.prototype);
  const draws=[];let repaints=0,liquidFrames=0,bridges=0;
  Object.assign(renderer,{mobile:true,width:812,height:740,camera:{x:17,y:32},ctx:{drawImage:(...args)=>draws.push(args)},
   project:()=>({x:0,y:0}),treeShadows(){},paintGround(){assert.equal(this.ctx,context);repaints++;},liquidDetail(){liquidFrames++;},
   bridgesOf:()=>[{}],bridge(){bridges++;}});
  const world={};const frame=w=>renderer.outdoorTerrain(w,{},0,[],1);
  frame(world);frame(world);renderer.camera.x+=21;frame(world);
  assert.equal(repaints,1);assert.equal(draws[2][1],-77);
  renderer.camera.y+=90;frame(world);assert.equal(repaints,2);
  world.unsealed=true;frame(world);assert.equal(repaints,3);frame({});assert.equal(repaints,4);assert.equal(liquidFrames,6);assert.equal(bridges,6);
 }finally{globalThis.document=prev;}
});

test('walking covers the same distance at 10, 15, 30 and 60 rendered frames per second',async()=>{
 const {Game,advanceGame}=await import('../src/game.js');
 const distances=[];
 for(const fps of [10,15,30,60]){
  const g=new Game();g.newGame(73);const w=g.world;
  w.grid=w.grid.map(row=>row.map(()=>0));w.enemies=[];w.decor=[];w.drops=[];w.chests=[];
  Object.assign(g.player,{x:20,y:20});g.input.x=1;g.input.y=0;
  for(let i=0;i<fps*2;i++)advanceGame(g,1/fps);
  distances.push(g.player.x-20);
 }
 assert.ok(distances[0]>1);
 for(const distance of distances)assert.ok(Math.abs(distance-distances[0])<1e-7);
});
