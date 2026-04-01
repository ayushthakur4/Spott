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
    locationName: {
      type: String,
      default: '',
    },
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
      },
    },
    type: {
      type: String,
      enum: ['Police Alert', 'Accident', 'Viewpoint', 'Picnic', 'Couple Safe', 'Cafe', 'Random'],
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
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// 2dsphere index on geo coordinates for spatial feeds
postSchema.index({ geo: '2dsphere' });

module.exports = mongoose.model('Post', postSchema);
