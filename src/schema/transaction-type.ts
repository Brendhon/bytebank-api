import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { TransactionDesc, TransactionType as TransactionTypeEnum } from '../types/transactions';

registerEnumType(TransactionDesc, {
  name: 'TransactionDesc',
  description: 'The description of the transaction',
});

registerEnumType(TransactionTypeEnum, {
  name: 'TransactionType',
  description: 'The type of the transaction (inflow or outflow)',
});

@ObjectType()
export class Transaction {
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
export class TransactionInput {
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
