import mongoose, { Schema, Document, Model } from 'mongoose';
import { KitchenStatus } from '@/types/enums';

export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;

  tableId?: mongoose.Types.ObjectId | null;

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

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    /* ORDER */

    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    /* TABLE (optional for parcel orders) */

    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
      index: true,
    },

    /* MENU ITEM */

    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      default: null,
    },

    /* SNAPSHOT DATA */

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
      default: 1,
    },

    /* KITCHEN WORKFLOW */

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

    /* CANCELLATION */

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

    /* WASTAGE */

    wasted: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* BILLING */

    billable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/* ================= PERFORMANCE INDEXES ================= */

OrderItemSchema.index({ orderId: 1, kitchenStatus: 1 });
OrderItemSchema.index({ orderId: 1, cancelled: 1 });
OrderItemSchema.index({ tableId: 1, served: 1 });

export default (mongoose.models.OrderItem as Model<IOrderItem>) ||
  mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);