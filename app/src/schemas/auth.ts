import { z } from "zod";

export const SubscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const SignUpSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
});

export type SubscribeInput = z.infer<typeof SubscribeSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
