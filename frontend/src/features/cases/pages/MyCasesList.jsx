import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyCases } from '../slice/caseSlice';
import CaseCard from './CaseCard';
import { Search, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import {useNavigate} from 'react-router-dom';


const MyCases = () => {
  const dispatch = useDispatch();
  const { items, loading, pagination } = useSelector((state) => state.cases)
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    page: 1
  })

  // Fetch data when filters or page change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Pass the current page from state to the API call
      dispatch(fetchMyCases({ ...filters, limit: 5 }));
    }, 500);
    
    return () => clearTimeout(delayDebounceFn) 
  }, [filters, dispatch]);

  // Logic: Reset to page 1 if search/status changes, but keep page if explicitly changing page
  const updateFilter = (key, value) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value, 
      page: key === 'page' ? value : 1 
    }));
  };

  const handlePageChange = (newPage) => {
    updateFilter('page', newPage);
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "", priority: "", page: 1 });
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-3 mb-6">
        

        {/* SEARCH BOX */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Case ID or Title..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm shadow-sm"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            className="text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none hover:border-emerald-500"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">STATUS: ALL</option>
            <option value="REPORTED">REPORTED</option>
            <option value="INVESTIGATION">INVESTIGATION</option>
            <option value="CLOSED">CLOSED</option>
          </select>
    
          <select
            className="text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none hover:border-emerald-500"
            value={filters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
          >
            <option value="">PRIORITY</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
          </select>

          <button
            onClick={resetFilters}
            className="p-2.5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-lg transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-3">
        <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>

        {loading ? (
          Array(5).fill(0).map((_, i) => <CaseCard key={i} isLoading={true} />)
        ) : (
          items?.map((item) => <CaseCard onClick = {()=> navigate(`/case/${item._id}`)} key={item._id} caseData={item} isLoading={false} />)
        )}

        {/* PAGINATION LOGIC */}
        {pagination?.pages > 1 && (
          <div className="flex justify-between items-center pt-6 text-sm text-gray-500 font-medium">
            <span>
              Page <span className="text-gray-900">{filters.page}</span> of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:text-emerald-600 transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={filters.page >= pagination.pages}
                onClick={() => handlePageChange(filters.page + 1)}
                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:text-emerald-600 transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCases;
