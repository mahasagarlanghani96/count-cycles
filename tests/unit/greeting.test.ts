import { describe, it, expect } from "vitest";

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(displayName: string | null | undefined): string {
  if (!displayName) return "";
  return displayName.split(" ")[0];
}

describe("getGreeting", () => {
  it("returns 'Good morning' before 12:00", () => {
    expect(getGreeting(0)).toBe("Good morning");
    expect(getGreeting(6)).toBe("Good morning");
    expect(getGreeting(11)).toBe("Good morning");
  });

  it("returns 'Good afternoon' between 12:00 and 17:00", () => {
    expect(getGreeting(12)).toBe("Good afternoon");
    expect(getGreeting(14)).toBe("Good afternoon");
    expect(getGreeting(16)).toBe("Good afternoon");
  });

  it("returns 'Good evening' after 17:00", () => {
    expect(getGreeting(17)).toBe("Good evening");
    expect(getGreeting(20)).toBe("Good evening");
    expect(getGreeting(23)).toBe("Good evening");
  });

  it("returns 'Good afternoon' at exactly 12:00", () => {
    expect(getGreeting(12)).toBe("Good afternoon");
  });

  it("returns 'Good evening' at exactly 17:00", () => {
    expect(getGreeting(17)).toBe("Good evening");
  });

  it("returns 'Good morning' at midnight (hour 0)", () => {
    expect(getGreeting(0)).toBe("Good morning");
  });
});

describe("getFirstName", () => {
  it("returns first name from full name", () => {
    expect(getFirstName("Jane Doe")).toBe("Jane");
  });

  it("returns the name when single word", () => {
    expect(getFirstName("Jane")).toBe("Jane");
  });

  it("returns empty string when display name is null", () => {
    expect(getFirstName(null)).toBe("");
  });

  it("returns empty string when display name is undefined", () => {
    expect(getFirstName(undefined)).toBe("");
  });

  it("returns empty string when display name is empty string", () => {
    expect(getFirstName("")).toBe("");
  });

  it("returns first word from multi-word name", () => {
    expect(getFirstName("Mary Jane Watson")).toBe("Mary");
  });
});
