import bcrypt from 'bcryptjs';

/**
 * Utility functions for password hashing and comparison.
 * @param {string} candidatePassword - The password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, false otherwise.
 */
export const comparePassword = async (
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
}

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Ensure password is provided
  if (!password) throw new Error('Password is required');

  // Validate password length
  if (password.length < 6) throw new Error('Password must be at least 6 characters long');

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);

    // Hash the password using the generated salt
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

/**
 * Check if password has been modified.
 * @param {string} password - The password to check.
 * @returns {boolean} - Returns true if the password is modified, false otherwise.
 */
export const isPasswordModified = (password: string): boolean => {
  // Check if the password is a non-empty string
  return typeof password === 'string' && password.trim().length > 0;
};