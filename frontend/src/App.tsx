import React, { useState, useEffect } from 'react';
import { RecallHeader } from './components/RecallHeader';
import { LearningEvolutionView } from './components/LearningEvolutionView';
import { IncidentTriage } from './components/IncidentTriage';
import { MemoryInspector } from './components/MemoryInspector';
import { TelemetryView } from './components/TelemetryView';
import type { HealthResponse, MemoryItem } from './types';
import { fetchHealth, recallMemories, seedDemoIncidents } from './api';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'agent' | 'learning' | 'memories' | 'telemetry'>('agent');
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
      const memories = await recallMemories('incident post-mortem runbook checkout-service auth-service', 8);
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
      
      {/* Top RecallAI Header with Brand, Telemetry, and Web Navigation */}
      <RecallHeader
        health={health}
        loading={healthLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
        onRefresh={loadHealth}
      />

      {/* Main View Container */}
      <main style={{ flex: 1, paddingBottom: '32px' }}>
        
        {/* Tab: Learning & Evolution */}
        {activeTab === 'learning' && (
          <LearningEvolutionView />
        )}

        {/* Tab 2: AI Agent (Live Memory Chat & Multi-turn Triage) */}
        {activeTab === 'agent' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
            <IncidentTriage
              onMemoryUsed={(memories) => {
                if (memories && memories.length > 0) {
                  setActiveMemories(memories);
                }
              }}
              activeService={activeService}
              setActiveService={setActiveService}
            />
            <MemoryInspector activeMemories={activeMemories} />
          </div>
        )}

        {/* Tab 3: Hindsight Memories Store (Full Explorer) */}
        {activeTab === 'memories' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <MemoryInspector activeMemories={activeMemories} />
          </div>
        )}

        {/* Tab 4: Telemetry & Architecture */}
        {activeTab === 'telemetry' && (
          <TelemetryView health={health} />
        )}

      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        paddingTop: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#777587',
        borderTop: '1px solid #e2e8f0'
      }}>
        RecallAI • HackWithHyderabad 3.0 • Built with Hindsight Memory Layer &amp; Groq (<code style={{ color: '#4f46e5' }}>openai/gpt-oss-120b</code>)
      </footer>

    </div>
  );
};

export default App;
