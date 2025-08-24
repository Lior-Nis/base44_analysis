import React, { useEffect, useRef } from 'react';
import { createPageUrl } from '@/utils';

export default function SimpleMap({ 
  restaurants = [], 
  selectedLocation = null, 
  onRestaurantSelect = () => {},
  height = "300px",
  showControls = true 
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

        const center = restaurants.length === 1 
          ? [restaurants[0].latitude || 4.1755, restaurants[0].longitude || 73.5093]
          : [4.1755, 73.5093]; // Maldives center

        // Initialize map
        mapInstance.current = window.L.map(mapRef.current, {
          center: center,
          zoom: restaurants.length === 1 ? 14 : 7,
          zoomControl: showControls,
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
        const lat = restaurant.latitude || 4.1755;
        const lng = restaurant.longitude || 73.5093;
        
        // Create custom icon
        const iconHtml = `
          <div style="
            width: 24px; 
            height: 24px; 
            background-color: ${restaurant.featured ? '#fbbf24' : '#f97316'}; 
            border: 2px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `;

        const customIcon = window.L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        });

        // Create marker
        const marker = window.L.marker([lat, lng], { icon: customIcon });
        
        // Create popup content
        const popupContent = `
          <div style="min-width: 180px; max-width: 250px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <h3 style="margin: 0; font-weight: bold; font-size: 14px;">${restaurant.name}</h3>
              ${restaurant.featured ? '<span style="background: #fef3c7; color: #92400e; padding: 1px 4px; border-radius: 3px; font-size: 9px;">Featured</span>' : ''}
            </div>
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #6b7280; line-height: 1.3;">
              ${restaurant.description ? restaurant.description.substring(0, 80) + '...' : 'Delicious local and international cuisine'}
            </p>
            ${restaurant.cuisine_type ? `<p style="margin: 0 0 6px 0; font-size: 12px; color: #ea580c; font-weight: 500;">${restaurant.cuisine_type}</p>` : ''}
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 2px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style="font-weight: 500;">${restaurant.average_rating > 0 ? restaurant.average_rating.toFixed(1) : 'New'}</span>
              </div>
              <span style="color: #d1d5db;">•</span>
              <span style="color: #6b7280;">${restaurant.location_name || 'Maldives'}</span>
            </div>
            <a href="${createPageUrl(`Restaurant?id=${restaurant.id}`)}" 
               style="display: inline-block; width: 100%; text-align: center; padding: 6px 12px; background: linear-gradient(to right, #ea580c, #eab308); color: white; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 12px;">
              View Restaurant
            </a>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 250,
          className: 'custom-popup'
        });

        marker.on('click', () => {
          onRestaurantSelect(restaurant);
        });

        marker.addTo(mapInstance.current);
        markersRef.current.push(marker);
        bounds.push([lat, lng]);
      });

      // Fit map to show all markers
      if (bounds.length > 1) {
        mapInstance.current.fitBounds(bounds, { padding: [10, 10] });
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style="margin-bottom: 8px;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <p style="margin: 0; font-size: 14px; font-weight: 500;">Restaurant Location</p>
            <p style="margin: 2px 0 0 0; font-size: 12px;">Maldives Islands</p>
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
  }, [restaurants, selectedLocation, onRestaurantSelect, showControls]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    />
  );
}