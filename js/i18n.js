/* ═══════════════════════════════════════════════════════════════
   i18n.js  |  TR / EN çeviri sistemi
   ═══════════════════════════════════════════════════════════════ */
'use strict';

window.I18N = {
  tr: {
    appName: 'Minik Uyku',
    baby: 'Bebek',
    premium: 'Premium',

    /* Navigasyon */
    navLullabies: 'Ninniler', navStories: 'Hikayeler',
    navColic: 'Kolik', navTracking: 'Analiz/Takip', navVoice: 'Sesim',

    /* Genel */
    timer: 'Zamanlayıcı', cryDetector: 'Ağlama Dedektörü',
    colicDetector: 'Kolik Kriz Dedektörü', whenStop: 'Ne zaman dursun?',
    playing: 'Çalınıyor...', storyPlaying: 'Hikaye anlatılıyor...',
    ready: 'Hazır', loopBadge: '🔁 Döngü',

    /* Bölüm başlıkları */
    sectionLullabiesTR: 'Türk Ninnileri',
    sectionLullabiesEN: 'English Lullabies',
    sectionVoiceLullabies: 'Sesimle Ninniler',
    sectionStories: 'Uyku Masalları',
    sectionWhiteNoise: 'Beyaz Gürültü',
    sectionNature: 'Doğa Sesleri',
    sectionRelaxing: 'Rahatlatıcı Sesler',
    sectionTodayStats: 'Bugünün İstatistikleri',
    sectionSleepChart: 'Uyku Grafiği (Son 7 Gün)',
    sectionRecentSleeps: 'Son Uykular',
    sectionExpertTips: 'Uzman Önerileri',
    sectionMyRecordings: 'Kayıtlarım',
    sectionVoiceCloning: 'Ses Klonlama',
    sectionReadWithVoice: 'Sesimle Oku',

    /* Premium */
    trialBadge: '3 Gün Ücretsiz', premiumBadge: 'Premium',
    lockedBadge: 'Premium', trialHeader: 'Deneme',
    trialActive: (d) => `${d} gün ücretsiz deneme kaldı`,
    trialSub: 'Tüm premium özellikleri deneyin',
    upgradeBtn: 'Yükselt',
    premiumTitle: 'Minik Uyku – LumiBaby Premium',
    premiumSub: 'Bebeğiniz için en iyi uyku deneyimi',
    premiumF1: 'Sınırsız Hikaye',            premiumF1s: '1 dakika önizleme sınırı kalkar',
    premiumF2: 'Otomatik Dedektör',          premiumF2s: 'Gece boyunca dinler, ağlayınca ninni başlatır',
    premiumF3: 'Uyku Skoru & Analiz',        premiumF3s: '7 günlük grafik ve trend yorumları',
    premiumF4: 'Anne Sesi — Çok Yakında',    premiumF4s: 'Kendi sesinle ninni (geliştiriliyor)',
    premiumF5: 'Sınırsız Kullanım',          premiumF5s: 'Tüm içerikler ve özellikler açık',
    upgradeFull: "Premium'a Yükselt", cancelNow: 'Şimdilik İptal',
    monthly: 'Aylık', yearly: 'Yıllık',
    yearlySave: 'Yıllık tasarruf',

    /* Uyku takibi */
    trackingAwake: 'Bebek uyanık', trackingAsleep: 'Bebek uyuyor',
    sleepWent: 'Uykuya Geçti', wakeUp: 'Uyandı',
    totalSleep: 'Toplam Uyku', sleepCount: 'Uyku Sayısı',
    average: 'Ortalama', wakeCount: 'Uyanma',
    noSleepRecords: 'Henüz uyku kaydı yok',

    /* Ses */
    noRecordings: 'Henüz kayıt yok', noCloneFirst: 'Önce ses kaydı yapın',
    cloneFromVoice: '"Sesim" sekmesinden sesinizi klonlayın',
    voiceLabel: 'Anne Sesli', voiceDesc: 'Sizin klonlanmış sesinizle',
    recordingInstruction: 'Masal okur gibi yavaş ve sıcak bir tonla okuyun. (1 dakika önerilir):',
    tapToRecord: 'Kayıt başlatmak için dokunun',
    recording: 'Kayıt yapılıyor...',
    recordSaved: '✓ Kayıt kaydedildi',
    recordSavedToast: '✓ Kayıt kaydedildi!',
    recordName: 'Kayıt',
    deleteConfirm: 'Bu kaydı silmek istediğinize emin misiniz?',
    micRequired: 'Mikrofon erişimi gerekli: ',
    demoCloneReady: 'Demo klon hazır. Yayın öncesi backend ile gerçek klon bağlayın.',
    cloning: 'Ses klonlanıyor...',

    /* Ağlama analizi */
    whyCrying: '🩺 Bebek neden ağlıyor?',
    cryDesc: '10 saniye dinleyip olasılık dağılımı gösterir.',
    cryEstimate: 'Tahmin · tanı değil',
    cryBtn: '🎙 10 sn analiz et',
    cryListening: (s) => 'Dinleniyor... ' + s + ' sn',
    cryNote: 'Bu sonuçlar tıbbi teşhis değildir. Açlık, gaz, uykusuzluk, alt ıslaklığı veya kaka rahatsızlığı için fikir vermek üzere tasarlanmıştır.',
    cryResultNote: 'İlk sıradaki sonuç en olası tahmindir.',
    micPermRequired: 'Mikrofon izni gerekiyor.',
    cryLabels: { hunger:'Açlık', gas:'Gaz', sleepy:'Uykusuzluk', pee:'Islak Bez', poop:'Bez Rahatsızlığı' },

    /* Ayarlar */
    settingsTitle: 'Bebek Ayarları', settingsDesc: 'Kişiselleştirilmiş deneyim için',
    babyNameLabel: 'Bebeğinizin Adı', birthDateLabel: 'Doğum Tarihi',
    save: 'Kaydet',
    settingsExample: (n) => `Örnek: "Uyu <strong style="color:var(--mint)">${n}</strong>'m, tatlı rüyalar gör..."`,

    /* Onboarding */
    ob: {
      title0:'Dilini seç', desc0:'Uygulamayı Türkçe ya da English olarak başlat.',
      title1:'Ağlamayı daha iyi anla', desc1:'10 saniyelik dinleme ile ağlamayı olasılık olarak yorumla.',
      title2:'Kendi sesinle uyut', desc2:'Ses kaydı al, klonunu hazırla ve bebeğin ninnileri senin sesinle dinlesin.',
      title3:'3 gün ücretsiz dene', desc3:'Uyku takibi, ninniler, masallar ve analiz özelliklerini dene.',
      card1a:'Açlık mı?', card1b:'Önce en olası nedeni gösterir.', card1c:'Tek dokunuşla çözüm', card1d:'Sonuçtan sonra ninni veya rahatlatıcı ses başlat.',
      card2a:'Ses kaydı', card2b:'Sessiz ortamda yaklaşık 1 dakika kayıt önerilir.', card2c:'Kişisel bağ', card2d:'İsimle hitap edilen ninniler daha sıcak hissettirir.',
      card3a:'Uyku takibi', card3b:'Oturumları kaydet ve basit analizleri gör.', card3c:'Hazırsan başlayalım', card3d:'Dili daha sonra da değiştirebilirsin.',
      babyNameLabel:'Bebek adı', babyNamePlaceholder:'Örn: Ayşe / Emma',
      next:'İleri', back:'Geri', start:'Başla',
    },

    /* Toast / bildirimler */
    langSet: 'Dil Türkçe olarak ayarlandı',
    welcomeToast: 'Hoş geldiniz! 3 günlük denemeniz başladı.',
    premiumSim: '🎉 Premium simülasyonu aktif edildi.',
    timesUp: '⏱️ Süre doldu! Sınırsız dinlemek için Premium\'a yükseltin.',
    settingsSaved: '✓ Ayarlar kaydedildi',
    unlimited: 'Sınırsız', trial: 'Deneme', locked: 'Kilitli',
    free: 'ÜCRETSİZ',
    ageOptions: ['0-3 ay', '3-6 ay', '6-12 ay', '1+ yaş'],
  },

  en: {
    appName: 'Minik Uyku',
    baby: 'Baby',
    premium: 'Premium',

    navLullabies: 'Lullabies', navStories: 'Stories',
    navColic: 'Colic', navTracking: 'Analysis', navVoice: 'My Voice',

    timer: 'Timer', cryDetector: 'Cry Detector',
    colicDetector: 'Colic Detector', whenStop: 'When should it stop?',
    playing: 'Playing...', storyPlaying: 'Story is playing...',
    ready: 'Ready', loopBadge: '🔁 Loop',

    sectionLullabiesTR: 'English Lullabies',
    sectionLullabiesEN: 'English Lullabies',
    sectionVoiceLullabies: 'Lullabies In My Voice',
    sectionStories: 'Bedtime Stories',
    sectionWhiteNoise: 'White Noise',
    sectionNature: 'Nature Sounds',
    sectionRelaxing: 'Soothing Sounds',
    sectionTodayStats: "Today's Statistics",
    sectionSleepChart: 'Sleep Chart (Last 7 Days)',
    sectionRecentSleeps: 'Recent Sleeps',
    sectionExpertTips: 'Expert Tips',
    sectionMyRecordings: 'My Recordings',
    sectionVoiceCloning: 'Voice Cloning',
    sectionReadWithVoice: 'Read In My Voice',

    trialBadge: '3 Day Trial', premiumBadge: 'Premium',
    lockedBadge: 'Premium', trialHeader: 'Trial',
    trialActive: (d) => `${d} day${d===1?'':'s'} free trial left`,
    trialSub: 'Try all premium features',
    upgradeBtn: 'Upgrade',
    premiumTitle: 'Minik Uyku – LumiBaby Premium',
    premiumSub: 'The best sleep experience for your baby',
    premiumF1: 'Unlimited Stories',              premiumF1s: '1 minute preview limit removed',
    premiumF2: 'Auto Detector',                  premiumF2s: 'Listens all night, starts lullaby when crying',
    premiumF3: 'Sleep Score & Analysis',         premiumF3s: '7-day chart and trend insights',
    premiumF4: 'Your Voice — Coming Soon',       premiumF4s: 'Lullabies in your own voice (in development)',
    premiumF5: 'Unlimited Access',               premiumF5s: 'All content and features unlocked',
    upgradeFull: 'Upgrade to Premium', cancelNow: 'Not Now',
    monthly: 'Monthly', yearly: 'Yearly',
    yearlySave: 'Yearly saving',

    trackingAwake: 'Baby is awake', trackingAsleep: 'Baby is sleeping',
    sleepWent: 'Fell Asleep', wakeUp: 'Woke Up',
    totalSleep: 'Total Sleep', sleepCount: 'Sleep Sessions',
    average: 'Average', wakeCount: 'Wake Ups',
    noSleepRecords: 'No sleep records yet',

    noRecordings: 'No recordings yet', noCloneFirst: 'Please record your voice first',
    cloneFromVoice: 'Clone your voice from the "My Voice" tab',
    voiceLabel: 'My Voice', voiceDesc: 'With your cloned voice',
    recordingInstruction: 'Read slowly in a warm, natural storytelling tone. (1 minute recommended):',
    tapToRecord: 'Tap to start recording',
    recording: 'Recording...',
    recordSaved: '✓ Recording saved',
    recordSavedToast: '✓ Recording saved!',
    recordName: 'Recording',
    deleteConfirm: 'Are you sure you want to delete this recording?',
    micRequired: 'Microphone access required: ',
    demoCloneReady: 'Demo clone ready. Connect a backend before release.',
    cloning: 'Cloning voice...',

    whyCrying: '🩺 Why is the baby crying?',
    cryDesc: 'Listens for 10 seconds and shows a probability estimate.',
    cryEstimate: 'Estimate · not a diagnosis',
    cryBtn: '🎙 Analyze for 10 sec',
    cryListening: (s) => 'Listening... ' + s + ' sec',
    cryNote: 'These results are not a medical diagnosis. They are designed to offer a rough estimate for hunger, gas, sleepiness, wet diaper, or diaper discomfort.',
    cryResultNote: 'The top row is the most likely estimate.',
    micPermRequired: 'Microphone permission is required.',
    cryLabels: { hunger:'Hunger', gas:'Gas', sleepy:'Sleepiness', pee:'Wet Diaper', poop:'Dirty Diaper' },

    settingsTitle: 'Baby Settings', settingsDesc: 'For a personalized experience',
    babyNameLabel: "Baby's Name", birthDateLabel: 'Birth Date',
    save: 'Save',
    settingsExample: (n) => `Example: "Sleep, <strong style="color:var(--mint)">${n}</strong>, sweet dreams..."`,

    ob: {
      title0:'Choose your language', desc0:'Start the app in Turkish or English.',
      title1:'Understand crying better', desc1:'Listen for 10 seconds and estimate Hunger, Gas, Sleepiness and Other as probabilities.',
      title2:'Soothe with your own voice', desc2:'Record your voice, prepare a clone, and let your baby hear lullabies in your voice.',
      title3:'Try free for 3 days', desc3:'Explore sleep tracking, lullabies, stories and analysis features.',
      card1a:'Could it be hunger?', card1b:'Shows the most likely reason first.', card1c:'One-tap action', card1d:'Start a lullaby or soothing sound right after the result.',
      card2a:'Voice recording', card2b:'A quiet 1-minute recording is recommended.', card2c:'Personal touch', card2d:'Name-based wording feels warmer and more personal.',
      card3a:'Sleep tracking', card3b:'Save sessions and view simple analysis.', card3c:'Ready to begin?', card3d:'You can change the language later as well.',
      babyNameLabel:'Baby name', babyNamePlaceholder:'Ex: Emma / Noah',
      next:'Next', back:'Back', start:'Start',
    },

    langSet: 'Language set to English',
    welcomeToast: 'Welcome! Your 3-day trial has started.',
    premiumSim: '🎉 Premium simulation activated.',
    timesUp: '⏱️ Time is up! Upgrade to Premium for unlimited listening.',
    settingsSaved: '✓ Settings saved',
    unlimited: 'Unlimited', trial: 'Trial', locked: 'Locked',
    free: 'FREE',
    ageOptions: ['0-3 mo', '3-6 mo', '6-12 mo', '1+ yrs'],
  }
};

/* ── t() — çeviri fonksiyonu ─────────────────────────────────── */
window.t = function(key) {
  const lang = state.language || 'tr';
  const parts = key.split('.');
  let val = I18N[lang];
  for (const p of parts) { val = val && val[p]; }
  return (val !== undefined && val !== null) ? val : key;
};

/* ── Dil değiştir ────────────────────────────────────────────── */
window.setLanguage = function(lang, silent) {
  state.language = lang;
  saveStateRaw('minikuyku_lang', lang);
  document.documentElement.lang = lang;
  updateLanguageUI();
  if (!silent) showToast(t('langSet'));
};
