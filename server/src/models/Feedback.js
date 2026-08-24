const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
    },
    rating: {
      type: String,
      enum: ['helpful', 'not_helpful'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    retrievalMetadataSnapshot: {
      topRelevanceScore: Number,
      confidenceCategory: String,
      sourceCount: Number,
      answerStatus: String,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ message: 1, user: 1 }, { unique: true });
feedbackSchema.index({ rating: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
