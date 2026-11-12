import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  periodRecordSchema,
  dailyLogSchema,
  symptomLogSchema,
  onboardingSchema,
} from "@/lib/validation/schemas";

describe("loginSchema", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "notanemail",
      password: "Password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "Password1" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts valid signup", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
      confirmPassword: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "password1",
      confirmPassword: "password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "PasswordX",
      confirmPassword: "PasswordX",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional display name", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
      confirmPassword: "Password1",
      displayName: "Jane",
    });
    expect(result.success).toBe(true);
  });

  it("rejects too short display name", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
      confirmPassword: "Password1",
      displayName: "J",
    });
    expect(result.success).toBe(false);
  });
});

describe("periodRecordSchema", () => {
  it("accepts valid period with start only", () => {
    const result = periodRecordSchema.safeParse({
      startDate: "2024-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid period with start and end", () => {
    const result = periodRecordSchema.safeParse({
      startDate: "2024-01-15",
      endDate: "2024-01-20",
    });
    expect(result.success).toBe(true);
  });

  it("accepts same day start and end", () => {
    const result = periodRecordSchema.safeParse({
      startDate: "2024-01-15",
      endDate: "2024-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects end before start", () => {
    const result = periodRecordSchema.safeParse({
      startDate: "2024-01-20",
      endDate: "2024-01-15",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = periodRecordSchema.safeParse({
      startDate: "01/15/2024",
    });
    expect(result.success).toBe(false);
  });

  it("allows null end date", () => {
    const result = periodRecordSchema.safeParse({
      startDate: "2024-01-15",
      endDate: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows notes", () => {
    const result = periodRecordSchema.safeParse({
      startDate: "2024-01-15",
      notes: "Light flow today",
    });
    expect(result.success).toBe(true);
  });
});

describe("dailyLogSchema", () => {
  it("accepts minimal daily log", () => {
    const result = dailyLogSchema.safeParse({
      logDate: "2024-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("accepts full daily log", () => {
    const result = dailyLogSchema.safeParse({
      logDate: "2024-01-15",
      flowIntensity: "medium",
      mood: "happy",
      energyLevel: 4,
      sleepQuality: 3,
      notes: "Good day",
    });
    expect(result.success).toBe(true);
  });

  it("validates flow intensity values", () => {
    const result = dailyLogSchema.safeParse({
      logDate: "2024-01-15",
      flowIntensity: "extreme",
    });
    expect(result.success).toBe(false);
  });

  it("validates mood values", () => {
    const result = dailyLogSchema.safeParse({
      logDate: "2024-01-15",
      mood: "ecstatic",
    });
    expect(result.success).toBe(false);
  });

  it("validates energy level range", () => {
    const result = dailyLogSchema.safeParse({
      logDate: "2024-01-15",
      energyLevel: 6,
    });
    expect(result.success).toBe(false);
  });

  it("validates sleep quality range", () => {
    const result = dailyLogSchema.safeParse({
      logDate: "2024-01-15",
      sleepQuality: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts null optional fields", () => {
    const result = dailyLogSchema.safeParse({
      logDate: "2024-01-15",
      flowIntensity: null,
      mood: null,
      energyLevel: null,
      sleepQuality: null,
      notes: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("symptomLogSchema", () => {
  it("accepts valid symptom log", () => {
    const result = symptomLogSchema.safeParse({
      logDate: "2024-01-15",
      symptomName: "Cramps",
      severity: "moderate",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty symptom name", () => {
    const result = symptomLogSchema.safeParse({
      logDate: "2024-01-15",
      symptomName: "",
      severity: "mild",
    });
    expect(result.success).toBe(false);
  });

  it("validates severity values", () => {
    const result = symptomLogSchema.safeParse({
      logDate: "2024-01-15",
      symptomName: "Headache",
      severity: "extreme",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional notes", () => {
    const result = symptomLogSchema.safeParse({
      logDate: "2024-01-15",
      symptomName: "Bloating",
      severity: "mild",
      notes: "After lunch",
    });
    expect(result.success).toBe(true);
  });

  it("allows null notes", () => {
    const result = symptomLogSchema.safeParse({
      logDate: "2024-01-15",
      symptomName: "Fatigue",
      severity: "severe",
      notes: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("onboardingSchema", () => {
  it("accepts empty onboarding (all optional)", () => {
    const result = onboardingSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts full onboarding data", () => {
    const result = onboardingSchema.safeParse({
      displayName: "Jane",
      dateOfBirth: "1995-06-15",
      averageCycleLength: 28,
      averagePeriodLength: 5,
      lastPeriodStartDate: "2024-01-01",
      useContraception: false,
    });
    expect(result.success).toBe(true);
  });

  it("validates cycle length range", () => {
    const result = onboardingSchema.safeParse({
      averageCycleLength: 15,
    });
    expect(result.success).toBe(false);
  });

  it("validates period length range", () => {
    const result = onboardingSchema.safeParse({
      averagePeriodLength: 20,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = onboardingSchema.safeParse({
      averageCycleLength: "28",
      averagePeriodLength: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.averageCycleLength).toBe(28);
    }
  });
});
