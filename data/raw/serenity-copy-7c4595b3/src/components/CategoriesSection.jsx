
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categories = [
  {
    id: 1,
    key: "nail_polish",
    title: "Artisanal Nail Care",
    description: "Impeccable manicures and pedicures featuring organic, long-lasting polishes.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 12L16 36C16 38.2091 17.7909 40 20 40L28 40C30.2091 40 32 38.2091 32 36L32 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 12L34 12C35.1046 12 36 11.1046 36 10C36 8.89543 35.1046 8 34 8L14 8C12.8954 8 12 8.89543 12 10C12 11.1046 12.8954 12 14 12Z" stroke="currentColor" strokeWidth="2"/>
        <circle cx="20" cy="18" r="1" fill="currentColor"/>
        <circle cx="24" cy="20" r="1" fill="currentColor"/>
        <circle cx="28" cy="18" r="1" fill="currentColor"/>
        <path d="M18 24L30 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 28L30 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    bgColor: "bg-[#F5E6D8]"
  },
  {
    id: 2,
    key: "brow_polish",
    title: "Brow Sculpting",
    description: "Expert shaping and tinting to perfectly frame your features with master precision.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 20C16 16 20 18 24 20C28 18 32 16 36 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 22C16 20 20 21 24 22C28 21 32 20 34 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="24" cy="28" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="20" cy="26" r="1.5" fill="currentColor"/>
        <circle cx="28" cy="26" r="1.5" fill="currentColor"/>
        <path d="M20 32C22 34 26 34 28 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="15" cy="18" r="0.5" fill="currentColor"/>
        <circle cx="33" cy="18" r="0.5" fill="currentColor"/>
        <circle cx="18" cy="16" r="0.5" fill="currentColor"/>
        <circle cx="30" cy="16" r="0.5" fill="currentColor"/>
      </svg>
    ),
    bgColor: "bg-[#E8F4F8]"
  },
  {
    id: 3,
    key: "hair_dresser",
    title: "Signature Hairstyling",
    description: "Transform your look with our master stylists, using only the finest organic hair care.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M16 22C16 22 18 26 24 26C30 26 32 22 32 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 12C20 12 22 8 24 8C26 8 28 12 28 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 30L20 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 28L24 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 30L28 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="21" cy="14" r="1" fill="currentColor"/>
        <circle cx="27" cy="14" r="1" fill="currentColor"/>
        <circle cx="18" cy="10" r="0.5" fill="currentColor"/>
        <circle cx="30" cy="10" r="0.5" fill="currentColor"/>
      </svg>
    ),
    bgColor: "bg-white border border-[#C8A882]/20"
  },
  {
    id: 4,
    key: "foot_massage",
    title: "Restorative Massage",
    description: "Melt away tension with therapeutic techniques designed for deep relaxation.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 20C16 16 18 12 22 12C26 12 28 16 28 20L28 30C28 34 26 38 22 38C18 38 16 34 16 30L16 20Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M22 12C22 12 24 8 28 10C32 12 30 16 28 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20" cy="22" r="1" fill="currentColor"/>
        <circle cx="24" cy="24" r="1" fill="currentColor"/>
        <circle cx="20" cy="28" r="1" fill="currentColor"/>
        <circle cx="24" cy="30" r="1" fill="currentColor"/>
        <path d="M32 20C34 18 36 20 36 24C36 28 34 30 32 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="26" cy="14" r="0.5" fill="currentColor"/>
        <circle cx="30" cy="12" r="0.5" fill="currentColor"/>
      </svg>
    ),
    bgColor: "bg-[#F0F8E8]"
  },
  {
    id: 5,
    key: "cosmetics",
    title: "Radiant Skincare",
    description: "Revitalize your skin with bespoke facials and premium, pure ingredients.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="16" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M28 12L32 12C34 12 36 14 36 16L36 20C36 22 34 24 32 24L28 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 28L32 28C34 28 36 30 36 32C36 34 34 36 32 36L16 36C14 36 12 34 12 32C12 30 14 28 16 28Z" stroke="currentColor" strokeWidth="2"/>
        <circle cx="18" cy="14" r="1" fill="currentColor"/>
        <circle cx="22" cy="14" r="1" fill="currentColor"/>
        <path d="M18 18C19 19 21 19 22 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="30" cy="18" r="1.5" fill="currentColor"/>
        <circle cx="24" cy="32" r="1" fill="currentColor"/>
        <circle cx="16" cy="10" r="0.5" fill="currentColor"/>
        <circle cx="34" cy="8" r="0.5" fill="currentColor"/>
      </svg>
    ),
    bgColor: "bg-[#F8E8F0]"
  }
];

export default function CategoriesSection() {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollStep = 1;
    const scrollDelay = 50;

    const autoScroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollAmount = 0;
        scrollContainer.scrollLeft = 0;
      } else {
        scrollAmount += scrollStep;
        scrollContainer.scrollLeft = scrollAmount;
      }
    };

    const intervalId = setInterval(autoScroll, scrollDelay);

    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = () => {
      const newIntervalId = setInterval(autoScroll, scrollDelay);
      return newIntervalId;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', () => {
      clearInterval(intervalId);
      const newIntervalId = setInterval(autoScroll, scrollDelay);
    });

    return () => {
      clearInterval(intervalId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#C8A882]/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#C8A882]" />
            <span className="font-sans text-sm text-[#C8A882] font-medium">Our Expertise</span>
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-[#0F0F0F]">Curated Wellness</span>
            <br />
            <span className="text-[#C8A882]">Journeys</span>
          </h2>
          
          <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our world of exclusive services, each designed to deliver profound results and a sense of deep tranquility.
          </p>
        </motion.div>

        {/* Auto-Scrolling Categories */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable Container */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 cursor-pointer"
            style={{ 
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {/* Duplicate categories for seamless loop */}
            {[...categories, ...categories].map((category, index) => (
              <Link 
                key={`${category.id}-${index}`} 
                to={createPageUrl(`Services?category=${category.key}`)} 
                className="flex-shrink-0 w-80 group cursor-pointer"
              >
                <motion.div
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: (index % categories.length) * 0.1,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <div className={`${category.bgColor} rounded-3xl p-6 h-full flex flex-col hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 min-h-[280px]`}>
                    {/* Icon */}
                    <div className="mb-6 text-[#8B6F3F] group-hover:text-[#C8A882] transition-colors duration-300">
                      {category.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-serif text-2xl font-bold text-[#0F0F0F] mb-4 group-hover:text-[#C8A882] transition-colors duration-300 leading-tight">
                      {category.title}
                    </h3>
                    
                    <p className="font-sans text-gray-500 leading-relaxed mb-6 flex-grow">
                      {category.description}
                    </p>
                    
                    {/* Read More Button */}
                    <div className="flex items-center gap-2 font-sans text-sm font-medium text-gray-500 hover:text-[#C8A882] transition-colors duration-300 group mt-auto">
                      DISCOVER THE EXPERIENCE
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Manual Navigation Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="font-sans text-sm text-gray-400">
            Hover to pause • Auto-scrolling categories
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
