/* ═══════════════════════════════════════════════════════════════
   app.js  |  Uygulama başlatma, navigasyon, onboarding, SW
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Console polyfill ────────────────────────────────────────── */
(function() {
  var noop = function(){};
  if (typeof console === 'undefined') { window.console = {log:noop,error:noop,warn:noop,info:noop,debug:noop}; }
  else { ['log','error','warn','info','debug'].forEach(function(m){ if (typeof console[m]!=='function') console[m]=console.log||noop; }); }
})();

/* ══════════════════════════════════════════════════════════════
   BAŞLATMA
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  _initStars();
  _initWaveform();
  ensureTrialStarted();
  updateBabyNameDisplay();
  updateLanguageUI();        // tüm dil tabanlı içerik
  renderLullabies();         // ana sayfa
  renderSleepStats();
  updatePremiumUI();
  updateTrialUI();

  if (state.babyBirthDate) calculateAgeGroup();

  // Onboarding — ilk girişte göster
  const ob = document.getElementById('app-onboarding');
  if (ob) {
    ob.style.display = ''; // inline style'ı temizle
    if (!state.onboarded) {
      ob.classList.add('show');
    } else {
      ob.classList.remove('show');
    }
  }
  updateOnboardingLanguage();

  // Lazy sayfalar için ilk render flag
  state._initializedPages = { ninniler: true };
});

/* ── Yıldızlar ───────────────────────────────────────────────── */
function _initStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left             = Math.random() * 100 + '%';
    star.style.top              = Math.random() * 100 + '%';
    star.style.animationDelay   = Math.random() * 3 + 's';
    container.appendChild(star);
  }
}

/* ── Dalga formu ─────────────────────────────────────────────── */
function _initWaveform() {
  const container = document.getElementById('waveform');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const bar = document.createElement('div');
    bar.className    = 'wave-bar';
    bar.style.height = '4px';
    container.appendChild(bar);
  }
}

/* ══════════════════════════════════════════════════════════════
   NAVİGASYON
   ══════════════════════════════════════════════════════════════ */
window.goToPage = function(page, navEl, bottomIdx) {
  // Tüm sayfaları gizle, aktifi göster
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  // Üst nav
  if (navEl) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    navEl.classList.add('active');
  }

  // Alt nav
  if (bottomIdx !== undefined) {
    document.querySelectorAll('.bottom-item').forEach(b => b.classList.remove('active'));
    const items = document.querySelectorAll('.bottom-item');
    if (items[bottomIdx]) items[bottomIdx].classList.add('active');
  }

  state.currentPage = page;

  // Lazy init — daha önce render edilmemişse render et
  if (!state._initializedPages[page]) {
    state._initializedPages[page] = true;
    _lazyInitPage(page);
  }
};

function _lazyInitPage(page) {
  try {
    switch(page) {
      case 'hikayeler': renderStories(); break;
      case 'kolik':     renderKolik();   break;
      case 'takip':
        renderSleepStats();
        renderExpertTips();
        if (typeof renderNightHistory === 'function') renderNightHistory();
        break;
      case 'sesim':
        renderRecordings();
        updateCloneSection();
        if (state.clonedVoiceId) document.getElementById('voice-generator').style.display = 'block';
        break;
    }
  } catch(e) {}
}

/* ══════════════════════════════════════════════════════════════
   ONBOARDING
   ══════════════════════════════════════════════════════════════ */
let _obStep = 0;

window.nextOnboardingStep = function() {
  _obStep = Math.min(3, _obStep + 1);
  _updateObDots();
};
window.prevOnboardingStep = function() {
  _obStep = Math.max(0, _obStep - 1);
  _updateObDots();
};

function _updateObDots() {
  document.querySelectorAll('#app-onboarding .dot').forEach((d,i) => d.classList.toggle('active', i===_obStep));
  document.querySelectorAll('#app-onboarding .ob-slide').forEach((s,i) => s.classList.toggle('active', i===_obStep));
}

window.obSetLanguage = function(lang) {
  state.language = lang;
  saveStateRaw('minikuyku_lang', lang);
  document.documentElement.lang = lang;
  updateOnboardingLanguage();
  document.getElementById('ob-btn-tr')?.classList.toggle('active', lang==='tr');
  document.getElementById('ob-btn-en')?.classList.toggle('active', lang==='en');
};

window.finishOnboarding = function() {
  const name = document.getElementById('onboard-baby-name')?.value?.trim();
  if (name) {
    state.babyName = name;
    saveStateRaw('minikuyku_baby_name', name);
  }
  state.onboarded = true;
  saveState('minikuyku_onboarded', true);
  ensureTrialStarted();
  document.getElementById('app-onboarding')?.classList.remove('show');
  updateLanguageUI();
  showToast(t('welcomeToast'));
};

/* ── Onboarding sıfırla ─────────────────────────────────────── */
window.resetOnboarding = function() {
  localStorage.removeItem('minikuyku_onboarded');
  state.onboarded = false;
  closeModal('settings-modal');
  const ob = document.getElementById('app-onboarding');
  if (ob) {
    ob.style.display = '';
    ob.classList.add('show');
  }
  updateOnboardingLanguage();
};

/* ══════════════════════════════════════════════════════════════
   SERVICE WORKER
   ══════════════════════════════════════════════════════════════ */
(function() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').then(function(reg) {
      reg.addEventListener('updatefound', function() {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', function() {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            nw.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch(function() {});
  });

  // Ses dosyalarını arka planda önbelleğe al (5sn sonra)
  setTimeout(function() {
    if (!CONFIG.SOUNDS_CDN) return;
    var files = ['dandini.mp3','fisfis.mp3','twinkle.mp3','rockabye.mp3',
                 'hairdryer.mp3','vacuum.mp3','whitenoise.mp3','ac.mp3',
                 'rain.mp3','waves.mp3','forest.mp3','stream.mp3','heart.mp3','pispis.mp3'];
    navigator.serviceWorker.ready.then(function(reg) {
      if (reg.active) {
        reg.active.postMessage({
          type: 'PRECACHE_AUDIO',
          urls: files.map(function(f) { return CONFIG.SOUNDS_CDN + f; })
        });
      }
    }).catch(function(){});
  }, 5000);
})();
