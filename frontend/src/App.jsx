import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { StatsOverview } from './components/StatsOverview';
import { DashboardWelcome } from './components/DashboardWelcome';
import { QuickAddTask } from './components/QuickAddTask';
import { TaskFilters } from './components/TaskFilters';
import { TaskCard } from './components/TaskCard';
import { TaskEditModal } from './components/TaskEditModal';
import { AiStudyPlannerDrawer } from './components/AiStudyPlannerDrawer';
import { AiDevChatbotDrawer } from './components/AiDevChatbotDrawer';
import { StudyPlanModal } from './components/StudyPlanModal';
import { taskService } from './services/taskService';
import { aiService } from './services/aiService';
import { Sparkles, CheckCircle2, AlertTriangle, X, Plus, Layers, Inbox, Bot } from 'lucide-react';

function MainApp() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { activeAlert, dismissAlert, refreshReminders } = useNotifications();

  // App Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('planify_theme') || 'dark');

  // Task & Filter state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isDevChatbotOpen, setIsDevChatbotOpen] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [reviewedPlan, setReviewedPlan] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch AI model gateway health
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await aiService.getModelStatus();
        setModelStatus(res);
      } catch (e) {
        setModelStatus({ connected: false, status: 'OFFLINE' });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('planify_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Avoid network requests on every keystroke.
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  // Fetch tasks
  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) {
      setTasks([]);
      return;
    }
    setLoading(true);
    setTaskError('');
    try {
      const data = await taskService.getTasks({
        status: activeStatus,
        category: activeCategory,
        search: debouncedSearch,
      });
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTaskError('We could not load your tasks. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeStatus, activeCategory, debouncedSearch]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Task actions
  const handleAddTask = async (taskData) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const created = await taskService.createTask(taskData);
      setTasks((prev) => [created, ...prev]);
      showToast('Task created successfully');
      refreshReminders();
    } catch (err) {
      showToast(err.message || 'Could not create task');
      throw err;
    }
  };

  const handleToggleStatus = async (taskId, newStatus) => {
    try {
      const updated = await taskService.updateStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      loadTasks(); // refresh in case recurring task spawned next recurrence
      refreshReminders();
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Could not update task. Try again.');
    }
  };

  const handleSaveTaskEdit = async (taskId, updateData) => {
    try {
      const updated = await taskService.updateTask(taskId, updateData);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showToast('Task updated');
      refreshReminders();
    } catch (err) {
      showToast(err.message || 'Could not save changes');
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast('Task deleted');
      refreshReminders();
    } catch (err) {
      console.error('Failed to delete task:', err);
      showToast('Could not delete task. Try again.');
    }
  };

  // AI Plan confirmation
  const handlePlanGenerated = (plan) => {
    setReviewedPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleConfirmPlan = async (batchPayload) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    const createdList = await taskService.batchCreateTasks(
      batchPayload.tasks,
      batchPayload.studyPlanId
    );
    setTasks((prev) => [...createdList, ...prev]);
    showToast(`Added ${createdList.length} tasks from '${reviewedPlan?.topic}' to your to-do list!`);
    loadTasks();
    refreshReminders();
  };

  // Counts for filters
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'PENDING').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenAiPlanner={() => setIsAiDrawerOpen(true)}
        onOpenDevChatbot={() => setIsDevChatbotOpen(true)}
        modelStatus={modelStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Floating Active Reminder Alert Banner */}
      {activeAlert && (
        <div style={{
          backgroundColor: 'var(--adobe-red)',
          color: '#FFFFFF',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeInSlideUp 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
              Reminder Alert: <strong>{activeAlert.taskTitle}</strong> is scheduled for now!
            </span>
          </div>
          <button
            onClick={dismissAlert}
            style={{ color: '#FFFFFF', padding: '0.2rem', borderRadius: '4px' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 99,
          animation: 'fadeInSlideUp 0.25s ease',
        }}>
          <CheckCircle2 size={16} color="var(--adobe-red)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      <main className="app-container" style={{ flex: 1 }}>
        {/* Unauthenticated Welcome Banner */}
        {!isAuthenticated && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem 2rem',
            marginBottom: '1.75rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(235,16,0,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ maxWidth: '640px' }}>
              <span className="tag-badge prio-urgent" style={{ marginBottom: '0.65rem' }}>
                CREATIVE SUITE EDITION
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                High-Velocity Daily Planning & AI Study Roadmaps
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Master tasks with configurable recurring reminders, user data isolation, and instant AI curriculum breakdowns.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openAuthModal('register')}
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  <span>Get Started (Sign Up)</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="btn-secondary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  <span>Sign In with Demo</span>
                </button>
                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="btn-ghost"
                  style={{ color: 'var(--adobe-red)', fontWeight: 600 }}
                >
                  <Sparkles size={16} />
                  <span>Preview AI Study Planner</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <DashboardWelcome
            user={user}
            tasks={tasks}
            modelStatus={modelStatus}
            onOpenDevChatbot={() => setIsDevChatbotOpen(true)}
            onOpenPlanner={() => setIsAiDrawerOpen(true)}
          />
        )}

        {/* Dashboard Overview */}
        <StatsOverview tasks={tasks} />

        {/* Quick Add Bar */}
        <QuickAddTask onAddTask={handleAddTask} />

        {/* Filters and Search */}
        <TaskFilters
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={counts}
        />

        {/* Task List Section */}
        {taskError && (
          <div role="alert" className="task-error">
            <span>{taskError}</span>
            <button type="button" className="btn-secondary" onClick={loadTasks}>Retry</button>
          </div>
        )}
        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{
              width: '28px',
              height: '28px',
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--adobe-red)',
              borderRadius: '50%',
              margin: '0 auto 0.75rem',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: '0.85rem' }}>Syncing tasks...</p>
          </div>
        ) : !taskError && tasks.length === 0 ? (
          <div style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
          }}>
            <Inbox size={42} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              {isAuthenticated ? 'No tasks found for this view' : 'Sign in to access your secure tasks'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
              {isAuthenticated
                ? 'Create a quick task above or use the AI Study Planner to generate an actionable day-by-day learning roadmap!'
                : 'Your tasks and study plans are securely isolated to your account.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              {isAuthenticated ? (
                <button onClick={() => setIsAiDrawerOpen(true)} className="btn-primary">
                  <Sparkles size={16} />
                  <span>Generate AI Study Plan</span>
                </button>
              ) : (
                <button onClick={() => openAuthModal('login')} className="btn-primary">
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onEdit={(t) => setEditingTask(t)}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal />
      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTaskEdit}
      />
      <AiStudyPlannerDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onPlanGenerated={handlePlanGenerated}
      />
      <StudyPlanModal
        plan={reviewedPlan}
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onConfirmPlan={handleConfirmPlan}
      />
      <AiDevChatbotDrawer
        isOpen={isDevChatbotOpen}
        onClose={() => setIsDevChatbotOpen(false)}
        onAddTask={handleAddTask}
      />

      {/* Floating AI Dev Assistant Trigger */}
      <button
        onClick={() => setIsDevChatbotOpen(true)}
        className="btn-primary assistant-fab"
        aria-label="Open Qwen AI assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 35,
          padding: '0.75rem 1.15rem',
          borderRadius: '100px',
          boxShadow: '0 8px 24px rgba(235, 16, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '0.875rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
        }}
        title="Open Dev & Study AI Assistant (Qwen 3)"
      >
        <Bot size={18} />
        <span>Ask Qwen 3 AI</span>
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: modelStatus?.connected ? '#22C55E' : '#F59E0B',
          boxShadow: modelStatus?.connected ? '0 0 6px #22C55E' : 'none',
        }} />
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
