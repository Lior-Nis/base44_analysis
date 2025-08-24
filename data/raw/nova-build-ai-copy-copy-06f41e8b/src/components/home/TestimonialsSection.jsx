import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      business: "Johnson Plumbing Services",
      rating: 5,
      text: "I couldn't believe how professional my website looked! The AI understood exactly what my plumbing business needed. Got 3 new customers in the first week.",
      avatar: "SJ"
    },
    {
      name: "Mike Rodriguez",
      business: "Elite Roofing Solutions",
      rating: 5,
      text: "The website builder saved me thousands of dollars and weeks of time. The SEO features are incredible - I'm ranking #1 for 'roofing contractors' in my city.",
      avatar: "MR"
    },
    {
      name: "Lisa Chen",
      business: "Green Thumb Landscaping",
      rating: 5,
      text: "As someone who knows nothing about websites, this was perfect. The AI created beautiful galleries for my landscaping work and the mobile version is flawless.",
      avatar: "LC"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Business Owners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what other service businesses are saying about their AI-generated websites.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="glass-effect shadow-lg border-0 hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.business}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-6 h-6 text-indigo-200" />
                    <p className="text-gray-700 italic pl-4">{testimonial.text}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}