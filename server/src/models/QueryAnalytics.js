const mongoose = require('mongoose');

const queryAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedQuery: {
      type: String,
      lowercase: true,
      trim: true,
    },
    knowledgeBasesSearched: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeBase',
      },
    ],
    department: {
      type: String,
      default: 'General',
    },
    retrievalLatencyMs: {
      type: Number,
      default: 0,
    },
    generationLatencyMs: {
      type: Number,
      default: 0,
    },
    candidateCount: {
      type: Number,
      default: 0,
    },
    selectedChunkCount: {
      type: Number,
      default: 0,
    },
    topRelevanceScore: {
      type: Number,
      default: 0,
    },
    confidenceCategory: {
      type: String,
      enum: ['High', 'Medium', 'Low', 'Unavailable'],
      default: 'Unavailable',
    },
    answerStatus: {
      type: String,
      enum: ['GROUNDED', 'UNAVAILABLE', 'ERROR'],
      default: 'GROUNDED',
    },
    feedbackRating: {
      type: String,
      enum: ['helpful', 'not_helpful', 'none'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

queryAnalyticsSchema.index({ createdAt: -1 });
queryAnalyticsSchema.index({ confidenceCategory: 1, createdAt: -1 });
queryAnalyticsSchema.index({ answerStatus: 1 });

module.exports = mongoose.model('QueryAnalytics', queryAnalyticsSchema);
