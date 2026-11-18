// Routes are world coordinates; room links form a separate graph for each castle.
export const CAMPAIGN = [
 null,null,
 {castle:'Nebelwacht',land:'Nebelmoor',base:1,color:'#a4cf91',symbol:'Laterne',out:[[13,37],[22,16],[41,25]],clues:['Die Laterne am Damm'],rooms:[[7,19],[24,29],[21,12]],links:['01','02','13','23','34'],gates:[[45,12],[40,9]],tip:'Zwei Stege führen von der Vorburg zur Moorhexe.'},
 {castle:'Glutwall',land:'Der Köhlerpass',base:2,color:'#ff9655',symbol:'Kohlenkorb',out:[[24,47],[15,28],[35,20]],clues:['Der rauchende Meiler','Die erloschene Esse'],rooms:[[20,35],[10,15],[25,18]],links:['01','12','23','34'],gates:[[45,10],[38,8]],tip:'Durch die Giesserei führt ein Schlackenkanal in die Schmiede.'},
 {castle:'Weisse Wacht',land:'Der Frostsee',base:3,color:'#a6edff',symbol:'Kristall',out:[[10,26],[32,34],[38,15]],clues:['Der vereiste Turm','Der Aussichtsfelsen'],rooms:[[5,13],[20,9],[23,30]],links:['01','12','23','34'],gates:[[45,9],[48,21]],tip:'Folge der Galerie um den Innenhof zur Eisbrücke.'},
 {castle:'Dornenfeste',land:'Das Dornendickicht',base:4,color:'#b7ce74',symbol:'Ranke',out:[[22,39],[12,15],[35,29]],clues:['Frische Schnittspuren','Der Wachposten'],rooms:[[17,26],[5,11],[22,8]],links:['01','12','23','13','34'],gates:[[43,10],[46,28]],tip:'Hinter dem Burggarten zweigen zwei Gassen zum Thronsaal ab.'},
 {castle:'Klippenwacht',land:'Die Sturmküste',base:2,color:'#8cdad9',symbol:'Feuerkorb',out:[[12,31],[33,41],[26,18]],clues:['Das erste Signalfeuer','Die Windfahne','Das letzte Signal'],rooms:[[22,35],[33,24],[16,15]],links:['01','12','23','34'],gates:[[43,13],[38,7]],tip:'Über die versetzten Rampen erreichst du die offene Bastion.'},
 {castle:'Glockengruft',land:'Die versunkene Abtei',base:1,color:'#e4bb73',symbol:'Glocke',out:[[18,40],[12,18],[29,30]],clues:['Der erste Glockenstuhl','Die geborstene Glocke','Das Grabgeläut'],rooms:[[4,13],[29,28],[18,18]],links:['03','31','32','34'],gates:[[45,15],[39,9]],tip:'Läute beide Kapellenglocken, damit sich die Krypta öffnet.',switches:['Westglocke','Ostglocke']},
 {castle:'Spiegelfeste',land:'Der silberne Steinbruch',base:3,color:'#cbc9ff',symbol:'Spiegel',out:[[30,43],[18,28],[33,11]],clues:['Der blinde Spiegel','Der gespaltene Quarz','Der Silberstein'],rooms:[[5,17],[25,35],[24,16]],links:['01','02','13','23','34'],gates:[[46,12],[49,27]],tip:'Beide Spiegelflügel treffen sich im verborgenen Quergang.'},
 {castle:'Schwarze Schleuse',land:'Das trockene Flussbett',base:1,color:'#87b9ab',symbol:'Schleuse',out:[[13,24],[30,40],[25,14],[39,23]],clues:['Die alte Pegelmarke','Das Wehr','Das Überlaufrohr','Der Wartungsschacht'],rooms:[[13,23],[29,33],[23,12]],links:['01','12','13','34'],gates:[[46,14],[38,8]],tip:'Öffne die beiden Schützen. Das Wasser im Zugang zum Kettenvogt sinkt.',switches:['Unteres Schütz','Oberes Schütz']},
 {castle:'Aschenkrone',land:'Das verbrannte Tal',base:5,color:'#ff955e',symbol:'Standarte',out:[[20,45],[11,26],[31,34],[32,13]],clues:['Der gefallene Vorposten','Die verkohlte Standarte','Das Belagerungslager','Der Breschenplan'],rooms:[[8,15],[31,28],[19,13]],links:['01','02','13','23','34'],gates:[[45,11],[49,23]],tip:'Beide Breschen führen durch den Belagerungsring zum letzten Thron.'}
];
export const CAMPAIGN_BOSSES=[0,0,1,2,3,4,6,7,8,9,5];
export function chapterSpec(ch){return CAMPAIGN[ch];}
export function nextMark(w){return w?.marks?.find(m=>!m.done);}
export function markHint(w,p){
 const m=nextMark(w);if(!m)return '';
 const dx=m.x-p.x,dy=m.y-p.y;
 if(Math.hypot(dx,dy)<3)return m.label+' · hier untersuchen';
 const angle=Math.atan2((dx+dy)/2,dx-dy);
 const headings=['rechts','rechts unten','unten','links unten','links','links oben','oben','rechts oben'];
 const side=headings[(Math.round(angle/(Math.PI/4))+8)%8];
 return m.label+' · '+side;
}
export function sealArena(w){
 if(!w.seal?.length)return;
 for(const s of w.seal)w.grid[s.y][s.x]=w.chapter===9?2:1;
}
export function unlockArena(w){
 for(const s of w.seal||[])w.grid[s.y][s.x]=s.tile;
 w.unsealed=true;
}
