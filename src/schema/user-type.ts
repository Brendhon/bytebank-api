import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { IUser } from '../types';

type Model = Omit<IUser, 'comparePassword'>

@ObjectType()
export class User implements Omit<Model, 'password'> {
  @Field(() => ID)
  _id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  acceptPrivacy!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class UserInput implements Omit<Model,'_id'> {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  acceptPrivacy!: boolean;
}

@InputType()
export class LoginInput implements Pick<IUser, 'email' | 'password'> {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class AuthPayload {
  @Field()
  token!: string;

  @Field(() => User)
  user!: User;
}

@InputType()
export class UserUpdateInput implements Partial<Model> {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  acceptPrivacy?: boolean;
}
