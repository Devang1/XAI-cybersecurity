"use client";

import { useState } from "react";
import axios from "axios";

import PredictionCard from "../../components/PredictionCard";
import ShapChart from "../../components/ShapChart";
import LimeChart from "../../components/LimeChart";
import LLMReport from "../../components/LLMReport";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Upload + Analyze
  const analyzeFile = async () => {
    if (!file) return alert("Please upload an APK file");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:8000/analyze-apk",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing APK");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-orange-500 mb-6">
        🛡️ Android Malware Analyzer
      </h1>

      {/* UPLOAD CARD */}
      <div className="bg-zinc-900 border border-orange-500/30 rounded-xl p-6 mb-6">
        
        <h2 className="text-lg text-orange-400 mb-4">
          Upload APK File
        </h2>

        <div className="flex gap-4 items-center">
          
          <input
            type="file"
            accept=".apk"
            onChange={(e) => setFile(e.target.files[0])}
            className="bg-zinc-800 p-2 rounded text-sm"
          />

          <button
            onClick={analyzeFile}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-black font-bold"
          >
            {loading ? "Analyzing..." : "Analyze APK"}
          </button>
        </div>

        {file && (
          <p className="text-gray-400 text-sm mt-2">
            Selected: {file.name}
          </p>
        )}
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="text-orange-400 text-center mt-10 animate-pulse">
          🔍 Analyzing APK... Please wait
        </div>
      )}

      {/* RESULTS */}
      {result && !loading && (
        <>
          {/* Prediction */}
          <PredictionCard data={result} />

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <ShapChart data={result.shap} />
            <LimeChart data={result.lime} />
          </div>

          {/* LLM Report */}
          <LLMReport text={result.llm} />
        </>
      )}
    </div>
  );
}