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
10. [Sauvegarde & Restauration](#sauvegarde--restauration)
11. [Sécurité & Authentification](#sécurité--authentification)
12. [Stack technique](#stack-technique)
13. [Installation](#installation)
14. [Architecture & API](#architecture--api)
15. [Développement](#développement)

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
Chaque déplacement est enregistré automatiquement avec la date, les boards source/destination et le nom de l'utilisateur ayant effectué le mouvement (`created_by_username`). L'historique complet des transitions est consultable directement depuis la fiche du patient.

Le passage vers **FactBoard** positionne automatiquement la `date d'admission`, et le passage vers **Clôturé** positionne automatiquement la `date de fin de suivi`. Ces dates restent éditables manuellement depuis la fiche.

---

## Gestion des patients

### Liste des patients
La liste latérale affiche pour chaque patient :
- **Ligne 1** : Nom & prénom + codes CIM-10 (si renseignés)
- **Ligne 2** : Numéro client (`FACT-XXXX`) + badge de board
- **Ligne 3** : Psychiatre référent + badge d'agressivité (si > 0)

### Recherche
Recherche en temps réel par nom, prénom, psychiatre ou numéro client. Le filtre s'applique à l'intérieur du board sélectionné ou sur l'ensemble des patients (vue "Tous").

### Création d'un patient
- Numérotation automatique `FACT-XXXX` générée côté serveur (zéros à gauche, basée sur l'`id` de la table)
- Formulaire complet avec toutes les informations générales, médicales et administratives
- Recherche et sélection de plusieurs codes CIM-10 par code ou libellé, avec affichage prioritaire des favoris (★)
- Aucune date n'est pré-remplie automatiquement (sauf `board_entry_date` côté serveur)

### Déplacement entre boards
Un patient peut être déplacé vers n'importe quel autre board depuis sa fiche. La transition est horodatée et versée dans l'historique.

### Suppression et restauration
- **Suppression douce** (`deleted_at`) : le patient est masqué de toutes les vues mais conservé en base de données
- **Restauration** : depuis la corbeille dans les Paramètres, le patient est réintégré dans son dernier board connu

---

## Fiche patient — détail

### Informations générales
| Champ | Description |
|-------|-------------|
| Photo | Upload base64 et prévisualisation d'une photo de profil (route dédiée `/patients/:id/photo`) |
| Nom / Prénom | Identité civile |
| Date de naissance | Âge calculé automatiquement |
| Sexe | Homme / Femme |
| Adresse | Adresse complète du patient |
| Téléphone | Numéro de contact |

### Informations médicales
| Champ | Description |
|-------|-------------|
| Pathologies (CIM-10) | Diagnostics multiples — sélecteur multi-codes CIM-10 par code ou libellé |
| Psychiatre | Sélection parmi la liste configurée dans les Paramètres |
| Médecin de famille | Sélection parmi la liste configurée dans les Paramètres |
| Agressivité | Niveau de 0 à 3 (ou « Pas connu » par défaut) avec badge visuel coloré |

Chaque code CIM-10 sélectionné est affiché dans la fiche avec son libellé, sa description (si disponible) et sa ligne de **risques cliniques** — toujours visible, en rouge lorsque des risques sont renseignés.

### Informations administratives
| Champ | Description |
|-------|-------------|
| Case Manager principal | Intervenant principal |
| Case Manager secondaire | Intervenant de soutien |
| Article légal | Base juridique applicable |
| Curatelle / Tutelle | Type de mesure de protection |
| Date premier contact | Première prise en charge (jamais auto-remplie) |
| Date d'admission | Auto-renseignée à l'entrée en FactBoard, éditable manuellement |
| Date de fin de suivi | Auto-renseignée à la clôture du dossier, éditable manuellement |
| Date de sortie | Clôture administrative du dossier |
| Dépôt à refaire | Date à laquelle un dépôt administratif doit être renouvelé |

### FactBoard — champs spécifiques
| Champ | Description |
|-------|-------------|
| Phase de traitement | 9 phases disponibles (Prévention de Crise → Nouveau Client) |
| Passages hebdomadaires | Cases à cocher par jour (Lun–Ven) + rendez-vous spéciaux |

### RecoveryBoard — champs spécifiques
| Champ | Description |
|-------|-------------|
| Objectif | Objectif de rétablissement en cours |
| Étape en cours | Étape actuelle du plan de rétablissement |
| Action planifiée | Prochaine action à entreprendre |

### PréAdmission — champ spécifique
| Champ | Description |
|-------|-------------|
| Infos récoltées | Informations préliminaires collectées avant admission |

### Irrecevable — champ spécifique
| Champ | Description |
|-------|-------------|
| Motif d'irrecevabilité | Raison du rejet du dossier |

> En board **Clôturé**, l'ensemble des sections spécifiques (phase, recovery, infos, motif) reste visible pour conserver une trace complète du parcours.

---

## Outils cliniques

### Passages hebdomadaires (FactBoard)
Grille de suivi des passages par semaine. Pour chaque semaine, cochez les jours de présence (Lundi à Vendredi) et/ou indiquez un rendez-vous spécifique. L'historique des passages est conservé dans une colonne `jsonb`.

### Phases de traitement (FactBoard)
Phases cliniques ordonnées, sélectionnables depuis un menu déroulant :
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

La valeur par défaut est `-1` (« Pas connu ») pour distinguer une donnée absente d'un score « 0 » saisi.

---

## Évaluations psychométriques

### I•ROC (Individual Recovery Outcomes Counter)
Évaluation du bien-être et de la progression vers le rétablissement. Composée de **12 questions** notées de **1 à 6** (1 = Très mauvais → 6 = Excellent), regroupées en 4 domaines HOPE :

| Domaine | Questions | Couleur |
|---------|-----------|---------|
| Domicile | Q1–Q3 | Bleu |
| Opportunité | Q4–Q6 | Vert |
| Personnes | Q7–Q9 | Orange |
| Autonomisation | Q10–Q12 | Violet |

### HoNOS (Health of the Nation Outcome Scales)
Échelle clinique standardisée d'évaluation des outcomes de santé mentale. Composée de **12 questions** notées de **0 à 4** (0 = Aucun problème → 4 = Problème grave), regroupées en 4 groupes cliniques :

| Groupe | Questions | Couleur |
|--------|-----------|---------|
| Comportement | Q1–Q3 | Rouge |
| Déficiences | Q4–Q6 | Ambre |
| Symptômes | Q7–Q9 | Rose |
| Social | Q10–Q12 | Cyan |

Les résultats sont enregistrés avec date, horodatage et auteur (`created_by_username`). Un champ de notes libres est disponible par évaluation, ainsi qu'un champ `question_notes` (jsonb) pour annoter individuellement chaque question.

### Indicateurs KPI par patient
Depuis la fiche patient, un tableau de bord analytique affiche :
- **Temps passé par board** : durée cumulée dans chaque board, calculée à partir de l'historique complet et ajustable manuellement via `board_days_offset`
- **Alertes de régression** : détection des retours de RecoveryBoard vers FactBoard
- **Diagrammes radar** : scores I•ROC et HoNOS sous forme de toile d'araignée — chaque axe est coloré selon son domaine clinique, avec superposition d'une évaluation de comparaison sélectionnable et un historique des scores totaux

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
- Création / édition / suppression de régions ACT (table `act_regions`)
- Notes de réunion propres à chaque région (table `act_notes`, FK avec `ON DELETE CASCADE`)
- Comptage des visites par lieu inclus dans les statistiques globales (`visitsByLieu`)

---

## Statistiques

Tableau de bord analytique global accessible depuis le menu principal. Un filtre de période (1 mois / 6 mois / 12 mois / tout) est disponible sur toutes les métriques (paramètre `?since=YYYY-MM-DD`).

| Indicateur | Description |
|------------|-------------|
| Total patients | Nombre total de patients dans la période sélectionnée |
| Patients actifs | Patients sur FactBoard, RecoveryBoard ou PréAdmission |
| Répartition par board | Distribution des patients sur les 5 boards |
| Répartition par sexe | Proportion Homme / Femme |
| Répartition par âge | Groupes décennaux (< 70 ans) et 70+ |
| Répartition par agressivité | Nombre de patients par niveau (0–3) |
| Pathologies fréquentes | Codes CIM-10 les plus représentés (multi-diagnostics pris en compte) |
| Durée moyenne par board | Temps moyen de séjour dans chaque board actif, calculé sur tous les mouvements historiques (patients clôturés inclus) |
| Évaluations I•ROC | Nombre d'évaluations I•ROC dans la période (patients supprimés exclus) |
| Évaluations HoNOS | Nombre d'évaluations HoNOS dans la période (patients supprimés exclus) |
| Visites par lieu (ACT) | Nombre de notes ACT par région, triées par fréquence |

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

Toutes les listes sont stockées dans la table `settings` (clé/valeur, `value` au format JSON).

### Codes CIM-10
La base contient **381 codes CIM-10** (chapitre F, troubles mentaux) pré-chargés avec pour chacun :
- **Code** et **libellé** officiel
- **Description** clinique (optionnelle)
- **Risques cliniques** : synthèse concise en français des risques associés au diagnostic — affichés dans la fiche patient et dans les paramètres
- **Favori** (★) : marquage pour accès rapide dans le formulaire de création/modification d'un patient

Depuis les Paramètres il est possible d'**ajouter**, **modifier** ou **supprimer** tout code, et de gérer les favoris. La séeding est réalisée par `seedIcd10Codes()` (`api-server/src/lib/seed.ts`) au premier démarrage.

### Gestion des utilisateurs _(admin uniquement)_
- **Création** de comptes utilisateur avec rôle (Admin / Utilisateur)
- **Modification** : nom, mot de passe, rôle, email
- **Suppression** de comptes
- **Réinitialisation de mot de passe** : route dédiée `POST /api/users/:id/reset-password`
- **Forçage de changement de mot de passe** : un utilisateur nouvellement créé ou réinitialisé doit définir son mot de passe dès le premier login (`must_change_password = true`), sans avoir à fournir l'ancien

### Corbeille
Restauration des patients supprimés (suppression douce) vers leur dernier board connu. Accessible uniquement aux administrateurs (`GET /api/patients/deleted` + `POST /api/patients/:id/restore`).

---

## Sauvegarde & Restauration

Module accessible aux administrateurs depuis les Paramètres.

### Export (`GET /api/backup/export`)
Téléchargement d'un fichier JSON unique contenant l'intégralité des données du système :

| Section | Contenu |
|---------|---------|
| `version` | Version du format de backup (actuellement `2`) |
| `exportedAt` | Horodatage ISO de l'export |
| `patients` | Tous les patients (y compris supprimés) avec toutes leurs colonnes |
| `meetingNotes` | Toutes les notes de réunion |
| `historyEntries` | Tout l'historique des transitions de boards |
| `irockEvaluations` | Toutes les évaluations I•ROC |
| `honosEvaluations` | Toutes les évaluations HoNOS |
| `actRegions` | Toutes les régions ACT |
| `actNotes` | Toutes les notes ACT |
| `users` | Tous les comptes utilisateur (avec hashes bcrypt et rôles) |
| `settings` | Toutes les listes configurables |
| `icd10Codes` | Tous les codes CIM-10 (avec favoris et risques) |

### Restauration (`POST /api/backup/restore`)
Importation d'un fichier JSON exporté. La restauration est **transactionnelle** et **destructive** :
1. Toutes les tables ciblées sont vidées (TRUNCATE CASCADE)
2. Les enregistrements sont réinsérés avec leur `id` original (les séquences `serial` sont resynchronisées)
3. Les sections inconnues ou manquantes sont ignorées sans erreur (rétro-compatible avec les exports v1)

Tous les champs « collection » sont validés via `Array.isArray()` avant insertion pour empêcher tout import malformé.

---

## Sécurité & Authentification

| Aspect | Détail |
|--------|--------|
| Hash de mot de passe | `bcrypt` (coût 12) |
| Session | Token Bearer aléatoire (48 octets hex) stocké dans la table `sessions` |
| Expiration | 30 jours par défaut, prolongée à chaque requête authentifiée |
| Stockage côté client | `localStorage["auth-token"]` |
| En-tête HTTP | `Authorization: Bearer <token>` |
| Configuration initiale | Premier démarrage : `GET /auth/setup-needed` → `POST /auth/setup` (création du premier admin) |
| Forçage changement mot de passe | Drapeau `must_change_password` sur la table `users` |
| Rôles | `admin` (full access) / `user` (lecture & édition patients, pas de gestion utilisateurs / paramètres / backup) |
| Routes protégées | Middleware `requireAuth` (toutes les routes sauf `/health` et `/auth/*`) et `requireAdmin` (paramètres, utilisateurs, backup, codes CIM-10, corbeille) |
| Variables sensibles | `SESSION_SECRET` (à régénérer en prod), `POSTGRES_PASSWORD` |

Un fichier de modèle de menaces est disponible dans `threat_model.md`.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Express 5 (TypeScript, ESM) |
| Base de données | PostgreSQL 16 + Drizzle ORM |
| Logs serveur | `pino` + `pino-http` |
| Frontend | React 18 + Vite + Tailwind CSS 4 |
| Composants UI | Radix UI / shadcn/ui |
| État serveur | TanStack Query |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Routage | Wouter |
| Graphiques | Recharts (RadarChart, LineChart) |
| Date | `date-fns` |
| Auth | Tokens Bearer (bcrypt) |
| Validation | Zod (schémas partagés via `@workspace/api-zod`) |
| Spécification API | OpenAPI 3 (`@workspace/api-spec`) |
| Codegen | Orval (OpenAPI → React Query hooks dans `@workspace/api-client-react`) |
| Bundler API | esbuild (avec `esbuild-plugin-pino`) |
| Bundler frontend | Vite (avec `@vitejs/plugin-react`) |
| Déploiement | Docker multi-stage + Docker Compose |

---

## Installation

### Développement (pnpm)

```bash
# Prérequis : Node.js 22+, pnpm, PostgreSQL 14+

# 1. Installer les dépendances
pnpm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Modifier DATABASE_URL et SESSION_SECRET dans .env

# 3. Lancer l'API et le frontend en parallèle
pnpm --filter @workspace/api-server run dev &
pnpm --filter @workspace/factboard run dev
```

> Au premier démarrage, les migrations sont appliquées automatiquement et la base de données est initialisée avec les 381 codes CIM-10.

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
| `DATABASE_URL` | URL complète Postgres (ignorée si Compose génère depuis `POSTGRES_PASSWORD`) | _(auto)_ |

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

> Au premier démarrage, les migrations sont appliquées automatiquement et la base est initialisée avec les 381 codes CIM-10 et leurs risques cliniques. Un compte administrateur est créé via l'écran de configuration initiale (`/setup`).

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

L'image est construite en multi-stage (Node 22 Alpine) : install deps → build TypeScript/Vite → image runtime légère. L'API et le frontend React sont servis par le même container Express sur le port 80. Les fichiers SQL de migration sont copiés dans `dist/drizzle` pour être disponibles en runtime.

#### Binaires natifs Alpine (musl)

Les binaires musl-spécifiques requis pour fonctionner sous Alpine sont épinglés explicitement dans `artifacts/factboard/package.json` → `optionalDependencies` :

- `@rollup/rollup-linux-x64-musl` — bundler Vite
- `@tailwindcss/oxide-linux-x64-musl` — moteur Rust de Tailwind 4
- `lightningcss-linux-x64-musl` — compilateur CSS

---

## Architecture & API

```
workspace/
├── artifacts/
│   ├── api-server/          # API Express 5 (port 8080 en dev, 80 en prod)
│   │   └── src/
│   │       ├── routes/      # 12 routeurs : act, auth, backup, evaluations, health,
│   │       │                #               history, icd10, notes, patients, settings,
│   │       │                #               stats, users
│   │       ├── lib/         # logger (pino), seed (icd10 + risks)
│   │       └── middlewares/ # requireAuth, requireAdmin
│   ├── factboard/           # Frontend React + Vite (port 18576 en dev)
│   │   └── src/
│   │       ├── components/  # PatientList, PatientDetail, PatientModal, PatientKpiView,
│   │       │                # PatientMedicationView, EvaluationModal, MoveBoardModal,
│   │       │                # AggBadge, BoardBadge, ActView, StatsView,
│   │       │                # ChangePasswordModal, ui/ (shadcn)
│   │       ├── pages/       # board, login, settings, setup, change-password, not-found
│   │       ├── hooks/       # use-auth, use-evaluations, use-form-options, use-icd10,
│   │       │                # use-local-storage, use-mobile, use-patient-photo,
│   │       │                # use-stats, use-toast
│   │       ├── lib/         # utils (cn, etc.)
│   │       └── data/        # cim10.ts (référence statique, non importée)
│   └── mockup-sandbox/      # Sandbox Vite pour prototyper des composants
├── lib/
│   ├── db/                  # Schéma Drizzle ORM + migrations (0000–0010)
│   ├── api-spec/            # Spécification OpenAPI 3
│   ├── api-zod/             # Schémas Zod générés depuis OpenAPI
│   └── api-client-react/    # Hooks React Query générés (Orval)
├── scripts/                 # Scripts utilitaires (pnpm workspace)
├── Dockerfile               # Build multi-stage (builder → runner)
├── docker-compose.yml       # Stack complète avec PostgreSQL
├── pnpm-workspace.yaml      # Discovery + catalog dependencies
└── tsconfig.base.json       # Config TS strict partagée
```

### Schéma de base de données

| Table | Description |
|-------|-------------|
| `users` | Comptes utilisateurs (id, username, email, password_hash, role, must_change_password) |
| `sessions` | Tokens Bearer actifs (user_id FK, token unique, expires_at) |
| `patients` | Dossiers patients complets — voir colonnes ci-dessous |
| `meeting_notes` | Notes de réunion par patient (patient_id FK, date, texte) |
| `history_entries` | Historique des transitions de board (patient_id FK, date, action, board_to, created_by_username) |
| `irock_evaluations` | Évaluations I•ROC q1–q12 (score 1–6), notes, question_notes, created_by_username |
| `honos_evaluations` | Évaluations HoNOS q1–q12 (score 0–4), notes, question_notes, created_by_username |
| `act_regions` | Régions ACT (id, nom) |
| `act_notes` | Notes par région ACT (region_id FK, date, texte) |
| `settings` | Listes configurables clé/valeur |
| `icd10_codes` | 381 codes CIM-10 (code PK, title, description, risks, is_favorite) |

Toutes les FK utilisent `ON DELETE CASCADE` sauf `patients` (suppression douce via `deleted_at`).

#### Colonnes de `patients`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | serial PK | Identifiant interne |
| `client_num` | text | Identifiant `FACT-XXXX` auto-généré |
| `nom` / `prenom` | text | Identité civile (NOT NULL) |
| `dob` | text | Date de naissance |
| `adresse`, `tel`, `sexe` | text | Coordonnées |
| `medecin_famille`, `psy` | text | Référents médicaux |
| `patho` | text | Diagnostic principal (compatibilité historique) |
| `pathos` | jsonb | Liste de codes CIM-10 multiples (source de vérité) |
| `responsable`, `casemanager2` | text | Case managers principal & secondaire |
| `demande` | text | Motif initial de la demande |
| `date_premier_contact` | text | Date du premier contact (jamais auto-remplie) |
| `date_entree` | text | Date d'entrée dans le système |
| `date_admission` | text | Date d'admission FactBoard (auto à la transition) |
| `date_sortie` | text | Date de sortie administrative |
| `date_fin_suivi` | text | Date de fin de suivi (auto à la clôture) |
| `agressivite` | int | -1 (Pas connu) à 3 |
| `article`, `curatelle` | text | Cadre légal |
| `remarques` | text | Notes libres |
| `board` | text | Board actuel (default `PréAdmission`) |
| `phase` | text | Phase de traitement (FactBoard) |
| `board_entry_date` | text | Date d'entrée dans le board actuel |
| `board_days_offset` | jsonb | Ajustement manuel des durées par board (en jours) |
| `passages` | jsonb | Grille `{ "YYYY-MM-DD": "M\|A\|RDV" }` des passages |
| `recovery_objectifs`, `recovery_etape`, `recovery_action` | text | Champs RecoveryBoard |
| `infos_recoltees` | text | Champ PréAdmission |
| `motif_irrecevable` | text | Champ Irrecevable |
| `depot_a_refaire` | text | Date de prochain dépôt administratif |
| `photo` | text | Photo base64 |
| `created_at` / `updated_at` | timestamptz | Audit |
| `deleted_at` | timestamptz | Suppression douce — null = actif |

### Migrations

Les migrations SQL sont stockées dans `lib/db/drizzle/` et appliquées automatiquement au démarrage du serveur (`runMigrations()` dans `api-server/src/index.ts`).

| Migration | Description |
|-----------|-------------|
| `0000` | Schéma initial : users, patients, meeting_notes, history_entries, act_regions, act_notes, settings, icd10_codes, sessions |
| `0001` | Tables irock_evaluations et honos_evaluations (q1–q10) |
| `0002` | Colonne `created_by_username` sur irock/honos/history |
| `0003` | Questions q11–q12 sur irock_evaluations |
| `0004` | Colonne `board_days_offset` (jsonb) sur patients |
| `0005` | Colonnes `notes` et `question_notes` sur irock/honos |
| `0006` | Colonne `pathos` (jsonb) sur patients + migration des données depuis `patho` |
| `0007` | Colonnes `date_admission` et `date_fin_suivi` sur patients |
| `0008` | Valeur par défaut `Pas connu` (-1) pour la colonne `agressivite` |
| `0009` | Risques cliniques renseignés sur les 381 codes CIM-10 (chapitre F00–F99) |
| `0010` | Colonne `depot_a_refaire` (text) sur patients |

### Endpoints API

Toutes les routes sont préfixées par `/api`. Sauf mention contraire, elles requièrent un en-tête `Authorization: Bearer <token>`.

#### Santé
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/healthz` | Healthcheck (utilisé par Docker) |

#### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/auth/setup-needed` | Vérifie si la configuration initiale est requise (aucun admin en DB) |
| `POST` | `/api/auth/setup` | Création du premier compte administrateur (uniquement si setup requis) |
| `POST` | `/api/auth/login` | Connexion (retourne un token Bearer + profil) |
| `POST` | `/api/auth/logout` | Révocation du token courant |
| `GET` | `/api/auth/me` | Profil de l'utilisateur connecté |
| `POST` | `/api/auth/change-password` | Changement de mot de passe (l'ancien n'est pas requis si `mustChangePassword=true`) |

#### Patients
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/patients` | Liste des patients actifs (exclut Clôturé et supprimés) |
| `GET` | `/api/patients?board=X` | Filtre par board |
| `GET` | `/api/patients?search=X` | Recherche textuelle |
| `GET` | `/api/patients/:id` | Fiche complète d'un patient |
| `POST` | `/api/patients` | Création (ID FACT- auto-généré, `board_entry_date` par défaut = aujourd'hui) |
| `PUT` / `PATCH` | `/api/patients/:id` | Mise à jour des informations |
| `DELETE` | `/api/patients/:id` | Suppression douce |
| `GET` | `/api/patients/deleted` | _(admin)_ Liste des patients supprimés |
| `POST` | `/api/patients/:id/restore` | _(admin)_ Restauration d'un patient supprimé |
| `PATCH` | `/api/patients/:id/board` | Changement de board (positionne `date_admission` / `date_fin_suivi`, ajoute une entrée d'historique) |
| `PATCH` | `/api/patients/:id/move-board` | Alias de la route précédente |
| `PUT` / `PATCH` | `/api/patients/:id/phase` | Mise à jour de la phase (FactBoard) |
| `PUT` / `PATCH` | `/api/patients/:id/passages` | Mise à jour des passages hebdomadaires |
| `PUT` / `PATCH` | `/api/patients/:id/recovery` | Mise à jour des champs RecoveryBoard |
| `PUT` / `PATCH` | `/api/patients/:id/infos-recoltees` | Mise à jour des infos de pré-admission |
| `PUT` / `PATCH` | `/api/patients/:id/motif-irrecevable` | Mise à jour du motif d'irrecevabilité |
| `PATCH` | `/api/patients/:id/photo` | Upload / mise à jour de la photo (base64) |
| `GET` | `/api/patients-selector` | Liste allégée pour les sélecteurs (id, prenom, nom, board) |

#### Historique
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/patients/:id/history` | Historique des transitions de board d'un patient |
| `PUT` / `PATCH` | `/api/patients/:id/history/:historyId` | Modification d'une entrée d'historique |
| `DELETE` | `/api/patients/:id/history/:historyId` | Suppression d'une entrée d'historique |

#### Notes de réunion
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/patients/:id/notes` | Liste des notes d'un patient |
| `POST` | `/api/patients/:id/notes` | Ajout d'une note |
| `PUT` / `PATCH` | `/api/patients/:patientId/notes/:noteId` | Modification d'une note |
| `DELETE` | `/api/patients/:patientId/notes/:noteId` | Suppression d'une note |

#### Évaluations
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/patients/:id/irock` | Historique des évaluations I•ROC |
| `POST` | `/api/patients/:id/irock` | Enregistrement d'une évaluation I•ROC |
| `PUT` | `/api/patients/:patientId/irock/:evalId` | Mise à jour d'une évaluation I•ROC |
| `DELETE` | `/api/patients/:patientId/irock/:evalId` | Suppression d'une évaluation I•ROC |
| `GET` | `/api/patients/:id/honos` | Historique des évaluations HoNOS |
| `POST` | `/api/patients/:id/honos` | Enregistrement d'une évaluation HoNOS |
| `PUT` | `/api/patients/:patientId/honos/:evalId` | Mise à jour d'une évaluation HoNOS |
| `DELETE` | `/api/patients/:patientId/honos/:evalId` | Suppression d'une évaluation HoNOS |
| `GET` | `/api/patients/:id/kpi` | KPI de stabilité parcours (durées par board, régressions) |

#### Codes CIM-10 _(admin uniquement)_
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/icd10` | Liste de tous les codes (code, title, description, risks, isFavorite) |
| `POST` | `/api/icd10` | Création d'un code personnalisé |
| `PATCH` | `/api/icd10/:code` | Modification d'un code |
| `DELETE` | `/api/icd10/:code` | Suppression d'un code |

#### Régions ACT
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/act/regions` | Liste des régions ACT |
| `POST` | `/api/act/regions` | Création d'une région |
| `PUT` | `/api/act/regions/:id` | Modification d'une région |
| `DELETE` | `/api/act/regions/:id` | Suppression d'une région (cascade sur les notes) |
| `GET` | `/api/act/regions/:id/notes` | Notes d'une région |
| `POST` | `/api/act/regions/:id/notes` | Ajout d'une note à une région |
| `PUT` | `/api/act/regions/:regionId/notes/:noteId` | Modification d'une note ACT |
| `DELETE` | `/api/act/regions/:regionId/notes/:noteId` | Suppression d'une note ACT |

#### Paramètres
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/settings` | _(admin)_ Lecture brute de toutes les listes configurables |
| `GET` | `/api/form-options` | Lecture des listes formatées pour les formulaires (tout utilisateur connecté) |
| `PUT` | `/api/settings/:key` | _(admin)_ Mise à jour d'une liste |

#### Utilisateurs _(admin uniquement)_
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/users` | Liste des utilisateurs |
| `POST` | `/api/users` | Création d'un utilisateur (force `must_change_password=true`) |
| `PUT` | `/api/users/:id` | Modification d'un utilisateur (username, email, role, password) |
| `POST` | `/api/users/:id/reset-password` | Réinitialisation du mot de passe |
| `DELETE` | `/api/users/:id` | Suppression d'un utilisateur |

#### Statistiques
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/stats` | Statistiques globales — accepte `?since=YYYY-MM-DD` pour filtrer par période |

Réponse : `total`, `active`, `boardCounts`, `sexeCounts`, `pathoCounts`, `aggCounts`, `avgDurations`, `ageCounts`, `irockCount`, `honosCount`, `visitsByLieu`.

#### Sauvegarde _(admin uniquement)_
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/backup/export` | Export JSON complet (v2 — 11 sections) |
| `POST` | `/api/backup/restore` | Restauration transactionnelle depuis JSON (v1 et v2 supportés) |

---

## Développement

### Commandes utiles

| Commande | Description |
|----------|-------------|
| `pnpm install` | Installation des dépendances du monorepo |
| `pnpm --filter @workspace/api-server run dev` | Lancement du serveur API en mode dev |
| `pnpm --filter @workspace/factboard run dev` | Lancement du frontend Vite |
| `pnpm --filter @workspace/api-server run build` | Build production de l'API (esbuild → `dist/index.mjs`) |
| `pnpm --filter @workspace/factboard run build` | Build production du frontend (Vite) |
| `pnpm --filter @workspace/db run push` | Push manuel du schéma Drizzle (rarement utile : les migrations sont auto-appliquées) |
| `pnpm --filter @workspace/api-spec run codegen` | Régénère les schémas Zod et hooks React Query depuis l'OpenAPI |
| `pnpm run typecheck` | Typecheck complet du monorepo (libs + leaves) |
| `pnpm run typecheck:libs` | Typecheck uniquement des libs composites |
| `docker compose up --build` | Build + démarrage de la stack complète |

### Workflow OpenAPI / Codegen

Le contrat est défini dans `lib/api-spec/openapi.yaml`. Après modification :
1. Lancer `pnpm --filter @workspace/api-spec run codegen`
2. Les schémas Zod sont régénérés dans `lib/api-zod/src/generated/`
3. Les hooks React Query sont régénérés dans `lib/api-client-react/src/generated/`
4. Le serveur consomme les schémas Zod via `import { ... } from "@workspace/api-zod"`
5. Le frontend consomme les hooks via `import { ... } from "@workspace/api-client-react"`

> ⚠️ Après codegen : vérifier que `lib/api-zod/src/index.ts` ne contient que `export * from "./generated/api";` (Orval écrase parfois ce fichier).

### Conventions

- **Logs serveur** : utiliser `req.log` dans les handlers et le singleton `logger` ailleurs. **Jamais `console.log`** côté serveur.
- **Mises à jour patient** : toutes les sous-routes acceptent à la fois `PUT` et `PATCH` (le client généré utilise `PATCH`).
- **Suppression** : toujours douce (`deleted_at`) pour les patients, dure pour les autres entités.
- **TypeScript** : strict mode partout, libs composites avec `tsc --build`, leaves vérifiées avec `tsc --noEmit`.
- **Format de date** : ISO court (`YYYY-MM-DD`) pour les dates métier (`date_premier_contact`, etc.), ISO complet (`timestamptz`) pour les colonnes d'audit.

### Structure du monorepo pnpm

Voir `.local/skills/pnpm-workspace/SKILL.md` pour les conventions complètes (alias `@workspace/*`, catalog dependencies, project references TS, routing du proxy).

---

## Licence

Usage interne — Tous droits réservés.
