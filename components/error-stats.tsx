'use client';

export default function ErrorComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-red-600">
          Error Loading Statistics
        </h2>
        <p className="text-gray-600">
          There was an error loading the statistics data. Please refresh the page to try again.
        </p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
      >
        Refresh Page
      </button>
    </div>
  );
}