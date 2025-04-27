import Faculty from "../models/Faculty.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Class from "../models/Class.js";

export const loginFaculty = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const faculty = await Faculty.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
    });

    if (!faculty) {
      return res.status(400).json({ message: "Faculty not found" });
    }

    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: faculty._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ token, faculty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const { className, section } = req.body;
    const facultyId = req.user.id;  // from auth middleware

    const newClass = new Class({ className, section, faculty: facultyId });
    await newClass.save();

    res.status(201).json({ message: "Class created successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// createTest and uploadQuestions you will connect later
