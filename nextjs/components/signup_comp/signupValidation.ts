import { z } from "zod";

// Zod validation schema for signup form
export const signupSchema = z
  .object({
    firstName: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z
        .string()
        .min(1, "First name is required")
        .regex(/^[A-Za-z][A-Za-z\s'-]{1,}$/, "Enter a valid first name")
    ),
    lastName: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z
        .string()
        .min(1, "Last name is required")
        .regex(/^[A-Za-z][A-Za-z\s'-]{1,}$/, "Enter a valid last name")
    ),
    email: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z.string().min(1, "Email is required").email("Enter a valid email")
    ),
    password: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z.string().min(1, "Password is required").min(6, "Minimum 6 characters")
    ),
    confirmPassword: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z.string().min(1, "Please confirm password")
    ),
    grade: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z.string().min(1, "Select your grade")
    ),
    exams: z.array(z.number()).optional(),
    dob: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z
        .string()
        .min(1, "Date of birth is required")
        .refine(
          (date) => {
            const dobDate = new Date(date);
            const now = new Date();
            return dobDate <= now;
          },
          {
            message: "DOB cannot be in the future",
          }
        )
        .refine(
          (date) => {
            const dobDate = new Date(date);
            const now = new Date();
            const age =
              (now.getTime() - dobDate.getTime()) / (365.25 * 24 * 3600 * 1000);
            return age >= 5;
          },
          {
            message: "Minimum age is 5",
          }
        )
    ),
    phoneCode: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z.string().min(1, "Code required")
    ),
    phone: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z
        .string()
        .min(1, "Phone number is required")
        .regex(/^[0-9]{7,15}$/, "Enter a valid phone number")
    ),
    schoolName: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z.string().min(1, "School name is required")
    ),
    city: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z.string().min(1, "City is required")
    ),
    state: z.preprocess(
      (val) => (val === undefined || val === null ? "" : val),
      z.string().min(1, "State is required")
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type inferred from the schema
export type SignupFormValues = z.infer<typeof signupSchema>;
