/* ═══════════════════════════════════════════════════════════════
   audio.js  |  Ses çalma, kayıt, ElevenLabs, Web Audio API
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Yardımcı ────────────────────────────────────────────────── */
function audioSrc(file) {
  const base = CONFIG.SOUNDS_CDN || '';
  return base ? base + file : file;
}

function averageArray(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

/* ── Tümünü durdur ───────────────────────────────────────────── */
window.stopAll = async function() {
  try {
    if (state.currentAudio) { state.currentAudio.pause(); state.currentAudio.currentTime = 0; state.currentAudio.src = ''; state.currentAudio = null; }
    if (state.audioElement) { state.audioElement.pause(); state.audioElement.currentTime = 0; state.audioElement.src = ''; state.audioElement = null; }
  } catch(e) {}

  if (state.audioNodes?.length) {
    state.audioNodes.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch(e) {} });
    state.audioNodes = [];
  }
  if (state.audioContext) { try { await state.audioContext.close(); } catch(e) {} state.audioContext = null; }
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

/* ── Şu an çalıyor göster ────────────────────────────────────── */
window.showNowPlaying = function(page, emoji, title, subtitle) {
  const npId = page === 'ninniler' ? 'np-ninniler' : page === 'hikayeler' ? 'np-hikayeler' : 'np-kolik';
  const np = document.getElementById(npId);
  if (!np) return;
  np.classList.add('show');
  const iconEl  = np.querySelector('.np-icon');
  const titleEl = np.querySelector('.np-title');
  const subEl   = np.querySelector('.np-subtitle');
  if (iconEl)  iconEl.textContent  = emoji;
  if (titleEl) titleEl.textContent = title;
  if (subEl)   subEl.textContent   = subtitle;
};

/* ── Play UI güncelle ────────────────────────────────────────── */
window.updatePlayUI = function(id, cardPrefix, btnPrefix, playing) {
  const card = document.getElementById(cardPrefix + id);
  const btn  = document.getElementById(btnPrefix + id);
  if (card) card.classList.toggle('playing', playing);
  if (btn)  { btn.innerHTML = playing ? '⏸' : '▶'; btn.classList.toggle('playing', playing); }
};

/* ── Ninni çal ───────────────────────────────────────────────── */
window.playLullaby = async function(id) {
  const lullaby = getActiveLullabies().find(l => l.id === id);
  if (!lullaby) return;
  await stopAll();
  state.currentTrack = id; state.isPlaying = true;
  updatePlayUI(id, 'card-', 'btn-', true);
  showNowPlaying('ninniler', lullaby.emoji, lullaby.name, t('playing'));

  if (lullaby.file) {
    const audio = new Audio(audioSrc(lullaby.file));
    state.currentAudio = audio;
    audio.onended = () => { updatePlayUI(id,'card-','btn-',false); document.querySelectorAll('.now-playing').forEach(n=>n.classList.remove('show')); state.isPlaying=false; state.currentTrack=null; };
    audio.onerror = () => fallbackTTS(injectBabyName(lullaby.text));
    try { await audio.play(); } catch(e) { fallbackTTS(injectBabyName(lullaby.text)); }
    return;
  }
  try { await generateSpeech(injectBabyName(lullaby.text), id, 'ninniler'); }
  catch(e) { fallbackTTS(injectBabyName(lullaby.text)); }
};

/* ── Hikaye çal ──────────────────────────────────────────────── */
window.playStory = async function(id) {
  const story = getActiveStories().find(s => s.id === id);
  if (!story) return;
  await stopAll();
  state.currentTrack = 's'+id; state.isPlaying = true;
  showNowPlaying('hikayeler', story.emoji, story.title, t('storyPlaying'));

  const prefix = state.babyName
    ? `${state.babyName}, ` + (state.language === 'tr' ? 'sana bir masal anlatacağım. ' : 'I will tell you a bedtime story. ')
    : (state.language === 'tr' ? 'Tatlım, sana bir masal anlatacağım. ' : 'Sweetheart, I will tell you a bedtime story. ');
  const text = prefix + story.text;

  if (story.file) {
    const audio = new Audio(audioSrc(story.file));
    state.currentAudio = audio;
    audio.onended = () => { document.querySelectorAll('.now-playing').forEach(n=>n.classList.remove('show')); state.isPlaying=false; state.currentTrack=null; };
    try { await audio.play(); } catch(e) { fallbackTTS(text); }
    return;
  }
  try { await generateSpeech(text, 's'+id, 'hikayeler'); }
  catch(e) { fallbackTTS(text); }
};

