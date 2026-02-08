import { StateCreator } from 'zustand';
import { ProcessingJob, ProcessingStatus, ProcessingProgress } from '@/types';

export interface ProcessingSlice {
  currentJob: ProcessingJob | null;
  setCurrentJob: (job: ProcessingJob | null) => void;
  updateJobStatus: (status: ProcessingStatus) => void;
  updateProgress: (progress: Partial<ProcessingProgress>) => void;
  incrementCompleted: () => void;
  incrementFailed: () => void;
  setCurrentDocument: (documentId: string | undefined) => void;
  resetProcessing: () => void;
}

export const createProcessingSlice: StateCreator<ProcessingSlice> = (set) => ({
  currentJob: null,

  setCurrentJob: (job) => set({ currentJob: job }),

  updateJobStatus: (status) =>
    set((state) => {
      if (!state.currentJob) return state;
      return {
        currentJob: { ...state.currentJob, status },
      };
    }),

  updateProgress: (progress) =>
    set((state) => {
      if (!state.currentJob) return state;
      return {
        currentJob: {
          ...state.currentJob,
          progress: { ...state.currentJob.progress, ...progress },
        },
      };
    }),

  incrementCompleted: () =>
    set((state) => {
      if (!state.currentJob) return state;
      return {
        currentJob: {
          ...state.currentJob,
          progress: {
            ...state.currentJob.progress,
            completed: state.currentJob.progress.completed + 1,
          },
        },
      };
    }),

  incrementFailed: () =>
    set((state) => {
      if (!state.currentJob) return state;
      return {
        currentJob: {
          ...state.currentJob,
          progress: {
            ...state.currentJob.progress,
            failed: state.currentJob.progress.failed + 1,
          },
        },
      };
    }),

  setCurrentDocument: (documentId) =>
    set((state) => {
      if (!state.currentJob) return state;
      return {
        currentJob: {
          ...state.currentJob,
          progress: {
            ...state.currentJob.progress,
            current: documentId,
          },
        },
      };
    }),

  resetProcessing: () => set({ currentJob: null }),
});
