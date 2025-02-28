import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Image, Video, Globe, AlertTriangle } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Home: React.FC = () => {
  return (
    <div>
      <section className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white py-16 rounded-lg mb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Detect Fake News and Deepfakes
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Truth Guardian helps you verify the authenticity of online content using AI-powered analysis
          </p>
          <Link to="/analyze">
            <Button  size="lg" className="bg-black text-indigo-700 hover:bg-gray-100">
              Start Analyzing Content
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">What would you like to analyze?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-4">
                <Globe size={32} className="text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Website or Article</h3>
              <p className="text-gray-600 mb-4">
                Check news articles and websites for misinformation
              </p>
              <Link to="/analyze" className="mt-auto">
                <Button>Analyze URL</Button>
              </Link>
            </div>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-4">
                <FileText size={32} className="text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Text Content</h3>
              <p className="text-gray-600 mb-4">
                Verify text content for factual accuracy and bias
              </p>
              <Link to="/analyze" className="mt-auto">
                <Button>Analyze Text</Button>
              </Link>
            </div>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-4">
                <Image size={32} className="text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Images</h3>
              <p className="text-gray-600 mb-4">
                Detect manipulated and AI-generated images
              </p>
              <Link to="/analyze" className="mt-auto">
                <Button>Analyze Image</Button>
              </Link>
            </div>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-4">
                <Video size={32} className="text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Videos</h3>
              <p className="text-gray-600 mb-4">
                Identify deepfakes and manipulated video content
              </p>
              <Link to="/analyze" className="mt-auto">
                <Button>Analyze Video</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 rounded-full p-2 mr-3">
                <Shield size={24} className="text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold">Input Content</h3>
            </div>
            <p className="text-gray-600">
              Submit a URL, text, image, or video for analysis. Our system works with most common formats and sources.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 rounded-full p-2 mr-3">
                <AlertTriangle size={24} className="text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold">AI Analysis</h3>
            </div>
            <p className="text-gray-600">
              Our advanced AI analyzes the content using multiple specialized models to detect signs of manipulation or misinformation.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 rounded-full p-2 mr-3">
                <FileText size={24} className="text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold">Detailed Report</h3>
            </div>
            <p className="text-gray-600">
              Receive a comprehensive report with a Truth Score and detailed breakdown of potential issues or manipulations.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="bg-gray-100 rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-bold mb-4">Why Truth Guardian?</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Advanced deep learning models specialized for different content types</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Comprehensive analysis examining multiple factors for accuracy</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Available as a browser extension, website, and mobile app for anywhere access</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Educational resources to help you understand and identify misinformation</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/3">
              <img
                src="/api/placeholder/400/250"
                alt="Truth Guardian Dashboard"
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Latest From Our Blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "How to Spot Deepfake Videos",
              excerpt: "Learn the telltale signs of AI-generated videos and how to verify authenticity.",
              date: "February 20, 2025"
            },
            {
              title: "The Rise of Misinformation During Elections",
              excerpt: "Examining how fake news spreads during election cycles and its impact on voters.",
              date: "February 15, 2025"
            },
            {
              title: "AI Tools Fighting Disinformation",
              excerpt: "New artificial intelligence systems helping to combat the spread of false information.",
              date: "February 10, 2025"
            }
          ].map((post, index) => (
            <Card key={index}>
              <img
                src="/api/placeholder/400/200"
                alt={post.title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-3">{post.excerpt}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm text-gray-500">{post.date}</span>
                <Button variant="link">Read More</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;