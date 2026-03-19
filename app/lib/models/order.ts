import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  tableId?: mongoose.Types.ObjectId | null;

  type: 'dine-in' | 'parcel';

  parcelNumber?: number;

  parcelDelivered?: boolean;

  status: 'running' | 'billed' | 'paid' | 'closed';

  openedAt: Date;

  closedAt?: Date;

  closedReason?: 'completed' | 'abandoned';

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: ['dine-in', 'parcel'],
      default: 'dine-in',
      index: true,
    },

    parcelNumber: {
      type: Number,
      index: true,
    },

    parcelDelivered: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ['running', 'billed', 'paid', 'closed'],
      default: 'running',
      index: true,
    },

    openedAt: {
      type: Date,
      default: Date.now,
    },

    closedAt: Date,

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