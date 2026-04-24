# DigiBoard

Application web de gestion de patients psychiatriques pour les case managers luxembourgeois. Conçue pour le suivi des dossiers, la coordination des soins et la gestion des transitions entre boards cliniques.

![DigiBoard Login](screenshots/board-view.jpg)

---

## Fonctionnalités principales

### 5 Boards cliniques
| Board | Description |
|-------|-------------|
| **PréAdmission** | Nouveaux dossiers, informations initiales, premiers contacts |
| **FactBoard** | Suivi actif avec phases de traitement, passages hebdomadaires |
| **RecoveryBoard** | Objectifs de rétablissement, étapes et plan d'action |
| **Irrecevable** | Dossiers non retenus avec motif d'irrecevabilité |
| **Clôturé** | Dossiers fermés — historique complet conservé |

> Les patients **Clôturés** sont exclus de la vue "Tous" et n'apparaissent que dans leur propre onglet.

### Gestion des patients
- **Création** avec numérotation automatique `FACT-XXXX` (générée côté serveur)
- **Recherche** par nom, prénom, psychiatre ou numéro client
- **Déplacement** entre boards avec date et historique automatique
- **Suppression douce** : les patients supprimés sont conservés en base et restaurables depuis les Paramètres

### FactBoard — Suivi clinique
- **Phase de traitement** : sélection via liste déroulante (6 phases disponibles)
- **Passages hebdomadaires** : cases à cocher par jour (Lun–Ven) + rendez-vous spéciaux
- **Notes de réunion** : ajout, modification et suppression avec sauvegarde automatique

### Notes de réunion
Les notes sont sauvegardées automatiquement à la perte du focus (date et contenu). Chaque note affiche sa date et peut être supprimée individuellement.

### Historique
Chaque déplacement de board est enregistré automatiquement. L'historique est consultable directement depuis la fiche patient.

### Recherche ICD-10
Recherche intégrée des diagnostics CIM-10 dans le formulaire patient (recherche par code ou libellé).

### Paramètres
- **Listes configurables** : Case Managers, Psychiatres, Médecins de famille, Articles légaux, Curatelles/Tutelles
- **Corbeille** : restauration de patients supprimés vers leur dernier board
- **Gestion des utilisateurs** (admin uniquement) : création, modification, suppression

### Statistiques
Page de statistiques avec répartition par board, phase et ACT région.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Express 5 (TypeScript) |
| Base de données | PostgreSQL + Drizzle ORM |
| Frontend | React + Vite + Tailwind CSS 4 |
| État / données | TanStack Query |
| Auth | Tokens Bearer (bcrypt) |
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

```bash
# Lancer toute la stack (app + PostgreSQL)
docker compose up -d

# Variables d'environnement (créer un fichier .env) :
# POSTGRES_PASSWORD=votre_mot_de_passe   (défaut : digiboard_secret)
# SESSION_SECRET=une_clé_secrète_longue  (OBLIGATOIRE en production)
# APP_PORT=80                            (port exposé, défaut : 80)
```

L'image Docker est construite en multi-stage : dépendances → build → image finale légère.  
L'API et le frontend React sont servis par le même container Express.

---

## Identifiants par défaut

| Utilisateur | Mot de passe | Rôle |
|-------------|--------------|------|
| `admin` | `admin123` | Administrateur |

> Changer le mot de passe immédiatement après la première connexion en production.

---

## Architecture

```
workspace/
├── artifacts/
│   ├── api-server/          # API Express 5 (port 8080)
│   │   └── src/routes/      # patients, notes, auth, settings, users, stats
│   └── factboard/           # Frontend React + Vite (port 18576)
│       └── src/
│           ├── components/  # PatientList, PatientDetail, PatientModal, …
│           └── pages/       # board.tsx, settings.tsx, statistics.tsx
├── lib/
│   ├── db/                  # Schéma Drizzle ORM + migrations
│   ├── api-client-react/    # Hooks React Query générés (Orval)
│   └── api-spec/            # Spécification OpenAPI
├── Dockerfile               # Build multi-stage
└── docker-compose.yml       # Stack complète avec PostgreSQL
```

### Endpoints API principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/patients` | Liste (exclut Clôturé et supprimés) |
| `GET` | `/api/patients?board=X` | Filtre par board |
| `POST` | `/api/patients` | Création (ID FACT- auto-généré) |
| `PATCH` | `/api/patients/:id` | Mise à jour |
| `PATCH` | `/api/patients/:id/board` | Changement de board |
| `DELETE` | `/api/patients/:id` | Suppression douce |
| `GET` | `/api/patients/deleted` | Liste des patients supprimés |
| `POST` | `/api/patients/:id/restore` | Restauration |
| `PATCH` | `/api/patients/:id/phase` | Mise à jour de la phase |
| `PATCH` | `/api/patients/:id/passages` | Passages hebdomadaires |
| `POST` | `/api/patients/:id/notes` | Ajout d'une note de réunion |
| `PATCH` | `/api/patients/:id/notes/:noteId` | Modification d'une note |

---

## Licence

Usage interne — Tous droits réservés.
