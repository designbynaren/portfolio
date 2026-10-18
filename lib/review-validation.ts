import { z } from "zod";

export const reviewInput = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  project: z.string().trim().min(2, "Add the project or company name.").max(100),
  rating: z.number().int().min(1, "Choose a rating.").max(5),
  comment: z.string().trim().min(10, "Please write at least 10 characters.").max(1500),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree to publish your review." }) }),
});
export type ReviewInput = z.infer<typeof reviewInput>;
export type ClientReview = {
  id: string; name: string; project: string; rating: number; comment: string;
  createdAt: string; updatedAt: string;
};
