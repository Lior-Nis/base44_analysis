
import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Sparkles } from "lucide-react";

export default function Contact() {
  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F8F2EC] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#C8A882]/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#C8A882]" />
            <span className="text-sm font-medium">Get In Touch</span>
          </div>
          
          <h1 className="font-serif font-medium text-[length:var(--font-h1)] text-[#0F0F0F] mb-6 leading-tight">
            Contact SERENITY - The Best Luxury Spa in Kolkata
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-[1.618]">
            Experience luxury wellness at SERENITY, where premium equipment meets 
            highly skilled professionals for the best organic spa treatments in Kolkata.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-[clamp(1rem,2vw,2.5rem)]">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-[1.2em]"
          >
            {/* Address */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#C8A882]/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C8A882]/10 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#C8A882]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-2">Visit Our Luxury Spa</h3>
                  <p className="leading-[1.618] text-gray-600">
                    P-145, Sector A<br />
                    Metropolitan Co-Operative Housing Society Limited<br />
                    Tangra, Kolkata, West Bengal 700105
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#C8A882]/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C8A882]/10 rounded-2xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[#C8A882]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-2">Luxury Booking Line</h3>
                  <p className="leading-[1.618] text-gray-600">
                    +91 98765 43210<br />
                    <span className="text-sm">Premium service available daily</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#C8A882]/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C8A882]/10 rounded-2xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#C8A882]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-2">Concierge Email</h3>
                  <p className="leading-[1.618] text-gray-600">
                    info@serenitysalon.in<br />
                    <span className="text-sm">Premium support within 2 hours</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#C8A882]/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C8A882]/10 rounded-2xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#C8A882]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-2">Luxury Hours</h3>
                  <div className="text-gray-600 space-y-1 leading-[1.618]">
                    <p>Monday - Friday: 10:00 AM - 8:00 PM</p>
                    <p>Saturday: 9:00 AM - 7:00 PM</p>
                    <p>Sunday: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#C8A882]/20">
              <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-[#C8A882] rounded-2xl flex items-center justify-center hover:bg-[#FF5C8D] transition-colors duration-300 text-white">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-[#C8A882] rounded-2xl flex items-center justify-center hover:bg-[#FF5C8D] transition-colors duration-300 text-white">
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-[#C8A882]/20"
          >
            <h2 className="font-serif text-[length:var(--font-h2)] font-bold text-[#0F0F0F] mb-6">Experience Luxury</h2>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8A882] transition-colors duration-300"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8A882] transition-colors duration-300"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8A882] transition-colors duration-300"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8A882] transition-colors duration-300"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Interested Service
                </label>
                <select
                  id="service"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8A882] transition-colors duration-300"
                >
                  <option value="">Select a service</option>
                  <option value="facial">Facial Treatments</option>
                  <option value="massage">Massage Therapy</option>
                  <option value="hair">Hair Services</option>
                  <option value="nails">Nail Care</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8A882] transition-colors duration-300 resize-none"
                  placeholder="Tell us about your wellness goals..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C8A882] text-white py-4 rounded-xl font-medium hover:bg-[#FF5C8D] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
