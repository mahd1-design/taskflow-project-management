// services/taskService.js
const { Task, User } = require('../models');

class TaskService {
  // Get all tasks for a user
  async getTasks(userId, filters = {}) {
    const query = { userId };

    // Apply filters
    if (filters.completed !== undefined) {
      query.completed = filters.completed;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.starred !== undefined) {
      query.starred = filters.starred;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { assignee: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100);

    return tasks;
  }

  // Get single task
  async getTask(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  // Create new task
  async createTask(userId, taskData) {
    const {
      title,
      description,
      priority = 'medium',
      category = 'Business',
      dueDate,
      assignee
    } = taskData;

    if (!title || !dueDate || !assignee) {
      throw new Error('Title, due date, and assignee are required');
    }

    const task = await Task.create({
      title,
      description,
      priority,
      category,
      dueDate,
      assignee,
      userId
    });

    // Update user task counts
    await this.updateUserTaskCounts(userId);

    return task;
  }

  // Update task
  async updateTask(taskId, userId, updateData) {
    const allowedUpdates = [
      'title', 'description', 'priority', 'category', 
      'dueDate', 'assignee', 'completed', 'starred'
    ];

    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new Error('Task not found');
    }

    // Update user task counts if completion status changed
    if (updateData.hasOwnProperty('completed')) {
      await this.updateUserTaskCounts(userId);
    }

    return task;
  }

  // Toggle task completion
  async toggleTask(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw new Error('Task not found');
    }

    task.completed = !task.completed;
    await task.save();

    // Update user task counts
    await this.updateUserTaskCounts(userId);

    return task;
  }

  // Toggle task star
  async toggleStar(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw new Error('Task not found');
    }

    task.starred = !task.starred;
    await task.save();

    return task;
  }

  // Delete task
  async deleteTask(taskId, userId) {
    const task = await Task.findOneAndDelete({ _id: taskId, userId });
    if (!task) {
      throw new Error('Task not found');
    }

    // Update user task counts
    await this.updateUserTaskCounts(userId);

    return { message: 'Task deleted successfully' };
  }

  // Get task statistics
  async getTaskStats(userId) {
    const stats = await Task.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          pending: { $sum: { $cond: ['$completed', 0, 1] } },
          starred: { $sum: { $cond: ['$starred', 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$completed', false] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      starred: 0,
      overdue: 0
    };
  }

  // Get tasks by priority
  async getTasksByPriority(userId) {
    const tasks = await Task.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } }
        }
      }
    ]);

    return tasks;
  }

  // Get upcoming tasks (due in next 7 days)
  async getUpcomingTasks(userId, days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const tasks = await Task.find({
      userId,
      completed: false,
      dueDate: {
        $gte: new Date(),
        $lte: endDate
      }
    }).sort({ dueDate: 1 });

    return tasks;
  }

  // Helper method to update user task counts
  async updateUserTaskCounts(userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        await user.updateTaskCounts();
      }
    } catch (error) {
      console.error('Error updating user task counts:', error);
    }
  }
}

module.exports = new TaskService();