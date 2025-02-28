
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { THEMES } from '../utils/constants';
import { Theme } from '@/types';


export function useTheme() {
    // Get theme from localStorage or use system default
    const [theme, setTheme] = useLocalStorage<Theme>('theme', "system");
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  
    // Detect system theme on mount and when it changes
    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setSystemTheme(e.matches ? 'dark' : 'light');
      };
      
      // Set initial value
      handleChange(mediaQuery);
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }, []);
  
    // Apply theme to document
    useEffect(() => {
      const root = document.documentElement;
      const activeTheme = theme === THEMES.SYSTEM ? systemTheme : theme;
      
      if (activeTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }, [theme, systemTheme]);
  
    /**
     * Get active theme
     * @returns Active theme
     */
    const getActiveTheme = useCallback((): Theme => {
      return theme === THEMES.SYSTEM ? systemTheme : theme;
    }, [theme, systemTheme]);
  
    return {
      theme,
      setTheme,
      systemTheme,
      getActiveTheme,
      isDark: getActiveTheme() === 'dark',
    };
  }