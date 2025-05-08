import express from 'express';
import { 
    registerFaculty,
    loginFaculty,
    getFacultyProfile,
    updateFacultyProfile,
    createClass, 
    createTest, 
    uploadQuestions,
    changeFacultyPassword
} from '../controllers/facultyController.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerFaculty);
router.post('/login', loginFaculty);

// Protected routes
router.get('/profile', authMiddleware, requireRole(['faculty']), getFacultyProfile);
router.put('/profile', authMiddleware, requireRole(['faculty']), updateFacultyProfile);
router.post('/create-class', authMiddleware, requireRole(['faculty']), createClass);
router.post('/create-test', authMiddleware, requireRole(['faculty']), createTest);
router.post('/upload-questions', authMiddleware, requireRole(['faculty']), uploadMiddleware.single('file'), uploadQuestions);
router.post('/change-password', authMiddleware, requireRole(['faculty']), changeFacultyPassword);

export default router;
