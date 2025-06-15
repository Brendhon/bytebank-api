import mongoose, { Schema } from 'mongoose';
import { ITransaction, TransactionDesc, TransactionType } from '@/types';

const TransactionSchema = new Schema<ITransaction>({
  date: { type: String, required: true },
  alias: { type: String },
  type: { type: String, enum: Object.keys(TransactionType), required: true },
  desc: { type: String, enum: Object.keys(TransactionDesc), required: true },
  value: { type: Number, required: true },
  user: { type: String, required: false }
});

export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
