import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRefundLog extends Document {
  billId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  refundedBy: mongoose.Types.ObjectId;
  refundedAt: Date;
}

const RefundLogSchema = new Schema<IRefundLog>(
  {
    billId: {
      type: Schema.Types.ObjectId,
      ref: 'Bill',
      required: true,
      index: true,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    refundedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    refundedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

/* Indexes */

RefundLogSchema.index({ billId: 1 });
RefundLogSchema.index({ refundedAt: -1 });

export default (mongoose.models.RefundLog as Model<IRefundLog>) ||
  mongoose.model<IRefundLog>('RefundLog', RefundLogSchema);
