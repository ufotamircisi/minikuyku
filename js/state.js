/* ═══════════════════════════════════════════════════════════════
   state.js  |  Merkezi uygulama durumu
   ═══════════════════════════════════════════════════════════════ */
'use strict';

window.state = {
  // Dil & kullanıcı
  language    : localStorage.getItem('minikuyku_lang')      || 'tr',
  babyName    : localStorage.getItem('minikuyku_baby_name') || '',
  babyBirthDate: localStorage.getItem('minikuyku_birthdate')|| '',
  onboarded   : JSON.parse(localStorage.getItem('minikuyku_onboarded') || 'false'),

  // Premium & deneme
  isPremium   : JSON.parse(localStorage.getItem('minikuyku_premium')    || 'false'),
  trialStart  : localStorage.getItem('minikuyku_trial_start')           || null,

  // Ses
  currentPage  : 'ninniler',
  isPlaying    : false,
  currentTrack : null,
  currentAudio : null,
  audioElement : null,
  audioContext : null,
  audioNodes   : [],
  progressInterval: null,

  // Kayıt
  isRecording       : false,
  mediaRecorder     : null,
  recordingSeconds  : 0,
  recordingChunks   : [],
  recordingInterval : null,
  waveformContext   : null,
  recordings        : JSON.parse(localStorage.getItem('minikuyku_recordings') || '[]'),
  clonedVoiceId     : localStorage.getItem('minikuyku_voice_id')  || null,
  cloneReady        : JSON.parse(localStorage.getItem('minikuyku_clone_ready') || 'false'),

  // Zamanlayıcı
  timerInterval : null,
  timerSeconds  : 0,

  // Dedektörler
  cryDetector  : { active: false, stream: null, context: null, analyser: null, interval: null },
  kolikDetector: { active: false, stream: null, context: null, analyser: null, interval: null },

  // Uyku takibi
  sleepTracking : {
    active    : false,
    startTime : null,
    history   : JSON.parse(localStorage.getItem('minikuyku_sleep_history') || '[]')
  },
  sleepInterval  : null,
  currentAgeGroup: 0,

  // Ağlama analizi
  cryAnalysisHistory: JSON.parse(localStorage.getItem('minikuyku_cry_analysis_history') || '[]'),

  // Lazy init takibi
  _initializedPages: { ninniler: false }
};

/* ── Yardımcı kayıt fonksiyonları ───────────────────────────── */
window.saveState = function(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
};
window.saveStateRaw = function(key, value) {
  try { localStorage.setItem(key, value); } catch(e) {}
};
