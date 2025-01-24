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

        console.log(`Module: ${module.matiere}, TD: ${noteTD}, TP: ${noteTP}, Examen: ${noteExamen}`); // Debugging line

        let note = 0;

        // Calculate based on module type
        if (module.evaluations.includes("TD") && module.evaluations.includes("Examen")) {
            note = (noteTD * 0.4 + noteExamen * 0.6);
        } else if (module.evaluations.includes("TP")) {
            note = noteTP; // TP only
        } else {
            note = noteExamen; // Exam only
        }

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

function updateSpecialities() {
    const annee = document.getElementById('anneeSelect').value;
    console.log("Selected Année:", annee); // Debugging line

    const specialiteSelect = document.getElementById('specialiteSelect');
    specialiteSelect.innerHTML = '<option value="">--Sélectionnez--</option>';

    if (annee && isetComData[annee]) {
        const specialities = Object.keys(isetComData[annee]);
        console.log("Available Specialities:", specialities); // Debugging line

        specialities.forEach(s => {
            specialiteSelect.innerHTML += `<option value="${s}">${s}</option>`;
        });
    } else {
        console.log("No specialities found for the selected année."); // Debugging line
    }

    // Clear semesters and modules when speciality changes
    updateSemesters();
}

function updateSemesters() {
    const annee = document.getElementById('anneeSelect').value;
    const specialite = document.getElementById('specialiteSelect').value;
    const semestreSelect = document.getElementById('semestreSelect');
    semestreSelect.innerHTML = '<option value="">--Sélectionnez--</option>';

    if (annee && specialite && isetComData[annee][specialite]) {
        const semestres = Object.keys(isetComData[annee][specialite]);
        console.log("Available Semestres:", semestres); // Debugging line

        semestres.forEach(s => {
            semestreSelect.innerHTML += `<option value="${s}">${s}</option>`;
        });
    } else {
        console.log("No semestres found for the selected spécialité."); // Debugging line
    }

    updateModules();
}

function updateModules() {
    const annee = document.getElementById('anneeSelect').value;
    const specialite = document.getElementById('specialiteSelect').value;
    const semestre = document.getElementById('semestreSelect').value;
    
    if (!annee || !specialite || !semestre) return;

    const modules = isetComData[annee][specialite][semestre];
    const modulesDiv = document.getElementById('modulesContainer');
    modulesDiv.innerHTML = '';

    modules.forEach(module => {
        const moduleId = `${annee}_${specialite}_${semestre}_${module.matiere.replace(/\s+/g, "")}_${module.module.replace(/\s+/g, "")}`;
        
        // Détermine les types d'évaluation basés sur le module
        const hasTD = module.evaluations.includes("TD");
        const hasTP = module.evaluations.includes("TP");
        const hasExam = module.evaluations.includes("Examen");

        let html = `
            <div class="mb-6 p-4 border rounded glass-card">
                <h3 class="font-bold mb-2">${module.matiere}</h3>
                <p class="text-sm text-gray-600 mb-3">Module: ${module.module} | Coefficient: ${module.coefficient}</p>
                <div class="grid grid-cols-1 md:grid-cols-${(hasTD ? 1 : 0) + (hasTP ? 1 : 0) + (hasExam ? 1 : 0)} gap-4">
        `;

        // Ajoute le champ TD si nécessaire
        if (hasTD) {
            html += `
                <div>
                    <label class="block text-sm font-medium mb-1">Note TD</label>
                    <input type="number" min="0" max="20" step="0.01" id="${moduleId}_TD" 
                           class="custom-input w-full" placeholder="Note /20">
                </div>
            `;
        }

        // Ajoute le champ TP si nécessaire
        if (hasTP) {
            html += `
                <div>
                    <label class="block text-sm font-medium mb-1">Note TP</label>
                    <input type="number" min="0" max="20" step="0.01" id="${moduleId}_TP" 
                           class="custom-input w-full" placeholder="Note /20">
                </div>
            `;
        }

        // Ajoute toujours le champ Examen
        if (hasExam) {
            html += `
                <div>
                    <label class="block text-sm font-medium mb-1">Note Examen</label>
                    <input type="number" min="0" max="20" step="0.01" id="${moduleId}_EX" 
                           class="custom-input w-full" placeholder="Note /20">
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        modulesDiv.innerHTML += html;
    });
}

function calculerMoyenne() {
    console.log("Calculer la moyenne clicked!"); // Debugging line
    const annee = document.getElementById('anneeSelect').value;
    const specialite = document.getElementById('specialiteSelect').value;
    const semestre = document.getElementById('semestreSelect').value;

    if (!annee || !specialite || !semestre) {
        alert('Veuillez sélectionner tous les champs');
        return;
    }

    const modules = isetComData[annee][specialite][semestre];
    const matiereModules = modules.map(module => {
        return `${annee}_${specialite}_${semestre}_${module.matiere.replace(/\s+/g, "")}_${module.module.replace(/\s+/g, "")}`;
    });

    const result = calculateMatiereAverage(modules, matiereModules);
    const resultat = document.getElementById('resultat');
    
    // Create detailed results HTML
    let detailedResults = '<div class="mt-4">';
    detailedResults += '<h3 class="font-bold mb-2">Notes par module:</h3>';
    result.moduleMarks.forEach(module => {
        const color = module.validated ? 'text-green-500' : 'text-red-500';
        detailedResults += `<div class="mb-1 ${color}">${module.name} (Coef: ${module.coefficient}): ${module.mark}/20</div>`;
    });
    detailedResults += `<div class="mt-4 font-bold">Moyenne Générale: ${result.moyenne.toFixed(2)}/20</div>`;
    detailedResults += '</div>';

    resultat.innerHTML = detailedResults;
}