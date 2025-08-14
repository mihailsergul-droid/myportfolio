const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Social Media API is running!' });
});

// Basic auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, displayName } = req.body;
    
    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
      }
    });
    
    res.json({ user, token: 'demo-token' });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ user, token: 'demo-token' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Basic posts route
app.get('/api/posts/feed', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    res.json(posts.map(post => ({ ...post, isLiked: false })));
  } catch (error) {
    res.json([]);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});