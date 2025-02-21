// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5XYqWKhHdiVDXJx4iOwtpxD8eUCPRfKU",
  authDomain: "universite-de-bejaia-547fc.firebaseapp.com",
  projectId: "universite-de-bejaia-547fc",
  storageBucket: "universite-de-bejaia-547fc.firebasestorage.app",
  messagingSenderId: "517622731583",
  appId: "1:517622731583:web:25453d5e01226585bf798a",
  measurementId: "G-SQ0WWSCS7B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };