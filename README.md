# Analyses CSV

Application Nuxt qui liste les fichiers CSV d'un répertoire (hors de l'app) et les affiche en tableaux, mis à jour en direct.

## Configuration

Tout se règle dans le fichier `.env` à la racine du projet :

| Variable | Rôle |
|---|---|
| `CSV_DIR` | répertoire des CSV. Sans Docker : relatif au dossier de l'app, ou absolu. Avec Docker : chemin sur ta machine (commence par `./`, `../` ou est absolu), il est monté automatiquement dans le conteneur |
| `PORT` | port du site (3000 par défaut) |
| `WATCH_POLLING` | `true` pour détecter les changements de fichiers avec Docker sur Mac/Windows. Consomme un peu de CPU sur de très gros répertoires |

Après modification du `.env`, relance l'app.

## Fonctionnement des fichiers

Pour un fichier `nom.csv` :

- `nom_history.csv` (même répertoire) : masqué de la liste ; colonne « Historique » avec un graphique (colonnes `time` et `Task Duration without dev tools (cumulated)`, lignes de la même URL).
- `nom_details.csv` (même répertoire) : masqué de la liste ; colonne « Détails » avec le tableau des lignes de la même URL.
- `reports/*.html` (même répertoire) : colonne « Rapport » avec le rapport HTML correspondant à l'URL de la ligne.

## Docker

Prérequis : Docker avec la commande `docker compose`.

### Mode dev

Les sources sont montées dans le conteneur : toute modification du code recharge la page.

```bash
docker compose -f compose.dev.yaml up --build
```

Si tu modifies `package.json`, ajoute `-V` pour renouveler le volume `node_modules` :

```bash
docker compose -f compose.dev.yaml up --build -V
```

Arrêt : `Ctrl+C`, puis `docker compose -f compose.dev.yaml down`.

### Build

```bash
docker compose build
```

(équivalent : `docker build --target prod -t csv-viewer .`)

### Run (site qui tourne)

```bash
docker compose up -d --build
```

Le site est disponible sur http://localhost:3000 (ou le `PORT` du `.env`).

```bash
docker compose logs -f    # logs
docker compose down       # arrêt
```

## Sans Docker (Node 20+)

```bash
npm install
npm run dev
```
