import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';

const router = express.Router();

// Multer config
const upload = multer({ dest: 'uploads/' });

// Upload route
router.post('/', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Read uploaded file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Clean up file after reading
    fs.unlinkSync(file.path);

    // ✅ Send all questions
    res.json({ preview: data, filename: file.originalname });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

export default router;
