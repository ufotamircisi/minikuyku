/* tracking.js | Uyku takibi, gece oturumu, skor, analiz */
'use strict';

/* ════════════════════════════════════════════════════════════════
   UYKU BAŞLAT / BİTİR (Manuel)
   ════════════════════════════════════════════════════════════════ */
window.toggleSleep = function() {
  if (state.sleepTracking.active) _endSleep();
  else _startSleep();
  renderSleepStats();
};

function _startSleep() {
  state.sleepTracking.active    = true;
  state.sleepTracking.startTime = Date.now();
  const statusEl = document.getElementById('sleep-status');
  const btnEl    = document.getElementById('sleep-btn');
  if (statusEl) statusEl.textContent = t('trackingAsleep');
  if (btnEl)    btnEl.innerHTML = `<span>🌅</span> ${t('wakeUp')}`;
  state.sleepInterval = setInterval(() => {
    const secs  = Math.floor((Date.now() - state.sleepTracking.startTime) / 1000);
    const clock = document.getElementById('sleep-clock');
    if (clock) clock.textContent = formatTime(secs);
  }, 1000);

  // Gece oturumunu hemen başlat (mod seçimi olmadan da kayıt edilsin)
  state.nightSession = {
    active: true,
    startTime: Date.now(),
    mode: null,
    events: [],
    wakeCount: 0,
    calmTimes: [],
    lastWakeTime: null,
    lastCalmTime: null,
  };
  saveState('minikuyku_night_session', state.nightSession);

  // Gece modu seçici göster
  _showNightModeSelector();
}

function _endSleep() {
  if (!state.sleepTracking.startTime) return;
  clearInterval(state.sleepInterval);
  const duration = Math.floor((Date.now() - state.sleepTracking.startTime) / 1000);
  const entry = { start: state.sleepTracking.startTime, end: Date.now(), duration };
  state.sleepTracking.history.unshift(entry);
  state.sleepTracking.history = state.sleepTracking.history.slice(0, 100);
  saveState('minikuyku_sleep_history', state.sleepTracking.history);
  state.sleepTracking.active    = false;
  state.sleepTracking.startTime = null;
  const statusEl = document.getElementById('sleep-status');
  const btnEl    = document.getElementById('sleep-btn');
  if (statusEl) statusEl.textContent = t('trackingAwake');
  if (btnEl)    btnEl.innerHTML = `<span>😴</span> ${t('sleepWent')}`;

  // Gece oturumunu kapat ve rapor göster
  _endNightSession();
  _hideNightModeSelector();
}

/* ════════════════════════════════════════════════════════════════
   GECE MODU SEÇİCİ
   ════════════════════════════════════════════════════════════════ */
function _showNightModeSelector() {
  const sel = document.getElementById('night-mode-selector');
  if (sel) sel.style.display = 'block';
}
function _hideNightModeSelector() {
  const sel = document.getElementById('night-mode-selector');
  if (sel) sel.style.display = 'none';
}

