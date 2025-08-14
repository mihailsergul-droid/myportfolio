const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Dashboard statistics
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await Progress.countDocuments();
    
    const completionStats = await Progress.aggregate([
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: '$completionPercentage' },
          totalCompleted: {
            $sum: {
              $cond: [{ $gte: ['$completionPercentage', 100] }, 1, 0]
            }
          }
        }
      }
    ]);

    const completionRate = completionStats.length > 0 
      ? Math.round(completionStats[0].avgCompletion) 
      : 0;

    res.json({
      totalStudents,
      totalCourses,
      totalEnrollments,
      completionRate,
      totalCompleted: completionStats.length > 0 ? completionStats[0].totalCompleted : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users with pagination
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get enrollment and progress data for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const enrollments = await Progress.find({ userId: user._id });
        const enrolledCourses = enrollments.length;
        const overallProgress = enrollments.length > 0 
          ? Math.round(enrollments.reduce((sum, p) => sum + p.completionPercentage, 0) / enrollments.length)
          : 0;

        return {
          ...user.toObject(),
          enrolledCourses,
          overallProgress,
          lastActivity: user.lastLoginAt || user.createdAt
        };
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      users: usersWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user details
router.get('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const enrollments = await Progress.find({ userId: user._id })
      .populate('courseId', 'title description');
    
    const userStats = {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.completionPercentage >= 100).length,
      averageScore: enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.averageScore || 0), 0) / enrollments.length)
        : 0,
      totalStudyTime: enrollments.reduce((sum, e) => sum + (e.studyTime || 0), 0)
    };

    res.json({
      user,
      enrollments,
      stats: userStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', [auth, adminAuth], async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's progress records
    await Progress.deleteMany({ userId: req.params.id });
    
    // Remove user from course enrollments
    await Course.updateMany(
      { enrolledStudents: req.params.id },
      { $pull: { enrolledStudents: req.params.id } }
    );

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Course analytics
router.get('/analytics/courses', [auth, adminAuth], async (req, res) => {
  try {
    const courseStats = await Course.aggregate([
      {
        $lookup: {
          from: 'progresses',
          localField: '_id',
          foreignField: 'courseId',
          as: 'enrollments'
        }
      },
      {
        $project: {
          title: 1,
          enrollmentCount: { $size: '$enrollments' },
          avgCompletion: {
            $avg: '$enrollments.completionPercentage'
          },
          completedCount: {
            $size: {
              $filter: {
                input: '$enrollments',
                cond: { $gte: ['$$this.completionPercentage', 100] }
              }
            }
          }
        }
      },
      { $sort: { enrollmentCount: -1 } }
    ]);

    res.json(courseStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User analytics
router.get('/analytics/users', [auth, adminAuth], async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      roleDistribution: userStats,
      monthlyRegistrations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// System analytics
router.get('/analytics/system', [auth, adminAuth], async (req, res) => {
  try {
    const systemStats = {
      totalStorage: '2.5 GB', // Mock data
      activeUsers: await User.countDocuments({ 
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
      serverUptime: process.uptime(),
      databaseSize: '150 MB' // Mock data
    };

    res.json(systemStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export data
router.get('/export/:type', [auth, adminAuth], async (req, res) => {
  try {
    const { type } = req.params;
    let data;

    switch (type) {
      case 'users':
        data = await User.find().select('-password');
        break;
      case 'courses':
        data = await Course.find();
        break;
      case 'progress':
        data = await Progress.find().populate('userId courseId');
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-export.json`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send bulk notification
router.post('/notifications/bulk', [auth, adminAuth], async (req, res) => {
  try {
    const { title, message, userIds, sendToAll } = req.body;
    
    let targetUsers;
    if (sendToAll) {
      targetUsers = await User.find({ role: 'student' });
    } else {
      targetUsers = await User.find({ _id: { $in: userIds } });
    }

    // Here you would integrate with your notification service
    // For now, we'll just simulate sending notifications
    
    res.json({ 
      message: `Notification sent to ${targetUsers.length} users`,
      sentCount: targetUsers.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;