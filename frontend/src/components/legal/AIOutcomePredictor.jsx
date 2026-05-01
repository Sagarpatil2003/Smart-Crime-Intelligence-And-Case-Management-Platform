import React from 'react';
import { BrainCircuit, Activity, Scale } from 'lucide-react';

const AIOutcomePredictor = ({ caseData }) => {
  return (
    <div className="bg-zinc-900 border border-amber-900/20 rounded-xl p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
          <BrainCircuit size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-100">AI Predictive Analysis</h3>
          <p className="text-[9px] text-zinc-500 font-mono italic">MODEL: JURIS-PRO-V1</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Probability Bar */}
        <div>
          <div className="flex justify-between text-[10px] mb-1 font-mono uppercase">
            <span className="text-zinc-400">Predicted Favorable Outcome</span>
            <span className="text-amber-500">68%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)]" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* Complexity Level */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-[9px] text-zinc-500 block uppercase mb-1">Case Complexity</span>
            <span className="text-xs font-bold text-red-500 uppercase tracking-tighter">Level: High</span>
          </div>
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-[9px] text-zinc-500 block uppercase mb-1">Evidence Weight</span>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Sufficient</span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-400 leading-relaxed italic border-l border-amber-800/50 pl-3 py-1">
          "Based on Section 302 precedents and current lawyer insights, a 12-month hearing window is estimated."
        </p>
      </div>
    </div>
  );
};

export default AIOutcomePredictor;