import type {
  Contact,
  ContactCreate,
  Meeting,
  MeetingCreate,
  Commitment,
  MeetingBrief,
  MeetingMemoryItem,
  LearningProgressionResponse,
  HealthResponse,
  ChatResponse,
  MemoryItem
} from './types';

const BASE_URL = 'http://127.0.0.1:8000';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  const data = await res.json();
  return {
    ...data,
    llm_model: data.llm?.model || data.llm_model,
    hindsight_bank: data.hindsight?.bank_id || data.hindsight_bank
  };
}

// --- Meeting Memory AI APIs ---

export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch(`${BASE_URL}/api/contacts`);
  if (!res.ok) throw new Error(`Failed to fetch contacts: ${res.statusText}`);
  return res.json();
}

export async function fetchContact(contactId: string): Promise<Contact> {
  const res = await fetch(`${BASE_URL}/api/contacts/${contactId}`);
  if (!res.ok) throw new Error(`Failed to fetch contact: ${res.statusText}`);
  return res.json();
}

export async function createContact(data: ContactCreate): Promise<Contact> {
  const res = await fetch(`${BASE_URL}/api/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Failed to create contact: ${res.statusText}`);
  return res.json();
}

export async function fetchContactMeetings(contactId: string): Promise<Meeting[]> {
  const res = await fetch(`${BASE_URL}/api/contacts/${contactId}/meetings`);
  if (!res.ok) throw new Error(`Failed to fetch meetings: ${res.statusText}`);
  return res.json();
}

export async function createMeeting(data: MeetingCreate): Promise<Meeting> {
  const res = await fetch(`${BASE_URL}/api/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Failed to create meeting: ${res.statusText}`);
  return res.json();
}

export async function fetchMeeting(meetingId: string): Promise<Meeting> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}`);
  if (!res.ok) throw new Error(`Failed to fetch meeting: ${res.statusText}`);
  return res.json();
}

export async function prepareMeeting(meetingId: string): Promise<MeetingBrief> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/prepare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Failed to prepare meeting brief: ${res.statusText}`);
  return res.json();
}

export async function processMeetingOutcome(meetingId: string, notes: string, outcomeSummary?: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, outcome_summary: outcomeSummary })
  });
  if (!res.ok) throw new Error(`Failed to process meeting outcome: ${res.statusText}`);
  return res.json();
}

export async function fetchMeetingMemories(meetingId: string): Promise<MeetingMemoryItem[]> {
  const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/memories`);
  if (!res.ok) throw new Error(`Failed to fetch memories: ${res.statusText}`);
  return res.json();
}

export async function fetchContactCommitments(contactId: string, status?: string): Promise<Commitment[]> {
  const url = status 
    ? `${BASE_URL}/api/contacts/${contactId}/commitments?status=${status}`
    : `${BASE_URL}/api/contacts/${contactId}/commitments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch commitments: ${res.statusText}`);
  return res.json();
}

export async function completeCommitment(commitmentId: string, completed: boolean = true): Promise<Commitment> {
  const res = await fetch(`${BASE_URL}/api/commitments/${commitmentId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  if (!res.ok) throw new Error(`Failed to toggle commitment: ${res.statusText}`);
  return res.json();
}

export async function fetchLearningProgression(contactId: string): Promise<LearningProgressionResponse> {
  const res = await fetch(`${BASE_URL}/api/contacts/${contactId}/learning`);
  if (!res.ok) throw new Error(`Failed to fetch learning progression: ${res.statusText}`);
  return res.json();
}

export async function resetDemoState(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/demo/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Failed to reset demo: ${res.statusText}`);
  return res.json();
}

// --- Backward-Compatible Incident Triage APIs ---

export async function sendIncidentChat(
  message: string,
  serviceName: string = 'checkout-service',
  mode: 'with_memory' | 'without_memory' = 'with_memory',
  history?: Array<{ role: string; content: string }>,
  environment: string = 'production'
): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      service_name: serviceName,
      environment,
      mode,
      history
    })
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.statusText}`);
  return res.json();
}

export async function recallMemories(query: string, limit: number = 5): Promise<MemoryItem[]> {
  const res = await fetch(`${BASE_URL}/memory/recall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit })
  });
  if (!res.ok) throw new Error(`Memory recall failed: ${res.statusText}`);
  const data = await res.json();
  return data.memories || [];
}

export async function retainMemory(content: string, context: string, tags: string[] = []): Promise<any> {
  const res = await fetch(`${BASE_URL}/memory/retain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, context, tags })
  });
  if (!res.ok) throw new Error(`Memory retain failed: ${res.statusText}`);
  return res.json();
}

export async function seedDemoIncidents(): Promise<any> {
  const res = await fetch(`${BASE_URL}/memory/seed-demo`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Demo seed failed: ${res.statusText}`);
  return res.json();
}
