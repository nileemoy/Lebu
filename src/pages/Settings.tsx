import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [generalSettings, setGeneralSettings] = useState({
    enableNotifications: true,
    autoAnalyzeLinks: true,
    saveHistory: true,
    theme: 'system',
    language: 'en'
  });
  
  const [apiKeys, setApiKeys] = useState({
    perplexity: '',
    openai: '',
    gemini: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleGeneralSettingsChange = (e:any) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleApiKeyChange = (e:any) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-4">
            <h3 className="font-semibold mb-3">Settings</h3>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    activeTab === 'general'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  General
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    activeTab === 'api'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('api')}
                >
                  API Keys
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    activeTab === 'account'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('account')}
                >
                  Account
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    activeTab === 'about'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('about')}
                >
                  About
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="md:w-3/4">
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Settings saved successfully!
            </div>
          )}
          
          {activeTab === 'general' && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Preferences</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="enableNotifications" className="font-medium">
                          Enable Notifications
                        </label>
                        <p className="text-sm text-gray-500">
                          Receive alerts when analyzing content
                        </p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="enableNotifications"
                          name="enableNotifications"
                          checked={generalSettings.enableNotifications}
                          onChange={handleGeneralSettingsChange}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="enableNotifications"
                          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                            generalSettings.enableNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="autoAnalyzeLinks" className="font-medium">
                          Auto-Analyze Links
                        </label>
                        <p className="text-sm text-gray-500">
                          Automatically analyze links when browsing
                        </p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="autoAnalyzeLinks"
                          name="autoAnalyzeLinks"
                          checked={generalSettings.autoAnalyzeLinks}
                          onChange={handleGeneralSettingsChange}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="autoAnalyzeLinks"
                          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                            generalSettings.autoAnalyzeLinks ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="saveHistory" className="font-medium">
                          Save Analysis History
                        </label>
                        <p className="text-sm text-gray-500">
                          Keep a record of your analyzed content
                        </p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="saveHistory"
                          name="saveHistory"
                          checked={generalSettings.saveHistory}
                          onChange={handleGeneralSettingsChange}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="saveHistory"
                          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                            generalSettings.saveHistory ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Appearance</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                        Theme
                      </label>
                      <select
                        id="theme"
                        name="theme"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={generalSettings.theme}
                        onChange={handleGeneralSettingsChange}
                      >
                        <option value="system">System Default</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select
                        id="language"
                        name="language"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={generalSettings.language}
                        onChange={handleGeneralSettingsChange}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={saveSettings}
                  isLoading={isSaving}
                >
                  <Save size={16} className="mr-2" />
                  Save Settings
                </Button>
              </div>
            </Card>
          )}
          
          {activeTab === 'api' && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">API Settings</h2>
              
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                <AlertCircle size={20} className="text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-700">API Keys Required</h3>
                  <p className="text-sm text-yellow-600">
                    You need to provide API keys to enable full functionality. 
                    Your keys are stored securely and never shared.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="perplexity" className="block font-medium mb-1">
                    Perplexity API Key
                  </label>
                  <input
                    type="password"
                    id="perplexity"
                    name="perplexity"
                    className="w-full p-2 border border-gray-300 rounded-md font-mono"
                    value={apiKeys.perplexity}
                    onChange={handleApiKeyChange}
                    placeholder="Enter your Perplexity API key"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Used for advanced text analysis and fact-checking
                  </p>
                </div>
                
                <div>
                  <label htmlFor="openai" className="block font-medium mb-1">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    id="openai"
                    name="openai"
                    className="w-full p-2 border border-gray-300 rounded-md font-mono"
                    value={apiKeys.openai}
                    onChange={handleApiKeyChange}
                    placeholder="Enter your OpenAI API key"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Powers content analysis and deepfake detection
                  </p>
                </div>
                
                <div>
                  <label htmlFor="gemini" className="block font-medium mb-1">
                    Google Gemini API Key (Optional)
                  </label>
                  <input
                    type="password"
                    id="gemini"
                    name="gemini"
                    className="w-full p-2 border border-gray-300 rounded-md font-mono"
                    value={apiKeys.gemini}
                    onChange={handleApiKeyChange}
                    placeholder="Enter your Google Gemini API key"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Enhances image and video analysis capabilities
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={saveSettings}
                  isLoading={isSaving}
                >
                  <Save size={16} className="mr-2" />
                  Save API Keys
                </Button>
              </div>
            </Card>
          )}
          
          {activeTab === 'account' && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              
              <div className="p-4 bg-gray-50 rounded-md mb-6">
                <div className="flex items-center">
                  <div className="bg-indigo-100 rounded-full p-3 mr-4">
                    <span className="text-indigo-700 text-xl font-bold">
                      {user ? user.name.charAt(0) : 'G'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{user ? user.name : 'Guest User'}</h3>
                    <p className="text-sm text-gray-500">
                      {user ? user.email : 'Not signed in'}
                    </p>
                  </div>
                </div>
              </div>
              
              {user ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Profile Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          defaultValue={user.name}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          defaultValue={user.email}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Subscription</h3>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Current Plan: <span className="text-indigo-600 capitalize">{user.plan}</span></p>
                          <p className="text-sm text-gray-500 mt-1">
                            {user.plan === 'free' ? 'Limited to 10 analyses per day' : 'Unlimited analyses'}
                          </p>
                        </div>
                        
                        {user.plan === 'free' && (
                          <Button>
                            Upgrade Plan
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Password</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button>
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Sign in to access your account settings and preferences.
                  </p>
                  <Button>
                    Sign In
                  </Button>
                </div>
              )}
            </Card>
          )}
          
          {activeTab === 'about' && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">About Truth Guardian</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Version Information</h3>
                  <p className="text-gray-600">Version 1.0.0</p>
                  <p className="text-gray-600">Released: February 25, 2025</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Technology</h3>
                  <p className="text-gray-600 mb-2">
                    Truth Guardian uses advanced AI models to detect fake news, deepfakes, and misinformation:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                    <li>Text analysis powered by Perplexity and OpenAI</li>
                    <li>Image manipulation detection</li>
                    <li>Deepfake video analysis</li>
                    <li>Source credibility assessment</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Privacy</h3>
                  <p className="text-gray-600 mb-2">
                    We take your privacy seriously. Content submitted for analysis is:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                    <li>Never stored permanently without your consent</li>
                    <li>Processed securely and anonymously</li>
                    <li>Not used for training AI models</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Legal</h3>
                  <div className="space-y-2">
                    <Button variant="link" size="sm">Privacy Policy</Button>
                    <Button variant="link" size="sm">Terms of Service</Button>
                    <Button variant="link" size="sm">Contact Us</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
