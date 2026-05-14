import React from "react";
import { Terminal, Info, AlertTriangle, CheckCircle2, Bell, ShieldAlert, Scale } from "lucide-react";
import { useSocket } from "../../context/SocketContext"; // Adjust path to your context
import { format } from "date-fns"; // Recommended for timestamps

const AlertPanel = () => {
    const { notifications, unreadCount, markAsRead } = useSocket();

    // Helper to style based on notification type from your Mongoose Schema
    const getAlertStyles = (type) => {
        switch (type) {
            case 'CRIME_ALERT': 
                return { icon: <ShieldAlert className="text-red-600" />, bg: "bg-red-50", border: "border-red-100" };
            case 'STATUS_CHANGE': 
                return { icon: <Info className="text-blue-600" />, bg: "bg-blue-50", border: "border-blue-100" };
            case 'ASSIGNMENT': 
                return { icon: <Terminal className="text-indigo-600" />, bg: "bg-indigo-50", border: "border-indigo-100" };
            case 'LEGAL_UPDATE': 
                return { icon: <Scale className="text-purple-600" />, bg: "bg-purple-50", border: "border-purple-100" };
            default: 
                return { icon: <Bell className="text-gray-600" />, bg: "bg-gray-50", border: "border-gray-100" };
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-slate-500" />
                    <h3 className="font-bold text-slate-800 tracking-tight">Recent Activity</h3>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={markAsRead}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((note, index) => {
                            const styles = getAlertStyles(note.type);
                            return (
                                <div 
                                    key={note._id || index} 
                                    className={`p-4 transition-colors hover:bg-slate-50 flex gap-4 ${!note.isRead ? 'bg-white' : 'bg-slate-50/30'}`}
                                >
                                    <div className={`p-2.5 rounded-xl h-fit ${styles.bg}`}>
                                        {styles.icon}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold text-slate-900">{note.title}</p>
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                                {note.createdAt ? format(new Date(note.createdAt), "p") : "Just now"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                            {note.message}
                                        </p>
                                        {note.actionUrl && (
                                            <a 
                                                href={note.actionUrl} 
                                                className="inline-block pt-1 text-[11px] font-bold text-indigo-600 hover:underline"
                                            >
                                                View Details →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                            <CheckCircle2 className="text-slate-300" size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-800">You're all caught up</p>
                        <p className="text-xs text-slate-400 mt-1">New security alerts and case updates will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertPanel;