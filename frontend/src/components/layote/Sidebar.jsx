import { NavLink } from "react-router-dom";
import navConfig from "../../layout/NavConfig";
import useAuth from "../../features/auth/hooks/useAuth";
import { ChevronLeft, ChevronRight } from "lucide-react"; 

// Ensure BOTH props are received here
const Sidebar = ({ isOpen, setIsSidebarOpen }) => { 
    const { user } = useAuth();
    const menuItems = navConfig[user?.role] || [];

   return (
        /* Added z-50 to stay on top and removed any potential overflow-hidden */
        <div className={`h-screen sticky top-0 flex flex-col transition-all duration-300 bg-white border-r border-slate-100 z-50 ${isOpen ? "w-64" : "w-20"}`}>
            
            {/* TOGGLE BUTTON: Positioned exactly on the line */}
            <button 
                type="button"
                onClick={() => setIsSidebarOpen(!isOpen)} 
                className="absolute -right-3.5 top-8 z-[60] w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 shadow-md transition-all cursor-pointer"
            >
                {isOpen ? <ChevronLeft size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
            </button>

            {/* Logo Area */}
            <div className={`flex items-center gap-3 h-20 ${isOpen ? "px-8" : "justify-center"}`}>
                <div className="w-1 h-5 bg-emerald-500 rounded-full" /> 
                {isOpen && <h1 className="text-[13px] font-black uppercase tracking-widest text-slate-800">Citizen.OS</h1>}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 mt-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 py-4 relative group transition-colors
                                ${isActive ? "text-emerald-600 font-bold" : "text-slate-400 hover:text-slate-800"} 
                                ${isOpen ? "px-8" : "justify-center"}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                                    {isOpen && <span className="text-[13px] tracking-tight">{item.name}</span>}
                                    {isActive && (
                                        <div className="absolute right-[-1px] w-[2px] h-6 bg-emerald-500 rounded-l-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
