// src/pages/pmap.jsx - Simple Map with Directions + Open in Google Maps option
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.js';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { ArrowLeft, MapPin, Navigation, ExternalLink } from 'lucide-react';

const hospitalIcon = new L.Icon({
  iconUrl: '/map.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
  iconUrl: '/nav.svg',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function parseHospitalFromLocation(location) {
  // Prefer router state
  const stateHospital = location.state?.hospital;
  if (stateHospital?.location?.lat && stateHospital?.location?.lng) return stateHospital;

  // Fallback to query params: ?lat=..&lng=..&name=..&address=..
  const sp = new URLSearchParams(location.search);
  const lat = parseFloat(sp.get('lat'));
  const lng = parseFloat(sp.get('lng'));
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    return {
      name: sp.get('name') || 'Healthcare Facility',
      location: { lat, lng, address: sp.get('address') || '' },
      contactNumber: sp.get('phone') || '',
    };
  }
  return null;
}

function RoutingControl({ from, to }) {
  const map = useMap();
  const ctrlRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;
    if (ctrlRef.current) {
      map.removeControl(ctrlRef.current);
    }
    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      createMarker: () => null,
      lineOptions: {
        styles: [
          { color: '#2563eb', weight: 6, opacity: 0.85 },
          { color: '#ffffff', weight: 2, opacity: 1 },
        ],
      },
    }).addTo(map);
    ctrlRef.current = control;
    return () => {
      if (ctrlRef.current) map.removeControl(ctrlRef.current);
    };
  }, [from, to, map]);

  return null;
}

export default function PMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const hospital = useMemo(() => parseHospitalFromLocation(location), [location]);

  const [userLoc, setUserLoc] = useState(null); // [lat,lng]
  const [error, setError] = useState('');

  // Using a fixed location for testing and disabling live geolocation.
  useEffect(() => {
    setUserLoc([33.6461, 72.9974]);
  }, []);

  const center = userLoc || (hospital?.location?.lat && hospital?.location?.lng
    ? [hospital.location.lat, hospital.location.lng]
    : [33.6461, 72.9974]); // Default center to the test location

  const destination = hospital?.location?.lat && hospital?.location?.lng
    ? [hospital.location.lat, hospital.location.lng]
    : null;

  const googleMapsHref = useMemo(() => {
    if (!destination) return '#';
    const [dlat, dlng] = destination;
    if (userLoc) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLoc[0]},${userLoc[1]}&destination=${dlat},${dlng}&travelmode=driving`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${dlat},${dlng}&travelmode=driving`;
  }, [destination, userLoc]);

  if (!hospital) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <p className="text-gray-800 font-medium mb-2">No hospital selected</p>
          <p className="text-gray-600 mb-4 text-sm">Pass hospital via navigation state or query params (?lat=&lng=&name=)</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-gray-800 text-white">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 pt-24">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-24 left-4 z-[2000] bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50"
        aria-label="Go back"
      >
        <ArrowLeft size={24} className="text-gray-700" />
      </button>

      {/* Title */}
  <div className="absolute top-24 left-16 right-4 z-[1500] bg-white rounded-lg shadow border border-gray-200 p-2 md:max-w-lg">
        <div className="flex items-center gap-2">
          <div className="bg-[#8B0000] text-white p-1 rounded">
            <MapPin size={18} />
          </div>
          <div className="flex-1">
    <h2 className="font-semibold text-gray-800 text-base">{hospital.name || 'Healthcare Facility'}</h2>
    <p className="text-[11px] text-gray-600 mt-0.5">{hospital.location?.address || 'Address not available'}</p>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-6xl h-full rounded-2xl shadow-2xl bg-white overflow-hidden border border-gray-200">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User marker */}
          {userLoc && (
            <Marker position={userLoc} icon={userIcon}>
              <Popup>Your location</Popup>
            </Marker>
          )}

          {/* Hospital marker */}
          {destination && (
            <Marker position={destination} icon={hospitalIcon}>
              <Popup>{hospital.name || 'Destination'}</Popup>
            </Marker>
          )}

          {/* Routing */}
          {userLoc && destination && <RoutingControl from={userLoc} to={destination} />}
        </MapContainer>

        {/* Bottom bar */}
        <div className="absolute bottom-4 left-4 right-4 z-[1200]">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 text-[13px] text-gray-700">
              <div className="font-semibold text-gray-900">Navigation {userLoc && destination ? 'active' : 'ready'}</div>
              <div className="text-[11px] text-gray-500">{userLoc ? 'Using your current location' : 'Waiting for location permission'}</div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto items-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hidden sm:inline-flex px-2 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                title="Recenter map"
              >
                <Navigation size={16} className="inline" />
              </button>
              <a
                href={googleMapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-[#8B0000] text-white hover:brightness-110 text-center"
                title="Open in Google Maps"
              >
                <ExternalLink size={16} className="inline mr-2" /> Open in Google Maps
              </a>
            </div>
          </div>
          {error && (
            <div className="mt-2 text-xs text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
