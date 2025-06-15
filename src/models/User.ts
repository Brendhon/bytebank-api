import { Document, model, models, Schema } from 'mongoose';
import { IUser } from '../types';
import { comparePassword, hashPassword } from '../utils';

// Define the interface for the User document 
type SchemaType = Document & IUser;

const UserSchema = new Schema<SchemaType>(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    acceptPrivacy: { type: Boolean, required: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Hash password before saving (Mongoose middleware)
UserSchema.pre('save', async function (next) {
  try {
    // Hash the password using the generated salt
    this.password = await hashPassword(this.password);

    // Proceed to the next middleware
    return next();
  } catch (error: any) {
    return next(error);
  }
});

// Has password is modified when updating
UserSchema.pre('findOneAndUpdate', async function (next) {
  try {
    // Get the update object
    let password = this.get('password');

    // If password is provided, hash it before saving
    if (password) this.set('password', await hashPassword(password));

    // Proceed to the next middleware
    return next();
  } catch (error: any) {
    console.error('Error hashing password on update:', error);
    return next(error);
  }
});

// Method to check password validity
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await comparePassword(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const UserModel = models.User || model<SchemaType>('User', UserSchema);
