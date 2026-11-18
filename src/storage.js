export const SAVE_KEY=globalThis.FALKENSTEIN_PREVIEW?'cursed-kingdoms-falkenstein-preview':'cursed-kingdoms-v1';
export function encode(state){return JSON.stringify({version:1,savedAt:new Date().toISOString(),state});}
export function decode(text){
 const fail=()=>{throw new Error('Dieser Spielstand ist beschädigt oder hat ein unbekanntes Format.');};
 if(typeof text!=='string'||text.length>3000000)fail();const data=JSON.parse(text),s=data.state;
 const num=(v,min=0,max=1e12)=>Number.isFinite(v)&&v>=min&&v<=max,arr=(v,max)=>Array.isArray(v)&&v.length<=max;
 if(data.version!==1||!s?.player||!Number.isInteger(s.chapter)||!num(s.chapter,1)||!['outside','inside'].includes(s.area)||!num(s.seed)||!num(s.random)||!num(s.nextId,1)||!num(s.rescued)||!s.worlds)fail();
 if(s.potionPurchases===undefined)s.potionPurchases=0;
 if(!Number.isSafeInteger(s.potionPurchases)||!num(s.potionPurchases,0,7))fail();
 const slots=['weapon','offhand','helmet','chest','gloves','boots'],kinds=['sword','greatsword','axe','spear','bow',...slots];
 const item=i=>{if(!i||typeof i.id!=='string'||!/^[-\w]{1,96}$/.test(i.id)||typeof i.name!=='string'||i.name.length>150||!slots.includes(i.slot)||!kinds.includes(i.kind)||!Number.isInteger(i.rarity)||!num(i.rarity,0,4)||!num(i.damage)||!num(i.defence)||!num(i.value)||!num(i.crit,0,1)||!num(i.speed,0,20))fail();};
 const p=s.player;if(!['x','y','hp','stamina','level','xp','gold','potions'].every(k=>num(p[k]))||p.level<1||!arr(p.inventory,80)||!p.equipment||!p.face||!num(p.face.x,-1,1)||!num(p.face.y,-1,1)||!num(p.radius,0,.5))fail();
 p.inventory.forEach(item);for(const slot of slots)if(p.equipment[slot])item(p.equipment[slot]);if(!arr(s.shop,100))fail();s.shop.forEach(item);
 for(const area of ['outside','inside']){const w=s.worlds[area];if(!w||!Number.isInteger(w.w)||!Number.isInteger(w.h)||!num(w.w,3,64)||!num(w.h,3,64)||!arr(w.grid,64)||w.grid.length!==w.h||!num(w.seed)||!num(w.chapter,1))fail();for(const row of w.grid)if(!arr(row,64)||row.length!==w.w||!row.every(v=>[0,1,2,3,4].includes(v)))fail();const pos=o=>{if(!o||!num(o.x,0,w.w-1)||!num(o.y,0,w.h-1))fail();};pos(w.start);pos(w.exit);if(w.campaign){if(!Number.isInteger(w.chapter)||w.chapter<2||w.chapter>10||!arr(w.marks,4))fail();for(const m of w.marks){pos(m);if(typeof m.label!=='string'||m.label.length>80||typeof m.done!=='boolean')fail();}if(w.seal){if(!arr(w.seal,100))fail();for(const t of w.seal){pos(t);if(!Number.isInteger(t.x)||!Number.isInteger(t.y)||![0,3].includes(t.tile))fail();}}}if(w.falkenstein&&!w.inside){pos(w.sign);pos(w.ford);}if(w.princess)pos(w.princess);for(const list of ['decor','enemies','drops','chests','traps','explored'])if(!arr(w[list],5000))fail();for(const d of w.drops){pos(d);if(d.item)item(d.item);}for(const e of w.enemies){pos(e);if(!['bandit','archer','skeleton','knight','mage','brute','assassin','cultist','boss0','boss1','boss2','boss3','boss4','boss5','boss6','boss7','boss8','boss9'].includes(e.type)||!['hp','maxHp','damage','speed','armour','radius'].every(k=>num(e[k])))fail();}w.chests.forEach(pos);w.traps.forEach(pos);}
 if(!s.settings||!num(s.settings.music,0,1)||!num(s.settings.sfx,0,1)||!['high','low'].includes(s.settings.quality))fail();
 // Saves from before the difficulty setting existed continue on "normal".
 if(s.settings.difficulty===undefined)s.settings.difficulty='normal';else if(!['leicht','normal','schwer','albtraum'].includes(s.settings.difficulty))fail();const w=s.worlds[s.area];if(p.x>=w.w||p.y>=w.h)fail();return s;
}
export function save(state,storage=globalThis.localStorage){try{storage.setItem(SAVE_KEY,encode(state));return true;}catch{return false;}}
export function load(storage=globalThis.localStorage){try{const text=storage.getItem(SAVE_KEY);return text?decode(text):null;}catch{return null;}}
