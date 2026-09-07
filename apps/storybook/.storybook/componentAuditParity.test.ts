import { describe, expect, it } from "vitest";

import { compareThemeParity, type ThemeParityEvidence } from "../scripts/audit-parity.mjs";

const evidence = (overrides: Partial<ThemeParityEvidence> = {}): ThemeParityEvidence => ({
  accessibleSnapshot: '- button "Run audit" [disabled]',
  controlStates: ["button|Run audit|disabled=true|expanded=false"],
  visibleText: "Run audit Ready",
  ...overrides,
});

describe("component audit theme parity", () => {
  it("accepts equivalent themed content and control state", () => {
    expect(compareThemeParity(evidence(), evidence())).toEqual([]);
  });

  it("rejects missing content, substituted controls, and changed state", () => {
    const problems = compareThemeParity(evidence(), evidence({
      accessibleSnapshot: '- link "Run audit"',
      controlStates: ["link|Run audit|disabled=false|expanded=false"],
      visibleText: "Run audit",
    }));

    expect(problems).toEqual([
      "visibleText differs between Light and Dark",
      "accessibleSnapshot differs between Light and Dark",
      "controlStates differs between Light and Dark",
    ]);
  });

  it("allows only an exact documented presentation difference", () => {
    const light = evidence({ visibleText: "Light theme preview" });
    const dark = evidence({ visibleText: "Dark theme preview" });
    const allowance = [{
      dark: "Dark theme preview",
      field: "visibleText" as const,
      light: "Light theme preview",
      reason: "The narrow theme runtime story names its resolved preview theme.",
    }];

    expect(compareThemeParity(light, dark, allowance)).toEqual([]);
    expect(compareThemeParity(light, evidence({ visibleText: "Different dark copy" }), allowance)).toEqual([
      "visibleText differs between Light and Dark",
    ]);
  });
});
