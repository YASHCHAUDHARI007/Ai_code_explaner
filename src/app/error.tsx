'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-destructive h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-headline font-bold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground leading-relaxed">
            The application encountered an unexpected error. We've been notified and are working on it.
          </p>
        </div>
        <div className="p-4 bg-card border rounded-lg text-left overflow-auto max-h-40">
          <code className="text-xs text-destructive font-code">{error.message || 'Unknown error occurred'}</code>
        </div>
        <Button 
          onClick={reset}
          className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
