const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Check if user is Admin in a project
exports.requireProjectAdmin = (projectField = 'project') => async (req, res, next) => {
  const Project = require('../models/Project');
  const projectId = req.params.projectId || req.body.project || req.params.id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const member = project.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.project = project;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
