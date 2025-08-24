import React, { useEffect, useRef } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function InteractiveMap({ 
  restaurants = [], 
  height = "400px", 
  initialCenter = [4.1755, 73.5093], // Maldives coordinates
  initialZoom = 7 
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        cssLink.crossOrigin = '';
        document.head.appendChild(cssLink);
      }

      // Load Leaflet JS
      if (!window.L) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
    };

    const initializeMap = async () => {
      try {
        await loadLeaflet();
        
        if (!mapRef.current || mapInstance.current) return;

        // Initialize map
        mapInstance.current = window.L.map(mapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: true,
          scrollWheelZoom: true
        });

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Add restaurant markers
        addRestaurantMarkers();

      } catch (error) {
        console.error('Error loading Leaflet:', error);
        // Fallback to simple map if Leaflet fails
        renderFallbackMap();
      }
    };

    const addRestaurantMarkers = () => {
      if (!mapInstance.current || !restaurants.length) return;

      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstance.current.removeLayer(marker);
      });
      markersRef.current = [];

      const bounds = [];

      restaurants.forEach((restaurant) => {
        const lat = restaurant.latitude || initialCenter[0];
        const lng = restaurant.longitude || initialCenter[1];
        
        // Create custom icon
        const iconHtml = `
          <div style="
            width: 30px; 
            height: 30px; 
            background-color: ${restaurant.featured ? '#fbbf24' : '#ef4444'}; 
            border: 3px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `;

        const customIcon = window.L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15]
        });

        // Create marker
        const marker = window.L.marker([lat, lng], { icon: customIcon });
        
        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; max-width: 300px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <h3 style="margin: 0; font-weight: bold; font-size: 16px;">${restaurant.name}</h3>
              ${restaurant.featured ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px;">Featured</span>' : ''}
            </div>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; line-height: 1.4;">
              ${restaurant.description || 'Delicious local and international cuisine'}
            </p>
            ${restaurant.cuisine_type ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #ea580c; font-weight: 500;">${restaurant.cuisine_type}</p>` : ''}
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style="font-weight: 500;">${restaurant.average_rating > 0 ? restaurant.average_rating.toFixed(1) : 'New'}</span>
              </div>
              <span style="color: #d1d5db;">•</span>
              <span style="color: #6b7280;">${restaurant.location_name || 'Maldives'}</span>
            </div>
            <a href="${createPageUrl(`Restaurant?id=${restaurant.id}`)}" 
               style="display: inline-block; width: 100%; text-align: center; padding: 8px 16px; background: linear-gradient(to right, #ea580c, #eab308); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
              View Restaurant
            </a>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        marker.addTo(mapInstance.current);
        markersRef.current.push(marker);
        bounds.push([lat, lng]);
      });

      // Fit map to show all markers
      if (bounds.length > 1) {
        mapInstance.current.fitBounds(bounds, { padding: [20, 20] });
      } else if (bounds.length === 1) {
        mapInstance.current.setView(bounds[0], 14);
      }
    };

    const renderFallbackMap = () => {
      if (!mapRef.current) return;
      
      mapRef.current.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%);
          display: flex; 
          align-items: center; 
          justify-content: center;
          border-radius: 12px;
        ">
          <div style="text-align: center; color: #6b7280;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="margin-bottom: 12px;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <p style="margin: 0; font-weight: 500;">Map Loading...</p>
            <p style="margin: 4px 0 0 0; font-size: 14px;">${restaurants.length} restaurant${restaurants.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>
      `;
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [restaurants, initialCenter, initialZoom]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}
    />
  );
}