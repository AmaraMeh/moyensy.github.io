document.addEventListener('DOMContentLoaded', function() {
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
                afficherFormulaire(anneeSelect.value, this.value, semestreSelect.value);
            }
        });

        semestreSelect.addEventListener('change', function() {
            console.log('Semestre sélectionné:', this.value);
            if (this.value && anneeSelect.value && specialiteSelect.value) {
                afficherFormulaire(anneeSelect.value, specialiteSelect.value, this.value);
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
                note = (noteTD + noteTP + (noteExamen * 3)) / 5; // TD + TP + Examen
            } else if (module.evaluations.includes("TP") && module.evaluations.includes("Examen")) {
                note = (noteTP * 2 + (noteExamen * 3)) / 5; // TP + Examen
            } else if (module.evaluations.includes("Examen")) {
                note = noteExamen; // Only Examen
            }
        } else {
            // Other fields calculation
            if (module.evaluations.includes("TD") && module.evaluations.includes("Examen")) {
                note = (noteTD * 0.4) + (noteExamen * 0.6); // Default: 40% TD + 60% Examen
            } else if (module.evaluations.includes("TP") && module.evaluations.includes("Examen")) {
                note = (noteTP * 2 + (noteExamen * 3)) / 5; // TP + Examen
            } else if (module.evaluations.includes("TD") && module.evaluations.includes("TP")) {
                note = (noteTD + noteTP + (noteExamen * 3)) / 5; // TD + TP + Examen
            } else if (module.evaluations.includes("Examen")) {
                note = noteExamen; // Only Examen
            }
        }

        console.log(`Calculated Note for ${module.matiere}: ${note}`); // Log calculated note

        // Store module mark for display
        moduleMarks.push({
            name: module.matiere,
            mark: note.toFixed(2),
            coefficient: module.coefficient,
            validated: note >= 10 // Check if the module is validated
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
    
    if (selectedAnnee && isetComData[selectedAnnee]) {
        const specialites = Object.keys(isetComData[selectedAnnee]);
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
        isetComData[selectedAnnee] && 
        isetComData[selectedAnnee][selectedSpecialite]) {
        
        const semestres = Object.keys(isetComData[selectedAnnee][selectedSpecialite]);
        console.log('Available semesters:', semestres);
        
        semestres.forEach(semestre => {
            const option = document.createElement('option');
            option.value = semestre;
            option.textContent = semestre;
            semestreSelect.appendChild(option);
        });
    }
}

function afficherFormulaire(annee, specialite, semestre) {
    const formContainer = document.getElementById('noteForm');
    if (!formContainer) return;

    const matieres = isetComData[annee][specialite][semestre];
    let formHTML = '';

    formHTML += matieres.map((matiere, index) => `
        <div class="module-card p-4 bg-white rounded-lg shadow-md" data-matiere-index="${index}" data-coefficient="${matiere.coefficient}">
            <div class="module-header mb-4">
                <h3 class="module-title text-lg font-semibold">${matiere.matiere}</h3>
                <div class="text-sm text-gray-600">
                    <span>Coefficient: ${matiere.coefficient}</span>
                    ${matiere.credits ? `<span class="ml-2">Credits: ${matiere.credits}</span>` : ''}
                </div>
            </div>
            <div class="note-inputs grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${matiere.evaluations.map(type => `
                    <div class="note-field">
                        <label for="matiere_${index}_${type}" class="block text-sm font-medium text-gray-700 mb-1">${type}</label>
                        <input type="number" 
                            id="matiere_${index}_${type}"
                            data-type="${type}" 
                            min="0" 
                            max="20" 
                            step="0.25"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    formContainer.innerHTML = formHTML;
}

function calculerMoyenneMatiere(matiereIndex) {
    const matiere = document.querySelector(`[data-matiere-index="${matiereIndex}"]`);
    if (!matiere) return null;

    const inputs = matiere.querySelectorAll('input[type="number"]');
    let notes = {
        TD: [],
        TP: [],
        Examen: null
    };

    inputs.forEach(input => {
        const value = parseFloat(input.value);
        const type = input.dataset.type;
        
        if (!isNaN(value) && value >= 0 && value <= 20) {
            if (type === 'Examen') {
                notes.Examen = value;
            } else if (type === 'TD') {
                notes.TD.push(value);
            } else if (type === 'TP') {
                notes.TP.push(value);
            }
        }
    });

    const tdAverage = notes.TD.length > 0 ? notes.TD.reduce((a, b) => a + b) / notes.TD.length : null;
    const tpAverage = notes.TP.length > 0 ? notes.TP.reduce((a, b) => a + b) / notes.TP.length : null;

    let moyenne = null;
    if (notes.Examen !== null) {
        if (tdAverage !== null && tpAverage !== null) {
            moyenne = tdAverage * 0.2 + tpAverage * 0.2 + notes.Examen * 0.6;
        } else if (tdAverage !== null) {
            moyenne = tdAverage * 0.4 + notes.Examen * 0.6;
        } else if (tpAverage !== null) {
            moyenne = tpAverage * 0.4 + notes.Examen * 0.6;
        } else {
            moyenne = notes.Examen;
        }
    } else if (tdAverage !== null && tpAverage !== null) {
        moyenne = tdAverage * 0.5 + tpAverage * 0.5;
    } else if (tdAverage !== null) {
        moyenne = tdAverage;
    } else if (tpAverage !== null) {
        moyenne = tpAverage;
    }

    return {
        moyenne: moyenne,
        nom: matiere.querySelector('.module-title').textContent,
        coefficient: parseFloat(matiere.dataset.coefficient)
    };
}

function calculerMoyenneGenerale() {
    const moduleCards = document.querySelectorAll('.module-card');
    const resultatsDiv = document.getElementById('resultats');
    const modulesResultsDiv = document.getElementById('modules-results');
    
    let totalCoefficients = 0; // Now we'll calculate total coefficients dynamically
    let sommeProduits = 0;
    let resultsHTML = '';

    // First pass: calculate total coefficients
    moduleCards.forEach((card) => {
        totalCoefficients += parseFloat(card.dataset.coefficient);
    });

    moduleCards.forEach((_, index) => {
        const result = calculerMoyenneMatiere(index);
        if (result && result.moyenne !== null) {
            // For module display, show the actual average
            const color = result.moyenne >= 10 ? 'text-green-600' : 'text-red-600';
            resultsHTML += `
                <div class="p-4 ${result.moyenne >= 10 ? 'bg-green-50' : 'bg-red-50'} rounded-lg">
                    <h3 class="font-semibold mb-2">${result.nom}</h3>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Coefficient: ${result.coefficient}</span>
                        <span class="font-bold ${color}">${result.moyenne.toFixed(2)}/20</span>
                    </div>
                </div>
            `;

            // For general average, multiply by coefficient
            sommeProduits += result.moyenne * result.coefficient;
        }
    });

    if (sommeProduits > 0) {
        // Calculate general average by dividing by total coefficients
        const moyenneGenerale = sommeProduits / totalCoefficients;
        resultatsDiv.style.display = 'block';
        modulesResultsDiv.innerHTML = resultsHTML;
        
        const moyenneGeneraleElement = resultatsDiv.querySelector('.moyenne-generale div');
        moyenneGeneraleElement.textContent = `${moyenneGenerale.toFixed(2)}/20`;
        moyenneGeneraleElement.className = `text-3xl font-bold ${moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-600'}`;
    }
}

function getCurrentMatiere(index) {
    const annee = document.getElementById('anneeSelect').value;
    const specialite = document.getElementById('specialiteSelect').value;
    const semestre = document.getElementById('semestreSelect').value;
    return isetComData[annee][specialite][semestre][index];
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