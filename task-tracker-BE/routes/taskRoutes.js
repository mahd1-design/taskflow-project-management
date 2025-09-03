const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// Task CRUD routes
router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/upcoming', taskController.getUpcomingTasks);
router.get('/:id', taskController.getTask);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/toggle', taskController.toggleTask);
router.patch('/:id/star', taskController.toggleStar);
router.delete('/:id', taskController.deleteTask);

module.exports = router;