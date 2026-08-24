const analyticsService = require('../services/analyticsService');
const providerFactory = require('../ai/providerFactory');
const aiConfig = require('../config/ai');
const env = require('../config/env');
const DocumentChunk = require('../models/DocumentChunk');

const getOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getOverviewMetrics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getUnanswered = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '30', 10);
    const list = await analyticsService.getUnansweredQuestions(limit);
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const list = await analyticsService.getFeedbackAnalytics(limit);
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

const getRAGHealth = async (req, res, next) => {
  try {
    const totalChunks = await DocumentChunk.countDocuments({ status: 'ACTIVE' });
    const hasAIProvider = providerFactory.hasAvailableProvider();

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        totalIndexedChunks: totalChunks,
        embeddingProvider: aiConfig.embeddings.provider,
        embeddingModel: aiConfig.embeddings.model,
        vectorIndexName: env.VECTOR_INDEX_NAME,
        aiProviderAvailable: hasAIProvider,
        openRouterConfigured: Boolean(env.OPENROUTER_API_KEY),
        geminiConfigured: Boolean(env.GEMINI_API_KEY),
        redisConfigured: Boolean(env.REDIS_URL),
        storageProvider: env.DOCUMENT_STORAGE_PROVIDER,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getUnanswered,
  getFeedback,
  getRAGHealth,
};
