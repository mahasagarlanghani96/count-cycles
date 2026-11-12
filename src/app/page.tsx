import Link from "next/link";
import { ArrowRight, Shield, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <BrandLogo variant="full" size="sm" />
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-600">
              <Heart className="h-4 w-4" />
              Your menstrual health companion
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Understand your{" "}
              <span className="text-primary-500">cycle</span>,{" "}
              care for your{" "}
              <span className="text-secondary-400">body</span>
            </h1>
            <p className="text-lg text-muted max-w-lg mx-auto">
              Track your periods, log symptoms, get personalized daily wellness
              guidance, and discover patterns in your menstrual health.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="xl" className="w-full sm:w-auto">
                Start tracking free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface border border-border">
              <Calendar className="h-8 w-8 text-primary-400" />
              <h3 className="font-semibold">Cycle Tracking</h3>
              <p className="text-sm text-muted">
                Log periods, predict cycles, and understand your unique patterns.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface border border-border">
              <Heart className="h-8 w-8 text-secondary-400" />
              <h3 className="font-semibold">Daily Care</h3>
              <p className="text-sm text-muted">
                Personalized wellness tips, exercise, and nutrition for every phase.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface border border-border">
              <Shield className="h-8 w-8 text-sage-400" />
              <h3 className="font-semibold">Private & Secure</h3>
              <p className="text-sm text-muted">
                Your health data stays yours. Encrypted, private, and never shared.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-muted">
        <p>CycleCare provides educational information and is not a substitute for medical care.</p>
      </footer>
    </div>
  );
}
