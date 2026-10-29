import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../',import.meta.url));
const web = path.join(root,'src','Portfolio.Web');
const publicDir = path.join(web,'wwwroot');
const html = await readFile(path.join(publicDir,'index.html'),'utf8');
const traces = JSON.parse(await readFile(path.join(publicDir,'data','traces.json'),'utf8'));
let server;
let base;
before(async () => {
  const assembly = path.join(web,'bin',process.env.BUILD_CONFIGURATION || 'Release','net10.0','Portfolio.Web.dll');
  server = spawn('dotnet',[assembly,'--urls','http://127.0.0.1:0'],{cwd:web,env:{...process.env,ASPNETCORE_ENVIRONMENT:'Testing'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  base = await new Promise((resolve,reject) => {
    const timeout = setTimeout(() => reject(new Error('Test server did not start in 20 seconds')),20000);
    let output = '';
    server.stdout.on('data',data => { output += data.toString(); const match=output.match(/Now listening on: (http:\/\/127\.0\.0\.1:\d+)/); if(match) { clearTimeout(timeout); resolve(match[1]); } });
    server.on('error',error => { clearTimeout(timeout); reject(error); });
    server.on('exit',code => { clearTimeout(timeout); reject(new Error(`Test server exited: ${code}`)); });
    server.stderr.on('data',data => { output += data.toString(); });
  });
});
after(() => server?.kill());

test('home serves the .NET runtime and a self-contained content policy',async () => {
  const response=await fetch(base);
  assert.equal(response.status,200);
  assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  assert.match(await response.text(),/data-runtime="api"/);
});
test('API and static export share exactly the same scenario data',async () => {
  for(const id of Object.keys(traces)) {
    const response=await fetch(`${base}/api/traces/${id}`);
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),traces[id]);
    assert.equal(traces[id].illustrative,true);
  }
});
test('unknown scenarios and routes return honest 404 problem responses',async () => {
  for(const route of ['/api/traces/not-a-scenario','/does-not-exist']) {
    const response=await fetch(base+route);
    assert.equal(response.status,404);
    assert.match(response.headers.get('content-type'),/application\/problem\+json/);
    assert.equal((await response.json()).status,404);
  }
});
test('timeout never produces a confirmed payment or downstream write',() => {
  const states=traces.timeout.steps.map(step=>step.state);
  assert.ok(states.includes('unknown'));
  assert.ok(states.includes('checking'));
  assert.equal(states.at(-1),'held');
  assert.ok(!states.includes('confirmed'));
  assert.ok(!states.includes('recorded'));
});
test('redelivery checks completion before acknowledgement',() => {
  assert.deepEqual(traces.duplicate.steps.map(step=>step.state),['received','checking','completed','acknowledged']);
});

test('cache miss reads the source before populating Redis',() => {
  assert.deepEqual(traces.cache.steps.map(step=>step.state),['requested','miss','read','populated','returned']);
  assert.equal(traces.cache.steps[2].node,'database');
});

test('search lag keeps database commit and index reconciliation distinct',() => {
  assert.equal(traces.search.steps[0].state,'committed');
  assert.equal(traces.search.steps[2].state,'stale');
  assert.equal(traces.search.steps.at(-1).state,'reconciled');
});
test('every translatable element has Turkish copy',async () => {
  const translations=JSON.parse(await readFile(path.join(publicDir,'data','tr.json'),'utf8'));
  const keys=[...html.matchAll(/data-i18n="([^"]+)"/g)].map(match=>match[1]);
  for(const key of keys) assert.ok(translations[key]?.trim(),`Missing translation: ${key}`);
});
test('local links and resources work under a GitHub project subpath',async () => {
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
  for(const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if(link.startsWith('#')) { assert.ok(ids.has(link.slice(1)),`Missing anchor: ${link}`); continue; }
    if(/^(https:|mailto:)/.test(link)) continue;
    assert.ok(!link.startsWith('/'),`Root-relative URL breaks project Pages: ${link}`);
    const response=await fetch(`${base}/${link}`);
    assert.equal(response.status,200,`Missing resource: ${link}`);
    const resolved = new URL(link,'https://example.com/portfolio/');
    assert.ok(resolved.pathname.startsWith('/portfolio/'));
  }
});
test('private working notes and employer source are absent from public assets',async () => {
  async function inspect(folder) {
    for(const entry of await readdir(folder,{withFileTypes:true})) {
      const file=path.join(folder,entry.name);
      if(entry.isDirectory()) { if(!entry.name.startsWith('.')) await inspect(file); continue; }
      if(!/\.(html|css|js|json)$/.test(entry.name)) continue;
      const content=await readFile(file,'utf8');
      assert.doesNotMatch(content,/ozdbt\.atlassian|ECNWDV-\d|172\.(16|30)\.|reposOzdisan|ozdisan\.domain/i,file);
    }
  }
  await inspect(publicDir);
});
test('CV download is a nonempty PDF',async () => {
  const response=await fetch(`${base}/documents/Umut-Oku-CV.pdf`);
  assert.match(response.headers.get('content-type'),/application\/pdf/);
  const data=Buffer.from(await response.arrayBuffer());
  assert.equal(data.subarray(0,5).toString(),'%PDF-');
  assert.ok(data.length>10000);
});

test('English and Turkish pages are indexable without JavaScript',async () => {
  const turkish=await readFile(path.join(publicDir,'tr.html'),'utf8');
  assert.match(turkish,/<html lang="tr"/);
  assert.match(turkish,/Birçok servis/);
  assert.match(turkish,/hreflang="en"/);
  for(const page of [html,turkish]) {
    assert.match(page,/rel="canonical"/);
    const schema=JSON.parse(page.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema.mainEntity.name,'Umut Oku');
    assert.equal(schema['@type'],'ProfilePage');
  }
});

test('all 47 credential records have source links and server-rendered entries',async () => {
  const data=JSON.parse(await readFile(path.join(publicDir,'data','credentials.json'),'utf8'));
  assert.equal(data.credentials.length,47);
  assert.equal(new Set(data.credentials.map(item=>item.url)).size,47);
  for(const item of data.credentials) {
    assert.equal(new URL(item.url).protocol,'https:');
    assert.ok(item.title && item.issuer);
    if(item.issued) assert.match(item.issued,/^\d{4}-\d{2}$/);
  }
  for(const name of ['credentials.html','credentials-tr.html']) {
    const page=await readFile(path.join(publicDir,name),'utf8');
    assert.equal([...page.matchAll(/class="credential-row"/g)].length,47);
  }
});
