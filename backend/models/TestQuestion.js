import mongoose from 'mongoose';

const testQuestionSchema = new mongoose.Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: [true, 'Test ID is required'],
        index: true
    },
    question: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: {
        type: [String],
        required: [true, 'Options are required'],
        validate: [
            {
                validator: function(arr) {
                    return arr.length === 4;
                },
                message: 'Exactly 4 options are required'
            },
            {
                validator: function(arr) {
                    return arr.every(opt => opt.trim().length > 0);
                },
                message: 'Options cannot be empty'
            }
        ]
    },
    correctAnswer: {
        type: String,
        required: [true, 'Correct answer is required'],
        validate: {
            validator: function(v) {
                return this.options.includes(v);
            },
            message: 'Correct answer must be one of the options'
        }
    },
    type: {
        type: String,
        enum: ['MCQ'],
        default: 'MCQ',
        required: true
    },
    marks: {
        type: Number,
        default: 1,
        min: [1, 'Marks must be at least 1']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: [true, 'Faculty ID is required']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure indexes for better query performance
testQuestionSchema.index({ testId: 1, type: 1 });
testQuestionSchema.index({ createdBy: 1 });

const TestQuestion = mongoose.models.TestQuestion || mongoose.model('TestQuestion', testQuestionSchema);

export default TestQuestion; 