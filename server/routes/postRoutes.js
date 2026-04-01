const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  upvotePost,
  downvotePost,
  addComment,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getPosts);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id/upvote', protect, upvotePost);
router.put('/:id/downvote', protect, downvotePost);
router.post('/:id/comments', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;
