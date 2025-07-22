// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-xXtLFvKNofMBj-AqefFoalUMBt71JdE",
  authDomain: "codearena-be1d8.firebaseapp.com",
  projectId: "codearena-be1d8",
  storageBucket: "codearena-be1d8.appspot.com", // <-- Corrected here
  messagingSenderId: "715954654214",
  appId: "1:715954654214:web:79f914605480e149a78787",
  measurementId: "G-N6WT6DNTQD"
};
export default firebaseConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Make Firebase accessible globally for debugging (development only)
if (import.meta.env.DEV) {
  window.firebase = {
    app,
    auth,
    db,
    analytics,
    config: firebaseConfig
  };
}

export { app, auth, db, analytics }; 