window.selectNightMode = function(mode) {
  const isTR = state.language === 'tr';

  // Gece oturumu başlat
  if (!state.nightSession.active) {
    state.nightSession = {
      active: true,
      startTime: Date.now(),
      mode: mode,
      events: [],
      wakeCount: 0,
      calmTimes: [],
      lastWakeTime: null,
      lastCalmTime: null,
    };
    saveState('minikuyku_night_session', state.nightSession);
  } else {
    state.nightSession.mode = mode;
  }

  // Butonları güncelle
  document.querySelectorAll('.night-mode-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById('night-mode-' + mode);
  if (activeBtn) activeBtn.classList.add('active');

  // Dedektörü başlat
  if (mode === 'cry') {
    window.toggleCryDetector && toggleCryDetector();
    showToast(isTR ? '🎙 Ağlama dedektörü aktif' : '🎙 Cry detector active');
  } else if (mode === 'colic') {
    window.toggleKolikDetector && toggleKolikDetector();
    showToast(isTR ? '🌿 Kolik dedektörü aktif' : '🌿 Colic detector active');
  }
};

/* ════════════════════════════════════════════════════════════════
   GECE OTURUMU KAYIT
   ════════════════════════════════════════════════════════════════ */
window.recordNightEvent = function(type, data) {
  if (!state.nightSession.active) return;
  const event = { type, time: Date.now(), ...data };
  state.nightSession.events.push(event);

  if (type === 'wake') {
    state.nightSession.wakeCount++;
    state.nightSession.lastWakeTime = Date.now();
  } else if (type === 'calm') {
    if (state.nightSession.lastWakeTime) {
      const calmDuration = Math.floor((Date.now() - state.nightSession.lastWakeTime) / 1000 / 60);
      state.nightSession.calmTimes.push(calmDuration);
    }
    state.nightSession.lastCalmTime = Date.now();
  }
  saveState('minikuyku_night_session', state.nightSession);
};

/* ════════════════════════════════════════════════════════════════
   GECE OTURUMU SONU & RAPOR
   ════════════════════════════════════════════════════════════════ */
function _endNightSession() {
  if (!state.nightSession.active) return;
  state.nightSession.active = false;
  state.nightSession.endTime = Date.now();
  saveState('minikuyku_night_session', state.nightSession);

  // Skoru hesapla
  const wakeCount  = state.nightSession.wakeCount;
  const calmTimes  = state.nightSession.calmTimes;
  const avgCalm    = calmTimes.length ? Math.round(calmTimes.reduce((a,b)=>a+b,0)/calmTimes.length) : 0;
  const totalSec   = Math.floor((state.nightSession.endTime - state.nightSession.startTime) / 1000);
  const score      = calcNightScore(wakeCount, avgCalm, 0, totalSec);
  const evaluation = _getNightEvaluation(wakeCount, avgCalm, totalSec, state.language === 'tr');

  // Raporu kaydet
  _saveNightReport(state.nightSession, score, evaluation);

  // Raporu göster
  _showNightReport(state.nightSession);
  
  // Geçmişi güncelle
  if (typeof renderNightHistory === 'function') renderNightHistory();

  // Dedektörleri kapat
  if (state.cryDetector?.active) _stopDet && _stopDet('cryDetector');
  if (state.kolikDetector?.active) _stopDet && _stopDet('kolikDetector');
}

function _showNightReport(session) {
  const isTR = state.language === 'tr';
  if (!session.startTime) return;

  const totalSec   = Math.floor((session.endTime - session.startTime) / 1000);
  const wakeCount  = session.wakeCount;
  const calmTimes  = session.calmTimes;
  const avgCalm    = calmTimes.length ? Math.round(calmTimes.reduce((a,b)=>a+b,0)/calmTimes.length) : 0;

  // En uzun kesintisiz uyku
  let longestSleep = 0;
  let lastEvent = session.startTime;
  session.events.forEach(ev => {
    if (ev.type === 'wake') {
      const gap = Math.floor((ev.time - lastEvent) / 1000);
      if (gap > longestSleep) longestSleep = gap;
      lastEvent = ev.time;
    }
  });
  const finalGap = Math.floor((session.endTime - lastEvent) / 1000);
  if (finalGap > longestSleep) longestSleep = finalGap;

  // Uyku skoru
  const score = calcNightScore(wakeCount, avgCalm, longestSleep, totalSec);
  const status = scoreStatus(score, isTR ? 'tr' : 'en');

  // Değerlendirme
  const evaluation = _getNightEvaluation(wakeCount, avgCalm, totalSec, isTR);

  // Modal göster
  _renderNightReportModal({
    isTR, totalSec, wakeCount, avgCalm, longestSleep,
    score, status, evaluation, session
  });
}

function calcNightScore(wakeCount, avgCalm, longestSleep, totalSec) {
  let score = 100;
  score -= wakeCount * 8;
  if (avgCalm > 10) score -= 10;
  if (avgCalm < 3 && wakeCount > 0) score += 5;
  if (longestSleep >= 7200) score += 10;
  if (totalSec < 14400) score -= 15; // 4 saatten az
  return Math.max(0, Math.min(100, Math.round(score)));
}

function _getNightEvaluation(wakeCount, avgCalm, totalSec, isTR) {
  const hours = totalSec / 3600;
  if (isTR) {
    if (wakeCount === 0) return { summary: 'Bu gece hiç uyanmadı 🎉', note: 'Mükemmel bir gece!' };
    if (wakeCount <= 2 && avgCalm <= 5) return { summary: 'Bu gece oldukça sakindi', note: 'Hızlı sakinleşti, iyi bir gece.' };
    if (wakeCount <= 3) return { summary: 'Ortalama bir gece geçti', note: avgCalm > 10 ? 'Sakinleşmesi biraz uzun sürdü.' : 'Normal bir gece.' };
    if (wakeCount > 5) return { summary: 'Bu gece daha huzursuzdu', note: '02:00 sonrası daha sık uyandı.' };
    return { summary: 'Genel olarak iyi bir gece', note: 'Uyku düzeni tutarlı görünüyor.' };
  } else {
    if (wakeCount === 0) return { summary: 'No wake-ups tonight 🎉', note: 'Perfect night!' };
    if (wakeCount <= 2 && avgCalm <= 5) return { summary: 'A calm night overall', note: 'Settled quickly, good night.' };
    if (wakeCount <= 3) return { summary: 'An average night', note: avgCalm > 10 ? 'Took a bit longer to settle.' : 'Normal night.' };
    if (wakeCount > 5) return { summary: 'A more restless night', note: 'More frequent wake-ups after 2 AM.' };
    return { summary: 'Generally a good night', note: 'Sleep pattern looks consistent.' };
  }
}

function _renderNightReportModal(data) {
  const { isTR, totalSec, wakeCount, avgCalm, longestSleep, score, status, evaluation } = data;
  const isPrem = hasAccess() && state.isPremium;

  let modal = document.getElementById('night-report-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'night-report-modal';
    modal.className = 'modal show';
    modal.style.cssText = 'align-items:flex-start;padding-top:40px';
    modal.onclick = function(e) { if (e.target === modal) modal.classList.remove('show'); };
    document.body.appendChild(modal);
  }

  const L = isTR ? {
    title: '🌙 Gecelik Özet',
    close: 'Kapat',
    totalSleep: 'Toplam uyku süresi',
    wakes: 'Uyanma sayısı',
    interventions: 'Toplam müdahale',
    longestSleep: 'En uzun kesintisiz uyku',
    avgCalm: 'Ortalama sakinleşme süresi',
    nightEval: 'Gece Değerlendirmesi',
    sleepPattern: 'Uyku düzeni',
    nightSummary: 'Gece özeti',
    note: 'Not',
    sleepScore: 'Uyku Skoru',
    premiumMsg: 'Detaylı rapor, 7 günlük geçmiş ve öneriler için',
    upgradBtn: '👑 Premium\'u Keşfet',
    min: 'dk', times: 'kez'
  } : {
    title: '🌙 Night Summary',
    close: 'Close',
    totalSleep: 'Total sleep',
    wakes: 'Wake-ups',
    interventions: 'Interventions',
    longestSleep: 'Longest uninterrupted sleep',
    avgCalm: 'Avg. settling time',
    nightEval: 'Night Evaluation',
    sleepPattern: 'Sleep pattern',
    nightSummary: 'Night summary',
    note: 'Note',
    sleepScore: 'Sleep Score',
    premiumMsg: 'For detailed report, 7-day history and tips',
    upgradBtn: '👑 Discover Premium',
    min: 'min', times: 'times'
  };

  const scoreColor = score >= 85 ? 'var(--mint)' : score >= 70 ? 'var(--accent-light)' : score >= 50 ? 'var(--gold)' : 'var(--rose)';

  modal.innerHTML = `
    <div class="modal-content" style="max-height:85vh;overflow-y:auto">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:24px;font-weight:700;color:var(--accent-light)">${L.title}</div>
      </div>

      <div class="lastnight-grid" style="margin-bottom:16px">
        <div class="lastnight-item">
          <div class="lastnight-value">${formatTime(totalSec)}</div>
          <div class="lastnight-label">${L.totalSleep}</div>
        </div>
        <div class="lastnight-item">
          <div class="lastnight-value">${wakeCount} ${L.times}</div>
          <div class="lastnight-label">${L.wakes}</div>
        </div>
        <div class="lastnight-item">
          <div class="lastnight-value">${formatTime(longestSleep)}</div>
          <div class="lastnight-label">${L.longestSleep}</div>
        </div>
        <div class="lastnight-item">
          <div class="lastnight-value">${avgCalm || '--'} ${avgCalm ? L.min : ''}</div>
          <div class="lastnight-label">${L.avgCalm}</div>
        </div>
      </div>

      ${isPrem ? `
      <div class="sleep-score-container" style="display:flex;margin-bottom:16px">
        <div class="sleep-score-circle">
          <div class="sleep-score-value">${score}</div>
          <div class="sleep-score-label">${L.sleepScore}</div>
        </div>
        <div style="flex:1;padding-left:12px">
          <div style="font-size:18px;font-weight:700;color:${scoreColor}">${status.text}</div>
        </div>
      </div>

      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:16px">
        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-light)">${L.nightEval}</div>
        <div style="font-size:13px;margin-bottom:6px"><strong>${L.nightSummary}:</strong> ${evaluation.summary}</div>
        <div style="font-size:13px;color:var(--text-muted)"><strong>${L.note}:</strong> ${evaluation.note}</div>
      </div>
      ` : `
      <div style="text-align:center;padding:16px;border:1px dashed rgba(240,192,96,0.3);border-radius:var(--radius-md);margin-bottom:16px;cursor:pointer" onclick="showPremiumModal()">
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px">${L.premiumMsg}</div>
        <button class="btn-primary" style="width:auto;padding:10px 20px" type="button">${L.upgradBtn}</button>
      </div>
      `}

      <button class="btn-secondary" onclick="document.getElementById('night-report-modal').classList.remove('show')" type="button">${L.close}</button>
    </div>`;

  modal.classList.add('show');
}

