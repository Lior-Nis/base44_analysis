import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function NavigationBar({ isAdmin }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#impact", label: "Impact" },
    { href: "#projects", label: "Projects" },
    { href: "#goals", label: "Our Goals" },
    { href: "#join", label: "Join Us" },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-[100] py-4 bg-black/30 backdrop-blur-lg shadow-md"
    >
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-white hover:text-green-300 transition-colors">
          Green Energy Alliance
        </a>
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className="text-white hover:text-green-300 transition-colors">{link.label}</a>
          ))}
          {isAdmin && (
            <a 
              href={createPageUrl("Admin")} 
              className="text-white hover:text-green-300 transition-colors"
            >
              Admin
            </a>
          )}
          <Button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 transition-colors">Donate</Button>
        </div>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" className="text-white hover:text-green-300" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 bg-black/50 backdrop-blur-md"
          >
            <div className="flex flex-col items-center py-4 space-y-3">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} className="text-white hover:text-green-300 transition-colors text-lg" onClick={toggleMobileMenu}>{link.label}</a>
              ))}
              {isAdmin && (
                <a 
                  href={createPageUrl("Admin")} 
                  className="text-white hover:text-green-300 transition-colors text-lg"
                  onClick={toggleMobileMenu}
                >
                  Admin
                </a>
              )}
              <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg w-full max-w-xs mx-auto" onClick={toggleMobileMenu}>Donate</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}