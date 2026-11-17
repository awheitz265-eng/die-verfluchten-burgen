/* Skeleton-driven character sprites (3/4 profile, facing right; the renderer mirrors).
 * Frames are painted lazily: makeFigures().get('hero-sword-walk-3') etc.
 * Canvas 256x280, feet anchor at (128,250), figure ~170 units tall.
 */
export function makeFigures(){
  const W=256,H=280,AX=128,AY=250,PI=Math.PI,FS=.8;
  const cache=new Map();
  let c=null;
  const LIGHT={x:-.55,y:-.83};
  // ---------- colour utilities ----------
  const toH=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  const hexA=h=>{h=h.replace('#','');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));};
  const shade=(h,t)=>{const a=hexA(h);return toH(t>=0?a.map(v=>v+(255-v)*t):a.map(v=>v*(1+t)));};
  const mix=(a,b,t)=>{const x=hexA(a),y=hexA(b);return toH(x.map((v,i)=>v+(y[i]-v)*t));};
  const rgba=(h,a)=>{const x=hexA(h);return `rgba(${x[0]},${x[1]},${x[2]},${a})`;};
  const lg=(x0,y0,x1,y1,stops)=>{const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,col])=>g.addColorStop(o,col));return g;};
  const rg=(x,y,r,stops)=>{const g=c.createRadialGradient(x,y,0,x,y,r);stops.forEach(([o,col])=>g.addColorStop(o,col));return g;};
  const tri=(col,t=.3)=>[[0,shade(col,t)],[.45,col],[1,shade(col,-.42)]];
  const OUT='rgba(8,12,16,.5)';
  const dirA=a=>({x:Math.sin(a),y:Math.cos(a)});
  // ---------- primitives ----------
  function ell(x,y,rx,ry,fill,stroke,rot=0){c.beginPath();c.ellipse(x,y,rx,ry,rot,0,PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
  function glowAt(x,y,r,col,a=.5){c.save();c.globalAlpha=a;c.fillStyle=rg(x,y,r,[[0,col],[1,rgba(col,0)]]);c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
  function limb(a,b,w0,w1,col,o={}){
    const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ang=Math.atan2(dy,dx),px=-dy/len,py=dx/len;
    let nx=px,ny=py;if(nx*LIGHT.x+ny*LIGHT.y<0){nx=-nx;ny=-ny;}
    const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,w=Math.max(w0,w1);
    c.beginPath();c.moveTo(a.x+px*w0,a.y+py*w0);c.lineTo(b.x+px*w1,b.y+py*w1);c.arc(b.x,b.y,w1,ang+PI/2,ang-PI/2,true);c.lineTo(a.x-px*w0,a.y-py*w0);c.arc(a.x,a.y,w0,ang-PI/2,ang-3*PI/2,true);c.closePath();
    c.fillStyle=lg(mx+nx*w,my+ny*w,mx-nx*w,my-ny*w,o.stops||tri(col,o.lit??.3));c.fill();
    if(o.out!==false){c.strokeStyle=o.outCol||OUT;c.lineWidth=o.lw||1;c.stroke();}
    if(o.hl!==false){c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1.1;c.beginPath();c.moveTo(a.x+nx*w0*.55,a.y+ny*w0*.55);c.lineTo(b.x+nx*w1*.55,b.y+ny*w1*.55);c.stroke();}
  }
  function bez(pts,fill,stroke,lw=1){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===6)c.bezierCurveTo(...p);else if(p.length===4)c.quadraticCurveTo(...p);else c.lineTo(p[0],p[1]);}c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
  const poly=(pts,fill,stroke,lw=1)=>bez(pts,fill,stroke,lw);
  function stroke(pts,col,w=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=col;c.lineWidth=w;c.stroke();}
  function curve(p0,cp,p1,col,w=1){c.beginPath();c.moveTo(p0[0],p0[1]);c.quadraticCurveTo(cp[0],cp[1],p1[0],p1[1]);c.strokeStyle=col;c.lineWidth=w;c.stroke();}
  // ---------- weapons (local frame: pointing up, grip at origin) ----------
  const W_={};
  W_.sword=(o)=>{
    const len=o.len||60,wd=o.wd||5.4,steel=o.col||'#cfd8dc',gold=o.guard||'#c9aa5e';
    ell(0,10.5,2.8,2.8,lg(-3,8,3,13,tri(gold)),OUT);
    c.fillStyle=lg(-2,0,2,0,tri('#5a3e2a'));c.fillRect(-2,-3,4,12.5);stroke([[-2,0],[2,1.5]],'rgba(0,0,0,.35)',1);stroke([[-2,4],[2,5.5]],'rgba(0,0,0,.35)',1);
    bez([[-8,-3.2],[-6,-5.6,6,-5.6,8,-3.2],[7,-.4,-7,-.4,-8,-3.2]],lg(-8,-5,8,0,tri(gold)),OUT);
    bez([[-wd/2,-5],[-wd/2*.92,-5-len*.88],[0,-5-len],[wd/2*.92,-5-len*.88],[wd/2,-5]],lg(-wd/2,0,wd/2,0,[[0,shade(steel,.45)],[.5,steel],[1,shade(steel,-.5)]]),OUT);
    stroke([[0,-9],[0,-5-len*.82]],'rgba(20,30,40,.28)',1.4);stroke([[-wd/2+.7,-6],[-wd/2*.8,-5-len*.8]],'rgba(255,255,255,.75)',.9);
    if(o.glow){c.save();c.globalCompositeOperation='lighter';stroke([[0,-12],[0,-5-len*.9]],o.glow,2);c.restore();}
  };
  W_.dagger=(o)=>W_.sword({len:o.len||24,wd:3.8,col:o.col||'#c4ccd0',guard:o.guard||'#7a5c3a'});
  W_.axe=(o)=>{
    const L=o.len||66;c.fillStyle=lg(-2.2,0,2.2,0,tri('#7a5636'));c.fillRect(-2.2,-L,4.4,L+16);stroke([[-1.2,-L],[-1.2,14]],'rgba(255,230,180,.18)',1);
    const head=(m)=>{c.save();c.scale(m,1);
      bez([[1.8,-L-5],[14,-L-14,30,-L-8,28,-L+9],[25,-L+19,12,-L+17,1.8,-L+14]],lg(0,-L-10,28,-L+16,[[0,'#e6ecee'],[.5,'#aab6bb'],[1,'#5f7077']]),OUT);
      curve([5,-L-1],[22,-L-6],[26,-L+8],'rgba(255,255,255,.8)',1.4);stroke([[3,-L+2],[16,-L+4]],'rgba(30,40,50,.25)',1);c.restore();};
    head(1);if(o.dbl)head(-1);else bez([[-1.8,-L+1],[-9,-L+4],[-1.8,-L+9]],'#7b8990',OUT);
    ell(0,-L+4,3.2,3.2,'#6c4c30',OUT);
  };
  W_.spear=(o)=>{
    const L=o.len||52;c.fillStyle=lg(-2,0,2,0,tri('#835b38'));c.fillRect(-2,-L,4,L+40);
    bez([[0,-L-26],[5.2,-L-12],[3,-L-1],[-3,-L-1],[-5.2,-L-12]],lg(-5,0,5,0,[[0,'#f2f6f6'],[.5,'#b3c0c5'],[1,'#61737a']]),OUT);stroke([[0,-L-24],[0,-L-2]],'rgba(30,40,50,.3)',1);
    bez([[-3,-L],[-9,-L+11],[-1,-L+8],[0,-L+17],[1,-L+8],[9,-L+11],[3,-L]],'#a8332f','rgba(0,0,0,.35)');
  };
  W_.hammer=(o)=>{
    const L=o.len||54;c.fillStyle=lg(-2.6,0,2.6,0,tri('#76522f'));c.fillRect(-2.6,-L,5.2,L+16);
    bez([[-12,-L-9],[12,-L-9],[14,-L+11],[-12,-L+11]],lg(-12,-L-10,12,-L+11,[[0,'#bcc4c8'],[.5,'#7c868b'],[1,'#3f4a50']]),OUT);
    c.fillStyle='rgba(20,26,30,.45)';c.fillRect(-12,-L-3,26,3);c.fillRect(-12,-L+4,26,2.5);
    for(const [x,y] of [[-8,-L-6],[8,-L-6],[-8,-L+8],[8,-L+8]])ell(x,y,1.3,1.3,'#d6dadb');
    bez([[-12,-L-4],[-24,-L],[-12,-L+5]],'#69747a',OUT);stroke([[-11,-L-7],[11,-L-7]],'rgba(255,255,255,.4)',1);
  };
  W_.staff=(o)=>{
    const L=o.len||92,orb=o.orb||'#7fd6ff',top=o.top||'orb';
    c.fillStyle=lg(-2.2,0,2.2,0,tri(o.wood||'#7a5a3a'));c.fillRect(-2.2,-L,4.4,L+30);stroke([[-1,-L],[-1,26]],'rgba(255,230,190,.18)',1);
    if(top==='skull'){bez([[-6,-L-3],[-8,-L-14,8,-L-14,6,-L-3],[4,-L+1,-4,-L+1,-6,-L-3]],'#dcd8c0',OUT);ell(-2.5,-L-8,1.7,2,'#25301f');ell(2.5,-L-8,1.7,2,'#25301f');glowAt(0,-L-14,20,orb,.55);bez([[-3,-L-14],[0,-L-26],[3,-L-14]],rgba(orb,.85));}
    else if(top==='crystal'){glowAt(0,-L-10,24,orb,.55);poly([[0,-L-24],[6,-L-9],[0,-L+1],[-6,-L-9]],lg(-6,0,6,0,[[0,'#f2fbff'],[.5,orb],[1,shade(orb,-.5)]]),'rgba(255,255,255,.7)');stroke([[0,-L-24],[0,-L+1]],'rgba(255,255,255,.55)',.8);}
    else if(top==='antler'){for(const m of [1,-1]){c.save();c.scale(m,1);stroke([[0,-L],[6,-L-10],[9,-L-22]],'#cdbb94',2.4);stroke([[6,-L-10],[12,-L-12]],'#cdbb94',2);stroke([[7,-L-16],[3,-L-24]],'#cdbb94',1.8);c.restore();}glowAt(0,-L-4,18,orb,.5);ell(0,-L-4,4.5,4.5,rg(0,-L-4,5,[[0,'#fff'],[1,orb]]),OUT);}
    else{stroke([[-1,-L+4],[-7,-L-6],[-3,-L-17]],'#8a6a45',2.2);stroke([[1,-L+4],[7,-L-6],[3,-L-17]],'#8a6a45',2.2);glowAt(0,-L-8,26,orb,.6);ell(0,-L-8,6.4,6.4,rg(-1.5,-L-10,8,[[0,'#ffffff'],[.4,orb],[1,shade(orb,-.55)]]),OUT);}
  };
  W_.scythe=(o)=>{W_.staff({len:96,top:'none',wood:'#4d3a2c'});c.save();c.translate(0,-96);bez([[0,0],[10,-14,28,-12,38,2],[28,-4,10,-2,0,6]],lg(0,-14,34,6,[[0,'#e4e9e6'],[.6,'#8a979a'],[1,'#3d4a50']]),OUT);stroke([[2,-3],[18,-8],[32,-2]],'rgba(255,255,255,.7)',1);c.restore();};
  // ---------- shields ----------
  function shield(x,y,sh,rot=0,sz=1){
    c.save();c.translate(x,y);c.rotate(rot);c.scale(sz,sz);
    if(sh.type==='kite'){
      bez([[-14,-26],[14,-26],[15,-2],[0,28],[-15,-2]],lg(-14,-26,14,26,[[0,shade(sh.col,.28)],[.55,sh.col],[1,shade(sh.col,-.5)]]),OUT,1.4);
      bez([[-14,-26],[14,-26],[15,-2],[0,28],[-15,-2]],null,sh.trim,2);stroke([[0,-24],[0,24]],rgba(sh.trim,.7),1.6);stroke([[-13,-8],[13,-8]],rgba(sh.trim,.7),1.6);
      ell(0,-6,4.2,4.2,rg(-1,-7,5,[[0,'#fff6d0'],[1,sh.trim]]),OUT);
    }else{
      ell(0,0,17,18,lg(-14,-14,14,14,[[0,shade(sh.col,.32)],[.5,sh.col],[1,shade(sh.col,-.5)]]),OUT);
      c.strokeStyle=sh.trim;c.lineWidth=2.6;c.beginPath();c.ellipse(0,0,15.5,16.5,0,0,PI*2);c.stroke();
      ell(0,0,5.2,5.2,rg(-1.5,-1.5,6,[[0,'#fff6d0'],[.6,sh.trim],[1,shade(sh.trim,-.4)]]),OUT);
      for(let i=0;i<8;i++){const a=i*PI/4;ell(Math.cos(a)*12.2,Math.sin(a)*13,1,1,'#f1e5b8');}
      stroke([[0,-14],[0,-6]],rgba(sh.trim,.6),1.6);stroke([[0,6],[0,14]],rgba(sh.trim,.6),1.6);
    }
    c.restore();
  }
  // ---------- looks ----------
  const SK={fair:'#dcae88',tan:'#c99a74',pale:'#e0c2ac',dark:'#a97c5c'};
  const LOOKS={
    hero:{skin:SK.fair,head:'hair',hair:'#3f2a1c',top:{type:'chain',col:'#808c96',trim:'#d9c374'},tabard:{col:'#2c64a0',trim:'#d9c374'},sleeve:'#808c96',fore:'#6b4a2f',pauldron:{col:'#aab7be'},pants:{col:'#3a3b46'},boots:'#5b3d27',cape:{col:'#1f4670',inner:'#15304f'},belt:'#5b3d27',shieldDef:{type:'round',col:'#2c64a0',trim:'#d9c374'}},
    bandit:{skin:SK.tan,head:'hood',hoodCol:'#5a4333',mask:'#7b2e2a',top:{type:'leather',col:'#7d5b3b',trim:'#c9a35a'},sleeve:'#6b5a46',fore:'#4a3a2a',pants:{col:'#4a4034'},boots:'#34281d',belt:'#3a2a1c',weapon:'sword',wlen:42,wcol:'#aeb4b0',lean:.04},
    archer:{skin:SK.fair,head:'hood',hoodCol:'#3e5c3c',top:{type:'tunic',col:'#6e8250',trim:'#b9a468'},sleeve:'#6e8250',fore:'#5a4630',pants:{col:'#4b4a3c'},boots:'#4a3624',cape:{col:'#35502f',inner:'#233a20'},belt:'#4a3624',quiver:true,weapon:'bow'},
    skeleton:{bones:true,skin:'#dcd7bc',head:'skull',rags:'#5a5346',top:{type:'bones',col:'#d3cfb5',trim:'#8f8b74'},sleeve:'#d3cfb5',fore:'#d3cfb5',pants:{col:'#8f8b74'},boots:'#d3cfb5',weapon:'sword',wlen:52,wcol:'#8f7560',guard:'#5a4c3a',lean:.03},
    knight:{skin:SK.fair,head:'greathelm',plume:'#7a2a3a',top:{type:'plate',col:'#8e9ba4',trim:'#cdb869'},tabard:{col:'#5b3b66',trim:'#cdb869'},sleeve:'#7e8b94',fore:'#8e9ba4',pauldron:{col:'#a6b2b9',big:true},pants:{col:'#7e8b94',type:'plate'},boots:'#6c777e',belt:'#3b2c26',weapon:'sword',wlen:64,shieldDef:{type:'kite',col:'#5b3b66',trim:'#cdb869'},b:1.12,lt:1.1},
    mage:{skin:SK.pale,head:'hat',hat:'#3d3270',beard:'#e6e4de',robe:{col:'#4a3d82',trim:'#d6bd6a'},top:{type:'robe',col:'#4a3d82',trim:'#d6bd6a'},sleeve:'#4a3d82',fore:'#3b3070',pants:{col:'#2c2650'},boots:'#2a2018',belt:'#8a6a3a',weapon:'staff',orb:'#7fd6ff'},
    brute:{skin:'#b98d6d',head:'bald',beard:'#4a3426',top:{type:'harness',col:'#b98d6d',trim:'#4a3626'},sleeve:'#b98d6d',fore:'#4a3626',pauldron:{col:'#6a6f74',spike:true},pants:{col:'#4d3e32'},boots:'#3a2b20',belt:'#3a2a1c',weapon:'hammer',b:1.42,lt:1.34,lean:.08,sc:1.05},
    assassin:{skin:SK.tan,head:'hood',hoodCol:'#2b2d38',mask:'#1d1f27',top:{type:'leather',col:'#2e313d',trim:'#8a2f4a'},sleeve:'#2e313d',fore:'#1d1f27',pants:{col:'#23252f'},boots:'#17181f',belt:'#8a2f4a',weapon:'dual',wcol:'#b9c2c8',b:.86,lt:.88,lean:.15,crouch:1,cape:{col:'#23252f',inner:'#14151b'}},
    cultist:{skin:SK.pale,head:'hood',hoodCol:'#5a1f2e',hoodDark:true,robe:{col:'#6a2234',trim:'#c7a24a'},top:{type:'robe',col:'#6a2234',trim:'#c7a24a'},sleeve:'#6a2234',fore:'#3d121c',pants:{col:'#2a1018'},boots:'#1a1015',belt:'#2a1c18',weapon:'staff',orb:'#8dff9a',stafftop:'skull',wood:'#3a2a22',runes:true},
    princess:{skin:SK.pale,head:'princess',hair:'#c9a24e',robe:{col:'#e6dcc4',trim:'#c9a24e'},top:{type:'robe',col:'#e6dcc4',trim:'#c9a24e'},sleeve:'#e6dcc4',fore:'#e6dcc4',pants:{col:'#c9a24e'},boots:'#8a6a4a',belt:'#c9a24e',weapon:'none',b:.86,lt:.85},
    boss0:{skin:SK.fair,head:'horned',top:{type:'plate',col:'#6c767d',trim:'#c9a24e'},tabard:{col:'#8a2d33',trim:'#c9a24e'},sleeve:'#5f696f',fore:'#6c767d',pauldron:{col:'#7c878e',big:true,spike:true},pants:{col:'#5f696f',type:'plate'},boots:'#4f585e',belt:'#2e2420',weapon:'sword',wlen:66,wcol:'#c9d0d4',shieldDef:{type:'kite',col:'#7c2b30',trim:'#c9a24e'},cape:{col:'#6a1e26',inner:'#3f1116'},b:1.34,lt:1.25,sc:1.02},
    boss1:{skin:'#8da379',head:'witch',hair:'#2a2438',top:{type:'robe',col:'#33452f',trim:'#8d5fc0'},robe:{col:'#33452f',trim:'#8d5fc0',tatter:true,under:'#5b3a78'},sleeve:'#33452f',fore:'#5b3a78',pants:{col:'#2a2438'},boots:'#201a22',belt:'#5b3a78',weapon:'staff',orb:'#9fff9a',stafftop:'orb',wood:'#4a3a28',lean:.1,slime:true},
    boss2:{skin:'#a47660',head:'skullhelm',top:{type:'bare',col:'#a47660',trim:'#4b3a2e'},sleeve:'#a47660',fore:'#4b3a2e',pauldron:{col:'#5a5f63',spike:true},pants:{col:'#4b3a2e',type:'fur'},boots:'#2e231b',belt:'#3a2a1c',weapon:'doubleaxe',b:1.52,lt:1.42,sc:1.06,lean:.09},
    boss3:{skin:'#d4e6ef',head:'icecrown',hair:'#e9f4ff',top:{type:'robe',col:'#7fb6d9',trim:'#e9f2f7'},robe:{col:'#7fb6d9',trim:'#e9f2f7',under:'#bfe0f0',fur:true},sleeve:'#7fb6d9',fore:'#bfe0f0',pants:{col:'#5c8fb0'},boots:'#cfe6f2',belt:'#e9f2f7',weapon:'staff',orb:'#bff0ff',stafftop:'crystal',wood:'#cfe6f2',aura:'#bff0ff',b:.95},
    boss4:{skin:'#5e6a46',head:'antlers',top:{type:'leather',col:'#2f3a2c',trim:'#5a7a3a'},tabard:{col:'#4a2f5a',trim:'#7a9a4a'},sleeve:'#2f3a2c',fore:'#4a3a2a',pauldron:{col:'#3a4a2e',spike:true},pants:{col:'#2a3326'},boots:'#1f251d',belt:'#4a2f5a',weapon:'spear',wcol:'#8fa05a',cape:{col:'#35223f',inner:'#201428'},vines:true,aura:'#b58cff',b:1.1,lt:1.06,lean:.05},
    boss5:{skin:SK.dark,head:'flamecrown',top:{type:'plate',col:'#2f2e36',trim:'#ff7a1c',ember:true},tabard:{col:'#3a1418',trim:'#ff7a1c'},sleeve:'#2a2931',fore:'#2f2e36',pauldron:{col:'#3a3943',big:true,spike:true,ember:true},pants:{col:'#2a2931',type:'plate'},boots:'#1d1c22',belt:'#14131a',weapon:'greatsword',wlen:78,wcol:'#4a3434',glow:'#ff8a2a',cape:{col:'#3a1418',inner:'#1c0a0d',tatter:true},aura:'#ff7a1c',b:1.38,lt:1.3,sc:1.04}
  };
  const WSTYLE={sword:'slash',dagger:'slash',greatsword:'overhead',axe:'overhead',doubleaxe:'overhead',hammer:'overhead',spear:'thrust',bow:'bow',dual:'dual',staff:'cast',scythe:'cast',none:'none'};
  const TWO={greatsword:1,doubleaxe:1,hammer:1,spear:1,staff:0};
  const HERO_W=['sword','greatsword','axe','spear','bow'];
  const KINDS=['hero','bandit','archer','skeleton','knight','mage','brute','assassin','cultist','princess','boss0','boss1','boss2','boss3','boss4','boss5'];
  const COUNT={walk:8,idle:4,attack:8,hit:3,block:1};
  function lookFor(kind,weapon){
    const l={...LOOKS[kind]};
    if(kind==='hero'){l.weapon=weapon;l.wlen=weapon==='greatsword'?76:58;l.wcol='#d6dee2';if(weapon==='sword'||weapon==='axe')l.shield=l.shieldDef;}
    else if(l.shieldDef)l.shield=l.shieldDef;
    l.style=WSTYLE[l.weapon||'sword'];l.two=!!TWO[l.weapon];
    if(l.weapon==='axe'||l.weapon==='sword'||l.weapon==='dagger')l.two=false;
    return l;
  }
  // ---------- pose tables ----------
  const ATK={
    slash:{sh:[1.0,1.9,2.7,3.1,1.85,1.45,1.15,1.0],el:[1.0,.9,.9,1.0,.25,.45,.7,.95],wA:[.6,-.1,-.8,-1.15,1.7,2.3,1.4,.7],lean:[-.04,-.1,-.17,-.2,.2,.16,.1,.04],shift:[0,-1,-3,-4,3,4,2,1],hipN:[.1,.05,-.05,-.1,.4,.34,.22,.1],hipF:[-.1,-.1,-.05,-.05,-.5,-.44,-.3,-.15],kneeN:[.15,.18,.2,.2,.4,.32,.25,.18],kneeF:[.15,.2,.26,.26,.15,.2,.2,.18]},
    overhead:{sh:[1.0,2.0,2.85,3.3,1.6,1.25,1.0,.9],el:[1.1,.9,.8,.9,.2,.45,.7,.9],wA:[.35,-.4,-1.0,-1.25,1.3,1.95,1.1,.5],lean:[-.05,-.14,-.25,-.3,.3,.25,.14,.06],shift:[0,-2,-4,-5,3,5,3,1],hipN:[.1,.03,-.08,-.14,.5,.42,.26,.1],hipF:[-.1,-.12,-.08,-.04,-.56,-.5,-.3,-.15],kneeN:[.15,.2,.24,.24,.5,.4,.28,.18],kneeF:[.15,.22,.3,.3,.18,.22,.2,.18]},
    thrust:{sh:[1.0,.6,.2,-.1,1.5,1.45,1.3,1.1],el:[.8,1.0,1.2,1.3,.12,.2,.45,.7],wA:[1.15,1.3,1.4,1.4,1.5,1.45,1.35,1.2],lean:[-.02,-.08,-.14,-.18,.22,.18,.1,.03],shift:[0,-2,-4,-5,3,4,2,1],hipN:[.1,.06,0,-.05,.55,.45,.25,.1],hipF:[-.1,-.1,-.05,-.1,-.5,-.4,-.25,-.12],kneeN:[.15,.2,.25,.25,.45,.35,.25,.18],kneeF:[.15,.2,.3,.3,.12,.18,.2,.18]},
    cast:{sh:[.8,1.3,1.8,2.1,1.75,1.6,1.3,1.0],el:[.8,.7,.6,.6,.25,.35,.55,.8],wA:[.08,-.02,-.08,-.15,.7,.5,.3,.12],lean:[-.02,-.06,-.1,-.12,.1,.08,.04,.01],shift:[0,-1,-2,-3,3,3,1,0],hipN:[.1,.06,.02,0,.22,.18,.14,.1],hipF:[-.12,-.12,-.1,-.08,-.3,-.25,-.2,-.15],kneeN:[.14,.16,.18,.18,.24,.2,.16,.14],kneeF:[.14,.16,.18,.18,.2,.18,.16,.14],farT:[[14,18],[20,6],[26,-8],[30,-20],[44,-6],[38,2],[28,10],[18,18]]},
    dual:{sh:[1.0,1.6,2.2,2.5,1.75,1.4,1.2,1.0],el:[.9,.8,.8,.9,.35,.6,.8,.9],wA:[.8,.4,-.2,-.5,1.55,2.05,1.5,.9],lean:[.1,.06,0,-.02,.28,.22,.16,.12],shift:[0,-1,-3,-4,8,8,4,1],hipN:[.3,.2,.05,0,.6,.5,.4,.3],hipF:[.1,.1,.05,-.1,-.5,-.4,-.2,0],kneeN:[.5,.5,.5,.5,.55,.5,.5,.5],kneeF:[.5,.5,.55,.55,.4,.45,.5,.5]}
  };
  const lerp=(a,b,t)=>a+(b-a)*t;
  function readyArms(look,P){
    const st=look.style;
    if(st==='slash'){P.near={sh:1.05,el:1.0};P.wA=.55;}
    else if(st==='overhead'){P.near={sh:.95,el:1.15};P.wA=look.two?.3:.45;}
    else if(st==='thrust'){P.near={sh:1.0,el:.9};P.wA=1.3;}
    else if(st==='dual'){P.near={sh:.9,el:1.0};P.wA=.9;P.dual=true;P.far={m:'fk',sh:.8,el:1.0};P.wA2=.9;}
    else if(st==='cast'){P.near={sh:.55,el:.9};P.wA=.08;}
    else if(st==='bow'){P.near={sh:.95,el:.5};P.wA=0;}
    else {P.near={sh:.2,el:.5};P.wA=0;}
    if(look.shield)P.far={m:'ik',x:24,y:20,bend:1};
    else if(look.two&&look.style!=='none')P.far={m:'weap',off:look.style==='thrust'?-22:-13};
    else if(!P.far)P.far={m:'fk',sh:-.12,el:.4};
    if(look.style==='bow')P.far={m:'fk',sh:1.35,el:.3};
    if(look.style==='cast'&&!P.far.m)P.far={m:'fk',sh:.1,el:.6};
  }
  function poseFor(look,action,i){
    const P={shift:0,bob:0,lean:look.lean||0,tilt:0,hipN:.12,kneeN:.12,hipF:-.14,kneeF:.14,sway:0,breath:0,draw:0};
    readyArms(look,P);
    const cr=look.crouch?1:0;
    if(cr){P.hipN+=.28;P.kneeN+=.45;P.hipF+=.1;P.kneeF+=.4;}
    const arrow=()=>look.style==='bow';
    if(action==='idle'){const br=Math.sin(i*PI/2);P.breath=br;P.bob=br*.9;P.sway=br;P.lean+=br*.012;P.near={...P.near,sh:P.near.sh+br*.03};P.tilt=br*.02;if(P.far.m==='fk')P.far={...P.far,sh:P.far.sh-br*.03};}
    else if(action==='walk'){
      const ph=i*PI/4,s=Math.sin(ph),k=Math.cos(ph);
      P.hipN=.55*s+(cr?.25:0);P.hipF=-.55*s+(cr?.15:0);P.kneeN=.12+.95*Math.pow(Math.max(0,k),1.2)+(cr?.35:0);P.kneeF=.12+.95*Math.pow(Math.max(0,-k),1.2)+(cr?.35:0);
      P.bob=-2.2*Math.cos(2*ph)+1;P.lean+=.035;P.sway=s;P.shift=Math.sin(ph*2)*.8;
      const amp=look.style==='bow'||look.style==='none'?.4:.14;P.near={...P.near,sh:P.near.sh-s*amp,el:P.near.el+Math.max(0,-s)*.25};
      if(P.far.m==='fk'&&look.style!=='bow')P.far={...P.far,sh:P.far.sh+s*.5,el:.35+Math.max(0,s)*.35};
      if(look.style==='cast'&&P.far.m==='fk')P.far={...P.far,sh:.1+s*.35};
      P.walk=true;
    }else if(action==='attack'){
      const st=look.style,T=ATK[st];
      if(st==='bow'){
        const d=[.08,.3,.65,1,.85,.35,.12,0][i];P.draw=d;P.fired=i>=4;P.near={m:'bow'};P.far={m:'fk',sh:1.5,el:.1};P.lean=-.02-d*.03+(i===4?.03:0);P.shift=-d*1.5;P.hipN=.22;P.hipF=-.22;P.kneeN=.2;P.kneeF=.16;P.bowKick=i===4?1:0;
      }else if(st==='none'){}
      else{
        P.near={sh:T.sh[i],el:T.el[i]};P.wA=T.wA[i];P.lean=T.lean[i]+(look.lean||0)*.5;P.shift=T.shift[i];P.hipN=T.hipN[i]+(cr?.1:0);P.hipF=T.hipF[i]+(cr?.1:0);P.kneeN=T.kneeN[i];P.kneeF=T.kneeF[i];
        if(st==='dual'){const j=(i+2)%8;P.far={m:'fk',sh:T.sh[j],el:T.el[j]};P.wA2=T.wA[j];}
        else if(st==='cast'){P.far={m:'ik',x:T.farT[i][0],y:T.farT[i][1],bend:1};P.cast=i>=3&&i<=5?1:0;P.castGlow=[0,.2,.4,.7,1,.7,.35,.1][i];}
        else if(look.shield){P.far={m:'ik',x:[24,22,20,20,32,30,27,25][i],y:[20,20,22,22,8,10,14,18][i],bend:1};}
        else if(look.two)P.far={m:'weap',off:st==='thrust'?[-22,-22,-22,-22,-30,-28,-24,-22][i]:-13};
        else P.far={m:'fk',sh:-.12-(T.sh[i]-1)*.18,el:.5};
        P.swing=i;
      }
      P.striking=i===4;
    }else if(action==='hit'){
      const t=1-i/3;P.lean=-.24*t+(look.lean||0)*.3;P.shift=-8*t;P.tilt=-.3*t;P.hipN=.3*t;P.hipF=-.28*t;P.kneeN=.3*t+.1;P.kneeF=.35*t+.1;
      if(look.style==='bow'){P.near={sh:.6,el:.6};P.far={m:'fk',sh:1.0,el:.4};}
      else{P.near={sh:.3+.4*(1-t),el:.9};P.wA=.9;if(P.far.m!=='fk'){P.far={m:'fk',sh:-.7*t,el:.6};}else P.far={m:'fk',sh:-.8*t,el:.7};}
      P.hit=t;P.bob=1.5*t;
    }else if(action==='block'){
      P.lean=-.06+(look.lean||0)*.4;P.hipN=.28;P.hipF=-.24;P.kneeN=.5;P.kneeF=.45;P.bob=0;
      if(look.shield){P.far={m:'ik',x:30,y:-2,bend:1};P.near={sh:.8,el:1.3};P.wA=.9;P.shieldUp=1;}
      else if(look.style==='bow'){P.near={sh:1.1,el:.9};P.far={m:'fk',sh:1.5,el:.3};}
      else if(look.style==='none'){}
      else{P.near={sh:1.9,el:1.6};P.wA=look.two?.5:.25;if(look.style==='thrust')P.wA=.9;P.far=look.two?{m:'weap',off:-13}:{m:'ik',x:24,y:-4,bend:1};if(look.style==='cast')P.wA=.6;}
      P.blocking=true;
    }
    return P;
  }
  // ---------- rig ----------
  function ik(S,T,l1,l2,bend){
    let dx=T.x-S.x,dy=T.y-S.y,d=Math.hypot(dx,dy);d=Math.min(Math.max(d,Math.abs(l1-l2)+.5),l1+l2-.3);
    const base=Math.atan2(dy,dx),A=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));
    const e={x:S.x+l1*Math.cos(base+bend*A),y:S.y+l1*Math.sin(base+bend*A)};
    return{e,h:{x:S.x+Math.cos(base)*d,y:S.y+Math.sin(base)*d}};
  }
  function rig(look,P){
    const s=(look.sc||1),th=41*s,sh=40*s,ua=29*s,fa=27*s,sp=52*s,G={s};
    const leg=(h,k)=>{const a=h-k;return{h,k,kx:th*Math.sin(h),ky:th*Math.cos(h),ax:th*Math.sin(h)+sh*Math.sin(a),ay:th*Math.cos(h)+sh*Math.cos(a),drop:th*Math.cos(h)+sh*Math.cos(a)+6*s};};
    const ln=leg(P.hipN,P.kneeN),lf=leg(P.hipF,P.kneeF),drop=Math.max(ln.drop,lf.drop);
    G.px=P.shift;G.py=-drop+P.bob;
    G.legN={hip:{x:G.px+2,y:G.py},knee:{x:G.px+2+ln.kx,y:G.py+ln.ky},ank:{x:G.px+2+ln.ax,y:G.py+ln.ay},low:ln.drop>=drop-.6,h:ln.h,k:ln.k};
    G.legF={hip:{x:G.px-2,y:G.py},knee:{x:G.px-2+lf.kx,y:G.py+lf.ky},ank:{x:G.px-2+lf.ax,y:G.py+lf.ay},low:lf.drop>=drop-.6,h:lf.h,k:lf.k};
    const ld=dirA(P.lean);G.lean=P.lean;
    G.S={x:G.px+ld.x*sp,y:G.py-ld.y*sp};// shoulder centre
    const hd=dirA(P.lean*.55+P.tilt);G.head={x:G.S.x+3+Math.sin(P.lean*.55+P.tilt)*14+ld.x*3,y:G.S.y-Math.cos(P.lean*.55+P.tilt)*14-ld.y*3-3+P.breath*-.3};
    G.headTilt=P.lean*.5+P.tilt;
    G.sN={x:G.S.x+1.5,y:G.S.y+2};G.sF={x:G.S.x-2,y:G.S.y+1};
    const fk=(S,a,e)=>{const el={x:S.x+ua*Math.sin(a),y:S.y+ua*Math.cos(a)};return{e:el,h:{x:el.x+fa*Math.sin(a+e),y:el.y+fa*Math.cos(a+e)}};};
    // near arm
    let n;
    if(P.near.m==='bow'){
      const bowHand=null;G.needBow=true;n=null;
    }else n=fk(G.sN,P.near.sh,P.near.el);
    // far arm (needed first for bow)
    let f;
    const fr=P.far;
    if(fr.m==='fk')f=fk(G.sF,fr.sh,fr.el);
    else if(fr.m==='ik')f=ik(G.sF,{x:G.S.x+fr.x*s,y:G.S.y+fr.y*s},ua,fa,fr.bend);
    G.bowHand=null;
    if(look.style==='bow'){G.bowHand=f.h;if(P.near.m==='bow'){const rest={x:f.h.x-5,y:f.h.y+1},cheek={x:G.head.x+4,y:G.head.y+9},tg={x:lerp(rest.x,cheek.x,P.draw),y:lerp(rest.y,cheek.y,P.draw)};n=ik(G.sN,tg,ua,fa,-1);G.stringHand=n.h;}}
    G.n=n;
    // weapon
    G.wpos=n?n.h:null;G.wA=P.wA;
    if(fr.m==='weap'){const d={x:Math.sin(P.wA),y:-Math.cos(P.wA)};const tg={x:n.h.x+d.x*(-fr.off),y:n.h.y+d.y*(-fr.off)};f=ik(G.sF,tg,ua,fa,1);}
    G.f=f;
    if(P.dual){const a2=P.wA2;G.wpos2=f.h;G.wA2=a2;}
    return G;
  }
  // ---------- body parts ----------
  function drawFoot(leg,look,P,far){
    const col=far?shade(look.boots,-.25):look.boots,a=leg.ank,rot=leg.low?0:(leg.h<0?Math.min(.9,-leg.h*.9+.1):Math.min(.55,leg.k*.4));
    c.save();c.translate(a.x,a.y);c.rotate(rot);
    if(look.bones){bez([[-3,2],[6,0],[16,5],[16,6.4],[-3,6.4]],lg(0,0,0,7,tri('#d3cfb5')),OUT);}
    else{
      bez([[-4.5,-1],[3,-1.5],[5,2],[13,3.2],[17,5.6],[17.5,7],[-4.5,7]],lg(0,-2,0,7,tri(col,.28)),OUT);
      c.fillStyle='rgba(0,0,0,.45)';c.fillRect(-4.5,6,22,1.4);
      stroke([[6,2.6],[12,3.4]],'rgba(255,255,255,.16)',1);
    }
    c.restore();
  }
  function drawLeg(leg,look,far){
    const lt=(look.lt||1)*1.1,hip=leg.hip,kn=leg.knee,an=leg.ank,pc=far?shade(look.pants.col,-.3):look.pants.col;
    if(look.bones){
      limb(hip,kn,3,2.4,far?'#a9a58f':'#d3cfb5');limb(kn,an,2.4,1.9,far?'#a9a58f':'#d3cfb5');ell(kn.x,kn.y,3.4,3.4,'#e4e0c8',OUT);ell(hip.x,hip.y,3.6,3.6,'#e4e0c8',OUT);drawFoot(leg,look,null,far);return;
    }
    const bootTop={x:an.x+(kn.x-an.x)*.42,y:an.y+(kn.y-an.y)*.42};
    limb(hip,kn,8.4*lt,6.2*lt,pc,{lit:.22});
    if(look.pants.type==='fur'){for(let i=0;i<6;i++){const t=i/5,x=lerp(hip.x,kn.x,t),y=lerp(hip.y,kn.y,t);stroke([[x-5*lt,y],[x-2*lt,y+3]],'rgba(255,240,210,.25)',1.4);}}
    limb(kn,an,6.2*lt,4.4*lt,pc,{lit:.2});
    if(look.pants.type==='plate'){
      limb(hip,kn,8.8*lt,6.6*lt,pc,{lit:.38});ell(kn.x+1.5,kn.y,5.6*lt,5.6*lt,rg(kn.x,kn.y-2,7,[[0,shade(pc,.55)],[1,shade(pc,-.2)]]),OUT);
      limb(kn,an,6.6*lt,4.8*lt,pc,{lit:.4});
    }
    limb(bootTop,an,6.1*lt,4.9*lt,far?shade(look.boots,-.25):look.boots,{lit:.25});
    c.beginPath();c.arc(bootTop.x,bootTop.y,6.2*lt,0,PI*2);c.fillStyle=rgba(far?shade(look.boots,-.2):shade(look.boots,.15),.9);c.fill();
    drawFoot(leg,look,null,far);
  }
  function torsoPath(b){
    c.beginPath();c.moveTo(-10*b,3);c.bezierCurveTo(-13*b,-10,-13.5*b,-28,-10*b,-45);c.bezierCurveTo(-8*b,-52,-3*b,-56,3,-56);c.bezierCurveTo(9*b,-55,12*b,-50,14*b,-42);c.bezierCurveTo(16*b,-32,12*b,-22,11*b,-12);c.bezierCurveTo(12*b,-4,11*b,2,9*b,5);c.bezierCurveTo(3,9,-5*b,8,-10*b,3);c.closePath();
  }
  function drawTorso(look,G,P){
    const b=look.b||1,top=look.top,t=top.type,col=top.col;
    c.save();c.translate(G.px,G.py);c.rotate(G.lean);
    // pelvis / hip garment
    if(!look.bones&&t!=='robe'){
      const pc=look.pants.col;bez([[-10*b,0],[11*b,-1],[12*b,9],[3,13],[-11*b,10]],lg(-10,0,12,10,tri(pc,.15)),OUT);
    }
    torsoPath(b);
    if(look.bones){
      c.fillStyle='rgba(20,22,24,.55)';c.fill();c.save();torsoPath(b);c.clip();
      stroke([[-1,-54],[-1,6]],'#b9b49a',3.2);
      for(let k=0;k<6;k++){const y=-46+k*6.2,w=13-k*1.1;c.beginPath();c.moveTo(-1,y);c.bezierCurveTo(4,y-2,w,y,w-1,y+7);c.strokeStyle='#e0dcc3';c.lineWidth=2.6;c.stroke();c.strokeStyle='rgba(60,56,40,.55)';c.lineWidth=.8;c.stroke();c.beginPath();c.moveTo(-1,y);c.bezierCurveTo(-6,y-2,-w+3,y,-w+4,y+7);c.strokeStyle='#a39e86';c.lineWidth=2;c.stroke();}
      stroke([[-1,-56],[-1,-50]],'#e8e4cc',5);c.restore();
      poly([[-9,-4],[9,-4],[7,7],[0,11],[-7,7]],lg(-9,-4,9,7,tri('#cfcab0')),OUT);
      ell(-1,-1,2.6,2.2,'#2b2e28');
      // rags
      bez([[-10,3],[11,2],[12,14],[8,22],[3,14],[-3,24],[-10,13]],rgba(look.rags,.95),'rgba(0,0,0,.4)');
    }else{
      let grad=lg(-14*b,-30,14*b,0,tri(col,t==='bare'?.25:.3));
      if(t==='bare')grad=lg(-14*b,-30,14*b,10,[[0,shade(col,.28)],[.5,col],[1,shade(col,-.4)]]);
      c.fillStyle=grad;c.fill();c.strokeStyle=OUT;c.lineWidth=1.1;c.stroke();
      c.save();torsoPath(b);c.clip();
      if(t==='chain'||t==='plate'){
        if(t==='chain'){c.strokeStyle='rgba(20,28,34,.28)';c.lineWidth=.8;for(let y=-52;y<8;y+=3.4)for(let x=-14;x<16;x+=3.4){c.beginPath();c.arc(x+((y/3.4)%2?1.7:0),y,1.5,.1,PI-.1);c.stroke();}c.strokeStyle='rgba(255,255,255,.2)';for(let y=-52;y<8;y+=6.8)for(let x=-14;x<16;x+=6.8){c.beginPath();c.arc(x,y,1.4,PI+.3,PI*2-.3);c.stroke();}}
        else{
          bez([[-11*b,-48],[10*b,-52],[14*b,-32],[9*b,-8],[-11*b,-10]],lg(-12*b,-50,12*b,-8,[[0,shade(col,.5)],[.4,col],[1,shade(col,-.5)]]),'rgba(0,0,0,.4)');
          curve([-8*b,-44],[0,-34],[10*b,-44],'rgba(255,255,255,.55)',1.6);stroke([[3*b,-50],[4*b,-12]],'rgba(20,25,30,.35)',1.4);stroke([[-10*b,-24],[11*b,-22]],'rgba(20,25,30,.4)',1.2);
          for(const y of [-14,-8,-2]){bez([[-11*b,y],[11*b,y-1],[12*b,y+6],[-11*b,y+6]],lg(0,y,0,y+6,[[0,shade(col,.3)],[1,shade(col,-.45)]]),'rgba(0,0,0,.4)');}
        }
      }else if(t==='leather'||t==='tunic'){
        stroke([[-12*b,-20],[13*b,-26]],rgba(shade(col,-.45),.9),2.2);stroke([[8*b,-52],[-8*b,-4]],rgba(top.trim,.75),2.4);stroke([[-3,-50],[2,-6]],'rgba(0,0,0,.2)',1);
        stroke([[-10*b,-8],[12*b,-8]],'rgba(0,0,0,.25)',1);
        for(let i=0;i<3;i++)stroke([[-8+i*6,-44+i*2],[-6+i*6,-34]],'rgba(0,0,0,.14)',1.2);
      }else if(t==='bare'||t==='harness'){
        curve([2,-40],[8*b,-33],[14*b,-38],'rgba(70,40,30,.5)',1.6);curve([1,-30],[-4,-26],[-10*b,-30],'rgba(70,40,30,.4)',1.4);
        stroke([[-2,-26],[2,-12]],'rgba(70,40,30,.35)',1.4);for(const y of [-22,-16,-10])curve([-6*b,y],[0,y+2],[8*b,y],'rgba(70,40,30,.28)',1.2);
        if(t==='harness'){stroke([[-12*b,-52],[12*b,-8]],'#4a3626',4.5);stroke([[12*b,-52],[-12*b,-8]],'#3a2a1c',4);ell(0,-30,3.2,3.2,'#c9a24e',OUT);}
        if(look===LOOKS.boss2||look.head==='skullhelm'){stroke([[-9,-34],[6,-26]],'rgba(255,230,210,.55)',1.4);stroke([[2,-44],[10,-36]],'rgba(255,230,210,.5)',1.2);stroke([[-12*b,-52],[12*b,-6]],'#4b3a2e',5);ell(0,-28,3.4,3.4,'#caa04e',OUT);}
      }else if(t==='robe'){
        for(let i=0;i<4;i++)stroke([[-10+i*7,-48],[-11+i*8,2]],'rgba(0,0,0,.14)',1.4);
        stroke([[-13*b,-46],[4*b,-30],[12*b,-6]],rgba(top.trim,.7),2);
        if(look.runes){for(let i=0;i<4;i++)stroke([[-4,-42+i*8],[2,-38+i*8],[-1,-34+i*8]],'rgba(255,214,120,.8)',1);}
      }
      c.restore();
      if(top.ember){c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,120,30,.9)';c.lineWidth=1.3;for(const pts of [[[-4,-46],[1,-38],[-2,-30],[4,-22]],[[8,-44],[10,-34],[6,-26]],[[-8,-24],[-4,-16],[-9,-10]]]){stroke(pts,'rgba(255,120,30,.85)',1.3);}c.restore();}
    }
    // tabard hanging at the front of the pelvis
    if(look.tabard){const tb=look.tabard;bez([[-8*b,-26],[11*b,-26],[14*b,20],[2,31],[-12*b,23]],lg(-12*b,-26,14*b,30,tri(tb.col,.18)),OUT);stroke([[2,-24],[3,30]],rgba(tb.trim,.85),2);stroke([[-10*b,24],[13*b,26]],rgba(tb.trim,.9),2.4);}
    // belt
    if(!look.bones&&look.belt&&t!=='plate'||t==='plate'&&look.belt){const by=-12;bez([[-10.5*b,by],[11.5*b,by-1],[11.5*b,by+5],[-10.5*b,by+5]],lg(0,by,0,by+5,tri(look.belt,.25)),OUT);ell(5*b,by+2.5,3,3.2,'#d4b660',OUT);}
    c.restore();
  }
  function drawSkirt(look,G,P){
    const r=look.robe;if(!r)return;const ph=P.sway||0,b=look.b||1;
    c.save();
    const hy=-11,topY=G.py-6,tw=11*b,hw=24*b+(P.walk?Math.abs(ph)*3:0);
    const sw=ph*6;
    const path=()=>{c.beginPath();c.moveTo(G.px-tw,topY);c.bezierCurveTo(G.px-tw-4,topY+22,G.px-hw-4+sw,hy-24,G.px-hw+sw,hy);if(r.tatter){for(let i=0;i<7;i++){const x=G.px-hw+sw+(hw*2)*(i+.5)/7;c.lineTo(x,hy-3+((i%2)?7:-1));c.lineTo(G.px-hw+sw+(hw*2)*(i+1)/7,hy+((i%3)?1:5));}}else{c.bezierCurveTo(G.px-hw/2+sw,hy+4,G.px+hw/2+sw,hy+4,G.px+hw+sw,hy);}c.bezierCurveTo(G.px+hw+4+sw,hy-24,G.px+tw+4,topY+22,G.px+tw,topY);c.closePath();};
    path();c.fillStyle=lg(G.px-hw,topY,G.px+hw,hy,[[0,shade(r.col,.26)],[.5,r.col],[1,shade(r.col,-.5)]]);c.fill();c.strokeStyle=OUT;c.lineWidth=1.1;c.stroke();
    c.save();path();c.clip();
    for(let i=0;i<7;i++){const t=i/6,x0=G.px-tw+2*tw*t,x1=G.px-hw+sw+2*hw*t;stroke([[x0,topY+6],[lerp(x0,x1,.5)+(i%2?-2:2),(topY+hy)/2],[x1,hy]],i%2?'rgba(0,0,0,.2)':'rgba(255,255,255,.1)',1.6);}
    if(r.under){bez([[G.px-2,topY+4],[G.px+10,topY+4],[G.px+hw*.6+sw,hy],[G.px-hw*.2+sw,hy]],lg(0,topY,0,hy,[[0,shade(r.under,.1)],[1,shade(r.under,-.45)]]));}
    c.restore();
    stroke([[G.px-hw+sw+2,hy-2],[G.px+sw,hy+3],[G.px+hw+sw-2,hy-2]],r.trim,r.tatter?1.2:3);
    if(r.fur){for(let i=0;i<9;i++){const x=G.px-hw+sw+(hw*2)*i/8;ell(x,hy-1,5,3.4,'#f1f7fa',null);}}
    c.restore();
  }
  function drawCape(look,G,P){
    const cp=look.cape;if(!cp)return;const ph=P.sway||0,fl=P.walk?ph*7:ph*2;
    const sx=G.S.x-3,sy=G.S.y+1,hy=G.py+(look.tall?46:52);
    c.save();
    const hemL=G.px-24-fl-Math.abs(P.lean)*20,hemR=G.px-6-fl*.4;
    c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(sx-14,sy+16,hemL+4,hy-30,hemL,hy);
    if(cp.tatter){for(let i=0;i<6;i++){c.lineTo(lerp(hemL,hemR,(i+.5)/6),hy-4+(i%2?8:0));}}else c.quadraticCurveTo((hemL+hemR)/2,hy+9+fl*.6,hemR,hy-2);
    c.bezierCurveTo(hemR+3,hy-26,sx+4,sy+22,sx+3,sy+2);c.closePath();
    c.fillStyle=lg(sx,sy,hemL,hy,[[0,cp.col],[1,cp.inner]]);c.fill();c.strokeStyle=OUT;c.lineWidth=1.1;c.stroke();
    c.save();c.clip();for(let i=1;i<5;i++)stroke([[lerp(sx-4,sx+2,i/5),sy+8],[lerp(hemL,hemR,i/5),hy]],'rgba(0,0,0,.2)',1.6);c.restore();
    c.restore();
  }
  // ---------- head ----------
  function drawHead(look,G,P){
    const h=G.head,hk=look.head,sk=look.skin;
    c.save();c.translate(h.x,h.y);c.rotate(G.headTilt);
    const behind=()=>{
      if(hk==='hair'||hk==='princess'||hk==='witch'||hk==='icecrown'){
        const long=hk!=='hair',col=look.hair;
        if(long){const sw=(P.sway||0)*3;bez([[-6,-9],[-18,-8-sw,-22,16,-15-sw*2,34+(hk==='witch'?10:0)],[-8,40,-2,26,-2,12]],lg(-20,-10,0,34,tri(col,.15)),OUT);}
      }
      if(hk==='hood'){
        bez([[-10,-14],[2,-22],[10,-12],[12,2],[8,12],[2,20],[-10,18],[-17,8],[-16,-6]],lg(-18,-16,12,20,tri(look.hoodCol,.15)),OUT);
      }
      if(hk==='antlers'){c.strokeStyle='#cdbb94';c.lineCap='round';for(const m of [[-4,1],[3,.8]]){const x0=m[0];stroke([[x0,-14],[x0-6,-26],[x0-10,-38]],'#bba67f',3);stroke([[x0-5,-24],[x0-14,-28]],'#bba67f',2.4);stroke([[x0-8,-33],[x0-2,-42]],'#bba67f',2.2);}}
    };
    behind();
    // face
    const jaw=hk==='skull'?'#e0dcc3':sk;
    c.beginPath();c.moveTo(-8,-3);c.bezierCurveTo(-9,-14,8,-15,10,-4);c.lineTo(10.6,-.8);c.lineTo(14,3.2);c.lineTo(10.8,4.6);c.lineTo(10.4,6.6);c.lineTo(9.6,11);c.bezierCurveTo(6,14.5,-2,14,-5,9);c.bezierCurveTo(-8,5,-9,1,-8,-3);c.closePath();
    c.fillStyle=hk==='skull'?lg(-8,-12,12,12,tri('#e0dcc3',.1)):lg(-9,-14,13,12,[[0,shade(sk,.22)],[.55,sk],[1,shade(sk,-.32)]]);c.fill();c.strokeStyle=OUT;c.lineWidth=1;c.stroke();
    // neck
    if(hk!=='skull'){c.save();c.globalCompositeOperation='destination-over';limb({x:-1,y:8},{x:-1,y:20},5.4,6,shade(sk,-.12),{out:false,hl:false});c.restore();}
    const face=(o={})=>{
      if(hk==='skull')return;
      // ear
      ell(-3.4,1.2,2,3,shade(sk,-.12),OUT);
      // eye + brow
      if(!o.noEye){ell(5.6,-1.8,2.3,1.6,'#f3efe6');ell(6.3,-1.8,1.1,1.3,o.eye||'#2a3a3f');stroke([[2.8,-4.8],[8.6,-4.6]],o.brow||shade(look.hair||'#3a2a1c',-.1),1.4);}
      stroke([[7.6,7.4],[10.4,7]],shade(sk,-.5),1);
      stroke([[9.6,-1],[11,2.4],[13.2,3.2]],shade(sk,-.35),.9);
    };
    face(look.faceOpt);
    const hairShort=(col)=>{bez([[-9,-2],[-12,-12],[-2,-17],[6,-14],[10,-6],[7,-8],[3,-9],[-1,-6],[-4,-1]],lg(-10,-17,10,0,tri(col,.15)),OUT);stroke([[-4,-13],[3,-14]],'rgba(255,255,255,.2)',1);};
    if(hk==='hair')hairShort(look.hair);
    else if(hk==='princess'){hairShort(look.hair);bez([[-6,-12],[-4,-18],[0,-14],[3,-20],[6,-14],[9,-17],[9,-11]],'#e2c36f','#8a6a2a',1);ell(3,-15,1.4,1.6,'#7fb8c8');}
    else if(hk==='bald'){stroke([[-4,-12],[3,-14]],'rgba(255,255,255,.25)',1.4);bez([[3,7],[10,6.4],[10,11],[6,13.5],[-2,12],[-5,9]],look.beard,OUT);stroke([[3,5.6],[8,5.6]],'#2c1e16',1.4);ell(5.8,-1.8,2.2,1.2,'#f2e8da');ell(6.2,-1.8,1,1,'#1c1410');stroke([[2.2,-4.6],[9,-3.6]],'#2c1e16',2);}
    else if(hk==='hood'){
      // inner shadow + rim
      const sh=c.createLinearGradient(-6,-8,10,0);sh.addColorStop(0,'rgba(0,0,0,.6)');sh.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=sh;c.beginPath();c.ellipse(1,-1,9,12,0,0,PI*2);c.fill();
      if(look.mask){bez([[-7,3],[10,3.4],[12.4,5.4],[9,13],[-2,15],[-7,10]],lg(-6,3,10,14,tri(look.mask,.1)),OUT);stroke([[-6,6],[9,8]],'rgba(0,0,0,.25)',1);}
      c.beginPath();c.moveTo(-9,10);c.bezierCurveTo(-13,-6,-5,-17,4,-16);c.bezierCurveTo(9,-15,11,-10,10.4,-6);c.strokeStyle=shade(look.hoodCol,-.15);c.lineWidth=5;c.stroke();c.strokeStyle=rgba(shade(look.hoodCol,.45),.5);c.lineWidth=1;c.stroke();
      bez([[-12,-14],[0,-26],[12,-10],[10,-6],[3,-14],[-6,-12]],lg(-12,-26,12,-6,tri(look.hoodCol,.25)),OUT);
      if(look.hoodDark){ell(5.8,-1.8,1.5,1,'#9dffa6');}
    }
    else if(hk==='hat'){
      bez([[-6,12],[10,9],[11,14],[2,19],[-5,17]],look.beard,OUT);bez([[-3,10],[8,9],[6,24],[-1,29],[-4,19]],look.beard,OUT);
      stroke([[3,6.6],[8,6.4]],shade(look.beard,-.2),1);stroke([[2.6,-5.6],[9,-5.2]],look.beard,2.2);
      bez([[-16,-8],[-2,-12],[16,-8],[18,-6],[2,-3],[-14,-4]],lg(-16,-12,18,-3,tri(look.hat,.1)),OUT);
      bez([[-9,-9],[-9,-20],[-3,-34],[-14,-48],[-1,-36],[6,-23],[7,-10]],lg(-14,-40,8,-9,tri(look.hat,.25)),OUT);stroke([[-8,-11],[7,-9]],look.robe.trim,2.2);
    }
    else if(hk==='greathelm'||hk==='horned'){
      const hc=look.top.col,horn=hk==='horned';
      bez([[-10,-8],[-10,-19],[8,-19],[11,-8],[12,12],[8,15],[-9,14]],lg(-10,-18,12,14,[[0,shade(hc,.55)],[.35,hc],[1,shade(hc,-.5)]]),OUT,1.2);
      bez([[2,-3],[12,-2.4],[12,1],[2,1.4]],'#0c0f12');stroke([[2,8],[12,8]],'#0c0f12',1.4);stroke([[2,5],[12,5]],'#0c0f12',1.2);
      stroke([[6,-17],[6,13]],'rgba(255,255,255,.3)',1.2);stroke([[-9,-2],[11,-2.6]],rgba(look.top.trim,.6),1.6);
      if(horn){for(const sx of [-1,1]){c.save();c.scale(1,1);bez([[sx*8-1,-14],[sx*14+(sx>0?7:-10),-20],[sx*17+(sx>0?12:-14),-38],[sx*17+(sx>0?4:-5),-44],[sx*12+(sx>0?4:-5),-30],[sx*7,-17]],lg(-12,-40,12,-14,[[0,'#f0e6c9'],[.6,'#c2b48a'],[1,'#6b5e45']]),OUT);c.restore();}}
      else{bez([[-3,-18],[-8,-26],[-16,-22+(P.sway||0)*3],[-20,-12],[-10,-16],[0,-17]],look.plume,OUT);bez([[-3,-18],[-9,-30],[-20,-30],[-24,-20],[-12,-24],[0,-17]],shade(look.plume,.2),OUT);}
    }
    else if(hk==='skullhelm'){
      bez([[-10,-8],[-11,-19],[9,-20],[11,-8],[11,3],[3,2],[-4,5],[-9,2]],lg(-10,-20,11,3,[[0,'#f2ead2'],[.5,'#c7bb97'],[1,'#7a6e55']]),OUT,1.2);
      ell(5.5,-4,3.2,3.5,'#14100c');ell(-3,-5,2.6,3,'#14100c');glowAt(5.8,-4,9,'#ff7a30',.75);
      bez([[1,2],[12,2],[11,6],[2,7]],'#e0d6b8',OUT);for(let i=0;i<4;i++)stroke([[3+i*2.2,2.4],[3+i*2.2,6.4]],'#4a3f2c',.8);
      for(const sx of [-1,1]){bez([[sx*8,-15],[sx*14+(sx>0?5:-7),-22],[sx*18+(sx>0?10:-12),-36],[sx*10+(sx>0?6:-6),-30],[sx*6,-18]],lg(-10,-30,12,-12,[[0,'#f0e6c9'],[1,'#7a6d52']]),OUT);}
    }
    else if(hk==='skull'){
      ell(3,-.5,3.6,4.2,'#232820');ell(-4,-1.6,2.6,3.4,'#232820');glowAt(3.4,-.4,7,'#93ffb0',.35);
      bez([[9,4],[12.4,6.4],[8,7]],'#2a2c24');
      bez([[1,8],[10,8],[10,13],[0,14]],'#e0dcc3',OUT);for(let i=0;i<5;i++)stroke([[1.6+i*1.9,8.4],[1.6+i*1.9,12.8]],'#6a6650',.8);
      stroke([[-8,-7],[-3,-10],[3,-9]],'rgba(70,64,48,.6)',.9);bez([[-9,-5],[-10,-14],[0,-17],[7,-13],[5,-10],[-5,-12]],'rgba(60,56,40,.3)');
      bez([[-9,-5],[-14,-8],[-10,-1]],'#5a5346');
    }
    else if(hk==='witch'){
      face({noEye:true});
      ell(5.8,-1.8,2.1,1.5,'#d7ffb8');ell(6.2,-1.8,1,1.1,'#2a4a20');glowAt(6,-1.8,9,'#9fff9a',.4);
      stroke([[2.8,-5],[9,-3.6]],'#1d1830',1.8);bez([[10,2.4],[15,6.4],[11,6]],shade(sk,-.15),OUT);
      bez([[-9,-4],[-14,-16],[-2,-22],[9,-16],[10,-8],[2,-12],[-4,-8]],lg(-14,-22,10,-4,tri(look.hair,.3)),OUT);
      for(const sx of [-1,1]){bez([[sx*5-2,-17],[sx*11-5,-24],[sx*9-5,-36],[sx*3-2,-26]],'#cfc29c',OUT);}
      for(let i=0;i<6;i++)stroke([[-9,-4+i*2],[-20-i*2,2+i*5],[-17-i*2,16+i*5]],look.hair,2.2);
    }
    else if(hk==='icecrown'){
      hairShort(look.hair);
      for(let i=0;i<5;i++){const x=-6+i*4.2,hh=[10,16,22,16,10][i];poly([[x-1.8,-12],[x,-12-hh],[x+1.8,-12]],lg(x,-12-hh,x,-12,[[0,'#ffffff'],[1,'#7fd0ee']]),'rgba(90,170,210,.8)',.8);}
      glowAt(0,-18,22,'#bff0ff',.4);stroke([[-8,-12],[8,-12]],'#dff6ff',2);
    }
    else if(hk==='antlers'){
      // dark face with violet eyes and thorn crown
      c.save();c.globalAlpha=.55;ell(1,0,9,13,'#1c2218');c.restore();
      ell(5.8,-1.8,2.2,1.4,'#f0dcff');glowAt(6,-1.8,8,'#b58cff',.8);stroke([[2.6,-5],[9,-3.6]],'#10140e',1.8);
      for(let i=0;i<6;i++){const x=-7+i*3.4;poly([[x-1.4,-11],[x+(i%2?1:-1),-17-(i%2)*3],[x+1.4,-11]],'#4c3a2a','rgba(0,0,0,.5)',.7);}
      c.strokeStyle='#59783a';c.lineWidth=1.6;c.beginPath();c.moveTo(-9,-9);c.bezierCurveTo(-4,-14,3,-6,10,-11);c.stroke();
    }
    else if(hk==='flamecrown'){
      c.save();c.globalAlpha=.7;ell(1,0,9.5,13,'#14121a');c.restore();
      bez([[-9,-4],[-11,-16],[9,-17],[11,-6],[10,3],[3,1],[-4,4],[-9,1]],lg(-10,-17,11,3,tri('#2f2e36',.2)),OUT,1.2);
      glowAt(5.6,-1.8,10,'#ff7a1c',.9);stroke([[2,-3.4],[10,-3.6]],'#ffd06a',1.6);stroke([[-2,7],[9,7]],'#ff7a1c',1.4);
      c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const x=-7+i*3.8,hh=[9,15,21,16,9][i]+(Math.sin(P.flick+i*1.7)||0)*3;bez([[x-2.6,-13],[x-1,-13-hh*.6],[x,-13-hh],[x+1.8,-13-hh*.5],[x+2.6,-13]],lg(x,-13-hh,x,-13,[[0,'rgba(255,230,140,.95)'],[1,'rgba(255,90,20,.9)']]));}c.restore();
    }
    c.restore();
  }
  // ---------- arms ----------
  function drawArm(look,G,arm,sh,far,P){
    if(!arm)return;
    const lt=(look.lt||1)*1.12;
    const sl=far?shade(look.sleeve,-.3):look.sleeve,fr=far?shade(look.fore,-.3):look.fore,skin=far?shade(look.skin,-.22):look.skin;
    if(look.bones){limb(sh,arm.e,2.8,2.3,far?'#a9a58f':'#d3cfb5');limb(arm.e,arm.h,2.3,1.9,far?'#a9a58f':'#d3cfb5');ell(arm.e.x,arm.e.y,3.2,3.2,'#e4e0c8',OUT);ell(arm.h.x,arm.h.y,3.4,3.1,'#e4e0c8',OUT);return;}
    const sleeveSkin=look.top.type==='bare'||look.top.type==='harness';
    limb(sh,arm.e,6.2*lt,5*lt,sleeveSkin?skin:sl,{lit:.25});
    limb(arm.e,arm.h,5*lt,3.8*lt,fr,{lit:.25});
    if(look.fore&&!sleeveSkin&&look.top.type!=='robe'){const mid={x:lerp(arm.e.x,arm.h.x,.5),y:lerp(arm.e.y,arm.h.y,.5)};stroke([[arm.e.x+(mid.x-arm.e.x)*.15,arm.e.y+(mid.y-arm.e.y)*.15],[mid.x,mid.y]],'rgba(255,255,255,0)',1);}
    ell(arm.e.x,arm.e.y,5*lt,5*lt,rgba(sleeveSkin?skin:sl,.0));
    // hand
    const gl=look.top.type==='plate'?fr:skin;
    ell(arm.h.x,arm.h.y,4.2*lt,4.2*lt,rg(arm.h.x-1.4,arm.h.y-1.6,6,[[0,shade(gl,.28)],[1,shade(gl,-.28)]]),OUT);
    if(look.vines){for(let i=0;i<4;i++){const t=(i+.5)/4;stroke([[lerp(sh.x,arm.e.x,t)-3,lerp(sh.y,arm.e.y,t)],[lerp(sh.x,arm.e.x,t)+3,lerp(sh.y,arm.e.y,t)+3]],'#6b9a3c',1.6);}poly([[arm.e.x-1,arm.e.y],[arm.e.x-3,arm.e.y-8],[arm.e.x+1,arm.e.y-2]],'#5a7a3a');}
  }
  function drawPauldron(look,sh){
    const p=look.pauldron;if(!p)return;const r=p.big?10.5:8.5;
    c.save();c.translate(sh.x,sh.y-1);
    bez([[-r,3],[-r+1,-r*.8],[r*.2,-r*1.05],[r,-1],[r-1,5],[0,6]],lg(-r,-r,r,6,[[0,shade(p.col,.55)],[.45,p.col],[1,shade(p.col,-.5)]]),OUT,1.1);
    stroke([[-r+2,-2],[0,-r*.8],[r-3,-2]],'rgba(255,255,255,.5)',1.2);stroke([[-r+1,1],[r-1,2.5]],'rgba(0,0,0,.35)',1);
    if(p.spike){poly([[-2,-r*.9],[1,-r*.9-9],[4,-r*.9]],lg(0,-r-9,0,-r,[[0,'#e6e6dc'],[1,'#6a6f74']]),OUT);poly([[r*.4,-3],[r+6,-6],[r*.5,2]],lg(0,0,r+6,0,[[0,'#6a6f74'],[1,'#d8d8cc']]),OUT);}
    if(p.ember){c.save();c.globalCompositeOperation='lighter';stroke([[-r+3,0],[0,-r*.6],[r-2,0]],'rgba(255,120,30,.8)',1.2);c.restore();}
    c.restore();
  }
  // ---------- weapon placement ----------
  function drawWeapon(look,x,y,ang,P,second){
    const w=look.weapon;if(!w||w==='none'||w==='bow')return;
    c.save();c.translate(x,y);c.rotate(ang);
    if(w==='dual'||w==='dagger')W_.dagger({col:look.wcol});
    else if(w==='greatsword'||w==='sword'){W_.sword({len:look.wlen,col:look.wcol,guard:look.guard,glow:look.glow,wd:w==='greatsword'?7.4:undefined});}
    else if(w==='axe')W_.axe({len:54});
    else if(w==='doubleaxe')W_.axe({len:60,dbl:true});
    else if(w==='spear')W_.spear({});
    else if(w==='hammer')W_.hammer({});
    else if(w==='staff')W_.staff({orb:look.orb,top:look.stafftop,wood:look.wood});
    c.restore();
    if(look.glow&&w==='greatsword'){const d={x:Math.sin(ang),y:-Math.cos(ang)};glowAt(x+d.x*46,y+d.y*46,34,look.glow,.35+Math.sin(P.flick||0)*.08);}
    if(w==='staff'&&look.orb){const d={x:Math.sin(ang),y:-Math.cos(ang)},k=92;if(P.castGlow)glowAt(x+d.x*k,y+d.y*k,14+P.castGlow*8,look.orb,.4+P.castGlow*.4);}
  }
  function drawBow(look,G,P){
    const h=G.bowHand;if(!h)return;
    const col=look.weapon==='bow'?(look===LOOKS.hero?'#9a7440':'#8a6a40'):'#8a6a40',draw=P.draw||0,pull=draw*1.0;
    const top={x:h.x-3-pull*3.5,y:h.y-36},bot={x:h.x-3-pull*3.5,y:h.y+36};
    c.beginPath();c.moveTo(top.x,top.y);c.bezierCurveTo(h.x+20,h.y-24,h.x+20,h.y+24,bot.x,bot.y);c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=6;c.stroke();c.strokeStyle=col;c.lineWidth=4.2;c.stroke();c.strokeStyle='rgba(255,230,170,.35)';c.lineWidth=1.2;c.stroke();
    ell(h.x+6,h.y,3,6.5,'#4a3220',OUT);
    // string
    const sp=G.stringHand&&draw>0.02?G.stringHand:{x:h.x-4-pull*2,y:h.y};
    stroke([[top.x,top.y],[sp.x,sp.y],[bot.x,bot.y]],'#ece4c8',1);
    if(P.draw>0&&!P.fired||look.arrowIdle){const tip={x:h.x+15,y:h.y-.5};stroke([[sp.x,sp.y],[tip.x,tip.y]],'#c8b48a',1.6);poly([[tip.x,tip.y-2.4],[tip.x+8,tip.y],[tip.x,tip.y+2.4]],'#dfe5e6',OUT,.6);stroke([[sp.x,sp.y-1.6],[sp.x+3,sp.y-3.4]],'#c0463a',1.2);stroke([[sp.x,sp.y+1.6],[sp.x+3,sp.y+3.4]],'#c0463a',1.2);}
  }
  function drawQuiver(look,G){
    if(!look.quiver)return;const s=G.S;c.save();c.translate(s.x-8,s.y+6);c.rotate(-.5+G.lean);
    bez([[-4,-8],[5,-8],[6,26],[-3,28]],lg(-4,0,6,0,tri('#6a4a2a')),OUT);
    for(let i=0;i<4;i++){stroke([[-2+i*2.2,-8],[-5+i*2.2,-17]],'#c8b48a',1.4);poly([[-4+i*2.2,-17],[-5+i*2.2,-21],[-3+i*2.2,-17]],'#b4443a');}
    stroke([[-4,2],[6,2]],'#c9a24e',1.2);c.restore();
  }
  function drawAura(look,G,P){
    if(!look.aura)return;const a=look.aura;
    glowAt(G.px,G.py-50,70,a,.18+Math.sin(P.flick||0)*.03);
    if(look.aura==='#bff0ff'||look.aura==='#b58cff'||look.aura==='#ff7a1c'){
      for(let i=0;i<7;i++){const ang=(i*2.4+(P.flick||0)*.3),x=G.px+Math.cos(ang)*(38+i*3),y=G.py-30-((i*23+(P.flick||0)*14)%70);c.save();c.globalAlpha=.7;ell(x,y,1.4+(i%3)*.5,1.4+(i%3)*.5,rgba(a,.8));c.restore();}
    }
  }
  function drawSlime(look,G){if(!look.slime)return;for(const [x,y,r] of [[G.px-14,G.py+40,2.6],[G.px+10,G.py+46,2],[G.px-4,G.py+52,3]])ell(x,y,r,r*1.4,rgba('#9fff9a',.75),OUT);}
  // ---------- frame composer ----------
  function drawFigure(look,P){
    const G=rig(look,P);
    c.save();c.translate(AX,AY);c.scale(FS,FS);
    drawAura(look,G,P);
    if(!look.bones||true)drawCape(look,G,P);
    drawQuiver(look,G);
    // hair/hood behind head belongs to head pass; far arm behind body when free
    const farFront=P.far.m!=='fk'||look.style==='bow'||!!P.dual;
    if(!farFront)drawArm(look,G,G.f,G.sF,true,P);
    drawLeg(G.legF,look,true);drawLeg(G.legN,look,false);
    if(look.robe)drawSkirt(look,G,P);
    drawTorso(look,G,P);
    drawHead(look,G,P);
    // far side held items
    if(farFront){
      if(look.style==='bow'){drawArm(look,G,G.f,G.sF,true,P);drawBow(look,G,P);}
      else{
        if(look.shield){drawArm(look,G,G.f,G.sF,true,P);const hh=G.f.h;shield(hh.x+(P.shieldUp?3:5),hh.y-(look.shield.type==='kite'?4:1),look.shield,P.shieldUp?-.05:.05,look.shield.type==='kite'?(look.sc||1)*(look.b>1.2?1.1:1):1);}
        else drawArm(look,G,G.f,G.sF,true,P);
        if(P.dual&&G.wpos2)drawWeapon(look,G.wpos2.x,G.wpos2.y,G.wA2,P,true);
      }
    }
    if(look.style==='bow'&&!farFront){drawBow(look,G,P);}
    drawArm(look,G,G.n,G.sN,false,P);
    if(look.style==='bow'&&G.stringHand){/* hand drawn by arm */}
    drawWeapon(look,G.wpos?G.wpos.x:0,G.wpos?G.wpos.y:0,G.wA,P);
    drawPauldron(look,G.sN);
    drawSlime(look,G);
    c.restore();
  }
  function render(kind,weapon,action,i){
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;c=cv.getContext('2d');c.lineCap='round';c.lineJoin='round';
    const look=lookFor(kind,weapon),P=poseFor(look,action,i);P.flick=(action==='idle'?i*1.57:i*.9)+(kind.charCodeAt(kind.length-1)||0);
    drawFigure(look,P);return cv;
  }
  // ---------- naming ----------
  const RE=/^(?:hero-(sword|greatsword|axe|spear|bow)|([a-z]+\d?))-(walk|idle|attack|hit|block)-(\d)$/;
  function parse(name){
    const m=RE.exec(name);if(!m)return null;
    const weapon=m[1],kind=weapon?'hero':m[2],action=m[3],i=+m[4];
    if(!KINDS.includes(kind)||(kind==='hero'&&!weapon)||i>=COUNT[action])return null;
    if(kind==='hero'&&!weapon)return null;if(kind!=='hero'&&weapon)return null;
    if(kind==='princess'&&action!=='idle')return null;
    return{kind,weapon,action,i};
  }
  function get(name){
    if(cache.has(name))return cache.get(name);
    const p=parse(name);if(!p)return undefined;
    const cv=render(p.kind,p.weapon,p.action,p.i);cache.set(name,cv);return cv;
  }
  function names(){
    const out=[];
    for(const kind of KINDS){
      const prefixes=kind==='hero'?HERO_W.map(w=>'hero-'+w):[kind];
      for(const pre of prefixes)for(const [a,n] of Object.entries(COUNT)){if(kind==='princess'&&a!=='idle')continue;for(let i=0;i<n;i++)out.push(pre+'-'+a+'-'+i);}
    }
    return out;
  }
  return{get,names,kinds:KINDS.slice()};
}
