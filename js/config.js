/* ═══════════════════════════════════════════════════════════════
   config.js  |  Uygulama sabitleri ve konfigürasyon
   ═══════════════════════════════════════════════════════════════ */
'use strict';

window.CONFIG = {
  // ElevenLabs API — localStorage'dan veya .env'den okunur
  ELEVENLABS_API_KEY : localStorage.getItem('minikuyku_eleven_api') || '',
  DEFAULT_VOICE_ID   : 'JgYekNWmelei0oWTtYie',

  // Ses dosyaları CDN (Cloudflare R2). Boşsa yerel dosya aranır.
  // Örnek: 'https://pub-XXXX.r2.dev/'
  SOUNDS_CDN : localStorage.getItem('minikuyku_cdn') || '',

  // Deneme
  TRIAL_DAYS : 3,

  // Fiyatlandırma
  PRICE : {
    tr : { monthly: 49,  yearly: 299,  currency: '₺' },
    en : { monthly: 9.9, yearly: 59,   currency: '$' }
  },

  // Kayıt limiti
  MAX_RECORDING_SECONDS : 300,

  // Premium simülasyonu (gerçek ödeme entegrasyonu eklenene kadar)
  PAYMENT_LIVE : false
};
