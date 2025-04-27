import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerStudent = async (req, res) => {
  try {
    const { rollNo, name, className, email, phone, password } = req.body;

    const existingStudent = await Student.findOne({ rollNo });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({ rollNo, name, className, email, phone, password: hashedPassword });
    await student.save();

    res.status(201).json({ message: "Student registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    const student = await Student.findOne({ rollNo });
    if (!student) {
      return res.status(400).json({ message: "Invalid Roll No or Password" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ token, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// You can add more: startTest, submitTest, getInstructions, etc later
