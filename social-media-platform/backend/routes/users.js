const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Follow/Unfollow user
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      res.json({ following: false });
    } else {
      await prisma.follow.create({
        data: {
          followerId: req.user.id,
          followingId: targetUserId
        }
      });
      res.json({ following: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// Get user posts
router.get('/:username/posts', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        verified: true,
        _count: {
          select: { followers: true }
        }
      },
      take: parseInt(limit)
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, bio } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { displayName, bio },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        verified: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;