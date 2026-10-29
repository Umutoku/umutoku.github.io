import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import './prepare.mjs';

const root = fileURLToPath(new URL('../',import.meta.url));
const source = path.join(root,'src','Portfolio.Web','wwwroot');
const output = path.join(root,'artifacts','site');
await mkdir(output,{recursive:true});
// Explicit public allowlist. Never copy the workspace or research notes.
for(const entry of ['index.html','tr.html','credentials.html','credentials-tr.html','robots.txt','sitemap.xml','llms.txt','styles','scripts','fonts','assets','data','documents']) {
  await cp(path.join(source,entry),path.join(output,entry),{recursive:true});
}
const home = await readFile(path.join(output,'index.html'),'utf8');
if(!home.includes('data-runtime="static"')) throw new Error('Static runtime marker missing.');
await writeFile(path.join(output,'.nojekyll'),'');
await writeFile(path.join(output,'404.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Umut Oku</title></head><body><h1>Page not found</h1><p>This address does not exist. Return to the portfolio homepage using your browser’s back button.</p></body></html>');
console.log(`Static portfolio exported to ${output}`);
