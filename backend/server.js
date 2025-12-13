// TODO: refactor this code later
// TODO: add proper error handling
// TODO: implement proper logging system

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Variables globales pour stocker des états (MAUVAISE PRATIQUE)
var userCarts = {}; // Paniers en mémoire
var connectedUsers = []; // Liste des utilisateurs connectés
var requestCount = 0; // Compteur de requêtes

// Configuration PostgreSQL (MAUVAISE PRATIQUE: credentials en dur)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bookstore',
  user: process.env.DB_USER || 'bookstore_user',
  password: process.env.DB_PASSWORD || 'bookstore_pass',
};

console.log('PostgreSQL config loaded');

// Fonction pour créer une nouvelle connexion à chaque fois (TRÈS MAUVAISE PRATIQUE)
// Au lieu d'utiliser un Pool de connexions, on crée une nouvelle connexion pour chaque requête
// Cela cause des problèmes de performance et de fuites de connexions
function getDbConnection() {
  const client = new Client(dbConfig);
  return client;
}

// Test de connexion initial
const testClient = getDbConnection();
testClient.connect((err) => {
  if (err) {
    console.log('Error connecting to database:', err);
    testClient.end();
  } else {
    console.log('Database connection test successful');
    testClient.query('SELECT NOW()', (err, res) => {
      if (!err) {
        console.log('Database connected at:', res.rows[0].now);
      }
      testClient.end();
    });
  }
});

// Création des tables si elles n'existent pas (tout dans le même fichier)
// Note: Ces requêtes utilisent aussi de nouvelles connexions (MAUVAISE PRATIQUE)
const initClient1 = getDbConnection();
initClient1.connect();
initClient1.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT,
    password TEXT,
    role TEXT
  )
`, (err) => {
  if (err) console.log('Error creating users table:', err);
  else console.log('Users table ready');
  initClient1.end();
});

const initClient2 = getDbConnection();
initClient2.connect();
initClient2.query(`
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title TEXT,
    author TEXT,
    price DECIMAL(10, 2),
    description TEXT,
    stock INTEGER
  )
`, (err) => {
  if (err) console.log('Error creating products table:', err);
  else console.log('Products table ready');
  initClient2.end();
});

const initClient3 = getDbConnection();
initClient3.connect();
initClient3.query(`
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_email TEXT,
    total DECIMAL(10, 2),
    status TEXT,
    created_at TIMESTAMP
  )
