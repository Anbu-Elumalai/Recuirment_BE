import { z } from "zod";

export const testConfigSchema = z.object({
  numberOfTestsPerCandidate: z
    .number()
    .min(1, "Each candidate must be allowed at least one test."),
  numberOfDaysToAttend: z
    .number()
    .min(1, "Candidate must wait at least 1 month before reattempting."),
});

export type CreatetestConfigInput = z.infer<typeof testConfigSchema>;

export const updatetestConfigSchema = testConfigSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdatetestConfigInput = z.infer<typeof updatetestConfigSchema>;
