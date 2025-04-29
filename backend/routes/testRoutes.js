import express from "express";
import { 
    createTest,
    getTestDetails,
    uploadTestQuestions,
    getTestQuestions
} from "../controllers/testController.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post('/create', authMiddleware, requireRole(['faculty']), createTest);
router.get('/:testId', authMiddleware, requireRole(['faculty']), getTestDetails);
router.post('/:testId/questions', 
    authMiddleware, 
    requireRole(['faculty']), 
    uploadTestQuestions
);
router.get('/:testId/questions', authMiddleware, requireRole(['faculty']), getTestQuestions);

export default router;
