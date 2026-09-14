/**
 * Firebase is loaded lazily and only when real credentials are configured.
 * With no credentials configured the SDK is never imported, so it stays out
 * of the production bundle and every launch runs in anonymous guest mode.
 */
export const hasFirebaseConfig = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'
);

type FirebaseAuth = import('firebase/auth').Auth;

let authPromise: Promise<FirebaseAuth | undefined> | undefined;

export function loadFirebaseAuth(): Promise<FirebaseAuth | undefined> {
  if (!hasFirebaseConfig) {
    return Promise.resolve(undefined);
  }
  if (!authPromise) {
    authPromise = (async () => {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const app =
        getApps().length > 0
          ? getApp()
          : initializeApp({
              apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
              authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
              projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
              storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
              appId: import.meta.env.VITE_FIREBASE_APP_ID,
            });
      return getAuth(app);
    })();
  }
  return authPromise;
}