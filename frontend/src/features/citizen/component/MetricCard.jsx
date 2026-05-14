

const MetricCard = ({ title, value, icon, isAlert }) => (
    <div className={`p-3 border-2 ${isAlert && value > 0 ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-900'} flex items-center justify-between`}>
        <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{title}</p>
            <p className="text-xl font-black text-slate-900 tabular-nums leading-none">{value}</p>
        </div>
        <div className={isAlert && value > 0 ? 'text-emerald-600' : 'text-slate-300'}>{icon}</div>
    </div>
);

export default MetricCard;