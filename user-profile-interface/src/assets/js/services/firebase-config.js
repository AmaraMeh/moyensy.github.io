import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

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
const storage = getStorage(app);

export { app, db, storage };