import { Resolver, Query, Mutation, Arg, ID, Ctx, UseMiddleware } from 'type-graphql';
import { Transaction, TransactionInput, TransactionUpdateInput } from '../schema/transaction-type';
import { TransactionModel } from '../models/Transaction';
import { ITransaction, TransactionDesc, TransactionType as TransactionTypeEnum } from '../types/transactions';
import { isAuth, Context } from '../middleware';

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
  @UseMiddleware(isAuth)
  async transactions(@Ctx() { user }: Context): Promise<Transaction[]> {
    try {
      const transactions = await TransactionModel.find({ user: user?._id }).sort({ date: -1 });
      return transactions.map(t => this.convertToGraphQLType(t));
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
      const transaction = await TransactionModel.findOne({ _id: id, user: user?._id });
      return transaction ? this.convertToGraphQLType(transaction) : null;
    } catch (error: any) {
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  @Mutation(() => Transaction)
  @UseMiddleware(isAuth)
  async createTransaction(
    @Arg('input') input: TransactionInput,
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
    @Arg('input') input: TransactionUpdateInput,
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
