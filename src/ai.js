import {move,passable,lineOfSight,direction,enemy,BOSSES} from './world.js';
// Enemy and boss behaviour. Ordinary enemies and bosses share one set of attack ids:
//   melee, cone, volley, nova, slam, charge, spiral, summon, blink, leap, rain.
// Every attack has a telegraph (e.tele) during its windup so the player can read it and dodge.
const AI_RANGED=['archer','mage','cultist'];
const AI_COOLDOWN={bandit:1.1,archer:1.2,skeleton:1,knight:1.8,mage:1.6,brute:2,assassin:1.5,cultist:1.5};
const AI_PREF={archer:4.8,mage:5,cultist:5.5,assassin:3,brute:1.2,knight:1.1};
const AI_BOSS_COLOR=['#e0a070','#a8e8a0','#ff9a50','#9fe0ff','#c590ff','#ff7a3a','#a2e6df','#ebc778','#c6baff','#8acfc6'];
const AI_BOSS_RANGE={gale:[0,9],echo:[0,10],cross:[0,12],hook:[1,12],iceLanes:[0,12],ward:[0,12],sweep:[0,4.2],slam:[0,8],charge:[3.2,12],nova:[0,12],fan:[1.5,12],spiral:[0,12],summon:[0,12],blink:[0,6],leap:[3,12],rain:[0,12]};
const AI_BOSS_ATTACK={sweep:'cone',fan:'volley'};
const aiBossIndex=e=>Number(e.type.slice(4));
const AI_BOSS_PARAMS={
 ward:()=>({windup:1.35}),gale:e=>({windup:1.1,range:9,arc:1.2,mult:1.1,kb:2.6}),echo:e=>({windup:1.1}),cross:e=>({windup:1.05}),hook:e=>({windup:1.15}),iceLanes:e=>({windup:1.25}),
 sweep:e=>({windup:.78-e.phase*.1,range:2.7,arc:2.3,mult:1.1,kb:.8,chain:1+Math.min(2,e.phase)}),
 slam:e=>({windup:1-e.phase*.12,r:3+e.phase*.4,mult:1.3,kb:1.4,ring:e.phase?8+e.phase*2:0}),
 charge:e=>({windup:.9-e.phase*.1,len:11,speed:10+e.phase*1.5,dur:.75,mult:1.4,kb:1.6}),
 nova:e=>({windup:1.05-e.phase*.1,n:12+e.phase*5,speed:4.6,mult:.85,color:AI_BOSS_COLOR[aiBossIndex(e)]}),
 fan:e=>({windup:.75,n:5+e.phase*2,spread:.21,speed:6.2,mult:.8,color:AI_BOSS_COLOR[aiBossIndex(e)]}),
 spiral:e=>({windup:1,dur:2.6,rate:.1,arms:2+e.phase,speed:4.2,mult:.62,color:AI_BOSS_COLOR[aiBossIndex(e)]}),
 summon:e=>({windup:1.2,types:BOSSES[aiBossIndex(e)].minions,n:2,max:4+e.phase}),
 blink:()=>({windup:.5,away:false}),
 leap:e=>({windup:.85-e.phase*.1,r:2.6,mult:1.35,dur:.5,kb:1.2}),
 rain:e=>({windup:1.3-e.phase*.12,n:6+e.phase*3,r:1.45,spread:4.6,mult:1})
};
export function aiMinions(g){return g.world.enemies.filter(m=>m.minion&&!m.dead).length;}
function aiFinish(e,cooldown,g){cooldown*=g?g.diff.cd:1;e.state='recover';e.recoverTotal=cooldown;e.cooldown=cooldown;e.tele=null;}
// Aim where the player will be: lead 0 aims at the current position, 1 fully predicts straight movement.
function aiAim(g,e,speed){const p=g.player,lead=g.diff.lead;if(!lead||!speed)return Math.atan2(p.y-e.y,p.x-e.x);const t=Math.min(1.2,Math.hypot(p.x-e.x,p.y-e.y)/speed)*lead;return Math.atan2(p.y+(p.vy||0)*t-e.y,p.x+(p.vx||0)*t-e.x);}
function aiLaunch(g,e,id,params){
 const p=g.player;
 e.state='windup';e.atk=id;e.atkp=params;e.timer=e.windup=Math.max(.2,params.windup*(e.elite?.88:1)*g.diff.wind);e.chain=params.chain||0;
 e.tx=p.x;e.ty=p.y;e.aim=Math.atan2(p.y-e.y,p.x-e.x);
 AI_ATTACKS[id].start(g,e,p);
 g.emit('enemyattack',{boss:e.boss,id});
}
function attackLines(e,offsets,angle=e.aim){
 const dx=Math.cos(angle),dy=Math.sin(angle);
 return offsets.map(side=>({k:'line',x:e.x-dy*side,y:e.y+dx*side,x2:e.x+dx*12-dy*side,y2:e.y+dy*12+dx*side,w:.75}));
}
function strikesLine(line,p){
 const dx=line.x2-line.x,dy=line.y2-line.y,t=((p.x-line.x)*dx+(p.y-line.y)*dy)/(dx*dx+dy*dy);
 return t>=0&&t<=1&&Math.hypot(p.x-line.x-t*dx,p.y-line.y-t*dy)<line.w+.2;
}
function resolveLines(g,e,p,lines){
 const hit=lines.some(l=>strikesLine(l,p)&&lineOfSight(g.world,{x:l.x,y:l.y},p));
 for(const l of lines)g.fx('shock',l.x2,l.y2,AI_BOSS_COLOR[aiBossIndex(e)],.45,{range:1.2});
 return hit;
}
const AI_ATTACKS={
 snipe:{
  start(g,e){e.tele=attackLines(e,[0]);e.tele[0].w=.23;},
  fire(g,e){g.shoot(e,{x:Math.cos(e.aim),y:Math.sin(e.aim)},e.damage*1.15,'enemy',9,'#ffcc87');}},
 rally:{
  start(g,e){e.tele=[{k:'c',x:e.x,y:e.y,r:3.8,soft:true}];},
  fire(g,e){for(const ally of g.world.enemies){
   if(ally===e||ally.dead||ally.boss||Math.hypot(ally.x-e.x,ally.y-e.y)>3.8)continue;
   ally.cooldown=Math.max(0,ally.cooldown-.75);
  }g.fx('shock',e.x,e.y,'#95d7cc',.55,{range:3.8});g.emit('rally');}},
 ward:{
  start(g,e){e.tele=[{k:'c',x:e.x,y:e.y,r:2,soft:true}];},
  fire(g,e){if(g.world.enemies.some(m=>m.root&&!m.dead))return;for(const side of [-1,1]){const x=e.x+side*1.8,y=e.y+.8;if(!passable(g.world,x,y,.3))continue;const m=enemy('skeleton',x,y,g.state.chapter,'root'+g.state.nextId++,g.diff);m.minion=true;m.root=true;m.hp=m.maxHp=Math.round(m.maxHp*.35);g.world.enemies.push(m);}g.notify('Die Dornenwurzeln schützen Vael. Zerschlage sie!');}},
 gale:{
  start(g,e){e.tele=[{k:'cone',x:e.x,y:e.y,a:e.aim,range:9,arc:1.2}];},
  fire(g,e,p){AI_ATTACKS.cone.fire(g,e,p);g.fx('shock',e.x,e.y,'#9de6e8',.7,{range:7});}},
 echo:{
  start(g,e){e.tele=[2.2,4.8,7.4].map(r=>({k:'c',x:e.x+Math.cos(e.aim)*r,y:e.y+Math.sin(e.aim)*r,r:1.65}));},
  fire(g,e,p,tele){for(const t of tele){g.fx('shock',t.x,t.y,'#edca85',.7,{range:t.r});}if(tele.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<t.r)&&lineOfSight(g.world,e,p))g.damagePlayer(e.damage*1.15,e,1);else e.exposed=1.7;}},
 cross:{
  start(g,e,p){const twin=g.world.enemies.find(o=>o!==e&&!o.dead&&o.type===e.type);e.tele=attackLines(e,[0]);if(twin&&Math.hypot(twin.x-e.x,twin.y-e.y)<10)e.tele.push(...attackLines(twin,[0],Math.atan2(p.y-twin.y,p.x-twin.x)));else e.exposed=1.2;},
  fire(g,e,p,tele){if(resolveLines(g,e,p,tele))g.damagePlayer(e.damage*(tele.length>1?1.35:.85),e,.7);}},
 hook:{
  start(g,e){e.tele=attackLines(e,[0]);},
  fire(g,e,p,tele){if(resolveLines(g,e,p,tele)){const d=Math.hypot(e.x-p.x,e.y-p.y)||1;const hp=p.hp;g.damagePlayer(e.damage,e);if(p.hp<hp)move(g.world,p,(e.x-p.x)/d*Math.min(2,d),(e.y-p.y)/d*Math.min(2,d));}else e.exposed=2;}},
 iceLanes:{
  start(g,e){e.tele=attackLines(e,[-2.6,0,2.6]);},
  fire(g,e,p,tele){if(resolveLines(g,e,p,tele))g.damagePlayer(e.damage*1.2,e,.3);}},

 melee:{
  start(g,e){e.tele=[{k:'c',x:e.x,y:e.y,r:e.atkp.r}];},
  fire(g,e,p){const q=e.atkp;if(Math.hypot(p.x-e.x,p.y-e.y)<q.r+.3&&lineOfSight(g.world,e,p))g.damagePlayer(e.damage*q.mult,e,q.kb||0);g.fx('slash',e.x,e.y,'#d78172',.2,{angle:Math.atan2(p.y-e.y,p.x-e.x),range:q.r,arc:2.4});}},
 cone:{
  start(g,e){const q=e.atkp;e.tele=[{k:'cone',x:e.x,y:e.y,a:e.aim,range:q.range,arc:q.arc}];},
  fire(g,e,p){const q=e.atkp,a=Math.atan2(p.y-e.y,p.x-e.x),diff=Math.abs(Math.atan2(Math.sin(a-e.aim),Math.cos(a-e.aim)));if(Math.hypot(p.x-e.x,p.y-e.y)<q.range+.3&&diff<q.arc/2&&lineOfSight(g.world,e,p))g.damagePlayer(e.damage*q.mult,e,q.kb||0);g.fx('slash',e.x,e.y,'#e0a07c',.28,{angle:e.aim,range:q.range,arc:q.arc});}},
 volley:{
  start(g,e){e.tele=[{k:'c',x:e.x,y:e.y,r:1.15,soft:true}];},
  fire(g,e,p){const q=e.atkp,base=aiAim(g,e,q.speed);for(let i=0;i<q.n;i++){const a=base+(i-(q.n-1)/2)*q.spread;g.shoot(e,{x:Math.cos(a),y:Math.sin(a)},e.damage*q.mult,'enemy',q.speed,q.color);}}},
 nova:{
  start(g,e){e.tele=[{k:'c',x:e.x,y:e.y,r:1.6,soft:true}];},
  fire(g,e){const q=e.atkp,off=g.time*.7;for(let k=0;k<q.n;k++){const a=off+k*Math.PI*2/q.n;g.shoot(e,{x:Math.cos(a),y:Math.sin(a)},e.damage*q.mult,'enemy',q.speed,q.color||'#bba0f0');}g.emit('nova');}},
 slam:{
  start(g,e,p){const q=e.atkp,c=q.self?e:p;e.sx=c.x;e.sy=c.y;e.tele=[{k:'c',x:c.x,y:c.y,r:q.r}];},
  fire(g,e,p){const q=e.atkp;if(Math.hypot(p.x-e.sx,p.y-e.sy)<q.r)g.damagePlayer(e.damage*q.mult,{x:e.sx,y:e.sy,unblockable:true},q.kb||0);g.fx('shock',e.sx,e.sy,'#d89b62',.55,{range:q.r});g.emit('slam');if(q.ring)for(let k=0;k<q.ring;k++){const a=k*Math.PI*2/q.ring;g.shoot({x:e.sx,y:e.sy},{x:Math.cos(a),y:Math.sin(a)},e.damage*.6,'enemy',4.6,'#e39a5f');}}},
 charge:{
  start(g,e,p){const q=e.atkp,a=Math.atan2(p.y-e.y,p.x-e.x);e.cdx=Math.cos(a);e.cdy=Math.sin(a);e.tele=[{k:'line',x:e.x,y:e.y,x2:e.x+e.cdx*q.len,y2:e.y+e.cdy*q.len,w:.9}];},
  fire(g,e){const q=e.atkp;e.state='charge';e.timer=q.dur;e.chit=false;return 'keep';}},
 spiral:{
  start(g,e){e.tele=[{k:'c',x:e.x,y:e.y,r:1.5,soft:true}];},
  fire(g,e){const q=e.atkp;e.state='channel';e.timer=q.dur;e.shot=0;e.ang=e.aim;return 'keep';}},
 summon:{
  start(g,e){e.tele=[{k:'c',x:e.x,y:e.y,r:2,soft:true}];},
  fire(g,e){const q=e.atkp,w=g.world;if(aiMinions(g)>=q.max)return;for(let k=0;k<q.n;k++){const type=q.types[Math.floor(g.random()*q.types.length)];for(let t=0;t<8;t++){const a=g.random()*Math.PI*2,r=1.3+g.random()*.8,x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;if(!passable(w,x,y,.3))continue;const m=enemy(type,x,y,g.state.chapter,'m'+g.state.nextId++,g.diff);m.hp=m.maxHp=Math.round(m.maxHp*.55);m.minion=true;m.state='chase';m.cooldown=1;w.enemies.push(m);g.fx('shock',x,y,'#b090e0',.5,{range:1});break;}}g.emit('summon');}},
 blink:{
  start(g,e,p){const q=e.atkp,w=g.world;let spot=null;for(let t=0;t<24&&!spot;t++){const a=g.random()*Math.PI*2,r=q.away?5.5+g.random()*1.5:2.6+g.random()*.8,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;if(passable(w,x,y,.4)&&(q.away||lineOfSight(w,{x,y},p)))spot={x,y};}
   e.blinkTarget=spot;e.tele=[{k:'c',x:e.x,y:e.y,r:1.2,soft:true}];if(spot)e.tele.push({k:'c',...spot,r:1.2});},
  fire(g,e){const q=e.atkp,spot=e.blinkTarget;
   if(spot){g.fx('shock',e.x,e.y,'#a99bd6',.4,{range:1.2});e.x=spot.x;e.y=spot.y;g.fx('shock',e.x,e.y,'#a99bd6',.4,{range:1.2});g.emit('blink');}
   if(!q.away){aiLaunch(g,e,'cone',{windup:.42,range:2.3,arc:2.4,mult:1.1,kb:.8,chain:0});return 'keep';}}},
 leap:{
  start(g,e,p){const q=e.atkp;e.lx=p.x;e.ly=p.y;e.tele=[{k:'c',x:p.x,y:p.y,r:q.r}];},
  fire(g,e){const q=e.atkp;e.state='leap';e.timer=q.dur;e.fromX=e.x;e.fromY=e.y;return 'keep';}},
 rain:{
  start(g,e,p){const q=e.atkp,list=[{k:'c',x:p.x,y:p.y,r:q.r}];for(let i=1;i<q.n;i++){const a=g.random()*Math.PI*2,r=g.random()*q.spread,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;if(passable(g.world,x,y,.1))list.push({k:'c',x,y,r:q.r});}e.tele=list;},
  fire(g,e,p,tele){const q=e.atkp;for(const t of tele||[]){if(Math.hypot(p.x-t.x,p.y-t.y)<t.r)g.damagePlayer(e.damage*q.mult,{x:t.x,y:t.y,unblockable:true},.6);g.fx('shock',t.x,t.y,'#d8a0ff',.45,{range:t.r});}g.emit('slam');}}
};
function aiResolve(g,e,p){
 const tele=e.tele;e.tele=null;
 const result=AI_ATTACKS[e.atk].fire(g,e,p,tele);
 if(result==='keep')return;
 if(e.chain>0){aiLaunch(g,e,e.atk,{...e.atkp,windup:e.atkp.windup*.55,chain:e.chain-1});return;}
 aiFinish(e,e.boss?(e.phase?.8:1.1):AI_COOLDOWN[e.type]*Math.max(.6,1-.035*(g.state.chapter-1)),g);
}
function aiBossPick(g,e,d){
 const def=BOSSES[aiBossIndex(e)];
 const finalKits=[['charge','sweep','slam'],['spiral','leap','summon'],['rain','nova','charge','spiral']];
 const kit=e.type==='boss5'&&g.world.campaign?finalKits[e.phase]:[...def.kit,...(e.phase>0?def.kit2:[])];
 const ok=id=>{const r=AI_BOSS_RANGE[id];return d>=r[0]&&d<=r[1]&&(id!=='summon'||aiMinions(g)<4)&&(id!=='ward'||!g.world.enemies.some(m=>m.root&&!m.dead));};
 let pool=kit.filter(id=>ok(id)&&id!==e.last);if(!pool.length)pool=kit.filter(ok);if(!pool.length)return null;
 return pool[Math.floor(g.random()*pool.length)];
}
function aiPhase(g,e){
 const ratio=e.hp/e.maxHp,phase=e.type==='boss5'?(ratio<.33?2:ratio<.66?1:0):(ratio<.5?1:0);
 if(phase>e.phase){e.phase=phase;e.speed*=1.1;e.cooldown=Math.min(e.cooldown,.6);g.notify(BOSSES[aiBossIndex(e)].name+' gerät in Raserei!');g.fx('shock',e.x,e.y,'#ff9a5a',.8,{range:4});g.emit('slam');}
}
function aiChoose(g,e,p,d){
 const ch=g.state.chapter,t=e.type;
 if(e.boss){const id=aiBossPick(g,e,d);if(!id)return false;aiLaunch(g,e,AI_BOSS_ATTACK[id]||id,AI_BOSS_PARAMS[id](e));e.last=id;return true;}
 if(e.variant==='sharpshooter'&&d>3&&d<=9){aiLaunch(g,e,'snipe',{windup:1.05});return true;}
 if(e.variant==='drummer'&&d<7&&(e.rallyCd||0)<=0&&g.world.enemies.some(a=>a!==e&&!a.dead&&!a.boss&&Math.hypot(a.x-e.x,a.y-e.y)<3.8)){
  e.rallyCd=7;aiLaunch(g,e,'rally',{windup:.8});return true;
 }
 switch(t){
  case 'bandit':if(d>1.5)return false;aiLaunch(g,e,'melee',{windup:.5,r:1.15,mult:1,kb:.3,chain:ch>=2?1:0});return true;
  case 'skeleton':if(d>1.5)return false;aiLaunch(g,e,'melee',{windup:.42,r:1.15,mult:.9,kb:.2,chain:1});return true;
  case 'knight':if(d>1.8)return false;if(g.random()<.35)aiLaunch(g,e,'melee',{windup:.5,r:1.35,mult:.7,kb:1.4,chain:0});else aiLaunch(g,e,'melee',{windup:.95,r:1.6,mult:1.05,kb:.9,chain:0});return true;
  case 'brute':if(d<2.4){aiLaunch(g,e,'slam',{windup:1,r:2.2,mult:1.15,kb:1.3,self:true});return true;}if(d>3&&d<7.5&&g.random()<.45){aiLaunch(g,e,'charge',{windup:.85,len:7,speed:8,dur:.6,mult:1.2,kb:1.4});return true;}return false;
  case 'assassin':if(d>6.5||d<.6)return false;aiLaunch(g,e,'charge',{windup:.38,len:Math.min(5,d+1.2),speed:15,dur:.3,mult:1,kb:.4});e.flee=1;return true;
  case 'archer':if(d>9)return false;aiLaunch(g,e,'volley',{windup:.65,n:ch>=2?3:1,spread:.17,speed:7,color:'#dfbe8c',mult:1});return true;
  case 'mage':if(d<2.6&&(e.blinkCd||0)<=0){e.blinkCd=5.5;aiLaunch(g,e,'blink',{windup:.3,away:true});return true;}if(d>9)return false;aiLaunch(g,e,'volley',{windup:.7,n:ch>=3?3:1,spread:.17,speed:5,color:'#a6b3f3',mult:ch>=3?.8:1});return true;
  case 'cultist':if(d>10)return false;if((e.summonCd||0)<=0&&aiMinions(g)<4){e.summonCd=10;aiLaunch(g,e,'summon',{windup:1.1,types:['skeleton'],n:2,max:4});return true;}if(d>9)return false;aiLaunch(g,e,'volley',{windup:.8,n:3,spread:.3,speed:3.8,color:'#c778e8',mult:.75});return true;
 }
 return false;
}
export function updateEnemies(g,dt){
 const w=g.world,p=g.player;
 for(const e of w.enemies){
  if(e.dead||e.root||(e.boss&&w.seal&&!w.unsealed))continue;
  if(e.variant===undefined){
   const special=g.state.chapter>=3&&!e.minion&&(Math.floor(e.homeX)+Math.floor(e.homeY))%2===0;
   e.variant=special&&e.type==='archer'?'sharpshooter':special&&e.type==='skeleton'?'drummer':'';
  }
  if(e.rallyCd>0)e.rallyCd-=dt;
  e.hit=Math.max(0,e.hit-dt);if(e.exposed>0)e.exposed=Math.max(0,e.exposed-dt);e.cooldown-=dt;if(e.blinkCd>0)e.blinkCd-=dt;if(e.summonCd>0)e.summonCd-=dt;
  const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy),t=e.type;
  e.fx=dx/(d||1);e.fy=dy/(d||1);
  if(e.boss)aiPhase(g,e);
  if(d>(e.boss?16:e.minion?60:g.diff.sense)){e.state='patrol';e.tele=null;if(Math.sin(g.time*.4+e.homeX)>0){move(w,e,Math.sin(e.homeX+g.time*.25)*dt*.2,Math.cos(e.homeY+g.time*.25)*dt*.2);}continue;}
  if(e.state==='windup'){e.timer-=dt;if(e.timer<=0)aiResolve(g,e,p);continue;}
  if(e.state==='charge'){
   const q=e.atkp,before={x:e.x,y:e.y};move(w,e,e.cdx*q.speed*dt,e.cdy*q.speed*dt);e.timer-=dt;
   if(!e.chit&&Math.hypot(p.x-e.x,p.y-e.y)<.85+e.radius){e.chit=true;g.damagePlayer(e.damage*q.mult,e,q.kb||0);}
   const moved=Math.hypot(e.x-before.x,e.y-before.y),blocked=moved<q.speed*dt*.3;
   if(e.timer<=0||blocked){if(w.falkenstein&&e.type==='boss0'&&!e.chit){
     aiFinish(e,blocked?2.4:1.65,g);e.exposed=e.cooldown;
     g.fx('text',e.x,e.y,'#ffe4a0',1,{text:'Deckung offen'});
     g.fx('shock',e.x,e.y,'#d9bd80',.4,{range:1.5});continue;
    }if(blocked&&e.boss){g.fx('shock',e.x,e.y,'#c9b79a',.4,{range:1.6});g.emit('slam');}aiFinish(e,blocked&&e.boss?2.4:e.boss?1.6:1.5,g);}
   continue;
  }
  if(e.state==='channel'){
   const q=e.atkp;e.timer-=dt;e.shot-=dt;
   while(e.shot<=0){e.shot+=q.rate;e.ang+=.5;for(let k=0;k<q.arms;k++){const a=e.ang+k*Math.PI*2/q.arms;g.shoot(e,{x:Math.cos(a),y:Math.sin(a)},e.damage*q.mult,'enemy',q.speed,q.color||'#8fd0ff');}}
   if(e.timer<=0)aiFinish(e,.9,g);
   continue;
  }
  if(e.state==='leap'){
   const q=e.atkp;e.timer-=dt;const k=Math.min(1,1-e.timer/q.dur);e.x=e.fromX+(e.lx-e.fromX)*k;e.y=e.fromY+(e.ly-e.fromY)*k;
   if(e.timer<=0){if(Math.hypot(p.x-e.lx,p.y-e.ly)<q.r)g.damagePlayer(e.damage*q.mult,{x:e.lx,y:e.ly,unblockable:true},q.kb||0);g.fx('shock',e.lx,e.ly,'#d89b62',.55,{range:q.r});g.emit('slam');aiFinish(e,1.5,g);}
   continue;
  }
  if(e.cooldown>.4&&e.state==='recover')continue;
  const los=lineOfSight(w,e,p);
  if(e.cooldown<=0&&!(e.flee>0)&&los&&aiChoose(g,e,p,d))continue;
  const pref=e.boss?BOSSES[aiBossIndex(e)].pref:(AI_PREF[t]||1),caster=pref>=3;
  let dir=null,speedMul=1;
  if(e.flee>0){e.flee-=dt;dir={x:-dx,y:-dy};e.state='retreat';speedMul=1.1;}
  else if(caster&&d<pref*.62){dir={x:-dx,y:-dy};e.state='retreat';if(!passable(w,e.x+dir.x/(d||1)*.6,e.y+dir.y/(d||1)*.6,e.radius))dir={x:-dy,y:dx};}
  else if((AI_RANGED.includes(t)||t==='assassin'||(e.boss&&caster))&&d<pref*1.5&&e.cooldown>.2){e.sideTimer=(e.sideTimer||0)-dt;if(e.sideTimer<=0){e.side=g.random()<.5?-1:1;e.sideTimer=1.2+g.random()*1.4;}const s=e.side||1;dir={x:-dy*s,y:dx*s};e.state='strafe';speedMul=.7;if(!passable(w,e.x+dir.x/(d||1)*.5,e.y+dir.y/(d||1)*.5,e.radius)){e.side=-s;dir=direction(w,e,p,g.flow);}}
  // Out of range, or in range but without line of sight: close in until there is a clear shot.
  else if(d>pref||!los){dir=direction(w,e,p,g.flow);e.state='chase';}
  else e.state='chase';
  if(dir){const len=Math.hypot(dir.x,dir.y)||1;move(w,e,dir.x/len*e.speed*speedMul*dt,dir.y/len*e.speed*speedMul*dt);}
  for(const other of w.enemies){if(other===e||other.dead)continue;const ax=e.x-other.x,ay=e.y-other.y,dist=Math.hypot(ax,ay);if(dist>.01&&dist<.48)move(w,e,ax/dist*dt*.5,ay/dist*dt*.5);}
 }
}
