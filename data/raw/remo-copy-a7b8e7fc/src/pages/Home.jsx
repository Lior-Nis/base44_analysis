
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Users, Phone, Mail, MapPin, Star, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f6f0] antialiased">
      {/* Navigation */}
      <motion.nav className="bg-slate-100 fixed top-0 left-0 right-0 z-50 transition-all duration-300"



      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}>

        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-[Georgia,serif] text-[#e85a4f] tracking-wide">
              Remo
            </div>
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
              {['Experience', 'Menu', 'Chef', 'Contact'].map((item) =>
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-[#e85a4f] transition-colors duration-300">

                  {item}
                </a>
              )}
            </div>
            <div className="w-8 h-8 bg-[#1e3a8a] rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-medium">R</span>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative h-screen overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}>

        {/* Updated background image with the uploaded oyster image */}
        <div className="absolute inset-0">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/17bd27120_image.png"
            alt="Fresh oysters at Remo"
            className="w-full h-full object-cover" />

        </div>
        <div className="absolute inset-0 bg-black/40"></div> {/* Dark overlay for text contrast */}
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-6">
            <motion.h1
              className="text-6xl md:text-8xl font-[Georgia,serif] font-light mb-6 tracking-wider"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}>

              Welcome to Remo
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl font-light mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}>

              Where culinary artistry meets coastal elegance. <br />An unforgettable dining experience awaits.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}>

              <Button
                className="bg-[#e85a4f] hover:bg-[#d44a3f] text-white px-10 py-3 text-lg font-medium rounded-none tracking-wider"
                size="lg"
                onClick={() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' })}>

                RESERVE YOUR TABLE
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>

          <ChevronDown className="w-8 h-8 opacity-70" />
        </motion.div>
      </motion.section>

      {/* Chef Section */}
      <section id="chef" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}>

              <div className="relative aspect-[3/4] shadow-xl">
                {/* Actual image for an artistic food shot */}
                <img
                  src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Artisanal seafood pasta at Remo"
                  className="w-full h-full object-cover rounded-sm" />

                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#1e3a8a] rounded-full flex items-center justify-center shadow-xl">
                  <div className="text-white text-center">
                    <Star className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs font-medium tracking-wider">MICHELIN</div>
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#e85a4f] opacity-20 rounded-full"></div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="space-y-8">

              <div>
                <p className="text-[#e85a4f] text-sm font-medium tracking-wider mb-2">A CULINARY VISION</p>
                <h2 className="text-4xl md:text-5xl font-[Georgia,serif] font-light text-[#1e3a8a] mb-6 leading-tight">
                  An Innovative Concept from Chef Brenda Pio
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  At Remo, we celebrate the marriage of Mediterranean tradition and contemporary innovation. 
                  Chef Brenda Pio brings her Michelin-starred expertise to create an unforgettable dining experience 
                  that honors the sea's bounty.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  "Every plate is a masterpiece, fresh and flavorful, designed to transport you to the 
                  sun-drenched coasts of the Mediterranean."
                </p>
              </div>
              
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <div className="w-12 h-12 bg-[#1e3a8a] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">BP</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-lg">Chef Brenda Pio</div>
                  <div className="text-sm text-gray-500">Executive Chef & Owner</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 bg-[#f8f6f0]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16">

            <p className="text-[#e85a4f] text-sm font-medium tracking-wider mb-2">THE REMO DIFFERENCE</p>
            <h2 className="text-4xl md:text-5xl font-[Georgia,serif] font-light text-[#1e3a8a] mb-6">The Experience</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Immerse yourself in a culinary journey that celebrates the finest ingredients, artisanal craftsmanship, and an ambiance of sophisticated warmth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
            { title: "Finest Ingredients", description: "Sourced daily for unparalleled freshness and quality.", icon: "🌿" },
            { title: "Artisanal Plates", description: "Every dish crafted with meticulous attention and creative flair.", icon: "🎨" },
            { title: "Elegant Ambiance", description: "Sophisticated dining in a warm, welcoming coastal setting.", icon: "✨" },
            { title: "Impeccable Service", description: "Attentive care that anticipates your every need.", icon: "🥂" }].
            map((item, index) =>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">

                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section id="reservation" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}>

            <p className="text-[#e85a4f] text-sm font-medium tracking-wider mb-2">JOIN US</p>
            <h2 className="text-4xl md:text-5xl font-[Georgia,serif] font-light text-[#1e3a8a] mb-8">Reserve Your Table</h2>
            <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the finest in coastal Mediterranean cuisine. We recommend booking in advance.
            </p>
            
            <div className="bg-[#f8f6f0] p-8 md:p-12 rounded-lg shadow-xl max-w-2xl mx-auto">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label htmlFor="res-date" className="text-sm font-medium text-gray-700">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="res-date" type="date" className="pl-10 border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]" />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label htmlFor="res-time" className="text-sm font-medium text-gray-700">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select id="res-time" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-[#1e3a8a] focus:ring-[#1e3a8a]">
                        <option>7:00 PM</option>
                        <option>7:30 PM</option>
                        <option>8:00 PM</option>
                        <option>8:30 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label htmlFor="res-guests" className="text-sm font-medium text-gray-700">Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select id="res-guests" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-[#1e3a8a] focus:ring-[#1e3a8a]">
                        <option>2 guests</option>
                        <option>3 guests</option>
                        <option>4 guests</option>
                        <option>5 guests</option>
                        <option>6 guests</option>
                        <option>Larger party (contact us)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label htmlFor="res-name" className="text-sm font-medium text-gray-700">Name</label>
                    <Input id="res-name" placeholder="Your full name" className="border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]" />
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-[#e85a4f] hover:bg-[#d44a3f] text-white py-3 text-lg font-medium rounded-none tracking-wider">
                  CONFIRM RESERVATION
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section Footer */}
      <footer id="contact" className="py-24 bg-[#1e3a8a] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} viewport={{ once: true }}>

              <h3 className="text-2xl font-[Georgia,serif] font-light mb-6 text-[#e85a4f]">Remo</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                A culinary destination where Mediterranean flavors meet modern elegance. Join us for an unforgettable dining experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }} viewport={{ once: true }}>

              <h3 className="text-xl font-semibold mb-6 tracking-wider">Contact Us</h3>
              <div className="space-y-3 text-sm">
                <a href="tel:+15551234567" className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-[#e85a4f]" />
                  <span>+1 (555) 123-4567</span>
                </a>
                <a href="mailto:reservations@remo.com" className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-[#e85a4f]" />
                  <span>reservations@remo.com</span>
                </a>
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-[#e85a4f]" />
                  <span>123 Coastal Drive, Seaside, CA 90210</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} viewport={{ once: true }}>

              <h3 className="text-xl font-semibold mb-6 tracking-wider">Hours</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p>Tuesday - Thursday: 5:30 PM - 10:00 PM</p>
                <p>Friday - Saturday: 5:30 PM - 11:00 PM</p>
                <p>Sunday: 5:00 PM - 9:00 PM</p>
                <p className="mt-2">Closed Mondays</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }} viewport={{ once: true }}>

              <h3 className="text-xl font-semibold mb-4 tracking-wider">Newsletter</h3>
              <p className="text-sm text-gray-300 mb-3">Stay updated with our latest offerings and events.</p>
              <form className="flex">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#e85a4f] focus:ring-[#e85a4f] rounded-r-none" />

                <Button type="submit" className="bg-[#e85a4f] hover:bg-[#d44a3f] text-white rounded-l-none px-4">
                  Sign Up
                </Button>
              </form>
            </motion.div>
          </div>
          
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Remo Restaurant. All Rights Reserved. Crafted with passion.</p>
          </div>
        </div>
      </footer>
    </div>);

}