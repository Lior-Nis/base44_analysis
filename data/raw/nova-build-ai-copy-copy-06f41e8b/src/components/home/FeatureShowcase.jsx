import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Globe, Smartphone, Search, Palette, Download, Code, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function FeatureShowcase() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Generation",
      description: "AI creates your complete website in under 2 minutes with professional content and design.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Globe,
      title: "SEO Optimized",
      description: "Built-in SEO best practices ensure your business gets found by potential customers online.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Every website works perfectly on phones, tablets, and desktops with automatic optimization.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Palette,
      title: "Custom Branding",
      description: "AI generates unique color schemes and designs that match your business personality.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Code,
      title: "Clean Code",
      description: "Production-ready HTML, CSS, and JavaScript that follows modern web standards.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Download,
      title: "Easy Export",
      description: "Download your complete website files and host anywhere - no vendor lock-in.",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: Search,
      title: "Local SEO Ready",
      description: "Optimized for local searches to help customers in your area find your business.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Security First",
      description: "Built with security best practices and clean, vulnerability-free code.",
      color: "from-gray-500 to-slate-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything Your Business Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI doesn't just create websites - it builds complete business solutions that drive results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect shadow-lg border-0 hover:shadow-xl transition-all duration-300 group h-full">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}