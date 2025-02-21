// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getMessaging, onMessage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

// Your web app's Firebase configuration
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
const messaging = getMessaging(app);

// Request permission for notifications
Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
        console.log("Notification permission granted.");
    } else {
        console.log("Unable to get permission to notify.");
    }
});

// Handle incoming messages
onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon
    };

    // Show notification
    new Notification(notificationTitle, notificationOptions);
});