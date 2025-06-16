import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashPassword, comparePassword, isPasswordModified } from "./crypto";
import bcrypt from "bcryptjs";

// Mock bcrypt module to control its behavior in tests
// This prevents actual password hashing and allows us to control the output
vi.mock("bcryptjs");

describe("Crypto Utils", () => {
  describe("hashPassword", () => {
    beforeEach(() => {
      // Reset all mock's state and behavior before each test
      // This ensures that each test starts with a clean slate
      vi.clearAllMocks();
    });

    it("should hash a provided password", async () => {
      // Arrange: Setup test data and mocks
      const password = "password123"; // Test password input
      const hashedPassword = "hashedPassword123"; // Expected hashed output

      // Get typed references to the mocked bcrypt functions
      const mockGenSalt = vi.mocked(bcrypt.genSalt);
      const mockHash = vi.mocked(bcrypt.hash);

      // Configure mock behaviors:
      // genSalt will return a predefined salt value
      mockGenSalt.mockResolvedValue("salt" as any);
      // hash will return our predefined hashed password
      mockHash.mockResolvedValue(hashedPassword as any);

      // Act: Execute the function under test
      const result = await hashPassword(password);

      // Assert: Verify the results
      expect(result).toBe(hashedPassword); // Check if the result matches expected hash
      expect(result).not.toBe(password); // Verify that the output is different from input
      expect(mockGenSalt).toHaveBeenCalledWith(10); // Verify salt generation with correct rounds
      expect(mockHash).toHaveBeenCalledWith(password, "salt"); // Verify hash called with correct params
    });

    it("should throw an error if password is not provided", async () => {
      // Act & Assert: Verify that empty password causes an error
      // We expect the function to reject with a specific error message
      await expect(hashPassword("")).rejects.toThrow("Password is required");
    });

    it("should throw an error if password is less than 6 characters", async () => {
      // Act & Assert: Verify that short passwords are rejected
      // Password must be at least 6 characters long
      await expect(hashPassword("12345")).rejects.toThrow(
        "Password must be at least 6 characters long",
      );
    });

    it("should throw a generic error if bcrypt fails", async () => {
      // Arrange: Setup bcrypt to simulate a failure
      const mockGenSalt = vi.mocked(bcrypt.genSalt);
      mockGenSalt.mockRejectedValue(new Error("Bcrypt error")); // Simulate bcrypt failure

      // Act & Assert: Verify that bcrypt errors are properly handled
      await expect(hashPassword("password123")).rejects.toThrow(
        "Error hashing password",
      );
    });
  });

  describe("comparePassword", () => {
    beforeEach(() => {
      // Reset mock state before each test
      vi.clearAllMocks();
    });

    it("should return true for matching passwords", async () => {
      // Arrange: Setup test scenario for matching passwords
      const password = "password123";
      const hashedPassword = "hashedPassword123";
      const mockCompare = vi.mocked(bcrypt.compare);
      // Configure compare to indicate passwords match
      mockCompare.mockResolvedValue(true as any);

      // Act: Execute password comparison
      const isMatch = await comparePassword(password, hashedPassword);

      // Assert: Verify comparison results
      expect(isMatch).toBe(true); // Check that result indicates match
      expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword); // Verify correct parameters
    });

    it("should return false for non-matching passwords", async () => {
      // Arrange: Setup test scenario for non-matching passwords
      const wrongPassword = "wrongpassword";
      const hashedPassword = "hashedPassword123";
      const mockCompare = vi.mocked(bcrypt.compare);
      // Configure compare to indicate passwords don't match
      mockCompare.mockResolvedValue(false as any);

      // Act: Execute password comparison
      const isMatch = await comparePassword(wrongPassword, hashedPassword);

      // Assert: Verify comparison results
      expect(isMatch).toBe(false); // Check that result indicates no match
      expect(mockCompare).toHaveBeenCalledWith(wrongPassword, hashedPassword); // Verify correct parameters
    });

    it("should throw a generic error if bcrypt fails", async () => {
      // Arrange: Setup bcrypt to simulate a failure
      const mockCompare = vi.mocked(bcrypt.compare);
      mockCompare.mockRejectedValue(new Error("Bcrypt error")); // Simulate bcrypt failure

      // Act & Assert: Verify that bcrypt errors are properly handled
      await expect(comparePassword("password", "hash")).rejects.toThrow(
        "Error comparing passwords",
      );
    });
  });

  describe("isPasswordModified", () => {
    it("should return true for a valid password", () => {
      // Act & Assert: Verify that a valid password string is detected as modified
      expect(isPasswordModified("newpassword")).toBe(true);
    });

    it("should return false for an empty string", () => {
      // Act & Assert: Verify that an empty string is not considered modified
      expect(isPasswordModified("")).toBe(false);
    });

    it("should return false for a string with only spaces", () => {
      // Act & Assert: Verify that a string with only whitespace is not considered modified
      expect(isPasswordModified("   ")).toBe(false);
    });
  });
});
