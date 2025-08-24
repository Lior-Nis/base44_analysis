
import React, { useState } from 'react';
import { Star, Scale, FileText, Zap, Check, Upload, CreditCard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle }
 from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import Hero from "../components/landing/Hero";
import PlanSelector from "../components/landing/PlanSelector";
import FormSection from "../components/landing/FormSection";
import Features from "../components/landing/Features";
import Logo from "../components/ui/Logo";

export default function Home() {
  const [activeSection, setActiveSection] = useState('free-form');

  const showSection = (sectionId) => {
    setActiveSection(sectionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <nav className="flex items-center gap-4">
               <Link to={createPageUrl("Advisor")}>
                  <Button variant="ghost">AI Business Advisor</Button>
                </Link>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                For Lawyers & Business
              </Badge>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <Features />
          
          <PlanSelector 
            activeSection={activeSection} 
            onSectionChange={showSection} 
          />
          
          <FormSection activeSection={activeSection} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-slate-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-bold text-white">Star AI</span>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              © 2024 Star AI. Premium AI for Lawyers & Business.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
