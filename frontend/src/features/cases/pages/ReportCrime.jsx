import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitCase, resetCaseStatus } from "../slice/caseSlice";
import { MapPin, Shield, Camera, Video, Loader2, CheckCircle2, Navigation, UploadCloud, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import PageSkeleton from "../../../components/common/PageSkeleton";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet Icon Fix
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => { map.setView(coords, 16); }, [coords, map]);
    return null;
}

const ReportCrime = ({ onSuccess }) => {
    const dispatch = useDispatch();
    const { loading, success, error } = useSelector((state) => state.cases);
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isLocating, setIsLocating] = useState(false);
    const [isAddressLoading, setIsAddressLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [accuracy, setAccuracy] = useState(null);
    const [previews, setPreviews] = useState([]);
    const [position, setPosition] = useState([20.5937, 78.9629]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        crimeType: "theft",
        priority: "MEDIUM",
        isAnonymous: false,
        location: { address: "", coordinates: [] },
        evidence: []
    });


    useEffect(() => {
        if (success) {
            setTimeout(() => {
                alert("Incident Transmitted Successfully.");
                dispatch(resetCaseStatus());
                setUploadProgress(0);
                if (onSuccess) onSuccess();
            }, 500);
        }
    }, [success, dispatch, onSuccess, previews]);


    useEffect(() => {
      
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 500);  

        return () => clearTimeout(timer);
    }, [])


    // --- REVERSE GEOCODING ---
    const reverseGeocode = async (lat, lng) => {
        setIsAddressLoading(true);
        try {
            // Added 'addressdetails=1' to get the broken-down address components
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await res.json();

            if (data && data.address) {
                const addr = data.address;

                // Priority: Shop/Building > Road > Neighborhood (Nagar) > City
                const minorDetail = addr.shop || addr.amenity || addr.building || addr.office || addr.neighbourhood || addr.suburb || "";
                const road = addr.road || "";
                const city = addr.city || addr.town || addr.village || "";

                // Construct a more descriptive string
                const detailedAddress = minorDetail
                    ? `${minorDetail}, ${road}, ${city}`.replace(/^, /, '')
                    : data.display_name;

                setForm(prev => ({
                    ...prev,
                    location: { ...prev.location, address: detailedAddress }
                }));
            }
        } catch (error) {
            console.error("Reverse Geocoding Error:", error);
        } finally {
            setIsAddressLoading(false);
        }
    };

    // --- ADDRESS TO COORDS  ---

    const geocodeAddress = async () => {
        if (!form.location.address) { setIsLocating(false); return; }
        try {
            //  fetch URL to point to the correct Nominatim endpoint
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location.address)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                updateLocation([lat, lon]);
            } else {
                alert("Location not found. Try adding a city name.");
            }
        } catch (e) {
            console.error("Geocoding Error:", e);
        } finally {
            setIsLocating(false);
        }
    };

    const handleLocationStrategy = () => {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                setAccuracy(accuracy.toFixed(1));
                updateLocation([latitude, longitude]);
                await reverseGeocode(latitude, longitude);
                setIsLocating(false);
            },
            async () => { await geocodeAddress(); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const updateLocation = (coords) => {
        setPosition(coords);
        setForm(prev => ({
            ...prev,
            location: { ...prev.location, coordinates: [coords[1], coords[0]] }
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setForm(prev => ({ ...prev, evidence: [...prev.evidence, ...files] }));
        const newPreviews = files.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type.startsWith("video") ? "video" : "image"
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        URL.revokeObjectURL(previews[index].url);
        setForm(prev => ({
            ...prev,
            evidence: prev.evidence.filter((_, i) => i !== index)
        }));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

   const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure coordinates exist in the local state
    const [lng, lat] = form.location.coordinates;
    
    if (lng === undefined || lat === undefined || isNaN(lng) || isNaN(lat)) {
        return alert("GPS location is not locked. Please use the navigation button.");
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("crimeType", form.crimeType);
    formData.append("priority", form.priority);
    formData.append("isAnonymous", String(form.isAnonymous)); //
    formData.append("address", form.location.address || "Unknown Location");

    // Pass coordinates to the service for processing
    formData.append("longitude", lng.toString());
    formData.append("latitude", lat.toString());

    form.evidence.forEach((file) => {
        formData.append("evidence", file);
    });

    dispatch(submitCase(formData));

    // Reset local UI state after submission
    setForm({
        title: "",
        description: "",
        crimeType: "theft",
        priority: "MEDIUM",
        isAnonymous: false,
        location: { address: "", coordinates: [] },
        evidence: []
    });
    setPreviews([]);
};



    //    / This shows skeleton on first load OR if Redux is loading and form is empty
    if (isInitialLoading || (loading && form.title === "")) {
        return <PageSkeleton />;
    }
    return (
        <div className="w-full bg-white transition-all max-w-6xl mx-auto pb-10">
            <div className="mb-10 border-b border-slate-100 pb-6 flex justify-between items-end px-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 italic">
                        <Shield className="text-emerald-600" size={28} />
                        INCIDENT REPORT
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] mt-1 uppercase">Node: Secure_Terminal • Precision_Enabled</p>
                </div>
                {accuracy && (
                    <div className={`px-3 py-1 rounded-full border text-[10px] font-black ${accuracy <= 100 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                        ±{accuracy}m PRECISION
                    </div>
                )}
            </div>
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md mb-4 flex items-center gap-2">
                    <X size={14} />
                    <span>{error}</span>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase absolute -top-2 left-4 bg-white px-2">Heading</label>
                            <input className="w-full p-4 border border-slate-200 rounded-sm text-sm" placeholder="What happened?" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <select className="p-4 border border-slate-200 rounded-sm text-sm font-bold bg-slate-50" value={form.crimeType} onChange={(e) => setForm({ ...form, crimeType: e.target.value })}>
                                <option value="theft">Theft</option>
                                <option value="assault">Assault</option>
                                <option value="fraud">Fraud</option>
                            </select>
                            <select className="p-4 border border-slate-200 rounded-sm text-sm font-bold bg-slate-50" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase absolute -top-2 left-4 bg-white px-2">Detected Address</label>
                            <div className="flex gap-2">
                                <input
                                    className={`flex-1 p-4 border border-slate-200 rounded-sm text-sm ${isAddressLoading ? 'bg-slate-50 animate-pulse' : ''}`}
                                    placeholder="Fetching address..."
                                    value={form.location.address}
                                    onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })}
                                />
                                <button type="button" onClick={handleLocationStrategy} className="px-5 bg-slate-900 text-white rounded-sm hover:bg-black transition-all">
                                    {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                                </button>
                            </div>
                        </div>

                        <textarea className="w-full p-4 border border-slate-200 rounded-sm text-sm h-32" placeholder="Describe the incident in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        <div className="h-72 w-full border border-slate-200 rounded-sm overflow-hidden z-10 relative">
                            <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker
                                    position={position}
                                    draggable={true}
                                    eventHandlers={{
                                        dragend: async (e) => {
                                            const latLng = e.target.getLatLng();
                                            updateLocation([latLng.lat, latLng.lng]);
                                            await reverseGeocode(latLng.lat, latLng.lng);
                                        }
                                    }}
                                />
                                <RecenterMap coords={position} />
                            </MapContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-sm hover:bg-emerald-50/30 cursor-pointer group transition-all">
                                <Camera size={24} className="text-slate-300 group-hover:text-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-500 mt-2">PHOTOS</span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-sm hover:bg-emerald-50/30 cursor-pointer group transition-all">
                                <Video size={24} className="text-slate-300 group-hover:text-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-500 mt-2">VIDEOS</span>
                                <input type="file" accept="video/*" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>

                        {previews.length > 0 && (
                            <div className="flex flex-wrap gap-3 p-3 bg-slate-50 border border-slate-100 rounded-sm">
                                {previews.map((p, i) => (
                                    <div key={i} className="relative w-16 h-16 group rounded-sm border border-slate-200 overflow-visible">
                                        <button type="button" onClick={() => removeFile(i)} className="absolute -top-2 -right-2 z-20 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600">
                                            <X size={10} strokeWidth={4} />
                                        </button>
                                        {p.type === 'video' ? (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                <Video size={16} className="text-white" />
                                            </div>
                                        ) : (
                                            <img src={p.url} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="space-y-2 px-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-600">
                            <div className="flex items-center gap-2"><UploadCloud size={14} /> <span>Transmitting Evidence</span></div>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-sm">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" className="w-5 h-5 accent-emerald-600 cursor-pointer" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} />
                        <span className="text-[11px] font-black text-slate-700 uppercase">Report Anonymously</span>
                    </div>


                    <button type="submit" disabled={loading} className="bg-slate-900 text-white px-10 py-5 rounded-sm font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-black transition-all flex items-center gap-3">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        {loading ? "Transmitting..." : "Submit Report"}
                    </button>
                </div>
            </form>
        </div>
    );

};

export default ReportCrime;
