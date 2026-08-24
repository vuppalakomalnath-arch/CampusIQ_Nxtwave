const providerFactory = require('./providerFactory');

class SummaryGenerator {
  async generateSummary(documentText, title = '') {
    if (!documentText || documentText.length < 50) {
      return 'Brief document with minimal text content.';
    }

    const provider = providerFactory.getProvider();
    if (!provider) {
      // Return first 300 characters as excerpt
      return documentText.slice(0, 300) + '...';
    }

    const systemPrompt =
      'You are an institutional document summarizer. Create a clear, professional 2-3 sentence executive summary of the college document highlighting its primary purpose, affected departments, key dates, or policies.';
    const userPrompt = `Document Title: ${title}\n\nDocument Text:\n${documentText.slice(0, 4000)}`;

    try {
      const result = await provider.generateAnswer(systemPrompt, userPrompt, { maxTokens: 250 });
      return result.content.trim();
    } catch (err) {
      console.warn(`[Summary] Failed to generate summary: ${err.message}`);
      return documentText.slice(0, 300) + '...';
    }
  }
}

module.exports = new SummaryGenerator();
