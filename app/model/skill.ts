import mongoose, { Schema } from "mongoose";
const skillSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
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

export default mongoose.model("skill", skillSchema);
