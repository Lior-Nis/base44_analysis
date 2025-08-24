
import React from "react";

export default function Layout({ children }) {
  return (
    <div dir="ltr" className="min-h-screen font-sans flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Remove scrollbar for webkit browsers */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Remove scrollbar for IE, Edge, and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        /* Prevent unwanted touch behavior on mobile */
        * {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        /* Disable double-tap-to-zoom */
        body {
          touch-action: manipulation;
          -webkit-text-size-adjust: none;
          overscroll-behavior: contain;
        }
      `}</style>
      {children}
    </div>
  );
}
