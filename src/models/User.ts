import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    acceptPrivacy: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (Mongoose middleware)
UserSchema.pre('save', async function (next) {
  // Ensure password is provided
  if (!this.password) return next(new Error('Password is required'));

  if (!this.isModified('password')) return next(); // Only hash the password if it has been modified (or is new)

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);

    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);

    // Proceed to the next middleware
    return next();
  } catch (error: any) {
    return next(error);
  }
});

// Method to check password validity
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);
