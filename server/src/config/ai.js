const env = require('./env');

const aiConfig = {
  openRouter: {
    apiKey: env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: env.OPENROUTER_MODEL || 'anthropic/claude-3.5-haiku',
  },
  gemini: {
    apiKey: env.GEMINI_API_KEY,
    defaultModel: env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
  embeddings: {
    provider: env.EMBEDDING_PROVIDER || 'gemini',
    model: env.EMBEDDING_MODEL || 'text-embedding-004',
    dimension: 768, // Standard dimension for Google text-embedding-004
  },
  vectorIndexName: env.VECTOR_INDEX_NAME || 'college_documents_vector_index',
};

module.exports = aiConfig;
