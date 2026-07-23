// ============================================
// GOOGLE LOGIN + LEADERBOARD
// Uses @capacitor-firebase/authentication and @capacitor-firebase/firestore
// ============================================
(function () {
  "use strict";

  let currentUser = null;

  function getAuth() {
    return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.FirebaseAuthentication;
  }
  function getFirestore() {
    return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.FirebaseFirestore;
  }

  async function signIn() {
    const Auth = getAuth();
    if (!Auth) {
      console.log('Firebase Auth plugin not available (running in browser preview)');
      return;
    }
    try {
      const result = await Auth.signInWithGoogle();
      currentUser = result.user;
      onLoginSuccess(currentUser);
    } catch (e) {
      console.log('Sign-in failed', e);
    }
  }

  async function signOut() {
    const Auth = getAuth();
    if (!Auth) return;
    try {
      await Auth.signOut();
      currentUser = null;
      onLogout();
    } catch (e) {}
  }

  async function saveScore(score, level) {
    if (!currentUser) return;
    const Firestore = getFirestore();
    if (!Firestore) return;
    try {
      let existingBest = 0;
      try {
        const existing = await Firestore.getDocument({ reference: `leaderboard/${currentUser.uid}` });
        existingBest = (existing.snapshot && existing.snapshot.data && existing.snapshot.data.bestScore) || 0;
      } catch (e) {}

      if (score <= existingBest) return; // don't overwrite a better score with a worse one

      await Firestore.setDocument({
        reference: `leaderboard/${currentUser.uid}`,
        data: {
          name: currentUser.displayName || 'Player',
          photo: currentUser.photoUrl || '',
          bestScore: score,
          bestLevel: level,
          updatedAt: Date.now()
        },
        merge: true
      });
    } catch (e) {
      console.log('Save score failed', e);
    }
  }

  // Fetch top 10 scores for leaderboard display
  async function fetchLeaderboard() {
    const Firestore = getFirestore();
    if (!Firestore) return [];
    try {
      const result = await Firestore.getCollection({
        reference: 'leaderboard'
      });
      const rows = (result.snapshots || []).map(s => s.data);
      rows.sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0));
      return rows.slice(0, 10);
    } catch (e) {
      console.log('Fetch leaderboard failed', e);
      return [];
    }
  }

  // ---- Hooks the game calls ----
  window.GoogleLeaderboard = {
    signIn,
    signOut,
    saveScore,
    fetchLeaderboard,
    isSignedIn: () => !!currentUser,
    getUser: () => currentUser
  };

  function onLoginSuccess(user) {
    document.dispatchEvent(new CustomEvent('leaderboard-login', { detail: user }));
  }
  function onLogout() {
    document.dispatchEvent(new CustomEvent('leaderboard-logout'));
  }

  // Restore session silently on app start, if already signed in
  document.addEventListener('deviceready', async () => {
    const Auth = getAuth();
    if (!Auth) return;
    try {
      const result = await Auth.getCurrentUser();
      if (result.user) {
        currentUser = result.user;
        onLoginSuccess(currentUser);
      }
    } catch (e) {}
  });
})();
