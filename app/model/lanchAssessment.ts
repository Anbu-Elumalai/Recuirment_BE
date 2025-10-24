import mongoose, { Schema } from "mongoose";
const assessmentLanchSchema = new mongoose.Schema(
  {
    assessmentName: {
      type: String,
      required: true,
      trim: true,
    },
    isGroupCandidate :{
      type: Boolean,
      default: true,
    },
    
    candidateIds: [{type: Schema.Types.ObjectId, trim: true , default: []}], 

    groupCandidateId: { type: Schema.Types.ObjectId, trim: true ,ref: 'candidategroups' , default: null},
    groupQuestionId: { type: Schema.Types.ObjectId, trim: true  ,required: true,ref: 'questiongroups', },
     startDateTime: {
      type: Date,
      required: true,
    },

    endDateTime: {
      type: Date,
      required: true,
    },

    passingMarks: {
      type: Number,
      default: 0,
    },

    timeAllocation: { type: Boolean, default: true }, // splitTime base on the question overall time

     urlToken: { type: String, required: true ,   unique: true},

     urlExpiresAt: { type: Date, required: true },

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

    isAssessentLanch: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("assessmentlanch", assessmentLanchSchema);
