import { useState, useEffect, useCallback } from 'react';
import { AnalysisResult } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { storageService } from '../services/storageService';

export const useHistory = () => {
  const [historyItems, setHistoryItems] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load history from storage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const storedHistory = storageService.get<AnalysisResult[]>(STORAGE_KEYS.HISTORY) || [];
        setHistoryItems(storedHistory);
      } catch (err) {
        setError('Failed to load history');
        console.error('Error loading history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Save history to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      storageService.set(STORAGE_KEYS.HISTORY, historyItems);
    }
  }, [historyItems, isLoading]);

  /**
   * Add an item to history
   */
  const addItem = useCallback((item: AnalysisResult) => {
    // Generate a unique ID if not present
    const newItem = {
      ...item,
      id: item.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    setHistoryItems(prev => {
      // Add to the beginning of the array, avoid duplicates
      const updatedHistory = [
        newItem,
        ...prev.filter(existingItem => existingItem.id !== newItem.id),
      ];

      // Limit history to 100 items
      return updatedHistory.slice(0, 100);
    });
  }, []);

  /**
   * Remove an item from history
   */
  const removeItem = useCallback((itemId: string) => {
    setHistoryItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistoryItems([]);
  }, []);

  return {
    historyItems,
    isLoading,
    error,
    addItem,
    removeItem,
    clearHistory,
  };
};
