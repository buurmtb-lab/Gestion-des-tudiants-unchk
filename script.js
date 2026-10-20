const STORAGE_KEY = "etudiants";
const EDIT_INDEX_KEY = "etudiant-a-modifier";

const defaultStudents = [
    {
        nom: "Badiane",
        prenom: "Moustapha",
        email: "Moustapha@gmail.com",
        classe: "Master 1",
        note: "20"
    }
];

let etudiants;

try {
    etudiants =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultStudents;
} catch (error) {
    etudiants = [...defaultStudents];
}

let editIndex = -1;
let messageTimeout;

function sauvegarderEtudiants() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(etudiants));
}

function calculerResultat(note) {
    const n = Number(note);

    return n >= 10
        ? { texte: "Admis", classe: "resultat-admis" }
        : { texte: "Échoué", classe: "resultat-echoue" };
}

function afficherMessage(message, type = "error") {
    const formMessage = document.getElementById("form-message");

    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className =
        `message-formulaire ${type === "error" ? "erreur" : "succes"}`;

    clearTimeout(messageTimeout);

    messageTimeout = setTimeout(() => {
        formMessage.textContent = "";
        formMessage.className = "message-formulaire";
    }, 2500);
}

function validerEtudiant(data) {
    if (!data.nom) return "Le nom est obligatoire.";
    if (!data.prenom) return "Le prénom est obligatoire.";
    if (!data.email) return "L'email est obligatoire.";
    if (!data.classe) return "La classe est obligatoire.";

    if (data.note === "" || !Number.isFinite(Number(data.note))) {
        return "La note est obligatoire.";
    }

    if (Number(data.note) < 0 || Number(data.note) > 20) {
        return "La note doit être comprise entre 0 et 20.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return "Veuillez entrer une adresse email valide.";
    }

    return null;
}

function getInputValue(id) {
    return document.getElementById(id)?.value.trim() ?? "";
}

function getFormData() {
    return {
        nom: getInputValue("nom"),
        prenom: getInputValue("prenom"),
        email: getInputValue("email"),
        classe: getInputValue("classe"),
        note: getInputValue("note")
    };
}

function mettreAJourStatistiques() {
    const totalEtudiantsSpan = document.getElementById("total-etudiants");
    const moyenneGeneraleSpan = document.getElementById("moyenne-generale");
    const etudiantsAdmisSpan = document.getElementById("etudiants-admis");

    const total = etudiants.length;
    const admis = etudiants.filter(
        (etudiant) => Number(etudiant.note) >= 10
    ).length;

    const moyenne = total === 0
        ? "0,00"
        : (
            etudiants.reduce(
                (somme, etudiant) => somme + Number(etudiant.note),
                0
            ) / total
        ).toFixed(2).replace(".", ",");

    if (totalEtudiantsSpan) {
        totalEtudiantsSpan.textContent = total;
    }

    if (etudiantsAdmisSpan) {
        etudiantsAdmisSpan.textContent = admis;
    }

    if (moyenneGeneraleSpan) {
        moyenneGeneraleSpan.textContent = `${moyenne}/20`;
    }

    mettreAJourNouvellesStatistiques();
}

function reinitialiserFormulaire() {
    const form = document.getElementById("form-etudiant");
    const btnAnnulerModif = document.getElementById("btn-annuler-modif");

    form?.reset();
    btnAnnulerModif?.classList.add("cache");

    editIndex = -1;
}

