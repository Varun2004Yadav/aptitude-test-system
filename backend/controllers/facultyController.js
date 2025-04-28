import Faculty from '../models/Faculty.js';
import Test from '../models/Test.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import xlsx from 'xlsx';

export const registerFaculty = async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { name, email, password, department, phone } = req.body;

        // Validate required fields
        if (!name || !email || !password || !department || !phone) {
            console.log('Missing fields:', { name, email, password, department, phone });
            return res.status(400).json({ 
                message: "All fields are required!",
                missingFields: Object.entries({ name, email, password, department, phone })
                    .filter(([_, value]) => !value)
                    .map(([key]) => key)
            });
        }

        // Validate phone number
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ 
                message: "Please enter a valid 10-digit phone number" 
            });
        }

        // Validate email
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).json({ 
                message: "Please enter a valid email address" 
            });
        }

        // Check if faculty already exists
        const existingFaculty = await Faculty.findOne({ 
            $or: [{ email }, { phone }]
        });
        
        if (existingFaculty) {
            return res.status(400).json({ 
                message: "Faculty with this email or phone already exists!" 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new faculty
        const faculty = new Faculty({
            name,
            email,
            password: hashedPassword,
            department,
            phone
        });

        await faculty.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: faculty._id, role: 'faculty' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: "Faculty registered successfully!",
            token,
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                phone: faculty.phone
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
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const loginFaculty = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find faculty
        const faculty = await Faculty.findOne({ email });
        if (!faculty) {
            return res.status(400).json({ message: "Faculty not found!" });
        }

        // Check if account is active
        if (!faculty.isActive) {
            return res.status(403).json({ message: "Account is deactivated!" });
        }

        // Verify password
        const isPasswordValid = await faculty.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password!" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: faculty._id, role: 'faculty' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Update last login
        faculty.lastLogin = new Date();
        await faculty.save();

        res.status(200).json({
            token,
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                phone: faculty.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFacultyProfile = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.user.id)
            .select('-password')
            .populate('createdTests', 'title className section timeLimit');
        
        res.status(200).json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateFacultyProfile = async (req, res) => {
    try {
        const { name, email, phone, department, designation } = req.body;
        
        const faculty = await Faculty.findById(req.user.id);
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Update fields
        faculty.name = name || faculty.name;
        faculty.email = email || faculty.email;
        faculty.phone = phone || faculty.phone;
        faculty.department = department || faculty.department;
        faculty.designation = designation || faculty.designation;

        await faculty.save();

        res.status(200).json({
            message: "Profile updated successfully",
            faculty: {
                id: faculty._id,
                name: faculty.name,
                facultyId: faculty.facultyId,
                email: faculty.email,
                department: faculty.department,
                designation: faculty.designation
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

export const createClass = async (req, res) => {
    try {
        const { className, section } = req.body;
        // Implementation for creating class
        res.status(201).json({ message: "Class created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTest = async (req, res) => {
    try {
        const { title, className, section, timeLimit } = req.body;
        const test = new Test({
            title,
            className,
            section,
            timeLimit,
            createdBy: req.user.id
        });
        await test.save();
        res.status(201).json({ message: "Test created successfully", test });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Process the data and save questions
        res.status(200).json({ message: "Questions uploaded successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
