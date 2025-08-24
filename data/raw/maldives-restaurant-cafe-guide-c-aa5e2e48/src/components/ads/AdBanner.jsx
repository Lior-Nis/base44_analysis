import React, { useState, useEffect } from 'react';
import { Advertisement } from '@/api/entities';
import { Link } from 'react-router-dom';

export default function AdBanner({ placement, className = "", format = "banner" }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadAd();
  }, [placement]);

  const loadAd = async () => {
    if (!placement) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      
      const ads = await Advertisement.filter({ 
        placement, 
        active: true,
        status: 'approved'
      }, '-priority');
      
      if (ads && ads.length > 0) {
        // Select ad based on priority and rotation
        const validAds = ads.filter(ad => {
          const now = new Date();
          const startDate = ad.start_date ? new Date(ad.start_date) : null;
          const endDate = ad.end_date ? new Date(ad.end_date) : null;
          
          if (startDate && now < startDate) return false;
          if (endDate && now > endDate) return false;
          return true;
        });
        
        if (validAds.length > 0) {
          // Simple rotation - could be enhanced with weighted selection
          const selectedAd = validAds[Math.floor(Math.random() * validAds.length)];
          setAd(selectedAd);
          
          // REMOVED: No impression tracking to avoid database write issues
        }
      }
    } catch (error) {
      console.error('Error loading ads:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = async () => {
    if (!ad) return;

    // REMOVED: No click tracking to avoid database write issues
    
    // Navigate to ad link if provided
    if (ad.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Don't render anything if loading, error, or no ad
  if (loading || error || !ad) {
    return null;
  }

  // Render different formats based on the format prop
  if (format === "banner") {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        <div 
          className="cursor-pointer transition-opacity hover:opacity-90"
          onClick={handleAdClick}
        >
          <img
            src={ad.image_url}
            alt={ad.title || "Advertisement"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {ad.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white font-semibold">{ad.title}</h3>
              {ad.description && (
                <p className="text-white/90 text-sm">{ad.description}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Sponsored label */}
        <div className="absolute top-2 right-2">
          <span className="bg-black/60 text-white px-2 py-1 rounded text-xs">
            Sponsored
          </span>
        </div>
      </div>
    );
  }

  if (format === "card") {
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
        <div 
          className="cursor-pointer"
          onClick={handleAdClick}
        >
          <img
            src={ad.image_url}
            alt={ad.title || "Advertisement"}
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{ad.title}</h3>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                Sponsored
              </span>
            </div>
            {ad.description && (
              <p className="text-gray-600 text-sm">{ad.description}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (format === "text") {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div 
          className="cursor-pointer"
          onClick={handleAdClick}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900">{ad.title}</h3>
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
              Sponsored
            </span>
          </div>
          {ad.description && (
            <p className="text-blue-700 text-sm">{ad.description}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}