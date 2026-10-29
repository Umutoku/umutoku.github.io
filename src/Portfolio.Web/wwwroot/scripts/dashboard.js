export function initDashboard() {
 const section=document.querySelector('#dashboard'); if(!section) return;
 const button=section.querySelector('[data-visit-refresh]');
 const status=section.querySelector('[data-visit-status]');
 let language=document.documentElement.lang;
 let runs=0;
 const text=(en,tr)=>language==='tr'?tr:en;
 function inspect(){
   const navigation=performance.getEntriesByType('navigation')[0];
   const value=navigation?.domContentLoadedEventEnd;
   section.querySelector('[data-page-timing]').textContent=value>0?`${Math.round(value)} ms`:text('Not available','Ölçülemedi');
   const resources=performance.getEntriesByType('resource').filter(entry=>new URL(entry.name).origin===location.origin).length;
   const time=new Intl.DateTimeFormat(language==='tr'?'tr-TR':'en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());
   status.textContent=text(`This visit / ${resources} resources / ${runs} completed simulations / ${time}`,`Bu ziyaret / ${resources} kaynak / ${runs} tamamlanan simülasyon / ${time}`);
 }
 button.addEventListener('click',inspect);
 document.addEventListener('portfolio:language',event=>{language=event.detail;inspect();});
 document.addEventListener('portfolio:scenario-complete',()=>{runs++;inspect();});
 if(document.readyState==='complete')inspect();else window.addEventListener('load',()=>setTimeout(inspect,0),{once:true});
}
