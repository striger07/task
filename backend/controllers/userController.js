const User = require('../models/User');

// @route GET /api/users/search?email=
exports.searchUser = async (req, res) => {
  const { email } = req.query;
  if (!email)
    return res.status(400).json({ success: false, message: 'Email query required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('name email avatar');
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  const { name, avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
