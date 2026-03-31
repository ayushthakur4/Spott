const Post = require('../models/Post');

// Get all posts for feed
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    const { lat, lng, type, description } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    if (!lat || !lng || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let expiresAt = undefined;

    // Set auto-expiry for specific alerts
    if (type === 'Police Alert') {
      expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    } else if (type === 'Accident') {
      expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
    }

    const post = await Post.create({
      user: req.user.id,
      image: imageUrl,
      location: {
        lat: Number(lat),
        lng: Number(lng),
      },
      type,
      description,
      expiresAt,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle Upvote Post
const upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;

    // Remove from downvotes first if exist
    const downvoteIndex = post.downvotes.indexOf(userId);
    if (downvoteIndex !== -1) {
      post.downvotes.splice(downvoteIndex, 1);
    }

    const upvoteIndex = post.upvotes.indexOf(userId);
    if (upvoteIndex === -1) {
      post.upvotes.push(userId);
    } else {
      post.upvotes.splice(upvoteIndex, 1);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Downvote Post
const downvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;

    // Remove from upvotes first if exist
    const upvoteIndex = post.upvotes.indexOf(userId);
    if (upvoteIndex !== -1) {
      post.upvotes.splice(upvoteIndex, 1);
    }

    const downvoteIndex = post.downvotes.indexOf(userId);
    if (downvoteIndex === -1) {
      post.downvotes.push(userId);
    } else {
      post.downvotes.splice(downvoteIndex, 1);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.user.id,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage');

    res.status(201).json(populatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  createPost,
  upvotePost,
  downvotePost,
  addComment,
};
