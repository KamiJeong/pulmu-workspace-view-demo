export type PreviewGlobals = {
  locale: "en" | "ko";
  motion: "reduced" | "system";
  theme: "dark" | "light";
};

export function normalizePreviewGlobals(globals?: Record<string, unknown>): PreviewGlobals {
  return {
    locale: globals?.locale === "en" ? "en" : "ko",
    motion: globals?.motion === "reduced" ? "reduced" : "system",
    theme: globals?.theme === "light" ? "light" : "dark",
  };
}

export function applyPreviewGlobals(globals?: Record<string, unknown>): PreviewGlobals {
  const normalized = normalizePreviewGlobals(globals);

  document.documentElement.lang = normalized.locale;
  document.documentElement.dataset.motion = normalized.motion;
  document.documentElement.dataset.theme = normalized.theme;

  return normalized;
}

