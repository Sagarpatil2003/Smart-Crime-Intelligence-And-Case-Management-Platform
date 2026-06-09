import {
    LayoutDashboard,
    ShieldAlert,
    Map,
    Siren,
} from "lucide-react";

const navConfig = {
    CITIZEN: [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Report Crime",
            path: "/report",
            icon: Siren,
        },
        {
            name: "My Cases",
            path: "/cases",
            icon: ShieldAlert,
        },
        {
            name: "Live Map",
            path: "/tracking",
            icon: Map,
        },
    ],
};

export default navConfig;