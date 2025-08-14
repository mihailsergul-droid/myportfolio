const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user chats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: { userId: req.user.id }
        }
      },
      include: {
        members: {
          include: {
            chat: {
              select: { id: true, username: true, displayName: true, avatar: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, username: true, displayName: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Create or get direct chat
router.post('/direct', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: { in: [req.user.id, userId] }
          }
        }
      },
      include: {
        members: {
          include: {
            chat: {
              select: { id: true, username: true, displayName: true, avatar: true }
            }
          }
        }
      }
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        isGroup: false,
        members: {
          create: [
            { userId: req.user.id },
            { userId }
          ]
        }
      },
      include: {
        members: {
          include: {
            chat: {
              select: { id: true, username: true, displayName: true, avatar: true }
            }
          }
        }
      }
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get chat messages
router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify user is member of chat
    const chatMember = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId: req.user.id
      }
    });

    if (!chatMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark messages as read
router.put('/:chatId/read', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;

    await prisma.message.updateMany({
      where: {
        chatId,
        receiverId: req.user.id,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;