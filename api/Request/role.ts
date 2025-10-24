import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreateRoleInput = z.infer<typeof roleSchema>;

export const updateRoleSchema = roleSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const roleListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type RoleListQuery = z.infer<typeof roleListQuerySchema>;