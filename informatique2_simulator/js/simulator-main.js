// Import Firebase modules directly from CDN URLs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
// We don't need Firestore for authentication itself, so no need to import it here for the auth part.

// --- Firebase Configuration ---
// Replace with your project's actual configuration object.
// You can find this in your Firebase project settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyA4UIT_2nxaw-dKTqtKcW9sLKynlnLLCVU",
  authDomain: "nemi-2308f.firebaseapp.com",
  projectId: "nemi-2308f",
  storageBucket: "nemi-2308f.firebasestorage.app",
  messagingSenderId: "1043106571079",
  appId: "1:1043106571079:web:b63f8148b670bbb4936262"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- DOM Elements ---
const authCard = document.getElementById('authCard');
const authButtons = document.getElementById('authButtons');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const registerPseudoInput = document.getElementById('registerPseudo');
const registerPinInput = document.getElementById('registerPin');
const loginPseudoInput = document.getElementById('loginPseudo');
const loginPinInput = document.getElementById('loginPin');
const examList = document.getElementById('examList');
const logoutBtn = document.getElementById('logoutBtn');
const feedbackMsg = document.getElementById('feedbackMsg');
const themeToggleBtn = document.getElementById('themeToggleBtn'); // Already exists

// --- Firebase Authentication State Listener ---
// This runs whenever the user's sign-in state changes (login, logout, register)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in (logged in or just registered)
        console.log('User is signed in:', user.uid);
        // Store pseudo locally *after* successful auth
        // IMPORTANT: This is a simple way to pass pseudo to exam pages.
        // A more robust method would involve custom claims or user documents.
        // For this example, we assume pseudo is stored on the user object if using email mapping,
        // or we could fetch it if stored elsewhere. For now, let's store the pseudo typed by user.
        // We'll use the pseudo from the input field *if* available during the state change.
        // A better way: Store pseudo in a user document linked by UID and fetch it.
        // For THIS specific setup (pseudo@example.com), we could potentially derive it,
        // but storing the input value is simpler for demo.
         const currentPseudo = registerPseudoInput.value.trim() || loginPseudoInput.value.trim();
         if (currentPseudo) {
             localStorage.setItem('inf2_pseudo', currentPseudo);
             console.log('Pseudo stored:', currentPseudo);
         } else {
            // This case might happen on page load if user was already signed in.
            // We would need a mechanism to retrieve the pseudo associated with the UID.
            // For now, if pseudo isn't in localStorage, exam page will redirect.
            console.warn('Pseudo input empty on state change. Pseudo not stored/updated.');
            // A real app might fetch user data here based on user.uid
         }


        authCard.classList.add('hidden');
        examList.classList.remove('hidden');

        // Clear forms after successful auth
        registerForm.reset();
        loginForm.reset();
        feedbackMsg.textContent = ''; // Clear feedback message

        checkExamAvailability(); // Check/update exam buttons once logged in

    } else {
        // User is signed out
        console.log('User is signed out');
        localStorage.removeItem('inf2_pseudo'); // Clear pseudo on logout
        authCard.classList.remove('hidden');
        examList.classList.add('hidden');
        // Ensure login/register forms and buttons are in a default state
        registerForm.classList.add('hidden');
        loginForm.classList.add('hidden');
        authButtons.classList.remove('hidden'); // Ensure buttons are visible
        feedbackMsg.textContent = ''; // Clear feedback message
    }
});

