import {
  applyPreviewThemeContext,
  type ApplyPreviewGlobalsOptions,
  type PreviewThemeContext,
} from "./previewGlobals";

export type GlobalsUpdatedPayload = {
  globals?: Record<string, unknown>;
  storyGlobals?: Record<string, unknown>;
  userGlobals?: Record<string, unknown>;
};

export function createDocsPreviewContext(
  update: GlobalsUpdatedPayload,
  fallbackGlobals: Record<string, unknown>,
): PreviewThemeContext {
  return {
    globals: update.globals ?? fallbackGlobals,
    storyGlobals: update.storyGlobals,
    userGlobals: update.userGlobals,
  };
}

export function applyDocsGlobalsUpdate(
  update: GlobalsUpdatedPayload,
  fallbackGlobals: Record<string, unknown>,
  options: Omit<ApplyPreviewGlobalsOptions, "persistTheme" | "themePreference"> = {},
): Record<string, unknown> {
  const previewContext = createDocsPreviewContext(update, fallbackGlobals);

  applyPreviewThemeContext(previewContext, options);
  return previewContext.globals;
}