/* ════════════════════════════════════════════════════════════════
   UYKU SKORU
   ════════════════════════════════════════════════════════════════ */
function calcSleepScore(sessions) {
  if (!sessions || !sessions.length) return null;
  let score = 100;
  const wakeCount = sessions.length - 1;
  score -= wakeCount * 8;
  for (let i=0; i<sessions.length-1; i++) {
    const gap = (sessions[i].start - sessions[i+1].end) / 1000 / 60;
    if (gap > 10) score -= 10;
    if (gap < 3)  score += 5;
  }
  sessions.forEach(s => { if (s.duration >= 7200) score += 10; });
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreStatus(score, lang) {
  const isTR = lang === 'tr';
  if (score >= 85) return { text: isTR ? '🌟 Çok İyi'   : '🌟 Very Good', color: 'var(--mint)' };
  if (score >= 70) return { text: isTR ? '👍 İyi'        : '👍 Good',      color: 'var(--accent-light)' };
  if (score >= 50) return { text: isTR ? '😐 Orta'       : '😐 Fair',      color: 'var(--gold)' };
  return            { text: isTR ? '😟 Düzensiz'    : '😟 Irregular', color: 'var(--rose)' };
}

/* ════════════════════════════════════════════════════════════════
   RENDER
   ════════════════════════════════════════════════════════════════ */
window.renderSleepStats = function() {
  const isTR = state.language === 'tr';
  const isPremium = hasAccess();

  const yesterday = _getLastNightSessions();
  _renderLastNight(yesterday, isTR, isPremium);
  _renderChart(isPremium);
  _renderTrend(isPremium, isTR);
  renderSleepList();
  if (typeof renderNightHistory === 'function') renderNightHistory();

  const title = document.getElementById('analysis-main-title');
  const sub   = document.getElementById('analysis-main-sub');
  if (title) title.textContent = isTR
    ? '🎙 Ses Tabanlı Tahmini Uyku Analizi'
    : '🎙 Sound-Based Sleep Analysis (Estimated)';
  if (sub) sub.textContent = isTR
    ? '(Bu veriler mikrofon sesine dayalı tahmindir, tıbbi teşhis değildir.)'
    : '(These are estimates based on microphone sound, not medical diagnosis.)';

  _st('lastnight-section-title', isTR ? 'Dün Gece' : 'Last Night');
  _st('sleepchart-section-title', isTR ? 'Son 7 Gün' : 'Last 7 Days');
  _st('recentsleep-section-title', t('sectionRecentSleeps'));
  _st('experttips-section-title', t('sectionExpertTips'));

  const chartBadge = document.getElementById('chart-badge');
  if (chartBadge) chartBadge.textContent = isPremium ? '' : '👑 Premium';

  const lnLabels = {
    total:   isTR ? 'Toplam Uyku'     : 'Total Sleep',
    wake:    isTR ? 'Uyanma'          : 'Wake-ups',
    longest: isTR ? 'En Uzun Uyku'    : 'Longest Sleep',
    calm:    isTR ? 'Ort. Sakinleşme' : 'Avg. Calm Time',
  };
  ['total','wake','longest','calm'].forEach(k => {
    const el = document.getElementById(`ln-${k}-label`);
    if (el) el.textContent = lnLabels[k];
  });

  const lockMsg = document.getElementById('score-lock-text');
  if (lockMsg) lockMsg.textContent = isTR
    ? 'Uyku skoru için Premium\'a geçin'
    : 'Upgrade to Premium for sleep score';

  // Gece modu seçici çevirisi
  _updateNightModeUI(isTR);
};

function _updateNightModeUI(isTR) {
  const nmsTitle = document.getElementById('night-mode-title');
  if (nmsTitle) nmsTitle.textContent = isTR ? '🌙 Gece modunu seçin:' : '🌙 Choose night mode:';
  const btnCry = document.getElementById('night-mode-cry');
  if (btnCry) btnCry.innerHTML = isTR
    ? '🎵 Ağlama Dedektörü<small>Ağlayınca ninni başlar</small>'
    : '🎵 Cry Detector<small>Starts lullaby when crying</small>';
  const btnColic = document.getElementById('night-mode-colic');
  if (btnColic) btnColic.innerHTML = isTR
    ? '🌿 Kolik Dedektörü<small>Ağlayınca beyaz gürültü başlar</small>'
    : '🌿 Colic Detector<small>Starts white noise when crying</small>';
}

function _getLastNightSessions() {
  const cutoff = Date.now() - 86400000;
  return state.sleepTracking.history.filter(s => s.start >= cutoff);
}

function _renderLastNight(sessions, isTR, isPremium) {
  const totalSec   = sessions.reduce((a,b)=>a+b.duration, 0);
  const wakeCount  = Math.max(0, sessions.length - 1);
  const longestSec = sessions.length ? Math.max(...sessions.map(s=>s.duration)) : 0;
  let avgCalmMin = 0;
  if (sessions.length > 1) {
    const gaps = [];
    for (let i=0; i<sessions.length-1; i++) {
      gaps.push((sessions[i].start - sessions[i+1].end) / 1000 / 60);
    }
    avgCalmMin = Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length);
  }
  _setVal('ln-total',   totalSec   ? formatTime(totalSec)   : '--');
  _setVal('ln-wake',    sessions.length ? `${wakeCount} ${isTR?'kez':'times'}` : '--');
  _setVal('ln-longest', longestSec ? formatTime(longestSec) : '--');
  _setVal('ln-calm',    avgCalmMin ? `${avgCalmMin} ${isTR?'dk':'min'}` : '--');

  const scoreContainer = document.getElementById('sleep-score-container');
  const lockMsg        = document.getElementById('score-lock-msg');
  const scoreLbl       = document.getElementById('sleep-score-label-text');

  if (isPremium && sessions.length > 0) {
    const score  = calcSleepScore(sessions);
    const status = scoreStatus(score, isTR ? 'tr' : 'en');
    _setVal('sleep-score-value', score);
    if (scoreLbl) scoreLbl.textContent = isTR ? 'Uyku Skoru' : 'Score';
    const statusEl = document.getElementById('sleep-score-status');
    if (statusEl) { statusEl.textContent = status.text; statusEl.style.color = status.color; }
    if (scoreContainer) scoreContainer.style.display = 'flex';
    if (lockMsg)        lockMsg.style.display = 'none';
  } else {
    if (scoreContainer) scoreContainer.style.display = 'none';
    if (lockMsg)        lockMsg.style.display = 'block';
    if (lockMsg)        lockMsg.onclick = showPremiumModal;
  }
}

