import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phoneNumber: z.number().min(1000000, "Too short").max(999999999999999, "Too long"),
});
export type CreateUSerInput = z.infer<typeof createUserSchema>;


export const updateuserSchema = createUserSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdateuserInput = z.infer<typeof updateuserSchema>;

export const userListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type userListQuery = z.infer<typeof userListQuerySchema>;