import { sign } from 'jsonwebtoken';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Context, isAuth } from '../middleware';
import { UserModel } from '../models';
import { AuthPayload, LoginInput, User, UserInput, UserUpdateInput } from '../schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

@Resolver(User)
export class UserResolver {
  /**
   * Generates a JWT token for the user.
   * @param userId - The ID of the user to generate the token for.
   * @returns The generated JWT token.
   */
  private createToken(userId: string): string {
    return sign({ _id: userId }, JWT_SECRET, { expiresIn: '1d' });
  }

  /**
   * Converts a Mongoose document to a GraphQL User type.
   * @param doc - The Mongoose document to convert.
   * @returns The converted User object.
   */
  private convertToGraphQLUser(doc: any): User {
    return {
      _id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      acceptPrivacy: doc.acceptPrivacy,
      createdAt: doc.createdAt!,
      updatedAt: doc.updatedAt!
    };
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async me(@Ctx() { user }: Context): Promise<User | null> {
    try {
      // Get user by ID from the context
      const id = user?._id;

      // If no user ID is found, throw an error
      if (!id) throw new Error('User ID not found in context');

      // Fetch user by ID
      const me = await UserModel.findById(id);

      // If user not found, return null
      if (!me) return null;

      // Convert to GraphQL User type
      return this.convertToGraphQLUser(me);
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  @Mutation(() => AuthPayload)
  async register(@Arg('input') input: UserInput): Promise<AuthPayload> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ email: input.email });

      // If user exists, throw an error
      if (existingUser) throw new Error('User already exists with this email');

      // Create new user
      const user = await UserModel.create(input);

      // Generate token
      const token = this.createToken(user._id.toString());

      return { token, user: this.convertToGraphQLUser(user) };
    } catch (error: any) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  @Mutation(() => AuthPayload)
  async login(@Arg('input') input: LoginInput): Promise<AuthPayload> {
    try {
      // Find user by email
      const user = await UserModel.findOne({ email: input.email });

      // If user not found, throw an error
      if (!user) throw new Error('Invalid credentials');

      // Check password
      const isValid = await user.comparePassword(input.password);

      // If password is invalid, throw an error
      if (!isValid) throw new Error('Invalid credentials');

      // Generate token
      const token = this.createToken(user._id.toString());

      // Return token and user
      return { token, user: this.convertToGraphQLUser(user) };
    } catch (error: any) {
      throw new Error(`Failed to login: ${error.message}`);
    }
  }

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async updateUser(
    @Arg('input') input: UserUpdateInput,
    @Ctx() { user }: Context
  ): Promise<User> {
    try {
      // Get user ID from context
      const id = user?._id;

      // If no user ID is found, throw an error
      if (!id) throw new Error('User ID not found in context');

      // Attempt to find and update the user
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );

      // If no user was found, throw an error
      if (!updatedUser) throw new Error('User not found');

      // Convert and return the updated user
      return this.convertToGraphQLUser(updatedUser);
    } catch (error: any) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
}
