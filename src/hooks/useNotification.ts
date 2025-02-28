/**
 * Hook for showing notifications
 */
import { useState, useCallback } from 'react';

interface CustomNotification {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    id: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  
    /**
     * Show a notification
     * @param message - Notification message
     * @param type - Notification type (success, error, warning, info)
     * @param duration - Duration in milliseconds
     */
    const showNotification = useCallback((
      message: string, 
      type: 'success' | 'error' | 'warning' | 'info' = 'info', 
      duration: number = 3000
    ) => {
      const id = Date.now().toString();
      
      setNotifications(prev => [...prev, { message, type, id }]);
      
      if (duration) {
        setTimeout(() => {
          dismissNotification(id);
        }, duration);
      }
    }, []);
  
    /**
     * Dismiss a notification
     * @param id - Notification ID
     */
    const dismissNotification = useCallback((id: string) => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);
  
    return {
      notifications,
      showNotification,
      dismissNotification,
    };
  }