function _renderTrend(isPremium, isTR) {
  const trendCard = document.getElementById('trend-card');
  if (!trendCard) return;
  if (!isPremium || state.sleepTracking.history.length < 3) { trendCard.style.display='none'; return; }
  const text = getTrendText(state.sleepTracking.history, state.language);
  if (text) { trendCard.style.display='flex'; const tEl=document.getElementById('trend-text'); if(tEl) tEl.textContent=text; }
  else trendCard.style.display='none';
}

function getTrendText(history, lang) {
  const isTR = lang === 'tr';
  if (history.length < 3) return null;
  const nights = _groupByNight(history);
  const nightKeys = Object.keys(nights).sort().reverse();
  if (nightKeys.length < 2) return null;
  const last=nights[nightKeys[0]]||[], prev=nights[nightKeys[1]]||[];
  const lastScore=calcSleepScore(last), prevScore=calcSleepScore(prev);
  if (lastScore && prevScore) {
    if (lastScore > prevScore+5) return isTR ? '🎉 Uyku düzeni iyileşiyor!' : '🎉 Sleep pattern is improving!';
    if (lastScore < prevScore-5) return isTR ? '⚠️ Dün geceki uyku daha iyiydi' : '⚠️ Last night was better';
  }
  const lastWake=last.length-1, prevWake=prev.length-1;
  if (lastWake > prevWake+1) return isTR ? '📈 Son gecelerde uyanma arttı' : '📈 Wake-ups increased recently';
  if (lastWake < prevWake)   return isTR ? '😴 Dün daha az uyandı!' : '😴 Fewer wake-ups last night!';
  const shortBlocks=last.filter(s=>s.duration<3600).length;
  if (shortBlocks>2) return isTR ? '⏱ Daha kısa uyku blokları oluşmuş' : '⏱ Shorter sleep blocks detected';
  return isTR ? '👍 Uyku düzeni stabil görünüyor' : '👍 Sleep pattern looks stable';
}

