const { Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bookstore',
  user: process.env.DB_USER || 'bookstore_user',
  password: process.env.DB_PASSWORD || 'bookstore_pass',
};

const pool = new Pool(dbConfig);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Database connected successfully');
  }
});

async function initializeTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT,
        password TEXT,
        role TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title TEXT,
        author TEXT,
        price DECIMAL(10, 2),
        description TEXT,
        stock INTEGER
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_email TEXT,
        total DECIMAL(10, 2),
        status TEXT,
        created_at TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS request_logs (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW(),
        route TEXT,
        method TEXT,
        status_code INTEGER,
        duration_ms INTEGER,
        error_message TEXT
      )
    `);

    console.log('All tables initialized successfully');

    setTimeout(async () => {
      try {
        const productsCount = await pool.query('SELECT COUNT(*) as count FROM products');
        if (productsCount.rows[0].count == 0) {
          await pool.query("INSERT INTO products (title, author, price, description, stock) VALUES ('Clean Code', 'Robert C. Martin', 29.99, 'A Handbook of Agile Software Craftsmanship', 10)");
          await pool.query("INSERT INTO products (title, author, price, description, stock) VALUES ('The Pragmatic Programmer', 'Andrew Hunt', 34.99, 'Your Journey To Mastery', 15)");
          await pool.query("INSERT INTO products (title, author, price, description, stock) VALUES ('Design Patterns', 'Gang of Four', 39.99, 'Elements of Reusable Object-Oriented Software', 8)");
          await pool.query("INSERT INTO products (title, author, price, description, stock) VALUES ('Refactoring', 'Martin Fowler', 32.99, 'Improving the Design of Existing Code', 12)");
          await pool.query("INSERT INTO products (title, author, price, description, stock) VALUES ('Code Complete', 'Steve McConnell', 44.99, 'A Practical Handbook of Software Construction', 5)");
          console.log('Products seeded successfully');
        }

        const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
        if (usersCount.rows[0].count == 0) {
          await pool.query("INSERT INTO users (email, password, role) VALUES ('admin@bookstore.com', 'admin123', 'admin')");
          await pool.query("INSERT INTO users (email, password, role) VALUES ('user@test.com', 'password', 'user')");
          console.log('Users seeded successfully');
        }
      } catch (err) {
        console.error('Error seeding data:', err);
      }
    }, 1000);

  } catch (err) {
    console.error('Error initializing tables:', err);
  }
}

initializeTables();

module.exports = pool;
