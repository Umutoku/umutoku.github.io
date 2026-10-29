import { initDashboard } from './dashboard.js';
const nodes = {
  product: { en:['Product','Catalog, categories and variants connect customer-facing APIs with Elasticsearch, Redis and PostgreSQL. I work across those boundaries.'],tr:['Ürün','Katalog, kategori ve varyantlar; müşteriye dönük API’leri Elasticsearch, Redis ve PostgreSQL ile birleştirir. Bu sınırlar arasında çalışıyorum.'] },
  search: { en:['Search','Elasticsearch indexing, category population, property matching and result counts. Search quality depends on the path from source data to the index.'],tr:['Arama','Elasticsearch indeksleme, kategori aktarımı, özellik eşleştirme ve sonuç sayıları. Arama kalitesi, kaynak veriden indekse uzanan akışa bağlıdır.'] },
  database: { en:['Data','PostgreSQL projections, query correctness and business records. Filtering, pagination and mapping must remain consistent as a query evolves.'],tr:['Veri','PostgreSQL projeksiyonları, sorgu doğruluğu ve iş kayıtları. Sorgu gelişirken filtreleme, sayfalama ve eşleme tutarlı kalmalı.'] },
  cache: { en:['Cache','Redis pre-checks, cache keys, warm-up and invalidation. The hard question is when a cached answer stops being the right answer.'],tr:['Cache','Redis ön kontrolleri, cache anahtarları, warm-up ve invalidation. Zor soru, önbellekteki yanıtın ne zaman doğru yanıt olmaktan çıktığıdır.'] },
  operations: { en:['Operations','Trace a problem across service logs, background jobs and container state. Docker, Kubernetes, Jenkins and the ELK ecosystem support the diagnosis.'],tr:['Operasyon','Sorunu servis logları, arka plan işleri ve konteyner durumu boyunca takip etmek. Docker, Kubernetes, Jenkins ve ELK ekosistemi teşhisi destekler.'] },
  client: { en: ['Client', 'A clear intent enters the system. Validation starts at the boundary.'], tr: ['İstemci', 'Sisteme açık bir talep gelir. Doğrulama, giriş noktasında başlar.'] },
  gateway: { en: ['Identity & APIs', 'Contracts, validation and permissions shape every service boundary. Work includes role handling, account workflows and streaming exports.'], tr: ['Kimlik ve API', 'Sözleşmeler, doğrulama ve yetkiler her servis sınırını şekillendirir. Rol yönetimi, hesap akışları ve streaming aktarımlar bu kapsamda.'] },
  payment: { en: ['Payment service', 'An explicit payment state. A provider response checked before the next step.'], tr: ['Ödeme servisi', 'Açık bir ödeme durumu. Sonraki adımdan önce doğrulanan sağlayıcı yanıtı.'] },
  events: { en: ['Event stream', 'Services react to confirmed changes. Consumers account for redelivery.'], tr: ['Olay akışı', 'Servisler doğrulanan değişikliklere tepki verir. Tekrar teslim dikkate alınır.'] },
  erp: { en: ['Order / ERP', 'Business records follow the payment outcome. Ambiguous results need reconciliation.'], tr: ['Sipariş / ERP', 'İş kayıtları ödeme sonucunu izler. Belirsiz sonuçlar mutabakat gerektirir.'] }
};
let language = document.documentElement.lang === 'tr' ? 'tr' : 'en';
let selectedNode = 'product';
function selectNode(key) {
  selectedNode = key;
  document.querySelectorAll('[data-node]').forEach(button => {
    const selected = button.dataset.node === key;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('[data-node-title]').textContent = nodes[key][language][0];
  document.querySelector('[data-node-description]').textContent = nodes[key][language][1];
}
document.querySelectorAll('[data-node]').forEach(button => button.addEventListener('click', () => selectNode(button.dataset.node)));
const menu = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menu.setAttribute('aria-expanded','false'); }
menu.addEventListener('click', () => { const open = mobileNav.hidden; mobileNav.hidden = !open; menu.setAttribute('aria-expanded', String(open)); });
mobileNav.addEventListener('click', event => { if(event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if(event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menu.focus(); } });
document.documentElement.classList.remove('no-js');
const copies = { [language]: Object.fromEntries([...document.querySelectorAll('[data-i18n]')].map(element => [element.dataset.i18n, [...element.childNodes].map(node => node.nodeName === 'BR' ? '\n' : node.textContent).join('')])) };
const languageButton = document.querySelector('[data-language]');
const text = (en, tr) => language === 'tr' ? tr : en;
function writeText(element, value) {
  element.replaceChildren(...value.split('\n').flatMap((line, index) => index ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
}
async function changeLanguage(next) {
  if (!copies[next]) {
    languageButton.disabled = true;
    try {
      const response = await fetch(new URL(`../data/${next}.json`, import.meta.url), { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Translation unavailable');
      copies[next] = await response.json();
    } catch {
      languageButton.textContent = next === 'tr' ? 'Retry TR' : 'Retry EN';
      languageButton.title = text('Translation could not load. Please retry.','Çeviri yüklenemedi. Yeniden deneyin.');
      return;
    } finally { languageButton.disabled = false; }
  }
  cancelPlayback();
  language = next;
  document.documentElement.lang = next;
  document.querySelectorAll('[data-i18n]').forEach(element => { if(copies[next][element.dataset.i18n]) writeText(element, copies[next][element.dataset.i18n]); });
  languageButton.textContent = next === 'en' ? 'TR' : 'EN';
  languageButton.setAttribute('aria-label', next === 'en' ? 'Türkçeye geç' : 'Switch to English');
  languageButton.removeAttribute('title');
  document.title = text('Umut Oku | .NET Backend Engineer', 'Umut Oku | .NET Backend Mühendisi');
  document.querySelector('meta[name="description"]').content = text('Umut Oku: .NET and distributed systems engineer. Product, Elasticsearch, PostgreSQL, Redis, messaging, payments and DevOps.', 'Umut Oku: .NET, mikroservis, Elasticsearch, PostgreSQL, Redis ve DevOps. Ürün, veri, ödeme ve dağıtık sistemler.');
  menu.setAttribute('aria-label', text('Open navigation', 'Menüyü aç'));
  document.querySelector('.desktop-nav').setAttribute('aria-label',text('Main navigation','Ana menü'));
  mobileNav.setAttribute('aria-label',text('Mobile navigation','Mobil menü'));
  document.querySelector('.work-filters').setAttribute('aria-label',text('Filter selected work','Çalışmaları filtrele'));
  document.querySelector('.scenario-choices').setAttribute('aria-label',text('Choose a demonstration scenario','Bir örnek senaryo seç'));
  document.querySelector('[data-credentials-link]').href = text('credentials.html','credentials-tr.html');
  selectNode(selectedNode);
  if (currentTrace) renderTrace(currentTrace);
  runButton.disabled = !currentTrace;
  document.querySelector('[data-copy-status]').textContent = '';
  try { localStorage.setItem('portfolio-language', next); } catch { /* Storage is optional. */ }
  const location = new URL(window.location.href);
  location.pathname = location.pathname.replace(/[^/]*$/, next === 'tr' ? 'tr.html' : 'index.html');
  location.searchParams.delete('lang');
  history.replaceState(null,'',location);
  const canonical = document.querySelector('link[rel="canonical"]');
  if(canonical) canonical.href = new URL(next === 'tr' ? 'tr.html' : './',canonical.href).href;
  document.dispatchEvent(new CustomEvent('portfolio:language',{detail:next}));
}
languageButton.addEventListener('click', () => changeLanguage(language === 'en' ? 'tr' : 'en'));

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(filter => { const active = filter === button; filter.classList.toggle('is-active',active); filter.setAttribute('aria-pressed',String(active)); });
  let visible = 0;
  document.querySelectorAll('.case').forEach(item => { item.hidden = category !== 'all' && item.dataset.category !== category; if(!item.hidden) visible++; });
  document.querySelector('[data-filter-status]').textContent = text(`${visible} selected work examples shown.`,`${visible} çalışma örneği gösteriliyor.`);
}));

let currentScenario = 'cache';
let currentTrace;
let playbackVersion = 0;
let traceRequest;
let staticCatalog;
const runButton = document.querySelector('[data-run]');
const traceList = document.querySelector('[data-trace]');
const simulationStatus = document.querySelector('[data-simulation-status]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function cancelPlayback() {
  playbackVersion++;
  runButton.disabled = false;
  runButton.removeAttribute('aria-busy');
  simulationStatus.textContent = '';
}
function renderTrace(trace) {
  traceList.replaceChildren(...trace.steps.map((step,index) => {
    const row = document.createElement('li');
    const number = document.createElement('span');
    number.className = 'trace-index'; number.textContent = String(index+1).padStart(2,'0');
    const label = document.createElement('span'); label.textContent = step.title[language];
    row.append(number,label); return row;
  }));
  document.querySelector('[data-result-title]').textContent = trace.result[language];
  document.querySelector('[data-result-description]').textContent = trace.explanation[language];
}
async function loadScenario(id) {
  cancelPlayback();
  currentScenario = id;
  currentTrace = undefined;
  traceRequest?.abort();
  traceRequest = new AbortController();
  const signal = AbortSignal.any([traceRequest.signal, AbortSignal.timeout(8000)]);
  document.querySelectorAll('[data-scenario]').forEach(button => { const active = button.dataset.scenario === id; button.classList.toggle('is-active',active); button.setAttribute('aria-pressed',String(active)); });
  runButton.disabled = true;
  simulationStatus.textContent = text('Loading scenario…','Senaryo yükleniyor…');
  try {
    let trace;
    if(document.documentElement.dataset.runtime === 'api') {
      const response = await fetch(new URL(`api/traces/${id}`,document.baseURI), {signal});
      if(!response.ok) throw new Error('The demonstration API is unavailable');
      trace = await response.json();
    } else {
      if(!staticCatalog) {
        const response = await fetch(new URL('../data/traces.json',import.meta.url),{signal});
        if(!response.ok) throw new Error('The demonstration data is unavailable');
        staticCatalog = await response.json();
      }
      trace = staticCatalog[id];
    }
    if(currentScenario !== id || signal.aborted) return;
    currentTrace = trace; renderTrace(trace);
    simulationStatus.textContent = text('Ready to explore.','İncelemeye hazır.');
  } catch(error) {
    if(currentScenario !== id || error.name === 'AbortError') return;
    currentTrace = undefined;
    simulationStatus.textContent = text('The scenario could not load. Select it again to retry.','Senaryo yüklenemedi. Yeniden denemek için tekrar seçin.');
  } finally { if(currentScenario === id) runButton.disabled = !currentTrace; }
}
document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click',() => loadScenario(button.dataset.scenario)));
document.querySelector('.trace-link').addEventListener('click',() => loadScenario('cache'));
runButton.addEventListener('click',async () => {
  if(!currentTrace) return;
  cancelPlayback();
  const version = playbackVersion;
  runButton.disabled = true; runButton.setAttribute('aria-busy','true');
  const rows = [...traceList.children];
  rows.forEach(row => row.className = '');
  simulationStatus.textContent = text('Replaying the illustrative sequence…','Örnek akış oynatılıyor…');
  for(let index=0; index<rows.length; index++) {
    if(version !== playbackVersion) return;
    rows[index].classList.add('is-current');
    selectNode(currentTrace.steps[index].node);
    if(!reducedMotion.matches) await new Promise(resolve => setTimeout(resolve,650));
    if(version !== playbackVersion) return;
    rows[index].classList.replace('is-current','is-complete');
  }
  runButton.disabled = false; runButton.removeAttribute('aria-busy');
  simulationStatus.textContent = text('Sequence complete. Try another scenario.','Akış tamamlandı. Başka bir senaryo deneyin.');
  document.dispatchEvent(new CustomEvent('portfolio:scenario-complete'));
});
document.querySelector('[data-copy]').addEventListener('click',async () => {
  const status = document.querySelector('[data-copy-status]');
  try { await navigator.clipboard.writeText('umut.oku@gmail.com'); status.textContent = text('Email copied.','E-posta kopyalandı.'); }
  catch { status.textContent = text('Copy unavailable. Select the email address above.','Kopyalama kullanılamıyor. Yukarıdaki e-posta adresini seçin.'); }
});
const preferredLanguage = new URLSearchParams(location.search).get('lang');
if((preferredLanguage === 'tr' || preferredLanguage === 'en') && preferredLanguage !== language) await changeLanguage(preferredLanguage);
selectNode(selectedNode);
initDashboard();
await loadScenario('cache');
