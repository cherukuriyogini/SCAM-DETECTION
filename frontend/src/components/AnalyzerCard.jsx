import React, { useState, useRef } from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Upload, 
  AlertCircle, 
  ShieldAlert, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { createWorker } from 'tesseract.js';

export default function AnalyzerCard({ 
  onAnalyze, 
  isLoading, 
  initialMessage = '', 
  initialUrl = '', 
  activeInputTab = 'message',
  setActiveInputTab
}) {
  const [messageText, setMessageText] = useState(initialMessage);
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStatusMessage, setOcrStatusMessage] = useState('');
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const fileInputRef = useRef(null);

  // Sync when initial props change (e.g. from demo presets)
  React.useEffect(() => {
    if (initialMessage) setMessageText(initialMessage);
    if (initialUrl) setUrlInput(initialUrl);
  }, [initialMessage, initialUrl]);

  // Loading animation cycle
  React.useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0);
      return;
    }
    const steps = [
      "Analyzing suspicious patterns...",
      "Checking scam indicators & risk signals...",
      "Evaluating URL threat reputation...",
      "Generating plain-language explanation..."
    ];
    const timer = setInterval(() => {
      setLoadingStepIndex(prev => (prev + 1) % steps.length);
    }, 700);
    return () => clearInterval(timer);
  }, [isLoading]);

  // Handle image upload and OCR extraction
  const handleImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    setIsOcrProcessing(true);
    setOcrStatusMessage('Initializing OCR engine in browser...');

    try {
      setOcrStatusMessage('Scanning image text with neural OCR...');
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();

      const extracted = (ret.data && ret.data.text) ? ret.data.text.trim() : '';
      if (extracted) {
        setOcrText(extracted);
        setMessageText(extracted);
        setOcrStatusMessage(`Extracted ${extracted.length} characters successfully!`);
      } else {
        setOcrStatusMessage('Screenshot text extraction unavailable or empty — please paste the message manually.');
      }
    } catch (err) {
      console.warn('Browser OCR error:', err);
      setOcrStatusMessage('Screenshot text extraction unavailable — please paste the message manually.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeInputTab === 'message') {
      if (!messageText.trim()) {
        alert('Please paste a message to analyze.');
        return;
      }
      onAnalyze({ input_type: 'message', text: messageText, url: '' });
    } else if (activeInputTab === 'screenshot') {
      if (!ocrText.trim() && !messageText.trim()) {
        alert('Please upload an image or type the extracted message text.');
        return;
      }
      onAnalyze({ input_type: 'screenshot', text: ocrText || messageText, url: '' });
    } else if (activeInputTab === 'link') {
      if (!urlInput.trim()) {
        alert('Please enter a URL to inspect.');
        return;
      }
      onAnalyze({ input_type: 'url', text: '', url: urlInput });
    }
  };

  return (
    <div id="analyzer-card" className="max-w-4xl mx-auto px-4 py-6">
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Card Header with Tabs */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Analyze Suspicious Content</span>
              </h2>
              <p className="text-sm text-slate-400">
                Choose an input method below to inspect threat levels, evidence, and safety guidance.
              </p>
            </div>
            
            <div className="flex items-center space-x-1.5 self-start sm:self-auto text-xs px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-vector Detection</span>
            </div>
          </div>

          {/* Three Main Tabs */}
          <div className="flex rounded-xl bg-slate-950/70 p-1.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveInputTab('message')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeInputTab === 'message'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('screenshot')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeInputTab === 'screenshot'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Screenshot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('link')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeInputTab === 'link'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Suspicious Link</span>
            </button>
          </div>
        </div>

        {/* Tab Content & Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* TAB 1: MESSAGE */}
          {activeInputTab === 'message' && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Paste the suspicious WhatsApp/SMS message here…&#10;&#10;e.g. “Congratulations! You have been selected for a work-from-home job. Pay ₹999 registration fee to activate your account…”"
                  className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm leading-relaxed resize-none transition-all shadow-inner"
                />
                <div className="flex justify-between items-center mt-2 px-1 text-xs text-slate-400">
                  <span>Supports WhatsApp messages, SMS alerts, Telegram pitches, job offers</span>
                  <span>{messageText.length} characters</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCREENSHOT / OCR */}
          {activeInputTab === 'screenshot' && (
            <div className="space-y-5">
              {/* Drag and Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  imagePreview
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-slate-700 hover:border-blue-500/60 bg-slate-950/40 hover:bg-slate-950/70'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleImageFile(e.target.files?.[0])}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                    <div className="relative group">
                      <img 
                        src={imagePreview} 
                        alt="Screenshot Preview" 
                        className="max-h-40 rounded-xl object-contain border border-slate-700 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setOcrText('');
                          setOcrStatusMessage('');
                        }}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow hover:bg-rose-500"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-left max-w-sm">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-white mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Screenshot Uploaded</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        Click browse or drop another file to replace this image.
                      </p>
                      {isOcrProcessing && (
                        <div className="flex items-center space-x-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{ocrStatusMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">
                      Drop screenshot here or <span className="text-blue-400 underline">Browse files</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports PNG, JPG, JPEG, WebP up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Extracted Text Card */}
              {ocrText && (
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Extracted Text (OCR)</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">Ready for AI Analysis</span>
                  </div>
                  <textarea
                    rows={4}
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    className="w-full bg-slate-900/90 rounded-xl border border-slate-800 p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Extracted text will appear here. You can manually edit or clean it up if needed."
                  />
                </div>
              )}

              {/* Status notice */}
              {ocrStatusMessage && !isOcrProcessing && !ocrText && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ocrStatusMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LINK / URL */}
          {activeInputTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Suspicious URL / Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste suspicious URL... (e.g. http://sbi-netbanking-verify.xyz/login)"
                    className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 px-4 py-3.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-500">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Security Warning */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-3 text-xs text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <strong className="font-semibold block mb-0.5 text-amber-200">Zero-Visit Safe Sandboxing:</strong>
                  Do not open suspicious links. We analyze the URL hostname, protocol, TLD reputation, and path patterns safely without requiring you or our browser to visit it.
                </div>
              </div>
            </div>
          )}

          {/* Submit CTA Button */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Instant heuristic pattern matching + NLP threat profiling</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || isOcrProcessing}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2.5 ${
                isLoading || isOcrProcessing
                  ? 'bg-blue-600/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>
                    {[
                      "Analyzing suspicious patterns...",
                      "Checking scam indicators...",
                      "Generating explanation..."
                    ][loadingStepIndex % 3]}
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Analyze for Scam</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
