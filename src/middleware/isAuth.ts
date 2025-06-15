import { verify } from 'jsonwebtoken';
import { AuthenticationError, MiddlewareFn } from 'type-graphql';

// Interface for the context used in the middleware
export interface Context {
  token?: string;
  user?: { _id: string };
}

// JWT_SECRET should be set in your environment variables for security
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  // Extract the Authorization header from the context
  const authHeader = context.token;

  // Check if the Authorization header is present
  if (!authHeader) throw new AuthenticationError('Not authenticated');

  try {
    // Verify the JWT token
    const token = authHeader.split(' ')[1];

    // If no token is provided, throw an error
    if (!token) throw new AuthenticationError('Not authenticated');

    // Decode the token to get the user ID
    const payload = verify(token, JWT_SECRET);

    // Attach the user ID to the context
    context.user = payload as { _id: string };
  } catch (err) {
    throw new AuthenticationError('Not authenticated');
  }

  return next();
};
