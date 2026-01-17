'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { MapPin, Phone } from 'lucide-react';

interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  distance: string;
  rating: number;
  bloodTypes: string[];
  position: { lat: number; lng: number };
  isOpen?: boolean;
}

interface GoogleMapComponentProps {
  bloodBanks: BloodBank[];
  selectedBank: BloodBank | null;
  onSelectBank: (bank: BloodBank | null) => void;
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  apiKey: string;
  mapType: string;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px',
};

const libraries: ("places")[] = ["places"];

export default function GoogleMapComponent({
  bloodBanks,
  selectedBank,
  onSelectBank,
  center,
  userLocation,
  apiKey,
  mapType,
}: GoogleMapComponentProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Update map type when it changes
  useEffect(() => {
    if (map && mapType) {
      map.setMapTypeId(mapType as google.maps.MapTypeId);
    }
  }, [map, mapType]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 rounded-xl">
        <div className="text-center p-6 max-w-md">
          <MapPin className="h-12 w-12 text-[#DC2626] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Google Maps API Error</h3>
          <p className="text-gray-600 mt-2 text-sm">
            Please ensure:
          </p>
          <ul className="text-left text-sm text-gray-600 mt-2 space-y-1">
            <li>• <strong>Maps JavaScript API</strong> is enabled</li>
            <li>• <strong>Places API</strong> is enabled</li>
            <li>• Your API key has proper permissions</li>
            <li>• Billing is enabled for your project</li>
          </ul>
          <a 
            href="https://console.cloud.google.com/google/maps-apis/api-list" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 bg-[#DC2626] text-white rounded-md text-sm hover:bg-[#B91C1C] transition-colors"
          >
            Open Google Cloud Console
          </a>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false, // We handle this ourselves
        streetViewControl: false,
        fullscreenControl: true,
      }}
      onClick={() => onSelectBank(null)}
    >
      {/* User Location Marker */}
      {userLocation && (
        <>
          <Circle
            center={userLocation}
            radius={100}
            options={{
              fillColor: '#4285F4',
              fillOpacity: 0.2,
              strokeColor: '#4285F4',
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
          />
          <Marker
            position={userLocation}
            icon={{
              url: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="white" stroke-width="3"/>
                  <circle cx="12" cy="12" r="4" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12),
            }}
            title="Your Location"
          />
        </>
      )}

      {/* Blood Bank Markers */}
      {bloodBanks.map((bank) => (
        <Marker
          key={bank.id}
          position={bank.position}
          onClick={() => onSelectBank(bank)}
          icon={{
            url: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626" width="36" height="36">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 36),
          }}
        />
      ))}

      {selectedBank && (
        <InfoWindow
          position={selectedBank.position}
          onCloseClick={() => onSelectBank(null)}
        >
          <div className="p-2 max-w-[200px]">
            <h3 className="font-semibold text-gray-900 text-sm">{selectedBank.name}</h3>
            <p className="text-xs text-gray-600 mt-1">{selectedBank.address}</p>
            {selectedBank.phone && (
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Phone className="h-3 w-3 mr-1" />
                {selectedBank.phone}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

// Export the libraries for use in the page
export { libraries };
