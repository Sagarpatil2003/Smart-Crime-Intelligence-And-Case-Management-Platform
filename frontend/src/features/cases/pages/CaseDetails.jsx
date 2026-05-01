import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
    AlertCircle, ArrowLeft, MapPin, Shield, History,
    User, Info, Layers, Activity, ExternalLink, CheckCircle2
} from "lucide-react";
import {
    fetchCaseDetails,
    submitEvidence,
    resetCaseStatus,
    submitWitnessEvidence,
    fetchCaseLog
} from "../slice/caseSlice";
import LoadingSkeleton from "../components/loadingSkeleton";

const CaseDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    // Redux State
    const { currentCase, logs, loading, error, success } = useSelector((state) => state.cases);

    // Component Local State
    const [evidenceType, setEvidenceType] = useState("DOCUMENT");
    const [selectedFile, setSelectedFile] = useState(null);
    const [filterUnique, setFilterUnique] = useState(false);
    const [witnessData, setWitnessData] = useState({
        name: "",
        contact: "",
        statement: "",
        address: ""
    });

    // Initial Data Fetch
    useEffect(() => {
        if (id) {
            dispatch(fetchCaseDetails(id));
            dispatch(fetchCaseLog(id));
        }
    }, [id, dispatch]);

    // Cleanup and Success Handlers
    useEffect(() => {
        if (success) {
            dispatch(fetchCaseDetails(id));
            dispatch(fetchCaseLog(id));
            setSelectedFile(null);
            setWitnessData({ name: "", contact: "", statement: "", address: "" }); // Reset witness form

            const timer = setTimeout(() => dispatch(resetCaseStatus()), 500);
            return () => clearTimeout(timer);
        }
    }, [success, id, dispatch]);

    // Performance Optimization: Memoize Filtered History
    const displayedHistory = useMemo(() => {
        const history = currentCase?.data?.history || [];
        if (!filterUnique) return history;

        // Logic: Only show status changes (filter out consecutive duplicates)
        return history.filter((item, index, self) =>
            index === 0 || item.status !== self[index - 1].status
        );
    }, [currentCase?.data?.history, filterUnique])

    // Form Handlers
    const handleWitnessChange = useCallback((e) => {
        const { name, value } = e.target;
        if (error) dispatch(resetCaseStatus())
        setWitnessData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmitEvidence = (e) => {
        e.preventDefault();
        if (evidenceType === "WITNESS_STATEMENT") {
            dispatch(submitWitnessEvidence({ caseId: id, witnessData }));
        } else {
            if (!selectedFile) return;
            const formData = new FormData();
            formData.append("evidenceType", evidenceType);
            formData.append("file", selectedFile);
            formData.append("caseId", id);
            dispatch(submitEvidence({ caseId: id, formData }));
        }
    };

    const getMapUrl = (lng, lat) => `https://www.google.com/maps/search/?api=1&query=${lng},${lat}`;

    if (loading && !currentCase) return <LoadingSkeleton />;

    return (
        <div className="p-4 max-w-6xl mx-auto bg-white min-h-screen font-sans">
            {/* Breadcrumb */}
            <nav className="flex items-center text-[10px] text-gray-400 mb-4 space-x-2 uppercase tracking-widest">
                <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
                <span>/</span>
                <Link to="/cases" className="hover:text-emerald-600 transition-colors">My Cases</Link>
                <span>/</span>
                <span className="text-emerald-700 font-bold tracking-tighter">REPORT_{id?.slice(-5)}</span>
            </nav>
            {/* Error Feedback */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="text-red-600" />
                    <div>
                        <p className="text-[10px] font-black text-red-800 uppercase tracking-widest">Submission Error</p>
                        <p className="text-xs text-red-600 font-medium lowercase first-letter:uppercase">
                            {typeof error === 'string' ? error : error.message || "Validation failed. Please check your input."}
                        </p>
                    </div>
                </div>
            )}
            {currentCase ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Case Header */}
                        <div className="bg-white p-5 border border-gray-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                                        Case ID: {currentCase.data.caseNumber}
                                    </p>
                                    <h2 className="text-2xl font-black text-slate-800 mt-1 uppercase tracking-tighter leading-none">
                                        {currentCase.data.title}
                                    </h2>
                                </div>
                                <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest">
                                    {currentCase.data.status?.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-50 pt-5">
                                <div className="md:col-span-2">
                                    <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-2 flex items-center gap-1.5 tracking-[0.15em]">
                                        <Info size={13} strokeWidth={3} /> Incident Summary
                                    </h4>
                                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                                        {currentCase.data.description}
                                    </p>
                                </div>
                                <div className="bg-emerald-50/20 p-4 border border-emerald-100/50">
                                    <div className="mb-3">
                                        <p className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest">Classification</p>
                                        <p className="text-xs font-bold text-emerald-900 uppercase">{currentCase.data.crimeType}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest">Priority Level</p>
                                        <p className={`text-xs font-bold uppercase ${currentCase.data.priority === 'CRITICAL' ? 'text-red-600' : 'text-emerald-900'}`}>
                                            {currentCase.data.priority}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Form */}
                        <div className="bg-white p-5 border border-gray-200 shadow-sm">
                            <h3 className="text-[11px] font-black mb-5 flex items-center gap-2 uppercase tracking-[0.2em] text-slate-400 border-b border-gray-50 pb-2">
                                <Layers size={14} className="text-emerald-600" /> Append Evidence
                            </h3>
                            <form onSubmit={handleSubmitEvidence} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                <div className="md:col-span-2">
                                    <select
                                        value={evidenceType}
                                        onChange={(e) => setEvidenceType(e.target.value)}
                                        className="w-full p-2.5 border border-gray-200 bg-gray-50 text-[11px] font-bold uppercase focus:ring-1 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="DOCUMENT">Document</option>
                                        <option value="IMAGE">Image</option>
                                        <option value="VIDEO">Video</option>
                                        <option value="WITNESS_STATEMENT">Witness Statement</option>
                                    </select>
                                </div>

                                {evidenceType === "WITNESS_STATEMENT" ? (
                                    <div className="md:col-span-4 grid grid-cols-2 gap-2">
                                        <input name="name" value={witnessData.name} placeholder="WITNESS NAME" onChange={handleWitnessChange} className="p-2 border text-[11px] uppercase focus:border-emerald-500 outline-none" required />
                                        <input
                                            name="contact"
                                            value={witnessData.contact}
                                            placeholder="CONTACT INFO (10 DIGITS)"
                                            onChange={handleWitnessChange}
                                            className={`p-2 border text-[11px] uppercase outline-none transition-colors ${error?.includes('contact') ? 'border-red-500 bg-red-50' : 'focus:border-emerald-500'
                                                }`}
                                            required
                                        />
                                        <textarea name="address" value={witnessData.address} placeholder="CURRENT ADDRESS" onChange={handleWitnessChange} className="col-span-2 p-2 border text-[11px] uppercase focus:border-emerald-500 outline-none" rows="1" required />
                                        <textarea name="statement" value={witnessData.statement} placeholder="STATEMENT DETAILS..." onChange={handleWitnessChange} className="col-span-2 p-2 border text-[11px] uppercase focus:border-emerald-500 outline-none" rows="2" required />
                                    </div>
                                ) : (
                                    <div className="md:col-span-4 flex items-center">
                                        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="w-full text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-6 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer" required />
                                    </div>
                                )}

                                <div className="md:col-span-6 border-t border-gray-50 pt-4 flex items-center">
                                    <button
                                        type="submit"
                                        disabled={loading || (evidenceType !== "WITNESS_STATEMENT" && !selectedFile)}
                                        className="bg-emerald-600 text-white px-8 py-2.5 hover:bg-emerald-700 disabled:bg-gray-200 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                    >
                                        {loading ? "Processing..." : "Commit to File"}
                                    </button>
                                    {success && <span className="ml-4 text-[10px] text-emerald-600 font-bold uppercase animate-pulse">✓ Entry Secured</span>}
                                </div>
                            </form>
                        </div>

                        {/* Audit Log */}
                        <div className="bg-white border border-gray-200 shadow-sm">
                            <div className="bg-gray-50/50 p-3 border-b border-gray-200">
                                <h3 className="text-[11px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-slate-500">
                                    <Activity size={14} className="text-emerald-600" /> Audit Log
                                </h3>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {logs?.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-white shadow-sm z-10">
                                            <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b">
                                                <th className="p-4">Action</th>
                                                <th className="p-4">Identity</th>
                                                <th className="p-4">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {logs.map((log, index) => (
                                                <tr key={index} className="hover:bg-emerald-50/20 transition-colors">
                                                    <td className="p-4 text-[11px] font-bold text-slate-700 uppercase">{log.action}</td>
                                                    <td className="p-4 text-[11px] text-emerald-700 font-mono italic">{log.performedBy?.name || 'SYSTEM'}</td>
                                                    <td className="p-4 text-[10px] text-gray-400 font-mono">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-10 text-center text-[10px] font-bold text-gray-300 uppercase">No history found</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-4">
                        {/* Location Card */}
                        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 pb-2">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2 tracking-widest">
                                    <MapPin size={14} /> Registry Location
                                </h4>
                                <p className="text-[11px] text-slate-600 font-bold uppercase mb-4 leading-tight">
                                    {currentCase.data.location?.address || 'Location Unavailable'}
                                </p>
                            </div>
                            <div className="relative group h-32 bg-slate-100">
                                {currentCase.data.location?.coordinates && (
                                    <>
                                        <iframe
                                            title="Case Location"
                                            width="100%" height="100%" frameBorder="0"
                                            src={`https://maps.google.com/maps?q=${currentCase.data.location.coordinates[1]},${currentCase.data.location.coordinates[0]}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                            className="grayscale contrast-125 opacity-80"
                                        />
                                        <a
                                            href={getMapUrl(currentCase.data.location.coordinates[0], currentCase.data.location.coordinates[1])}
                                            target="_blank" rel="noopener noreferrer"
                                            className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                                        >
                                            <ExternalLink size={16} />
                                            <span className="text-[9px] font-black uppercase">Open Maps</span>
                                        </a>
                                    </>
                                )}
                            </div>
                            <div className="p-2.5 bg-slate-900 flex justify-between items-center px-4">
                                <div className="font-mono text-[9px] text-emerald-400 uppercase">
                                    <span className="opacity-50 mr-1">Lat</span> {currentCase.data.location?.coordinates?.[1]?.toString().slice(0, 8) || 'N/A'}
                                </div>
                                <div className="font-mono text-[9px] text-emerald-400 uppercase">
                                    <span className="opacity-50 mr-1">Lng</span> {currentCase.data.location?.coordinates?.[0]?.toString().slice(0, 8) || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Personnel Card */}
                        <div className="bg-white p-4 border border-gray-200 shadow-sm">
                            <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-4 flex items-center gap-2 tracking-widest">
                                <Shield size={14} /> Personnel
                            </h4>
                            <div className="flex items-center gap-4 bg-gray-50/50 p-2 border border-gray-100">
                                <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center text-emerald-600">
                                    <User size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Primary Officer</p>
                                    <p className="text-xs font-black text-slate-800 uppercase">
                                        {currentCase.data.assignedOfficer?.name || 'UNASSIGNED'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lifecycle History (Memoized) */}
                        <div className="bg-white p-4 border border-gray-200 shadow-sm flex flex-col h-62.5">
                            <div className="flex justify-between items-center mb-5">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2 tracking-widest">
                                    <History size={14} /> Lifecycle History
                                </h4>
                                <button
                                    onClick={() => setFilterUnique(!filterUnique)}
                                    className={`text-[8px] font-black px-2 py-1 border transition-all uppercase ${filterUnique ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-400 border-gray-200'
                                        }`}
                                >
                                    {filterUnique ? 'Filtered' : 'Show All'}
                                </button>
                            </div>

                            <div className="relative flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="absolute left-[7px] top-1 bottom-1 w-[1px] bg-gray-100"></div>
                                {displayedHistory.length > 0 ? (
                                    displayedHistory.map((item, idx) => (
                                        <div key={idx} className="relative mb-6 last:mb-2 group">
                                            <div className="absolute -left-[13px] mt-1">
                                                <div className={`h-2.5 w-2.5 rounded-full ring-4 ring-white ${idx === 0 ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'
                                                    }`}></div>
                                            </div>
                                            <div className="pl-4">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-[10px] font-black text-slate-800 uppercase">
                                                        {item.status?.replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-[8px] font-mono text-gray-400">
                                                        {new Date(item.timestamp).toLocaleDateString('en-GB')}
                                                    </p>
                                                </div>
                                                {item.reason && (
                                                    <p className="text-[10px] text-gray-500 mt-1 italic border-l-2 border-emerald-50 pl-2">
                                                        {item.reason}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex items-center gap-1 opacity-60">
                                                    <CheckCircle2 size={8} className="text-emerald-500" />
                                                    <span className="text-[8px] font-bold text-emerald-700 uppercase">Verified</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[10px] font-bold text-gray-300 uppercase py-2">No lifecycle updates</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-32 border border-dashed border-gray-200 flex flex-col items-center">
                    <AlertCircle className="text-gray-200 mb-4" size={56} />

                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">
                        Access Denied / Record Purged
                    </p>

                    <nav className="flex items-center text-[10px] text-gray-400 space-x-2 uppercase tracking-widest">
                        {/* Step back to full list */}
                        <Link to="/cases" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                            <ArrowLeft size={10} strokeWidth={3} />
                            Back to Cases
                        </Link>

                        <span>/</span>

                        <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">
                            Dashboard
                        </Link>

                        <span>/</span>

                        {/* Dynamic ID reference */}
                        <span className="text-emerald-700 font-bold tracking-tighter">
                            REF_{id?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default CaseDetails;