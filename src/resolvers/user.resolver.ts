import { sign } from 'jsonwebtoken';
import { Arg, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { isAuth } from '../middleware';
import { UserModel } from '../models';
import { AuthPayload, LoginInput, User, UserInput } from '../schema';

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
  async me(@Arg('id') id: string): Promise<User | null> {
    try {
      // Fetch user by ID
      const user = await UserModel.findById(id);

      // If user not found, return null
      if (!user) return null;

      // Convert to GraphQL User type
      return this.convertToGraphQLUser(user);
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
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isValid = await user.comparePassword(input.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.createToken(user._id.toString());

      return {
        token,
        user: this.convertToGraphQLUser(user)
      };
    } catch (error: any) {
      throw new Error(`Failed to login: ${error.message}`);
    }
  }
}
