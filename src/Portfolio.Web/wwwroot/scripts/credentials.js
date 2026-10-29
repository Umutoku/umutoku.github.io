document.documentElement.classList.remove('no-js');
const input=document.querySelector('#credential-search');
const category=document.querySelector('#credential-category');
const rows=[...document.querySelectorAll('.credential-row')];
const tr=document.documentElement.lang==='tr';
const normalise=value=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replaceAll('ı','i');
function filter(){
 const query=normalise(input.value.trim()); let count=0;
 for(const row of rows){ row.hidden=!(normalise(row.textContent).includes(query)&&(category.value==='all'||row.dataset.category===category.value)); if(!row.hidden) count++; }
 document.querySelector('[data-count]').textContent=tr?`${count} / ${rows.length} kayıt`:`${count} of ${rows.length} records`;
 document.querySelector('[data-empty]').hidden=count!==0;
}
input.addEventListener('input',filter); category.addEventListener('change',filter);
document.querySelector('[data-reset]').addEventListener('click',()=>{input.value='';category.value='all';filter();input.focus();});
