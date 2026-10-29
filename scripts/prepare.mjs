import {readFile,writeFile} from 'node:fs/promises';
import credentials from './credentials-source.mjs';
import { uiLabels, languageAction } from '../src/Portfolio.Web/wwwroot/scripts/ui-labels.js';
const root = new URL('../src/Portfolio.Web/wwwroot/',import.meta.url);
const base = (process.env.SITE_URL || 'https://umutoku.github.io/').replace(/\/?$/,'/');
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const unesc = value => value.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
const tr = JSON.parse(await readFile(new URL('data/tr.json',root),'utf8'));
let html = await readFile(new URL('index.html',root),'utf8');
const knowledge = JSON.parse(await readFile(new URL('data/knowledge.json',root),'utf8'));
const label = (key, en, translated) => { tr[key] = translated; return `<span data-i18n="${key}">${esc(en)}</span>`; };
const tracks = knowledge.tracks.map(track => `<article class="knowledge-track"><h3>${label('track'+track.id,track.title.en,track.title.tr)}</h3><p class="track-label">${label(track.scope==='personal'?'personalPractice':'professionalPractice',track.scope==='personal'?'Personal projects':'Professional practice',track.scope==='personal'?'Kişisel çalışmalar':'İş deneyimi')}</p><p class="track-tools">${esc(track.applied)}</p><details class="track-learning"><summary>${label('continuedStudy','Further hands-on learning','Uygulamalı öğrenme')}</summary><p class="track-exploration">${esc(track.exploration)}</p></details>${track.caseId?`<a class="text-link" href="#${track.caseId}" data-work-link>${label('relatedWork','Explore related work','İlgili çalışmayı incele')}</a>`:''}</article>`).join('');
html = html.replace(/<div class="knowledge-map">[\s\S]*?<\/div><p class="knowledge-note"/,`<div class="knowledge-map">${tracks}</div><p class="knowledge-note"`);
function localizeAria(page, lang) {
 return page.replace(/data-i18n-aria="([^"]+)" aria-label="[^"]*"/g,(_,key)=>`data-i18n-aria="${key}" aria-label="${esc(uiLabels[key][lang])}"`);
}
html = localizeAria(html,'en');
const featured = [credentials[0],credentials[5],credentials[7]];
const card = item => `<a class="credential-feature" href="${esc(item.url)}" target="_blank" rel="noopener"><span>${esc(item.issuer)} / ${item.issued?.slice(0,4) || ''}</span><h3>${esc(item.title)}</h3><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg></a>`;
html=html.replace(/<div class="featured-credentials">[\s\S]*?<\/div>/,`<div class="featured-credentials">${featured.map(card).join('')}</div>`);
const en={};
function translate(page) { return page.replace(/(<([\w-]+)\b[^>]*data-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,(match,start,tag,key,content,end)=>{
 en[key]=unesc(content.replaceAll('<br>','\n'));
 if(!tr[key]) throw new Error(`Missing translation: ${key}`);
 return start+esc(tr[key]).replaceAll('\n','<br>')+end;
}); }
const pages=[{kind:'home',en:'index.html',tr:'tr.html'},{kind:'work',en:'work.html',tr:'work-tr.html'},{kind:'lab',en:'lab.html',tr:'lab-tr.html'}];
function seo(page,lang,file,kind='home') {
 const canonical = base+file;
 const titles={home:{en:'Umut Oku | .NET Backend Engineer',tr:'Umut Oku | .NET Backend Mühendisi'},work:{en:'Engineering work | Umut Oku',tr:'Mühendislik çalışmaları | Umut Oku'},lab:{en:'Systems workshop | Umut Oku',tr:'Sistem atölyesi | Umut Oku'}};
 const title=titles[kind][lang];
 const route=pages.find(item=>item.kind===kind);
 const description = lang==='tr'?'Umut Oku: .NET, mikroservis, Elasticsearch, PostgreSQL, Redis ve DevOps. Ürün, veri, ödeme ve dağıtık sistemler; projeler ve deneyim.':'Umut Oku: .NET and distributed systems engineer. Product, Elasticsearch, PostgreSQL, Redis, messaging, payments and DevOps. Projects, experience and a hands-on systems lab.';
 const schema={'@context':'https://schema.org','@type':'ProfilePage',mainEntity:{'@type':'Person',name:'Umut Oku',alternateName:'Umutoku',jobTitle:'Software Engineer',url:base,sameAs:['https://www.linkedin.com/in/umutoku/','https://github.com/Umutoku'],knowsAbout:['C#','ASP.NET Core','Microservices','Elasticsearch','PostgreSQL','Redis','Apache Kafka','RabbitMQ','CQRS','Payment systems','Docker','Kubernetes','Operational diagnostics','Retrieval-augmented generation']}};
 return page.replace(/\n\s*<!-- seo:start -->[\s\S]*?<!-- seo:end -->/,'').replace(/<title>.*?<\/title>/,`<title>${title}</title>`).replace(/<meta name="description"[^>]+>/,`<meta name="description" content="${esc(description)}">`).replace(/<meta property="og:title"[^>]+>/,`<meta property="og:title" content="${title}">`).replace(/<meta property="og:description"[^>]+>/,`<meta property="og:description" content="${esc(description)}">`).replace('</head>',`<!-- seo:start -->
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${base+(kind==='home'?'':route.en)}">
  <link rel="alternate" hreflang="tr" href="${base+route.tr}">
  <link rel="alternate" hreflang="x-default" href="${base+(kind==='home'?'':route.en)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${lang==='tr'?'tr_TR':'en_US'}">
  <meta property="og:image" content="${base}assets/social-preview.png">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="author" content="Umut Oku">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <!-- seo:end -->
</head>`);
}
for(const page of pages) {
 let english=page.kind==='home'?html:await readFile(new URL(page.en,root),'utf8');
 if(page.kind==='lab') english=english.replace(/<div class="knowledge-map">[\s\S]*?<\/div><p class="knowledge-note"/,`<div class="knowledge-map">${tracks.replaceAll('href="#work-','href="work.html#work-').replaceAll(' data-work-link','')}</div><p class="knowledge-note"`);
 english=localizeAria(english,'en');
 const translated=translate(english);
 await writeFile(new URL(page.en,root),seo(english,'en',page.kind==='home'?'':page.en,page.kind));
 const turkish=localizeAria(seo(translated,'tr',page.tr,page.kind),'tr').replace('<html lang="en"','<html lang="tr"').replace(`aria-label="${languageAction.en}" data-language>TR`,`aria-label="${languageAction.tr}" data-language>EN`).replace(/href="(index|work|lab|credentials)\.html([#?][^"]*)?"/g,(_,name,fragment='')=>`href="${name==='index'?'tr':name+'-tr'}.html${fragment}"`);
 await writeFile(new URL(page.tr,root),turkish);
}
await writeFile(new URL('data/tr.json',root),JSON.stringify(tr,null,2)+'\n');
await writeFile(new URL('data/en.json',root),JSON.stringify(en,null,2)+'\n');
await writeFile(new URL('data/credentials.json',root),JSON.stringify({source:'https://www.linkedin.com/in/umutoku/details/certifications/',captured:'2026-10-29',credentials},null,2)+'\n');
const categories=[...new Set(credentials.map(item=>item.category))];
const labelsTr={'Cloud & operations':'Bulut ve operasyon','AI & data':'Yapay zekâ ve veri','Distributed systems':'Dağıtık sistemler','Backend':'Backend'};
for(const lang of ['en','tr']) {
 const isTr=lang==='tr'; const filename=isTr?'credentials-tr.html':'credentials.html'; const home=isTr?'tr.html':'index.html';
 const label=(en,tr)=>isTr?tr:en;
 const rows=credentials.map(item=>`<li class="credential-row" data-category="${esc(item.category)}"><div><span class="credential-issuer">${esc(item.issuer)}</span><h2><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)}</a></h2><span class="credential-topic">${esc(isTr?labelsTr[item.category]:item.category)}</span></div><span class="credential-date">${item.issued?`<time datetime="${item.issued}">${new Intl.DateTimeFormat(isTr?'tr-TR':'en-GB',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(item.issued+'-01T00:00:00Z'))}</time>`:label('Date not listed','Tarih belirtilmemiş')}</span></li>`).join('\n');
 const page=`<!doctype html><html lang="${lang}" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#111518"><title>${label('Learning archive','Eğitim arşivi')} | Umut Oku</title><meta name="description" content="${label('Explore 47 courses, workshops and credentials from Umut Oku’s LinkedIn profile, with dates and source links.','Umut Oku’nun LinkedIn profilindeki 47 kurs, atölye ve sertifika. Tarih ve kaynak bağlantılarıyla arayın.')} "><link rel="canonical" href="${base+filename}"><link rel="alternate" hreflang="en" href="${base}credentials.html"><link rel="alternate" hreflang="tr" href="${base}credentials-tr.html"><link rel="icon" href="assets/favicon.svg"><link rel="stylesheet" href="styles/site.css"><script src="scripts/credentials.js" type="module"></script></head><body><a class="skip-link" href="#main">${label('Skip to content','İçeriğe geç')}</a><header class="site-header"><div class="container header-inner"><a class="identity" href="${home}"><span class="monogram" aria-hidden="true">u.</span><span>Umut Oku<span class="identity-role">${label('Learning archive','Eğitim arşivi')}</span></span></a><div class="header-actions"><a class="text-link" href="${home}#credentials">${label('Back to portfolio','Portföye dön')}</a><a class="button" href="${isTr?'credentials.html':'credentials-tr.html'}" lang="${isTr?'en':'tr'}">${isTr?'EN':'TR'}</a></div></div></header><main id="main" class="container credential-page"><h1>${label('A habit of<br>learning.','Öğrenme<br>alışkanlığı.')}</h1><p class="lead">${label('47 learning records. Courses, workshops and credentials, collected from my LinkedIn profile.','47 eğitim kaydı. LinkedIn profilimden kurslar, atölyeler ve sertifikalar.')}</p><div class="credential-controls"><div><label for="credential-search">${label('Search title or issuer','Başlık veya kurum ara')}</label><input id="credential-search" type="search" placeholder="${label('Try Elasticsearch, Azure or Kafka','Elasticsearch, Azure veya Kafka')}" autocomplete="off"></div><div><label for="credential-category">${label('Topic','Konu')}</label><select id="credential-category"><option value="all">${label('All topics','Tüm konular')}</option>${categories.map(category=>`<option value="${esc(category)}">${esc(isTr?labelsTr[category]:category)}</option>`).join('')}</select></div><button class="button" data-reset type="button">${label('Reset','Sıfırla')}</button></div><p class="credential-count" role="status" aria-live="polite" data-count>${label('47 records','47 kayıt')}</p><p data-empty hidden>${label('No matches. Try a different term or reset the filters.','Sonuç bulunamadı. Başka bir terim dene veya filtreleri sıfırla.')}</p><ul class="credential-list">${rows}</ul><p class="credential-source"><a href="https://www.linkedin.com/in/umutoku/details/certifications/" target="_blank" rel="noopener">${label("My learning records on LinkedIn","LinkedIn’deki eğitim kayıtlarım")}</a></p></main><footer class="site-footer container"><a href="${home}">Umut Oku</a><a href="mailto:umut.oku@gmail.com">umut.oku@gmail.com</a><span>© 2026</span></footer></body></html>`;
 await writeFile(new URL(filename,root),page);
}
await writeFile(new URL('robots.txt',root),`User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`);
await writeFile(new URL('llms.txt',root),`# Umut Oku\n\n> .NET backend and distributed systems engineer based in Istanbul, Türkiye.\n\nProfessional work spans product/catalog APIs, Elasticsearch search and indexing, PostgreSQL query projections, Redis caching, Kafka and RabbitMQ workflows, identity services, dashboards, background processing, payment integrations and operational diagnosis. Current employment: Software Engineer at Özdisan. Earlier employers include KoçDigital and iCredible; freelance work through Fiverr. Personal projects cover microservices, Semantic Kernel, LangChain, LangGraph and RAG. These learning projects are separate from employer systems.\n\n## Pages\n- [Portfolio in English](${base}): experience, selected contributions and a capability overview.\n- [Türkçe portföy](${base}tr.html): same profile in Turkish.\n- [Engineering work](${base}work.html): detailed contributions and engineering decisions.\n- [Mühendislik çalışmaları](${base}work-tr.html): engineering work in Turkish.\n- [Systems workshop](${base}lab.html): interactive decisions, failure scenarios and learning dashboard.\n- [Sistem atölyesi](${base}lab-tr.html): systems workshop in Turkish.\n- [Learning records](${base}credentials.html): 47 course, workshop and credential records, with original source links.\n- [CV](${base}documents/Umut-Oku-CV.pdf): concise professional history.\n\n## Identity\n- [LinkedIn](https://www.linkedin.com/in/umutoku/)\n- [GitHub](https://github.com/Umutoku)\n\n## Interpretation\nInteractive architecture and failure scenarios use sample data. The dashboard groups courses, workshops and credentials by topic; browser diagnostics show loading measurements for the current visit. Professional work, personal projects and learning records are labelled separately.\n`);
await writeFile(new URL('sitemap.xml',root),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','tr.html','work.html','work-tr.html','lab.html','lab-tr.html','credentials.html','credentials-tr.html'].map(file=>`<url><loc>${base+file}</loc></url>`).join('')}</urlset>\n`);
console.log(`Prepared EN/TR portfolio, 47 credentials and SEO for ${base}`);
await import('./check-public-copy.mjs');
