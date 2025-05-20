// Import Firebase modules directly from CDN URLs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// --- Firebase Configuration ---
// Replace with your project's actual configuration object.
// Should be the same as in simulator-main.js
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
const db = getFirestore(app); // Pass the initialized app

// Get pseudo from localStorage. If not found, redirect to login.
const pseudo = localStorage.getItem('inf2_pseudo');
if (!pseudo) {
  alert('Veuillez vous connecter pour accéder à l\'examen.');
  window.location.href = '../index.html'; // Redirect to main page if not logged in
}

// --- DOM Elements ---
const timerEl = document.getElementById('timer');
const coursDiv = document.getElementById('questionsCours');
const exosDiv = document.getElementById('questionsExos');
const codeInput = document.getElementById('codeInput');
const deroulementContainer = document.getElementById('deroulementContainer');
const submitBtn = document.getElementById('submitBtn');
const statsDiv = document.getElementById('statsLive');
const submitFeedbackEl = document.getElementById('submitFeedback');
const themeToggleBtn = document.getElementById('themeToggleBtn');


// --- Exam Content ---
// Sujet 1 - Questions de cours
const questionsCours = [
  {
    q: "Quelle est la différence entre une variable globale et une variable locale dans un programme Pascal ?",
    type: "text", // Changed type to 'textarea' for better input
    key: "globale_locale"
  },
  {
    q: "Expliquez la syntaxe de déclaration d'une variable de type tableau à deux dimensions (matrice) en Pascal.",
    type: "text", // Changed type to 'textarea'
    key: "matrice"
  },
  {
    q: "Quel est le rôle du mot-clé VAR dans la déclaration des paramètres formels d'un sous-programme ?",
    type: "text", // Changed type to 'textarea'
    key: "var_param"
  },
  {
    q: "Quelle est la principale raison d'utiliser des sous-programmes dans un programme ?",
    type: "text", // Changed type to 'textarea'
    key: "sousprog"
  }
];

// Sujet 1 - Exercices (Partie A)
const questionsExos = [
  {
    q: "Trouver le nombre d'éléments négatifs dans le vecteur V (répondre par un nombre).", // Added clarification
    type: "number",
    key: "nb_neg"
  },
  {
    q: "Trouver la plus petite valeur négative dans le vecteur V et sa position (ex: -5 à la pos 3).", // Added clarification
    type: "text",
    key: "min_neg"
  },
  {
    q: "Calculer la somme des éléments situés sur la diagonale principale de la matrice A (répondre par un nombre).", // Added clarification
    type: "number",
    key: "somme_diag"
  },
  {
    q: "Expliquer comment remplacer les éléments de la dernière colonne de la matrice A par la somme de tous les éléments du vecteur V (décrivez l'algorithme).", // Changed to description
    type: "textarea", // Changed type to textarea
    key: "remplace_col"
  }
];

// Correction attendue (for simple auto-scoring)
// This is a very basic keyword check. A real grading would be more complex.
const corrections = {
  globale_locale: ["portée", "bloc", "déclaration", "accessible", "fonction", "procédure"], // Look for keywords related to scope
  matrice: ["array", "tableau", "dimensions", "lignes", "colonnes", ".."], // Syntax elements
  var_param: ["par variable", "adresse", "modifier", "original"], // Pass by reference/variable
  sousprog: ["modularité", "réutilisabilité", "modulaire", "réutiliser", "diviser", "DRY", "complexité"], // Benefits of subprograms
  nb_neg: ['0', 'zero'], // Assuming a specific example vector where the answer is 0 or a number
  min_neg: ['-5', 'position', 'pos', '3'], // Example based on an implicit vector V
  somme_diag: ['42', 'quarante-deux'], // Example based on an implicit matrix A
  remplace_col: ['boucle', 'colonne', 'somme', 'vecteur', 'assignation'], // Algorithm steps
};


// Timer (90 min)
let timeLeft = 90 * 60; // 90 minutes in seconds
let timerInterval;

function updateTimer() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    timerEl.textContent = "00:00";
    // Automatically submit when time runs out
    submitBtn.disabled = true; // Disable button immediately
    submitBtn.textContent = "Temps écoulé - Soumission automatique...";
     showFeedback("Temps écoulé ! Soumission automatique de vos réponses.", false);
    // Add a small delay before submitting to show message
    setTimeout(() => {
        // Check if already submitted to prevent double submission
        if (submitBtn.textContent === "Temps écoulé - Soumission automatique...") {
             submitAnswers(); // Call the submit function
        }
    }, 2000);

  } else {
    timeLeft--;
  }
}

// Start the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    timerInterval = setInterval(updateTimer, 1000);
     // Also load any previously saved answers if they exist
     loadAnswers();
});


