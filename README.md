# Bondoukou MCP

Serveur [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) écrit en TypeScript. Il expose un outil de recherche de prestataires à partir d'un fichier JSON local et des fonctions pour valider des prestataires importés depuis un fichier CSV.

## Fonctionnalités

- Recherche par métier et par ville via l'outil MCP `search_providers`.
- Exclusion par défaut des prestataires qui ne sont pas vérifiés.
- Validation de données prestataires avec un schéma partagé.
- Analyse de fichiers CSV, avec signalement des lignes invalides et des identifiants en double.

L'import CSV est actuellement une fonction de traitement et un script de démonstration : il ne modifie pas `data/providers.json` et n'est pas exposé comme outil MCP.

## Prérequis

- Node.js et npm.

## Installation et démarrage

À la racine du projet, installez les dépendances puis démarrez le serveur :

```bash
npm install
npm start
```

Le serveur communique avec son client MCP via stdio. Configurez votre client MCP pour lancer `npm start` depuis le dossier du projet.

## Outil MCP : `search_providers`

| Paramètre | Type | Défaut | Description |
| --- | --- | --- | --- |
| `service` | chaîne, facultative | Aucun filtre | Métier recherché. La recherche correspond à une partie de la catégorie et ne tient pas compte des majuscules/minuscules. |
| `city` | chaîne | `Bondoukou` | Ville recherchée ; la comparaison ne tient pas compte des majuscules/minuscules. |
| `includeUnverified` | booléen | `false` | Si `true`, inclut les prestataires dont le statut n'est pas `verified`. |

Les résultats correspondent aux prestataires présents dans `data/providers.json`. Ils sont renvoyés sous forme de texte JSON. Si aucun résultat ne correspond, l'outil renvoie un message explicatif.

Chaque prestataire comporte les champs suivants :

- `id`, `name`, `category` et `city` ;
- `neighborhood`, `phone` et `address`, facultatifs ;
- `source` : `business_owner`, `field_visit`, `public_directory` ou `imported_file` ;
- `verificationStatus` : `pending`, `verified` ou `rejected` ;
- `updatedAt`, une date au format ISO.

Le schéma est défini dans [`src/domain/providers.ts`](src/domain/providers.ts). Le fichier de données doit contenir un tableau d'objets conformes à ce schéma.

## Import CSV

La fonction `importProvidersCsv` analyse le contenu CSV en mémoire. Les colonnes requises sont `id`, `name` et `category`. Les colonnes `city`, `neighborhood`, `phone` et `address` sont facultatives ; `city` vaut `Bondoukou` si elle est absente ou vide.

Les enregistrements importés reçoivent la source `imported_file` et le statut `pending` afin qu'ils restent exclus des résultats de recherche par défaut jusqu'à vérification. Les lignes invalides et les identifiants répétés dans le fichier sont retournés dans une liste d'erreurs, sans empêcher le traitement des autres lignes valides.

Le module `filterExistingProviders` permet également d'écarter les identifiants déjà présents dans une liste de prestataires. Ces fonctions ne sauvegardent pas elles-mêmes leurs résultats.

Pour exécuter le script de démonstration inclus :

```bash
npx tsx scripts/test-csv-import.ts
```

Il lit `imports/incoming/demo-providers.csv` et affiche les enregistrements valides, les erreurs et un résumé. Le CSV de démonstration contient des données fictives.

## Tests et vérification

```bash
npm test
npm run typecheck
```

Les tests couvrent la recherche, la validation CSV et le filtrage des identifiants déjà enregistrés.

## Organisation du projet

```text
src/
  application/
    import/       # Analyse CSV et filtrage des identifiants existants
    search-providers.ts
  domain/         # Schéma et type Provider
  infrastructure/ # Lecture et validation du fichier JSON local
  index.ts        # Serveur MCP et définition de l'outil
data/
  providers.json
imports/
  incoming/       # CSV de démonstration
scripts/          # Script de démonstration de l'import CSV
tests/
```
