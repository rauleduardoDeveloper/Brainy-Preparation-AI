'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Search, FileX } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'error';
  onRetry?: () => void;
  onReset?: () => void;
}

export function EmptyState({ type, onRetry, onReset }: EmptyStateProps) {
  if (type === 'error') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Transactions</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            We encountered an error while loading the transactions. Please try again.
          </p>
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === 'no-results') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            No transactions match your current filters. Try adjusting your search criteria.
          </p>
          {onReset && (
            <Button variant="outline" onClick={onReset}>
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // no-data
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-md">
          There are no transactions to display. Create your first transaction to get started.
        </p>
      </CardContent>
    </Card>
  );
}
