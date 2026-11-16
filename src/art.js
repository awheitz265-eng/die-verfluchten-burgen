/* Original procedural illustrations. No external image or font dependencies.
 * All sprites use a bottom-centre anchor; illustration bounds end at y=height-4.
 */
export function makeArt() {
  const out = {};
  let seed = 17329;
  const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const canvas = (name, draw, w=160, h=200) => {
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const x=c.getContext('2d'); x.lineCap='round'; x.lineJoin='round';
    draw(x,w,h); out[name]=c;
  };
  const path=(c,pts,fill,stroke,width=1)=>{
    c.beginPath(); for(let i=0;i<pts.length;i++){const a=pts[i]; if(i===0)c.moveTo(a[0],a[1]); else c.lineTo(a[0],a[1]);}
    c.closePath(); if(fill){c.fillStyle=fill;c.fill();} if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
  };
  const ell=(c,x,y,rx,ry,fill,stroke)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}};
  const line=(c,pts,col,w=1)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=col;c.lineWidth=w;c.stroke();};
  const grad=(c,x,y,x2,y2,stops)=>{const g=c.createLinearGradient(x,y,x2,y2);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g;};
  const glow=(c,x,y,r,col)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(255,169,55,0)');ell(c,x,y,r,r,g);};
  const shadow=(c,x=80,y=190,rx=36,ry=8)=>{ell(c,x,y,rx,ry,'rgba(8,17,18,.24)');ell(c,x,y,rx*.65,ry*.6,'rgba(6,12,15,.19)');};
  const trunk=(c)=>{
    path(c,[[58,194],[72,168],[70,120],[65,91],[78,65],[90,83],[88,140],[95,173],[112,193],[91,188],[82,176],[76,191]],grad(c,65,120,96,120,['#604d37','#8a6e49','#403c2b']),'#34392c',2);
    line(c,[[76,183],[79,150],[76,116],[83,85]],'#baa074',2);
    line(c,[[86,177],[82,160],[84,133]],'#302e25',3);
    line(c,[[74,132],[48,108],[38,78]],'#655239',8);
    line(c,[[87,122],[108,98],[113,75]],'#594a34',7);
    line(c,[[79,155],[62,152],[51,137]],'#73603f',5);
  };
  canvas('tree',c=>{
    shadow(c,81,192,51,7);trunk(c);
    // Irregular lobed crowns in back-to-front order; soft colour layers mimic brushwork.
    const crowns=[[43,91,29,30],[113,81,33,29],[79,51,38,34],[39,58,30,28],[112,48,26,25],[68,25,29,22],[79,86,44,37],[43,111,27,21],[111,112,32,24]];
    for(const [cx,cy,rx,ry] of crowns){
      ell(c,cx+3,cy+6,rx,ry,'#173b32');
      for(let k=0;k<17;k++){
        const a=rnd()*6.28,r=Math.sqrt(rnd()),xx=cx+Math.cos(a)*r*rx*.7,yy=cy+Math.sin(a)*r*ry*.7;
        const colors=['#245345','#30654c','#3d7351','#467d55','#53885b','#6a9861'];
        ell(c,xx,yy,8+rnd()*12,5+rnd()*9,colors[Math.min(5,Math.floor((1-(yy-cy+ry)/(2*ry))*5+rnd()*2))]);
      }
    }
    for(let k=0;k<92;k++){let xx=23+rnd()*116,yy=18+rnd()*110;if(c.getImageData(Math.floor(xx),Math.floor(yy),1,1).data[3]>0)line(c,[[xx,yy],[xx+3+rnd()*4,yy-1]],rnd()>.5?'rgba(177,190,108,.28)':'rgba(8,42,32,.2)',1.4);}
  });
  canvas('pine',c=>{
    shadow(c,80,192,45,8);path(c,[[72,195],[76,135],[86,135],[89,194]],'#73573c');
    for(let t=0;t<7;t++){
      const yy=32+t*22,ww=15+t*6;
      path(c,[[80,yy-27],[80-ww,yy+18],[80-ww+8,yy+15],[80-ww-5,yy+29],[76,yy+21],[88,yy+27],[80+ww+4,yy+30],[80+ww-3,yy+13],[80+ww,yy+19]],grad(c,55,yy,105,yy,['#386653','#254d44','#17392f']),'#244638');
      line(c,[[80,yy-11],[69,yy+12],[78,yy+9],[64-t*3,yy+22]],'#56806a',1.3);
      line(c,[[84,yy+7],[97+t*2,yy+22]],'#1a3e36',2);
    }
  });
  canvas('deadtree',c=>{
    shadow(c,80,192,38,7);trunk(c);
    line(c,[[78,134],[53,99],[47,58],[32,43]],'#675a47',9);
    line(c,[[49,87],[22,77],[14,62]],'#655747',6);
    line(c,[[81,133],[106,101],[120,65],[139,47]],'#4a4839',9);
    line(c,[[116,78],[105,58],[107,30]],'#514d3d',5);
    line(c,[[80,115],[85,68],[72,44],[70,23]],'#72634e',7);
    line(c,[[80,109],[81,69],[70,45]],'#9c8761',1.8);
    line(c,[[54,98],[48,60],[34,45]],'#9b8462',1.8);
    ell(c,104,107,6,3,'#6a7a47');ell(c,71,153,8,3,'#5b6d41');
  });
  canvas('rock',c=>{
    shadow(c,80,190,50,10);
    path(c,[[24,169],[36,140],[65,123],[106,128],[133,159],[125,187],[84,196],[43,190]],grad(c,40,130,100,196,['#a1a79b','#777f79','#485d57']),'#43544f',2);
    path(c,[[36,140],[65,123],[106,128],[82,149],[45,164]],'#aab0a2');
    path(c,[[82,149],[106,128],[133,159],[115,175],[89,170]],'#7b8881');
    path(c,[[45,164],[82,149],[89,170],[84,196],[43,190]],'#6d7c73');
    line(c,[[37,144],[64,128],[102,131]],'#c1c5ae',2);
    line(c,[[82,150],[89,170],[113,176]],'#4e6059',2);
    for(let i=0;i<48;i++){const x=35+rnd()*80,y=149+rnd()*36;ell(c,x,y,1+rnd()*3,.7+rnd(),rnd()>.5?'rgba(205,205,165,.24)':'rgba(28,49,42,.24)');}
    for(let i=0;i<8;i++)ell(c,35+i*10,185+rnd()*5,7,2,'#64764d');
  });
  canvas('bush',c=>{
    shadow(c,80,192,35,5);
    for(let i=0;i<22;i++){const a=rnd()*Math.PI*2,r=rnd()*29;ell(c,80+Math.cos(a)*r,171+Math.sin(a)*r*.6,8+rnd()*12,7+rnd()*8,['#254d37','#3a6544','#547847','#739056'][i%4]);}
    for(let i=0;i<10;i++){const xx=54+rnd()*53,yy=156+rnd()*28;ell(c,xx,yy,2,2,'#b78953');ell(c,xx-.5,yy-.5,.7,.7,'#e6b879');}
  });
  canvas('chest',c=>{
    shadow(c,80,190,34,7);
    path(c,[[43,167],[78,150],[118,164],[84,182]],'#a8803d','#332b23',2);
    path(c,[[43,167],[84,182],[84,195],[44,180]],grad(c,43,170,84,192,['#9b6d35','#573b25']),'#382c23',2);
    path(c,[[84,182],[118,164],[118,180],[84,195]],'#513c28','#332b23',2);
    c.beginPath();c.moveTo(43,167);c.bezierCurveTo(41,150,64,138,78,150);c.lineTo(118,164);c.bezierCurveTo(106,153,89,165,84,182);c.closePath();c.fillStyle=grad(c,60,145,70,181,['#c2944b','#81552b']);c.fill();c.strokeStyle='#453325';c.stroke();
    line(c,[[49,158],[88,172]],'#e0b66b',1.5);line(c,[[48,164],[86,178]],'#503b27',1);
    for(const xx of [55,75]){path(c,[[xx,151-(xx-55)*.22],[xx+5,149-(xx-55)*.22],[xx+37,163-(xx-55)*.22],[xx+34,174],[xx+34,190],[xx+28,192],[xx+28,177]],'#b7aa76','#4c4935');}
    path(c,[[78,176],[88,179],[88,188],[78,185]],'#ddbf70','#59482c');ell(c,83,182,1.5,2,'#2a2924');
  });
  canvas('torch',c=>{
    shadow(c,80,192,13,4);glow(c,80,112,64,'rgba(255,148,48,.24)');
    path(c,[[75,194],[77,124],[84,124],[86,194]],grad(c,75,0,87,0,['#423b32','#998369','#3f3b31']));
    path(c,[[72,130],[68,113],[92,113],[89,130]],'#4c4c45','#b7a176',2);
    c.beginPath();c.moveTo(71,116);c.bezierCurveTo(61,97,82,93,78,75);c.bezierCurveTo(97,93,97,103,89,116);c.closePath();c.fillStyle='#e8913d';c.fill();
    c.beginPath();c.moveTo(76,116);c.bezierCurveTo(69,104,83,103,83,92);c.bezierCurveTo(91,105,88,112,85,118);c.closePath();c.fillStyle='#ffe2a0';c.fill();
  });
  const armour=(c,x,y,w,h)=>{
    path(c,[[x-w*.5,y],[x+w*.5,y],[x+w*.44,y+h*.7],[x+w*.25,y+h],[x-w*.3,y+h],[x-w*.48,y+h*.7]],grad(c,x-w/2,y,x+w/2,y+h,['#d1d3c0','#778b8b','#354e58']),'#263b45',2);
    line(c,[[x-w*.32,y+3],[x-1,y+8],[x+1,y+h*.7]],'#e3e4cb',1.8);
    line(c,[[x+1,y+8],[x+w*.35,y+3]],'#b8c6bc',1.2);
    for(let i=0;i<3;i++)line(c,[[x-w*.36,y+h*.75+i*5],[x+w*.35,y+h*.75+i*5]],'#233e47',1.5);
  };
  const blade=(c,x,y,len=56,type='sword')=>{
    if(type==='staff'){
      line(c,[[x,y+20],[x,y-len]],'#775c3d',4);line(c,[[x-1,y+18],[x-1,y-len]],'#bf9d63',1);
      glow(c,x,y-len-3,20,'rgba(118,176,246,.24)');ell(c,x,y-len-4,7,9,'#8bbbd1','#e6eac6');return;
    }
    if(type==='spear'){
      line(c,[[x-3,y+37],[x+6,y-82]],'#6e4c2d',4);line(c,[[x-4,y+35],[x+5,y-82]],'#be9c61',1);
      path(c,[[x+2,y-77],[x+8,y-109],[x+15,y-80],[x+8,y-72]],grad(c,x,0,x+14,0,['#6f8c98','#edf0d6','#65818a']),'#304b55',1);return;
    }
    if(type==='axe'){
      line(c,[[x,y+14],[x+3,y-len]],'#795634',4);
      path(c,[[x+1,y-len+4],[x+21,y-len-3],[x+25,y-len+16],[x+7,y-len+21],[x+2,y-len+14]],grad(c,x,y-len,x+24,y-len+20,['#d5d7c2','#617a80']),'#2f444a',1.7);
      line(c,[[x+21,y-len-3],[x+25,y-len+16]],'#f1e9cb',2);return;
    }
    path(c,[[x-4,y],[x-3,y-len],[x+2,y-len-11],[x+6,y-len],[x+4,y]],grad(c,x-4,0,x+6,0,['#768e96','#edf0df','#90a9b0']),'#465b62',1);
    line(c,[[x+1,y-len-7],[x+1,y-1]],'#fff0cb',1);
    line(c,[[x-11,y+1],[x+12,y+1]],'#c8aa66',4);
    line(c,[[x+1,y+4],[x+1,y+17]],'#513e33',4);ell(c,x+1,y+18,3,3,'#c8aa66');
  };
  const boots=(c,heavy=false,pose={})=>{
    const col=heavy?'#53666b':'#51473d';
    c.save();c.translate(69,151);c.rotate(pose.legL||0);c.translate(0,-(pose.liftL||0));c.translate(-69,-151);
    path(c,[[63,155],[76,154],[75,183],[72,191],[53,192],[53,186],[63,179]],grad(c,55,0,77,0,[col,'#253537']),'#253537',2);
    line(c,[[61,183],[72,183]],'#a59774',2);if(heavy)armour(c,69,151,16,24);c.restore();
    c.save();c.translate(91,151);c.rotate(pose.legR||0);c.translate(0,-(pose.liftR||0));c.translate(-91,-151);
    path(c,[[83,155],[97,154],[97,180],[106,187],[105,193],[86,192],[83,184]],grad(c,84,0,103,0,[col,'#29383a']),'#233338',2);
    line(c,[[88,184],[99,184]],'#a59774',2);
    if(heavy)armour(c,91,151,16,24);c.restore();
  };
  function person(name,kind,pose={}){
    canvas(name,c=>{
      if(pose.animated){c.translate(32,26);c.translate(pose.shift||0,pose.bob||0);c.translate(80,165);c.rotate(pose.lean||0);c.translate(-80,-165);}else shadow(c,80,193,30,6);
      const colors={hero:['#234e75','#407fa1','#c8b674'],bandit:['#634b3c','#987452','#baa075'],archer:['#354c35','#6f8450','#baa576'],skeleton:['#4c5755','#879181','#bfc3aa'],knight:['#4c3d51','#776278','#c0b68f'],mage:['#43375f','#796394','#ccbb8c'],princess:['#c8bd9a','#eee4c3','#b69a54'],boss0:['#4f2832','#a54b43','#dbb980'],boss1:['#384267','#7375a9','#c3c4df'],boss2:['#314b45','#7c8460','#d4b477']}[kind];
      const [dark,light,trim]=colors;
      const princess=kind==='princess',mage=kind==='mage'||kind==='boss1',skel=kind==='skeleton',heavy=kind==='knight'||kind.startsWith('boss'),hero=kind==='hero';
      // Cloth swings independently from the arm and leg joints.
      c.save();c.translate(80,85);c.transform(1,0,pose.cloth||0,1,0,0);c.translate(-80,-85);
      path(c,[[64,78],[96,79],[104,111],[111,173],[96,183],[88,174],[77,186],[60,177],[48,182],[54,131]],grad(c,51,88,109,171,[light,dark,'#1d3036']),'#253237',2);
      line(c,[[62,103],[57,169],[64,176]],trim,1.4);line(c,[[96,99],[103,169],[97,177]],trim,1.4);
      line(c,[[72,119],[65,174]],'rgba(235,230,192,.16)',2);line(c,[[92,121],[95,173]],'rgba(235,230,192,.17)',2);
      c.restore();if(!princess&&!mage)boots(c,heavy||hero,pose);
      if(princess||mage){
        path(c,[[67,107],[92,107],[98,143],[111,187],[95,193],[81,189],[66,194],[49,189],[61,145]],grad(c,51,113,108,181,[light,light,dark]),dark,2);
        for(let i=0;i<5;i++)line(c,[[70+i*5,127],[57+i*10,186]],i%2?dark:'rgba(255,248,206,.32)',1.5);
        line(c,[[51,187],[65,191],[81,187],[95,190],[109,185]],trim,3);
        path(c,[[67,88],[93,88],[92,113],[66,113]],light,dark,1.5);
      } else if(skel){
        line(c,[[79,93],[79,140]],'#b4baa4',7);
        for(let i=0;i<5;i++){c.beginPath();c.ellipse(80,100+i*7,16-i,5,0,0,Math.PI);c.strokeStyle='#d2d0b5';c.lineWidth=3;c.stroke();}
        path(c,[[65,136],[95,136],[90,151],[81,146],[71,151]],'#b2b79d','#737f72',2);
        line(c,[[68,150],[66,174]],'#bdc3a8',6);line(c,[[91,150],[94,175]],'#bdc3a8',6);
      } else if(hero||heavy){
        armour(c,80,90,35,48);
        path(c,[[63,133],[97,133],[103,156],[87,160],[80,149],[74,161],[57,154]],dark,'#2c3c40',2);
        line(c,[[62,139],[98,139]],trim,3);
      } else {
        path(c,[[65,91],[94,91],[96,139],[62,140]],grad(c,60,0,98,0,[light,dark]),'#30382e',2);
        line(c,[[72,95],[87,133]],trim,4);line(c,[[63,132],[97,132]],'#463929',6);
        path(c,[[61,140],[97,139],[99,159],[84,158],[80,146],[75,160],[60,158]],dark);
      }
      // Rotate the weapon and forearm together about the shoulder joint.
      c.save();c.translate(96,96);c.rotate(pose.armR||0);c.translate(-96,-96);
      const weapon=pose.weapon||(kind==='mage'||kind==='boss1'?'staff':kind==='boss2'?'axe':'sword');
      if(kind==='archer'||weapon==='bow'){
        c.beginPath();c.moveTo(119,79);c.bezierCurveTo(145,111,142,146,117,163);c.strokeStyle='#ad8552';c.lineWidth=4;c.stroke();
        line(c,[[119,79],[112-(pose.draw||0)*18,123],[117,163]],'#ddd2aa',1);
        line(c,[[111-(pose.draw||0)*18,123],[147-(pose.draw||0)*18,106]],'#9b8252',2);path(c,[[147,106],[140,107],[143,112]],'#c8d3cd');
      } else if(!princess)blade(c,119,138,weapon==='greatsword'?86:heavy?79:60,weapon);
      line(c,[[94,97],[106,116],[116,134]],skel?'#bbc3ac':dark,12);
      line(c,[[96,96],[106,115]],skel?'#dedcc0':light,6);
      ell(c,117,136,6,6,skel?'#c9ccb5':'#c6a580','#574c3e');
      if(hero||heavy){armour(c,98,92,20,17);armour(c,111,119,13,18);}
      c.restore();c.save();c.translate(65,98);c.rotate(pose.armL||0);c.translate(-65,-98);
      line(c,[[65,98],[53,119],[55,140]],skel?'#bdc4ad':light,13);
      ell(c,55,140,6,6,princess?'#d9b89b':skel?'#d7d6ba':'#bc9b76');
      if((hero&&!['bow','greatsword','spear'].includes(weapon))||kind==='knight'||kind==='boss0'){
        path(c,[[42,110],[62,109],[73,118],[68,146],[56,160],[42,147],[36,122]],grad(c,36,113,70,151,[trim,'#69787a','#2d4b59']),'#c1b078',2);
        path(c,[[44,116],[61,115],[67,122],[63,142],[55,152],[45,141],[42,123]],dark,trim,1);
        line(c,[[54,120],[54,144]],trim,2);line(c,[[47,128],[61,128]],trim,2);
      }
      c.restore();
      // Neck, head, hair or helm.
      path(c,[[74,77],[88,77],[89,93],[72,93]],'#b29372');
      ell(c,80,69,15,20,skel?'#d4d2b9':'#d3af89','#4c4e42');
      if(princess){
        c.beginPath();c.moveTo(64,79);c.bezierCurveTo(47,61,65,42,82,47);c.bezierCurveTo(106,42,105,72,96,91);c.lineTo(88,86);c.bezierCurveTo(98,66,87,62,85,56);c.bezierCurveTo(79,68,68,64,66,82);c.closePath();c.fillStyle=grad(c,60,47,101,91,['#b28c49','#e0be70','#8b6438']);c.fill();
        path(c,[[66,53],[65,43],[72,48],[79,39],[85,48],[94,42],[94,54]],'#d7b971','#f2d997',1.5);ell(c,80,49,2.5,3,'#79a3a0');
      } else if(mage){
        path(c,[[60,80],[60,61],[79,37],[99,60],[102,85],[91,77],[88,59],[72,60],[68,78]],grad(c,59,40,101,83,[light,dark]),trim,1.5);
        line(c,[[70,60],[80,49],[91,62]],trim,1);
        path(c,[[70,76],[79,91],[88,76],[85,87],[78,96]],'#bfc1b3');
      } else if(hero||heavy){
        c.beginPath();c.moveTo(64,70);c.lineTo(64,58);c.bezierCurveTo(69,38,94,40,98,58);c.lineTo(98,78);c.lineTo(88,85);c.lineTo(87,72);c.lineTo(70,72);c.lineTo(71,84);c.lineTo(63,78);c.closePath();c.fillStyle=grad(c,64,47,97,78,['#c9cfbd','#7b9196','#3a535f']);c.fill();c.strokeStyle='#263c43';c.lineWidth=2;c.stroke();
        path(c,[[67,61],[95,61],[94,69],[68,69]],'#1b3039');line(c,[[68,60],[92,58]],'#e5dfbe',2);
        line(c,[[81,46],[81,73]],trim,3);ell(c,81,55,2,2,trim);
        if(hero){c.beginPath();c.moveTo(78,46);c.bezierCurveTo(62,32,76,22,99,27);c.bezierCurveTo(84,30,86,36,86,47);c.closePath();c.fillStyle='#628eaa';c.fill();}
        if(kind==='boss0'){path(c,[[66,50],[54,29],[58,56]],'#bda881','#4e4e41',2);path(c,[[94,49],[106,28],[106,55]],'#bda881','#4e4e41',2);}
        if(kind==='boss2'){path(c,[[66,47],[60,32],[73,42],[79,27],[87,43],[99,33],[95,51]],'#a5ae8b','#485548',2);}
      } else if(skel){
        ell(c,73,66,4,5,'#34464a');ell(c,87,66,4,5,'#34464a');path(c,[[80,71],[76,77],[82,77]],'#4b5b55');
        line(c,[[71,83],[88,83]],'#59685f',2);for(let i=0;i<5;i++)line(c,[[73+i*3,80],[73+i*3,86]],'#718074',1);
        path(c,[[63,58],[68,44],[91,45],[98,61]],'#72817a','#43534e',2);
      } else {
        path(c,[[62,69],[61,57],[69,45],[90,46],[99,62],[96,75],[89,59],[72,59],[66,75]],dark,'#2e372e',1.5);
        if(kind==='bandit')path(c,[[66,73],[94,73],[90,83],[71,85]],'#625541');
        line(c,[[71,66],[76,66]],'#303a34',2);line(c,[[85,66],[89,66]],'#303a34',2);
      }
      if(princess||mage){line(c,[[72,70],[75,70]],'#364147',1.8);line(c,[[85,70],[88,70]],'#364147',1.8);}
      if(princess){ell(c,80,100,4,5,'#9ab4a2',trim);line(c,[[66,114],[94,114]],trim,3);}
      if(kind.startsWith('boss')){glow(c,80,64,21,kind==='boss1'?'rgba(161,134,232,.13)':'rgba(227,110,46,.13)');line(c,[[69,65],[75,65]],'#ffd69d',1.4);line(c,[[87,65],[93,65]],'#ffd69d',1.4);}
    },pose.animated?224:160,pose.animated?240:200);
  }
  ['hero','bandit','archer','skeleton','knight','mage','princess','boss0','boss1','boss2'].forEach(n=>person(n,n));
  // Joint-based animation atlas. Frames are painted once; gameplay only selects a frame.
  const actors=['hero','bandit','archer','skeleton','knight','mage','princess','boss0','boss1','boss2'];
  for(const kind of actors){
    const weapons=kind==='hero'?['sword','greatsword','axe','spear','bow']:[null];
    for(const weapon of weapons){const prefix=kind+(weapon?'-'+weapon:'');
      for(let f=0;f<8;f++){const a=f*Math.PI/4,step=Math.sin(a);person(prefix+'-walk-'+f,kind,{animated:true,weapon,legL:step*.44,legR:-step*.44,liftL:Math.max(0,Math.cos(a))*6,liftR:Math.max(0,-Math.cos(a))*6,bob:-Math.abs(Math.cos(a))*3,lean:step*.025,armR:-step*.18,armL:step*.22,cloth:step*.07});}
      for(let f=0;f<4;f++){const breathe=Math.sin(f*Math.PI/2);person(prefix+'-idle-'+f,kind,{animated:true,weapon,bob:breathe*1.3,armR:breathe*.025,armL:-breathe*.025,cloth:breathe*.02});}
      for(let f=0;f<8;f++){const swing=[-.15,-.62,-1.08,-.9,.5,1.45,1.0,.25][f],impact=Math.sin(f/7*Math.PI);const ranged=weapon==='bow'||kind==='archer'||kind==='mage'||kind==='boss1';person(prefix+'-attack-'+f,kind,{animated:true,weapon,legL:-impact*.16,legR:impact*.23,armR:ranged?-.35-impact*.4:swing,armL:ranged?.45:-swing*.22,lean:ranged?-.04:impact*.12,shift:ranged?-impact*3:impact*5,bob:-impact*2,cloth:-impact*.09,draw:f<5?f/4:Math.max(0,1-(f-4)/3)});}
      for(let f=0;f<3;f++)person(prefix+'-hit-'+f,kind,{animated:true,weapon,lean:-.13*(1-f/3),shift:-5*(1-f/3),armR:-.3,armL:.2,cloth:.08});
      person(prefix+'-block-0',kind,{animated:true,weapon,armL:-.6,armR:-.25,lean:-.04,legL:-.18,legR:.1});
    }
  }
  canvas('gate',(c,w,h)=>{
    shadow(c,260,407,226,11);
    const stone=(x,y,ww,hh,face=false)=>{
      path(c,[[x,y],[x+ww,y],[x+ww,y+hh],[x,y+hh]],grad(c,x,y,x+ww,y+hh,face?['#737e79','#4f6262']:['#9b9d8d','#6f7c73']),'#354c4e',1);
      line(c,[[x+2,y+2],[x+ww-2,y+2]],'rgba(216,213,179,.38)',1.1);
    };
    // Receding walls anchor the facade in the isometric world.
    path(c,[[20,204],[71,175],[111,196],[111,365],[20,395]],'#4b605b','#2e4546',2);
    path(c,[[410,194],[460,175],[501,199],[501,393],[410,367]],'#4a5d5b','#2e4546',2);
    for(let r=0;r<8;r++){for(let k=0;k<3;k++){stone(22+k*29,213+r*21,28,20,true);stone(413+k*28,211+r*21,27,20,true);}}
    path(c,[[111,195],[260,160],[411,195],[411,380],[260,416],[111,380]],'#65736b','#344d4d',2);
    // Central stone curtain with individually shaded masonry.
    for(let r=0;r<10;r++)for(let k=0;k<10;k++){
      const x=112+k*30-(r%2)*15,y=196+r*19;
      if(x<112||x+29>411)continue;
      stone(x,y,29,18);
      if(rnd()>.74)line(c,[[x+9,y+3],[x+13,y+9],[x+8,y+14]],'#5c6d64',1);
    }
    // Battlements, central upper walkway.
    path(c,[[113,195],[260,157],[411,195],[402,207],[260,174],[122,209]],'#a5a58e','#3b5351',2);
    for(let i=0;i<9;i++){const x=124+i*31,yy=184;path(c,[[x,yy],[x+19,yy],[x+19,yy-24],[x,yy-24]],'#8d9788','#435b56',1.5);line(c,[[x+2,yy-22],[x+17,yy-22]],'#d0c9a6',1);}
    // Gate opening, pointed arch and warm interior.
    c.beginPath();c.moveTo(205,400);c.lineTo(205,286);c.bezierCurveTo(206,255,237,235,260,217);c.bezierCurveTo(284,237,314,256,315,286);c.lineTo(315,400);c.closePath();c.fillStyle='#192d30';c.fill();c.strokeStyle='#b5b397';c.lineWidth=16;c.stroke();
    c.strokeStyle='#415751';c.lineWidth=2;c.stroke();
    c.save();c.beginPath();c.moveTo(211,397);c.lineTo(211,286);c.quadraticCurveTo(215,259,260,226);c.quadraticCurveTo(305,259,309,286);c.lineTo(309,397);c.closePath();c.clip();
    const interior=grad(c,0,244,0,401,['#0c1e24','#172e31','#64796b']);c.fillStyle=interior;c.fillRect(210,225,100,180);
    for(let k=0;k<8;k++)line(c,[[222+k*11,231],[222+k*11,284]],'#4d5041',3);
    line(c,[[211,268],[309,268]],'#6c6c53',5);
    glow(c,269,359,51,'rgba(180,146,71,.23)');
    c.restore();
    for(let i=0;i<8;i++){const a=Math.PI+i*Math.PI/7,xx=260+63*Math.cos(a),yy=282+56*Math.sin(a);line(c,[[xx,yy],[xx+(xx-260)*.13,yy+(yy-282)*.13]],'#4a5b50',2);}
    path(c,[[204,399],[315,399],[349,418],[176,418]],'#879184','#3c5552',2);line(c,[[191,409],[330,409]],'#b4b69c',1.5);
    // Towers frame the gate, with faceted sides and slate spires.
    for(const tx of [119,401]){
      path(c,[[tx-43,125],[tx,105],[tx+43,125],[tx+43,376],[tx,395],[tx-43,376]],grad(c,tx-43,0,tx+43,0,['#889481','#9fa58e','#4e6762']),'#2c4749',2);
      for(let r=0;r<12;r++){
        const yy=143+r*19;
        line(c,[[tx-41,yy],[tx,yy+11],[tx+41,yy]],'#4c6259',1.8);
        for(let k=0;k<3;k++)line(c,[[tx-35+k*27+(r%2)*8,yy+2],[tx-35+k*27+(r%2)*8,yy+18]],'#4b6159',1);
        line(c,[[tx-39,yy+2],[tx-5,yy+11]],'rgba(219,218,177,.26)',1);
      }
      path(c,[[tx-47,131],[tx,147],[tx+47,131],[tx+47,117],[tx,132],[tx-47,117]],'#b0ae91','#4b6158',2);
      path(c,[[tx-49,118],[tx,98],[tx+49,118],[tx,137]],'#b8b798','#52675d',2);
      for(let k=-2;k<=2;k++){const xx=tx+k*18,yy=108+Math.abs(k)*4;path(c,[[xx-7,yy],[xx+7,yy],[xx+7,yy-22],[xx-7,yy-22]],grad(c,xx-8,0,xx+8,0,['#c1bea0','#778b79']),'#4c665c',1.4);}
      // Recessed arched arrow slits.
      for(const yy of [181,261]){
        c.beginPath();c.moveTo(tx-7,yy+31);c.lineTo(tx-7,yy+7);c.quadraticCurveTo(tx,yy-5,tx+7,yy+7);c.lineTo(tx+7,yy+31);c.closePath();c.fillStyle='#283f42';c.fill();c.strokeStyle='#bac0a1';c.lineWidth=2;c.stroke();
        line(c,[[tx+5,yy+7],[tx+5,yy+28]],'#425b56',2);
      }
      path(c,[[tx-47,367],[tx,383],[tx+47,367],[tx+49,383],[tx,402],[tx-49,383]],'#71836f','#344e4b',2);
      // Slender banner on each tower.
      line(c,[[tx+18,191],[tx+18,253]],'#9a8c61',2);path(c,[[tx+20,192],[tx+40,192],[tx+38,242],[tx+29,253],[tx+20,242]],tx<260?'#315675':'#70423e','#b7a373',1.2);
      line(c,[[tx+30,201],[tx+30,229]],'#c9b37d',2);line(c,[[tx+24,212],[tx+36,212]],'#c9b37d',2);
    }
    // Distant central keep, behind the middle facade visually anchored above it.
    path(c,[[218,157],[218,85],[260,65],[302,85],[302,157]],grad(c,218,0,302,0,['#82917f','#acaf95','#536f63']),'#365350',2);
    for(let r=0;r<4;r++)line(c,[[220,94+r*16],[300,94+r*16]],'#586f61',1.4);
    path(c,[[210,86],[260,13],[309,86],[260,102]],grad(c,213,20,309,96,['#284b58','#416b72','#203c47']),'#213c43',2);
    for(let y=44;y<88;y+=12)line(c,[[243-(y-44)*.6,y],[260,y+7],[277+(y-44)*.6,y]],'#5b8383',1);
    line(c,[[260,14],[260,0]],'#b9ac78',2);path(c,[[261,1],[291,6],[279,15],[261,13]],'#a77644','#e0bd7b',1);
    c.fillStyle='#233e40';c.fillRect(251,115,17,28);line(c,[[249,144],[270,144]],'#c3c1a0',2);
    // Moss, age, and trailing ivy soften the masonry.
    for(let i=0;i<75;i++){
      const side=i%2?145:365,xx=side+(rnd()-.5)*25,yy=218+rnd()*167;
      if(rnd()>.3)ell(c,xx,yy,2+rnd()*3,1+rnd()*3,['#526c45','#64834e','#8a965b'][i%3]);
    }
    for(const tx of [184,336]){glow(c,tx,320,38,'rgba(255,159,62,.24)');line(c,[[tx,340],[tx,316]],'#584733',5);path(c,[[tx-6,319],[tx-3,300],[tx+2,292],[tx+6,310],[tx+3,320]],'#efa151');path(c,[[tx-2,318],[tx+1,303],[tx+3,317]],'#ffedb4');}
  },520,420);
  canvas('bookshelf',c=>{
    shadow(c,80,192,48,7);
    // A solid oak case with an isometric right side and arched crest.
    path(c,[[31,88],[107,73],[132,87],[132,184],[107,197],[31,183]],'#493c2c','#2d3028',2);
    path(c,[[107,74],[132,87],[132,184],[107,197]],grad(c,107,90,132,170,['#665039','#382e27']),'#302f27',2);
    path(c,[[31,88],[107,74],[107,193],[31,180]],grad(c,31,80,107,190,['#806040','#3f3329']),'#292d25',2);
    path(c,[[36,90],[102,80],[102,184],[36,174]],'#302e26','#9a754d',2);
    path(c,[[28,86],[67,67],[108,72],[135,85],[108,94]],'#997349','#4e3a2b',2);
    line(c,[[31,84],[68,70],[108,75],[130,85]],'#c3a06a',1.6);
    for(const yy of [115,144,174]){
      path(c,[[34,yy],[105,yy+10],[105,yy+16],[34,yy+6]],'#9b754b','#3b3027',1.5);
      line(c,[[36,yy+1],[103,yy+11]],'#d0a46a',1);
    }
    const bookColors=['#a45743','#74816a','#75648a','#9d844f','#507880','#a06a47','#4e6659'];
    for(let shelf=0;shelf<3;shelf++){
      let xx=39;
      for(let j=0;j<7;j++){
        const bw=5+Math.floor(rnd()*3),bh=14+Math.floor(rnd()*9),yy=113+shelf*29+(xx-35)*.145;
        path(c,[[xx,yy-bh],[xx+bw,yy-bh+1],[xx+bw,yy],[xx,yy-1]],bookColors[(j+shelf*2)%bookColors.length],'#322f28',.8);
        line(c,[[xx+1,yy-bh+3],[xx+bw-1,yy-bh+4]],'#cfb47e',1);
        line(c,[[xx+1,yy-4],[xx+bw-1,yy-3]],'#bea16a',1);
        line(c,[[xx+1,yy-bh+2],[xx+1,yy-2]],'rgba(238,213,169,.22)',.8);
        xx+=bw+1;
      }
    }
    // Open parchment, tied roll and a tiny scholarly skull on the crown.
    path(c,[[45,79],[61,75],[75,79],[61,85]],'#d9c79c','#8b754f',1);
    line(c,[[51,79],[60,77],[67,79]],'#a38d61',.7);
    line(c,[[56,81],[62,79],[68,81]],'#a38d61',.7);
    line(c,[[83,78],[99,81]],'#ceb98b',6);ell(c,99,81,3,3,'#e4d4a8','#8b764f');
    line(c,[[91,77],[90,82]],'#806043',1.5);
    ell(c,78,69,7,7,'#c4c4a8','#6d7863');ell(c,75,69,1.8,2,'#3e4c43');ell(c,81,69,1.8,2,'#3e4c43');
    path(c,[[74,73],[81,74],[80,77],[75,76]],'#c5c0a0','#6d7460');
    for(let k=0;k<3;k++)line(c,[[76+k*1.5,74],[76+k*1.5,76]],'#78816c',.7);
    // Grain in the end panel and brass pins in the vertical frame.
    for(let k=0;k<5;k++)line(c,[[112+k*3,98+k],[114+k*3,136],[111+k*3,178]],'rgba(183,137,80,.18)',1);
    for(const yy of [96,137,174]){ell(c,33,yy,1,1,'#bd9a59');ell(c,105,yy+8,1,1,'#bd9a59');}
  });
  canvas('banner',c=>{
    shadow(c,80,193,34,5);
    line(c,[[48,194],[48,57]],'#494b3b',5);line(c,[[47,192],[47,58]],'#9b9271',1.5);
    line(c,[[41,62],[120,62]],'#807349',4);ell(c,40,62,4,4,'#c6ad6b');ell(c,121,62,4,4,'#c6ad6b');
    path(c,[[58,66],[111,66],[110,151],[96,175],[83,163],[69,179],[58,155]],grad(c,56,0,114,0,['#7f3435','#b1584a','#773139','#592a32']),'#4b2b30',2);
    line(c,[[61,68],[61,154],[69,173],[83,157],[96,169],[107,149],[108,68]],'#c9a364',2);
    line(c,[[74,69],[72,145]],'rgba(227,152,104,.26)',2);
    line(c,[[98,69],[101,146]],'rgba(35,29,35,.2)',3);
    for(const xx of [61,81,105]){line(c,[[xx,60],[xx,70]],'#b7995f',3);ell(c,xx,69,1.1,1.1,'#eed6a1');}
    // Original sun-and-sword heraldry.
    ell(c,84,109,14,14,'#c8a45f','#ebca87');ell(c,84,109,10,10,'#8b493e');
    for(let k=0;k<8;k++){const a=k*Math.PI/4;line(c,[[84+Math.cos(a)*16,109+Math.sin(a)*16],[84+Math.cos(a)*20,109+Math.sin(a)*20]],'#d4b16b',2);}
    path(c,[[81,126],[81,101],[84,94],[87,101],[87,126]],'#e3c889','#9f6d42',.8);line(c,[[77,125],[91,125]],'#e6c682',2);line(c,[[84,126],[84,134]],'#dfbc78',3);
    path(c,[[39,193],[48,183],[57,193]],'#697363','#3b4d43',1.5);
  });
  canvas('statue',c=>{
    shadow(c,80,193,44,7);
    path(c,[[40,175],[78,161],[120,175],[120,188],[81,199],[40,188]],'#62776e','#3b534f',2);
    path(c,[[40,175],[78,161],[120,175],[81,188]],'#a5ac94','#53695e',1.5);
    path(c,[[52,155],[80,145],[109,155],[108,174],[81,184],[53,173]],grad(c,52,0,109,0,['#b0b49a','#809384','#4e695f']),'#405b53',2);
    path(c,[[49,154],[80,143],[113,154],[81,166]],'#bdc0a5','#576d60',1.5);
    // A weathered stone knight resting both hands on a ceremonial sword.
    path(c,[[61,110],[76,109],[75,147],[65,155],[56,152],[62,142]],'#839583','#476458',1.5);
    path(c,[[84,110],[96,109],[99,145],[108,152],[97,157],[86,150]],'#697f70','#476458',1.5);
    line(c,[[64,119],[72,118],[72,139]],'#bbc0a2',1.6);line(c,[[88,119],[94,118],[96,141]],'#a5b298',1.4);
    path(c,[[58,71],[99,71],[104,112],[94,125],[80,119],[66,125],[55,111]],grad(c,55,70,103,120,['#b6b99f','#879e8b','#57776b']),'#405f55',2);
    line(c,[[62,76],[78,85],[80,109]],'#d1cfb1',2);line(c,[[82,84],[94,77]],'#adc0a5',1.5);
    for(let k=0;k<3;k++)line(c,[[60,104+k*5],[98,104+k*5]],'#4c6b5d',1.5);
    path(c,[[55,69],[43,78],[47,99],[65,104],[69,95],[57,90],[58,79]],'#9cab91','#526f5f',2);
    path(c,[[99,70],[113,80],[109,100],[90,105],[85,96],[101,91],[98,80]],'#799281','#466659',2);
    ell(c,72,100,8,5,'#aeb89d','#5c7865');ell(c,86,100,8,5,'#9aab90','#4f6c5c');
    path(c,[[77,98],[83,98],[83,145],[80,155],[77,145]],'#b6bca0','#587467',1.3);line(c,[[69,108],[91,108]],'#9dad90',4);
    path(c,[[66,63],[64,45],[70,32],[86,29],[97,40],[99,61],[88,73],[75,73]],grad(c,64,35,99,65,['#b7bda5','#9bad98','#698677']),'#46675d',2);
    path(c,[[68,48],[95,47],[94,53],[69,54]],'#526d62');line(c,[[81,33],[81,65]],'#c2c5ab',3);line(c,[[70,57],[70,63]],'#596f61',1.3);line(c,[[91,57],[91,63]],'#4d685d',1.3);
    // A chipped plume, cracks and moss rather than a pristine silver statue.
    path(c,[[77,30],[72,18],[78,16],[79,22],[89,18],[88,30]],'#9aa98d','#5b7664',1.5);
    line(c,[[91,38],[87,44],[92,57],[89,66]],'#526e60',1.3);
    line(c,[[60,80],[65,89],[61,96]],'#546f5c',1.2);line(c,[[91,168],[84,171],[86,179]],'#4e6b57',1.4);
    for(let k=0;k<19;k++){const xx=55+rnd()*47,yy=155+rnd()*23;ell(c,xx,yy,1+rnd()*3,1+rnd()*2,['#5b7750','#789456','#94a66a'][k%3]);}
    ell(c,55,84,4,6,'#748c57');ell(c,91,63,4,2,'#76905c');
  });
  canvas('barrel',c=>{
    shadow(c,80,193,32,6);
    c.beginPath();c.moveTo(56,126);c.bezierCurveTo(47,145,46,170,55,188);c.bezierCurveTo(67,198,94,198,106,188);c.bezierCurveTo(115,168,113,144,105,126);c.closePath();c.fillStyle=grad(c,49,130,112,177,['#745535','#ba8c51','#8a6039','#4f3d2c']);c.fill();c.strokeStyle='#3a3529';c.lineWidth=2;c.stroke();
    for(let k=0;k<7;k++){
      const xx=57+k*8;
      c.beginPath();c.moveTo(xx,129);c.bezierCurveTo(xx+(xx-81)*.13,151,xx+(xx-81)*.15,173,xx,190);c.strokeStyle='#58412c';c.lineWidth=1.3;c.stroke();
      if(k%2===0)line(c,[[xx+2,146],[xx+3,163],[xx+2,178]],'rgba(226,179,106,.35)',1);
    }
    for(const yy of [140,177]){
      c.beginPath();c.ellipse(80,yy,31,8,0,0,Math.PI);c.strokeStyle='#394840';c.lineWidth=8;c.stroke();
      c.beginPath();c.ellipse(80,yy-2,31,8,0,0,Math.PI);c.strokeStyle='#9a9c7c';c.lineWidth=2;c.stroke();
      for(const xx of [57,77,100])ell(c,xx,yy+5-(xx===77?0:2),1.5,1.5,'#c4b986','#37463c');
    }
    ell(c,80,126,25,10,'#b8945c','#493b29');ell(c,80,126,21,7,'#a5824b','#d1ae72');
    for(let k=-2;k<=2;k++)line(c,[[63,126+k*2],[96,126+k*2]],'#715433',1);
    ell(c,85,125,3,2,'#79603a','#c1a16a');
  });
  // Reuse the hand-painted hero and articulate its boot regions for the walk cycle.
  // Upper body remains identical, preserving the inventory silhouette and armour.
  for(let frame=0;frame<2;frame++){
    canvas('heroWalking'+frame,c=>{
      const src=out.hero,phase=frame===0?1:-1;
      c.drawImage(src,0,0);
      c.clearRect(51,159,27,35);c.clearRect(83,159,26,35);
      c.drawImage(src,51,159,27,35,51-phase,159-phase*3,27,35);
      c.drawImage(src,83,159,26,35,83+phase,159+phase*3,26,35);
    });
  }
  return out;
}
