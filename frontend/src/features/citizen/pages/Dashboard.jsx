import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Activity,
    FileText,
    CheckCircle,
    TrendingUp,
    MapPin,
    ShieldAlert,
    ChevronRight
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Filler,
    Tooltip,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { fetchTopCrimeTypesInRadius, fetchCaseState, fetchNearbyCases } from "../../cases/slice/caseSlice";
import NearbyCasesList from "../component/NearbyCasesList.jsx";
import MetricCard from "../component/MetricCard";
import useAuth from "../../auth/hooks/useAuth";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Filler,
    Tooltip
);

const Dashboard = () => {
    const { user } = useAuth();
    const dispatch = useDispatch();

    const {
        totalSubmitted,
        activeCases,
        resolvedCases,
        cityCrimeGraph, // This contains { label, total, percentage } from backend
        nearbyCases,
        loading
    } = useSelector((state) => state.cases);

    useEffect(() => {
        dispatch(fetchCaseState());
        dispatch(fetchTopCrimeTypesInRadius());
    }, [dispatch]);

    // --- REAL API DATA MAPPING ---

    // 1. Incident Matrix (Bar Chart) - Mapping directly to your crimeTypes array
    const chartData = {
        labels: cityCrimeGraph?.length > 0 ? cityCrimeGraph.map(item => item.label) : [],
        datasets: [{
            label: 'Incidents',
            data: cityCrimeGraph?.length > 0 ? cityCrimeGraph.map(item => item.total) : [],
            backgroundColor: '#10b981',
            hoverBackgroundColor: '#059669',
            barThickness: 8,
        }]
    };

    // 2. Resolution Ratio (Doughnut Chart) - Derived from your live metrics
    const donutData = {
        labels: ["Active", "Resolved"],
        datasets: [{
            data: totalSubmitted > 0 ? [activeCases, resolvedCases] : [],
            backgroundColor: ['#ef4444', '#10b981'],
            borderWidth: 0,
        }]
    };

    // 3. Analytics Trend (Line Chart) - Set to empty until you implement trend logic in backend
    const lineData = {
        labels: [],
        datasets: [{
            label: 'Live_Trends',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2
        }]
    };

    const horizontalBarOptions = {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false, grid: { display: false } },
            y: { grid: { display: false }, ticks: { color: '#1e293b', font: { size: 9, weight: 'bold' } } }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="h-screen overflow-hidden bg-white p-4 flex flex-col space-y-4 max-w-[1600px] mx-auto uppercase">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${loading ? 'bg-slate-300 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <span className="text-[8px] font-black tracking-[0.3em] text-emerald-600">
                            {loading ? 'SYNCING_API...' : 'SYSTEM_ACTIVE'}
                        </span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter">
                        {user?.name?.split(' ')[0] || "OPERATOR"}_COMMAND
                    </h1>
                </div>
            </div>

            {/* Metrics Section - Strict API Values */}
            <div className="grid grid-cols-3 gap-3">
                <MetricCard title="Total" value={totalSubmitted || 0} icon={<FileText size={16} />} />
                <MetricCard title="Active" value={activeCases || 0} icon={<Activity size={16} />} isAlert />
                <MetricCard title="Resolved" value={resolvedCases || 0} icon={<CheckCircle size={16} />} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
                <div className="col-span-12 lg:col-span-8 grid grid-rows-2 gap-4 min-h-0">

                    {/* Distribution Bar */}
                    <div className="border border-slate-900 p-4 flex flex-col bg-white">
                        <h3 className="text-[9px] font-black mb-3 flex items-center gap-2">
                            <TrendingUp size={12} className="text-emerald-500" /> Incident_Matrix
                        </h3>
                        <div className="flex-1 min-h-0">
                            {cityCrimeGraph?.length > 0 ? (
                                <Bar data={chartData} options={horizontalBarOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-[8px] font-bold text-slate-400">NO_DATA_REPORTED</div>
                            )}
                        </div>
                    </div>

                    {/* Trend Line */}
                    <div className="border border-slate-900 p-4 flex flex-col bg-white">
                        <h3 className="text-[9px] font-black mb-3 flex items-center gap-2">
                            <Activity size={12} className="text-emerald-500" /> Realtime_Feed
                        </h3>
                        <div className="flex-1 min-h-0">
                            <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
                    <div className="border border-slate-900 flex-1 overflow-hidden flex flex-col bg-white">
                        <div className="bg-slate-900 text-white p-2 text-[9px] font-black flex justify-between items-center">
                            <span className="flex items-center gap-2"><ShieldAlert size={12} /> Proximity_Scan</span>
                            <MapPin size={12} className="text-emerald-400" />
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <NearbyCasesList />
                        </div>
                    </div>

                    <div className="border border-slate-900 p-4 h-[180px] bg-white">
                        <h3 className="text-[9px] font-black mb-2 flex items-center gap-2">
                            <CheckCircle size={12} className="text-emerald-500" /> Case_Resolution
                        </h3>
                        <div className="h-[110px]">
                            {totalSubmitted > 0 ? (
                                <Doughnut data={donutData} options={{ maintainAspectRatio: false }} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-[8px] font-bold text-slate-400 text-center">AWAITING_REPORTS</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};





export default Dashboard;