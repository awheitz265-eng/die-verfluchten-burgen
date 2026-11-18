// Original eight-bar cues. Notes are scale degrees; a dash is an intentional rest.
const SCORES={
 meadow:{bpm:100,root:60,scale:[0,2,4,7,9],chords:[0,3,4,1,0,2,3,0],
  phrases:['0--24-2-','3-2-1---','2-46-4-2','1---0---'],voice:'triangle'},
 hall:{bpm:82,root:57,scale:[0,2,3,5,7,10],chords:[0,3,2,4,0,5,3,0],
  phrases:['4---2---','3-4--1--','6---5-3-','2--10---'],voice:'sine'},
 skirmish:{bpm:126,root:57,scale:[0,2,3,5,7],chords:[0,2,3,0,4,3,2,0],
  phrases:['0-2-3-2-','4--32-1-','3-4-6-4-','2-10--0-'],voice:'triangle'},
 boss:{bpm:138,root:50,scale:[0,1,3,5,7,8,10],chords:[0,4,5,1,0,3,1,0],
  phrases:['0-04-3-1','4-5--431','6-53-4-1','30--1-0-'],voice:'triangle'}
};
function pitch(score,degree,shift){
 const scale=score.scale;
 return 440*2**((score.root+shift+12*Math.floor(degree/scale.length)+scale[degree%scale.length]-69)/12);
}
const EFFECTS={
 swing:[185,58,.12],hit:[112,40,.14],hurt:[190,75,.23],coin:[880,1175,.12],bow:[630,145,.14],
 block:[480,180,.12],roll:[132,62,.17],door:[95,46,.35],chest:[392,523,.22],heal:[440,660,.32],
 levelup:[523,659,.24],rescue:[523,784,.3],bossdefeat:[294,392,.32],slam:[105,30,.39],
 summon:[196,370,.44],nova:[392,110,.33],blink:[800,270,.18],quest:[587,740,.23],rally:[155,80,.21]
};
export class AudioEngine{
 constructor(){this.context=null;this.music=.22;this.sfx=.5;this.scene='';this.step=0;this.nextNote=0;this.foot=0;this.voices=new Set();}
 start(){
  if(!this.context){
   const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return;
   this.context=new C();this.scoreBus=this.context.createGain();this.scoreBus.connect(this.context.destination);
  }
  if(this.context.state==='suspended')this.context.resume().catch(()=>{});
 }
 tone(freq,duration,volume,type='sine',delay=0,end=freq,music=false){
  const ctx=this.context;if(!ctx||ctx.state!=='running'||volume<=0||this.voices.size>=40)return;
  const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;
  o.frequency.setValueAtTime(freq,t);if(end!==freq)o.frequency.exponentialRampToValueAtTime(end,t+duration);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+Math.min(.018,duration/3));
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(music?this.scoreBus:ctx.destination);
  this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};
  o.start(t);o.stop(t+duration+.012);
 }
 sound(kind,inside=false){
  const v=this.sfx*.15;
  if(kind==='step'){const hz=(inside?149:97)+(this.foot++%2)*17;this.tone(hz,.065,v*.46,'triangle',0,47);return;}
  const fx=EFFECTS[kind];if(!fx)return;
  this.tone(fx[0],fx[2],v,kind==='coin'?'sine':'triangle',0,fx[1]);
  if(['chest','quest','levelup','rescue','bossdefeat'].includes(kind)){
   this.tone(fx[0]*1.25,.24,v*.8,'sine',.1);this.tone(fx[0]*1.5,.46,v*.72,'triangle',.22);
  }else if(kind==='block'||kind==='bow')this.tone(fx[0]*2.71,.09,v*.35,'sine',.012);
 }
 update(active,boss=false,inside=false,chapter=1,combat=false){
  const ctx=this.context;if(!ctx||ctx.state!=='running')return;
  const now=ctx.currentTime,volume=active?this.music:0;
  if(volume!==this.busVolume){this.scoreBus.gain.setTargetAtTime(volume,now,.06);this.busVolume=volume;}
  if(!volume){this.scene='';this.combatUntil=0;return;}
  if(combat)this.combatUntil=now+2.5;
  const scene=boss?'boss':now<(this.combatUntil||0)?'skirmish':inside?'hall':'meadow';
  const score=SCORES[scene],key=scene+chapter,beat=30/score.bpm;
  if(this.scene!==key){this.scene=key;this.step=0;this.nextNote=now+.025;}
  if(this.nextNote<now-.12)this.nextNote=now+.015;
  while(this.nextNote<now+.17){
   const bar=Math.floor(this.step/8),i=this.step%8,base=score.chords[bar%8],shift=[0,2,-2,5,-3][(chapter-1)%5];
   const phrase=score.phrases[(bar+(bar%8>=4?1:0))%4],note=phrase[i],delay=Math.max(0,this.nextNote-now);
   const play=(degree,oct,duration,v,type)=>this.tone(pitch(score,degree,shift)*oct,duration,v,type,delay,undefined,true);
   if(note!=='-')play(base+Number(note),1,beat*(phrase[i+1]==='-'?1.8:.9),.135,score.voice);
   if(i===0||i===4)play(base,i===0?.25:.5,beat*2.8,.12,'sine');
   if((i===2||i===6)&&scene!=='boss')play(base+(i===2?2:4),.5,beat*1.5,.055,'triangle');
   if((scene==='boss'||scene==='skirmish')&&(i%2===0||i===7&&bar%2))this.tone(i%4?156:95,.105,.105,'triangle',delay,45,true);
   if(bar%4===3&&i===6)play(base+4,2,beat*1.7,.046,'sine');
   this.nextNote+=beat;this.step++;
  }
 }
}
