export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface Transaction {
  _id: string;
  hash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  status: TransactionStatus;
  gasLimit?: string;
  gasPrice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  toAddress: string;
  amount: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface TransactionFilters {
  status: TransactionStatus | 'all';
  search: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export type SortField = 'createdAt' | 'amount' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
