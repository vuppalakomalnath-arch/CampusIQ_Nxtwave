const DocumentChunk = require('../models/DocumentChunk');
const Document = require('../models/Document');
const KnowledgeBase = require('../models/KnowledgeBase');

class KeywordSearchService {
  async searchKeyword(query, filter = {}, limit = 8) {
    if (!query || typeof query !== 'string') return [];

    const terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const queryFilter = { status: 'ACTIVE' };
    if (filter.knowledgeBaseIds && filter.knowledgeBaseIds.length > 0) {
      queryFilter.knowledgeBase = { $in: filter.knowledgeBaseIds };
    }
    if (filter.department && filter.department !== 'All') {
      queryFilter.department = filter.department;
    }

    // Attempt MongoDB text search first if index exists
    try {
      const textResults = await DocumentChunk.find(
        { ...queryFilter, $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .populate('document', 'title originalFilename')
        .populate('knowledgeBase', 'name slug')
        .lean();

      if (textResults && textResults.length > 0) {
        // Normalize text score to 0..1 scale
        const maxScore = Math.max(...textResults.map((r) => r.score || 1));
        return textResults.map((r) => ({
          ...r,
          score: Math.min((r.score || 0) / (maxScore || 1), 1),
        }));
      }
    } catch (err) {
      // Fall through to regex term search
    }

    // Regex terms fallback
    if (terms.length === 0) return [];
    const regexList = terms.map((t) => new RegExp(t, 'i'));

    const chunks = await DocumentChunk.find({
      ...queryFilter,
      $or: [{ text: { $in: regexList } }, { heading: { $in: regexList } }],
    })
      .limit(limit * 3)
      .populate('document', 'title originalFilename')
      .populate('knowledgeBase', 'name slug')
      .lean();

    // Score based on term frequency and matching density
    const scored = chunks.map((chunk) => {
      const lower = (chunk.text + ' ' + (chunk.heading || '')).toLowerCase();
      let matchCount = 0;
      terms.forEach((term) => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = lower.match(regex);
        if (matches) matchCount += matches.length;
      });

      const score = Math.min(matchCount / (terms.length * 2), 1);
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
        score,
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

module.exports = new KeywordSearchService();
