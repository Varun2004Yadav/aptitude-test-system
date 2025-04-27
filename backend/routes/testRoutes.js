import express from "express";
import { getTestDetails, getLeaderboard, getAnalytics } from "../controllers/testController.js";

const router = express.Router();

router.get("/:testId", getTestDetails);
router.get("/:testId/leaderboard", getLeaderboard);
router.get("/:testId/analytics", getAnalytics);

export default router;
