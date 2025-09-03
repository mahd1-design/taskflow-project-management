const projectService = require('../services/projectService');

class ProjectController {
  // Get all projects
  async getProjects(req, res) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        category: req.query.category,
        search: req.query.search,
        limit: parseInt(req.query.limit) || 100
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const projects = await projectService.getProjects(req.user._id, filters);
      
      res.status(200).json({
        success: true,
        data: { projects }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get single project
  async getProject(req, res) {
    try {
      const project = await projectService.getProject(req.params.id, req.user._id);
      
      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new project
  async createProject(req, res) {
    try {
      const project = await projectService.createProject(req.user._id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: { project }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update project
  async updateProject(req, res) {
    try {
      const project = await projectService.updateProject(req.params.id, req.user._id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: { project }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete project
  async deleteProject(req, res) {
    try {
      const result = await projectService.deleteProject(req.params.id, req.user._id);
      
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

  // Add team member
  async addTeamMember(req, res) {
    try {
      const { memberName } = req.body;
      const project = await projectService.addTeamMember(req.params.id, req.user._id, memberName);
      
      res.status(200).json({
        success: true,
        message: 'Team member added successfully',
        data: { project }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove team member
  async removeTeamMember(req, res) {
    try {
      const { memberName } = req.body;
      const project = await projectService.removeTeamMember(req.params.id, req.user._id, memberName);
      
      res.status(200).json({
        success: true,
        message: 'Team member removed successfully',
        data: { project }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get project statistics
  async getProjectStats(req, res) {
    try {
      const stats = await projectService.getProjectStats(req.user._id);
      
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

  // Get upcoming deadlines
  async getUpcomingDeadlines(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const projects = await projectService.getUpcomingDeadlines(req.user._id, days);
      
      res.status(200).json({
        success: true,
        data: { projects }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      }); 
    }
  }
}
module.exports = new ProjectController();