import mongoose, { Schema } from "mongoose";

const testValidationForCandidate = new mongoose.Schema(
  {
    numberOfTestPerCandidate: { type: Number, default: 1 },
    numberOfDaysToAttend: { type: Number, default: 1 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'admins', required: true },
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'admins', required: false, default: null },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    groupingId: { type: Schema.Types.ObjectId, ref: 'groupingids', required: true },
  },
  { timestamps: true }
);

export default mongoose.model("testValidationForCandidate", testValidationForCandidate);
