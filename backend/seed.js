// Script pour remplir la base de données PostgreSQL avec beaucoup de données de test
// Usage: node seed.js

const { Pool } = require('pg');

console.log('=== Database Seeding Script (PostgreSQL) ===');
console.log('Starting...\n');

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bookstore',
  user: process.env.DB_USER || 'bookstore_user',
  password: process.env.DB_PASSWORD || 'bookstore_pass',
});

console.log('✓ Connected to PostgreSQL');

// Configuration
const NUM_PRODUCTS = 10000;
const NUM_ORDERS = 5000;

// Données pour la génération aléatoire
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

// Fonctions utilitaires
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
  // Date aléatoire dans les 2 dernières années
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
  return new Date(randomTime).toISOString();
}

// Fonction principale de seeding
async function seed() {
  try {
    console.log('\n--- Step 1: Cleaning existing data ---');
    
    // Supprimer les données existantes (mais garder les tables)
    await pool.query('DELETE FROM products');
    console.log('✓ Cleared products table');
    
    await pool.query('DELETE FROM orders');
    console.log('✓ Cleared orders table');
    
    await pool.query('DELETE FROM users');
    console.log('✓ Cleared users table');

    // Insérer quelques utilisateurs de test
    console.log('\n--- Step 2: Creating test users ---');
    
    await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", 
      ['admin@bookstore.com', 'admin123', 'admin']);
    await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", 
      ['user@test.com', 'password', 'user']);
    await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", 
      ['john.doe@example.com', 'password123', 'user']);
    await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", 
      ['jane.smith@example.com', 'mypassword', 'user']);
    await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", 
      ['alice.wonder@example.com', 'alice2024', 'user']);
    
    console.log('✓ Created 5 test users');

    // Insérer les produits (livres) par batch pour de meilleures performances
    console.log('\n--- Step 3: Inserting products ---');
    console.log(`Generating ${NUM_PRODUCTS} products...`);
    
    const startTime = Date.now();
    const BATCH_SIZE = 500;
    let productsInserted = 0;

    for (let batch = 0; batch < Math.ceil(NUM_PRODUCTS / BATCH_SIZE); batch++) {
      const batchStart = batch * BATCH_SIZE;
      const batchEnd = Math.min((batch + 1) * BATCH_SIZE, NUM_PRODUCTS);
      
      // Construire une requête avec plusieurs VALUES
      const values = [];
      const params = [];
      let paramIndex = 1;

      for (let i = batchStart; i < batchEnd; i++) {
        const title = generateBookTitle(i + 1);
        const author = generateAuthorName();
        const price = randomFloat(5, 100);
        const description = randomElement(htmlDescriptions);
        const stock = randomInt(0, 50);

        values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`);
        params.push(title, author, price, description, stock);
        paramIndex += 5;
      }

      const query = `INSERT INTO products (title, author, price, description, stock) VALUES ${values.join(', ')}`;
      await pool.query(query, params);
      
      productsInserted = batchEnd;
      console.log(`  → ${productsInserted}/${NUM_PRODUCTS} products inserted...`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✓ Inserted ${NUM_PRODUCTS} products in ${duration}s`);

    // Insérer les commandes
    console.log('\n--- Step 4: Inserting orders ---');
    console.log(`Generating ${NUM_ORDERS} orders...`);

    const startTimeOrders = Date.now();
    let ordersInserted = 0;

    for (let batch = 0; batch < Math.ceil(NUM_ORDERS / BATCH_SIZE); batch++) {
      const batchStart = batch * BATCH_SIZE;
      const batchEnd = Math.min((batch + 1) * BATCH_SIZE, NUM_ORDERS);
      
      const values = [];
      const params = [];
      let paramIndex = 1;

      for (let i = batchStart; i < batchEnd; i++) {
        const userEmail = randomElement(userEmails);
        const total = randomFloat(10, 300);
        const status = randomElement(orderStatuses);
        const createdAt = generateRandomDate();

        values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`);
        params.push(userEmail, total, status, createdAt);
        paramIndex += 4;
      }

      const query = `INSERT INTO orders (user_email, total, status, created_at) VALUES ${values.join(', ')}`;
      await pool.query(query, params);
      
      ordersInserted = batchEnd;
      console.log(`  → ${ordersInserted}/${NUM_ORDERS} orders inserted...`);
    }

    const durationOrders = ((Date.now() - startTimeOrders) / 1000).toFixed(2);
    console.log(`✓ Inserted ${NUM_ORDERS} orders in ${durationOrders}s`);

    console.log('\n✓ Database seeding complete!');
    console.log('\n=== Seeding Complete! ===');
    console.log(`\nSummary:`);
    console.log(`  - Users: 5`);
    console.log(`  - Products: ${NUM_PRODUCTS}`);
    console.log(`  - Orders: ${NUM_ORDERS}`);
    console.log('\nYou can now start your server with: node server.js\n');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    // Fermer la connexion
    await pool.end();
    console.log('✓ Database connection closed');
  }
}

// Exécuter le seeding
seed();
