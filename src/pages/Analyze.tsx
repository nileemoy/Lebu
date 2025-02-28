import React, { useState } from 'react';
import ContentInput from '../components/analyzer/ContentInput';
import AnalysisResult from '../components/analyzer/AnalysisResult';
import { useAnalysis } from '../hooks/useAnalysis';
import { useHistory } from '../hooks/useHistory';
import { AnalysisResult as AnalysisResultType, ContentType } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ContentData {
  type: ContentType;
  content: string | File;
  filename?: string;
  fileSize?: number;
  fileType?: string;
}

const Analyze: React.FC = () => {
  const { analyze, isLoading, error } = useAnalysis();
  const { addItem } = useHistory();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const handleAnalyze = async (contentData: ContentData) => {
    try {
      setAnalysisError(null);
      
      const result = await analyze(
        contentData.type, 
        contentData.content
      );
      
      setAnalysisResult(result);
      
      // Add to history
      addItem(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred during analysis. Please try again.';
      setAnalysisError(errorMessage);
    }
  };
  
  const handleReset = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Content Analysis</h1>
      
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Analyzing content..." />
        </div>
      )}
      
      {!isLoading && (
        <>
          {!analysisResult ? (
            <>
              <ContentInput onAnalyze={handleAnalyze} />
              
              {(error || analysisError) && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                  {error || analysisError}
                </div>
              )}
            </>
          ) : (
            <AnalysisResult result={analysisResult} onReset={handleReset} />
          )}
        </>
      )}
    </div>
  );
};

export default Analyze;