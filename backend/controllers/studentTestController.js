const Test = require('../models/testModel');
const StudentTest = require('../models/studentTestModel');
const { calculateScore } = require('../utils/scoreCalculator');

// Get available tests for student
exports.getAvailableTests = async (req, res) => {
  try {
    const now = new Date();
    const tests = await Test.find({
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).select('testName instructions startTime duration totalMarks');

    res.status(200).json({
      status: 'success',
      data: tests
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get test details and questions
exports.getTestDetails = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    // Check if student has already taken the test
    const existingAttempt = await StudentTest.findOne({
      testId: test._id,
      studentId: req.user._id
    });

    if (existingAttempt && existingAttempt.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'You have already completed this test'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        testName: test.testName,
        instructions: test.instructions,
        duration: test.duration,
        totalMarks: test.totalMarks,
        questions: test.questions
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Start test attempt
exports.startTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    // Check if student has already started the test
    const existingAttempt = await StudentTest.findOne({
      testId: test._id,
      studentId: req.user._id
    });

    if (existingAttempt) {
      return res.status(200).json({
        status: 'success',
        data: {
          attemptId: existingAttempt._id,
          timeRemaining: test.duration - Math.floor((Date.now() - existingAttempt.startedAt) / 60000)
        }
      });
    }

    // Create new test attempt
    const newAttempt = await StudentTest.create({
      studentId: req.user._id,
      testId: test._id,
      totalMarks: test.totalMarks,
      marksObtained: 0,
      percentage: 0,
      status: 'in_progress'
    });

    res.status(200).json({
      status: 'success',
      data: {
        attemptId: newAttempt._id,
        timeRemaining: test.duration
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Submit test
exports.submitTest = async (req, res) => {
  try {
    const { answers } = req.body;
    const test = await Test.findById(req.params.testId);
    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    // Get student's test attempt
    const attempt = await StudentTest.findOne({
      testId: test._id,
      studentId: req.user._id
    });

    if (!attempt) {
      return res.status(404).json({
        status: 'error',
        message: 'Test attempt not found'
      });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Test already submitted'
      });
    }

    // Calculate score
    const score = await calculateScore(test, answers);

    // Update attempt
    attempt.answers = answers;
    attempt.marksObtained = score.marksObtained;
    attempt.percentage = score.percentage;
    attempt.status = 'completed';
    attempt.completedAt = Date.now();
    attempt.timeTaken = Math.floor((attempt.completedAt - attempt.startedAt) / 60000);

    await attempt.save();

    res.status(200).json({
      status: 'success',
      data: {
        totalMarks: score.totalMarks,
        marksObtained: score.marksObtained,
        percentage: score.percentage,
        timeTaken: attempt.timeTaken
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 