// --- Form Switching Logic ---
showRegisterBtn.addEventListener('click', () => {
    authButtons.classList.add('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    feedbackMsg.textContent = ''; // Clear feedback
    registerPseudoInput.focus(); // Set focus
});

showLoginBtn.addEventListener('click', () => {
    authButtons.classList.add('hidden');
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    feedbackMsg.textContent = ''; // Clear feedback
     loginPseudoInput.focus(); // Set focus
});

// Function to show feedback message
function showFeedback(message, isSuccess = true) {
    feedbackMsg.textContent = message;
    feedbackMsg.className = `feedback-message ${isSuccess ? 'feedback-success' : 'feedback-error'}`;
}


// --- Registration Logic (Using Firebase Auth) ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pseudo = registerPseudoInput.value.trim();
    const pin = registerPinInput.value; // Keep as string for password

    // Input validation
     if (pseudo.length < 2) {
        showFeedback("Le pseudo doit contenir au moins 2 caractères.", false);
        return;
    }
     if (!/^[0-9]{4}$/.test(pin)) {
         showFeedback("Le code PIN doit être composé de 4 chiffres.", false);
         return;
     }

    // Firebase Auth requires email format. We map pseudo to email.
    // A real application would likely use a backend to link pseudo to a Firebase Auth user
    // or use a different sign-in method. For this demo, we use a simple email format.
    // !!! WARNING: Firebase Auth default requires passwords >= 6 chars. A 4-char PIN will fail unless this setting is changed in Firebase console (Auth -> Settings -> Authentication -> Password minimum length). !!!
    const email = `${pseudo.toLowerCase()}@inf2-simulator.com`; // Using a dummy domain
    const password = pin; // The 4-digit PIN as the password

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Signed up successfully. onAuthStateChanged will handle UI switch.
        console.log('User registered:', userCredential.user.uid);
        // Optionally store the pseudo linked to the user UID in Firestore here if needed later
        // for things like leaderboards where you need the pseudo, not just the UID.
        // Example: await setDoc(doc(db, 'users_profile', userCredential.user.uid), { pseudo: pseudo });
        showFeedback("Inscription réussie ! Connexion automatique...", true);

    } catch (error) {
        console.error('Registration error:', error.code, error.message);
        let errorMessage = "Erreur lors de l'inscription.";
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Ce pseudo est déjà utilisé.'; // Because we map pseudo to email
                break;
             case 'auth/invalid-email': // Should not happen with our email format/validation, but good practice
                 errorMessage = 'Pseudo invalide.';
                 break;
            case 'auth/weak-password':
                 errorMessage = 'Code PIN trop faible. Il doit contenir au moins 6 caractères.'; // This is the likely error for 4-digit PINs
                 break;
             case 'auth/network-request-failed':
                errorMessage = 'Problème réseau. Veuillez vérifier votre connexion.';
                break;
            default:
                 errorMessage = `Erreur d'inscription: ${error.message}`;
                 break;
        }
        showFeedback(errorMessage, false);
    }
});

// --- Login Logic (Using Firebase Auth) ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pseudo = loginPseudoInput.value.trim();
    const pin = loginPinInput.value; // Keep as string for password

    // Input validation
    if (pseudo.length < 2) {
        showFeedback("Pseudo ou PIN incorrect.", false); // Hide specific pseudo length for security
        return;
    }
     if (!/^[0-9]{4}$/.test(pin)) {
         showFeedback("Pseudo ou PIN incorrect.", false); // Hide specific PIN format for security
         return;
     }

    // Use the same mapping as registration
    const email = `${pseudo.toLowerCase()}@inf2-simulator.com`;
    const password = pin;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Signed in successfully. onAuthStateChanged will handle UI switch.
        console.log('User logged in:', userCredential.user.uid);
         showFeedback("Connexion réussie !", true);
    } catch (error) {
        console.error('Login error:', error.code, error.message);
         let errorMessage = "Erreur lors de la connexion.";
        switch (error.code) {
            case 'auth/user-not-found': // Email doesn't exist
            case 'auth/wrong-password': // Password incorrect
                 errorMessage = 'Pseudo ou code PIN incorrect.'; // Generic message for security
                 break;
            case 'auth/invalid-email': // Should not happen with our email format
                 errorMessage = 'Pseudo ou code PIN incorrect.';
                 break;
            case 'auth/network-request-failed':
                errorMessage = 'Problème réseau. Veuillez vérifier votre connexion.';
                break;
            default:
                 errorMessage = `Erreur de connexion: ${error.message}`;
                 break;
        }
        showFeedback(errorMessage, false);
    }
});

// --- Logout Logic ---
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        // Signed out successfully, onAuthStateChanged will handle UI switch and localStorage clear
        console.log('User signed out');
         showFeedback("Déconnexion réussie.", true);
    } catch (error) {
        console.error('Logout error:', error);
        showFeedback('Erreur lors de la déconnexion.', false);
    }
});


