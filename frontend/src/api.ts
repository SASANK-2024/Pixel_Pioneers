import type { HealthResponse, ChatResponse, MemoryItem, RetainResponse } from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function sendIncidentChat(
  message: string,
  serviceName: string,
  mode: 'with_memory' | 'without_memory',
  environment = 'production',
  userId = 'sre-commander'
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      service_name: serviceName,
      mode,
      environment,
      user_id: userId
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Incident triage call failed');
  }
  return res.json();
}

export async function recallMemories(query: string, limit = 6): Promise<MemoryItem[]> {
  const res = await fetch(`${API_BASE}/memory/recall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit })
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.memories || [];
}

export async function retainMemory(content: string, context = 'SRE Incident Post-Mortem', tags: string[] = []): Promise<RetainResponse> {
  const res = await fetch(`${API_BASE}/memory/retain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, context, tags })
  });
  if (!res.ok) throw new Error('Failed to retain memory');
  return res.json();
}

export async function seedDemoIncidents(): Promise<{ message: string; results: any[] }> {
  const res = await fetch(`${API_BASE}/memory/seed-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to seed demo records');
  return res.json();
}
