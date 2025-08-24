
import React from "react";

export default function Layout({ children }) {
  return (
    <>
      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1a1a1a;
          line-height: 1.5;
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .duration-slow {
          animation-duration: 2s;
        }
      `}</style>
      {children}
    </>
  );
}
