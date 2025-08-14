const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

// Mock users database
const users = [
  { id: 1, email: 'admin@test.com', role: 'admin' },
  { id: 2, email: 'user@test.com', role: 'user' }
];

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { generateToken, verifyToken, requireAdmin, users };