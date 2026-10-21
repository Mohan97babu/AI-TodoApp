import React, { useState } from 'react';
import { Plus, Calendar, Flag, Repeat, Bell, Tag, ChevronDown, Sparkles } from 'lucide-react';

export function QuickAddTask({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('WORK');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('NONE');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    setFormError('');
    try {
      let isoDueDate = null;
      if (dueDate) {
        isoDueDate = new Date(dueDate).toISOString();
      }

      await onAddTask({
        title: title.trim(),
        priority,
        category,
        dueDate: isoDueDate,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : 'NONE',
        reminderMinutesBefore: dueDate ? reminderMinutesBefore : null,
      });

      // Reset
      setTitle('');
      setDueDate('');
      setShowOptions(false);
      setIsRecurring(false);
      setRecurrenceInterval('NONE');
    } catch (err) {
      console.error('Failed to create task:', err);
      setFormError(err.message || 'Could not create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '0.85rem 1.15rem',
      marginBottom: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      transition: 'var(--transition)',
    }}>
      <form onSubmit={handleSubmit}>
        {formError && <p role="alert" style={{ color: 'var(--color-urgent)', fontSize: '.85rem', marginBottom: '.5rem' }}>{formError}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid var(--border-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <Plus size={14} />
          </div>

          <input
            id="quick-add-title"
            type="text"
            placeholder="Add a new task... (press Enter or configure below)"
            aria-label="New task title"
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setShowOptions(true)}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
            }}
          />

          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            aria-expanded={showOptions}
            aria-label="Task options"
            className="btn-ghost"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
          >
            <span>Options</span>
            <ChevronDown size={14} style={{ transform: showOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          <button
            type="submit"
            disabled={!title.trim() || submitting}
            className="btn-primary"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              opacity: title.trim() ? 1 : 0.6,
            }}
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>

        {/* Expandable Options Row */}
        {showOptions && (
          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.85rem',
            animation: 'fadeInSlideUp 0.2s ease',
          }}>
            {/* Due Date Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} color="var(--text-secondary)" />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Priority Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Flag size={14} color="var(--text-secondary)" />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent (Adobe Red)</option>
              </select>
            </div>

            {/* Category Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Tag size={14} color="var(--text-secondary)" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              >
                <option value="WORK">Work</option>
                <option value="STUDY">Study & Learning</option>
                <option value="PERSONAL">Personal</option>
                <option value="HEALTH">Health & Fitness</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            {/* Recurrence Rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={() => {
                  const nextState = !isRecurring;
                  setIsRecurring(nextState);
                  if (nextState && recurrenceInterval === 'NONE') {
                    setRecurrenceInterval('DAILY');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  backgroundColor: isRecurring ? 'var(--adobe-red-light)' : 'var(--bg-canvas)',
                  border: isRecurring ? '1px solid var(--adobe-red-border)' : '1px solid var(--border-subtle)',
                  color: isRecurring ? 'var(--adobe-red)' : 'var(--text-secondary)',
                }}
              >
                <Repeat size={13} />
                <span>Repeat</span>
              </button>

              {isRecurring && (
                <select
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="DAILY">Every Day</option>
                  <option value="WEEKDAYS">Mon - Fri (Weekdays)</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              )}
            </div>

            {/* Reminder Setting */}
            {dueDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Bell size={13} color="var(--adobe-red)" />
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value={0}>At time of event</option>
                  <option value={15}>15 mins prior</option>
                  <option value={30}>30 mins prior</option>
                  <option value={60}>1 hour prior</option>
                  <option value={1440}>1 day prior</option>
                </select>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
