import {Game} from './game.js';
import {Renderer} from './render.js';
import {AudioEngine} from './audio.js';
import {UI} from './ui.js';
const game=new Game(),audio=new AudioEngine(),renderer=new Renderer(document.getElementById('world'),game),ui=new UI(game,renderer,audio);
const keys=new Set();let pointer={x:innerWidth*.6,y:innerHeight*.5},last=performance.now(),footstep=0;
game.onEvent=(type,data)=>{audio.sound(type);if(type==='hurt')renderer.shake=5;if(type==='ui'||type==='start')ui.render();if(type==='saved')document.getElementById('save-status').textContent=data.ok?'Lokal gespeichert':'Speichern nicht möglich';};
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const k=e.key.toLowerCase();if([' ','w','a','s','d','e','q','i','c','m','escape'].includes(k))e.preventDefault();keys.add(k);if(e.repeat)return;audio.start();if(k==='escape'){if(game.mode==='help'){game.mode=ui.helpFrom;ui.render();}else game.toggle('pause');}if(k==='i')game.toggle('inventory');if(k==='c')game.toggle('character');if(k==='m')game.toggle('map');if(k==='e')game.interact();if(k==='q')game.heal();if(k===' ')game.dodge();});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('mousemove',e=>pointer={x:e.clientX,y:e.clientY});
const canvas=document.getElementById('world');canvas.addEventListener('mousedown',e=>{audio.start();if(game.mode!=='play')return;if(e.button===0)game.input.attack=true;if(e.button===2)game.input.block=true;canvas.focus();});window.addEventListener('mouseup',e=>{if(e.button===0)game.input.attack=false;if(e.button===2)game.input.block=false;});canvas.addEventListener('contextmenu',e=>e.preventDefault());
function blur(){keys.clear();game.input.attack=false;game.input.block=false;if(game.mode==='play'){game.mode='pause';game.persist();ui.render();}}
window.addEventListener('blur',blur);document.addEventListener('visibilitychange',()=>{if(document.hidden)blur();});window.addEventListener('beforeunload',()=>game.persist());
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;const sx=(keys.has('d')?1:0)-(keys.has('a')?1:0),sy=(keys.has('s')?1:0)-(keys.has('w')?1:0);game.input.x=sx+sy;game.input.y=sy-sx;if(game.player){const a=renderer.unproject(pointer.x,pointer.y+28*renderer.zoom);game.input.aim={x:a.x-game.player.x,y:a.y-game.player.y};}game.update(dt);renderer.draw(dt);ui.update(dt);if(game.player?.moving&&game.mode==='play'){footstep+=dt;if(footstep>.32){audio.sound('step');footstep=0;}}requestAnimationFrame(frame);}
window.addEventListener('error',e=>{const f=document.getElementById('fatal');f.hidden=false;f.textContent='Das Spiel wurde durch einen Fehler unterbrochen: '+e.message+'. Lade die Seite neu, um den letzten gespeicherten Stand fortzusetzen.';});
requestAnimationFrame(frame);
