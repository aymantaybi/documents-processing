import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createDocumentSlice, DocumentSlice } from './documentSlice';
import { createPromptSlice, PromptSlice } from './promptSlice';
import { createProcessingSlice, ProcessingSlice } from './processingSlice';
import { createUISlice, UISlice } from './uiSlice';
import { createSettingsSlice, SettingsSlice } from './settingsSlice';

export type StoreState = DocumentSlice &
  PromptSlice &
  ProcessingSlice &
  UISlice &
  SettingsSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createDocumentSlice(...a),
        ...createPromptSlice(...a),
        ...createProcessingSlice(...a),
        ...createUISlice(...a),
        ...createSettingsSlice(...a),
      }),
      {
        name: 'documents-processing-storage',
        partialize: (state) => ({
          // Only persist settings to localStorage
          openaiApiKey: state.openaiApiKey,
          rateLimit: state.rateLimit,
          autoSaveResults: state.autoSaveResults,
        }),
      }
    ),
    { name: 'DocumentsProcessingStore' }
  )
);
