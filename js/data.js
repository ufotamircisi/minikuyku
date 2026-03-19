/* ═══════════════════════════════════════════════════════════════
   data.js  |  Uygulama verileri (ninniler, masallar, kolik, uzman)
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Türkçe ninniler ─────────────────────────────────────────── */
window.LULLABIES = [
  { id:'l1', name:'Dandini Dandini',    emoji:'⭐', origin:'Anadolu', desc:'Nesilden nesile aktarılan klasik Türk ninnisi',      file:'dandini.mp3',  text:'Dandini dandini danalı bebek...' },
  { id:'l2', name:'Fış Fış Kayıkçı',   emoji:'🚣', origin:'Halk',    desc:'Sevimli ve eğlenceli geleneksel ninni',               file:'fisfis.mp3',   text:'Fış fış kayıkçı...' },
  { id:'l3', name:'Uyu da Büyü',        emoji:'🌙', origin:'Anadolu', desc:'Sıcak ve sakinleştirici uyku ninnisi',                file:'uyubu.mp3',    text:'Uyu da büyü tatlım, uyu...' },
  { id:'l4', name:'Ninni Ninni',         emoji:'🎵', origin:'Halk',    desc:'Klasik halk ninnisi, yumuşak ritim',                  file:'ninni.mp3',    text:'Ninni ninni ninni, uyu bebeğim...' },
];

/* ── İngilizce ninniler ──────────────────────────────────────── */
window.EN_LULLABIES = [
  { id:'el1', name:'Twinkle Twinkle',  emoji:'✨', origin:'English', desc:'Classic bedtime lullaby',         file:'twinkle.mp3',  text:'Twinkle twinkle little star...' },
  { id:'el2', name:'Rock-a-Bye Baby',  emoji:'🌙', origin:'English', desc:'Soft classic sleep melody',       file:'rockabye.mp3', text:'Rock-a-bye baby on the treetop...' },
  { id:'el3', name:'Hush Little Baby', emoji:'🤫', origin:'English', desc:'Gentle reassuring lullaby',       file:'hush.mp3',     text:'Hush little baby, don\'t say a word...' },
  { id:'el4', name:'Brahms Lullaby',   emoji:'🎼', origin:'Classic', desc:'Timeless orchestral lullaby',     file:'brahms.mp3',   text:'Lullaby and good night...' },
];

/* ── Türkçe masallar ─────────────────────────────────────────── */
window.STORIES = [
  { id:'s1', title:'Küçük Yıldız',     emoji:'⭐', age:'0-3 yaş', duration:'5 dk', type:'Masal',       desc:'Gökyüzündeki en küçük yıldığın hikayesi',  text:'Bir varmış bir yokmuş. Gökyüzünün en küçük yıldızı varmış, adı Işık\'mış. Her gece diğer yıldızların yanında parıldarmış. Ay dede ona dedi ki: Sen kalplerin içindesin küçük Işık. Ve o geceden sonra her bebek uyurken onu rüyasında görürmüş. Uyu tatlım, uyu.' },
  { id:'s2', title:'Ormandaki Uyku',   emoji:'🌿', age:'1-4 yaş', duration:'7 dk', type:'Doğa Masalı', desc:'Orman hayvanlarının uyku hazırlığı',         text:'Büyük ormanda gece olmuş. Tilki yavrusu yuvaya girmiş, anne tilki ninni söylemiş. Yapraklar fısıldamış: iyi geceler, iyi geceler. Uyu tatlım, uyu.' },
  { id:'s3', title:'Bulut Bebeği',     emoji:'☁️', age:'0-3 yaş', duration:'5 dk', type:'Fantezi',     desc:'Pamuk gibi yumuşacık bir bulutun masalı',    text:'Bir bulut bebek varmış. Pofuduk, beyaz, yumuşacık. Adı Pamuk\'muş. Anası her akşam onu sararmış. Yağmur damlaları senin ninnindir, demiş. Uyu tatlım, uyu.' },
  { id:'s4', title:'Ay ile Bebek',     emoji:'🌙', age:'0-2 yaş', duration:'4 dk', type:'Kısa Masal',  desc:'Ay\'ın bebeği izlediği tatlı bir gece',      text:'Her gece ay pencereden içeri bakarmış. Sen en parlak yıldızsın, demiş ay. Gözlerini kapat, seninle rüyanda konuşurum. Uyu tatlım, uyu.' },
];

