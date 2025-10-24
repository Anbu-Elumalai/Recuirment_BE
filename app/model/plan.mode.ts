import mongoose, { Schema, Document } from "mongoose";

const FeatureSchema = new mongoose.Schema({
  points: { type: String, required: true },
});

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["Start", "Small", "Medium", "Large"],
  },
  price: { type: Number, required: true },       // price in USD
  currency: { type: String, default: "USD" },    // always USD
  duration: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
  candidateLimit: { type: Number, required: true },
  testLimit: { type: Number, default: 0 },
  adminLimit: { type: Number, default: 1 },
  features: [FeatureSchema],
  dodoProductId:{ type: String, required: true, default:"", unique: true,},
  createdBy: { type: Schema.Types.ObjectId, ref: "admins", required: true },
  modifiedBy: { type: Schema.Types.ObjectId, ref: "admins", default: null },

  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("plans", PlanSchema);
