# Bondoukou MCP

Serveur MCP permettant de rechercher des prestataires de services à Bondoukou, en Côte d'Ivoire. Le projet vise à faciliter, à terme, la recherche de professionnels locaux comme les électriciens, plombiers et autres prestataires.

Le projet est actuellement en phase de développement. Il utilise des données locales au format JSON et comprend un premier système d'import de prestataires depuis des fichiers CSV.

> **État actuel :** le moteur de recherche, la validation des données, la détection des doublons, la sauvegarde sécurisée et les tests automatisés sont implémentés. La collecte et la vérification de véritables prestataires restent à réaliser.

## 1. Objectifs du projet

- Rechercher des prestataires par métier et par ville.
- Structurer et valider les informations des prestataires.
- Importer des données depuis des fichiers CSV.
- Refuser les identifiants déjà enregistrés.
- Conserver les prestataires existants lors d'un ajout.
- Protéger le fichier principal pendant la sauvegarde.
- Distinguer les prestataires vérifiés de ceux en attente de vérification.
- Exposer la recherche via un outil MCP.

## 2. Technologies utilisées

| Technologie                  | Utilisation                         |
| ---------------------------- | ----------------------------------- |
| TypeScript                   | Langage principal                   |
| Node.js                      | Environnement d'exécution           |
| Model Context Protocol (MCP) | Exposition des outils de recherche  |
| Zod v4                       | Validation des données              |
| `csv-parse`                  | Lecture et analyse des fichiers CSV |
| Vitest                       | Tests automatisés                   |
| `tsx`                        | Exécution des fichiers TypeScript   |
| npm                          | Gestion des scripts et dépendances  |

## 3. Architecture du projet

```text
bondoukou-mcp/
├── data/
│   └── providers.json
├── imports/
│   ├── incoming/
│   │   └── demo-providers.csv
│   ├── processed/
│   └── rejected/
├── scripts/
│   └── test-csv-import.ts
├── src/
│   ├── application/
│   │   ├── import/
│   │   │   ├── import-providers-csv.ts
│   │   │   └── filter-existing-providers.ts
│   │   └── search-providers.ts
│   ├── domain/
│   │   └── providers.ts
│   ├── infrastructure/
│   │   └── provider-store.ts
│   └── index.ts
├── tests/
│   ├── search-providers.test.ts
│   ├── import-providers-csv.test.ts
│   ├── filter-existing-providers.test.ts
│   ├── provider-store.test.ts
│   └── provider-import.integration.test.ts
├── package.json
├── package-lock.json
└── README.md
```

### Responsabilités des dossiers

- `domain/` : définition et validation du modèle métier des prestataires.
- `application/` : logique de recherche, import CSV et filtrage des doublons.
- `infrastructure/` : lecture et sauvegarde des données locales.
- `scripts/` : exécution manuelle de l'import CSV.
- `tests/` : tests unitaires et test d'intégration.
- `data/` : fichier JSON contenant les prestataires enregistrés.
- `imports/` : organisation des fichiers CSV entrants et des futurs fichiers traités ou rejetés.

## 4. Modèle de données

Le modèle `Provider` est défini et validé avec Zod dans `src/domain/providers.ts`.

| Champ                | Description                       |
| -------------------- | --------------------------------- |
| `id`                 | Identifiant unique du prestataire |
| `name`               | Nom du prestataire                |
| `category`           | Métier ou catégorie de service    |
| `city`               | Ville ; Bondoukou par défaut      |
| `neighborhood`       | Quartier facultatif               |
| `phone`              | Téléphone facultatif              |
| `address`            | Adresse facultative               |
| `source`             | Provenance déclarée des données   |
| `verificationStatus` | État de vérification              |
| `updatedAt`          | Date de dernière mise à jour      |

Les sources autorisées sont :

- `business_owner`
- `field_visit`
- `public_directory`
- `imported_file`

Les statuts autorisés sont :

- `pending` : en attente de vérification ;
- `verified` : vérifié ;
- `rejected` : rejeté.

Les prestataires importés depuis un CSV sont automatiquement marqués `imported_file` et `pending`. L'import ne doit pas être considéré comme une preuve de l'existence réelle d'un prestataire.

## 5. Fonctionnalités implémentées

### Recherche de prestataires

Fichier : `src/application/search-providers.ts`

La recherche permet de filtrer les prestataires selon :

- le métier ou la catégorie ;
- la ville ;
- le statut de vérification.

Par défaut, seuls les prestataires `verified` sont retournés. L'option `includeUnverified` permet d'inclure les prestataires non vérifiés.

### Validation et import CSV

Fichier : `src/application/import/import-providers-csv.ts`

Le système :

- lit un CSV avec en-têtes ;
- prend en charge le BOM et les lignes vides ;
- valide les données avec le schéma Zod ;
- applique Bondoukou comme ville par défaut ;
- attribue la source `imported_file` et le statut `pending` ;
- détecte les identifiants dupliqués dans le même fichier ;
- retourne les prestataires valides et les erreurs ;
- conserve des informations de ligne pour faciliter la correction des erreurs.