/* ── İngilizce masallar ──────────────────────────────────────── */
window.EN_STORIES = [
  { id:'es1', title:'Little Star',    emoji:'⭐', age:'0-3 yrs', duration:'5 min', type:'Story',      desc:'A tiny star learns to glow',              text:'Once upon a time there was a tiny star called Light. Every night it watched sleepy babies and whispered sweet dreams.' },
  { id:'es2', title:'Sleepy Forest',  emoji:'🌲', age:'1-4 yrs', duration:'6 min', type:'Nature',     desc:'Forest friends get ready for bed',         text:'In the deep forest, every little animal prepared for sleep. Leaves whispered softly and the moon smiled above.' },
  { id:'es3', title:'Cloud Baby',     emoji:'☁️', age:'0-3 yrs', duration:'4 min', type:'Fantasy',    desc:'A soft cloud drifts into dreams',          text:'A baby cloud named Puffy floated gently across the sky and followed the moon into dreamland.' },
  { id:'es4', title:'Moon and Baby',  emoji:'🌙', age:'0-2 yrs', duration:'4 min', type:'Short Story', desc:'The moon watches over a sleepy baby',     text:'The moon peeked through the window and promised to stay close until morning.' },
];

/* ── Kolik sesleri ───────────────────────────────────────────── */
window.KOLIK_SOUNDS = {
  beyaz: [
    { id:'b1', name:'Saç Kurutma Makinesi', emoji:'💨', desc:'Güçlü hava akışı – anında sakinleştirir', file:'hairdryer.mp3' },
    { id:'b2', name:'Elektrik Süpürgesi',   emoji:'🌀', desc:'Derin motor tınısı',                       file:'vacuum.mp3' },
    { id:'b3', name:'Beyaz Gürültü',        emoji:'📻', desc:'Saf beyaz gürültü',                        file:'whitenoise.mp3' },
    { id:'b4', name:'Klima Sesi',           emoji:'❄️', desc:'Sabit monoton uğultu',                     file:'ac.mp3' },
  ],
  doga: [
    { id:'d1', name:'Yağmur Sesi',   emoji:'🌧️', desc:'Hafif çiseleme',           file:'rain.mp3' },
    { id:'d2', name:'Dalga Sesi',    emoji:'🌊', desc:'Ritmik okyanus dalgaları',   file:'waves.mp3' },
    { id:'d3', name:'Orman Sesi',    emoji:'🌲', desc:'Yaprak ve kuş sesleri',      file:'forest.mp3' },
    { id:'d4', name:'Şelale',        emoji:'💧', desc:'Sürekli akan su',            file:'stream.mp3' },
  ],
  rahat: [
    { id:'r1', name:'Kalp Atışı',   emoji:'❤️', desc:'Anne karnındaki ritim',        file:'heart.mp3' },
    { id:'r2', name:'Piş Piş Sesi', emoji:'🤫', desc:'Ağlama krizlerinde etkili',    file:'pispis.mp3' },
  ]
};

/* ── Kolik çeviriler ─────────────────────────────────────────── */
window.KOLIK_TR = {
  b1:{ name:'Saç Kurutma Makinesi', desc:'Güçlü hava akışı – anında sakinleştirir' },
  b2:{ name:'Elektrik Süpürgesi',   desc:'Derin motor tınısı' },
  b3:{ name:'Beyaz Gürültü',        desc:'Saf beyaz gürültü' },
  b4:{ name:'Klima Sesi',           desc:'Sabit monoton uğultu' },
  d1:{ name:'Yağmur Sesi',          desc:'Hafif çiseleme' },
  d2:{ name:'Dalga Sesi',           desc:'Ritmik okyanus dalgaları' },
  d3:{ name:'Orman Sesi',           desc:'Yaprak ve kuş sesleri' },
  d4:{ name:'Şelale',               desc:'Sürekli akan su' },
  r1:{ name:'Kalp Atışı',           desc:'Anne karnındaki ritim' },
  r2:{ name:'Piş Piş Sesi',         desc:'Ağlama krizlerinde etkili' },
};
window.KOLIK_EN = {
  b1:{ name:'Hair Dryer',      desc:'Strong airflow – calming for many babies' },
  b2:{ name:'Vacuum Cleaner',  desc:'Deep motor hum' },
  b3:{ name:'White Noise',     desc:'Pure white noise' },
  b4:{ name:'Air Conditioner', desc:'Steady monotone hum' },
  d1:{ name:'Rain Sound',      desc:'Soft rainfall ambience' },
  d2:{ name:'Ocean Waves',     desc:'Rhythmic sea waves' },
  d3:{ name:'Forest Sound',    desc:'Leaves and distant birds' },
  d4:{ name:'Water Stream',    desc:'Continuous flowing water' },
  r1:{ name:'Heartbeat',       desc:'A womb-like steady rhythm' },
  r2:{ name:'Shushing Sound',  desc:'Helpful during crying episodes' },
};

