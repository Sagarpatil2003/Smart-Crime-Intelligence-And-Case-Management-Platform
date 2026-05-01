import React from 'react';
import { PlusCircle, ShieldCheck, ShieldAlert, Calendar, Fingerprint } from 'lucide-react';
import CaseLoadingSkeleton from '../components/loadingSkeleton'


const CaseCard = ({ onClick, caseData, isLoading }) => {

  // If loading, show the Skeleton version of the card
  if (isLoading) {
    return <CaseLoadingSkeleton />;
  }

  if (!caseData) return null;

  const date = new Date(caseData.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
  
  const priorityColor = {
    CRITICAL: "text-red-700 bg-red-50 border-red-200",
    HIGH: "text-orange-700 bg-orange-50 border-orange-200",
    MEDIUM: "text-blue-700 bg-blue-50 border-blue-200",
    LOW: "text-slate-600 bg-slate-50 border-slate-200",
  }

  return (
    <div onClick={onClick} className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col md:flex-row md:items-center gap-5 cursor-pointer">
      {/* STATUS & IDENTIFIER */}
      <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-1.5 min-w-[130px] border-r border-gray-100 pr-2">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${caseData.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
          {caseData.status}
        </span>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-gray-400">
          <Fingerprint size={12} className="text-gray-300" />
          {caseData.caseNumber}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate text-base">
          {caseData.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 text-[12px]">
          <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            <ShieldAlert size={13} className="text-gray-400" />
            <span className="capitalize">{caseData.crimeType || 'General'}</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-500">
            <Calendar size={13} className="text-gray-400" /> {date}
          </span>
          {caseData.assignedOfficer && (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50/50 px-2 py-0.5 rounded-md border border-emerald-100">
              <ShieldCheck size={14} className="text-emerald-600" />
              Officer {caseData.assignedOfficer.name}
            </span>
          )}
        </div>
      </div>

      {/* PRIORITY */}
      <div className="hidden lg:flex flex-col items-center min-w-[90px]">
        <span className="text-[9px] uppercase font-bold text-gray-400 mb-1 tracking-tighter">Severity</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${priorityColor[caseData.priority] || priorityColor.LOW}`}>
          {caseData.priority}
        </span>
      </div>
    </div>
  );
};

export default CaseCard;