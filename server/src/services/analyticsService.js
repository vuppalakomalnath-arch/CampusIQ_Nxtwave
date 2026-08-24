const QueryAnalytics = require('../models/QueryAnalytics');
const Feedback = require('../models/Feedback');
const Document = require('../models/Document');
const KnowledgeBase = require('../models/KnowledgeBase');
const User = require('../models/User');

class AnalyticsService {
  async getOverviewMetrics() {
    const [
      totalUsers,
      totalKnowledgeBases,
      totalDocuments,
      totalQueries,
      recentQueries,
      confidenceStats,
      feedbackStats,
      docsByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      KnowledgeBase.countDocuments({ status: { $ne: 'archived' } }),
      Document.countDocuments({ status: { $ne: 'ARCHIVED' } }),
      QueryAnalytics.countDocuments(),
      QueryAnalytics.find().sort({ createdAt: -1 }).limit(10).populate('knowledgeBasesSearched', 'name'),
      QueryAnalytics.aggregate([
        {
          $group: {
            _id: '$confidenceCategory',
            count: { $sum: 1 },
          },
        },
      ]),
      Feedback.aggregate([
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
      ]),
      Document.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Average latency
    const latencyAgg = await QueryAnalytics.aggregate([
      {
        $group: {
          _id: null,
          avgRetrieval: { $avg: '$retrievalLatencyMs' },
          avgGeneration: { $avg: '$generationLatencyMs' },
        },
      },
    ]);

    return {
      totals: {
        users: totalUsers,
        knowledgeBases: totalKnowledgeBases,
        documents: totalDocuments,
        queries: totalQueries,
      },
      latencies: {
        avgRetrievalMs: Math.round(latencyAgg[0]?.avgRetrieval || 0),
        avgGenerationMs: Math.round(latencyAgg[0]?.avgGeneration || 0),
      },
      confidenceBreakdown: confidenceStats.reduce((acc, curr) => {
        acc[curr._id || 'Unavailable'] = curr.count;
        return acc;
      }, {}),
      feedbackBreakdown: feedbackStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      documentsByStatus: docsByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      recentQueries,
    };
  }

  async getUnansweredQuestions(limit = 30) {
    return await QueryAnalytics.find({
      $or: [{ confidenceCategory: { $in: ['Unavailable', 'Low'] } }, { answerStatus: 'UNAVAILABLE' }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('knowledgeBasesSearched', 'name department');
  }

  async getFeedbackAnalytics(limit = 50) {
    return await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email role department')
      .populate('message', 'content answerStatus')
      .populate('conversation', 'title');
  }
}

module.exports = new AnalyticsService();
