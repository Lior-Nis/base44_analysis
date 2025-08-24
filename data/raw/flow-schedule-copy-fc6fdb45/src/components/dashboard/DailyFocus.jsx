import React, { useState, useEffect } from 'react';
import { Lightbulb, Target, Sun } from "lucide-react";
import { InvokeLLM } from "@/api/integrations"; // Assuming you have this

const defaultFocus = {
  quote: "The secret of getting ahead is getting started.",
  author: "Mark Twain",
  affirmation: "I am focused, productive, and capable of achieving my goals today.",
};

export default function DailyFocus({ refreshTrigger }) {
  const [focusData, setFocusData] = useState(defaultFocus);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFocusData();
  }, [refreshTrigger]);

  const fetchFocusData = async () => {
    setLoading(true);
    try {
      // Example: Use InvokeLLM to get a dynamic quote and affirmation
      // For now, we'll use a simpler approach or static data if LLM is too complex for this example
      const result = await InvokeLLM({
          prompt: "Generate a short inspirational quote for productivity, its author, and a positive affirmation for the day. Return as JSON.",
          response_json_schema: {
              type: "object",
              properties: {
                  quote: { type: "string" },
                  author: { type: "string" },
                  affirmation: { type: "string" }
              }
          }
      });
      if (result && result.quote) {
        setFocusData(result);
      } else {
        setFocusData(defaultFocus); // Fallback
      }
    } catch (error) {
      console.warn("Could not fetch dynamic focus data, using default.", error);
      setFocusData(defaultFocus);
    }
    setLoading(false);
  };
  
  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-2xl w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded-2xl w-full mb-2"></div>
        <div className="h-4 bg-slate-200 rounded-2xl w-2/3 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded-2xl w-1/2 mt-4"></div>
      </div>
    );
  }


  return (
    <div className="bg-gradient-to-br from-sky-500/80 to-blue-600/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Sun className="w-6 h-6 opacity-80" />
        <h3 className="text-lg font-semibold">Daily Focus</h3>
      </div>
      
      <div className="mb-6">
        <Lightbulb className="w-5 h-5 opacity-70 mb-1" />
        <p className="text-lg italic">"{focusData.quote}"</p>
        <p className="text-sm opacity-80 text-right mt-1">- {focusData.author}</p>
      </div>

      <div>
        <Target className="w-5 h-5 opacity-70 mb-1" />
        <p className="font-medium">{focusData.affirmation}</p>
      </div>
    </div>
  );
}