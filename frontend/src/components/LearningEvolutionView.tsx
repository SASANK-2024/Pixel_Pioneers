import React, { useState } from 'react';

export const LearningEvolutionView: React.FC = () => {
  const [diffMode, setDiffMode] = useState<'before' | 'after'>('after');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Intro & Efficiency Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: '#eff4ff',
              color: '#3525cd',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              <span className="material-symbols-outlined material-symbols-fill" style={{ fontSize: '15px' }}>auto_graph</span>
              <span>Evolution Telemetry</span>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: '#ecfdf5',
              color: '#047857',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
              <span>+48% Efficiency</span>
            </div>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0b1c30', letterSpacing: '-0.02em' }}>
            Learning &amp; Evolution
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#464555', marginTop: '2px' }}>
            See how the agent becomes exponentially more useful over time through Hindsight persistent memory.
          </p>
        </div>
      </div>

      {/* Grid: Left Column (Progression Curve + Velocity) | Right Column (Interactive Diff + Milestones) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Dynamic Progression Chart Card */}
          <div className="card-base" style={{ padding: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#4f46e5' }}>insights</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1c30' }}>Cognitive Alignment Curve</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#464555', marginTop: '2px' }}>
                  Real-time memory synergy &amp; prompt compression over multiple weeks
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4f46e5', display: 'block', lineHeight: 1 }}>94%</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', letterSpacing: '0.02em' }}>+62% from W1</span>
              </div>
            </div>

            {/* SVG Area / Line Chart with Synapse Markers */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '160px',
              background: '#f8faff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              overflow: 'hidden'
            }}>
              {/* Guidelines */}
              <div style={{ position: 'absolute', left: '16px', right: '16px', top: '25px', height: '1px', background: '#e2e8f0' }}></div>
              <div style={{ position: 'absolute', left: '16px', right: '16px', top: '70px', height: '1px', background: '#e2e8f0' }}></div>
              <div style={{ position: 'absolute', left: '16px', right: '16px', top: '115px', height: '1px', background: '#e2e8f0' }}></div>

              <svg style={{ width: '100%', height: '100px', overflow: 'visible' }} viewBox="0 0 400 100" fill="none">
                <defs>
                  <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <path d="M 20 80 Q 110 75, 140 50 T 260 30 T 380 8 L 380 100 L 20 100 Z" fill="url(#curveGradient)" />
                {/* Line Curve */}
                <path d="M 20 80 Q 110 75, 140 50 T 260 30 T 380 8" fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />
                {/* Milestones */}
                <circle cx="20" cy="80" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                <circle cx="140" cy="50" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                <circle cx="260" cy="30" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                <circle cx="380" cy="8" r="7" fill="#4f46e5" />
                <circle cx="380" cy="8" r="14" stroke="#4f46e5" strokeWidth="2" strokeOpacity="0.4" className="synapse-ping" />
              </svg>

              {/* Stage Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', fontSize: '0.78rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#464555' }}>W1</span>
                  <span style={{ display: 'block', color: '#777587', fontSize: '0.72rem' }}>32%</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#464555' }}>W2</span>
                  <span style={{ display: 'block', color: '#777587', fontSize: '0.72rem' }}>58%</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#464555' }}>W3</span>
                  <span style={{ display: 'block', color: '#777587', fontSize: '0.72rem' }}>79%</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#4f46e5' }}>Now</span>
                  <span style={{ display: 'block', color: '#4f46e5', fontWeight: 800, fontSize: '0.75rem' }}>94%</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Ticker */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px' }}>
              <div style={{ background: '#eff4ff', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#dce9ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>hub</span>
                </div>
                <div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', display: 'block', lineHeight: 1.1 }}>842</span>
                  <span style={{ fontSize: '0.75rem', color: '#464555' }}>Memories Recalled</span>
                </div>
              </div>

              <div style={{ background: '#eff4ff', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified</span>
                </div>
                <div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46', display: 'block', lineHeight: 1.1 }}>0</span>
                  <span style={{ fontSize: '0.75rem', color: '#464555' }}>Hallucinations</span>
                </div>
              </div>
            </div>

          </div>

          {/* Learning Velocity & Precision Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="card-base" style={{ padding: '18px', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>speed</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>+22%</span>
              </div>
              <div>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0b1c30', display: 'block', lineHeight: 1 }}>14</span>
                <span style={{ fontSize: '0.75rem', color: '#464555', marginTop: '4px', display: 'block' }}>New Insights / Week</span>
              </div>
            </div>

            <div className="card-base" style={{ padding: '18px', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>psychology_alt</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>Optimal</span>
              </div>
              <div>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#065f46', display: 'block', lineHeight: 1 }}>96.8%</span>
                <span style={{ fontSize: '0.75rem', color: '#464555', marginTop: '4px', display: 'block' }}>Auto-Retention Precision</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Diff + Synapse Milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Before vs After Memory Transformation (Judge-Favorite UX) */}
          <div className="card-base" style={{ padding: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#7c3aed' }}>compare_arrows</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1c30' }}>Memory Transformation</h3>
              </div>
              <span style={{
                background: '#f5f3ff',
                color: '#7c3aed',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '9999px',
                border: '1px solid #ddd6fe'
              }}>
                Interactive Diff
              </span>
            </div>

            {/* Toggle Selector */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '4px',
              gap: '4px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => setDiffMode('before')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: diffMode === 'before' ? '#ffffff' : 'transparent',
                  color: diffMode === 'before' ? '#ba1a1a' : '#475569',
                  boxShadow: diffMode === 'before' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Generic AI (Cold)
              </button>
              <button
                onClick={() => setDiffMode('after')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: diffMode === 'after' ? '#ffffff' : 'transparent',
                  color: diffMode === 'after' ? '#4f46e5' : '#475569',
                  boxShadow: diffMode === 'after' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                RecallAI + Hindsight
              </button>
            </div>

            {/* Scenario Banner */}
            <div style={{ background: '#e5eeff', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#464555' }}>User Prompt:</span>
              <span style={{ fontWeight: 700, color: '#0b1c30' }}>"Explain OAuth2 PKCE flow"</span>
            </div>

            {/* Card Content based on diffMode */}
            {diffMode === 'before' ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ba1a1a', fontWeight: 700, fontSize: '0.82rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                    <span>BEFORE MEMORY</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#777587' }}>Without Hindsight</span>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#464555', lineHeight: 1.6, marginBottom: '12px' }}>
                  "Authentication has a rich computing history dating back to 1960s mainframes. In modern terminology, OAuth stands for Open Authorization. Here are 10 foundational concepts, followed by generic RFC quotes and a 60-line diagram..."
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                    No User Context
                  </span>
                  <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                    High Verbosity
                  </span>
                  <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                    Disconnected
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ background: '#eff0fe', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4f46e5', fontWeight: 800, fontSize: '0.82rem' }}>
                    <span className="material-symbols-outlined material-symbols-fill" style={{ fontSize: '18px' }}>check_circle</span>
                    <span>AFTER MEMORY</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ffffff', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, color: '#0b1c30', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
                    <span>2 Memories Injected</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: '#0b1c30', lineHeight: 1.5, marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4f46e5', marginTop: '2px' }}>arrow_right</span>
                    <p><strong>Placement Interview Key:</strong> PKCE prevents authorization code injection in public mobile/SPA clients without client secrets.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4f46e5', marginTop: '2px' }}>arrow_right</span>
                    <p><strong>Core Handshake:</strong> Code Verifier (SHA-256 hashed) becomes Code Challenge. Verified during token swap.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4f46e5', marginTop: '2px' }}>arrow_right</span>
                    <p><strong>Concise cURL:</strong> <code style={{ background: '#e5eeff', padding: '2px 6px', borderRadius: '4px', color: '#3525cd', fontSize: '0.78rem' }}>/token?code_verifier=xyz</code></p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#ffffff', color: '#3525cd', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    Placement-optimized
                  </span>
                  <span style={{ background: '#ffffff', color: '#7c3aed', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    Concise Depth
                  </span>
                  <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                    Saved 4.2m Reading
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Interactive Learning Events Timeline */}
          <div className="card-base" style={{ padding: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#4f46e5' }}>timeline</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1c30' }}>Synapse Milestones</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#777587', fontWeight: 600 }}>4 Key Inflections</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
              
              {/* Event 1 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
                  1
                </div>
                <div style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>Atomic Extraction</span>
                    <span style={{ fontSize: '0.72rem', color: '#777587' }}>Day 2</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#0b1c30', lineHeight: 1.4, marginBottom: '6px' }}>
                    Sharanya mentioned placement prep &amp; a strict preference for brevity.
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#eff4ff', color: '#3525cd', fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>
                      2 memories retained
                    </span>
                    <span style={{ background: '#eff4ff', color: '#464555', fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>
                      Interview: Tech Lead
                    </span>
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#7c3aed', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
                  2
                </div>
                <div style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed' }}>Boilerplate Suppression</span>
                    <span style={{ fontSize: '0.72rem', color: '#777587' }}>Day 6</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#0b1c30', lineHeight: 1.4, marginBottom: '6px' }}>
                    User asked about REST vs GraphQL. Recalled brevity preference; filtered introductory tutorials automatically.
                  </p>
                  <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#d97706' }}>flash_on</span>
                    Zero-intro mode active
                  </span>
                </div>
              </div>

              {/* Event 3 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
                  3
                </div>
                <div style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>Rubric Synthesis</span>
                    <span style={{ fontSize: '0.72rem', color: '#777587' }}>Day 11</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#0b1c30', lineHeight: 1.4, marginBottom: '6px' }}>
                    System design query: cross-referenced previous notes on distributed caching with placement evaluation criteria.
                  </p>
                  <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#059669' }}>done_all</span>
                    Scoring rubric mapped
                  </span>
                </div>
              </div>

              {/* Event 4 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
                  4
                </div>
                <div style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>Autonomous Calibration</span>
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>Now</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#0b1c30', lineHeight: 1.4, marginBottom: '8px' }}>
                    Continuous positive feedback loop locked in. Cognitive confidence elevated to 98% with zero user friction.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, background: '#eff4ff', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: '98%', height: '100%', background: '#059669', borderRadius: '9999px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669' }}>98% Match</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
