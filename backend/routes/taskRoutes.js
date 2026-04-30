const express = require('express');
const { body } = require('express-validator');
const {
  getTasksByProject, getMyTasks, createTask, updateTask, deleteTask, getDashboardStats
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/my', getMyTasks);
router.get('/project/:projectId', getTasksByProject);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Task title required'),
  body('project').notEmpty().withMessage('Project ID required')
], createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
