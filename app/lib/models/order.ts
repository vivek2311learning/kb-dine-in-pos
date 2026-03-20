import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  tableId?: mongoose.Types.ObjectId | null;

  type: 'dine-in' | 'parcel';

  parcelNumber?: number;

  parcelDelivered?: boolean;

  status: 'running' | 'billed' | 'paid' | 'closed';

  closedReason?: 'completed' | 'cancelled' | 'force_closed';

  openedAt: Date;

  closedAt?: Date | null;

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

    closedReason: {
      type: String,
      enum: ['completed', 'cancelled', 'force_closed'],
      default: null,
      index: true,
    },

    openedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    closedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/* 🔥 COMPOUND INDEX (IMPORTANT FOR ANALYTICS) */
OrderSchema.index({ status: 1, closedReason: 1 });
OrderSchema.index({ type: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

/* 🔥 SAFE VALIDATION (NO TS ERROR) */
OrderSchema.pre('save', function () {
  if (
    this.status === 'closed' &&
    !this.closedReason &&
    (this.isModified('status') || this.isModified('closedReason'))
  ) {
    throw new Error('closedReason required when order is closed');
  }
});

export default (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>('Order', OrderSchema);
