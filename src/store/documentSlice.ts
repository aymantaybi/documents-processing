import { StateCreator } from 'zustand';
import { Document, ExtractedData } from '@/types';

export interface DocumentSlice {
  documents: Document[];
  results: Record<string, ExtractedData>; // documentId -> ExtractedData
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
  setResult: (documentId: string, result: ExtractedData) => void;
  updateResult: (documentId: string, editedData: Record<string, unknown>) => void;
  getResult: (documentId: string) => ExtractedData | undefined;
}

export const createDocumentSlice: StateCreator<DocumentSlice> = (set, get) => ({
  documents: [],
  results: {},

  setDocuments: (documents) => set({ documents }),

  addDocument: (document) =>
    set((state) => ({
      documents: [...state.documents, document],
    })),

  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    })),

  removeDocument: (id) =>
    set((state) => {
      const { [id]: removed, ...remainingResults } = state.results;
      return {
        documents: state.documents.filter((doc) => doc.id !== id),
        results: remainingResults,
      };
    }),

  getDocument: (id) => get().documents.find((doc) => doc.id === id),

  setResult: (documentId, result) =>
    set((state) => ({
      results: { ...state.results, [documentId]: result },
    })),

  updateResult: (documentId, editedData) =>
    set((state) => {
      const currentResult = state.results[documentId];
      if (!currentResult) return state;
      return {
        results: {
          ...state.results,
          [documentId]: { ...currentResult, editedData },
        },
      };
    }),

  getResult: (documentId) => get().results[documentId],
});
