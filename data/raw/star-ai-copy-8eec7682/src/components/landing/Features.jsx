import React from 'react';
import { FileText, Zap, Shield, Clock, Upload, Brain } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Legal Tools",
    description: "Advanced AI specifically trained for lawyers and business professionals"
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Get high-quality results in seconds, not hours of manual work"
  },
  {
    icon: FileText,
    title: "Case-Specific Analysis",
    description: "AI tools customized to your specific legal and business requirements"
  },
  {
    icon: Upload,
    title: "Document Upload (Beta)",
    description: "Upload files and get AI analysis based on actual documents"
  },
  {
    icon: Shield,
    title: "Professional Grade",
    description: "Built for legal and business professionals with accuracy and precision"
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Reduce manual work from hours to minutes with AI assistance"
  }
];

export default function Features() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Why Professionals Choose Star AI
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Purpose-built for lawyers and business professionals with features designed 
          to enhance your practice and business efficiency.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full border-slate-200 hover:border-blue-200 transition-colors duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}