function _groupByNight(history) {
  const nights={};
  history.forEach(s=>{
    const d=new Date(s.start); const hour=d.getHours();
    const date=new Date(s.start); if(hour<8) date.setDate(date.getDate()-1);
    const key=date.toISOString().split('T')[0];
    if(!nights[key]) nights[key]=[];
    nights[key].push(s);
  });
  return nights;
}

function _renderChart(isPremium) {
  const container=document.getElementById('sleep-chart');
  const overlay=document.getElementById('chart-overlay');
  if (!container) return;
  const isTR=state.language==='tr';
  const dayNames=isTR?['Paz','Pzt','Sal','Çar','Per','Cum','Cmt']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const days=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);d.setHours(0,0,0,0);days.push({ts:d.getTime(),label:dayNames[d.getDay()]});}
  const totals=days.map(day=>{
    const next=day.ts+86400000;
    return state.sleepTracking.history.filter(s=>s.start>=day.ts&&s.start<next).reduce((a,b)=>a+b.duration,0);
  });
  const maxVal=Math.max(...totals,1);
  const bars=totals.map((v,i)=>{
    const pct=Math.round((v/maxVal)*100);
    const color=v>0?'linear-gradient(to top, var(--accent), var(--mint))':'rgba(255,255,255,0.05)';
    return `<div class="chart-bar" style="height:${Math.max(4,pct)}%;background:${color}" title="${days[i].label}: ${formatTime(v)}"></div>`;
  }).join('');
  const labels=days.map(d=>`<span>${d.label}</span>`).join('');
  container.innerHTML=`<div class="chart-placeholder">${bars}</div><div class="chart-labels">${labels}</div>`;
  if (overlay) {
    overlay.style.display=isPremium?'none':'flex';
    const ot=document.getElementById('chart-overlay-text');
    if(ot) ot.textContent=isTR?'7 günlük grafik için Premium\'a geçin':'Upgrade to Premium for 7-day chart';
  }
}

