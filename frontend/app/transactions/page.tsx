'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { transactionsAPI } from '@/lib/api';
import {
  Transaction,
  TransactionFilters,
  TransactionStatus,
  SortField,
  SortDirection,
} from '@/types';
import { TransactionTable } from '@/components/TransactionTable';
import { TransactionFiltersComponent } from '@/components/TransactionFiltersComponent';
import { Pagination } from '@/components/Pagination';
import { TransactionDetailsDialog } from '@/components/TransactionDetailsDialog';
import { CreateTransactionDialog } from '@/components/CreateTransactionDialog';
import { TransactionTableSkeleton } from '@/components/TransactionTableSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Plus } from 'lucide-react';

const ITEMS_PER_PAGE = 15;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters and Sorting
  const [filters, setFilters] = useState<TransactionFilters>({
    status: 'all',
    search: '',
    dateFrom: null,
    dateTo: null,
  });
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await transactionsAPI.getAll();
      setTransactions(response.data.data || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (filters.status !== 'all') {
      result = result.filter((tx) => tx.status === filters.status);
    }

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(searchLower) ||
          tx.fromAddress.toLowerCase().includes(searchLower) ||
          tx.toAddress.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter((tx) => new Date(tx.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((tx) => new Date(tx.createdAt) <= toDate);
    }

    return result;
  }, [transactions, filters.status, debouncedSearch, filters.dateFrom, filters.dateTo]);

  const sortedTransactions = useMemo(() => {
    const result = [...filteredTransactions];

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = parseFloat(a.amount) - parseFloat(b.amount);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [filteredTransactions, sortField, sortDirection]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      dateFrom: null,
      dateTo: null,
    });
    setCurrentPage(1);
  };

  const handleTransactionCreated = () => {
    loadTransactions();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your blockchain transactions
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      <TransactionFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {loading && <TransactionTableSkeleton />}

      {!loading && error && (
        <EmptyState type="error" onRetry={loadTransactions} />
      )}

      {!loading && !error && transactions.length === 0 && (
        <EmptyState type="no-data" />
      )}

      {!loading &&
        !error &&
        transactions.length > 0 &&
        sortedTransactions.length === 0 && (
          <EmptyState type="no-results" onReset={handleClearFilters} />
        )}

      {!loading && !error && paginatedTransactions.length > 0 && (
        <>
          <TransactionTable
            transactions={paginatedTransactions}
            onRowClick={setSelectedTransaction}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedTransactions.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      <CreateTransactionDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleTransactionCreated}
      />
    </div>
  );
}

