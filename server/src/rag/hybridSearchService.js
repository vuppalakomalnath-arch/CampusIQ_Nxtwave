const vectorStoreService = require('./vectorStoreService');
const keywordSearchService = require('./keywordSearchService');
const embeddingService = require('./embeddingService');

class HybridSearchService {
  constructor() {
    this.vectorWeight = 0.65;
    this.keywordWeight = 0.35;
  }

  async search(query, filter = {}, limit = 10) {
    // 1. Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // 2. Parallel Vector & Keyword queries
    const [vectorResults, keywordResults] = await Promise.all([
      vectorStoreService.searchVector(queryEmbedding, filter, limit * 2),
      keywordSearchService.searchKeyword(query, filter, limit * 2),
    ]);

    // 3. Merge & Deduplicate candidates using Reciprocal Rank Fusion (RRF) & linear weighted combination
    const candidateMap = new Map();

    // Process vector results
    vectorResults.forEach((item, rank) => {
      const id = item._id.toString();
      const rrfScore = 1 / (60 + rank + 1);
      candidateMap.set(id, {
        chunk: item,
        vectorScore: item.score || 0,
        keywordScore: 0,
        combinedScore: (item.score || 0) * this.vectorWeight,
        rrfScore: rrfScore * this.vectorWeight,
      });
    });

    // Process keyword results
    keywordResults.forEach((item, rank) => {
      const id = item._id.toString();
      const rrfScore = 1 / (60 + rank + 1);
      if (candidateMap.has(id)) {
        const existing = candidateMap.get(id);
        existing.keywordScore = item.score || 0;
        existing.combinedScore += (item.score || 0) * this.keywordWeight;
        existing.rrfScore += rrfScore * this.keywordWeight;
      } else {
        candidateMap.set(id, {
          chunk: item,
          vectorScore: 0,
          keywordScore: item.score || 0,
          combinedScore: (item.score || 0) * this.keywordWeight,
          rrfScore: rrfScore * this.keywordWeight,
        });
      }
    });

    // Sort by weighted combined score
    const candidates = Array.from(candidateMap.values())
      .map((entry) => ({
        ...entry.chunk,
        relevanceScore: Math.min(Math.max(entry.combinedScore, 0), 1),
        vectorScore: entry.vectorScore,
        keywordScore: entry.keywordScore,
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return {
      candidates,
      retrievedCandidateCount: candidateMap.size,
    };
  }
}

module.exports = new HybridSearchService();
