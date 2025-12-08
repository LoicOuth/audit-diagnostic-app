-- Script d'initialisation PostgreSQL pour la base bookstore
-- Ce script est exécuté automatiquement au premier démarrage du container PostgreSQL

-- Création des tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances (même si on garde du code "mauvais")
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_id ON products(id);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);

-- Insérer quelques utilisateurs de test avec mots de passe en clair (MAUVAISE PRATIQUE)
INSERT INTO users (email, password, role) VALUES 
    ('admin@bookstore.com', 'admin123', 'admin'),
    ('user@test.com', 'password', 'user'),
    ('john.doe@example.com', 'password123', 'user'),
    ('jane.smith@example.com', 'mypassword', 'user'),
    ('alice.wonder@example.com', 'alice2024', 'user')
ON CONFLICT DO NOTHING;

-- Insérer quelques produits de test
INSERT INTO products (title, author, price, description, stock) VALUES 
    ('Clean Code', 'Robert C. Martin', 29.99, '<b>A Handbook of Agile Software Craftsmanship</b>', 10),
    ('The Pragmatic Programmer', 'Andrew Hunt', 34.99, '<i>Your Journey To Mastery</i>', 15),
    ('Design Patterns', 'Gang of Four', 39.99, 'Elements of Reusable Object-Oriented Software', 8),
    ('Refactoring', 'Martin Fowler', 32.99, '<b>Improving the Design of Existing Code</b>', 12),
    ('Code Complete', 'Steve McConnell', 44.99, 'A Practical Handbook of Software Construction', 5),
    ('JavaScript: The Good Parts', 'Douglas Crockford', 24.99, '<i>Unearthing the Excellence in JavaScript</i>', 20),
    ('You Don''t Know JS', 'Kyle Simpson', 39.99, '<b>ES6 & Beyond</b>', 18),
    ('Eloquent JavaScript', 'Marijn Haverbeke', 32.99, 'A Modern Introduction to Programming', 25)
ON CONFLICT DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully!';
    RAISE NOTICE 'Tables created: users, products, orders';
    RAISE NOTICE 'Test data inserted';
END $$;
