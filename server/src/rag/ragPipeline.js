const retrievalService = require('./retrievalService');
const contextBuilder = require('./contextBuilder');
const answerGenerator = require('../ai/answerGenerator');
const QueryAnalytics = require('../models/QueryAnalytics');

class RAGPipeline {
  async executePipeline({ query, user, conversationHistory = [], options = {}, onChunk = null }) {
    const totalStartTime = Date.now();

    // 1. Retrieve relevant context with role-based knowledge-base scoping
    const retrievalResult = await retrievalService.retrieveContext(query, user, options);

    // 2. Build structured grounded prompt
    const { systemPrompt, userPrompt, sourceReferences } = contextBuilder.buildContextPrompt(
      query,
      retrievalResult.chunks,
      conversationHistory
    );

    // 3. Generate grounded answer
    const generationStartTime = Date.now();
    const generationResult = await answerGenerator.generateGroundedAnswer({
      systemPrompt,
      userPrompt,
      isSufficient: retrievalResult.isSufficient,
      onChunk,
      options,
    });
    const generationLatencyMs = Date.now() - generationStartTime;

    // 4. Generate suggested follow-up questions
    const suggestedFollowUps = this.buildSuggestedQuestions(
      query,
      retrievalResult.chunks,
      retrievalResult.isSufficient
    );

    // 5. Asynchronously record query analytics event
    this.recordAnalytics({
      user: user?._id,
      query,
      knowledgeBasesSearched: options.knowledgeBaseIds || [],
      department: options.department || 'General',
      retrievalLatencyMs: retrievalResult.searchLatencyMs,
      generationLatencyMs,
      candidateCount: retrievalResult.retrievedCandidateCount,
      selectedChunkCount: retrievalResult.selectedChunkCount,
      topRelevanceScore: retrievalResult.topRelevanceScore,
      confidenceCategory: retrievalResult.confidenceCategory,
      answerStatus: generationResult.answerStatus,
    });

    return {
      answer: generationResult.content,
      answerStatus: generationResult.answerStatus,
      sourceReferences: generationResult.answerStatus === 'GROUNDED' ? sourceReferences : [],
      retrievalMetadata: {
        retrievalMethod: 'hybrid_vector_keyword',
        retrievedCandidateCount: retrievalResult.retrievedCandidateCount,
        selectedChunkCount: retrievalResult.selectedChunkCount,
        topRelevanceScore: retrievalResult.topRelevanceScore,
        confidenceScore: retrievalResult.confidenceScore,
        confidenceCategory: retrievalResult.confidenceCategory,
        searchLatencyMs: retrievalResult.searchLatencyMs,
        generationLatencyMs,
        totalLatencyMs: Date.now() - totalStartTime,
      },
      providerMetadata: {
        provider: generationResult.provider,
        model: generationResult.model,
        tokensUsed: generationResult.tokensUsed,
      },
      suggestedFollowUps,
    };
  }

  buildSuggestedQuestions(query, chunks, isSufficient) {
    if (!isSufficient || !chunks || chunks.length === 0) {
      return [
        'What documents are currently in the knowledge base?',
        'How do I contact the college academic office?',
        'Where can I find the latest examination schedule?',
      ];
    }

    const suggestions = [];
    chunks.slice(0, 3).forEach((chunk) => {
      if (chunk.heading && chunk.heading.length > 5) {
        suggestions.push(`Tell me more about ${chunk.heading}`);
      }
      if (chunk.metadata?.documentTitle) {
        suggestions.push(`What else is covered in ${chunk.metadata.documentTitle}?`);
      }
    });

    return Array.from(new Set(suggestions)).slice(0, 3);
  }

  async recordAnalytics(data) {
    try {
      await QueryAnalytics.create({
        ...data,
        normalizedQuery: data.query ? data.query.toLowerCase().trim() : '',
      });
    } catch (err) {
      console.warn(`[Analytics] Failed to record query event: ${err.message}`);
    }
  }
}

module.exports = new RAGPipeline();
