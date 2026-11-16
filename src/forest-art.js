/* Original, deterministic woodland illustrations for The Cursed Kingdoms.
 * Trees: 240 x 320. Understorey: 160 x 120. Every anchor is bottom-centre.
 * Cached once at boot: no network, image files, randomness or per-frame drawing.
 */
export function makeForestArt() {
  const result = {};
  let state = 1;
  const random = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
  const between = (a,b) => a+(b-a)*random();
  const pick = a => a[Math.floor(random()*a.length)];
  const make = (name,seed,tree,draw) => {
    state=seed;
    const canvas=document.createElement('canvas');
    canvas.width=tree?240:160; canvas.height=tree?320:120;
    const c=canvas.getContext('2d'); c.lineCap='round'; c.lineJoin='round';
    draw(c); result[name]=canvas;
  };
  const path = (c,points,fill,stroke,width=1) => {
    c.beginPath(); points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath();
    if(fill){c.fillStyle=fill;c.fill();} if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
  };
  const line = (c,points,color,width=1) => {
    c.beginPath(); points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));
    c.strokeStyle=color; c.lineWidth=width; c.stroke();
  };
  const ellipse = (c,x,y,rx,ry,color,angle=0) => {
    c.beginPath(); c.ellipse(x,y,rx,ry,angle,0,Math.PI*2); c.fillStyle=color;c.fill();
  };
  const gradient = (c,x,y,x2,y2,colors) => {
    const g=c.createLinearGradient(x,y,x2,y2); colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v));return g;
  };
  const leaf = (c,x,y,length,width,angle,color,vein=false) => {
    const dx=Math.cos(angle),dy=Math.sin(angle),px=-dy,py=dx;
    c.beginPath();c.moveTo(x-dx*length*.45,y-dy*length*.45);
    c.quadraticCurveTo(x+px*width,y+py*width,x+dx*length*.55,y+dy*length*.55);
    c.quadraticCurveTo(x-px*width*.7,y-py*width*.7,x-dx*length*.45,y-dy*length*.45);
    c.fillStyle=color;c.fill();
    if(vein)line(c,[[x-dx*length*.35,y-dy*length*.35],[x+dx*length*.42,y+dy*length*.42]],'rgba(217,218,143,.20)',.45);
  };
  const branch = (c,x,y,x2,y2,bend,width,color,highlight) => {
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo((x+x2)/2+bend,(y+y2)/2,x2,y2);c.lineWidth=width;c.strokeStyle=color;c.stroke();
    if(highlight){c.beginPath();c.moveTo(x-width*.2,y);c.quadraticCurveTo((x+x2)/2+bend-width*.15,(y+y2)/2,x2-.5,y2);c.strokeStyle=highlight;c.lineWidth=Math.max(.6,width*.16);c.stroke();}
  };
  const bark = (c,baseX,lean,light='#8f7b52') => {
    // A curving, tapering trunk ending in a broken crown of secondary limbs.
    const topX=baseX+lean;
    path(c,[[baseX-24,313],[baseX-10,291],[baseX-12,263],[baseX-6,229],[baseX-9+lean*.25,194],[topX-7,152],[topX+2,124],[topX+11,160],[baseX+14+lean*.35,206],[baseX+9,250],[baseX+14,288],[baseX+32,312],[baseX+10,306],[baseX+2,293],[baseX-4,310]],gradient(c,baseX-18,0,baseX+21,0,['#3c3d2c','#776847',light,'#4a4d34']),'#343b2b',1.5);
    branch(c,baseX+1,267,topX+2,147,9,3,'#343b29','#aa9060');
    for(let k=0;k<12;k++){
      const yy=between(183,288),xx=baseX+lean*(1-(yy-150)/150)*.4+between(-7,10);
      branch(c,xx,yy,xx+between(-3,4),yy-between(11,32),between(-3,3),between(.7,2),'#3e432e');
      if(k%3===0)branch(c,xx+2,yy-2,xx+3,yy-15,1,.7,'#b09c6a');
    }
    // Roots sit on the ground plane and fork into tapered tips.
    for(const [dx,dy] of [[-38,-2],[-28,-9],[31,-8],[40,1],[-11,5],[14,4]]){
      branch(c,baseX+(dx>0?7:-7),296,baseX+dx,311+dy,dx*.22,Math.abs(dx)>.5?4:3,'#5e5b3c','#9a8856');
      line(c,[[baseX+dx,311+dy],[baseX+dx+(dx>0?5:-5),312+dy]],'#4c4f32',1.4);
    }
    for(let k=0;k<11;k++)leaf(c,baseX+between(-17,21),between(273,309),between(3,7),2,between(-2,2),pick(['#697c39','#526c35','#7f8d47']));
  };
  function canopy(c,clusters,palette,count=1700,leafSize=1) {
    // No circular canopy primitives: every cluster is made from tapered leaves.
    // Large dark leaves establish an irregular silhouette, then small lit leaves
    // break it up. A coherent upper-left light direction shapes the crown.
    for(let layer=0;layer<3;layer++){
      const total=layer===0?Math.floor(count*.32):layer===1?count:Math.floor(count*.65);
      for(let k=0;k<total;k++){
        const [cx,cy,rx,ry]=pick(clusters),a=between(0,Math.PI*2),rr=Math.sqrt(random());
        const xx=cx+Math.cos(a)*rr*rx,yy=cy+Math.sin(a)*rr*ry;
        const brightness=(1-(yy-cy+ry)/(2*ry))*.55+(1-(xx-cx+rx)/(2*rx))*.32+random()*.24;
        const shade=layer===0?Math.floor(random()*2):Math.max(0,Math.min(palette.length-1,Math.floor(brightness*(palette.length-1))));
        const size=(layer===0?between(7,15):layer===1?between(3.3,8):between(2.5,5.5))*leafSize;
        leaf(c,xx,yy,size,size*between(.32,.56),between(-2.8,.8),palette[shade],layer===2&&k%7===0);
      }
    }
  }
  function oak(name,seed,variant) {
    make(name,seed,true,c=>{
      const lean=[-7,-24,17][variant],base=[121,132,110][variant];
      // Fine, barely visible contact shadow only; game renderer owns cast shadows.
      ellipse(c,base,313,43,5,'rgba(20,32,19,.19)');
      bark(c,base,lean,variant===2?'#9f8151':'#92805a');
      const branches=variant===0?[[111,196,54,146,-7,12],[123,199,184,138,17,10],[113,173,89,82,-12,10],[120,167,150,66,13,9],[104,166,32,113,-13,5],[150,153,207,118,9,5]]:variant===1?[[123,215,44,177,-18,14],[118,196,64,100,-17,12],[119,179,164,83,17,10],[95,157,27,131,-14,7],[145,138,212,117,15,7],[102,155,100,56,-8,7]]:[[124,207,184,173,15,12],[121,174,80,111,-7,11],[121,158,162,62,12,8],[97,142,41,111,-11,6],[140,124,201,105,14,5],[120,139,117,49,-8,7]];
      for(const b of branches){branch(c,...b,'#4b4a32','#96835a');const [x,y,x2,y2]=b;branch(c,(x+x2)/2,(y+y2)/2,x2+(x2<base?-18:18),y2+13,4,2.5,'#625c3c','#a18d5f');}
      const clusters=variant===0?[[88,53,34,23],[137,48,33,27],[52,84,34,27],[176,84,34,30],[104,94,50,37],[59,124,43,28],[158,127,49,33],[111,147,39,27],[28,121,12,19],[199,117,20,24]]:variant===1?[[86,58,31,21],[133,61,35,25],[50,98,35,26],[178,93,36,27],[107,108,47,35],[42,147,31,24],[81,154,37,31],[156,143,44,31],[199,129,25,27],[107,180,29,23]]:[[112,45,28,24],[151,57,27,26],[71,83,36,30],[172,97,37,28],[119,98,43,35],[45,119,23,24],[77,143,35,26],[156,145,41,31],[195,137,22,25],[115,166,30,24]];
      const palettes=[['#142e24','#1d3d2b','#294d31','#375f38','#4f733f','#68894a','#8c9e59'],['#1a3328','#264633','#35593b','#456c43','#5a7b49','#7c9255','#a2a565'],['#343e28','#4d4d2b','#646232','#7e7538','#998a43','#afa354','#c6b66c']];
      canopy(c,clusters,palettes[variant],variant===1?1950:1800);
      // A few thin twigs remain visible in gaps at the crown's edge.
      for(const [xx,yy,dx,dy] of [[28,130,-9,13],[202,135,10,9],[76,49,-7,-13],[171,64,9,-6]]){
        line(c,[[xx,yy],[xx+dx,yy+dy]],'#625c3d',1.1);
        leaf(c,xx+dx,yy+dy,5,2,-1,palettes[variant][4]);
      }
      // Sparser under-crown leaves on the actual branches give depth and gaps.
      for(let k=0;k<35;k++){const xx=between(64,175),yy=between(174,208);if(random()>.43)leaf(c,xx,yy,between(4,8),2,between(-2,1),palettes[variant][2+Math.floor(random()*3)]);}
    });
  }
  oak('oak0',42031,0);oak('oak1',99413,1);oak('oak2',17741,2);
  function birch(name,seed,variant){
    make(name,seed,true,c=>{
      const bx=variant?128:112,lean=variant?-17:13;
      ellipse(c,bx,314,27,4,'rgba(20,32,19,.17)');
      path(c,[[bx-13,315],[bx-6,293],[bx-7,241],[bx-2+lean*.4,184],[bx+lean-3,114],[bx+lean+3,81],[bx+lean+8,122],[bx+9+lean*.5,182],[bx+7,246],[bx+9,293],[bx+19,315],[bx+5,307],[bx-2,307]],gradient(c,bx-9,0,bx+16,0,['#737e67','#d4d4b7','#ece5ca','#8e9b84']),'#64745d',1.3);
      for(let k=0;k<28;k++){
        const yy=between(126,302),xx=bx+lean*(1-(yy-110)/195)*.75;
        const ww=between(3,9),shift=between(-5,4);
        line(c,[[xx+shift-ww*.5,yy],[xx+shift+ww*.5,yy+between(-1,1)]],pick(['#4c5a48','#65715a','#8b9175']),between(.7,2.2));
        if(k%5===0)path(c,[[xx-3,yy-3],[xx+2,yy-4],[xx+4,yy+3],[xx,yy+5]],'#56644f');
      }
      const branches=[[bx+2,258,57,202,-8,4],[bx+2,220,180,176,11,4],[bx+lean*.5,184,69,126,-4,4],[bx+lean,158,179,104,9,3.5],[bx+lean,131,102,65,-5,3]];
      for(const b of branches){branch(c,...b,'#6c775a','#c6cbb1');const [x,y,x2,y2]=b;branch(c,(x+x2)/2,(y+y2)/2,x2+8,y2-25,8,1.5,'#687954','#b7c19a');}
      const clusters=variant?[[111,55,24,22],[142,78,23,30],[87,111,29,27],[160,126,28,31],[69,153,25,29],[134,171,33,28],[171,185,28,24],[89,207,30,22],[50,214,15,15]]:[[129,48,24,22],[104,80,23,29],[161,88,26,28],[89,122,27,28],[159,136,30,30],[107,161,28,27],[65,189,25,25],[163,189,24,22],[104,208,22,17]];
      canopy(c,clusters,variant?['#293b26','#3b502b','#526631','#6f7d3d','#8a914b','#a5a75c','#c0bc78']:['#233c28','#335131','#486d39','#618747','#82a05b','#a0b573','#c1c98b'],1150,.77);
      for(let k=0;k<7;k++){const xx=bx+between(-17,19),yy=between(304,315);leaf(c,xx,yy,between(4,8),2,between(-2,0),'#68833d');}
    });
  }
  birch('birch0',76213,0);birch('birch1',51719,1);
  function fir(name,seed,variant){
    make(name,seed,true,c=>{
      const bx=variant?124:118;
      ellipse(c,bx,314,37,4,'rgba(15,29,23,.17)');
      path(c,[[bx-11,315],[bx-6,279],[bx-3,52],[bx,22],[bx+4,51],[bx+8,280],[bx+17,315],[bx+4,309]],gradient(c,bx-10,0,bx+10,0,['#3f4430','#8a7750','#4f5738']),'#37452e',1);
      const colors=variant?['#1b3430','#29483e','#365e4f','#507a61','#739279']:['#142e2a','#1d3c33','#2a5140','#3d6a4e','#648362'];
      for(let tier=0;tier<12;tier++){
        const yy=52+tier*19,spread=(10+tier*(variant?5.4:5.9))*(1+between(-.1,.1));
        for(const side of [-1,1]){
          const endpointX=bx+side*spread,endpointY=yy+16+between(-3,5);
          branch(c,bx,yy-6,endpointX,endpointY,side*spread*.08,2.8,colors[0],colors[2]);
          // Long irregular, drooping bough contours instead of solid triangles.
          const contour=[[bx,yy-15],[bx+side*spread*.4,yy-2],[endpointX-side*9,yy+13],[endpointX+side*6,yy+17],[endpointX-side*11,yy+19],[endpointX-side*6,yy+26],[bx+side*spread*.56,yy+18],[bx+side*spread*.43,yy+25],[bx+side*spread*.23,yy+12],[bx,yy+15]];
          path(c,contour,colors[1]);
          for(let k=0;k<45+tier*5;k++){
            const along=random(),xx=bx+side*along*spread,centerY=yy+along*17;
            const y= centerY+between(-11,12)*(1-along*.5);
            const len=between(3,8),a=side<0?between(-3,-1.5):between(.1,1.8);
            line(c,[[xx,y],[xx+Math.cos(a)*len,y+Math.sin(a)*len]],colors[Math.floor(random()*colors.length)],between(.55,1.3));
          }
          for(let k=0;k<6;k++){
            const xx=bx+side*spread*between(.25,.95),y=yy+Math.abs(xx-bx)/spread*17;
            line(c,[[xx,y],[xx+side*between(3,8),y+between(8,16)]],colors[2],1.5);
          }
        }
      }
      // The living leader is narrow and asymmetrical.
      for(let k=0;k<28;k++){const yy=between(22,58),spread=(yy-17)*.28;line(c,[[bx,yy],[bx+between(-spread,spread),yy+between(4,10)]],pick(colors.slice(2)),1);}
      for(let k=0;k<7;k++){const xx=bx+between(-38,41),yy=between(203,268);ellipse(c,xx,yy,2,4,'#796447',-.2);line(c,[[xx-1,yy-2],[xx+1,yy-1]],'#a18a5e',.6);}
    });
  }
  fir('fir0',72631,0);fir('fir1',28817,1);
  function fern(name,seed,variant){
    make(name,seed,false,c=>{
      ellipse(c,80,115,31,4,'rgba(20,39,23,.18)');
      const base=[80,114],palette=variant?['#365634','#53773d','#739747','#9bb65f']:['#244a36','#386b43','#54874d','#7ea25a'];
      const angles=variant?[-2.9,-2.5,-2.08,-1.7,-1.3,-.9,-.45]:[-2.92,-2.62,-2.28,-1.92,-1.6,-1.24,-.85,-.47,-.2];
      for(let f=0;f<angles.length;f++){
        const a=angles[f],len=between(42,70),endX=base[0]+Math.cos(a)*len,endY=base[1]+Math.sin(a)*len;
        const cx=(base[0]+endX)/2,cy=Math.min(base[1],endY)-between(14,24);
        const at=t=>[(1-t)*(1-t)*base[0]+2*(1-t)*t*cx+t*t*endX,(1-t)*(1-t)*base[1]+2*(1-t)*t*cy+t*t*endY];
        c.beginPath();c.moveTo(...base);c.quadraticCurveTo(cx,cy,endX,endY);c.strokeStyle=palette[2];c.lineWidth=1.1;c.stroke();
        for(let j=1;j<=15;j++){
          const t=j/16,[xx,yy]=at(t),[nx,ny]=at(Math.min(1,t+.02)),dir=Math.atan2(ny-yy,nx-xx),size=(1-t)*between(9,13)+1;
          for(const side of [-1,1]){
            const aa=dir+side*1.03,ex=xx+Math.cos(aa)*size,ey=yy+Math.sin(aa)*size;
            // Tapered, subtly serrated pinnae retain the fern's recognizable form.
            path(c,[[xx,yy],[xx+(ex-xx)*.45-Math.sin(aa)*1.3,yy+(ey-yy)*.45+Math.cos(aa)*1.3],[ex,ey],[xx+(ex-xx)*.6+Math.sin(aa),yy+(ey-yy)*.6-Math.cos(aa)]],palette[(f+j)%3+1]);
            line(c,[[xx,yy],[ex,ey]],palette[0],.4);
          }
        }
      }
      for(let k=0;k<3;k++){c.beginPath();c.moveTo(77+k*4,114);c.bezierCurveTo(72+k*4,100,76+k*4,85,82+k*3,87);c.arc(82+k*3,90,3,-Math.PI/2,Math.PI*.8);c.strokeStyle=palette[2];c.lineWidth=1.2;c.stroke();}
    });
  }
  fern('fern0',33473,0);fern('fern1',91723,1);
  make('flowers0',50711,false,c=>{
    ellipse(c,80,115,43,4,'rgba(25,40,25,.14)');
    for(let k=0;k<34;k++){
      const bx=between(41,119),by=between(109,116),topX=bx+between(-14,14),topY=by-between(17,50);
      branch(c,bx,by,topX,topY,between(-4,4),.9,pick(['#3b653d','#5a7a45','#778d4f']));
      leaf(c,bx+(topX-bx)*.4,by+(topY-by)*.4,between(6,10),2,between(-2.8,-.3),'#517b41');
      if(k<22){
        const colors=k%4===0?['#c4a5c5','#e2c6dc']:k%3===0?['#c1b47c','#ece0af']:['#8f97be','#b9b6d6'];
        for(let j=0;j<5;j++){const a=j*Math.PI*2/5;leaf(c,topX+Math.cos(a)*2,topY+Math.sin(a)*2,4,1.7,a,colors[j%2]);}
        ellipse(c,topX,topY,1.3,1.3,'#d7ba6c');
      }
    }
    for(let k=0;k<10;k++)leaf(c,between(45,116),between(103,115),between(7,14),2,between(-3,0),'#648043');
  });
  make('mushrooms0',66103,false,c=>{
    ellipse(c,80,115,33,4,'rgba(24,39,21,.18)');
    const mushrooms=[[63,112,15,21],[89,113,20,30],[107,114,9,13],[48,115,8,12]];
    for(let i=0;i<mushrooms.length;i++){
      const [xx,yy,r,h]=mushrooms[i];
      path(c,[[xx-3,yy],[xx-2,yy-h+2],[xx+3,yy-h+1],[xx+4,yy-2]],gradient(c,xx-4,0,xx+5,0,['#b8b696','#e2d8b4','#8a9779']),'#7f896d',.8);
      ellipse(c,xx,yy-h+3,r,3.8,'#aeae86');
      for(let k=0;k<7;k++)line(c,[[xx,yy-h+2],[xx-r+2+k*(r*2-4)/6,yy-h+4]],'#787f62',.5);
      c.beginPath();c.moveTo(xx-r,yy-h+1);c.bezierCurveTo(xx-r*.8,yy-h-r*.65,xx+r*.45,yy-h-r*.9,xx+r,yy-h+1);c.quadraticCurveTo(xx,yy-h+6,xx-r,yy-h+1);c.fillStyle=gradient(c,xx,yy-h-r,xx,yy-h+5,i%2?['#bd7950','#9a4e36','#6b3f2d']:['#b6a36a','#8d7b4b','#5e6543']);c.fill();
      line(c,[[xx-r+2,yy-h+1],[xx+r-2,yy-h+2]],'#d3b582',.8);
      for(let k=0;k<8;k++){const dx=between(-r*.65,r*.65),dy=-Math.sqrt(1-dx*dx/(r*r))*r*.3+between(-1,2);ellipse(c,xx+dx,yy-h+dy,between(.7,1.8),.6,'#d9c798',between(-.5,.5));}
    }
    for(let k=0;k<15;k++)leaf(c,between(42,116),between(110,117),between(4,9),1.8,between(-3,0),pick(['#4b6c3a','#77884b','#8e8852']));
  });
  make('log0',80731,false,c=>{
    ellipse(c,80,111,53,6,'rgba(20,32,20,.22)');
    path(c,[[26,87],[109,62],[130,78],[128,98],[47,119],[29,108]],gradient(c,35,72,58,117,['#7e7351','#514f35','#3b412d']),'#313b29',1.5);
    ellipse(c,39,102,15,17,'#a89764',-.5);ellipse(c,39,102,11,13,'#b6a773',-.5);
    for(let k=0;k<4;k++){c.beginPath();c.ellipse(39,102,3+k*2.7,4+k*3,-.5,0,Math.PI*2);c.strokeStyle='#8d8155';c.lineWidth=.7;c.stroke();}
    line(c,[[39,102],[45,112]],'#6d6b45',1);line(c,[[40,102],[32,94]],'#7e7548',1);
    for(let k=0;k<12;k++){
      const yy=between(77,105),xx=between(39,69);line(c,[[xx,yy],[xx+between(13,25),yy-5],[xx+between(30,57),yy-between(9,16)]],pick(['#303b28','#777250','#929067','#4b5134']),between(.7,2));
    }
    path(c,[[83,77],[79,62],[86,57],[93,72]],'#605e3e','#39432c',1.3);ellipse(c,83,59,4,2,'#a29461',-.4);
    // Moss resolves as tiny fronds and cushions, not a flat green stripe.
    for(let k=0;k<150;k++){
      const xx=between(40,119),yy=93-(xx-40)*.27+between(-8,6);leaf(c,xx,yy,between(2,5),between(.6,1.7),between(-2.8,-.2),pick(['#446034','#5a753c','#7d8e4c','#9b9e59']));
    }
    for(let k=0;k<10;k++)leaf(c,between(30,126),between(107,116),between(5,10),2,between(-3,0),'#637a3d');
  });
  make('reeds0',14207,false,c=>{
    ellipse(c,80,115,33,4,'rgba(20,35,25,.16)');
    for(let k=0;k<33;k++){
      const bx=between(54,108),by=between(109,117),ex=bx+between(-24,21),ey=between(38,95);
      c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx+between(-8,8),ey+14,ex,ey);c.quadraticCurveTo(bx+between(-5,7),ey+22,bx+2,by);c.closePath();c.fillStyle=pick(['#3f5e35','#57713d','#738747','#9b9e55']);c.fill();
      if(k%5===0){branch(c,bx,by,ex,ey-14,between(-2,2),1,'#8c8d4e');line(c,[[ex,ey-24],[ex,ey-13]],'#70583c',4);line(c,[[ex-1,ey-23],[ex-1,ey-15]],'#a58a57',.8);line(c,[[ex,ey-28],[ex,ey-24]],'#b6aa6b',.6);}
    }
  });
  return result;
}
