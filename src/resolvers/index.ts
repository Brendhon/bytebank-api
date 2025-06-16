import { NonEmptyArray } from "type-graphql";
import { TransactionResolver } from "./transaction/transaction.resolver";
import { UserResolver } from "./user/user.resolver";

export const resolvers: NonEmptyArray<Function> = [
  TransactionResolver,
  UserResolver,
];
