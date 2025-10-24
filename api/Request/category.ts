import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreatecategoryInput = z.infer<typeof categorySchema>;

export const updatecategorySchema = categorySchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdatecategoryInput = z.infer<typeof updatecategorySchema>;

export const categoryListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type categoryListQuery = z.infer<typeof categoryListQuerySchema>;