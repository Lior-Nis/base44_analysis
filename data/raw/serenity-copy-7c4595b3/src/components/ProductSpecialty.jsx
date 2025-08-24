
import React from 'react';
import { motion } from 'framer-motion';
import { PawPrint, FlaskConical, Leaf, Beaker, ShieldOff, Droplets, WineOff } from 'lucide-react';

const specialtyItems = [
  { icon: PawPrint, text: "Cruelty Free" },
  { icon: FlaskConical, text: "Sulfate Free" },
  { icon: Leaf, text: "Organic" },
  { icon: Beaker, text: "Lab Tested" },
  { icon: ShieldOff, text: "No SLS" },
  { icon: Droplets, text: "No Silicon" },
  { icon: WineOff, text: "No Alcohol" }
];

const LeafDecoration = () => (
    <motion.svg 
      initial={{ opacity: 0, rotate: -180, scale: 0 }}
      whileInView={{ opacity: 0.3, rotate: 0, scale: 1 }}
      transition={{ duration: 2, ease: "easeOut" }}
      viewport={{ once: true }}
      width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C8A882] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
        <path d="M10 20C20 10 35 15 50 20C65 25 80 10 90 20" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M15 25C25 15 40 20 50 25C60 30 75 15 85 25" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7"/>
    </motion.svg>
);

export default function ProductSpecialty() {
  const extendedSpecialties = [...specialtyItems, ...specialtyItems, ...specialtyItems, ...specialtyItems];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 100 }}
      viewport={{ once: true }}
      className="py-16 md:py-20 overflow-hidden relative"
    >
      <style jsx>{`
        .marquee-container {
          display: flex;
          width: fit-content;
          animation: marquee 60s linear infinite;
        }

        .marquee-item {
          flex-shrink: 0;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .group:hover .marquee-container {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="text-center mb-16 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl font-bold leading-tight"
          >
              <span className="text-[#0F0F0F]">Purely Potent, Naturally</span>
              <br />
              <span className="text-[#C8A882]">Our Organic Product Philosophy</span>
          </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="font-sans text-lg text-gray-600 mt-6 max-w-3xl mx-auto leading-relaxed"
        >
          At SERENITY, we exclusively use lab-tested, cruelty-free, and certified organic products for our spa treatments in Kolkata. Our commitment to sulfate-free, paraben-free, and alcohol-free formulations ensures your skin receives only the purest ingredients for a truly radiant, healthy glow.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative group"
      >
        <div className="flex overflow-hidden">
            <div className="marquee-container">
                {extendedSpecialties.map((item, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 50, rotateY: 90 }}
                      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: (index % specialtyItems.length) * 0.1,
                        ease: "easeOut"
                      }}
                      viewport={{ once: true }}
                      whileHover={{ 
                        scale: 1.1, 
                        y: -10,
                        rotateZ: 5,
                        transition: { duration: 0.3 }
                      }}
                      className="marquee-item flex flex-col items-center justify-center mx-8 text-center w-32"
                    >
                        <motion.div 
                          whileHover={{ 
                            rotate: 360,
                            scale: 1.2,
                            boxShadow: "0 15px 30px rgba(200, 168, 130, 0.3)"
                          }}
                          transition={{ duration: 0.5 }}
                          className="w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 border-2 border-transparent hover:border-[#C8A882]/30"
                        >
                            <item.icon className="w-8 h-8 text-gray-500 transition-colors duration-300 group-hover:text-[#C8A882]" />
                        </motion.div>
                        <motion.p 
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: (index % specialtyItems.length) * 0.1 + 0.3 }}
                          viewport={{ once: true }}
                          className="font-sans text-sm text-gray-700 font-medium transition-colors duration-300 group-hover:text-[#0F0F0F]"
                        >
                            {item.text}
                        </motion.p>
                    </motion.div>
                ))}
            </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
