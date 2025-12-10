'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction, TransactionStatus } from '@/types';
import {
  formatAmount,
  formatTimestamp,
  copyToClipboard,
  calculateTransactionFee,
} from '@/lib/utils';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionDetailsDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function TransactionDetailsDialog({
  transaction,
  open,
  onClose,
}: TransactionDetailsDialogProps) {
  const { toast } = useToast();

  if (!transaction) return null;

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(
      text,
      () => {
        toast({
          title: 'Copied!',
          description: `${label} copied to clipboard`,
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

  const transactionFee = calculateTransactionFee(
    transaction.gasLimit || '21000',
    transaction.gasPrice || '0.00000002'
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            View complete information about this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Transaction Hash
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {transaction.hash}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(transaction.hash, 'Transaction hash')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Status
            </label>
            <div>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              From Address
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {transaction.fromAddress}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleCopy(transaction.fromAddress, 'From address')
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              To Address
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {transaction.toAddress}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(transaction.toAddress, 'To address')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Amount
              </label>
              <div className="rounded-md bg-muted px-3 py-2 font-semibold">
                {formatAmount(transaction.amount)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Timestamp
              </label>
              <div className="rounded-md bg-muted px-3 py-2 text-sm">
                {formatTimestamp(transaction.createdAt)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Gas Limit
              </label>
              <div className="rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {transaction.gasLimit || '21000'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Gas Price
              </label>
              <div className="rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {transaction.gasPrice || '0.00000002'} ETH
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Transaction Fee
            </label>
            <div className="rounded-md bg-muted px-3 py-2 font-semibold">
              {transactionFee.toFixed(8)} ETH
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                window.open(
                  `https://etherscan.io/tx/${transaction.hash}`,
                  '_blank'
                )
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
