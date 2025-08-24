import React from 'react';
import { motion } from "framer-motion";
import { Home as HomeIcon, Users, Shield, Clock } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
                About HomeScope
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                HomeScope was created to take the stress out of home issues. As a UK-based service, 
                we connect you with qualified experts who understand local housing problems – fast. 
                With AI support, human guidance, and peace-of-mind plans, you're never alone in home confusion.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Expert Consultations</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">&lt; 2 min</div>
                <div className="text-gray-600">Average Connect Time</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/07901747f_ChatGPTImageAug3202501_13_36PM.png"
              alt="Illustration of HomeScope video consultation service"
              className="rounded-2xl shadow-xl w-full max-w-md lg:max-w-sm"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}