import { StateCreator } from 'zustand';
import { UIState } from '@/types';

export interface UISlice extends UIState {
  setCurrentIndex: (index: number) => void;
  setCurrentDocumentId: (id: string | null) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setPromptManagerOpen: (isOpen: boolean) => void;
  setSplitViewRatio: (ratio: number) => void;
  navigateNext: (maxIndex: number) => void;
  navigatePrevious: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  currentIndex: 0,
  currentDocumentId: null,
  isSettingsOpen: false,
  isPromptManagerOpen: false,
  splitViewRatio: 50,

  setCurrentIndex: (index) => set({ currentIndex: index }),

  setCurrentDocumentId: (id) => set({ currentDocumentId: id }),

  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

  setPromptManagerOpen: (isOpen) => set({ isPromptManagerOpen: isOpen }),

  setSplitViewRatio: (ratio) => set({ splitViewRatio: Math.min(80, Math.max(20, ratio)) }),

  navigateNext: (maxIndex) =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, maxIndex),
    })),

  navigatePrevious: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),
});
