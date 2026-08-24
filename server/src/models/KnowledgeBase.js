const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Knowledge base name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['global', 'department'],
      default: 'global',
    },
    department: {
      type: String,
      default: 'All',
      trim: true,
    },
    allowedRoles: {
      type: [String],
      enum: ['student', 'faculty', 'admin'],
      default: ['student', 'faculty', 'admin'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    documentCount: {
      type: Number,
      default: 0,
    },
    suggestedQuestions: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeBaseSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
