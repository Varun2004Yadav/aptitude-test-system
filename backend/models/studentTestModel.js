import mongoose from 'mongoose';

const studentTestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: [true, 'Test ID is required']
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Question ID is required']
    },
    selectedAnswer: {
      type: String,
      required: [true, 'Selected answer is required']
    },
    isCorrect: {
      type: Boolean,
      required: [true, 'Is correct flag is required']
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required']
    }
  }],
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required']
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained is required']
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required']
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  timeTaken: {
    type: Number // in minutes
  }
});

// Index for efficient querying
studentTestSchema.index({ studentId: 1, testId: 1 });

// Check if model exists before creating it
const StudentTest = mongoose.models.StudentTest || mongoose.model('StudentTest', studentTestSchema);

export { StudentTest }; 