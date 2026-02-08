import { StateCreator } from 'zustand';
import { AppSettings } from '@/types';

export interface SettingsSlice extends AppSettings {
  setOpenAIApiKey: (key: string | null) => void;
  setRateLimit: (limit: number) => void;
  setAutoSaveResults: (autoSave: boolean) => void;
  clearSettings: () => void;
}

const defaultSettings: AppSettings = {
  openaiApiKey: null,
  rateLimit: 10, // requests per minute
  autoSaveResults: true,
};

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
  ...defaultSettings,

  setOpenAIApiKey: (key) => set({ openaiApiKey: key }),

  setRateLimit: (limit) => set({ rateLimit: Math.max(1, Math.min(60, limit)) }),

  setAutoSaveResults: (autoSave) => set({ autoSaveResults: autoSave }),

  clearSettings: () => set(defaultSettings),
});
