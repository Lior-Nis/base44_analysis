import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function DevicePreview({ htmlContent, theme }) {
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!htmlContent) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Preview Available</h3>
          <p className="text-gray-500">Generate your website to see the preview</p>
        </div>
      </div>
    );
  }

  const devices = [
    { id: "desktop", icon: Monitor, width: "100%", label: "Desktop" },
    { id: "tablet", icon: Tablet, width: "768px", label: "Tablet" },
    { id: "mobile", icon: Smartphone, width: "375px", label: "Mobile" },
  ];

  const currentDevice = devices.find(d => d.id === activeDevice);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Inject theme styles
  const themeStyles = theme ? `
    <style>
      :root {
        --theme-primary: ${theme.primary_color || '#3b82f6'};
        --theme-secondary: ${theme.secondary_color || '#6366f1'};
        --theme-accent: ${theme.accent_color || '#8b5cf6'};
      }
      body {
        font-family: ${theme.font_family || 'sans-serif'} !important;
      }
    </style>
  ` : '';
  
  const fullHtml = `
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${themeStyles}
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Device Controls */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {devices.map(device => (
              <Button
                key={device.id}
                variant={activeDevice === device.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveDevice(device.id)}
                className={`flex items-center gap-2 ${
                  activeDevice === device.id 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <device.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{device.label}</span>
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-gray-600 hover:bg-gray-100"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <motion.div
          key={activeDevice}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200"
          style={{ 
            width: currentDevice.width,
            maxWidth: "100%",
            minHeight: "600px"
          }}
        >
          {/* Browser Chrome */}
          <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600 ml-4 font-mono">
              https://yourwebsite.com
            </div>
          </div>

          {/* Website Content */}
          <iframe
            key={isRefreshing ? 'refreshing' : 'normal'}
            srcDoc={fullHtml}
            className="w-full border-0"
            style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}
            title="Website Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </motion.div>
      </div>
    </div>
  );
}