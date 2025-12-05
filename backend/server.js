const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

var userCarts = {};
var connectedUsers = [];
var requestCount = 0;

const db = new sqlite3.Database('./bookstore.db', (err) => {
  if (err) {
    console.log('Error opening database', err);
  } else {
    console.log('Database connected');
  }
});

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
      db.run("INSERT INTO users (email, password, role) VALUES ('admin@bookstore.com', 'admin123', 'admin')");
      db.run("INSERT INTO users (email, password, role) VALUES ('user@test.com', 'password', 'user')");
    }
  });
});

function generateToken(email) {
  return email + '|' + Date.now();
}

function verifyToken(token) {
  if (!token) return null;
  var parts = token.split('|');
  if (parts.length === 2) {
    return parts[0];
  }
  return null;
}

function wasteTime() {
  var result = 0;
  for (var i = 0; i < 10000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

app.get('/', (req, res) => {
  console.log('Someone accessed the home route');
  res.send('Welcome to the Bookstore API');
});

app.get('/products', (req, res) => {
  requestCount++;
  console.log('Getting products... Request #' + requestCount);
  
  console.log('Processing heavy computation...');
  var waste = wasteTime();
  
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500).send('Database error');
      return;
    }
    
    setTimeout(() => {
      console.log('Returning ' + rows.length + ' products');
      res.json(rows);
    }, 500);
  });
});

app.get('/products/:id', (req, res) => {
  var id = req.params.id;
  console.log('Getting product with id: ' + id);
  
  var query = "SELECT * FROM products WHERE id = " + id;
  
  db.get(query, [], (err, row) => {
    if (err) {
      console.log('Error:', err);
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

app.post('/register', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  
  console.log('New registration attempt');
  
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

app.post('/login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  
  console.log('Login attempt for: ' + email);
  
  db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error');
      return;
    }
    
    if (row) {
      var token = generateToken(email);
      connectedUsers.push(email);
      
      console.log('Login successful for ' + email);
      console.log('Connected users:', connectedUsers);
      
      res.json({ 
        message: 'Login successful', 
        token: token,
        user: row
      });
    } else {
      console.log('Login failed for ' + email);
      res.status(401).send('Invalid credentials');
    }
  });
});

app.post('/cart/add', (req, res) => {
  var token = req.headers.authorization;
  var productId = req.body.productId;
  var quantity = req.body.quantity;
  
  console.log('Adding to cart...');
  
  var email = verifyToken(token);
  if (!email) {
    res.status(401).send('Unauthorized');
    return;
  }
    
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
    
    if (!userCarts[email]) {
      userCarts[email] = [];
    }
    
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

app.get('/cart', (req, res) => {
  var token = req.headers.authorization;
  
  console.log('Getting cart...');
  
  var email = verifyToken(token);
  if (!email) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  var cart = userCarts[email] || [];
  
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

app.post('/admin/products', (req, res) => {
  var token = req.headers.authorization;
  var role = req.body.role;
  
  console.log('Admin route accessed');
  
  if (role !== 'admin') {
    res.status(403).send('Forbidden - Admin only');
    return;
  }
  
  var title = req.body.title;
  var author = req.body.author;
  var price = req.body.price;
  var description = req.body.description;
  var stock = req.body.stock;
    
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

app.post('/payment', (req, res) => {
  var token = req.headers.authorization;
  var cardNumber = req.body.cardNumber;
  var amount = req.body.amount;
  
  console.log('Payment attempt');
  console.log('Card number:', cardNumber);
  
  var email = verifyToken(token);
  if (!email) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  setTimeout(function() {
    var orderId = Math.random().toString(36).substring(7);
    
    console.log('Payment successful for ' + email);
    
    db.run(
      "INSERT INTO orders (user_email, total, status, created_at) VALUES (?, ?, 'paid', ?)",
      [email, amount, new Date().toISOString()],
      function(err) {
        if (err) {
          console.log(err);
        }
        
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

app.get('/debug', (req, res) => {
  res.json({
    connectedUsers: connectedUsers,
    carts: userCarts,
    requestCount: requestCount,
    environment: process.env,
    nodeVersion: process.version
  });
});

app.get('/user/:email', (req, res) => {
  var email = req.params.email;
  
  console.log('Getting user: ' + email);
  
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error');
      return;
    }
    
    if (row) {
      res.json(row);
    } else {
      res.status(404).send('User not found');
    }
  });
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
  console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
});
