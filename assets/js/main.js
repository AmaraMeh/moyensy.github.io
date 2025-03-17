function afficherFormulaire(specialty, semester) {
    const moduleContainer = document.getElementById('moduleContainer');
    const specialtyData = universiteBejaiaData[anneeSelect.value];
    
    if (!specialtyData || !specialtyData[specialty] || !specialtyData[specialty][semester]) {
        moduleContainer.innerHTML = '';
        return;
    }

    let html = '';
    specialtyData[specialty][semester].forEach((module, index) => {
        html += `
            <div class="module-card bg-white shadow-md rounded-lg p-6 mb-4" data-matiere-index="${index}" data-coefficient="${module.coefficient}">
                <h3 class="module-name text-lg font-semibold mb-4">${module.matiere}</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${module.evaluations.includes('TD') ? `
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Note TD</label>
                            <input type="number" class="td-note form-input" min="0" max="20" step="0.01">
                        </div>
                    ` : ''}
                    ${module.evaluations.includes('TP') ? `
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Note TP</label>
                            <input type="number" class="tp-note form-input" min="0" max="20" step="0.01">
                        </div>
                    ` : ''}
                    ${module.evaluations.includes('Examen') ? `
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Note Examen</label>
                            <input type="number" class="examen-note form-input" min="0" max="20" step="0.01">
                        </div>
                    ` : ''}
                </div>
                <div class="mt-4 text-right">
                    <span class="font-medium">Coefficient: ${module.coefficient}</span>
                    <span class="ml-4">Moyenne: <span class="moyenne-display font-bold">-</span>/20</span>
                </div>
            </div>
        `;
    });

    moduleContainer.innerHTML = html;
}document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on library or guide pages
    if (window.location.pathname.includes('bib.html') || 
        window.location.pathname.includes('guide.html')) {
        window.location.href = 'maintenance.html';
        return;
    }

    // Initialize calculator form if we're on the calculator page
    const anneeSelect = document.getElementById('anneeSelect');
    const specialiteSelect = document.getElementById('specialiteSelect');
    const semestreSelect = document.getElementById('semestreSelect');

    if (anneeSelect && specialiteSelect && semestreSelect) {
        // Event listeners
        anneeSelect.addEventListener('change', function() {
            console.log('Année sélectionnée:', this.value);
            updateSpecialiteOptions();
            updateSemestreOptions();
        });

        specialiteSelect.addEventListener('change', function() {
            console.log('Spécialité sélectionnée:', this.value);
            updateSemestreOptions();
            if (this.value && anneeSelect.value && semestreSelect.value) {
                afficherFormulaire(specialiteSelect.value, semestreSelect.value);
            }
        });

        semestreSelect.addEventListener('change', function() {
            console.log('Semestre sélectionné:', this.value);
            if (this.value && anneeSelect.value && specialiteSelect.value) {
                afficherFormulaire(specialiteSelect.value, this.value);
            }
        });

        // Initial load
        updateSpecialiteOptions();
    }
});

