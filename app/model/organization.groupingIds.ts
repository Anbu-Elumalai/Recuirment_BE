import mongoose, { Schema } from "mongoose";

const GroupingIdSchema = new Schema({
   organizationName: {
      type: String,
      required: true,
      trim: true,
    },
      country:{
      type: String,
      required: true,
      trim: true,
    },
      organizationType: {
      type: String,
      enum: ["Recuriment", "Education"],
      required: true,
      default: "Recuriment",   
    },

    numberOfStudentsOrEmployees: {
      type: Number,
      default: 0,
    },

     // subscriptionPlan: {
    //   type: String,
    //   enum: ["free_trial", "monthly", "yearly", "hybrid"],
    //   default: "free_trial",
    // },

  isDelete: { type: Boolean, required: true, default: false },
  isActive: { type: Boolean, required: true, default: true },
}, { timestamps: true });

const GroupingTeamId = mongoose.model('groupingid', GroupingIdSchema);
export default GroupingTeamId;
