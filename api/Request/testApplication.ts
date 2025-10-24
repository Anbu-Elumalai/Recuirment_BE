import { z } from "zod";

export const jobApplicCreateSchema = z.object({
  jobApplicationName: z.string().min(1, "Job Application name is required"),
  location: z.string().optional(),
  description:z.string().min(1, "Job description name is required"),
  appliedRoles:z.string().min(1, "ROle is required"),
  jobAppCode : z.string().min(1, "Job code is required"),
});


export type JobApplicCreateInput = z.infer<typeof jobApplicCreateSchema>

export const JobApplicUpdateSchema =jobApplicCreateSchema.extend({
  id: z.string().min(1, "ID is required"),
  status: z.string().min(1, "Job Application status is required"),
});

export type JobApplicUpdateInput = z.infer<typeof JobApplicUpdateSchema>

export const jobApplicListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type JobApplicListQuerySchemaListQuery = z.infer<typeof jobApplicListQuerySchema>;

