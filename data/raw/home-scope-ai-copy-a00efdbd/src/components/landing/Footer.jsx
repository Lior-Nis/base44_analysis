
import React from 'react';
import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company description */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">HomeScope</h3>
            <p className="text-gray-300 leading-relaxed max-w-md">
              Expert home consultations when you need them most. Licensed UK professionals 
              available 7 days a week via instant video calls.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-green-400 transition-colors">Video Consultations</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">AI Triage</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Emergency Support</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Peace of Mind Plans</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Property Inspections</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-green-400 transition-colors">Help Center</a></li>
              <li><Link to={createPageUrl('Contact')} className="hover:text-green-400 transition-colors">Contact Us</Link></li>
              <li><Link to={createPageUrl('ApplyAsExpert')} className="hover:text-green-400 transition-colors">Join as Expert</Link></li>
              <li><Link to={createPageUrl('Terms')} className="hover:text-green-400 transition-colors">Terms of Service</Link></li>
              <li><Link to={createPageUrl('PrivacyPolicy')} className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
              <li><a href="#" className="termly-display-preferences hover:text-green-400 transition-colors">Consent Preferences</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} HomeScope. All rights reserved.
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              Proudly serving the United Kingdom
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
