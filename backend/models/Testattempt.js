import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: mongoose.Schema.Types.Mixed,  // string for MCQ/NAT, array for MSQ
      isCorrect: Boolean
    }
  ],
  score: { type: Number, default: 0 },
  timeTaken: { type: Number, required: true },  // in minutes
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);
export default TestAttempt;