/* ── Uzman önerileri ─────────────────────────────────────────── */
window.EXPERT_TIPS = {
  tr: {
    0:[
      { author:'Dr. Ayşe Yılmaz',   title:'Pedagog',              avatar:'👩‍⚕️', tip:'Yeni doğan bebekler günde 16-18 saat uyur. Uyku aralıkları 2-3 saattir. Bebeğinizin uyku sinyallerini kaçırmayın.' },
      { author:'Dr. Can Kaya',       title:'Çocuk Uzmanı',         avatar:'👨‍⚕️', tip:'0-3 aylık bebeklerde kolik yaygındır. Beyaz gürültü ve sallanma hareketleri rahatlatır.' },
      { author:'Ebe Zeynep Demir',   title:'Emzirme Danışmanı',    avatar:'🤱',   tip:'Açlık ve uyku ilişkisi yakındır. Bebek doyunca uykuya daha kolay dalacaktır.' },
    ],
    1:[
      { author:'Dr. Selin Aydın',    title:'Uyku Terapisti',       avatar:'😴',   tip:'3 aydan sonra bebekler gece daha uzun uyumaya başlar. 4 aylık uyku regresyonuna hazırlıklı olun.' },
      { author:'Dr. Mehmet Şahin',   title:'Gelişim Uzmanı',       avatar:'👨‍⚕️', tip:'Bu dönemde bebekler günde 14-15 saat uyur. Gündüz 3-4 kez kısa uyku yapabilirler.' },
      { author:'Psikolog Elif Yıldız',title:'Aile Terapisti',      avatar:'🧠',   tip:'Ritüeller önemlidir. Aynı saatte banyo, masal ve ninni ile bebek uykuya hazırlanmayı öğrenir.' },
    ],
    2:[
      { author:'Dr. Burak Tan',      title:'Pedagog',              avatar:'👨‍⚕️', tip:'6-12 aylık bebekler günde 12-14 saat uyur. Gündüz uykuları 2\'ye düşer.' },
      { author:'Uzm. Ebe Seda Kılıç',title:'Uyku Danışmanı',      avatar:'🌙',   tip:'Emekleme dönemi uyku düzenini bozabilir. Bebek yeni becerisini pratik etmek isteyebilir.' },
      { author:'Dr. Aslı Koç',       title:'Beslenme Uzmanı',      avatar:'🍼',   tip:'Ek gıdaya geçişte uyku düzeni değişebilir. Ağır yemekler uyku öncesi verilmeyebilir.' },
    ],
    3:[
      { author:'Dr. Kerem Arslan',   title:'Çocuk Psikiyatristi',  avatar:'🧸',   tip:'1 yaş sonrası gündüz uykusu 1\'e düşer. Gece 11-12 saat aralıksız uyku hedeflenmelidir.' },
      { author:'Psikolog Derya Uzun',title:'Oyun Terapisti',       avatar:'🎈',   tip:'Ayrılma kaygısı 12-18 ayda zirve yapar. Uyku öncesi kaliteli zaman ayrılma kaygısını azaltır.' },
      { author:'Dr. Hakan Yücel',    title:'Pedagog',              avatar:'📚',   tip:'Masal anlatma alışkanlığı bu dönemde kazanılır. Her gece aynı masal tekrarlanabilir.' },
    ]
  },
  en: {
    0:[
      { author:'Dr. Ayse Yilmaz',    title:'Child Development Specialist', avatar:'👩‍⚕️', tip:'Newborns usually sleep 16–18 hours a day. Watch for sleepy cues such as yawning and eye rubbing.' },
      { author:'Dr. Can Kaya',        title:'Pediatrician',                 avatar:'👨‍⚕️', tip:'Colic is common in the first months. White noise and gentle rocking can be soothing.' },
      { author:'Midwife Zeynep Demir',title:'Lactation Consultant',         avatar:'🤱',   tip:'Feeding and sleep are closely linked. A full baby often settles more easily.' },
    ],
    1:[
      { author:'Dr. Selin Aydin',     title:'Sleep Therapist',              avatar:'😴',   tip:'After 3 months, babies may begin sleeping longer at night. The 4-month regression is common and temporary.' },
      { author:'Dr. Mehmet Sahin',    title:'Development Specialist',       avatar:'👨‍⚕️', tip:'At this stage, babies often sleep 14–15 hours a day and may take 3–4 shorter naps.' },
      { author:'Psychologist Elif Y.',title:'Family Therapist',             avatar:'🧠',   tip:'Routines matter. Repeating bath, story and lullaby helps babies understand sleep is coming.' },
    ],
    2:[
      { author:'Dr. Burak Tan',       title:'Pedagogue',                    avatar:'👨‍⚕️', tip:'Between 6–12 months, babies often sleep 12–14 hours a day. Day naps may reduce to two.' },
      { author:'Midwife Seda Kilic',  title:'Sleep Consultant',             avatar:'🌙',   tip:'Crawling can affect sleep. Babies may want to practice new skills even when tired.' },
      { author:'Dr. Asli Koc',        title:'Nutrition Specialist',         avatar:'🍼',   tip:'Starting solids may change the sleep routine. Avoid heavy meals right before sleep.' },
    ],
    3:[
      { author:'Dr. Kerem Arslan',    title:'Child Psychiatrist',           avatar:'🧸',   tip:'After age one, many babies move toward one daytime nap. A stable night routine becomes the main goal.' },
      { author:'Psychologist D. Uzun',title:'Play Therapist',               avatar:'🎈',   tip:'Separation anxiety peaks between 12–18 months. Special one-on-one time before bed can help.' },
      { author:'Dr. Hakan Yucel',     title:'Pedagogue',                    avatar:'📚',   tip:'Bedtime stories become powerful after age one. Repeating a familiar story creates comfort.' },
    ]
  }
};

