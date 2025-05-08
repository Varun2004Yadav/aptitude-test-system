import Test from "../models/Test.js";
import UserTest from "../models/UserTest.js";
import TestQuestion from '../models/testQuestions.js';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

export const getTestDetails = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;

    const leaderboard = await UserTest.find({ testId })
      .sort({ score: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { testId } = req.params;

    const analytics = await UserTest.aggregate([
      { $match: { testId } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" },
          maxScore: { $max: "$score" },
          minScore: { $min: "$score" },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(analytics[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTest = async (req, res) => {
    try {
        console.log('Received create test request:', req.body);
        const { title, description, duration, totalMarks } = req.body;
        const facultyId = req.user.id;

        // Validate required fields
        if (!title || !duration || !totalMarks) {
            console.log('Missing required fields:', { title, duration, totalMarks });
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create new test
        const test = new Test({
            title,
            description: description || '',
            duration: Number(duration),
            totalMarks: Number(totalMarks),
            createdBy: facultyId,
            status: 'draft'
        });

        const savedTest = await test.save();
        console.log('Test created successfully:', savedTest);
        res.status(201).json({ 
            message: 'Test created successfully', 
            test: savedTest 
        });
    } catch (error) {
        console.error('Error creating test:', error);
        res.status(500).json({ message: error.message });
    }
};

export const uploadTestQuestions = async (req, res) => {
    try {
        console.log('Received upload questions request. TestID:', req.params.testId);
        console.log('Questions:', req.body.questions);
        
        const { testId } = req.params;
        const { questions } = req.body;
        const facultyId = req.user.id;

        // Verify test exists and belongs to faculty
        const test = await Test.findOne({ _id: testId, createdBy: facultyId });
        if (!test) {
            console.log('Test not found or unauthorized for faculty:', facultyId);
            return res.status(404).json({ message: 'Test not found or unauthorized' });
        }

        // Validate questions array
        if (!Array.isArray(questions) || questions.length === 0) {
            console.log('Invalid questions format received');
            return res.status(400).json({ message: 'Invalid questions format' });
        }

        // Process and validate each question
        const processedQuestions = questions.map((q, index) => {
            // Validate required fields
            if (!q.question || !q.options || !q.correctAnswer) {
                throw new Error(`Question ${index + 1}: Missing required fields`);
            }

            // Validate options
            if (!Array.isArray(q.options) || q.options.length < 2) {
                throw new Error(`Question ${index + 1}: Must have at least 2 options`);
            }

            // Validate correct answer
            if (!q.options.includes(q.correctAnswer)) {
                throw new Error(`Question ${index + 1}: Correct answer must be one of the options`);
            }

            return {
                testId,
                question: q.question.trim(),
                options: q.options.map(opt => opt.trim()),
                correctAnswer: q.correctAnswer,
                type: 'MCQ',
                marks: Number(q.marks) || 1,
                createdBy: facultyId
            };
        });

        // Save questions to database
        const savedQuestions = await TestQuestion.insertMany(processedQuestions);
        console.log(`Successfully saved ${savedQuestions.length} questions`);

        // Update test status
        await Test.findByIdAndUpdate(testId, { status: 'published' });

        res.status(201).json({
            message: 'Questions uploaded successfully',
            questions: savedQuestions
        });
    } catch (error) {
        console.error('Error uploading questions:', error);
        res.status(500).json({ 
            message: 'Error processing questions',
            error: error.message 
        });
    }
};

export const getTestQuestions = async (req, res) => {
    try {
        const { testId } = req.params;
        const facultyId = req.user.id;

        // Verify test exists and belongs to faculty
        const test = await Test.findOne({ _id: testId, createdBy: facultyId });
        if (!test) {
            return res.status(404).json({ message: 'Test not found or unauthorized' });
        }

        const questions = await TestQuestion.find({ testId })
            .select('-correctAnswer')
            .sort({ createdAt: 1 });

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
};

// Add more: analytics, leaderboard etc.
