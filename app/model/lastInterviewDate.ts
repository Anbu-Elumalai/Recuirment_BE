import mongoose, { Schema } from "mongoose";

const LastInterviewSchema = new Schema(
  {
    candidateId: { 
      type: Schema.Types.ObjectId, 
      ref: "candidates", 
      required: true 
    },

    assessmentId: { 
      type: Schema.Types.ObjectId, 
      ref: "assessmentlanchs", 
      required: true 
    },

    isSubmitted: {
      type: Boolean,
      default: false,
    },

    submittedAt: { type: Date, default: null },
    
    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "questions", required: true },
        correctAns:[ { type: String, default: "" }],
        answerChosen:[ { type: String, default: "" }],
      },
    ],

    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: "admins", 
      required: true 
    },

    modifiedBy: { 
      type: Schema.Types.ObjectId, 
      ref: "admins", 
      default: null 
    },

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

export default mongoose.model("LastInterview", LastInterviewSchema);
