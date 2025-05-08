import express from "express";
import multer from "multer";
import UploadedFile from "../models/uploadedfile.js";
import TestQuestions from "../models/testQuestions.js";
import xlsx from "xlsx";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // 🧠 store in RAM

// GET route to download template
router.get("/template", (req, res) => {
  try {
    // Create a new workbook
    const workbook = xlsx.utils.book_new();
    
    // Sample data with headers
    const templateData = [
      {
        question: "What is 2 + 2?",
        optionA: "3",
        optionB: "4",
        optionC: "5",
        optionD: "6",
        correctAnswer: "B",
        explanation: "Basic addition: 2 + 2 = 4"
      },
      {
        question: "Which planet is known as the Red Planet?",
        optionA: "Venus",
        optionB: "Jupiter",
        optionC: "Mars",
        optionD: "Saturn",
        correctAnswer: "C",
        explanation: "Mars appears red due to iron oxide (rust) on its surface"
      }
    ];

    // Convert data to worksheet
    const ws = xlsx.utils.json_to_sheet(templateData);

    // Add column widths and styling
    ws['!cols'] = [
      { wch: 40 }, // question
      { wch: 20 }, // optionA
      { wch: 20 }, // optionB
      { wch: 20 }, // optionC
      { wch: 20 }, // optionD
      { wch: 15 }, // correctAnswer
      { wch: 40 }  // explanation
    ];

    // Add the worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, ws, "Questions Template");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers for file download
    res.setHeader("Content-Disposition", 'attachment; filename="questions_template.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    
    res.send(buffer);
  } catch (error) {
    console.error("Template Creation Error:", error);
    res.status(500).json({ error: "Failed to generate template" });
  }
});

// POST route to upload questions
router.post("/", upload.single("file"), async (req, res) => {
  try {

    const uploaded = new UploadedFile({
      fileName: req.file.originalname,
      fileData: req.file.buffer,
      fileType: req.file.mimetype,
    });

    await uploaded.save();

    // Extract questions from the uploaded .xlsx file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Validate required columns
    const requiredColumns = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'explanation'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        error: `Missing required columns: ${missingColumns.join(", ")}. Please use the template provided.` 
      });
    }

    // Map the data to the TestQuestions schema and save each question
    const questions = data.map((row) => ({
      question: row.question,
      options: [row.optionA, row.optionB, row.optionC, row.optionD],
      correctAnswer: row.correctAnswer,
      explanation: row.explanation,
    }));

    await TestQuestions.insertMany(questions);

    res.status(200).json({ 
      message: "Questions uploaded successfully", 
      questionsCount: questions.length,
      file: uploaded 
    });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