/* ── İsim enjeksiyonu ────────────────────────────────────────── */
window.injectBabyName = function(text) {
  if (!state.babyName || !text) return text;
  return text.replace(/bebeğim/gi, state.babyName + '\'m')
             .replace(/tatlım/gi, state.babyName);
};

/* ── ElevenLabs TTS ──────────────────────────────────────────── */
window.generateSpeech = async function(text, trackId, page) {
  const key = CONFIG.ELEVENLABS_API_KEY;
  if (!key) { fallbackTTS(text); return; }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${CONFIG.DEFAULT_VOICE_ID}/stream`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.75, similarity_boost: 0.75 } })
    });
    if (!res.ok) { fallbackTTS(text); return; }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const audio = new Audio(url);
    state.currentAudio = audio;
    audio.onended = () => { URL.revokeObjectURL(url); state.isPlaying=false; state.currentTrack=null; document.querySelectorAll('.now-playing').forEach(n=>n.classList.remove('show')); };
    await audio.play();
  } catch(e) { fallbackTTS(text); }
};

/* ── Tarayıcı TTS (fallback) ─────────────────────────────────── */
window.fallbackTTS = function(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = state.language === 'tr' ? 'tr-TR' : 'en-US';
  u.rate  = 0.8; u.pitch = 1.1;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => v.lang.includes(state.language === 'tr' ? 'tr' : 'en'));
  if (v) u.voice = v;
  u.onend = () => { if (state.isPlaying) fallbackTTS(text); };
  window.speechSynthesis.speak(u);
};

/* ── Ses klonlama çal ────────────────────────────────────────── */
window.playVoiceLullaby = async function(id) {
  const lullaby = getActiveLullabies().find(l => l.id === id);
  if (!lullaby) return;
  await stopAll();
  state.currentTrack = 'v'+id; state.isPlaying = true;
  updatePlayUI(id, 'vcard-', 'vbtn-', true);
  showNowPlaying('ninniler', '🎙️', lullaby.name + ' – ' + t('voiceLabel'), t('playing'));
  await generateSpeech(injectBabyName(lullaby.text), 'v'+id, 'ninniler');
};

/* ══════════════════════════════════════════════════════════════
   KAYIT
   ══════════════════════════════════════════════════════════════ */
window.toggleRecording = function() {
  if (state.isRecording) stopRecording(); else startRecording();
};

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.mediaRecorder   = new MediaRecorder(stream);
    state.recordingChunks = [];

    state.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) state.recordingChunks.push(e.data); };
    state.mediaRecorder.onstop = () => { saveRecording(); stream.getTracks().forEach(t => t.stop()); };
    state.mediaRecorder.start();
    state.isRecording = true; state.recordingSeconds = 0;

    document.getElementById('record-btn').classList.add('recording');
    document.getElementById('record-status').textContent = t('recording');

    state.recordingInterval = setInterval(() => {
      state.recordingSeconds++;
      const el = document.getElementById('record-timer');
      if (el) el.textContent = formatTime(state.recordingSeconds);
      if (state.recordingSeconds >= CONFIG.MAX_RECORDING_SECONDS) stopRecording();
      animateWaveform();
    }, 1000);

    setupWaveformVisualization(stream);
  } catch(err) {
    alert(t('micRequired') + err.message);
  }
}

function stopRecording() {
  if (!state.isRecording) return;
  state.mediaRecorder.stop();
  state.isRecording = false;
  clearInterval(state.recordingInterval);
  document.getElementById('record-btn').classList.remove('recording');
  document.getElementById('record-status').textContent = t('recordSaved');
  if (state.waveformContext) { state.waveformContext.close(); state.waveformContext = null; }
}

function saveRecording() {
  const blob = new Blob(state.recordingChunks, { type: 'audio/webm' });
  const reader = new FileReader();
  reader.onloadend = () => {
    const rec = {
      id: 'rec_' + Date.now(),
      name: t('recordName') + ' ' + (state.recordings.length + 1),
      data: reader.result,
      duration: state.recordingSeconds,
      createdAt: Date.now()
    };
    state.recordings.push(rec);
    saveState('minikuyku_recordings', state.recordings);
    renderRecordings();
    updateCloneSection();
    showToast(t('recordSavedToast'));
  };
  reader.readAsDataURL(blob);
}

window.playRecording = function(id) {
  const rec = state.recordings.find(r => r.id === id);
  if (rec) new Audio(rec.data).play();
};

window.deleteRecording = function(id) {
  if (!confirm(t('deleteConfirm'))) return;
  state.recordings = state.recordings.filter(r => r.id !== id);
  saveState('minikuyku_recordings', state.recordings);
  renderRecordings();
  updateCloneSection();
};

function setupWaveformVisualization(stream) {
  state.waveformContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = state.waveformContext.createAnalyser();
  analyser.fftSize = 64;
  state.waveformContext.createMediaStreamSource(stream).connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  const bars = document.querySelectorAll('.wave-bar');
  (function update() {
    if (!state.isRecording) return;
    analyser.getByteFrequencyData(data);
    bars.forEach((b, i) => { b.style.height = Math.max(4, data[i] / 2) + 'px'; });
    requestAnimationFrame(update);
  })();
}

function animateWaveform() {
  document.querySelectorAll('.wave-bar').forEach((b, i) => {
    setTimeout(() => { b.style.height = (4 + Math.random() * 30) + 'px'; }, i * 20);
  });
}

/* ── Ses klonlama ────────────────────────────────────────────── */
window.cloneVoice = async function() {
  const sel  = document.getElementById('clone-select');
  const name = document.getElementById('clone-name')?.value?.trim() || (state.language === 'tr' ? 'Annenin Sesi' : 'My Voice');
  if (!sel?.value) { showStatus('clone-status','error', state.language==='tr'?'Lütfen bir kayıt seçin':'Please select a recording'); return; }
  const rec = state.recordings.find(r => r.id === sel.value);
  if (!rec) return;

  document.getElementById('clone-btn').disabled = true;
  showStatus('clone-status','loading', t('cloning'));

  if (!CONFIG.ELEVENLABS_API_KEY) {
    state.clonedVoiceId = 'demo-clone'; state.cloneReady = true;
    saveStateRaw('minikuyku_voice_id', 'demo-clone');
    saveState('minikuyku_clone_ready', true);
    showStatus('clone-status','success', t('demoCloneReady'));
    document.getElementById('clone-btn').disabled = false;
    document.getElementById('voice-generator').style.display = 'block';
    renderVoiceLullabies();
    return;
  }

  try {
    const blob = await (await fetch(rec.data)).blob();
    const fd = new FormData();
    fd.append('name', name); fd.append('files', blob, 'voice.webm');
    const res = await fetch('https://api.elevenlabs.io/v1/voices/add', { method:'POST', headers:{'xi-api-key': CONFIG.ELEVENLABS_API_KEY}, body: fd });
    const data = await res.json();
    state.clonedVoiceId = data.voice_id; state.cloneReady = true;
    saveStateRaw('minikuyku_voice_id', data.voice_id);
    saveState('minikuyku_clone_ready', true);
    showStatus('clone-status','success', state.language==='tr'?'Ses klonu hazır! Ninniler sekmesinde kullanabilirsiniz.':'Voice clone ready! Use it in the Lullabies tab.');
    document.getElementById('voice-generator').style.display = 'block';
    renderVoiceLullabies();
  } catch(e) {
    showStatus('clone-status','error', state.language==='tr'?'Klonlama başarısız: '+e.message:'Cloning failed: '+e.message);
  } finally {
    document.getElementById('clone-btn').disabled = false;
  }
};

window.speakWithClonedVoice = async function() {
  const text = document.getElementById('voice-text')?.value?.trim();
  if (!text) return;
  document.getElementById('speak-btn').disabled = true;
  showStatus('speak-status','loading', state.language==='tr'?'Ses oluşturuluyor...':'Generating voice...');
  try {
    await generateSpeech(text, 'speak', 'sesim');
    showStatus('speak-status','success', state.language==='tr'?'Çalınıyor...':'Playing...');
  } catch(e) {
    showStatus('speak-status','error', state.language==='tr'?'Hata: '+e.message:'Error: '+e.message);
  } finally {
    document.getElementById('speak-btn').disabled = false;
  }
};

/* ══════════════════════════════════════════════════════════════
   WEB AUDIO API — KOLİK SESLERİ
   ══════════════════════════════════════════════════════════════ */
window.playKolik = async function(id) {
  if (state.currentTrack === id && state.isPlaying) { await stopAll(); return; }
  await stopAll();

  const all  = [...KOLIK_SOUNDS.beyaz, ...KOLIK_SOUNDS.doga, ...KOLIK_SOUNDS.rahat];
  const item = all.find(s => s.id === id);
  if (!item) return;

  const tr   = state.language === 'tr' ? KOLIK_TR[id] : KOLIK_EN[id];
  const name = tr?.name || item.name;

  state.currentTrack = id; state.isPlaying = true;
  const kitem = document.getElementById('kitem-'+id);
  const kbtn  = document.getElementById('kbtn-'+id);
  if (kitem) kitem.classList.add('playing');
  if (kbtn)  { kbtn.innerHTML = '⏸'; kbtn.classList.add('playing'); }
  showNowPlaying('kolik', item.emoji, name, t('playing'));

  if (item.file) {
    const audio = new Audio(audioSrc(item.file));
    state.currentAudio = audio; audio.loop = true;
    try { await audio.play(); return; } catch(e) { /* fallback to WebAudio */ }
  }
  generateKolikSound(id);
};

function generateKolikSound(id) {
  const AC = window.AudioContext || window.webkitAudioContext;
  state.audioContext = new AC();
  const master = state.audioContext.createGain();
  master.connect(state.audioContext.destination);
  master.gain.setValueAtTime(0.3, state.audioContext.currentTime);
  state.audioNodes.push(master);
  switch(id) {
    case 'b1': createNoise(master,'pink',800);   break;
    case 'b2': createNoise(master,'brown',400);  break;
    case 'b3': createNoise(master,'white',1000); break;
    case 'b4': createNoise(master,'pink',200);   break;
    case 'd1': createNoise(master,'pink',800);   break;
    case 'd2': createWave(master);               break;
    case 'd3': createForest(master);             break;
    case 'd4': createNoise(master,'white',2000); break;
    case 'r1': createHeartbeat(master);          break;
    case 'r2': createPisPis(master);             break;
  }
}

function createNoise(dest, type, filterFreq) {
  const ctx = state.audioContext;
  const size = 2 * ctx.sampleRate;
  const buf  = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) {
    const w = Math.random() * 2 - 1;
    data[i] = type==='pink' ? (w+(data[i-1]||0))/2 : type==='brown' ? (w+(data[i-1]||0)*0.99)/2 : w;
  }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = filterFreq;
  src.connect(filter); filter.connect(dest); src.start();
  state.audioNodes.push(src, filter);
}

function createWave(dest) {
  const ctx = state.audioContext;
  const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 80;
  const gain = ctx.createGain(); gain.gain.value = 0.5;
  const lfo  = ctx.createOscillator(); lfo.frequency.value = 0.1;
  const lg   = ctx.createGain(); lg.gain.value = 0.3;
  lfo.connect(lg); lg.connect(gain.gain); osc.connect(gain); gain.connect(dest);
  osc.start(); lfo.start();
  state.audioNodes.push(osc, gain, lfo, lg);
}

function createForest(dest) {
  const ctx = state.audioContext;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 200 + i*50;
    const g = ctx.createGain(); g.gain.value = 0.1;
    osc.connect(g); g.connect(dest); osc.start();
    state.audioNodes.push(osc, g);
  }
  createNoise(dest, 'pink', 1000);
}

function createHeartbeat(dest) {
  const ctx = state.audioContext;
  const beat = () => {
    if (!state.isPlaying || state.currentTrack !== 'r1') return;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(60, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime+0.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.1);
    o.connect(g); g.connect(dest); o.start(); o.stop(ctx.currentTime+0.1);
    setTimeout(() => {
      if (!state.isPlaying) return;
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 50;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.3, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.08);
      o2.connect(g2); g2.connect(dest); o2.start(); o2.stop(ctx.currentTime+0.08);
    }, 100);
    setTimeout(beat, 800);
  };
  beat();
}

function createPisPis(dest) {
  const ctx = state.audioContext;
  const play = () => {
    if (!state.isPlaying || state.currentTrack !== 'r2') return;
    const size = ctx.sampleRate * 0.3;
    const buf  = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0;i<size;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(size*0.3));
    const src = ctx.createBufferSource(); src.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=2000; flt.Q.value=1;
    const g = ctx.createGain(); g.gain.value = 0.4;
    src.connect(flt); flt.connect(g); g.connect(dest); src.start();
    setTimeout(play, 600 + Math.random()*400);
  };
  play();
}

/* ══════════════════════════════════════════════════════════════
   AĞLAMA ANALİZİ
   ══════════════════════════════════════════════════════════════ */
window.startCryAnalysis = async function() {
  const btn    = document.getElementById('cry-analysis-btn');
  const result = document.getElementById('cry-analysis-result');
  if (!btn || !result) return;
  btn.disabled = true; result.classList.remove('show');

  try {
    const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx      = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser(); analyser.fftSize = 2048;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data    = new Uint8Array(analyser.frequencyBinCount);
    const samples = [];
    const started = Date.now();

    await new Promise(resolve => {
      const iv = setInterval(() => {
        analyser.getByteFrequencyData(data);
        samples.push({
          low:  averageArray(data.slice(2,18)),
          mid:  averageArray(data.slice(18,60)),
          high: averageArray(data.slice(60,120)),
          peak: Math.max(...data)
        });
        const left = Math.max(0, 10 - Math.floor((Date.now()-started)/1000));
        btn.textContent = t('cryListening')(left);
        if (Date.now()-started >= 10000) { clearInterval(iv); resolve(); }
      }, 250);
    });

    stream.getTracks().forEach(t => t.stop()); ctx.close();
    const analysis = classifyCrySamples(samples);
    state.cryAnalysisHistory.unshift({ at: new Date().toISOString(), analysis });
    saveState('minikuyku_cry_analysis_history', state.cryAnalysisHistory.slice(0,20));
    renderCryAnalysisResult(analysis);
  } catch(e) {
    result.innerHTML = `<div class="soft-note" style="color:var(--rose)">${t('micPermRequired')}</div>`;
    result.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.textContent = t('cryBtn');
  }
};

function classifyCrySamples(samples) {
  const aL = averageArray(samples.map(s=>s.low));
  const aM = averageArray(samples.map(s=>s.mid));
  const aH = averageArray(samples.map(s=>s.high));
  const aP = averageArray(samples.map(s=>s.peak));
  const labels = t('cryLabels');
  const raw = [
    { key:'hunger', value: 20 + aM*0.22 + aP*0.10 },
    { key:'gas',    value: 18 + aH*0.20 + (aP-aL)*0.08 },
    { key:'sleepy', value: 18 + aL*0.24 + Math.max(0,aM-aH)*0.06 },
    { key:'pee',    value: 14 + aM*0.10 + aL*0.08 },
    { key:'poop',   value: 12 + aL*0.12 + aH*0.10 },
  ];
  const total = raw.reduce((a,b)=>a+b.value,0)||1;
  let norm = raw.map(r=>({ label: labels[r.key]||r.key, value: Math.round(r.value*100/total) }));
  const diff = 100 - norm.reduce((a,b)=>a+b.value,0);
  norm[0].value += diff;
  return norm.sort((a,b)=>b.value-a.value);
}

function renderCryAnalysisResult(analysis) {
  const el = document.getElementById('cry-analysis-result');
  if (!el) return;
  el.innerHTML = analysis.map(item => `
    <div class="analysis-row">
      <div class="analysis-label">${item.label}</div>
      <div class="analysis-bar"><div class="analysis-fill" style="width:${item.value}%"></div></div>
      <div class="analysis-pct">%${item.value}</div>
    </div>`).join('') + `<div class="soft-note">${t('cryResultNote')}</div>`;
  el.classList.add('show');
}

/* ── Zamanlayıcı ─────────────────────────────────────────────── */
window.toggleTimer = function() {
  const picker = document.getElementById('timer-picker');
  if (picker) picker.classList.toggle('show');
};

window.setTimer = function(minutes, el) {
  document.querySelectorAll('.timer-option').forEach(o => o.classList.remove('selected'));
  if (el) el.classList.add('selected');
  document.getElementById('timer-picker')?.classList.remove('show');

  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerSeconds = minutes * 60;
  const mini = document.getElementById('mini-timer');
  if (mini) mini.classList.add('show');

  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    const el2 = document.getElementById('mini-time');
    if (el2) el2.textContent = formatTime(state.timerSeconds);
    if (state.timerSeconds <= 0) {
      clearInterval(state.timerInterval);
      if (mini) mini.classList.remove('show');
      stopAll();
    }
  }, 1000);

  const timerBtn = document.querySelector('#page-ninniler .timer-btn');
  if (timerBtn) timerBtn.classList.add('active');
};

window.cancelTimer = function() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  const mini = document.getElementById('mini-timer');
  if (mini) mini.classList.remove('show');
  const timerBtn = document.querySelector('#page-ninniler .timer-btn');
  if (timerBtn) timerBtn.classList.remove('active');
};

/* ── Ağlama dedektörü ────────────────────────────────────────── */
window.toggleCryDetector = async function() {
  const btn = document.getElementById('cry-detector-btn');
  if (state.cryDetector.active) {
    _stopDetector('cryDetector');
    if (btn) btn.classList.remove('active');
    return;
  }
  try {
    const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx      = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser(); analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    state.cryDetector = { active:true, stream, context:ctx, analyser,
      interval: setInterval(() => {
        analyser.getByteFrequencyData(data);
        const avg = averageArray(data);
        if (avg > 40) showToast(state.language==='tr'?'🎙 Ağlama tespit edildi!':'🎙 Crying detected!');
      }, 2000)
    };
    if (btn) btn.classList.add('active');
  } catch(e) { alert(t('micRequired') + e.message); }
};

window.toggleKolikDetector = async function() {
  const btn = document.getElementById('kolik-detector-btn');
  if (state.kolikDetector.active) {
    _stopDetector('kolikDetector');
    if (btn) btn.classList.remove('active');
    return;
  }
  try {
    const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx      = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser(); analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    state.kolikDetector = { active:true, stream, context:ctx, analyser,
      interval: setInterval(() => {
        analyser.getByteFrequencyData(data);
        const high = averageArray(data.slice(60,120));
        if (high > 35) showToast(state.language==='tr'?'🌿 Kolik belirtisi tespit edildi!':'🌿 Colic pattern detected!');
      }, 3000)
    };
    if (btn) btn.classList.add('active');
  } catch(e) { alert(t('micRequired') + e.message); }
};

function _stopDetector(key) {
  const d = state[key];
  if (!d) return;
  clearInterval(d.interval);
  d.stream?.getTracks().forEach(t => t.stop());
  d.context?.close().catch(()=>{});
  state[key] = { active:false, stream:null, context:null, analyser:null, interval:null };
}

/* ── Yardımcı ────────────────────────────────────────────────── */
window.formatTime = function(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
};

window.showStatus = function(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'status-msg show status-' + type;
  el.innerHTML = type==='loading' ? `<div class="spinner"></div> ${msg}` : msg;
};
