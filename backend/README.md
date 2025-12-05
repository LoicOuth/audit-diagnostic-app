# Bookstore API - Backend (Volontairement mal codé)

⚠️ **ATTENTION** : Ce code contient volontairement de nombreuses mauvaises pratiques pour servir d'exemple dans un cours d'audit technique. **NE PAS UTILISER EN PRODUCTION !**

## Installation

```bash
cd back
npm install
```

## Démarrage

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

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

## Base de données

SQLite avec 3 tables :
- `users` - Utilisateurs (avec mots de passe en clair)
- `products` - Livres
- `orders` - Commandes

La base est créée automatiquement au démarrage avec des données de test.
