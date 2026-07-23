// ============================================
// ADMOB INTEGRATION
// Uses @capacitor-community/admob plugin (loaded natively via Capacitor)
// Banner shows during gameplay, interstitial shows on game over (not every time, to avoid annoying players)
// ============================================
(function () {
  "use strict";

  let admobReady = false;
  let gamesPlayedSinceAd = 0;
  const SHOW_INTERSTITIAL_EVERY_N_GAMES = 2; // don't show ad after every single game-over

  function getAdMob() {
    return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob;
  }

  async function initAds() {
    const AdMob = getAdMob();
    if (!AdMob) {
      console.log('AdMob plugin not available (running in browser, not native app)');
      return;
    }
    try {
      await AdMob.initialize({
        testingDevices: [],
        initializeForTesting: window.ADMOB_CONFIG.isTesting
      });
      admobReady = true;
      showBanner();
    } catch (e) {
      console.log('AdMob init failed', e);
    }
  }

  async function showBanner() {
    const AdMob = getAdMob();
    if (!AdMob || !admobReady) return;
    try {
      await AdMob.showBanner({
        adId: window.ADMOB_CONFIG.bannerAdId,
        adSize: 'BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
        isTesting: window.ADMOB_CONFIG.isTesting
      });
    } catch (e) {
      console.log('Banner failed', e);
    }
  }

  async function showInterstitial() {
    const AdMob = getAdMob();
    if (!AdMob || !admobReady) return;
    gamesPlayedSinceAd++;
    if (gamesPlayedSinceAd < SHOW_INTERSTITIAL_EVERY_N_GAMES) return;
    gamesPlayedSinceAd = 0;
    try {
      await AdMob.prepareInterstitial({
        adId: window.ADMOB_CONFIG.interstitialAdId,
        isTesting: window.ADMOB_CONFIG.isTesting
      });
      await AdMob.showInterstitial();
    } catch (e) {
      console.log('Interstitial failed', e);
    }
  }

  // Expose a hook the game calls on game-over
  window.onGameOverShowAd = showInterstitial;

  document.addEventListener('deviceready', initAds);
  // Fallback for environments without a deviceready event (e.g. plain browser preview)
  if (window.Capacitor) {
    window.addEventListener('load', initAds);
  }
})();
