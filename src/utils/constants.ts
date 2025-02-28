export const API_ENDPOINTS = {
    ANALYZE_URL: 'http://localhost:8080/api/analyze/url',
    ANALYZE_TEXT: 'http://localhost:8080/api/analyze/text',
    ANALYZE_IMAGE: 'http://localhost:8080/api/analyze/image',
    ANALYZE_VIDEO: 'http://localhost:8080/api/analyze/video',

    
    // Third-party API endpoints
    PERPLEXITY: 'https://api.perplexity.ai/chat/completions',
    OPENAI: 'https://api.openai.com/v1/chat/completions',
    GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  };
  
  // API keys (in production these would come from environment variables)
  export const API_KEYS = {
    PERPLEXITY: '',
    OPENAI: '',
    GEMINI: '',
  };
  
  // Local storage keys
  export const STORAGE_KEYS = {
    USER: 'truth_guardian_user',
    HISTORY: 'truth_guardian_history',
    SETTINGS: 'truth_guardian_settings',
    API_KEYS: 'truth_guardian_api_keys',
  };
  
  // Truth Score thresholds
  export const TRUTH_SCORE = {
    HIGH: 70, // 70-100: Likely genuine
    MEDIUM: 40, // 40-69: Potentially misleading
    LOW: 0, // 0-39: Likely fake
  };
  
  // Analysis types
  export const ANALYSIS_TYPES = {
    URL: 'url',
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
  };
  
  // App routes
  export const ROUTES = {
    HOME: '/',
    ANALYZE: '/analyze',
    HISTORY: '/history',
    EDUCATION: '/education',
    SETTINGS: '/settings',
    POPUP: '/popup',
  };
  
  // App themes
  export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  };
  
  // Supported languages
  export const LANGUAGES = {
    ENGLISH: 'en',
    SPANISH: 'es',
    FRENCH: 'fr',
    GERMAN: 'de',
    CHINESE: 'zh',
  };
  
  // File size limits (in bytes)
  export const FILE_SIZE_LIMITS = {
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
  };
  
  // Accepted file types
  export const ACCEPTED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    VIDEO: ['video/mp4', 'video/quicktime', 'video/webm'],
  };