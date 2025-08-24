import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Maximize, Target, Crosshair } from "lucide-react";

export default function ROIViewer({ imageUrl, roiCoordinates, anatomicalRegion }) {
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const parsedRoi = roiCoordinates ? JSON.parse(roiCoordinates) : null;

  useEffect(() => {
    setIsLoading(true);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      console.error("Failed to load image for ROI viewer.");
    };
  }, [imageUrl]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getScale = () => {
    if (!imgDimensions.width || !containerSize.width) return 1;
    
    const scaleX = containerSize.width / imgDimensions.width;
    const scaleY = containerSize.height / imgDimensions.height;
    return Math.min(scaleX, scaleY);
  };

  const scale = getScale();

  const getROIDescription = () => {
    switch (anatomicalRegion) {
      case 'wrist_radius':
        return 'Distal radius metaphyseal trabecular region';
      case 'proximal_femur':
        return 'Femoral neck trabecular pattern (Singh Index region)';
      case 'calcaneus':
        return 'Central calcaneal trabecular architecture';
      case 'clavicle':
        return 'Mid-shaft clavicular cortical measurement site';
      default:
        return 'Selected region of interest';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Region of Interest Analysis
        </CardTitle>
        <p className="text-sm text-slate-600">{getROIDescription()}</p>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="aspect-square w-full bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden relative"
          style={{ minHeight: '300px' }}
        >
          {isLoading && <Skeleton className="w-full h-full" />}
          {!isLoading && imageUrl && (
            <>
              <img 
                ref={imgRef}
                src={imageUrl} 
                alt={`X-ray of ${anatomicalRegion}`}
                className="w-full h-full object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
              {parsedRoi && imgDimensions.width > 0 && scale > 0 && (
                <>
                  {/* Main ROI Box */}
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/10 box-border pointer-events-none"
                    style={{
                      left: `${parsedRoi.x * scale}px`,
                      top: `${parsedRoi.y * scale}px`,
                      width: `${parsedRoi.width * scale}px`,
                      height: `${parsedRoi.height * scale}px`,
                    }}
                  >
                    {/* ROI Label */}
                    <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-sm font-semibold">
                      ROI
                    </div>
                    
                    {/* Center crosshair */}
                    <div 
                      className="absolute w-3 h-3 border border-red-600 bg-red-500 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                  
                  {/* Corner markers */}
                  {[
                    { x: parsedRoi.x, y: parsedRoi.y },
                    { x: parsedRoi.x + parsedRoi.width, y: parsedRoi.y },
                    { x: parsedRoi.x, y: parsedRoi.y + parsedRoi.height },
                    { x: parsedRoi.x + parsedRoi.width, y: parsedRoi.y + parsedRoi.height }
                  ].map((corner, idx) => (
                    <div
                      key={idx}
                      className="absolute w-2 h-2 bg-red-600 border border-white rounded-sm"
                      style={{
                        left: `${corner.x * scale - 4}px`,
                        top: `${corner.y * scale - 4}px`,
                      }}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
        
        {/* ROI Information */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Crosshair className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-slate-900 text-sm">ROI Specifications</span>
          </div>
          {parsedRoi && (
            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Position:</strong> ({parsedRoi.x}, {parsedRoi.y})</p>
              <p><strong>Dimensions:</strong> {parsedRoi.width} × {parsedRoi.height} pixels</p>
              <p><strong>Area:</strong> {(parsedRoi.width * parsedRoi.height).toLocaleString()} pixels²</p>
              {parsedRoi.anatomical_location && (
                <p><strong>Location:</strong> {parsedRoi.anatomical_location}</p>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={() => window.open(imageUrl, '_blank')}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
          disabled={!imageUrl}
        >
          <Maximize className="w-4 h-4" />
          View Full Size Image
        </button>
      </CardContent>
    </Card>
  );
}