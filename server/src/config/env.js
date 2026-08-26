const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || ' ',
  JWT_SECRET: process.env.JWT_SECRET || 'campusiq_jwt_secret_dev_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // AI Keys & Providers
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-haiku',
  
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  
  // Embeddings
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'gemini',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-004',
  
  // Vector Search Index
  VECTOR_INDEX_NAME: process.env.VECTOR_INDEX_NAME || 'college_documents_vector_index',
  
  // Redis / Queue
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  
  // Storage
  DOCUMENT_STORAGE_PROVIDER: process.env.DOCUMENT_STORAGE_PROVIDER || 'local',
  STORAGE_LOCAL_PATH: path.resolve(__dirname, '../../uploads'),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '20', 10),
  
  // RAG Thresholds
  SIMILARITY_THRESHOLD_HIGH: parseFloat(process.env.SIMILARITY_THRESHOLD_HIGH || '0.75'),
  SIMILARITY_THRESHOLD_MED: parseFloat(process.env.SIMILARITY_THRESHOLD_MED || '0.50'),
  SIMILARITY_THRESHOLD_LOW: parseFloat(process.env.SIMILARITY_THRESHOLD_LOW || '0.30'),
  MAX_RETRIEVED_CHUNKS: parseInt(process.env.MAX_RETRIEVED_CHUNKS || '6', 10),
};

module.exports = env;
