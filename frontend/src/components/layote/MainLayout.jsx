import React, { useState, useRef, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSocket } from "../hook/useSocket"; // Import Socket Hook
import { Bell, LogOut, CheckCircle2, ShieldAlert, Info, Terminal } from "lucide-react";
import { format } from "date-fns";

const MainLayout = () => {
    const { user, handleLogout } = useAuth();
    const { notifications, unreadCount, markAsRead } = useSocket(); // Consume Socket Context
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

    // Helper for notification icons inside the dropdown
    const getNotifIcon = (type) => {
        switch (type) {
            case 'CRIME_ALERT': return <ShieldAlert size={14} className="text-red-500" />;
            case 'STATUS_CHANGE': return <Info size={14} className="text-blue-500" />;
            case 'ASSIGNMENT': return <Terminal size={14} className="text-indigo-500" />;
            default: return <Bell size={14} className="text-slate-400" />;
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans antialiased">
            <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 px-10 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-50/50">
                    <div className="flex items-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Node: {user?.role}_SECURE</span>
                    </div>

                    <div className="flex items-center gap-10">
                        {/* Notification Bell with Badge */}
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => {
                                    setIsNotifOpen(!isNotifOpen);
                                    if (!isNotifOpen) markAsRead(); // Clear count when opening
                                }}
                                className={`relative p-2 transition-colors duration-200 rounded-full ${isNotifOpen ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-emerald-600 hover:bg-slate-50'}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isNotifOpen && (
                                <div className="absolute right-0 mt-4 w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Notifications</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">{notifications.length} Total</span>
                                    </div>

                                    <div className="max-h-[350px] overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((note, index) => (
                                                <div key={index} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                                                    <div className="flex gap-3">
                                                        <div className="mt-0.5">{getNotifIcon(note.type)}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-slate-900 truncate">{note.title}</p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{note.message}</p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="text-[9px] text-slate-400 font-medium">
                                                                    {note.createdAt ? format(new Date(note.createdAt), 'HH:mm') : 'Just now'}
                                                                </span>
                                                                {note.actionUrl && (
                                                                    <Link 
                                                                        to={note.actionUrl} 
                                                                        className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => setIsNotifOpen(false)}
                                                                    >
                                                                        View Details
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-10 text-center">
                                                <CheckCircle2 className="mx-auto text-slate-200 mb-2" size={24} />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">System Clear</p>
                                            </div>
                                        )}
                                    </div>
                                    <Link 
                                        to="/notifications" 
                                        className="block p-3 text-center text-[10px] font-black text-slate-400 hover:text-emerald-600 bg-slate-50/50 transition-colors uppercase tracking-widest border-t border-slate-100"
                                        onClick={() => setIsNotifOpen(false)}
                                    >
                                        View Archive
                                    </Link>
                                </div>
                            )}
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