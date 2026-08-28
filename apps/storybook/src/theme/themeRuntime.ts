export const THEME_STORAGE_KEY = "pulmu.theme.preference.v1";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

type ThemeRoot = {
  dataset: { theme?: string };
  style: { colorScheme: string };
};

type ThemeStorage = Pick<Storage, "getItem" | "setItem">;

type ThemeMediaQueryList = Pick<
  MediaQueryList,
  "addEventListener" | "matches" | "removeEventListener"
>;

export type ThemeRuntimeEnvironment = {
  matchMedia?: (query: string) => ThemeMediaQueryList;
  root?: ThemeRoot;
  storage?: ThemeStorage | null;
};

export type SetThemePreferenceOptions = {
  persist?: boolean;
};

export type ThemeRuntime = {
  destroy: () => void;
  getPreference: () => ThemePreference;
  getResolvedTheme: () => ResolvedTheme;
  setPreference: (
    preference: unknown,
    options?: SetThemePreferenceOptions,
  ) => ResolvedTheme;
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function normalizeThemePreference(value: unknown): ThemePreference {
  return isThemePreference(value) ? value : "system";
}

export function resolveThemePreference(
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  return preference === "system" ? (prefersDark ? "dark" : "light") : preference;
}

export function readStoredThemePreference(
  storage: ThemeStorage | null | undefined = getBrowserStorage(),
): ThemePreference {
  if (!storage) return "system";

  try {
    return normalizeThemePreference(storage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function writeStoredThemePreference(
  preference: ThemePreference,
  storage: ThemeStorage | null | undefined = getBrowserStorage(),
): void {
  if (!storage) return;

  try {
    storage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable in private or sandboxed preview contexts.
  }
}

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getBrowserRoot(): ThemeRoot | undefined {
  return typeof document === "undefined" ? undefined : document.documentElement;
}

function getBrowserMatchMedia(): ThemeRuntimeEnvironment["matchMedia"] {
  return typeof window === "undefined" || typeof window.matchMedia !== "function"
    ? undefined
    : window.matchMedia.bind(window);
}

export function createThemeRuntime(
  environment: ThemeRuntimeEnvironment = {},
): ThemeRuntime {
  const root = environment.root ?? getBrowserRoot();
  const storage = environment.storage === undefined ? getBrowserStorage() : environment.storage;
  const matchMedia = environment.matchMedia ?? getBrowserMatchMedia();
  let preference = readStoredThemePreference(storage);
  let resolvedTheme: ResolvedTheme = "light";
  let systemQuery: ThemeMediaQueryList | undefined;

  const applyResolvedTheme = (theme: ResolvedTheme) => {
    resolvedTheme = theme;
    if (!root) return;

    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  };

  const handleSystemThemeChange = (event: MediaQueryListEvent) => {
    if (preference === "system") {
      applyResolvedTheme(resolveThemePreference("system", event.matches));
    }
  };

  const stopFollowingSystemTheme = () => {
    systemQuery?.removeEventListener("change", handleSystemThemeChange);
    systemQuery = undefined;
  };

  const setPreference: ThemeRuntime["setPreference"] = (value, options = {}) => {
    const nextPreference = normalizeThemePreference(value);

    if (nextPreference !== preference) {
      stopFollowingSystemTheme();
      preference = nextPreference;
    }

    if (options.persist) {
      writeStoredThemePreference(preference, storage);
    }

    if (preference === "system") {
      if (!systemQuery && matchMedia) {
        systemQuery = matchMedia(THEME_MEDIA_QUERY);
        systemQuery.addEventListener("change", handleSystemThemeChange);
      }

      applyResolvedTheme(resolveThemePreference("system", systemQuery?.matches ?? false));
    } else {
      applyResolvedTheme(preference);
    }

    return resolvedTheme;
  };

  setPreference(preference);

  return {
    destroy: stopFollowingSystemTheme,
    getPreference: () => preference,
    getResolvedTheme: () => resolvedTheme,
    setPreference,
  };
}

let browserThemeRuntime: ThemeRuntime | undefined;

export function getThemeRuntime(): ThemeRuntime {
  browserThemeRuntime ??= createThemeRuntime();
  return browserThemeRuntime;
}

export function applyThemePreference(
  preference: unknown,
  options?: SetThemePreferenceOptions,
): ResolvedTheme {
  return getThemeRuntime().setPreference(preference, options);
}

/**
 * Generates a dependency-free script for Storybook's preview head. It deliberately
 * mirrors the small synchronous part of this module so the root theme exists before
 * preview CSS and visible content are evaluated.
 */
export function createThemeBootstrapScript(): string {
  const storageKey = JSON.stringify(THEME_STORAGE_KEY);
  const mediaQuery = JSON.stringify(THEME_MEDIA_QUERY);

  return `(function(){var preference="system";try{var stored=window.localStorage.getItem(${storageKey});if(stored==="system"||stored==="light"||stored==="dark")preference=stored;}catch(e){}var theme=preference;if(theme==="system")theme=window.matchMedia&&window.matchMedia(${mediaQuery}).matches?"dark":"light";var root=document.documentElement;root.dataset.theme=theme;root.style.colorScheme=theme;})();`;
}
