import mongoose, { Schema, Document } from "mongoose";



const questionGroupSchema = new Schema(
  {
    groupName: { type: String, required: true, trim: true },

    formSkillBaseQuestion:[{
      categories: { type: Schema.Types.ObjectId, ref: "categories" },
      skills: { type: Schema.Types.ObjectId, ref: "skills" },
      difficultyLevel: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
      numberOfQuestion:{ type: Number, default: 0 }
    }],
    
    totalNumberOfQuestion:{ type: Number, default: 0 },
    // Auto or manual selection mode
    autoSelect: { type: Boolean, default: true },

    // Final selected question IDs (after processing)
    selectedQuestions: [{ type: Schema.Types.ObjectId, ref: "questions" }],
    totalDuration: { type: Number, default: 15 }, // min

    // Metadata
    createdBy: { type: Schema.Types.ObjectId, ref: "admins", required: true },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "admins", default: null },

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    groupingId: { type: Schema.Types.ObjectId, ref: 'groupingids', required: true },

  },
  { timestamps: true }
);

export const QuestionGroupModel = mongoose.model(
  "questiongroups",
  questionGroupSchema
);
