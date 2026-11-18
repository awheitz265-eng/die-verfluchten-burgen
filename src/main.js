import {Game,advanceGame} from './game.js';
import {Renderer} from './render.js';
import {AudioEngine} from './audio.js';
import {UI} from './ui.js';
import {TouchControls,touchAim} from './touch.js';
const game=new Game(),audio=new AudioEngine(),renderer=new Renderer(document.getElementById('world'),game),touch=new TouchControls(game,audio),ui=new UI(game,renderer,audio);
const keys=new Set();let pointer={x:innerWidth*.6,y:innerHeight*.5},last=performance.now(),footstep=0,mouseAttack=false,mouseBlock=false;
game.onEvent=(type,data)=>{audio.sound(type);if(type==='hurt')renderer.shake=5;if(type==='slam')renderer.shake=Math.max(renderer.shake,7);if(type==='ui'||type==='start'){if(game.mode!=='play'){touch.reset();keys.clear();mouseAttack=mouseBlock=false;}ui.render();}if(type==='saved')document.getElementById('save-status').textContent=data.ok?'Lokal gespeichert':'Speichern nicht möglich';};
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const k=e.key.toLowerCase();if([' ','w','a','s','d','e','q','i','c','m','escape'].includes(k))e.preventDefault();keys.add(k);if(e.repeat)return;audio.start();if(k==='escape'){if(game.mode==='help'){game.mode=ui.helpFrom;ui.render();}else game.toggle('pause');}if(k==='i')game.toggle('inventory');if(k==='c')game.toggle('character');if(k==='m')game.toggle('map');if(k==='e')game.interact();if(k==='q')game.heal();if(k===' ')game.dodge();});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')pointer={x:e.clientX,y:e.clientY};});
const canvas=document.getElementById('world');canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||game.mode!=='play')return;audio.start();pointer={x:e.clientX,y:e.clientY};if(e.button===0)mouseAttack=true;if(e.button===2)mouseBlock=true;canvas.focus();});window.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')return;if(e.button===0)mouseAttack=false;if(e.button===2)mouseBlock=false;});canvas.addEventListener('contextmenu',e=>e.preventDefault());window.addEventListener('pointercancel',()=>{mouseAttack=mouseBlock=false;});
function blur(){keys.clear();mouseAttack=mouseBlock=false;touch.reset();if(game.mode==='play'){game.mode='pause';game.persist();ui.render();}}
window.addEventListener('blur',blur);document.addEventListener('visibilitychange',()=>{last=performance.now();nextFrame=0;if(document.hidden)blur();});window.addEventListener('beforeunload',()=>game.persist());
const fpsText=document.getElementById('fps');
let sampleStart=null,sampleFrames=0;
let nextFrame=0,mobileRate=60,slowTime=0,fastTime=0;
function frame(now){
 if(renderer.mobile){const interval=1000/(game.mode==='play'?mobileRate:15);if(now+.5<nextFrame){requestAnimationFrame(frame);return;}nextFrame=now+interval-Math.max(0,(now-nextFrame)%interval);}
 const showFps=game.mode==='play'&&game.state?.settings.showFps===1;
 if(showFps){
  if(sampleStart===null){sampleStart=now;sampleFrames=0;fpsText.textContent='';}
  else if(++sampleFrames&&now-sampleStart>=1000){
   fpsText.textContent=Math.round(sampleFrames*1000/(now-sampleStart))+' FPS';sampleStart=now;sampleFrames=0;
  }
 }else sampleStart=null;
 if(fpsText.hidden===showFps)fpsText.hidden=!showFps;
 const dt=Math.min((now-last)/1000,.2);last=now;touch.update(dt);const sx=(keys.has('d')?1:0)-(keys.has('a')?1:0),sy=(keys.has('s')?1:0)-(keys.has('w')?1:0),keyboard=sx||sy;game.input.x=keyboard?sx+sy:touch.vector.x;game.input.y=keyboard?sy-sx:touch.vector.y;game.input.attack=mouseAttack||touch.attack;game.input.block=mouseBlock||touch.block;if(game.player){if(touch.enabled&&!mouseAttack&&!mouseBlock){if(touch.attack||touch.block)game.input.aim=touchAim(game,touch.vector);else{game.bowTarget=null;game.input.aim=touch.vector.x||touch.vector.y?touch.vector:game.player.face;}}else{game.input.aim=renderer.pointerAim(pointer);}}advanceGame(game,dt);renderer.draw(dt);ui.update(dt);if(game.player?.moving&&game.mode==='play'){footstep+=dt;if(footstep>.32){audio.sound('step',game.world.inside);footstep=0;}}if(renderer.mobile&&game.mode==='play'){
  const cost=performance.now()-now;
  if(mobileRate===60){
   slowTime=dt>.024||cost>19?slowTime+dt:Math.max(0,slowTime-dt*.5);
   if(slowTime>.65){mobileRate=30;fastTime=0;slowTime=0;}
  }else{
   fastTime=cost<10&&dt<.040?fastTime+dt:0;
   if(fastTime>5){mobileRate=60;fastTime=0;slowTime=0;}
  }
 }
 requestAnimationFrame(frame);}
window.addEventListener('error',e=>{const f=document.getElementById('fatal');f.hidden=false;f.textContent='Das Spiel wurde durch einen Fehler unterbrochen: '+e.message+'. Lade die Seite neu, um den letzten gespeicherten Stand fortzusetzen.';});
requestAnimationFrame(frame);
