// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBwYNhpiA2sclrngK2gPunWz8QNeuU7IF0",
  authDomain: "fump-88c70.firebaseapp.com",
  projectId: "fump-88c70",
  storageBucket: "fump-88c70.appspot.com",
  messagingSenderId: "186859010362",
  appId: "1:186859010362:web:cd528ec94c9b31a5443803",
  measurementId: "G-PNR5FPHL1D"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const storage = getStorage(app)