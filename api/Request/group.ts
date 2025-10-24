import { z } from "zod";

export const  groupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  applicationId:  z.string().min(1, "Application id is required"),
  candidateId: z.array(z.string().min(1, "Candidate ID cannot be empty"))
});

export type CreategroupInput = z.infer<typeof groupSchema>;

export const updategroupSchema = groupSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdategroupInput = z.infer<typeof updategroupSchema>;

export const groupListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type groupListQuery = z.infer<typeof groupListQuerySchema>;