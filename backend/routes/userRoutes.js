const express = require('express');
const { searchUser, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/search', searchUser);
router.put('/profile', updateProfile);

module.exports = router;
