import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Users, Target, CheckCircle, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AboutPage() {
  const values = [
    {
      icon: Award,
      title: "Academic Excellence",
      description: "Every course is meticulously designed using evidence-based pedagogical frameworks that elevate teaching practice and student outcomes."
    },
    {
      icon: BookOpen, 
      title: "Scholarly Rigor",
      description: "Our content integrates cutting-edge research with practical application, ensuring educators receive both theoretical foundation and actionable strategies."
    },
    {
      icon: Users,
      title: "Professional Community",
      description: "Join a network of forward-thinking educators committed to transformative instruction and continuous professional growth."
    },
    {
      icon: Target,
      title: "Measurable Impact",
      description: "Focus on tangible outcomes that enhance curriculum design, student engagement, and institutional effectiveness."
    }
  ];

  const achievements = [
    "Research-backed curriculum development",
    "Expert-designed professional resources", 
    "Comprehensive assessment frameworks",
    "Lifetime access to evolving content",
    "Self-paced learning for busy educators",
    "Certification upon course completion"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 border border-blue-300/30 text-blue-100 text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4 mr-2" />
              Transformative Educational Excellence
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Empowering Educators Through
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {" "}Scholarly Innovation
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
              Our platform was founded to support educators in delivering transformative, high-quality instruction 
              that elevates both teaching practice and student achievement through evidence-based methodologies.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Mission Statement */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                  Designed for Academic Distinction
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                  Designed for faculty, academic mentors, and lifelong learners, our courses integrate rigorous theory 
                  with classroom impact. Each program is thoughtfully structured to advance pedagogical expertise while 
                  maintaining the scholarly depth that distinguishes exceptional educators.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="p-4">
                    <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                    <p className="text-slate-600 font-medium">Hours of Expert Content</p>
                  </div>
                  <div className="p-4">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">Research</div>
                    <p className="text-slate-600 font-medium">Evidence-Based Approaches</p>
                  </div>
                  <div className="p-4">
                    <div className="text-3xl font-bold text-purple-600 mb-2">Lifetime</div>
                    <p className="text-slate-600 font-medium">Professional Access</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Core Values */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Foundations of Excellence
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our commitment to educational transformation is built on four pillars that ensure 
              every learning experience delivers meaningful professional growth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + (index * 0.1) }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <value.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">{value.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Professional Commitment */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-2xl">
            <CardContent className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                    Professional Content at Accessible Investment
                  </h2>
                  <p className="text-blue-100 text-lg leading-relaxed mb-8">
                    Empower your teaching journey without financial strain. Our courses deliver professional development 
                    content at a fraction of traditional institutional costs, ensuring that budget never becomes a barrier 
                    to educational excellence.
                  </p>
                  
                  <Link to={createPageUrl("Catalog")}>
                    <Button 
                      size="lg"
                      className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-4 shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Browse Courses Designed for Academic Excellence
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-blue-100 font-medium">{achievement}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Founder Statement */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardContent className="p-8 lg:p-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  A Vision for Educational Transformation
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                  "Education is the foundation upon which society builds its future. As educators, we have the profound 
                  responsibility to ensure that our instruction not only informs but transforms. This platform represents 
                  our commitment to providing the scholarly resources and evidence-based strategies that elevate teaching 
                  from good to exceptional."
                </p>
                
                <div className="flex justify-center">
                  <Link to={createPageUrl("Catalog")}>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Begin Your Professional Advancement Today
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
      </div>

      {/* Contact Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="text-sm text-slate-300">
              © Copyright all rights reserved
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-slate-300 leading-relaxed">
                For inquiries or academic correspondence, I welcome you to reach out via phone at{" "}
                <a href="tel:+13364931293" className="text-blue-400 hover:text-blue-300 font-medium">
                  (336) 493-1293
                </a>
                {" "}or email at{" "}
                <a href="mailto:alzfaryamr@gmail.com" className="text-blue-400 hover:text-blue-300 font-medium">
                  alzfaryamr@gmail.com
                </a>
                {" "}or{" "}
                <a href="mailto:ayaaldhaf@gmail.com" className="text-blue-400 hover:text-blue-300 font-medium">
                  ayaaldhaf@gmail.com
                </a>
                . I am committed to responding within 24 hours. Dedicated availability is offered on weekends—Saturday and Sunday—from 4:00 PM to 6:30 PM. Your engagement is always valued and encouraged.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}