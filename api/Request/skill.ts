import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
});

export type CreateskillInput = z.infer<typeof skillSchema>;

export const updateskillSchema = skillSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdateskillInput = z.infer<typeof updateskillSchema>;

export const skillListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type skillListQuery = z.infer<typeof skillListQuerySchema>;