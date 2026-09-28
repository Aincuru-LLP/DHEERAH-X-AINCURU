/**
 * Firebase Client Bootstrap
 * Exports initialized Firebase App, Analytics, Auth, and Firestore
 */
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { app, auth, db, firebaseConfig } from './lib/firebase';

export { app, auth, db, firebaseConfig };

// Safe initialization of Firebase Analytics for browser environments
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  void isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

export { analytics, getAnalytics };
export default app;
