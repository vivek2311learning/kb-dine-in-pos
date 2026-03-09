import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true },
);

export default (mongoose.models.Feedback as Model<IFeedback>) ||
  mongoose.model<IFeedback>('Feedback', FeedbackSchema);
