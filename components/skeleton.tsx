// components/skeleton.tsx
import { LoadingSpinner } from "./loading-spinner";

export const CardSkeleton = () => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 h-[180px] animate-pulse">
    <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
    <div className="h-10 w-1/2 bg-gray-200 rounded mt-4"></div>
  </div>
);

export const TableSkeleton = () => (
  <div className="w-full overflow-hidden">
    <div className="grid grid-cols-8 gap-4 mb-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-6 bg-gray-200 rounded"></div>
      ))}
    </div>
    {[...Array(5)].map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-8 gap-4 mb-3">
        {[...Array(8)].map((_, colIndex) => (
          <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

export const FullPageLoading = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <LoadingSpinner />
  </div>
);