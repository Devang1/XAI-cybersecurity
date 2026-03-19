"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

// Format SHAP data before passing to chart
const formatShapData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return [];
  
  // Aggregate duplicate features
  const aggregated = {};
  
  rawData.forEach(item => {
    // Extract clean feature name
    const match = item.feature.match(/Index\(\[(.*?)\]/);
    let cleanFeature = item.feature;
    
    if (match) {
      const features = match[1]
        .split(',')
        .map(f => f.trim().replace(/'/g, ''))
        .join(' + ');
      cleanFeature = features;
    } else {
      // Fallback cleaning
      cleanFeature = item.feature
        .replace(/Index\(\[|\], dtype='str'\)/g, '')
        .split(',')
        .map(f => f.trim().replace(/'/g, ''))
        .join(' + ');
    }
    
    // Aggregate values for same feature
    const key = cleanFeature;
    if (aggregated[key]) {
      aggregated[key].value += item.value;
      aggregated[key].count += 1;
    } else {
      aggregated[key] = {
        feature: key,
        value: item.value,
        count: 1,
        originalValue: item.value
      };
    }
  });
  
  // Convert to array and calculate averages
  const result = Object.values(aggregated).map(item => ({
    ...item,
    value: item.value / item.count, // Average value
    displayValue: (item.value / item.count).toFixed(4)
  }));
  
  return result;
};

export default function ShapChart({ data }) {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [sortBy, setSortBy] = useState('value');
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900/90 border border-orange-500/30 rounded-xl p-4 sm:p-8 text-center">
        <p className="text-sm sm:text-base text-gray-500">No SHAP data available</p>
      </div>
    );
  }

  // Process and sort data
  const formattedData = formatShapData(data);
  const processedData = [...formattedData].map(item => ({
    ...item,
    color: item.value > 0 ? '#10b981' : '#ef4444',
    impact: item.value > 0 ? 'positive' : 'negative'
  }));

  const sortedData = [...processedData].sort((a, b) => {
    if (sortBy === 'value') return Math.abs(b.value) - Math.abs(a.value);
    return a.feature.localeCompare(b.feature);
  });

  // Calculate statistics
  const totalFeatures = formattedData.length;
  const positiveFeatures = formattedData.filter(d => d.value > 0).length;
  const negativeFeatures = formattedData.filter(d => d.value < 0).length;
  const avgImpact = (formattedData.reduce((acc, d) => acc + Math.abs(d.value), 0) / formattedData.length).toFixed(3);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border-2 border-orange-500 rounded-lg p-2 sm:p-4 shadow-2xl max-w-[200px] sm:max-w-none"
        >
          <p className="text-orange-400 font-bold text-xs sm:text-sm mb-1 sm:mb-2 truncate">{data.feature}</p>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-white text-xs sm:text-sm">
              Value: <span className={data.value > 0 ? 'text-green-500' : 'text-red-500'}>
                {data.value.toFixed(4)}
              </span>
            </p>
            <p className="text-gray-400 text-[10px] sm:text-xs">
              Impact: {data.value > 0 ? 'Positive' : 'Negative'}
            </p>
            {data.count > 1 && (
              <p className="text-gray-400 text-[10px] sm:text-xs">
                Occurrences: {data.count}
              </p>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-zinc-900/90 to-black border-2 border-orange-500/30 rounded-xl p-3 sm:p-4 md:p-6 hover:border-orange-500/60 transition-all duration-300 relative overflow-hidden group"
    >
      {/* Background effects - reduced on mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 bg-orange-500/10 rounded-full blur-3xl" />
      
      {/* Corner accents - hidden on mobile */}
      <div className="hidden sm:block absolute top-0 left-0 w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8 border-t-2 border-l-2 border-orange-500 rounded-tl-xl" />
      <div className="hidden sm:block absolute top-0 right-0 w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8 border-t-2 border-r-2 border-orange-500 rounded-tr-xl" />

      {/* Header - responsive layout */}
      <div className="relative mb-3 sm:mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-orange-400">
                SHAP Analysis
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Feature importance values</p>
            </div>
          </div>
          
          {/* Sort controls - stacked on mobile */}
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setSortBy('value')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                sortBy === 'value' 
                  ? 'bg-orange-500 text-black' 
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              {isMobile ? 'Impact' : 'Sort by Impact'}
            </button>
            <button
              onClick={() => setSortBy('feature')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                sortBy === 'feature' 
                  ? 'bg-orange-500 text-black' 
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              {isMobile ? 'Name' : 'Sort by Name'}
            </button>
          </div>
        </div>

        {/* Stats cards - responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mt-3 sm:mt-4">
          <div className="bg-black/50 border border-orange-500/20 rounded-lg p-1.5 sm:p-2">
            <p className="text-[8px] sm:text-xs text-gray-500">Features</p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-orange-400">{totalFeatures}</p>
          </div>
          <div className="bg-black/50 border border-green-500/20 rounded-lg p-1.5 sm:p-2">
            <p className="text-[8px] sm:text-xs text-gray-500">Positive</p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-green-500">{positiveFeatures}</p>
          </div>
          <div className="bg-black/50 border border-red-500/20 rounded-lg p-1.5 sm:p-2">
            <p className="text-[8px] sm:text-xs text-gray-500">Negative</p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-red-500">{negativeFeatures}</p>
          </div>
          <div className="bg-black/50 border border-orange-500/20 rounded-lg p-1.5 sm:p-2">
            <p className="text-[8px] sm:text-xs text-gray-500">Avg Impact</p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-orange-400">{avgImpact}</p>
          </div>
        </div>
      </div>

      {/* Chart - responsive height and margins */}
      <div className="relative h-[200px] sm:h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ 
              top: 5, 
              right: isMobile ? 20 : 30, 
              left: isMobile ? 70 : 100, 
              bottom: 5 
            }}
            onMouseMove={(e) => {
              if (e.activeTooltipIndex !== undefined) {
                setHoveredBar(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <XAxis 
              type="number" 
              tick={{ fill: '#9ca3af', fontSize: isMobile ? 10 : 12 }}
              tickLine={{ stroke: '#f97316' }}
              axisLine={{ stroke: '#f97316', strokeOpacity: 0.3 }}
            />
            <YAxis 
              type="category" 
              dataKey="feature" 
              tick={{ fill: '#9ca3af', fontSize: isMobile ? 9 : 12 }}
              tickLine={{ stroke: '#f97316' }}
              axisLine={{ stroke: '#f97316', strokeOpacity: 0.3 }}
              width={isMobile ? 60 : 90}
              tickFormatter={(value) => {
                if (isMobile) {
                  return value.length > 12 ? value.substring(0, 10) + '...' : value;
                }
                return value.length > 20 ? value.substring(0, 17) + '...' : value;
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }} />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={hoveredBar === index ? 1 : 0.8}
                  className="transition-opacity duration-200"
                />
              ))}
              {!isMobile && (
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  formatter={(value) => value.toFixed(3)}
                  style={{ fill: '#f97316', fontSize: 11, fontWeight: 500 }}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend and show details button */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-orange-500/20 pt-3 sm:pt-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
            <span className="text-[10px] sm:text-xs text-gray-400">Positive</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full" />
            <span className="text-[10px] sm:text-xs text-gray-400">Negative</span>
          </div>
        </div>

      </div>


      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(249, 115, 22, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 3px;
        }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </motion.div>
  );
}