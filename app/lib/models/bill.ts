import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBill extends Document {
  billNumber: number;
  orderId: mongoose.Types.ObjectId;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  printedAt: Date;

  paidAt?: Date;
  isPaid: boolean;

  // Refund
  isRefunded: boolean;
  refundAt?: Date;
  refundReason?: string;
  refundAmount?: number;
  refundedBy?: mongoose.Types.ObjectId;
}

const BillSchema = new Schema<IBill>(
  {
    billNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    printedAt: { type: Date, default: Date.now },

    paidAt: { type: Date },
    isPaid: { type: Boolean, default: false },

    // Refund fields
    isRefunded: { type: Boolean, default: false },
    refundAt: { type: Date },
    refundReason: { type: String },
    refundAmount: { type: Number },
    refundedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

export default (mongoose.models.Bill as Model<IBill>) ||
  mongoose.model<IBill>('Bill', BillSchema);
