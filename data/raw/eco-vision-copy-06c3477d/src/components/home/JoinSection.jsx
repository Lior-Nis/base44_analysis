import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageSquare, Send } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function JoinSection() {
  return (
    <section id="join" className="py-24 md:py-32 bg-gray-100">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
        >
          <div className="text-center md:text-left">
            <motion.div 
              className="inline-block p-4 bg-green-500 text-white rounded-full mb-6 shadow-lg"
              variants={fadeInUp}
            >
              <Users className="h-10 w-10" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Join the Green Revolution</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Be part of the movement towards a sustainable future. Whether you're an individual, a business, or an organization, your contribution matters. Let's work together to make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6">
                Become a Volunteer
              </Button>
              <Button variant="outline" size="lg" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 text-lg px-8 py-6">
                Partner With Us
              </Button>
            </div>
          </div>

          <motion.div 
            className="bg-white p-8 md:p-10 rounded-xl shadow-2xl"
            variants={fadeInUp}
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="h-7 w-7 text-green-500 mr-3" />
              Send Us a Message
            </h3>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input type="text" id="name" placeholder="Your Name" className="text-base" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <Input type="email" id="email" placeholder="you@example.com" className="text-base" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <Textarea id="message" placeholder="How can we help you?" rows={4} className="text-base" />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                <Send className="h-5 w-5 mr-2" />
                Submit Information
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}