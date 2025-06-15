import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { ITransaction, TransactionBreakdown, TransactionDesc, TransactionType as TransactionTypeEnum } from '../types/transactions';

registerEnumType(TransactionDesc, {
  name: 'TransactionDesc',
  description: 'The description of the transaction',
});

registerEnumType(TransactionTypeEnum, {
  name: 'TransactionType',
  description: 'The type of the transaction (inflow or outflow)',
});

@ObjectType()
export class Transaction implements ITransaction {
  @Field(() => ID)
  _id!: string;

  @Field()
  date!: string;

  @Field({ nullable: true })
  alias?: string;

  @Field(() => TransactionTypeEnum)
  type!: TransactionTypeEnum;

  @Field(() => TransactionDesc)
  desc!: TransactionDesc;

  @Field()
  value!: number;

  @Field({ nullable: true })
  user?: string;
}

@InputType()
export class TransactionInput implements ITransaction {
  @Field()
  date!: string;

  @Field({ nullable: true })
  alias?: string;

  @Field(() => TransactionTypeEnum)
  type!: TransactionTypeEnum;

  @Field(() => TransactionDesc)
  desc!: TransactionDesc;

  @Field()
  value!: number;

  @Field({ nullable: true })
  user?: string;
}

@InputType()
export class TransactionUpdateInput implements Partial<ITransaction> {
  @Field({ nullable: true })
  date?: string;

  @Field({ nullable: true })
  alias?: string;

  @Field(() => TransactionTypeEnum, { nullable: true })
  type?: TransactionTypeEnum;

  @Field(() => TransactionDesc, { nullable: true })
  desc?: TransactionDesc;

  @Field({ nullable: true })
  value?: number;
}

@ObjectType()
export class PaginatedTransactions {
  @Field(() => [Transaction])
  items!: Transaction[];

  @Field()
  total!: number;

  @Field()
  page!: number;

  @Field()
  totalPages!: number;

  @Field()
  hasMore!: boolean;

  @Field() 
  totalInPage!: number; // Total transactions in the current page
}

@ObjectType()
class TransactionSummaryBreakdown implements TransactionBreakdown {
  @Field()
  deposit!: number;

  @Field()
  transfer!: number;

  @Field()
  withdrawal!: number;

  @Field()
  payment!: number;
}

@ObjectType()
export class TransactionSummary implements TransactionSummary {
  @Field()
  balance!: number;

  @Field(() => TransactionSummaryBreakdown)
  breakdown!: TransactionSummaryBreakdown;
}
