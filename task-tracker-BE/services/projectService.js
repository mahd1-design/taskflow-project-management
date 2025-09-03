// services/projectService.js
const Project  = require('../models/Project');
const mongoose = require('mongoose');
class ProjectService {
  // Get all projects for a user
  async getProjects(userId, filters = {}) {
    const query = { userId };

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { category: { $regex: filters.search, $options: 'i' } },
        { projectManager: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100);

    // Add task counts and progress for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const projectObj = project.toObject();
        
        // Get task counts (if you decide to link tasks to projects later)
        // For now, we'll set default values
        projectObj.tasks = 0;
        projectObj.completed = 0;
        projectObj.progress = 0;

        return projectObj;
      })
    );

    return projectsWithStats;
  }

  // Get single project
  async getProject(projectId, userId) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found');
    }

    // Add task statistics
    const projectObj = project.toObject();
    projectObj.tasks = 0;
    projectObj.completed = 0;
    projectObj.progress = 0;

    return projectObj;
  }

  // Create new project
  async createProject(userId, projectData) {
    const {
      name,
      description,
      status = 'planning',
      priority = 'medium',
      category = 'Development',
      budget,
      startDate,
      deadline,
      projectManager,
      client,
      team = []
    } = projectData;

    if (!name || !description || !deadline || !projectManager) {
      throw new Error('Name, description, deadline, and project manager are required');
    }

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      category,
      budget,
      startDate: startDate || new Date(),
      deadline,
      projectManager,
      client,
      team,
      userId
    });

    return project;
  }

  // Update project
  async updateProject(projectId, userId, updateData) {
    const allowedUpdates = [
      'name', 'description', 'status', 'priority', 'category',
      'budget', 'startDate', 'deadline', 'projectManager', 'client', 'team'
    ];

    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  // Delete project
  async deleteProject(projectId, userId) {
    const project = await Project.findOneAndDelete({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found');
    }

    return { message: 'Project deleted successfully' };
  }

  // Add team member to project
  async addTeamMember(projectId, userId, memberName) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.team.includes(memberName)) {
      project.team.push(memberName);
      await project.save();
    }

    return project;
  }

  // Remove team member from project
  async removeTeamMember(projectId, userId, memberName) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found');
    }

    project.team = project.team.filter(member => member !== memberName);
    await project.save();

    return project;
  }

  // Get project statistics
  async getProjectStats(userId) {
    const stats = await Project.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          planning: { $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $lt: ['$deadline', new Date()] }
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
      active: 0,
      completed: 0,
      planning: 0,
      overdue: 0
    };
  }

  // Get projects by status
  async getProjectsByStatus(userId) {
    const projects = await Project.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return projects;
  }

  // Get upcoming deadlines
  async getUpcomingDeadlines(userId, days = 30) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const projects = await Project.find({
      userId,
      status: { $ne: 'completed' },
      deadline: {
        $gte: new Date(),
        $lte: endDate
      }
    }).sort({ deadline: 1 });

    return projects;
  }

  // Update project progress (for future use when tasks are linked)
  async updateProjectProgress(projectId) {
    // This would calculate progress based on linked tasks
    // For now, it's a placeholder
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // In the future, calculate based on tasks
    // const totalTasks = await Task.countDocuments({ project: projectId });
    // const completedTasks = await Task.countDocuments({ project: projectId, completed: true });
    // const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return project;
  }
}

module.exports = new ProjectService();