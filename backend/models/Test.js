import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        trim: true
    },
    description: { 
        type: String, 
        default: '',
        trim: true
    },
    duration: { 
        type: Number, 
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute']
    },
    totalMarks: { 
        type: Number, 
        required: [true, 'Total marks is required'],
        min: [1, 'Total marks must be at least 1']
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Faculty", 
        required: [true, 'Faculty ID is required']
    },
    status: { 
        type: String, 
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for questions
testSchema.virtual('questions', {
    ref: 'TestQuestion',
    localField: '_id',
    foreignField: 'testId'
});

// Ensure indexes for better query performance
testSchema.index({ createdBy: 1, status: 1 });
testSchema.index({ status: 1 });

// ✅ Check if the model already exists to prevent OverwriteModelError
const Test = mongoose.models.Test || mongoose.model("Test", testSchema);

export default Test;