// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYEyPgnlvKX1k8YrUPzaJsN_7_EzajAys",
  authDomain: "notecards-1b054.firebaseapp.com",
  projectId: "notecards-1b054",
  storageBucket: "notecards-1b054.firebasestorage.app",
  messagingSenderId: "553189010695",
  appId: "1:553189010695:web:060922e1fc0b9323e869a2",
  measurementId: "G-S308GDHJGL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Expose Firebase auth on window for e2e tests IMMEDIATELY after initialization
// This must happen BEFORE emulator connection to ensure it's available even if emulator setup fails
// Always expose in all environments - this is safe because:
// 1. Production has proper security rules preventing unauthorized access
// 2. Service account auth only works with emulators/dev, not production
// 3. E2E tests need access to auth instance to sign in programmatically
// 4. Exposing on window doesn't bypass Firebase security, just enables test automation
(window as any).firebaseAuth = auth;
(window as any).firebaseDb = db;
(window as any).firebaseApp = app;

// Expose Firebase v9 modular auth functions for e2e tests
// Service-account-auth.mjs needs these to call signInWithCustomToken(auth, token)
(window as any).firebase = {
  auth: {
    signInWithCustomToken,
    onAuthStateChanged
  }
};
console.log('[Firebase] Exposed Firebase instances and auth functions on window for e2e testing');

// Connect to emulators in development
// Check for VITE_USE_EMULATORS env var or import.meta.env.DEV for Vite dev mode
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true' ||
                      (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS !== 'false');

if (useEmulators) {
  console.log('🔧 Connecting to Firebase emulators for local development')

  // Only connect if not already connected
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Connected to Firestore emulator on localhost:8080');

    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('✅ Connected to Auth emulator on localhost:9099');
  } catch (error) {
    console.log('⚠️ Emulators already connected or connection failed:', error);
  }
}
