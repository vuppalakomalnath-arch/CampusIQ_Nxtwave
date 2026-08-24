export const sendStreamChat = async ({
  conversationId,
  message,
  knowledgeBaseIds = [],
  department = 'All',
  onToken,
  onComplete,
  onError,
}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campusiq_token') : '';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const params = new URLSearchParams({
    message,
    department,
  });

  if (conversationId) {
    params.append('conversationId', conversationId);
  }

  if (knowledgeBaseIds && knowledgeBaseIds.length > 0) {
    knowledgeBaseIds.forEach((id) => params.append('knowledgeBaseIds', id));
  }

  const url = `${baseUrl}/chat/stream?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `Server error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep remainder

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;

        const lines = eventBlock.split('\n');
        let eventType = 'message';
        let dataStr = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.replace('event: ', '').trim();
          } else if (line.startsWith('data: ')) {
            dataStr = line.replace('data: ', '').trim();
          }
        }

        if (dataStr) {
          try {
            const parsed = JSON.parse(dataStr);
            if (eventType === 'token' && onToken) {
              onToken(parsed.delta);
            } else if (eventType === 'complete' && onComplete) {
              onComplete(parsed);
            } else if (eventType === 'error' && onError) {
              onError(new Error(parsed.message || 'Stream error'));
            }
          } catch (e) {
            console.error('Failed to parse SSE payload:', e);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Stream error]:', err);
    if (onError) onError(err);
  }
};
