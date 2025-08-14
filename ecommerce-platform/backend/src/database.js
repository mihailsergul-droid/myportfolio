const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL,
    image TEXT,
    description TEXT
  )`);

  // Orders table
  db.run(`CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Order items table
  db.run(`CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  // Insert sample data
  const stmt = db.prepare("INSERT INTO products (name, price, category, stock, description) VALUES (?, ?, ?, ?, ?)");
  stmt.run("Laptop Pro", 1299, "Electronics", 10, "High-performance laptop");
  stmt.run("Smartphone X", 699, "Electronics", 25, "Latest smartphone");
  stmt.run("Wireless Headphones", 199, "Electronics", 50, "Premium audio quality");
  stmt.run("Programming Book", 49, "Books", 100, "Learn modern development");
  stmt.finalize();
});

module.exports = db;