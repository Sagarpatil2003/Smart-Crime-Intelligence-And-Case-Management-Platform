import { Shield } from 'lucide-react';



const CaseTimeline = ({ steps }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
      {/* Background Decal */}
      <div className="absolute -right-4 -top-4 text-zinc-800/20 select-none pointer-events-none">
        <Shield size={120} />
      </div>

      <div className="relative z-10 space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4 group">
            {/* Connector Logic */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                step.completed 
                ? "bg-amber-600 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                : "border-zinc-700 bg-zinc-950"
              }`}>
                {step.completed && <div className="w-1.5 h-1.5 bg-black rounded-full"></div>}
              </div>
              {index !== steps.length - 1 && (
                <div className={`w-0.5 h-12 my-1 ${step.completed ? "bg-amber-600/30" : "bg-zinc-800"}`}></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2 border-b border-zinc-800/50">
              <div className="flex justify-between items-center mb-1">
                <h4 className={`text-xs font-black uppercase tracking-widest ${step.completed ? 'text-amber-500' : 'text-zinc-500'}`}>
                  {step.status}
                </h4>
                <span className="text-[9px] font-mono text-zinc-600">{step.date}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight mb-2">
                {step.description}
              </p>
              {step.officer && (
                <span className="text-[9px] bg-zinc-950 text-amber-700 border border-amber-900/30 px-2 py-0.5 rounded font-mono uppercase italic">
                  Auth: {step.officer}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CaseTimeline