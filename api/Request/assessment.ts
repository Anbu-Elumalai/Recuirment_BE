import { z } from "zod";

export const assessmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isGroupCandidate: z.boolean(),
  candidateIds: z.array(z.string()).optional(),
  assessmentGroupCandidateId: z.string().optional(),
  assessmentQuestionId: z.string().min(1, "Question Group ID cannot be empty"),
  startDateTime: z.string().min(1, "Start time is required"),
  endDateTime: z.string().min(1, "End time is required"),
  passingMarks: z
    .number()
    .min(2, "Passing marks must be greater than 2"),
  timeAllocation: z.boolean(),
});

export type CreateassessmentInput = z.infer<typeof assessmentSchema>;

export const updateassessmentSchema = assessmentSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UpdateassessmentInput = z.infer<typeof updateassessmentSchema>;

export const assessmentListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(), search: z.string().optional().default(''),
  sort: z.enum(['asc', 'desc']).optional().default('asc'),
  type: z.string().optional().default(''),

});

export type AssessmentListQuery = z.infer<typeof assessmentListQuerySchema>;

export const paymentDteails = z.object({
  planId: z.string().min(1, "planId is required"),
  amount: z.number().min(1, "amount is required"),
  currency: z.string().min(1, "currency is required"),
  email: z.string().min(1, "email is required"),
  description: z.string().min(1, "description is required"),
  name: z.string().min(1, "name is required"),
  phoneNumber: z.string().min(1, "phoneNumber is required"),
  billing: z.object({
    city:z.string().min(1, "city is required"),
    country: z.string().min(1, "country is required"),
    state:z.string().min(1, "state is required"),
    street:z.string().min(1, "street is required"),
    zipcode:z.string().min(1, "zipcode is required"),
  })
})

export type PaymentDteailsSchema = z.infer<typeof paymentDteails>;
