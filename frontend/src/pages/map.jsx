// src/pages/map.jsx - Enhanced Map Page with Directions
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.js';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { ArrowLeft, Navigation, Phone, MapPin, X } from 'lucide-react';

// Custom icons
const hospitalIcon = new L.Icon({
  iconUrl: '/map.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: null,
});

const userIcon = new L.Icon({
  iconUrl: '/nav.svg',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Basemap configurations
const basemaps = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    icon: '🗺'
  },
  carto: {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
    icon: '🌐'
  },
  cartoDark: {
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
    icon: '🌑'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    icon: '🛰'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>',
    icon: '🏔'
  }
};

// Voice synthesis functions
function speakInstructions(instructions, language = 'en') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(instructions);
    utterance.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

function translateToUrdu(instruction) {
  // Basic translation mapping in a real app, we'll use a proper translation service
  const translations = {
    'Head north': 'شمال کی طرف جائیں',
    'Head south': 'جنوب کی طرف جائیں',
    'Head east': 'مشرق کی طرف جائیں',
    'Head west': 'مغرب کی طرف جائیں',
    'Turn left': 'بائیں مڑیں',
    'Turn right': 'دائیں مڑیں',
    'Continue straight': 'سیدھے جائیں',
    'Arrive at destination': 'منزل پر پہنچ گئے',
    'Turn around': 'واپس مڑیں'
  };
  
  // Simple keyword based translation
  for (const [english, urdu] of Object.entries(translations)) {
    if (instruction.toLowerCase().includes(english.toLowerCase())) {
      return instruction.replace(new RegExp(english, 'gi'), urdu);
    }
  }
  return instruction;
}


