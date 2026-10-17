import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Sparkles, Bell, Sun, Moon, LogIn, LogOut, CheckCircle2, User, X } from 'lucide-react';

export function Navbar({ onOpenAiPlanner, theme, onToggleTheme }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { reminders, dismissReminder, requestBrowserPermission } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      backdropFilter: 'blur(12px)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #EB1000 0%, #A30800 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.2rem',
            letterSpacing: '-0.05em',
            boxShadow: 'var(--shadow-red)'
          }}>
            P
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Planify</span>
              <span className="tag-badge prio-urgent" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>CREATIVE</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '-2px' }}>
              Adobe-Inspired Daily & AI Study Planner
            </p>
          </div>
        </div>

        {/* Center / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* AI Study Plan Button */}
          <button
            onClick={onOpenAiPlanner}
            className="btn-primary"
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Sparkles size={16} />
            <span>AI Study Planner</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="btn-ghost"
            title="Toggle Dark/Light Mode"
            style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0 }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-ghost"
              title="Notifications"
              style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0, position: 'relative' }}
            >
              <Bell size={18} />
              {reminders.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--adobe-red)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {reminders.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '320px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '1rem',
                zIndex: 50,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Upcoming Reminders</span>
                  <button
                    onClick={() => requestBrowserPermission()}
                    style={{ fontSize: '0.72rem', color: 'var(--adobe-red)', fontWeight: 600 }}
                  >
                    Enable Browser Push
                  </button>
                </div>

                {reminders.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>
                    No upcoming reminders.
                  </p>
                ) : (
                  <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {reminders.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          padding: '0.6rem 0.8rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ overflow: 'hidden' }}>
                          <p style={{ fontSize: '0.825rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {r.taskTitle}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {new Date(r.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {r.minutesBefore}m prior
                          </p>
                        </div>
                        <button
                          onClick={() => dismissReminder(r.id)}
                          className="btn-ghost"
                          style={{ padding: '0.2rem', color: 'var(--text-muted)' }}
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Auth Menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--adobe-red)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.fullName?.split(' ')[0] || user?.username}
                </span>
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  width: '200px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 50,
                }}>
                  <div style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700 }}>{user?.fullName}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>@{user?.username}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--color-urgent)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                    }}
                    className="btn-ghost"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
