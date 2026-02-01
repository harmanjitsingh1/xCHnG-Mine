import React, { useEffect, useState } from 'react';

const OfflinePage = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);

    try {
      // Attempt to fetch a tiny asset with a cache-buster (timestamp)
      // to force an actual network request.
      const response = await fetch(`/favicon.svg?t=${Date.now()}`, {
        mode: 'no-cors',
        cache: 'no-store'
      });

      if (response) {
        // If we get here, the network is functional. 
        // The useOnlineStatus hook will eventually pick this up, 
        // but we can help it by manually triggering a check or 
        // just letting the user know they are actually online.
        console.log("Connection restored!");
      }
    } catch (error) {
      console.log("Still offline...");
    } finally {
      // Small delay so the user sees the "Checking..." state
      setTimeout(() => setIsChecking(false), 1000);
    }
  };

  return (
    <div className="absolute top-0 left-0 min-w-screen z-50 flex flex-col items-center justify-center min-h-screen bg-black/70 text-gray-800">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-md flex flex-col items-center justify-center ">
        {/* You can use an icon here */}
        <svg
          className="w-20 h-20 mx-auto mb-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>

        <h1 className="text-2xl font-bold mb-2">No Internet Connection</h1>
        <p className="text-gray-600 mb-6">
          It seems you are offline. Check your internet connection.
          The app will resume automatically when you are back online.
        </p>

        <button
          onClick={handleRetry}
          disabled={isChecking}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all flex items-center gap-2 disabled:bg-gray-400"
        >
          {isChecking ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Checking...
            </>
          ) : (
            "Retry Now"
          )}
        </button>
      </div>
    </div>
  );
};

export default OfflinePage;