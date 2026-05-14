    import { useDispatch, useSelector } from "react-redux";
    import { ChevronRight } from "lucide-react";
    import { fetchNearbyCases } from "../../cases/slice/caseSlice";
    import { useEffect } from "react";


    const NearbyCasesList = () => {
        const dispatch = useDispatch();
        const { nearbyCases = [], loading } = useSelector((state) => state.cases);

        useEffect(() => {
            navigator.geolocation.getCurrentPosition((pos) => {
                dispatch(fetchNearbyCases({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    page: 1, 
                    limit: 10
                }));
            }, (err) => console.error("Geo Error", err));
        }, [dispatch]);

        // Loading State
        if (loading && nearbyCases.length === 0) {
            return <div className="p-4 text-[8px] font-black text-slate-400 animate-pulse">SCANNING_LOCATION...</div>;
        }

        return (
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {nearbyCases.length === 0 ? (
                    <div className="p-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        Clear_Sector: No_Threats
                    </div>
                ) : (
                    nearbyCases.map((caseItem) => (
                        <div key={caseItem._id} className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer group">
                            <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${caseItem.priority === 'HIGH' ? 'bg-red-500' : 'bg-orange-400'}`} />
                                    <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-tighter">
                                        {caseItem.title}
                                    </h4>
                                </div>
                                <p className="text-[8px] text-slate-500 uppercase mt-0.5 truncate">
                                    {caseItem.location.address}
                                </p>
                            </div>
                            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    ))
                )}
            </div>
        );
    };
    export default NearbyCasesList;