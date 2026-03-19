/* config.js | Uygulama sabitleri */
'use strict';
window.CONFIG = {
  ELEVENLABS_API_KEY : localStorage.getItem('minikuyku_eleven_api') || '',
  DEFAULT_VOICE_ID   : 'JgYekNWmelei0oWTtYie',
  SOUNDS_CDN         : localStorage.getItem('minikuyku_cdn') || 'sounds/',
  TRIAL_DAYS         : 3,
  PRICE : {
    tr : { monthly: 49,  yearly: 299, currency: '₺' },
    en : { monthly: 9.9, yearly: 59,  currency: '$' }
  },
  MAX_RECORDING_SECONDS : 300,
  PAYMENT_LIVE : false
};
