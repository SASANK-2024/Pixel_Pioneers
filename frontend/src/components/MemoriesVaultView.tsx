import React, { useState, useEffect } from 'react';
import { Database, Search } from 'lucide-react';
import type { MeetingMemoryItem } from '../types';
import { fetchMeetingMemories } from '../api';

interface MemoriesVaultViewProps {
  meetingId: string;
}

export const MemoriesVaultView: React.FC<MemoriesVaultViewProps> = ({ meetingId }) => {
  const [memories, setMemories] = useState<MeetingMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchMeetingMemories(meetingId);
        setMemories(res);
      } catch (err) {
        console.error('Failed to load memories:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [meetingId]);

  const filtered = memories.filter(m => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch = !search || m.text.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'preference': return { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' };
      case 'concern_objection': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'commitment': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'decision': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      default: return { bg: 'rgba(99, 102, 241, 0.15)', text: '#a5b4fc', border: 'rgba(99, 102, 241, 0.3)' };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={22} color="#818cf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Hindsight Long-Term Memory Vault
              </h2>
              <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Bank: meeting-memory-ai
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Persistent semantic memories recalled directly from Vectorize Hindsight Cloud
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search relationship memory..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '0.8rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { id: 'all', label: 'All Memories' },
          { id: 'preference', label: 'Preferences' },
          { id: 'concern_objection', label: 'Concerns & Objections' },
          { id: 'commitment', label: 'Commitments' },
          { id: 'relationship_fact', label: 'Relationship Facts' },
          { id: 'decision', label: 'Decisions' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: selectedCategory === cat.id ? '#ffffff' : '#94a3b8',
              background: selectedCategory === cat.id ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.03)',
              border: selectedCategory === cat.id ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Memories Cards Grid */}
      {loading ? (
        <div style={{ color: '#94a3b8', padding: '30px', textAlign: 'center' }}>Querying Hindsight Cloud...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#94a3b8', padding: '30px', textAlign: 'center' }}>No memories match your filter.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map((mem) => {
            const style = categoryColor(mem.category);
            return (
              <div
                key={mem.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: style.bg,
                      color: style.text,
                      border: `1px solid ${style.border}`,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {mem.category.replace('_', ' ')}
                    </span>

                    {mem.relevance_score && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        Confidence: {(mem.relevance_score * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {mem.text}
                  </div>
                </div>

                <div style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Source: {mem.source_meeting || 'Past Call'}</span>
                  {mem.source_date && <span>Date: {mem.source_date}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
