import { create } from 'zustand';
import api from '../services/api';

export const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  isGenerating: false,
  streamBuffer: '',
  activeSources: [],
  selectedKBIds: [],
  departmentFilter: 'All',

  setDepartmentFilter: (dept) => set({ departmentFilter: dept }),
  setSelectedKBIds: (kbIds) => set({ selectedKBIds: kbIds }),

  loadConversations: async () => {
    try {
      const response = await api.get('/conversations');
      set({ conversations: response.data.data || [] });
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  },

  loadConversation: async (id) => {
    try {
      const response = await api.get(`/conversations/${id}`);
      const data = response.data.data;
      set({
        currentConversationId: id,
        messages: data.messages || [],
        selectedKBIds: data.conversation.selectedKnowledgeBases?.map((k) => k._id || k) || [],
        departmentFilter: data.conversation.departmentScope || 'All',
      });
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    }
  },

  startNewChat: () => {
    set({
      currentConversationId: null,
      messages: [],
      streamBuffer: '',
      activeSources: [],
    });
  },

  appendUserMessage: (content) => {
    const tempUserMsg = {
      _id: `temp_u_${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, tempUserMsg],
      isGenerating: true,
      streamBuffer: '',
    }));
  },

  appendStreamToken: (token) => {
    set((state) => ({
      streamBuffer: state.streamBuffer + token,
    }));
  },

  finalizeAssistantMessage: ({ conversationId, assistantMessage }) => {
    set((state) => ({
      currentConversationId: conversationId,
      messages: [
        ...state.messages.filter((m) => !m._id.startsWith('temp_a_')),
        assistantMessage,
      ],
      isGenerating: false,
      streamBuffer: '',
      activeSources: assistantMessage.sourceReferences || [],
    }));
    get().loadConversations();
  },

  setGeneratingFailed: (errorMsg) => {
    const errorAssistantMsg = {
      _id: `temp_err_${Date.now()}`,
      role: 'assistant',
      content: errorMsg || 'An error occurred while answering your question.',
      answerStatus: 'ERROR',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, errorAssistantMsg],
      isGenerating: false,
      streamBuffer: '',
    }));
  },

  submitFeedback: async (messageId, rating, reason = '') => {
    try {
      await api.post(`/chat/messages/${messageId}/feedback`, { rating, reason });
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? { ...m, feedbackSubmitted: rating } : m
        ),
      }));
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  },

  deleteConversation: async (id) => {
    try {
      await api.delete(`/conversations/${id}`);
      set((state) => ({
        conversations: state.conversations.filter((c) => c._id !== id),
        ...(state.currentConversationId === id
          ? { currentConversationId: null, messages: [] }
          : {}),
      }));
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  },
}));