// --- Rendering Questions ---
function renderQuestions() {
  // Questions de cours
  coursDiv.innerHTML = questionsCours.map((q, i) => `
    <div class="mb-4">
      <div class="font-semibold mb-1">${i + 1}. ${q.q}</div>
      <textarea class="form-input w-full" rows="3" data-key="${q.key}"></textarea>
    </div>
  `).join('');

  // Exercices (Partie A)
  exosDiv.innerHTML = questionsExos.map((q, i) => `
    <div class="mb-4">
      <div class="font-semibold mb-1">${i + 1}. ${q.q}</div>
      ${q.type === 'number' ? `<input type="number" class="form-input w-full" data-key="${q.key}">` : `<textarea class="form-input w-full" rows="${q.type === 'textarea' ? '3' : '1'}" data-key="${q.key}"></textarea>`}
    </div>
  `).join('');
}

renderQuestions(); // Render questions on page load

// --- Interactive Deroulement Table ---
const deroulementSteps = [
  { label: 'read(a);', a: '31251', b: '/', c: '/', x: '', m: '', r: '', aff: '' },
  { label: 'x := a;', a: '31251', b: '/', c: '/', x: '31251', m: '', r: '', aff: '' }, // Added this step based on common Pascal practice
  { label: 'Conversion1(a, b);', a: '31251', b: '/', c: '/', x: '31251', m: '', r: '', aff: '' }, // Call Conversion1
  { label: 'm := x div 60;', a: '31251', b: '/', c: '/', x: '31251', m: '520', r: '', aff: '' },
  { label: 'b := m;', a: '31251', b: '520', c: '/', x: '31251', m: '520', r: '', aff: '' },
  { label: 'Conversion2(a, c);', a: '31251', b: '520', c: '/', x: '31251', m: '520', r: '', aff: '' }, // Call Conversion2
  { label: 'r := x mod 60;', a: '31251', b: '520', c: '/', x: '31251', m: '520', r: '51', aff: '' },
  { label: 'c := r;', a: '31251', b: '520', c: '51', x: '31251', m: '520', r: '51', aff: '' },
  { label: 'Writeln ...', a: '31251', b: '520', c: '51', x: '31251', m: '520', r: '51', aff: '31251 secondes = 520 minutes et 51 secondes' },
];

