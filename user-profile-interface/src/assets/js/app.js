// This file contains the main JavaScript code for the user profile interface application.
// It initializes the application, sets up event listeners, and manages overall application logic.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { setupProfileCompletion } from './components/profile-completion.js';
import { setupAvatarUpload } from './components/avatar-upload.js';
import { setupFormValidation } from './components/form-validator.js';

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize application components
document.addEventListener('DOMContentLoaded', () => {
    setupProfileCompletion();
    setupAvatarUpload();
    setupFormValidation();

    // Check user authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, load user profile data
            loadUserProfile(user.uid);
        } else {
            // User is signed out, redirect to login page
            window.location.href = 'login.html';
        }
    });
});

// Function to load user profile data
function loadUserProfile(userId) {
    // Fetch user profile data from Firestore and update UI
    // Implementation will be in profile-service.js
}