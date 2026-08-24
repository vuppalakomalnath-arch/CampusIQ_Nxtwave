import { create } from 'zustand';
import api from '../services/api';

export const useKnowledgeBaseStore = create((set, get) => ({
  collections: [],
  selectedCollection: null,
  isLoading: false,
  error: null,

  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/knowledge-bases');
      set({ collections: response.data.data || [], isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load knowledge bases', isLoading: false });
    }
  },

  setSelectedCollection: (collection) => {
    set({ selectedCollection: collection });
  },
}));
