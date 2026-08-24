const providerFactory = require('./providerFactory');

class AnswerGenerator {
  async generateGroundedAnswer({ systemPrompt, userPrompt, isSufficient, onChunk, options = {} }) {
    // 1. If context was insufficient, strictly return the standardized unavailable message
    if (!isSufficient) {
      const unavailableMessage =
        "I couldn't find reliable information about that in the available college knowledge base. Please check with the relevant department office or try rephrasing your question with specific college terms.";
      if (onChunk) {
        onChunk(unavailableMessage);
      }
      return {
        content: unavailableMessage,
        answerStatus: 'UNAVAILABLE',
        provider: 'system_grounding_filter',
        model: 'heuristic_rejection',
        tokensUsed: 0,
      };
    }

    // 2. Select AI Provider
    const provider = providerFactory.getProvider();
    
    // 3. Generate answer via AI Provider if available
    if (provider) {
      try {
        if (onChunk) {
          const streamResult = await provider.generateStream(systemPrompt, userPrompt, onChunk, options);
          if (streamResult && streamResult.content && streamResult.content.trim()) {
            return {
              content: streamResult.content,
              answerStatus: 'GROUNDED',
              provider: streamResult.provider,
              model: streamResult.model,
              tokensUsed: 0,
            };
          }
        } else {
          const result = await provider.generateAnswer(systemPrompt, userPrompt, options);
          if (result && result.content && result.content.trim()) {
            return {
              content: result.content,
              answerStatus: 'GROUNDED',
              provider: result.provider,
              model: result.model,
              tokensUsed: result.tokensUsed,
            };
          }
        }
      } catch (err) {
        console.warn(`[AnswerGenerator] Cloud LLM error: ${err.message}. Falling back to grounded context synthesis.`);
      }
    }

    // 4. Fallback: Direct Grounded Context Synthesis
    // Extracts verified facts directly from the retrieved passages
    const fallbackAnswer = this.synthesizeFromContext(userPrompt);
    if (onChunk) {
      onChunk(fallbackAnswer);
    }
    return {
      content: fallbackAnswer,
      answerStatus: 'GROUNDED',
      provider: 'campusiq_grounded_synthesizer',
      model: 'deterministic_rag_extractor',
      tokensUsed: 0,
    };
  }

  synthesizeFromContext(userPrompt) {
    const lines = userPrompt.split('\n').filter(Boolean);
    const docPassages = [];
    let collecting = false;

    for (const line of lines) {
      if (line.startsWith('Verified College Knowledge Base Documents:')) {
        collecting = true;
        continue;
      }
      if (line.startsWith('Student Question:')) {
        break;
      }
      if (collecting && !line.startsWith('---') && line.trim()) {
        docPassages.push(line.trim());
      }
    }

    if (docPassages.length === 0) {
      return "Based on the verified college documents, here is the relevant institutional information regarding your inquiry.";
    }

    // Format clean markdown answer from the retrieved passages
    let answer = "### 📋 Grounded Information from College Knowledge Base\n\n";
    const bullets = docPassages
      .filter((p) => !p.startsWith('[Source'))
      .slice(0, 4);

    bullets.forEach((b) => {
      answer += `${b}\n\n`;
    });

    return answer.trim();
  }
}

module.exports = new AnswerGenerator();
