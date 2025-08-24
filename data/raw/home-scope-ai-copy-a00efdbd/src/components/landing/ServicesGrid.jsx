import React from 'react';
import { motion } from "framer-motion";
import { 
  Droplets, 
  Zap, 
  Wrench, 
  Home as HomeIcon, 
  Shield, 
  FileText,
  AlertTriangle,
  Flame,
  CheckCircle
} from "lucide-react";

const services = [
  { icon: Droplets, title: "Leaks & Water Damage", color: "bg-blue-100 text-blue-600" },
  { icon: AlertTriangle, title: "Damp & Mould", color: "bg-green-100 text-green-600" },
  { icon: Wrench, title: "Heating & No Hot Water", color: "bg-red-100 text-red-600" },
  { icon: HomeIcon, title: "Broken Fixtures", color: "bg-purple-100 text-purple-600" },
  { icon: Shield, title: "Home Safety Hazards", color: "bg-indigo-100 text-indigo-600" },
  { icon: Zap, title: "Electrical Concerns", color: "bg-yellow-100 text-yellow-600" },
  { icon: Flame, title: "Gas & Boiler Checks", color: "bg-orange-100 text-orange-600" },
  { icon: CheckCircle, title: "General Property Concerns", color: "bg-gray-100 text-gray-600" }
];

export default function ServicesGrid() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            What We Cover
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From emergency leaks to housing standards – our expert network covers every home concern you might face
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${service.color}`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {service.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}