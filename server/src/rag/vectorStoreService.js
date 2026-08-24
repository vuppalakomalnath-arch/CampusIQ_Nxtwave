const DocumentChunk = require('../models/DocumentChunk');
const Document = require('../models/Document');
const KnowledgeBase = require('../models/KnowledgeBase');
const env = require('../config/env');

class VectorStoreService {
  constructor() {
    this.indexName = env.VECTOR_INDEX_NAME;
  }

  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async searchVector(queryEmbedding, filter = {}, limit = 8) {
    // Check if Atlas Vector Search is available
    try {
      const matchFilter = { status: 'ACTIVE' };
      if (filter.knowledgeBaseIds && filter.knowledgeBaseIds.length > 0) {
        matchFilter.knowledgeBase = { $in: filter.knowledgeBaseIds };
      }
      if (filter.department && filter.department !== 'All') {
        matchFilter.department = filter.department;
      }

      // 1. Try MongoDB Atlas $vectorSearch aggregation
      const pipeline = [
        {
          $vectorSearch: {
            index: this.indexName,
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: limit * 10,
            limit: limit,
            filter: matchFilter,
          },
        },
        {
          $project: {
            _id: 1,
            document: 1,
            knowledgeBase: 1,
            versionNumber: 1,
            department: 1,
            text: 1,
            pageNumber: 1,
            chunkIndex: 1,
            heading: 1,
            metadata: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ];

      const results = await DocumentChunk.aggregate(pipeline);
      if (results && results.length > 0) {
        return results.map((r) => ({
          ...r,
          score: Math.min(Math.max(r.score || 0, 0), 1),
        }));
      }
    } catch (atlasErr) {
      // Atlas Vector search index not present or local standalone MongoDB
      // Gracefully fall back to document vector matching
    }

    // 2. Fallback: Exact Cosine Similarity across matching chunks
    const queryFilter = { status: 'ACTIVE' };
    if (filter.knowledgeBaseIds && filter.knowledgeBaseIds.length > 0) {
      queryFilter.knowledgeBase = { $in: filter.knowledgeBaseIds };
    }
    if (filter.department && filter.department !== 'All') {
      queryFilter.department = filter.department;
    }

    const chunks = await DocumentChunk.find(queryFilter)
      .select('+embedding')
      .populate('document', 'title originalFilename')
      .populate('knowledgeBase', 'name slug')
      .lean();

    if (!chunks || chunks.length === 0) {
      return [];
    }

    const scoredChunks = chunks
      .map((chunk) => {
        let score = 0;
        if (chunk.embedding && chunk.embedding.length > 0) {
          score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
        }
        return {
          _id: chunk._id,
          document: chunk.document,
          knowledgeBase: chunk.knowledgeBase,
          versionNumber: chunk.versionNumber,
          department: chunk.department,
          text: chunk.text,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          heading: chunk.heading,
          metadata: chunk.metadata,
          score: Math.min(Math.max(score, 0), 1),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredChunks;
  }
}

module.exports = new VectorStoreService();
