import { Arg, Ctx, ID, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Context, isAuth } from '../middleware';
import { TransactionModel } from '../models/Transaction';
import { PaginatedTransactions, Transaction, TransactionInput, TransactionSummary, TransactionUpdateInput } from '../schema/transaction-type';
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

  @Query(() => PaginatedTransactions)
  @UseMiddleware(isAuth)
  async transactions(
    @Ctx() { user }: Context,
    @Arg('page', () => Int, { defaultValue: 1 }) page: number,
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number
  ): Promise<PaginatedTransactions> {
    try {
      // Ensure page and limit are positive numbers
      const validPage = Math.max(1, page);
      const validLimit = Math.max(1, Math.min(50, limit)); // Max 50 items per page
      const skip = (validPage - 1) * validLimit;

      // Get total count of transactions for this user
      const total = await TransactionModel.countDocuments({ user: user?._id });

      // Calculate total pages
      const totalPages = Math.ceil(total / validLimit);

      // Get paginated transactions
      const transactions = await TransactionModel.find({ user: user?._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(validLimit);

      return {
        items: transactions.map(t => this.convertToGraphQLType(t)),
        totalInPage: transactions.length,
        total,
        page: validPage,
        totalPages,
        hasMore: validPage < totalPages
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  @Query(() => Transaction, { nullable: true })
  @UseMiddleware(isAuth)
  async transaction(
    @Arg('id', () => ID) id: string,
    @Ctx() { user }: Context
  ): Promise<Transaction | null> {
    try {
      // Find the transaction by ID and ensure it belongs to the user
      const transaction = await TransactionModel.findOne({ _id: id, user: user?._id });

      // If no transaction is found, return null
      return transaction ? this.convertToGraphQLType(transaction) : null;
    } catch (error: any) {
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  @Query(() => TransactionSummary)
  @UseMiddleware(isAuth)
  async getTransactionSummary(@Ctx() { user }: Context): Promise<TransactionSummary> {
    try {
      // Fetch all transactions for the user
      const transactions = await TransactionModel.find({ user: user?._id });

      // Initialize the breakdown object
      const breakdown = {
        deposit: 0,
        transfer: 0,
        withdrawal: 0,
        payment: 0
      };

      // Calculate the balance and update the breakdown
      const balance = transactions.reduce((acc, t) => {
        // Update the breakdown based on transaction description
        breakdown[t.desc as keyof typeof breakdown] += t.value;

        // Calculate the balance based on transaction type
        return t.type === TransactionTypeEnum.inflow ? acc + t.value : acc - t.value;
      }, 0);

      // Return the summary
      return { balance, breakdown };
    } catch (error: any) {
      throw new Error(`Failed to fetch transaction summary: ${error.message}`);
    }
  }

  @Mutation(() => Transaction)
  @UseMiddleware(isAuth)
  async createTransaction(
    @Arg('input', () => TransactionInput) input: TransactionInput,
    @Ctx() { user }: Context
  ): Promise<Transaction> {
    try {
      // Create a new transaction document using the input and add user
      const newTransaction = await TransactionModel.create({ ...input, user: user?._id });

      // Convert the newly created transaction to GraphQL type
      return this.convertToGraphQLType(newTransaction);
    } catch (error: any) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  @Mutation(() => Transaction)
  @UseMiddleware(isAuth)
  async updateTransaction(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => TransactionUpdateInput) input: TransactionUpdateInput,
    @Ctx() { user }: Context
  ): Promise<Transaction> {
    try {
      // Attempt to find and update the transaction by ID and user
      const transaction = await TransactionModel.findOneAndUpdate(
        { _id: id, user: user?._id }, // Ensure the transaction belongs to the user
        { $set: input }, // Update the fields specified in the input
        { new: true, runValidators: true } // Return the updated document and run validators
      );

      // If no document was found, throw an error
      if (!transaction) throw new Error(`Transaction with id ${id} not found or unauthorized`);

      // Convert the updated transaction to GraphQL type
      return this.convertToGraphQLType(transaction);
    } catch (error: any) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteTransaction(
    @Arg('id', () => ID) id: string,
    @Ctx() { user }: Context
  ): Promise<boolean> {
    try {
      // Attempt to find and delete the transaction by ID and user
      const result = await TransactionModel.findOneAndDelete({ _id: id, user: user?._id });

      // If no document was found, throw an error
      if (!result) throw new Error(`Transaction with id ${id} not found or unauthorized`);

      // Return true if deletion was successful
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }
}
