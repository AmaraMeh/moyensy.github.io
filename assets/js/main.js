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

function updateSpecialities() {
    const annee = document.getElementById('anneeSelect').value;
    console.log("Selected Année:", annee);

    const specialiteSelect = document.getElementById('specialiteSelect');
    specialiteSelect.innerHTML = '<option value="">--Sélectionnez--</option>';

    if (annee && isetComData[annee]) {
        const specialities = Object.keys(isetComData[annee]);
        console.log("Available Specialities:", specialities);

        specialities.forEach(s => {
            specialiteSelect.innerHTML += `<option value="${s}">${s}</option>`;
        });
    } else {
        console.log("No specialities found for the selected année.");
    }

    updateSemesters();
}

function updateSemesters() {
    const annee = document.getElementById('anneeSelect').value;
    const specialite = document.getElementById('specialiteSelect').value;
    console.log("Selected Specialité:", specialite);

    // Redirect to maintenance page if not ST LMD
    if (specialite && specialite !== "Science et Technologie LMD") {
        window.location.href = 'maintenance.html';
        return;
    }

    const semestreSelect = document.getElementById('semestreSelect');
    semestreSelect.innerHTML = '<option value="">--Sélectionnez--</option>';

    if (annee && specialite && isetComData[annee][specialite]) {
        const semestres = Object.keys(isetComData[annee][specialite]);
        console.log("Available Semestres:", semestres);

        semestres.forEach(s => {
            semestreSelect.innerHTML += `<option value="${s}">${s}</option>`;
        });
    }

    updateModules();
}

function updateModules() {
    const annee = document.getElementById('anneeSelect').value;
    const specialite = document.getElementById('specialiteSelect').value;
    const semestre = document.getElementById('semestreSelect').value;
    const modulesContainer = document.getElementById('modulesContainer');
    
    modulesContainer.innerHTML = '';
    
    if (!annee || !specialite || !semestre) return;
    
    const modules = isetComData[annee][specialite][semestre];
    if (!modules) return;
    
    // Group modules by their UE type
    const modulesByUE = {};
    modules.forEach(module => {
        const ueType = module.module.split(' ')[0]; // Get UEF, UEM, etc.
        if (!modulesByUE[ueType]) {
            modulesByUE[ueType] = [];
        }
        modulesByUE[ueType].push(module);
    });
    
    // Create HTML for each UE group
    Object.entries(modulesByUE).forEach(([ueType, ueModules]) => {
        const ueSection = document.createElement('div');
        ueSection.className = 'mb-6';
        ueSection.innerHTML = `<h3 class="text-xl font-semibold mb-4">${ueType}</h3>`;
        
        const moduleGrid = document.createElement('div');
        moduleGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
        
        ueModules.forEach(module => {
            const moduleId = `${annee}_${specialite}_${semestre}_${module.matiere.replace(/\s+/g, "_")}`;
            
            const moduleCard = document.createElement('div');
            moduleCard.className = 'bg-white p-4 rounded-lg shadow';
            moduleCard.innerHTML = `
                <h4 class="font-semibold mb-2">${module.matiere}</h4>
                <p class="text-sm text-gray-600 mb-2">Coefficient: ${module.coefficient}</p>
                <div class="space-y-2">
                    ${module.evaluations.includes("TD") ? 
                        `<div>
                            <label class="block text-sm">Note TD:</label>
                            <input type="number" min="0" max="20" step="0.01" id="${moduleId}_TD" class="custom-input w-full">
                        </div>` : ''}
                    ${module.evaluations.includes("TP") ? 
                        `<div>
                            <label class="block text-sm">Note TP:</label>
                            <input type="number" min="0" max="20" step="0.01" id="${moduleId}_TP" class="custom-input w-full">
                        </div>` : ''}
                    ${module.evaluations.includes("Examen") ? 
                        `<div>
                            <label class="block text-sm">Note Examen:</label>
                            <input type="number" min="0" max="20" step="0.01" id="${moduleId}_EX" class="custom-input w-full">
                        </div>` : ''}
                </div>
            `;
            
            moduleGrid.appendChild(moduleCard);
        });
        
        ueSection.appendChild(moduleGrid);
        modulesContainer.appendChild(ueSection);
    });
}

