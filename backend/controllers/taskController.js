const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

const checkProjectAccess = async (projectId, userId, requireAdmin = false) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };

  const member = project.members.find(m => m.user.toString() === userId.toString());
  if (!member) return { error: 'Access denied', status: 403 };
  if (requireAdmin && member.role !== 'Admin') return { error: 'Admin required', status: 403 };

  return { project, member };
};

// @route GET /api/tasks/project/:projectId
exports.getTasksByProject = async (req, res) => {
  try {
    const { error, status } = await checkProjectAccess(req.params.projectId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const filter = { project: req.params.projectId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/tasks/my
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('assignedTo', 'name email avatar')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/tasks
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { error, status } = await checkProjectAccess(req.body.project, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' });

    const { error, status, member } = await checkProjectAccess(task.project, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    // Members can only update status of tasks assigned to them
    if (member.role !== 'Admin') {
      const allowed = ['status'];
      const keys = Object.keys(req.body);
      const invalid = keys.filter(k => !allowed.includes(k));
      if (invalid.length > 0)
        return res.status(403).json({ success: false, message: 'Members can only update task status' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' });

    const { error, status, member } = await checkProjectAccess(task.project, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    if (member.role !== 'Admin' && task.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/tasks/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id }).select('_id');
    const projectIds = projects.map(p => p._id);

    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name');

    const myTasks = await Task.find({ assignedTo: req.user._id }).populate('project', 'name');

    const now = new Date();
    const stats = {
      totalProjects: projectIds.length,
      totalTasks: allTasks.length,
      myTasks: myTasks.length,
      overdue: myTasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'done').length,
      byStatus: {
        todo: myTasks.filter(t => t.status === 'todo').length,
        inProgress: myTasks.filter(t => t.status === 'in-progress').length,
        review: myTasks.filter(t => t.status === 'review').length,
        done: myTasks.filter(t => t.status === 'done').length,
      },
      recentTasks: myTasks.slice(0, 5)
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
