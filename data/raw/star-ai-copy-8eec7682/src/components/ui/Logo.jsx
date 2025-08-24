import React from 'react';
import { Star, Sparkles } from 'lucide-react';

export default function Logo({ size = 'default' }) {
  const sizes = {
    small: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      sparkle: 'w-2 h-2',
      text: 'text-lg'
    },
    default: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      sparkle: 'w-3 h-3',
      text: 'text-xl'
    },
    large: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10',
      sparkle: 'w-4 h-4',
      text: 'text-4xl'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`${currentSize.container} bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
          
          <Star className={`${currentSize.icon} text-yellow-300 fill-yellow-300 relative z-10 drop-shadow-lg`} />
          
          <Sparkles className={`${currentSize.sparkle} text-white/80 absolute -top-1 -right-1 animate-bounce`} style={{ animationDelay: '0.5s' }} />
          <Sparkles className={`${currentSize.sparkle} text-white/60 absolute -bottom-1 -left-1 animate-bounce`} style={{ animationDelay: '1s' }} />
        </div>
        
        <div className={`absolute inset-0 ${currentSize.container} rounded-2xl bg-gradient-to-br from-blue-700/30 to-sky-500/30 animate-ping`}></div>
      </div>
      
      <div className="flex flex-col">
        <span className="font-bold bg-gradient-to-r from-slate-800 via-blue-900 to-blue-800 bg-clip-text text-transparent text-4xl tracking-wider">Star AI

        </span>
        {size === 'large' &&
        <span className="text-sm text-slate-600 font-medium tracking-wide">
            ✨ For Lawyers & Business
          </span>
        }
      </div>
    </div>);

}