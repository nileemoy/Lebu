// src/services/apiService.ts
/**
 * Service for handling API calls to external AI services
 */
import { ApiType } from '../types';
import { API_ENDPOINTS, API_KEYS } from '../utils/constants';

interface ApiHeaders {
  'Content-Type': string;
  Authorization?: string;
  'x-api-key'?: string;
  [key: string]: string | undefined;
}

interface PerplexityRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

interface GeminiPart {
  text?: string;
  inline_data?: {
    data: string;
    mime_type: string;
  };
}

interface GeminiRequest {
  contents: Array<{
    parts: GeminiPart[];
  }>;
  generationConfig: {
    temperature: number;
  };
}

export const apiService = {
  /**
   * Get authorization headers based on API type
   * @param apiType - Type of API (perplexity, openai, gemini)
   * @returns Headers object
   */
  getHeaders: (apiType: ApiType): HeadersInit => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    switch (apiType) {
      case 'perplexity':
        headers['Authorization'] = `Bearer ${API_KEYS.PERPLEXITY}`;
        break;
      case 'openai':
        headers['Authorization'] = `Bearer ${API_KEYS.OPENAI}`;
        break;
      case 'gemini':
        headers['x-api-key'] = API_KEYS.GEMINI;
        break;
    }

    return headers;
  },

  /**
   * Make a GET request
   * @param url - API endpoint
   * @param apiType - Type of API (perplexity, openai, gemini)
   * @returns Response data
   */
  get: async <T>(url: string, apiType: ApiType = 'perplexity'): Promise<T> => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: apiService.getHeaders(apiType),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  /**
   * Make a POST request
   * @param url - API endpoint
   * @param data - Request payload
   * @param apiType - Type of API (perplexity, openai, gemini)
   * @returns Response data
   */
  post: async <T, D>(url: string, data: D, apiType: ApiType = 'perplexity'): Promise<T> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: apiService.getHeaders(apiType),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  /**
   * Send a request to Perplexity API for text analysis
   * @param text - Text to analyze
   * @returns Analysis results
   */
  analyzeWithPerplexity: async (text: string): Promise<any> => {
    try {
      const requestData: PerplexityRequest = {
        model: 'pplx-7b-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant specialized in fact-checking and detecting misinformation.',
          },
          {
            role: 'user',
            content: `Analyze the following text for factual accuracy, logical consistency, and potential misinformation: "${text}"`,
          },
        ],
      };

      return await apiService.post(
        API_ENDPOINTS.PERPLEXITY,
        requestData,
        'perplexity'
      );
    } catch (error) {
      console.error('Perplexity API error:', error);
      throw error;
    }
  },

  /**
   * Send a request to OpenAI API for content analysis
   * @param content - Content to analyze
   * @param type - Type of content (text, url, image description)
   * @returns Analysis results
   */
  analyzeWithOpenAI: async (content: string, type: 'text' | 'url' | 'image'): Promise<any> => {
    try {
      const systemPrompt = 'You are an AI assistant specialized in detecting fake news, misinformation, and manipulated content.';
      let userPrompt: string;

      switch (type) {
        case 'text':
          userPrompt = `Analyze the following text for factual accuracy, potential bias, misleading claims, and logical inconsistencies: "${content}"`;
          break;
        case 'url':
          userPrompt = `Analyze the content from this URL for credibility, factual accuracy, and potential misinformation: ${content}`;
          break;
        case 'image':
          userPrompt = `Analyze this image description for signs of manipulation or inconsistencies: "${content}"`;
          break;
        default:
          userPrompt = `Analyze the following content: "${content}"`;
      }

      const requestData: OpenAIRequest = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };

      return await apiService.post(
        API_ENDPOINTS.OPENAI,
        requestData,
        'openai'
      );
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  },

  /**
   * Send a request to Google Gemini API for image/video analysis
   * @param content - Content description or base64 encoded image
   * @param type - Type of content (image, video)
   * @returns Analysis results
   */
  analyzeWithGemini: async (content: string, type: 'image' | 'video'): Promise<any> => {
    try {
      const systemPrompt = 'You are an AI assistant specialized in detecting deepfakes and manipulated media.';
      let userPrompt: string;

      switch (type) {
        case 'image':
          userPrompt = `Analyze this image for signs of manipulation, inconsistencies, or AI generation.`;
          break;
        case 'video':
          userPrompt = `Analyze this video for signs of deepfake manipulation, inconsistencies in movement, audio-visual sync issues, or other indicators of manipulation.`;
          break;
        default:
          userPrompt = `Analyze the following content for authenticity: "${content}"`;
      }

      const parts: GeminiPart[] = [
        { text: systemPrompt },
        { text: userPrompt }
      ];
      
      if (type === 'image') {
        parts.push({ 
          inline_data: { 
            data: content, 
            mime_type: 'image/jpeg' 
          } 
        });
      } else {
        parts.push({ text: content });
      }

      const requestData: GeminiRequest = {
        contents: [
          {
            parts: parts,
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      };

      return await apiService.post(
        API_ENDPOINTS.GEMINI,
        requestData,
        'gemini'
      );
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  },
};