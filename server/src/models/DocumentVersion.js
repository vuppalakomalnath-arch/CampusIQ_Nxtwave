const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    storageLocation: {
      type: String,
      required: true,
    },
    contentHash: {
      type: String,
      default: '',
    },
    extractedTextMetadata: {
      charCount: { type: Number, default: 0 },
      wordCount: { type: Number, default: 0 },
      pageCount: { type: Number, default: 1 },
    },
    processingStatus: {
      type: String,
      enum: ['UPLOADED', 'PROCESSING', 'READY', 'FAILED'],
      default: 'UPLOADED',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    processingError: {
      type: String,
      default: null,
    },
    changeNotes: {
      type: String,
      default: 'Initial upload',
    },
  },
  {
    timestamps: true,
  }
);

documentVersionSchema.index({ document: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);
