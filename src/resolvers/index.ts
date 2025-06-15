import { NonEmptyArray } from 'type-graphql';
import { TransactionResolver } from './transaction.resolver'; 

// Add more resolvers as needed
export const resolvers: NonEmptyArray<Function> = [
  TransactionResolver,
];