// Update maintenance redirect
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('maintenance.html')) {
        window.location.href = 'calculator.html';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        // Redirect to profile page if logged in
        if (window.location.pathname.includes('auth.html') || window.location.pathname.includes('signin.html')) {
            window.location.href = 'profile.html';
        }

        // Replace "Connexion" and "Créer un compte" buttons with "Profile" button
        const authButtons = document.querySelector('.welcome-box .flex');
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="profile.html" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                    <i class="fas fa-user mr-2"></i>
                    Profile
                </a>
            `;
        }
    }
});

// Function to handle login
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Test credentials
    if (email === 'djamal@campuselkseur.com' && password === 'vivelethon') {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'profile.html';
    } else {
        alert('Invalid credentials');
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Attach event listeners for login and logout
document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
document.querySelector('.profile-action-button')?.addEventListener('click', handleLogout);

'use strict';

let annee, specialite, semestre;

function calculateMatiereAverage(modules, matiereModules) {
    let sommeNotes = 0;
    let sommeCoeff = 0;
    let moduleMarks = [];
    
    modules.forEach((module, index) => {
        const moduleId = matiereModules[index];
        
        // Get input values
        const tdInput = document.getElementById(`${moduleId}_TD`);
        const tpInput = document.getElementById(`${moduleId}_TP`);
        const exInput = document.getElementById(`${moduleId}_EX`);

        // Parse values with default of 0 for TD and TP
        const noteTD = tdInput ? parseFloat(tdInput.value) || 0 : 0;
        const noteTP = tpInput ? parseFloat(tpInput.value) || 0 : 0;
        const noteExamen = exInput ? parseFloat(exInput.value) || 0 : 0;

        console.log(`Module: ${module.matiere}, TD: ${noteTD}, TP: ${noteTP}, Examen: ${noteExamen}`); // Log input values

        let note = 0;

        // Calculate based on the evaluation criteria
        if (module.evaluations.includes("TP")) {
            if (module.evaluations.includes("TD") && module.evaluations.includes("Examen")) {
                note = (noteTD * 0.2) + (noteTP * 0.2) + (noteExamen * 0.6);
            } else if (module.evaluations.includes("TP") && module.evaluations.includes("Examen")) {
                note = (noteTP * 0.4) + (noteExamen * 0.6);
            } else if (module.evaluations.includes("Examen")) {
                note = noteExamen;
            }
        } else {
            if (module.evaluations.includes("TD") && module.evaluations.includes("Examen")) {
                note = (noteTD * 0.4) + (noteExamen * 0.6);
            } else if (module.evaluations.includes("TD")) {
                note = noteTD;
            } else if (module.evaluations.includes("Examen")) {
                note = noteExamen;
            }
        }

        console.log(`Calculated Note for ${module.matiere}: ${note}`); // Log calculated note

        // Store module mark for display
        moduleMarks.push({
            name: module.matiere,
            mark: note.toFixed(2),
            coefficient: module.coefficient,
            validated: note >= module.noteEliminatoire // Check if the module is validated
        });

        sommeNotes += note * module.coefficient;
        sommeCoeff += module.coefficient;
    });

    return {
        moyenne: sommeCoeff > 0 ? sommeNotes / sommeCoeff : 0,
        moduleMarks: moduleMarks
    };
}

function groupModulesByMatiere(modules) {
    const matiereGroups = {};
    modules.forEach(module => {
        if (!matiereGroups[module.matiere]) {
            matiereGroups[module.matiere] = { modules: [], totalCredits: 0 };
        }
        matiereGroups[module.matiere].modules.push(module);
        matiereGroups[module.matiere].totalCredits += module.credits;
    });
    return matiereGroups;
}

function updateSpecialiteOptions() {
    const anneeSelect = document.getElementById('anneeSelect');
    const specialiteSelect = document.getElementById('specialiteSelect');
    
    // Clear current options
    specialiteSelect.innerHTML = '<option value="">--Sélectionnez--</option>';
    
    const selectedAnnee = anneeSelect.value;
    console.log('Updating specialties for year:', selectedAnnee);
    
    if (selectedAnnee && universiteBejaiaData[selectedAnnee]) {
        const specialites = Object.keys(universiteBejaiaData[selectedAnnee]);
        console.log('Available specialties:', specialites);
        
        specialites.forEach(specialite => {
            const option = document.createElement('option');
            option.value = specialite;
            option.textContent = specialite;
            specialiteSelect.appendChild(option);
        });
    }
}

function updateSemestreOptions() {
    const anneeSelect = document.getElementById('anneeSelect');
    const specialiteSelect = document.getElementById('specialiteSelect');
    const semestreSelect = document.getElementById('semestreSelect');
    
    semestreSelect.innerHTML = '<option value="">--Sélectionnez--</option>';
    
    const selectedAnnee = anneeSelect.value;
    const selectedSpecialite = specialiteSelect.value;
    
    if (selectedAnnee && selectedSpecialite && 
        universiteBejaiaData[selectedAnnee] && 
        universiteBejaiaData[selectedAnnee][selectedSpecialite]) {
        
        const semestres = Object.keys(universiteBejaiaData[selectedAnnee][selectedSpecialite]);
        console.log('Available semesters:', semestres);
        
        semestres.forEach(semestre => {
            const option = document.createElement('option');
            option.value = semestre;
            option.textContent = semestre;
            semestreSelect.appendChild(option);
        });
    }
}

// Event listeners for form updates
document.addEventListener('DOMContentLoaded', function() {
    const specialiteSelect = document.getElementById('specialiteSelect');
    const semestreSelect = document.getElementById('semestreSelect');
    const moduleContainer = document.getElementById('moduleContainer');

    function updateForm() {
        const specialty = specialiteSelect.value;
        const semester = semestreSelect.value;
        
        if (specialty && semester) {
            afficherFormulaire(specialty, semester);
        } else {
            moduleContainer.innerHTML = '';
        }
    }

    // Event listeners for select changes
    specialiteSelect.addEventListener('change', updateForm);
    semestreSelect.addEventListener('change', updateForm);

    // Event delegation for grade inputs
    moduleContainer.addEventListener('input', function(e) {
        if (e.target.classList.contains('td-note') || 
            e.target.classList.contains('tp-note') || 
            e.target.classList.contains('examen-note')) {
            calculerMoyenneGenerale();
        }
    });
});

// Calculate individual module average
function calculerMoyenneMatiere(moduleIndex) {
    const specialite = specialiteSelect.value;
    const semestre = semestreSelect.value;
    const module = universiteBejaiaData["1ere Année Licence"][specialite][semestre][moduleIndex];
    
    const notes = {};
    const inputs = document.querySelectorAll(`input[data-module="${moduleIndex}"]`);
    const inputsRemplis = {};
    
    inputs.forEach(input => {
        const type = input.getAttribute('data-type');
        // Vérifier si l'input a une valeur réellement entrée (même 0)
        inputsRemplis[type] = input.value !== '';
        notes[type] = parseFloat(input.value) || 0;
    });
    
    // Vérifier si tous les inputs requis ont une valeur renseignée
    if (Object.values(inputsRemplis).some(estRempli => !estRempli)) {
        return 0; // Return 0 seulement si un champ est vraiment vide
    }
    
    // Reste du code inchangé...
    // Calculate weighted average based on evaluation types
    const evaluations = module.evaluations;
    
    // Si le module n'a que TP
    if (evaluations.length === 1 && evaluations.includes('TP')) {
        return notes.tp;
    }
    
    // Si le module a TP et Examen
    if (evaluations.length === 2 && evaluations.includes('TP') && evaluations.includes('Examen')) {
        return (notes.tp * 0.4) + (notes.examen * 0.6);
    }
    
    // Si le module a TD et Examen
    if (evaluations.length === 2 && evaluations.includes('TD') && evaluations.includes('Examen')) {
        return (notes.td * 0.4) + (notes.examen * 0.6);
    }
    
    // Si le module a TD, TP et Examen
    if (evaluations.includes('TD') && evaluations.includes('TP') && evaluations.includes('Examen')) {
        return (notes.td * 0.2) + (notes.tp * 0.2) + (notes.examen * 0.6);
    }
    
    // Si le module n'a que Examen
    if (evaluations.length === 1 && evaluations.includes('Examen')) {
        return notes.examen;
    }
    
    // Par défaut, retourner la moyenne de toutes les notes disponibles
    const sum = Object.values(notes).reduce((a, b) => a + b, 0);
    return sum / Object.values(notes).length;
}

function calculerMoyenneGenerale() {
    const specialite = specialiteSelect.value;
    const semestre = semestreSelect.value;
    const modules = universiteBejaiaData["1ere Année Licence"][specialite][semestre];
    
    let totalCoefficients = 0;
    
    // Calculer le total des coefficients de la spécialité
    modules.forEach(module => {
        totalCoefficients += module.coefficient;
    });
    
    const moduleResults = document.getElementById('modules-results');
    moduleResults.innerHTML = '';
    
    let moyenneGenerale = 0;
    
    modules.forEach((module, index) => {
        const moyenne = calculerMoyenneMatiere(index);
        if (moyenne > 0) {
            // Pour la moyenne générale, on divise directement par le total des coefficients
            moyenneGenerale += (moyenne * module.coefficient) / totalCoefficients;
            
            // Add module result to display with improved styling
            const moduleResult = document.createElement('div');
            moduleResult.className = 'bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300';
            
            // Determine color class based on grade
            const colorClass = moyenne >= 10 ? 'text-green-600' : 'text-red-600';
            const bgColorClass = moyenne >= 10 ? 'bg-green-50' : 'bg-red-50';
            const icon = moyenne >= 10 ? '✓' : '✗';
            moduleResult.classList.add(bgColorClass);
            
            moduleResult.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex flex-col">
                        <h4 class="font-semibold text-gray-800 text-lg">${module.matiere}</h4>
                        <span class="text-xs text-gray-500">Coefficient: ${module.coefficient}</span>
                    </div>
                    <div class="flex items-center bg-white p-3 rounded-full shadow-sm">
                        <div class="text-2xl font-bold ${colorClass}">${moyenne.toFixed(2)}</div>
                        <div class="ml-2 text-2xl ${colorClass}">${icon}</div>
                    </div>
                </div>
                <div class="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full ${moyenne >= 10 ? 'bg-green-500' : 'bg-red-500'}" style="width: ${Math.min(moyenne * 5, 100)}%;"></div>
                </div>
            `;
            moduleResults.appendChild(moduleResult);
        }
    });
    
    // Show results with improved styling
    resultats.style.display = 'block';
    const moyenneDisplay = resultats.querySelector('.moyenne-generale');
    moyenneDisplay.className = 'moyenne-generale mt-8 p-8 rounded-lg text-center shadow-lg ' + 
        (moyenneGenerale >= 10 ? 'bg-green-50' : 'bg-red-50');
    
    // Clear previous content with enhanced display
    moyenneDisplay.innerHTML = `
        <h3 class="text-xl font-semibold mb-6 text-gray-800">Moyenne Générale</h3>
        <div class="flex items-center justify-center">
            <div class="relative">
                <div class="text-5xl font-bold ${moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-600'}">
                    ${moyenneGenerale.toFixed(2)}
                </div>
                <div class="text-xs absolute top-0 right-0 transform translate-x-full -translate-y-1/4 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                    /20
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="w-48 h-48 mx-auto relative">
                <div class="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" class="w-full h-full">
                        <path class="stroke-current ${moyenneGenerale >= 10 ? 'text-green-200' : 'text-red-200'}" fill="none" stroke-width="3" stroke-linecap="round"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="stroke-current ${moyenneGenerale >= 10 ? 'text-green-500' : 'text-red-500'}" fill="none" stroke-width="3" stroke-linecap="round"
                            stroke-dasharray="${moyenneGenerale * 5}, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div class="absolute text-lg font-semibold ${moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-600'}">
                        ${moyenneGenerale >= 10 ? 'Semestre Validé ✓' : 'Semestre Non Validé ✗'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Scroll to results
    resultats.scrollIntoView({ behavior: 'smooth' });
}

function calculerMoyenne(notes, coefficients) {
    if (notes.length !== coefficients.length) return 0;
    let somme = 0;
    let sommeCoef = 0;
    
    for (let i = 0; i < notes.length; i++) {
        if (notes[i] !== null && !isNaN(notes[i])) {
            somme += notes[i] * coefficients[i];
            sommeCoef += coefficients[i];
        }
    }
    
    return sommeCoef > 0 ? (somme / sommeCoef).toFixed(2) : 0;
}

function verifierNoteEliminatoire(moyenne, matiere, specialite) {
    if (specialite === "Architecture") {
        const noteEliminatoire = matiere.noteEliminatoire || 0;
        return moyenne < noteEliminatoire;
    }
    return false;
}

function updateMoyenneUI(moyenne, tdElement, matiere, specialite) {
    tdElement.textContent = moyenne;
    if (specialite === "Architecture") {
        const hasEliminatoryNote = verifierNoteEliminatoire(parseFloat(moyenne), matiere, specialite);
        if (hasEliminatoryNote) {
            tdElement.classList.add('bg-red-100');
            tdElement.setAttribute('title', 'Note éliminatoire');
        } else {
            tdElement.classList.remove('bg-red-100');
            tdElement.removeAttribute('title');
        }
    }
}

// Get DOM elements
const specialiteSelect = document.getElementById('specialiteSelect');
const semestreSelect = document.getElementById('semestreSelect');
const noteForm = document.getElementById('noteForm');
const resultats = document.getElementById('resultats');

// Event listeners
specialiteSelect.addEventListener('change', handleSpecialiteChange);
semestreSelect.addEventListener('change', handleSemestreChange);

function handleSpecialiteChange() {
    const specialite = specialiteSelect.value;
    
    // Clear semester select
    semestreSelect.innerHTML = '<option value="">--Sélectionnez--</option>';
    
    // Clear the form
    noteForm.innerHTML = '';
    
    // Hide results
    resultats.style.display = 'none';
    
    if (specialite) {
        // Add available semesters for this specialite
        const semesters = Object.keys(universiteBejaiaData["1ere Année Licence"][specialite] || {});
        semesters.forEach(semester => {
            const option = document.createElement('option');
            option.value = semester;
            option.textContent = semester;
            semestreSelect.appendChild(option);
        });
    }
}

function handleSemestreChange() {
    const specialite = specialiteSelect.value;
    const semestre = semestreSelect.value;
    
    // Clear the form
    noteForm.innerHTML = '';
    
    // Hide results
    resultats.style.display = 'none';
    
    if (specialite && semestre) {
        const modules = universiteBejaiaData["1ere Année Licence"][specialite][semestre];
        if (modules) {
            modules.forEach((module, index) => {
                const moduleCard = createModuleCard(module, index);
                noteForm.appendChild(moduleCard);
            });
        }
    }
}

function createModuleCard(module, index) {
    const card = document.createElement('div');
    card.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-md transition-shadow duration-200';
    
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-4';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold text-gray-800';
    title.textContent = module.matiere;
    
    const coef = document.createElement('span');
    coef.className = 'text-sm text-gray-600';
    coef.textContent = `Coefficient: ${module.coefficient}`;
    
    header.appendChild(title);
    header.appendChild(coef);
    card.appendChild(header);
    
    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
    
    module.evaluations.forEach(type => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'flex flex-col';
        
        const label = document.createElement('label');
        label.className = 'text-sm font-medium text-gray-700 mb-1';
        label.textContent = `Note ${type}`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '20';
        input.step = '0.01';
        input.className = 'border rounded-md px-3 py-2 note-input';
        input.setAttribute('data-type', type.toLowerCase());
        input.setAttribute('data-module', index);
        
        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        inputsContainer.appendChild(inputGroup);
    });
    
    card.appendChild(inputsContainer);
    return card;
}

function calculerMoyenneMatiere(moduleIndex) {
    const specialite = specialiteSelect.value;
    const semestre = semestreSelect.value;
    const module = universiteBejaiaData["1ere Année Licence"][specialite][semestre][moduleIndex];
    
    const notes = {};
    const inputs = document.querySelectorAll(`input[data-module="${moduleIndex}"]`);
    const inputsRemplis = {};
    
    inputs.forEach(input => {
        const type = input.getAttribute('data-type');
        // Vérifier si l'input a une valeur réellement entrée (même 0)
        inputsRemplis[type] = input.value !== '';
        notes[type] = parseFloat(input.value) || 0;
    });
    
    // Vérifier si tous les inputs requis ont une valeur renseignée
    if (Object.values(inputsRemplis).some(estRempli => !estRempli)) {
        return 0; // Return 0 seulement si un champ est vraiment vide
    }
    
    // Reste du code inchangé...
    // Calculate weighted average based on evaluation types
    const evaluations = module.evaluations;
    
    // Si le module n'a que TP
    if (evaluations.length === 1 && evaluations.includes('TP')) {
        return notes.tp;
    }
    
    // Si le module a TP et Examen
    if (evaluations.length === 2 && evaluations.includes('TP') && evaluations.includes('Examen')) {
        return (notes.tp * 0.4) + (notes.examen * 0.6);
    }
    
    // Si le module a TD et Examen
    if (evaluations.length === 2 && evaluations.includes('TD') && evaluations.includes('Examen')) {
        return (notes.td * 0.4) + (notes.examen * 0.6);
    }
    
    // Si le module a TD, TP et Examen
    if (evaluations.includes('TD') && evaluations.includes('TP') && evaluations.includes('Examen')) {
        return (notes.td * 0.2) + (notes.tp * 0.2) + (notes.examen * 0.6);
    }
    
    // Si le module n'a que Examen
    if (evaluations.length === 1 && evaluations.includes('Examen')) {
        return notes.examen;
    }
    
    // Par défaut, retourner la moyenne de toutes les notes disponibles
    const sum = Object.values(notes).reduce((a, b) => a + b, 0);
    return sum / Object.values(notes).length;
}

function calculerMoyenneGenerale() {
    const specialite = specialiteSelect.value;
    const semestre = semestreSelect.value;
    const modules = universiteBejaiaData["1ere Année Licence"][specialite][semestre];
    
    let totalCoefficients = 0;
    
    // Calculer le total des coefficients de la spécialité
    modules.forEach(module => {
        totalCoefficients += module.coefficient;
    });
    
    const moduleResults = document.getElementById('modules-results');
    moduleResults.innerHTML = '';
    
    let moyenneGenerale = 0;
    
    modules.forEach((module, index) => {
        const moyenne = calculerMoyenneMatiere(index);
        if (moyenne > 0) {
            // Pour la moyenne générale, on divise directement par le total des coefficients
            moyenneGenerale += (moyenne * module.coefficient) / totalCoefficients;
            
            // Add module result to display with improved styling
            const moduleResult = document.createElement('div');
            moduleResult.className = 'bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300';
            
            // Determine color class based on grade
            const colorClass = moyenne >= 10 ? 'text-green-600' : 'text-red-600';
            const bgColorClass = moyenne >= 10 ? 'bg-green-50' : 'bg-red-50';
            const icon = moyenne >= 10 ? '✓' : '✗';
            moduleResult.classList.add(bgColorClass);
            
            moduleResult.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex flex-col">
                        <h4 class="font-semibold text-gray-800 text-lg">${module.matiere}</h4>
                        <span class="text-xs text-gray-500">Coefficient: ${module.coefficient}</span>
                    </div>
                    <div class="flex items-center bg-white p-3 rounded-full shadow-sm">
                        <div class="text-2xl font-bold ${colorClass}">${moyenne.toFixed(2)}</div>
                        <div class="ml-2 text-2xl ${colorClass}">${icon}</div>
                    </div>
                </div>
                <div class="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full ${moyenne >= 10 ? 'bg-green-500' : 'bg-red-500'}" style="width: ${Math.min(moyenne * 5, 100)}%;"></div>
                </div>
            `;
            moduleResults.appendChild(moduleResult);
        }
    });
    
    // Show results with improved styling
    resultats.style.display = 'block';
    const moyenneDisplay = resultats.querySelector('.moyenne-generale');
    moyenneDisplay.className = 'moyenne-generale mt-8 p-8 rounded-lg text-center shadow-lg ' + 
        (moyenneGenerale >= 10 ? 'bg-green-50' : 'bg-red-50');
    
    // Clear previous content with enhanced display
    moyenneDisplay.innerHTML = `
        <h3 class="text-xl font-semibold mb-6 text-gray-800">Moyenne Générale</h3>
        <div class="flex items-center justify-center">
            <div class="relative">
                <div class="text-5xl font-bold ${moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-600'}">
                    ${moyenneGenerale.toFixed(2)}
                </div>
                <div class="text-xs absolute top-0 right-0 transform translate-x-full -translate-y-1/4 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                    /20
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="w-48 h-48 mx-auto relative">
                <div class="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" class="w-full h-full">
                        <path class="stroke-current ${moyenneGenerale >= 10 ? 'text-green-200' : 'text-red-200'}" fill="none" stroke-width="3" stroke-linecap="round"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="stroke-current ${moyenneGenerale >= 10 ? 'text-green-500' : 'text-red-500'}" fill="none" stroke-width="3" stroke-linecap="round"
                            stroke-dasharray="${moyenneGenerale * 5}, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div class="absolute text-lg font-semibold ${moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-600'}">
                        ${moyenneGenerale >= 10 ? 'Semestre Validé ✓' : 'Semestre Non Validé ✗'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Scroll to results
    resultats.scrollIntoView({ behavior: 'smooth' });
}

// Fonction pour exporter les résultats en PDF
async function exportToPDF() {
    const { jsPDF } = window.jspdf;

    // Capturer la section des résultats
    const resultatsElement = document.getElementById('resultats');
    const canvas = await html2canvas(resultatsElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    // Créer un PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // Marges
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Ajouter l'image au PDF
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

    // Ajouter les tags
    pdf.setFontSize(10);
    pdf.text('@spot_campuselkseur', 10, pageHeight - 20);
    pdf.text('Made by Amara Mehdi', 10, pageHeight - 15);

    // Télécharger le PDF
    pdf.save('resultats.pdf');
}

// Fonction pour partager sur Instagram (générer une image)
async function shareOnInstagram() {
    const resultatsElement = document.getElementById('resultats');
    const canvas = await html2canvas(resultatsElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    // Créer un lien de téléchargement pour l'image
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'resultats.png';
    link.click();

    alert("Image générée ! Vous pouvez maintenant la partager sur Instagram.");
}