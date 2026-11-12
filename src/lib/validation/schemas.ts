import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    displayName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  dateOfBirth: z.string().optional(),
  averageCycleLength: z.coerce.number().int().min(18).max(45).optional(),
  averagePeriodLength: z.coerce.number().int().min(1).max(14).optional(),
  lastPeriodStartDate: z.string().optional(),
  useContraception: z.boolean().default(false),
  contraceptionType: z.string().optional(),
});

export const periodRecordSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    notes: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    { message: "End date must be on or after start date", path: ["endDate"] }
  );

export const dailyLogSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  flowIntensity: z
    .enum(["spotting", "light", "medium", "heavy"])
    .optional()
    .nullable(),
  mood: z
    .enum([
      "happy",
      "calm",
      "energetic",
      "anxious",
      "sad",
      "irritable",
      "stressed",
      "neutral",
    ])
    .optional()
    .nullable(),
  energyLevel: z.coerce.number().int().min(1).max(5).optional().nullable(),
  sleepQuality: z.coerce.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const symptomLogSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  symptomName: z.string().min(1).max(100),
  severity: z.enum(["mild", "moderate", "severe"]),
  notes: z.string().max(500).optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type PeriodRecordInput = z.infer<typeof periodRecordSchema>;
export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type SymptomLogInput = z.infer<typeof symptomLogSchema>;