function calculerMoyenne() {
    const annee = document.getElementById('anneeSelect').value;
    const specialite = document.getElementById('specialiteSelect').value;
    const semestre = document.getElementById('semestreSelect').value;

    if (!annee || !specialite || !semestre) {
        alert('Veuillez sélectionner tous les champs');
        return;
    }

    const modules = isetComData[annee][specialite][semestre];
    const matiereModules = modules.map(module => {
        return `${annee}_${specialite}_${semestre}_${module.matiere.replace(/\s+/g, "_")}`;
    });

    // Initialize UE sums and coefficients
    let sumUEF = 0, coeffUEF = 0;
    let sumUEM = 0, coeffUEM = 0;
    let sumUED = 0, coeffUED = 0;
    let sumUET = 0, coeffUET = 0;

    // Store module grades
    const moduleGrades = [];

    // Calculate for each module
    modules.forEach((module, index) => {
        const moduleId = matiereModules[index];
        
        // Get input values
        const tdInput = document.getElementById(`${moduleId}_TD`);
        const tpInput = document.getElementById(`${moduleId}_TP`);
        const exInput = document.getElementById(`${moduleId}_EX`);

        const noteTD = tdInput ? parseFloat(tdInput.value) || 0 : 0;
        const noteTP = tpInput ? parseFloat(tpInput.value) || 0 : 0;
        const noteExamen = exInput ? parseFloat(exInput.value) || 0 : 0;

        let note = 0;

        // Calculate note based on evaluation type
        if (module.evaluations.includes("TD") && module.evaluations.includes("Examen")) {
            note = (noteTD * 2 + noteExamen * 3) / 5;
        } else if (module.evaluations.includes("TP")) {
            note = noteTP;
        } else if (module.evaluations.includes("Examen")) {
            note = noteExamen;
        }

        // Store module grade
        moduleGrades.push({
            name: module.matiere,
            noteTD: noteTD,
            noteTP: noteTP,
            noteExamen: noteExamen,
            note: note,
            coefficient: module.coefficient,
            ueType: module.module.split(' ')[0]
        });

        // Add to appropriate UE sum
        const ueType = module.module.split(' ')[0];
        switch(ueType) {
            case 'UEF':
                sumUEF += note * module.coefficient;
                coeffUEF += module.coefficient;
                break;
            case 'UEM':
                sumUEM += note * module.coefficient;
                coeffUEM += module.coefficient;
                break;
            case 'UED':
                sumUED += note * module.coefficient;
                coeffUED += module.coefficient;
                break;
            case 'UET':
                sumUET += note * module.coefficient;
                coeffUET += module.coefficient;
                break;
        }
    });

    // Calculate UE averages
    const moyUEF = coeffUEF > 0 ? sumUEF / coeffUEF : 0;
    const moyUEM = coeffUEM > 0 ? sumUEM / coeffUEM : 0;
    const moyUED = coeffUED > 0 ? sumUED / coeffUED : 0;
    const moyUET = coeffUET > 0 ? sumUET / coeffUET : 0;

    // Calculate general average
    const moyenneGenerale = (moyUEF * 9 + moyUEM * 5 + moyUED * 1 + moyUET * 2) / 17;

    // Group modules by UE type
    const modulesByUE = moduleGrades.reduce((acc, module) => {
        if (!acc[module.ueType]) {
            acc[module.ueType] = [];
        }
        acc[module.ueType].push(module);
        return acc;
    }, {});

    // Display results
    const resultatDiv = document.getElementById('resultat');
    let resultsHTML = `
        <div class="bg-white rounded-lg p-6 shadow-lg">
            <h2 class="text-2xl font-bold mb-4">Résultats</h2>
            <div class="grid grid-cols-1 gap-6">
    `;

    // Add module grades grouped by UE
    const ueNames = {
        'UEF': 'Unité d\'Enseignement Fondamental',
        'UEM': 'Unité d\'Enseignement Méthodologique',
        'UED': 'Unité d\'Enseignement Découverte',
        'UET': 'Unité d\'Enseignement Transversale'
    };

    Object.entries(modulesByUE).forEach(([ueType, modules]) => {
        resultsHTML += `
            <div class="mb-4">
                <h3 class="text-xl font-semibold mb-3">${ueType} - ${ueNames[ueType]}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        `;

        modules.forEach(module => {
            const isValidated = module.note >= 10;
            resultsHTML += `
                <div class="p-4 rounded-lg ${isValidated ? 'bg-green-50' : 'bg-red-50'} border ${isValidated ? 'border-green-200' : 'border-red-200'}">
                    <h4 class="font-medium mb-2">${module.name}</h4>
                    <div class="space-y-1 mb-3">
                        ${module.noteTD > 0 ? 
                            `<p class="text-sm text-gray-600">TD: ${module.noteTD.toFixed(2)}/20</p>` : ''}
                        ${module.noteTP > 0 ? 
                            `<p class="text-sm text-gray-600">TP: ${module.noteTP.toFixed(2)}/20</p>` : ''}
                        ${module.noteExamen > 0 ? 
                            `<p class="text-sm text-gray-600">Examen: ${module.noteExamen.toFixed(2)}/20</p>` : ''}
                    </div>
                    <p class="text-lg ${isValidated ? 'text-green-600' : 'text-red-600'} font-bold">
                        Moyenne: ${module.note.toFixed(2)}/20
                    </p>
                    <p class="text-sm text-gray-600 mt-1">Coefficient: ${module.coefficient}</p>
                </div>
            `;
        });

        resultsHTML += `
                </div>
            </div>
        `;
    });

    // Add final average
    resultsHTML += `
            <div class="mt-6 pt-6 border-t">
                <div class="text-center">
                    <h3 class="text-xl font-semibold mb-2">Moyenne Générale</h3>
                    <p class="text-3xl font-bold ${moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-600'}">
                        ${moyenneGenerale.toFixed(2)}/20
                    </p>
                    <p class="mt-2 text-lg ${moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-600'}">
                        ${moyenneGenerale >= 10 ? 'Admis' : 'Ajourné'}
                    </p>
                </div>
            </div>
        </div>
    </div>
    `;

    resultatDiv.innerHTML = resultsHTML;
}