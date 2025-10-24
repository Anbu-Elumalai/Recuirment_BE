import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    permissions: {
      type: Boolean,
      default: false,
    },

    userType:
      { type: String, enum: ["Admin", "User"], default: "User" },

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

export default mongoose.model("admins", userSchema);
