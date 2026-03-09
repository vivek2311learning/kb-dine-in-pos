import mongoose, { Schema, Document, Model } from 'mongoose';

export type MenuCategory =
  | 'Starters'
  | 'Main Course'
  | 'Beverages'
  | 'Desserts';

export type MenuStatus = 'draft' | 'active' | 'unavailable' | 'archived';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  status: MenuStatus;
  archivedAt?: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
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
    archivedAt: { type: Date },
  },
  { timestamps: true },
);

export default (mongoose.models.MenuItem as Model<IMenuItem>) ||
  mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
