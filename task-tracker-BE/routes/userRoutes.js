// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// User discovery and search routes
router.get('/', userController.getUsers);
router.get('/search', userController.searchUsers);
router.get('/stats', userController.getUserStats);

// Individual user routes
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// User metrics route
router.put('/:id/metrics', userController.updateUserMetrics);

module.exports = router;

