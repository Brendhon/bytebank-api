import { Document, model, models, Schema, Types } from 'mongoose';
import { ITransaction, TransactionDesc, TransactionType } from '../types';

type SchemaType = Document & Omit<ITransaction, 'user'> & {
  user: Types.ObjectId;
};

const TransactionSchema = new Schema<SchemaType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',       // MongoDB reference to the User model
      required: true,
    },
    desc: {
      type: String,
      enum: Object.keys(TransactionDesc),
      required: true,
    },
    type: {
      type: String,
      enum: Object.keys(TransactionType),
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    alias: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create an index on the user and date fields for better query performance
TransactionSchema.index({ user: 1, date: -1 });

// Get the model from the models object or create a new one if it doesn't exist
// This is useful for avoiding "OverwriteModelError" when using hot reloading in development
export const TransactionModel = models.Transaction || model<SchemaType>('Transaction', TransactionSchema);