import { z } from "zod";

export const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least two options are required"),
  category: z.string().min(1, "Category is required"),
  skills: z.array(z.string()).default([]),
  difficultyLevel: z.enum(["easy", "medium", "hard"], {
    message: "Difficulty level is required",
  }),
  timeLimit: z.number().min(1, "Time limit must be at least 1 second"),
  marks: z.number().min(1, "Marks must be at least 1"),
});

export type QuestionSchemaInput = z.infer<typeof questionSchema>

export const updateQuestionSchema = questionSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>

export const questionListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type QuestionListQuery = z.infer<typeof questionListQuerySchema>;