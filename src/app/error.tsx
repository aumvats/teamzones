"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error.digest ?? "no-digest", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-5">&#9888;&#65039;</p>
        <h1 className="font-heading font-bold text-2xl mb-2">Something went wrong</h1>
        <p className="text-sm text-text-secondary mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
