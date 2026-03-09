import mongoose, { Schema, models, model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'counter' | 'kitchen';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ['admin', 'counter', 'kitchen'],
      required: true,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/**
 * 🔐 Auto hash password before save
 * No next() needed in async middleware
 */
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default models.User || model<IUser>('User', UserSchema);
