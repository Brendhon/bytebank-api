import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { Transaction, TransactionInput } from '../schema/transaction-type';
import { TransactionModel } from '../models/Transaction';
import { ITransaction, TransactionDesc, TransactionType as TransactionTypeEnum } from '../types/transactions';

@Resolver(Transaction)
export class TransactionResolver {
  private convertToGraphQLType(doc: ITransaction): Transaction {
    return {
      _id: doc._id?.toString() || '',
      date: doc.date,
      alias: doc.alias,
      type: TransactionTypeEnum[doc.type],
      desc: TransactionDesc[doc.desc],
      value: doc.value,
      user: doc.user
    };
  }

  @Query(() => [Transaction])
  async transactions(): Promise<Transaction[]> {
    try {
      const transactions = await TransactionModel.find().sort({ date: -1 });
      return transactions.map(t => this.convertToGraphQLType(t));
    } catch (error: any) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  @Query(() => Transaction, { nullable: true })
  async transaction(@Arg('id', () => ID) id: string): Promise<Transaction | null> {
    try {
      const transaction = await TransactionModel.findById(id);
      return transaction ? this.convertToGraphQLType(transaction) : null;
    } catch (error: any) {
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  @Mutation(() => Transaction)
  async createTransaction(
    @Arg('input') input: TransactionInput
  ): Promise<Transaction> {
    try {
      // Create a new transaction document using the input
      const newTransaction = await TransactionModel.create(input);

      // Convert the newly created transaction to GraphQL type
      return this.convertToGraphQLType(newTransaction);
    } catch (error: any) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  @Mutation(() => Transaction)
  async updateTransaction(
    @Arg('id', () => ID) id: string,
    @Arg('input') input: TransactionInput
  ): Promise<Transaction> {
    try {
      // Attempt to find and update the transaction by ID
      const transaction = await TransactionModel.findByIdAndUpdate(
        id,
        { $set: input }, // Use $set to update only the fields provided in input
        { new: true, runValidators: true } // new: true returns the updated document, runValidators ensures validation
      );

      // If no document was found, throw an error
      if (!transaction) throw new Error(`Transaction with id ${id} not found`);

      // Convert the updated transaction to GraphQL type
      return this.convertToGraphQLType(transaction);
    } catch (error: any) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  @Mutation(() => Boolean)
  async deleteTransaction(@Arg('id', () => ID) id: string): Promise<boolean> {
    try {
      // Attempt to find and delete the transaction by ID
      const result = await TransactionModel.findByIdAndDelete(id);

      // If no document was found, throw an error
      if (!result) throw new Error(`Transaction with id ${id} not found`);

      // Return true if deletion was successful
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }
}
