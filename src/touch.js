import {lineOfSight} from './world.js';

export function stickVector(dx,dy,radius=46){
 const distance=Math.hypot(dx,dy),scale=Math.min(1,radius/(distance||1));
 return {x:distance<9?0:dx/(distance||1),y:distance<9?0:dy/(distance||1),knobX:dx*scale,knobY:dy*scale};
}
export function touchAim(game,movement){
 const p=game.player,w=game.world,range=game.stats.kind==='bow'?9:3.2;
 const target=w.enemies.filter(e=>!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<=range&&lineOfSight(w,p,e)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
 if(target)return {x:target.x-p.x,y:target.y-p.y};
 return Math.hypot(movement.x,movement.y)>.01?movement:p.face;
}
export class TouchControls{
 constructor(game,audio){
  this.game=game;this.audio=audio;this.vector={x:0,y:0};this.pointers=new Map();this.stickId=null;this.attack=false;this.block=false;this.tick=0;
  let preference=null;try{preference=localStorage.getItem('burgen-touch');}catch{}
  this.enabled=preference===null?(navigator.maxTouchPoints>0||matchMedia('(pointer: coarse)').matches):preference==='on';
  this.root=document.createElement('div');this.root.id='touch-controls';this.root.hidden=true;
  this.root.innerHTML=`<div id="move-stick" role="group" aria-label="Bewegungsstick: ziehen zum Bewegen"><span class="stick-ring"></span><span id="stick-knob"></span><small>BEWEGEN</small></div><div class="touch-actions"><button id="touch-interact" class="touch-interact" aria-label="Interagieren"><span>✦</span><small>Aktion</small></button><button id="touch-dodge" aria-label="Ausweichen"><span>↝</span><small>Rolle</small></button><button id="touch-block" aria-label="Blocken halten"><span>◇</span><small>Block</small></button><button id="touch-attack" class="touch-attack" aria-label="Angreifen halten"><span>⚔</span><small>Angriff</small></button></div><div id="touch-context" aria-live="polite"></div>`;
  document.body.append(this.root);this.stick=document.getElementById('move-stick');this.knob=document.getElementById('stick-knob');this.buttons=Object.fromEntries(['attack','block','dodge','interact'].map(a=>[a,document.getElementById('touch-'+a)]));this.context=document.getElementById('touch-context');
  this.stick.addEventListener('pointerdown',e=>{if(!this.enabled||game.mode!=='play'||this.stickId!==null)return;e.preventDefault();this.audio.start();this.stickId=e.pointerId;this.stick.setPointerCapture(e.pointerId);this.move(e);});
  this.stick.addEventListener('pointermove',e=>{if(e.pointerId===this.stickId){e.preventDefault();this.move(e);}});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])this.stick.addEventListener(event,e=>{if(e.pointerId===this.stickId)this.clearStick();});
  for(const [action,b]of Object.entries(this.buttons)){
   b.addEventListener('pointerdown',e=>{if(!this.enabled||game.mode!=='play'||b.disabled)return;e.preventDefault();this.audio.start();this.pointers.set(e.pointerId,{action,button:b});b.setPointerCapture(e.pointerId);b.classList.add('pressed');this.perform(action);});
   for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>this.release(e.pointerId));
   b.addEventListener('click',e=>{if(e.detail===0&&!b.disabled&&game.mode==='play'){this.audio.start();this.perform(action);if(action==='attack'||action==='block'){this[action]=false;game.input[action]=false;}}});
  }
  this.root.addEventListener('contextmenu',e=>e.preventDefault());window.addEventListener('toggle-touch-controls',()=>this.setEnabled(!this.enabled));
  window.addEventListener('blur',()=>this.reset());window.addEventListener('resize',()=>this.reset());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});this.setEnabled(this.enabled,false);
 }
 setEnabled(value,persist=true){this.enabled=value;this.game.touchEnabled=value;document.documentElement.classList.toggle('touch-mode',value);if(persist)try{localStorage.setItem('burgen-touch',value?'on':'off');}catch{}this.reset();}
 move(e){const r=this.stick.getBoundingClientRect(),v=stickVector(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2,Math.min(r.width,r.height)*.33);this.vector={x:v.x+v.y,y:v.y-v.x};this.knob.style.transform=`translate(${v.knobX}px,${v.knobY}px)`;this.stick.classList.toggle('pressed',!!(v.x||v.y));}
 clearStick(){const id=this.stickId;this.stickId=null;this.vector={x:0,y:0};this.knob.style.transform='translate(0px,0px)';this.stick.classList.remove('pressed');if(id!==null&&this.stick.hasPointerCapture(id))this.stick.releasePointerCapture(id);}
 perform(action){const g=this.game;if(action==='attack'){this.attack=true;g.input.aim=touchAim(g,this.vector);g.input.attack=true;if(!this.block)g.attack();}else if(action==='block'){this.block=true;g.input.block=true;g.input.aim=touchAim(g,this.vector);g.player.face={...g.input.aim};const n=Math.hypot(g.player.face.x,g.player.face.y)||1;g.player.face.x/=n;g.player.face.y/=n;}else if(action==='dodge'){g.input.x=this.vector.x;g.input.y=this.vector.y;g.dodge();}else g.interact();}
 release(id){const entry=this.pointers.get(id);if(!entry)return;this.pointers.delete(id);const {action,button}=entry;const stillHeld=[...this.pointers.values()].some(p=>p.action===action);if(!stillHeld){button.classList.remove('pressed');if(action==='attack'||action==='block'){this[action]=false;this.game.input[action]=false;}}if(button.hasPointerCapture(id))button.releasePointerCapture(id);}
 reset(){this.clearStick();for(const id of [...this.pointers.keys()])this.release(id);this.attack=false;this.block=false;this.game.input.attack=false;this.game.input.block=false;}
 update(dt){const g=this.game,visible=this.enabled&&g.mode==='play';if(this.root.hidden===visible){this.root.hidden=!visible;if(!visible)this.reset();}if(!visible)return;this.tick+=dt;if(this.tick<.1)return;this.tick=0;const it=g.interaction(),label=it?({gate:'Tor',chest:'Truhe',drop:'Beute',princess:'Befreien'}[it.kind]):'Aktion';this.buttons.interact.disabled=!it;this.buttons.interact.querySelector('small').textContent=label;this.buttons.interact.setAttribute('aria-label',it?.label||'Interagieren');this.context.textContent=it?.label||'';this.buttons.dodge.disabled=g.player.stamina<24||g.player.roll>0;this.buttons.block.disabled=g.stats.kind==='bow';}
}
