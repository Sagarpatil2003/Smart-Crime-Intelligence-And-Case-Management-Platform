import MapController from "./MapController"; 
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import HeatmapLayer from "../component/HeatmapLayer";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHeatMap, fetchNearbyCasesForMap } from "../../cases/slice/caseSlice";
import { AlertTriangle, Radio, Navigation, ShieldAlert, Cpu } from "lucide-react";

const INDIA_BOUNDS = [[6.55, 68.11], [35.67, 97.39]];

const Tracking = () => {
  const dispatch = useDispatch();
  const [userLoc, setUserLoc] = useState([18.5204, 73.8567]);
  // Extracting nearbyCasesForMap to display in the feed
  const { heatMap = [], nearbyCasesForMap = [], loading } = useSelector((state) => state.cases);

  useEffect(() => {
    dispatch(fetchHeatMap());

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc([latitude, longitude]);
        dispatch(fetchNearbyCasesForMap({ lat: latitude, lng: longitude, radius: 10, limit: 20 }));
      },
      (err) => console.error("SIGNAL_LOST:", err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [dispatch]);

  return (
    <div className="h-[calc(100vh-64px)] w-full flex bg-[#010208] overflow-hidden font-mono text-slate-400">
      
      {/* LEFT SIDE: TACTICAL INTELLIGENCE FEED */}
      <div className="w-[420px] border-r border-purple-900/30 flex flex-col bg-[#05070f] z-10 h-full shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        
        {/* HEADER: NEURAL LINK */}
        <div className="p-5 border-b border-purple-900/30 bg-purple-950/10 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
              <h2 className="text-[11px] font-black tracking-[0.2em] text-white uppercase italic">Neural_Link::Established</h2>
            </div>
            <Cpu size={14} className="text-purple-500 animate-spin-slow" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-black/40 p-2 border-l-2 border-cyan-500">
               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Lat_Coord</p>
               <p className="text-[12px] text-cyan-400 tabular-nums font-bold leading-none">{userLoc[0].toFixed(6)}</p>
             </div>
             <div className="bg-black/40 p-2 border-l-2 border-cyan-500">
               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Long_Coord</p>
               <p className="text-[12px] text-cyan-400 tabular-nums font-bold leading-none">{userLoc[1].toFixed(6)}</p>
             </div>
          </div>
        </div>

        {/* METRICS SECTION */}
        <div className="grid grid-cols-2 border-b border-purple-900/20 text-center">
            <div className="p-3 border-r border-purple-900/20">
                <p className="text-[9px] text-slate-500 uppercase">Local_Threats</p>
                <p className="text-xl font-black text-red-500 tracking-tighter">{nearbyCasesForMap.length}</p>
            </div>
            <div className="p-3 italic">
                <p className="text-[9px] text-slate-500 uppercase">Sector_Status</p>
                <p className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Secure</p>
            </div>
        </div>

        {/* LIVE INCIDENT FEED */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <Radio size={14} className="text-cyan-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">Live_Incident_Log</span>
          </div>

          {nearbyCasesForMap.length === 0 ? (
            <div className="text-center py-10 opacity-30 italic text-[10px]">Scanning regional nodes...</div>
          ) : (
            nearbyCasesForMap.map((incident, idx) => (
              <div key={idx} className="group relative bg-white/[0.02] border border-white/5 p-3 hover:bg-white/[0.05] transition-all cursor-crosshair">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold px-1 bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                        {incident.category || "Critical"}
                    </span>
                    <span className="text-[8px] text-slate-600 tabular-nums uppercase">ID: {incident._id?.slice(-6)}</span>
                </div>
                <h3 className="text-xs text-slate-200 font-bold leading-tight mb-1">{incident.title}</h3>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{incident.description}</p>
                
                {/* Visual "Scanner" line on hover */}
                <div className="absolute left-0 top-0 h-full w-[2px] bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
              </div>
            ))
          )}
        </div>

        {/* FOOTER: SYSTEM STATUS */}
        <div className="p-3 bg-black border-t border-purple-900/30 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[8px] uppercase tracking-widest font-bold">Encrypted_Uplink</span>
            </div>
            <span className="text-[8px] opacity-40">v4.0.2_CITIZEN_OS</span>
        </div>
      </div>

      {/* RIGHT SIDE: TACTICAL MAP */}
      <div className="flex-1 relative h-full">
        <MapContainer 
          center={userLoc} 
          zoom={15} 
          minZoom={5}
          maxBounds={INDIA_BOUNDS}
          style={{ height: "100%", width: "100%" }} 
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapController center={userLoc} />
          <HeatmapLayer points={heatMap} />

          <Marker position={userLoc} icon={L.divIcon({
            className: 'user-node',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute w-12 h-12 rounded-full border border-cyan-400/40 animate-[ping_2s_linear_infinite]"></div>
                <div class="w-3 h-3 bg-cyan-400 rounded-full border-2 border-black shadow-[0_0_15px_#22d3ee] z-10"></div>
              </div>`
          })} />
        </MapContainer>

        {/* UI OVERLAYS */}
        <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
             <button className="bg-black/60 backdrop-blur-md border border-white/10 p-2 hover:bg-cyan-500/20 transition-colors">
                <Navigation size={18} className="text-white" />
             </button>
             <button className="bg-black/60 backdrop-blur-md border border-white/10 p-2 hover:bg-red-500/20 transition-colors">
                <ShieldAlert size={18} className="text-white" />
             </button>
        </div>
      </div>
    </div>
  );
};

export default Tracking;