// revision_plan_detailed.js

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION & CONSTANTS ---
    const SIMULATED_START_DATE_STRING = "2025-05-15T09:00:00"; // Today is May 15, 2025, 9 AM
    let simulatedCurrentTime = new Date(SIMULATED_START_DATE_STRING);

    const DAILY_START_HOUR = 9; // 9 AM
    const DAILY_END_HOUR = 22;   // 10 PM
    const SLOT_DURATION_MINUTES = 30; // Each time slot is 30 minutes

    const EXAMS_DATA_RAW = [ // From original image, used for countdowns mainly
        { id: 'mp_exam', name: 'MP', dateString: '2025-05-20T14:30:00' },
        { id: 'info2_exam', name: 'Informatique 2', dateString: '2025-05-22T12:30:00' },
        { id: 'math2_exam', name: 'Mathématiques 2', dateString: '2025-05-25T10:30:00' },
        { id: 'mst2_exam', name: 'MST 2', dateString: '2025-05-27T14:30:00' },
        { id: 'chimie2_exam', name: 'Chimie 2', dateString: '2025-05-29T12:30:00' },
        { id: 'anglais2_exam', name: 'Anglais 2', dateString: '2025-05-31T14:30:00' },
        { id: 'physique2_exam', name: 'Physique 2', dateString: '2025-06-02T12:30:00' }
    ];

    const MODULE_DETAILS = {
        'mp': { name: 'MP', fullName: 'Méthodes de Programmation', priority: 3, estimatedHours: 6, examDate: '2025-05-20T14:30:00',
            subTasks: [
                { id: 'mp_chap1', name: 'Chapitre 1: Algorithmique', estHours: 2 },
                { id: 'mp_chap2', name: 'Chapitre 2: Structures de données', estHours: 2 },
                { id: 'mp_exos', name: 'Révision Exercices MP', estHours: 2 }
            ], notes: 'Module facile. Réviser chapitre 1 et chapitre 2.' },
        'info2': { name: 'Info 2', fullName: 'Informatique 2', priority: 2, estimatedHours: 20, examDate: '2025-05-22T12:30:00',
            subTasks: [
                { id: 'info2_cours_intro', name: 'Révision Cours: Intro & Bases', estHours: 2 },
                { id: 'info2_tp1', name: 'TP1: Algorithmes', estHours: 3 }, { id: 'info2_tp1_corr', name: 'Correction TP1', estHours: 1.5},
                { id: 'info2_tp2', name: 'TP2: POO', estHours: 3 }, { id: 'info2_tp2_corr', name: 'Correction TP2', estHours: 1.5},
                { id: 'info2_tp3', name: 'TP3: Interfaces', estHours: 3 }, { id: 'info2_tp3_corr', name: 'Correction TP3', estHours: 1.5},
                { id: 'info2_tp4', name: 'TP4: BD Intro', estHours: 3 }, { id: 'info2_tp4_corr', name: 'Correction TP4', estHours: 1.5},
            ], notes: 'Trop à comprendre, 4 TP, 3-4 chapitres.' },
        'math2': { name: 'Math 2', fullName: 'Mathématiques 2', priority: 1, estimatedHours: 18, examDate: '2025-05-25T10:30:00',
            subTasks: [
                { id: 'math2_td1_suites', name: 'TD1: Suites et Séries', estHours: 3 }, { id: 'math2_td1_exos', name: 'Exercices TD1', estHours: 2 },
                { id: 'math2_td2_fonctions', name: 'TD2: Fonctions', estHours: 3 }, { id: 'math2_td2_exos', name: 'Exercices TD2', estHours: 2 },
                { id: 'math2_td3_algebre', name: 'TD3: Algèbre Linéaire', estHours: 3 }, { id: 'math2_td3_exos', name: 'Exercices TD3', estHours: 2 },
                { id: 'math2_recap', name: 'Révision Générale Math 2', estHours: 3 }
            ], notes: 'Difficile mais facile. 3 TD, 3 chapitres. Très important.' },
        'mst2': { name: 'MST 2', fullName: 'Méthodologie Scientifique et Technique 2', priority: 3, estimatedHours: 4, examDate: '2025-05-27T14:30:00',
            subTasks: [
                { id: 'mst2_pdf1', name: 'Lecture PDF Cours (pp. 1-7)', estHours: 1.5 },
                { id: 'mst2_pdf2', name: 'Lecture PDF Cours (pp. 8-14)', estHours: 1.5 },
                { id: 'mst2_synthese', name: 'Synthèse MST 2', estHours: 1 }
            ], notes: 'Très facile, 8/14 pages PDF.' },
        'chimie2': { name: 'Chimie 2', fullName: 'Chimie 2', priority: 1, estimatedHours: 18, examDate: '2025-05-29T12:30:00',
            subTasks: [ // Reviser 5 chapitres max, 5 series TD
                { id: 'chimie2_chap1_thermo', name: 'Chapitre 1: Thermodynamique', estHours: 2}, { id: 'chimie2_td1_thermo', name: 'TD Thermodynamique', estHours: 1.5},
                { id: 'chimie2_chap2_cinetique', name: 'Chapitre 2: Cinétique Chimique', estHours: 2}, { id: 'chimie2_td2_cinetique', name: 'TD Cinétique', estHours: 1.5},
                { id: 'chimie2_chap3_solutions', name: 'Chapitre 3: Solutions Électrolytiques', estHours: 2}, { id: 'chimie2_td3_solutions', name: 'TD Solutions', estHours: 1.5},
                { id: 'chimie2_chap4_oxydo', name: 'Chapitre 4: Oxydoréduction', estHours: 2}, { id: 'chimie2_td4_oxydo', name: 'TD Oxydoréduction', estHours: 1.5},
                { id: 'chimie2_chap5_orga', name: 'Chapitre 5: Chimie Organique Intro', estHours: 2}, { id: 'chimie2_td5_orga', name: 'TD Organique', estHours: 1.5},
            ], notes: 'Difficile mais plus facile que physique/math. 6 chapitres (réviser 5), 5 TD.' },
        'anglais2': { name: 'Anglais 2', fullName: 'Anglais 2', priority: 3, estimatedHours: 3, examDate: '2025-05-31T14:30:00',
            subTasks: [
                { id: 'anglais2_lec1', name: 'Leçon 1: Vocabulaire Technique', estHours: 1 },
                { id: 'anglais2_lec2', name: 'Leçon 2: Compréhension Écrite', estHours: 1 },
                { id: 'anglais2_lec3', name: 'Leçon 3: Grammaire Spécifique', estHours: 1 }
            ], notes: 'Très facile, 3 leçons.' },
        'physique2': { name: 'Physique 2', fullName: 'Physique 2', priority: 1, estimatedHours: 22, examDate: '2025-06-02T12:30:00',
            subTasks: [ // Reviser 5 chapitres max, 5 series TD
                { id: 'physique2_chap1_meca', name: 'Chapitre 1: Mécanique du Point', estHours: 2.5}, { id: 'physique2_td1_meca', name: 'TD Mécanique Point', estHours: 2},
                { id: 'physique2_chap2_electro', name: 'Chapitre 2: Électrostatique', estHours: 2.5}, { id: 'physique2_td2_electro', name: 'TD Électrostatique', estHours: 2},
                { id: 'physique2_chap3_magneto', name: 'Chapitre 3: Magnétostatique', estHours: 2.5}, { id: 'physique2_td3_magneto', name: 'TD Magnétostatique', estHours: 2},
                { id: 'physique2_chap4_circuits', name: 'Chapitre 4: Circuits Électriques', estHours: 2.5}, { id: 'physique2_td4_circuits', name: 'TD Circuits', estHours: 2},
                { id: 'physique2_chap5_optique', name: 'Chapitre 5: Optique Géométrique', estHours: 2.5}, { id: 'physique2_td5_optique', name: 'TD Optique', estHours: 2},
            ], notes: 'Très difficile et important. 6 chapitres (réviser 5), 5 TD.' }
    };

    let fullRevisionPlan = []; // This will store the generated plan [{date: "YYYY-MM-DD", schedule: []}]
    let currentlyDisplayedDate = new Date(SIMULATED_START_DATE_STRING);
    let completedTasks = JSON.parse(localStorage.getItem('completedRevisionTasks')) || {};

    // --- DOM ELEMENTS ---
    const simulatedDateDisplay = document.getElementById('simulated-current-date-display');
    const displayedDayDateElem = document.getElementById('displayed-day-date');
    const prevDayBtn = document.getElementById('prev-day');
    const nextDayBtn = document.getElementById('next-day');
    const gotoTodayBtn = document.getElementById('goto-today');
    const scheduleContainer = document.getElementById('daily-schedule-container');
    const currentTimeIndicator = document.getElementById('current-time-indicator');
    const moduleProgressGrid = document.getElementById('module-cards-grid');
    const examCountdownGrid = document.getElementById('exam-cards-grid');
    const loadingScheduleDiv = document.getElementById('loading-schedule');

    // --- UTILITY FUNCTIONS ---
    function formatDate(date) { /* ... */ } // e.g., "Lundi 15 Mai 2025"
    function formatTime(date) { /* ... */ } // e.g., "09:00"
    function dateToISODateString(date) { /* ... */ } // e.g., "2025-05-15"

    // (Implementation for utility functions)
    function formatDate(date, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) {
        return date.toLocaleDateString('fr-FR', options);
    }
    function formatTime(date) {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    function dateToISODateString(date) {
        return date.toISOString().split('T')[0];
    }
    function timeToMinutes(timeStr) { // "HH:MM"
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    function minutesToTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
        const minutes = (totalMinutes % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }


    // --- PLAN GENERATION LOGIC ---
    /**
     * Generates the entire revision plan from start date to last exam.
     * This is a complex function and will be the heart of the logic.
     * It needs to:
     * 1. Create a list of all individual study tasks from MODULE_DETAILS.
     * 2. Iterate day by day from SIMULATED_START_DATE_STRING.
     * 3. For each day, fill time slots (9:00 - 22:00) respecting breaks.
     * 4. Prioritize tasks based on module priority, exam proximity, and remaining work.
     * 5. Ensure "day before exam" is focused on that exam's revision.
     */
    function generateFullRevisionPlan() {
        console.log("Starting plan generation...");
        loadingScheduleDiv.style.display = 'flex';
        fullRevisionPlan = []; // Reset plan

        const allTasks = [];
        Object.entries(MODULE_DETAILS).forEach(([moduleId, module]) => {
            module.subTasks.forEach(subTask => {
                let hoursToAllocate = subTask.estHours;
                while (hoursToAllocate > 0) {
                    // Break down into 1.5h or 1h slots typically
                    const sessionLengthHours = Math.min(hoursToAllocate, 1.5); 
                    allTasks.push({
                        id: `${subTask.id}_${Math.random().toString(36).substr(2, 5)}`, // Unique ID for task instance
                        moduleId: moduleId,
                        moduleName: module.name,
                        taskName: subTask.name,
                        durationMinutes: sessionLengthHours * 60,
                        priority: module.priority,
                        examDate: new Date(module.examDate),
                        isStudy: true
                    });
                    hoursToAllocate -= sessionLengthHours;
                }
            });
             // Add a final review task for each module, to be scheduled closer to the exam
            allTasks.push({
                id: `${moduleId}_final_review_${Math.random().toString(36).substr(2, 5)}`,
                moduleId: moduleId,
                moduleName: module.name,
                taskName: `Révision Finale ${module.name}`,
                durationMinutes: 120, // 2 hours for final review
                priority: module.priority, // High priority for final review
                examDate: new Date(module.examDate),
                isStudy: true,
                isFinalReview: true
            });
        });

        // Sort tasks: by exam date (earlier first), then by priority (P1 first)
        allTasks.sort((a, b) => {
            if (a.examDate.getTime() !== b.examDate.getTime()) {
                return a.examDate.getTime() - b.examDate.getTime();
            }
            if (a.priority !== b.priority) {
                return a.priority - b.priority; // Lower number = higher priority
            }
            return 0;
        });

        let currentDate = new Date(SIMULATED_START_DATE_STRING);
        currentDate.setHours(0,0,0,0); // Start of the day for planning
        const lastExamDate = new Date(Math.max(...Object.values(MODULE_DETAILS).map(m => new Date(m.examDate).getTime())));
        lastExamDate.setHours(23,59,59,999);


        while (currentDate.getTime() <= lastExamDate.getTime() && allTasks.length > 0) {
            const daySchedule = [];
            let currentTimeMinutes = DAILY_START_HOUR * 60; // 9:00 AM in minutes
            const endOfDayMinutes = DAILY_END_HOUR * 60;   // 10:00 PM in minutes

            const isoDateStr = dateToISODateString(currentDate);

            // Define standard breaks for the day
            const breaks = [
                { start: "10:30", end: "10:45", title: "Petite Pause Matin", type: "break" },
                { start: "12:30", end: "13:30", title: "Pause Déjeuner", type: "meal" },
                { start: "15:45", end: "16:00", title: "Petite Pause Après-Midi", type: "break" },
                { start: "17:45", end: "18:00", title: "Courte Pause", type: "break"},
                { start: "19:30", end: "20:30", title: "Pause Dîner", type: "meal" },
            ];
            
            let scheduledTasksForDay = []; // Store tasks to avoid rescheduling on same day

            while (currentTimeMinutes < endOfDayMinutes) {
                let slotFilled = false;

                // Check for scheduled exam on this day
                const examOnThisDay = EXAMS_DATA_RAW.find(ex => dateToISODateString(new Date(ex.dateString)) === isoDateStr);
                if (examOnThisDay) {
                    const examTime = new Date(examOnThisDay.dateString);
                    const examStartMinutes = examTime.getHours() * 60 + examTime.getMinutes();
                    const examEndMinutes = examStartMinutes + 90; // Assuming 1.5 hr exam

                    if (currentTimeMinutes < examEndMinutes && currentTimeMinutes + SLOT_DURATION_MINUTES > examStartMinutes) {
                         // If it's exam time, block out time before and fill the exam slot
                        if (!daySchedule.find(s => s.type === 'exam_prep' || s.type === 'exam')) {
                             // Light revision / prep before exam
                             if (examStartMinutes - 120 >= DAILY_START_HOUR * 60 && currentTimeMinutes < examStartMinutes - 120) {
                                 daySchedule.push({
                                     startTime: minutesToTime(Math.max(DAILY_START_HOUR * 60, examStartMinutes - 120)),
                                     endTime: minutesToTime(examStartMinutes - 15), // End 15min before exam
                                     type: 'exam_prep',
                                     title: `Préparation & Révision Légère: ${examOnThisDay.name}`,
                                     moduleId: examOnThisDay.id.replace('_exam',''),
                                     id: `${examOnThisDay.id}_prep`
                                 });
                             }
                            daySchedule.push({
                                startTime: minutesToTime(examStartMinutes),
                                endTime: minutesToTime(examEndMinutes),
                                type: 'exam',
                                title: `EXAMEN: ${examOnThisDay.name}`,
                                moduleId: examOnThisDay.id.replace('_exam',''),
                                id: examOnThisDay.id
                            });
                        }
                        currentTimeMinutes = Math.max(currentTimeMinutes, examEndMinutes);
                        slotFilled = true;
                        if (currentTimeMinutes >= endOfDayMinutes) break;
                    }
                }


                // Check for standard breaks
                for (const breakItem of breaks) {
                    const breakStartMinutes = timeToMinutes(breakItem.start);
                    const breakEndMinutes = timeToMinutes(breakItem.end);
                    if (currentTimeMinutes >= breakStartMinutes && currentTimeMinutes < breakEndMinutes) {
                        if (!daySchedule.find(s => s.startTime === breakItem.start && s.type === breakItem.type)) {
                            daySchedule.push({ ...breakItem, id: `${breakItem.type}_${breakItem.start}_${isoDateStr}` });
                        }
                        currentTimeMinutes = breakEndMinutes;
                        slotFilled = true;
                        break;
                    }
                }
                if (slotFilled) {
                    if (currentTimeMinutes >= endOfDayMinutes) break;
                    continue;
                }

                // Try to schedule a study task
                let taskScheduledThisIteration = false;
                for (let i = 0; i < allTasks.length; i++) {
                    const task = allTasks[i];
                    const daysUntilExam = (task.examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

                    // Prioritize final review for exams happening tomorrow or day after
                    if (task.isFinalReview && daysUntilExam <= 1 && daysUntilExam >= 0) {
                         // Dedicate good chunks for final review
                        if (currentTimeMinutes + task.durationMinutes <= endOfDayMinutes) {
                             if(!scheduledTasksForDay.includes(task.id)) {
                                daySchedule.push({
                                    startTime: minutesToTime(currentTimeMinutes),
                                    endTime: minutesToTime(currentTimeMinutes + task.durationMinutes),
                                    type: 'study',
                                    title: task.taskName,
                                    moduleId: task.moduleId,
                                    id: task.id,
                                    description: `Module: ${MODULE_DETAILS[task.moduleId].fullName}`
                                });
                                currentTimeMinutes += task.durationMinutes;
                                allTasks.splice(i, 1); // Remove task from pool
                                scheduledTasksForDay.push(task.id);
                                taskScheduledThisIteration = true;
                                break;
                            }
                        }
                    }
                    // General task scheduling
                    else if (!task.isFinalReview && daysUntilExam >= (task.priority === 1 ? 1 : 2) ) { // Don't schedule normal tasks too close if not final review unless P1
                        if (currentTimeMinutes + task.durationMinutes <= endOfDayMinutes) {
                            if(!scheduledTasksForDay.includes(task.id)) {
                                daySchedule.push({
                                    startTime: minutesToTime(currentTimeMinutes),
                                    endTime: minutesToTime(currentTimeMinutes + task.durationMinutes),
                                    type: 'study',
                                    title: task.taskName,
                                    moduleId: task.moduleId,
                                    id: task.id,
                                    description: `Module: ${MODULE_DETAILS[task.moduleId].fullName} (Priorité ${task.priority})`
                                });
                                currentTimeMinutes += task.durationMinutes;
                                allTasks.splice(i, 1);
                                scheduledTasksForDay.push(task.id);
                                taskScheduledThisIteration = true;
                                break;
                            }
                        }
                    }
                }


                if (taskScheduledThisIteration) {
                     // Add a short 15-min break after a study session if not followed by a meal or end of day
                    const nextPotentialBreakStart = currentTimeMinutes;
                    const nextPotentialBreakEnd = currentTimeMinutes + 15;
                    let followedByMeal = false;
                    for (const breakItem of breaks) {
                        if (breakItem.type === 'meal' && timeToMinutes(breakItem.start) === nextPotentialBreakStart) {
                            followedByMeal = true;
                            break;
                        }
                    }
                    if (nextPotentialBreakEnd <= endOfDayMinutes && !followedByMeal) {
                        if (!daySchedule.find(s => s.startTime === minutesToTime(nextPotentialBreakStart) && s.type === 'break')) {
                           daySchedule.push({ 
                               startTime: minutesToTime(nextPotentialBreakStart), 
                               endTime: minutesToTime(nextPotentialBreakEnd), 
                               title: "Petite Pause Étude", 
                               type: "break",
                               id: `break_study_${nextPotentialBreakStart}_${isoDateStr}`
                            });
                        }
                        currentTimeMinutes = nextPotentialBreakEnd;
                    }
                    slotFilled = true; // Mark slot as filled by study + potential break
                }


                // If no study task or break fit, advance by SLOT_DURATION_MINUTES and mark as free or fill gap
                if (!slotFilled) {
                    const nextBreak = breaks.find(b => timeToMinutes(b.start) >= currentTimeMinutes);
                    const endOfBlock = nextBreak ? Math.min(endOfDayMinutes, timeToMinutes(nextBreak.start)) : endOfDayMinutes;
                    const durationOfBlock = endOfBlock - currentTimeMinutes;

                    if (durationOfBlock >= SLOT_DURATION_MINUTES) {
                         if (!daySchedule.find(s => s.startTime === minutesToTime(currentTimeMinutes) && s.type === 'free')) {
                            daySchedule.push({
                                startTime: minutesToTime(currentTimeMinutes),
                                endTime: minutesToTime(currentTimeMinutes + SLOT_DURATION_MINUTES), // Fill with a 30-min free slot
                                type: 'free',
                                title: 'Temps Libre / Rattrapage',
                                id: `free_${currentTimeMinutes}_${isoDateStr}`
                            });
                        }
                        currentTimeMinutes += SLOT_DURATION_MINUTES;
                    } else {
                        // If block is too small, just advance time
                        currentTimeMinutes = endOfBlock;
                         if (currentTimeMinutes < endOfDayMinutes && durationOfBlock > 0 && !daySchedule.find(s => s.startTime === minutesToTime(currentTimeMinutes - durationOfBlock) && s.type === 'free')) {
                             daySchedule.push({
                                startTime: minutesToTime(currentTimeMinutes - durationOfBlock),
                                endTime: minutesToTime(currentTimeMinutes),
                                type: 'free',
                                title: 'Temps Libre Court',
                                id: `free_short_${currentTimeMinutes - durationOfBlock}_${isoDateStr}`
                            });
                         }
                    }
                }
            } // End of day's time slots

            // Sort schedule by start time and add to full plan
            daySchedule.sort((a,b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
            
            // Consolidate adjacent free time blocks
            const consolidatedSchedule = [];
            for(let i=0; i < daySchedule.length; i++) {
                if(i > 0 && daySchedule[i].type === 'free' && daySchedule[i-1].type === 'free' && daySchedule[i-1].endTime === daySchedule[i].startTime) {
                    consolidatedSchedule[consolidatedSchedule.length-1].endTime = daySchedule[i].endTime;
                } else {
                    consolidatedSchedule.push(daySchedule[i]);
                }
            }

            fullRevisionPlan.push({ date: isoDateStr, schedule: consolidatedSchedule });
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day
            if (currentDate.getDay() === 0 /* Sunday */ && allTasks.length > 5 /* still much to do */) {
                // Optional: make Sunday a bit lighter if it's not close to an exam
                // For now, keeping all days consistent for simplicity of generation
            }
        } // End of plan generation loop

        console.log("Plan generation finished. Total days planned:", fullRevisionPlan.length);
        loadingScheduleDiv.style.display = 'none';
        renderAll(); // Render initial view
        updateSimulatedTime(); // Start the clock
    }


    // --- UI RENDERING FUNCTIONS ---
    function renderDailySchedule(date) { /* ... */ }
    function renderModuleProgress() { /* ... */ }
    function renderExamCountdowns() { /* ... */ }
    function updateCurrentTimeIndicator() { /* ... */ }

    // (Implementation for UI Rendering)
    function renderDailySchedule(targetDate) {
        scheduleContainer.innerHTML = '<div id="schedule-timeline-line" class="absolute top-0 bottom-0 left-[calc(0.375rem)] w-0.5 bg-[var(--timeline-line-color)] -translate-x-1/2"></div>'; // Central timeline bar
        const isoDateStr = dateToISODateString(targetDate);
        const dayData = fullRevisionPlan.find(d => d.date === isoDateStr);

        displayedDayDateElem.textContent = formatDate(targetDate);

        if (!dayData || dayData.schedule.length === 0) {
            scheduleContainer.innerHTML += `<p class="text-center text-muted-foreground py-8">Aucun planning pour cette date ou fin de la période de révision.</p>`;
            updateCurrentTimeIndicator(targetDate, []); // Hide indicator if no schedule
            return;
        }
        
        dayData.schedule.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = `schedule-item p-3 mb-3 rounded-md shadow-sm bg-card hover:shadow-lg relative schedule-item-${item.type}`;
            itemDiv.dataset.taskId = item.id;
            if (completedTasks[item.id]) {
                itemDiv.classList.add('completed');
            }

            let checkboxHTML = '';
            if (item.type === 'study' || item.type === 'exam_prep') {
                checkboxHTML = `<input type="checkbox" id="task-cb-${item.id}" class="custom-checkbox mr-3 align-middle" data-task-id="${item.id}" ${completedTasks[item.id] ? 'checked' : ''}>`;
            }
            
            let iconClass = 'fa-tasks'; // Default
            if(item.type === 'study') iconClass = 'fa-book-open';
            if(item.type === 'exam_prep') iconClass = 'fa-pencil-alt';
            if(item.type === 'break') iconClass = 'fa-coffee';
            if(item.type === 'meal') iconClass = 'fa-utensils';
            if(item.type === 'free') iconClass = 'fa-couch';
            if(item.type === 'exam') iconClass = 'fa-flag-checkered';


            itemDiv.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <span class="schedule-time text-sm font-semibold text-primary">${item.startTime} - ${item.endTime}</span>
                    ${item.moduleId && MODULE_DETAILS[item.moduleId] ? `<span class="text-xs px-2 py-1 rounded-full priority-${MODULE_DETAILS[item.moduleId].priority}">${MODULE_DETAILS[item.moduleId].name}</span>` : ''}
                </div>
                <div class="flex items-center">
                    ${checkboxHTML}
                    <label for="task-cb-${item.id}" class="flex-grow cursor-pointer">
                        <h4 class="task-title text-lg font-medium text-card-foreground ${completedTasks[item.id] ? 'line-through' : ''}"><i class="fas ${iconClass} mr-2 text-sm opacity-70"></i>${item.title}</h4>
                        ${item.description ? `<p class="task-description text-xs mt-1">${item.description}</p>` : ''}
                    </label>
                </div>
            `;
            scheduleContainer.appendChild(itemDiv);

            if (checkboxHTML) {
                itemDiv.querySelector(`#task-cb-${item.id}`).addEventListener('change', handleTaskCompletion);
            }
        });
        updateCurrentTimeIndicator(targetDate, dayData.schedule);
        AOS.refreshHard(); // For items that might appear on scroll
    }
    
    function handleTaskCompletion(event) {
        const taskId = event.target.dataset.taskId;
        const cardItem = event.target.closest('.schedule-item');
        if (event.target.checked) {
            completedTasks[taskId] = true;
            cardItem.classList.add('completed');
            cardItem.querySelector('.task-title')?.classList.add('line-through');

        } else {
            delete completedTasks[taskId];
            cardItem.classList.remove('completed');
            cardItem.querySelector('.task-title')?.classList.remove('line-through');
        }
        localStorage.setItem('completedRevisionTasks', JSON.stringify(completedTasks));
        renderModuleProgress(); // Update progress bars
    }

    function renderModuleProgress() {
        moduleProgressGrid.innerHTML = '';
        Object.entries(MODULE_DETAILS).forEach(([moduleId, module]) => {
            let totalSubTaskHours = 0;
            let completedSubTaskHours = 0;
            module.subTasks.forEach(subTask => {
                totalSubTaskHours += subTask.estHours;
                // Find all generated task instances for this subTask
                const generatedInstances = fullRevisionPlan.flatMap(day => day.schedule)
                                               .filter(item => item.id && item.id.startsWith(subTask.id) && item.type === 'study');
                
                let subTaskFullyCompleted = generatedInstances.length > 0 && generatedInstances.every(instance => completedTasks[instance.id]);
                if (subTaskFullyCompleted) {
                    completedSubTaskHours += subTask.estHours;
                }
            });
            
            // Also count final review if completed
            const finalReviewTaskId = fullRevisionPlan.flatMap(day => day.schedule).find(item => item.moduleId === moduleId && item.isFinalReview)?.id;
            if (finalReviewTaskId && completedTasks[finalReviewTaskId]) {
                // Assuming final review contributes a certain amount, let's say 2 hours for progress calculation
                // This logic might need refinement based on how you want to weigh final reviews
                // completedSubTaskHours += 2; // Add a fixed value or proportion
                // totalSubTaskHours += 2; // if not already part of subtask estHours
            }


            const percentage = totalSubTaskHours > 0 ? (completedSubTaskHours / totalSubTaskHours) * 100 : 0;

            const card = document.createElement('div');
            card.className = 'module-progress-card';
            card.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-lg font-semibold text-primary">${module.fullName}</h4>
                    <span class="text-sm font-bold ${percentage === 100 ? 'text-green-500' : 'text-accent-foreground'}">${Math.round(percentage)}%</span>
                </div>
                <div class="progress-bar-container mb-1">
                    <div class="progress-bar" style="width: ${percentage}%;"></div>
                </div>
                <p class="text-xs text-muted-foreground">Priorité: <span class="font-medium priority-${module.priority} px-1 rounded">${module.priority}</span> | Objectif: ${module.estimatedHours}h</p>
                <p class="text-xs text-muted-foreground mt-1">Examen: ${formatDate(new Date(module.examDate), {day:'numeric', month:'short', year:undefined})} à ${formatTime(new Date(module.examDate))}</p>
            `;
            moduleProgressGrid.appendChild(card);
        });
    }

    function renderExamCountdowns() {
        examCountdownGrid.innerHTML = '';
        EXAMS_DATA_RAW.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'bg-card p-4 rounded-lg shadow-md'; // Simpler card for countdowns
            card.id = `exam-countdown-${exam.id}`;
            card.innerHTML = `
                <h4 class="text-md font-semibold text-primary mb-1">${exam.name}</h4>
                <p class="text-xs text-muted-foreground mb-2">Date: ${formatDate(new Date(exam.dateString))}</p>
                <div class="countdown-timer text-lg font-bold text-accent-foreground">--j --h --m --s</div>
            `;
            examCountdownGrid.appendChild(card);
            updateIndividualExamCountdown(exam); // Initial call
        });
         // Set interval to update all countdowns
        setInterval(() => {
            EXAMS_DATA_RAW.forEach(updateIndividualExamCountdown);
        }, 1000);
    }
    
    function updateIndividualExamCountdown(exam) {
        const countdownElement = document.querySelector(`#exam-countdown-${exam.id} .countdown-timer`);
        if (!countdownElement) return;

        const examDate = new Date(exam.dateString);
        const now = new Date(); // Use real time for countdowns
        const distance = examDate.getTime() - now.getTime();

        if (distance < 0) {
            countdownElement.innerHTML = `<span class="text-green-500">Examen Terminé!</span>`;
            return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        countdownElement.innerHTML = `
            <span>${days}j</span> <span>${hours}h</span> <span>${minutes}m</span> <span>${seconds}s</span>
        `;
    }
    
    function updateCurrentTimeIndicator(displayDate, scheduleForDay = []) {
        const isSimulatedToday = dateToISODateString(displayDate) === dateToISODateString(new Date(SIMULATED_START_DATE_STRING));
        
        if (!isSimulatedToday || scheduleForDay.length === 0) {
            currentTimeIndicator.style.display = 'none';
            return;
        }
        currentTimeIndicator.style.display = 'block';

        const currentMinutesInSimDay = simulatedCurrentTime.getHours() * 60 + simulatedCurrentTime.getMinutes();
        
        // Calculate total height of the schedule container vs. total duration of the day's activities
        // This requires knowing the height of each schedule item, which is dynamic.
        // A simpler approach: position based on time percentage within 9-22h.
        const dayStartMinutes = DAILY_START_HOUR * 60;
        const dayEndMinutes = DAILY_END_HOUR * 60;
        const totalDayDurationMinutes = dayEndMinutes - dayStartMinutes;

        if (currentMinutesInSimDay < dayStartMinutes || currentMinutesInSimDay > dayEndMinutes) {
             currentTimeIndicator.style.display = 'none'; // Outside working hours
             return;
        }
        
        const percentageThroughDay = (currentMinutesInSimDay - dayStartMinutes) / totalDayDurationMinutes;
        const containerHeight = scheduleContainer.offsetHeight;
        const topPosition = percentageThroughDay * containerHeight;

        currentTimeIndicator.style.top = `${Math.max(0, Math.min(containerHeight - 2, topPosition))}px`; // -2 for indicator height
        
        // Highlight current task (optional, can be complex)
        scheduleContainer.querySelectorAll('.schedule-item.current-activity').forEach(el => el.classList.remove('ring-2', 'ring-primary', 'current-activity', 'shadow-xl', 'scale-105', 'z-20'));

        for (const item of scheduleForDay) {
            const itemStartMinutes = timeToMinutes(item.startTime);
            const itemEndMinutes = timeToMinutes(item.endTime);
            if (currentMinutesInSimDay >= itemStartMinutes && currentMinutesInSimDay < itemEndMinutes) {
                const itemElem = scheduleContainer.querySelector(`.schedule-item[data-task-id="${item.id}"]`);
                if (itemElem) {
                    itemElem.classList.add('ring-2', 'ring-primary', 'current-activity', 'shadow-xl', 'scale-105', 'z-20'); // Highlight current
                    itemElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                break;
            }
        }
    }


    // --- EVENT LISTENERS & INITIALIZATION ---
    prevDayBtn.addEventListener('click', () => {
        currentlyDisplayedDate.setDate(currentlyDisplayedDate.getDate() - 1);
        renderDailySchedule(currentlyDisplayedDate);
        updateNavButtons();
    });
    nextDayBtn.addEventListener('click', () => {
        currentlyDisplayedDate.setDate(currentlyDisplayedDate.getDate() + 1);
        renderDailySchedule(currentlyDisplayedDate);
        updateNavButtons();
    });
    gotoTodayBtn.addEventListener('click', () => {
        currentlyDisplayedDate = new Date(SIMULATED_START_DATE_STRING);
        renderDailySchedule(currentlyDisplayedDate);
        updateNavButtons();
    });

    function updateNavButtons() {
        const firstDayInPlan = fullRevisionPlan.length > 0 ? new Date(fullRevisionPlan[0].date + "T00:00:00") : new Date(SIMULATED_START_DATE_STRING);
        const lastDayInPlan = fullRevisionPlan.length > 0 ? new Date(fullRevisionPlan[fullRevisionPlan.length - 1].date + "T00:00:00") : new Date(SIMULATED_START_DATE_STRING);

        prevDayBtn.disabled = dateToISODateString(currentlyDisplayedDate) <= dateToISODateString(firstDayInPlan);
        nextDayBtn.disabled = dateToISODateString(currentlyDisplayedDate) >= dateToISODateString(lastDayInPlan);
    }
    
    function updateSimulatedTime() {
        // Update simulated time every minute for display and indicator
        // For real-time effect, we can speed this up for demo purposes
        setInterval(() => {
            simulatedCurrentTime.setMinutes(simulatedCurrentTime.getMinutes() + 1); // Advance by 1 minute
            if (simulatedCurrentTime.getHours() >= DAILY_END_HOUR) {
                // Optional: Advance to next day 9 AM if end of day reached in simulation
                // For now, just stops advancing visually past 10PM on the current day indicator
            }
            simulatedDateDisplay.textContent = `${formatDate(simulatedCurrentTime, {day:'numeric', month:'long'})}, ${formatTime(simulatedCurrentTime)}`;
            
            const dayData = fullRevisionPlan.find(d => d.date === dateToISODateString(currentlyDisplayedDate));
            if (dayData) {
                 updateCurrentTimeIndicator(currentlyDisplayedDate, dayData.schedule);
            }

        }, 5000); // Update every 5 seconds for faster demo, use 60000 for real minute
    }
    
    function renderAll() {
        renderDailySchedule(currentlyDisplayedDate);
        renderModuleProgress();
        renderExamCountdowns(); // This also starts their live updates
        updateNavButtons();
    }
    
    // --- INITIALIZE ---
    // Generate plan asynchronously to avoid freezing UI on load for too long
    setTimeout(() => {
        generateFullRevisionPlan();
    }, 100); // Small delay to let the page render first

}); // End DOMContentLoaded