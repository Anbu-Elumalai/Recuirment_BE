import mongoose, { Schema } from "mongoose";

const userActivityLogSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    actionPerformed: {
      type: String,
      required: true,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      required: true,
      trim: true,
    },
    deviceUsed: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "admins", 
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

export default mongoose.model(
  "useractivitylogs",
  userActivityLogSchema
);