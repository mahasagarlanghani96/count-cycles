"use client";

import { useState } from "react";
import {
  BookOpen,
  Heart,
  Droplets,
  AlertTriangle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Article {
  id: string;
  title: string;
  icon: React.ElementType;
  badge: string;
  badgeVariant: "default" | "secondary" | "accent" | "sage" | "destructive";
  content: string[];
  sources?: string[];
}

const articles: Article[] = [
  {
    id: "menstrual-basics",
    title: "Understanding Your Menstrual Cycle",
    icon: Droplets,
    badge: "Basics",
    badgeVariant: "default",
    content: [
      "The menstrual cycle is the monthly process your body goes through to prepare for a possible pregnancy. A typical cycle lasts between 21 and 35 days, though it can vary from person to person.",
      "The cycle has four main phases: menstrual (days 1–5 approximately), follicular (days 1–13), ovulatory (around day 14), and luteal (days 15–28). These phases are driven by hormonal changes.",
      "Day 1 of your cycle is the first day of your period. Tracking the start date of each period helps you understand your personal cycle length and patterns.",
      "Cycle lengths can vary month to month, especially during adolescence, perimenopause, or due to stress, travel, illness, or changes in weight or exercise habits.",
      "Not everyone has a 28-day cycle, and that is completely normal. What matters most is understanding your own pattern.",
    ],
    sources: [
      "American College of Obstetricians and Gynecologists (ACOG)",
      "World Health Organization (WHO) — Reproductive Health",
    ],
  },
  {
    id: "menstrual-hygiene",
    title: "Menstrual Hygiene & Product Guide",
    icon: Heart,
    badge: "Hygiene",
    badgeVariant: "secondary",
    content: [
      "Good menstrual hygiene is important for comfort and health. Change pads every 4–6 hours, tampons every 4–8 hours, and empty menstrual cups every 8–12 hours.",
      "Wash your hands before and after changing menstrual products. Clean the vulvar area with plain water or a gentle, unscented cleanser. Avoid douching.",
      "Available menstrual products include disposable pads, cloth pads, tampons, menstrual cups, menstrual discs, and period underwear. Each has advantages depending on your preferences, activities, and flow.",
      "If using tampons, choose the lowest absorbency needed for your flow. Using higher absorbency than necessary can increase the risk of Toxic Shock Syndrome (TSS), a rare but serious condition.",
      "Signs of TSS include sudden high fever, vomiting, diarrhea, muscle aches, and a sunburn-like rash. If you experience these symptoms while using a tampon, remove it immediately and seek emergency medical care.",
      "Store menstrual products in a clean, dry place. Check expiration dates on tampons and menstrual cups.",
    ],
    sources: [
      "Centers for Disease Control and Prevention (CDC)",
      "ACOG — Menstrual Hygiene",
    ],
  },
  {
    id: "common-symptoms",
    title: "Common Menstrual Symptoms",
    icon: Stethoscope,
    badge: "Symptoms",
    badgeVariant: "accent",
    content: [
      "Many people experience symptoms before and during their period. Common symptoms include cramps, bloating, headaches, fatigue, breast tenderness, mood changes, and changes in appetite or sleep.",
      "Mild to moderate cramps are common and can often be managed with heat (a warm water bottle or heating pad), gentle exercise, over-the-counter pain relief like ibuprofen, and adequate rest.",
      "Premenstrual Syndrome (PMS) refers to a group of symptoms that can occur 1–2 weeks before your period. These may include mood swings, irritability, anxiety, bloating, and food cravings.",
      "Tracking your symptoms over several cycles can help you identify patterns and prepare for recurring symptoms. This information is also valuable when consulting a healthcare provider.",
      "Some symptom management strategies include regular exercise, balanced nutrition, staying hydrated, reducing caffeine and salt intake, and ensuring adequate sleep.",
    ],
    sources: [
      "National Institutes of Health (NIH)",
      "Mayo Clinic — Menstrual Cycle",
    ],
  },
  {
    id: "irregular-periods",
    title: "Irregular Periods & When to Seek Help",
    icon: AlertTriangle,
    badge: "Important",
    badgeVariant: "destructive",
    content: [
      "Irregular periods are common, especially during the first few years of menstruation and during perimenopause. Occasional irregularity due to stress, illness, or travel is generally not concerning.",
      "However, you should consult a healthcare provider if: your periods stop for more than 3 months (and you are not pregnant), your cycle is consistently shorter than 21 days or longer than 35 days, you experience very heavy bleeding (soaking through a pad or tampon every hour for several hours), or your periods become significantly more painful than usual.",
      "Other reasons to seek medical attention include bleeding between periods, bleeding after sexual intercourse, or any sudden changes in your menstrual pattern.",
      "Conditions that can affect menstrual regularity include Polycystic Ovary Syndrome (PCOS), thyroid disorders, uterine fibroids, endometriosis, and significant changes in weight or exercise level.",
      "Hormonal contraceptives can also change your menstrual pattern. If you are using hormonal contraception, discuss expected changes with your prescribing provider.",
      "Keep a record of your periods, symptoms, and any concerns to share with your healthcare provider. The information you track in this app can be useful for these conversations.",
    ],
    sources: [
      "ACOG — Abnormal Uterine Bleeding",
      "NHS — Irregular Periods",
    ],
  },
  {
    id: "nutrition-exercise",
    title: "Nutrition & Exercise Through Your Cycle",
    icon: BookOpen,
    badge: "Wellness",
    badgeVariant: "sage",
    content: [
      "Your nutritional needs and energy levels can change throughout your menstrual cycle. Listening to your body and adjusting accordingly can support your overall well-being.",
      "During your period, iron-rich foods (leafy greens, legumes, fortified cereals) can help replace iron lost through menstrual bleeding. Staying hydrated and eating anti-inflammatory foods may help reduce cramps.",
      "In the follicular phase (after your period), rising estrogen levels often bring increased energy. This can be a good time for more intense exercise and trying new activities.",
      "Around ovulation, many people feel their most energetic. High-intensity workouts and social activities may feel especially enjoyable during this time.",
      "During the luteal phase (before your period), progesterone rises and you may feel more tired. Gentler exercise like yoga, swimming, or walking can be beneficial. Complex carbohydrates and magnesium-rich foods may help with PMS symptoms.",
      "Regular exercise of any kind — even walking — can help reduce menstrual cramps, improve mood, and support overall menstrual health. The best exercise is one you enjoy and can maintain consistently.",
    ],
    sources: [
      "American Council on Exercise (ACE)",
      "British Journal of Sports Medicine",
    ],
  },
];

function ArticleCard({ article }: { article: Article }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = article.icon;

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-50 p-2.5 mt-0.5">
              <Icon className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <Badge variant={article.badgeVariant} className="mb-2">
                {article.badge}
              </Badge>
              <CardTitle className="text-base">{article.title}</CardTitle>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted shrink-0" />
          )}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          {article.content.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
          {article.sources && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted mb-1">
                Referenced sources:
              </p>
              {article.sources.map((source, i) => (
                <p key={i} className="text-xs text-muted flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {source}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function EducationView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Learn</h1>
        <p className="text-sm text-muted mt-1">
          Educational resources about menstrual health
        </p>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Medical Disclaimer
              </p>
              <p className="text-sm text-amber-700 mt-1">
                CycleCare provides general educational information about
                menstrual health. It is not a medical device and does not provide
                medical advice, diagnosis, or treatment. Always consult a
                qualified healthcare provider for medical concerns. Do not rely
                on this app for contraception or medical decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
