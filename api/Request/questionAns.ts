import { z } from "zod";

export const assessmentAnswerSchema = z.object({
    candidateId: z.string().min(1, "Candidate Id is required"),
    assessmentId: z.string().min(1, "Assessment Id is required"),
    questionId: z.string().min(1, "Question Id is required"),
    chosen: z
        .array(z.string().min(1, "Each chosen answer is required"))
        .min(1, "At least one answer must be chosen"),
});

export type AssessAnsInput = z.infer<typeof assessmentAnswerSchema>;


export const assessmentSubmitionSchema = z.object({
    candidateId: z.string().min(1, "Candidate Id is required"),
    assessmentId: z.string().min(1, "Assessment Id is required"),
});

export type AssessmentSubmitionSchema = z.infer<typeof assessmentSubmitionSchema>;
