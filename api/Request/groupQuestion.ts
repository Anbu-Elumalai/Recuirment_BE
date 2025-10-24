import { z } from "zod";

export const groupQuestionSchema = z.object({
  questionGroupName: z.string().min(1, "Question group name is required"),
   formSkillBaseQuestion: z
    .array(
      z.object({
        categories: z.string().min(1, "Category ID is required"),
        skills: z.string().min(1, "Skill ID is required"), 
        difficultyLevel: z.string().min(1, "Difficulty level is required") ,
        numberOfQuestion: z.number().min(0, "Number of questions cannot be negative").default(0),
      })
    )
    .default([]),
    
  totalNumberOfQuestion: z.number().min(1, "Total number of questions must be at least 1"),
  autoSelect: z.boolean().default(true),
  selectedQuestions: z.array(z.string()).default([]),
});


export type GroupQuestionSchemaInput = z.infer<typeof groupQuestionSchema>

export const groupUpdateQuestionSchema = groupQuestionSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type GroupUpdateQuestionInput = z.infer<typeof groupUpdateQuestionSchema>

export const groupQuestionListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type GroupQuestionListQuery = z.infer<typeof groupQuestionListQuerySchema>;

export const formSkillItemSchema = z.object({
  skills: z.string().min(1, "Skill id is required"),           // skill id (string)
  categories: z.string().min(1, "Category id is required"),   // category id (string)
  difficultyLevel: z.enum(["easy", "medium", "hard"]),         // single difficulty for this item
  numberOfQuestion: z.number().int().min(0).default(0),        // how many questions to pick
});

export const autoSelectSchema = z.object({
  totalNumberOfQuestion: z.number().int().min(1, "Total must be at least 1"),
  formSkillBaseQuestion: z
    .array(formSkillItemSchema)
    .min(1, "At least one skill-category entry is required")
    .default([]),
});

export type AutoSelectInput = z.infer<typeof autoSelectSchema>;