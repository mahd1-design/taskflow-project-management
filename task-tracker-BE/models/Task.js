const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Business', 'Development', 'Design', 'Finance', 'Security', 'Marketing'],
    default: 'Business'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  assignee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Assignee is required']
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project'
  },
  starred: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'completed'],
    default: 'todo'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: Date,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
taskSchema.index({ assignee: 1, completed: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ starred: 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return !this.completed && this.dueDate < new Date();
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update completion timestamp
taskSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed) {
    this.completedAt = new Date();
    this.status = 'completed';
  } else if (this.isModified('completed') && !this.completed) {
    this.completedAt = undefined;
    this.status = 'todo';
  }
  next();
});

// Post-save middleware to update user metrics
taskSchema.post('save', async function() {
  const User = mongoose.model('User');
  const assignee = await User.findById(this.assignee);
  if (assignee) {
    await assignee.updateMetrics();
  }
});

module.exports = mongoose.model('Task', taskSchema);