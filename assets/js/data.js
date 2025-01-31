const isetComData = {
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
      "Architecture": {
          "Semestre 1": [
              { matiere: "Atelier", module: "Atelier", coefficient: 4, credits: 8, evaluations: ["TD"], noteEliminatoire: 10 },
              { matiere: "HCA", module: "HCA", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"], noteEliminatoire: 7 },
              { matiere: "GDP", module: "GDP", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"], noteEliminatoire: 5 },
              { matiere: "TMC", module: "TMC", coefficient: 2, credits: 4, evaluations: ["TP", "Examen"], noteEliminatoire: 5 },
              { matiere: "THP", module: "THP", coefficient: 2, credits: 4, evaluations: ["Examen"], noteEliminatoire: 7 },
              { matiere: "Expression orale", module: "Expression orale", coefficient: 1, credits: 2, evaluations: ["TD"], noteEliminatoire: 5 },
              { matiere: "Stage et découverte", module: "Stage", coefficient: 1, credits: 2, evaluations: ["TD"], noteEliminatoire: 5 },
              { matiere: "Mathématiques", module: "Math", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"], noteEliminatoire: 5 }
          ],
          "Semestre 2": []
      },
      "Biologie": {
          "Semestre 1": [
              { matiere: "Chimie I", module: "Chimie I (TD + TP)", coefficient: 3, credits: 6, evaluations: ["TD", "TP", "Examen"] },
              { matiere: "Biologie cellulaire", module: "Biologie cellulaire (TD + TP)", coefficient: 4, credits: 8, evaluations: ["TD", "TP", "Examen"] },
              { matiere: "Mathématiques", module: "Mathématiques (TD)", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"] },
              { matiere: "Géologie", module: "Géologie (TD + TP)", coefficient: 3, credits: 5, evaluations: ["TD", "TP", "Examen"] },
              { matiere: "TCE I", module: "TCE I (TD)", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"] },
              { matiere: "MTT I", module: "MTT I (TD)", coefficient: 2, credits: 2, evaluations: ["TD", "Examen"] },
              { matiere: "HUSB", module: "HUSB", coefficient: 1, credits: 1, evaluations: ["Examen"] }
          ],
          "Semestre 2": [
              { matiere: "Chimie II", module: "Chimie II (TD + TP)", coefficient: 3, credits: 6, evaluations: ["TD", "TP", "Examen"] },
              { matiere: "Biologie végétale", module: "Biologie végétale (TP)", coefficient: 3, credits: 6, evaluations: ["TP", "Examen"] },
              { matiere: "Biologie animale", module: "Biologie animale (TP)", coefficient: 3, credits: 6, evaluations: ["TP", "Examen"] },
              { matiere: "Physique", module: "Physique (TD + TP)", coefficient: 3, credits: 5, evaluations: ["TD", "TP", "Examen"] },
              { matiere: "TCE II", module: "TCE II (TD)", coefficient: 2, credits: 4, evaluations: ["TD", "Examen"] },
              { matiere: "SV & ISE", module: "SV & ISE (TD)", coefficient: 2, credits: 2, evaluations: ["TD", "Examen"] },
              { matiere: "MTT II", module: "MTT II (TD)", coefficient: 1, credits: 1, evaluations: ["TD", "Examen"] }
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
      }
    }
}