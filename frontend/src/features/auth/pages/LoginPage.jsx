import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import authService from "../services/authService";
import useAuth from "../hooks/useAuth";

const LoginPage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setCredentials((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            console.log(" received data:", credentials);
            let data = await authService.login(credentials);
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
        } catch (err) {
            const backendMessage = err?.response?.data?.message;
            setError(
                backendMessage ||
                "ACCESS_DENIED: Invalid credentials. Verification failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F12] px-4 font-sans antialiased">
            {/* Main Container themed to match the dashboard panels */}
            <div className="w-full max-w-md bg-white/[0.02] border-2 border-[#1E262D] rounded-none shadow-2xl p-8 relative">

                {/* Top decorative accent line resembling dashboard metrics */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#00BA63]" />

                {/* System Status Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-[#00BA63] inline-block animate-pulse"></span>
                        <span className="text-[10px] font-bold tracking-widest text-[#00BA63] uppercase">
                            NODE: CITIZEN_AUTH
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                        CITIZEN.OS LOGIN
                    </h1>
                    <p className="text-xs font-medium text-slate-500 tracking-wide mt-1">
                        Enter authorized credentials to initialize session.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs font-mono tracking-wide uppercase">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Email Input Panel */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                            SECURE_EMAIL
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="user@citizen.os"
                            className="w-full px-4 py-3 bg-[#0B0F12] border border-[#1E262D] text-white placeholder:text-slate-700 text-sm font-mono tracking-wide rounded-none outline-none focus:border-[#00BA63] transition-colors"
                        />
                    </div>

                    {/* Password Input Panel */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                            ACCESS_PASSPHRASE
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-4 pr-12 py-3 bg-[#0B0F12] border border-[#1E262D] text-white placeholder:text-slate-700 text-sm font-mono tracking-wide rounded-none outline-none focus:border-[#00BA63] transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#00BA63] transition-colors focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit System Action */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#0B0F12] border-2 border-[#00BA63] hover:bg-[#00BA63] text-[#00BA63] hover:text-black font-black uppercase text-xs tracking-widest transition-all duration-200 disabled:opacity-40"
                    >
                        {loading ? "INITIALIZING_SESSION..." : "AUTHORIZE_CONNECT"}
                    </button>

                    {/* Secondary Navigation */}
                    <div className="text-center pt-2">
                        <p className="text-xs text-slate-500 tracking-wide">
                            Unregistered node?{" "}
                            <Link
                                to="/register"
                                className="text-white hover:text-[#00BA63] font-bold underline underline-offset-4 decoration-[#1E262D] hover:decoration-[#00BA63] transition-colors"
                            >
                                REQUEST ACCESS
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;