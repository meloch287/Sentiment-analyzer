import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalysisResult, Stats } from '@/services/api';

interface AppState {
  taskId: string | null;
  setTaskId: (id: string | null) => void;
  
  results: AnalysisResult[] | null;
  setResults: (data: AnalysisResult[] | null) => void;
  
  stats: Stats | null;
  setStats: (data: Stats | null) => void;
  
  isLoading: boolean;
  setLoading: (val: boolean) => void;
  
  progress: { current: number; total: number };
  setProgress: (p: { current: number; total: number }) => void;
  
  reset: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      taskId: null,
      setTaskId: (id) => set({ taskId: id }),
      
      results: null,
      setResults: (data) => set({ results: data }),
      
      stats: null,
      setStats: (data) => set({ stats: data }),
      
      isLoading: false,
      setLoading: (val) => set({ isLoading: val }),
      
      progress: { current: 0, total: 0 },
      setProgress: (p) => set({ progress: p }),
      
      reset: () => set({
        taskId: null,
        results: null,
        stats: null,
        isLoading: false,
        progress: { current: 0, total: 0 },
      }),
    }),
    {
      name: 'sentiment-store',
      partialize: (state) => ({ 
        taskId: state.taskId, 
        results: state.results, 
        stats: state.stats 
      }),
    }
  )
);
