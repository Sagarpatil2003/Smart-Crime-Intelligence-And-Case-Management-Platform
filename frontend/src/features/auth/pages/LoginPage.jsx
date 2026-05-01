import { useState } from "react";
import authService from "../services/authService";
import useAuth  from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [credentials, setCredentials] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error) setError("");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await authService.login(credentials);
            setUser(data.user);
            localStorage.setItem("accessToken", data.accessToken);
            navigate("/dashboard");
        } catch (err) {
            const backendMsg = err.response?.data?.message;
            setError(backendMsg || "Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-4">

            <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Welcome Back 👋
                    </h2>
                    <p className="text-sm text-gray-300 mt-2">
                        Login to access your dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl animate-in fade-in">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-400">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            placeholder="officer@system.com"
                            required
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-gray-400">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 active:scale-[0.97] transition-all flex justify-center items-center disabled:opacity-60"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            "Login"
                        )}
                    </button>

                    {/* Footer */}
                    <div className="text-center pt-3">
                        <p className="text-sm text-gray-400">
                            Don’t have an account?{" "}
                            <Link
                                to="/register"
                                className="text-blue-400 font-semibold hover:text-blue-300 transition"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Login;