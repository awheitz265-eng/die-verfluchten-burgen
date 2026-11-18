import {ARROW_SPEED,trackBowTargets} from './archery.js';
import {generateWorld,move,passable,circleContact,terrainContact,lineOfSight,flowField,direction,BIOMES,BOSSES,DIFFICULTY,diffOf} from './world.js';
import {updateEnemies} from './ai.js';
import {makeItem,characterStats,equip,unequip,buy,sell,gainXP,WEAPONS} from './items.js';
import {save,load} from './storage.js';
import {chapterSpec,nextMark,unlockArena} from './campaign.js';
export const BELT_LIMIT=7;
export function weaponTouches(origin,face,range,arc,target){
 const dx=target.x-origin.x,dy=target.y-origin.y;
 const distance=Math.hypot(dx,dy),r=target.radius||0;
 if(distance<=r)return true;
 if(distance>range+r)return false;
 const angle=Math.abs(Math.atan2(dx*face.y-dy*face.x,dx*face.x+dy*face.y));
 if(angle<=arc/2)return true;
 const gap=angle-arc/2,projection=Math.max(0,Math.min(range,distance*Math.cos(gap)));
 return Math.hypot(distance*Math.cos(gap)-projection,distance*Math.sin(gap))<=r;
}
// Preserve walking distance across slow paint frames while keeping collision steps small.
export function advanceGame(game,elapsed){
 const seconds=Math.min(.2,Math.max(0,elapsed));
 const steps=Math.ceil(seconds/.05);
 for(let i=0;i<steps;i++)game.update(seconds/steps);
}
export class Game {
 constructor(){this.state=null;this.mode='title';this.effects=[];this.projectiles=[];this.time=0;this.flowTimer=0;this.saveTimer=0;this.onEvent=()=>{};this.input={x:0,y:0,attack:false,block:false,aim:{x:1,y:0}};this.notices=[];}
 emit(type,data={}){this.onEvent(type,data);}
 random(){this.state.random=(Math.imul(this.state.random,1664525)+1013904223)>>>0;return this.state.random/4294967296;}
 id(){return 'item-'+this.state.nextId++;}
 get world(){return this.state?.worlds[this.state.area];}
 get player(){return this.state?.player;}
 get potionPrice(){return 40+25*(this.state.potionPurchases||0);}
 get beltFull(){return this.player.potions>=BELT_LIMIT;}
 routeHint(){
  const w=this.world,p=this.player;
  if(w.campaign){
   const spec=chapterSpec(w.chapter),mark=nextMark(w);
   if(w.inside&&!mark)return w.bossDead?'Der Weg zur Prinzessin ist frei.':spec.tip;
   const target=mark||w.exit,dx=target.x-p.x,dy=target.y-p.y;
   const dir=['rechts','rechts unten','unten','links unten','links','links oben','oben','rechts oben'][(Math.round(Math.atan2((dx+dy)/2,dx-dy)/(Math.PI/4))+8)%8];
   return (mark?.label||spec.castle)+' liegt '+dir+'.';
  }
  if(w.inside)return w.bossDead?'Suche die Prinzessin im Rittersaal.':'Vom Wachhof führt der schmale Wehrgang zum Rittersaal.';
  if(!w.falkenstein)return 'Folge dem goldenen Zielpfeil zur Burg.';
  const target=w.gateSeen?w.exit:!w.signSeen?w.sign:!w.fordSeen?w.ford:w.exit;
  const dx=target.x-p.x,dy=target.y-p.y;
  const dirs=['rechts','rechts unten','unten','links unten','links','links oben','oben','rechts oben'];
  const index=(Math.round(Math.atan2((dx+dy)*.5,dx-dy)/(Math.PI/4))+8)%8;
  const name=target===w.sign?'Der gestürzte Wegweiser':target===w.ford?'Die flache Furt':'Das Falkentor';
  return name+' liegt von hier aus '+dirs[index]+'.';
 }
 get stats(){return characterStats(this.player);}
 get diff(){return diffOf(this.state?.settings?.difficulty);}
 // Changing difficulty mid-game rescales living enemies right away; enemy count changes from the next chapter.
 setDifficulty(k){if(!this.state||!DIFFICULTY[k])return false;const old=this.diff,next=DIFFICULTY[k];this.state.settings.difficulty=k;for(const w of Object.values(this.state.worlds))for(const e of w.enemies){if(e.dead)continue;const r=next.hp/old.hp;e.maxHp=Math.max(1,Math.round(e.maxHp*r));e.hp=Math.max(1,Math.min(e.maxHp,Math.round(e.hp*r)));e.speed*=next.speed/old.speed;}this.notify('Schwierigkeit: '+next.name+'.');this.persist();return true;}
 newGame(seed=Date.now()>>>0,difficulty='normal'){this.state={seed,random:seed,chapter:1,nextId:1,area:'outside',potionPurchases:0,rescued:0,worlds:{},shop:[],player:{x:0,y:0,hp:110,stamina:100,level:1,xp:0,gold:35,potions:4,inventory:[],equipment:{weapon:makeItem(()=>.2,1,'starter',{slot:'weapon',kind:'sword',rarity:0}),offhand:makeItem(()=>.2,1,'shield',{slot:'offhand',rarity:0}),chest:makeItem(()=>.2,1,'armour',{slot:'chest',rarity:0}),helmet:null,gloves:null,boots:null},radius:.23,face:{x:1,y:-1},cooldown:0,invulnerable:0,roll:0,step:0},settings:{music:.22,sfx:.5,quality:'high',difficulty:DIFFICULTY[difficulty]?difficulty:'normal'}};this.createChapter();this.mode='play';this.persist();this.emit('start');}
 createChapter(){const s=this.state;const seed=(s.seed+s.chapter*104729)>>>0;const d=s.settings.difficulty;s.worlds={outside:generateWorld(seed,s.chapter,false,d),inside:generateWorld(seed^0x7f4a7c15,s.chapter,true,d)};s.area='outside';Object.assign(s.player,s.worlds.outside.start,{cooldown:0,roll:0,invulnerable:1});this.effects=[];this.projectiles=[];this.flowTimer=0;this.flow=null;this.notify('Kapitel '+s.chapter+' · '+(chapterSpec(s.chapter)?.land||BIOMES[(s.chapter-1)%6].name)+' · Finde die verfluchte Burg.');}
 resume(){const state=load();if(!state)return false;this.state=state;this.mode=state.finished?'victory':state.chapter>10?'legacy':state.atShop?'shop':state.player.hp<=0?'dead':'play';Object.assign(this.player,{roll:0,cooldown:0,invulnerable:1});this.effects=[];this.projectiles=[];this.flowTimer=0;this.flow=null;this.emit('start');return true;}
 persist(){if(this.state){this.state.atShop=this.mode==='shop';const ok=save(this.state);this.emit('saved',{ok});return ok;}return false;}
 notify(text){this.notices.push({text,life:4});if(this.notices.length>4)this.notices.shift();this.emit('notice',{text});}
 toggle(mode){if(!this.state||['legacy','victory'].includes(this.mode)||this.mode==='dead'||this.mode==='shop'||this.mode==='title')return;this.mode=this.mode===mode?'play':mode;this.input.attack=false;this.input.block=false;this.emit('ui');if(this.mode!=='play')this.persist();}
 enter(){const s=this.state,p=this.player;if(s.area==='outside'){s.area='inside';Object.assign(p,this.world.start);}else{s.area='outside';Object.assign(p,{x:this.world.exit.x,y:this.world.exit.y+2});}p.invulnerable=1;this.projectiles=[];this.effects=[];this.flowTimer=0;this.flow=null;this.emit('door');this.persist();this.emit('ui');}
 interaction(){if(!this.state)return null;const p=this.player,w=this.world,d=o=>Math.hypot(o.x-p.x,o.y-p.y);const mark=nextMark(w);if(mark&&d(mark)<2)return{kind:'mark',label:mark.label+' · '+(w.inside?'betätigen':'untersuchen'),target:mark};if(w.sign&&d(w.sign)<1.9&&!w.signRead)return{kind:'sign',label:'Wegweiser lesen',target:w.sign};if(w.inside&&d(w.princess)<2.1)return{kind:'princess',label:w.bossDead?'Prinzessin befreien':'Besiege zuerst den Burghüter',target:w.princess};const chest=w.chests.find(c=>!c.opened&&d(c)<1.7);if(chest)return{kind:'chest',label:chest.royal&&!w.bossDead?'Schatz vom Burghüter versiegelt':'Truhe öffnen',target:chest};if(d(w.exit)<2.0)return{kind:'gate',label:w.inside?'Zurück in den Wald':'Burg betreten',target:w.exit};const drop=w.drops.filter(c=>d(c)<2.1&&!(c.potion&&this.beltFull)).sort((a,b)=>d(a)-d(b))[0];if(drop)return{kind:'drop',label:drop.item?drop.item.name:'Beute aufnehmen',target:drop};return null;}
 interact(){if(this.mode!=='play')return;const it=this.interaction();if(!it)return;if(it.kind==='mark'){
  it.target.done=true;const w=this.world,mark=nextMark(w);
  if(!mark&&w.seal){unlockArena(w);this.flowTimer=0;}
  this.notify(mark?'Nächste Spur: '+mark.label:w.inside?'Der Zugang zum Burghüter ist frei.':'Der Zugang zur Burg ist gefunden.');
  this.emit('door');this.persist();return;
 }if(it.kind==='sign'){this.world.signRead=true;this.world.signSeen=true;this.notify('Falkenstein · Nimm die steinerne Furt. Folge am anderen Ufer dem ansteigenden Weg.');this.persist();return;}if(it.kind==='gate'){if(!this.world.inside&&nextMark(this.world)){this.notify('Suche zuerst: '+nextMark(this.world).label);return;}this.enter();return;}if(it.kind==='princess'){if(!this.world.bossDead){this.notify('Der Burghüter hält den Fluch aufrecht.');return;}this.rescue();return;}if(it.kind==='chest'){const c=it.target;if(c.royal&&!this.world.bossDead)return;c.opened=true;this.player.gold+=25+this.state.chapter*10;if(this.beltFull)this.world.drops.push({x:c.x,y:c.y,potion:true});else this.player.potions++;this.world.drops.push({x:c.x,y:c.y+.6,item:makeItem(()=>this.random(),this.state.chapter,this.id(),c.royal?{rarity:Math.min(4,2+Math.floor(this.random()*2))}:{})});this.emit('chest');this.notify('Gold, ein Heiltrank und Ausrüstung gefunden.');}if(it.kind==='drop')this.pickup(it.target);this.persist();this.emit('ui');}
 pickup(drop){if(drop.item){if(this.player.inventory.length>=80){this.notify('Inventar voll. Beim Händler kannst du verkaufen.');return;}this.player.inventory.push(drop.item);this.notify(drop.item.name+' aufgenommen.');}else if(drop.gold){this.player.gold+=drop.gold;}else if(drop.potion){if(this.beltFull)return;this.player.potions++;}this.world.drops.splice(this.world.drops.indexOf(drop),1);this.emit('coin');}
 rescue(){this.state.potionPurchases=0;this.state.rescued++;this.player.gold+=100+this.state.chapter*35;this.player.hp=this.stats.maxHp;this.player.stamina=this.stats.maxStamina;if(this.state.chapter>=10){this.state.finished=true;this.mode='victory';this.persist();this.emit('rescue');this.emit('ui');return;}this.mode='shop';this.state.shop=Array.from({length:12},(_,i)=>makeItem(()=>this.random(),this.state.chapter+1,this.id(),i<5?{slot:'weapon',kind:Object.keys(WEAPONS)[i]}:{}));this.persist();this.emit('rescue');this.emit('ui');}
 nextChapter(){if(this.mode!=='shop')return;if(globalThis.FALKENSTEIN_PREVIEW){this.newGame(undefined,this.state.settings.difficulty);return;}if(this.state.chapter>=10){this.state.finished=true;this.mode='victory';this.persist();this.emit('ui');return;}this.state.chapter++;this.createChapter();this.mode='play';this.persist();this.emit('ui');}
 retry(){if(this.mode!=='dead')return;this.player.gold=Math.floor(this.player.gold*.9);this.player.hp=this.stats.maxHp;this.player.stamina=this.stats.maxStamina;this.player.potions=Math.max(2,this.player.potions);this.createChapter();this.mode='play';this.persist();this.emit('ui');}
 transact(action,id){let ok=false;if(action==='equip')ok=equip(this.player,id);if(action==='unequip')ok=unequip(this.player,id);if(action==='buy'&&this.mode==='shop')ok=buy(this.player,this.state.shop,id);if(action==='sell'&&this.mode==='shop')ok=sell(this.player,id);if(action==='potion'&&this.mode==='shop'&&!this.beltFull&&this.player.gold>=this.potionPrice){this.player.gold-=this.potionPrice;this.state.potionPurchases=(this.state.potionPurchases||0)+1;this.player.potions++;ok=true;}if(action==='upgrade'&&this.mode==='shop'&&this.player.equipment.weapon){const item=this.player.equipment.weapon,cost=35+20*(item.upgrades||0);if(this.player.gold>=cost){this.player.gold-=cost;item.damage+=3;item.value+=15;item.upgrades=(item.upgrades||0)+1;ok=true;}}if(ok){this.emit('coin');this.persist();this.emit('ui');}else this.notify('Nicht möglich: Gold oder Inventar prüfen.');return ok;}
 heal(){if(this.mode!=='play'||!this.player.potions||this.player.hp>=this.stats.maxHp)return false;this.player.potions--;this.player.hp=Math.min(this.stats.maxHp,this.player.hp+this.stats.maxHp*.55);this.fx('heal',this.player.x,this.player.y,'#a9e4a1',.7);this.emit('heal');this.persist();return true;}
 dodge(){if(this.mode!=='play'||this.player.roll>0||this.player.stamina<24)return false;const p=this.player;const a=Math.hypot(this.input.x,this.input.y)>0?{x:this.input.x,y:this.input.y}:p.face,n=Math.hypot(a.x,a.y)||1;p.rollDir={x:a.x/n,y:a.y/n};p.roll=.28;p.invulnerable=.3;p.stamina-=24;this.emit('roll');return true;}
 fx(type,x,y,color='#f3d293',life=.45,extra={}){if(this.effects.length>150)this.effects.shift();this.effects.push({type,x,y,color,life,maxLife:life,...extra});}
 damagePlayer(damage,source,kb=0){const p=this.player;if(p.invulnerable>0||this.mode!=='play')return;let amount=Math.max(1,damage*this.diff.dmg-this.stats.defence*.55);const d={x:source.x-p.x,y:source.y-p.y},len=Math.hypot(d.x,d.y)||1;let blocked=false;if(this.input.block&&!source.unblockable&&this.stats.kind!=='bow'&&p.stamina>=8&&(d.x*p.face.x+d.y*p.face.y)/len>-.1){blocked=true;p.guardImpact=.18;amount*=.2;p.stamina=Math.max(0,p.stamina-12);this.fx('spark',p.x,p.y,'#a9d9ec');this.emit('block');}p.hp=Math.max(0,p.hp-Math.round(amount));if(kb>0&&len>.01)move(this.world,p,-d.x/len*kb*(blocked?.4:1),-d.y/len*kb*(blocked?.4:1));p.invulnerable=.38;p.hurt=.22;this.fx('text',p.x,p.y,'#ff9b8f',.8,{text:'−'+Math.round(amount)});this.emit('hurt');if(p.hp<=0){this.mode='dead';this.persist();this.emit('ui');}}
 damageEnemy(e,damage,critical=false,origin=null){
  if(e.dead)return;let dmg=Math.max(1,Math.round(damage-e.armour));
  // Knights hold their shield up while advancing; attack them during their own swing or from the side.
  if(e.type==='knight'&&origin&&['chase','patrol','retreat','strafe'].includes(e.state)){const dx=origin.x-e.x,dy=origin.y-e.y,l=Math.hypot(dx,dy)||1;if((dx*(e.fx||0)+dy*(e.fy||0))/l>.35){dmg=Math.max(1,Math.round(dmg*.4));this.fx('spark',e.x,e.y,'#a9d9ec');}}
  if(e.type==='boss4'&&this.world.enemies.some(m=>m.root&&!m.dead))dmg=Math.max(1,Math.round(dmg*.6));
  if(e.exposed>0&&e.boss)dmg=Math.round(dmg*1.35);
  e.hp-=dmg;e.hit=.16;
  // A short stagger pushes light enemies back; bosses and brutes barely move.
  if(origin&&e.hp>0&&!['windup','charge','leap','channel'].includes(e.state)){const dx=e.x-origin.x,dy=e.y-origin.y,l=Math.hypot(dx,dy)||1,kb=e.boss?.04:e.type==='brute'?.07:.2;move(this.world,e,dx/l*kb,dy/l*kb);}this.fx('text',e.x,e.y,critical?'#ffe29b':'#efe6cf',.7,{text:dmg+(critical?'!':'')});this.fx('spark',e.x,e.y);this.emit('hit');
  if(e.hp<=0){
   e.dead=true;e.hp=0;e.state='dead';e.tele=null;e.deadAt=this.time;e.fall=origin?Math.sign((e.x-origin.x)-(e.y-origin.y))||1:1;
   if(e.boss&&!this.world.enemies.some(other=>other.boss&&!other.dead)){this.world.bossDead=true;for(const m of this.world.enemies)if(m.minion&&!m.dead){m.dead=true;m.hp=0;m.state='dead';this.fx('shock',m.x,m.y,'#b090e0',.5,{range:1});}this.notify(BOSSES[Number(e.type.slice(4))].name+' ist gefallen. Befreie die Prinzessin!');this.emit('bossdefeat');}
   if(e.minion){this.persist();return;}
   const elite=e.elite?2:1,ch=this.state.chapter;
   this.world.drops.push({x:e.x,y:e.y,gold:Math.floor(((e.boss?70:6)+ch*(e.boss?20:3)+this.random()*8)*elite)});
   if(e.boss||e.elite||this.random()<.4)this.world.drops.push({x:e.x+.4,y:e.y+.3,item:makeItem(()=>this.random(),ch,this.id(),e.boss?{rarity:2+Math.floor(this.random()*3)}:e.elite?{rarity:1+Math.floor(this.random()*3)}:{})});
   if(this.random()<(e.elite?.4:.18))this.world.drops.push({x:e.x-.3,y:e.y,potion:true});
   const weight={knight:1.3,brute:1.6,assassin:1.2,cultist:1.2}[e.type]||1;
   if(gainXP(this.player,e.boss?90+ch*10:Math.round((16+ch*3)*weight*elite))){this.notify('Stufe '+this.player.level+' erreicht. Gesundheit vollständig erneuert.');this.emit('levelup');}
   this.persist();
  }
 }
 attack(){const p=this.player,s=this.stats,w=s.weapon;if(p.cooldown>0||p.roll>0||p.stamina<w.stamina)return;p.cooldown=w.cooldown;p.stamina-=w.stamina;const a=this.input.aim,n=Math.hypot(a.x,a.y)||1;p.face={x:a.x/n,y:a.y/n};const crit=this.random()<s.crit,damage=s.damage*(crit?1.7:1);if(s.kind==='bow'){this.shoot(p,p.face,damage,'player',ARROW_SPEED,'#d2e3c0',crit);this.emit('bow');}else{this.fx('slash',p.x,p.y,'#e8dab0',.22,{angle:Math.atan2(p.face.y,p.face.x),range:w.range,arc:w.arc});for(const e of this.world.enemies){if(!e.dead&&weaponTouches(p,p.face,w.range,w.arc,e)&&lineOfSight(this.world,p,e))this.damageEnemy(e,damage,crit,p);}this.emit('swing');}}
 shoot(origin,dir,damage,owner,speed=7,color='#b5a0ff',crit=false){const l=Math.hypot(dir.x,dir.y)||1;this.projectiles.push({x:origin.x,y:origin.y,vx:dir.x/l*speed,vy:dir.y/l*speed,damage,owner,color,life:2.4,crit});}
 update(dt){dt=Math.min(dt,.05);this.time+=dt;for(const n of this.notices)n.life-=dt;this.notices=this.notices.filter(n=>n.life>0);if(this.mode!=='play'||!this.state)return;const p=this.player,s=this.stats,w=this.world;this.effects=this.effects.filter(f=>(f.life-=dt)>0);p.guardImpact=Math.max(0,(p.guardImpact||0)-dt);p.hurt=Math.max(0,(p.hurt||0)-dt);p.cooldown=Math.max(0,p.cooldown-dt);p.invulnerable=Math.max(0,p.invulnerable-dt);p.stamina=Math.min(s.maxStamina,p.stamina+dt*(this.input.block?5:24));const n=Math.hypot(this.input.x,this.input.y),x0=p.x,y0=p.y;p.moving=n>0;if(p.roll>0){p.roll-=dt;move(w,p,p.rollDir.x*dt*10,p.rollDir.y*dt*10);}else if(n>0){const speed=s.speed*(this.input.block?.55:1);move(w,p,this.input.x/n*speed*dt,this.input.y/n*speed*dt);}
// step = distance walked, so the walk cycle stays in sync with the ground (no sliding feet); v feeds predictive enemy aim.
const moved=Math.hypot(p.x-x0,p.y-y0);if(p.roll<=0)p.step=((p.step||0)+moved)%1000;p.vx=(p.x-x0)/dt;p.vy=(p.y-y0)/dt;if(n>0&&moved<1e-4)p.moving=false;if(this.input.attack&&!this.input.block)this.attack();if(!this.input.attack&&Math.hypot(this.input.aim.x,this.input.aim.y)>0){const a=this.input.aim,l=Math.hypot(a.x,a.y);p.face={x:a.x/l,y:a.y/l};}
this.flowTimer-=dt;
if(this.flowTimer<=0||!this.flow){
 const cell=Math.floor(p.y)*w.w+Math.floor(p.x);
 if(!this.flow||this.flowWorld!==w||this.flowCell!==cell||this.flowUnsealed!==w.unsealed){
  this.flow=flowField(w,p);this.flowWorld=w;this.flowCell=cell;this.flowUnsealed=w.unsealed;
 }
 this.flowTimer=.55;
}
updateEnemies(this,dt);
if(s.kind==='bow')trackBowTargets(w.enemies,dt);else this.bowTarget=null;
for(const shot of this.projectiles){
 const travel=Math.min(dt,shot.life),dx=shot.vx*travel,dy=shot.vy*travel;
 let hit=terrainContact(w,shot.x,shot.y,dx,dy,.05),victim=null;
 const targets=shot.owner==='player'?w.enemies:[p];
 for(const target of targets){
  if(target.dead)continue;
  const at=circleContact(shot.x,shot.y,dx,dy,target.x,target.y,target.radius+(shot.owner==='player'?.17:.05));
  if(at<hit&&(shot.owner!=='player'||lineOfSight(w,{x:shot.x+dx*at,y:shot.y+dy*at},target,.025))){hit=at;victim=target;}
 }
 const origin={x:shot.x,y:shot.y};
 shot.x+=dx*Math.min(hit,1);shot.y+=dy*Math.min(hit,1);shot.life-=dt;
 if(hit!==Infinity){
  shot.life=0;
  if(victim===p)this.damagePlayer(shot.damage,origin);
  else if(victim)this.damageEnemy(victim,shot.damage,shot.crit,p);
 }
}
this.projectiles=this.projectiles.filter(a=>a.life>0);
for(const trap of w.traps){if((this.time+trap.phase)%4<.7&&Math.hypot(trap.x-p.x,trap.y-p.y)<.55)this.damagePlayer(13+this.state.chapter*2,trap);}for(const drop of [...w.drops])if(!drop.item&&Math.hypot(drop.x-p.x,drop.y-p.y)<1)this.pickup(drop);if(w.campaign&&!w.inside&&!nextMark(w)&&Math.hypot(p.x-w.exit.x,p.y-w.exit.y)<5)w.gateSeen=true;
if(w.falkenstein&&!w.inside){
 if(!w.signSeen&&Math.hypot(p.x-w.sign.x,p.y-w.sign.y)<4)w.signSeen=true;
 if(!w.fordSeen&&Math.hypot(p.x-w.ford.x,p.y-w.ford.y)<4){w.fordSeen=true;this.notify('Die Falkenfurt · Am anderen Ufer steigt der Burgweg an.');}
 if(!w.gateSeen&&Math.hypot(p.x-w.exit.x,p.y-w.exit.y)<5){w.gateSeen=true;this.notify('Falkentor entdeckt.');}
}
const cell=Math.floor(p.y)*w.w+Math.floor(p.x);if(!w.explored.includes(cell))w.explored.push(cell);this.saveTimer+=dt;if(this.saveTimer>8){this.persist();this.saveTimer=0;}}
}
