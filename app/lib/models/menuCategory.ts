import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuCategory extends Document {
  name: string;
  isActive: boolean;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default (mongoose.models.MenuCategory as Model<IMenuCategory>) ||
  mongoose.model<IMenuCategory>('MenuCategory', MenuCategorySchema);
