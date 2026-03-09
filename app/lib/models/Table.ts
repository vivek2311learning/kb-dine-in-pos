import mongoose, { Schema, Document, Model } from 'mongoose';
import { TableStatus } from '@/types/enums';

export interface ITable extends Document {
  tableNumber: number;
  status: TableStatus;
  currentOrderId?: mongoose.Types.ObjectId | null;
}

const TableSchema = new Schema<ITable>(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['free', 'occupied'],
      default: 'free',
    },
    currentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  { timestamps: true },
);

export default (mongoose.models.Table as Model<ITable>) ||
  mongoose.model<ITable>('Table', TableSchema);
