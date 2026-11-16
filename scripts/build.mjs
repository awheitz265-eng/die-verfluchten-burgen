import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const modules=['world','items','storage','art','forest-art','animation','game','audio','render','ui','touch','main'];
let code='"use strict";\n(()=>{\n';for(const mod of modules){let source=await readFile(path.join(root,'src',mod+'.js'),'utf8');source=source.replace(/^import\s+.*?;\r?\n/gm,'').replace(/^export\s+/gm,'');code+='\n// '+mod+'\n'+source+'\n';}code+='})();';
const css=await readFile(path.join(root,'src/style.css'),'utf8');let html=await readFile(path.join(root,'index.html'),'utf8');html=html.replace('<link rel="stylesheet" href="./src/style.css">','<style>'+css+'</style>').replace('<script type="module" src="./src/main.js"></script>','<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script>');await mkdir(path.join(root,'dist'),{recursive:true});await writeFile(path.join(root,'dist/index.html'),html);await writeFile(path.join(root,'dist/.nojekyll'),'');await writeFile(path.join(root,'dist/Die_verfluchten_Burgen.html'),html);console.log('Built standalone browser game: '+Buffer.byteLength(html)+' bytes; no network dependencies.');
