# Bookstore Frontend (Volontairement mal codé)

⚠️ **ATTENTION** : Ce code contient volontairement de nombreuses mauvaises pratiques pour servir d'exemple dans un cours d'audit technique. **NE PAS UTILISER EN PRODUCTION !**

## Installation

```bash
cd front
npm install
```

## Démarrage

```bash
npm run dev
```

L'application démarre sur `http://localhost:5173`

**Important** : Le backend doit tourner sur `http://localhost:3000` pour que l'application fonctionne.

## Fonctionnalités

- 📚 **Liste des produits** - Voir tous les livres disponibles
- 🔐 **Login / Register** - Authentification basique
- 🛒 **Panier** - Ajouter des produits au panier
- 💳 **Paiement** - Simuler un paiement
- 🔧 **Panel Admin** - Créer de nouveaux produits (accessible sans vraie vérification)

## Comptes de test

Utilisez les comptes du backend :
- User: `user@test.com` / `password`
- Admin: `admin@bookstore.com` / `admin123`

## Exemples d'utilisation

1. **Lancer le backend** (dans un terminal)
   ```bash
   cd back
   npm start
   ```

2. **Lancer le frontend** (dans un autre terminal)
   ```bash
   cd front
   npm run dev
   ```

3. **Naviguer dans l'application**
   - Créer un compte ou se connecter
   - Parcourir les produits
   - Ajouter au panier
   - Payer (fake Stripe)
   - Accéder au panel admin (accessible sans vérification !)
