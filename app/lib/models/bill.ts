import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IBill extends Document {
  billNumber: number;
  orderId: mongoose.Types.ObjectId;

  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;

  paidAmount: number; // ✅ NEW

  printedAt?: Date;

  isPaid: boolean;
  paidAt?: Date;

  isRefunded: boolean;
  refundAmount?: number;
}

const BillSchema = new Schema<IBill>(
  {
    billNumber: { type: Number, required: true, unique: true },

    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },

    subtotal: Number,
    tax: Number,
    discount: Number,
    totalAmount: Number,

    paidAmount: { type: Number, default: 0 }, // ✅ important

    printedAt: Date,

    isPaid: { type: Boolean, default: false },
    paidAt: Date,

    isRefunded: { type: Boolean, default: false },
    refundAmount: Number,
  },
  { timestamps: true },
);

export default mongoose.models.Bill ||
  mongoose.model<IBill>('Bill', BillSchema);