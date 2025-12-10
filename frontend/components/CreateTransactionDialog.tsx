'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { transactionsAPI } from '@/lib/api';
import { calculateTransactionFee, isValidEthereumAddress } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'transaction-form-draft';

const transactionSchema = z.object({
  toAddress: z
    .string()
    .min(1, 'To address is required')
    .refine(isValidEthereumAddress, {
      message: 'Invalid Ethereum address (must be 0x followed by 40 hex characters)',
    }),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  gasLimit: z.string().optional(),
  gasPrice: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface CreateTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTransactionDialog({
  open,
  onClose,
  onSuccess,
}: CreateTransactionDialogProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      toAddress: '',
      amount: '',
      gasLimit: '21000',
      gasPrice: '0.00000002',
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (open) {
      try {
        const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (draft) {
          const parsedDraft = JSON.parse(draft);
          setValue('toAddress', parsedDraft.toAddress || '');
          setValue('amount', parsedDraft.amount || '');
          setValue('gasLimit', parsedDraft.gasLimit || '21000');
          setValue('gasPrice', parsedDraft.gasPrice || '0.00000002');
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [open, setValue]);

  useEffect(() => {
    if (open) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formValues));
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }
  }, [formValues, open]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const response = await transactionsAPI.create({
        toAddress: data.toAddress,
        amount: data.amount,
        gasLimit: data.gasLimit || '21000',
        gasPrice: data.gasPrice || '0.00000002',
      });

      const transactionHash = response.data.data.hash;

      toast({
        title: 'Transaction Created!',
        description: `Transaction hash: ${transactionHash.slice(0, 10)}...`,
      });

      localStorage.removeItem(DRAFT_STORAGE_KEY);

      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          'Failed to create transaction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const transactionFee = calculateTransactionFee(
    formValues.gasLimit || '21000',
    formValues.gasPrice || '0.00000002'
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Transaction</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new blockchain transaction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="toAddress">
              To Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="toAddress"
              placeholder="0x..."
              {...register('toAddress')}
              className={errors.toAddress ? 'border-destructive' : ''}
            />
            {errors.toAddress && (
              <p className="text-sm text-destructive">
                {errors.toAddress.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (ETH) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.0"
              {...register('amount')}
              className={errors.amount ? 'border-destructive' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gasLimit">Gas Limit</Label>
            <Input
              id="gasLimit"
              type="text"
              placeholder="21000"
              {...register('gasLimit')}
              className={errors.gasLimit ? 'border-destructive' : ''}
            />
            {errors.gasLimit && (
              <p className="text-sm text-destructive">
                {errors.gasLimit.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gasPrice">Gas Price (ETH)</Label>
            <Input
              id="gasPrice"
              type="text"
              placeholder="0.00000002"
              {...register('gasPrice')}
              className={errors.gasPrice ? 'border-destructive' : ''}
            />
            {errors.gasPrice && (
              <p className="text-sm text-destructive">
                {errors.gasPrice.message}
              </p>
            )}
          </div>

          <div className="rounded-lg border bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Estimated Transaction Fee:
              </span>
              <span className="font-semibold">{transactionFee.toFixed(8)} ETH</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