function renderDeroulement(stepIdx = 0) {
  let html = `<table class="deroulement-table mb-4">
    <thead>
        <tr><th>Instructions</th><th>a</th><th>b</th><th>c</th><th>x</th><th>m</th><th>r</th><th>Affichage</th></tr>
    </thead>
    <tbody>`;
  for (let i = 0; i <= stepIdx; i++) {
    const s = deroulementSteps[i];
    html += `<tr class="${i === stepIdx ? 'bg-yellow-100 dark:bg-yellow-900 animate-pulse' : ''}">
      <td>${s.label}</td><td>${s.a}</td><td>${s.b}</td><td>${s.c}</td><td>${s.x}</td><td>${s.m}</td><td>${s.r}</td><td>${s.aff}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  if (stepIdx < deroulementSteps.length - 1) {
    html += `<button class="submit-btn" id="nextStepBtn">Étape suivante</button>`;
  } else {
    html += `<div class="text-green-600 font-bold mt-2">Déroulement terminé !</div>`;
  }
  deroulementContainer.innerHTML = html;
  if (stepIdx < deroulementSteps.length - 1) {
    document.getElementById('nextStepBtn').onclick = () => renderDeroulement(stepIdx + 1);
  }
}
renderDeroulement(0); // Start the interactive table


// --- Load/Save Answers ---
async function loadAnswers() {
    if (!pseudo) return; // Cannot load without a pseudo
    const userRef = doc(db, 'inf2_exam1', pseudo);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Load cours answers
            document.querySelectorAll('#questionsCours textarea').forEach(el => {
                if (data.cours && data.cours[el.dataset.key] !== undefined) {
                    el.value = data.cours[el.dataset.key];
                }
            });
            // Load exos answers
            document.querySelectorAll('#questionsExos input, #questionsExos textarea').forEach(el => {
                 if (data.exos && data.exos[el.dataset.key] !== undefined) {
                     el.value = data.exos[el.dataset.key];
                 }
             });
            // Load code
            if (data.code !== undefined) {
                codeInput.value = data.code;
            }
            // Check if already submitted (e.g., timer ran out on last visit)
            if (data.ts) {
                 // Assume submitted if timestamp exists
                 disableInputs();
                 submitBtn.disabled = true;
                 submitBtn.textContent = 'Réponses déjà enregistrées.';
                 showFeedback("Vos réponses ont déjà été enregistrées.", true);
                 // Stop timer if answers are loaded and timestamp exists (implies submitted)
                 clearInterval(timerInterval);
                 timerEl.textContent = "00:00"; // Set timer to 00:00


                 // Show the existing score if available
                 if(data.score !== undefined) {
                      showClassement(data.score);
                 } else {
                      // Re-calculate score if not saved (shouldn't happen if ts exists)
                       const calculatedScore = calculateScore(data.cours, data.exos, data.code);
                       showClassement(calculatedScore);
                 }

            } else {
                 // If data exists but no timestamp, means they started but didn't submit.
                 // Continue timer, but maybe adjust timeLeft based on remaining time?
                 // This is complex. For simplicity, let's just load answers and continue the timer from 90min.
                 // A real system would store start time and calculate remaining time.
                  console.log("Previous answers loaded, timer continues from start.");
            }

        } else {
            console.log("No previous answers found for this user.");
        }
    } catch (error) {
        console.error("Error loading answers:", error);
        showFeedback("Erreur lors du chargement de vos réponses.", false);
    }
}

// Simple function to disable all input fields after submission
function disableInputs() {
    document.querySelectorAll('#questionsCours textarea, #questionsExos input, #questionsExos textarea, #codeInput, #nextStepBtn').forEach(el => {
        el.disabled = true;
    });
}


// --- Scoring Logic ---
function calculateScore(coursAnswers, exoAnswers, code) {
    let score = 0;
    const lowerCours = Object.fromEntries(Object.entries(coursAnswers).map(([key, val]) => [key, val.toLowerCase()]));
    const lowerExos = Object.fromEntries(Object.entries(exoAnswers).map(([key, val]) => [key, val.toLowerCase()]));
    const lowerCode = code.toLowerCase();

    // Score questions de cours (1 point per question if keywords found)
    questionsCours.forEach(q => {
        const ans = lowerCours[q.key] || '';
        if (corrections[q.key] && corrections[q.key].some(word => ans.includes(word))) {
            score++;
        }
    });

    // Score exercices (Partie A - 1 point per question if keywords/value found)
    questionsExos.forEach(q => {
         const ans = lowerExos[q.key] || '';
         if (q.key === 'nb_neg') {
             // Basic check for number '0' or the string 'zero'
             if (ans === '0' || ans === 'zero') score++;
         } else if (q.key === 'min_neg') {
             // Check if it contains '-5' AND something indicating position (e.g., 'pos', '3')
             if (ans.includes('-5') && corrections[q.key].slice(2).some(word => ans.includes(word))) score++;
         } else if (q.key === 'somme_diag') {
              // Basic check for number '42'
              if (ans === '42' || ans === 'quarante-deux') score++; // Assuming 42 is correct sum
         } else if (q.key === 'remplace_col') {
             // Check if it mentions loop and concepts of replacement
             if (corrections[q.key].some(word => ans.includes(word))) score++; // Check for any relevant keyword
         }
    });

    // Score code (Partie B - Bonus point if contains both div and mod)
     if (lowerCode.includes('div') && lowerCode.includes('mod')) {
         score++; // This is a very basic check, a real compiler/tester is needed for proper code grading
     }

    return score; // Total maximum score is 4 (cours) + 4 (exos) + 1 (code) = 9
}


// --- Submission Logic ---
async function submitAnswers() {
    if (!pseudo) {
        showFeedback("Vous n'êtes pas connecté.", false);
        return;
    }
     if (submitBtn.disabled && submitBtn.textContent !== 'Soumettre mes réponses') {
         // Prevent double submission if already disabled by timer or previous click
         return;
     }


  // Get all answers
  const coursAnswers = {};
  document.querySelectorAll('#questionsCours textarea').forEach(el => {
    coursAnswers[el.dataset.key] = el.value.trim();
  });

  const exoAnswers = {};
  document.querySelectorAll('#questionsExos input, #questionsExos textarea').forEach(el => {
    exoAnswers[el.dataset.key] = el.value.trim();
  });

  const code = codeInput.value.trim();

  // Calculate score
  const score = calculateScore(coursAnswers, exoAnswers, code);

  // Save to Firebase
  const userRef = doc(db, 'inf2_exam1', pseudo); // Use pseudo as document ID

  try {
    // Check if document already exists to see if this is a re-submission
    const docSnap = await getDoc(userRef);

    if (docSnap.exists() && docSnap.data().ts) {
        // Already submitted with a timestamp, prevent re-submission
        showFeedback("Vos réponses ont déjà été enregistrées.", false);
        disableInputs();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Réponses déjà enregistrées.';
         clearInterval(timerInterval); // Ensure timer is stopped
         timerEl.textContent = "00:00";
    } else {
         // Save answers and score with a timestamp
         await setDoc(userRef, {
             cours: coursAnswers,
             exos: exoAnswers,
             code: code,
             score: score,
             ts: Date.now() // Timestamp of submission
         });

         showFeedback("Vos réponses ont été enregistrées avec succès !", true);
         disableInputs(); // Disable inputs after successful submission
         submitBtn.disabled = true;
         submitBtn.textContent = 'Réponses enregistrées !';
         clearInterval(timerInterval); // Stop timer on successful submission
         timerEl.textContent = "00:00";


         // Show live classement
         showClassement(score);
    }


  } catch (error) {
    console.error("Error saving answers:", error);
    showFeedback("Erreur lors de l'enregistrement de vos réponses.", false);
     submitBtn.disabled = false; // Re-enable button if save failed
     submitBtn.textContent = 'Soumettre mes réponses';
  }
}

// Attach submit event
submitBtn.addEventListener('click', submitAnswers);

// Function to show feedback message within exam page
function showFeedback(message, isSuccess = true) {
    submitFeedbackEl.textContent = message;
    submitFeedbackEl.className = `feedback-message ${isSuccess ? 'feedback-success' : 'feedback-error'}`;
}


// --- Live Classement ---
async function showClassement(userScore = null) {
  if (!statsDiv) return; // Element might not exist

  try {
    const q = query(collection(db, 'inf2_exam1'), orderBy('score', 'desc'), orderBy('ts', 'asc')); // Order by score (desc), then timestamp (asc) for ties
    const querySnapshot = await getDocs(q);

    const scores = [];
    let userRank = -1;
    let userScoreFound = false; // Flag to ensure we display the user's *actual* submitted score if available

    querySnapshot.forEach((doc, index) => {
      const d = doc.data();
      scores.push({ pseudo: doc.id, score: d.score || 0, ts: d.ts || 0 });
      if (doc.id === pseudo) {
          userRank = index + 1;
          userScoreFound = true;
      }
    });

    // If userScore was passed but not found in Firestore result (e.g., first submission),
    // add them to the list to show their score immediately.
    if (userScore !== null && !userScoreFound) {
         scores.push({ pseudo: pseudo, score: userScore, ts: Date.now() }); // Use current time as a placeholder
         // Re-sort to place the user correctly
         scores.sort((a, b) => b.score - a.score || a.ts - b.ts);
          userRank = scores.findIndex(s => s.pseudo === pseudo) + 1; // Find the new rank
    }


    let html = `<div class="mb-2">Votre score : <span class="font-bold text-blue-600">${userScoreFound ? scores[userRank-1].score : (userScore !== null ? userScore : 'Non soumis')}</span> / 9</div>`; // Use found score or passed score
    html += `<div class="mb-2">Votre position : <span class="font-bold text-green-600">${userRank !== -1 ? userRank : 'N/A'}</span> / ${scores.length}</div>`;

    html += '<table class="w-full text-sm"><thead><tr><th class="text-left">#</th><th class="text-left">Pseudo</th><th class="text-left">Score</th></tr></thead><tbody>';
    scores.slice(0, 10).forEach((s, i) => {
      html += `<tr class="${s.pseudo === pseudo ? 'bg-blue-100 dark:bg-blue-900' : ''}"><td>${i + 1}</td><td>${s.pseudo}</td><td>${s.score}</td></tr>`;
    });
    html += '</tbody></table>';
    statsDiv.innerHTML = html;

  } catch (error) {
    console.error("Error fetching classement:", error);
    statsDiv.innerHTML = '<div class="text-red-600">Erreur lors du chargement du classement.</div>';
  }
}

// Load classement initially and update every minute
document.addEventListener('DOMContentLoaded', () => {
     showClassement(); // Load classement on page load
     // Update classement periodically, but maybe less often than timer (e.g., every 30-60s)
     setInterval(() => showClassement(), 60000); // Update every minute
});


// --- Theme Toggle Logic ---
// Make the function globally accessible if needed by HTML onclick
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
    const icon = themeToggleBtn.querySelector('i'); // Ensure icon element exists

    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
        if (icon) { // Check if icon exists before manipulating classes
             icon.classList.remove('fa-moon');
             icon.classList.add('fa-sun');
        }
    } else {
        htmlElement.classList.remove('dark');
         if (icon) { // Check if icon exists
             icon.classList.remove('fa-sun');
             icon.classList.add('fa-moon');
         }
         // Ensure 'light' is explicitly set if it wasn't there
         if (savedTheme !== 'light') {
             localStorage.setItem('theme', 'light');
         }
    }
});