const express = require('express');
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// Project CRUD routes
router.get('/', projectController.getProjects);
router.get('/stats', projectController.getProjectStats);
router.get('/deadlines', projectController.getUpcomingDeadlines);
router.get('/:id', projectController.getProject);
router.post('/create', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Team management routes
router.post('/:id/team/add', projectController.addTeamMember);
router.post('/:id/team/remove', projectController.removeTeamMember);

module.exports = router;