import mongoose, { Schema, Document, Model } from 'mongoose';
import { OrderStatus } from '@/types/enums';

export interface IOrder extends Document {
  tableId: mongoose.Types.ObjectId;
  status: OrderStatus;
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
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['running', 'billed', 'paid', 'closed'],
      default: 'running',
      index: true,
    },

    // Only when order ends
    closedAt: {
      type: Date,
    },

    closedReason: {
      type: String,
      enum: ['completed', 'abandoned'],
    },
  },
  { timestamps: true }, // createdAt & updatedAt auto mil jayega
);

export default (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>('Order', OrderSchema);
