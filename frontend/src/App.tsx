import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IncidentTriage } from './components/IncidentTriage';
import { MemoryInspector } from './components/MemoryInspector';
import { LearningProgression } from './components/LearningProgression';
import type { HealthResponse, MemoryItem } from './types';
import { fetchHealth, recallMemories, seedDemoIncidents } from './api';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [activeMemories, setActiveMemories] = useState<MemoryItem[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeService, setActiveService] = useState('checkout-service');

  const loadHealth = async () => {
    setHealthLoading(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      console.error('Health fetch error:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  const loadInitialMemories = async () => {
    try {
      const memories = await recallMemories('incident post-mortem runbook checkout-service auth-service', 6);
      setActiveMemories(memories);
    } catch (err) {
      console.error('Failed to load initial memories:', err);
    }
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      await seedDemoIncidents();
      await loadInitialMemories();
    } catch (err) {
      console.error('Seeding error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    loadHealth();
    loadInitialMemories();
  }, []);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <Header
        health={health}
        loading={healthLoading}
        onRefresh={loadHealth}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
      />

      {/* Main Grid: Triage Console on Left / Memory & Learning on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Triage & Incident Command */}
        <div>
          <IncidentTriage
            onMemoryUsed={(memories) => {
              if (memories && memories.length > 0) {
                setActiveMemories(memories);
              }
            }}
            activeService={activeService}
            setActiveService={setActiveService}
          />
        </div>

        {/* Right Column: Memory Store & Learning Curve */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <MemoryInspector activeMemories={activeMemories} />
          <LearningProgression />
        </div>

      </div>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        paddingTop: '32px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#64748b',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        OpsHindsight • HackWithHyderabad 3.0 • Built with Hindsight Memory Layer & Groq LLM
      </footer>

    </div>
  );
};

export default App;
