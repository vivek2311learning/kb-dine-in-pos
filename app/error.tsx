'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>

      <p className="text-gray-500">
        An unexpected error occurred. Please try again.
      </p>

      <button
        onClick={() => reset()}
        className="bg-black text-white px-4 py-2 rounded-lg"
      >
        Try Again
      </button>
    </div>
  );
}
