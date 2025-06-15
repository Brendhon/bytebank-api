// Enums
export enum TransactionDesc {
  deposit = 'deposit',
  transfer = 'transfer',
  withdrawal = 'withdrawal',
  payment = 'payment',
}

export enum TransactionType {
  outflow = 'outflow',
  inflow = 'inflow',
}

// Types
type TransactionDescKey = keyof typeof TransactionDesc;
type TransactionTypeKey = keyof typeof TransactionType;

// Interface for transaction
export interface ITransaction {
  _id?: string
  date: string
  alias?: string
  type: TransactionTypeKey
  desc: TransactionDescKey
  value: number
  user?: string
}

export interface TransactionSummary {
  balance: number;
  breakdown: Record<TransactionDescKey, number>;
}