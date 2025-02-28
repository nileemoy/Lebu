import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  AnalysisContextType, 
  AnalysisResult,
  ContentType
} from '../types';
import { analysisService } from '../services/analysisService';

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysis = (): AnalysisContextType => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (type: ContentType, content: string | File): Promise<AnalysisResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response: AnalysisResult;

      switch (type) {
        case 'url':
          if (typeof content !== 'string') {
            throw new Error('URL content must be a string');
          }
          response = await analysisService.analyzeUrl(content);
          break;
          
        case 'text':
          if (typeof content !== 'string') {
            throw new Error('Text content must be a string');
          }
          response = await analysisService.analyzeText(content);
          break;
          
        case 'image':
          if (!(content instanceof File)) {
            throw new Error('Image content must be a File');
          }
          response = await analysisService.analyzeImage(content);
          break;
          
        case 'video':
          if (!(content instanceof File)) {
            throw new Error('Video content must be a File');
          }
          response = await analysisService.analyzeVideo(content);
          break;
          
        default:
          throw new Error(`Unsupported analysis type: ${type}`);
      }

      setResult(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during analysis';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = (): void => {
    setResult(null);
    setError(null);
  };

  const value: AnalysisContextType = {
    result,
    isLoading,
    error,
    analyze,
    clearResult,
  };

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
};
