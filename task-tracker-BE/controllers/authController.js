// controllers/authController.js
const authService = require('../services/authService');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user._id);
      
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

  // Update user profile
  async updateProfile(req, res) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const result = await authService.changePassword(req.user._id, req.body);
      
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

  // Logout (client-side token removal)
  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

module.exports = new AuthController();