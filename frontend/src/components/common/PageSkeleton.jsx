import React from 'react';

const PageSkeleton = () => (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-10 animate-pulse relative overflow-hidden">
        {/* Global Shimmer Animation */}
        <style>{`
            @keyframes skeleton-shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            .shimmer-bg::after {
                content: "";
                position: absolute;
                top: 0; right: 0; bottom: 0; left: 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                animation: skeleton-shimmer 2s infinite;
            }
        `}</style>

        {/* Header Skeleton */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-8">
            <div className="space-y-3">
                <div className="h-8 w-64 bg-slate-200 rounded-lg shimmer-bg relative overflow-hidden" />
                <div className="h-3 w-48 bg-slate-100 rounded-full" />
            </div>
            <div className="h-8 w-32 bg-slate-100 rounded-full" />
        </div>
        
        {/* Form/Data Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-6">
                <div className="h-14 w-full bg-slate-100 rounded-sm" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-14 bg-slate-50 rounded-sm" />
                    <div className="h-14 bg-slate-50 rounded-sm" />
                </div>
                <div className="h-14 w-full bg-slate-100 rounded-sm" />
                <div className="h-32 w-full bg-slate-100 rounded-sm shimmer-bg relative overflow-hidden" />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
                <div className="h-72 w-full bg-slate-200 rounded-sm shimmer-bg relative overflow-hidden" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-slate-50 rounded-sm" />
                    <div className="h-24 bg-slate-50 rounded-sm" />
                </div>
            </div>
        </div>
    </div>
);

export default PageSkeleton;