import mongoose, { Schema } from "mongoose";
const jobApplicationSchema = new mongoose.Schema(
  {
    jobAppCode: {
      type: String,
      required: true,
      trim: true,
    },
        
    jobApplicationName:{
      type: String,
      required: true,
      trim: true,
    },

    location:{
      type: String,
      trim: true,
    },

    
    description:{
      type: String,
      required: true,
      trim: true,
    },

    appliedRoles: {type: Schema.Types.ObjectId, ref: 'roles', required: true},

     statusHistory: [
    {
      status: {
        type: String,
        enum: ["open", "hold", "closed"],
        required: true,
      },
      changedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

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

export default mongoose.model("jobapplications", jobApplicationSchema);
