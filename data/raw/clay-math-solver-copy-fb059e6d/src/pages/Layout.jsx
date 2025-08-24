

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calculator, BookOpen, Brain, Sparkles } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <style>
        {`
          :root {
            --clay-lavender: #E6E6FA;
            --clay-mint: #98FB98;
            --clay-blue: #87CEEB;
            --clay-peach: #FFDAB9;
            --clay-white: #FEFEFE;
            --clay-shadow: rgba(0, 0, 0, 0.1);
            --clay-inner-shadow: rgba(0, 0, 0, 0.05);
          }
          
          .clay-element {
            border-radius: 20px;
            box-shadow: 
              8px 8px 16px var(--clay-shadow),
              -8px -8px 16px rgba(255, 255, 255, 0.9),
              inset 2px 2px 4px var(--clay-inner-shadow),
              inset -2px -2px 4px rgba(255, 255, 255, 0.8);
            transition: all 0.3s ease;
          }
          
          .clay-element:hover {
            transform: translateY(-2px);
            box-shadow: 
              10px 10px 20px var(--clay-shadow),
              -10px -10px 20px rgba(255, 255, 255, 0.9),
              inset 2px 2px 4px var(--clay-inner-shadow),
              inset -2px -2px 4px rgba(255, 255, 255, 0.8);
          }
          
          .clay-pressed {
            transform: translateY(1px);
            box-shadow: 
              4px 4px 8px var(--clay-shadow),
              -4px -4px 8px rgba(255, 255, 255, 0.9),
              inset 4px 4px 8px var(--clay-inner-shadow),
              inset -4px -4px 8px rgba(255, 255, 255, 0.8);
          }
          
          .clay-inset {
            box-shadow: 
              inset 8px 8px 16px var(--clay-shadow),
              inset -8px -8px 16px rgba(255, 255, 255, 0.9);
          }
        `}
      </style>
      
      {/* Header */}
      <header className="px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="clay-element bg-gradient-to-r from-purple-100 to-blue-100 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="clay-element bg-gradient-to-br from-purple-200 to-blue-200 p-3 md:p-4">
                  <Calculator className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">MathSolver</h1>
                  <p className="text-sm md:text-base text-purple-600 font-medium">Step-by-step solutions made simple</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-center">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="clay-element bg-gradient-to-r from-green-100 to-blue-100 p-6">
            <div className="flex items-center justify-center gap-4">
              <Brain className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Learning math, one step at a time</span>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

