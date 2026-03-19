/* ═══════════════════════════════════════════════════════════════
   premium.js  |  Deneme & premium yönetimi
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Deneme ──────────────────────────────────────────────────── */
window.ensureTrialStarted = function() {
  if (!state.trialStart) {
    state.trialStart = Date.now().toString();
    saveStateRaw('minikuyku_trial_start', state.trialStart);
  }
};

window.getTrialDaysLeft = function() {
  if (!state.trialStart) return CONFIG.TRIAL_DAYS;
  const elapsed = (Date.now() - parseInt(state.trialStart)) / (1000 * 60 * 60 * 24);
  return Math.max(0, CONFIG.TRIAL_DAYS - Math.floor(elapsed));
};

window.isTrialActive = function() {
  return getTrialDaysLeft() > 0;
};

window.hasAccess = function() {
  return state.isPremium || isTrialActive();
};

/* ── Premium UI ──────────────────────────────────────────────── */
window.updatePremiumUI = function() {
  const btn      = document.getElementById('premium-btn');
  const text     = document.getElementById('premium-text');
  const ninBadge = document.getElementById('ninniler-badge');
  const hikBadge = document.getElementById('hikayeler-badge');
  if (!btn || !text) return;

  if (state.isPremium) {
    btn.classList.add('premium');
    text.textContent = t('premiumBadge');
    if (ninBadge) { ninBadge.textContent = t('unlimited'); ninBadge.style.background = 'var(--mint)'; ninBadge.style.color = '#0a0e1a'; }
    if (hikBadge) { hikBadge.textContent = t('unlimited'); hikBadge.style.background = 'var(--mint)'; hikBadge.style.color = '#0a0e1a'; }
  } else if (isTrialActive()) {
    btn.classList.add('premium');
    text.textContent = t('trialHeader');
    if (ninBadge) { ninBadge.textContent = t('trial'); ninBadge.style.background = ''; ninBadge.style.color = ''; }
    if (hikBadge) { hikBadge.textContent = t('trial'); hikBadge.style.background = ''; hikBadge.style.color = ''; }
  } else {
    btn.classList.remove('premium');
    text.textContent = t('premium');
    if (ninBadge) { ninBadge.textContent = t('locked'); ninBadge.style.background = ''; ninBadge.style.color = ''; }
    if (hikBadge) { hikBadge.textContent = t('locked'); hikBadge.style.background = ''; hikBadge.style.color = ''; }
  }
};

/* ── Trial banner ────────────────────────────────────────────── */
window.updateTrialUI = function() {
  const banner   = document.getElementById('trial-banner');
  const titleEl  = document.getElementById('trial-title');
  const subEl    = document.getElementById('trial-subtitle');
  const btnEl    = document.querySelector('#trial-banner .header-btn');
  if (!banner) return;

  const days = getTrialDaysLeft();
  if (state.isPremium) { banner.style.display = 'none'; return; }

  banner.style.display = isTrialActive() ? '' : 'none';
  if (titleEl) titleEl.textContent = t('trialActive')(days);
  if (subEl)   subEl.textContent   = t('trialSub');
  if (btnEl)   btnEl.textContent   = t('upgradeBtn');
};

/* ── Premium modal göster ────────────────────────────────────── */
window.showPremiumModal = function() {
  _renderPremiumModal();
  document.getElementById('premium-modal').classList.add('show');
};

let _priceMode = 'monthly'; // 'monthly' | 'yearly'

function _renderPremiumModal() {
  const modal = document.getElementById('premium-modal');
  if (!modal) return;
  const lang  = state.language;
  const price = CONFIG.PRICE[lang] || CONFIG.PRICE.tr;

  // Başlık
  const titleEl = modal.querySelector('.premium-title');
  const subEl   = modal.querySelector('.premium-modal-content > p');
  if (titleEl) titleEl.textContent = t('premiumTitle');
  if (subEl)   subEl.textContent   = t('premiumSub');

  // Fiyat sekmelerini güncelle
  const monthTab = document.getElementById('price-tab-monthly');
  const yearTab  = document.getElementById('price-tab-yearly');
  if (monthTab) { monthTab.textContent = t('monthly'); monthTab.classList.toggle('active', _priceMode === 'monthly'); }
  if (yearTab)  { yearTab.textContent  = t('yearly');  yearTab.classList.toggle('active', _priceMode === 'yearly'); }

  const priceEl = modal.querySelector('.premium-price');
  if (priceEl) {
    if (_priceMode === 'monthly') {
      priceEl.innerHTML = `${price.currency}${price.monthly} <span>/${t('monthly').toLowerCase()}</span>`;
    } else {
      const saving = Math.round(price.monthly * 12 - price.yearly);
      priceEl.innerHTML = `${price.currency}${price.yearly} <span>/${t('yearly').toLowerCase()} · ${t('yearlySave')}: ${price.currency}${saving}</span>`;
    }
  }

  // Özellikler
  const rows = modal.querySelectorAll('.premium-feature');
  const feats = [
    [t('premiumF1'), t('premiumF1s')],
    [t('premiumF2'), t('premiumF2s')],
    [t('premiumF3'), t('premiumF3s')],
    [t('premiumF4'), t('premiumF4s')],
    [t('premiumF5'), t('premiumF5s')],
  ];
  rows.forEach((row, i) => {
    if (!feats[i]) return;
    const ft = row.querySelector('.premium-feature-text');
    if (ft) ft.innerHTML = `${feats[i][0]}<br><span>${feats[i][1]}</span>`;
  });

  // Butonlar
  const upgradeBtn = modal.querySelector('.btn-primary');
  const cancelBtn  = modal.querySelector('.header-btn');
  if (upgradeBtn) upgradeBtn.innerHTML = `<span>👑</span> ${t('upgradeFull')}`;
  if (cancelBtn)  cancelBtn.textContent = t('cancelNow');
}

window.setPriceMode = function(mode) {
  _priceMode = mode;
  _renderPremiumModal();
};

/* ── Satın alma (simülasyon) ─────────────────────────────────── */
window.activatePremium = function() {
  if (CONFIG.PAYMENT_LIVE) {
    // Gerçek ödeme — RevenueCat / App Store / Google Play hook buraya
    showToast('Ödeme sistemi yakında aktif olacak.');
    return;
  }
  state.isPremium = true;
  saveState('minikuyku_premium', true);
  updatePremiumUI();
  updateTrialUI();
  closeModal('premium-modal');
  showToast(t('premiumSim'));
};

/* ── Premium limitli oynatma ─────────────────────────────────── */
window.showPremiumPrompt = function() {
  showToast(t('timesUp'));
  setTimeout(() => showPremiumModal(), 1500);
};
