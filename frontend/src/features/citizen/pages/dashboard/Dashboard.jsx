import React, { useState } from "react";
import { Plus, X, ShieldCheck } from "lucide-react"; 
import useAuth from "../../../auth/hooks/useAuth";
import ReportCaseForm from "../../../cases/pages/ReportCrime";
import MyCasesList from "../../../cases/pages/MyCasesList";
import NearbyMap from "../../component/NearbyMap";
import AlertPanel from "../../component/AlertPanel";
import CaseTimeline from "../../component/CaseTimeline";

const Dashboard = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const activeCaseSteps = [
        { status: 'Reported', date: 'Mar 28', description: 'Incident logged in system.', completed: true },
        { status: 'Assigned', date: 'Mar 29', description: 'Officer assigned to verify.', completed: true, officer: 'Sgt. Stark' },
        { status: 'Review', date: 'Current', description: 'Pending evidence upload.', completed: false },
    ];

    return (
        <div className="relative space-y-8 animate-in fade-in duration-700">
        </div>
    );
};

export default Dashboard;
