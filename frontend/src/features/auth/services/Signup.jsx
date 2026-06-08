import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "./authService";
import { Shield, User, Mail, Lock, MapPin, Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState("Detecting tactical grid...");
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CITIZEN",
    address: "",
    coordinates: [0, 0]
  });

  useEffect(() => {
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude, accuracy } = position.coords;
          setFormData((prev) => ({
            ...prev,
            coordinates: [longitude, latitude]
          }));
          setLocation0Status(`📍 Grid Lock Established (${Math.round(accuracy)}m accuracy)`);
        },
        (error) => {
          let msg = "⚠️ Telemetry Failure";
          if (error.code === 1) msg = "⚠️ Permissions Required for Node Registry";
          if (error.code === 3) msg = "⚠️ Connection Timeout. Retrying...";
          setLocationStatus(msg);
        },
        geoOptions
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const [lng, lat] = formData.coordinates;
    if (lng === 0 && lat === 0) {
      setErrorMsg("📍 Core telemetry coordinates missing. Geolocation permission is mandatory for secure operations.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const finalData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        location: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
          address: formData.address || ""
        }
      };

      await authService.register(finalData);
      navigate("/login");
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorMsg("📧 Node Conflict: Identity token matching this email already exists.");
      } else {
        setErrorMsg(error.response?.data?.message || "Uplink Error. Server rejected package transmission.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#010208] font-mono p-4 relative overflow-hidden">
      
      {/* Visual background element */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      <div className="w-full max-w-md bg-[#05070f] border border-purple-900/30 shadow-[0_0_50px_rgba(88,28,135,0.15)] z-10">
        
        {/* Decorative Top Border */}
        <div className="h-[2px] bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 w-full" />
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Header Block */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-purple-400">
              <Shield size={18} className="animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-black">Identity::Gateway</span>
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Initialize_New_Node</h2>
          </div>

          {/* System Warnings/Errors */}
          {errorMsg && (
            <div className="p-3 text-[10px] text-red-400 bg-red-950/20 border border-red-500/20 uppercase tracking-tight">
              {errorMsg}
            </div>
          )}

          {/* Input Groups */}
          <div className="space-y-3">
            {/* Full Name */}
            <div className="relative flex items-center">
              <User size={14} className="absolute left-3 text-slate-500" />
              <input
                name="name"
                type="text"
                placeholder="REGISTRY_NAME"
                required
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-black/40 border border-purple-900/20 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors uppercase"
              />
            </div>

            {/* Email Address */}
            <div className="relative flex items-center">
              <Mail size={14} className="absolute left-3 text-slate-500" />
              <input
                name="email"
                type="email"
                placeholder="UPLINK_EMAIL_ADDR"
                required
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-black/40 border border-purple-900/20 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* Password Validation */}
            <div className="relative flex items-center">
              <Lock size={14} className="absolute left-3 text-slate-500" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="ACCESS_CRYPT_KEY"
                required
                onChange={handleChange}
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-black/40 border border-purple-900/20 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Role Custom Select Configuration */}
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[8px] text-slate-500 uppercase flex items-center pl-1">Operational_Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-[10px] bg-black/60 border border-purple-900/30 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500/50 tracking-wide"
              >
                <option value="CITIZEN">CITIZEN_UNIT</option>
                <option value="OFFICER">TACTICAL_OFFICER</option>
                <option value="LAWYER">LEGAL_REPRESENTATIVE</option>
              </select>
            </div>

            {/* Physical Location Overrides */}
            <div className="relative flex items-center">
              <MapPin size={14} className="absolute left-3 text-slate-500" />
              <input
                name="address"
                type="text"
                placeholder="PHYSICAL_SECTOR_ADDR (OPTIONAL)"
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-black/40 border border-purple-900/20 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors uppercase"
              />
            </div>
          </div>

          {/* Telemetry Status Readout */}
          <div className="bg-black/60 border-l-2 border-purple-500 p-2 text-[9px] tabular-nums flex items-center justify-between">
            <span className="text-slate-500 uppercase tracking-tighter">Telemetry:</span>
            <span className="text-purple-400 font-bold">{locationStatus}</span>
          </div>

          {/* Execution Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden bg-purple-950/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/20 hover:text-white font-bold py-3 text-xs tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.99] disabled:opacity-40 disabled:cursor-wait"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                <span>Broadcasting_Token...</span>
              </div>
            ) : (
              "Authorize_Account"
            )}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default SignUp;