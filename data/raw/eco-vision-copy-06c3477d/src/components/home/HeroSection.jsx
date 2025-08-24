import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { SiteContent } from "@/api/entities";

export default function HeroSection() {
  const [currentHookWordIndex, setCurrentHookWordIndex] = useState(0);
  const [content, setContent] = useState({
    title: "Green Future For America",
    hook_words: "Cleaner,Brighter,Smarter,Greener,Sustainable",
    description: "We're committed to accelerating the transition to renewable energy, protecting our environment, and creating a sustainable future for generations to come.",
    button_text: "Join Our Mission",
    secondary_button_text: "Learn More",
    image_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
    background_video_url: "",
    video_poster_url: ""
  });

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const heroData = await SiteContent.filter({ section: "hero", key: "hero" });
        if (heroData.length > 0) {
          setContent(prev => ({...prev, ...heroData[0]}));
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
      }
    };
    fetchHeroContent();
  }, []);
  
  const hookWordsArray = content.hook_words ? content.hook_words.split(',').map(s => s.trim()) : ["Cleaner"];

  useEffect(() => {
    if (hookWordsArray.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentHookWordIndex((prevIndex) => (prevIndex + 1) % hookWordsArray.length);
      }, 2500);
      return () => clearInterval(intervalId);
    }
  }, [hookWordsArray]);

  const posterImage = content.video_poster_url || content.image_url;

  return (
    <header className="relative min-h-screen flex flex-col pt-20">
      <div className="flex-grow flex items-center justify-center">
        {content.background_video_url ? (
          <video
            autoPlay
            loop
            muted
            playsInline // Important for iOS
            poster={posterImage}
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src={content.background_video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{ 
              backgroundImage: `url('${content.image_url}')`,
              backgroundAttachment: "fixed" // Consider if this is desired with video too
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/70 to-green-800/70 backdrop-blur-sm z-0" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto md:mx-0"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <AnimatePresence mode="wait">
                <motion.span
                  key={hookWordsArray[currentHookWordIndex]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block text-green-300"
                >
                  {hookWordsArray[currentHookWordIndex]}
                </motion.span>
              </AnimatePresence>
              <br className="hidden md:block" />
              <span className="block md:inline">{content.title.replace(hookWordsArray[0] || "Placeholder", "").trim()}</span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl leading-relaxed mx-auto md:mx-0">
              {content.description}
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                className="bg-white/90 hover:bg-white text-green-900 text-lg px-8 py-4 
                          transition-all duration-300 ease-out transform hover:translate-y-[-2px]"
              >
                {content.button_text}
              </Button>
              <Button 
                variant="ghost" 
                className="text-white hover:text-green-300 text-lg px-8 py-4 
                          transition-colors duration-300"
              >
                {content.secondary_button_text}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce"
      >
        <ArrowDown className="h-8 w-8 text-white/80" />
      </motion.div>
    </header>
  );
}