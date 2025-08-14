const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const courses = await Course.find(query)
      .select('-lessons.quiz') // Don't send quiz answers
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll in course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.enrolledStudents.includes(req.user.id)) {
      course.enrolledStudents.push(req.user.id);
      await course.save();
    }

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lesson content
router.get('/:courseId/lessons/:lessonId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz answer
router.post('/:courseId/lessons/:lessonId/quiz', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson || !lesson.quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = lesson.quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.answers.findIndex(answer => answer.correct);
      const isCorrect = userAnswer === correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        userAnswer,
        correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = (correctAnswers / lesson.quiz.questions.length) * 100;

    res.json({
      score,
      correctAnswers,
      totalQuestions: lesson.quiz.questions.length,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;