# DigiBoard

Application web de gestion de patients psychiatriques pour les case managers luxembourgeois. Conçue pour le suivi des dossiers, la coordination des soins et la gestion des transitions entre boards cliniques.

![DigiBoard Login](screenshots/board-view.jpg)

<img width="2267" height="1083" alt="Screenshot 2026-04-24 at 23 37 38" src="https://github.com/user-attachments/assets/eedb0c2c-3712-4d8a-bc7c-6eafa42be271" />

---

## Table des matières

1. [Boards cliniques](#boards-cliniques)
2. [Gestion des patients](#gestion-des-patients)
3. [Fiche patient — détail](#fiche-patient--détail)
4. [Outils cliniques](#outils-cliniques)
5. [Évaluations psychométriques](#évaluations-psychométriques)
6. [Notes de réunion](#notes-de-réunion)
7. [Régions ACT](#régions-act)
8. [Statistiques](#statistiques)
9. [Paramètres & Administration](#paramètres--administration)
10. [Stack technique](#stack-technique)
11. [Installation](#installation)
12. [Architecture & API](#architecture--api)

---

## Boards cliniques

Les patients sont répartis en **5 boards cliniques** représentant chaque étape du parcours de soin.

| Board | Description |
|-------|-------------|
| **PréAdmission** | Nouveaux dossiers, informations initiales, premiers contacts |
| **FactBoard** | Suivi actif avec phases de traitement et passages hebdomadaires |
| **RecoveryBoard** | Objectifs de rétablissement, étapes en cours et plan d'action |
| **Irrecevable** | Dossiers non retenus, avec motif d'irrecevabilité |
| **Clôturé** | Dossiers fermés — historique complet conservé |

> Les patients **Clôturés** sont exclus de la vue "Tous" et n'apparaissent que dans leur propre onglet.

### Transitions entre boards
Chaque déplacement est enregistré automatiquement avec la date et les boards source/destination. L'historique complet des transitions est consultable directement depuis la fiche du patient.

---

## Gestion des patients

### Liste des patients
La liste latérale affiche pour chaque patient :
- **Ligne 1** : Nom & prénom + code ICD-10 (si renseigné)
- **Ligne 2** : Numéro client (`FACT-XXXX`) + badge de board
- **Ligne 3** : Psychiatre référent + badge d'agressivité (si > 0)

### Recherche
Recherche en temps réel par nom, prénom, psychiatre ou numéro client. Le filtre s'applique à l'intérieur du board sélectionné ou sur l'ensemble des patients (vue "Tous").

### Création d'un patient
- Numérotation automatique `FACT-XXXX` générée côté serveur
- Formulaire complet avec toutes les informations générales, médicales et administratives
- Recherche intégrée des codes ICD-10 par code ou libellé

### Déplacement entre boards
Un patient peut être déplacé vers n'importe quel autre board depuis sa fiche. La transition est horodatée et versée dans l'historique.

### Suppression et restauration
- **Suppression douce** : le patient est masqué de toutes les vues mais conservé en base de données
- **Restauration** : depuis la corbeille dans les Paramètres, le patient est réintégré dans son dernier board connu

---

## Fiche patient — détail

### Informations générales
| Champ | Description |
|-------|-------------|
| Photo | Upload et prévisualisation d'une photo de profil |
| Nom / Prénom | Identité civile |
| Date de naissance | Âge calculé automatiquement |
| Sexe | Homme / Femme |
| Adresse | Adresse complète du patient |
| Téléphone | Numéro de contact |

### Informations médicales
| Champ | Description |
|-------|-------------|
| Pathologie (ICD-10) | Diagnostic principal — recherche par code ou libellé CIM-10 |
| Psychiatre | Sélection parmi la liste configurée dans les Paramètres |
| Médecin de famille | Sélection parmi la liste configurée dans les Paramètres |
| Agressivité | Niveau de 0 à 3 avec badge visuel coloré (vert → rouge) |

### Informations administratives
| Champ | Description |
|-------|-------------|
| Case Manager principal | Intervenant principal |
| Case Manager secondaire | Intervenant de soutien |
| Article légal | Base juridique applicable |
| Curatelle / Tutelle | Type de mesure de protection |
| Date premier contact | Première prise en charge |
| Date d'entrée | Entrée officielle dans le dispositif |
| Date de sortie | Clôture du dossier |

### FactBoard — champs spécifiques
| Champ | Description |
|-------|-------------|
| Phase de traitement | 6 phases disponibles (Prévention de Crise → Nouveau Client) |
| Passages hebdomadaires | Cases à cocher par jour (Lun–Ven) + rendez-vous spéciaux |

### RecoveryBoard — champs spécifiques
| Champ | Description |
|-------|-------------|
| Objectif | Objectif de rétablissement en cours |
| Étape en cours | Étape actuelle du plan de rétablissement |
| Action planifiée | Prochaine action à entreprendre |

---

## Outils cliniques

### Passages hebdomadaires (FactBoard)
Grille de suivi des passages par semaine. Pour chaque semaine, cochez les jours de présence (Lundi à Vendredi) et/ou indiquez un rendez-vous spécifique. L'historique des passages est conservé.

### Phases de traitement (FactBoard)
Six phases cliniques ordonnées, sélectionnables depuis un menu déroulant :
1. Prévention de Crise
2. Traitement intensif court terme
3. Traitement intensif long terme
4a. Évitement de traitement
4b. Évitement à haut risque
5a. Admission Prison
5b. Admission Psychiatrie
6. Nouveau Client

La liste des patients dans le FactBoard est automatiquement triée par ordre de phase.

### Agressivité
Indicateur de risque à 4 niveaux (0–3) affiché sous forme de badge coloré dans la liste des patients et dans la fiche :
| Niveau | Signification | Couleur |
|--------|--------------|---------|
| 0 | Aucune agressivité | _(pas de badge)_ |
| 1 | Agressivité faible | Vert |
| 2 | Agressivité modérée | Orange |
| 3 | Agressivité élevée | Rouge |

---

## Évaluations psychométriques

### iRock
Évaluation du bien-être et de la progression vers le rétablissement. Composée de **10 questions** notées de 0 à 4. Les résultats sont enregistrés avec date et horodatage, et consultables sous forme de graphique longitudinal (global et par question).

### HoNOS (Health of the Nation Outcome Scales)
Échelle clinique standardisée d'évaluation des outcomes de santé mentale. Composée de **12 questions** notées de 0 à 4. Les résultats sont enregistrés avec date et horodatage, et consultables sous forme de graphique longitudinal (global et par question).

### Indicateurs KPI par patient
Depuis la fiche patient, un tableau de bord analytique affiche :
- **Temps passé par board** : durée cumulée dans chaque board (stabilité)
- **Alertes de régression** : détection des retours de RecoveryBoard vers FactBoard
- **Courbes d'évolution** : scores iRock et HoNOS dans le temps (graphiques)

---

## Notes de réunion

Les notes de réunion sont associées à chaque patient :
- **Ajout** : saisie d'une note avec date et contenu libre
- **Sauvegarde automatique** : enregistrement à la perte du focus (blur)
- **Modification** : édition inline de toute note existante
- **Suppression** : suppression individuelle avec confirmation
- **Historique** : toutes les notes sont conservées et affichées par ordre chronologique

---

## Régions ACT

Module dédié à la gestion des régions ACT (Assertive Community Treatment) :
- Affichage des patients par région ACT
- Notes de réunion propres à chaque région
- Suivi des interventions en milieu communautaire

---

## Statistiques

Tableau de bord analytique global accessible depuis le menu principal :

| Indicateur | Description |
|------------|-------------|
| Total patients | Nombre total de patients actifs dans le système |
| Répartition par board | Distribution des patients sur les 5 boards |
| Répartition par sexe | Proportion Homme / Femme |
| Répartition par agressivité | Nombre de patients par niveau (0–3) |
| Pathologies fréquentes | Codes ICD-10 les plus représentés |
| Durée moyenne par board | Temps moyen de séjour dans chaque board |

---

## Paramètres & Administration

### Listes configurables
Les listes utilisées dans les formulaires patients sont gérables depuis les Paramètres :
| Liste | Description |
|-------|-------------|
| Case Managers | Intervenants principaux et secondaires |
| Psychiatres | Médecins psychiatres référents |
| Médecins de famille | Généralistes |
| Articles légaux | Bases juridiques applicables |
| Curatelles / Tutelles | Types de mesures de protection |

### Codes ICD-10 personnalisés
- **Ajout** de codes CIM-10 personnalisés (code + libellé + description + risques)
- **Modification** de tout code existant
- **Suppression** d'un code
- **Favoris** : marquage pour accès rapide dans le formulaire patient

### Gestion des utilisateurs _(admin uniquement)_
- **Création** de comptes utilisateur avec rôle (Admin / Utilisateur)
- **Modification** : nom, mot de passe, rôle
- **Suppression** de comptes
- **Forçage de changement de mot de passe** au premier login

### Corbeille
Restauration des patients supprimés (suppression douce) vers leur dernier board connu.

### Sauvegarde & Restauration
- **Export JSON** : téléchargement de l'intégralité des données (patients, historiques, évaluations iRock/HoNOS, notes, codes ICD-10, paramètres)
- **Import JSON** : restauration complète du système depuis un fichier de sauvegarde

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Express 5 (TypeScript) |
| Base de données | PostgreSQL + Drizzle ORM |
| Frontend | React + Vite + Tailwind CSS 4 |
| Composants UI | Radix UI / shadcn/ui |
| État / données | TanStack Query |
| Auth | Tokens Bearer (bcrypt) |
| Spécification API | OpenAPI / Swagger |
| Déploiement | Docker + Docker Compose |

---

## Installation

### Développement (pnpm)

```bash
# Prérequis : Node.js 20+, pnpm, PostgreSQL

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifier DATABASE_URL et SESSION_SECRET dans .env

# Appliquer le schéma de base de données
pnpm --filter @workspace/db run push

# Lancer l'API et le frontend en parallèle
pnpm --filter @workspace/api-server run dev &
pnpm --filter @workspace/factboard run dev
```

L'application est accessible sur `http://localhost:18576`.

### Production (Docker)

Prérequis : [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/) installés sur la machine hôte.

```bash
# 1. Cloner le dépôt
git clone https://github.com/andyelsen85-bit/Fact-DigiBoard.git
cd Fact-DigiBoard

# 2. Créer le fichier de variables d'environnement
cp .env.example .env
```

Éditer `.env` et définir au minimum :

| Variable | Description | Défaut |
|----------|-------------|--------|
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `digiboard_secret` |
| `SESSION_SECRET` | Clé secrète Bearer/session — **changer obligatoirement** | _(valeur faible)_ |
| `APP_PORT` | Port exposé sur l'hôte | `80` |

Générer un `SESSION_SECRET` robuste :
```bash
openssl rand -hex 64
```

```bash
# 3. Construire l'image Docker
docker compose build --no-cache

# 4. Démarrer la stack en arrière-plan (app + PostgreSQL)
docker compose up -d

# 5. Vérifier que les containers tournent correctement
docker compose ps

# 6. Consulter les logs de démarrage
docker compose logs -f app
```

L'application est accessible sur `http://localhost` (ou le port défini par `APP_PORT`).

> Au premier démarrage, les migrations sont appliquées automatiquement et la base est initialisée avec le compte administrateur par défaut.

**Mise à jour :**
```bash
git pull
docker compose build
docker compose up -d
```

**Arrêt :**
```bash
docker compose down          # conserve les données PostgreSQL
docker compose down -v       # supprime aussi le volume (⚠️ perte de données)
```

L'image est construite en multi-stage : dépendances → build TypeScript/Vite → image finale légère.  
L'API et le frontend React sont servis par le même container Express sur le port 80.

---

## Architecture & API

```
workspace/
├── artifacts/
│   ├── api-server/          # API Express 5 (port 8080)
│   │   └── src/routes/      # patients, notes, auth, settings, users, stats, icd10, evaluations
│   └── factboard/           # Frontend React + Vite (port 18576)
│       └── src/
│           ├── components/  # PatientList, PatientDetail, PatientModal, AggBadge, BoardBadge…
│           └── pages/       # board.tsx, settings.tsx, statistics.tsx
├── lib/
│   ├── db/                  # Schéma Drizzle ORM + migrations
│   ├── api-client-react/    # Hooks React Query générés (Orval)
│   └── api-spec/            # Spécification OpenAPI
├── Dockerfile               # Build multi-stage
└── docker-compose.yml       # Stack complète avec PostgreSQL
```

### Endpoints API

#### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/auth/login` | Connexion (retourne un token Bearer) |
| `GET` | `/api/auth/me` | Profil de l'utilisateur connecté |
| `GET` | `/api/auth/setup-needed` | Vérifie si la configuration initiale est requise |
| `POST` | `/api/auth/change-password` | Changement de mot de passe |

#### Patients
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/patients` | Liste des patients actifs (exclut Clôturé et supprimés) |
| `GET` | `/api/patients?board=X` | Filtre par board |
| `GET` | `/api/patients?search=X` | Recherche textuelle |
| `GET` | `/api/patients/:id` | Fiche complète d'un patient |
| `POST` | `/api/patients` | Création (ID FACT- auto-généré) |
| `PATCH` | `/api/patients/:id` | Mise à jour des informations |
| `DELETE` | `/api/patients/:id` | Suppression douce |
| `GET` | `/api/patients/deleted` | Liste des patients supprimés |
| `POST` | `/api/patients/:id/restore` | Restauration d'un patient supprimé |
| `PATCH` | `/api/patients/:id/board` | Changement de board |
| `PATCH` | `/api/patients/:id/phase` | Mise à jour de la phase (FactBoard) |
| `PATCH` | `/api/patients/:id/passages` | Mise à jour des passages hebdomadaires |
| `GET` | `/api/patients/:id/history` | Historique des transitions de board |
| `GET` | `/api/patients-selector` | Liste allégée pour les sélecteurs |

#### Notes de réunion
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/patients/:id/notes` | Liste des notes d'un patient |
| `POST` | `/api/patients/:id/notes` | Ajout d'une note |
| `PATCH` | `/api/patients/:id/notes/:noteId` | Modification d'une note |
| `DELETE` | `/api/patients/:id/notes/:noteId` | Suppression d'une note |

#### Évaluations
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/patients/:id/irock` | Historique des évaluations iRock |
| `POST` | `/api/patients/:id/irock` | Enregistrement d'une évaluation iRock |
| `GET` | `/api/patients/:id/honos` | Historique des évaluations HoNOS |
| `POST` | `/api/patients/:id/honos` | Enregistrement d'une évaluation HoNOS |

#### Codes ICD-10
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/icd10` | Liste de tous les codes |
| `POST` | `/api/icd10` | Création d'un code personnalisé |
| `PATCH` | `/api/icd10/:code` | Modification d'un code |
| `DELETE` | `/api/icd10/:code` | Suppression d'un code |

#### Paramètres
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/settings` | Lecture de toutes les listes configurables |
| `PATCH` | `/api/settings` | Mise à jour d'une ou plusieurs listes |

#### Utilisateurs _(admin uniquement)_
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/users` | Liste des utilisateurs |
| `POST` | `/api/users` | Création d'un utilisateur |
| `PATCH` | `/api/users/:id` | Modification d'un utilisateur |
| `DELETE` | `/api/users/:id` | Suppression d'un utilisateur |

#### Statistiques
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/stats` | Statistiques globales (boards, sexe, pathologies, durées) |

#### Sauvegarde
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/backup` | Export JSON complet de la base de données |
| `POST` | `/api/backup/restore` | Restauration depuis un fichier JSON |

---

## Licence

Usage interne — Tous droits réservés.
