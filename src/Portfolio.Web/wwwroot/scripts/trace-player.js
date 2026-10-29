export async function initTracePlayer(selectNode) {
let language=document.documentElement.lang;
const text=(en,tr)=>language==='tr'?tr:en;
let currentScenario = 'cache';
let currentTrace;
let playbackVersion = 0;
let traceRequest;
let staticCatalog;
const runButton = document.querySelector('[data-run]');
if (!runButton) return;
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
document.querySelector('.trace-link')?.addEventListener('click',() => loadScenario('cache'));
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

document.addEventListener('portfolio:language', event=>{cancelPlayback();language=event.detail;if(currentTrace)renderTrace(currentTrace);runButton.disabled=!currentTrace;});
await loadScenario('cache');
}
