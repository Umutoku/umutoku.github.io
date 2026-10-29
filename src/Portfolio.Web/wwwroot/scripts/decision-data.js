const copy = (en, tr) => ({ en, tr });

// Fictional constraints make each choice contextual, not a universal architecture score.
export const decisions = [
  {
    id: 'search', label: copy('Search', 'Arama'),
    title: copy('Saved. But still not searchable.', 'Kaydedildi. Ama aramada hâlâ eski.'),
    situation: copy('A product name changed in PostgreSQL. The API confirmed the save, but search returns the old name. Indexing runs through an event consumer.', 'Ürünün adı PostgreSQL’de değişti. API kaydı onayladı; arama eski adı döndürüyor. İndeksleme bir olay tüketicisi üzerinden çalışıyor.'),
    question: copy('Where do you look first?', 'İlk nereye bakarsın?'),
    signal: copy('Database: new name / Search: old name', 'Veritabanı: yeni ad / Arama: eski ad'),
    before: [copy('Product saved', 'Ürün kaydedildi'), copy('Event pending?', 'Olay bekliyor mu?'), copy('Old search result', 'Eski arama sonucu')],
    choices: [
      { id:'trace', label:copy('Follow the event to the index', 'Olayı indekse kadar izle'),
        title:copy('You found the missing step.', 'Eksik adımı yakaladın.'),
        explanation:copy('Check event delivery, consumer lag and the indexed document version. In this scenario the consumer is delayed: reconcile the projection once processing resumes. A successful database write alone does not confirm indexing.', 'Olay teslimini, tüketici gecikmesini ve indeks dokümanının sürümünü kontrol et. Bu örnekte tüketici gecikiyor: işleme devam ettiğinde projeksiyonu uzlaştır. Veritabanına başarılı yazım, indekslemenin tamamlandığını göstermez.'),
        after:[copy('Event located', 'Olay bulundu'),copy('Consumer delay found', 'Tüketici gecikiyor'),copy('Projection reconciled', 'Projeksiyon uzlaştırıldı')] },
      { id:'cache', label:copy('Clear every Redis key', 'Redis’teki tüm anahtarları temizle'),
        title:copy('Fresh cache. Same old index.', 'Cache temiz. İndeks hâlâ eski.'),
        explanation:copy('The stale answer comes from Elasticsearch in this example. A full cache flush does not advance the consumer and can increase database load. First identify which projection is stale; invalidate only the relevant cache when needed.', 'Bu örnekte eski yanıt Elasticsearch’ten geliyor. Cache’i tamamen temizlemek tüketiciyi ilerletmez; veritabanı yükünü artırabilir. Önce hangi projeksiyonun eski olduğunu bul, gerekiyorsa ilgili cache’i geçersiz kıl.'),
        after:[copy('Cache flushed', 'Cache temizlendi'),copy('More cache misses', 'Cache miss arttı'),copy('Index still behind', 'İndeks hâlâ geride')] },
      { id:'wait', label:copy('Add a fixed wait before reading', 'Okumadan önce sabit süre bekle'),
        title:copy('Time passed. Proof didn’t arrive.', 'Süre doldu. Kanıt gelmedi.'),
        explanation:copy('A fixed sleep may hide a small delay, but it cannot establish that this event was processed. Observe completion or document the read-after-write behavior instead of assuming a delay guarantees freshness.', 'Sabit bekleme kısa bir gecikmeyi gizleyebilir; bu olayın işlendiğini kanıtlayamaz. Sürenin güncelliği garanti ettiğini varsaymak yerine tamamlanmayı izle veya yazma sonrası okuma davranışını açıkla.'),
        after:[copy('Timer started', 'Sayaç başladı'),copy('Wait completed', 'Bekleme bitti'),copy('Freshness unknown', 'Güncellik belirsiz')] }
    ]
  },
  {
    id:'cache', label:copy('Cache', 'Cache'),
    title:copy('One cold key. A crowd of requests.', 'Tek bir soğuk anahtar. Bir sürü istek.'),
    situation:copy('A popular catalog key expires. Many requests arrive together. The database has limited headroom; a briefly stale catalog response is acceptable here.', 'Popüler bir katalog anahtarının süresi doldu. Aynı anda çok sayıda istek geliyor. Veritabanının kapasitesi sınırlı; bu örnekte kısa süreli eski katalog yanıtı kabul ediliyor.'),
    question:copy('How do you protect the source?', 'Kaynak veriyi nasıl korursun?'),
    signal:copy('Cache: expired / Database: limited headroom', 'Cache: süresi doldu / Veritabanı: sınırlı kapasite'),
    before:[copy('Key expired', 'Anahtarın süresi doldu'),copy('Requests converge', 'İstekler birikti'),copy('Source under pressure', 'Kaynak baskı altında')],
    choices:[
      { id:'forever', label:copy('Keep the cached value forever', 'Cache değerini süresiz tut'),
        title:copy('The load drops. Freshness disappears.', 'Yük düştü. Güncellik kayboldu.'),
        explanation:copy('An indefinite lifetime avoids expiry but leaves updates invisible without reliable invalidation. This catalog tolerates bounded staleness, not permanent staleness. Define a freshness limit and a refresh or invalidation path.', 'Süresiz cache süre dolmasını önler ama güvenilir invalidation yoksa güncellemeler görünmez olur. Bu katalog sınırlı eskiliği kabul ediyor, süresiz eskiliği değil. Güncellik sınırı ve yenileme ya da invalidation akışı tanımla.'),
        after:[copy('Expiry removed', 'Süre sınırı kalktı'),copy('Update arrives', 'Güncelleme geldi'),copy('Old value persists', 'Eski değer kaldı')] },
      { id:'coalesce', label:copy('Coordinate one refresh per key', 'Anahtar başına yenilemeyi koordine et'),
        title:copy('One refresh. A bounded wait.', 'Tek yenileme. Sınırlı bekleme.'),
        explanation:copy('Coalesce concurrent refreshes and bound the wait. Since this catalog permits it, a bounded stale value can bridge the refresh. A per-process lock only coordinates one instance; multiple instances need an explicit coordination strategy.', 'Eşzamanlı yenilemeleri birleştir, beklemeye sınır koy. Bu katalog izin verdiği için sınırlı süre eski değer sunulabilir. Süreç içi kilit yalnız bir instance’ı koordine eder; birden çok instance için stratejiyi ayrıca belirle.'),
        after:[copy('Refresh coordinated', 'Yenileme koordine'),copy('Source load bounded', 'Kaynak yükü sınırlı'),copy('Cache repopulated', 'Cache yenilendi')] },
      { id:'bypass', label:copy('Send every request to PostgreSQL', 'Her isteği PostgreSQL’e gönder'),
        title:copy('Correct source. Too many readers.', 'Doğru kaynak. Fazla okuyucu.'),
        explanation:copy('Reading the source is reasonable for a single miss. Letting every concurrent miss through can create a stampede under these constraints. Limit concurrency, coordinate refreshes and decide how to handle timeout or overload.', 'Tek cache miss için kaynağı okumak makul. Bu koşullarda eşzamanlı tüm istekleri geçirmek yığılma yaratabilir. Eşzamanlılığı sınırla, yenilemeyi koordine et; zaman aşımı ve aşırı yük davranışını belirle.'),
        after:[copy('Cache bypassed', 'Cache atlandı'),copy('Reads multiply', 'Okumalar çoğaldı'),copy('Source load spikes', 'Kaynak yükü sıçradı')] }
    ]
  },
  {
    id:'duplicate', label:copy('Events', 'Olaylar'),
    title:copy('Same event. Second delivery.', 'Aynı olay. İkinci teslim.'),
    situation:copy('A consumer committed a stock adjustment, but its acknowledgement was lost. The broker delivers the same event again. The event has a stable identifier.', 'Tüketici stok hareketini commit etti; alındı onayı kayboldu. Broker aynı olayı yeniden teslim ediyor. Olayın sabit bir kimliği var.'),
    question:copy('What happens on the second delivery?', 'İkinci teslimde ne yaparsın?'),
    signal:copy('Business write: committed / Acknowledgement: lost', 'İş kaydı: commit edildi / Alındı onayı: kayıp'),
    before:[copy('Stock adjusted', 'Stok güncellendi'),copy('Acknowledgement lost', 'Onay kayboldu'),copy('Event redelivered', 'Olay tekrar geldi')],
    choices:[
      { id:'retry', label:copy('Apply the stock adjustment again', 'Stok hareketini yeniden uygula'),
        title:copy('One event. Two side effects.', 'Bir olay. İki yan etki.'),
        explanation:copy('Retrying delivery is not permission to repeat a committed business effect. With a non-idempotent handler, stock changes twice. Use a durable event identity and completion check, with concurrency protection.', 'Teslimin tekrarı, commit edilmiş iş etkisini tekrarlama izni değildir. Idempotent olmayan handler stok hareketini iki kez uygular. Kalıcı olay kimliği ve tamamlanma kontrolünü eşzamanlılık korumasıyla kullan.'),
        after:[copy('Retry accepted', 'Tekrar işlendi'),copy('Write repeated', 'Yazım tekrarlandı'),copy('Stock diverges', 'Stok tutarsızlaştı')] },
      { id:'ack', label:copy('Acknowledge every redelivery immediately', 'Her tekrar teslimi doğrudan onayla'),
        title:copy('This one completed. Did the next one?', 'Bu tamamlandı. Peki sıradaki?'),
        explanation:copy('This event was committed, so acknowledging it is safe after verification. A redelivery flag alone does not prove completion: another attempt may have failed before the write. Check durable processing state before acknowledging.', 'Bu olay commit edildiği için doğrulama sonrasında onaylanabilir. Tekrar teslim işareti tek başına tamamlanma kanıtı değildir; başka bir deneme yazımdan önce hata almış olabilir. Onaydan önce kalıcı işleme durumunu kontrol et.'),
        after:[copy('Delivery flag checked', 'Teslim işareti okundu'),copy('Completion unchecked', 'Tamamlanma kontrolsüz'),copy('Lost work is possible', 'İş kaybı mümkün')] },
      { id:'deduplicate', label:copy('Verify durable completion before acknowledging', 'Onaydan önce kalıcı tamamlanmayı doğrula'),
        title:copy('Delivery repeated. The effect didn’t.', 'Teslim tekrarlandı. Etkisi tekrarlanmadı.'),
        explanation:copy('Find the event’s durable completion record. Keep that record and the business write atomic when they share a database; enforce uniqueness for concurrent deliveries. External side effects need their own idempotency or reconciliation boundary.', 'Olayın kalıcı tamamlanma kaydını bul. Aynı veritabanındalarsa bu kayıtla iş yazımını atomik tut; eşzamanlı teslimler için benzersizliği koru. Harici yan etkiler ayrıca idempotency veya mutabakat sınırı gerektirir.'),
        after:[copy('Completion verified', 'Tamamlanma doğrulandı'),copy('No repeated write', 'Yazım tekrarlanmadı'),copy('Delivery acknowledged', 'Teslim onaylandı')] }
    ]
  }
];

export function newDecisionSession() { return { index: 0, answers: [], complete: false }; }
export function chooseDecision(state, id) {
  if (state.complete || !decisions[state.index].choices.some(choice => choice.id === id)) return state;
  const answers = [...state.answers];
  answers[state.index] = id;
  return { ...state, answers };
}
export function advanceDecision(state) {
  if (state.complete || !state.answers[state.index]) return state;
  return state.index === decisions.length - 1 ? { ...state, complete: true } : { ...state, index: state.index + 1 };
}
