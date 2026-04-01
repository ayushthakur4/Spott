const Post = require('../models/Post');
const { cloudinary } = require('../config/cloudinary');

// Get all posts for feed
const getPosts = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    let filter = {
      $expr: { $lt: [{ $size: { $ifNull: ["$reports", []] } }, 5] }
    };

    if (lat && lng) {
      filter.geo = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: 15000 // 15km
        }
      };
    }

    const posts = await Post.find(filter)
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 }); // Sorting with $near might be ignored by MongoDB as $near natively sorts by distance, which is actually better. So we'll leave sort but MongoDB ignores it for geo queries.

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    const { lat, lng, type, description, locationName } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    if (!lat || !lng || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const post = await Post.create({
      user: req.user.id,
      image: imageUrl,
      location: {
        lat: Number(lat),
        lng: Number(lng),
      },
      locationName: locationName || '',
      geo: {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      },
      type,
      description,
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

// Delete Post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check user ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    // Delete image from Cloudinary if it exists
    if (post.image) {
      try {
        const splits = post.image.split('/');
        const folderAndFile = splits.slice(-2).join('/'); // e.g., 'road-alert-hangout/filename.jpg'
        const publicId = folderAndFile.split('.')[0]; // e.g., 'road-alert-hangout/filename'
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    await post.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Report Post
const reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.reports.includes(req.user.id)) {
      post.reports.push(req.user.id);
      await post.save();
    }

    res.status(200).json({ message: 'Post reported' });
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
  deletePost,
  reportPost,
};
