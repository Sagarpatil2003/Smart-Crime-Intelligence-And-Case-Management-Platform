

const CaseLoadingSkeleton = () => {
    const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

    return (
        <div className={`bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-5 ${shimmer}`}>
            <div className="flex md:flex-col items-center md:items-start gap-2 min-w-[130px] border-r border-gray-50 pr-2">
                <div className="h-5 w-20 bg-gray-100 rounded-md" />
                <div className="h-3 w-16 bg-gray-50 rounded mt-1" />
            </div>
            <div className="flex-1 space-y-3">
                <div className="h-5 w-2/3 bg-gray-100 rounded-lg" />
                <div className="flex gap-4">
                    <div className="h-3 w-20 bg-gray-50 rounded" />
                    <div className="h-3 w-20 bg-gray-50 rounded" />
                </div>
            </div>
            <div className="hidden lg:block min-w-[90px]">
                <div className="h-6 w-16 bg-gray-50 rounded-full mx-auto" />
            </div>
            <div className="h-10 w-32 bg-gray-100 rounded-lg" />
        </div>
    )
}

export default CaseLoadingSkeleton