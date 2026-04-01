const express = require('express');
const router = express.Router();
const { getUserProfile, toggleSavePost, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile/:id', getUserProfile);
router.post('/save/:postId', protect, toggleSavePost);
router.put('/profile', protect, updateProfile);

module.exports = router;
