const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { uploadToS3 } = require('../utils/s3');

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Create post
router.post('/', authenticateToken, upload.array('media', 5), async (req, res) => {
  try {
    const { content } = req.body;
    const mediaUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToS3(file);
        mediaUrls.push(url);
      }
    }

    const post = await prisma.post.create({
      data: {
        content,
        mediaUrls,
        mediaType: req.files?.[0]?.mimetype?.startsWith('video') ? 'video' : 'image',
        authorId: req.user.id
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true, verified: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get feed
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(req.user.id); // Include own posts

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: followingIds }
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true, verified: true }
        },
        _count: {
          select: { likes: true, comments: true }
        },
        likes: {
          where: { userId: req.user.id },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined
    }));

    res.json(postsWithLikeStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      res.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId: req.user.id,
          postId
        }
      });
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.user.id
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        _count: {
          select: { likes: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

module.exports = router;