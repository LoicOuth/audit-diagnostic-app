# Bookstore API - Backend (Volontairement mal codé)

⚠️ **ATTENTION** : Ce code contient volontairement de nombreuses mauvaises pratiques pour servir d'exemple dans un cours d'audit technique. **NE PAS UTILISER EN PRODUCTION !**

## Installation

```bash
cd backend
npm install
```

## Démarrage

### Avec Docker (recommandé)

```bash
# À la racine du projet
docker-compose up --build
```

### Sans Docker (développement local)

1. Installez PostgreSQL localement
2. Créez une base de données `bookstore`
3. Configurez les variables d'environnement ou utilisez les valeurs par défaut :
   - `DB_HOST=localhost`
   - `DB_PORT=5432`
   - `DB_NAME=bookstore`
   - `DB_USER=bookstore_user`
   - `DB_PASSWORD=bookstore_pass`

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## Remplir la base avec des données de test

Pour insérer 10 000 produits et 5 000 commandes :

```bash
node seed.js
```

## Routes disponibles

### Publiques
- `GET /` - Page d'accueil
- `GET /products` - Liste tous les produits
- `GET /products/:id` - Détail d'un produit
- `POST /register` - Créer un compte
- `POST /login` - Se connecter

### Authentifiées
- `POST /cart/add` - Ajouter un produit au panier
- `GET /cart` - Voir le panier
- `POST /payment` - Payer (faux Stripe)

### Admin
- `POST /admin/products` - Créer un produit

### Debug
- `GET /debug` - Informations système
- `GET /user/:email` - Rechercher un utilisateur

## Comptes de test

- Admin: `admin@bookstore.com` / `admin123`
- User: `user@test.com` / `password`

## Exemples d'utilisation

### Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}'
```

### Ajouter au panier
```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: user@test.com|1234567890" \
  -d '{"productId":1,"quantity":2}'
```

### Créer un produit (admin)
```bash
curl -X POST http://localhost:3000/admin/products \
  -H "Content-Type: application/json" \
  -d '{"role":"admin","title":"New Book","author":"Author","price":19.99,"description":"Description","stock":10}'
```

## Structure de la base de données

PostgreSQL avec 3 tables :
- `users` - Utilisateurs (avec mots de passe en clair - MAUVAISE PRATIQUE)
- `products` - Livres
- `orders` - Commandes

Les tables sont créées automatiquement au démarrage via `init.sql` avec des données de test.
