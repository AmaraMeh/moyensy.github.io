import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfI6CuKUzkW-FETIVTexTlYPLZ0HixnOQ",
    authDomain: "sample-firebase-ai-app-929dd.firebaseapp.com",
    projectId: "sample-firebase-ai-app-929dd",
    storageBucket: "sample-firebase-ai-app-929dd.firebasestorage.app",
    messagingSenderId: "980647438529",
    appId: "1:980647438529:web:731a26901f907f102c4c40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize counters with 30000
const initializeCounters = async () => {
    const modules = ['science_tech', 'biologie', 'informatique'];
    for (const module of modules) {
        const counterRef = doc(db, 'counters', module);
        const counterDoc = await getDoc(counterRef);
        if (!counterDoc.exists()) {
            await setDoc(counterRef, { count: 30000 });
        }
    }
};

// Initialize counters on module load
initializeCounters();

export { db, doc, getDoc, setDoc, increment, onSnapshot }; 