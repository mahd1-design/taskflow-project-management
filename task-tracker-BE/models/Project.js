const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Development', 'Design', 'Security', 'Analytics', 'Mobile', 'Marketing'],
    default: 'Development'
  },
  budget: {
    type: String, // Simple string like "$50,000"
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  completedAt: Date,
  // Simple team array with names
  team: [{
    type: String
  }],
  projectManager: {
    type: String,
    required: [true, 'Project manager is required']
  },
  client: {
    type: String
  },
  // User who created the project
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ userId: 1 });

// Virtual for overdue status
projectSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && this.deadline < new Date();
});

// Pre-save middleware
projectSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = undefined;
  }
  next();
});


module.exports = mongoose.model('Project', projectSchema);
