import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user based on role
        let user;
        if (decoded.role === 'student') {
            user = await Student.findById(decoded.id).select('-password');
        } else if (decoded.role === 'faculty') {
            user = await Faculty.findById(decoded.id).select('-password');
        }

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        req.user = {
            id: user._id,
            role: decoded.role,
            ...user.toObject()
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error while verifying token' });
    }
};

// Role-based middleware
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};