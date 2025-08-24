import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ siteConfig }) {
  if (!siteConfig) {
    return (
        <div className="w-full h-[80vh] bg-gray-200 animate-pulse flex items-center justify-center">
            <p className="text-gray-500">Carregando...</p>
        </div>
    );
  }

  const defaultHeroImage = "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80";

  return (
    <div
      className="relative bg-cover bg-center text-white flex items-center justify-center min-h-[80vh] w-full"
      style={{ backgroundImage: `url(${siteConfig.hero_background || defaultHeroImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center p-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          {siteConfig.hero_title || 'Saboreie a Tradição em Cada Mordida'}
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 drop-shadow-md">
          {siteConfig.hero_subtitle || 'Descubra o sabor autêntico dos nossos doces artesanais, preparados com ingredientes frescos e receitas tradicionais que encantam paladares.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-6 px-8">
            <Link to={createPageUrl('Menu')}>
              Ver Cardápio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black font-bold text-lg py-6 px-8">
            <Link to={createPageUrl('CustomOrders')}>Fazer Encomenda</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}