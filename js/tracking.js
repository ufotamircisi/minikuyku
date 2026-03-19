/* ═══════════════════════════════════════════════════════════════
   tracking.js  |  Uyku takibi & grafikler
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Uyku başlat / bitir ─────────────────────────────────────── */
window.toggleSleep = function() {
  if (state.sleepTracking.active) {
    _endSleep();
  } else {
    _startSleep();
  }
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
  const entry = {
    start   : state.sleepTracking.startTime,
    end     : Date.now(),
    duration: duration
  };
  state.sleepTracking.history.unshift(entry);
  state.sleepTracking.history = state.sleepTracking.history.slice(0, 50);
  saveState('minikuyku_sleep_history', state.sleepTracking.history);

  state.sleepTracking.active    = false;
  state.sleepTracking.startTime = null;

  const statusEl = document.getElementById('sleep-status');
  const btnEl    = document.getElementById('sleep-btn');
  if (statusEl) statusEl.textContent = t('trackingAwake');
  if (btnEl)    btnEl.innerHTML = `<span>😴</span> ${t('sleepWent')}`;
}

/* ── İstatistik render ───────────────────────────────────────── */
window.renderSleepStats = function() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayTs = today.getTime();

  const todaySleeps = state.sleepTracking.history.filter(s => s.start >= todayTs);
  const total  = todaySleeps.reduce((a,b) => a+b.duration, 0);
  const count  = todaySleeps.length;
  const avg    = count ? Math.floor(total/count) : 0;
  const wakes  = Math.max(0, count - 1);

  _setText('stat-total', formatTime(total));
  _setText('stat-count', count.toString());
  _setText('stat-avg',   formatTime(avg));
  _setText('stat-wake',  wakes.toString());

  renderSleepChart();
  renderSleepList();
  checkSleepPrediction();
};

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ── Son 7 gün grafiği ───────────────────────────────────────── */
function renderSleepChart() {
  const container = document.getElementById('sleep-chart');
  if (!container) return;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
    days.push({ ts: d.getTime(), label: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'][d.getDay()] });
  }

  const totals = days.map(day => {
    const next = day.ts + 86400000;
    return state.sleepTracking.history
      .filter(s => s.start >= day.ts && s.start < next)
      .reduce((a,b) => a+b.duration, 0);
  });

  const maxVal = Math.max(...totals, 1);
  const bars   = totals.map((v,i) => {
    const pct = Math.round((v / maxVal) * 100);
    return `<div class="chart-bar" style="height:${pct}%" title="${days[i].label}: ${formatTime(v)}"></div>`;
  }).join('');
  const labels = days.map(d => `<span>${d.label}</span>`).join('');

  container.innerHTML = `<div class="chart-placeholder">${bars}</div><div class="chart-labels">${labels}</div>`;
}

/* ── Son uyku listesi ────────────────────────────────────────── */
function renderSleepList() {
  const list = document.getElementById('sleep-list');
  if (!list) return;

  if (!state.sleepTracking.history.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🌙</div><div class="empty-text">${t('noSleepRecords')}</div></div>`;
    return;
  }

  const locale = state.language === 'tr' ? 'tr-TR' : 'en-US';
  list.innerHTML = state.sleepTracking.history.slice(0,10).map(s => {
    const date = new Date(s.start).toLocaleDateString(locale, { month:'short', day:'numeric' });
    const time = new Date(s.start).toLocaleTimeString(locale, { hour:'2-digit', minute:'2-digit' });
    return `<div class="sleep-item">
      <span class="sleep-item-icon">🌙</span>
      <div class="sleep-item-info">
        <div class="sleep-item-time">${date} · ${time}</div>
        <div class="sleep-item-dur">${formatTime(s.duration)}</div>
      </div>
    </div>`;
  }).join('');
}

/* ── Uyku tahmini ────────────────────────────────────────────── */
window.checkSleepPrediction = function() {
  const card = document.getElementById('prediction-card');
  if (!card || state.sleepTracking.history.length < 3) return;

  const recent = state.sleepTracking.history.slice(0, 5);
  const avgDur = recent.reduce((a,b)=>a+b.duration,0) / recent.length;
  const avgGap = recent.slice(0,-1).reduce((a,b,i)=>{
    return a + (recent[i].start - recent[i+1].end);
  }, 0) / Math.max(1, recent.length-1);

  const lastEnd    = recent[0].end || Date.now();
  const nextSleep  = new Date(lastEnd + avgGap);
  const timeStr    = nextSleep.toLocaleTimeString(state.language==='tr'?'tr-TR':'en-US', {hour:'2-digit',minute:'2-digit'});

  card.classList.add('show');
  const timeEl = card.querySelector('.prediction-time');
  if (timeEl) timeEl.textContent = timeStr;
};

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
  const months = Math.floor((Date.now() - new Date(state.babyBirthDate)) / (1000*60*60*24*30));
  state.currentAgeGroup = months < 3 ? 0 : months < 6 ? 1 : months < 12 ? 2 : 3;
  const opts = document.querySelectorAll('.age-option');
  opts.forEach((o,i) => o.classList.toggle('active', i === state.currentAgeGroup));
  renderExpertTips();
};
