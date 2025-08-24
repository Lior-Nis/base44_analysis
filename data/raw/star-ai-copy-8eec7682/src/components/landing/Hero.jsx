
import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Logo from "../ui/Logo";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-100 to-sky-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8">

          <div className="flex justify-center mb-8">
            <Logo size="large" />
          </div>

          <div className="space-y-4">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium AI for Lawyers & Business
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Premium AI Assistant
              <br />
              <span className="bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Get instant, high-quality AI assistance tailored specifically for 
              <strong className="text-slate-800"> lawyers & business professionals</strong>. 
              Save hours with our premium AI-powered tools and document analysis.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">

            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => document.getElementById('plan-selector')?.scrollIntoView({ behavior: 'smooth' })}>

              <Star className="w-5 h-5 mr-2 fill-white" />
              Start Using AI Tools
            </Button>
            
          </motion.div>
        </motion.div>
      </div>
    </section>);

}
