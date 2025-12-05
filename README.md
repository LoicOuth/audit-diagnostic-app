# Bookstore Application - Docker Setup

Application e-commerce de livres avec backend Express et frontend Vue 3, dockerisée avec Docker Compose.

⚠️ **ATTENTION** : Cette application contient volontairement des mauvaises pratiques pour un cours d'audit technique. **NE PAS UTILISER EN PRODUCTION !**

## Structure du projet

```
audit-diagnostic-app/
├── backend/                # API Node.js/Express
│   ├── Dockerfile
│   ├── server.js
│   └──  package.json
├── frontend/              # Application Vue 3 + Vite
│   ├── Dockerfile
│   ├── src/
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml     # Orchestration des services
```

## Prérequis

- Docker (version 20+)
- Docker Compose (version 2+)

## Démarrage rapide

### 1. Lancer l'application avec Docker Compose

```bash
docker-compose up -d
```

Cette commande va :

- Construire les images Docker pour le backend et le frontend
- Démarrer les deux services
- Le backend sera accessible sur `http://localhost:3000`
- Le frontend sera accessible sur `http://localhost:5173`

### 2. Accéder à l'application

- **Frontend** : Ouvrir `http://localhost:5173` dans votre navigateur
- **Backend API** : `http://localhost:3000`

### 3. Arrêter l'application

```bash
docker-compose down
```

Pour arrêter et supprimer les volumes (⚠️ efface la base de données) :

```bash
docker-compose down -v
```

## Services Docker

### Backend (bookstore-backend)

- **Port** : 3000
- **Image** : node:22-alpine
- **Volume** : `./backend/bookstore.db` (persistance de la base SQLite)
- **Environnement** : NODE_ENV=development

### Frontend (bookstore-frontend)

- **Port** : 5173
- **Image** : node:22-alpine
- **Dépend de** : backend
- **Dev server** : Vite avec hot-reload

## Commandes utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend
```

### Reconstruire les images

```bash
docker-compose build --no-cache
```

### Redémarrer un service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Exécuter une commande dans un container

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh
```

### Voir l'état des containers

```bash
docker-compose ps
```

## Développement sans Docker

Si vous préférez développer sans Docker :

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Comptes de test

- **Utilisateur** : `user@test.com` / `password`
- **Admin** : `admin@bookstore.com` / `admin123`

## Fonctionnalités

- 📚 Liste et détail des produits (livres)
- 🔐 Authentification (login/register)
- 🛒 Gestion de panier
- 💳 Paiement (simulé)
- 🔧 Panel admin (création de produits)

## Architecture Docker

### Réseau

Les services communiquent via un réseau bridge `bookstore-network`.

### Volumes

- La base SQLite (`bookstore.db`) est montée en volume pour persister les données entre les redémarrages.

### Ports exposés

- `3000` : API Backend
- `5173` : Frontend Vite dev server

### Communication Frontend ↔ Backend

Le frontend appelle l'API via `http://localhost:3000` car :

- Le code JavaScript Vue s'exécute dans le navigateur de l'hôte
- Le navigateur accède directement au port 3000 mappé par Docker
- Pas besoin de configuration réseau complexe ou de reverse proxy

## Troubleshooting

### Le frontend ne peut pas joindre le backend

- Vérifier que le backend est bien démarré : `docker-compose logs backend`
- Vérifier que le port 3000 est accessible : `curl http://localhost:3000`

### Erreur "port already in use"

- Un autre processus utilise déjà le port 3000 ou 5173
- Arrêter le processus ou modifier les ports dans `docker-compose.yml`

### La base de données est vide

- Au premier démarrage, la base est créée et remplie avec des données de test
- Vérifier les logs du backend : `docker-compose logs backend`

### Hot-reload ne fonctionne pas (frontend)

- Le dev server Vite est configuré avec `--host 0.0.0.0` pour accepter les connexions
- Rafraîchir la page manuellement si nécessaire

### Reconstruire complètement

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```
