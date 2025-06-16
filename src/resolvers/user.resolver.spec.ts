import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserResolver } from './user.resolver';
import { UserModel, TransactionModel } from '../models';
import { sign } from 'jsonwebtoken';

// Mock the jsonwebtoken library to control its behavior in tests
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
}));

// Mocks are already configured globally in setupFiles

describe('UserResolver', () => {
  let userResolver: UserResolver;

  beforeEach(() => {
    userResolver = new UserResolver();
    // Clear mocks before each test to ensure a clean slate
    vi.clearAllMocks();
  });

  // Create a mock user object to be reused in tests
  const mockUser = {
    _id: 'mockUserId',
    name: 'Test User',
    email: 'test@example.com',
    acceptPrivacy: true,
    password: 'hashedpassword',
    comparePassword: vi.fn().mockResolvedValue(true),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('me', () => {
    it('should return the current user', async () => {
      // Arrange: Mock the UserModel.findById to return our mock user
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser);
      
      // Act: Call the 'me' resolver with a mock context
      const result = await userResolver.me({ user: { _id: 'mockUserId' } });
      
      // Assert: Verify that the returned user matches the mock user
      expect(result).toBeDefined();
      expect(result?._id).toBe(mockUser._id);
    });

    it('should return null if the user is not found', async () => {
      // Arrange: Mock the UserModel.findById to resolve to null
      vi.mocked(UserModel.findById).mockResolvedValue(null);
      
      // Act: Call the 'me' resolver
      const result = await userResolver.me({ user: { _id: 'mockUserId' } });
      
      // Assert: Verify that the result is null
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should register a new user and return an AuthPayload', async () => {
      // Arrange: Set up mocks for a successful registration
      const input = { name: 'New User', email: 'new@example.com', password: 'password123', acceptPrivacy: true };
      vi.mocked(UserModel.findOne).mockResolvedValue(null); // User does not exist
      vi.mocked(UserModel.create).mockResolvedValue(mockUser as any);
      vi.mocked(sign).mockReturnValue('mockToken' as any); // Mock token generation

      // Act: Call the 'register' resolver
      const result = await userResolver.register(input);

      // Assert: Verify that the token and user are returned correctly
      expect(result.token).toBe('mockToken');
      expect(result.user._id).toBe(mockUser._id);
    });

    it('should throw an error if the user already exists', async () => {
      // Arrange: Mock an existing user
      const input = { name: 'Test User', email: 'test@example.com', password: 'password123', acceptPrivacy: true };
      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser);
      
      // Act & Assert: Expect the resolver to throw an error indicating the user exists
      await expect(userResolver.register(input)).rejects.toThrow('User already exists with this email');
    });
  });

  describe('login', () => {
    it('should log in a user and return an AuthPayload', async () => {
      // Arrange: Set up mocks for a successful login
      const input = { email: 'test@example.com', password: 'password123' };
      const userInstance = { ...mockUser, comparePassword: vi.fn().mockResolvedValue(true) };
      vi.mocked(UserModel.findOne).mockResolvedValue(userInstance);
      vi.mocked(sign).mockReturnValue('mockToken' as any);

      // Act: Call the 'login' resolver
      const result = await userResolver.login(input);

      // Assert: Verify the returned token and user data
      expect(result.token).toBe('mockToken');
      expect(result.user.email).toBe(input.email);
    });

    it('should throw an error for invalid credentials', async () => {
      // Arrange: Mock a user with a failing password check
      const input = { email: 'test@example.com', password: 'wrongpassword' };
      const userInstance = { ...mockUser, comparePassword: vi.fn().mockResolvedValue(false) };
      vi.mocked(UserModel.findOne).mockResolvedValue(userInstance);
      
      // Act & Assert: Expect the resolver to throw an error for invalid credentials
      await expect(userResolver.login(input)).rejects.toThrow('Invalid credentials');
    });
  });
  
  describe('updateUser', () => {
    it('should update and return the user', async () => {
        // Arrange: Set up input and mock the update operation
        const input = { name: 'Updated User' };
        const updatedUser = { ...mockUser, name: 'Updated User' };
        vi.mocked(UserModel.findByIdAndUpdate).mockResolvedValue(updatedUser);
        
        // Act: Call the 'updateUser' resolver
        const result = await userResolver.updateUser(input, { user: { _id: mockUser._id } });
        
        // Assert: Verify that the user's name was updated
        expect(result.name).toBe('Updated User');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and their transactions', async () => {
        // Arrange: Mock the deletion of transactions and the user
        vi.mocked(TransactionModel.deleteMany).mockResolvedValue({ acknowledged: true, deletedCount: 5 } as any);
        vi.mocked(UserModel.findByIdAndDelete).mockResolvedValue(mockUser);

        // Act: Call the 'deleteUser' resolver
        const result = await userResolver.deleteUser({ user: { _id: mockUser._id } });

        // Assert: Verify that the user was deleted and their transactions cleared
        expect(result).toBe(true);
        expect(TransactionModel.deleteMany).toHaveBeenCalledWith({ user: mockUser._id });
    });
  });

  describe('validatePassword', () => {
    it('should return true for a valid password', async () => {
        // Arrange: Mock a user with a successful password comparison
        const userInstance = { ...mockUser, comparePassword: vi.fn().mockResolvedValue(true) };
        vi.mocked(UserModel.findById).mockResolvedValue(userInstance);
        
        // Act: Call the 'validatePassword' resolver
        const result = await userResolver.validatePassword('password123', { user: { _id: mockUser._id } });

        // Assert: Verify that the password validation returns true
        expect(result).toBe(true);
    });
  });
});
