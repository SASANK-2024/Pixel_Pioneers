import React, { useState } from 'react';
import type { MemoryItem } from '../types';
import { recallMemories, retainMemory } from '../api';

interface MemoryInspectorProps {
  activeMemories: MemoryItem[];
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({ activeMemories }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemoryItem[] | null>(null);
  const [searching, setSearching] = useState(false);

  // New Memory retention modal/form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newContext, setNewContext] = useState('SRE Incident Post-Mortem');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await recallMemories(searchQuery, 8);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      await retainMemory(newContent, newContext);
      setSaveSuccess(true);
      setNewContent('');
      setTimeout(() => {
        setSaveSuccess(false);
        setShowAddModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const displayedMemories = searchResults !== null ? searchResults : activeMemories;

  return (
    <div className="card-base" style={{ padding: '24px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Title & Add Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#eff0fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4f46e5'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>psychology</span>
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1c30' }}>
              Hindsight Persistent Memory Store
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#464555' }}>
              Multi-strategy temporal and semantic facts extracted from incident history
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#eff0fe',
            border: '1px solid #c7d2fe',
            color: '#3525cd',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
          <span>Retain Post-Mortem</span>
        </button>
      </div>

      {/* Memory Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '18px', color: '#777587' }}>
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recalled memories by symptom, service, or runbook..."
            style={{
              width: '100%',
              background: '#f8faff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '8px 10px 8px 36px',
              color: '#0b1c30',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          style={{
            background: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {searching ? 'Querying...' : 'Recall'}
        </button>
        {searchResults !== null && (
          <button
            type="button"
            onClick={() => setSearchResults(null)}
            style={{
              background: 'transparent',
              color: '#464555',
              border: '1px solid #cbd5e1',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Add Memory Modal / Accordion */}
      {showAddModal && (
        <form onSubmit={handleSaveMemory} style={{
          background: '#f8faff',
          border: '1px solid #c7d2fe',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#3525cd' }}>
              Add New Incident Memory to Hindsight:
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{ background: 'transparent', border: 'none', color: '#777587', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            value={newContext}
            onChange={(e) => setNewContext(e.target.value)}
            placeholder="Context (e.g. Post-Mortem RB-08, Failed Action)"
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '7px 10px',
              color: '#0b1c30',
              fontSize: '0.8rem'
            }}
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            placeholder="Incident fact, root cause, or negative outcome to store into persistent memory..."
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '8px 10px',
              color: '#0b1c30',
              fontSize: '0.8rem',
              resize: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: saveSuccess ? '#059669' : '#4f46e5',
                color: '#ffffff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {saving ? 'Retaining...' : saveSuccess ? 'Retained to Hindsight!' : 'Store in Hindsight'}
            </button>
          </div>
        </form>
      )}

      {/* Memory List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
        {displayedMemories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#777587', fontSize: '0.85rem' }}>
            No memories loaded yet. Click <strong>"Seed Demo Data"</strong> in the top bar to populate realistic historical post-mortems!
          </div>
        ) : (
          displayedMemories.map((m, idx) => {
            const isNegativeMemory = m.text.toLowerCase().includes('crashed') || 
                                     m.text.toLowerCase().includes('failed') || 
                                     m.text.toLowerCase().includes('worsened');
            return (
              <div
                key={idx}
                style={{
                  background: isNegativeMemory ? '#fef2f2' : '#f8faff',
                  border: `1px solid ${isNegativeMemory ? '#fecaca' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isNegativeMemory ? (
                      <span style={{
                        background: '#fee2e2',
                        color: '#ba1a1a',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>error</span>
                        NEGATIVE MEMORY
                      </span>
                    ) : (
                      <span style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <span className="material-symbols-outlined material-symbols-fill" style={{ fontSize: '13px' }}>verified</span>
                        VERIFIED KNOWLEDGE
                      </span>
                    )}
                    {m.context && (
                      <span style={{ fontSize: '0.72rem', color: '#777587' }}>
                        {m.context}
                      </span>
                    )}
                  </div>
                  {m.score !== null && m.score !== undefined && (
                    <span style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 700 }}>
                      Score: {m.score.toFixed(2)}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.84rem', color: '#0b1c30', lineHeight: 1.4 }}>
                  {m.text}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
