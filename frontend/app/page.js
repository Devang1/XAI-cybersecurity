"use client";

import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Zap, 
  Cpu,
  BarChart3,
  Sparkles,
  ChevronRight,
  Upload,
  Database
} from "lucide-react";

import PredictionCard from "../components/PredictionCard";
import ShapChart from "../components/ShapChart";
import LimeChart from "../components/LimeChart";
import LLMReport from "../components/LLMReport";

const samples = [
  { name: "Benign App #1", index: 9153, type: "benign", icon: "🛡️" },
  { name: "Malware App #1", index: 4821, type: "malware", icon: "⚠️" },
  { name: "Benign App #2", index: 7833, type: "benign", icon: "🛡️" },
  { name: "Malware App #2", index: 4629, type: "malware", icon: "⚠️" },
  { name: "Benign App #3", index: 11698, type: "benign", icon: "🛡️" },
  { name: "Malware App #3", index: 2805, type: "malware", icon: "⚠️" },
  { name: "Benign App #4", index: 6527, type: "benign", icon: "🛡️" },
  { name: "Malware App #4", index: 231, type: "malware", icon: "⚠️" }
];

export default function Home() {
  // Sample analysis states
  const [selected, setSelected] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // File upload states
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Tab state: 'samples' or 'upload'
  const [activeTab, setActiveTab] = useState('samples');

  // Sample analysis function
  const analyzeSample = async () => {
    try {
      setLoading(true);
      setResult(null);
      setUploadResult(null); // Clear other results
      
      const res = await axios.post("http://127.0.0.1:8000/analyze-sample", {
        sample_index: selected
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("⚠️ Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  // File upload analysis function
  const analyzeFile = async () => {
    if (!file) return alert("Please upload an APK file");

    try {
      setUploadLoading(true);
      setUploadResult(null);
      setResult(null); // Clear other results

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:8000/analyze-apk",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUploadResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing APK");
    } finally {
      setUploadLoading(false);
    }
  };

  const getTypeColor = (index) => {
    const sample = samples.find(s => s.index === index);
    switch(sample?.type) {
      case 'malware': return 'text-red-500 border-red-500';
      case 'benign': return 'text-green-500 border-green-500';
      case 'suspicious': return 'text-yellow-500 border-yellow-500';
      default: return 'text-orange-500 border-orange-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      {/* Simple background pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, orange 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-orange-500">
              Malware Intelligence
            </h1>
          </div>
          <p className="text-gray-400 ml-11">
            AI-powered Android Malware Detection with Explainable AI
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
              activeTab === 'samples' 
                ? 'text-orange-500 border-b-2 border-orange-500' 
                : 'text-gray-400 hover:text-orange-400'
            }`}
          >
            <Database className="w-4 h-4" />
            Pre-loaded Samples
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
              activeTab === 'upload' 
                ? 'text-orange-500 border-b-2 border-orange-500' 
                : 'text-gray-400 hover:text-orange-400'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload APK
          </button>
        </div>

        {/* Control Panel - Changes based on active tab */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 border-2 border-orange-500/30 rounded-xl p-6 mb-8 backdrop-blur-sm shadow-lg hover:shadow-orange-500/10 transition-all duration-300 relative overflow-hidden group"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500 rounded-br-xl" />

          {/* Header with animated icon */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Cpu className="w-6 h-6 text-orange-500 animate-pulse" />
                <div className="absolute inset-0 bg-orange-500/20 blur-lg" />
              </div>
              <div>
                <span className="font-bold text-orange-400 text-lg tracking-wider">
                  {activeTab === 'samples' ? 'SAMPLE ANALYSIS' : 'APK UPLOAD'}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeTab === 'samples' 
                    ? 'Select from pre-loaded samples' 
                    : 'Upload your own APK file for analysis'}
                </p>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">System Ready</span>
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'samples' && (
              <motion.div
                key="samples"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col md:flex-row gap-4"
              >
                {/* Sample selector */}
                <div className="flex-1 relative">
                  <select
                    className={`w-full bg-black/80 border-2 ${getTypeColor(selected)} text-white px-5 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200 hover:bg-black/60 font-medium`}
                    value={selected}
                    onChange={(e) => setSelected(Number(e.target.value))}
                  >
                    {samples.map((s) => (
                      <option key={s.index} value={s.index} className="bg-zinc-900 py-2">
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight className="w-5 h-5 text-orange-500 rotate-90" />
                  </div>
                </div>

                {/* Analyze button */}
                <motion.button
                  onClick={analyzeSample}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-orange-500 rounded-lg blur-md group-hover/btn:blur-lg transition-all opacity-50 group-hover/btn:opacity-70" />
                  
                  <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 px-10 py-4 rounded-lg font-bold text-black flex items-center justify-center gap-3 min-w-[180px] border border-orange-400/30">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span className="tracking-wider">ANALYZING</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 fill-black" />
                        <span className="tracking-wider">ANALYZE SAMPLE</span>
                        <div className="absolute right-3 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col md:flex-row gap-4 items-center"
              >
                {/* File input */}
                <div className="flex-1 w-full">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".apk"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full bg-black/80 border-2 border-orange-500/30 text-white px-5 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-black hover:file:bg-orange-600 transition-all cursor-pointer"
                    />
                    {file && (
                      <p className="absolute -bottom-6 left-0 text-xs text-gray-400">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Upload button */}
                <motion.button
                  onClick={analyzeFile}
                  disabled={uploadLoading || !file}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-orange-500 rounded-lg blur-md group-hover/btn:blur-lg transition-all opacity-50 group-hover/btn:opacity-70" />
                  
                  <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 px-10 py-4 rounded-lg font-bold text-black flex items-center justify-center gap-3 min-w-[180px] border border-orange-400/30">
                    {uploadLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span className="tracking-wider">ANALYZING</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span className="tracking-wider">UPLOAD & ANALYZE</span>
                        <div className="absolute right-3 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results with AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* Loading States */}
          {(loading || uploadLoading) && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="inline-block p-4 bg-zinc-800/50 rounded-full mb-4">
                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                {activeTab === 'samples' 
                  ? `Analyzing Sample ${selected}` 
                  : 'Analyzing Uploaded APK'}
              </h3>
              <p className="text-gray-500">Running SHAP, LIME and LLM models...</p>
            </motion.div>
          )}

          {/* Sample Results */}
          {!loading && result && activeTab === 'samples' && (
            <ResultsDisplay result={result} />
          )}

          {/* Upload Results */}
          {!uploadLoading && uploadResult && activeTab === 'upload' && (
            <ResultsDisplay result={uploadResult} />
          )}

          {/* Empty State */}
          {!loading && !uploadLoading && !result && !uploadResult && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="inline-block p-4 bg-zinc-800/50 rounded-full mb-4">
                <Shield className="w-12 h-12 text-orange-500/50" />
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Analysis Yet</h3>
              <p className="text-gray-500">
                {activeTab === 'samples' 
                  ? 'Select a sample and click analyze to begin'
                  : 'Upload an APK file and click analyze to begin'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Results Display Component (to avoid code duplication)
function ResultsDisplay({ result }) {
  return (
    <motion.div 
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 backdrop-blur-sm"
      >
        <PredictionCard data={result} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-4 text-orange-400">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-medium">SHAP Analysis</h3>
          </div>
          <ShapChart data={result.shap} />
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-4 text-orange-400">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-medium">LIME Explanation</h3>
          </div>
          <LimeChart data={result.lime} />
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-4 text-orange-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-medium">AI Analysis Report</h3>
        </div>
        <LLMReport text={result.llm} />
      </motion.div>
    </motion.div>
  );
}