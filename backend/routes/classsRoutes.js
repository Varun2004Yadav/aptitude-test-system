import express from "express";
import { createClass, getClasses } from "../controllers/classController.js";

const router = express.Router();

router.post("/create", createClass);
router.get("/list", getClasses);

export default router;
