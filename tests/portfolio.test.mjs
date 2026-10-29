import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { uiLabels, languageAction } from '../src/Portfolio.Web/wwwroot/scripts/ui-labels.js';
import { domainLinks } from '../src/Portfolio.Web/wwwroot/scripts/domain-links.js';
import { decisions, newDecisionSession, chooseDecision, advanceDecision } from '../src/Portfolio.Web/wwwroot/scripts/decision-data.js';

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

test('decision journey cannot skip unanswered rounds or accept another rounds choice', () => {
  const initial = newDecisionSession();
  assert.deepEqual(advanceDecision(initial), initial);
  assert.deepEqual(chooseDecision(initial, 'deduplicate'), initial);
  const second = advanceDecision(chooseDecision(initial, 'trace'));
  assert.equal(second.index, 1);
  assert.deepEqual(advanceDecision(second), second);
  assert.deepEqual(chooseDecision(second, 'trace'), second);
});

test('all 27 decision routes finish with exactly three choices and do not advance twice', () => {
  for (const first of decisions[0].choices) for (const second of decisions[1].choices) for (const third of decisions[2].choices) {
    let state = newDecisionSession();
    for (const choice of [first, second, third]) state = advanceDecision(chooseDecision(state, choice.id));
    assert.equal(state.complete, true);
    assert.deepEqual(state.answers, [first.id, second.id, third.id]);
    assert.deepEqual(advanceDecision(state), state);
    assert.deepEqual(chooseDecision(state, first.id), state);
  }
});

test('exploring an alternative replaces only the current decision; replay starts empty', () => {
  let state = advanceDecision(chooseDecision(newDecisionSession(), 'trace'));
  state = chooseDecision(chooseDecision(state, 'forever'), 'coalesce');
  assert.deepEqual(state.answers, ['trace', 'coalesce']);
  assert.equal(state.complete, false);
  assert.deepEqual(newDecisionSession(), { index: 0, answers: [], complete: false });
});

test('every choice has bilingual consequences and an illustrative three-step result', () => {
  const bilingual = value => { for (const lang of ['en', 'tr']) assert.ok(value[lang]?.trim()); };
  for (const round of decisions) {
    [round.label, round.title, round.situation, round.question, round.signal, ...round.before].forEach(bilingual);
    assert.equal(round.choices.length, 3);
    assert.equal(new Set(round.choices.map(choice => choice.id)).size, 3);
    for (const choice of round.choices) {
      assert.equal(choice.after.length, 3);
      [choice.label, choice.title, choice.explanation, ...choice.after].forEach(bilingual);
    }
  }
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

test('first-load accessibility labels use the document language before JavaScript',async () => {
  for(const [file,language] of [['index.html','en'],['tr.html','tr']]) {
    const page=await readFile(path.join(publicDir,file),'utf8');
    for(const [,key,label] of page.matchAll(/data-i18n-aria="([^"]+)" aria-label="([^"]*)"/g)) {
      assert.equal(label,uiLabels[key][language],`${file}: ${key}`);
    }
    assert.ok(page.includes(`aria-label="${languageAction[language]}"`));
    assert.doesNotMatch(page, /class="identity"[^>]*aria-label=/);
  }
});

test('every domain and toolkit link resolves to an anonymous, available work example',async () => {
  const knowledge=JSON.parse(await readFile(path.join(publicDir,'data','knowledge.json'),'utf8'));
  for(const item of [...Object.values(domainLinks),...knowledge.tracks.filter(x=>x.caseId)]) {
    assert.ok(html.includes(`id="${item.caseId}"`),item.caseId);
  }
  assert.equal(knowledge.tracks.find(x=>x.id==='ai').scope,'personal');
  assert.equal([...html.matchAll(/class="case case-featured"/g)].length,3);
  const cases=[...html.matchAll(/<details class="case[^>]*>[\s\S]*?<\/details>/g)].map(x=>x[0]).join('');
  assert.doesNotMatch(cases,/Özdisan|Iyzico|Garanti|Param POS|KoçDigital/i);
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
