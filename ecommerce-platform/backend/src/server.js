const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { generateToken, verifyToken, requireAdmin, users } = require('./auth');
const { coupons, validateCoupon } = require('./coupons');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Mock data
let products = [
  { id: 1, name: 'Laptop Pro', price: 1299, category: 'Electronics', stock: 10, description: 'High-performance laptop' },
  { id: 2, name: 'Smartphone X', price: 699, category: 'Electronics', stock: 25, description: 'Latest smartphone' },
  { id: 3, name: 'Wireless Headphones', price: 199, category: 'Electronics', stock: 50, description: 'Premium audio quality' },
  { id: 4, name: 'Programming Book', price: 49, category: 'Books', stock: 100, description: 'Learn modern development' }
];

let orders = [];
let nextProductId = 5;
let nextOrderId = 1;

// Auth API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// Products API
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', verifyToken, requireAdmin, (req, res) => {
  const { name, price, category, stock, description } = req.body;
  const product = { id: nextProductId++, name, price, category, stock, description };
  products.push(product);
  res.json(product);
});

app.put('/api/products/:id', verifyToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

app.delete('/api/products/:id', verifyToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  products = products.filter(p => p.id !== id);
  res.json({ success: true });
});

// Orders API
app.get('/api/orders', verifyToken, (req, res) => {
  const userOrders = req.user.role === 'admin' ? orders : orders.filter(o => o.user_id === req.user.id);
  res.json(userOrders);
});

app.post('/api/orders', verifyToken, (req, res) => {
  const { items, total } = req.body;
  const order = {
    id: nextOrderId++,
    user_id: req.user.id,
    total,
    status: 'pending',
    created_at: new Date().toISOString(),
    items
  };
  orders.push(order);
  res.json(order);
});

// Categories API
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

// Search API
app.get('/api/search', (req, res) => {
  const { q, category } = req.query;
  let filtered = products;
  
  if (q) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.description.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  res.json(filtered);
});

// Coupons API
app.post('/api/validate-coupon', (req, res) => {
  const { code, total } = req.body;
  const result = validateCoupon(code, total);
  res.json(result);
});

app.get('/api/coupons', verifyToken, requireAdmin, (req, res) => {
  res.json(coupons);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});