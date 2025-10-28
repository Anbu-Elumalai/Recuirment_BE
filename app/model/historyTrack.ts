import mongoose, { Schema } from "mongoose";

const historySchema = new Schema(
  {
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    modelId: {
      type: String,
      required: true,
      trim: true,
    },
    changedFields: [
      {
        field: { type: String, required: true },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "admins",
      required: true,
    },
    groupingId: {
      type: Schema.Types.ObjectId,
      ref: "groupingids",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("historys", historySchema);
