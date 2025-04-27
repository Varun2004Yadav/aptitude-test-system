import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Test from '../models/testModel.js';
import Result from '../models/resultModel.js';
import { calculateScore } from '../utils/scoreCalculator.js';

export const registerStudent = async (req, res) => {
    try {
        const { rollNo, name, email, phone, password, className, department, year } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
            $or: [{ rollNo }, { email }, { phone }]
        });
        
        if (existingStudent) {
            return res.status(400).json({ 
                message: "Student with this roll number, email, or phone already exists!" 
            });
        }

        // Create new student
        const student = new Student({
            rollNo,
            name,
            email,
            phone,
            password,
            className,
            department,
            year
        });

        await student.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: "Student registered successfully!",
            token,
            student: {
                id: student._id,
                name: student.name,
                rollNo: student.rollNo,
                email: student.email,
                className: student.className
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

export const loginStudent = async (req, res) => {
    try {
        const { rollNo, password } = req.body;

        // Find student
        const student = await Student.findOne({ rollNo });
        if (!student) {
            return res.status(400).json({ message: "Student not found!" });
        }

        // Check if account is active
        if (!student.isActive) {
            return res.status(403).json({ message: "Account is deactivated!" });
        }

        // Verify password
        const isPasswordValid = await student.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password!" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Update last login
        student.lastLogin = new Date();
        await student.save();

        res.status(200).json({
            token,
            student: {
                id: student._id,
                name: student.name,
                rollNo: student.rollNo,
                email: student.email,
                className: student.className
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .select('-password')
            .populate('testHistory.testId', 'title className section');
        
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStudentProfile = async (req, res) => {
    try {
        const { name, email, phone, department, year } = req.body;
        
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Update fields
        student.name = name || student.name;
        student.email = email || student.email;
        student.phone = phone || student.phone;
        student.department = department || student.department;
        student.year = year || student.year;

        await student.save();

        res.status(200).json({
            message: "Profile updated successfully",
            student: {
                id: student._id,
                name: student.name,
                rollNo: student.rollNo,
                email: student.email,
                className: student.className,
                department: student.department,
                year: student.year
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
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

export const startTest = async (req, res) => {
    try {
        const { testId } = req.params;
        // Implementation for starting test
        res.status(200).json({ message: "Test started" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const submitTest = async (req, res) => {
    try {
        const { answers, timeTaken } = req.body;
        const testId = req.params.testId;

        // Get test details
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Calculate score
        const { totalMarks, marksObtained, percentage, status } = await calculateScore(test, answers);

        // Create result
        const result = new Result({
            testId,
            studentId: req.user._id,
            answers,
            totalMarks,
            marksObtained,
            percentage,
            status,
            timeTaken
        });

        await result.save();

        // Update test status if all students have completed
        const totalStudents = await Result.countDocuments({ testId });
        if (totalStudents === test.totalStudents) {
            test.status = 'completed';
            await test.save();
        }

        res.json({
            message: 'Test submitted successfully',
            result: {
                totalMarks,
                marksObtained,
                percentage,
                status
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting test', error: error.message });
    }
};

export const getTestResult = async (req, res) => {
    try {
        const result = await Result.findOne({
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

// Get available tests for student
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
        }).select('title startTime duration totalMarks');

        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available tests', error: error.message });
    }
};

// Get test details and questions
export const getTestDetails = async (req, res) => {
    try {
        const test = await Test.findById(req.params.testId)
            .select('title questions duration startTime totalMarks');

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
        const existingResult = await Result.findOne({
            testId: test._id,
            studentId: req.user._id
        });

        if (existingResult) {
            return res.status(400).json({ message: 'You have already taken this test' });
        }

        res.json(test);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching test details', error: error.message });
    }
};
