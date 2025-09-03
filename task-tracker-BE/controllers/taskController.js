const taskService = require('../services/taskService');

class TaskController {
  // Get all tasks
  async getTasks(req, res) {
    try {
      const filters = {
        completed: req.query.completed,
        priority: req.query.priority,
        category: req.query.category,
        starred: req.query.starred,
        search: req.query.search,
        limit: parseInt(req.query.limit) || 100
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const tasks = await taskService.getTasks(req.user._id, filters);
      
      res.status(200).json({
        success: true,
        data: { tasks }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get single task
  async getTask(req, res) {
    try {
      const task = await taskService.getTask(req.params.id, req.user._id);
      
      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new task
  async createTask(req, res) {
    try {
      const task = await taskService.createTask(req.user._id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update task
  async updateTask(req, res) {
    try {
      const task = await taskService.updateTask(req.params.id, req.user._id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: { task }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Toggle task completion
  async toggleTask(req, res) {
    try {
      const task = await taskService.toggleTask(req.params.id, req.user._id);
      
      res.status(200).json({
        success: true,
        message: 'Task toggled successfully',
        data: { task }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Toggle task star
  async toggleStar(req, res) {
    try {
      const task = await taskService.toggleStar(req.params.id, req.user._id);
      
      res.status(200).json({
        success: true,
        message: 'Task starred/unstarred successfully',
        data: { task }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete task
  async deleteTask(req, res) {
    try {
      const result = await taskService.deleteTask(req.params.id, req.user._id);
      
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

  // Get task statistics
  async getTaskStats(req, res) {
    try {
      const stats = await taskService.getTaskStats(req.user._id);
      
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

  // Get upcoming tasks
  async getUpcomingTasks(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      const tasks = await taskService.getUpcomingTasks(req.user._id, days);
      
      res.status(200).json({
        success: true,
        data: { tasks }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TaskController();