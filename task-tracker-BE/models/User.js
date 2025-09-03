const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  // Simple avatar - just initials
  avatar: {
    type: String,
    default: function() {
      return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
  },
  // Basic task tracking
  tasksCompleted: {
    type: Number,
    default: 0
  },
  tasksActive: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Simple method to update task counts
userSchema.methods.updateTaskCounts = async function() {
  const Task = mongoose.model('Task');
  
  const completedTasks = await Task.countDocuments({ 
    assignee: this._id, 
    completed: true 
  });
  
  const activeTasks = await Task.countDocuments({ 
    assignee: this._id, 
    completed: false 
  });
  
  this.tasksCompleted = completedTasks;
  this.tasksActive = activeTasks;
  
  await this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;