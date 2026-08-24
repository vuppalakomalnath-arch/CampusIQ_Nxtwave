const mongoose = require('mongoose');

const processingJobSchema = new mongoose.Schema(
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
    stage: {
      type: String,
      enum: ['QUEUED', 'PARSING', 'OCR', 'CHUNKING', 'EMBEDDING', 'INDEXING', 'SUMMARIZING', 'COMPLETED', 'FAILED'],
      default: 'QUEUED',
    },
    progressPercent: {
      type: Number,
      default: 0,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    error: {
      type: String,
      default: null,
    },
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        message: String,
        stage: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

processingJobSchema.index({ document: 1, createdAt: -1 });

module.exports = mongoose.model('ProcessingJob', processingJobSchema);
