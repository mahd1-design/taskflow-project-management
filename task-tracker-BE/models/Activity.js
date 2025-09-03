const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created', 'updated', 'deleted', 'completed', 'assigned',
      'commented', 'starred', 'unstarred', 'archived', 'restored'
    ]
  },
  actionType: {
    type: String,
    required: true,
    enum: ['task', 'project', 'user', 'comment']
  },
  targetId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['Task', 'Project', 'User']
  },
  details: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    description: String
  },
  metadata: {
    ip: String,
    userAgent: String,
    location: String
  }
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ targetId: 1, targetModel: 1 });
activitySchema.index({ actionType: 1 });
activitySchema.index({ createdAt: -1 });

// Static method to log activity
activitySchema.statics.logActivity = async function(data) {
  try {
    await this.create(data);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = mongoose.model('Activity', activitySchema);