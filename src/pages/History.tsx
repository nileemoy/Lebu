import React, { useState } from 'react';
import { Trash2, Filter, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useHistory } from '../hooks/useHistory';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AnalysisResult, ContentType } from '../types';
import { formatDate } from '../utils/formatters';

type FilterType = 'all' | 'genuine' | 'questionable' | 'fake' | ContentType;
type SortField = 'date' | 'score';
type SortOrder = 'asc' | 'desc';

const History: React.FC = () => {
  const { historyItems, isLoading, removeItem, clearHistory } = useHistory();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Filter and sort history items
  const filteredItems = historyItems.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'fake' && item.truthScore < 40) return true;
    if (selectedFilter === 'questionable' && item.truthScore >= 40 && item.truthScore < 70) return true;
    if (selectedFilter === 'genuine' && item.truthScore >= 70) return true;
    if (selectedFilter === item.type) return true;
    return false;
  });
  
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }
    
    if (sortBy === 'score') {
      return sortOrder === 'asc' ? a.truthScore - b.truthScore : b.truthScore - a.truthScore;
    }
    
    return 0;
  });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner size="lg" text="Loading history..." />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analysis History</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            className="flex items-center"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 size={16} className="mr-2" />
            Clear History
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by:</label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-md text-sm ${selectedFilter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${selectedFilter === 'genuine' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleFilterChange('genuine')}
              >
                <CheckCircle size={14} className="inline mr-1" />
                Genuine
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${selectedFilter === 'questionable' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleFilterChange('questionable')}
              >
                <AlertCircle size={14} className="inline mr-1" />
                Questionable
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${selectedFilter === 'fake' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleFilterChange('fake')}
              >
                <AlertTriangle size={14} className="inline mr-1" />
                Fake
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content type:</label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-md text-sm ${selectedFilter === 'url' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleFilterChange('url')}
              >
                URLs
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${selectedFilter === 'text' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleFilterChange('text')}
              >
                Text
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${selectedFilter === 'image' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleFilterChange('image')}
              >
                Images
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${selectedFilter === 'video' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleFilterChange('video')}
              >
                Videos
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-md text-sm ${sortBy === 'date' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => { setSortBy('date'); toggleSortOrder(); }}
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${sortBy === 'score' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => { setSortBy('score'); toggleSortOrder(); }}
              >
                Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {sortedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Filter size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Analysis History</h2>
          <p className="text-gray-500">
            {historyItems.length === 0 
              ? "You haven't analyzed any content yet. Start by analyzing a URL, text, image, or video."
              : "No items match your current filter. Try changing the filter options."}
          </p>
          {historyItems.length === 0 && (
            <Button className="mt-4" onClick={() => window.location.href = '/analyze'}>
              Analyze Content
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map((item) => {
            const getStatusColor = (score: number) => {
              if (score >= 70) return 'bg-green-100 text-green-800';
              if (score >= 40) return 'bg-yellow-100 text-yellow-800';
              return 'bg-red-100 text-red-800';
            };
            
            const getStatusIcon = (score: number) => {
              if (score >= 70) return <CheckCircle size={14} className="mr-1" />;
              if (score >= 40) return <AlertCircle size={14} className="mr-1" />;
              return <AlertTriangle size={14} className="mr-1" />;
            };
            
            const getContentPreview = (item: AnalysisResult) => {
              switch (item.type) {
                case 'url':
                  return (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block">
                      {item.url}
                    </a>
                  );
                case 'text':
                  return <p className="text-gray-600 line-clamp-2">{item.text}</p>;
                case 'image':
                  return <p className="text-gray-600">Image: {item.filename}</p>;
                case 'video':
                  return <p className="text-gray-600">Video: {item.filename}</p>;
                default:
                  return null;
              }
            };
            
            return (
              <Card key={item.id} className="relative">
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs flex items-center ${getStatusColor(item.truthScore)}`}>
                  {getStatusIcon(item.truthScore)}
                  {item.truthScore}/100
                </div>
                
                <div className="mb-4">
                  <div className="mb-2 capitalize text-sm text-gray-500 font-medium">
                    {item.type} Analysis
                  </div>
                  {getContentPreview(item)}
                </div>
                
                <div className="text-xs text-gray-500 mb-2">
                  Analyzed on {formatDate(item.timestamp, 'datetime')}
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button variant="link" size="sm">
                    View Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => item.id && removeItem(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Clear History"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={() => {
                clearHistory();
                setIsDeleteModalOpen(false);
              }}
            >
              Clear All History
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to clear your entire analysis history? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default History;