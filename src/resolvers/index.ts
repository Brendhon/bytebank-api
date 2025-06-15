import { NonEmptyArray } from 'type-graphql';
import { TransactionResolver } from './transaction.resolver';
import { UserResolver } from './user.resolver';

export const resolvers: NonEmptyArray<Function> = [
  TransactionResolver,
  UserResolver,
];