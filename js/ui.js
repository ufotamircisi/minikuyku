/* ui.js | Render & dil UI */
'use strict';

/* ── Ninni listesi ───────────────────────────────────────────── */
window.renderLullabies = function() {
  const list = document.getElementById('lullabies-list');
  if (!list) return;
  const lullabies = getActiveLullabies();
  if (!lullabies.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">🎵</div><div class="empty-text">Yakında...</div></div>';
    return;
  }
  list.innerHTML = lullabies.map(l => `
    <div class="card" id="card-${l.id}" onclick="playLullaby('${l.id}')">
      <span class="card-icon">${l.emoji}</span>
      <div class="card-content">
        <div class="card-title">${l.name}</div>
        <div class="card-desc">${l.desc}</div>
        <div class="card-tags">
          <span class="card-tag">${l.origin}</span>
          <span class="card-tag premium">${hasAccess() ? ('✨ '+t('trialBadge')) : ('👑 '+t('lockedBadge'))}</span>
        </div>
      </div>
      <button class="play-btn" id="btn-${l.id}" type="button" onclick="event.stopPropagation();playLullaby('${l.id}')">▶</button>
    </div>`).join('');
  // onclick kartın kendisinde ve butonda — debounce çift tetiklenmeyi önler
  renderVoiceLullabies();
};

/* ── Sesle ninni ─────────────────────────────────────────────── */
window.renderVoiceLullabies = function() {
  const list = document.getElementById('voice-lullabies-list');
  if (!list) return;
  if (!state.clonedVoiceId) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🎙️</div><div class="empty-text">${t('cloneFromVoice')}</div></div>`;
    return;
  }
  const vLabel = t('voiceLabel'), vDesc = t('voiceDesc');
  list.innerHTML = getActiveLullabies().map(l => `
    <div class="card" id="vcard-${l.id}" onclick="playVoiceLullaby('${l.id}')">
      <span class="card-icon">🎙️</span>
      <div class="card-content">
        <div class="card-title">${l.name} <span style="color:var(--gold);font-size:12px">${vLabel}</span></div>
        <div class="card-desc">${vDesc}</div>
      </div>
      <button class="play-btn" id="vbtn-${l.id}" type="button" onclick="event.stopPropagation();playVoiceLullaby('${l.id}')">▶</button>
    </div>`).join('');
};

/* ── Hikaye listesi ──────────────────────────────────────────── */
window.renderStories = function() {
  const list = document.getElementById('stories-list');
  if (!list) return;
  list.innerHTML = getActiveStories().map(s => `
    <div class="story-card" id="story-${s.id}" onclick="playStory('${s.id}')">
      <div class="story-header">
        <span class="story-emoji">${s.emoji}</span>
        <div class="story-content"><h3>${s.title}</h3><p>${s.desc}</p></div>
      </div>
      <div class="story-footer">
        <span class="card-tag">${s.age}</span>
        <span class="card-tag">${s.duration}</span>
        <span class="card-tag">${s.type}</span>
        <span class="card-tag premium">${hasAccess() ? ('✨ '+t('trialBadge')) : ('👑 '+t('lockedBadge'))}</span>
      </div>
    </div>`).join('');
};

/* ── Kolik ───────────────────────────────────────────────────── */
window.renderKolik = function() {
  ['beyaz','doga','rahat'].forEach(key => {
    const el = document.getElementById('kolik-' + key);
    if (!el) return;
    el.innerHTML = KOLIK_SOUNDS[key].map(s => {
      const loc = state.language === 'tr' ? KOLIK_TR[s.id] : KOLIK_EN[s.id];
      return `<div class="kolik-item" id="kitem-${s.id}" onclick="playKolik('${s.id}')">
        <span class="kolik-icon">${s.emoji}</span>
        <div class="kolik-info">
          <div class="kolik-name">${loc?.name||s.name}</div>
          <div class="kolik-desc">${loc?.desc||s.desc}</div>
        </div>
        <span class="kolik-tag">${t('free')}</span>
        <button class="kolik-play" id="kbtn-${s.id}" type="button" onclick="event.stopPropagation();playKolik('${s.id}')">▶</button>
      </div>`;
    }).join('');
  });
};

/* ── Kayıt listesi ───────────────────────────────────────────── */
window.renderRecordings = function() {
  const list = document.getElementById('recordings-list');
  if (!list) return;
  if (!state.recordings.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🎙️</div><div class="empty-text">${t('noRecordings')}</div></div>`;
    return;
  }
  const locale = state.language === 'tr' ? 'tr-TR' : 'en-US';
  list.innerHTML = state.recordings.map(r => `
    <div class="recording-item">
      <span class="rec-icon">🎙️</span>
      <div class="rec-info">
        <div class="rec-name">${r.name}</div>
        <div class="rec-meta">${formatTime(r.duration)} · ${new Date(r.createdAt||Date.now()).toLocaleDateString(locale)}</div>
      </div>
      <div class="rec-actions">
        <button class="rec-btn play" onclick="playRecording('${r.id}')" type="button">▶</button>
        <button class="rec-btn delete" onclick="deleteRecording('${r.id}')" type="button">🗑</button>
      </div>
    </div>`).join('');
};

