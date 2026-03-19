"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";

export default function PredictionCard({ data }) {
  const { true_label, prediction, confidence } = data;
  const isCorrect = true_label === prediction;
  
  // Get colors based on prediction
  const getColors = (type) => {
    if (type === "benign") return {
      bg: "bg-green-500/20",
      text: "text-green-500",
      border: "border-green-500/30",
      icon: <Shield className="w-4 h-4" />
    };
    return {
      bg: "bg-red-500/20",
      text: "text-red-500",
      border: "border-red-500/30",
      icon: <AlertTriangle className="w-4 h-4" />
    };
  };

  const trueColors = getColors(true_label);
  const predColors = getColors(prediction);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/90 border border-orange-500/30 rounded-lg p-3 sm:p-4 relative overflow-hidden"
    >
      {/* Header - more compact */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          <h3 className="text-sm sm:text-base font-bold text-orange-400">Prediction</h3>
        </div>
        
        {/* Status badge - smaller */}
        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
          isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {isCorrect ? '✓' : '✗'}
        </span>
      </div>

      {/* Two-column layout - responsive grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        {/* True Label */}
        <div className={`${trueColors.bg} ${trueColors.border} border rounded-lg p-2 sm:p-3`}>
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            {trueColors.icon}
            <span className="text-[10px] sm:text-xs text-gray-400">True</span>
          </div>
          <p className={`text-sm sm:text-base font-bold ${trueColors.text} truncate`}>
            {prediction}
          </p>
        </div>

        {/* Predicted Label */}
        <div className={`${predColors.bg} ${predColors.border} border rounded-lg p-2 sm:p-3`}>
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            {predColors.icon}
            <span className="text-[10px] sm:text-xs text-gray-400">Pred</span>
          </div>
          <p className={`text-sm sm:text-base font-bold ${predColors.text} truncate`}>
            {prediction}
          </p>
        </div>
      </div>

      {/* Confidence bars - more compact */}
      <div className="space-y-2 sm:space-y-2.5">
        <div>
          <div className="flex justify-between text-[10px] sm:text-xs mb-0.5">
            <span className="text-gray-400">Benign</span>
            <span className="text-green-500 font-mono">
              {(confidence.benign * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${confidence.benign * 100}%` }}
              className="h-full bg-green-500 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] sm:text-xs mb-0.5">
            <span className="text-gray-400">Malware</span>
            <span className="text-red-500 font-mono">
              {(confidence.malware * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${confidence.malware * 100}%` }}
              className="h-full bg-red-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Simple confidence indicator - more compact */}
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-orange-500/20">
        <p className="text-[10px] sm:text-xs text-gray-500 flex items-center justify-between">
          <span>Confidence</span>
          <span className={Math.max(confidence.benign, confidence.malware) > 0.8 ? 'text-green-500' : 'text-yellow-500'}>
            {Math.max(confidence.benign, confidence.malware) > 0.8 ? 'High' : 'Medium'}
          </span>
        </p>
      </div>
    </motion.div>
  );
}