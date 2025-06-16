import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationError, ResolverData } from 'type-graphql';
import { verify } from 'jsonwebtoken';
import { isAuth, Context } from './isAuth';
import { GraphQLResolveInfo } from 'graphql';

// Mock jsonwebtoken to avoid depending on the real implementation
// This ensures our tests are isolated and predictable
vi.mock('jsonwebtoken', () => ({
  verify: vi.fn() // Create a mock function for the verify method
}));

// Helper function to create a mock ResolverData object
// This simulates the data structure that GraphQL resolvers receive
const createMockAction = (context: Context): ResolverData<Context> => ({
  context, // The context object containing request-specific data
  args: {}, // Arguments passed to the resolver (empty for these tests)
  info: {} as GraphQLResolveInfo, // GraphQL execution info (mocked as empty)
  root: undefined, // Root value (not needed for these tests)
});

describe('isAuth Middleware', () => {
  beforeEach(() => {
    // Reset all mocks before each test to ensure they start fresh
    vi.clearAllMocks();
  });

  it('should throw AuthenticationError when no authorization header is present', async () => {
    // Arrange: Create a context without any token
    const context: Context = {};
    // Create a mock resolver data with empty context
    const action = createMockAction(context);
    // Create a spy function to verify if middleware calls next
    const next = vi.fn();

    // Act & Assert: Verify that authentication fails
    // First assertion checks if the correct error type is thrown
    await expect(isAuth(action, next)).rejects.toThrow(AuthenticationError);
    // Second assertion verifies the error message
    await expect(isAuth(action, next)).rejects.toThrow('Not authenticated');
    // Verify that next middleware was not called
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw AuthenticationError when token is malformed', async () => {
    // Arrange: Create a context with an invalid token format
    const context: Context = { token: 'malformed-token' }; // Missing 'Bearer ' prefix
    const action = createMockAction(context);
    const next = vi.fn();

    // Act & Assert: Verify that malformed token causes authentication failure
    await expect(isAuth(action, next)).rejects.toThrow(AuthenticationError);
    await expect(isAuth(action, next)).rejects.toThrow('Not authenticated');
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw AuthenticationError when token verification fails', async () => {
    // Arrange: Setup context with properly formatted but invalid token
    const context: Context = { token: 'Bearer invalid-token' };
    const action = createMockAction(context);
    const next = vi.fn();

    // Configure verify mock to simulate token verification failure
    vi.mocked(verify).mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    // Act & Assert: Verify that invalid token causes authentication failure
    await expect(isAuth(action, next)).rejects.toThrow('Not authenticated');
    // Verify that token was passed to verification
    expect(verify).toHaveBeenCalledWith('invalid-token', expect.any(String));
    // Verify that next middleware was not called
    expect(next).not.toHaveBeenCalled();
  });

  it('should set user in context and call next when token is valid', async () => {
    // Arrange: Setup test data
    const userPayload = { _id: 'user123' }; // Mock user data from token
    const token = 'valid-token';
    const context: Context = { token: `Bearer ${token}` }; // Create properly formatted token
    const action = createMockAction(context);
    const next = vi.fn().mockResolvedValue(undefined); // Mock next middleware

    // Configure verify mock to return valid user payload
    vi.mocked(verify).mockImplementationOnce(() => userPayload);

    // Act: Execute the middleware
    await isAuth(action, next);

    // Assert: Verify successful authentication flow
    // Check if token was properly verified
    expect(verify).toHaveBeenCalledWith(token, expect.any(String));
    // Verify that user was set in context
    expect(context.user).toEqual(userPayload);
    // Confirm that next middleware was called
    expect(next).toHaveBeenCalled();
  });
});
