import { z } from "zod";

// Zod validation schema for login form
export const loginSchema = z.object({
  email: z.preprocess(
    (val) => (val === undefined || val === null ? "" : val),
    z.string().min(1, "Email is required").email("Enter a valid email address")
  ),
  password: z.preprocess(
    (val) => (val === undefined || val === null ? "" : val),
    z.string().min(1, "Password is required")
  ),
});

// Type inferred from the schema
export type LoginFormValues = z.infer<typeof loginSchema>;