function renderSleepList() {
  const list=document.getElementById('sleep-list'); if(!list) return;
  if(!state.sleepTracking.history.length){
    list.innerHTML=`<div class="empty-state"><div class="empty-icon">🌙</div><div class="empty-text">${t('noSleepRecords')}</div></div>`;
    return;
  }
  const locale=state.language==='tr'?'tr-TR':'en-US';
  list.innerHTML=state.sleepTracking.history.slice(0,10).map(s=>{
    const date=new Date(s.start).toLocaleDateString(locale,{month:'short',day:'numeric'});
    const time=new Date(s.start).toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'});
    return `<div class="sleep-item"><span class="sleep-item-icon">🌙</span><div class="sleep-item-info"><div class="sleep-item-time">${date} · ${time}</div><div class="sleep-item-dur">${formatTime(s.duration)}</div></div></div>`;
  }).join('');
}

/* ════════════════════════════════════════════════════════════════
   GECE GEÇMİŞİ
   ════════════════════════════════════════════════════════════════ */
function _saveNightReport(session, score, evaluation) {
  const reports = JSON.parse(localStorage.getItem('minikuyku_night_reports') || '[]');
  reports.unshift({
    date: new Date(session.startTime).toISOString(),
    totalSec: Math.floor((session.endTime - session.startTime) / 1000),
    wakeCount: session.wakeCount,
    calmTimes: session.calmTimes,
    score: score,
    evaluation: evaluation,
    mode: session.mode
  });
  localStorage.setItem('minikuyku_night_reports', JSON.stringify(reports.slice(0, 30)));
}

