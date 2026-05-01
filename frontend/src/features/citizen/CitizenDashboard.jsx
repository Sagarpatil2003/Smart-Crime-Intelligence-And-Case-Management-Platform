import React, { useState } from "react"; // Added useState
import { Plus, X } from "lucide-react"; // Added Icons
import ReportCaseForm from "../cases/pages/ReportCrime";
// import MyCasesList from "./components/MyCasesList";
import NearbyMap from "./components/NearbyMap";
import AlertPanel from "./components/AlertPanel";

const CitizenDashboard = () => {
  const [showReportForm, setShowReportForm] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      <header className="mb-8 flex justify-between items-center border-b border-slate-50 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">Citizen Dashboard</h2>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Public Safety & Incident Reporting</p>
        </div>
        <div className="px-4 py-1.5 border border-slate-100 rounded-full text-[10px] font-bold text-emerald-600 tracking-tighter">
          ● SECURE_CONNECTION
        </div>
      </header>

      {/* FLOATING CREATE ICON */}
      <button 
        onClick={() => setShowReportForm(true)}
        className="fixed bottom-10 right-10 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-110 transition-all active:scale-95 group"
        title="Create New Case"
      >
        <Plus size={28} strokeWidth={2.5} />
        {/* Subtle tooltip label */}
        <span className="absolute right-16 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase font-bold tracking-widest">
          File New Report
        </span>
      </button>

      {/* MODAL OVERLAY FOR THE FORM */}
      {showReportForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-sm shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setShowReportForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2"
            >
              <X size={20} />
            </button>
            <div className="p-10 max-h-[85vh] overflow-y-auto">
              <ReportCaseForm />
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <NearbyMap />
          <MyCasesList />
        </div>
        <div className="lg:col-span-4">
          <AlertPanel />
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