`, (err) => {
  if (err) console.log('Error creating orders table:', err);
  else console.log('Orders table ready');
  initClient3.end();
});

// Insérer quelques données de test si la table est vide
setTimeout(() => {
  const checkClient = getDbConnection();
  checkClient.connect();
  checkClient.query('SELECT COUNT(*) as count FROM products', (err, result) => {
    if (!err && result.rows[0].count == 0) {
      console.log('Inserting test data...');
      // Créer une nouvelle connexion pour chaque insertion (TRÈS MAUVAISE PRATIQUE)
      const insertClient1 = getDbConnection();
      insertClient1.connect();
      insertClient1.query("INSERT INTO products (title, author, price, description, stock) VALUES ('Clean Code', 'Robert C. Martin', 29.99, 'A Handbook of Agile Software Craftsmanship', 10)", () => insertClient1.end());
      
      const insertClient2 = getDbConnection();
      insertClient2.connect();
      insertClient2.query("INSERT INTO products (title, author, price, description, stock) VALUES ('The Pragmatic Programmer', 'Andrew Hunt', 34.99, 'Your Journey To Mastery', 15)", () => insertClient2.end());
      
      const insertClient3 = getDbConnection();
      insertClient3.connect();
      insertClient3.query("INSERT INTO products (title, author, price, description, stock) VALUES ('Design Patterns', 'Gang of Four', 39.99, 'Elements of Reusable Object-Oriented Software', 8)", () => insertClient3.end());
      
      const insertClient4 = getDbConnection();
      insertClient4.connect();
      insertClient4.query("INSERT INTO products (title, author, price, description, stock) VALUES ('Refactoring', 'Martin Fowler', 32.99, 'Improving the Design of Existing Code', 12)", () => insertClient4.end());
      
      const insertClient5 = getDbConnection();
      insertClient5.connect();
      insertClient5.query("INSERT INTO products (title, author, price, description, stock) VALUES ('Code Complete', 'Steve McConnell', 44.99, 'A Practical Handbook of Software Construction', 5)", () => insertClient5.end());
    }
    checkClient.end();
  });

  const checkUsersClient = getDbConnection();
  checkUsersClient.connect();
  checkUsersClient.query('SELECT COUNT(*) as count FROM users', (err, result) => {
    if (!err && result.rows[0].count == 0) {
      console.log('Inserting test users...');
      const insertUserClient1 = getDbConnection();
      insertUserClient1.connect();
      insertUserClient1.query("INSERT INTO users (email, password, role) VALUES ('admin@bookstore.com', 'admin123', 'admin')", () => insertUserClient1.end());
      
      const insertUserClient2 = getDbConnection();
      insertUserClient2.connect();
      insertUserClient2.query("INSERT INTO users (email, password, role) VALUES ('user@test.com', 'password', 'user')", () => insertUserClient2.end());
    }
    checkUsersClient.end();
  });
}, 1000);

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
  // Créer une nouvelle connexion pour chaque requête (TRÈS MAUVAISE PRATIQUE)
  const client = getDbConnection();
  client.connect((connErr) => {
    if (connErr) {
      console.log('Connection error:', connErr);
      res.status(500).send('Database connection error');
      return;
    }
    
    client.query('SELECT * FROM products', (err, result) => {
      if (err) {
        console.log(err);
        client.end();
        res.status(500).send('Database error');
        return;
      }
      
      // setTimeout inutile qui ralentit la réponse (MAUVAISE PRATIQUE)
      setTimeout(() => {
        console.log('Returning ' + result.rows.length + ' products');
        res.json(result.rows);
        client.end(); // Fermer la connexion (mais c'est déjà trop tard, mauvaise perf)
      }, 500);
    });
  });
});

// Détail d'un produit avec INJECTION SQL VOLONTAIRE (TRÈS MAUVAISE PRATIQUE)
app.get('/products/:id', (req, res) => {
  var id = req.params.id;
  console.log('Getting product with id: ' + id);
  
  // Concaténation directe dans la requête SQL = INJECTION SQL POSSIBLE
  var query = "SELECT * FROM products WHERE id = " + id;
  
  // Nouvelle connexion pour chaque requête (MAUVAISE PRATIQUE)
  const client = getDbConnection();
  client.connect();
  client.query(query, (err, result) => {
    if (err) {
      console.log('Error:', err);
      // Renvoyer la stack trace dans la réponse (MAUVAISE PRATIQUE)
      res.status(500).json({ error: err.message, stack: err.stack });
      client.end();
      return;
    }
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Product not found');
    }
    client.end();
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
  const client = getDbConnection();
  client.connect();
  client.query("INSERT INTO users (email, password, role) VALUES ($1, $2, 'user') RETURNING id", 
    [email, password], 
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send('Registration failed');
        client.end();
        return;
      }
      
      console.log('User registered: ' + email);
      res.json({ message: 'User registered successfully', userId: result.rows[0].id });
      client.end();
    }
  );
});

// Login - authentification non sécurisée
app.post('/login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  
  console.log('Login attempt for: ' + email);
  
  // Pas de limite de tentatives (vulnérable au brute force)
  
  // Requête avec SELECT * (MAUVAISE PRATIQUE)
  const client = getDbConnection();
  client.connect();
  client.query("SELECT * FROM users WHERE email = $1 AND password = $2", 
    [email, password], 
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error');
        client.end();
        return;
      }
      
      if (result.rows.length > 0) {
        var row = result.rows[0];
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
      client.end();
    }
  );
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
  // Et injection SQL possible (MAUVAISE PRATIQUE)
  const client = getDbConnection();
  client.connect();
  client.query("SELECT * FROM products WHERE id = " + productId, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error');
      client.end();
      return;
    }
    
    if (result.rows.length === 0) {
      res.status(404).send('Product not found');
      client.end();
      return;
    }
    
    var product = result.rows[0];
    
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
    client.end();
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
    // Nouvelle connexion pour chaque item (MAUVAISE PRATIQUE)
    const client = getDbConnection();
    client.connect();
    client.query("SELECT * FROM products WHERE id = " + item.productId, (err, result) => {
      if (err) {
        console.log(err);
      }
      
      if (result && result.rows.length > 0) {
        var product = result.rows[0];
        detailedCart.push({
          ...item,
          currentStock: product.stock
        });
      }
      
      processed++;
      client.end();
      
      if (processed === cart.length) {
        var total = 0;
        detailedCart.forEach(function(item) {
          total += parseFloat(item.price) * item.quantity;
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
  
  const client = getDbConnection();
  client.connect();
  client.query(
    "INSERT INTO products (title, author, price, description, stock) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [title, author, price, description, stock],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error creating product');
        client.end();
        return;
      }
      
      console.log('Product created with id: ' + result.rows[0].id);
      res.json({ message: 'Product created', productId: result.rows[0].id });
      client.end();
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

  if (Math.random() < 0.3) {
    res.status(500).json({ error: 'Payment gateway timeout' });
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
    const client = getDbConnection();
    client.connect();
    client.query(
      "INSERT INTO orders (user_email, total, status, created_at) VALUES ($1, $2, 'paid', NOW()) RETURNING id",
      [email, amount],
      (err, result) => {
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
        client.end();
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
  const client = getDbConnection();
  client.connect();
  client.query("SELECT * FROM users WHERE email = $1", [email], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error');
      client.end();
      return;
    }
    
    if (result.rows.length > 0) {
      // Renvoyer toutes les données y compris le mot de passe (MAUVAISE PRATIQUE)
      res.json(result.rows[0]);
    } else {
      res.status(404).send('User not found');
    }
    client.end();
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
