import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCM41fSJZ_lbfgsruGUbnv7EZsDX_aC5TQ",
  authDomain: "hiitbeep-473a2.firebaseapp.com",
  projectId: "hiitbeep-473a2",
  storageBucket: "hiitbeep-473a2.firebasestorage.app",
  messagingSenderId: "908833980905",
  appId: "1:908833980905:web:ffd28e2194cb8985bc8b78"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
