import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from './authService'

const SignUp = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [locationStatus, setLocationStatus] = useState("Detecting location...")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CITIZEN",
        address: "",
        coordinates: [0, 0]
    })


    useEffect(() => {
        const geoOptions = {
            enableHighAccuracy: true, // Forces the device to use GPS if available
            timeout: 10000,           // Wait up to 10 seconds for a precise lock
            maximumAge: 0             // Do not use a cached location
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude, accuracy } = position.coords;

                   
                    console.log(`Accuracy: ${accuracy} meters`);

                    setFormData(prev => ({
                        ...prev,
                        coordinates: [longitude, latitude]
                    }));
                    setLocationStatus(`📍 Accurate to ${Math.round(accuracy)}m`);
                },
                (error) => {
                    let msg = "⚠️ Location error";
                    if (error.code === 1) msg = "⚠️ Please allow location access";
                    if (error.code === 3) msg = "⚠️ Location timeout - try again";
                    setLocationStatus(msg);
                },
                geoOptions 
            );
        }
    }, []);
    console.log(formData)
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Logic Error: Check if coordinates exist before calling API
        const [lng, lat] = formData.coordinates;
        if (lng === 0 && lat === 0) {
            setErrorMsg("📍 Please allow location access to continue. We need it for the safety network.");
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
            alert("Account Created Successfully!");
            navigate("/login");
        } catch (error) {
            // 2. API Error: Handles 409 (Conflict) or 500 (Server Error)
            if (error.response?.status === 409) {
                setErrorMsg("📧 This email is already registered. Try logging in instead.");
            } else {
                setErrorMsg(error.response?.data?.message || "Something went wrong. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            <h2 className="text-xl font-semibold text-white text-center">
                Join the Network
            </h2>

            {errorMsg && (
                <div className="p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl">
                    {errorMsg}
                </div>
            )}

            {/* Name */}
            <input
                name="name"
                placeholder="Full Name"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* Email */}
            <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* Password */}
            <input
                name="password"
                type="password"
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* Address + Location */}
            <div className="space-y-1">
                <input
                    name="address"
                    placeholder="Physical Address (Optional)"
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />

                <p className="text-xs text-gray-400">
                    {locationStatus}
                </p>
            </div>

            {/* Role */}
            {/* <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
                <option value="CITIZEN">Citizen</option>
                <option value="OFFICER">Officer</option>
                <option value="LAWYER">Lawyer</option>
                <option value="ADMIN">Admin</option>
            </select> */}

            {/* Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 active:scale-[0.97] transition-all flex justify-center items-center disabled:opacity-60"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating account...</span>
                    </div>
                ) : (
                    "Create Account"
                )}
            </button>

        </form>
    );
}

export default SignUp;
