import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IBill extends Document {
  billNumber: number;
  orderId: mongoose.Types.ObjectId;

  subtotal: number;
  tax: number;
  discount: number;
  adjustAmount: number;

  totalAmount: number;
  paidAmount: number;

  customerPhone?: string;
  shareToken?: string;

  printedAt?: Date;

  isPaid: boolean;
  paidAt?: Date;

  isRefunded: boolean;
  refundAmount?: number;
  refundReason?: string;
  refundAt?: Date;
}

const BillSchema = new Schema<IBill>(
  {
    billNumber: { type: Number, required: true, unique: true },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    adjustAmount: { type: Number, default: 0 },

    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },

    customerPhone: { type: String },
    shareToken: { type: String, unique: true, sparse: true },

    printedAt: Date,

    isPaid: { type: Boolean, default: false },
    paidAt: Date,

    isRefunded: { type: Boolean, default: false },
    refundAmount: Number,
    refundReason: String,
    refundAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.Bill ||
  mongoose.model<IBill>('Bill', BillSchema);
