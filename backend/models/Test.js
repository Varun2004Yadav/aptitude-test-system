import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  className: { type: String, required: true },   // Which class this test belongs to
  section: { type: String, required: true },
  questions: [
    {
      questionText: String,
      options: [String],  // for MCQ and MSQ
      correctAnswer: mongoose.Schema.Types.Mixed,  // string for MCQ, array for MSQ
      type: { type: String, enum: ["MCQ", "MSQ", "NAT"], required: true }
    }
  ],
  timeLimit: { type: Number, required: true },  // in minutes
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }
}, { timestamps: true });

const Test = mongoose.model("Test", testSchema);
export default Test;
