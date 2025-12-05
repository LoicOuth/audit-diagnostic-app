const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('=== Database Seeding Script ===');
console.log('Starting...\n');

const db = new sqlite3.Database('./bookstore.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✓ Connected to bookstore.db');
});

const NUM_PRODUCTS = 10000;
const NUM_ORDERS = 5000;

const bookPrefixes = [
  'Introduction to', 'Advanced', 'Mastering', 'Learning', 'Complete Guide to',
  'Essential', 'Professional', 'Beginning', 'Expert', 'Practical',
  'Modern', 'Ultimate', 'Comprehensive', 'Fundamentals of', 'Deep Dive into'
];

const bookSubjects = [
  'JavaScript', 'Python', 'Java', 'Web Development', 'Data Science',
  'Machine Learning', 'DevOps', 'Cloud Computing', 'Cybersecurity',
  'Software Architecture', 'Algorithms', 'Database Design', 'React',
  'Vue.js', 'Node.js', 'TypeScript', 'Kubernetes', 'Docker',
  'Agile', 'Scrum', 'UX Design', 'Mobile Development', 'AI',
  'Blockchain', 'Game Development', 'Testing', 'Microservices'
];

const authorFirstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert',
  'Lisa', 'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Linda',
  'Thomas', 'Patricia', 'Charles', 'Barbara', 'Daniel', 'Susan'
];

const authorLastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson',
  'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'
];

const userEmails = [
  'user@test.com',
  'admin@bookstore.com',
  'john.doe@example.com',
  'jane.smith@example.com',
  'alice.wonder@example.com'
];

const orderStatuses = ['paid', 'pending', 'cancelled'];

const htmlDescriptions = [
  '<b>Bestseller!</b> A comprehensive guide covering all aspects of the subject.',
  '<i>Perfect for beginners</i> - Step by step instructions with real-world examples.',
  'Learn from industry experts. <b>Updated for 2024!</b>',
  '<b>Top rated</b> by thousands of readers. Includes practical exercises.',
  'Master the fundamentals with this <i>highly acclaimed</i> book.',
  '<b>Essential reading</b> for professionals. <i>In-depth coverage</i> of advanced topics.',
  'Practical guide with <b>hands-on projects</b>. Perfect for self-learning.',
  '<i>Award-winning book</i> covering everything you need to know.'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateBookTitle(index) {
  const prefix = randomElement(bookPrefixes);
  const subject = randomElement(bookSubjects);
  const edition = randomInt(1, 5);
  return `${prefix} ${subject} - Edition ${edition} #${index}`;
}

function generateAuthorName() {
  const firstName = randomElement(authorFirstNames);
  const lastName = randomElement(authorLastNames);
  return `${firstName} ${lastName}`;
}

function generateRandomDate() {
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
  return new Date(randomTime).toISOString();
}

db.serialize(() => {
  console.log('\n--- Step 1: Cleaning existing data ---');
  
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('Error deleting products:', err.message);
    } else {
      console.log('✓ Cleared products table');
    }
  });

  db.run('DELETE FROM orders', (err) => {
    if (err) {
      console.error('Error deleting orders:', err.message);
    } else {
      console.log('✓ Cleared orders table');
    }
  });

  db.run('DELETE FROM users', (err) => {
    if (err) {
      console.error('Error deleting users:', err.message);
    } else {
      console.log('✓ Cleared users table');
    }
  });

  console.log('\n--- Step 2: Creating test users ---');
  const insertUser = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
  
  insertUser.run('admin@bookstore.com', 'admin123', 'admin');
  insertUser.run('user@test.com', 'password', 'user');
  insertUser.run('john.doe@example.com', 'password123', 'user');
  insertUser.run('jane.smith@example.com', 'mypassword', 'user');
  insertUser.run('alice.wonder@example.com', 'alice2024', 'user');
  
  insertUser.finalize((err) => {
    if (err) {
      console.error('Error inserting users:', err.message);
    } else {
      console.log('✓ Created 5 test users');
    }
  });

  console.log('\n--- Step 3: Inserting products ---');
  console.log(`Generating ${NUM_PRODUCTS} products...`);
  
  const insertProduct = db.prepare(
    'INSERT INTO products (title, author, price, description, stock) VALUES (?, ?, ?, ?, ?)'
  );

  let productsInserted = 0;
  const startTime = Date.now();

  for (let i = 1; i <= NUM_PRODUCTS; i++) {
    const title = generateBookTitle(i);
    const author = generateAuthorName();
    const price = randomFloat(5, 100);
    const description = randomElement(htmlDescriptions);
    const stock = randomInt(0, 50);

    insertProduct.run(title, author, price, description, stock, (err) => {
      if (err) {
        console.error(`Error inserting product ${i}:`, err.message);
      }
      productsInserted++;

      if (productsInserted % 1000 === 0) {
        console.log(`  → ${productsInserted}/${NUM_PRODUCTS} products inserted...`);
      }
    });
  }

  insertProduct.finalize((err) => {
    if (err) {
      console.error('Error finalizing product insertion:', err.message);
    } else {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✓ Inserted ${NUM_PRODUCTS} products in ${duration}s`);
    }
  });

  console.log('\n--- Step 4: Inserting orders ---');
  console.log(`Generating ${NUM_ORDERS} orders...`);

  const insertOrder = db.prepare(
    'INSERT INTO orders (user_email, total, status, created_at) VALUES (?, ?, ?, ?)'
  );

  let ordersInserted = 0;
  const startTimeOrders = Date.now();

  for (let i = 1; i <= NUM_ORDERS; i++) {
    const userEmail = randomElement(userEmails);
    const total = randomFloat(10, 300);
    const status = randomElement(orderStatuses);
    const createdAt = generateRandomDate();

    insertOrder.run(userEmail, total, status, createdAt, (err) => {
      if (err) {
        console.error(`Error inserting order ${i}:`, err.message);
      }
      ordersInserted++;

      if (ordersInserted % 500 === 0) {
        console.log(`  → ${ordersInserted}/${NUM_ORDERS} orders inserted...`);
      }
    });
  }

  insertOrder.finalize((err) => {
    if (err) {
      console.error('Error finalizing order insertion:', err.message);
    } else {
      const duration = ((Date.now() - startTimeOrders) / 1000).toFixed(2);
      console.log(`✓ Inserted ${NUM_ORDERS} orders in ${duration}s`);
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('\n✓ Database connection closed');
    console.log('\n=== Seeding Complete! ===');
    console.log(`\nSummary:`);
    console.log(`  - Users: 5`);
    console.log(`  - Products: ${NUM_PRODUCTS}`);
    console.log(`  - Orders: ${NUM_ORDERS}`);
    console.log('\nYou can now start your server with: node server.js\n');
  }
});
