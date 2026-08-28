import {
  applyThemePreference,
  isThemePreference,
  normalizeThemePreference,
  type ResolvedTheme,
  type ThemeRuntime,
  type ThemePreference,
} from "../src/theme/themeRuntime";

export type PreviewGlobals = {
  locale: "en" | "ko";
  motion: "reduced" | "system";
  theme: ThemePreference;
};

type PreviewRoot = {
  dataset: { motion?: string };
  lang: string;
};

export type ApplyPreviewGlobalsOptions = {
  persistTheme?: boolean;
  root?: PreviewRoot;
  themeRuntime?: Pick<ThemeRuntime, "setPreference">;
  themePreference?: unknown;
};

export type PreviewThemeContext = {
  globals: Record<string, unknown>;
  storyGlobals?: Record<string, unknown>;
  userGlobals?: Record<string, unknown>;
};

export type PreviewThemeSelection = {
  persist: boolean;
  preference: ThemePreference;
};

export type AppliedPreviewGlobals = PreviewGlobals & {
  resolvedTheme: ResolvedTheme;
};

export function normalizePreviewGlobals(globals?: Record<string, unknown>): PreviewGlobals {
  return {
    locale: globals?.locale === "en" ? "en" : "ko",
    motion: globals?.motion === "reduced" ? "reduced" : "system",
    theme: normalizeThemePreference(globals?.theme),
  };
}

export function selectPreviewTheme(context: PreviewThemeContext): PreviewThemeSelection {
  const storyTheme = context.storyGlobals?.theme;
  const hasStoryTheme = isThemePreference(storyTheme);

  return {
    persist: !hasStoryTheme,
    preference: hasStoryTheme
      ? storyTheme
      : normalizeThemePreference(context.userGlobals?.theme ?? context.globals.theme),
  };
}

export function applyPreviewGlobals(
  globals?: Record<string, unknown>,
  options: ApplyPreviewGlobalsOptions = {},
): AppliedPreviewGlobals {
  const normalized = normalizePreviewGlobals({
    ...globals,
    theme: options.themePreference ?? globals?.theme,
  });

  const root = options.root ?? document.documentElement;
  root.lang = normalized.locale;
  root.dataset.motion = normalized.motion;
  const resolvedTheme = options.themeRuntime
    ? options.themeRuntime.setPreference(normalized.theme, { persist: options.persistTheme })
    : applyThemePreference(normalized.theme, { persist: options.persistTheme });

  return { ...normalized, resolvedTheme };
}

export function applyPreviewThemeContext(
  context: PreviewThemeContext,
  options: Omit<ApplyPreviewGlobalsOptions, "persistTheme" | "themePreference"> = {},
): AppliedPreviewGlobals {
  const theme = selectPreviewTheme(context);

  return applyPreviewGlobals(context.globals, {
    ...options,
    persistTheme: theme.persist,
    themePreference: theme.preference,
  });
}
