class RerankerService {
  rerank(query, candidates, topK = 6) {
    if (!candidates || candidates.length === 0) return [];

    const queryTokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    const scored = candidates.map((cand) => {
      let boost = 0;
      const textLower = cand.text.toLowerCase();
      const headingLower = (cand.heading || '').toLowerCase();

      // Heading exact matches give strong context relevance
      queryTokens.forEach((token) => {
        if (headingLower.includes(token)) boost += 0.15;
        if (textLower.includes(token)) boost += 0.05;
      });

      // Prefer chunks with rich metadata and structured paragraphs
      if (cand.metadata?.documentTitle) {
        boost += 0.05;
      }

      const finalScore = Math.min((cand.relevanceScore || 0) * 0.8 + boost, 1.0);

      return {
        ...cand,
        relevanceScore: Number(finalScore.toFixed(4)),
      };
    });

    return scored.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, topK);
  }
}

module.exports = new RerankerService();
