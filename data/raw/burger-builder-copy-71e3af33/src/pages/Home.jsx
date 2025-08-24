import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import MainMenu from '../components/home/MainMenu';
import Instructions from '../components/home/Instructions';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleStartGame = () => {
    navigate(createPageUrl('Game'));
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {showInstructions ? (
          <Instructions key="instructions" onBack={() => setShowInstructions(false)} />
        ) : (
          <MainMenu 
            key="menu" 
            onStartGame={handleStartGame}
            onViewInstructions={() => setShowInstructions(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}