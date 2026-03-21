/* tracking.js | Uyku takibi, skor, analiz */
'use strict';

/* ════════════════════════════════════════════════════════════════
   UYKU BAŞLAT / BİTİR
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
  if (btnEl)    btnEl.innerHTML = `<span>☀️</span> ${t('wakeUp')}`;
  state.sleepInterval = setInterval(() => {
    const secs  = Math.floor((Date.now() - state.sleepTracking.startTime) / 1000);
    const clock = document.getElementById('sleep-clock');
    if (clock) clock.textContent = formatTime(secs);
  }, 1000);
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
}

/* ════════════════════════════════════════════════════════════════
   UYKU SKORU ALGORİTMASI
   ════════════════════════════════════════════════════════════════ */
function calcSleepScore(sessions) {
  if (!sessions || sessions.length === 0) return null;

  let score = 100;
  const wakeCount = sessions.length - 1; // uyanma sayısı

  // Her uyanma: -8
  score -= wakeCount * 8;

  // Uyanık kalma süresi analizi
  for (let i = 0; i < sessions.length - 1; i++) {
    const gap = (sessions[i].start - sessions[i+1].end) / 1000 / 60; // dakika
    if (gap > 10) score -= 10;    // uzun uyanıklık >10dk: -10
    if (gap < 3)  score += 5;     // hızlı sakinleşme <3dk: +5
  }

  // Uzun kesintisiz uyku >2 saat: +10
  sessions.forEach(s => {
    if (s.duration >= 7200) score += 10;
  });

  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreStatus(score, lang) {
  const isTR = lang === 'tr';
  if (score >= 85) return { text: isTR ? '🌟 Çok İyi' : '🌟 Very Good',    color: 'var(--mint)' };
  if (score >= 70) return { text: isTR ? '👍 İyi' : '👍 Good',              color: 'var(--accent-light)' };
  if (score >= 50) return { text: isTR ? '😐 Orta' : '😐 Fair',             color: 'var(--gold)' };
  return            { text: isTR ? '😟 Düzensiz' : '😟 Irregular',          color: 'var(--rose)' };
}

/* ════════════════════════════════════════════════════════════════
   TREND YORUMU
   ════════════════════════════════════════════════════════════════ */
function getTrendText(history, lang) {
  const isTR = lang === 'tr';
  if (history.length < 3) return null;

  // Son 3 gece uyanma sayısı
  const nights = _groupByNight(history);
  const nightKeys = Object.keys(nights).sort().reverse();
  if (nightKeys.length < 2) return null;

  const last    = nights[nightKeys[0]] || [];
  const prev    = nights[nightKeys[1]] || [];
  const lastWake = last.length - 1;
  const prevWake = prev.length - 1;

  const lastScore = calcSleepScore(last);
  const prevScore = calcSleepScore(prev);

  if (lastScore && prevScore) {
    if (lastScore > prevScore + 5)
      return isTR ? '🎉 Uyku düzeni iyileşiyor!' : '🎉 Sleep pattern is improving!';
    if (lastScore < prevScore - 5)
      return isTR ? '⚠️ Dün geceki uyku daha iyiydi' : '⚠️ Last night was better';
  }
  if (lastWake > prevWake + 1)
    return isTR ? '📈 Son gecelerde uyanma arttı' : '📈 Wake-ups increased recently';
  if (lastWake < prevWake)
    return isTR ? '😴 Dün daha az uyandı, güzel!' : '😴 Fewer wake-ups last night!';

  // Kısa uyku blokları
  const shortBlocks = last.filter(s => s.duration < 3600).length;
  if (shortBlocks > 2)
    return isTR ? '⏱ Daha kısa uyku blokları oluşmuş' : '⏱ Shorter sleep blocks detected';

  return isTR ? '👍 Uyku düzeni stabil görünüyor' : '👍 Sleep pattern looks stable';
}

function _groupByNight(history) {
  const nights = {};
  history.forEach(s => {
    const d = new Date(s.start);
    // Gece başlangıcı: saat 20:00 olarak kabul et
    const hour = d.getHours();
    const date = new Date(s.start);
    if (hour < 8) date.setDate(date.getDate() - 1);
    const key = date.toISOString().split('T')[0];
    if (!nights[key]) nights[key] = [];
    nights[key].push(s);
  });
  return nights;
}

/* ════════════════════════════════════════════════════════════════
   RENDER
   ════════════════════════════════════════════════════════════════ */
window.renderSleepStats = function() {
  const lang = state.language;
  const isTR = lang === 'tr';
  const isPremium = hasAccess();

  // Dün Gece verilerini hesapla
  const yesterday = _getLastNightSessions();
  _renderLastNight(yesterday, isTR, isPremium);

  // Grafik (premium)
  _renderChart(isPremium);

  // Trend (premium)
  _renderTrend(isPremium, isTR);

  // Son uykular listesi
  renderSleepList();

  // Sayfa başlığı
  const title = document.getElementById('analysis-main-title');
  const sub   = document.getElementById('analysis-main-sub');
  if (title) title.textContent = isTR
    ? '🎙 Ses Tabanlı Tahmini Uyku Analizi'
    : '🎙 Sound-Based Sleep Analysis (Estimated)';
  if (sub) sub.textContent = isTR
    ? '(Bu veriler mikrofon sesine dayalı tahmindir, tıbbi teşhis değildir.)'
    : '(These are estimates based on microphone sound, not medical diagnosis.)';

  // Bölüm başlıkları
  _st('lastnight-section-title', isTR ? 'Dün Gece' : 'Last Night');
  _st('sleepchart-section-title', isTR ? 'Son 7 Gün' : 'Last 7 Days');
  _st('recentsleep-section-title', t('sectionRecentSleeps'));
  _st('experttips-section-title', t('sectionExpertTips'));

  // Grafik badge
  const chartBadge = document.getElementById('chart-badge');
  if (chartBadge) chartBadge.textContent = isPremium ? '' : '👑 Premium';

  // Son uykular başlıkları
  const lnLabels = {
    total:   isTR ? 'Toplam Uyku'      : 'Total Sleep',
    wake:    isTR ? 'Uyanma'           : 'Wake-ups',
    longest: isTR ? 'En Uzun Uyku'     : 'Longest Sleep',
    calm:    isTR ? 'Ort. Sakinleşme'  : 'Avg. Calm Time',
  };
  ['total','wake','longest','calm'].forEach(k => {
    const el = document.getElementById(`ln-${k}-label`);
    if (el) el.textContent = lnLabels[k];
  });

  // Skor etiketi çevirisi
  const scoreLabelEl = document.getElementById('sleep-score-label-text');
  if (scoreLabelEl) scoreLabelEl.textContent = isTR ? 'Uyku Skoru' : 'Score';
  const lockMsgEl = document.getElementById('score-lock-text');
  if (lockMsgEl) lockMsgEl.textContent = isTR ? 'Uyku skoru için Premium\'a geçin' : 'Upgrade to Premium for sleep score';

  // Skor kilidi mesajı
  const lockMsg = document.getElementById('score-lock-text');
  if (lockMsg) lockMsg.textContent = isTR
    ? 'Uyku skoru için Premium\'a geçin'
    : 'Upgrade to Premium for sleep score';
};

function _getLastNightSessions() {
  // Son 24 saatteki oturumlar
  const cutoff = Date.now() - 86400000;
  return state.sleepTracking.history.filter(s => s.start >= cutoff);
}

function _renderLastNight(sessions, isTR, isPremium) {
  const totalSec   = sessions.reduce((a,b) => a+b.duration, 0);
  const wakeCount  = Math.max(0, sessions.length - 1);
  const longestSec = sessions.length ? Math.max(...sessions.map(s=>s.duration)) : 0;

  // Ortalama sakinleşme (uyanmalar arası boşluk)
  let avgCalmMin = 0;
  if (sessions.length > 1) {
    const gaps = [];
    for (let i=0; i<sessions.length-1; i++) {
      gaps.push((sessions[i].start - sessions[i+1].end) / 1000 / 60);
    }
    avgCalmMin = Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length);
  }

  _setVal('ln-total',   totalSec   ? formatTime(totalSec)   : '--');
  _setVal('ln-wake',    sessions.length ? `${wakeCount} ${isTR ? 'kez' : 'times'}` : '--');
  _setVal('ln-longest', longestSec ? formatTime(longestSec) : '--');
  _setVal('ln-calm',    avgCalmMin ? `${avgCalmMin} ${isTR ? 'dk' : 'min'}` : '--');

  // Skor (sadece premium)
  const scoreContainer = document.getElementById('sleep-score-container');
  const lockMsg        = document.getElementById('score-lock-msg');

  if (isPremium && sessions.length > 0) {
    const score  = calcSleepScore(sessions);
    const status = scoreStatus(score, isTR ? 'tr' : 'en');
    _setVal('sleep-score-value', score);
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
  if (!isPremium || state.sleepTracking.history.length < 3) {
    trendCard.style.display = 'none';
    return;
  }
  const text = getTrendText(state.sleepTracking.history, state.language);
  if (text) {
    trendCard.style.display = 'flex';
    const tEl = document.getElementById('trend-text');
    if (tEl) tEl.textContent = text;
  } else {
    trendCard.style.display = 'none';
  }
}

function _renderChart(isPremium) {
  const container = document.getElementById('sleep-chart');
  const overlay   = document.getElementById('chart-overlay');
  if (!container) return;

  // Grafik her zaman render et ama overlay göster
  const days = [];
  const isTR = state.language === 'tr';
  const dayNames = isTR
    ? ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt']
    : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  for (let i=6; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0);
    days.push({ ts: d.getTime(), label: dayNames[d.getDay()] });
  }

  const totals = days.map(day => {
    const next = day.ts + 86400000;
    return state.sleepTracking.history
      .filter(s => s.start >= day.ts && s.start < next)
      .reduce((a,b) => a+b.duration, 0);
  });

  const maxVal = Math.max(...totals, 1);
  const bars   = totals.map((v,i) => {
    const pct = Math.round((v/maxVal)*100);
    const color = v > 0 ? 'linear-gradient(to top, var(--accent), var(--mint))' : 'rgba(255,255,255,0.05)';
    return `<div class="chart-bar" style="height:${Math.max(4,pct)}%;background:${color}" title="${days[i].label}: ${formatTime(v)}"></div>`;
  }).join('');
  const labels = days.map(d=>`<span>${d.label}</span>`).join('');
  container.innerHTML = `<div class="chart-placeholder">${bars}</div><div class="chart-labels">${labels}</div>`;

  // Overlay
  if (overlay) {
    overlay.style.display = isPremium ? 'none' : 'flex';
    const overlayText = document.getElementById('chart-overlay-text');
    if (overlayText) overlayText.textContent = isTR
      ? '7 günlük grafik için Premium\'a geçin'
      : 'Upgrade to Premium for 7-day chart';
  }
}

