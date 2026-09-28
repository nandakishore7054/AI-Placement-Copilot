import { z } from "zod";

export const SubscribeSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .max(100, "Email is too long"),
});

export const UnsubscribeSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .max(100, "Email is too long"),
});

export const SubscriptionActionSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional(),
  action: z.enum(["subscribe", "unsubscribe"]).default("subscribe"),
});

export type SubscribeInput = z.infer<typeof SubscribeSchema>;
export type UnsubscribeInput = z.infer<typeof UnsubscribeSchema>;
export type SubscriptionActionInput = z.infer<typeof SubscriptionActionSchema>;
