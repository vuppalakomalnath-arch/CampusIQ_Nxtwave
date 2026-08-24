const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    storageLocation: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      default: 0,
    },
    knowledgeBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeBase',
      required: [true, 'Knowledge base reference is required'],
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    status: {
      type: String,
      enum: ['UPLOADED', 'PROCESSING', 'READY', 'FAILED', 'ARCHIVED'],
      default: 'UPLOADED',
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    ocrStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'SUCCESS', 'FAILED'],
      default: 'NOT_REQUIRED',
    },
    extractedTextMetadata: {
      charCount: { type: Number, default: 0 },
      wordCount: { type: Number, default: 0 },
      pageCount: { type: Number, default: 1 },
      language: { type: String, default: 'en' },
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      default: '',
    },
    faqList: [
      {
        question: String,
        answer: String,
      },
    ],
    processingError: {
      type: String,
      default: null,
    },
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

documentSchema.index({ knowledgeBase: 1, status: 1 });
documentSchema.index({ department: 1 });

module.exports = mongoose.model('Document', documentSchema);
