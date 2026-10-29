import { pageHref, localizeHref } from './page-routes.js';
import { uiLabels, languageAction } from './ui-labels.js';
import { domainLinks } from './domain-links.js';
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
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let selectedNode = 'product';
function selectNode(key) {
  selectedNode = key;
  if(!document.querySelector('[data-node-title]')) return;
  document.querySelectorAll('[data-node]').forEach(button => {
    const selected = button.dataset.node === key;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('[data-node-title]').textContent = nodes[key][language][0];
  document.querySelector('[data-node-description]').textContent = nodes[key][language][1];
  const relation = domainLinks[key];
  document.querySelector('[data-domain-work]').href = pageHref('work',language,`#${relation.caseId}`);
  document.querySelector('[data-node-relations]').textContent = `${nodes[key][language][0]} → ${relation.related.map(id=>nodes[id][language][0]).join(' · ')}`;
}
document.querySelectorAll('[data-node]').forEach(button => button.addEventListener('click', () => selectNode(button.dataset.node)));
const menu = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
function updateMenuLabel() { menu.setAttribute('aria-label',uiLabels[mobileNav.hidden?'openNavigation':'closeNavigation'][language]); }
function closeMenu() { mobileNav.hidden = true; menu.setAttribute('aria-expanded','false'); updateMenuLabel(); }
menu.addEventListener('click', () => { const open = mobileNav.hidden; mobileNav.hidden = !open; menu.setAttribute('aria-expanded', String(open)); updateMenuLabel(); });
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
  language = next;
  document.documentElement.lang = next;
  document.querySelectorAll('[data-i18n]').forEach(element => { if(copies[next][element.dataset.i18n]) writeText(element, copies[next][element.dataset.i18n]); });
  languageButton.textContent = next === 'en' ? 'TR' : 'EN';
  languageButton.setAttribute('aria-label', languageAction[next]);
  languageButton.removeAttribute('title');
  const page=document.documentElement.dataset.page || 'home';
  const titles={home:['Umut Oku | .NET Backend Engineer','Umut Oku | .NET Backend Mühendisi'],work:['Engineering work | Umut Oku','Mühendislik çalışmaları | Umut Oku'],lab:['Systems workshop | Umut Oku','Sistem atölyesi | Umut Oku']};
  document.title=text(...titles[page]);
  document.querySelector('meta[property="og:title"]').content=document.title;
  document.querySelector('meta[name="description"]').content = text('Umut Oku: .NET and distributed systems engineer. Product, Elasticsearch, PostgreSQL, Redis, messaging, payments and DevOps.', 'Umut Oku: .NET, mikroservis, Elasticsearch, PostgreSQL, Redis ve DevOps. Ürün, veri, ödeme ve dağıtık sistemler.');
  document.querySelectorAll('[data-i18n-aria]').forEach(element=>element.setAttribute('aria-label',uiLabels[element.dataset.i18nAria][next]));
  updateMenuLabel();
  document.querySelectorAll('a[href]').forEach(link=>{link.setAttribute('href',localizeHref(link.getAttribute('href'),next));});
  selectNode(selectedNode);
  const status=document.querySelector('[data-copy-status]'); if(status)status.textContent='';
  try { localStorage.setItem('portfolio-language', next); } catch { /* Storage is optional. */ }
  const location = new URL(window.location.href);
  location.pathname = location.pathname.replace(/[^/]*$/, pageHref(page,next));
  location.searchParams.delete('lang');
  history.replaceState(null,'',location);
  const canonical = document.querySelector('link[rel="canonical"]');
  if(canonical) canonical.href = new URL(page==='home' && next==='en'?'./':pageHref(page,next),canonical.href).href;
  document.querySelector('meta[property="og:url"]').content=canonical.href;
  document.querySelector('meta[property="og:locale"]').content=next==='tr'?'tr_TR':'en_US';
  const filterStatus=document.querySelector('[data-filter-status]');
  if(filterStatus) {
    const count=[...document.querySelectorAll('.case')].filter(item=>!item.hidden).length;
    filterStatus.textContent=text(`${count} selected work examples shown.`,`${count} çalışma örneği gösteriliyor.`);
  }
  document.dispatchEvent(new CustomEvent('portfolio:language',{detail:next}));
}
languageButton.addEventListener('click', () => changeLanguage(language === 'en' ? 'tr' : 'en'));

function filterWork(category) {
  document.querySelectorAll('[data-filter]').forEach(filter => { const active = filter.dataset.filter === category; filter.classList.toggle('is-active',active); filter.setAttribute('aria-pressed',String(active)); });
  let visible = 0;
  document.querySelectorAll('.case').forEach(item => { item.hidden = category !== 'all' && item.dataset.category !== category; if(!item.hidden) visible++; });
  const more = document.querySelector('[data-more-work]');
  more.hidden = ![...more.querySelectorAll('.case')].some(item=>!item.hidden);
  more.open = category !== 'all';
  document.querySelector('[data-filter-status]').textContent = text(`${visible} selected work examples shown.`,`${visible} çalışma örneği gösteriliyor.`);
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>filterWork(button.dataset.filter)));
function openWork(id,focus=false) {
  const item = document.getElementById(id);
  if(!item?.classList.contains('case')) return;
  filterWork('all');
  const parent = item.closest('[data-more-work]');
  if(parent) parent.open = true;
  item.open = true;
  if(focus) { item.querySelector('summary').focus({preventScroll:true}); item.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'}); }
}
document.querySelectorAll('[data-work-link]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  history.pushState(null,'',link.hash);
  openWork(link.hash.slice(1),true);
}));
window.addEventListener('hashchange',()=>openWork(location.hash.slice(1)));

document.querySelector('[data-copy]')?.addEventListener('click',async () => {
  const status = document.querySelector('[data-copy-status]');
  try { await navigator.clipboard.writeText('umut.oku@gmail.com'); status.textContent = text('Email copied.','E-posta kopyalandı.'); }
  catch { status.textContent = text('Copy unavailable. Select the email address above.','Kopyalama kullanılamıyor. Yukarıdaki e-posta adresini seçin.'); }
});
const preferredLanguage = new URLSearchParams(location.search).get('lang');
if((preferredLanguage === 'tr' || preferredLanguage === 'en') && preferredLanguage !== language) await changeLanguage(preferredLanguage);
selectNode(selectedNode);
if(document.querySelector('#playground')) {
 const [{initDashboard},{initDecisionLab},{initTracePlayer}]=await Promise.all([import('./dashboard.js'),import('./decision-lab.js'),import('./trace-player.js')]);
 initDashboard();initDecisionLab();await initTracePlayer(selectNode);
}
