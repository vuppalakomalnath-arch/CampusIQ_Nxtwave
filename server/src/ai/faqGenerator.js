const providerFactory = require('./providerFactory');

class FAQGenerator {
  async generateFAQs(documentText, title = '') {
    if (!documentText || documentText.length < 100) {
      return [];
    }

    const provider = providerFactory.getProvider();
    if (!provider) {
      return [
        {
          question: `What is the main topic covered in ${title || 'this document'}?`,
          answer: documentText.slice(0, 180) + '...',
        },
      ];
    }

    const systemPrompt =
      'You are a college FAQ generator. Extract 3 to 5 common student questions and answers based strictly on the document text. Return output ONLY as a valid JSON array of objects with "question" and "answer" keys. Do not include markdown code block tags.';
    const userPrompt = `Document: ${title}\n\nContent:\n${documentText.slice(0, 5000)}`;

    try {
      const result = await provider.generateAnswer(systemPrompt, userPrompt, { maxTokens: 800 });
      let raw = result.content.trim();
      raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const faqs = JSON.parse(raw);
      if (Array.isArray(faqs)) {
        return faqs.slice(0, 5);
      }
    } catch (err) {
      console.warn(`[FAQ] Failed to parse generated FAQs: ${err.message}`);
    }

    return [];
  }
}

module.exports = new FAQGenerator();
