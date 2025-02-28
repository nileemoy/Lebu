// src/components/analyzer/ContentInput.tsx
import React, { useState, ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, Globe, FileText, Image, Video } from 'lucide-react';
import Button from '../common/Button';
import { ACCEPTED_FILE_TYPES, FILE_SIZE_LIMITS } from '../../utils/constants';
import { isValidFileSize, isValidFileType, isValidUrl } from '../../utils/validators';

// Define the content types
export type ContentType = 'url' | 'text' | 'image' | 'video';

// Define the data that gets passed to the parent component
export interface ContentData {
  type: ContentType;
  content: string | File;
  filename?: string;
  fileSize?: number;
  fileType?: string;
}

// Define the component props
export interface ContentInputProps {
  onAnalyze: (data: ContentData) => void;
  initialTab?: ContentType;
  className?: string;
}

// Interface for tab items
interface TabItem {
  id: ContentType;
  label: string;
  icon: ReactNode;
  inputType: 'text' | 'file';
  placeholder?: string;
  textareaPlaceholder?: string;
  acceptFileTypes?: string;
  fileTypeDescription?: string;
}

const ContentInput: React.FC<ContentInputProps> = ({ 
  onAnalyze, 
  initialTab = 'url',
  className = ''
}) => {
  // State for tracking the active tab, input values, and loading/error states
  const [activeTab, setActiveTab] = useState<ContentType>(initialTab);
  const [input, setInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Define tab configuration
  const tabs: TabItem[] = [
    { 
      id: 'url', 
      label: 'URL', 
      icon: <Globe size={18} className="mr-2" />,
      inputType: 'text',
      placeholder: 'https://example.com/article'
    },
    { 
      id: 'text', 
      label: 'Text', 
      icon: <FileText size={18} className="mr-2" />,
      inputType: 'text',
      placeholder: 'Type or paste shorter text here...',
      textareaPlaceholder: 'Or paste longer text content here...'
    },
    { 
      id: 'image', 
      label: 'Image', 
      icon: <Image size={18} className="mr-2" />,
      inputType: 'file',
      acceptFileTypes: 'image/*',
      fileTypeDescription: 'JPG, PNG, GIF up to 10MB'
    },
    { 
      id: 'video', 
      label: 'Video', 
      icon: <Video size={18} className="mr-2" />,
      inputType: 'file',
      acceptFileTypes: 'video/*',
      fileTypeDescription: 'MP4, MOV up to 50MB'
    }
  ];

  // Handle tab changes
  const handleTabChange = (tab: ContentType): void => {
    setActiveTab(tab);
    setInput('');
    setFile(null);
    setError('');
  };

  // Handle text input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setInput(e.target.value);
    setError('');
  };

  // Handle file input changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = activeTab === 'image' 
        ? ACCEPTED_FILE_TYPES.IMAGE 
        : ACCEPTED_FILE_TYPES.VIDEO;
      
      if (!isValidFileType(selectedFile, validTypes)) {
        setError(`Invalid file type. Please select a valid ${activeTab} file.`);
        return;
      }
      
      // Validate file size
      const maxSize = activeTab === 'image' 
        ? FILE_SIZE_LIMITS.IMAGE 
        : FILE_SIZE_LIMITS.VIDEO;
      
      if (!isValidFileSize(selectedFile, maxSize)) {
        const maxSizeMB = maxSize / (1024 * 1024);
        setError(`File size exceeds the limit of ${maxSizeMB} MB.`);
        return;
      }
      
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
    }
  };

  // Validate input before submission
  const validateInput = (): boolean => {
    if (activeTab === 'url') {
      if (!input.trim()) {
        setError('Please enter a URL');
        return false;
      }
      
      if (!isValidUrl(input)) {
        setError('Please enter a valid URL');
        return false;
      }
    }
    
    if (activeTab === 'text' && !input.trim()) {
      setError('Please enter some text to analyze');
      return false;
    }
    
    if ((activeTab === 'image' || activeTab === 'video') && !file) {
      setError(`Please select a ${activeTab} file to analyze`);
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateInput()) return;
    
    setIsLoading(true);
    
    try {
      // Prepare the analysis data
      const analysisData: ContentData = {
        type: activeTab,
        content: activeTab === 'url' || activeTab === 'text' ? input : file!,
      };
      
      // Add file metadata if applicable
      if (file && (activeTab === 'image' || activeTab === 'video')) {
        analysisData.filename = file.name;
        analysisData.fileSize = file.size;
        analysisData.fileType = file.type;
      }
      
      // Call the onAnalyze callback
      onAnalyze(analysisData);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred during analysis. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the current tab configuration
  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-6">Analyze Content</h2>
      
      {/* Tab navigation */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`px-4 py-2 mr-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            <div className="flex items-center">
              {tab.icon}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit}>
        {/* Text-based inputs (URL or Text) */}
        {(activeTab === 'url' || activeTab === 'text') && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              {activeTab === 'url' ? 'Enter URL to analyze' : 'Enter text to analyze'}
            </label>
            
            <input
              type={activeTab === 'url' ? 'url' : 'text'}
              placeholder={currentTab.placeholder}
              className={`w-full p-3 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
              value={input}
              onChange={handleInputChange}
              data-testid={`${activeTab}-input`}
            />
            
            {activeTab === 'text' && (
              <textarea
                placeholder={currentTab.textareaPlaceholder}
                className={`w-full p-3 border rounded-md mt-3 min-h-[150px] ${error ? 'border-red-500' : 'border-gray-300'}`}
                value={input}
                onChange={handleInputChange}
                data-testid="text-textarea"
              ></textarea>
            )}
          </div>
        )}
        
        {/* File-based inputs (Image or Video) */}
        {(activeTab === 'image' || activeTab === 'video') && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              {`Upload ${activeTab} to analyze`}
            </label>
            
            <div 
              className={`border-2 border-dashed rounded-md p-6 text-center ${
                error ? 'border-red-500' : 'border-gray-300 hover:border-indigo-500'
              }`}
              data-testid={`${activeTab}-dropzone`}
            >
              <input
                type="file"
                accept={currentTab.acceptFileTypes}
                className="hidden"
                id="fileInput"
                onChange={handleFileChange}
                data-testid={`${activeTab}-file-input`}
              />
              
              <label htmlFor="fileInput" className="cursor-pointer block w-full h-full">
                {file ? (
                  <div>
                    <p className="mb-2 text-indigo-600 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2 text-gray-500">
                      {`Click to select a ${activeTab}`}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentTab.fileTypeDescription}
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <p className="text-red-500 mb-4" data-testid="error-message">
            {error}
          </p>
        )}
        
        {/* Submit button */}
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          data-testid="analyze-button"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Content'}
        </Button>
      </form>
    </div>
  );
};

export default ContentInput;