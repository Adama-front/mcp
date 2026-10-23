# Bondoukou MCP

Serveur [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) en TypeScript qui permet de rechercher des prestataires à Bondoukou. Il communique avec son client MCP via l'entrée et la sortie standard (stdio).

## Prérequis

- Node.js
- npm

## Installation

```bash
npm install
```

## Démarrage

Lancez le serveur depuis le dossier du projet :

```bash
npm start
```

Le processus démarre le serveur MCP sur stdio. Lancez-le depuis votre client MCP en configurant `npm start` comme commande du serveur.

Pour vérifier les types TypeScript :

```bash
npm run typecheck
```

## Outil disponible

### `search_providers`

Recherche les prestataires selon leur métier, leur ville et leur disponibilité. Les filtres de texte ne tiennent pas compte des majuscules et minuscules.

| Paramètre | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `service` | `string` (facultatif) | Aucun filtre | Métier, par exemple `electricien`, `plombier` ou `demenagement`. |
| `city` | `string` | `Bondoukou` | Ville recherchée. |
| `availableOnly` | `boolean` | `true` | Si `true`, ne retourne que les prestataires disponibles. |

Les résultats sont renvoyés sous forme de texte JSON. Chaque prestataire contient un identifiant (`id`), un nom (`name`), un métier (`service`), une ville (`city`) et un indicateur de disponibilité (`available`).

Les données d'exemple sont définies dans [`src/providers.ts`](src/providers.ts).
