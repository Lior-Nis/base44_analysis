import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Star, Users, Award, CheckCircle, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import PresentationSlider from "./PresentationSlider";

export default function HeroSection({ totalCourses, subjects }) {
  const scrollToAvailableCourses = () => {
    const element = document.getElementById('available-courses');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-400 via-teal-600 to-slate-800">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-teal-600 to-slate-800"></div>
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 60% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 40%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px', '0px 0px']
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          
          {/* Purple Header Label with Colorful Earth Icon */}
          <motion.div 
            className="inline-flex items-center px-6 py-3 rounded-full bg-purple-600 border border-purple-500 text-white text-sm font-bold uppercase tracking-wider mb-8 relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Colorful Earth Icon positioned behind text */}
            <div className="absolute -left-3 -top-3 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-yellow-400 flex items-center justify-center shadow-lg opacity-80">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="relative z-10">Professional Development for Educators</span>
          </motion.div>
          
          {/* Main Headline with Two Colors */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-7xl font-bold mb-8 leading-tight">
              <div className="text-white mb-4">Advance Your Teaching Practice</div>
              <div className="text-navy-900" style={{ color: '#1e293b' }}>Courses that Inspire Excellence</div>
            </h1>
          </motion.div>
          
          {/* Subheading in White */}
          <motion.p 
            className="text-xl lg:text-2xl text-white mb-12 leading-relaxed max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Transform your pedagogical approach with research-backed methodologies, 
            expert-designed curricula, and comprehensive resources crafted for academic distinction.
          </motion.p>
          
          {/* Key Benefits with Green Checkmarks */}
          <motion.div 
            className="grid sm:grid-cols-2 gap-4 mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              "Research-backed methodologies",
              "Affordable access to high-impact learning", 
              "Thoughtfully structured for educators",
              "Comprehensive materials & lifetime access"
            ].map((benefit, index) => (
              <motion.div 
                key={index}
                className="flex items-center text-white text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
              >
                <CheckCircle className="w-6 h-6 text-emerald-400 mr-4 flex-shrink-0" />
                <span className="text-lg font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Call-to-Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button 
              size="lg"
              onClick={scrollToAvailableCourses}
              className="bg-red-700 hover:bg-red-800 text-white px-12 py-6 text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Explore Professional Courses
            </Button>
            <Button 
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-teal-800 px-12 py-6 text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Preview Course Excellence
            </Button>
          </motion.div>

          {/* Presentation Slider */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <PresentationSlider />
          </motion.div>
          
          {/* Informational Footer Blocks */}
          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="bg-teal-100 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-slate-800 mb-2">{totalCourses}+</div>
              <div className="text-slate-800 text-lg font-semibold">Professional Courses</div>
            </div>
            <div className="bg-teal-100 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-slate-800 mb-2">Expert</div>
              <div className="text-slate-800 text-lg font-semibold">Content Design</div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}