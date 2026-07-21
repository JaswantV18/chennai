import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Map, Building, Sparkles, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

interface SitePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SitePlannerModal({ isOpen, onClose }: SitePlannerModalProps) {
  const [businessType, setBusinessType] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlan = async () => {
    if (!businessType.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/site-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ businessType, requirements }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.text);
      } else {
        setResult("Error: " + data.message);
      }
    } catch (err) {
      setResult("Failed to reach the AI planner service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-[#111218] border border-[#2D2D35] rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2D2D35] bg-[#161721]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Site Planner</h2>
              <p className="text-xs text-[#A1A1AA]">Find the optimal zone for your next project</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#2D2D35] text-[#71717A] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-1">
                  What are you planning to build?
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Supermarket, Urban Park, Cafe..."
                    className="w-full bg-[#1C1D24] border border-[#2D2D35] rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-1">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g. High population density, low competition, close to transit..."
                  className="w-full bg-[#1C1D24] border border-[#2D2D35] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px] resize-none"
                />
              </div>

              <button
                onClick={handlePlan}
                disabled={!businessType.trim() || loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-lg font-medium shadow-md shadow-indigo-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Analyzing Zones..." : "Generate Site Strategy"}
              </button>
            </div>

            <div className="bg-[#1C1D24] border border-[#2D2D35] rounded-xl p-5 h-[350px] overflow-y-auto">
              {result ? (
                <div className="prose prose-invert prose-sm max-w-none text-[#E0E0E0] prose-headings:text-white prose-a:text-indigo-400">
                  <div className="markdown-body">
                    <Markdown>{result}</Markdown>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#71717A] text-center space-y-3">
                  <Map className="w-12 h-12 opacity-20" />
                  <p className="text-sm max-w-[200px]">Describe your project and let our AI analyze Chennai's data to find the best zones.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
