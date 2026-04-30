const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, getProject, createProject, updateProject, deleteProject,
  addMember, removeMember, getProjectStats
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getProjects)
  .post([body('name').trim().notEmpty().withMessage('Project name required')], createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.get('/:id/stats', getProjectStats);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
