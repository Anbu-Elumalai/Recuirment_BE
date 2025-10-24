import { Schema, model } from "mongoose";

const QuestionSchema = new Schema(
  {
    questionText: { type: String, required: true, trim: true },

    options: [
      {
        text: { type: String , required: true, trim: true},
        isCorrect: { type: Boolean, default: false },
      },
    ],

    category: {
      type: Schema.Types.ObjectId, ref: "categories", 
      required: true
    },

    skills: [{ type: Schema.Types.ObjectId, ref: "skills", default: [] }],  //its  topic of specific category

    difficultyLevel: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    timeLimit: { type: Number, default: 60 }, // seconds
    marks: { type: Number, default: 1 },

    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    groupingId: { type: Schema.Types.ObjectId, ref: 'groupingids', required: true },
    
  },
  { timestamps: true }
);

export const QuestionModel = model("Question", QuestionSchema);
