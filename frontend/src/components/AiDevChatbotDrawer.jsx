import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Sparkles, Send, X, ExternalLink, Copy, Check,
  BookOpen, Code, ChevronDown, ChevronUp, Trash2, Plus,
  RefreshCw, CheckCircle2, Globe, Terminal, Cpu
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';

export function AiDevChatbotDrawer({ isOpen, onClose, onAddTask, docked = false }) {
  const { user } = useAuth();
  const storageKey = 'planify_dev_chat_history_' + (user?.id || user?.username || 'guest');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Welcome to Planify Dev & Study Assistant!**\n\nI can answer using your **Qwen 3 (1.7B)** model and a small built-in programming reference catalog. Related links to **GeeksforGeeks**, **W3Schools**, and **TPointTech** are suggestions, not live-verified webpage results.\n\nAsk me anything about:\n- 🚀 **Algorithms & Data Structures** (Binary Search, Trees, DP)\n- 💻 **Web Engineering** (CSS Flexbox/Grid, React Hooks, JavaScript)\n- ⚙️ **Backend Architecture** (Spring Boot, REST APIs, Java Collections)\n- 🗄️ **Databases & DevOps** (SQL Joins, Docker, JWT Security)\n\nYou can also click **"+ Add to To-Dos"** on any recommended exercise to instantly schedule it into your planner!`,
        sources: [
          { site: 'GeeksforGeeks', title: 'GeeksforGeeks Portal', url: 'https://www.geeksforgeeks.org/' },
          { site: 'W3Schools', title: 'W3Schools Tutorials', url: 'https://www.w3schools.com/' },
          { site: 'TPointTech', title: 'TPointTech Learning Hub', url: 'https://www.tpointtech.com/' },
        ],
        suggestedTasks: [
          { title: 'Practice Binary Search on GeeksforGeeks', description: 'Solve standard binary search problems', priority: 'HIGH', category: 'STUDY', estimatedMinutes: 45 },
          { title: 'Build a Flexbox Card Component', description: 'Create responsive card layout using W3Schools guide', priority: 'MEDIUM', category: 'STUDY', estimatedMinutes: 30 }
        ]
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [addedTaskId, setAddedTaskId] = useState(null);
  const [expandedThinking, setExpandedThinking] = useState({});

  // Source filters
  const [sourcesEnabled, setSourcesEnabled] = useState({
    geeksforgeeks: true,
    w3schools: true,
    tpointtech: true,
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-50)));
    } catch (e) { /* ignore */ }
  }, [messages, storageKey]);

  // Fetch model health status on open
  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    try {
      const status = await aiService.getModelStatus();
      setModelStatus(status);
    } catch (err) {
      setModelStatus({ connected: false, status: 'OFFLINE' });
    }
  };

  const toggleSource = (sourceKey) => {
    setSourcesEnabled((prev) => ({
      ...prev,
      [sourceKey]: !prev[sourceKey],
    }));
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all conversation history?')) {
      const reset = [
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: 'Conversation history cleared. What would you like to study or code today?',
          sources: []
        }
      ];
      setMessages(reset);
      localStorage.removeItem(storageKey);
    }
  };

  const handleCopyCode = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleAddTaskClick = async (task, uniqueId) => {
    if (onAddTask) {
      await onAddTask({
        title: task.title,
        description: task.description || 'Generated from Dev & Study Chatbot',
        priority: task.priority || 'MEDIUM',
        category: task.category || 'STUDY',
        estimatedMinutes: task.estimatedMinutes || 45,
        status: 'PENDING'
      });
      setAddedTaskId(uniqueId);
      setTimeout(() => setAddedTaskId(null), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build lightweight conversation history for multi-turn context
      const historyPayload = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await aiService.chatCoach(query, historyPayload, sourcesEnabled);

      const aiMsg = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: res.reply || 'No response generated.',
        reasoning: res.reasoning,
        model: res.model,
        sources: res.sources || [],
        suggestedTasks: res.suggestedTasks || [],
        responseTimeMs: res.responseTimeMs,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `⚠️ **Unable to answer**: ${err.message || 'The assistant is currently unavailable.'} Please try again after checking the service.`,
          sources: [
            { site: 'GeeksforGeeks', title: 'GeeksforGeeks Tutorial Portal', url: 'https://www.geeksforgeeks.org/' },
            { site: 'W3Schools', title: 'W3Schools Web Guide', url: 'https://www.w3schools.com/' },
            { site: 'TPointTech', title: 'TPointTech Tutorials', url: 'https://www.tpointtech.com/' }
          ],
          suggestedTasks: [
            { title: 'Check Local Model Gateway on Port 8000', description: 'Run start_server.bat in E:\\model', priority: 'HIGH', category: 'WORK', estimatedMinutes: 10 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Explain Binary Search with Java code',
    'How does CSS Flexbox justify-content work?',
    'Spring Boot @RestController vs @Service',
    'SQL INNER JOIN vs LEFT JOIN with example',
    'Reverse a Singly Linked List in Python',
  ];

  if (!isOpen) return null;

  return (
    <div className={`chat-dialog ${docked ? "chat-docked" : ""}`} role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 95,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div className="chat-panel" role="dialog" aria-modal={!docked} aria-label="Dev and Study AI Assistant" style={{
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
      }}>
        {/* Top Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-elevated)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #EB1000 0%, #A30800 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-red)',
            }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  AI Study Companion
                </h3>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '100px',
                  backgroundColor: 'rgba(235, 16, 0, 0.15)',
                  color: '#EB1000',
                  letterSpacing: '0.04em',
                }}>
                  QWEN 3
                </span>
              </div>
              {/* Model status indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: modelStatus?.connected ? '#22C55E' : '#F59E0B',
                  boxShadow: modelStatus?.connected ? '0 0 8px #22C55E' : 'none',
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {modelStatus === null ? 'Checking local model…' : modelStatus.connected
                    ? `Local Qwen 3 (1.7B) • ${modelStatus.latencyMs ? modelStatus.latencyMs + 'ms' : 'Ready'}`
                    : 'Local model offline — using saved topic notes'}
                </span>
                <button
                  onClick={checkStatus}
                  className="btn-ghost"
                  style={{ padding: '0 4px', height: '18px' }}
                  title="Refresh connection status"
                >
                  <RefreshCw size={11} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleClearHistory}
              className="btn-ghost"
              style={{ padding: '0.45rem', borderRadius: '6px' }}
              title="Clear conversation"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close AI assistant"
              className="btn-ghost"
              style={{ padding: '0.45rem', borderRadius: '6px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Website Knowledge Toggles Bar */}
        <div style={{
          padding: '0.6rem 1.25rem',
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
        }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={13} />
            Suggested learning links:
          </span>

          {/* GeeksforGeeks Toggle */}
          <button
            onClick={() => toggleSource('geeksforgeeks')}
            aria-pressed={sourcesEnabled.geeksforgeeks}
            aria-label="Include suggested GeeksforGeeks links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.25rem 0.65rem',
              borderRadius: '100px',
              border: '1px solid',
              borderColor: sourcesEnabled.geeksforgeeks ? '#2F8D46' : 'var(--border-subtle)',
              backgroundColor: sourcesEnabled.geeksforgeeks ? 'rgba(47, 141, 70, 0.15)' : 'transparent',
              color: sourcesEnabled.geeksforgeeks ? '#2F8D46' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            {sourcesEnabled.geeksforgeeks && <Check size={12} />}
            GeeksforGeeks
          </button>

          {/* W3Schools Toggle */}
          <button
            onClick={() => toggleSource('w3schools')}
            aria-pressed={sourcesEnabled.w3schools}
            aria-label="Include suggested W3Schools links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.25rem 0.65rem',
              borderRadius: '100px',
              border: '1px solid',
              borderColor: sourcesEnabled.w3schools ? '#04AA6D' : 'var(--border-subtle)',
              backgroundColor: sourcesEnabled.w3schools ? 'rgba(4, 170, 109, 0.15)' : 'transparent',
              color: sourcesEnabled.w3schools ? '#04AA6D' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            {sourcesEnabled.w3schools && <Check size={12} />}
            W3Schools
          </button>

          {/* TPointTech Toggle */}
          <button
            onClick={() => toggleSource('tpointtech')}
            aria-pressed={sourcesEnabled.tpointtech}
            aria-label="Include suggested TPointTech links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.25rem 0.65rem',
              borderRadius: '100px',
              border: '1px solid',
              borderColor: sourcesEnabled.tpointtech ? '#FF5722' : 'var(--border-subtle)',
              backgroundColor: sourcesEnabled.tpointtech ? 'rgba(255, 87, 34, 0.15)' : 'transparent',
              color: sourcesEnabled.tpointtech ? '#FF5722' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            {sourcesEnabled.tpointtech && <Check size={12} />}
            TPointTech
          </button>
        </div>

        {/* Messages Feed */}
        <div role="log" aria-live="polite" aria-relevant="additions text" className="chat-message-feed" style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '0.4rem',
              }}
            >
              {/* Message Bubble */}
              <div style={{
                maxWidth: '100%',
                padding: '0.9rem 1.15rem',
                borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                backgroundColor: msg.role === 'user' ? 'var(--primary-color)' : 'var(--bg-elevated)',
                color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                lineHeight: 1.55,
                fontSize: '0.9rem',
              }}>
                {/* Reasoning Accordion (if present from Qwen 3) */}
                {msg.reasoning && (
                  <div style={{
                    marginBottom: '0.75rem',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.15)',
                  }}>
                    <button
                      onClick={() => setExpandedThinking(p => ({ ...p, [msg.id]: !p[msg.id] }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Cpu size={13} />
                        Qwen 3 Thinking Process
                      </span>
                      {expandedThinking[msg.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    {expandedThinking[msg.id] && (
                      <div style={{
                        marginTop: '0.4rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        paddingRight: '4px',
                      }}>
                        {msg.reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Content Render */}
                <RenderMarkdownContent
                  content={msg.content}
                  onCopyCode={handleCopyCode}
                  copiedCodeId={copiedCodeId}
                />
              </div>

              {/* Verified Learning Sources Badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{
                  maxWidth: '90%',
                  marginTop: '0.2rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    <BookOpen size={13} />
                    Suggested learning links · not live-verified:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {msg.sources.map((src, sIdx) => {
                      let badgeColor = '#2F8D46';
                      if (src.site === 'W3Schools') badgeColor = '#04AA6D';
                      if (src.site === 'TPointTech') badgeColor = '#FF5722';

                      return (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-surface)',
                            border: `1px solid ${badgeColor}`,
                            color: badgeColor,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'transform 0.15s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <span>{src.title || src.site}</span>
                          <ExternalLink size={11} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actionable Next Steps / Add to Planner */}
              {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                <div style={{
                  maxWidth: '90%',
                  marginTop: '0.25rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(235, 16, 0, 0.05)',
                  border: '1px solid rgba(235, 16, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#EB1000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    <CheckCircle2 size={13} />
                    Recommended Practice Items (Click to Add to Planner):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {msg.suggestedTasks.map((task, tIdx) => {
                      const taskId = `${msg.id}-task-${tIdx}`;
                      const isAdded = addedTaskId === taskId;

                      return (
                        <div
                          key={tIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            padding: '0.35rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{task.title}</span>
                            {task.estimatedMinutes && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                Est: {task.estimatedMinutes} mins • Priority: {task.priority || 'HIGH'}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddTaskClick(task, taskId)}
                            className="btn-secondary"
                            disabled={isAdded}
                            style={{
                              padding: '0.25rem 0.55rem',
                              fontSize: '0.75rem',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: isAdded ? '#22C55E' : undefined,
                              color: isAdded ? '#FFFFFF' : undefined,
                              borderColor: isAdded ? '#22C55E' : undefined,
                              flexShrink: 0,
                            }}
                          >
                            {isAdded ? (
                              <>
                                <Check size={12} />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <Plus size={12} />
                                <span>Add to Tasks</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div role="status" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              maxWidth: '240px',
            }}>
              <Sparkles size={16} className="spin-slow" style={{ color: '#EB1000' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Generating your answer...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{
          padding: '0.5rem 1.25rem 0',
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
        }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(p);
              }}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '100px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#EB1000';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '0.85rem 1.25rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '0.35rem 0.5rem 0.35rem 0.85rem',
            boxShadow: 'var(--shadow-inner)',
          }}>
            <input
              type="text"
              value={input}
              maxLength={2000}
              aria-label="Ask the AI assistant a question"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about algorithms, code syntax, or web tutorials..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
              disabled={loading}
            />
            <button
              type="submit"
              aria-label={loading ? 'Generating answer' : 'Send message'}
              disabled={!input.trim() || loading}
              className="btn-primary"
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Send size={15} />
            </button>
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}>
            Qwen 3 (1.7B) when connected • Curated offline notes & suggested references
          </div>
        </form>
      </div>
    </div>
  );
}

// Markdown and Code renderer helper
function RenderMarkdownContent({ content, onCopyCode, copiedCodeId }) {
  if (!content) return null;

  // Split content by code blocks ```...```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineBreak = part.indexOf('\n');
          const lang = part.substring(3, firstLineBreak).trim() || 'code';
          const codeText = part.substring(firstLineBreak + 1, part.length - 3);
          const snippetId = `code-${index}-${codeText.length}`;
          const isCopied = copiedCodeId === snippetId;

          return (
            <div
              key={index}
              style={{
                margin: '0.6rem 0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#0A0A0E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Code Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.35rem 0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.72rem',
                color: '#9CA3AF',
                fontFamily: 'monospace',
              }}>
                <span>{lang}</span>
                <button
                  type="button"
                  onClick={() => onCopyCode(codeText, snippetId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isCopied ? '#22C55E' : '#9CA3AF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    padding: '2px 4px',
                  }}
                >
                  {isCopied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Code Pre */}
              <pre style={{
                margin: 0,
                padding: '0.75rem',
                overflowX: 'auto',
                fontSize: '0.82rem',
                color: '#E5E7EB',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                lineHeight: 1.45,
              }}>
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }

        // Standard text lines
        const lines = part.split('\n');
        return (
          <div key={index}>
            {lines.map((line, lIdx) => {
              // Render markdown pipe tables as responsive HTML instead of broken text.
              // Consecutive table lines are rendered once, as one accessible table.
              const isPipeRow = /^\\s*\\|.*\\|\\s*$/.test(line);
              const prevIsPipe = lIdx > 0 && /^\\s*\\|.*\\|\\s*$/.test(lines[lIdx - 1]);
              if (isPipeRow && prevIsPipe) return null;
              if (isPipeRow) {
                const tableLines = [];
                for (let row = lIdx; row < lines.length && /^\\s*\\|.*\\|\\s*$/.test(lines[row]); row++) {
                  tableLines.push(lines[row].trim().slice(1, -1).split('|').map(cell => cell.trim()));
                }
                const separator = tableLines[1]?.every(cell => /^:?-{3,}:?$/.test(cell));
                const header = tableLines[0];
                const bodyRows = tableLines.slice(separator ? 2 : 1);
                return (
                  <div key={lIdx} className="assistant-table-scroll" tabIndex={0} role="region" aria-label="Scroll table horizontally if needed">
                    <table className="assistant-markdown-table">
                      <thead><tr>{header.map((cell, idx) => <th key={idx} scope="col">{renderInlineStyles(cell)}</th>)}</tr></thead>
                      <tbody>{bodyRows.map((cells, row) => <tr key={row}>{header.map((_, idx) => <td key={idx}>{renderInlineStyles(cells[idx] || '')}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                );
              }
              // Heading 3
              if (line.startsWith('### ')) {
                return (
                  <h4 key={lIdx} style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.65rem 0 0.3rem', color: 'var(--text-primary)' }}>
                    {line.substring(4)}
                  </h4>
                );
              }
              // Heading 2
              if (line.startsWith('## ')) {
                return (
                  <h3 key={lIdx} style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.75rem 0 0.35rem', color: 'var(--text-primary)' }}>
                    {line.substring(3)}
                  </h3>
                );
              }
              // Bullet item
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                  <div key={lIdx} style={{ display: 'flex', gap: '6px', margin: '0.2rem 0' }}>
                    <span style={{ color: '#EB1000' }}>•</span>
                    <span>{renderInlineStyles(line.substring(2))}</span>
                  </div>
                );
              }
              // Empty line
              if (!line.trim()) {
                return <div key={lIdx} style={{ height: '0.35rem' }} />;
              }
              // Regular line
              return (
                <p key={lIdx} style={{ margin: '0.25rem 0' }}>
                  {renderInlineStyles(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Render bold **text** and inline `code`
function renderInlineStyles(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((chunk, idx) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return <strong key={idx}>{chunk.substring(2, chunk.length - 2)}</strong>;
    }
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code
          key={idx}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '0.15rem 0.35rem',
            borderRadius: '4px',
            fontSize: '0.82em',
            fontFamily: 'monospace',
            color: '#F87171',
          }}
        >
          {chunk.substring(1, chunk.length - 1)}
        </code>
      );
    }
    return chunk;
  });
}