function ModernControls({ 
  onLocationClick, 
  selectedBasemap, 
  onBasemapChange, 
  voiceLanguage, 
  onVoiceLanguageChange,
  isVoiceEnabled,
  onToggleVoice,
  onClearRoute,
  hasRoute,
  selectedHospital 
}) {
  const [showBasemaps, setShowBasemaps] = useState(false);
  const [showVoiceControls, setShowVoiceControls] = useState(false);

  return (
    <>
    
      {/* Main Control Panel */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Location Button */}
        <button
          onClick={onLocationClick}
          className="bg-white hover:bg-gray-50 shadow-lg rounded-lg p-3 transition-all duration-200 hover:shadow-xl border border-gray-200 group"
          title="Find My Location"
        >
          <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Basemap Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBasemaps(!showBasemaps)}
            className="bg-white hover:bg-gray-50 shadow-lg rounded-lg p-3 transition-all duration-200 hover:shadow-xl border border-gray-200"
            title="Change Map Style"
          >
            <span className="text-lg">{basemaps[selectedBasemap].icon}</span>
          </button>
          
          {showBasemaps && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[180px]">
              {Object.entries(basemaps).map(([key, basemap]) => (
                <button
                  key={key}
                  onClick={() => {
                    onBasemapChange(key);
                    setShowBasemaps(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                    selectedBasemap === key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{basemap.icon}</span>
                  <span className="font-medium">{basemap.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice Controls */}
        <div className="relative">
          <button
            onClick={() => setShowVoiceControls(!showVoiceControls)}
            className={`shadow-lg rounded-lg p-3 transition-all duration-200 hover:shadow-xl border border-gray-200 ${
              isVoiceEnabled ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
            title="Voice Commands"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>

          {showVoiceControls && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[160px]">
              <div className="p-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-2">Voice Language</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onVoiceLanguageChange('en')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      voiceLanguage === 'en' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => onVoiceLanguageChange('ur')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      voiceLanguage === 'ur' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    اردو
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => {
                  onToggleVoice();
                  setShowVoiceControls(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700"
              >
                {isVoiceEnabled ? '🔇 Disable Voice' : '🔊 Enable Voice'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls  with hospital info */}
      {hasRoute && selectedHospital && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🏥</span>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedHospital.name || 'Healthcare Facility'}
                </p>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {selectedHospital.address || 'Medical facility'}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {selectedHospital.phone && (
                  <span>📞 {selectedHospital.phone}</span>
                )}
                {selectedHospital.type && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {selectedHospital.type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div>
              <p className="text-xs text-green-600 font-medium">Navigation Active</p>
              <p className="text-xs text-gray-500">Route calculated</p>
            </div>
            <button
              onClick={onClearRoute}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Route
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Location control as a custom hook (proper hooks usage)
function useLocationControl(onLocationFound) {
  const map = useMap();
  const [error, setError] = useState(null);
  const locationMarkerRef = useRef(null);

  const handleLocationFound = (e) => {
    const { lat, lng } = e.latlng;
    map.flyTo(e.latlng, 16, { duration: 1.5 });

    if (locationMarkerRef.current) {
      locationMarkerRef.current.setLatLng(e.latlng);
    } else {
      locationMarkerRef.current = L.marker(e.latlng, { icon: userIcon }).addTo(map);
    }
    
    onLocationFound([lat, lng]);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      map.locate({ setView: false, watch: true, enableHighAccuracy: true });
      map.on('locationfound', handleLocationFound);
      map.on('locationerror', () => {
        setError('Unable to find your location');
        setTimeout(() => setError(null), 3000);
      });
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    return () => {
      if (locationMarkerRef.current) {
        locationMarkerRef.current.remove();
      }
      map.off('locationfound', handleLocationFound);
    };
  }, [map]);

  return { getLocation, error };
}

// Routing Control
function RoutingControl({ from, to, voiceLanguage, isVoiceEnabled }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;

    // Remove existing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      createMarker: () => null,
      lineOptions: {
        styles: [
          { color: '#3B82F6', weight: 6, opacity: 0.8 },
          { color: '#FFFFFF', weight: 2, opacity: 1 }
        ]
      }
    }).addTo(map);

    routingControlRef.current = control;

    if (isVoiceEnabled) {
      control.on('routesfound', (e) => {
        const route = e.routes[0];
        const instructions = route.instructions || [];
        
        if (instructions.length > 0) {
          const firstInstruction = instructions[0];
          let instruction = firstInstruction.text || firstInstruction.instruction || 'Route found';
          
          if (voiceLanguage === 'ur') {
            instruction = translateToUrdu(instruction);
          }
          
          // Speak the first instruction
          setTimeout(() => {
            speakInstructions(instruction, voiceLanguage);
          }, 1000);
        }
      });
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [from, to, map, voiceLanguage, isVoiceEnabled]);

  return null;
}

export default function MapView() {
  const [geoData, setGeoData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedBasemap, setSelectedBasemap] = useState('osm');
  const [voiceLanguage, setVoiceLanguage] = useState('en');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const mapRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we received hospital data from navigation
  useEffect(() => {
    if (location.state?.hospital) {
      const hospital = location.state.hospital;
      console.log('Received hospital data:', hospital);
      
      // Set the hospital as selected
      setSelectedHospital(hospital);
      
      // Set destination coordinates
      if (hospital.location && hospital.location.lat && hospital.location.lng) {
        setDestination([hospital.location.lat, hospital.location.lng]);
      }
      
      // Clear the state to prevent reloading on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Load GeoJSON data
  useEffect(() => {
    fetch('/map-codinates.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        console.log('Loaded GeoJSON:', data);
        setGeoData(data);
      })
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  // Get initial user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(userCoords);
        
        // If we have a destination but no route yet, this is perfect time to setup the route
        if (destination && selectedHospital) {
          console.log('Setting up route to hospital:', selectedHospital.name);
          
          // Announce if voice is enabled
          if (isVoiceEnabled) {
            const message = voiceLanguage === 'ur' 
              ? `${selectedHospital.name} کی طرف راستہ تیار کر رہے ہیں`
              : `Calculating route to ${selectedHospital.name}`;
            setTimeout(() => speakInstructions(message, voiceLanguage), 500);
          }
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setUserLocation([33.6844, 73.0479]); // Fallback to Islamabad
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [destination, selectedHospital, isVoiceEnabled, voiceLanguage]);

  // Handle hospital marker click
  const handleHospitalClick = (hospitalData, coordinates) => {
    if (!userLocation) {
      alert('Please enable location services to get directions');
      return;
    }

    setDestination(coordinates);
    setSelectedHospital(hospitalData);
    
    // Announce navigation start
    if (isVoiceEnabled) {
      const message = voiceLanguage === 'ur' 
        ? `${hospitalData.name} کی طرف راستہ تیار کر رہے ہیں`
        : `Calculating route to ${hospitalData.name}`;
      setTimeout(() => speakInstructions(message, voiceLanguage), 500);
    }
  };

  // Clear route function
  const handleClearRoute = () => {
    setDestination(null);
    setSelectedHospital(null);
    
    if (isVoiceEnabled) {
      const message = voiceLanguage === 'ur' ? 'راستہ صاف کر دیا گیا' : 'Route cleared';
      speakInstructions(message, voiceLanguage);
    }
  };

  const MapContent = () => {
    const { getLocation, error } = useLocationControl(setUserLocation);

    return (
      <>
        <ModernControls
          onLocationClick={getLocation}
          selectedBasemap={selectedBasemap}
          onBasemapChange={setSelectedBasemap}
          voiceLanguage={voiceLanguage}
          onVoiceLanguageChange={setVoiceLanguage}
          isVoiceEnabled={isVoiceEnabled}
          onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
          onClearRoute={handleClearRoute}
          hasRoute={!!destination}
          selectedHospital={selectedHospital}
        />

        <TileLayer
          key={selectedBasemap}
          attribution={basemaps[selectedBasemap].attribution}
          url={basemaps[selectedBasemap].url}
        />

        {userLocation && destination && (
          <RoutingControl 
            from={userLocation} 
            to={destination}
            voiceLanguage={voiceLanguage}
            isVoiceEnabled={isVoiceEnabled}
          />
        )}

        {/* Render markers from GeoJSON */}
        {geoData?.features.map((feature, idx) => {
          const [lng, lat] = feature.geometry.coordinates;
          const hospitalData = {
            name: feature.properties?.name || 'Healthcare Facility',
            address: feature.properties?.address || 'Medical facility',
            phone: feature.properties?.phone || feature.properties?.contact,
            type: feature.properties?.type || feature.properties?.category,
            services: feature.properties?.services,
            coordinates: [lat, lng]
          };

          return (
            <Marker 
              key={idx} 
              position={[lat, lng]} 
              icon={hospitalIcon}
              eventHandlers={{
                click: () => handleHospitalClick(hospitalData, [lat, lng])
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">🏥</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                        {hospitalData.name}
                      </h3>
                      {hospitalData.address && (
                        <p className="text-sm text-gray-600 mb-2">
                          📍 {hospitalData.address}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {hospitalData.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>📞</span>
                        <span>{hospitalData.phone}</span>
                      </div>
                    )}
                    
                    {hospitalData.type && (
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {hospitalData.type}
                        </span>
                      </div>
                    )}
                    
                    {hospitalData.services && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Services:</span> {hospitalData.services}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleHospitalClick(hospitalData, [lat, lng])}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span>🧭</span>
                    Get Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Example static marker for SehatPlus HQ */}
        <Marker position={[33.6844, 73.0479]} icon={hospitalIcon}>
          <Popup className="custom-popup">
            <div className="p-3 min-w-[250px]">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">🏥</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                    SehatPlus HQ
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📍 G-8, Islamabad
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>📞</span>
                  <span>+92-51-1234567</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    Healthcare Technology
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleHospitalClick({
                  name: 'SehatPlus HQ',
                  address: 'G-8, Islamabad',
                  phone: '+92-51-1234567',
                  type: 'Healthcare Technology'
                }, [33.6844, 73.0479])}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>🧭</span>
                Get Directions
              </button>
            </div>
          </Popup>
        </Marker>

        {error && (
          <div className="absolute top-4 left-4 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </>
    );
  };

  return (
    
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-[2000] bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50"
        aria-label="Go back"
      >
        <ArrowLeft size={24} className="text-gray-700" />
      </button>
      
      {/* Hospital info panel - only show when a hospital is selected */}
      {selectedHospital && (
        <div className="absolute top-4 left-16 right-4 z-[1500] bg-white rounded-lg shadow-lg border border-gray-200 p-3 md:max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#8B0000] text-white p-1 rounded">
              <MapPin size={18} />
            </div>
            <h2 className="font-bold text-gray-800 flex-1">{selectedHospital.name}</h2>
            <button 
              onClick={handleClearRoute}
              className="text-gray-500 hover:text-gray-700 p-1"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            {selectedHospital.address || selectedHospital.location?.address || "Address not available"}
          </div>
          
          {userLocation && destination && (
            <div className="flex justify-between text-xs border-t pt-2">
              <div className="text-blue-600">
                <Navigation size={14} className="inline mr-1" />
                Navigation active
              </div>
              {selectedHospital.contactNumber || selectedHospital.phone ? (
                <a 
                  href={`tel:${selectedHospital.contactNumber || selectedHospital.phone}`}
                  className="text-[#8B0000]"
                >
                  <Phone size={14} className="inline mr-1" />
                  Call
                </a>
              ) : null}
            </div>
          )}
        </div>
      )}
      
      <div className="relative w-full max-w-7xl h-full rounded-2xl shadow-2xl bg-white overflow-hidden border border-gray-200">
        <div className="h-full w-full relative">
          <MapContainer
            center={userLocation || [33.6844, 73.0479]}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full rounded-2xl"
            zoomControl={false}
            whenCreated={(map) => {
              mapRef.current = map;
            }}
          >
            <MapContent />
          </MapContainer>
          
          {/* Custom zoom controls */}
          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1">
            <button 
              className="bg-white hover:bg-gray-50 shadow-lg rounded-lg w-10 h-10 flex items-center justify-center transition-all duration-200 hover:shadow-xl border border-gray-200"
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.zoomIn();
                }
              }}
            >
              <span className="text-lg font-bold text-gray-700">+</span>
            </button>
            <button 
              className="bg-white hover:bg-gray-50 shadow-lg rounded-lg w-10 h-10 flex items-center justify-center transition-all duration-200 hover:shadow-xl border border-gray-200"
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.zoomOut();
                }
              }}
            >
              <span className="text-lg font-bold text-gray-700">−</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}