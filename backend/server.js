// TODO: refactor this code later
// TODO: add proper error handling
// TODO: implement proper logging system

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Variables globales pour stocker des états (MAUVAISE PRATIQUE)
var userCarts = {}; // Paniers en mémoire
var connectedUsers = []; // Liste des utilisateurs connectés
var requestCount = 0; // Compteur de requêtes

// Initialisation de la base de données SQLite
const db = new sqlite3.Database('./bookstore.db', (err) => {
  if (err) {
    console.log('Error opening database', err);
  } else {
    console.log('Database connected');
  }
});

// Création des tables si elles n'existent pas (tout dans le même fichier)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    price REAL,
    description TEXT,
    stock INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    total REAL,
    status TEXT,
    created_at TEXT
  )`);

  // Insérer quelques données de test
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (row.count === 0) {
      console.log('Inserting test data...');
      db.run("INSERT INTO products (title, author, price, description, stock) VALUES ('Clean Code', 'Robert C. Martin', 29.99, 'A Handbook of Agile Software Craftsmanship', 10)");
      db.run("INSERT INTO products (title, author, price, description, stock) VALUES ('The Pragmatic Programmer', 'Andrew Hunt', 34.99, 'Your Journey To Mastery', 15)");
      db.run("INSERT INTO products (title, author, price, description, stock) VALUES ('Design Patterns', 'Gang of Four', 39.99, 'Elements of Reusable Object-Oriented Software', 8)");
      db.run("INSERT INTO products (title, author, price, description, stock) VALUES ('Refactoring', 'Martin Fowler', 32.99, 'Improving the Design of Existing Code', 12)");
      db.run("INSERT INTO products (title, author, price, description, stock) VALUES ('Code Complete', 'Steve McConnell', 44.99, 'A Practical Handbook of Software Construction', 5)");
    }
  });

  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row.count === 0) {
      // Ajouter un utilisateur admin avec mot de passe en clair (MAUVAISE PRATIQUE)
      db.run("INSERT INTO users (email, password, role) VALUES ('admin@bookstore.com', 'admin123', 'admin')");
      db.run("INSERT INTO users (email, password, role) VALUES ('user@test.com', 'password', 'user')");
    }
  });
});

// Fonction utilitaire pour générer un token maison (TRÈS MAUVAISE PRATIQUE)
function generateToken(email) {
  // Token super simple : email + timestamp
  return email + '|' + Date.now();
}

// Fonction pour vérifier le token (naïve et non sécurisée)
function verifyToken(token) {
  if (!token) return null;
  var parts = token.split('|');
  if (parts.length === 2) {
    return parts[0]; // Retourne l'email
  }
  return null;
}

// Simulation de charge CPU inutile (pour ralentir les performances)
function wasteTime() {
  var result = 0;
  for (var i = 0; i < 10000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

// ============= ROUTES =============

// Route de base
app.get('/', (req, res) => {
  console.log('Someone accessed the home route');
  res.send('Welcome to the Bookstore API');
});

// Liste des produits avec SELECT * et charge CPU inutile
app.get('/products', (req, res) => {
  requestCount++;
  console.log('Getting products... Request #' + requestCount);
  
  // Simulation de charge CPU inutile (MAUVAISE PRATIQUE)
  console.log('Processing heavy computation...');
  var waste = wasteTime();
  
  // SELECT * sans filtre (MAUVAISE PRATIQUE)
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500).send('Database error');
      return;
    }
    
    // setTimeout inutile qui ralentit la réponse (MAUVAISE PRATIQUE)
    setTimeout(() => {
      console.log('Returning ' + rows.length + ' products');
      res.json(rows);
    }, 500);
  });
});

// Détail d'un produit avec INJECTION SQL VOLONTAIRE (TRÈS MAUVAISE PRATIQUE)
app.get('/products/:id', (req, res) => {
  var id = req.params.id;
  console.log('Getting product with id: ' + id);
  
  // Concaténation directe dans la requête SQL = INJECTION SQL POSSIBLE
  var query = "SELECT * FROM products WHERE id = " + id;
  
  db.get(query, [], (err, row) => {
    if (err) {
      console.log('Error:', err);
      // Renvoyer la stack trace dans la réponse (MAUVAISE PRATIQUE)
      res.status(500).json({ error: err.message, stack: err.stack });
      return;
    }
    
    if (row) {
      res.json(row);
    } else {
      res.status(404).send('Product not found');
    }
  });
});

// Register - mot de passe en clair (MAUVAISE PRATIQUE)
app.post('/register', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  
  console.log('New registration attempt');
  
  // Aucune validation des entrées (MAUVAISE PRATIQUE)
  // Pas de vérification si l'utilisateur existe déjà
  
  // Stockage du mot de passe en clair (TRÈS MAUVAISE PRATIQUE)
  db.run("INSERT INTO users (email, password, role) VALUES (?, ?, 'user')", [email, password], function(err) {
    if (err) {
      console.log(err);
      res.status(400).send('Registration failed');
      return;
    }
    
    console.log('User registered: ' + email);
    res.json({ message: 'User registered successfully', userId: this.lastID });
  });
});

// Login - authentification non sécurisée
app.post('/login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  
  console.log('Login attempt for: ' + email);
  
  // Pas de limite de tentatives (vulnérable au brute force)
  
  // Requête avec SELECT * (MAUVAISE PRATIQUE)
  db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error');
      return;
    }
    
    if (row) {
      // Générer un token maison non sécurisé (MAUVAISE PRATIQUE)
      var token = generateToken(email);
      connectedUsers.push(email);
      
      console.log('Login successful for ' + email);
      console.log('Connected users:', connectedUsers);
      
      res.json({ 
        message: 'Login successful', 
        token: token,
        user: row // Renvoyer toutes les données utilisateur y compris le mot de passe (MAUVAISE PRATIQUE)
      });
    } else {
      console.log('Login failed for ' + email);
      res.status(401).send('Invalid credentials');
    }
  });
});

// Ajouter au panier - stockage en mémoire volatile
app.post('/cart/add', (req, res) => {
  var token = req.headers.authorization;
  var productId = req.body.productId;
  var quantity = req.body.quantity;
  
  console.log('Adding to cart...');
  
  // Vérification du token très basique
  var email = verifyToken(token);
  if (!email) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  // Pas de validation de la quantité (MAUVAISE PRATIQUE)
  
  // Requête N+1 : on fait une requête pour chaque produit (MAUVAISE PRATIQUE)
  db.get("SELECT * FROM products WHERE id = " + productId, [], (err, product) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error');
      return;
    }
    
    if (!product) {
      res.status(404).send('Product not found');
      return;
    }
    
    // Initialiser le panier si nécessaire
    if (!userCarts[email]) {
      userCarts[email] = [];
    }
    
    // Ajouter au panier (en mémoire, sera perdu au redémarrage)
    userCarts[email].push({
      productId: productId,
      quantity: quantity,
      price: product.price,
      title: product.title
    });
    
    console.log('Cart for ' + email + ':', userCarts[email]);
    
    res.json({ message: 'Product added to cart', cart: userCarts[email] });
  });
});

// Voir le panier avec requêtes N+1
app.get('/cart', (req, res) => {
  var token = req.headers.authorization;
  
  console.log('Getting cart...');
  
  var email = verifyToken(token);
  if (!email) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  var cart = userCarts[email] || [];
  
  // Problème N+1 : on refait une requête DB pour chaque item du panier (MAUVAISE PRATIQUE)
  var detailedCart = [];
  var processed = 0;
  
  if (cart.length === 0) {
    res.json({ cart: [] });
    return;
  }
  
  cart.forEach(function(item) {
    db.get("SELECT * FROM products WHERE id = " + item.productId, [], (err, product) => {
      if (err) {
        console.log(err);
      }
      
      if (product) {
        detailedCart.push({
          ...item,
          currentStock: product.stock
        });
      }
      
      processed++;
      
      if (processed === cart.length) {
        var total = 0;
        detailedCart.forEach(function(item) {
          total += item.price * item.quantity;
        });
        
        res.json({ cart: detailedCart, total: total });
      }
    });
  });
});

// Route admin pour créer un produit - protection naïve
app.post('/admin/products', (req, res) => {
  var token = req.headers.authorization;
  var role = req.body.role; // Role passé dans le body (TRÈS MAUVAISE PRATIQUE)
  
  console.log('Admin route accessed');
  
  // Vérification ultra naïve du rôle (MAUVAISE PRATIQUE)
  if (role !== 'admin') {
    res.status(403).send('Forbidden - Admin only');
    return;
  }
  
  var title = req.body.title;
  var author = req.body.author;
  var price = req.body.price;
  var description = req.body.description;
  var stock = req.body.stock;
  
  // Aucune validation des données (MAUVAISE PRATIQUE)
  
  db.run(
    "INSERT INTO products (title, author, price, description, stock) VALUES (?, ?, ?, ?, ?)",
    [title, author, price, description, stock],
    function(err) {
      if (err) {
        console.log(err);
        res.status(500).send('Error creating product');
        return;
      }
      
      console.log('Product created with id: ' + this.lastID);
      res.json({ message: 'Product created', productId: this.lastID });
    }
  );
});

// Endpoint de paiement avec faux Stripe
app.post('/payment', (req, res) => {
  var token = req.headers.authorization;
  var cardNumber = req.body.cardNumber;
  var amount = req.body.amount;
  
  console.log('Payment attempt');
  console.log('Card number:', cardNumber); // Logger les données sensibles (MAUVAISE PRATIQUE)
  
  var email = verifyToken(token);
  if (!email) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  // Pas de validation du numéro de carte (MAUVAISE PRATIQUE)
  // Pas de vérification du montant (MAUVAISE PRATIQUE)
  
  // Simulation d'appel à Stripe avec setTimeout
  setTimeout(function() {
    // Toujours accepter le paiement (faux Stripe)
    var orderId = Math.random().toString(36).substring(7);
    
    console.log('Payment successful for ' + email);
    
    // Enregistrer la commande
    db.run(
      "INSERT INTO orders (user_email, total, status, created_at) VALUES (?, ?, 'paid', ?)",
      [email, amount, new Date().toISOString()],
      function(err) {
        if (err) {
          console.log(err);
        }
        
        // Vider le panier
        userCarts[email] = [];
        
        res.json({ 
          message: 'Payment successful', 
          orderId: orderId,
          chargedAmount: amount 
        });
      }
    );
  }, 1000);
});

// Route de debug qui expose des informations sensibles (MAUVAISE PRATIQUE)
app.get('/debug', (req, res) => {
  res.json({
    connectedUsers: connectedUsers,
    carts: userCarts,
    requestCount: requestCount,
    environment: process.env,
    nodeVersion: process.version
  });
});

// Route avec duplication de code pour chercher un utilisateur
app.get('/user/:email', (req, res) => {
  var email = req.params.email;
  
  console.log('Getting user: ' + email);
  
  // Même logique que dans login mais dupliquée (MAUVAISE PRATIQUE)
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error');
      return;
    }
    
    if (row) {
      // Renvoyer toutes les données y compris le mot de passe (MAUVAISE PRATIQUE)
      res.json(row);
    } else {
      res.status(404).send('User not found');
    }
  });
});

// Pas de middleware de gestion d'erreurs centralisé
// Pas de gestion des routes inexistantes

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
  console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
});

// Pas de gestion propre de l'arrêt du serveur
// Pas de fermeture de la connexion DB
