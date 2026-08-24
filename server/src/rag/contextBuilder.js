class ContextBuilder {
  buildContextPrompt(query, retrievedChunks, conversationHistory = []) {
    if (!retrievedChunks || retrievedChunks.length === 0) {
      return {
        systemPrompt: this.getSystemInstructions(),
        userPrompt: `Question: "${query}"\n\nNo relevant knowledge-base documents were found.`,
        sourceReferences: [],
      };
    }

    const sourceReferences = [];
    const contextSections = retrievedChunks.map((chunk, index) => {
      const docTitle = chunk.metadata?.documentTitle || chunk.document?.title || 'College Document';
      const department = chunk.department || 'General';
      const page = chunk.pageNumber ? `Page ${chunk.pageNumber}` : 'General';
      const sourceId = `[Source ${index + 1}: ${docTitle} (${department}, ${page})]`;

      sourceReferences.push({
        documentId: chunk.document?._id || chunk.document,
        documentTitle: docTitle,
        collectionName: chunk.knowledgeBase?.name || 'General Collection',
        department: department,
        versionNumber: chunk.versionNumber || 1,
        pageNumber: chunk.pageNumber || 1,
        chunkIndex: chunk.chunkIndex || index,
        relevanceScore: chunk.relevanceScore || 0,
        snippet: chunk.text.slice(0, 220) + (chunk.text.length > 220 ? '...' : ''),
        highlightPassage: chunk.text.slice(0, 150),
      });

      return `${sourceId}\n${chunk.text}\n`;
    });

    const contextText = contextSections.join('\n---\n\n');

    let historyContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-4).map((msg) => {
        return `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}`;
      });
      historyContext = `Recent conversation history for conversational context:\n${recentHistory.join('\n')}\n\n`;
    }

    const userPrompt = `${historyContext}Verified College Knowledge Base Documents:\n${contextText}\n\nStudent Question: "${query}"\n\nProvide a grounded, helpful, and concise answer based strictly on the verified college documents provided above. Cite your supporting facts and state clearly if any specific detail is unmentioned.`;

    return {
      systemPrompt: this.getSystemInstructions(),
      userPrompt,
      sourceReferences,
    };
  }

  getSystemInstructions() {
    return `You are CampusIQ, an official, trusted AI knowledge assistant for our college campus.

STRICT GROUNDING & ACCURACY RULES:
1. Answer ONLY from the supplied college knowledge-base context.
2. Do NOT invent, assume, or extrapolate college facts, deadlines, fee amounts, department names, or eligibility criteria.
3. If the provided context does not contain enough evidence to fully answer the question, clearly state: "I couldn't find complete information about this in the available college documents" and explain what part is missing.
4. Never claim unavailable information exists or fabricate sources.
5. Format your answers clearly using markdown (bullet points, bold key terms, dates, and numbers).
6. Be polite, professional, and directly address the student's question.
7. Preserve exact dates, fee figures, contact emails, and office locations as documented in the source context.`;
  }
}

module.exports = new ContextBuilder();
