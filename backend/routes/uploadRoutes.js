import express from "express";
import multer from "multer";
import UploadedFile from "../models/uploadedfile.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // 🧠 store in RAM

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const uploaded = new UploadedFile({
      fileName: req.file.originalname,
      fileData: req.file.buffer,
      fileType: req.file.mimetype,
    });

    await uploaded.save();

    res.status(200).json({ message: "File uploaded to DB successfully", file: uploaded });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
