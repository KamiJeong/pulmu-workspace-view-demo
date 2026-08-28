import { runInNewContext } from "node:vm";

import { describe, expect, it, vi } from "vitest";

import {
  createThemeBootstrapScript,
  createThemeRuntime,
  normalizeThemePreference,
  readStoredThemePreference,
  resolveThemePreference,
  THEME_MEDIA_QUERY,
  THEME_STORAGE_KEY,
  writeStoredThemePreference,
} from "../src/theme/themeRuntime";

function createStorage(initialValue: string | null = null) {
  let value = initialValue;

  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, nextValue: string) => {
      value = nextValue;
    }),
  };
}

function createMediaQuery(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  return {
    query: {
      addEventListener: vi.fn((_type: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      }),
      get matches() {
        return matches;
      },
      removeEventListener: vi.fn((_type: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      }),
    },
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      for (const listener of listeners) {
        listener({ matches } as MediaQueryListEvent);
      }
    },
  };
}

describe("theme preference primitives", () => {
  it("accepts the three public preferences and falls back invalid values to system", () => {
    expect(normalizeThemePreference("system")).toBe("system");
    expect(normalizeThemePreference("light")).toBe("light");
    expect(normalizeThemePreference("dark")).toBe("dark");
    expect(normalizeThemePreference("sepia")).toBe("system");
    expect(normalizeThemePreference(undefined)).toBe("system");
  });

  it("resolves system from the OS preference without changing manual choices", () => {
    expect(resolveThemePreference("system", false)).toBe("light");
    expect(resolveThemePreference("system", true)).toBe("dark");
    expect(resolveThemePreference("light", true)).toBe("light");
    expect(resolveThemePreference("dark", false)).toBe("dark");
  });

  it("uses the stable storage key and tolerates unavailable or invalid storage", () => {
    const storage = createStorage("dark");
    expect(readStoredThemePreference(storage)).toBe("dark");

    writeStoredThemePreference("light", storage);
    expect(storage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, "light");

    expect(readStoredThemePreference(createStorage("sepia"))).toBe("system");
    expect(readStoredThemePreference({ getItem: () => { throw new Error("blocked"); }, setItem: vi.fn() })).toBe("system");
    expect(() => writeStoredThemePreference("dark", {
      getItem: vi.fn(),
      setItem: () => { throw new Error("blocked"); },
    })).not.toThrow();
  });
});

describe("theme runtime controller", () => {
  it("follows live OS changes only while system is selected and preserves unrelated root state", () => {
    const root = {
      dataset: { motion: "reduced", theme: "stale" },
      lang: "ko",
      style: { colorScheme: "" },
    };
    const storage = createStorage("system");
    const media = createMediaQuery(false);
    const matchMedia = vi.fn(() => media.query);
    const runtime = createThemeRuntime({ matchMedia, root, storage });

    expect(matchMedia).toHaveBeenCalledWith(THEME_MEDIA_QUERY);
    expect(root.dataset).toEqual({ motion: "reduced", theme: "light" });
    expect(root.style.colorScheme).toBe("light");
    expect(root.lang).toBe("ko");

    runtime.setPreference("system");
    expect(media.query.addEventListener).toHaveBeenCalledTimes(1);

    media.setMatches(true);
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");

    runtime.setPreference("light", { persist: true });
    expect(storage.setItem).toHaveBeenLastCalledWith(THEME_STORAGE_KEY, "light");
    expect(media.query.removeEventListener).toHaveBeenCalledTimes(1);
    media.setMatches(false);
    media.setMatches(true);
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
    expect(root.dataset.motion).toBe("reduced");

    runtime.setPreference("system");
    expect(media.query.addEventListener).toHaveBeenCalledTimes(2);
    runtime.setPreference("system");
    expect(media.query.addEventListener).toHaveBeenCalledTimes(2);

    runtime.destroy();
    expect(media.query.removeEventListener).toHaveBeenCalledTimes(2);
    media.setMatches(false);
    expect(root.dataset.theme).toBe("dark");
  });

  it("normalizes an invalid requested preference to system", () => {
    const root = { dataset: {}, style: { colorScheme: "" } };
    const media = createMediaQuery(true);
    const runtime = createThemeRuntime({
      matchMedia: () => media.query,
      root,
      storage: null,
    });

    expect(runtime.setPreference("invalid")).toBe("dark");
    expect(runtime.getPreference()).toBe("system");
    expect(runtime.getResolvedTheme()).toBe("dark");
  });
});

describe("theme bootstrap", () => {
  it("sets both root theme contracts before application code runs", () => {
    const root = { dataset: { motion: "system" }, style: { colorScheme: "" } };
    const localStorage = createStorage("dark");

    runInNewContext(createThemeBootstrapScript(), {
      document: { documentElement: root },
      window: {
        localStorage,
        matchMedia: vi.fn(() => ({ matches: false })),
      },
    });

    expect(root.dataset).toEqual({ motion: "system", theme: "dark" });
    expect(root.style.colorScheme).toBe("dark");
  });

  it("falls back to the OS when storage is missing or invalid", () => {
    const root = { dataset: {}, style: { colorScheme: "" } };

    runInNewContext(createThemeBootstrapScript(), {
      document: { documentElement: root },
      window: {
        localStorage: createStorage("sepia"),
        matchMedia: vi.fn(() => ({ matches: true })),
      },
    });

    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
  });
});
