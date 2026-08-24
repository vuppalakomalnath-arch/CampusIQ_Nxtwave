const mongoose = require('mongoose');

const sourceReferenceSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    documentTitle: String,
    collectionName: String,
    department: String,
    versionNumber: Number,
    pageNumber: Number,
    chunkIndex: Number,
    relevanceScore: Number,
    snippet: String,
    highlightPassage: String,
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    answerStatus: {
      type: String,
      enum: ['GROUNDED', 'UNAVAILABLE', 'ERROR'],
      default: 'GROUNDED',
    },
    sourceReferences: [sourceReferenceSchema],
    retrievalMetadata: {
      retrievalMethod: { type: String, default: 'hybrid' },
      retrievedCandidateCount: { type: Number, default: 0 },
      selectedChunkCount: { type: Number, default: 0 },
      topRelevanceScore: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
      confidenceCategory: {
        type: String,
        enum: ['High', 'Medium', 'Low', 'Unavailable'],
        default: 'Unavailable',
      },
      searchLatencyMs: { type: Number, default: 0 },
      generationLatencyMs: { type: Number, default: 0 },
    },
    providerMetadata: {
      provider: { type: String, default: 'openrouter' },
      model: { type: String, default: 'claude-3.5-haiku' },
      tokensUsed: { type: Number, default: 0 },
    },
    suggestedFollowUps: [String],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
