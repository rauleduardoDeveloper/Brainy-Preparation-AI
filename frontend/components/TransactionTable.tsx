'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAddress, formatAmount, formatTimestamp, copyToClipboard } from '@/lib/utils';
import { Transaction, TransactionStatus } from '@/types';
import { Copy, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SortField, SortDirection } from '@/types';

interface TransactionTableProps {
  transactions: Transaction[];
  onRowClick: (transaction: Transaction) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function TransactionTable({
  transactions,
  onRowClick,
  sortField,
  sortDirection,
  onSort,
}: TransactionTableProps) {
  const { toast } = useToast();

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(
      text,
      () => {
        toast({
          title: 'Copied!',
          description: 'Address copied to clipboard',
        });
      },
      () => {
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard',
          variant: 'destructive',
        });
      }
    );
  };

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'default';
      case TransactionStatus.CONFIRMED:
        return 'default';
      case TransactionStatus.FAILED:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20';
      case TransactionStatus.CONFIRMED:
        return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      case TransactionStatus.FAILED:
        return 'bg-red-500/10 text-red-600 hover:bg-red-500/20';
      default:
        return '';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Hash</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-8 p-0 hover:bg-transparent"
                onClick={() => onSort('amount')}
              >
                Amount
                <SortIcon field="amount" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-8 p-0 hover:bg-transparent"
                onClick={() => onSort('status')}
              >
                Status
                <SortIcon field="status" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-8 p-0 hover:bg-transparent"
                onClick={() => onSort('createdAt')}
              >
                Time
                <SortIcon field="createdAt" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx._id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(tx)}
            >
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span>{formatAddress(tx.hash)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => handleCopy(tx.hash, e)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span>{formatAddress(tx.fromAddress)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => handleCopy(tx.fromAddress, e)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span>{formatAddress(tx.toAddress)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => handleCopy(tx.toAddress, e)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{formatAmount(tx.amount)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(tx.status)}>
                  {tx.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatTimestamp(tx.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
