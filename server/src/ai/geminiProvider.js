const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiConfig = require('../config/ai');

class GeminiProvider {
  constructor() {
    this.apiKey = aiConfig.gemini.apiKey;
    this.defaultModel = aiConfig.gemini.defaultModel || 'gemini-1.5-flash';
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  resolveModel(model) {
    if (!model) return 'gemini-1.5-flash';
    if (model.includes('3.7') || model.includes('3.')) {
      return 'gemini-1.5-flash';
    }
    return model;
  }

  async generateAnswer(systemPrompt, userPrompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured');
    }

    const modelName = this.resolveModel(options.model || this.defaultModel);
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), 8000)
    );

    const generatePromise = (async () => {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.2,
          maxOutputTokens: options.maxTokens || 1000,
        },
      });
      const response = await result.response;
      return {
        content: response.text() || '',
        provider: 'gemini',
        model: modelName,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      };
    })();

    return await Promise.race([generatePromise, timeoutPromise]);
  }

  async generateStream(systemPrompt, userPrompt, onChunk, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured');
    }

    const modelName = this.resolveModel(options.model || this.defaultModel);
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const resultStream = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: options.temperature || 0.2,
        maxOutputTokens: options.maxTokens || 1000,
      },
    });

    let fullText = '';
    for await (const chunk of resultStream.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      if (onChunk) {
        onChunk(chunkText);
      }
    }

    return {
      content: fullText,
      provider: 'gemini',
      model: modelName,
    };
  }
}

module.exports = new GeminiProvider();
