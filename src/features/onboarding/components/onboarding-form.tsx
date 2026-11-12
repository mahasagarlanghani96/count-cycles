"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { createClient } from "@/lib/supabase/client";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const STEPS = [
  { title: "About you", description: "Let us get to know you a little" },
  {
    title: "Your cycle",
    description: "Help us personalize your predictions",
  },
  {
    title: "Contraception",
    description: "This helps us tailor insights for you",
  },
];

const CONTRACEPTION_TYPES = [
  "Birth control pill",
  "IUD (hormonal)",
  "IUD (copper)",
  "Implant",
  "Patch",
  "Ring",
  "Injection",
  "Condoms",
  "Other",
];

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(onboardingSchema) as any,
    defaultValues: {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      useContraception: false,
    },
  });

  const useContraception = watch("useContraception");

  async function nextStep() {
    // Validate current step fields before advancing
    const fieldsPerStep: (keyof OnboardingInput)[][] = [
      ["displayName", "dateOfBirth"],
      ["averageCycleLength", "averagePeriodLength", "lastPeriodStartDate"],
      ["useContraception", "contraceptionType"],
    ];

    const valid = await trigger(fieldsPerStep[step]);
    if (valid) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: OnboardingInput) {
    setLoading(true);
    setServerError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setServerError("You must be signed in to complete onboarding.");
        return;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: data.displayName || null,
          date_of_birth: data.dateOfBirth || null,
          cycle_length_estimate: data.averageCycleLength || null,
          period_length_estimate: data.averagePeriodLength || null,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) {
        setServerError(profileError.message);
        return;
      }

      // Update user preferences
      const { error: prefError } = await supabase
        .from("user_preferences")
        .update({
          use_contraception: data.useContraception,
          contraception_type: data.useContraception
            ? data.contraceptionType || null
            : null,
        })
        .eq("user_id", user.id);

      if (prefError) {
        setServerError(prefError.message);
        return;
      }

      // If a last period start date was provided, create an initial period record
      if (data.lastPeriodStartDate) {
        await supabase.from("period_records").insert({
          user_id: user.id,
          start_date: data.lastPeriodStartDate,
          is_predicted: false,
        });
      }

      router.push("/dashboard");
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg rounded-2xl shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-2">
            <BrandLogo variant="icon" size="md" />
          </div>
          <CardTitle className="text-2xl">{STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 pt-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-8 bg-primary-500"
                    : i < step
                      ? "w-8 bg-primary-300"
                      : "w-8 bg-border"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
                {serverError}
              </div>
            )}

            {/* Step 1: About you */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    What should we call you?{" "}
                    <span className="font-normal text-muted">(optional)</span>
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    error={errors.displayName?.message}
                    {...register("displayName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Date of birth{" "}
                    <span className="font-normal text-muted">(optional)</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    error={errors.dateOfBirth?.message}
                    {...register("dateOfBirth")}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Cycle info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="averageCycleLength">
                    Average cycle length (days)
                  </Label>
                  <Input
                    id="averageCycleLength"
                    type="number"
                    min={18}
                    max={45}
                    placeholder="28"
                    error={errors.averageCycleLength?.message}
                    {...register("averageCycleLength")}
                  />
                  <p className="text-xs text-muted">
                    Most cycles are between 21 and 35 days
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="averagePeriodLength">
                    Average period length (days)
                  </Label>
                  <Input
                    id="averagePeriodLength"
                    type="number"
                    min={1}
                    max={14}
                    placeholder="5"
                    error={errors.averagePeriodLength?.message}
                    {...register("averagePeriodLength")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastPeriodStartDate">
                    When did your last period start?{" "}
                    <span className="font-normal text-muted">(optional)</span>
                  </Label>
                  <Input
                    id="lastPeriodStartDate"
                    type="date"
                    error={errors.lastPeriodStartDate?.message}
                    {...register("lastPeriodStartDate")}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Contraception */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    id="useContraception"
                    type="checkbox"
                    className="h-5 w-5 rounded-lg border-border text-primary-500 accent-primary-500"
                    {...register("useContraception")}
                  />
                  <Label htmlFor="useContraception" className="cursor-pointer">
                    I currently use contraception
                  </Label>
                </div>

                {useContraception && (
                  <div className="space-y-2">
                    <Label htmlFor="contraceptionType">
                      Type of contraception
                    </Label>
                    <select
                      id="contraceptionType"
                      className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                      {...register("contraceptionType")}
                    >
                      <option value="">Select an option</option>
                      {CONTRACEPTION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.contraceptionType && (
                      <p className="text-xs text-red-500">
                        {errors.contraceptionType.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 pt-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={prevStep}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={nextStep}
                  className={step > 0 ? "flex-1" : "w-full"}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className={step > 0 ? "flex-1" : "w-full"}
                >
                  <Check className="h-4 w-4" />
                  Complete setup
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
