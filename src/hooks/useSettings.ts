import { AppSettings } from "../types";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "../utils/constants";
import { useCallback } from "react";

export function useSettings() {
    const [settings, setSettings] = useLocalStorage<AppSettings>(STORAGE_KEYS.SETTINGS, {
      enableNotifications: true,
      autoAnalyzeLinks: true,
      saveHistory: true,
      theme: 'system',
      language: 'en',
    });
    
    const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...newSettings,
      }));
    }, [setSettings]);
    
    return {
      settings,
      updateSettings,
    };
  }
  
  interface Notification {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    id: string;
  }