function _setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function _st(id, text) {
  const el = document.getElementById(id);
  if (!el || text == null) return;
  if (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) {
    el.firstChild.textContent = text + ' ';
  } else {
    el.insertBefore(document.createTextNode(text + ' '), el.firstChild);
  }
}

/* ── Son uykular listesi ─────────────────────────────────────── */
function renderSleepList() {
  const list = document.getElementById('sleep-list');
  if (!list) return;
  if (!state.sleepTracking.history.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🌙</div><div class="empty-text">${t('noSleepRecords')}</div></div>`;
    return;
  }
  const locale = state.language==='tr' ? 'tr-TR' : 'en-US';
  list.innerHTML = state.sleepTracking.history.slice(0,10).map(s => {
    const date = new Date(s.start).toLocaleDateString(locale, {month:'short',day:'numeric'});
    const time = new Date(s.start).toLocaleTimeString(locale, {hour:'2-digit',minute:'2-digit'});
    return `<div class="sleep-item">
      <span class="sleep-item-icon">🌙</span>
      <div class="sleep-item-info">
        <div class="sleep-item-time">${date} · ${time}</div>
        <div class="sleep-item-dur">${formatTime(s.duration)}</div>
      </div>
    </div>`;
  }).join('');
}

/* ── Uzman önerileri ─────────────────────────────────────────── */
window.renderExpertTips = function() {
  const container = document.getElementById('expert-tips');
  if (!container) return;
  const tips = EXPERT_TIPS[state.language]?.[state.currentAgeGroup] || [];
  container.innerHTML = tips.map(tip => `
    <div class="expert-card">
      <div class="expert-header">
        <div class="expert-avatar">${tip.avatar}</div>
        <div class="expert-info"><h4>${tip.author}</h4><p>${tip.title}</p></div>
      </div>
      <div class="expert-content">${tip.tip}</div>
    </div>`).join('');
};

window.selectAge = function(el, idx) {
  document.querySelectorAll('.age-option').forEach(o => o.classList.remove('active'));
  if (el) el.classList.add('active');
  state.currentAgeGroup = idx;
  renderExpertTips();
};

window.calculateAgeGroup = function() {
  if (!state.babyBirthDate) return;
  const months = Math.floor((Date.now()-new Date(state.babyBirthDate))/(1000*60*60*24*30));
  state.currentAgeGroup = months<3?0:months<6?1:months<12?2:3;
  document.querySelectorAll('.age-option').forEach((o,i)=>o.classList.toggle('active',i===state.currentAgeGroup));
  renderExpertTips();
};

window.checkSleepPrediction = function() {}; // Artık kullanılmıyor
