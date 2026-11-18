const errands=['beacon','satchel','moth'];
const starts={beacon:'Das Signalfeuer ist erloschen. Bleib vier Sekunden bei seinem goldenen Ring.',satchel:'Botenpost! In zwei Truhen draussen liegen die vermissten Siegel.',moth:'Eine kleine Laternenmotte folgt dir. Bring sie heil zum Burgtor.'};
export function errandText(w){
 const q=w?.errand;if(!q||q.done)return '';
 if(q.kind==='beacon')return 'Signalfeuer hüten · '+Math.floor(q.progress)+'/4 s';
 if(q.kind==='satchel')return 'Botensiegel aus Truhen bergen · '+q.progress+'/'+Math.min(2,w.chests.length);
 return 'Laternenmotte zum Burgtor begleiten';
}
export function updateErrand(g,dt){
 const w=g.world;if(w.inside)return;
 const post=w.marks?.[0]||w.sign;
 if(!post||!(post.done||w.signRead))return;
 let q=w.errand;
 if(!q){
  const kind=errands[(w.chapter-1)%3];
  q=w.errand={kind,progress:0,done:false,x:post.x,y:post.y};
  g.notify(starts[kind]);
 }
 if(q.done)return;
 const p=g.player;
 if(q.kind==='beacon'){
  const atPost=Math.hypot(p.x-post.x,p.y-post.y)<=2.3;
  q.progress=atPost?Math.min(4,q.progress+dt):0;
  if(q.progress<4)return;
 }else if(q.kind==='satchel'){
  q.progress=Math.min(2,w.chests.filter(c=>c.opened).length);
  if(q.progress<Math.min(2,w.chests.length)||!w.chests.length)return;
 }else{
  const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
  if(d>1){const step=Math.min(d-.85,dt*4.6);q.x+=step*dx/d;q.y+=step*dy/d;}
  if(Math.hypot(q.x-w.exit.x,q.y-w.exit.y)>3.1)return;
 }
 q.done=true;
 const gold=8+w.chapter*2;p.gold+=gold;
 g.notify(({beacon:'Das Signalfeuer brennt!',satchel:'Die Botenpost ist vollständig!',moth:'Die Motte leuchtet über dem Tor!'})[q.kind]+' +'+gold+' Gold');
 g.emit('quest');g.persist();
}
