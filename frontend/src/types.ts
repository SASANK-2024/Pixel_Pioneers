export interface ContactCreate {
  name: string;
  role: string;
  company: string;
  email: string;
  relationship_type?: string;
  avatar?: string;
  summary?: string;
  preferences?: string[];
  known_concerns?: string[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  relationship_type: string;
  avatar?: string;
  summary?: string;
  preferences: string[];
  known_concerns: string[];
  created_at: string;
  total_meetings: number;
  open_commitments_count: number;
}

export interface Commitment {
  id: string;
  contact_id: string;
  meeting_id: string;
  owner: string;
  title: string;
  due_date?: string;
  status: 'open' | 'completed';
  completed_at?: string;
  source_meeting_title: string;
}

export interface MeetingMemoryItem {
  id: string;
  text: string;
  category: 'relationship_fact' | 'decision' | 'commitment' | 'preference' | 'concern_objection' | 'outcome';
  source_meeting?: string;
  source_date?: string;
  relevance_score?: number;
}

export interface ChangeSinceLastMeeting {
  new_information: string[];
  unresolved_items: string[];
  changed_concerns: string[];
  suggested_questions_today: string[];
}

export interface MeetingBrief {
  meeting_overview: string;
  relationship_summary: string;
  key_topics: string[];
  previous_commitments: string[];
  open_commitments: Commitment[];
  known_concerns: string[];
  contact_preferences: string[];
  recommended_questions: string[];
  risks_or_unknowns: string[];
  suggested_preparation: string[];
  change_since_last_meeting?: ChangeSinceLastMeeting;
  memories_used: MeetingMemoryItem[];
  new_information_to_retain?: string[];
}

export interface MeetingCreate {
  contact_id: string;
  title: string;
  meeting_number: number;
  date_time: string;
  objective: string;
  agenda?: string[];
  attendees?: string[];
}

export interface Meeting {
  id: string;
  contact_id: string;
  title: string;
  meeting_number: number;
  date_time: string;
  objective: string;
  agenda: string[];
  attendees: string[];
  status: 'upcoming' | 'completed';
  notes_raw?: string;
  outcome_summary?: string;
  prepared_brief?: MeetingBrief;
  created_at: string;
}

export interface LearningStage {
  meeting_number: number;
  title: string;
  stage_name: string;
  summary: string;
  memories_recalled_count: number;
  behavior_difference: string;
  outcome: string;
}

export interface LearningProgressionResponse {
  contact_id: string;
  contact_name: string;
  total_memories_retained: number;
  total_meetings: number;
  stages: LearningStage[];
}

export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  llm_model?: string;
  hindsight_bank?: string;
  llm: {
    provider: string;
    model: string;
  };
  hindsight: {
    status: string;
    base_url: string;
    bank_id: string;
  };
}

// Backward-compatible Incident Triage types
export interface MemoryItem {
  id: string;
  text: string;
  type: string;
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
