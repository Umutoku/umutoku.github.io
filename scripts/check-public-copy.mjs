import {readFile} from 'node:fs/promises';

// Catch review notes that have accidentally become portfolio copy.
// Editorial review still checks tone, clarity and the meaning of each claim.
const reviewPhrases = [
  /ölçülmemiş/iu,
  /(?:kazancı|kazançları|throughput) ölçülmedi/iu,
  /iddia edilmiyor|iddiası taşımaz/iu,
  /testleri yeniden çalıştırılmadı/iu,
  /no unmeasured|no quantified production performance claims/iu,
  /tests were not rerun|not rerun for this case study/iu,
  /rather than a claim based only/iu,
  /not a claim of production ownership/iu
];

export function findEditorialNotes(source) {
  const text=source.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
    .replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
  return reviewPhrases.flatMap(pattern=>{
    const match=pattern.exec(text);
    return match?[text.slice(Math.max(0,match.index-50),match.index+match[0].length+70).trim()]:[];
  });
}

const root=new URL('../src/Portfolio.Web/wwwroot/',import.meta.url);
const issues=[];
for(const file of ['index.html','tr.html','work.html','work-tr.html','lab.html','lab-tr.html','credentials.html','credentials-tr.html','llms.txt']) {
  const source=await readFile(new URL(file,root),'utf8');
  for(const note of findEditorialNotes(source))issues.push(`${file}: ${note}`);
}
if(issues.length)throw new Error(`Internal review language found in public copy:\n${issues.join('\n')}`);
console.log('Public copy checked: no internal review notes found.');
