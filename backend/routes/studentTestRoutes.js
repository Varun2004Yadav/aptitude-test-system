const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getAvailableTests,
  getTestDetails,
  startTest,
  submitTest
} = require('../controllers/studentTestController');

// All routes are protected and restricted to students
router.use(protect);
router.use(restrictTo('student'));

// Get available tests
router.get('/available', getAvailableTests);

// Get test details
router.get('/:testId', getTestDetails);

// Start test attempt
router.post('/:testId/start', startTest);

// Submit test
router.post('/:testId/submit', submitTest);

module.exports = router; 