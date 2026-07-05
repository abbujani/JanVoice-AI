import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelected: (location: { lat: number; lng: number; address: string }) => void;
  initialValue?: { lat: number; lng: number; address: string };
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelected,
  initialValue
}) => {
  const [lat, setLat] = useState(initialValue?.lat || 28.6139);
  const [lng, setLng] = useState(initialValue?.lng || 77.2090);
  const [address, setAddress] = useState(initialValue?.address || 'Main Road, Sector 3, Ramnagar');
  const [searchQuery, setSearchQuery] = useState('');
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstance = useRef<any>(null);
  const googleMarkerInstance = useRef<any>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Detect and load Google Maps script if API key exists
  useEffect(() => {
    const win = window as any;
    if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      setUseGoogleMaps(true);
      
      // Prevent duplicate script loads
      if (win.google?.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => {
        console.warn("Failed to load Google Maps script. Switching to interactive grid fallback.");
        setUseGoogleMaps(false);
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup not strictly necessary for global maps script
      };
    }
  }, [apiKey]);

  // Initialize Native Google Map
  useEffect(() => {
    const win = window as any;
    if (useGoogleMaps && mapLoaded && mapRef.current && win.google?.maps) {
      const position = { lat, lng };
      
      const mapOptions = {
        center: position,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: document.documentElement.classList.contains('dark') ? [
          { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] }
        ] : []
      };

      const map = new win.google.maps.Map(mapRef.current, mapOptions);
      googleMapInstance.current = map;

      const marker = new win.google.maps.Marker({
        position,
        map,
        draggable: true,
        title: 'Drag to select incident location'
      });
      googleMarkerInstance.current = marker;

      // Handle marker drag end
      marker.addListener('dragend', () => {
        const newPos = marker.getPosition();
        if (newPos) {
          const newLat = newPos.lat();
          const newLng = newPos.lng();
          setLat(newLat);
          setLng(newLng);
          reverseGeocode(newLat, newLng);
        }
      });

      // Handle map click
      map.addListener('click', (event: any) => {
        const clickedPos = event.latLng;
        if (clickedPos) {
          const newLat = clickedPos.lat();
          const newLng = clickedPos.lng();
          setLat(newLat);
          setLng(newLng);
          marker.setPosition(clickedPos);
          reverseGeocode(newLat, newLng);
        }
      });
    }
  }, [useGoogleMaps, mapLoaded]);

  // Reverse geocoding helper (either via real Google Geocoder or mock resolver)
  const reverseGeocode = async (latitude: number, longitude: number) => {
    const win = window as any;
    if (useGoogleMaps && win.google?.maps) {
      const geocoder = new win.google.maps.Geocoder();
      geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any[], status: string) => {
        if (status === 'OK' && results && results[0]) {
          const resolvedAddress = results[0].formatted_address;
          setAddress(resolvedAddress);
          onLocationSelected({ lat: latitude, lng: longitude, address: resolvedAddress });
        }
      });
    } else {
      // Mock Geocoder for offline/standalone mode
      const wards = ['Ward 1, Ramnagar', 'Ward 3, Gopalpur', 'Ward 5, Gopalpur Central', 'Lal Chowk Area', 'Sector 4 Extension'];
      const randomWard = wards[Math.floor((latitude + longitude) * 100) % wards.length];
      const resolvedAddress = `Plot ${Math.floor(latitude * 100) % 200}, Road ${Math.floor(longitude * 10) % 15}, ${randomWard}`;
      setAddress(resolvedAddress);
      onLocationSelected({ lat: latitude, lng: longitude, address: resolvedAddress });
    }
  };

  const getMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const myLat = position.coords.latitude;
          const myLng = position.coords.longitude;
          setLat(myLat);
          setLng(myLng);
          
          const win = window as any;
          if (useGoogleMaps && googleMapInstance.current && googleMarkerInstance.current && win.google?.maps) {
            const pos = new win.google.maps.LatLng(myLat, myLng);
            googleMapInstance.current.setCenter(pos);
            googleMarkerInstance.current.setPosition(pos);
          }
          reverseGeocode(myLat, myLng);
        },
        () => {
          console.warn("Geolocation permission denied. Using default center.");
        }
      );
    }
  };

  // Standalone Grid Map click handler
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (useGoogleMaps) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert click coordinates to simulated lat/lng around Ramnagar (28.6139, 77.2090)
    const deltaLat = ((y / rect.height) - 0.5) * -0.05;
    const deltaLng = ((x / rect.width) - 0.5) * 0.05;
    
    const newLat = parseFloat((28.6139 + deltaLat).toFixed(4));
    const newLng = parseFloat((77.2090 + deltaLng).toFixed(4));
    
    setLat(newLat);
    setLng(newLng);
    reverseGeocode(newLat, newLng);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    const win = window as any;
    if (useGoogleMaps && win.google?.maps && googleMapInstance.current) {
      const service = new win.google.maps.places.PlacesService(googleMapInstance.current);
      const request = {
        query: searchQuery,
        fields: ['name', 'geometry'],
      };
      service.findPlaceFromQuery(request, (results: any[], status: string) => {
        if (status === 'OK' && results && results[0] && results[0].geometry?.location) {
          const loc = results[0].geometry.location;
          googleMapInstance.current.setCenter(loc);
          googleMarkerInstance.current.setPosition(loc);
          setLat(loc.lat());
          setLng(loc.lng());
          reverseGeocode(loc.lat(), loc.lng());
        }
      });
    } else {
      // Mock search response
      setAddress(`${searchQuery}, Ramnagar Central`);
      const randomOffsetLat = (Math.random() - 0.5) * 0.02;
      const randomOffsetLng = (Math.random() - 0.5) * 0.02;
      const targetLat = parseFloat((28.6139 + randomOffsetLat).toFixed(4));
      const targetLng = parseFloat((77.2090 + randomOffsetLng).toFixed(4));
      setLat(targetLat);
      setLng(targetLng);
      onLocationSelected({ lat: targetLat, lng: targetLng, address: `${searchQuery}, Ramnagar Central` });
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search village, ward, street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchSubmit(e);
              }
            }}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>
        <button
          type="button"
          onClick={handleSearchSubmit}
          className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Search
        </button>
        <button
          type="button"
          onClick={getMyLocation}
          title="Detect Current Location"
          className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* Main Map Viewer */}
      <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        {useGoogleMaps ? (
          <div ref={mapRef} className="w-full h-full" />
        ) : (
          /* Premium interactive blueprint wireframe fallback map */
          <div 
            onClick={handleGridClick}
            className="relative w-full h-full bg-slate-900 flex items-center justify-center cursor-crosshair overflow-hidden"
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
            
            {/* Concentric rings showing scanning grid */}
            <div className="absolute rounded-full border border-blue-500/10 w-96 h-96 animate-pulse"></div>
            <div className="absolute rounded-full border border-teal-500/5 w-64 h-64 animate-ping" style={{ animationDuration: '4s' }}></div>
            
            {/* Simulated streets and labels */}
            <div className="absolute w-full h-[2px] bg-slate-800 top-1/2 left-0 transform -translate-y-1/2"></div>
            <div className="absolute h-full w-[2px] bg-slate-800 left-1/2 top-0 transform -translate-x-1/2"></div>
            
            <span className="absolute top-4 left-4 text-[10px] text-slate-500 font-mono">MAP WORKSPACE (STANDALONE MOCKUP)</span>
            <span className="absolute bottom-4 left-4 text-[10px] text-slate-400 font-mono">Click anywhere to place GPS pin</span>
            
            {/* Marker pin */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="h-4 w-4 bg-primary rounded-full animate-ping absolute"></div>
              <MapPin size={32} className="text-primary z-10 drop-shadow-md animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Selected Metadata coordinates */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs gap-2">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <MapPin size={14} className="text-secondary" />
          <span className="font-medium break-all">{address}</span>
        </div>
        <div className="flex gap-3 text-slate-500 font-mono text-[10px] shrink-0">
          <span>Lat: {lat.toFixed(4)}</span>
          <span>Lng: {lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};
