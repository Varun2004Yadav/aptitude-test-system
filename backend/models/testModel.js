import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  instructions: {
    type: String,
    required: [true, 'Test instructions are required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  questions: [{
    questionText: {
      type: String,
      required: [true, 'Question text is required']
    },
    options: [{
      type: String,
      required: [true, 'Options are required']
    }],
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required']
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [1, 'Marks must be at least 1']
    }
  }],
  totalMarks: {
    type: Number,
    required: [true, 'Total marks are required']
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Faculty ID is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of active tests
testSchema.index({ startTime: 1, duration: 1 });

// Check if model exists before creating it
const Test = mongoose.models.Test || mongoose.model('Test', testSchema);

export { Test }; 