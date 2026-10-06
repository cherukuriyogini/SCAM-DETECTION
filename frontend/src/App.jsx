import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DemoPresets, { DEMO_SAMPLES } from './components/DemoPresets';
import AnalyzerCard from './components/AnalyzerCard';
import ResultDashboard from './components/ResultDashboard';
import HistoryView from './components/HistoryView';
import AboutSection from './components/AboutSection';
import { 
  analyzeContentApi, 
  checkBackendHealth, 
  saveLocalHistory 
} from './services/api';
import { Shield, AlertCircle, HeartHandshake } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'analyze', 'history', 'about'
  const [inputTab, setInputTab] = useState('message'); // 'message', 'screenshot', 'link'
  const [messageContent, setMessageContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendHealth, setBackendHealth] = useState({ online: true });
  const [toastMessage, setToastMessage] = useState(null);

  const analyzerRef = useRef(null);

  // Check health on mount
  useEffect(() => {
    checkBackendHealth().then(status => {
      setBackendHealth(status);
    });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Demo selection handler
  const handleSelectDemo = (demo) => {
    setInputTab(demo.type === 'url' ? 'link' : 'message');
    setMessageContent(demo.text);
    setUrlContent(demo.url || '');
    setCurrentResult(null);
    showToast(`Loaded ${demo.title} demo scenario!`);

    // Scroll to analyzer
    const el = document.getElementById('analyzer-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartAnalysisClick = () => {
    setActiveTab('dashboard');
    const el = document.getElementById('analyzer-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToDemo = () => {
    const el = document.getElementById('demo-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Run analysis
  const handleRunAnalysis = async ({ input_type, text, url }) => {
    setIsLoading(true);
    try {
      const response = await analyzeContentApi({
        input_type,
        text,
        url,
        use_llm: true
      });

      setCurrentResult(response);
      saveLocalHistory(response);
      showToast(`Analysis Complete: ${response.category} (${response.risk_level})`);

      // Scroll to result view
      setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error("Analysis execution error:", err);
      showToast("Error during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setCurrentResult(item);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900/95 border border-blue-500/40 text-blue-200 text-xs shadow-2xl backdrop-blur-md flex items-center space-x-2 animate-bounce">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'analyze') {
            setCurrentResult(null);
          }
        }}
        backendStatus={backendHealth}
      />

      {/* Main Body Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <>
            {/* If there's an active result, show Result Dashboard first */}
            {currentResult ? (
              <ResultDashboard 
                result={currentResult} 
                onReset={() => {
                  setCurrentResult(null);
                  setMessageContent('');
                  setUrlContent('');
                }} 
              />
            ) : (
              <>
                <Hero 
                  onStartAnalysis={handleStartAnalysisClick}
                  onScrollToDemo={handleScrollToDemo}
                />

                <DemoPresets onSelectDemo={handleSelectDemo} />

                <div ref={analyzerRef} className="pt-4">
                  <AnalyzerCard
                    onAnalyze={handleRunAnalysis}
                    isLoading={isLoading}
                    initialMessage={messageContent}
                    initialUrl={urlContent}
                    activeInputTab={inputTab}
                    setActiveInputTab={setInputTab}
                  />
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'analyze' && (
          <div className="pt-8">
            {currentResult ? (
              <ResultDashboard 
                result={currentResult} 
                onReset={() => setCurrentResult(null)} 
              />
            ) : (
              <AnalyzerCard
                onAnalyze={handleRunAnalysis}
                isLoading={isLoading}
                initialMessage={messageContent}
                initialUrl={urlContent}
                activeInputTab={inputTab}
                setActiveInputTab={setInputTab}
              />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryView 
            onSelectHistoryItem={handleSelectHistoryItem}
            onBackToAnalyze={() => {
              setActiveTab('dashboard');
              setCurrentResult(null);
            }}
          />
        )}

        {activeTab === 'about' && (
          <AboutSection />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">ScamInvestigation AI</span>
            <span>— AI-Powered Protection Against Digital Scams</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <span>Detect. Explain. Protect.</span>
            <span>•</span>
            <span>FastAPI + React + Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
