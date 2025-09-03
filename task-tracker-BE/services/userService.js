// services/userService.js
const User = require('../models/User');
const Activity = require('../models/Activity');

class UserService {
  // Get all users with filtering and pagination
  async getUsers(filters = {}, page = 1, limit = 10) {
    const query = {};
    
    // Apply filters
    if (filters.department) {
      query.department = filters.department;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { role: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Update user
  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    // Log activity
    await Activity.logActivity({
      user: userId,
      action: 'updated',
      actionType: 'user',
      targetId: userId,
      targetModel: 'User',
      details: { description: 'User profile updated' }
    });

    return user;
  }

  // Delete user
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Log activity
    await Activity.logActivity({
      user: userId,
      action: 'deleted',
      actionType: 'user',
      targetId: userId,
      targetModel: 'User',
      details: { description: 'User account deleted' }
    });

    return { message: 'User deleted successfully' };
  }

  // Get user statistics
  async getUserStats() {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const departmentStats = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const avgProductivity = await User.aggregate([
      { $group: { _id: null, avg: { $avg: '$productivity' } } }
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      departmentStats,
      avgProductivity: avgProductivity[0]?.avg || 0
    };
  }

  // Update user metrics
  async updateUserMetrics(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.updateMetrics();
    return user;
  }
}

module.exports = new UserService();