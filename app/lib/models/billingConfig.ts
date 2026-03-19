import mongoose, { Schema } from 'mongoose';

const BillingConfigSchema = new Schema({
  gstPercent: { type: Number, default: 5 },
});

export default mongoose.models.BillingConfig ||
  mongoose.model('BillingConfig', BillingConfigSchema);