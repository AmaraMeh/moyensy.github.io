// Gestion du mode sombre/clair
function toggleTheme() {
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
}
// Charger le thème sauvegardé
(function() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
    }
})();

// --- Correction affichage forms ---
document.addEventListener('DOMContentLoaded', function() {
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const examList = document.getElementById('examList');
    const feedback = document.createElement('div');
    feedback.id = 'feedbackMsg';
    feedback.className = 'text-center text-sm my-2';
    showRegisterBtn.parentNode.insertAdjacentElement('afterend', feedback);

    // Par défaut, masquer les deux forms
    registerForm.classList.add('hidden');
    loginForm.classList.add('hidden');

    showRegisterBtn.onclick = function() {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        feedback.textContent = '';
    };
    showLoginBtn.onclick = function() {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        feedback.textContent = '';
    };

    // Firebase
    import('../firebase.js').then(({ app }) => {
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js').then(({ getFirestore, doc, setDoc, getDoc }) => {
            const db = getFirestore();

            // Registration
            registerForm.onsubmit = async (e) => {
                e.preventDefault();
                const pseudo = document.getElementById('registerPseudo').value.trim();
                const pin = document.getElementById('registerPin').value.trim();
                if (pseudo.length < 2 || pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) {
                    feedback.textContent = 'Pseudo ou PIN invalide.';
                    feedback.className = 'text-center text-red-600 my-2';
                    return;
                }
                const userRef = doc(db, 'inf2_users', pseudo);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    feedback.textContent = 'Ce pseudo est déjà utilisé.';
                    feedback.className = 'text-center text-red-600 my-2';
                    return;
                }
                await setDoc(userRef, { pin });
                feedback.textContent = 'Inscription réussie ! Connectez-vous.';
                feedback.className = 'text-center text-green-600 my-2';
                registerForm.reset();
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
            };

            // Login
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                const pseudo = document.getElementById('loginPseudo').value.trim();
                const pin = document.getElementById('loginPin').value.trim();
                if (pseudo.length < 2 || pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) {
                    feedback.textContent = 'Pseudo ou PIN invalide.';
                    feedback.className = 'text-center text-red-600 my-2';
                    return;
                }
                const userRef = doc(db, 'inf2_users', pseudo);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists() || userSnap.data().pin !== pin) {
                    feedback.textContent = 'Pseudo ou PIN incorrect.';
                    feedback.className = 'text-center text-red-600 my-2';
                    return;
                }
                localStorage.setItem('inf2_pseudo', pseudo);
                localStorage.setItem('inf2_pin', pin);
                loginForm.classList.add('hidden');
                examList.classList.remove('hidden');
                feedback.textContent = '';
            };

            // Affichage direct examList si déjà connecté
            if (localStorage.getItem('inf2_pseudo')) {
                registerForm.classList.add('hidden');
                loginForm.classList.add('hidden');
                examList.classList.remove('hidden');
            }
        });
    });

    // Navigation vers les examens
    window.startExam = function(num) {
        if (!localStorage.getItem('inf2_pseudo')) {
            feedback.textContent = 'Veuillez vous connecter.';
            feedback.className = 'text-center text-red-600 my-2';
            return;
        }
        window.location.href = `exams/exam${num}.html`;
    };
}); 