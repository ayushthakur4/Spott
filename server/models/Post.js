const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    type: {
      type: String,
      enum: ['Police Alert', 'Accident', 'Viewpoint', 'Picnic', 'Couple Safe', 'Cafe'],
      required: true,
    },
    description: {
      type: String,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        date: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

// TTL index on expiresAt. Documents will be automatically deleted after the specified date.
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Post', postSchema);
