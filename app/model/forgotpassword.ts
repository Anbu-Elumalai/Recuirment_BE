import mongoose, { Schema } from "mongoose";
const ForgotPasswordSchema = new mongoose.Schema(
  {
    requestedId:{ type: Schema.Types.ObjectId, ref: 'admins', required: true },
    urlToken: { type: String, required: true },

    urlExpiresAt: { type: Date, required: true },

    isPasswordChanged: {
      type: Boolean,
      default: false,
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
  },
  { timestamps: true }
);

export default mongoose.model("forgotpasswords", ForgotPasswordSchema);
