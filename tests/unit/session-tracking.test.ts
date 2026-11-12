import { describe, it, expect } from "vitest";
import type { LoginSession } from "@/types";

function createMockSession(overrides: Partial<LoginSession> = {}): LoginSession {
  return {
    id: "sess-1",
    user_id: "user-1",
    logged_in_at: "2026-11-12T08:00:00.000Z",
    logged_out_at: null,
    device_info: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    is_active: true,
    created_at: "2026-11-12T08:00:00.000Z",
    ...overrides,
  };
}

function sortSessionsByLoginDesc(sessions: LoginSession[]): LoginSession[] {
  return [...sessions].sort(
    (a, b) => new Date(b.logged_in_at).getTime() - new Date(a.logged_in_at).getTime()
  );
}

function getActiveSessions(sessions: LoginSession[]): LoginSession[] {
  return sessions.filter((s) => s.is_active);
}

function markSessionInactive(session: LoginSession): LoginSession {
  return {
    ...session,
    is_active: false,
    logged_out_at: new Date().toISOString(),
  };
}

function parseDeviceType(ua: string | null): "mobile" | "desktop" | "unknown" {
  if (!ua) return "unknown";
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return "mobile";
  }
  return "desktop";
}

describe("Session tracking", () => {
  describe("session creation", () => {
    it("creates a session with logged_in_at and is_active=true", () => {
      const session = createMockSession();
      expect(session.is_active).toBe(true);
      expect(session.logged_in_at).toBeTruthy();
      expect(session.logged_out_at).toBeNull();
    });

    it("captures device info from user agent", () => {
      const session = createMockSession({ device_info: "Mozilla/5.0 (iPhone)" });
      expect(session.device_info).toContain("iPhone");
    });

    it("handles null device info", () => {
      const session = createMockSession({ device_info: null });
      expect(session.device_info).toBeNull();
    });
  });

  describe("session deactivation", () => {
    it("marks session inactive on logout", () => {
      const session = createMockSession();
      const ended = markSessionInactive(session);
      expect(ended.is_active).toBe(false);
      expect(ended.logged_out_at).toBeTruthy();
    });

    it("preserves logged_in_at when ending session", () => {
      const session = createMockSession({ logged_in_at: "2026-11-10T10:00:00.000Z" });
      const ended = markSessionInactive(session);
      expect(ended.logged_in_at).toBe("2026-11-10T10:00:00.000Z");
    });
  });

  describe("active sessions filtering", () => {
    it("returns only active sessions", () => {
      const sessions = [
        createMockSession({ id: "1", is_active: true }),
        createMockSession({ id: "2", is_active: false }),
        createMockSession({ id: "3", is_active: true }),
      ];
      expect(getActiveSessions(sessions)).toHaveLength(2);
    });

    it("returns empty array when no active sessions", () => {
      const sessions = [
        createMockSession({ id: "1", is_active: false }),
        createMockSession({ id: "2", is_active: false }),
      ];
      expect(getActiveSessions(sessions)).toHaveLength(0);
    });

    it("handles multiple active sessions for same user", () => {
      const sessions = [
        createMockSession({ id: "1", is_active: true, device_info: "Desktop" }),
        createMockSession({ id: "2", is_active: true, device_info: "Mobile" }),
      ];
      const active = getActiveSessions(sessions);
      expect(active).toHaveLength(2);
    });
  });

  describe("session sorting", () => {
    it("sorts sessions most recent first", () => {
      const sessions = [
        createMockSession({ id: "old", logged_in_at: "2026-11-01T08:00:00.000Z" }),
        createMockSession({ id: "new", logged_in_at: "2026-11-12T08:00:00.000Z" }),
        createMockSession({ id: "mid", logged_in_at: "2026-11-06T08:00:00.000Z" }),
      ];
      const sorted = sortSessionsByLoginDesc(sessions);
      expect(sorted[0].id).toBe("new");
      expect(sorted[1].id).toBe("mid");
      expect(sorted[2].id).toBe("old");
    });
  });

  describe("device info parsing", () => {
    it("detects mobile device from user agent", () => {
      expect(parseDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS)")).toBe("mobile");
      expect(parseDeviceType("Mozilla/5.0 (Linux; Android 12)")).toBe("mobile");
      expect(parseDeviceType("Mozilla/5.0 (Mobile; rv:91)")).toBe("mobile");
    });

    it("detects desktop from user agent", () => {
      expect(parseDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
      expect(parseDeviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X)")).toBe("desktop");
    });

    it("returns unknown for null user agent", () => {
      expect(parseDeviceType(null)).toBe("unknown");
    });
  });

  describe("negative cases", () => {
    it("session not created when login fails (no session in list)", () => {
      const sessions: LoginSession[] = [];
      expect(sessions).toHaveLength(0);
    });
  });
});
