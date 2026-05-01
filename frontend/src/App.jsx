import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "../src/features/auth/hooks/useAuth";
import LoginPage from "../src/features/auth/pages/LoginPage";
import SignupPage from "../src/features/auth/pages/SignupPage";
import Dashboard from "./features/citizen/pages/dashboard/Dashboard";
import MainLayout from "./components/layote/MainLayout"
import AllCases from "./features/citizen/pages/AllCases"
import Tracking from "./features/citizen/pages/Tracking"
import CaseInfo from "./features/citizen/pages/CaseInfo"
import CaseDetails from "./features/cases/pages/CaseDetails"; 
import ReportCrime from "./features/cases/pages/ReportCrime";
import './App.css'

function App() {
  const { user, isInitializing } = useAuth()

  // 1. Wait for the silent refresh check to finish
  if (isInitializing) return <div>Loading...</div>

  return (

    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={"/dashboard"} />} />
      <Route path="/register" element={!user ? <SignupPage /> : <Navigate to={"/dashboard"} />} />

      <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="report" element={<ReportCrime />} />
        <Route path="cases" element={<AllCases />} />
        <Route path="tracking" element={<Tracking />} />
        {/* <Route path="case-info" element={<CaseInfo />} /> */}
        <Route path ="case/:id" element= {<CaseDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>




  );
}

export default App