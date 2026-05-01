import React, { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { Bell, LogOut, ShieldAlert, Zap, Menu, X, ChevronRight } from "lucide-react";

const MainLayout = () => {
    const { user, handleLogout } = useAuth();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar Toggle State
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const notifications = [
        { id: 1, text: "Case #4412 has been updated by Officer Sarah.", time: "2m ago", type: "update" },
        { id: 2, text: "Security Alert: Unauthorized access attempt in Sector 4.", time: "15m ago", type: "alert" },
        { id: 3, text: "Monthly security report is ready for download.", time: "1h ago", type: "system" },
    ];

    return (
        <div className="flex min-h-screen bg-white font-sans antialiased">
            {/* Pass the setter function to the sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 px-10 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-50/50">
                    <div className="flex items-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Node: {user?.role}_SECURE</span>
                    </div>

                    <div className="flex items-center gap-10">
                        {/* Notifications */}
                        <div className="text-slate-300 hover:text-emerald-600 cursor-pointer transition-colors">
                            <Bell size={18} />
                        </div>

                        {/* User Meta */}
                        <div className="flex items-center gap-4 border-l border-slate-50 pl-10">
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-slate-800 leading-none">{user?.name}</p>
                                <p className="text-[9px] text-emerald-500 font-bold mt-1.5 tracking-widest uppercase">Authorized</p>
                            </div>
                            <button onClick={handleLogout} className="text-slate-300 hover:text-red-500 transition-colors">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-[1600px] w-full mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
