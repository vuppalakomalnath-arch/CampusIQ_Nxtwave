const hybridSearchService = require('./hybridSearchService');
const rerankerService = require('./rerankerService');
const KnowledgeBase = require('../models/KnowledgeBase');
const env = require('../config/env');

class RetrievalService {
  async retrieveContext(query, user, options = {}) {
    const startTime = Date.now();

    // 1. Determine authorized knowledge bases
    const allowedKBQuery = { status: 'active' };
    if (user.role !== 'admin') {
      allowedKBQuery.allowedRoles = user.role;
    }

    if (options.knowledgeBaseIds && options.knowledgeBaseIds.length > 0) {
      allowedKBQuery._id = { $in: options.knowledgeBaseIds };
    }

    const accessibleKBs = await KnowledgeBase.find(allowedKBQuery).select('_id name department');
    const accessibleKBIds = accessibleKBs.map((kb) => kb._id);

    if (accessibleKBIds.length === 0) {
      return {
        query,
        chunks: [],
        confidenceScore: 0,
        confidenceCategory: 'Unavailable',
        topRelevanceScore: 0,
        retrievedCandidateCount: 0,
        selectedChunkCount: 0,
        searchLatencyMs: Date.now() - startTime,
        isSufficient: false,
      };
    }

    // Filter scope
    const filter = {
      knowledgeBaseIds: accessibleKBIds,
      department: options.department || 'All',
    };

    // 2. Hybrid search (vector + keyword)
    const { candidates, retrievedCandidateCount } = await hybridSearchService.search(
      query,
      filter,
      options.candidateLimit || 12
    );

    // 3. Re-ranking
    const selectedChunks = rerankerService.rerank(
      query,
      candidates,
      options.topK || env.MAX_RETRIEVED_CHUNKS
    );

    // 4. Calculate retrieval relevance / confidence
    const topScore = selectedChunks.length > 0 ? selectedChunks[0].relevanceScore : 0;
    let confidenceCategory = 'Unavailable';
    let isSufficient = false;

    if (topScore >= env.SIMILARITY_THRESHOLD_HIGH && selectedChunks.length >= 1) {
      confidenceCategory = 'High';
      isSufficient = true;
    } else if (topScore >= env.SIMILARITY_THRESHOLD_MED) {
      confidenceCategory = 'Medium';
      isSufficient = true;
    } else if (topScore >= env.SIMILARITY_THRESHOLD_LOW) {
      confidenceCategory = 'Low';
      isSufficient = true;
    } else {
      confidenceCategory = 'Unavailable';
      isSufficient = false;
    }

    return {
      query,
      chunks: selectedChunks,
      confidenceScore: topScore,
      confidenceCategory,
      topRelevanceScore: topScore,
      retrievedCandidateCount,
      selectedChunkCount: selectedChunks.length,
      searchLatencyMs: Date.now() - startTime,
      isSufficient,
    };
  }
}

module.exports = new RetrievalService();
