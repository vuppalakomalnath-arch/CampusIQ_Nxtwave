const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
    },
    selectedKnowledgeBases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeBase',
      },
    ],
    departmentScope: {
      type: String,
      default: 'All',
    },
    language: {
      type: String,
      default: 'en',
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
