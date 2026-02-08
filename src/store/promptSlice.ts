import { StateCreator } from 'zustand';
import { Prompt } from '@/types';

export interface PromptSlice {
  prompts: Prompt[];
  activePromptId: string | null;
  setPrompts: (prompts: Prompt[]) => void;
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  removePrompt: (id: string) => void;
  getPrompt: (id: string) => Prompt | undefined;
  setActivePrompt: (id: string | null) => void;
  getActivePrompt: () => Prompt | undefined;
}

export const createPromptSlice: StateCreator<PromptSlice> = (set, get) => ({
  prompts: [],
  activePromptId: null,

  setPrompts: (prompts) => set({ prompts }),

  addPrompt: (prompt) =>
    set((state) => ({
      prompts: [...state.prompts, prompt],
    })),

  updatePrompt: (id, updates) =>
    set((state) => ({
      prompts: state.prompts.map((prompt) =>
        prompt.id === id ? { ...prompt, ...updates, updatedAt: new Date() } : prompt
      ),
    })),

  removePrompt: (id) =>
    set((state) => ({
      prompts: state.prompts.filter((prompt) => prompt.id !== id),
      activePromptId: state.activePromptId === id ? null : state.activePromptId,
    })),

  getPrompt: (id) => get().prompts.find((prompt) => prompt.id === id),

  setActivePrompt: (id) => set({ activePromptId: id }),

  getActivePrompt: () => {
    const { activePromptId, prompts } = get();
    return activePromptId
      ? prompts.find((p) => p.id === activePromptId)
      : undefined;
  },
});
