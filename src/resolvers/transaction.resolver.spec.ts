import 'reflect-metadata'; // This need to be imported before any other imports that use decorators
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionResolver } from './transaction.resolver';
import { TransactionModel } from '../models/Transaction';
import { TransactionType, TransactionDesc } from '../types/transactions';
import { Types } from 'mongoose';
import { Context } from '../middleware/isAuth';
import { Transaction, TransactionInput } from '../schema/transaction-type';

// Mock the Transaction model to avoid actual database calls
vi.mock('../models/Transaction', () => ({
  TransactionModel: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  }
}));

describe('TransactionResolver', () => {
  let resolver: TransactionResolver;
  const userId = new Types.ObjectId();
  // Mock context object, ensuring user._id is a string as expected by the Context type
  const mockContext: Context = { user: { _id: userId.toString() } };

  // Sample transaction data to be reused across tests
  const sampleTransaction: Transaction = {
    _id: new Types.ObjectId().toString(),
    date: new Date().toISOString(),
    alias: 'Test Transaction',
    type: TransactionType.inflow,
    desc: TransactionDesc.deposit,
    value: 100,
    user: userId.toString()
  };

  beforeEach(() => {
    // Clear all mocks before each test to ensure a clean state
    vi.clearAllMocks();
    // Create a new instance of the resolver for each test
    resolver = new TransactionResolver();
  });

  describe('transactions Query', () => {
    it('should return a paginated list of transactions', async () => {
      // Arrange
      const mockTransactions = [sampleTransaction];
      const page = 1;
      const limit = 10;
      const total = 1;

      vi.mocked(TransactionModel.countDocuments).mockResolvedValue(total);
      // Mock the chained query builder methods
      vi.mocked(TransactionModel.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockTransactions),
      } as any);

      // Act
      const result = await resolver.transactions(mockContext, page, limit);

      // Assert
      expect(result.items).toEqual(mockTransactions);
      expect(result.total).toBe(total);
      expect(result.page).toBe(page);
      expect(result.totalPages).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(TransactionModel.find).toHaveBeenCalledWith({ user: userId.toString() });
    });
  });

  describe('transaction Query', () => {
    it('should return a single transaction by its ID', async () => {
      // Arrange
      vi.mocked(TransactionModel.findOne).mockResolvedValue(sampleTransaction);
      const transactionId = sampleTransaction._id.toString();

      // Act
      const result = await resolver.transaction(transactionId, mockContext);

      // Assert
      expect(result).toEqual(sampleTransaction);
      expect(TransactionModel.findOne).toHaveBeenCalledWith({ _id: transactionId, user: userId.toString() });
    });

    it('should return null if transaction is not found', async () => {
      // Arrange
      vi.mocked(TransactionModel.findOne).mockResolvedValue(null);
      const transactionId = 'non-existent-id';

      // Act
      const result = await resolver.transaction(transactionId, mockContext);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getTransactionSummary Query', () => {
    it('should return a summary of transactions', async () => {
      // Arrange
      const transactions = [
        {
          ...sampleTransaction,
          type: TransactionType.inflow,
          desc: TransactionDesc.deposit,
          value: 200
        },
        {
          ...sampleTransaction,
          type: TransactionType.outflow,
          desc: TransactionDesc.withdrawal,
          value: 50
        },
      ];
      vi.mocked(TransactionModel.find).mockResolvedValue(transactions);

      // Act
      const result = await resolver.getTransactionSummary(mockContext);

      // Assert
      expect(result.balance).toBe(150);
      expect(result.breakdown.deposit).toBe(200);
      expect(result.breakdown.withdrawal).toBe(50);
    });
  });

  describe('createTransaction Mutation', () => {
    it('should create and return a new transaction', async () => {
      // Arrange
      const input: TransactionInput = {
        date: new Date().toISOString(),
        alias: 'New Deposit',
        type: TransactionType.inflow,
        desc: TransactionDesc.deposit,
        value: 300,
      };
      const createdTransaction = { ...input, _id: new Types.ObjectId(), user: userId.toString() };
      // Ensure the mock for create resolves with a single object, not an array
      vi.mocked(TransactionModel.create).mockResolvedValue(createdTransaction as any);

      // Act
      const result = await resolver.createTransaction(input, mockContext);

      // Assert
      expect(result.alias).toBe(input.alias);
      expect(result.value).toBe(input.value);
      expect(TransactionModel.create).toHaveBeenCalledWith({ ...input, user: userId.toString() });
    });
  });

  describe('updateTransaction Mutation', () => {
    it('should update and return the transaction', async () => {
      // Arrange
      const transactionId = sampleTransaction._id.toString();
      const updateInput = { alias: 'Updated Alias' };
      const updatedTransaction = { ...sampleTransaction, ...updateInput };
      vi.mocked(TransactionModel.findOneAndUpdate).mockResolvedValue(updatedTransaction);

      // Act
      const result = await resolver.updateTransaction(transactionId, updateInput, mockContext);

      // Assert
      expect(result).toEqual(updatedTransaction);
      expect(TransactionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: transactionId, user: userId.toString() },
        { $set: updateInput },
        { new: true, runValidators: true }
      );
    });

    it('should throw an error if transaction to update is not found', async () => {
      // Arrange
      vi.mocked(TransactionModel.findOneAndUpdate).mockResolvedValue(null);
      const transactionId = 'non-existent-id';

      // Act & Assert
      await expect(resolver.updateTransaction(transactionId, { alias: 'test' }, mockContext))
        .rejects.toThrow(`Transaction with id ${transactionId} not found or unauthorized`);
    });
  });

  describe('deleteTransaction Mutation', () => {
    it('should delete the transaction and return true', async () => {
      // Arrange
      vi.mocked(TransactionModel.findOneAndDelete).mockResolvedValue(sampleTransaction);
      const transactionId = sampleTransaction._id.toString();

      // Act
      const result = await resolver.deleteTransaction(transactionId, mockContext);

      // Assert
      expect(result).toBe(true);
      expect(TransactionModel.findOneAndDelete).toHaveBeenCalledWith({ _id: transactionId, user: userId.toString() });
    });

    it('should throw an error if transaction to delete is not found', async () => {
      // Arrange
      vi.mocked(TransactionModel.findOneAndDelete).mockResolvedValue(null);
      const transactionId = 'non-existent-id';

      // Act & Assert
      await expect(resolver.deleteTransaction(transactionId, mockContext))
        .rejects.toThrow(`Transaction with id ${transactionId} not found or unauthorized`);
    });
  });
});
