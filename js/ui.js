/* ═══════════════════════════════════════════════════════════════
   ui.js  |  Render fonksiyonları & dil UI güncellemesi
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Ninni listesi ───────────────────────────────────────────── */
window.renderLullabies = function() {
  const list = document.getElementById('lullabies-list');
  if (!list) return;
  list.innerHTML = getActiveLullabies().map(l => `
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
  renderVoiceLullabies();
};

/* ── Sesle ninni listesi ─────────────────────────────────────── */
window.renderVoiceLullabies = function() {
  const list = document.getElementById('voice-lullabies-list');
  if (!list) return;
  if (!state.clonedVoiceId) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🎙️</div><div class="empty-text">${t('cloneFromVoice')}</div></div>`;
    return;
  }
  const vLabel = t('voiceLabel');
  const vDesc  = t('voiceDesc');
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

/* ── Kolik listesi ───────────────────────────────────────────── */
window.renderKolik = function() {
  ['beyaz','doga','rahat'].forEach(key => {
    const el = document.getElementById('kolik-' + key);
    if (!el) return;
    el.innerHTML = KOLIK_SOUNDS[key].map(s => {
      const tr = state.language === 'tr' ? KOLIK_TR[s.id] : KOLIK_EN[s.id];
      const name = tr?.name || s.name;
      const desc = tr?.desc || s.desc;
      return `<div class="kolik-item" id="kitem-${s.id}" onclick="playKolik('${s.id}')">
        <span class="kolik-icon">${s.emoji}</span>
        <div class="kolik-info"><div class="kolik-name">${name}</div><div class="kolik-desc">${desc}</div></div>
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
  const section = document.getElementById('clone-section');
  if (!section) return;
  if (!state.recordings.length) {
    section.innerHTML = `<div class="empty-state"><div class="empty-text">${t('noCloneFirst')}</div></div>`;
    return;
  }
  section.innerHTML = `
    <div class="clone-box">
      <div class="input-group">
        <label class="input-label">${state.language==='tr'?'Ses Kaydı Seç':'Select Recording'}</label>
        <select class="input-field" id="clone-select">
          ${state.recordings.map(r=>`<option value="${r.id}">${r.name} (${formatTime(r.duration)})</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <label class="input-label">${state.language==='tr'?'Ses İsmi (isteğe bağlı)':'Voice Name (optional)'}</label>
        <input class="input-field" id="clone-name" placeholder="${state.language==='tr'?'Annenin Sesi':'My Voice'}" maxlength="30">
      </div>
      <button class="btn-secondary" id="clone-btn" onclick="cloneVoice()" type="button">
        🎙 ${state.language==='tr'?'Sesi Klonla':'Clone Voice'}
      </button>
      <div class="status-msg" id="clone-status"></div>
    </div>`;
};

/* ── Kayıt cümleleri ─────────────────────────────────────────── */
function updatePhraseSets() {
  const ps = PHRASE_SETS[state.language] || PHRASE_SETS.tr;
  const titleEl = document.querySelector('.phrase-title');
  if (titleEl) titleEl.textContent = ps.title;
  const phrases = document.querySelectorAll('.phrase');
  ps.lines.forEach((line, i) => { if (phrases[i]) phrases[i].textContent = line; });
  const voiceText = document.getElementById('voice-text');
  if (voiceText) {
    voiceText.placeholder = ps.placeholder;
    if (!voiceText.dataset.userEdited) voiceText.value = ps.defaultText;
  }
}

/* ── Toast ───────────────────────────────────────────────────── */
window.showToast = function(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
};

/* ── Modal ───────────────────────────────────────────────────── */
window.closeModal = function(id) {
  document.getElementById(id)?.classList.remove('show');
};
window.closeModalOnBackdrop = function(e) {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
};
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

/* ── Dil UI komple güncelle ──────────────────────────────────── */
window.updateLanguageUI = function() {
  document.documentElement.lang = state.language;
  const isTR = state.language === 'tr';

  // Header dil butonları
  document.getElementById('lang-tr')?.classList.toggle('active', isTR);
  document.getElementById('lang-en')?.classList.toggle('active', !isTR);

  // Logo
  const logoText = document.querySelector('.logo-text');
  if (logoText) logoText.textContent = t('appName');

  // Baby name
  updateBabyNameDisplay();

  // Nav etiketleri
  const navLabels   = document.querySelectorAll('.nav .nav-label');
  const btmLabels   = document.querySelectorAll('.bottom-nav .bottom-label');
  const navKeys     = ['navLullabies','navStories','navColic','navTracking','navVoice'];
  [navLabels, btmLabels].forEach(group => {
    navKeys.forEach((k,i) => { if (group[i]) group[i].textContent = t(k); });
  });

  // Timer butonları
  const timerBtns = document.querySelectorAll('#page-ninniler .timer-btn');
  if (timerBtns[0]) timerBtns[0].innerHTML = '⏱ ' + t('timer');
  if (timerBtns[1]) timerBtns[1].innerHTML = '🎙 ' + t('cryDetector');
  if (timerBtns[2]) timerBtns[2].innerHTML = '🌿 ' + t('colicDetector');
  const stopLabel = document.querySelector('#timer-picker > div');
  if (stopLabel) stopLabel.textContent = t('whenStop');

  // Analiz kartı
  _setST('.pill-inline',                             t('cryEstimate'));
  _setST('#page-ninniler .analysis-card .np-title',  t('whyCrying'));
  const cryDesc = document.querySelector('#page-ninniler .analysis-card .card-desc');
  if (cryDesc) cryDesc.textContent = t('cryDesc');
  _setST('#cry-analysis-btn',                        t('cryBtn'));
  _setST('#page-ninniler .analysis-card .soft-note', t('cryNote'));

  // Now playing altyazıları
  _setST('#np-subtitle',     t('ready'));
  _setST('#np-hik-subtitle', t('ready'));
  const npKolSub = document.querySelector('#page-kolik .np-subtitle');
  if (npKolSub) npKolSub.textContent = t('unlimited') + ' · ' + t('free');

  // Bölüm başlıkları
  _setSectionTitle('#page-ninniler  .section-title:nth-child(1)', isTR ? t('sectionLullabiesTR') : t('sectionLullabiesEN'));
  _setSectionTitle('#page-ninniler  .section-title:nth-child(2)', t('sectionVoiceLullabies'));
  _setSectionTitle('#page-hikayeler .section-title:first-child',  t('sectionStories'));
  const kolTitles = document.querySelectorAll('#page-kolik .section-title');
  _setNodeText(kolTitles[0], t('sectionWhiteNoise'));
  _setNodeText(kolTitles[1], t('sectionNature'));
  _setNodeText(kolTitles[2], t('sectionRelaxing'));
  const takTitles = document.querySelectorAll('#page-takip .section-title');
  _setNodeText(takTitles[0], t('sectionTodayStats'));
  _setNodeText(takTitles[1], t('sectionSleepChart'));
  _setNodeText(takTitles[2], t('sectionRecentSleeps'));
  _setNodeText(takTitles[3], t('sectionExpertTips'));
  const sesTitles = document.querySelectorAll('#page-sesim .section-title');
  _setNodeText(sesTitles[0], t('sectionMyRecordings'));
  _setNodeText(sesTitles[1], t('sectionVoiceCloning'));
  _setNodeText(sesTitles[2], t('sectionReadWithVoice'));

  // Uyku takibi
  const sleepStatus = document.getElementById('sleep-status');
  if (sleepStatus) sleepStatus.textContent = state.sleepTracking.active ? t('trackingAsleep') : t('trackingAwake');
  const sleepBtn = document.getElementById('sleep-btn');
  if (sleepBtn) sleepBtn.innerHTML = state.sleepTracking.active ? `<span>☀️</span> ${t('wakeUp')}` : `<span>😴</span> ${t('sleepWent')}`;
  const statLabels = ['totalSleep','sleepCount','average','wakeCount'];
  ['#stat-total','#stat-count','#stat-avg','#stat-wake'].forEach((sel,i)=>{
    const lbl = document.querySelector(sel+' + .stat-label');
    if (lbl) lbl.textContent = t(statLabels[i]);
  });

  // Kayıt ekranı
  _setST('#record-status', state.isRecording ? t('recording') : t('tapToRecord'));
  updatePhraseSets();

  // Yaş seçenekleri
  const ageOpts = document.querySelectorAll('.age-option');
  const ageArr  = t('ageOptions');
  ageOpts.forEach((o,i) => { if (ageArr[i]) o.textContent = ageArr[i]; });

  // Ayarlar modal
  updateSettingsModal();

  // Render listeler
  renderLullabies();
  renderStories();
  renderKolik();
  renderRecordings();
  updateCloneSection();
  renderExpertTips();
  updatePremiumUI();
  updateTrialUI();
};

function updateSettingsModal() {
  _setST('#settings-modal div[style*="font-family"]', t('settingsTitle'));
  _setST('#settings-modal div[style*="font-size: 13px"]', t('settingsDesc'));
  const labels = document.querySelectorAll('#settings-modal .input-label');
  if (labels[0]) labels[0].textContent = t('babyNameLabel');
  if (labels[1]) labels[1].textContent = t('birthDateLabel');
  const saveBtn = document.querySelector('#settings-modal .btn-primary');
  if (saveBtn) saveBtn.textContent = t('save');
  const example = document.getElementById('settings-example-text');
  if (example) example.innerHTML = t('settingsExample')(state.babyName || (state.language==='tr'?'Ayşe':'Emma'));
  const babyInput = document.getElementById('baby-name-input');
  if (babyInput) babyInput.placeholder = state.language==='tr'?'Ayşe / Emma':'Emma / Noah';
}

/* ── Yardımcı ────────────────────────────────────────────────── */
function _setST(selector, text) {
  const el = document.querySelector(selector);
  if (el && text != null) el.textContent = text;
}

function _setNodeText(el, text) {
  if (!el || text == null) return;
  if (el.childNodes[0]?.nodeType === Node.TEXT_NODE) {
    el.childNodes[0].textContent = text + ' ';
  } else {
    el.insertBefore(document.createTextNode(text + ' '), el.firstChild);
  }
}

// Not used via querySelector for section titles under page containers
// because dynamic content may change child positions;
// use _setNodeText with direct element references instead.

/* ── Onboarding dil güncellemesi ─────────────────────────────── */
window.updateOnboardingLanguage = function() {
  const ob = t('ob');
  document.getElementById('ob-btn-tr')?.classList.toggle('active', state.language==='tr');
  document.getElementById('ob-btn-en')?.classList.toggle('active', state.language==='en');

  ['0','1','2','3'].forEach(i => {
    const tEl = document.getElementById('ob-title-'+i);
    const dEl = document.getElementById('ob-desc-'+i);
    if (tEl) tEl.textContent = ob['title'+i];
    if (dEl) dEl.textContent = ob['desc'+i];
  });
  ['1a','1b','1c','1d','2a','2b','2c','2d','3a','3b','3c','3d'].forEach(k => {
    const el = document.getElementById('ob-card-'+k);
    if (el) el.textContent = ob['card'+k];
  });
  const nameLabel = document.querySelector('#app-onboarding .input-label');
  if (nameLabel) nameLabel.textContent = ob.babyNameLabel;
  const nameInput = document.getElementById('onboard-baby-name');
  if (nameInput) nameInput.placeholder = ob.babyNamePlaceholder;
  const startBtn = document.querySelector('#app-onboarding .ob-slide[data-step="3"] .btn-primary');
  if (startBtn) startBtn.textContent = ob.start;
  document.querySelectorAll('#app-onboarding .ob-actions .btn-primary').forEach((b,i) => {
    if (i < 3) b.textContent = ob.next;
  });
  document.querySelectorAll('#app-onboarding .ghost-btn').forEach(b => b.textContent = ob.back);
};