// --- Exam Availability Logic ---
// This needs to run even if the user is already logged in on page load
function checkExamAvailability() {
    const now = new Date(); // Get current date/time in user's local timezone
    // Define target times in UTC. GMT+1 means UTC+1.
    // 21:00 GMT+1 = 20:00 UTC
    // 9:00 GMT+1 = 8:00 UTC
    // 10:30 GMT+1 = 9:30 UTC
    // 11:00 GMT+1 = 10:00 UTC
    // 12:30 GMT+1 = 11:30 UTC
    // 14:00 GMT+1 = 13:00 UTC
    // 15:30 GMT+1 = 14:30 UTC

    const year = now.getFullYear(); // Use current year

    // Dates are 0-indexed (0=Jan, 4=May)
    // Use UTC for consistency with the specified times (GMT+1 implies UTC+1)
    const exam2StartTimeUTC = Date.UTC(year, 4, 20, 20, 0, 0); // May 20, 20:00 UTC
    const exam3StartTimeUTC = Date.UTC(year, 4, 21, 8, 0, 0);  // May 21, 8:00 UTC
    const exam3EndTimeUTC = Date.UTC(year, 4, 21, 9, 30, 0);  // May 21, 9:30 UTC
    const exam4StartTimeUTC = Date.UTC(year, 4, 21, 10, 0, 0); // May 21, 10:00 UTC
    const exam4EndTimeUTC = Date.UTC(year, 4, 21, 11, 30, 0); // May 21, 11:30 UTC
    const exam5StartTimeUTC = Date.UTC(year, 4, 21, 13, 0, 0); // May 21, 13:00 UTC
    const exam5EndTimeUTC = Date.UTC(year, 4, 21, 14, 30, 0); // May 21, 14:30 UTC

    const nowUTC = now.getTime() + (now.getTimezoneOffset() * 60000); // Current time in UTC milliseconds

    const exam2Btn = document.getElementById('exam2Btn');
    const exam3Btn = document.getElementById('exam3Btn');
    const exam4Btn = document.getElementById('exam4Btn');
    const exam5Btn = document.getElementById('exam5Btn');
     const exam2TimeInfo = document.getElementById('exam2TimeInfo');
    const exam3TimeInfo = document.getElementById('exam3TimeInfo');
    const exam4TimeInfo = document.getElementById('exam4TimeInfo');
    const exam5TimeInfo = document.getElementById('exam5TimeInfo');


    // Helper to format time difference
    function formatTimeDiff(diffMs) {
        const totalSeconds = Math.floor(diffMs / 1000);
        if (totalSeconds <= 0) return 'Maintenant !';
        const days = Math.floor(totalSeconds / (60 * 60 * 24));
        const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;

        let parts = [];
        if (days > 0) parts.push(`${days}j`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0 && days === 0) parts.push(`${minutes}m`); // Only show minutes if less than a day
        if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds}s`); // Only show seconds if less than an hour

        if (parts.length === 0) return 'Maintenant !';
        return `Disponible dans ${parts.join(' ')}`;
    }


    // Exam 2: Starts May 20 21:00 GMT+1 (20:00 UTC). Assume it stays open indefinitely after starting.
    if (nowUTC >= exam2StartTimeUTC) {
        exam2Btn.disabled = false;
        exam2Btn.textContent = 'Accéder';
         exam2TimeInfo.textContent = 'Ouvert';
    } else {
         const timeDiff = exam2StartTimeUTC - nowUTC;
         exam2Btn.textContent = 'Non disponible';
         exam2TimeInfo.textContent = `Débute dans ${formatTimeDiff(timeDiff)}`;
         exam2Btn.disabled = true;
    }


    // Exam 3: May 21 9:00-10:30 GMT+1 (8:00-9:30 UTC)
    if (nowUTC >= exam3StartTimeUTC && nowUTC < exam3EndTimeUTC) {
        exam3Btn.disabled = false;
        exam3Btn.textContent = 'Accéder';
         exam3TimeInfo.textContent = 'Ouvert !';
    } else if (nowUTC < exam3StartTimeUTC) {
         const timeDiff = exam3StartTimeUTC - nowUTC;
         exam3Btn.textContent = 'Non disponible';
         exam3TimeInfo.textContent = `Débute dans ${formatTimeDiff(timeDiff)}`;
         exam3Btn.disabled = true;
    } else { // Time is past the exam window
        exam3Btn.textContent = 'Terminé';
        exam3TimeInfo.textContent = 'Terminé';
        exam3Btn.disabled = true;
    }

    // Exam 4: May 21 11:00-12:30 GMT+1 (10:00-11:30 UTC)
     if (nowUTC >= exam4StartTimeUTC && nowUTC < exam4EndTimeUTC) {
        exam4Btn.disabled = false;
        exam4Btn.textContent = 'Accéder';
         exam4TimeInfo.textContent = 'Ouvert !';
    } else if (nowUTC < exam4StartTimeUTC) {
         const timeDiff = exam4StartTimeUTC - nowUTC;
         exam4Btn.textContent = 'Non disponible';
         exam4TimeInfo.textContent = `Débute dans ${formatTimeDiff(timeDiff)}`;
         exam4Btn.disabled = true;
    } else { // Time is past the exam window
        exam4Btn.textContent = 'Terminé';
        exam4TimeInfo.textContent = 'Terminé';
        exam4Btn.disabled = true;
    }

    // Exam 5: May 21 14:00-15:30 GMT+1 (13:00-14:30 UTC)
     if (nowUTC >= exam5StartTimeUTC && nowUTC < exam5EndTimeUTC) {
        exam5Btn.disabled = false;
        exam5Btn.textContent = 'Accéder';
         exam5TimeInfo.textContent = 'Ouvert !';
    } else if (nowUTC < exam5StartTimeUTC) {
         const timeDiff = exam5StartTimeUTC - nowUTC;
         exam5Btn.textContent = 'Non disponible';
         exam5TimeInfo.textContent = `Débute dans ${formatTimeDiff(timeDiff)}`;
         exam5Btn.disabled = true;
    } else { // Time is past the exam window
        exam5Btn.textContent = 'Terminé';
        exam5TimeInfo.textContent = 'Terminé';
        exam5Btn.disabled = true;
    }
}


// Check availability initially and update every minute
// Only start interval if examList is visible (user is logged in)
// onAuthStateChanged will call checkExamAvailability initially if logged in.
// We can set an interval and clear it on logout if needed, but it's lightweight.
setInterval(checkExamAvailability, 1000); // Update every second for countdown effect


// --- Placeholder Exam Start Function ---
// This function is called when an exam button is clicked
window.startExam = function(examNumber) {
    // Check if user is logged in before starting (redundant due to UI, but safe)
    if (!auth.currentUser) {
        showFeedback('Veuillez vous connecter pour accéder aux examens.', false);
        return;
    }
    // Check if the specific exam button is enabled
    const examBtn = document.getElementById(`exam${examNumber}Btn`);
     if (examNumber !== 1 && (examBtn === null || examBtn.disabled)) {
         showFeedback(`L'examen ${examNumber} n'est pas encore disponible ou est terminé.`, false);
         return;
     }


    // Navigate to the exam page
    window.location.href = `exams/exam${examNumber}.html`;
};


// --- Theme Toggle Logic ---
// Function needs to be globally accessible because the HTML uses onclick
window.toggleTheme = function() {
    const htmlElement = document.documentElement; // Use html element for dark class
    const icon = themeToggleBtn.querySelector('i'); // Find icon within the button

    if (htmlElement.classList.contains('dark')) {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Apply saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const htmlElement = document.documentElement;
    const icon = themeToggleBtn.querySelector('i');

    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
         // Ensure the sun icon is shown if starting in dark mode
        if (icon) {
             icon.classList.remove('fa-moon');
             icon.classList.add('fa-sun');
        }
    } else {
        // Default to light if no theme saved or saved theme is not dark
        htmlElement.classList.remove('dark');
        // Ensure the moon icon is shown if starting in light mode
         if (icon) {
             icon.classList.remove('fa-sun');
             icon.classList.add('fa-moon');
         }
         // Ensure 'light' is explicitly set if it wasn't there
         if (savedTheme !== 'light') {
             localStorage.setItem('theme', 'light');
         }
    }

     // Initial check of auth state and exam availability after DOM is ready
     // onAuthStateChanged handles initial UI state, and calls checkExamAvailability if logged in.
});

// Ensure initial state for forms/buttons on page load before Auth state is known
// This prevents flickering if user is not logged in
document.addEventListener('DOMContentLoaded', () => {
    // Hide both forms initially
    registerForm.classList.add('hidden');
    loginForm.classList.add('hidden');
    // Show auth buttons initially
     authButtons.classList.remove('hidden');
});