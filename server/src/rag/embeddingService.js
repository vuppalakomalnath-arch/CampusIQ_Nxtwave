const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const aiConfig = require('../config/ai');
const env = require('../config/env');

class EmbeddingService {
  constructor() {
    this.provider = aiConfig.embeddings.provider;
    this.dimension = aiConfig.embeddings.dimension;

    if (aiConfig.gemini.apiKey) {
      this.gemini = new GoogleGenerativeAI(aiConfig.gemini.apiKey);
    }
  }

  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Valid text string is required for embedding generation');
    }

    const cleanedText = text.replace(/\s+/g, ' ').trim();

    // 1. Try Gemini Embeddings if configured
    if (this.gemini && (this.provider === 'gemini' || !aiConfig.openRouter.apiKey)) {
      try {
        const model = this.gemini.getGenerativeModel({ model: aiConfig.embeddings.model || 'text-embedding-004' });
        const result = await model.embedContent(cleanedText);
        if (result?.embedding?.values) {
          return result.embedding.values;
        }
      } catch (err) {
        if (!this.warned) {
          console.warn(`[Embedding] External embedding provider unavailable (${err.message}). Using local dense vector representations.`);
          this.warned = true;
        }
      }
    }

    // 2. Try OpenRouter/OpenAI Embeddings if configured
    if (aiConfig.openRouter.apiKey && this.provider === 'openrouter') {
      try {
        const response = await axios.post(
          `${aiConfig.openRouter.baseURL}/embeddings`,
          {
            model: 'text-embedding-3-small',
            input: cleanedText,
          },
          {
            headers: {
              Authorization: `Bearer ${aiConfig.openRouter.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.data?.data?.[0]?.embedding) {
          return response.data.data[0].embedding;
        }
      } catch (err) {
        console.warn(`[Embedding] OpenRouter embedding failed: ${err.message}.`);
      }
    }

    // 3. Fallback: Fast deterministic semantic pseudo-embedding vector for offline / testing
    return this.generateDeterministicVector(cleanedText, this.dimension);
  }

  async generateBatchEmbeddings(texts) {
    const embeddings = [];
    for (const text of texts) {
      const emb = await this.generateEmbedding(text);
      embeddings.push(emb);
    }
    return embeddings;
  }

  generateDeterministicVector(text, dimension = 768) {
    const vector = new Array(dimension).fill(0);
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const index = Math.abs(hash) % dimension;
      vector[index] += 1 / (i + 1);
    }

    // L2 Normalize
    let norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) norm = 1;
    return vector.map((val) => val / norm);
  }
}

module.exports = new EmbeddingService();