### Filtrage des prestataires existants

Fichier : `src/application/import/filter-existing-providers.ts`

Le filtrage refuse les identifiants déjà enregistrés et évite également d'accepter deux fois le même identifiant dans un même lot.

### Sauvegarde sécurisée

Fichier : `src/infrastructure/provider-store.ts`

La fonction `saveNewProviders()` :

1. lit et valide les données existantes ;
2. filtre les identifiants déjà présents ;
3. prépare la liste fusionnée ;
4. écrit le nouveau contenu dans un fichier temporaire unique ;
5. remplace le fichier principal après l'écriture réussie ;
6. tente de nettoyer le fichier temporaire en cas d'échec.

Le fichier JSON existant n'est pas remplacé si sa lecture ou sa validation échoue.

### Serveur MCP

Fichier : `src/index.ts`

Le serveur expose l'outil `search_providers`, qui permet d'interroger les prestataires locaux à partir des critères de recherche disponibles.

## 6. Installation

Prérequis :

- Node.js ;
- npm ;
- Git.

Cloner le dépôt :

```bash
git clone <URL_DU_DEPOT>
cd bondoukou-mcp
```

Installer les dépendances :

```bash
npm install
```

## 7. Commandes disponibles

### Vérifier les types TypeScript

```bash
npm run typecheck
```

### Exécuter les tests

```bash
npm test
```

### Démarrer le serveur MCP

```bash
npm start
```

Le serveur utilise le transport standard d'entrée/sortie (`stdio`). Il doit être lancé par un client MCP compatible et configuré dans celui-ci pour être utilisé.

### Simuler un import CSV

```bash
npm run import:providers
```

Cette commande lit `imports/incoming/demo-providers.csv`, valide les données et affiche un rapport. Elle ne modifie pas le fichier principal.

### Effectuer un import réel

Le script exige une confirmation explicite et refuse le fichier de démonstration nommé `demo-providers.csv`.

Exemple de commande avec un fichier CSV préparé et contrôlé :

```powershell
npm run import:providers:write -- --file imports/incoming/prestataires-reels.csv --confirm-real-data
```

**Attention :** cette commande écrit réellement dans `data/providers.json`. Vérifier la provenance des données et le contenu du fichier avant de l'exécuter.

Le nom d'un fichier ne garantit pas que les données sont réelles. La protection actuelle contre les données de démonstration est une précaution élémentaire, pas un système complet de contrôle de provenance.

## 8. Tests automatisés

Au dernier contrôle, les tests suivants passaient :

| Fichier                               |  Tests |
| ------------------------------------- | -----: |
| `search-providers.test.ts`            |      5 |
| `filter-existing-providers.test.ts`   |      3 |
| `import-providers-csv.test.ts`        |      8 |
| `provider-store.test.ts`              |      3 |
| `provider-import.integration.test.ts` |      1 |
| **Total**                             | **20** |

Les tests couvrent notamment la recherche, la validation CSV, les doublons, la sauvegarde, la conservation des données existantes et le refus d'écraser un JSON invalide.

Pour relancer les vérifications :

```bash
npm run typecheck
npm test
```

Ces résultats correspondent au dernier contrôle effectué pendant le développement. Il est recommandé de les relancer avant chaque publication.

## 9. Données et précautions

Le fichier `imports/incoming/demo-providers.csv` contient des données fictives destinées aux tests. Ces données ne doivent pas être présentées comme celles de véritables professionnels.

Le fichier `data/providers.json` est actuellement le stockage local principal. Il ne s'agit pas encore d'une base de données centralisée.

Avant une utilisation réelle :

- collecter les données avec une provenance identifiable ;
- vérifier l'existence et les coordonnées des prestataires ;
- obtenir les autorisations nécessaires pour publier les informations ;
- sauvegarder les données avant les imports importants ;
- empêcher l'exposition de données non vérifiées comme si elles étaient fiables ;
- prévoir une procédure de mise à jour et de suppression des informations obsolètes.

## 10. Améliorations prévues

Les prochaines étapes envisagées sont :

1. Tester automatiquement les protections du script d'import.
2. Améliorer le suivi de provenance des données.
3. Séparer rigoureusement les données de test des données réelles.
4. Produire un bilan d'import précis : lignes lues, erreurs, doublons et ajouts.
5. Fiabiliser les numéros de ligne des erreurs, notamment pour les enregistrements CSV multilignes.
6. Développer une procédure de vérification des prestataires.
7. Évaluer les besoins d'une base de données persistante.
8. Ajouter progressivement les fonctionnalités nécessaires au produit final.

## 11. État du projet

Le projet possède une première base fonctionnelle pour rechercher des prestataires, importer des fichiers CSV et enregistrer des données locales avec des tests automatisés.

Il reste en développement. Les prestataires fictifs, les données en attente de vérification et les prestataires réellement vérifiés doivent rester clairement distingués.

---

**Projet :** Bondoukou MCP  
**Langage principal :** TypeScript  
**Statut :** développement actif
