# Bookstore Application - Docker Setup

Application e-commerce de livres avec backend Express, frontend Vue 3 et PostgreSQL, dockerisée avec Docker Compose.

⚠️ **ATTENTION** : Cette application contient volontairement des mauvaises pratiques pour un cours d'audit technique. **NE PAS UTILISER EN PRODUCTION !**

## Structure du projet

```
audit-diagnostic-app/
├── backend/                # API Node.js/Express + PostgreSQL
│   ├── Dockerfile
│   ├── server.js
│   ├── seed.js   # Script de remplissage de la base
│   ├── init.sql           # Initialisation PostgreSQL
│   └── package.json
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
- Démarrer PostgreSQL avec la base `bookstore`
- Construire les images Docker pour le backend et le frontend
- Démarrer les trois services
- Le PostgreSQL sera accessible sur `localhost:5432`
- Le backend sera accessible sur `http://localhost:3000`
- Le frontend sera accessible sur `http://localhost:5173`

### 2. Accéder à l'application

- **Frontend** : Ouvrir `http://localhost:5173` dans votre navigateur
- **Backend API** : `http://localhost:3000`
- **PostgreSQL** : `localhost:5432` (bookstore/bookstore_user/bookstore_pass)

### 3. Arrêter l'application

```bash
docker-compose down
```

Pour arrêter et supprimer les volumes (⚠️ efface la base de données) :
```bash
docker-compose down -v
```

## Services Docker

### PostgreSQL (bookstore-postgres)
- **Port** : 5432
- **Image** : postgres:16-alpine
- **Database** : bookstore
- **User** : bookstore_user
- **Password** : bookstore_pass
- **Volume** : postgres_data (persistance des données)
- **Init script** : `backend/init.sql` (exécuté au premier démarrage)

### Backend (bookstore-backend)
- **Port** : 3000
- **Image** : node:22-alpine
- **Dépend de** : postgres (avec healthcheck)
- **Environnement** : 
  - NODE_ENV=development
  - DB_HOST=postgres
  - DB_PORT=5432
  - DB_NAME=bookstore
  - DB_USER=bookstore_user
  - DB_PASSWORD=bookstore_pass

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

# PostgreSQL uniquement
docker-compose logs -f postgres

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend
```

### Accéder à PostgreSQL
```bash
# Via docker-compose
docker-compose exec postgres psql -U bookstore_user -d bookstore

# Depuis l'hôte
psql -h localhost -p 5432 -U bookstore_user -d bookstore
```

### Remplir la base avec des données de test
```bash
# Depuis le container backend
docker-compose exec backend node seed.js

# Ou depuis l'hôte (si PostgreSQL écoute sur localhost:5432)
cd backend
node seed.js
```

### Reconstruire les images
```bash
docker-compose build --no-cache
```

### Redémarrer un service
```bash
docker-compose restart postgres
docker-compose restart backend
docker-compose restart frontend
```

### Exécuter une commande dans un container
```bash
# PostgreSQL
docker-compose exec postgres psql -U bookstore_user -d bookstore

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

### PostgreSQL
Installez PostgreSQL localement et créez la base :
```bash
psql -U postgres
CREATE DATABASE bookstore;
CREATE USER bookstore_user WITH PASSWORD 'bookstore_pass';
GRANT ALL PRIVILEGES ON DATABASE bookstore TO bookstore_user;
\q

# Initialiser la base
psql -U bookstore_user -d bookstore -f backend/init.sql
```

### Backend
```bash
cd backend
npm install

# Configurer les variables d'environnement (optionnel si valeurs par défaut)
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=bookstore
export DB_USER=bookstore_user
export DB_PASSWORD=bookstore_pass

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
- `postgres_data` : Volume Docker pour persister les données PostgreSQL entre les redémarrages

### Ports exposés
- `5432` : PostgreSQL
- `3000` : API Backend
- `5173` : Frontend Vite dev server

### Communication Frontend ↔ Backend
Le frontend appelle l'API via `http://localhost:3000` car :
- Le code JavaScript Vue s'exécute dans le navigateur de l'hôte
- Le navigateur accède directement au port 3000 mappé par Docker
- Pas besoin de configuration réseau complexe ou de reverse proxy

## Base de données PostgreSQL

### Schéma
- **users** : id (SERIAL), email, password, role
- **products** : id (SERIAL), title, author, price (DECIMAL), description, stock
- **orders** : id (SERIAL), user_email, total (DECIMAL), status, created_at (TIMESTAMP)

### Initialisation
Le script `backend/init.sql` est exécuté automatiquement au premier démarrage du container PostgreSQL pour :
- Créer les tables
- Ajouter des index
- Insérer des utilisateurs et produits de test

### Migration SQLite → PostgreSQL
L'application a été migrée de SQLite vers PostgreSQL pour :
- ✅ Meilleure scalabilité
- ✅ Support concurrent (plusieurs connexions simultanées)
- ✅ Transactions ACID plus robustes
- ✅ Compatibilité avec Docker et cloud
- ✅ Performances avec grandes quantités de données (10 000+ produits)

## Troubleshooting

### Le backend ne peut pas se connecter à PostgreSQL
- Vérifier que PostgreSQL est démarré : `docker-compose logs postgres`
- Attendre que le healthcheck soit OK (peut prendre 10-20 secondes)
- Vérifier les variables d'environnement dans `docker-compose.yml`

### Le frontend ne peut pas joindre le backend
- Vérifier que le backend est bien démarré : `docker-compose logs backend`
- Vérifier que le port 3000 est accessible : `curl http://localhost:3000`

### Erreur "port already in use"
- Un autre processus utilise déjà le port 3000, 5173 ou 5432
- Arrêter le processus ou modifier les ports dans `docker-compose.yml`

### La base de données est vide
- Au premier démarrage, la base est créée et remplie via `init.sql`
- Vérifier les logs PostgreSQL : `docker-compose logs postgres`
- Pour remplir avec 10 000 produits : `docker-compose exec backend node seed.js`

### Erreur de connexion PostgreSQL
- Vérifier que le service postgres est healthy : `docker-compose ps`
- Recréer les containers : `docker-compose down -v && docker-compose up --build`

### Hot-reload ne fonctionne pas (frontend)

- Le dev server Vite est configuré avec `--host 0.0.0.0` pour accepter les connexions
- Rafraîchir la page manuellement si nécessaire

### Reconstruire complètement

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```