/* ── Kayıt cümleleri ─────────────────────────────────────────── */
window.PHRASE_SETS = {
  tr: {
    title: '📝 Masal okur gibi yavaş, sıcak ve doğal bir tonla okuyun. (Yaklaşık 1 dakika):',
    lines: [
      'Uyu bebeğim... şimdi dinlenme zamanı...',
      'Gece sessiz, yıldızlar gökyüzünde parlıyor... ay ışığı odana yumuşakça vuruyor...',
      'Mmm... eee... şşş... derin bir nefes al ve bırak...'
    ],
    placeholder: 'Buraya sakin bir ninni ya da kısa masal metni yazın...',
    defaultText: 'Uyu bebeğim... gece sessiz, yıldızlar parlarken şimdi tatlı rüyalara dalma zamanı...'
  },
  en: {
    title: '📝 Read slowly in a warm, natural storytelling tone. (About 1 minute):',
    lines: [
      'Sleep softly, little one... it is time to rest now...',
      'The night is calm, the stars are shining, and the moonlight is touching your room gently...',
      'Mmm... shh... take a deep breath... and slowly let it go...'
    ],
    placeholder: 'Write a calm lullaby or a short bedtime text here...',
    defaultText: 'Sleep softly, little one... the night is quiet and it is time to drift into sweet dreams...'
  }
};

/* ── Yardımcı ────────────────────────────────────────────────── */
window.getActiveLullabies = function() {
  return state.language === 'tr' ? LULLABIES : EN_LULLABIES;
};
window.getActiveStories = function() {
  return state.language === 'tr' ? STORIES : EN_STORIES;
};
