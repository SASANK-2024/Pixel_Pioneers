export interface MemoryItem {
  id?: string;
  text: string;
  type?: string;
  context?: string | null;
  score?: number | null;
  mentioned_at?: string | null;
}

export interface ChatResponse {
  response: string;
  reasoning?: string | null;
  mode: string;
  service_name: string;
  memories_retrieved: MemoryItem[];
  new_memory_retained: boolean;
  retained_summary?: string | null;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  llm_model: string;
  hindsight_bank: string;
  environment: string;
}

export interface RetainResponse {
  success: boolean;
  bank_id: string;
  items_count: number;
  message: string;
}
