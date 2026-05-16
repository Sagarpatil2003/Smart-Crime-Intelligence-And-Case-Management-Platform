import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "./features/auth/hooks/useAuth";
import MainLayout from "./components/layote/MainLayout";
import "./App.css";

// Lazy-loaded pages
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const SignupPage = lazy(() => import("./features/auth/pages/SignupPage"));
const Dashboard = lazy(() => import("./features/citizen/pages/Dashboard"));
const AllCases = lazy(() => import("./features/citizen/pages/AllCases"));
const Tracking = lazy(() => import("./features/citizen/pages/Tracking"));
const CaseDetails = lazy(() => import("./features/cases/pages/CaseDetails"));
const ReportCrime = lazy(() => import("./features/cases/pages/ReportCrime"));

// Global reusable fallback loader spinner
const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
    </div>
);

function App() {
    const { user, isInitializing } = useAuth();

    if (isInitializing) {
        return <LoadingScreen />;
    }

    return (
        // Suspense catches the loading states when jumping between dynamically imported pages
        <Suspense fallback={<LoadingScreen />}>
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
        </Suspense>
    );
}

export default App;
