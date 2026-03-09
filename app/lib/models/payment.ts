import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod } from '@/types/enums';

export interface IPayment extends Document {
  billId: mongoose.Types.ObjectId;
  method: PaymentMethod;
  amount: number;
  receivedBy: mongoose.Types.ObjectId;
  paidAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    billId: {
      type: Schema.Types.ObjectId,
      ref: 'Bill',
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ['cash', 'upi', 'card'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default (mongoose.models.Payment as Model<IPayment>) ||
  mongoose.model<IPayment>('Payment', PaymentSchema);
