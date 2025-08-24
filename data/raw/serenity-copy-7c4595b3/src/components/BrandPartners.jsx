
import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Hugo Boss', url: 'https://cdn.worldvectorlogo.com/logos/hugo-boss-logo.svg' },
  { name: 'Gucci', url: 'https://cdn.worldvectorlogo.com/logos/gucci-logo-1.svg' },
  { name: 'Dolce & Gabbana', url: 'https://cdn.worldvectorlogo.com/logos/dolce-gabbana-1.svg' },
  { name: 'Givenchy', url: 'https://cdn.worldvectorlogo.com/logos/givenchy-1.svg' },
  { name: 'Estée Lauder', url: 'https://cdn.worldvectorlogo.com/logos/estee-lauder-3.svg' },
  { name: 'Shiseido', url: 'https://cdn.worldvectorlogo.com/logos/shiseido.svg' },
  { name: 'Dior', url: 'https://cdn.worldvectorlogo.com/logos/dior-2.svg' },
  { name: 'Guerlain', url: 'https://cdn.worldvectorlogo.com/logos/guerlain.svg' },
  { name: 'Biotherm', url: 'https://cdn.worldvectorlogo.com/logos/biotherm.svg' },
  { name: 'L\'Oréal Professionnel', url: 'https://cdn.worldvectorlogo.com/logos/l-oreal-professionnel.svg' },
  { name: 'Goldwell', url: 'https://cdn.worldvectorlogo.com/logos/goldwell.svg' },
  { name: 'Kérastase', url: 'https://cdn.worldvectorlogo.com/logos/kerastase.svg' },
  { name: 'Lancôme', url: 'https://cdn.worldvectorlogo.com/logos/lancome-2.svg' },
  { name: 'Chanel', url: 'https://cdn.worldvectorlogo.com/logos/chanel-2.svg' },
  { name: 'Giorgio Armani', url: 'https://cdn.worldvectorlogo.com/logos/giorgio-armani-1.svg' },
];

export default function BrandPartners() {
  const extendedBrands = [...brands, ...brands];

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      viewport={{ once: true }}
      className="py-12 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h3 className="text-sm font-sans font-bold uppercase tracking-widest text-gray-500 mb-12">
          Featuring Products From The World's Finest Brands
        </h3>
        <div className="relative w-full overflow-hidden group">
          <style jsx>{`
            .marquee-container {
              display: flex;
              width: fit-content;
              animation: marquee 120s linear infinite;
            }
            .group:hover .marquee-container {
              animation-play-state: paused;
            }
            @keyframes marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            
            /* Mobile optimization - show 3 logos at a time */
            @media (max-width: 768px) {
              .logo-item {
                width: calc(100vw / 3 - 2rem);
                min-width: calc(100vw / 3 - 2rem);
                margin: 0 1rem;
              }
            }
          `}</style>
          <div className="marquee-container">
            {extendedBrands.map((brand, index) => (
              <div 
                key={index} 
                className="logo-item flex-shrink-0 w-48 mx-8 lg:mx-12 flex items-center justify-center h-24"
              >
                <img
                  src={brand.url}
                  alt={`${brand.name} logo - Premium beauty products at SERENITY Spa Kolkata`}
                  className="h-14 w-auto object-contain filter grayscale opacity-70 transition-all duration-300 ease-in-out hover:grayscale-0 hover:opacity-100 hover:scale-110"
                  style={{ 
                    imageRendering: 'crisp-edges',
                    maxHeight: '56px',
                    height: '56px'
                  }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
