import mongoose, { Schema, Document, Model } from 'mongoose';

export type MenuStatus = 'draft' | 'active' | 'unavailable' | 'archived';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  status: MenuStatus;
  createdBy?: mongoose.Types.ObjectId;
  archivedAt?: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: ['Starters', 'Main Course', 'Beverages', 'Desserts'],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['draft', 'active', 'unavailable', 'archived'],
      default: 'draft',
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    archivedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default (mongoose.models.MenuItem as Model<IMenuItem>) ||
  mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
