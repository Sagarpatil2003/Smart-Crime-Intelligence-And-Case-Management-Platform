import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import useAuth from "../hooks/useAuth";
import { Shield, User, Mail, Lock, MapPin, Eye, EyeOff } from "lucide-react";

const SignupPage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [locationStatus, setLocationStatus] = useState("DETECTING_GRID_COORDINATES...");
    const [showPassword, setShowPassword] = useState(false);
  
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        coordinates: [0, 0]
    });

    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);

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
                    setLocationStatus(`GRID_LOCK_ESTABLISHED // ACCURACY_MARGIN: ${Math.round(accuracy)}M`);
                },
                (error) => {
                    let msg = "CRITICAL: TELEMETRY_OFFLINE";
                    if (error.code === 1) msg = "PERMISSIONS_DENIED: NODE_REGISTRY_BLOCKED";
                    if (error.code === 3) msg = "TIMEOUT: CONNECTION_FAILED";
                    setLocationStatus(msg);
                },
                geoOptions
            );
        } else {
            setLocationStatus("UNSUPPORTED_ENVIRONMENT: NO_HARDWARE_GPS");
        }
    }, []);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const [lng, lat] = formData.coordinates;
        if (lng === 0 && lat === 0) {
            setErrorMsg("📍 Core telemetry coordinates missing. Geolocation is mandatory for verification.");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            const finalData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: "CITIZEN", // Automatically assigned behind the scenes
                location: {
                    type: "Point",
                    coordinates: [Number(lng), Number(lat)],
                    address: formData.address || ""
                }
            };

            const response = await authService.register(finalData);
            const targetData = response?.data || response;

            if (targetData?.accessToken || targetData?.data?.accessToken) {
                const token = targetData?.data?.accessToken || targetData.accessToken;
                const userData = targetData?.data?.user || targetData.user || targetData;
                localStorage.setItem("accessToken", token);
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
            } else {
                navigate("/login");
            }
        } catch (error) {
            if (error.response?.status === 409) {
                setErrorMsg("📧 Identity token conflict: Node address already assigned.");
            } else {
                setErrorMsg(error.response?.data?.message || "Uplink validation failure.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F12] px-4 relative overflow-hidden antialiased font-mono">
            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.01] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

            <div className="w-full max-w-md bg-white/[0.02] border-2 border-[#1E262D] rounded-none shadow-2xl z-10 relative">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#00BA63]" />
                
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={12} className="text-[#00BA63] animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.25em] font-black text-[#00BA63]">
                                IDENTITY::REGISTRY_GATEWAY
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                            Initialize Node
                        </h1>
                        <p className="text-xs font-medium text-slate-500 tracking-wide mt-1">
                            Deploy new terminal identity instance parameters.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-[11px] uppercase tracking-wide">
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Name Input */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                REGISTRY_NAME
                            </label>
                            <div className="relative flex items-center">
                                <User size={14} className="absolute left-3.5 text-slate-600" />
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Rahul Sharma"
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F12] border border-[#1E262D] text-white placeholder:text-slate-700 text-sm rounded-none outline-none focus:border-[#00BA63] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                UPLINK_EMAIL_ADDR
                            </label>
                            <div className="relative flex items-center">
                                <Mail size={14} className="absolute left-3.5 text-slate-600" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="user@citizen.os"
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F12] border border-[#1E262D] text-white placeholder:text-slate-700 text-sm rounded-none outline-none focus:border-[#00BA63] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                ACCESS_CRYPT_KEY
                            </label>
                            <div className="relative flex items-center">
                                <Lock size={14} className="absolute left-3.5 text-slate-600" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-2.5 bg-[#0B0F12] border border-[#1E262D] text-white placeholder:text-slate-700 text-sm rounded-none outline-none focus:border-[#00BA63] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-slate-600 hover:text-[#00BA63] transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Sector Address Input */}
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    LOCAL_SECTOR_OVERRIDE
                                </label>
                                <span className="text-[8px] font-bold text-slate-600 tracking-wider">[AUTO-RESOLVED IF OMITTED]</span>
                            </div>
                            <div className="relative flex items-center">
                                <MapPin size={14} className="absolute left-3.5 text-slate-600" />
                                <input
                                    name="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Sector 7, Metro Area"
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F12] border border-[#1E262D] text-white placeholder:text-slate-700 text-sm rounded-none outline-none focus:border-[#00BA63] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Telemetry Panel */}
                    <div className="bg-[#0B0F12] border border-[#1E262D] p-3 text-[10px] flex flex-col gap-1">
                        <div className="text-slate-600 text-[9px] uppercase font-bold tracking-widest">SYSTEM_TELEMETRY_LOG</div>
                        <div className="text-[#00BA63] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                            &gt; {locationStatus}
                        </div>
                    </div>

                    {/* Action Controller */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0B0F12] border-2 border-[#00BA63] hover:bg-[#00BA63] text-[#00BA63] hover:text-black font-black uppercase text-xs tracking-widest py-3 transition-all duration-200 disabled:opacity-40"
                    >
                        {loading ? "BROADCASTING_PACKET..." : "AUTHORIZE_ACCOUNT"}
                    </button>
                    
                    <div className="text-center pt-2">
                        <p className="text-xs text-slate-500 tracking-wide">
                            Already registered?{" "}
                            <Link
                                to="/login"
                                className="text-white hover:text-[#00BA63] font-bold underline underline-offset-4 decoration-[#1E262D] hover:decoration-[#00BA63] transition-colors"
                            >
                                TERMINAL_SIGN_IN
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;