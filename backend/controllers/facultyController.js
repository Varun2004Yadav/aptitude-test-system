import Faculty from '../models/Faculty.js';
import Test from '../models/Test.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import xlsx from 'xlsx';

export const registerFaculty = async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        
        const { facultyId, name, email, password, department, designation, phone } = req.body;

        // Validate required fields
        if (!facultyId || !name || !email || !password || !department || !designation || !phone) {
            console.log('Missing required fields');
            return res.status(400).json({ 
                message: "All fields are required!" 
            });
        }

        // Check if faculty already exists
        console.log('Checking for existing faculty...');
        const existingFaculty = await Faculty.findOne({ 
            $or: [{ facultyId }, { email }, { phone }]
        });
        
        if (existingFaculty) {
            console.log('Faculty already exists');
            return res.status(400).json({ 
                message: "Faculty with this ID, email, or phone already exists!" 
            });
        }

        console.log('Creating new faculty...');
        // Create new faculty
        const faculty = new Faculty({
            facultyId,
            name,
            email,
            password,
            department,
            designation,
            phone
        });

        await faculty.save();
        console.log('Faculty saved successfully');

        // Generate JWT token
        const token = jwt.sign(
            { id: faculty._id, role: 'faculty' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        console.log('Registration successful');
        res.status(201).json({
            message: "Faculty registered successfully!",
            token,
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
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

export const loginFaculty = async (req, res) => {
    try {
        const { facultyId, password } = req.body;

        // Find faculty
        const faculty = await Faculty.findOne({ facultyId });
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
                facultyId: faculty.facultyId,
                email: faculty.email,
                department: faculty.department,
                designation: faculty.designation
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
