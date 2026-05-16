import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import authService from "../services/authService";
import useAuth from "../hooks/useAuth";

const LoginPage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")
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
            const data = await authService.login(credentials);

            localStorage.setItem("accessToken", data.accessToken);

            localStorage.setItem("user", JSON.stringify(data.user));

            setUser(data.user);
        } catch (err) {
            const backendMessage = err?.response?.data?.message;

            setError(
                backendMessage ||
                    "Invalid email or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4">
            <div className="w-full max-w-md bg-white/10 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Welcome Back 👋
                    </h1>

                    <p className="text-sm text-slate-400 mt-2">
                        Login to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            required
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            required
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-50"
                    >
                        {loading ? "Signing In..." : "Login"}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-sm text-slate-400">
                            Don’t have an account?{" "}
                            <Link
                                to="/register"
                                className="text-blue-400 hover:text-blue-300 font-semibold"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;