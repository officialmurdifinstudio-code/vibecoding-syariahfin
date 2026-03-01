import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// Kosongkan atribut di bawah ini sebagai placeholder. 
// Isi dengan credential dari Firebase Console saat melakukan integrasi sungguhan.
const firebaseConfig = {
  apiKey: "AIzaSyBCbUBS0ehOfirZVoh-j37StEC6wwfofcw",
  authDomain: "syariahfin.firebaseapp.com",
  projectId: "syariahfin",
  storageBucket: "syariahfin.firebasestorage.app",
  messagingSenderId: "3249162829",
  appId: "1:3249162829:web:3198f67ef4e8f7a63d6a04",
  measurementId: "G-HD7ZE1P69W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const _analytics = getAnalytics(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
