import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageOff, Loader2 } from "lucide-react";

const ImageLoader = ({ 
  src, 
  alt, 
  className = "",
  fallback = null,
  placeholder = null,
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  const [imageState, setImageState] = useState('loading');
  const [imageSrc, setImageSrc] = useState(placeholder);

  useEffect(() => {
    if (!src) {
      setImageState('error');
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setImageState('loaded');
      onLoad();
    };
    
    img.onerror = () => {
      setImageState('error');
      onError();
    };
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  if (imageState === 'error') {
    return fallback || (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <ImageOff className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {imageState === 'loading' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100"
          >
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: imageState === 'loaded' ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        src={imageSrc}
        alt={alt}
        className={className}
        {...props}
      />
    </div>
  );
};

export default ImageLoader;