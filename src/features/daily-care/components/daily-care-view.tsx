"use client";

import { usePeriods } from "@/features/periods/hooks/use-periods";
import { getCurrentCycleInfo } from "@/lib/dates";
import type { CyclePhase } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Utensils,
  Dumbbell,
  Moon,
  Droplets,
  AlertTriangle,
  Heart,
  Sun,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PhaseInfo {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  badgeColor: string;
  bodyChanges: string;
  commonSymptoms: string[];
  selfCareTips: string[];
  exerciseSuggestions: string[];
  nutritionGuidance: string[];
  whenToSeeDoctor: string[];
}

const PHASE_CONTENT: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: "Menstrual Phase",
    description:
      "Your body is shedding the uterine lining. It's normal to feel more tired — honor your body's need for rest.",
    icon: Droplets,
    color: "text-primary-500",
    badgeColor: "bg-primary-100 text-primary-700",
    bodyChanges:
      "Hormone levels (estrogen and progesterone) are at their lowest. The uterine lining sheds, causing menstrual bleeding. You may experience lower energy as your body works to renew itself. Iron levels can dip, especially with heavier flow.",
    commonSymptoms: [
      "Cramps and lower abdominal pain",
      "Lower back pain",
      "Fatigue and low energy",
      "Bloating and water retention",
      "Headaches or migraines",
      "Mood changes and irritability",
      "Breast tenderness",
      "Digestive changes",
    ],
    selfCareTips: [
      "Use a heating pad on your lower abdomen for cramp relief",
      "Prioritize sleep — aim for 8+ hours",
      "Take warm baths with Epsom salts to ease muscle tension",
      "Stay hydrated with warm herbal teas like ginger or chamomile",
      "Practice gentle self-massage on your lower back",
      "Allow yourself to slow down without guilt",
    ],
    exerciseSuggestions: [
      "Gentle yoga and stretching",
      "Light walking at a comfortable pace",
      "Restorative or yin yoga",
      "Easy swimming (if comfortable)",
      "Avoid high-intensity or heavy lifting if fatigued",
    ],
    nutritionGuidance: [
      "Increase iron-rich foods: leafy greens, lentils, lean red meat",
      "Pair iron with vitamin C for better absorption",
      "Eat anti-inflammatory foods: turmeric, ginger, fatty fish",
      "Include magnesium-rich foods: dark chocolate, nuts, seeds",
      "Stay well-hydrated to reduce bloating",
      "Limit caffeine, alcohol, and salty foods",
    ],
    whenToSeeDoctor: [
      "Bleeding that soaks through a pad or tampon every hour for several hours",
      "Periods lasting longer than 7 days",
      "Severe pain that disrupts daily activities despite pain relief",
      "Passing large blood clots (bigger than a quarter)",
      "Symptoms of anemia: dizziness, shortness of breath, extreme fatigue",
    ],
  },
  follicular: {
    name: "Follicular Phase",
    description:
      "Rising estrogen brings renewed energy and optimism. A great time for new projects and social activities.",
    icon: Sun,
    color: "text-amber-500",
    badgeColor: "bg-amber-100 text-amber-700",
    bodyChanges:
      "Estrogen levels are steadily rising, stimulating the growth of follicles in the ovaries. The uterine lining begins to thicken again. You'll likely notice increased energy, improved mood, and sharper mental focus as estrogen supports serotonin production.",
    commonSymptoms: [
      "Increasing energy levels",
      "Improved mood and motivation",
      "Better concentration and memory",
      "Clearer skin as estrogen rises",
      "Increased creativity",
      "Higher pain tolerance",
    ],
    selfCareTips: [
      "Channel your rising energy into planning and goal-setting",
      "Try new activities or tackle challenging tasks",
      "Socialize — you'll likely feel more outgoing",
      "Start creative projects you've been putting off",
      "Establish healthy routines to carry through the cycle",
      "Journal or reflect on intentions for the month ahead",
    ],
    exerciseSuggestions: [
      "Cardio workouts: running, cycling, dance classes",
      "Strength training with progressive overload",
      "High-intensity interval training (HIIT)",
      "Group fitness classes for social motivation",
      "Try a new sport or physical activity",
    ],
    nutritionGuidance: [
      "Focus on lean proteins to support follicle development",
      "Eat fermented foods for gut health: yogurt, kimchi, sauerkraut",
      "Include plenty of fresh vegetables and sprouted foods",
      "Consume healthy fats: avocado, olive oil, nuts",
      "Support estrogen metabolism with cruciferous vegetables",
      "Enjoy lighter, fresh meals that match your rising energy",
    ],
    whenToSeeDoctor: [
      "Unusually short follicular phase (very early ovulation)",
      "Persistent fatigue despite being in a high-energy phase",
      "Irregular or absent periods for 3+ months",
      "Unusual discharge with odor or irritation",
    ],
  },
  ovulatory: {
    name: "Ovulatory Phase",
    description:
      "Peak energy and confidence! Estrogen peaks and an egg is released. You may feel your most social and vibrant.",
    icon: Sparkles,
    color: "text-secondary-500",
    badgeColor: "bg-secondary-100 text-secondary-700",
    bodyChanges:
      "Luteinizing hormone (LH) surges, triggering the release of a mature egg from the ovary. Estrogen is at its peak, and testosterone briefly rises. You may notice increased cervical mucus (clear, stretchy), higher body temperature, and peak physical and mental performance.",
    commonSymptoms: [
      "Peak energy and stamina",
      "Increased libido",
      "Mild pelvic discomfort or twinges (mittelschmerz)",
      "Changes in cervical mucus",
      "Slight rise in basal body temperature",
      "Heightened senses",
      "Feeling more confident and social",
    ],
    selfCareTips: [
      "Take advantage of peak communication skills for important conversations",
      "Schedule social events and presentations",
      "Channel high energy into meaningful projects",
      "Practice mindfulness to stay grounded during peak energy",
      "Connect with your community and loved ones",
      "This is a great time for creative brainstorming",
    ],
    exerciseSuggestions: [
      "High-intensity workouts and HIIT",
      "Heavy strength training — you're at peak power",
      "Competitive sports or challenging group classes",
      "Sprint intervals and plyometrics",
      "Push for personal bests in endurance or strength",
    ],
    nutritionGuidance: [
      "Support liver detox with cruciferous vegetables and leafy greens",
      "Eat antioxidant-rich berries and colorful fruits",
      "Include fiber-rich whole grains to support estrogen metabolism",
      "Stay hydrated as body temperature rises slightly",
      "Lighter meals with raw vegetables work well now",
      "Include zinc-rich foods: pumpkin seeds, chickpeas, cashews",
    ],
    whenToSeeDoctor: [
      "Severe ovulation pain lasting more than a day",
      "Heavy mid-cycle bleeding (light spotting is normal)",
      "No signs of ovulation if trying to conceive",
      "Recurrent ovarian cyst symptoms: sharp pain, bloating",
    ],
  },
  luteal: {
    name: "Luteal Phase",
    description:
      "Progesterone rises as your body prepares. You may feel more inward-focused — a time for nesting and self-care.",
    icon: Moon,
    color: "text-indigo-500",
    badgeColor: "bg-indigo-100 text-indigo-700",
    bodyChanges:
      "Progesterone rises significantly after ovulation to prepare the uterine lining for potential implantation. If pregnancy doesn't occur, both progesterone and estrogen drop toward the end of this phase, triggering PMS symptoms. You may feel more introverted and notice increased appetite.",
    commonSymptoms: [
      "Premenstrual syndrome (PMS) symptoms",
      "Breast tenderness and swelling",
      "Bloating and water retention",
      "Mood swings, anxiety, or irritability",
      "Food cravings (especially carbs and sweets)",
      "Fatigue and lower energy",
      "Difficulty concentrating",
      "Acne breakouts",
      "Sleep disturbances",
    ],
    selfCareTips: [
      "Prioritize rest and wind-down routines",
      "Practice stress-management: meditation, deep breathing",
      "Create a cozy environment — this is your nesting phase",
      "Set boundaries and say no to overwhelming commitments",
      "Use a journal to process emotions",
      "Prepare for your upcoming period: stock supplies, plan lighter schedule",
    ],
    exerciseSuggestions: [
      "Moderate-intensity exercise: steady-state cardio, hiking",
      "Pilates and barre for strength without high impact",
      "Yoga focusing on hip openers and relaxation",
      "Reduce training intensity in the late luteal phase",
      "Walking in nature for mood support",
    ],
    nutritionGuidance: [
      "Increase complex carbohydrates to support serotonin production",
      "Eat magnesium-rich foods to ease PMS: dark chocolate, spinach, almonds",
      "Include calcium-rich foods: dairy, fortified plant milks",
      "Consume B6-rich foods: bananas, potatoes, poultry",
      "Reduce salt to minimize water retention",
      "Limit caffeine and alcohol, which can worsen PMS",
    ],
    whenToSeeDoctor: [
      "PMS symptoms severe enough to interfere with work or relationships (may be PMDD)",
      "Extreme mood changes: depression, anxiety, or suicidal thoughts",
      "Breast lumps or unusual changes beyond normal tenderness",
      "Severe bloating or pelvic pain",
      "Missed period with possibility of pregnancy",
    ],
  },
  unknown: {
    name: "Getting Started",
    description:
      "Log your first period to receive personalized cycle insights and phase-specific wellness guidance.",
    icon: Heart,
    color: "text-primary-500",
    badgeColor: "bg-primary-100 text-primary-700",
    bodyChanges:
      "Once you log your periods, we'll identify which phase you're in and provide tailored guidance about the hormonal changes happening in your body throughout your cycle.",
    commonSymptoms: [
      "Track your symptoms daily to discover your personal patterns",
      "Common symptoms shift throughout your cycle",
      "Understanding your patterns helps you plan ahead",
    ],
    selfCareTips: [
      "Start by logging your current or most recent period",
      "Track daily symptoms, mood, and energy levels",
      "Stay hydrated and aim for balanced nutrition",
      "Prioritize consistent sleep and regular movement",
      "Listen to your body's signals",
    ],
    exerciseSuggestions: [
      "Regular moderate exercise supports cycle health",
      "Aim for at least 150 minutes of activity per week",
      "Mix cardio, strength, and flexibility training",
      "Adjust intensity based on how you feel each day",
    ],
    nutritionGuidance: [
      "Eat a balanced diet rich in whole foods",
      "Include iron-rich foods throughout your cycle",
      "Stay well-hydrated with water and herbal teas",
      "Limit processed foods, excess sugar, and alcohol",
      "Consider a multivitamin with iron, magnesium, and B vitamins",
    ],
    whenToSeeDoctor: [
      "Periods that are very irregular or absent",
      "Extremely heavy or prolonged bleeding",
      "Severe pain that interferes with daily life",
      "Significant mood changes around your period",
      "Any symptoms that concern you — trust your instincts",
    ],
  },
};

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  accentColor: string;
}

