import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

export interface AnalysisResult {
  text: string;
  src: string;
  label: number;
  confidence: number;
}

export interface Stats {
  total: number;
  negative: number;
  neutral: number;
  positive: number;
}

export interface TaskStatus {
  status: 'processing' | 'completed';
  progress?: number;
  total?: number;
  data?: AnalysisResult[];
  stats?: Stats;
}

export interface ValidationMetrics {
  macro_f1: number;
  precision: Record<number, number>;
  recall: Record<number, number>;
  confusion_matrix: number[][];
}

export const uploadFile = async (file: File): Promise<{ task_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/analyze', formData);
  return data;
};

export const getResults = async (taskId: string): Promise<TaskStatus> => {
  const { data } = await api.get(`/results/${taskId}`);
  return data;
};

export const downloadResults = (taskId: string) => {
  window.open(`/api/results/${taskId}/download`, '_blank');
};

export const validateFile = async (file: File): Promise<ValidationMetrics> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/validate', formData);
  return data;
};

export const searchTexts = async (taskId: string, query: string, source?: string) => {
  const params: Record<string, string> = { task_id: taskId, query };
  if (source) params.source = source;
  const { data } = await api.get('/search', { params });
  return data;
};

export const filterResults = async (taskId: string, label?: number, source?: string) => {
  const params: Record<string, string | number> = { task_id: taskId };
  if (label !== undefined) params.label = label;
  if (source) params.source = source;
  const { data } = await api.get('/filter', { params });
  return data;
};

export default api;
