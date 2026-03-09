import mongoose, { Schema, Document, Model } from 'mongoose';
import { KitchenStatus } from '@/types/enums';

export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  menuItemId?: mongoose.Types.ObjectId;

  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;

  kitchenStatus: KitchenStatus;
  served: boolean;

  cancelled: boolean;
  cancelStage?: KitchenStatus;
  cancelReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;

  wasted: boolean;
  billable: boolean;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
      index: true,
    },

    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
    },

    nameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },

    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    kitchenStatus: {
      type: String,
      enum: ['draft', 'pending', 'preparing', 'ready', 'served'],
      default: 'draft',
      index: true,
    },

    served: {
      type: Boolean,
      default: false,
      index: true,
    },

    cancelled: {
      type: Boolean,
      default: false,
      index: true,
    },

    cancelStage: {
      type: String,
      enum: ['draft', 'pending', 'preparing', 'ready', 'served'],
    },

    cancelReason: {
      type: String,
      trim: true,
    },

    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    cancelledAt: {
      type: Date,
    },

    wasted: {
      type: Boolean,
      default: false,
      index: true,
    },

    billable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default (mongoose.models.OrderItem as Model<IOrderItem>) ||
  mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);
