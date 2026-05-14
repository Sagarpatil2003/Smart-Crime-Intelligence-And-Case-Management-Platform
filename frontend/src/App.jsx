import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "./features/auth/hooks/useAuth";

import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";

import Dashboard from "./features/citizen/pages/Dashboard";
import AllCases from "./features/citizen/pages/AllCases";
import Tracking from "./features/citizen/pages/Tracking";

import CaseDetails from "./features/cases/pages/CaseDetails";
import ReportCrime from "./features/cases/pages/ReportCrime";

import MainLayout from "./components/layote/MainLayout";

import "./App.css";

function App() {
    const { user, isInitializing } = useAuth();

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                Loading...
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
            />

            <Route
                path="/register"
                element={!user ? <SignupPage /> : <Navigate to="/dashboard" replace />}
            />

            {/* Protected Routes */}
            <Route
                path="/"
                element={user ? <MainLayout /> : <Navigate to="/login" replace />}
            >
                <Route index element={<Navigate to="/dashboard" replace />} />

                <Route path="dashboard" element={<Dashboard />} />

                <Route path="report" element={<ReportCrime />} />

                <Route path="cases" element={<AllCases />} />

                <Route path="tracking" element={<Tracking />} />

                <Route path="case/:id" element={<CaseDetails />} />
            </Route>

            {/* Fallback */}
            <Route
                path="*"
                element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
            />
        </Routes>
    );
}

export default App;