
import { LayoutDashboard, ShieldAlert, Map, Activity, LogOut, Siren } from "lucide-react"

const navConfig = {
  CITIZEN: [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    {name: "Report Crime", path: "/report", icon: Siren},
    { name: "My Cases", path: "/cases", icon: ShieldAlert },
    { name: "Live Map", path: "/tracking", icon: Map },
    { name: "Case Info", path: "/case-info", icon: Activity },
    
  ],
  // OFFICER: [
  //   { name: "Assigned Cases", path: "/officer", icon: ShieldAlert },
  //   { name: "Map", path: "/map", icon: Map },
  // ]
};

export default navConfig;


