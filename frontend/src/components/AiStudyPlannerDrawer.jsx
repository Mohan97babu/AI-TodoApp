import React, { useState } from 'react';
import { Sparkles, X, BookOpen, Clock, Calendar, Send, Compass, Lightbulb } from 'lucide-react';
import { aiService } from '../services/aiService';

export function AiStudyPlannerDrawer({ isOpen, onClose, onPlanGenerated }) {
  const [topic, setTopic] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [dailyHours, setDailyHours] = useState(2.0);
  const [skillLevel, setSkillLevel] = useState('BEGINNER');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Quick preset topics
  const presets = [
    'Master React 19 & Modern Hooks',
    'Docker & Kubernetes Cloud DevOps',
    'Spring Boot 3 & Microservices Architecture',
    'System Design & Distributed Systems',
    'Python for Machine Learning & Data Science',
  ];

  // Chat Coach state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your AI Learning Architect. Name any topic, framework, or skill you want to master, and I will structure it into an actionable, day-by-day plan with clear time estimates."
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatting, setChatting] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim() || generating) return;

    setGenerating(true);
    setError('');

    try {
      const plan = await aiService.generateStudyPlan(topic, durationDays, dailyHours, skillLevel);
      onPlanGenerated(plan);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to generate study plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatting) return;

    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatting(true);

    try {
      const res = await aiService.chatCoach(userMsg);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Focus on small, daily actionable steps with active recall and hands-on coding drills!' }
      ]);
    } finally {
      setChatting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 90,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--adobe-red-light)',
              border: '1px solid var(--adobe-red-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--adobe-red)',
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Study Architect</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Turn any skill into a verified, day-by-day plan
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Generator Form */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          {error && (
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(235, 16, 0, 0.12)',
              border: '1px solid rgba(235, 16, 0, 0.3)',
              color: '#FF4D4D',
              fontSize: '0.825rem',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate}>
            {/* Topic Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                WHAT DO YOU WANT TO LEARN?
              </label>
              <div style={{ position: 'relative' }}>
                <BookOpen size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React 19, AWS Solutions Architect, French B1..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.3rem',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {/* Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTopic(p)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration and Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span>PLAN DURATION</span>
                  <span style={{ color: 'var(--adobe-red)' }}>{durationDays} Days</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--adobe-red)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  DAILY STUDY TIME
                </label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value={1.0}>1.0 Hour / day</option>
                  <option value={1.5}>1.5 Hours / day</option>
                  <option value={2.0}>2.0 Hours / day</option>
                  <option value={3.0}>3.0 Hours / day</option>
                  <option value={4.0}>4.0 Hours / day (Intensive)</option>
                </select>
              </div>
            </div>

            {/* Target Skill Level */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                CURRENT SKILL LEVEL
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSkillLevel(lvl)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: skillLevel === lvl ? 'var(--adobe-red-light)' : 'var(--bg-input)',
                      border: skillLevel === lvl ? '1px solid var(--adobe-red)' : '1px solid var(--border-subtle)',
                      color: skillLevel === lvl ? 'var(--adobe-red)' : 'var(--text-secondary)',
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!topic.trim() || generating}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <Sparkles size={16} />
              <span>{generating ? 'Architecting Plan...' : 'Generate & Review Study Plan'}</span>
            </button>
          </form>
        </div>

        {/* Chat Coach Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem 1.5rem', minHeight: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <Lightbulb size={16} color="var(--adobe-red)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em' }}>STUDY STRATEGY COACH</span>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            marginBottom: '0.75rem',
            maxHeight: '220px',
          }}>
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? 'var(--adobe-red)' : 'var(--bg-canvas)',
                  color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  maxWidth: '85%',
                  fontSize: '0.825rem',
                  lineHeight: 1.4,
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Ask advice on pacing, retention, tools..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.55rem 0.75rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.825rem',
              }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatting}
              className="btn-secondary"
              style={{ padding: '0.55rem 0.85rem' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
