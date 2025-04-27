import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
    }
  }],
  totalMarks: {
    type: Number,
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pass', 'fail'],
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  timeTaken: {
    type: Number, // in minutes
    required: true,
  }
});

// Index for efficient querying of results
resultSchema.index({ testId: 1, studentId: 1 });

const Result = mongoose.model('Result', resultSchema);

export default Result; 