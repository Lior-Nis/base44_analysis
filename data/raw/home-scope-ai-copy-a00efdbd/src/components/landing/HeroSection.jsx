
import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, Zap } from "lucide-react";

export default function HeroSection({ onTriageClick, onBookClick }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8">

            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Get Fast, Expert Help With{' '}
                <span className="text-green-500">Home Problems</span> – Anytime, Anywhere
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                HomeScope connects you with licensed UK experts via instant video consultations. 
                No more waiting, no more guessing – just expert help when you need it most.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={onTriageClick}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold group">

                <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Your AI Triage
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onBookClick}
                className="border-2 border-yellow-400 text-gray-900 hover:bg-yellow-50 px-8 py-4 text-lg font-semibold">

                Book Now
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Available 7 days a week
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Licensed UK experts
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Instant consultations
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative">

            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Live Expert Consultation</h3>
                  <p className="text-gray-500 text-sm">Connected in under 10 minutes</p>
                </div>
              </div>
              
              <video
                className="w-full aspect-square object-contain rounded-xl mb-6 bg-gray-100"
                src="https://res.cloudinary.com/dbbmcpgvz/video/upload/pareace_realistic_FaceTime-style_video_call_interface_main_sc_396ea247-6b80-4d15-a0ab-2cd6c74f7570_0_jfwnos.mp4"
                autoPlay
                loop
                muted
                playsInline
                poster="https://images.unsplash.com/photo-1601053073727-4c74a3f2d22a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D">

                Your browser does not support the video tag.
              </video>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Real-time problem assessment
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Instant expert recommendations
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  PDF summary sent immediately
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-500 rounded-full opacity-10"></div>
          </motion.div>
        </div>
      </div>
    </section>);

}