function chargerEtudiantPourEdition(index) {
    const etudiant = etudiants[index];
    const form = document.getElementById("form-etudiant");

    if (!etudiant || !form) return;

    const champs = {
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email,
        classe: etudiant.classe,
        note: etudiant.note
    };

    Object.entries(champs).forEach(([id, valeur]) => {
        const element = document.getElementById(id);

        if (element) {
            element.value = valeur;
        }
    });

    editIndex = index;

    document
        .getElementById("btn-annuler-modif")
        ?.classList.remove("cache");

    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function renderTableOriginal(listEtudiants = etudiants) {
    const tbody = document.getElementById("tbody-etudiants");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (listEtudiants.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "Aucun étudiant trouvé";
        cell.style.textAlign = "center";
        cell.style.padding = "18px";

        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    listEtudiants.forEach((etudiant) => {
        const resultat = calculerResultat(etudiant.note);
        const index = etudiants.indexOf(etudiant);

        const row = document.createElement("tr");

        const cellules = [
            `${etudiant.nom} ${etudiant.prenom}`,
            etudiant.email,
            etudiant.classe,
            etudiant.note
        ];

        cellules.forEach((contenu) => {
            const cell = document.createElement("td");
            cell.textContent = contenu;
            row.appendChild(cell);
        });

        const resultatCell = document.createElement("td");
        const resultatSpan = document.createElement("span");

        resultatSpan.className =
            `etiquette-resultat ${resultat.classe}`;
        resultatSpan.textContent = resultat.texte;

        resultatCell.appendChild(resultatSpan);
        row.appendChild(resultatCell);

        const actionsCell = document.createElement("td");

        const boutonModifier = document.createElement("button");
        boutonModifier.type = "button";
        boutonModifier.className =
            "bouton-action bouton-modifier";
        boutonModifier.textContent = "Modifier";
        boutonModifier.dataset.index = index;

        const boutonSupprimer = document.createElement("button");
        boutonSupprimer.type = "button";
        boutonSupprimer.className =
            "bouton-action bouton-supprimer";
        boutonSupprimer.textContent = "Supprimer";
        boutonSupprimer.dataset.index = index;

        actionsCell.append(boutonModifier, boutonSupprimer);
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

function initialiserApplication() {
    const form = document.getElementById("form-etudiant");
    const tbody = document.getElementById("tbody-etudiants");
    const btnAnnulerModif =
        document.getElementById("btn-annuler-modif");

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const data = getFormData();
            const erreur = validerEtudiant(data);

            if (erreur) {
                afficherMessage(erreur);
                return;
            }

            if (editIndex === -1) {
                etudiants.push(data);
                afficherMessage(
                    "Étudiant ajouté avec succès.",
                    "success"
                );
            } else if (etudiants[editIndex]) {
                etudiants[editIndex] = data;
                afficherMessage(
                    "Étudiant modifié avec succès.",
                    "success"
                );
            }

            sauvegarderEtudiants();
            mettreAJourStatistiques();
            renderTable();
            reinitialiserFormulaire();
        });
    }

    if (btnAnnulerModif) {
        btnAnnulerModif.addEventListener("click", () => {
            reinitialiserFormulaire();
            afficherMessage("Modification annulée.", "success");
        });
    }

    if (tbody) {
        tbody.addEventListener("click", (event) => {
            const bouton = event.target.closest("button[data-index]");

            if (!bouton || !tbody.contains(bouton)) return;

            const index = Number(bouton.dataset.index);

            if (!Number.isInteger(index) || !etudiants[index]) return;

            if (bouton.classList.contains("bouton-modifier")) {
                if (form) {
                    chargerEtudiantPourEdition(index);
                } else {
                    sessionStorage.setItem(EDIT_INDEX_KEY, String(index));
                    window.location.href = "ajout.html";
                }
                return;
            }

            if (bouton.classList.contains("bouton-supprimer")) {
                const etudiant = etudiants[index];

                const confirmation = confirm(
                    `Supprimer ${etudiant.nom} ${etudiant.prenom} ?`
                );

                if (!confirmation) return;

                etudiants.splice(index, 1);

                if (editIndex === index) {
                    reinitialiserFormulaire();
                } else if (editIndex > index) {
                    editIndex--;
                }

                sauvegarderEtudiants();
                mettreAJourStatistiques();
                renderTable();

                afficherMessage(
                    "Étudiant supprimé avec succès.",
                    "success"
                );
            }
        });
    }

    const indexEnAttente = sessionStorage.getItem(EDIT_INDEX_KEY);

    if (form && indexEnAttente !== null) {
        sessionStorage.removeItem(EDIT_INDEX_KEY);
        const index = Number(indexEnAttente);

        if (Number.isInteger(index) && etudiants[index]) {
            chargerEtudiantPourEdition(index);
        }
    }

    mettreAJourStatistiques();
    renderTable();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserApplication
    );
} else {
    initialiserApplication();
}

function mettreAJourNouvellesStatistiques() {
    const meilleurElement =
        document.getElementById("meilleur-etudiant");

    const tauxElement =
        document.getElementById("taux-reussite");

    if (!meilleurElement || !tauxElement) return;

    if (etudiants.length === 0) {
        meilleurElement.textContent = "--";
        tauxElement.textContent = "0%";
        return;
    }

    const meilleur = etudiants.reduce((a, b) =>
        Number(a.note) > Number(b.note) ? a : b
    );

    meilleurElement.textContent =
        `${meilleur.prenom} ${meilleur.nom} (${meilleur.note}/20)`;

    const admis = etudiants.filter(
        etudiant => Number(etudiant.note) >= 10
    ).length;

    const taux = (admis / etudiants.length) * 100;

    tauxElement.textContent = `${taux.toFixed(1)}%`;
}

function exporterCSV() {
    const classe = document.getElementById("filtre-classe")?.value ?? "";
    const recherche = document
        .getElementById("search-input")?.value.toLowerCase() ?? "";

    const liste = etudiants.filter(etudiant => {
        const nomComplet =
            `${etudiant.nom} ${etudiant.prenom}`.toLowerCase();

        return (
            (classe === "" || etudiant.classe === classe) &&
            (
                nomComplet.includes(recherche) ||
                etudiant.email.toLowerCase().includes(recherche) ||
                etudiant.classe.toLowerCase().includes(recherche)
            )
        );
    });

    const lignes = [
        ["Nom", "Prénom", "Email", "Classe", "Note", "Résultat"],
        ...liste.map(etudiant => [
            etudiant.nom,
            etudiant.prenom,
            etudiant.email,
            etudiant.classe,
            etudiant.note,
            Number(etudiant.note) >= 10 ? "Admis" : "Ajourné"
        ])
    ];

    const contenu = "\uFEFF" + lignes.map(ligne =>
        ligne.map(valeur =>
            `"${String(valeur).replace(/"/g, '""')}"`
        ).join(";")
    ).join("\r\n");

    const fichier = new Blob([contenu], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(fichier);
    const lien = document.createElement("a");

    lien.href = url;
    lien.download = "liste_etudiants.csv";
    lien.click();

    URL.revokeObjectURL(url);
}

function exporterExcel() {
    exporterCSV();
}

document.getElementById("btn-export-csv")
    ?.addEventListener("click", exporterCSV);

document.getElementById("btn-export-excel")
    ?.addEventListener("click", exporterExcel);

mettreAJourStatistiques();


let pageEtudiants = 1;
const limiteParPage = 5;

function renderTable() {
    const terme = document.getElementById("search-input")?.value
        .trim().toLowerCase() ?? "";

    const classe = document.getElementById("filtre-classe")?.value ?? "";
    const statut = document.getElementById("filtre-statut")?.value ?? "";
    const tri = document.getElementById("tri-etudiants")?.value ?? "";

    let liste = etudiants.filter(e => {
        const correspondRecherche = [
            e.nom, e.prenom, e.email, e.classe
        ].some(v => String(v).toLowerCase().includes(terme));

        const correspondClasse = !classe || e.classe === classe;

        const note = Number(e.note);
        const correspondStatut =
            !statut ||
            (statut === "admis" && note >= 10) ||
            (statut === "echoue" && note < 10);

        return correspondRecherche &&
            correspondClasse && correspondStatut;
    });

    if (tri === "nom") {
        liste.sort((a, b) => a.nom.localeCompare(b.nom));
    } else if (tri === "nom-desc") {
        liste.sort((a, b) => b.nom.localeCompare(a.nom));
    } else if (tri === "note-asc") {
        liste.sort((a, b) => Number(a.note) - Number(b.note));
    } else if (tri === "note-desc") {
        liste.sort((a, b) => Number(b.note) - Number(a.note));
    }

    const totalPages = Math.ceil(liste.length / limiteParPage);
    pageEtudiants = Math.max(1, Math.min(pageEtudiants, totalPages || 1));

    const debut = (pageEtudiants - 1) * limiteParPage;
    const page = liste.slice(debut, debut + limiteParPage);

    renderTableOriginal(page);
    afficherPagesEtudiants(totalPages);
    dessinerGraphique(liste);
};

function afficherPagesEtudiants(totalPages) {
    const conteneur = document.getElementById("pagination");
    if (!conteneur) return;

    conteneur.replaceChildren();

    for (let i = 1; i <= totalPages; i++) {
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.textContent = i;

        if (i === pageEtudiants) bouton.classList.add("actif");

        bouton.addEventListener("click", () => {
            pageEtudiants = i;
            renderTable();
        });

        conteneur.appendChild(bouton);
    }
}

["search-input", "filtre-classe", "filtre-statut", "tri-etudiants"]
    .forEach(id => {
        const eventName = id === "search-input" ? "input" : "change";

        document.getElementById(id)?.addEventListener(eventName, () => {
            pageEtudiants = 1;
            renderTable();
        });
    });



document.querySelectorAll(".bouton-theme")
    .forEach(bouton => bouton.addEventListener("click", function () {
        document.body.classList.toggle("mode-sombre");

        const sombre = document.body.classList.contains("mode-sombre");

        document.querySelectorAll(".bouton-theme").forEach(themeBouton => {
            themeBouton.textContent = sombre
                ? "☀️ Mode clair"
                : "🌙 Mode sombre";
            themeBouton.setAttribute("aria-pressed", String(sombre));
        });
        localStorage.setItem("mode-sombre", sombre ? "oui" : "non");
        dessinerGraphique();
    }));

if (localStorage.getItem("mode-sombre") === "oui") {
    document.body.classList.add("mode-sombre");

    document.querySelectorAll(".bouton-theme").forEach(bouton => {
        bouton.textContent = "☀️ Mode clair";
        bouton.setAttribute("aria-pressed", "true");
    });
}


let indexSuppression = -1;

const tbodyEtudiants = document.getElementById("tbody-etudiants");
const modalSuppression = document.getElementById("modal-suppression");

tbodyEtudiants?.addEventListener("click", function (event) {
    const bouton = event.target.closest("button[data-index]");
    if (!bouton) return;

    if (bouton.classList.contains("bouton-supprimer")) {
        event.preventDefault();
        event.stopImmediatePropagation();

        indexSuppression = Number(bouton.dataset.index);

        const e = etudiants[indexSuppression];
        if (!e) return;

        document.getElementById("message-suppression").textContent =
            `Voulez-vous vraiment supprimer ${e.prenom} ${e.nom} ?`;

        modalSuppression?.showModal();
    }
}, true);

document.getElementById("annuler-suppression")
    ?.addEventListener("click", () => {
        modalSuppression?.close();
        indexSuppression = -1;
    });

document.getElementById("confirmer-suppression")
    ?.addEventListener("click", () => {
        if (indexSuppression < 0 || !etudiants[indexSuppression]) return;

        etudiants.splice(indexSuppression, 1);

        if (editIndex === indexSuppression) {
            reinitialiserFormulaire();
        } else if (editIndex > indexSuppression) {
            editIndex--;
        }

        sauvegarderEtudiants();
        mettreAJourStatistiques();

        pageEtudiants = 1;
        renderTable();

        modalSuppression?.close();
        indexSuppression = -1;

        afficherMessage("Étudiant supprimé avec succès.", "success");
    });




const modalEdition = document.getElementById("modal-edition");
let indexEditionModal = -1;

tbodyEtudiants?.addEventListener("click", function (event) {
    const bouton = event.target.closest("button.bouton-modifier");
    if (!bouton) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    indexEditionModal = Number(bouton.dataset.index);
    const e = etudiants[indexEditionModal];

    if (!e) return;

    document.getElementById("edition-nom").value = e.nom;
    document.getElementById("edition-prenom").value = e.prenom;
    document.getElementById("edition-email").value = e.email;
    document.getElementById("edition-classe").value = e.classe;
    document.getElementById("edition-note").value = e.note;

    modalEdition?.showModal();
}, true);

document.getElementById("annuler-edition")
    ?.addEventListener("click", () => {
        modalEdition?.close();
        indexEditionModal = -1;
    });

document.getElementById("form-edition")
    ?.addEventListener("submit", event => {
        event.preventDefault();

        if (indexEditionModal < 0 || !etudiants[indexEditionModal]) return;

        const data = {
            nom: document.getElementById("edition-nom").value.trim(),
            prenom: document.getElementById("edition-prenom").value.trim(),
            email: document.getElementById("edition-email").value.trim(),
            classe: document.getElementById("edition-classe").value.trim(),
            note: document.getElementById("edition-note").value
        };

        const erreur = validerEtudiant(data);

        if (erreur) {
            afficherMessage(erreur);
            return;
        }

        etudiants[indexEditionModal] = data;

        sauvegarderEtudiants();
        mettreAJourStatistiques();

        modalEdition?.close();
        indexEditionModal = -1;
        pageEtudiants = 1;
        renderTable();

        afficherMessage("Étudiant modifié avec succès.", "success");
    });



function dessinerGraphique(liste = etudiants) {
    const canvas = document.getElementById("graphique-etudiants");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sombre = document.body.classList.contains("mode-sombre");
    const largeur = canvas.clientWidth;
    const hauteur = canvas.clientHeight;
    if (!largeur || !hauteur) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(largeur * ratio);
    canvas.height = Math.round(hauteur * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, largeur, hauteur);

    const total = liste.length;
    const admis = liste.filter(e => Number(e.note) >= 10).length;
    const echoues = total - admis;
    const donnees = [
        { nom: "Admis", valeur: admis, couleur: "#16a36a" },
        { nom: "Échoués", valeur: echoues, couleur: "#ed6a72" }
    ];
    const margeGauche = largeur < 400 ? 72 : 92;
    const margeDroite = 46;
    const zoneGraphique = Math.max(0, largeur - margeGauche - margeDroite);
    const haut = 34;
    const bas = hauteur - 38;
    const couleurs = {
        texte: sombre ? "#d1d5db" : "#526176",
        grille: sombre ? "rgba(203, 213, 225, 0.16)" : "rgba(82, 97, 118, 0.14)",
        piste: sombre ? "#374151" : "#edf1f7"
    };

    ctx.font = "11px Segoe UI, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = couleurs.texte;
    for (let i = 0; i <= 4; i += 1) {
        const x = margeGauche + zoneGraphique * (i / 4);
        ctx.strokeStyle = couleurs.grille;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, haut);
        ctx.lineTo(x, bas);
        ctx.stroke();
        ctx.fillText(`${i * 25}%`, x, bas + 12);
    }

    const arrondir = (x, y, w, h, rayon) => {
        const r = Math.min(rayon, w / 2, h / 2);
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
    };

    donnees.forEach((donnee, index) => {
        const centreY = haut + (index + 0.5) * ((bas - haut) / donnees.length);
        const barreY = centreY - 10;
        const valeurX = margeGauche + zoneGraphique + 12;
        const proportion = total ? donnee.valeur / total : 0;

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "600 12px Segoe UI, Arial, sans-serif";
        ctx.fillStyle = couleurs.texte;
        ctx.fillText(donnee.nom, 0, centreY);

        ctx.fillStyle = couleurs.piste;
        arrondir(margeGauche, barreY, zoneGraphique, 20, 10);

        if (proportion > 0) {
            const gradient = ctx.createLinearGradient(
                margeGauche,
                0,
                margeGauche + zoneGraphique,
                0
            );
            gradient.addColorStop(0, donnee.couleur);
            gradient.addColorStop(1, index === 0 ? "#48c78e" : "#f49a8d");
            ctx.fillStyle = gradient;
            arrondir(
                margeGauche,
                barreY,
                Math.max(10, zoneGraphique * proportion),
                20,
                10
            );
        }

        ctx.textAlign = "left";
        ctx.font = "700 12px Segoe UI, Arial, sans-serif";
        ctx.fillStyle = sombre ? "#f9fafb" : "#26364d";
        ctx.fillText(String(donnee.valeur), valeurX, centreY);
    });

    canvas.setAttribute(
        "aria-label",
        `Répartition des résultats : ${admis} admis, ${echoues} échoués, sur ${total} étudiants.`
    );
}

const mettreAJourStatistiquesOriginal = mettreAJourStatistiques;

mettreAJourStatistiques = function () {
    mettreAJourStatistiquesOriginal();
    dessinerGraphique();
};

window.addEventListener("resize", () => dessinerGraphique());

mettreAJourStatistiques();
renderTable();