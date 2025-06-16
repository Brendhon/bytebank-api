import { Field, ID, InputType, ObjectType } from "type-graphql";
import { IUser } from "../types";

type Model = Omit<IUser, "comparePassword">;

@ObjectType()
export class User implements Omit<Model, "password"> {
  @Field(() => ID)
  _id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  email!: string;

  @Field(() => Boolean)
  acceptPrivacy!: boolean;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@InputType()
export class UserInput implements Omit<Model, "_id"> {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;

  @Field(() => Boolean)
  acceptPrivacy!: boolean;
}

@InputType()
export class LoginInput implements Pick<IUser, "email" | "password"> {
  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;
}

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  token!: string;

  @Field(() => User)
  user!: User;
}

@InputType()
export class UserUpdateInput implements Partial<Model> {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => Boolean, { nullable: true })
  acceptPrivacy?: boolean;
}
