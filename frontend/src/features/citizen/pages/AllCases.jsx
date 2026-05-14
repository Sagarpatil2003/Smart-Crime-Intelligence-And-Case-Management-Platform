import { useState } from "react";
import MyCases from "../../cases/pages/MyCasesList";
import { Search, Filter, RefreshCw } from "lucide-react"; // Optional: install lucide-react for icons

const AllCases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div >
      <MyCases search={searchTerm} status={statusFilter} />
    </div>
  );
};

export default AllCases;