window.renderNightHistory = function() {
  const list  = document.getElementById('night-history-list');
  const badge = document.getElementById('night-history-badge');
  const titleEl = document.getElementById('night-history-title');
  if (!list) return;

  const isTR   = state.language === 'tr';
  const isPrem = hasAccess() && state.isPremium;
  // Geçersiz formatları temizle (totalSec > 86400 = 24 saatten fazla = hatalı)
  let reports = JSON.parse(localStorage.getItem('minikuyku_night_reports') || '[]');
  reports = reports.filter(r => r.totalSec < 86400 && r.date && r.score !== undefined);
  localStorage.setItem('minikuyku_night_reports', JSON.stringify(reports));

  if (badge) badge.textContent = isPrem ? '' : '👑 Premium';
  // Title güncelle
  if (titleEl && titleEl.firstChild && titleEl.firstChild.nodeType === Node.TEXT_NODE)
    titleEl.firstChild.textContent = (isTR ? 'Geçmiş Geceler ' : 'Night History ');

  if (!reports.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">🌙</div><div class="empty-text">' + (isTR ? 'Henüz gece kaydı yok' : 'No night records yet') + '</div></div>';
    return;
  }

  const shown = isPrem ? reports : reports.slice(0, 1);
  const cards = shown.map((r, i) => _renderNightRow(r, isTR, i)).join('');
  const upgrade = !isPrem ? '<div class="analysis-free-upgrade" onclick="showPremiumModal()" style="margin-top:8px">👑 '+(isTR?"Tüm geçmiş için Premiyuma geçin":"Upgrade to Premium for full history")+'</div>' : '';
  list.innerHTML = '<div style="max-height:420px;overflow-y:auto;padding-right:4px">'+cards+'</div>'+upgrade;
};

window.showNightDetail = function(idx) {
  const reports = JSON.parse(localStorage.getItem('minikuyku_night_reports') || '[]');
  const r = reports[idx];
  if (!r) return;
  const isTR = state.language === 'tr';
  const score = r.score;
  const scoreColor = score >= 85 ? 'var(--mint)' : score >= 70 ? 'var(--accent-light)' : score >= 50 ? 'var(--gold)' : 'var(--rose)';
  const status = scoreStatus(score, isTR ? 'tr' : 'en');
  const avgCalm = r.calmTimes && r.calmTimes.length ? Math.round(r.calmTimes.reduce((a,b)=>a+b,0)/r.calmTimes.length) : 0;

  let modal = document.getElementById('night-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'night-detail-modal';
    modal.className = 'modal';
    modal.style.cssText = 'align-items:flex-start;padding-top:40px';
    modal.onclick = function(e) { if (e.target === modal) modal.classList.remove('show'); };
    document.body.appendChild(modal);
  }

  const L = isTR ? {
    title:'Gece Detayı', close:'Kapat',
    total:'Toplam Uyku', wakes:'Uyanma',
    calm:'Ort. Sakinleşme', score:'Uyku Skoru',
    summary:'Gece Özeti', note:'Not', min:'dk', times:'kez'
  } : {
    title:'Night Detail', close:'Close',
    total:'Total Sleep', wakes:'Wake-ups',
    calm:'Avg. Calm Time', score:'Sleep Score',
    summary:'Night Summary', note:'Note', min:'min', times:'times'
  };

  modal.innerHTML = `<div class="modal-content" style="max-height:80vh;overflow-y:auto">
    <div style="text-align:center;margin-bottom:16px;font-size:18px;font-weight:700;color:var(--accent-light)">🌙 ${L.title}</div>
    <div style="font-size:12px;color:var(--text-muted);text-align:center;margin-bottom:16px">
      ${new Date(r.date).toLocaleDateString(isTR?'tr-TR':'en-US',{weekday:'long',month:'long',day:'numeric'})}
    </div>
    <div class="lastnight-grid" style="margin-bottom:14px">
      <div class="lastnight-item"><div class="lastnight-value">${formatTime(r.totalSec)}</div><div class="lastnight-label">${L.total}</div></div>
      <div class="lastnight-item"><div class="lastnight-value">${r.wakeCount} ${L.times}</div><div class="lastnight-label">${L.wakes}</div></div>
      <div class="lastnight-item"><div class="lastnight-value">${avgCalm||'--'}${avgCalm?' '+L.min:''}</div><div class="lastnight-label">${L.calm}</div></div>
      <div class="lastnight-item"><div class="lastnight-value" style="color:${scoreColor}">${score}</div><div class="lastnight-label">${L.score}</div></div>
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:14px">
      <div style="font-weight:700;color:var(--accent-light);margin-bottom:8px">${status.text}</div>
      ${r.evaluation ? `<div style="font-size:13px;margin-bottom:4px"><strong>${L.summary}:</strong> ${r.evaluation.summary}</div>
      <div style="font-size:12px;color:var(--text-muted)"><strong>${L.note}:</strong> ${r.evaluation.note}</div>` : ''}
    </div>
    <button class="btn-secondary" onclick="document.getElementById('night-detail-modal').classList.remove('show')" type="button">${L.close}</button>
  </div>`;
  modal.classList.add('show');
};

