import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, Plus, Trash2, Calendar, Clock, Flag, Sparkles, BookOpen, Edit3 } from 'lucide-react';

export function StudyPlanModal({ plan, isOpen, onClose, onConfirmPlan }) {
  const [editablePlan, setEditablePlan] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (plan) {
      // Deep clone to allow editing
      setEditablePlan(JSON.parse(JSON.stringify(plan)));
    }
  }, [plan]);

  if (!isOpen || !editablePlan) return null;

  // Handlers for modifying the plan
  const handleTaskChange = (dayIndex, taskIndex, field, value) => {
    setEditablePlan((prev) => {
      const next = { ...prev };
      next.days[dayIndex].tasks[taskIndex][field] = value;
      return next;
    });
  };

  const handleDeleteTask = (dayIndex, taskIndex) => {
    setEditablePlan((prev) => {
      const next = { ...prev };
      next.days[dayIndex].tasks.splice(taskIndex, 1);
      return next;
    });
  };

  const handleAddTaskToDay = (dayIndex) => {
    setEditablePlan((prev) => {
      const next = { ...prev };
      next.days[dayIndex].tasks.push({
        title: 'New practice milestone',
        description: 'Focus on hands-on application and note taking',
        estimatedMinutes: 45,
        priority: 'MEDIUM',
        category: 'STUDY',
      });
      return next;
    });
  };

  const handleAddDay = () => {
    setEditablePlan((prev) => {
      const next = { ...prev };
      const newDayNum = next.days.length + 1;
      next.days.push({
        dayNumber: newDayNum,
        dayTitle: `Day ${newDayNum}: Hands-on Consolidation`,
        focusTheme: 'Consolidate learnings and build mini-project',
        tasks: [
          {
            title: `Practice module for ${editablePlan.topic}`,
            description: 'Apply core patterns and write concise recap notes',
            estimatedMinutes: 60,
            priority: 'HIGH',
            category: 'STUDY',
          }
        ]
      });
      return next;
    });
  };

  const handleDeleteDay = (dayIndex) => {
    setEditablePlan((prev) => {
      const next = { ...prev };
      next.days.splice(dayIndex, 1);
      // Re-number days
      next.days.forEach((d, idx) => {
        d.dayNumber = idx + 1;
      });
      return next;
    });
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // Calculate due dates for each day based on startDate
      const baseDate = new Date(startDate);
      const tasksToCreate = [];

      editablePlan.days.forEach((day, dayIdx) => {
        const dayDueDate = new Date(baseDate);
        dayDueDate.setDate(baseDate.getDate() + dayIdx);
        dayDueDate.setHours(18, 0, 0, 0); // Scheduled for 6:00 PM on that day

        day.tasks.forEach((t) => {
          tasksToCreate.push({
            title: t.title,
            description: `[${day.dayTitle} - ${day.focusTheme}]\n${t.description}`,
            priority: t.priority || 'MEDIUM',
            category: 'STUDY',
            dueDate: dayDueDate.toISOString(),
            estimatedMinutes: t.estimatedMinutes || 45,
            isRecurring: false,
            recurrenceInterval: 'NONE',
            reminderMinutesBefore: 30, // 30 min before by default
          });
        });
      });

      await onConfirmPlan({
        studyPlanId: editablePlan.id,
        tasks: tasksToCreate,
      });

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#EB1000', '#FF3B30', '#FFFFFF', '#FFA299']
      });

      onClose();
    } catch (err) {
      console.error('Failed to confirm study plan:', err);
    } finally {
      setConfirming(false);
    }
  };

  const totalTasks = editablePlan.days.reduce((acc, d) => acc + d.tasks.length, 0);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.25rem',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        animation: 'fadeInSlideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="tag-badge prio-urgent" style={{ fontSize: '0.65rem' }}>
                AI GENERATED ROADMAP
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {editablePlan.durationDays} Days • {editablePlan.skillLevel} Level
              </span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {editablePlan.topic}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {editablePlan.summary}
            </p>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Plan Body - Scrollable Day Cards */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          {editablePlan.days.map((day, dayIdx) => (
            <div
              key={day.dayNumber || dayIdx}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.15rem 1.25rem',
              }}
            >
              {/* Day Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <input
                    type="text"
                    value={day.dayTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditablePlan((prev) => {
                        const next = { ...prev };
                        next.days[dayIdx].dayTitle = val;
                        return next;
                      });
                    }}
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: '1px dashed var(--border-subtle)',
                      color: 'var(--adobe-red)',
                      width: '100%',
                      outline: 'none',
                      marginBottom: '0.25rem',
                    }}
                  />
                  <input
                    type="text"
                    value={day.focusTheme}
                    placeholder="Focus theme..."
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditablePlan((prev) => {
                        const next = { ...prev };
                        next.days[dayIdx].focusTheme = val;
                        return next;
                      });
                    }}
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      width: '100%',
                      outline: 'none',
                    }}
                  />
                </div>

                {editablePlan.days.length > 1 && (
                  <button
                    onClick={() => handleDeleteDay(dayIdx)}
                    className="btn-ghost"
                    style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                    title="Remove Day"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Day's Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {day.tasks.map((task, taskIdx) => (
                  <div
                    key={taskIdx}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskChange(dayIdx, taskIdx, 'title', e.target.value)}
                        style={{
                          flex: 1,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Priority Selector */}
                        <select
                          value={task.priority || 'MEDIUM'}
                          onChange={(e) => handleTaskChange(dayIdx, taskIdx, 'priority', e.target.value)}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-canvas)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>

                        {/* Estimated Minutes */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <Clock size={12} />
                          <input
                            type="number"
                            min="10"
                            max="300"
                            step="5"
                            value={task.estimatedMinutes || 45}
                            onChange={(e) => handleTaskChange(dayIdx, taskIdx, 'estimatedMinutes', Number(e.target.value))}
                            style={{
                              width: '45px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderBottom: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              textAlign: 'center',
                              fontSize: '0.72rem',
                            }}
                          />
                          <span>m</span>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(dayIdx, taskIdx)}
                          className="btn-ghost"
                          style={{ padding: '0.2rem', color: 'var(--text-muted)' }}
                          title="Remove task"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={task.description}
                      onChange={(e) => handleTaskChange(dayIdx, taskIdx, 'description', e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        lineHeight: 1.4,
                      }}
                    />
                  </div>
                ))}

                {/* Add Task Button */}
                <button
                  type="button"
                  onClick={() => handleAddTaskToDay(dayIdx)}
                  style={{
                    alignSelf: 'flex-start',
                    fontSize: '0.75rem',
                    color: 'var(--adobe-red)',
                    fontWeight: 600,
                    padding: '0.25rem 0.5rem',
                  }}
                >
                  + Add task to this day
                </button>
              </div>
            </div>
          ))}

          {/* Add Day Button */}
          <button
            type="button"
            onClick={handleAddDay}
            className="btn-secondary"
            style={{ width: '100%', padding: '0.65rem', borderStyle: 'dashed' }}
          >
            <Plus size={16} />
            <span>Add Day {editablePlan.days.length + 1} to Study Plan</span>
          </button>
        </div>

        {/* Footer Confirmation Bar */}
        <div style={{
          padding: '1.15rem 1.75rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
              <Calendar size={15} color="var(--adobe-red)" />
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Start Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3rem 0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ({totalTasks} tasks across {editablePlan.days.length} days)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Discard
            </button>
            <button
              type="button"
              disabled={confirming || totalTasks === 0}
              onClick={handleConfirm}
              className="btn-primary"
              style={{ padding: '0.65rem 1.4rem' }}
            >
              <Check size={16} />
              <span>{confirming ? 'Adding Tasks...' : 'Confirm & Add to My To-Dos'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
