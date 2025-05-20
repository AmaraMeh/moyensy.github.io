import { initializeApp } from '../firebase.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const db = getFirestore();
const pseudo = localStorage.getItem('inf2_pseudo') || '';
if (!pseudo) window.location.href = '../index.html';

// Sujet 1 - Questions de cours
const questionsCours = [
  {
    q: "Quelle est la différence entre une variable globale et une variable locale dans un programme Pascal ?",
    type: "text",
    key: "globale_locale"
  },
  {
    q: "Expliquez la syntaxe de déclaration d'une variable de type tableau à deux dimensions (matrice) en Pascal.",
    type: "text",
    key: "matrice"
  },
  {
    q: "Quel est le rôle du mot-clé VAR dans la déclaration des paramètres formels d'un sous-programme ?",
    type: "text",
    key: "var_param"
  },
  {
    q: "Quelle est la principale raison d'utiliser des sous-programmes dans un programme ?",
    type: "text",
    key: "sousprog"
  }
];

// Sujet 1 - Exercices (Partie A)
const questionsExos = [
  {
    q: "Trouver le nombre d'éléments négatifs dans le vecteur V.",
    type: "number",
    key: "nb_neg"
  },
  {
    q: "Trouver la plus petite valeur négative dans le vecteur V et sa position.",
    type: "text",
    key: "min_neg"
  },
  {
    q: "Calculer la somme des éléments situés sur la diagonale principale de la matrice A.",
    type: "number",
    key: "somme_diag"
  },
  {
    q: "Remplacer les éléments de la dernière colonne de la matrice A par la somme de tous les éléments du vecteur V.",
    type: "text",
    key: "remplace_col"
  }
];

// Correction attendue (pour feedback auto simplifié)
const corrections = {
  globale_locale: ["variable globale", "variable locale"],
  matrice: ["array", "deux dimensions", "matrice"],
  var_param: ["var", "adresse", "par variable"],
  sousprog: ["modularité", "réutilisabilité", "modulaire", "réutiliser", "diviser", "DRY"],
};

// Timer (90 min)
let timeLeft = 90 * 60;
const timerEl = document.getElementById('timer');
function updateTimer() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  if (timeLeft > 0) {
    timeLeft--;
    setTimeout(updateTimer, 1000);
  } else {
    document.getElementById('submitBtn').click();
  }
}
updateTimer();

// Affichage questions de cours
const coursDiv = document.getElementById('questionsCours');
coursDiv.innerHTML = questionsCours.map((q, i) => `
  <div class="mb-4">
    <div class="font-semibold mb-1">${i + 1}. ${q.q}</div>
    <textarea class="form-input w-full" rows="2" data-key="${q.key}"></textarea>
  </div>
`).join('');

// Affichage exercices
const exosDiv = document.getElementById('questionsExos');
exosDiv.innerHTML = questionsExos.map((q, i) => `
  <div class="mb-4">
    <div class="font-semibold mb-1">${i + 1}. ${q.q}</div>
    ${q.type === 'number' ? `<input type="number" class="form-input w-full" data-key="${q.key}">` : `<input type="text" class="form-input w-full" data-key="${q.key}">`}
  </div>
`).join('');

// Déroulement interactif (tableau animé)
const deroulementContainer = document.getElementById('deroulementContainer');
const deroulementSteps = [
  { label: 'read(a);', a: '31251', b: '/', c: '/', x: '', m: '', r: '', aff: '' },
  { label: 'Conversion1(a, b);', a: '31251', b: '/', c: '/', x: '31251', m: '', r: '', aff: '' },
  { label: 'm := x div 60;', a: '31251', b: '/', c: '/', x: '31251', m: '520', r: '', aff: '' },
  { label: 'b := m;', a: '31251', b: '520', c: '/', x: '31251', m: '520', r: '', aff: '' },
  { label: 'Conversion2(a, c);', a: '31251', b: '520', c: '/', x: '31251', m: '520', r: '', aff: '' },
  { label: 'r := x mod 60;', a: '31251', b: '520', c: '/', x: '31251', m: '520', r: '51', aff: '' },
  { label: 'c := r;', a: '31251', b: '520', c: '51', x: '31251', m: '520', r: '51', aff: '' },
  { label: 'Writeln ...', a: '31251', b: '520', c: '51', x: '31251', m: '520', r: '51', aff: '31251 secondes = 520 minutes et 51 secondes' },
];

