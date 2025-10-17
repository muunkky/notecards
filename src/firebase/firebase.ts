// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
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

// Connect to emulators in development (TEMPORARILY DISABLED - testing with production)
if (false) {
  console.log('🔧 Connecting to Firebase emulators for local development')
  
  // Only connect if not already connected
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Connected to Firestore emulator');
    
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('✅ Connected to Auth emulator');
  } catch (error) {
    console.log('⚠️ Emulators already connected or connection failed:', error);
  }
}
