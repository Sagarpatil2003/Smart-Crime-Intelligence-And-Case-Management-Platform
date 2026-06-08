import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { Radio, Navigation, ShieldAlert, Cpu } from "lucide-react";

import MapController from "./MapController";
import HeatmapLayer from "../component/HeatmapLayer";
import calculateSpatialDistance from "../utils/calculateSpatialDistance";
import { fetchHeatMap, fetchNearbyCasesForMap } from "../../cases/slice/caseSlice";

const INDIA_BOUNDS = [[6.55, 68.11], [35.67, 97.39]];

//Internal helper to resolve Leaflet container size tracking bugs
const MapInvalidateTracer = () => {
  const map = useMap();
  useEffect(() => {
    // Sequentially fire updates to force browser redraw checks across sidebar animation frame boundaries
    const timers = [
      setTimeout(() => map.invalidateSize({ animate: true }), 100),
      setTimeout(() => map.invalidateSize({ animate: true }), 500),
      setTimeout(() => map.invalidateSize({ animate: true }), 1200)
    ];
    return () => timers.forEach(clearTimeout);
  }, [map]);
  return null;
};

const Tracking = () => {
  const dispatch = useDispatch();
  
  // Clean initialization following GeoJSON specifications: [Lng, Lat]
  const [userCoordinates, setUserCoordinates] = useState([72.841300, 19.171800]); 
  const { heatMap = [], nearbyCasesForMap = [] } = useSelector((state) => state.cases);
  
  const lastDispatchedCoords = useRef({ lat: 19.171800, lng: 72.841300 });
  const animationFrameId = useRef(null);

  const triggerSpatialQueryFetch = (lng, lat) => {
    dispatch(
      fetchNearbyCasesForMap({
        lat: Number(lat),
        lng: Number(lng),
        radius: 10,
        limit: 50,
      })
    );
  };

  useEffect(() => {
    dispatch(fetchHeatMap());
    triggerSpatialQueryFetch(userCoordinates[0], userCoordinates[1]);
  }, [dispatch]);

  useEffect(() => {
    const handleTelemetryUpdate = (pos) => {
      const { latitude, longitude } = pos.coords;

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      animationFrameId.current = requestAnimationFrame(() => {
        setUserCoordinates([longitude, latitude]);
        
        const distanceDelta = calculateSpatialDistance(
          latitude,
          longitude,
          lastDispatchedCoords.current.lat,
          lastDispatchedCoords.current.lng
        );

        if (distanceDelta > 150) {
          lastDispatchedCoords.current = { lat: latitude, lng: longitude };
          triggerSpatialQueryFetch(longitude, latitude);
        }
      });
    };

    const watchId = navigator.geolocation.watchPosition(
      handleTelemetryUpdate,
      (err) => console.error("CRITICAL_TELEMETRY_DISCONNECT:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [dispatch]);

  const leafletCenter = useMemo(() => [userCoordinates[1], userCoordinates[0]], [userCoordinates]);
  const stableHeatmapPoints = useMemo(() => heatMap, [heatMap]);

  const userNodeIcon = useMemo(() => L.divIcon({
    className: 'user-node-anchor',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full border-2 border-cyan-400/30 animate-ping" style="animation-duration: 3s;"></div>
        <div class="w-4 h-4 bg-cyan-400 rounded-full border-2 border-[#05070f] shadow-[0_0_20px_#22d3ee]"></div>
      </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  }), []);

  return (
    <div className="h-[calc(100vh-64px)] w-full flex bg-[#010208] overflow-hidden font-mono text-slate-400">
      
      {/* SIDEBAR FEED CONTROL PANEL */}
      <div className="w-[420px] border-r border-[#1E262D] flex flex-col bg-[#05070f] z-10 h-full shadow-[5px_0_30px_rgba(0,0,0,0.7)] shrink-0">
        
        {/* NETWORK LOG HEADERS */}
        <div className="p-5 border-b border-[#1E262D] bg-purple-950/[0.04] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00BA63] rounded-full animate-pulse shadow-[0_0_8px_#00BA63]" />
              <h2 className="text-[10px] font-black tracking-[0.25em] text-white uppercase">UPLINK::SECURE_STREAM</h2>
            </div>
            <Cpu size={14} className="text-purple-500 animate-[spin_8s_linear_infinite]" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-black/40 p-3 border border-[#1E262D]">
               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">LAT_COGNIZANCE</p>
               <p className="text-sm text-cyan-400 tabular-nums font-bold mt-1">{userCoordinates[1].toFixed(6)}</p>
             </div>
             <div className="bg-black/40 p-3 border border-[#1E262D]">
               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">LNG_COGNIZANCE</p>
               <p className="text-sm text-cyan-400 tabular-nums font-bold mt-1">{userCoordinates[0].toFixed(6)}</p>
             </div>
          </div>
        </div>

        {/* METRICS LAYOUT */}
        <div className="grid grid-cols-2 border-b border-[#1E262D] text-center bg-black/20">
            <div className="p-4 border-r border-[#1E262D]">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">REGIONAL_THREATS</p>
                <p className="text-2xl font-black text-red-500 tracking-tight mt-1">{nearbyCasesForMap.length}</p>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">SECTOR_STATUS</p>
                <p className="text-xs font-black text-[#00BA63] tracking-widest uppercase mt-1">OPERATIONAL</p>
            </div>
        </div>

        {/* INCIDENT REPORT LOG FEED */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-black/[0.15]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1E262D]">
            <Radio size={12} className="text-cyan-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-200">TACTICAL_INCIDENT_STREAM</span>
          </div>

          {nearbyCasesForMap.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-xs italic tracking-wide">
              &gt; Resolving satellite node tracking vectors...
            </div>
          ) : (
            nearbyCasesForMap.map((incident) => (
              <IncidentLogCard key={incident._id} incident={incident} />
            ))
          )}
        </div>

        <div className="p-3 bg-black border-t border-[#1E262D] flex justify-between items-center shrink-0 text-[9px] tracking-wider font-bold">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00BA63] rounded-full" />
                <span className="text-slate-400 uppercase">SYS_CRYPTO_LINK_CONNECTED</span>
            </div>
            <span className="opacity-30 text-white">v4.0.2_CITIZEN_OS</span>
        </div>
      </div>

      {/* RENDER VIEWPORT MAP CANVAS */}
      <div className="flex-1 h-full relative bg-[#010208]">
        <div className="absolute inset-0 w-full h-full">
          <MapContainer
            center={leafletCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            maxBounds={INDIA_BOUNDS}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapController center={leafletCenter} />
            <MapInvalidateTracer />

            {stableHeatmapPoints && stableHeatmapPoints.length > 0 && (
              <HeatmapLayer points={stableHeatmapPoints} />
            )}

            <Marker position={leafletCenter} icon={userNodeIcon} />
          </MapContainer>
        </div>

        {/* SYSTEM ACTIONS ACTION WRAPPERS */}
        <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
             <button 
                onClick={() => triggerSpatialQueryFetch(userCoordinates[0], userCoordinates[1])}
                title="Force Sector Recalculation Sync"
                className="bg-[#05070f]/80 backdrop-blur-md border border-[#1E262D] p-2.5 text-slate-400 hover:text-cyan-400 hover:border-[#00BA63] transition-all rounded-none cursor-pointer"
             >
                <Navigation size={16} className="rotate-45" />
             </button>
             <button 
                onClick={() => dispatch(fetchHeatMap())}
                title="Refresh Matrix Density Gradients"
                className="bg-[#05070f]/80 backdrop-blur-md border border-[#1E262D] p-2.5 text-slate-400 hover:text-red-400 hover:border-red-500 transition-all rounded-none cursor-pointer"
             >
                <ShieldAlert size={16} />
             </button>
        </div>
      </div>
    </div>
  );
};

const IncidentLogCard = React.memo(({ incident }) => {
  return (
    <div className="group relative bg-white/[0.01] border border-[#1E262D] p-3.5 hover:bg-white/[0.03] transition-all duration-200 cursor-crosshair">
      <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] font-black px-1.5 py-0.5 bg-red-950/40 border border-red-800 text-red-400 uppercase tracking-wider">
              {incident.category || "CRITICAL_ALERT"}
          </span>
          <span className="text-[9px] font-mono text-slate-600 tabular-nums">
            ID::{incident._id?.slice(-6).toUpperCase()}
          </span>
      </div>
      <h3 className="text-xs text-white font-bold tracking-tight mb-1 group-hover:text-cyan-400 transition-colors">
        {incident.title}
      </h3>
      <p className="text-[11px] text-slate-500 line-clamp-2 leading-normal">
        {incident.description}
      </p>
      <div className="absolute left-0 top-0 h-full w-[2px] bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
    </div>
  );
});

IncidentLogCard.displayName = "IncidentLogCard";

export default Tracking;