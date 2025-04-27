import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  className: { type: String, required: true },   // Class like B.Tech CSE 3rd Year
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  illegalAttempts: { type: Number, default: 0 },  // for tracking cheating attempts
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;
