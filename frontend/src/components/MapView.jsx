import React, { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const MapView = ({ hospitals, userLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  
  // Initialize map when component mounts
  useEffect(() => {
    // Check if we're in a browser environment and if the Google Maps API is available
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      initializeMap();
    } else {
      // Load Google Maps API script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
      
      return () => {
        // Clean up script on unmount
        document.head.removeChild(script);
      };
    }
  }, []);
  
  // Update markers when hospitals or user location changes
  useEffect(() => {
    if (mapLoaded && map && hospitals && hospitals.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      
      // Create new markers for each hospital
      const newMarkers = hospitals.map((hospital, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: hospital.location.lat, lng: hospital.location.lng },
          map: map,
          title: hospital.name,
          label: `${index + 1}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#8B0000',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 10
          }
        });
        
        // Add info window for each marker
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; color: #8B0000;">${hospital.name}</h3>
              <p style="margin: 0 0 5px; font-size: 14px;">${hospital.location.address}</p>
              <p style="margin: 0; font-size: 14px;">Available beds: ${hospital.emergencyCapacity.available}</p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}" 
                 target="_blank" style="color: #8B0000; text-decoration: none; font-weight: bold; font-size: 14px;">
                Get directions
              </a>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        return marker;
      });
      
      setMarkers(newMarkers);
      
      // Add user location marker if available
      if (userLocation && userLocation.lat && userLocation.lng) {
        const userMarker = new window.google.maps.Marker({
          position: { lat: userLocation.lat, lng: userLocation.lng },
          map: map,
          title: 'Your Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 10
          }
        });
        
        setMarkers(prevMarkers => [...prevMarkers, userMarker]);
      }
      
      // Fit map to show all markers
      const bounds = new window.google.maps.LatLngBounds();
      
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      
      if (userLocation && userLocation.lat && userLocation.lng) {
        bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
      }
      
      map.fitBounds(bounds);
      
      // If only one marker, zoom out a bit
      if (newMarkers.length === 1 && !userLocation) {
        map.setZoom(15);
      }
    }
  }, [mapLoaded, map, hospitals, userLocation]);
  
  // Initialize the map
  const initializeMap = () => {
    // Default center (will be updated when hospitals are available)
    const center = { lat: 24.8607, lng: 67.0011 }; // Default to Karachi
    
    const mapOptions = {
      center: center,
      zoom: 12,
      styles: [
        {
          featureType: 'poi.medical',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }]
        },
        {
          featureType: 'poi.medical',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#8B0000' }]
        }
      ]
    };
    
    const newMap = new window.google.maps.Map(
      document.getElementById('hospital-map'),
      mapOptions
    );
    
    setMap(newMap);
    setMapLoaded(true);
  };
  
  return (
    <div className="w-full h-80 sm:h-96 md:h-[400px] rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div id="hospital-map" className="w-full h-full"></div>
      
      {!mapLoaded && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <MapPin className="mx-auto text-[#8B0000] mb-2" size={32} />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
