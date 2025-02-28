import { 
    AnalysisResult,
    UrlAnalysisResult,
    TextAnalysisResult,
    ImageAnalysisResult,
    VideoAnalysisResult,
    Factor
  } from '../types';
  import { API_ENDPOINTS } from '../utils/constants';
  import axios from 'axios';
  
  // Helper function to generate a mock analysis result
  const generateMockFactors = (): Factor[] => {
    return [
      { name: 'Source Credibility', score: Math.floor(Math.random() * 100) },
      { name: 'Factual Accuracy', score: Math.floor(Math.random() * 100) },
      { name: 'Bias Assessment', score: Math.floor(Math.random() * 100) },
      { name: 'Manipulation Detection', score: Math.floor(Math.random() * 100) },
    ];
  };
  
  export const analysisService = {
    /**
     * Analyze URL content
     * @param url - The URL to analyze
     * @returns Promise with analysis results
     */
    analyzeUrl: async (url: string): Promise<UrlAnalysisResult> => {
      try {
        // This would be replaced with an actual API call in production
        // const response = await axios.post(API_ENDPOINTS.ANALYZE_URL, { url });
        // return response.data;
        
        // For now, return mock data
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        
        return {
          id: `url-${Date.now()}`,
          type: 'url',
          url,
          truthScore: Math.floor(Math.random() * 100),
          credibility: Math.random() > 0.5 ? 'High' : 'Low',
          sourceReputation: ['Reliable', 'Mostly Reliable', 'Questionable', 'Unreliable'][Math.floor(Math.random() * 4)],
          publishDate: new Date().toISOString().substring(0, 10),
          factors: generateMockFactors(),
          timestamp: new Date().toISOString(),
          summary: 'This is a mock analysis of the URL content. In a real implementation, this would contain detailed information about the credibility and accuracy of the content.',
        };
      } catch (error) {
        console.error('Error analyzing URL:', error);
        throw error;
      }
    },
  
    /**
     * Analyze text content
     * @param text - The text to analyze
     * @returns Promise with analysis results
     */
    analyzeText: async (text: string): Promise<TextAnalysisResult> => {
      try {
        // This would be replaced with an actual API call in production
        // const response = await axios.post(API_ENDPOINTS.ANALYZE_TEXT, { text });
        // return response.data;
        
        // For now, return mock data
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        
        return {
          id: `text-${Date.now()}`,
          type: 'text',
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          truthScore: Math.floor(Math.random() * 100),
          factualErrors: Math.floor(Math.random() * 10),
          misleadingClaims: Math.floor(Math.random() * 10),
          sentiment: ['Neutral', 'Positive', 'Negative'][Math.floor(Math.random() * 3)],
          politicalBias: ['None', 'Slight', 'Moderate', 'Strong'][Math.floor(Math.random() * 4)],
          factors: generateMockFactors(),
          timestamp: new Date().toISOString(),
          summary: 'This is a mock analysis of the text content. In a real implementation, this would contain detailed information about the accuracy and potential bias in the text.',
        };
      } catch (error) {
        console.error('Error analyzing text:', error);
        throw error;
      }
    },
  
    /**
     * Analyze image content
     * @param imageFile - The image file to analyze
     * @returns Promise with analysis results
     */
    analyzeImage: async (imageFile: File): Promise<ImageAnalysisResult> => {
      try {
        // This would be replaced with an actual API call in production
        // const formData = new FormData();
        // formData.append('image', imageFile);
        // const response = await axios.post(API_ENDPOINTS.ANALYZE_IMAGE, formData);
        // return response.data;
        
        // For now, return mock data
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
        
        const isManipulated = Math.random() > 0.5;
        const manipulatedRegions = isManipulated 
          ? ['face', 'background', 'objects'].slice(0, Math.floor(Math.random() * 3) + 1) 
          : [];
        
        return {
          id: `image-${Date.now()}`,
          type: 'image',
          filename: imageFile.name,
          truthScore: isManipulated ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 30) + 70,
          manipulationDetected: isManipulated,
          deepfakeConfidence: isManipulated ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 20),
          manipulatedRegions: manipulatedRegions,
          originalFound: isManipulated && Math.random() > 0.7,
          originalSource: isManipulated && Math.random() > 0.7 ? 'https://example.com/original-image' : undefined,
          factors: generateMockFactors(),
          timestamp: new Date().toISOString(),
          summary: isManipulated 
            ? 'This image shows signs of manipulation. Our analysis has detected potential alterations that may affect its authenticity.' 
            : 'This image appears to be authentic. Our analysis did not detect significant signs of manipulation.',
        };
      } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
      }
    },
  
    /**
     * Analyze video content
     * @param videoFile - The video file to analyze
     * @returns Promise with analysis results
     */
    analyzeVideo: async (videoFile: File): Promise<VideoAnalysisResult> => {
      try {
        // This would be replaced with an actual API call in production
        // const formData = new FormData();
        // formData.append('video', videoFile);
        // const response = await axios.post(API_ENDPOINTS.ANALYZE_VIDEO, formData);
        // return response.data;
        
        // For now, return mock data
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API delay
        
        const isManipulated = Math.random() > 0.5;
        const manipulatedElements = isManipulated 
          ? ['voice', 'lip sync', 'facial expressions', 'background'].slice(0, Math.floor(Math.random() * 3) + 1) 
          : [];
        
        const inconsistencies = isManipulated 
          ? [
              'audio-visual sync issues',
              'unnatural movements',
              'facial inconsistencies',
              'lighting irregularities'
            ].slice(0, Math.floor(Math.random() * 3) + 1) 
          : [];
        
        return {
          id: `video-${Date.now()}`,
          type: 'video',
          filename: videoFile.name,
          truthScore: isManipulated ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 30) + 70,
          manipulationDetected: isManipulated,
          deepfakeConfidence: isManipulated ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 20),
          manipulatedElements: manipulatedElements,
          inconsistencies: inconsistencies,
          factors: generateMockFactors(),
          timestamp: new Date().toISOString(),
          summary: isManipulated 
            ? 'This video shows signs of manipulation. Our analysis has detected potential alterations that may indicate it is a deepfake or has been edited in a misleading way.' 
            : 'This video appears to be authentic. Our analysis did not detect significant signs of manipulation or deepfake technology.',
        };
      } catch (error) {
        console.error('Error analyzing video:', error);
        throw error;
      }
    },
  };
  