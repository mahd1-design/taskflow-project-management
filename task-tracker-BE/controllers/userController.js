// controllers/userController.js
const userService = require('../services/userService');

class UserController {
  // Get all users with filtering and pagination
  async getUsers(req, res) {
    try {
      const filters = {
        department: req.query.department,
        status: req.query.status,
        search: req.query.search
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await userService.getUsers(filters, page, limit);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get single user by ID
  async getUser(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const stats = await userService.getUserStats();
      
      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user metrics
  async updateUserMetrics(req, res) {
    try {
      const user = await userService.updateUserMetrics(req.params.id);
      
      res.status(200).json({
        success: true,
        message: 'User metrics updated successfully',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Search users (lightweight for autocomplete)
  async searchUsers(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const filters = { search: q };
      const result = await userService.getUsers(filters, 1, parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: { 
          users: result.users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            department: user.department,
            role: user.role,
            avatar: user.avatar
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();

