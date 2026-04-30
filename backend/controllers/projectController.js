const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @route GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-createdAt');

    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember)
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/projects
exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const project = await Project.create({ ...req.body, owner: req.user._id });
    await project.populate('owner', 'name email avatar');
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin')
      return res.status(403).json({ success: false, message: 'Admin access required' });

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Only owner can delete project' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/projects/:id/members
exports.addMember = async (req, res) => {
  const { email, role } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' });

    const adminMember = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminMember || adminMember.role !== 'Admin')
      return res.status(403).json({ success: false, message: 'Admin access required' });

    const userToAdd = await User.findOne({ email });
    if (!userToAdd)
      return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyMember = project.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember)
      return res.status(400).json({ success: false, message: 'User already a member' });

    project.members.push({ user: userToAdd._id, role: role || 'Member' });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/projects/:id/members/:userId
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' });

    const adminMember = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminMember || adminMember.role !== 'Admin')
      return res.status(403).json({ success: false, message: 'Admin access required' });

    if (project.owner.toString() === req.params.userId)
      return res.status(400).json({ success: false, message: 'Cannot remove project owner' });

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/projects/:id/stats
exports.getProjectStats = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id });
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t => t.isOverdue).length,
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
