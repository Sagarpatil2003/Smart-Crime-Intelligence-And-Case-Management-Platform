import { Link } from "react-router-dom";
import Signup from "../services/Signup";

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-4">

      <div className="w-full max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Create Account 🚀</h1>
          <p className="text-gray-400 text-sm mt-2">
            Join the safety network and stay connected
          </p>
        </div>

        <Signup />

        <div className="text-center mt-6 text-sm text-gray-400">
          Already registered?{" "}
          <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;