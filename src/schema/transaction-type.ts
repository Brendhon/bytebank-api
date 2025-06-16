import {
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import {
  ITransaction,
  TransactionBreakdown,
  TransactionDesc,
  TransactionType as TransactionTypeEnum,
} from "../types/transactions";

registerEnumType(TransactionDesc, {
  name: "TransactionDesc",
  description: "The description of the transaction",
});

registerEnumType(TransactionTypeEnum, {
  name: "TransactionType",
  description: "The type of the transaction (inflow or outflow)",
});

@ObjectType()
export class Transaction implements ITransaction {
  @Field(() => ID)
  _id!: string;

  @Field(() => String)
  date!: string;

  @Field(() => String, { nullable: true })
  alias?: string;

  @Field(() => TransactionTypeEnum)
  type!: TransactionTypeEnum;

  @Field(() => TransactionDesc)
  desc!: TransactionDesc;

  @Field(() => Number)
  value!: number;

  @Field(() => String, { nullable: true })
  user?: string;
}

@InputType()
export class TransactionInput implements ITransaction {
  @Field(() => String)
  date!: string;

  @Field(() => String, { nullable: true })
  alias?: string;

  @Field(() => TransactionTypeEnum)
  type!: TransactionTypeEnum;

  @Field(() => TransactionDesc)
  desc!: TransactionDesc;

  @Field(() => Number)
  value!: number;

  @Field(() => String, { nullable: true })
  user?: string;
}

@InputType()
export class TransactionUpdateInput implements Partial<ITransaction> {
  @Field(() => String, { nullable: true })
  date?: string;

  @Field(() => String, { nullable: true })
  alias?: string;

  @Field(() => TransactionTypeEnum, { nullable: true })
  type?: TransactionTypeEnum;

  @Field(() => TransactionDesc, { nullable: true })
  desc?: TransactionDesc;

  @Field(() => Number, { nullable: true })
  value?: number;
}

@ObjectType()
export class PaginatedTransactions {
  @Field(() => [Transaction])
  items!: Transaction[];

  @Field(() => Number)
  total!: number;

  @Field(() => Number)
  page!: number;

  @Field(() => Number)
  totalPages!: number;

  @Field(() => Boolean)
  hasMore!: boolean;

  @Field(() => Number)
  totalInPage!: number; // Total transactions in the current page
}

@ObjectType()
class TransactionSummaryBreakdown implements TransactionBreakdown {
  @Field(() => Number)
  deposit!: number;

  @Field(() => Number)
  transfer!: number;

  @Field(() => Number)
  withdrawal!: number;

  @Field(() => Number)
  payment!: number;
}

@ObjectType()
export class TransactionSummary implements TransactionSummary {
  @Field(() => Number)
  balance!: number;

  @Field(() => TransactionSummaryBreakdown)
  breakdown!: TransactionSummaryBreakdown;
}