/* ── Klon bölümü ─────────────────────────────────────────────── */
window.updateCloneSection = function() {
  // Ses klonlama şu an "Çok Yakında" — override etme
  // Sadece dil güncellemesi yap
  const isTR = state.language === 'tr';
  const cloneSoonTitle = document.getElementById('clone-soon-title');
  const cloneSoonDesc  = document.getElementById('clone-soon-desc');
  const cloneLock      = document.getElementById('clone-lock-text');
  const cloneDiscover  = document.getElementById('clone-discover-btn');
  const cloneInfo      = document.getElementById('clone-info-text');
  if (cloneSoonTitle) cloneSoonTitle.textContent = isTR
    ? 'Bebeğin annenin sesiyle uyusun'
    : 'Let your baby sleep in your voice';
  if (cloneSoonDesc) cloneSoonDesc.textContent = isTR
    ? 'Kendi sesinle söylediğin ninnilerle bebeğin daha hızlı sakinleşsin ve huzurla uyusun'
    : 'With lullabies in your own voice, your baby will calm down faster and sleep peacefully';
  if (cloneLock) cloneLock.textContent = isTR
    ? '🔒 Premium\'a özel – çok yakında'
    : '🔒 Premium only – coming soon';
  if (cloneDiscover) cloneDiscover.textContent = isTR
    ? '👑 Premium\'u Keşfet'
    : '👑 Discover Premium';
  if (cloneInfo) cloneInfo.textContent = isTR
    ? 'ℹ️ Bu özellik şu anda geliştiriliyor. İlk olarak Premium kullanıcılar erişebilecek.'
    : 'ℹ️ This feature is under development. Premium users will get early access.';
};

/* ── Kayıt cümleleri ─────────────────────────────────────────── */
function updatePhraseSets() {
  const ps = PHRASE_SETS[state.language] || PHRASE_SETS.tr;
  const titleEl = document.querySelector('.phrase-title');
  if (titleEl) titleEl.textContent = ps.title;
  document.querySelectorAll('.phrase').forEach((el, i) => { if (ps.lines[i]) el.textContent = ps.lines[i]; });
  const vt = document.getElementById('voice-text');
  if (vt) { vt.placeholder = ps.placeholder; if (!vt.dataset.userEdited) vt.value = ps.defaultText; }
}

/* ── Toast ───────────────────────────────────────────────────── */
window.showToast = function(msg) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
};

/* ── Modaller ────────────────────────────────────────────────── */
window.closeModal = function(id) { document.getElementById(id)?.classList.remove('show'); };
window.closeModalOnBackdrop = function(e) { if (e.target===e.currentTarget) e.currentTarget.classList.remove('show'); };
window.showSettings = function() {
  const inp = document.getElementById('baby-name-input');
  if (inp) inp.value = state.babyName || '';
  const dob = document.getElementById('baby-birthdate');
  if (dob) dob.value = state.babyBirthDate || '';
  updateSettingsModal();
  document.getElementById('settings-modal').classList.add('show');
};
window.saveBabySettings = function() {
  const name = document.getElementById('baby-name-input')?.value?.trim();
  const dob  = document.getElementById('baby-birthdate')?.value;
  if (name) { state.babyName = name; saveStateRaw('minikuyku_baby_name', name); }
  if (dob)  { state.babyBirthDate = dob; saveStateRaw('minikuyku_birthdate', dob); calculateAgeGroup(); }
  updateBabyNameDisplay();
  closeModal('settings-modal');
  showToast(t('settingsSaved'));
};
window.updateBabyNameDisplay = function() {
  const el = document.getElementById('baby-name-display');
  if (el) el.textContent = state.babyName || t('baby');
};

