import React, { useState, useEffect } from 'react';

const MedicalDashboard = () => {
  const [patientInput, setPatientInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // API configuration for FastAPI backend
  const API_CONFIG = {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000', // Can be set via environment variable
    endpoints: {
      analyze: '/analyze',
      health: '/health'
    }
  };

  const handleAnalyzeSymptoms = async () => {
    if (!patientInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: patientInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the data to match our frontend structure
      const transformedData = transformBackendData(data);
      setAnalysisResults(transformedData);
      setLastAnalysisTime(new Date());
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      // For demo purposes, using sample data
      setAnalysisResults(getSampleData());
      setLastAnalysisTime(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleData = () => ({
    entities: {
      symptoms: ['Fever', 'Headache', 'Fatigue', 'Loss of appetite'],
      conditions: ['Viral infection', 'Dehydration'],
      medications: ['Ibuprofen', 'Acetaminophen']
    },
    followUpQuestions: [
      'How long have you been experiencing these symptoms?',
      'Have you had any recent travel or exposure to sick individuals?',
      'Are you experiencing any gastrointestinal symptoms?',
      'What medications are you currently taking?'
    ],
    differentialDiagnoses: [
      {
        condition: 'Viral Upper Respiratory Infection',
        confidence: 'High',
        explanation: 'Common viral illness with typical symptoms including fever, headache, and fatigue.'
      },
      {
        condition: 'Migraine',
        confidence: 'Medium',
        explanation: 'Severe headache with associated symptoms, though fever is atypical.'
      },
      {
        condition: 'COVID-19',
        confidence: 'Low',
        explanation: 'Consider testing if symptoms persist or worsen.'
      }
    ],
    literature: [
      {
        title: 'Management of Acute Viral Upper Respiratory Infections in Adults',
        url: 'https://pubmed.ncbi.nlm.nih.gov/sample1',
        journal: 'JAMA Internal Medicine'
      },
      {
        title: 'Evidence-Based Approach to Fever Management in Adults',
        url: 'https://pubmed.ncbi.nlm.nih.gov/sample2',
        journal: 'American Family Physician'
      }
    ]
  });

  // Transform backend data to match frontend structure
  const transformBackendData = (backendData) => {
    return {
      entities: {
        symptoms: backendData.entities?.symptoms || [],
        conditions: backendData.entities?.conditions || [],
        medications: backendData.entities?.medications || []
      },
      followUpQuestions: backendData.suggested_questions || [],
      differentialDiagnoses: backendData.differential_diagnoses || [],
      literature: backendData.literature?.map(article => ({
        title: article.title || 'No title',
        url: article.url || '#',
        journal: article.journal || 'Unknown journal'
      })) || []
    };
  };

  // Check backend health status
  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`);
      if (response.ok) {
        const healthData = await response.json();
        setBackendStatus(healthData.status === 'healthy' ? 'connected' : 'degraded');
      } else {
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('disconnected');
    }
  };

  // Check backend health on component mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const handleReset = () => {
    setPatientInput('');
    setAnalysisResults(null);
    setLastAnalysisTime(null);
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Navigation Bar */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">3rd-AI Medical Assistant</h1>
            </div>
                          <div className="flex items-center space-x-4">
                {/* Backend Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    backendStatus === 'connected' ? 'bg-green-500' :
                    backendStatus === 'degraded' ? 'bg-yellow-500' :
                    backendStatus === 'disconnected' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm ${
                    backendStatus === 'connected' ? 'text-green-600' :
                    backendStatus === 'degraded' ? 'text-yellow-600' :
                    backendStatus === 'disconnected' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {backendStatus === 'connected' ? 'Backend Connected' :
                     backendStatus === 'degraded' ? 'Backend Degraded' :
                     backendStatus === 'disconnected' ? 'Backend Disconnected' :
                     'Checking...'}
                  </span>
                  <button
                    onClick={checkBackendHealth}
                    className="ml-2 p-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                    title="Refresh backend status"
                  >
                    🔄
                  </button>
                </div>
                
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column - Patient Input */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <h2 className="text-lg font-semibold mb-4 text-blue-600">Patient Input</h2>
            
            {/* Backend Connection Warning */}
            {backendStatus === 'disconnected' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  <span className="text-sm text-red-700">
                    Backend is disconnected. Analysis will use sample data. Please check your FastAPI server.
                  </span>
                </div>
                <div className="mt-2 text-xs text-red-600">
                  Current backend URL: {API_CONFIG.baseUrl}
                </div>
              </div>
            )}
            <textarea
              value={patientInput}
              onChange={(e) => setPatientInput(e.target.value)}
              placeholder="Enter patient symptoms, complaints, or medical history..."
              className={`w-full h-48 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className="mt-4 space-y-3">
              <button
                onClick={handleAnalyzeSymptoms}
                disabled={isLoading || !patientInput.trim()}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                  backendStatus === 'disconnected' 
                    ? 'bg-gray-500 text-white cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  backendStatus === 'disconnected' ? 'Demo Mode (Sample Data)' : 'Analyze Symptoms'
                )}
              </button>
              <button
                onClick={handleReset}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Middle Column - AI Analysis */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <h2 className="text-lg font-semibold mb-4 text-green-600">AI Analysis</h2>
            
            {analysisResults ? (
              <div className="space-y-6">
                {/* Extracted Entities */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Extracted Entities</h3>
                  
                  {/* Symptoms */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.entities.symptoms.map((symptom, index) => (
                        <span key={index} className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full border border-red-200">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.entities.conditions.map((condition, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full border border-blue-200">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Medications</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.entities.medications.map((medication, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full border border-purple-200">
                          {medication}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Follow-up Questions */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Suggested Follow-up Questions</h3>
                  <ul className="space-y-2">
                    {analysisResults.followUpQuestions.map((question, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p>Enter patient symptoms above and click "Analyze Symptoms" to see AI analysis results.</p>
              </div>
            )}
          </div>

          {/* Right Column - Clinical Support */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <h2 className="text-lg font-semibold mb-4 text-purple-600">Clinical Support</h2>
            
            {analysisResults ? (
              <div className="space-y-6">
                {/* Differential Diagnoses */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Differential Diagnoses</h3>
                  <div className="space-y-3">
                    {analysisResults.differentialDiagnoses.map((diagnosis, index) => (
                      <div key={index} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border-l-4 border-blue-500`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{diagnosis.condition}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getConfidenceColor(diagnosis.confidence)}`}>
                            {diagnosis.confidence}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{diagnosis.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relevant Literature */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Relevant Literature</h3>
                  <div className="space-y-2">
                    {analysisResults.literature.map((article, index) => (
                      <div key={index} className="text-sm">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                        >
                          {article.title}
                        </a>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{article.journal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-4xl mb-2">📚</div>
                <p>Clinical support information will appear here after analysis.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Patient Summary */}
        {analysisResults && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-indigo-600">Patient Summary</h2>
              {lastAnalysisTime && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last analyzed: {lastAnalysisTime.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg p-4 border-l-4 border-blue-500`}>
                <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Symptoms Identified</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysisResults.entities.symptoms.length}</p>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} rounded-lg p-4 border-l-4 border-green-500`}>
                <h3 className="font-medium text-green-700 dark:text-green-300 mb-2">Conditions</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analysisResults.entities.conditions.length}</p>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} rounded-lg p-4 border-l-4 border-purple-500`}>
                <h3 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Medications</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysisResults.entities.medications.length}</p>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-orange-50'} rounded-lg p-4 border-l-4 border-orange-500`}>
                <h3 className="font-medium text-orange-700 dark:text-orange-300 mb-2">Follow-up Questions</h3>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysisResults.followUpQuestions.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalDashboard;
