import express from 'express';
import { 
    registerStudent, 
    loginStudent, 
    getStudentProfile,
    updateStudentProfile,
    getInstructions, 
    startTest, 
    submitTest 
} from '../controllers/studentController.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Protected routes
router.get('/profile', authMiddleware, requireRole(['student']), getStudentProfile);
router.put('/profile', authMiddleware, requireRole(['student']), updateStudentProfile);
router.get('/instructions/:testId', authMiddleware, requireRole(['student']), getInstructions);
router.post('/start-test/:testId', authMiddleware, requireRole(['student']), startTest);
router.post('/submit-test/:testId', authMiddleware, requireRole(['student']), submitTest);

export default router;