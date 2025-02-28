import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  HistoryContextType, 
  AnalysisResult 
} from '../types';
import { STORAGE_KEYS } from '../utils/constants';

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

interface HistoryProviderProps {
  children: ReactNode;
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({ children }) => {
  const [historyItems, setHistoryItems] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (storedHistory) {
          setHistoryItems(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        setError('Failed to load your analysis history.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (historyItems.length > 0) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyItems));
    }
  }, [historyItems]);

  const addItem = (analysisResult: AnalysisResult): void => {
    setHistoryItems(prevItems => {
      // Add new result to beginning of history
      const newItems = [
        {
          ...analysisResult,
          id: analysisResult.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        },
        ...prevItems,
      ];
      
      // Limit history to 100 items
      const limitedItems = newItems.slice(0, 100);
      
      // Save updated history
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedItems));
      
      return limitedItems;
    });
  };

  const removeItem = (itemId: string): void => {
    setHistoryItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearHistory = (): void => {
    setHistoryItems([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  const value: HistoryContextType = {
    historyItems,
    isLoading,
    error,
    addItem,
    removeItem,
    clearHistory,
  };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};