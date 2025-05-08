import Student from '../models/Student.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Test } from '../models/testModel.js';
import { StudentTest } from '../models/studentTestModel.js';
import { calculateScore } from '../utils/scoreCalculator.js';
import TestQuestions from '../models/testQuestions.js';

// Register a new student
export const registerStudent = async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { rollNo, name, email, password, className, department, year, phone } = req.body;

        // Validate required fields
        if (!rollNo || !name || !email || !password || !className || !department || !year || !phone) {
            console.log('Missing fields:', { rollNo, name, email, password: '***', className, department, year, phone });
            return res.status(400).json({ 
                message: 'All fields are required',
                missingFields: Object.entries({ rollNo, name, email, password, className, department, year, phone })
                    .filter(([_, value]) => !value)
                    .map(([key]) => key)
            });
        }

        // Validate phone number
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
        }

        // Validate email
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
            $or: [{ rollNo: rollNo.toUpperCase() }, { email: email.toLowerCase() }, { phone }]
        });

        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists with this roll number, email, or phone' });
        }

        // Create new student with password hashing handled by the model's pre-save hook
        const student = await Student.create({
            rollNo: rollNo.toUpperCase(),
            name,
            email: email.toLowerCase(),
            password,  // Will be hashed by the pre-save hook
            className,
            department,
            year: parseInt(year),
            phone,
            isActive: true
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: "Student registered successfully!",
            token,
            student: {
                id: student._id,
                rollNo: student.rollNo,
                name: student.name,
                email: student.email,
                className: student.className,
                department: student.department,
                year: student.year,
                phone: student.phone
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ 
            message: 'Error registering student', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Login student
export const loginStudent = async (req, res) => {
    try {
        const { rollNo, password } = req.body;

        if (!rollNo || !password) {
            return res.status(400).json({ message: "Roll number and password are required" });
        }

        // Normalize roll number
        const normalizedRollNo = rollNo.toUpperCase().trim();

        // Add request logging
        console.log('Login attempt details:', {
            attemptedRollNo: rollNo,
            normalizedRollNo: normalizedRollNo
        });

        // Find student by rollNo
        const student = await Student.findOne({ 
            rollNo: normalizedRollNo 
        });

        // Log the query result (without sensitive data)
        console.log('Student search result:', {
            found: student ? 'Yes' : 'No',
            rollNo: normalizedRollNo
        });
        
        if (!student) {
            // Try to find similar roll numbers to help user
            const similarStudents = await Student.find({
                rollNo: { $regex: rollNo.replace(/\D/g, ''), $options: 'i' }
            }).select('rollNo').limit(3);

            console.log('No student found with roll number:', normalizedRollNo);
            return res.status(401).json({ 
                message: "Invalid credentials",
                suggestion: "Please check your roll number and try again",
                similarRollNumbers: similarStudents.length > 0 ? 
                    similarStudents.map(s => s.rollNo) : undefined
            });
        }

        // Check if account is active
        if (!student.isActive) {
            return res.status(403).json({ message: "Account is deactivated. Please contact support." });
        }

        // Verify password using bcryptjs
        const isPasswordValid = await bcryptjs.compare(password, student.password);
        console.log('Password verification:', isPasswordValid ? 'Success' : 'Failed');

        if (!isPasswordValid) {
            // Increment illegal attempts
            student.illegalAttempts = (student.illegalAttempts || 0) + 1;
            await student.save();

            // If too many failed attempts, deactivate account
            if (student.illegalAttempts >= 5) {
                student.isActive = false;
                await student.save();
                return res.status(403).json({ 
                    message: "Too many failed attempts. Account has been deactivated. Please contact support."
                });
            }

            return res.status(401).json({ 
                message: "Invalid credentials",
                attemptsRemaining: 5 - student.illegalAttempts
            });
        }

        // Reset illegal attempts on successful login
        student.illegalAttempts = 0;
        student.lastLogin = new Date();
        await student.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        // Return student data without sensitive fields
        const studentData = {
            id: student._id,
            rollNo: student.rollNo,
            name: student.name,
            email: student.email,
            className: student.className,
            department: student.department,
            year: student.year
        };

        res.status(200).json({
            message: "Login successful",
            token,
            student: studentData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error during login" });
    }
};

// Get student profile
export const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Update student profile
export const updateStudentProfile = async (req, res) => {
    try {
        const { name, email, className, department, year } = req.body;
        
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.name = name || student.name;
        student.email = email || student.email;
        student.className = className || student.className;
        student.department = department || student.department;
        student.year = year || student.year;

        await student.save();

        res.json({
            id: student._id,
            rollNo: student.rollNo,
            name: student.name,
            email: student.email,
            className: student.className,
            department: student.department,
            year: student.year
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

export const getInstructions = async (req, res) => {
    try {
        const { testId } = req.params;
        // Implementation for getting test instructions
        res.status(200).json({ message: "Test instructions" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAvailableTests = async (req, res) => {
    try {
        const now = new Date();
        const tests = await Test.find({
            startTime: { $lte: now },
            $expr: {
                $lt: [
                    { $subtract: [now, "$startTime"] },
                    { $multiply: ["$duration", 60000] } // Convert minutes to milliseconds
                ]
            },
            status: { $in: ['scheduled', 'active'] }
        }).select('testName startTime duration totalMarks');

        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available tests', error: error.message });
    }
};

export const getTestDetails = async (req, res) => {
    try {
        const test = await Test.findById(req.params.testId)
            .select('testName questions duration startTime totalMarks');

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Check if test is available
        const now = new Date();
        const endTime = new Date(test.startTime.getTime() + test.duration * 60000);
        
        if (now < test.startTime || now > endTime) {
            return res.status(400).json({ message: 'Test is not currently available' });
        }

        // Check if student has already taken the test
        const existingTest = await StudentTest.findOne({
            testId: test._id,
            studentId: req.user._id
        });

        if (existingTest) {
            return res.status(400).json({ message: 'You have already taken this test' });
        }

        res.json(test);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching test details', error: error.message });
    }
};

export const startTest = async (req, res) => {
    try {
        // Check if questions exist
        const questions = await TestQuestions.find();
        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'No test questions available' });
        }

        // Check if student has already started the test
        const existingTest = await StudentTest.findOne({
            studentId: req.user._id,
            status: 'in_progress'
        });

        if (existingTest) {
            const timeElapsed = Math.floor((Date.now() - existingTest.startedAt) / 60000);
            const timeRemaining = Math.max(0, 60 - timeElapsed); // 60 minutes default

            if (timeRemaining <= 0) {
                // If time is up, mark test as completed
                existingTest.status = 'completed';
                existingTest.completedAt = Date.now();
                await existingTest.save();
                return res.status(400).json({ message: 'Test time has expired' });
            }

            return res.status(200).json({
                attemptId: existingTest._id,
                timeRemaining
            });
        }

        // Create new test attempt
        const newTest = await StudentTest.create({
            studentId: req.user._id,
            totalMarks: questions.length, // Each question worth 1 mark
            marksObtained: 0,
            percentage: 0,
            status: 'in_progress',
            startedAt: Date.now(),
            questions: questions.map(q => ({
                questionId: q._id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer
            }))
        });

        res.status(200).json({
            attemptId: newTest._id,
            timeRemaining: 60, // 60 minutes default
            questions: questions.map(q => ({
                questionId: q._id,
                question: q.question,
                options: q.options
            }))
        });
    } catch (error) {
        console.error('Error starting test:', error);
        res.status(500).json({ message: 'Error starting test', error: error.message });
    }
};

export const submitTest = async (req, res) => {
    try {
        const { answers } = req.body;
        const test = await Test.findById(req.params.testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Get student's test attempt
        const studentTest = await StudentTest.findOne({
            testId: test._id,
            studentId: req.user._id
        });

        if (!studentTest) {
            return res.status(404).json({ message: 'Test attempt not found' });
        }

        if (studentTest.status === 'completed') {
            return res.status(400).json({ message: 'Test already submitted' });
        }

        // Calculate score
        const score = await calculateScore(test, answers);

        // Update attempt
        studentTest.answers = answers;
        studentTest.marksObtained = score.marksObtained;
        studentTest.percentage = score.percentage;
        studentTest.status = 'completed';
        studentTest.completedAt = Date.now();
        studentTest.timeTaken = Math.floor((studentTest.completedAt - studentTest.startedAt) / 60000);

        await studentTest.save();

        res.status(200).json({
            totalMarks: score.totalMarks,
            marksObtained: score.marksObtained,
            percentage: score.percentage,
            timeTaken: studentTest.timeTaken
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting test', error: error.message });
    }
};

export const getTestResult = async (req, res) => {
    try {
        const result = await StudentTest.findOne({
            testId: req.params.testId,
            studentId: req.user._id
        });

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching result', error: error.message });
    }
};

export const getAllTestQuestions = async (req, res) => {
    try {
        const questions = await TestQuestions.find();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};

export const getTestQuestionsForStudent = async (req, res) => {
    try {
        // If you want to filter by testId, use: { testId: req.params.testId }
        const questions = await TestQuestions.find();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};
