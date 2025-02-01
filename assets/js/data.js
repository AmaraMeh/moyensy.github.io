const universiteBejaiaData = {
    "1ere Année Licence": {
       "Science et Technologie LMD": {
          "Semestre 1": [
              { matiere: "Mathématique 1", module: "UEF 1.1", coefficient: 3, credits: 6, evaluations: ["TD", "Examen"] },
              { matiere: "Physique 1", module: "UEF 1.1", coefficient: 3, credits: 6, evaluations: ["TD", "Examen"] },
              { matiere: "Chimie 1", module: "UEF 1.1", coefficient: 3, credits: 6, evaluations: ["TD", "Examen"] },
              { matiere: "Informatique 1", module: "UEM 1.1", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"] },
              { matiere: "TP Physique 1", module: "UEM 1.1", coefficient: 1, credits: 2, evaluations: ["TP"] },
              { matiere: "TP Chimie 1", module: "UEM 1.1", coefficient: 1, credits: 2, evaluations: ["TP"] },
              { matiere: "MR", module: "UEM 1.1", coefficient: 1, credits: 2, evaluations: ["Examen"] },
              { matiere: "MST", module: "UED 1.1", coefficient: 1, credits: 1, evaluations: ["Examen"] },
              { matiere: "Langue Anglaise", module: "UET 1.1", coefficient: 1, credits: 1, evaluations: ["Examen"] },
              { matiere: "DED", module: "UET 1.1", coefficient: 1, credits: 1, evaluations: ["Examen"] }
          ],
          "Semestre 2": [
              { matiere: "Mathématique 2", module: "UEF 1.2", coefficient: 3, credits: 6, evaluations: ["TD", "Examen"] },
              { matiere: "Physique 2", module: "UEF 1.2", coefficient: 3, credits: 6, evaluations: ["TD", "Examen"] },
              { matiere: "Thermodynamique", module: "UEF 1.2", coefficient: 3, credits: 6, evaluations: ["TD", "Examen"] },
              { matiere: "Informatique 2", module: "UEM 1.2", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"] },
              { matiere: "TP Physique 2", module: "UEM 1.2", coefficient: 1, credits: 2, evaluations: ["TP"] },
              { matiere: "TP Chimie 2", module: "UEM 1.2", coefficient: 1, credits: 2, evaluations: ["TP"] },
              { matiere: "Méthodologie de la présentation", module: "UED 1.2", coefficient: 1, credits: 1, evaluations: ["Examen"] },
              { matiere: "Les métiers en sciences et technologies 2", module: "UED 1.2", coefficient: 1, credits: 1, evaluations: ["Examen"] },
              { matiere: "Langue étrangère 2 (français et/ou anglais)", module: "UET 1.2", coefficient: 2, credits: 2, evaluations: ["Examen"] }
          ]

        },
       "Informatique LMD": {
          "Semestre 1": [
              { matiere: "Analyse 1", module: "UE Fondamentale 1", coefficient: 4, credits: 6, evaluations: ["TD", "Examen"] },
              { matiere: "Algèbre 1", module: "UE Fondamentale 1", coefficient: 3, credits: 5, evaluations: ["TD", "Examen"] },
              { matiere: "Algorithmes et Structure de Données 1", module: "UE Fondamentale 2", coefficient: 4, credits: 6, evaluations: ["TD", "TP", "Examen"] },
              { matiere: "Structure Machine 1", module: "UE Fondamentale 2", coefficient: 3, credits: 5, evaluations: ["TD", "Examen"] },
              { matiere: "Terminologie Scientifique et expression écrite", module: "UE Méthodologie", coefficient: 1, credits: 2, evaluations: ["Examen"] },
              { matiere: "Langue étrangère 1", module: "UE Méthodologie", coefficient: 1, credits: 2, evaluations: ["Examen"] },
              { matiere: "Physique 1 (mécanique du point)", module: "UE Découverte", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"] }
          ],
          "Semestre 2": []
      },

        "Mathématiques": {
            "Semestre 1": [
                { matiere: "UEF11 : Analyse 1", module: "UEF11", coefficient: 4, credits: 6, evaluations: ["TD", "Examen"] },
                { matiere: "UEF12 : Algèbre 1", module: "UEF12", coefficient: 3, credits: 5, evaluations: ["TD", "Examen"] },
                { matiere: "UEF121 : Algorithmique et structure de données 1", module: "UEF121", coefficient: 4, credits: 6, evaluations: ["TD", "TP", "Examen"] },
                { matiere: "UEF122 : Structure machine 1", module: "UEF122", coefficient: 3, credits: 5, evaluations: ["TD", "Examen"] },
                { matiere: "UEM111 : Terminologie Scientifique et expression écrite", module: "UEM111", coefficient: 1, credits: 2, evaluations: ["Examen"] },
                { matiere: "UEM112 : Langue étrangère 1", module: "UEM112", coefficient: 1, credits: 2, evaluations: ["Examen"] },
                { matiere: "UED111 : Physique 1 (mécanique du point)", module: "UED111", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"] }
            ],
            "Semestre 2": []
        },
        "Science de la matière": {
            "Semestre 1": [
                { matiere: "Mathématiques 1 / Analyse & Algèbre 1", module: "UEF11", coefficient: 3, credits: 6, evaluations: ["TD", "Examen"] },
                { matiere: "Physique 1 / Mécanique du point", module: "UEF11", coefficient: 3, credits: 6, evaluations: ["TD", "Examen"] },
                { matiere: "Chimie 1 / Structure de la matière", module: "UEF11", coefficient: 3, credits: 6, evaluations: ["TD", "Examen"] },
                { matiere: "TP Mécanique", module: "UEM11", coefficient: 1, credits: 2, evaluations: ["TP", "Examen"] },
                { matiere: "TP Chimie 1", module: "UEM11", coefficient: 1, credits: 2, evaluations: ["TP", "Examen"] },
                { matiere: "Informatique 1 / Bureau. & Techn. Web + Introduction à l'Algorithmique", module: "UEM11", coefficient: 2, credits: 4, evaluations: ["TP", "Examen"] },
                { matiere: "Découverte des Méthodes du Travail Universitaire", module: "UED11", coefficient: 1, credits: 2, evaluations: ["Examen"] },
                { matiere: "Langues étrangères 1", module: "UET11", coefficient: 1, credits: 2, evaluations: ["Examen"] }
            ]
        },
        "Science et Technologie Ingénieur": {
            "Semestre 1": [
                {
                    matiere: "Analyse 1",
                    code: "IST 1.1",
                    credits: 6,
                    coefficient: 3,
                    evaluations: ["TD", "Examen"],
                    volume: {
                        cours: "1h30",
                        td: "3h00"
                    }
                },
                {
                    matiere: "Algèbre 1",
                    code: "IST 1.2",
                    credits: 4,
                    coefficient: 2,
                    evaluations: ["TD", "Examen"],
                    volume: {
                        cours: "1h30",
                        td: "1h30"
                    }
                },
                {
                    matiere: "Éléments de Mécanique (Physique 1)",
                    code: "IST 1.3",
                    credits: 7,
                    coefficient: 4,
                    evaluations: ["TD", "TP", "Examen"],
                    volume: {
                        cours: "1h30",
                        td: "3h00",
                        tp: "1h30"
                    }
                },
                {
                    matiere: "Éléments de Chimie (structure de la matière)",
                    code: "IST 1.4",
                    credits: 7,
                    coefficient: 4,
                    evaluations: ["TD", "TP", "Examen"],
                    volume: {
                        cours: "1h30",
                        td: "3h00",
                        tp: "1h30"
                    }
                },
                {
                    matiere: "Probabilités et statistiques",
                    code: "IST 1.5",
                    credits: 2,
                    coefficient: 2,
                    evaluations: ["TD", "Examen"],
                    volume: {
                        cours: "1h30",
                        td: "1h30"
                    }
                },
                {
                    matiere: "Structure des ordinateurs et applications",
                    code: "IST 1.6",
                    credits: 2,
                    coefficient: 2,
                    evaluations: ["TP"],
                    volume: {
                        tp: "3h00"
                    }
                },
                {
                    matiere: "Dimension éthique et déontologique (Les fondements)",
                    code: "IST 1.7",
                    credits: 1,
                    coefficient: 1,
                    evaluations: ["Examen"],
                    volume: {
                        cours: "1h30"
                    }
                },
                {
                    matiere: "Langue étrangère 1 (Français ou Anglais)",
                    code: "IST 1.8",
                    credits: 1,
                    coefficient: 1,
                    evaluations: ["TD"],
                    volume: {
                        td: "1h30"
                    }
                }
            ],
            "Semestre 2": [
                // Add modules for Semester 2 if needed
            ]
  
        },
        "Informatique ING": {
            "Semestre 1": [
                { 
                    matiere: "Algorithmique et structure de données 1",
                    coefficient: 5,
                    credits: 6,
                    evaluations: ["TD", "TP", "Examen"]
                },
                { 
                    matiere: "Structure machine",
                    coefficient: 4,
                    credits: 6,
                    evaluations: ["TD", "Examen"]
                },
                { 
                    matiere: "Introduction aux systèmes d'exploitation 1",
                    coefficient: 3,
                    credits: 4,
                    evaluations: ["TP", "Examen"]
                },
                { 
                    matiere: "Analyse mathématique 1",
                    coefficient: 3,
                    credits: 6,
                    evaluations: ["TD", "Examen"]
                },
                { 
                    matiere: "Algèbre 1",
                    coefficient: 3,
                    credits: 3,
                    evaluations: ["TD", "Examen"]
                },
                { 
                    matiere: "Electronique fondamentale",
                    coefficient: 1,
                    credits: 3,
                    evaluations: ["Examen"]
                },
                { 
                    matiere: "Techniques d'expression écrit et bureautique",
                    coefficient: 1,
                    credits: 2,
                    evaluations: ["TD", "Examen"]
                }
            ]
        }
    }
};

// Export the data
window.universiteBejaiaData = universiteBejaiaData;