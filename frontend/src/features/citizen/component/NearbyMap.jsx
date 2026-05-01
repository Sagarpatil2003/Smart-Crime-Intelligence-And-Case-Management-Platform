import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const NearbyMap = () => {
  const center = [19.45, 72.82];

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl overflow-hidden shadow-2xl relative">

      <div className="relative rounded-lg overflow-hidden border border-zinc-800 group">
        
        {/* CSS TRICK: This filter turns the grey roads into "Amber/Gold" roads */}
        <div className="map-brightness-layer transition-all duration-500">
          <MapContainer 
            center={center} 
            zoom={14} 
            style={{ height: "450px", background: "#09090b" }}
            zoomControl={false}
          >
            {/* Using Stadia Maps Alidade Smooth Dark for cleaner road lines */}
            <TileLayer 
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              attribution='&copy; Stadia Maps'
            />
            
            {/* Crime/Threat Hotspot */}
            <CircleMarker 
              center={[19.455, 72.825]} 
              pathOptions={{ 
                  color: '#f59e0b', 
                  fillColor: '#f59e0b', 
                  fillOpacity: 0.2,
                  weight: 1
              }} 
              radius={40}
            />

            <CircleMarker 
              center={[19.455, 72.825]} 
              pathOptions={{ color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: 0.9 }} 
              radius={6}
            >
              <Tooltip permanent direction="top" className="custom-map-tooltip">
                ACTIVE INCIDENT
              </Tooltip>
            </CircleMarker>
          </MapContainer>
        </div>

        {/* Overlay for depth */}
        <div className="absolute inset-0 pointer-events-none z-[400] shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]"></div>
      </div>

      {/* Stats bar */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 px-2">
    {/* PROXIMITY STAT */}
    <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col items-center group hover:border-amber-600/50 transition-colors">
        <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">Proximity</span>
        <div className="flex items-baseline gap-1">
            <span className="text-sm text-amber-500 font-black">2.4</span>
            <span className="text-[10px] text-zinc-600 font-bold uppercase">KM</span>
        </div>
        <div className="w-full bg-zinc-900 h-[2px] mt-2 rounded-full overflow-hidden">
            <div className="bg-amber-600 w-1/3 h-full"></div>
        </div>
    </div>

    {/* ETA STAT */}
    <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col items-center group hover:border-amber-600/50 transition-colors">
        <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">Reach Time</span>
        <div className="flex items-baseline gap-1">
            <span className="text-sm text-amber-500 font-black">08</span>
            <span className="text-[10px] text-zinc-600 font-bold uppercase">MINS</span>
        </div>
        <span className="text-[8px] text-emerald-600 font-bold animate-pulse mt-1 tracking-widest uppercase">Fastest Route</span>
    </div>

    {/* RISK LEVEL STAT */}
    <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col items-center group hover:border-amber-600/50 transition-colors">
        <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">Risk Assessment</span>
        <span className="text-xs text-red-500 font-black uppercase tracking-widest mt-1">Elevated</span>
        <span className="text-[8px] text-zinc-700 mt-1 font-mono uppercase">Zone_Level: 04</span>
    </div>

    {/* SIGNAL STAT */}
    <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col items-center group hover:border-amber-600/50 transition-colors">
        <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">Telemetry</span>
        <div className="flex items-center gap-1.5 mt-1">
            <div className="flex gap-0.5 items-end h-3">
                <div className="w-1 h-1 bg-amber-500"></div>
                <div className="w-1 h-2 bg-amber-500"></div>
                <div className="w-1 h-3 bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,1)]"></div>
            </div>
            <span className="text-xs text-amber-500 font-bold">100%</span>
        </div>
        <span className="text-[8px] text-zinc-600 mt-1 uppercase font-mono">ID: SEC_G7</span>
    </div>
</div>
    </div>
  );
};

export default NearbyMap;