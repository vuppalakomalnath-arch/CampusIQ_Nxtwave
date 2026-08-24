const axios = require('axios');
const aiConfig = require('../config/ai');

class OpenRouterProvider {
  constructor() {
    this.apiKey = aiConfig.openRouter.apiKey;
    this.baseURL = aiConfig.openRouter.baseURL;
    this.defaultModel = aiConfig.openRouter.defaultModel;
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateAnswer(systemPrompt, userPrompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('OpenRouter API key is not configured');
    }

    const model = options.model || this.defaultModel;
    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: options.temperature || 0.2,
        max_tokens: options.maxTokens || 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://campusiq.edu',
          'X-Title': 'CampusIQ College Chatbot',
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content || '';
    const tokensUsed = response.data?.usage?.total_tokens || 0;

    return {
      content,
      provider: 'openrouter',
      model,
      tokensUsed,
    };
  }

  async generateStream(systemPrompt, userPrompt, onChunk, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('OpenRouter API key is not configured');
    }

    const model = options.model || this.defaultModel;
    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: options.temperature || 0.2,
        max_tokens: options.maxTokens || 1000,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://campusiq.edu',
          'X-Title': 'CampusIQ College Chatbot',
        },
        responseType: 'stream',
      }
    );

    let fullText = '';
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter((l) => l.trim().startsWith('data: '));
        for (const line of lines) {
          const raw = line.replace(/^data:\s*/, '').trim();
          if (raw === '[DONE]') continue;
          try {
            const parsed = JSON.parse(raw);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              if (onChunk) onChunk(delta);
            }
          } catch (e) {
            // Ignore parse errors on partial streams
          }
        }
      });

      response.data.on('end', () => {
        resolve({
          content: fullText,
          provider: 'openrouter',
          model,
        });
      });

      response.data.on('error', (err) => {
        reject(err);
      });
    });
  }
}

module.exports = new OpenRouterProvider();
