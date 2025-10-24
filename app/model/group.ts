import mongoose, { Schema } from "mongoose";
const groupCandidateSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    applicationId: { type: Schema.Types.ObjectId, ref: 'jobapplications', required: true },
    canidateId: [{ type: Schema.Types.ObjectId, trim: true  ,default: [],}],
    createdBy: { type: Schema.Types.ObjectId, ref: 'admins', required: true },
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'admins', required: false , default: null},
    isActive: {
      type: Boolean,
      default: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    groupingId: { type: Schema.Types.ObjectId, ref: 'groupingids', required: true },

  },
  { timestamps: true }
);

export default mongoose.model("candidategroups", groupCandidateSchema);
