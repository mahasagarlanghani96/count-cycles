export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type FlowIntensity = "spotting" | "light" | "medium" | "heavy";
export type MoodType =
  | "happy"
  | "calm"
  | "energetic"
  | "anxious"
  | "sad"
  | "irritable"
  | "stressed"
  | "neutral";
export type SymptomSeverity = "mild" | "moderate" | "severe";
export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulatory"
  | "luteal"
  | "unknown";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  date_of_birth: string | null;
  cycle_length_estimate: number | null;
  period_length_estimate: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  notifications_enabled: boolean;
  period_reminder_days_before: number;
  daily_tracking_reminder: boolean;
  reminder_time: string;
  show_ovulation_estimate: boolean;
  use_contraception: boolean;
  contraception_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface PeriodRecord {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  is_predicted: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  flow_intensity: FlowIntensity | null;
  mood: MoodType | null;
  energy_level: number | null;
  sleep_quality: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SymptomLog {
  id: string;
  user_id: string;
  log_date: string;
  symptom_name: string;
  severity: SymptomSeverity;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_type: "period" | "tracking" | "care" | "custom";
  scheduled_date: string | null;
  scheduled_time: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginSession {
  id: string;
  user_id: string;
  logged_in_at: string;
  logged_out_at: string | null;
  device_info: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<UserPreferences, "id" | "created_at" | "updated_at">
        >;
      };
      period_records: {
        Row: PeriodRecord;
        Insert: Omit<PeriodRecord, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<PeriodRecord, "id" | "created_at" | "updated_at">
        >;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Omit<DailyLog, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DailyLog, "id" | "created_at" | "updated_at">>;
      };
      symptom_logs: {
        Row: SymptomLog;
        Insert: Omit<SymptomLog, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<SymptomLog, "id" | "created_at" | "updated_at">
        >;
      };
      reminders: {
        Row: Reminder;
        Insert: Omit<Reminder, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Reminder, "id" | "created_at" | "updated_at">>;
      };
      login_sessions: {
        Row: LoginSession;
        Insert: Omit<LoginSession, "id" | "created_at">;
        Update: Partial<Omit<LoginSession, "id" | "created_at">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
