import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the model
const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty; 