/* ── Ayarlar modal içeriği ───────────────────────────────────── */
function updateSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  const titleEl = modal.querySelector('.settings-title');
  const descEl  = modal.querySelector('.settings-desc');
  if (titleEl) titleEl.textContent = t('settingsTitle');
  if (descEl)  descEl.textContent  = t('settingsDesc');
  const labels = modal.querySelectorAll('.input-label');
  if (labels[0]) labels[0].textContent = t('babyNameLabel');
  if (labels[1]) labels[1].textContent = t('birthDateLabel');
  const saveBtn = modal.querySelector('.btn-primary');
  if (saveBtn) saveBtn.textContent = '💾 ' + t('save');
  const example = document.getElementById('settings-example-text');
  if (example) example.innerHTML = t('settingsExample')(state.babyName || (state.language==='tr'?'Ayşe':'Emma'));
  const babyInp = document.getElementById('baby-name-input');
  if (babyInp) babyInp.placeholder = state.language==='tr'?'Ayşe / Emma':'Emma / Noah';
  const resetBtn = document.getElementById('reset-ob-btn');
  if (resetBtn) resetBtn.textContent = state.language==='tr' ? 'Karşılama ekranını göster' : 'Show welcome screen';
}

/* ── Dil UI — tüm sayfayı güncelle ──────────────────────────── */
window.updateLanguageUI = function() {
  document.documentElement.lang = state.language;
  const isTR = state.language === 'tr';

  // Header
  document.getElementById('lang-tr')?.classList.toggle('active', isTR);
  document.getElementById('lang-en')?.classList.toggle('active', !isTR);
  const logoText = document.querySelector('.logo-text');
  if (logoText) logoText.textContent = t('appName');
  updateBabyNameDisplay();

  // Nav etiketleri
  const navKeys = ['navLullabies','navStories','navColic','navTracking','navVoice'];
  [document.querySelectorAll('.nav .nav-label'), document.querySelectorAll('.bottom-nav .bottom-label')]
    .forEach(group => navKeys.forEach((k,i) => { if (group[i]) group[i].textContent = t(k); }));

  // Timer & dedektör butonları
  const timerBtns = document.querySelectorAll('#page-ninniler .timer-btn');
  if (timerBtns[0]) timerBtns[0].innerHTML = '⏱ ' + t('timer');
  if (timerBtns[1]) timerBtns[1].innerHTML = '🎙 ' + t('cryDetector');
  if (timerBtns[2]) timerBtns[2].innerHTML = '🌿 ' + t('colicDetector');
  const stopLabel = document.querySelector('#timer-picker > div');
  if (stopLabel) stopLabel.textContent = t('whenStop');

  // Analiz kartı
  const pill = document.querySelector('.pill-inline');
  if (pill) pill.textContent = t('cryEstimate');
  const cryTitle = document.querySelector('#page-ninniler .analysis-card [data-i18n="whyCrying"]');
  if (cryTitle) cryTitle.textContent = t('whyCrying');
  const cryDesc = document.querySelector('#page-ninniler .analysis-card [data-i18n="cryDesc"]');
  if (cryDesc) cryDesc.textContent = t('cryDesc');
  const cryBtn = document.getElementById('cry-analysis-btn');
  if (cryBtn) cryBtn.textContent = t('cryBtn');
  const cryNote = document.querySelector('#page-ninniler .analysis-card .soft-note');
  if (cryNote) cryNote.textContent = t('cryNote');

  // Now playing
  const npSub = document.getElementById('np-subtitle');
  if (npSub && !state.isPlaying) npSub.textContent = t('ready');
  const npHikSub = document.getElementById('np-hik-subtitle');
  if (npHikSub && !state.isPlaying) npHikSub.textContent = t('ready');
  const npKolSub = document.querySelector('#np-kol-subtitle');
  if (npKolSub) npKolSub.textContent = t('unlimited') + ' · ' + t('free');

  // Analiz sayfası başlık & alt yazı
  const analysisTitle = document.getElementById('analysis-main-title');
  const analysisSub   = document.getElementById('analysis-main-sub');
  if (analysisTitle) analysisTitle.textContent = state.language === 'tr'
    ? '🎙 Ses Tabanlı Tahmini Uyku Analizi'
    : '🎙 Sound-Based Sleep Analysis (Estimated)';
  if (analysisSub) analysisSub.textContent = state.language === 'tr'
    ? '(Bu veriler mikrofon sesine dayalı tahmindir, tıbbi teşhis değildir.)'
    : '(These are estimates based on microphone sound, not medical diagnosis.)';

  // Tahmin kartı
  const predTitle = document.getElementById('prediction-title-text');
  if (predTitle) predTitle.textContent = state.language === 'tr' ? 'Sonraki Uyku Tahmini' : 'Next Sleep Prediction';
  const predDesc = document.getElementById('prediction-desc-text');
  if (predDesc) predDesc.textContent = state.language === 'tr' ? 'Geçmiş verilere göre tahmini uyku saati:' : 'Estimated next sleep time based on history:';

  // Bölüm başlıkları — güvenli güncelleme
  _st('lullaby-section-title',   isTR ? t('sectionLullabiesTR') : t('sectionLullabiesEN'));
  _st('voice-section-title',     t('sectionVoiceLullabies'));
  _st('stories-section-title',   t('sectionStories'));
  _st('whitenoise-section-title',t('sectionWhiteNoise'));
  const kolikFreeBadge = document.getElementById('kolik-free-badge');
  if (kolikFreeBadge) kolikFreeBadge.textContent = t('free');
  const vcBadge = document.getElementById('voiceclone-badge');
  if (vcBadge) vcBadge.textContent = '👑 ' + t('premium');

  // Ses klonlama "Çok Yakında" çevirisi
  const isTR2 = state.language === 'tr';
  const cloneSoonTitle = document.getElementById('clone-soon-title');
  const cloneSoonDesc  = document.getElementById('clone-soon-desc');
  const cloneSoonBadge = document.getElementById('clone-soon-badge');
  if (cloneSoonTitle) cloneSoonTitle.textContent = isTR2
    ? 'Bebeğin annenin sesiyle uyusun'
    : 'Let your baby sleep in your voice';
  if (cloneSoonDesc) cloneSoonDesc.textContent = isTR2
    ? 'Kendi sesinle söylediğin ninnilerle bebeğin daha hızlı sakinleşsin ve huzurla uyusun'
    : 'With lullabies sung in your own voice, your baby will calm down faster and sleep peacefully';
  const cloneLock = document.getElementById('clone-lock-text');
  if (cloneLock) cloneLock.textContent = isTR2
    ? '🔒 Premium\'a özel – çok yakında'
    : '🔒 Premium only – coming soon';
  const cloneDiscover = document.getElementById('clone-discover-btn');
  if (cloneDiscover) cloneDiscover.textContent = isTR2 ? '👑 Premium\'u Keşfet' : '👑 Discover Premium';
  const cloneInfo = document.getElementById('clone-info-text');
  if (cloneInfo) cloneInfo.textContent = isTR2
    ? 'ℹ️ Bu özellik şu anda geliştiriliyor. İlk olarak Premium kullanıcılar erişebilecek.'
    : 'ℹ️ This feature is under development. Premium users will get early access.';
  const cloneHeart = document.getElementById('clone-heart');
  if (cloneHeart) cloneHeart.textContent = '💜';
  _st('nature-section-title',    t('sectionNature'));
  _st('relax-section-title',     t('sectionRelaxing'));
  _st('todaystats-section-title',t('sectionTodayStats'));
  _st('sleepchart-section-title',t('sectionSleepChart'));
  _st('recentsleep-section-title',t('sectionRecentSleeps'));
  _st('experttips-section-title',t('sectionExpertTips'));
  _st('recordings-section-title',t('sectionMyRecordings'));
  _st('voiceclone-section-title',t('sectionVoiceCloning'));
  _st('readvoice-section-title', t('sectionReadWithVoice'));

  // Trial banner
  const trialTitle = document.getElementById('trial-title');
  if (trialTitle) trialTitle.textContent = t('trialActive')(getTrialDaysLeft());
  const trialSub = document.getElementById('trial-subtitle');
  if (trialSub) trialSub.textContent = t('trialSub');
  const trialBtn = document.querySelector('#trial-banner .header-btn');
  if (trialBtn) trialBtn.textContent = t('upgradeBtn');

  // Uyku takibi
  const sleepStatus = document.getElementById('sleep-status');
  if (sleepStatus) sleepStatus.textContent = state.sleepTracking.active ? t('trackingAsleep') : t('trackingAwake');
  const sleepBtn = document.getElementById('sleep-btn');
  if (sleepBtn) sleepBtn.innerHTML = state.sleepTracking.active ? `<span>☀️</span> ${t('wakeUp')}` : `<span>😴</span> ${t('sleepWent')}`;
  ['totalSleep','sleepCount','average','wakeCount'].forEach((k,i) => {
    const lbl = document.querySelector(['#stat-total','#stat-count','#stat-avg','#stat-wake'][i]+' + .stat-label');
    if (lbl) lbl.textContent = t(k);
  });

  // Uyku listesi boş metin
  const emptySleep = document.querySelector('#sleep-list .empty-text');
  if (emptySleep) emptySleep.textContent = t('noSleepRecords');

  // Sesim
  const recStatus = document.getElementById('record-status');
  if (recStatus && !state.isRecording) recStatus.textContent = t('tapToRecord');
  updatePhraseSets();

  // Yaş seçenekleri
  const ageArr = t('ageOptions');
  document.querySelectorAll('.age-option').forEach((o,i) => { if (ageArr[i]) o.textContent = ageArr[i]; });

  // Timer seçenekleri (dk/min)
  const minLabel = state.language === 'tr' ? ' dk' : ' min';
  document.querySelectorAll('.timer-option[data-min]').forEach(el => {
    el.textContent = el.getAttribute('data-min') + minLabel;
  });

  // Mini timer label
  const miniLabel = document.querySelector('.mini-label');
  if (miniLabel) miniLabel.textContent = isTR ? ' sonra kapanacak' : ' until stop';
  const miniCancel = document.querySelector('.mini-cancel');
  if (miniCancel) miniCancel.textContent = isTR ? 'İptal' : 'Cancel';

  updateSettingsModal();
  renderLullabies();
  renderStories();
  renderKolik();
  renderRecordings();
  updateCloneSection();
  renderExpertTips();
  updatePremiumUI();
  updateTrialUI();
  updateOnboardingLanguage();
};

