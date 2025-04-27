import express from "express";
import { registerStudent, loginStudent, getInstructions, startTest, submitTest } from "../controllers/studentController.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/instructions/:testId", getInstructions);
router.post("/start-test/:testId", startTest);
router.post("/submit-test/:testId", submitTest);

export default router;
