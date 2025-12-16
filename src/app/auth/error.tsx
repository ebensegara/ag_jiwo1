'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We encountered an error loading the authentication page.
        </p>
        <Button
          onClick={() => reset()}
          className="bg-primary hover:bg-primary/90"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
