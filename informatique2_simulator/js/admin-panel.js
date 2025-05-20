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

// Squelette de gestion des examens (à compléter avec Firebase)
const exams = [
    { id: 1, name: 'Examen 1', status: 'Ouvert' },
    { id: 2, name: 'Examen 2', status: 'Fermé' },
    { id: 3, name: 'Examen 3', status: 'Fermé' },
    { id: 4, name: 'Examen 4', status: 'Fermé' },
    { id: 5, name: 'Examen 5', status: 'Fermé' },
];

function renderExamTable() {
    const tbody = document.getElementById('adminExamTableBody');
    tbody.innerHTML = '';
    exams.forEach(exam => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${exam.name}</td>
            <td>${exam.status}</td>
            <td><button class="admin-btn" onclick="toggleExam(${exam.id})">${exam.status === 'Ouvert' ? 'Fermer' : 'Ouvrir'}</button></td>
            <td><button class="admin-btn" onclick="showStats(${exam.id})">Stats</button></td>
            <td><button class="admin-btn" onclick="editExam(${exam.id})">Éditer</button></td>
        `;
        tbody.appendChild(tr);
    });
}
renderExamTable();

function toggleExam(id) {
    alert('Changer le statut de l\'examen ' + id + ' (à implémenter)');
}
function showStats(id) {
    document.getElementById('adminStats').innerText = 'Stats de l\'examen ' + id + ' (à venir)';
}
function editExam(id) {
    document.getElementById('adminEdit').innerText = 'Édition de l\'examen ' + id + ' (à venir)';
} 