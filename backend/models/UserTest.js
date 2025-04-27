import mongoose from "mongoose";

const userTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  score: { type: Number, default: 0 },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean
    }
  ],
  timeTaken: { type: Number, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const UserTest = mongoose.model("UserTest", userTestSchema);
export default UserTest; 