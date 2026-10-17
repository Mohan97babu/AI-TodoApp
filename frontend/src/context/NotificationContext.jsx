import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const notifiedIdsRef = useRef(new Set());

  const fetchReminders = useCallback(async () => {
    if (!isAuthenticated) {
      setReminders([]);
      return;
    }
    try {
      const data = await notificationService.getUpcomingReminders();
      setReminders(data || []);

      // Check if any reminder is due now
      const now = new Date();
      (data || []).forEach((rem) => {
        const remTime = new Date(rem.reminderTime);
        if (remTime <= now && !notifiedIdsRef.current.has(rem.id)) {
          notifiedIdsRef.current.add(rem.id);
          notificationService.playChime();
          notificationService.showNotification(
            `Reminder: ${rem.taskTitle}`,
            `Task is scheduled for ${new Date(rem.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          );
          setActiveAlert(rem);
        }
      });
    } catch (err) {
      console.error('Error fetching reminders:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 25000); // Poll every 25 seconds
    return () => clearInterval(interval);
  }, [fetchReminders]);

  const dismiss = async (id) => {
    try {
      await notificationService.dismissReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      if (activeAlert?.id === id) {
        setActiveAlert(null);
      }
    } catch (err) {
      console.error('Error dismissing reminder:', err);
    }
  };

  const requestBrowserPermission = async () => {
    return await notificationService.requestPermission();
  };

  return (
    <NotificationContext.Provider
      value={{
        reminders,
        activeAlert,
        dismissAlert: () => setActiveAlert(null),
        dismissReminder: dismiss,
        refreshReminders: fetchReminders,
        requestBrowserPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