function _renderNightRow(r, isTR, idx) {
  const date  = new Date(r.date).toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { weekday:'long', month:'long', day:'numeric' });
  const total = formatTime(r.totalSec);
  const score = r.score;
  const scoreColor = score >= 85 ? 'var(--mint)' : score >= 70 ? 'var(--accent-light)' : score >= 50 ? 'var(--gold)' : 'var(--rose)';
  const status = scoreStatus(score, isTR ? 'tr' : 'en');

  return `<div class="night-history-card">
    <div class="night-history-header">
      <div class="night-history-date">🌙 ${date}</div>
      ${score !== undefined ? `<div class="night-history-score" style="color:${scoreColor}">${score}/100</div>` : ''}
    </div>
    <div class="night-history-stats">
      <div class="night-stat">
        <div class="night-stat-val">${total}</div>
        <div class="night-stat-lbl">${isTR ? 'Toplam Uyku' : 'Total Sleep'}</div>
      </div>
      <div class="night-stat">
        <div class="night-stat-val">${r.wakeCount}</div>
        <div class="night-stat-lbl">${isTR ? 'Uyanma' : 'Wake-ups'}</div>
      </div>
      <div class="night-stat">
        <div class="night-stat-val" style="color:${scoreColor}">${status.text}</div>
        <div class="night-stat-lbl">${isTR ? 'Durum' : 'Status'}</div>
      </div>
    </div>
    ${r.evaluation ? `<div class="night-history-summary">💬 ${r.evaluation.summary}</div>` : ''}
  </div>`;
}

/* ── Uzman önerileri ─────────────────────────────────────────── */
window.renderExpertTips = function() {
  const container=document.getElementById('expert-tips'); if(!container) return;
  const tips=EXPERT_TIPS[state.language]?.[state.currentAgeGroup]||[];
  container.innerHTML=tips.map(tip=>`
    <div class="expert-card">
      <div class="expert-header"><div class="expert-avatar">${tip.avatar}</div><div class="expert-info"><h4>${tip.author}</h4><p>${tip.title}</p></div></div>
      <div class="expert-content">${tip.tip}</div>
    </div>`).join('');
};
window.selectAge=function(el,idx){
  document.querySelectorAll('.age-option').forEach(o=>o.classList.remove('active'));
  if(el)el.classList.add('active');
  state.currentAgeGroup=idx;
  renderExpertTips();
};
window.calculateAgeGroup=function(){
  if(!state.babyBirthDate) return;
  const months=Math.floor((Date.now()-new Date(state.babyBirthDate))/(1000*60*60*24*30));
  state.currentAgeGroup=months<3?0:months<6?1:months<12?2:3;
  document.querySelectorAll('.age-option').forEach((o,i)=>o.classList.toggle('active',i===state.currentAgeGroup));
  renderExpertTips();
};

/* ── Yardımcı ────────────────────────────────────────────────── */
function _setVal(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}
function _st(id,text){
  const el=document.getElementById(id);if(!el||text==null)return;
  if(el.firstChild&&el.firstChild.nodeType===Node.TEXT_NODE){el.firstChild.textContent=text+' ';}
  else{el.insertBefore(document.createTextNode(text+' '),el.firstChild);}
}
window.checkSleepPrediction=function(){};
