import mongoose, { Schema } from "mongoose";

const candidateSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String,  trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true ,unique: true },
    phone: { type: String, trim: true,unique: true }, 
    linkedinUrl: { type: String, trim: true },
   
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'admins', required: true },
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'admins', required: false , default: null},
    groupingId: { type: Schema.Types.ObjectId, ref: 'groupingids', required: true },
    
  },
  { timestamps: true }
);

export const CandidateModel = mongoose.model(
  "candidates",
  candidateSchema
);