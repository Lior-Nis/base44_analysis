import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const contactInfo = {
  address: "123 Green Street, Evercity, USA 12345",
  phone: "(555) 123-4567",
  email: "info@greenenergyalliance.org",
};

const footerLinks = [
  { title: "About Us", links: ["Our Mission", "Our Team", "Partnerships", "Careers"] },
  { title: "Resources", links: ["Blog", "Publications", "Events", "FAQ"] },
  { title: "Get Involved", links: ["Donate", "Volunteer", "Advocacy", "Contact Us"] },
];

const socialMedia = [
  { icon: <Facebook className="h-6 w-6" />, href: "#" },
  { icon: <Twitter className="h-6 w-6" />, href: "#" },
  { icon: <Instagram className="h-6 w-6" />, href: "#" },
  { icon: <Linkedin className="h-6 w-6" />, href: "#" },
];

export default function FooterSection() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInUp} // Using fadeInUp for the whole footer container
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
        >
          {/* Column 1: Organization Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-1">Green Energy Alliance</h3>
            <p className="text-sm leading-relaxed">
              Dedicated to fostering a sustainable future through renewable energy adoption, education, and policy advocacy across America.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-start"><MapPin className="h-5 w-5 mr-2 mt-0.5 text-green-400 flex-shrink-0" /> {contactInfo.address}</p>
              <p className="flex items-center"><Phone className="h-5 w-5 mr-2 text-green-400" /> {contactInfo.phone}</p>
              <p className="flex items-center"><Mail className="h-5 w-5 mr-2 text-green-400" /> {contactInfo.email}</p>
            </div>
          </div>

          {/* Columns 2-4: Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="hover:text-green-400 transition-colors text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Newsletter and Social Media */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInUp}
          className="border-t border-gray-700 pt-12 flex flex-col md:flex-row justify-between items-center gap-8"
        >
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Stay Updated</h4>
            <p className="text-sm mb-3 max-w-sm">Subscribe to our newsletter for the latest news on green energy and our initiatives.</p>
            <form className="flex gap-2 max-w-sm">
              <Input type="email" placeholder="Enter your email" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 text-sm" />
              <Button type="submit" className="bg-green-600 hover:bg-green-700 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
          <div className="flex space-x-4">
            {socialMedia.map((social, index) => (
              <a key={index} href={social.href} className="text-gray-400 hover:text-green-400 transition-colors p-2 bg-gray-800 rounded-full">
                {social.icon}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInUp}
          className="text-center text-sm text-gray-500 mt-12 border-t border-gray-700 pt-8"
        >
          © {new Date().getFullYear()} Green Energy Alliance. All Rights Reserved. 
          <a href="#" className="hover:text-green-400 underline ml-2">Privacy Policy</a> | 
          <a href="#" className="hover:text-green-400 underline ml-1">Terms of Service</a>
        </motion.div>
      </div>
    </footer>
  );
}