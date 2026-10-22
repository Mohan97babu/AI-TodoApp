import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { StatsOverview } from './components/StatsOverview';
import { DashboardWelcome } from './components/DashboardWelcome';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { QuickAddTask } from './components/QuickAddTask';
import { TaskFilters } from './components/TaskFilters';
import { TaskCard } from './components/TaskCard';
import { TaskListToolbar } from './components/TaskListToolbar';
import { sortTasks } from './utils/taskSort';
import { filterTasks } from './utils/taskFilters';
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
  const [theme, setTheme] = useState(() => localStorage.getItem('planify_theme') || 'light');

  // Task & Filter state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('planify_task_sort') || 'DUE_SOON');

  // Modals state
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isDevChatbotOpen, setIsDevChatbotOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [modelStatus, setModelStatus] = useState(null);
  const [reviewedPlan, setReviewedPlan] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('planify_task_sort', sortBy);
  }, [sortBy]);

  // Keyboard shortcut: N focuses the new-task field when not typing elsewhere.
  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      if (event.key.toLowerCase() !== 'n' || event.ctrlKey || event.altKey || event.metaKey || event.repeat ||
          target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;
      if (isAuthenticated && !isAiDrawerOpen && !isDevChatbotOpen && !isPlanModalOpen && !editingTask) {
        setShowQuickAdd(true);
        window.requestAnimationFrame(() => document.getElementById('quick-add-title')?.focus());
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAuthenticated, isAiDrawerOpen, isDevChatbotOpen, isPlanModalOpen, editingTask]);

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
      const data = await taskService.getTasks();
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTaskError('We could not load your tasks. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
      setShowQuickAdd(false);
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

  const visibleTasks = useMemo(
    () => filterTasks(tasks, { status: activeStatus, category: activeCategory, search: debouncedSearch }),
    [tasks, activeStatus, activeCategory, debouncedSearch]
  );
  const sortedTasks = useMemo(() => sortTasks(visibleTasks, sortBy), [visibleTasks, sortBy]);

  // Counts for filters
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'PENDING').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  const navigateWorkspace = (view) => {
    setActiveView(view);
    if (view === 'overview') {
      setActiveStatus('ALL'); setActiveCategory('ALL'); setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (view === 'completed') {
      setActiveStatus('COMPLETED'); setActiveCategory('ALL'); setSearchQuery('');
    } else if (view === 'tasks') setActiveStatus('ALL');
    window.requestAnimationFrame(() =>
      document.getElementById(view === 'progress' ? 'workspace-progress' : 'workspace-tasks')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const focusNewTask = () => {
    setActiveView('tasks');
    setShowQuickAdd(true);
    window.requestAnimationFrame(() => {
      document.getElementById('quick-add-title')?.focus();
      document.getElementById('workspace-tasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="planify-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenAiPlanner={() => isAuthenticated ? setIsAiDrawerOpen(true) : openAuthModal('login')}
        onOpenDevChatbot={() => isAuthenticated ? setIsDevChatbotOpen(true) : openAuthModal('login')}
        modelStatus={modelStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
        searchQuery={searchQuery}
        onSearchChange={(value) => { setSearchQuery(value); if (isAuthenticated && value) setActiveView('tasks'); }}
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

      <div className={`workspace-shell ${isAuthenticated ? 'is-authenticated' : 'is-guest'}`}>
        {isAuthenticated && (
          <WorkspaceSidebar
            activeView={activeView}
            onNavigate={navigateWorkspace}
            onOpenPlanner={() => setIsAiDrawerOpen(true)}
            onOpenAssistant={() => setIsDevChatbotOpen(true)}
            modelStatus={modelStatus}
            counts={counts}
          />
        )}
      <main className="app-container workspace-main" style={{ flex: 1 }}>
        {/* Unauthenticated Welcome Banner */}
        {!isAuthenticated && (
          <div className="guest-landing-hero" style={{
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
                YOUR PERSONAL PRODUCTIVITY SPACE
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                A calmer way to plan your day and learn faster
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Organize tasks, stay focused, and build a study plan with your private Qwen AI assistant. Everything important, in one simple workspace.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openAuthModal('register')}
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  <span>Create free account</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="btn-secondary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => isAuthenticated ? setIsAiDrawerOpen(true) : openAuthModal('login')}
                  className="btn-ghost"
                  style={{ color: 'var(--adobe-red)', fontWeight: 600 }}
                >
                  <Sparkles size={16} />
                  <span>Explore AI planning after sign in</span>
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
            onAddTask={focusNewTask}
          />
        )}

        {/* A visitor sees a useful landing state rather than a fake zero-task dashboard. */}
        {!isAuthenticated && (
          <div className="guest-feature-grid" aria-label="What you can do with Planify">
            <div className="guest-feature-card"><CheckCircle2 size={24} aria-hidden="true" /><h2>Stay organized</h2><p>Keep daily tasks, priorities, and deadlines together.</p></div>
            <div className="guest-feature-card"><Sparkles size={24} aria-hidden="true" /><h2>Learn with a plan</h2><p>Turn study goals into manageable daily actions.</p></div>
            <div className="guest-feature-card"><Bot size={24} aria-hidden="true" /><h2>Get AI guidance</h2><p>Ask Qwen coding questions and save useful exercises.</p></div>
          </div>
        )}
        {isAuthenticated && (
          <>
        {/* Dashboard Overview */}
        <StatsOverview tasks={tasks} />

        <section id="workspace-tasks" className="workspace-tasks" aria-labelledby="workspace-tasks-heading">
          <div className="workspace-task-heading">
            <div>
              <h2 id="workspace-tasks-heading">My tasks</h2>
              <p>Stay focused on what matters next.</p>
            </div>
            <span className="minimal-task-count">{tasks.length} total</span>
          </div>
        {/* Quick add stays collapsed until New task or the N shortcut is used. */}
        {showQuickAdd && (
          <div className="minimal-quick-add-panel">
            <div className="minimal-quick-add-heading">
              <strong>Create a task</strong>
              <button type="button" className="btn-ghost" onClick={() => setShowQuickAdd(false)} aria-label="Close new task form"><X size={18} /></button>
            </div>
            <QuickAddTask onAddTask={handleAddTask} />
          </div>
        )}

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

        <TaskListToolbar count={visibleTasks.length} sortBy={sortBy} onSortChange={setSortBy} />

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
        ) : !taskError && visibleTasks.length === 0 ? (
          <div className="workspace-empty-state" style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
          }}>
            <Inbox size={42} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              {tasks.length === 0 ? 'Your next great day starts here' : 'No tasks match this view'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
              {tasks.length === 0
                ? 'Add your first task, or let the AI Study Planner help you break a goal into simple steps.'
                : 'Try a different filter, search term, or category to find what you need.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              {tasks.length === 0 ? (
                <>
                  <button type="button" className="btn-primary" onClick={focusNewTask}><Plus size={16} aria-hidden="true" /> Create my first task</button>
                  <button type="button" className="btn-secondary" onClick={() => setIsAiDrawerOpen(true)}><Sparkles size={16} aria-hidden="true" /> Generate a study plan</button>
                </>
              ) : (
                <button type="button" className="btn-secondary" onClick={() => { setActiveStatus('ALL'); setActiveCategory('ALL'); setSearchQuery(''); }}>Clear filters</button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {sortedTasks.map((task) => (
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
        </section>
          </>
        )}
      </main>
      </div>

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
      {isAuthenticated && <AiDevChatbotDrawer
        key={user?.id || user?.username || 'guest'}
        isOpen={isDevChatbotOpen}
        onClose={() => setIsDevChatbotOpen(false)}
        onAddTask={handleAddTask}
      />}

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
