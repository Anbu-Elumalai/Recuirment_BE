import { z } from "zod";

export const candidateTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreatecandidateTypeInput = z.infer<typeof candidateTypeSchema>;

export const updatecandidateTypeSchema = candidateTypeSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdatecandidateTypeInput = z.infer<typeof updatecandidateTypeSchema>;

export const candidateTypeListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type candidateTypeListQuery = z.infer<typeof candidateTypeListQuerySchema>;