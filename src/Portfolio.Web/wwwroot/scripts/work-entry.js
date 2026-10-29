// Preserve published fragment links after splitting the original single page.
const knownCases = new Set(['work-search','work-product','work-identity','work-data','work-jobs','work-operations','work-payment','search-case-study']);
const labAnchors = new Set(['playground','decision-lab','system-trace','lab','dashboard']);
function resolveEntry() {
  const id = location.hash.slice(1);
  const language = document.documentElement.lang === 'tr' ? 'tr' : 'en';
  if(document.documentElement.dataset.page === 'home') {
    const destination = knownCases.has(id) ? 'work' : labAnchors.has(id) ? 'lab' : undefined;
    if(destination) location.replace(`${destination}${language==='tr'?'-tr':''}.html#${id}`);
    return;
  }
  const target = document.getElementById(id);
  const item = target?.classList.contains('case') ? target : target?.closest('.case');
  if(!item) return;
  const group = item.closest('[data-more-work]');
  if(group) group.open = true;
  item.open = true;
  if(target.classList.contains('case-study')) target.open = true;
}
resolveEntry();
window.addEventListener('hashchange',resolveEntry);
