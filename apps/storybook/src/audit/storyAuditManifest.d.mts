export type StoryAuditStatus = "Ready" | "Needs improvement" | "Broken";

export type StoryAuditEntry = {
  readonly applicableStates: readonly string[];
  readonly category: string;
  readonly id: string;
  readonly name: string;
  readonly note: string;
  readonly parityAllowances?: Readonly<Partial<Record<"desktop" | "tablet" | "mobile" | "narrow", readonly {
    readonly dark: string;
    readonly field: "visibleText" | "accessibleSnapshot" | "controlStates";
    readonly light: string;
    readonly reason: string;
  }[]>>>;
  readonly source: string;
  readonly status: StoryAuditStatus;
  readonly title: string;
};

export const storyAuditManifest: readonly StoryAuditEntry[];

export const missingCapabilities: readonly {
  readonly category: string;
  readonly name: string;
  readonly note: string;
  readonly status: "Missing";
}[];
