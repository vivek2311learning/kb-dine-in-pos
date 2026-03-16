import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  tableId?: mongoose.Types.ObjectId | null;

  type: 'dine-in' | 'parcel';

  parcelNumber?: number;

  status: 'running' | 'billed' | 'paid' | 'closed';

  openedAt: Date;

  closedAt?: Date;

  closedReason?: 'completed' | 'abandoned';

  createdAt: Date;

  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    /* Table (only for dine-in) */

    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
      index: true,
    },

    /* Order Type */

    type: {
      type: String,
      enum: ['dine-in', 'parcel'],
      default: 'dine-in',
      index: true,
    },

    /* Parcel Number (only for parcel orders) */

    parcelNumber: {
      type: Number,
      index: true,
    },

    /* Order Lifecycle */

    status: {
      type: String,
      enum: ['running', 'billed', 'paid', 'closed'],
      default: 'running',
      index: true,
    },

    /* When order started */

    openedAt: {
      type: Date,
      default: Date.now,
    },

    /* When order finished */

    closedAt: {
      type: Date,
    },

    /* Why closed */

    closedReason: {
      type: String,
      enum: ['completed', 'abandoned'],
    },
  },

  {
    timestamps: true,
  },
);

export default (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>('Order', OrderSchema);
