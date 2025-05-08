import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const facultySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  department: { 
    type: String, 
    required: [true, 'Department is required'],
    trim: true,
    uppercase: true,
    enum: {
      values: ['CSE', 'ECE', 'ME', 'CE', 'BCA', 'MCA'],
      message: '{VALUE} is not a valid department'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [
      /^[0-9]{10}$/,
      'Please enter a valid 10-digit phone number'
    ],
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
  username: { type: String, trim: true, unique: true, sparse: true },
  country: { type: String, trim: true },
  city: { type: String, trim: true },
  pinCode: { type: String, trim: true },
  profilePicture: { type: String, trim: true },
}, {
  timestamps: true,
  collection: 'faculty'
});

// Pre-save middleware to handle email and department
facultySchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  if (this.department) {
    this.department = this.department.toUpperCase().trim();
  }
  next();
});

// Index for better query performance
facultySchema.index({ email: 1 }, { unique: true });
facultySchema.index({ phone: 1 }, { unique: true });

// Method to compare password
facultySchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcryptjs.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

const Faculty = mongoose.model("Faculty", facultySchema);
export default Faculty;