/* ── Bölüm başlığı güvenli güncelleme ───────────────────────── */
function _st(id, text) {
  const el = document.getElementById(id);
  if (!el || text == null) return;
  // İlk text node'u güncelle, badge span'ını koru
  if (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) {
    el.firstChild.textContent = text + ' ';
  } else {
    el.insertBefore(document.createTextNode(text + ' '), el.firstChild);
  }
}

/* ── Onboarding dil güncellemesi ─────────────────────────────── */
window.updateOnboardingLanguage = function() {
  const ob = t('ob');
  if (!ob || typeof ob !== 'object') return;
  document.getElementById('ob-btn-tr')?.classList.toggle('active', state.language==='tr');
  document.getElementById('ob-btn-en')?.classList.toggle('active', state.language==='en');
  ['0','1','2','3'].forEach(i => {
    const tEl = document.getElementById('ob-title-'+i);
    const dEl = document.getElementById('ob-desc-'+i);
    if (tEl && ob['title'+i]) tEl.textContent = ob['title'+i];
    if (dEl && ob['desc'+i])  dEl.textContent = ob['desc'+i];
  });
  ['1a','1b','1c','1d','2a','2b','2c','2d','3a','3b','3c','3d'].forEach(k => {
    const el = document.getElementById('ob-card-'+k);
    if (el && ob['card'+k]) el.textContent = ob['card'+k];
  });
  const nameLabel = document.querySelector('#app-onboarding .input-label');
  if (nameLabel) nameLabel.textContent = ob.babyNameLabel || '';
  const nameInput = document.getElementById('onboard-baby-name');
  if (nameInput) nameInput.placeholder = ob.babyNamePlaceholder || '';
  document.querySelectorAll('#app-onboarding .ghost-btn').forEach(b => { b.textContent = ob.back || 'Geri'; });
  document.querySelectorAll('#app-onboarding .ob-actions .btn-primary').forEach((b, i, arr) => {
    b.textContent = (i === arr.length - 1 && b.getAttribute('onclick')?.includes('finishOnboarding')) ? (ob.start||'Başla') : (ob.next||'İleri');
  });
};
