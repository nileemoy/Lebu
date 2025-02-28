import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Info, BarChart2, ExternalLink } from 'lucide-react';
import TruthScore from '../common/TruthScore';
import Button from '../common/Button';
import { 
  AnalysisResultProps, 
  UrlAnalysisResult, 
  TextAnalysisResult, 
  ImageAnalysisResult, 
  VideoAnalysisResult,
  Factor 
} from '../../types';
import { truncateString } from '../../utils/formatters';

// Type guard functions to determine the specific result type
const isUrlResult = (result: any): result is UrlAnalysisResult => result.type === 'url';
const isTextResult = (result: any): result is TextAnalysisResult => result.type === 'text';
const isImageResult = (result: any): result is ImageAnalysisResult => result.type === 'image';
const isVideoResult = (result: any): result is VideoAnalysisResult => result.type === 'video';

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onReset }) => {
  if (!result) return null;
  
  // Determine result status
  const getResultStatus = (score: number) => {
    if (score >= 70) return { label: "Likely Genuine", color: "text-green-600", icon: <CheckCircle size={24} className="text-green-600" /> };
    if (score >= 40) return { label: "Potentially Misleading", color: "text-yellow-600", icon: <AlertCircle size={24} className="text-yellow-600" /> };
    return { label: "Likely Fake", color: "text-red-600", icon: <AlertTriangle size={24} className="text-red-600" /> };
  };
  
  const status = getResultStatus(result.truthScore);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <button
          onClick={onReset}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Analyze Another
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="w-full md:w-1/3">
          <TruthScore score={result.truthScore} />
          
          <div className="mt-6 flex items-center">
            {status.icon}
            <span className={`ml-2 text-lg font-semibold ${status.color}`}>
              {status.label}
            </span>
          </div>
          
          {isUrlResult(result) && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900">{result.title || 'Web Content'}</h3>
              <p className="text-gray-500 text-sm mt-1">
                {result.source ? `${result.source} • ` : ''}
                {result.publishDate ? `Published ${result.publishDate}` : ''}
              </p>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-800"
              >
                View Original <ExternalLink size={16} className="ml-1" />
              </a>
            </div>
          )}
          
          {(isImageResult(result) || isVideoResult(result)) && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900">File Analysis</h3>
              <p className="text-gray-500 text-sm mt-1">{result.filename}</p>
              {isImageResult(result) && result.originalFound && result.originalSource && (
                <a 
                  href={result.originalSource} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  View Original Source <ExternalLink size={16} className="ml-1" />
                </a>
              )}
            </div>
          )}
        </div>
        
        <div className="w-full md:w-2/3">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Analysis Summary</h3>
            <p className="text-gray-600">{result.summary || 'No summary available.'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {result.factors.map((factor, index) => {
              const getFactorColor = (score: number) => {
                if (score >= 70) return 'bg-green-500';
                if (score >= 40) return 'bg-yellow-500';
                return 'bg-red-500';
              };
              
              return (
                <div key={index} className="bg-white border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {factor.icon || <Info size={16} className="mr-1" />}
                      <span className="ml-2 font-medium">{factor.name}</span>
                    </div>
                    <span 
                      className={`font-semibold ${
                        factor.score >= 70 ? 'text-green-600' : 
                        factor.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}
                    >
                      {factor.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getFactorColor(factor.score)}`}
                      style={{ width: `${factor.score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {isTextResult(result) && (
            <div className="grid grid-cols-2 gap-4">
              {result.politicalBias && (
                <div className="bg-white border rounded-md p-3">
                  <span className="text-gray-600">Political Bias</span>
                  <p className="font-medium mt-1">{result.politicalBias}</p>
                </div>
              )}
              {result.sentiment && (
                <div className="bg-white border rounded-md p-3">
                  <span className="text-gray-600">Sentiment</span>
                  <p className="font-medium mt-1">{result.sentiment}</p>
                </div>
              )}
              {result.factualErrors !== undefined && (
                <div className="bg-white border rounded-md p-3">
                  <span className="text-gray-600">Factual Errors</span>
                  <p className="font-medium mt-1">{result.factualErrors}</p>
                </div>
              )}
              {result.misleadingClaims !== undefined && (
                <div className="bg-white border rounded-md p-3">
                  <span className="text-gray-600">Misleading Claims</span>
                  <p className="font-medium mt-1">{result.misleadingClaims}</p>
                </div>
              )}
            </div>
          )}
          
          {isImageResult(result) && result.manipulationDetected && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-700 font-medium mb-2">Manipulation Detected</h3>
              {result.deepfakeConfidence !== undefined && (
                <p className="text-red-600 mb-2">
                  Deepfake Confidence: <span className="font-semibold">{result.deepfakeConfidence}%</span>
                </p>
              )}
              {result.manipulatedRegions && result.manipulatedRegions.length > 0 && (
                <div className="mb-2">
                  <span className="text-gray-700">Manipulated Regions:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.manipulatedRegions.map((region, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-md">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isVideoResult(result) && result.manipulationDetected && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-700 font-medium mb-2">Manipulation Detected</h3>
              {result.deepfakeConfidence !== undefined && (
                <p className="text-red-600 mb-2">
                  Deepfake Confidence: <span className="font-semibold">{result.deepfakeConfidence}%</span>
                </p>
              )}
              {result.manipulatedElements && result.manipulatedElements.length > 0 && (
                <div className="mb-2">
                  <span className="text-gray-700">Manipulated Elements:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.manipulatedElements.map((element, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-md">
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.inconsistencies && result.inconsistencies.length > 0 && (
                <div>
                  <span className="text-gray-700">Inconsistencies:</span>
                  <ul className="list-disc list-inside text-red-700 mt-1">
                    {result.inconsistencies.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button variant="secondary" className="mr-3">
          Save Result
        </Button>
        <Button variant="secondary" className="mr-3">
          Share
        </Button>
        <Button variant="secondary">
          Report Issue
        </Button>
      </div>
    </div>
  );
};

export default AnalysisResult;