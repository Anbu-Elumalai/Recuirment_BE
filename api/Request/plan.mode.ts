import { z } from "zod";

export const planSchema = z.object({
  name: z.enum(["Start", "Small", "Medium", "Large"], {
    message: "Difficulty level is required",
  }),

  price: z.number().min(0, "price is required"),

  currency: z
    .string()
    .min(1, "Currency id is required"),

  duration: z.enum(["monthly", "yearly"], {
    message: "Duration is required",
  }),
  features: z
    .array(
      z.object({
        points: z
          .string({ message: "Feature points are required" })
          .min(1, "Feature cannot be empty"),
      })
    )
    .min(1, "At least one feature is required"),
  candidateLimit: z
    .number()
    .min(2, "candidate limit must be greater than 2"),
  testLimit: z
    .number()
    .min(0, "test limit must be atlest 1"),
  adminLimit: z
    .number()
    .min(0, "admin limit must be atlest 1"),
    dodoProductId: z
    .string()
    .min(1, "Slecet Dodo product is required"),

});

export type PlanSchemaInput = z.infer<typeof planSchema>

export const updatePlanSchema = planSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>

export const planListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(), search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type PlanListQuery = z.infer<typeof planListQuerySchema>;