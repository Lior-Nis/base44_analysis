import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap, MessageSquare, ArrowRight } from "lucide-react";

export default function AITriageSection({ onTriageClick }) {
  return (
    <section className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="max-w-4xl mx-auto border-none shadow-lg bg-white">
            <CardContent className="p-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Not sure what's wrong?
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Try our AI Assistant for a quick home health check. Get instant insights 
                and know exactly what expert you need – all before you book.
              </p>

              <Button 
                size="lg" 
                onClick={onTriageClick}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold group"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Launch AI Triage
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Free to use
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Takes 2 minutes
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Smart recommendations
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}