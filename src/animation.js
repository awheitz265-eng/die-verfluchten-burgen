// Rendering-only animation selection; combat timings remain authoritative.
// Walk cycles are driven by the distance actually covered (STRIDE frames per tile), so feet do not slide.
export const STRIDE=4.8;
export function heroFrame(player,stats,input,time){
 const prefix='hero-'+(stats.kind||'sword');
 if(player.hurt>0)return prefix+'-hit-'+Math.min(2,Math.floor((.22-player.hurt)/.08));
 if(input.block&&stats.kind!=='bow')return prefix+'-block-0';
 // Damage happens when the input fires: begin with the contact pose, then recover.
 if(player.cooldown>0){const progress=1-player.cooldown/stats.weapon.cooldown;return prefix+'-attack-'+Math.min(7,4+Math.floor(progress*4));}
 return prefix+(player.moving?'-walk-'+(Math.floor((player.step||0)*STRIDE)%12):'-idle-'+(Math.floor(time*4)%8));
}
export function enemyFrame(enemy,time,moving,step){
 const prefix=enemy.type;
 if(enemy.hit>0)return prefix+'-hit-'+Math.min(2,Math.floor((.16-enemy.hit)/.054));
 if(enemy.state==='windup'){const duration=enemy.windup||(enemy.boss?1.15:['archer','mage'].includes(enemy.type)?.7:enemy.type==='knight'?.95:.55);return prefix+'-attack-'+Math.min(3,Math.max(0,Math.floor((1-enemy.timer/duration)*4)));}
 if(enemy.state==='recover'){const total=enemy.recoverTotal||(enemy.boss?1.6:enemy.type==='knight'?1.8:1.1),elapsed=total-enemy.cooldown;if(elapsed<.32)return prefix+'-attack-'+Math.min(7,4+Math.max(0,Math.floor(elapsed/.08)));}
 if(enemy.state==='charge'||enemy.state==='leap')return prefix+'-attack-4';
 if(enemy.state==='channel')return prefix+'-attack-'+(3+Math.floor(time*8)%2);
 const walk=step===undefined?Math.floor(time*15+enemy.x*2):Math.floor(step*STRIDE);
 return prefix+(moving?'-walk-'+(walk%12):'-idle-'+(Math.floor(time*4+enemy.x*3)%8));
}
// Death: 6 collapse frames over .42 s, then the renderer tips the last frame over and fades it.
export function deathFrame(enemy,since){return enemy.type+'-die-'+Math.min(5,Math.floor(since/.07));}
