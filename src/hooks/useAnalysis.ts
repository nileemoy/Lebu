// src/hooks/useAnalysis.ts

import { useState, useCallback } from 'react';
import { 
  AnalysisResult, 
  ContentType,
} from '../types';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

export const useAnalysis = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (type: ContentType, content: string | File) => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      switch (type) {
        case 'url':
          // Call the URL analysis endpoint with the URL string
          response = await axios.post(API_ENDPOINTS.ANALYZE_URL, { url: content });
          break;

        case 'text':
          // Call the text analysis endpoint with the text string
          response = await axios.post(API_ENDPOINTS.ANALYZE_TEXT, { text: content });
          break;

        case 'image':
          // For image, we need to create a FormData to send the file
          if (!(content instanceof File)) {
            throw new Error('Image content must be a File');
          }
          
          const imageFormData = new FormData();
          imageFormData.append('image', content);
          
          response = await axios.post(API_ENDPOINTS.ANALYZE_IMAGE, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          break;

        case 'video':
          // For video, we need to create a FormData to send the file
          if (!(content instanceof File)) {
            throw new Error('Video content must be a File');
          }
          
          const videoFormData = new FormData();
          videoFormData.append('video', content);
          
          response = await axios.post(API_ENDPOINTS.ANALYZE_VIDEO, videoFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          break;

        default:
          throw new Error(`Unsupported content type: ${type}`);
      }

      // The backend already returns properly formatted results
      const analysisResult = response.data;
      
      setResult(analysisResult);
      return analysisResult;
    } catch (err:any) {
      console.error("Error analyzing content:", err);
      const errorMessage = err.response?.data?.error || err.message || "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    analyze,
    clearResult,
  };
};