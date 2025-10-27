import { z } from "zod";


 export const candidateSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.number().min(1000000, "Too short").max(999999999999999, "Too long"),
  linkedinUrl: z.string().optional(),
});

export type CreatecandidateInput = z.infer<typeof candidateSchema>;

export const updatecandidateSchema = candidateSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdatecandidateInput = z.infer<typeof updatecandidateSchema>;

export const candidateListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),
  isValidCan:z.string()
});

export type CandidateListQuery = z.infer<typeof candidateListQuerySchema>;