function renderDeroulement(stepIdx = 0) {
  let html = `<table class="deroulement-table mb-4">
    <tr><th>Instructions</th><th>a</th><th>b</th><th>c</th><th>x</th><th>m</th><th>r</th><th>Affichage</th></tr>`;
  for (let i = 0; i <= stepIdx; i++) {
    const s = deroulementSteps[i];
    html += `<tr class="${i === stepIdx ? 'bg-yellow-100 dark:bg-yellow-900 animate-pulse' : ''}">
      <td>${s.label}</td><td>${s.a}</td><td>${s.b}</td><td>${s.c}</td><td>${s.x}</td><td>${s.m}</td><td>${s.r}</td><td>${s.aff}</td>
    </tr>`;
  }
  html += '</table>';
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
renderDeroulement(0);

// Correction et soumission
const submitBtn = document.getElementById('submitBtn');
submitBtn.onclick = async function() {
  // Récupérer réponses
  const coursAnswers = {};
  document.querySelectorAll('#questionsCours textarea').forEach(el => {
    coursAnswers[el.dataset.key] = el.value.trim();
  });
  const exoAnswers = {};
  document.querySelectorAll('#questionsExos input').forEach(el => {
    exoAnswers[el.dataset.key] = el.value.trim();
  });
  const code = document.getElementById('codeInput').value.trim();

  // Correction simple (cours)
  let score = 0;
  for (const q of questionsCours) {
    const ans = (coursAnswers[q.key] || '').toLowerCase();
    if (corrections[q.key].some(word => ans.includes(word))) score++;
  }
  // Correction exos (simplifiée)
  if (exoAnswers.nb_neg === '0') score++; // Accept 0 for demo
  if (exoAnswers.min_neg) score++;
  if (exoAnswers.somme_diag) score++;
  if (exoAnswers.remplace_col) score++;
  // Correction code (bonus)
  if (code.toLowerCase().includes('div') && code.toLowerCase().includes('mod')) score++;

  // Sauvegarde Firebase
  const userRef = doc(db, 'inf2_exam1', pseudo);
  await setDoc(userRef, {
    cours: coursAnswers,
    exos: exoAnswers,
    code,
    score,
    ts: Date.now()
  });

  // Afficher feedback et stats
  submitBtn.disabled = true;
  submitBtn.textContent = 'Réponses enregistrées !';
  showClassement(score);
};

// Classement live
async function showClassement(userScore) {
  const statsDiv = document.getElementById('statsLive');
  const qSnap = await getDocs(query(collection(db, 'inf2_exam1')));
  const scores = [];
  qSnap.forEach(doc => {
    const d = doc.data();
    scores.push({ pseudo: doc.id, score: d.score || 0, ts: d.ts || 0 });
  });
  scores.sort((a, b) => b.score - a.score || a.ts - b.ts);
  const pos = scores.findIndex(s => s.pseudo === pseudo) + 1;
  let html = `<div class="mb-2">Votre score : <span class="font-bold text-blue-600">${userScore}</span> / 9</div>`;
  html += `<div class="mb-2">Votre position : <span class="font-bold text-green-600">${pos}</span> / ${scores.length}</div>`;
  html += '<table class="w-full text-sm"><tr><th class="text-left">#</th><th class="text-left">Pseudo</th><th class="text-left">Score</th></tr>';
  scores.slice(0, 10).forEach((s, i) => {
    html += `<tr${s.pseudo === pseudo ? ' class="bg-blue-100 dark:bg-blue-900"' : ''}><td>${i + 1}</td><td>${s.pseudo}</td><td>${s.score}</td></tr>`;
  });
  html += '</table>';
  statsDiv.innerHTML = html;
}

// Mode sombre/clair
window.toggleTheme = function() {
  const body = document.body;
  const icon = document.querySelector('.theme-toggle i');
  body.classList.toggle('dark');
  if (body.classList.contains('dark')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    localStorage.setItem('theme', 'dark');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    localStorage.setItem('theme', 'light');
  }
};
(function() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
  }
})(); 