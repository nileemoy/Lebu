import React, { useState } from 'react';
import { Search, BookOpen, FileText, Video, ArrowRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Education = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const resources = [
    {
      id: 1,
      title: "How to Identify Fake News",
      description: "A comprehensive guide to spotting misinformation online",
      category: "guide",
      type: "article",
      readTime: "8 min",
      date: "Jan 15, 2025"
    },
    {
      id: 2,
      title: "Understanding Deepfakes",
      description: "Learn how AI-generated videos work and how to detect them",
      category: "technology",
      type: "video",
      duration: "12:45",
      date: "Feb 10, 2025"
    },
    {
      id: 3,
      title: "Media Literacy 101",
      description: "Essential skills for evaluating information sources",
      category: "education",
      type: "course",
      lessons: 5,
      date: "Dec 5, 2024"
    },
    {
      id: 4,
      title: "The Psychology of Misinformation",
      description: "Why we believe and share false information",
      category: "psychology",
      type: "article",
      readTime: "15 min",
      date: "Feb 20, 2025"
    },
    {
      id: 5,
      title: "Fact-Checking Tools and Techniques",
      description: "Professional methods for verifying information",
      category: "guide",
      type: "article",
      readTime: "10 min",
      date: "Jan 5, 2025"
    },
    {
      id: 6,
      title: "The Evolution of AI-Generated Content",
      description: "From early deepfakes to today's sophisticated models",
      category: "technology",
      type: "video",
      duration: "18:30",
      date: "Dec 12, 2024"
    }
  ];
  
  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'guide', name: 'Practical Guides' },
    { id: 'technology', name: 'Technology Insights' },
    { id: 'education', name: 'Educational Content' },
    { id: 'psychology', name: 'Psychological Aspects' }
  ];
  
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
                         
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const getResourceIcon = (type:string) => {
    switch (type) {
      case 'article':
        return <FileText size={20} className="text-indigo-600" />;
      case 'video':
        return <Video size={20} className="text-indigo-600" />;
      case 'course':
        return <BookOpen size={20} className="text-indigo-600" />;
      default:
        return <FileText size={20} className="text-indigo-600" />;
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Educational Resources</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Get Informed</h2>
        <p className="text-gray-600 mb-4">
          Browse our collection of educational resources to learn more about fake news, deepfakes, and how to protect yourself from misinformation online.
        </p>
        
        <div className="relative mt-6">
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={20} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-4">
            <h3 className="font-semibold mb-3">Categories</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.id}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md transition ${
                      selectedCategory === category.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="md:w-3/4">
          {filteredResources.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Resources Found</h2>
              <p className="text-gray-500">
                We couldn't find any resources matching your search criteria. 
                Try different keywords or browse all categories.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                View All Resources
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(resource => (
                <Card key={resource.id} className="hover:shadow-md transition">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{resource.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {resource.type === 'article' && `${resource.readTime} read`}
                          {resource.type === 'video' && `${resource.duration} video`}
                          {resource.type === 'course' && `${resource.lessons} lessons`}
                          {' · '}
                          {resource.date}
                        </div>
                        <Button variant="link" size="sm" className="flex items-center">
                          View <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-indigo-700 text-white p-6 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-2">Want to learn more?</h2>
            <p className="text-indigo-100">
              Check out our comprehensive online course on digital literacy and misinformation.
            </p>
          </div>
          <Button className="bg-white text-indigo-700 hover:bg-gray-100">
            Explore Courses
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Education;
