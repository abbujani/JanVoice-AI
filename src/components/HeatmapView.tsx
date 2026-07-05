import React, { useEffect, useRef, useState } from 'react';
import type { Complaint } from '../services/mockData';
import { GlassCard } from './GlassCard';

interface HeatmapViewProps {
  complaints: Complaint[];
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ complaints }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState<'markers' | 'heatmap'>('markers');
  const [selectedIncident, setSelectedIncident] = useState<Complaint | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  
  const googleMapInstance = useRef<any>(null);
  const googleHeatmapInstance = useRef<any>(null);
  const googleMarkersList = useRef<any[]>([]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Filter complaints list
  const filteredComplaints = complaints.filter(c => {
    if (c.status === 'duplicate') return false; // Hide duplicates on main map
    if (activeCategoryFilter === 'All') return true;
    return c.category === activeCategoryFilter;
  });

  // Load Google Maps script if API key is present
  useEffect(() => {
    if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      setUseGoogleMaps(true);
      const win = window as any;
      if (win.google?.maps) {
        setMapLoaded(true);
        return;
      }
      // Check if another component started loading the script
      const scripts = Array.from(document.getElementsByTagName('script'));
      const hasScript = scripts.some(s => s.src.includes('maps.googleapis.com'));
      if (hasScript) {
        // Wait for it to load
        const interval = setInterval(() => {
          if (win.google?.maps) {
            setMapLoaded(true);
            clearInterval(interval);
          }
        }, 500);
        return () => clearInterval(interval);
      }
    }
  }, [apiKey]);

  // Initializing and Updating Google Maps
  useEffect(() => {
    const win = window as any;
    if (!useGoogleMaps || !mapLoaded || !mapRef.current || !win.google?.maps) return;

    const mapCenter = { lat: 28.6139, lng: 77.2090 }; // Center in Delhi/NCR/Ramnagar
    
    // Check if map already created
    if (!googleMapInstance.current) {
      googleMapInstance.current = new win.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: document.documentElement.classList.contains('dark') ? [
          { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] }
        ] : []
      });
    }

    const map = googleMapInstance.current;

    // Clear old markers
    googleMarkersList.current.forEach(m => m.setMap(null));
    googleMarkersList.current = [];

    // Clear old heatmap
    if (googleHeatmapInstance.current) {
      googleHeatmapInstance.current.setMap(null);
      googleHeatmapInstance.current = null;
    }

    if (heatmapMode === 'markers') {
      // Add marker pins
      filteredComplaints.forEach(c => {
        const markerColor = 
          c.urgency === 'critical' ? '#EF4444' : 
          c.urgency === 'high' ? '#F59E0B' : 
          c.urgency === 'medium' ? '#2563EB' : '#22C55E';

        const pinSvg = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 1.5,
          scale: 1.5,
          anchor: new win.google.maps.Point(12, 24)
        };

        const marker = new win.google.maps.Marker({
          position: { lat: c.location.lat, lng: c.location.lng },
          map,
          icon: pinSvg,
          title: c.title
        });

        marker.addListener('click', () => {
          setSelectedIncident(c);
        });

        googleMarkersList.current.push(marker);
      });
    } else {
      // Render Heatmap Layer
      const points = filteredComplaints.map(c => {
        return {
          location: new win.google.maps.LatLng(c.location.lat, c.location.lng),
          weight: c.urgency === 'critical' ? 4 : c.urgency === 'high' ? 3 : c.urgency === 'medium' ? 2 : 1
        };
      });

      googleHeatmapInstance.current = new win.google.maps.visualization.HeatmapLayer({
        data: points,
        map: map,
        radius: 35
      });
    }

  }, [useGoogleMaps, mapLoaded, filteredComplaints, heatmapMode]);

  // Categories list for filtering
  const categories = ['All', 'Roads', 'Water', 'Waste', 'Infrastructure', 'Health', 'Education', 'Electricity'];

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Map Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button
            onClick={() => setHeatmapMode('markers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${heatmapMode === 'markers' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          >
            Incident Markers
          </button>
          <button
            onClick={() => setHeatmapMode('heatmap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${heatmapMode === 'heatmap' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          >
            AI Heatmap Layer
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1 text-xs rounded-full font-medium border transition-all cursor-pointer whitespace-nowrap ${activeCategoryFilter === cat ? 'bg-secondary border-secondary text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 min-h-[400px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        {useGoogleMaps ? (
          <div ref={mapRef} className="w-full h-full" />
        ) : (
          /* Premium Mock Map Visualizer */
          <div className="relative w-full h-full bg-slate-900 overflow-hidden">
            {/* Base blueprint grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1.5px,transparent_1.5px),linear-gradient(to_bottom,#1e293b_1.5px,transparent_1.5px)] bg-[size:32px_32px] opacity-35"></div>
            
            {/* Ward Boundaries */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 50 L300 100 L450 30 L600 200 L400 350 L100 280 Z" fill="rgba(37, 99, 235, 0.1)" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M300 100 L550 120 L750 300 L600 400 L400 350 Z" fill="rgba(20, 184, 166, 0.1)" stroke="#14B8A6" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M100 280 L400 350 L420 500 L120 480 Z" fill="rgba(245, 158, 11, 0.1)" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Pulsing Hotspots for Heatmap View */}
            {heatmapMode === 'heatmap' && (
              <div className="absolute inset-0">
                {/* Hotspot clusters */}
                <div className="absolute top-[28%] left-[45%] w-32 h-32 rounded-full bg-red-500/25 blur-xl animate-pulse"></div>
                <div className="absolute top-[30%] left-[47%] w-16 h-16 rounded-full bg-orange-500/30 blur-lg animate-ping" style={{ animationDuration: '3s' }}></div>
                
                <div className="absolute top-[60%] left-[30%] w-40 h-40 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
                <div className="absolute top-[18%] left-[70%] w-24 h-24 rounded-full bg-teal-500/25 blur-lg animate-pulse" style={{ animationDuration: '4s' }}></div>
              </div>
            )}

            {/* Glowing incident pins */}
            {heatmapMode === 'markers' && filteredComplaints.map((c) => {
              // Convert complaint coords offset into canvas screen percent
              const topOffset = 30 + ((c.location.lat - 28.6139) * 1200);
              const leftOffset = 50 + ((c.location.lng - 77.2090) * 1200);
              
              const pinColor = 
                c.urgency === 'critical' ? 'bg-red-500 shadow-red-500/50' : 
                c.urgency === 'high' ? 'bg-orange-500 shadow-orange-500/50' : 
                c.urgency === 'medium' ? 'bg-primary shadow-blue-500/50' : 'bg-success shadow-green-500/50';

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedIncident(c)}
                  style={{ top: `${Math.min(Math.max(topOffset, 10), 90)}%`, left: `${Math.min(Math.max(leftOffset, 10), 90)}%` }}
                  className="absolute p-1 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                >
                  <span className="absolute w-6 h-6 -m-2 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  <div className={`h-3.5 w-3.5 rounded-full border border-white shadow-lg ${pinColor} group-hover:scale-125 transition-transform duration-200 flex items-center justify-center`}>
                    <div className="h-1 w-1 bg-white rounded-full animate-ping"></div>
                  </div>
                </button>
              );
            })}

            <span className="absolute top-4 left-4 text-[10px] text-slate-500 font-mono">CONSTITUENCY MAP (SANDALONE OVERLAY)</span>
            <span className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-mono">Showing {filteredComplaints.length} Hotspots</span>
          </div>
        )}

        {/* Selected Incident Drawer */}
        {selectedIncident && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30">
            <GlassCard className="p-4 shadow-xl border-slate-200/20 text-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">{selectedIncident.title}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{selectedIncident.location.address}</span>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
                {selectedIncident.translatedDescription}
              </p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-mono text-[10px] text-slate-400">
                  {selectedIncident.category}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  selectedIncident.urgency === 'critical' ? 'bg-red-950/40 text-red-400' :
                  selectedIncident.urgency === 'high' ? 'bg-orange-950/40 text-orange-400' : 'bg-blue-950/40 text-blue-400'
                }`}>
                  {selectedIncident.urgency.toUpperCase()}
                </span>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};
