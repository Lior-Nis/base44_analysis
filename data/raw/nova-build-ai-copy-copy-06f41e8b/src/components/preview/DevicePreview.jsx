import React from "react";

export default function DevicePreview({ htmlContent, device }) {
  if (!htmlContent) {
    return (
      <div className="h-[600px] bg-gray-100 rounded-b-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No preview available</p>
          <p className="text-sm">Generate your website to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 rounded-b-lg">
      <div 
        className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ 
          width: device.width,
          maxWidth: "100%",
          minHeight: "600px"
        }}
      >
        <div className="bg-gray-200 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600 ml-4">
            yourwebsite.com
          </div>
        </div>
        <iframe
          srcDoc={htmlContent}
          className="w-full h-[600px] border-0"
          title="Website Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}