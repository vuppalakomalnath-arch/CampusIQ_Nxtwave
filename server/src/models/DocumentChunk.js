const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    knowledgeBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeBase',
      required: true,
    },
    department: {
      type: String,
      default: 'General',
    },
    text: {
      type: String,
      required: true,
    },
    // Dense vector embedding representation (dimension e.g. 768 for gemini or 1536 for openai/openrouter)
    embedding: {
      type: [Number],
      default: undefined,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    heading: {
      type: String,
      default: '',
    },
    metadata: {
      documentTitle: { type: String, default: '' },
      originalFilename: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      sourceUrl: { type: String, default: '' },
      collectionSlug: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast keyword search, collection filtering and version scoping
documentChunkSchema.index({ knowledgeBase: 1, status: 1 });
documentChunkSchema.index({ document: 1, versionNumber: 1 });
documentChunkSchema.index({ text: 'text' });

module.exports = mongoose.model('DocumentChunk', documentChunkSchema);
