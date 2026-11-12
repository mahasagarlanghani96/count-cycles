import type { CyclePhase } from "@/types";

export interface PhaseGuidance {
  name: string;
  description: string;
  bodyChanges: string[];
  commonSymptoms: string[];
  selfCare: string[];
  exercise: string[];
  nutrition: string[];
  hydration: string;
  rest: string;
  seekCare: string[];
}

export const PHASE_GUIDANCE: Record<CyclePhase, PhaseGuidance> = {
  menstrual: {
    name: "Menstrual Phase",
    description:
      "Your period has started. The uterine lining is shedding, which causes menstrual bleeding. Hormone levels (estrogen and progesterone) are at their lowest.",
    bodyChanges: [
      "Uterine lining shedding causes bleeding",
      "Hormone levels are at their lowest point",
      "Body temperature may drop slightly",
      "Cervix is slightly open",
    ],
    commonSymptoms: [
      "Cramps and lower abdominal discomfort",
      "Lower back pain",
      "Fatigue and low energy",
      "Headaches",
      "Bloating",
      "Mood changes",
    ],
    selfCare: [
      "Use a heating pad or warm water bottle for cramps",
      "Take warm baths to ease muscle tension",
      "Wear comfortable clothing",
      "Give yourself permission to rest",
      "Practice gentle stretching",
      "Change menstrual products regularly",
    ],
    exercise: [
      "Gentle yoga or stretching",
      "Light walking",
      "Swimming (with appropriate menstrual product)",
      "Tai chi or qigong",
      "Reduce intensity if you feel fatigued",
    ],
    nutrition: [
      "Iron-rich foods: leafy greens, legumes, fortified cereals",
      "Anti-inflammatory foods: berries, fatty fish, ginger, turmeric",
      "Magnesium-rich foods: dark chocolate, nuts, bananas",
      "Warm soups and herbal teas for comfort",
      "Avoid excess caffeine and salty foods",
    ],
    hydration: "Drink plenty of water. Warm herbal teas like ginger or chamomile may help ease cramps.",
    rest: "Prioritize sleep. Your body is doing significant work. Aim for 7-9 hours and allow extra rest if needed.",
    seekCare: [
      "Soaking through a pad or tampon every hour for several consecutive hours",
      "Periods lasting longer than 7 days",
      "Severe pain not relieved by over-the-counter medication",
      "Clots larger than a quarter (2.5 cm)",
      "Feeling faint, dizzy, or short of breath",
      "Fever while using tampons (possible sign of TSS)",
    ],
  },
  follicular: {
    name: "Follicular Phase",
    description:
      "Estrogen levels are rising as your body prepares for potential ovulation. Energy levels typically increase during this phase. Follicles in the ovaries are developing.",
    bodyChanges: [
      "Estrogen levels rising steadily",
      "Follicles developing in the ovaries",
      "Uterine lining beginning to thicken",
      "Energy and mood typically improving",
      "Skin may appear clearer",
    ],
    commonSymptoms: [
      "Increasing energy",
      "Improved mood",
      "Better concentration",
      "Lighter or no bleeding",
      "Increased appetite may normalize",
    ],
    selfCare: [
      "Take advantage of rising energy levels",
      "Start new projects or routines",
      "Socialize and connect with others",
      "Practice mindfulness for continued mood support",
      "Plan ahead for the rest of your cycle",
    ],
    exercise: [
      "Higher-intensity workouts feel more accessible",
      "Strength training and resistance exercises",
      "Cardio: running, cycling, dance",
      "Try new activities or classes",
      "Your body may recover faster during this phase",
    ],
    nutrition: [
      "Protein-rich foods for muscle recovery",
      "Complex carbohydrates for sustained energy",
      "Fresh fruits and vegetables",
      "Fermented foods for gut health",
      "B vitamins: whole grains, eggs, leafy greens",
    ],
    hydration: "Stay well hydrated, especially if increasing exercise intensity. Water, coconut water, and green smoothies are great choices.",
    rest: "You may need less sleep than during menstruation, but maintain consistent sleep habits. This is often a phase of natural energy.",
    seekCare: [
      "Spotting that continues unexpectedly",
      "Persistent pelvic pain outside of your period",
      "Unusual discharge",
    ],
  },
  ovulatory: {
    name: "Ovulatory Phase",
    description:
      "An egg is released from the ovary. Estrogen peaks and luteinizing hormone surges. This is typically the highest-energy point of the cycle. This phase is usually brief (1-3 days).",
    bodyChanges: [
      "An egg is released from the ovary",
      "Estrogen reaches its peak level",
      "Luteinizing hormone surges",
      "Cervical mucus changes (clear, stretchy)",
      "Body temperature may rise slightly",
      "Some may feel a brief twinge (mittelschmerz)",
    ],
    commonSymptoms: [
      "Peak energy and alertness",
      "Increased confidence",
      "Mild one-sided pelvic discomfort",
      "Changes in cervical mucus",
      "Slight breast tenderness in some",
    ],
    selfCare: [
      "Enjoy your energy peak",
      "This may be a great time for social activities",
      "Stay mindful of your body's signals",
      "Practice sun protection if spending time outdoors",
    ],
    exercise: [
      "Peak performance potential",
      "High-intensity interval training (HIIT)",
      "Heavy lifting sessions",
      "Competitive sports",
      "Challenge yourself with personal bests",
      "Be attentive to joint stability (ligaments may be more lax)",
    ],
    nutrition: [
      "Antioxidant-rich foods: colorful fruits and vegetables",
      "Fiber-rich foods for hormone balance",
      "Light, fresh meals match higher energy",
      "Zinc-rich foods: seeds, nuts, whole grains",
      "Cruciferous vegetables: broccoli, cauliflower, kale",
    ],
    hydration: "Continue drinking plenty of water. Your body temperature may be slightly elevated.",
    rest: "Maintain regular sleep even though energy is high. Overextending now can affect the luteal phase.",
    seekCare: [
      "Severe mid-cycle pain lasting more than a day",
      "Heavy mid-cycle bleeding (not just spotting)",
    ],
  },
  luteal: {
    name: "Luteal Phase",
    description:
      "Progesterone rises as your body prepares for a possible pregnancy. If the egg is not fertilized, hormone levels will drop, leading to your period. PMS symptoms are most common during this phase.",
    bodyChanges: [
      "Progesterone levels rising",
      "Body temperature slightly elevated",
      "Uterine lining fully thickened",
      "Energy levels may gradually decrease",
      "If no pregnancy, hormones will drop to trigger menstruation",
    ],
    commonSymptoms: [
      "Premenstrual symptoms (PMS)",
      "Breast tenderness or swelling",
      "Bloating and water retention",
      "Food cravings (especially carbs and sweets)",
      "Mood changes: irritability, anxiety, sadness",
      "Fatigue, especially in late luteal phase",
      "Headaches",
      "Acne breakouts",
      "Sleep disturbances",
    ],
    selfCare: [
      "Be patient and gentle with yourself",
      "Manage stress with relaxation techniques",
      "Keep a regular daily routine",
      "Journaling or creative expression",
      "Warm baths or gentle massage",
      "Prepare comfort items for your upcoming period",
    ],
    exercise: [
      "Moderate exercise: walking, swimming, cycling",
      "Yoga, especially restorative or yin",
      "Pilates for core without overexertion",
      "Reduce intensity in late luteal phase if needed",
      "Exercise can help reduce PMS symptoms",
    ],
    nutrition: [
      "Complex carbohydrates: oats, sweet potatoes, brown rice",
      "Magnesium-rich foods: dark chocolate, almonds, spinach",
      "Calcium-rich foods: yogurt, leafy greens",
      "Omega-3 fatty acids: salmon, walnuts, flaxseed",
      "Reduce salt intake to help with bloating",
      "Limit caffeine and alcohol",
    ],
    hydration: "Drink extra water to counteract bloating. Reduce caffeine if it worsens anxiety or sleep issues.",
    rest: "You may need more sleep. Listen to your body. Going to bed earlier and avoiding screens before sleep can help.",
    seekCare: [
      "PMS symptoms severe enough to interfere with daily life (may indicate PMDD)",
      "Significant mood changes causing distress",
      "Breast lumps or persistent pain",
      "Symptoms that worsen progressively each cycle",
    ],
  },
  unknown: {
    name: "Your Cycle",
    description:
      "We don't have enough data to estimate your current cycle phase. Log your periods to get personalized guidance. If you use certain hormonal contraceptives, traditional phase estimates may not apply.",
    bodyChanges: [
      "Continue tracking your periods to build your cycle history",
      "Every body is unique — your patterns will emerge over time",
    ],
    commonSymptoms: [
      "Track any symptoms you notice to identify your personal patterns",
    ],
    selfCare: [
      "Listen to your body's signals",
      "Maintain consistent self-care routines",
      "Log your periods and symptoms regularly",
      "Stay hydrated and get adequate sleep",
    ],
    exercise: [
      "Regular moderate exercise benefits menstrual health",
      "Find activities you enjoy and can maintain consistently",
      "Walking is always a great option",
    ],
    nutrition: [
      "Eat a balanced diet with plenty of fruits and vegetables",
      "Include iron-rich foods regularly",
      "Stay hydrated throughout the day",
    ],
    hydration: "Aim for 6-8 glasses of water daily.",
    rest: "Aim for 7-9 hours of quality sleep each night.",
    seekCare: [
      "Periods that stop for more than 3 months (if not pregnant)",
      "Cycle consistently shorter than 21 days or longer than 35 days",
      "Sudden significant changes in your menstrual pattern",
      "Very heavy bleeding or severe pain",
    ],
  },
};
