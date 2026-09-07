export type ThemeParityEvidence = {
  readonly accessibleSnapshot: string;
  readonly controlStates: readonly string[];
  readonly visibleText: string;
};

export type ThemeParityAllowance = {
  readonly dark: string;
  readonly field: keyof ThemeParityEvidence;
  readonly light: string;
  readonly reason: string;
};

export function compareThemeParity(
  light: ThemeParityEvidence,
  dark: ThemeParityEvidence,
  allowances?: readonly ThemeParityAllowance[],
): string[];
