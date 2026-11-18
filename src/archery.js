import {lineOfSight} from './world.js';

export const ARROW_SPEED=17;
export const ARROW_CLEARANCE=.05;

// Motion is transient and keyed by the actual enemy, including each mirror knight separately.
const motion=new WeakMap();
export function trackBowTargets(enemies,dt){
 if(dt<=0)return;
 for(const e of enemies){
  if(e.dead)continue;
  let m=motion.get(e);
  if(!m){motion.set(e,{x:e.x,y:e.y,vx:0,vy:0});continue;}
  const vx=(e.x-m.x)/dt,vy=(e.y-m.y)/dt;
  const moving=vx*vx+vy*vy<=100;
  m.vx=moving?vx:0;m.vy=moving?vy:0;m.x=e.x;m.y=e.y;
 }
}
export function bowDirection(world,origin,target){
 const dx=target.x-origin.x,dy=target.y-origin.y,m=motion.get(target);
 if(!m)return {x:dx,y:dy};
 const closing=ARROW_SPEED**2-m.vx**2-m.vy**2;
 const dot=dx*m.vx+dy*m.vy;
 const time=Math.min(.75,(dot+Math.sqrt(dot*dot+closing*(dx*dx+dy*dy)))/closing);
 const predicted={x:target.x+m.vx*time,y:target.y+m.vy*time};
 return lineOfSight(world,origin,predicted,ARROW_CLEARANCE)?{x:predicted.x-origin.x,y:predicted.y-origin.y}:{x:dx,y:dy};
}
// A lower score wins. Touch weighs direction and distance; mouse scoring uses the visible silhouette.
export function selectBowTarget(game,score){
 const origin=game.player,w=game.world,range=game.stats.weapon.range;
 let best=null,lowest=Infinity;
 for(const e of w.enemies){
  const dx=e.x-origin.x,dy=e.y-origin.y,dist=Math.hypot(dx,dy);
  if(e.dead||dist>range||dist<.001)continue;
  const value=score(e,dx,dy,dist)*(e===game.bowTarget?.entity? .82:1);
  if(value<lowest&&lineOfSight(w,origin,e,ARROW_CLEARANCE)){best=e;lowest=value;}
 }
 if(!best)game.bowTarget=null;else if(game.bowTarget?.entity!==best||game.bowTarget.world!==w)game.bowTarget={world:w,entity:best};
 return best;
}
