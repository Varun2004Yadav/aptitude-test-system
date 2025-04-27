import express from "express";
import { loginFaculty, createClass, createTest, uploadQuestions } from "../controllers/facultyController.js";
import { uploadMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/login", loginFaculty);
router.post("/create-class", createClass);
router.post("/create-test", createTest);
router.post("/upload-questions", uploadMiddleware.single("file"), uploadQuestions);

export default router;
