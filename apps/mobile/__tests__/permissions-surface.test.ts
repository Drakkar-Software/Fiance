import { describe, it, expect } from "vitest";
import { surfaceFromSegments } from "@/lib/permissions/surface";

describe("surfaceFromSegments", () => {
  it("maps a tab route to its surface", () => {
    expect(surfaceFromSegments(["(tabs)", "guests", "[id]"])).toBe("guests");
    expect(surfaceFromSegments(["(tabs)", "vendors", "[type]", "[id]"])).toBe("vendors");
    expect(surfaceFromSegments(["(tabs)", "planning", "agenda-event"])).toBe("planning");
    expect(surfaceFromSegments(["(tabs)", "budget"])).toBe("budget");
  });

  it("maps the ideas stack (outside tabs) to ideas", () => {
    expect(surfaceFromSegments(["ideas", "[id]"])).toBe("ideas");
  });

  it("maps the gifts screen (under settings) to gifts", () => {
    expect(surfaceFromSegments(["settings", "gifts"])).toBe("gifts");
  });

  it("returns null outside any feature surface (never gated)", () => {
    expect(surfaceFromSegments(["settings", "roles"])).toBeNull();
    expect(surfaceFromSegments(["(tabs)", "home"])).toBeNull();
    expect(surfaceFromSegments(["onboarding"])).toBeNull();
    expect(surfaceFromSegments([])).toBeNull();
  });
});
