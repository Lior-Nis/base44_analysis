import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // This script tag will be added to the document to load and run the globe logic.
    const globeScript = document.createElement('script');
    globeScript.type = 'module';
    // We use textContent to inject the exact script from the original HTML.
    globeScript.textContent = `
      import createGlobe from 'https://cdn.skypack.dev/cobe';

      let phi = 0;
      let canvas = document.getElementById("cobe");

      // Check if canvas exists and hasn't been initialized yet to prevent duplicates on hot-reloads
      if (canvas && !canvas.getAttribute('data-globe-initialized')) {
        canvas.setAttribute('data-globe-initialized', 'true');
        
        const globe = createGlobe(canvas, {
          devicePixelRatio: 2,
          width: 1000,
          height: 1000,
          phi: 0,
          theta: 0,
          dark: ${isDarkMode ? 1 : 0},
          diffuse: 1.2,
          scale: 1,
          mapSamples: 16000,
          mapBrightness: 6,
          baseColor: ${isDarkMode ? '[0.3, 0.3, 0.9]' : '[0.8, 0.7, 0.9]'},
          markerColor: ${isDarkMode ? '[0.9, 0.5, 1]' : '[0.7, 0.3, 0.9]'},
          glowColor: ${isDarkMode ? '[0.2, 0.2, 1]' : '[0.8, 0.6, 0.9]'},
          offset: [0, 0],
          markers: [
            { location: [37.7595, -122.4367], size: 0.03 },
            { location: [40.7128, -74.006], size: 0.1 },
            { location: [51.5074, -0.1278], size: 0.05 },
            { location: [35.6762, 139.6503], size: 0.05 },
            { location: [22.3193, 114.1694], size: 0.03 },
            { location: [-33.8688, 151.2093], size: 0.03 },
          ],
          onRender: (state) => {
            state.phi = phi;
            phi += 0.005;
          },
        });
      }
    `;
    
    document.body.appendChild(globeScript);

    // Cleanup function to remove the script when the component is unmounted.
    return () => {
      // It's tricky to remove module scripts reliably, but we can try.
      const scripts = document.querySelectorAll('script[type="module"]');
      scripts.forEach(s => {
        if (s.textContent.includes('createGlobe')) {
          s.remove();
        }
      });
      const canvas = document.getElementById("cobe");
      if (canvas) {
        canvas.removeAttribute('data-globe-initialized');
      }
    };
  }, [isDarkMode]); // Re-run effect when theme changes

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (isDarkMode) {
    return (
      <div className="bg-black text-white font-light">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
              </svg>
              <span className="ml-3 text-xl tracking-tight">Orbital</span>
            </div>
            <div className="hidden md:flex space-x-10 text-sm text-gray-300">
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Solutions</a>
              <a href="#" className="hover:text-white transition-colors">Resources</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-white/5 transition-all"
                title="Switch to light mode"
              >
                <Sun className="h-5 w-5 text-gray-300" />
              </button>
              <button className="text-sm border border-gray-700 rounded-md px-4 py-2 hover:bg-white/5 transition-all">
                Sign in
              </button>
            </div>
          </div>
        </nav>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>

        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-black z-0"></div>
          
          {/* Hero content */}
          <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              {/* Text content */}
              <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter mb-6 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Connect</span> your world with precision
                </h1>
                <p className="text-gray-300 text-xl md:text-2xl mb-8 max-w-lg font-extralight tracking-wide">
                  Build, track, and manage your projects with a seamless platform designed for modern teams.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-white text-black font-light rounded-md px-6 py-3 hover:bg-opacity-90 transition-all">
                    Get started
                  </button>
                  <button className="bg-transparent border border-gray-700 rounded-md px-6 py-3 hover:bg-white/5 transition-all">
                    View demo
                  </button>
                </div>
              </div>
              
              {/* Globe visualization */}
              <div className="md:w-1/2 relative">
                <div className="relative h-[500px] w-[500px] mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                  <canvas
                    id="cobe"
                    style={{ width: '500px', height: '500px' }}
                    width="1000"
                    height="1000"
                    className="relative z-10"
                  ></canvas>
                </div>
              </div>
            </div>
            
            <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-16"></div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-4xl font-light mb-1 tracking-tight">93%</p>
                <p className="text-gray-400 font-extralight">Faster workflow</p>
              </div>
              <div>
                <p className="text-4xl font-light mb-1 tracking-tight">10k+</p>
                <p className="text-gray-400 font-extralight">Global users</p>
              </div>
              <div>
                <p className="text-4xl font-light mb-1 tracking-tight">24/7</p>
                <p className="text-gray-400 font-extralight">Support available</p>
              </div>
              <div>
                <p className="text-4xl font-light mb-1 tracking-tight">99.9%</p>
                <p className="text-gray-400 font-extralight">Uptime guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Light mode
  return (
    <div className="bg-white text-gray-800 font-light">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
            </svg>
            <span className="ml-3 text-xl tracking-tight">Aura</span>
          </div>
          <div className="hidden md:flex space-x-10 text-sm text-gray-600">
            <a href="#" className="hover:text-purple-600 transition-colors">Features</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Solutions</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Resources</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-purple-50 transition-all"
              title="Switch to dark mode"
            >
              <Moon className="h-5 w-5 text-gray-600" />
            </button>
            <button className="text-sm border border-gray-300 rounded-md px-4 py-2 hover:bg-purple-50 transition-all">
              Sign in
            </button>
          </div>
        </div>
      </nav>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-white to-white z-0"></div>
        
        {/* Hero content */}
        <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            {/* Text content */}
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter mb-6 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">Connect</span> your world with precision
              </h1>
              <p className="text-gray-600 text-xl md:text-2xl mb-8 max-w-lg font-extralight tracking-wide">
                Build, track, and manage your projects with a seamless platform designed for modern teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-purple-600 text-white font-light rounded-md px-6 py-3 hover:bg-purple-700 transition-all">
                  Get started
                </button>
                <button className="bg-transparent border border-gray-300 text-gray-700 rounded-md px-6 py-3 hover:bg-purple-50 transition-all">
                  View demo
                </button>
              </div>
            </div>
            
            {/* Globe visualization */}
            <div className="md:w-1/2 relative">
              <div className="relative h-[500px] w-[500px] mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
                <canvas
                  id="cobe"
                  style={{ width: '500px', height: '500px' }}
                  width="1000"
                  height="1000"
                  className="relative z-10"
                ></canvas>
              </div>
            </div>
          </div>
          
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-16"></div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-4xl font-light mb-1 tracking-tight text-gray-800">93%</p>
              <p className="text-gray-500 font-extralight">Faster workflow</p>
            </div>
            <div>
              <p className="text-4xl font-light mb-1 tracking-tight text-gray-800">10k+</p>
              <p className="text-gray-500 font-extralight">Global users</p>
            </div>
            <div>
              <p className="text-4xl font-light mb-1 tracking-tight text-gray-800">24/7</p>
              <p className="text-gray-500 font-extralight">Support available</p>
            </div>
            <div>
              <p className="text-4xl font-light mb-1 tracking-tight text-gray-800">99.9%</p>
              <p className="text-gray-500 font-extralight">Uptime guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}