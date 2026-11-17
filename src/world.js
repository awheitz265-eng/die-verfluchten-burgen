export function rng(seed) { let s=seed>>>0; const r=()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}; return r; }
// One biome per chapter (cycling after six). Each biome changes the terrain layout, the liquid, the path look,
// the castle palette, the enemy roster, the weather and the end boss.
export const BIOMES=[
 {name:'Der flüsternde Forst',castle:'Burg Falkenstein',layout:'river',liquid:'river',ground:'#3d5142',ground2:'#4f6948',light:'#a8b98b',leaf:'tree',fog:'#b9d2bb',density:.12,obst:['tree','rock'],under:['fern0','fern1','flowers0','fern0','mushrooms0','fern1','log0'],
  water:{deep:'#2a5659',mid:'#35706f',shore:'#8aa07e',shine:'#9ad0c8'},path:{rim:'#3a3a2a',mid:'#85775a',hi:'#a99c78'},bridge:{plank:'#80613c',dark:'#46341f'},
  floor:['#414344','#454748','#3d4142','#494a48'],wall:{top:'#66706a',l:'#394647',r:'#28393c'},accent:'#ffbd57',
  weather:{color:'#e1e8a0',vy:-5,vx:4,size:1.1,count:22}},
 {name:'Moor der verlorenen Eide',castle:'Die Nebelwacht',layout:'ponds',liquid:'bog',ground:'#394b4b',ground2:'#485a4a',light:'#8ca59c',leaf:'deadtree',fog:'#9bc6c7',density:.07,obst:['deadtree','rock'],under:['reeds0','mushrooms0','log0','mushrooms0','fern1'],
  water:{deep:'#27402f',mid:'#34553e',shore:'#69784f',shine:'#a3c283'},path:{rim:'#26332b',mid:'#6a5f47',hi:'#867959'},bridge:{plank:'#6b5a3c',dark:'#33291a'},
  floor:['#3a4543','#3e4a46','#364240','#424d49'],wall:{top:'#5a6b62',l:'#2f3d3b',r:'#223230'},accent:'#a8e6b0',
  weather:{color:'#c4dcd2',vy:-2,vx:7,size:1.8,count:24}},
 {name:'Das Tal der letzten Glut',castle:'Feste Glutstein',layout:'canyon',liquid:'lava',ground:'#65503e',ground2:'#775b42',light:'#bca170',leaf:'deadtree',fog:'#d0ab88',density:.12,obst:['rock','rock','deadtree'],under:['log0','fern1'],
  water:{deep:'#d8501a',mid:'#f07a22',shore:'#2b1c15',shine:'#ffcf5a',glow:true},path:{rim:'#43301f',mid:'#a88c5c',hi:'#cbb07f'},bridge:{plank:'#6c645a',dark:'#38322c'},
  floor:['#4d4036','#524539','#483b32','#57493c'],wall:{top:'#8a7360',l:'#4d3d33',r:'#382c25'},accent:'#ff9548',
  weather:{color:'#ffa23c',vy:-22,vx:6,size:1.5,count:26}},
 {name:'Die weisse Wacht',castle:'Eispalast Skaldheim',layout:'lake',liquid:'ice',ground:'#8d9ea3',ground2:'#aebcc0',light:'#e3ecee',leaf:'pine',fog:'#cbdbe9',density:.1,obst:['pine','rock','pine'],under:['fern1','log0'],
  water:{deep:'#7fb4cc',mid:'#a2d0e2',shore:'#e0eef3',shine:'#ffffff'},path:{rim:'#59636a',mid:'#7b756c',hi:'#9b958a'},bridge:{plank:'#8f9da6',dark:'#55646d'},
  floor:['#4b5a63','#505f68','#465560','#566570'],wall:{top:'#9db3bd',l:'#51656f',r:'#3a4c56'},accent:'#9fe3ff',
  weather:{color:'#f2f8fb',vy:22,vx:-6,size:1.7,count:34}},
 {name:'Der Dornenfluch',castle:'Festung Dornfels',layout:'thicket',liquid:'poison',ground:'#3d3c50',ground2:'#4e4863',light:'#8988a0',leaf:'deadtree',fog:'#a393b7',density:.08,obst:['deadtree','deadtree','rock'],under:['mushrooms0','fern1','flowers0'],
  water:{deep:'#4a2468',mid:'#6a3a8f',shore:'#2c2240',shine:'#d08cff',glow:true},path:{rim:'#2a2536',mid:'#6f6075',hi:'#92829a'},bridge:{plank:'#4a3a4f',dark:'#241b2a'},
  floor:['#3b3745','#403b4a','#373342','#463f50'],wall:{top:'#6f6684',l:'#383147',r:'#272236'},accent:'#c590ff',
  weather:{color:'#c9a4f2',vy:6,vx:-9,size:1.6,count:24}},
 {name:'Asche über Falkenstein',castle:'Ruine Aschenthron',layout:'ruins',liquid:'chasm',ground:'#4c3e3d',ground2:'#5d4b47',light:'#9d7a69',leaf:'deadtree',fog:'#b07c67',density:.09,obst:['rock','deadtree','rock'],under:['log0'],
  water:{deep:'#0f0b0e',mid:'#1d1216',shore:'#3b2b29',shine:'#ff6a2a',glow:true},path:{rim:'#2a2220',mid:'#7a6a60',hi:'#9c8c82'},bridge:{plank:'#554a44',dark:'#2b2523'},
  floor:['#3a3030','#3f3434','#352c2c','#443838'],wall:{top:'#6b5a58',l:'#352b2b',r:'#251d1d'},accent:'#ff7a3a',
  weather:{color:'#b9aaa2',vy:12,vx:5,size:1.3,count:30}}
];
// End bosses: one per chapter, each with its own fighting style (kit = attack ids resolved in ai.js).
export const BOSSES=[
 {name:'Der eiserne Eidbrecher',title:'Gorm, Hüter von Falkenstein',style:'Nahkampf: Hiebkombination, Erdschlag, Schildansturm',hp:330,dmg:19,speed:1.05,armour:5,radius:.4,kit:['sweep','slam','charge'],kit2:['nova'],pref:1.8,minions:['skeleton']},
 {name:'Die Herrin des Nebels',title:'Mirela, Moorhexe',style:'Zauber: Geschossfächer, Nebelring, Beschwörung, Blinzeln',hp:290,dmg:15,speed:1.25,armour:3,radius:.34,kit:['fan','nova','summon','blink'],kit2:['spiral'],pref:5.2,minions:['skeleton','cultist']},
 {name:'Tharok Aschenaxt',title:'Berserker des Glutwalls',style:'Wut: Sprungangriff, Ansturm, Axtwirbel, Erdschlag',hp:400,dmg:20,speed:1.15,armour:4,radius:.42,kit:['leap','charge','sweep','slam'],kit2:['rain'],pref:1.8,minions:['bandit']},
 {name:'Skadi, die Frostkönigin',title:'Herrin der weissen Wacht',style:'Frost: Eisspirale, Eisregen, Blinzeln, Splitterfächer',hp:360,dmg:16,speed:1.2,armour:3,radius:.36,kit:['spiral','rain','blink','fan'],kit2:['nova','summon'],pref:5,minions:['archer']},
 {name:'Vael, der Dornenfürst',title:'Herr des Dornenfluchs',style:'Fluch: Dornenausbruch, Schergen, Sprung, Erdschlag',hp:380,dmg:18,speed:1.2,armour:4,radius:.4,kit:['rain','summon','slam','fan','leap'],kit2:['spiral'],pref:3.4,minions:['assassin','cultist']},
 {name:'Malakar, der Aschefürst',title:'Der letzte Eidbrecher',style:'Alle Techniken: Glutspirale, Sprung, Ascheregen, Schergen, Schlagserie',hp:560,dmg:22,speed:1.2,armour:6,radius:.44,kit:['slam','spiral','leap','summon','rain','charge','nova','sweep'],kit2:[],pref:2.8,minions:['skeleton','knight']}
];
// Difficulty: hp/count/elite/speed apply when a chapter is generated (and rescale living enemies on change);
// dmg, cd (attack pauses), wind (telegraph time), lead (predictive aiming) and sense (aggro range) apply live.
export const DIFFICULTY={
 leicht:{name:'Leicht',hint:'Zum Entdecken: weniger und schwächere Gegner, längere Vorwarnung.',hp:.8,dmg:.7,count:.8,speed:.95,cd:1.25,wind:1.15,elite:-.05,lead:0,sense:10},
 normal:{name:'Normal',hint:'Die vorgesehene Herausforderung: Rudel, Eliten und kurze Atempausen.',hp:1.15,dmg:1.2,count:1.15,speed:1.04,cd:.9,wind:1,elite:.04,lead:.45,sense:12},
 schwer:{name:'Schwer',hint:'Zähe, schnelle Gegner, die vorausschauend zielen.',hp:1.45,dmg:1.5,count:1.3,speed:1.1,cd:.78,wind:.9,elite:.1,lead:.8,sense:14},
 albtraum:{name:'Albtraum',hint:'Jeder Fehler kostet. Elite-Rudel und kaum Pausen zwischen den Angriffen.',hp:1.8,dmg:1.85,count:1.45,speed:1.16,cd:.66,wind:.82,elite:.18,lead:1,sense:16}
};
export const diffOf=k=>DIFFICULTY[k]||DIFFICULTY.normal;
export const TYPES=['bandit','archer','skeleton','knight','mage','brute','assassin','cultist'];
const STATS={bandit:[42,8,1.55,0,.23],archer:[32,7,1.35,0,.23],skeleton:[48,10,1.8,0,.23],knight:[88,15,.85,6,.27],mage:[38,11,1.2,0,.23],brute:[150,20,.95,3,.35],assassin:[34,12,2.5,0,.21],cultist:[46,9,1.1,0,.23]};
const MIN_CHAPTER={assassin:2,brute:2,cultist:3};
const ROSTER_OUT=[['bandit','bandit','archer','archer','skeleton','assassin','knight'],['skeleton','skeleton','cultist','archer','bandit','brute','assassin'],['brute','brute','bandit','mage','knight','archer','assassin'],['knight','archer','archer','assassin','skeleton','mage','brute'],['assassin','assassin','cultist','cultist','mage','skeleton','brute'],['knight','knight','brute','mage','cultist','assassin','archer']];
const ROSTER_IN=[['skeleton','knight','mage','skeleton','knight','cultist','brute'],['skeleton','cultist','skeleton','mage','knight','brute','assassin'],['brute','knight','mage','brute','skeleton','assassin','cultist'],['knight','mage','knight','assassin','skeleton','cultist','brute'],['assassin','cultist','mage','skeleton','assassin','knight','brute'],['knight','brute','mage','cultist','knight','assassin','skeleton']];
const key=(x,y)=>y*64+x;
export function flood(world,start=world.start) {const visited=new Set(), q=[[Math.floor(start.x),Math.floor(start.y)]];visited.add(key(...q[0]));for(let h=0;h<q.length;h++){const [x,y]=q[h];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a<0||b<0||a>=world.w||b>=world.h||world.grid[b][a]===1||world.grid[b][a]===2||visited.has(key(a,b)))continue;visited.add(key(a,b));q.push([a,b]);}}return visited;}
export function passable(w,x,y,r=.25){for(const [dx,dy]of [[-r,-r],[r,-r],[-r,r],[r,r]]){const a=Math.floor(x+dx),b=Math.floor(y+dy);if(!w.grid[b]||w.grid[b][a]===undefined||w.grid[b][a]===1||w.grid[b][a]===2)return false;}return true;}
export function lineOfSight(w,a,b,r=.05){const d=Math.hypot(a.x-b.x,a.y-b.y),n=Math.ceil(d*5);for(let i=1;i<=n;i++){if(!passable(w,a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,r))return false;}return true;}
export function move(w,o,dx,dy){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.18));for(let i=0;i<steps;i++){if(passable(w,o.x+dx/steps,o.y,o.radius??.25))o.x+=dx/steps;if(passable(w,o.x,o.y+dy/steps,o.radius??.25))o.y+=dy/steps;}}
export function flowField(w,target){const result=new Int16Array(w.w*w.h).fill(-1),sx=Math.floor(target.x),sy=Math.floor(target.y),q=[[sx,sy]];result[sy*w.w+sx]=0;for(let h=0;h<q.length;h++){const[x,y]=q[h];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a<0||b<0||a>=w.w||b>=w.h||result[b*w.w+a]>=0||!passable(w,a+.5,b+.5,.22))continue;result[b*w.w+a]=result[y*w.w+x]+1;q.push([a,b]);}}return result;}
export function direction(w,o,target,field){if(lineOfSight(w,o,target,(o.radius??.25)*.9))return {x:target.x-o.x,y:target.y-o.y};const x=Math.floor(o.x),y=Math.floor(o.y);let best=Infinity,out={x:0,y:0};for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,d=field[b*w.w+a];if(a>=0&&b>=0&&a<w.w&&b<w.h&&d>=0&&d<best&&passable(w,a+.5,b+.5,o.radius??.25)){best=d;out={x:a+.5-o.x,y:b+.5-o.y};}}return out;}
export function enemy(type,x,y,chapter,id,diff=DIFFICULTY.normal){
 const c=Math.max(0,chapter-1),boss=type.startsWith('boss'),def=boss?BOSSES[Number(type.slice(4))]:null,stats=boss?[def.hp,def.dmg,def.speed,def.armour,def.radius]:STATS[type];
 const hp=Math.round(stats[0]*(1+c*.19)*diff.hp);
 return{id,type,x,y,homeX:x,homeY:y,hp,maxHp:hp,damage:stats[1]*(1+c*.12),speed:stats[2]*(1+Math.min(c,12)*.015)*diff.speed,armour:stats[3],radius:stats[4],cooldown:1,state:'patrol',timer:0,phase:0,boss,dead:false,hit:0};
}
function pickType(list,chapter,random,fallback){const t=list[Math.floor(random()*list.length)];return (MIN_CHAPTER[t]||0)>chapter?fallback:t;}
function basic(seed,chapter,inside,diff){
 const random=rng(seed),bi=(chapter-1)%6,B=BIOMES[bi],w=inside?46:54,h=w,grid=Array.from({length:h},()=>Array(w).fill(inside?1:0));
 const o={seed,chapter,inside,w,h,grid,decor:[],enemies:[],chests:[],traps:[],drops:[],explored:[],start:inside?{x:7.5,y:37.5}:{x:8.5,y:45.5},exit:inside?{x:7.5,y:39.5}:{x:43.5,y:10.5},princess:inside?{x:39.5,y:8.5}:null,bossDead:false};
 const inb=(x,y)=>x>0&&y>0&&x<w-1&&y<h-1;
 const disc=(cx,cy,r,fn)=>{for(let yy=Math.floor(cy-r);yy<=Math.ceil(cy+r);yy++)for(let xx=Math.floor(cx-r);xx<=Math.ceil(cx+r);xx++)if(inb(xx,yy)&&Math.hypot(xx+.5-cx,yy+.5-cy)<=r)fn(xx,yy);};
 if(inside){
  // Corridors between rooms stay straight and axis-aligned like castle halls.
  const carve=(x,y,rad=1)=>{for(let yy=y-rad;yy<=y+rad;yy++)for(let xx=x-rad;xx<=x+rad;xx++)if(inb(xx,yy))grid[yy][xx]=3;};
  const hall=(a,b)=>{let x=Math.floor(a.x),y=Math.floor(a.y);while(x!==Math.floor(b.x)||y!==Math.floor(b.y)){carve(x,y);if(x!==Math.floor(b.x)&&(random()<.6||y===Math.floor(b.y)))x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);}carve(x,y);};
  const templates=[
   [{x:5+Math.floor(random()*4),y:20,w:10,h:9},{x:20,y:27,w:11,h:10},{x:22,y:15,w:9,h:8}],
   [{x:4,y:21,w:9,h:8},{x:15,y:31,w:11,h:9},{x:28,y:24,w:12,h:9}],
   [{x:15,y:35,w:10,h:8},{x:4,y:19,w:10,h:9},{x:18,y:18,w:9,h:9}]
  ];
  const t=templates[(chapter-1+Math.floor(random()*2))%3];
  o.rooms=[{x:3,y:33,w:10,h:9},...t,{x:29,y:3,w:14,h:12}];
  for(const room of o.rooms)for(let y=room.y;y<room.y+room.h;y++)for(let x=room.x;x<room.x+room.w;x++)grid[y][x]=0;
  for(let i=1;i<o.rooms.length;i++){const a=o.rooms[i-1],b=o.rooms[i];hall({x:a.x+a.w/2,y:a.y+a.h/2},{x:b.x+b.w/2,y:b.y+b.h/2});}
  // Pillars break up the rooms; they sit in the corners so the halls never get blocked.
  for(let i=1;i<o.rooms.length-1;i++){const r=o.rooms[i],n=(bi+i)%3;const spots=[[r.x+2,r.y+2],[r.x+r.w-3,r.y+2],[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]];for(let k=0;k<4;k++)if(n===0||(n===1&&k%2===0)||(n===2&&k<2))grid[spots[k][1]][spots[k][0]]=1;}
  // Braziers on stone plinths light the throne hall; they are solid like the pillars they replace.
  for(const [px,py] of [[33,11],[39,12],[36,4],[32,8]]){grid[py][px]=1;o.decor.push({type:'brazier',solid:true,x:px+.5,y:py+.5,scale:1});}
  // Furniture stands against the back walls of each room and blocks movement (no walking through shelves or statues).
  const props=new Set([[33,11],[39,12],[36,4],[32,8]].map(([x,y])=>key(x,y)));
  const prop=(x,y,type,scale=1)=>{if(grid[y]?.[x]!==0)return;grid[y][x]=1;props.add(key(x,y));o.decor.push({type,solid:true,x:x+.5,y:y+.5,scale});};
  const sets=[['barrel','crate','barrel','crate'],['bookshelf','bookshelf','weaponrack','barrel'],['weaponrack','crate','barrel','bookshelf'],['statue','bookshelf','crate','statue'],['statue','statue']];
  for(let i=0;i<o.rooms.length;i++){const r=o.rooms[i],set=sets[i],spots=i===4?[[r.x,r.y],[r.x+r.w-1,r.y]]:[[r.x,r.y],[r.x+r.w-1,r.y],[r.x+2+((bi+i)%3),r.y],[r.x,r.y+2+((bi+i)%2)]];spots.forEach(([x,y],k)=>prop(x,y,set[(k+bi)%set.length],set[(k+bi)%set.length]==='statue'?1:.9));}
  // Wall-mounted torches and banners sit on wall faces that border the floor.
  const isWall=(x,y)=>grid[y][x]===1&&!props.has(key(x,y)),wallRun=(a,b,c2)=>a&&b&&c2;
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){if(grid[y][x]===1)continue;
   if(wallRun(isWall(x-1,y-1),isWall(x,y-1),isWall(x+1,y-1))){const k=(x*7+y*3)%8;if(k===0)o.decor.push({type:'torch',wall:'l',x:x+.5,y:y+.03,scale:1});else if(k===4)o.decor.push({type:'banner',wall:'l',x:x+.5,y:y+.03,scale:1});}
   if(wallRun(isWall(x-1,y-1),isWall(x-1,y),isWall(x-1,y+1))){const k=(x*3+y*7)%8;if(k===2)o.decor.push({type:'torch',wall:'r',x:x+.03,y:y+.5,scale:1});else if(k===6)o.decor.push({type:'banner',wall:'r',x:x+.03,y:y+.5,scale:1});}}
  o.enemies.push(enemy('boss'+bi,35.5,8.5,chapter,'boss',diff));o.chests.push({id:'royal',x:31.5,y:5.5,opened:false,royal:true});
 } else {
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!x||!y||x===w-1||y===h-1)grid[y][x]=1;
  const keepClear=(x,y)=>Math.hypot(x-o.start.x,y-o.start.y)<6||Math.hypot(x-o.exit.x,y-o.exit.y)<7;
  const obst=new Map();
  const block=(x,y,type)=>{if(inb(x,y)&&grid[y][x]===0&&!keepClear(x+.5,y+.5)){grid[y][x]=1;obst.set(key(x,y),type);}};
  const pool=(cx,cy,rx,ry)=>{for(let yy=Math.floor(cy-ry-1);yy<=Math.ceil(cy+ry+1);yy++)for(let xx=Math.floor(cx-rx-1);xx<=Math.ceil(cx+rx+1);xx++){const nx=(xx+.5-cx)/rx,ny=(yy+.5-cy)/ry,limit=1+Math.sin(xx*1.7+yy*2.3+seed)*.2;if(inb(xx,yy)&&nx*nx+ny*ny<limit&&!keepClear(xx+.5,yy+.5))grid[yy][xx]=2;}};
  const stream=(x0,x1,amp,width)=>{const ph=random()*6.28;for(let i=0;i<=120;i++){const t=i/120,cx=x0+(x1-x0)*t+Math.sin(t*7+ph)*amp,cy=1+t*(h-2);disc(cx,cy,width*(.85+.3*Math.sin(t*13+ph)),(x,y)=>{if(!keepClear(x+.5,y+.5))grid[y][x]=2;});}};
  const ridge=(x,y,angle,len,type)=>{for(let i=0;i<len;i++){const cx=x+Math.cos(angle)*i+Math.sin(i*.7)*.6,cy=y+Math.sin(angle)*i+Math.cos(i*.7)*.6;block(Math.floor(cx),Math.floor(cy),type);block(Math.floor(cx+.6),Math.floor(cy+.4),type);}};
  const layout=B.layout;
  if(layout==='river'){const phase=random()*3;stream(26+random()*3,26+random()*3,3,1.45+phase*.05);}
  else if(layout==='ponds'){for(let i=0;i<9;i++)pool(6+random()*42,6+random()*42,1.8+random()*2.6,1.5+random()*2.1);}
  else if(layout==='canyon'){for(let i=0;i<6;i++)ridge(4+random()*44,4+random()*44,random()*Math.PI,7+random()*6,'rock');stream(14+random()*8,18+random()*14,2.5,1.05);stream(30+random()*10,28+random()*14,2.5,.95);}
  else if(layout==='lake'){pool(15+random()*5,21+random()*5,7+random()*1.5,5+random()*1.5);pool(34+random()*4,29+random()*4,4.2,3.2);for(let i=0;i<4;i++)ridge(5+random()*44,5+random()*44,random()*Math.PI,3+random()*4,'rock');}
  else if(layout==='thicket'){for(let i=0;i<17;i++){const cx=5+random()*44,cy=5+random()*44,r=1.2+random()*1.5;disc(cx,cy,r,(x,y)=>block(x,y,'deadtree'));}for(let i=0;i<3;i++)pool(8+random()*36,8+random()*36,1.7,1.4);}
  else{for(let i=0;i<10;i++){const horizontal=random()<.5,x=4+Math.floor(random()*40),y=4+Math.floor(random()*40),len=3+Math.floor(random()*6),type=i%4===3?'statue':'rock';for(let k=0;k<len;k++){if(random()<.22)continue;block(horizontal?x+k:x,horizontal?y:y+k,type);}}for(let i=0;i<4;i++){const x=6+random()*40,y=6+random()*40,s=random()<.5?1:-1;for(let k=0;k<5;k++){const cx=Math.floor(x+k*s),cy=Math.floor(y+k);if(inb(cx,cy)&&!keepClear(cx+.5,cy+.5)){grid[cy][cx]=2;if(k%2)grid[cy][cx+1]=grid[cy][cx+1]===0&&!keepClear(cx+1.5,cy+.5)?2:grid[cy][cx+1];}}}}
  disc(o.exit.x,o.exit.y+.5,5,(x,y)=>{grid[y][x]=0;obst.delete(key(x,y));});
  disc(o.start.x,o.start.y,3.2,(x,y)=>{grid[y][x]=0;obst.delete(key(x,y));});
  // Winding trails: circular brushes make soft curves instead of square staircases. Crossing liquid becomes a bridge (4).
  const carve=(cx,cy,r)=>disc(cx,cy,r,(x,y)=>{if(grid[y][x]===2&&Math.hypot(x+.5-cx,y+.5-cy)>r*.74)return;grid[y][x]=grid[y][x]===2||grid[y][x]===4?4:3;obst.delete(key(x,y));});
  const trail=(a,b,r,wobble)=>{const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,n=Math.ceil(len*2.5),f=1+random()*1.5,ph=random()*6.28,amp=Math.min(wobble,len*.2);for(let i=0;i<=n;i++){const t=i/n,off=Math.sin(t*Math.PI*f*2+ph)*amp*Math.sin(Math.PI*t);carve(a.x+dx*t+nx*off,a.y+dy*t+ny*off,r*(.9+.2*Math.sin(t*11+ph)));}};
  trail(o.start,{x:24,y:30},1.3,4);trail({x:24,y:30},{x:38,y:16},1.3,4);trail({x:38,y:16},o.exit,1.3,1.5);
  // The castle seen from outside is a solid building: its whole footprint behind the gate facade is blocked.
  // The facade runs along x+y = gs (a horizontal line on screen) and spans about ±5 tiles left and right of the gate.
  const gs=o.exit.x+o.exit.y-1.2,gd=o.exit.x-o.exit.y,castle=(x,y)=>x+y<gs+.2&&x+y>gs-11&&Math.abs(x-y-gd)<6.6;
  o.castle={x:o.exit.x-.6,y:o.exit.y-.6};
  for(let i=0;i<4;i++){let p;do p={x:7+Math.floor(random()*39)+.5,y:8+Math.floor(random()*37)+.5};while(castle(p.x,p.y)||castle(p.x+1,p.y+1));trail({x:24,y:30},p,1.05,3);o.chests.push({id:'chest'+i,x:p.x,y:p.y,opened:false});}
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(castle(x+.5,y+.5)){grid[y][x]=1;obst.delete(key(x,y));}
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){if(grid[y][x]!==0)continue;const v=random();if(v<B.density&&Math.hypot(x-o.exit.x,y-o.exit.y)>4&&Math.hypot(x-o.start.x,y-o.start.y)>3){grid[y][x]=1;o.decor.push({type:v<B.density*.75?B.obst[Math.floor(random()*B.obst.length)]:'rock',x:x+.5,y:y+.5,scale:.85+random()*.55});}else if(v<B.density+.11)o.decor.push({type:'bush',x:x+.5,y:y+.5,scale:.55+random()*.5});}
  for(const [k,type] of obst){const x=k%64,y=Math.floor(k/64);if(grid[y][x]===1)o.decor.push({type,x:x+.5,y:y+.5,scale:.85+random()*.5});}
  // Sorted slightly early so figures standing on the steps are always drawn in front of the facade.
  o.decor.push({type:'gate',x:o.castle.x,y:o.castle.y,sort:gs-1,scale:1.25});
 }
 const reachable=flood(o),list=inside?ROSTER_IN[bi]:ROSTER_OUT[bi],fallback=inside?'skeleton':'bandit',count=Math.round((inside?12+Math.min(chapter*2,26):17+Math.min(chapter*2,35))*diff.count),eliteChance=Math.max(0,Math.min(.45,(chapter<2?0:Math.min(.3,.05+chapter*.03))+(chapter<2?Math.min(0,diff.elite):diff.elite)));
 const free=(x,y)=>reachable.has(key(Math.floor(x),Math.floor(y)))&&passable(o,x,y,.35)&&Math.hypot(x-o.start.x,y-o.start.y)>=6&&Math.hypot(x-o.exit.x,y-o.exit.y)>=3&&!(inside&&x>28&&y<15)&&!o.enemies.some(e=>Math.hypot(e.x-x,e.y-y)<1.6);
 let id=0;
 for(let tries=0;id<count&&tries<6000;tries++){
  const x=2+Math.floor(random()*(w-4))+.5,y=2+Math.floor(random()*(h-4))+.5;if(!free(x,y))continue;
  const type=pickType(list,chapter,random,fallback),pack=['archer','mage','cultist'].includes(type)?1:1+Math.floor(random()*3);
  for(let k=0;k<pack&&id<count;k++){const px=k?x+(random()-.5)*3.4:x,py=k?y+(random()-.5)*3.4:y;if(k&&!free(px,py))continue;const e=enemy(k?pickType(list,chapter,random,fallback):type,px,py,chapter,'e'+id++,diff);
   if(eliteChance&&random()<eliteChance){e.elite=true;e.hp=e.maxHp=Math.round(e.maxHp*1.8);e.damage*=1.25;e.speed*=1.12;e.armour+=2;e.radius*=1.1;}
   o.enemies.push(e);}
 }
 if(inside)for(let i=0;i<3+Math.min(chapter,12);i++){const room=o.rooms[1+i%3],x=room.x+2+Math.floor(random()*(room.w-4)),y=room.y+2+Math.floor(random()*(room.h-4));if(grid[y][x]!==1)o.traps.push({x:x+.5,y:y+.5,phase:random()*5});}
 return o;
}
export function generateWorld(seed,chapter,inside=false,difficulty='normal'){const diff=diffOf(difficulty);for(let attempt=0;attempt<20;attempt++){const o=basic((seed+attempt*7919)>>>0,chapter,inside,diff),f=flood(o),goals=[o.exit,...o.chests,...o.enemies,...(o.princess?[o.princess]:[])];if(goals.every(p=>f.has(key(Math.floor(p.x),Math.floor(p.y)))))return o;}throw new Error('Keine erreichbare Welt nach 20 Versuchen.');}
