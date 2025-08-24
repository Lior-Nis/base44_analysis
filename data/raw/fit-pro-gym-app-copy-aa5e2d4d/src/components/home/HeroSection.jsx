
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20"></div>
      
      {/* Animated Glowing Stripes */}
      <motion.div
        className="absolute top-[20%] h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 shadow-[0_0_20px_#22d3ee]"
        style={{ filter: 'blur(1px)' }}
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ duration: 12, delay: 0, repeat: Infinity, ease: 'linear' }} />

      <motion.div
        className="absolute top-[30%] h-2 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70 shadow-[0_0_30px_#3b82f6]"
        style={{ filter: 'blur(1.5px)' }}
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ duration: 9, delay: 1, repeat: Infinity, ease: 'linear' }} />

      <motion.div
        className="absolute top-[40%] h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60 shadow-[0_0_25px_#facc15]"
        style={{ filter: 'blur(1px)' }}
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ duration: 15, delay: 0.5, repeat: Infinity, ease: 'linear' }} />

      <motion.div
        className="absolute top-[55%] h-2 w-full bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-70 shadow-[0_0_35px_#22c55e]"
        style={{ filter: 'blur(1.5px)' }}
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ duration: 11, delay: 2, repeat: Infinity, ease: 'linear' }} />

      <motion.div
        className="absolute top-[65%] h-1 w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80 shadow-[0_0_30px_#60a5fa]"
        style={{ filter: 'blur(1px)' }}
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ duration: 8, delay: 1.5, repeat: Infinity, ease: 'linear' }} />

      <motion.div
        className="absolute top-[80%] h-1 w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-60 shadow-[0_0_25px_#2dd4bf]"
        style={{ filter: 'blur(1px)' }}
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ duration: 13, delay: 2.5, repeat: Infinity, ease: 'linear' }} />

      {/* Core stripes for brightness */}
      <motion.div
        className="absolute top-[30%] h-2 w-full bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-90"
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ duration: 9, delay: 1, repeat: Infinity, ease: 'linear' }} />

      <motion.div
        className="absolute top-[55%] h-2 w-full bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-90"
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ duration: 11, delay: 2, repeat: Infinity, ease: 'linear' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Unleash Your
                <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  {" "}Ultimate{" "}
                </span>
                Potential
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                Premium fitness experience with state-of-the-art equipment, 
                expert trainers, and a community that drives results.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Memberships")}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-gray-900 text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Tour
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">5000+</div>
                <div className="text-sm text-gray-400">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">24/7</div>
                <div className="text-sm text-gray-400">Access</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">50+</div>
                <div className="text-sm text-gray-400">Expert Trainers</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-3xl backdrop-blur-sm border border-white/10 p-8">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Modern gym interior"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-80 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-green-500 to-blue-500 rounded-full opacity-60 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
