import React from "react";
import { Terminal, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

const AlertPanel = () => {
  const notifications = [
    { message: "System update completed successfully.", type: "success", time: "10:42" },
    { message: "New login detected: Chrome on Linux.", type: "info", time: "09:15" },
    { message: "Storage reaching 90% capacity.", type: "warning", time: "08:30" },
    { message: "API key 'Production-Main' rotated.", type: "info", time: "04:12" },
    { message: "Database backup finished.", type: "success", time: "01:00" }
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={14} className="text-amber-500" />;
      default: return <Info size={14} className="text-zinc-500" />;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
          <Terminal size={16} />
          System Logs
        </h3>
        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {notifications.map((n, i) => (
          <div key={i} className="group p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex gap-3 items-start hover:border-zinc-700 transition-all">
            <div className="mt-0.5">{getIcon(n.type)}</div>
            <div className="flex-1">
              <p className="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors leading-tight">
                {n.message}
              </p>
              <p className="text-[9px] text-zinc-600 font-mono mt-1 font-bold">
                T-OFFSET: <span className="text-zinc-500">{n.time}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Decal */}
      <div className="mt-4 pt-2 border-t border-zinc-800 flex justify-center">
        <p className="text-[8px] text-zinc-700 font-mono uppercase tracking-widest">
          End of Log — Sector 7G
        </p>
      </div>
    </div>
  );
};

export default AlertPanel;