function SectionCard({ icon: Icon, title, children, accentColor }: SectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-base">
          <div className={cn("rounded-lg bg-surface-alt p-2", accentColor)}>
            <Icon className="h-4 w-4" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function DailyCareView() {
  const { data: periods, isLoading } = usePeriods();

  if (isLoading) return <LoadingSkeleton />;

  const cycleInfo = getCurrentCycleInfo(periods ?? []);
  const phase = PHASE_CONTENT[cycleInfo.phase];
  const PhaseIcon = phase.icon;

  return (
    <div className="space-y-6 p-4 pb-24">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-xl bg-surface-alt p-2.5", phase.color)}>
            <PhaseIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{phase.name}</h1>
              {cycleInfo.cycleDay && (
                <Badge className={phase.badgeColor}>Day {cycleInfo.cycleDay}</Badge>
              )}
            </div>
            <p className="text-sm text-muted">{phase.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard icon={Heart} title="What's Happening" accentColor={phase.color}>
          <p className="text-sm leading-relaxed text-muted">{phase.bodyChanges}</p>
        </SectionCard>

        <SectionCard icon={Droplets} title="Common Symptoms" accentColor={phase.color}>
          <ul className="space-y-1.5">
            {phase.commonSymptoms.map((symptom) => (
              <li key={symptom} className="flex items-start gap-2 text-sm text-muted">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current", phase.color)} />
                {symptom}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={Sparkles} title="Self-Care Tips" accentColor={phase.color}>
          <ul className="space-y-1.5">
            {phase.selfCareTips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-muted">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current", phase.color)} />
                {tip}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={Dumbbell} title="Exercise Suggestions" accentColor={phase.color}>
          <ul className="space-y-1.5">
            {phase.exerciseSuggestions.map((exercise) => (
              <li key={exercise} className="flex items-start gap-2 text-sm text-muted">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current", phase.color)} />
                {exercise}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={Utensils} title="Nutrition Guidance" accentColor={phase.color}>
          <ul className="space-y-1.5">
            {phase.nutritionGuidance.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current", phase.color)} />
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={AlertTriangle} title="When to See a Doctor" accentColor={phase.color}>
          <ul className="space-y-1.5">
            {phase.whenToSeeDoctor.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
