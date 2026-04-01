const User = require('../models/User');
const Post = require('../models/Post');

// Get User Profile (Public)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: req.params.id })
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 });

    // Calculate Trust Score
    let trustScore = 0;
    posts.forEach(post => {
      trustScore += (post.upvotes.length - post.downvotes.length);
    });

    res.status(200).json({
      user,
      posts,
      trustScore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Save Post
const toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postId = req.params.postId;
    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      // Remove it
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId.toString());
    } else {
      // Add it
      user.savedPosts.push(postId);
    }

    await user.save();
    res.status(200).json(user.savedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile avatar
const updateProfile = async (req, res) => {
  try {
    const { profileImage } = req.body;
    if (!profileImage) return res.status(400).json({ message: 'Profile image is required' });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage },
      { new: true }
    ).select('-password');

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  toggleSavePost,
  updateProfile
};
