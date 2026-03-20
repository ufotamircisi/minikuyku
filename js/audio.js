/* audio.js | Ses çalma, kayıt, ElevenLabs, Web Audio API */
'use strict';

function audioSrc(file) {
  return (CONFIG.SOUNDS_CDN || '') + file;
}
function averageArray(arr) {
  return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
}

/* ── Tümünü durdur ───────────────────────────────────────────── */
window.stopAll = function() {
  // Sync stop — tüm sesi anında durdur
  try {
    if (state.currentAudio) {
      state.currentAudio.pause();
      state.currentAudio.currentTime = 0;
      state.currentAudio = null;
    }
    if (state.audioElement) {
      state.audioElement.pause();
      state.audioElement = null;
    }
  } catch(e) {}

  if (state.audioNodes && state.audioNodes.length) {
    state.audioNodes.forEach(n => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch(e) {} });
    state.audioNodes = [];
  }
  if (state.audioContext) {
    try { state.audioContext.close(); } catch(e) {}
    state.audioContext = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (state.progressInterval) { clearInterval(state.progressInterval); state.progressInterval = null; }

  state.isPlaying = false;
  state.currentTrack = null;

  document.querySelectorAll('.card').forEach(c => c.classList.remove('playing'));
  document.querySelectorAll('.play-btn').forEach(b => { b.innerHTML = '▶'; b.classList.remove('playing'); });
  document.querySelectorAll('.kolik-item').forEach(c => c.classList.remove('playing'));
  document.querySelectorAll('.kolik-play').forEach(b => { b.innerHTML = '▶'; b.classList.remove('playing'); });
  document.querySelectorAll('.now-playing').forEach(np => np.classList.remove('show'));
  document.querySelectorAll('.progress-fill').forEach(p => p.style.width = '0%');
};

/* ── Now playing göster ──────────────────────────────────────── */
window.showNowPlaying = function(page, emoji, title, subtitle) {
  const npId = page === 'ninniler' ? 'np-ninniler' : page === 'hikayeler' ? 'np-hikayeler' : 'np-kolik';
  // Bir sonraki frame'de göster — stopAll DOM güncellemesinin tamamlanmasını bekle
  requestAnimationFrame(function() {
    const np = document.getElementById(npId);
    if (!np) return;
    const ic = np.querySelector('.np-icon');
    const ti = np.querySelector('.np-title');
    const su = np.querySelector('.np-subtitle');
    if (ic) ic.textContent = emoji;
    if (ti) ti.textContent = title;
    if (su) su.textContent = subtitle;
    np.classList.add('show');
  });
};

/* ── Play UI ─────────────────────────────────────────────────── */
window.updatePlayUI = function(id, cardPfx, btnPfx, playing) {
  const card = document.getElementById(cardPfx + id);
  const btn  = document.getElementById(btnPfx  + id);
  if (card) card.classList.toggle('playing', playing);
  if (btn)  { btn.innerHTML = playing ? '⏸' : '▶'; btn.classList.toggle('playing', playing); }
};

/* ── Ninni çal ───────────────────────────────────────────────── */
let _lastLullabyCall = 0;
window.playLullaby = async function(id) {
  // 400ms debounce — çift tıklamayı önle
  const now = Date.now();
  if (now - _lastLullabyCall < 400) return;
  _lastLullabyCall = now;

  const wasPlaying = state.isPlaying;
  const wasId      = state.currentTrack;

  stopAll(); // sync — anında durur

  // Aynı ninni → toggle (sadece durdur)
  if (wasPlaying && wasId === id) return;

  const lullaby = getActiveLullabies().find(l => l.id === id);
  if (!lullaby) return;

  state.currentTrack = id;
  state.isPlaying    = true;
  updatePlayUI(id, 'card-', 'btn-', true);
  showNowPlaying('ninniler', lullaby.emoji, lullaby.name, t('playing'));

  if (lullaby.file) {
    const audio = new Audio(audioSrc(lullaby.file));
    state.currentAudio = audio;
    audio.onended = () => {
      updatePlayUI(id, 'card-', 'btn-', false);
      document.querySelectorAll('.now-playing').forEach(n => n.classList.remove('show'));
      state.isPlaying = false;
      state.currentTrack = null;
    };
    audio.onerror = () => {
      updatePlayUI(id, 'card-', 'btn-', false);
      state.isPlaying = false;
      state.currentTrack = null;
      document.querySelectorAll('.now-playing').forEach(n => n.classList.remove('show'));
    };
    try { await audio.play(); } catch(e) {
      updatePlayUI(id, 'card-', 'btn-', false);
      state.isPlaying = false;
      state.currentTrack = null;
    }
    return;
  }
  try { await generateSpeech(injectBabyName(lullaby.text), id, 'ninniler'); }
  catch(e) { fallbackTTS(injectBabyName(lullaby.text)); }
};

/* ── Hikaye çal ─────────────────────────────────────────────── */
let _lastStoryCall = 0;
window.playStory = async function(id) {
  const now = Date.now();
  if (now - _lastStoryCall < 300) return;
  _lastStoryCall = now;

  const wasPlaying = state.isPlaying;
  const wasId      = state.currentTrack;

  stopAll(); // sync

  if (wasPlaying && wasId === 's'+id) return;

  const story = getActiveStories().find(s => s.id === id);
  if (!story) return;

  state.currentTrack = 's'+id;
  state.isPlaying    = true;
  showNowPlaying('hikayeler', story.emoji, story.title, t('storyPlaying'));

  const prefix = state.babyName
    ? state.babyName + ', ' + (state.language==='tr' ? 'sana bir masal anlatacağım. ' : 'I will tell you a bedtime story. ')
    : (state.language==='tr' ? 'Tatlım, sana bir masal anlatacağım. ' : 'Sweetheart, I will tell you a bedtime story. ');
  const text = prefix + story.text;

  if (story.file) {
    const audio = new Audio(audioSrc(story.file));
    state.currentAudio = audio;
    audio.onended = () => {
      document.querySelectorAll('.now-playing').forEach(n => n.classList.remove('show'));
      state.isPlaying = false; state.currentTrack = null;
    };
    try { await audio.play(); } catch(e) { fallbackTTS(text); }
    return;
  }
  try { await generateSpeech(text, 's'+id, 'hikayeler'); }
  catch(e) { fallbackTTS(text); }
};


