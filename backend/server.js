const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

var userCarts = {};
var connectedUsers = [];
var requestCount = 0;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bookstore',
  user: process.env.DB_USER || 'bookstore_user',
  password: process.env.DB_PASSWORD || 'bookstore_pass',
};

function getDbConnection() {
  const client = new Client(dbConfig);
  return client;
}

const testClient = getDbConnection();
testClient.connect((err) => {
  if (err) {
    testClient.end();
  } else {
    testClient.query('SELECT NOW()', (err, res) => {
      testClient.end();
    });
  }
});

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
  initClient3.end();
});

setTimeout(() => {
  const checkClient = getDbConnection();
  checkClient.connect();
  checkClient.query('SELECT COUNT(*) as count FROM products', (err, result) => {
    if (!err && result.rows[0].count == 0) {
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
  res.send('Welcome to the Bookstore API');
});

app.get('/products', (req, res) => {
  requestCount++;
  var waste = wasteTime();
  const client = getDbConnection();
  client.connect((connErr) => {
    if (connErr) {
      res.status(500).send('Database connection error');
      return;
    }
    client.query('SELECT * FROM products', (err, result) => {
      if (err) {
        client.end();
        res.status(500).send('Database error');
        return;
      }
      setTimeout(() => {
        res.json(result.rows);
        client.end();
      }, 500);
    });
  });
});

app.get('/products/:id', (req, res) => {
  var id = req.params.id;
  var query = "SELECT * FROM products WHERE id = " + id;
  const client = getDbConnection();
  client.connect();
  client.query(query, (err, result) => {
    if (err) {
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

app.post('/register', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  const client = getDbConnection();
  client.connect();
  client.query("INSERT INTO users (email, password, role) VALUES ($1, $2, 'user') RETURNING id", 
    [email, password], 
    (err, result) => {
      if (err) {
        res.status(400).send('Registration failed');
        client.end();
        return;
      }
      res.json({ message: 'User registered successfully', userId: result.rows[0].id });
      client.end();
    }
  );
});

app.post('/login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  const client = getDbConnection();
  client.connect();
  client.query("SELECT * FROM users WHERE email = $1 AND password = $2", 
    [email, password], 
    (err, result) => {
      if (err) {
        res.status(500).send('Error');
        client.end();
        return;
      }
      if (result.rows.length > 0) {
        var row = result.rows[0];
        var token = generateToken(email);
        connectedUsers.push(email);
        res.json({ 
          message: 'Login successful', 
          token: token,
          user: row
        });
      } else {
        res.status(401).send('Invalid credentials');
      }
      client.end();
    }
  );
});

app.post('/cart/add', (req, res) => {
  var token = req.headers.authorization;
  var productId = req.body.productId;
  var quantity = req.body.quantity;
  var email = verifyToken(token);
  if (!email) {
    res.status(401).send('Unauthorized');
    return;
  }
  const client = getDbConnection();
  client.connect();
  client.query("SELECT * FROM products WHERE id = " + productId, (err, result) => {
    if (err) {
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
    if (!userCarts[email]) {
      userCarts[email] = [];
    }
    userCarts[email].push({
      productId: productId,
      quantity: quantity,
      price: product.price,
      title: product.title
    });
    res.json({ message: 'Product added to cart', cart: userCarts[email] });
    client.end();
  });
});

app.get('/cart', (req, res) => {
  var token = req.headers.authorization;
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
    const client = getDbConnection();
    client.connect();
    client.query("SELECT * FROM products WHERE id = " + item.productId, (err, result) => {
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

app.post('/admin/products', (req, res) => {
  var token = req.headers.authorization;
  var role = req.body.role;
  if (role !== 'admin') {
    res.status(403).send('Forbidden - Admin only');
    return;
  }
  var title = req.body.title;
  var author = req.body.author;
  var price = req.body.price;
  var description = req.body.description;
  var stock = req.body.stock;
  const client = getDbConnection();
  client.connect();
  client.query(
    "INSERT INTO products (title, author, price, description, stock) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [title, author, price, description, stock],
    (err, result) => {
      if (err) {
        res.status(500).send('Error creating product');
        client.end();
        return;
      }
      res.json({ message: 'Product created', productId: result.rows[0].id });
      client.end();
    }
  );
});

app.post('/payment', (req, res) => {
  var token = req.headers.authorization;
  var cardNumber = req.body.cardNumber;
  var amount = req.body.amount;
  var email = verifyToken(token);
  if (!email) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  // Simuler une erreur aléatoire (MAUVAISE PRATIQUE pour montrer l'instabilité)
  if (Math.random() < 0.3) {
    res.status(500).json({ error: 'Payment gateway timeout' });
    return;
  }
  
  setTimeout(function() {
    var orderId = Math.random().toString(36).substring(7);
    const client = getDbConnection();
    client.connect();
    client.query(
      "INSERT INTO orders (user_email, total, status, created_at) VALUES ($1, $2, 'paid', NOW()) RETURNING id",
      [email, amount],
      (err, result) => {
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
  const client = getDbConnection();
  client.connect();
  client.query("SELECT * FROM users WHERE email = $1", [email], (err, result) => {
    if (err) {
      res.status(500).send('Error');
      client.end();
      return;
    }
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('User not found');
    }
    client.end();
  });
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
