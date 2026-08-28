import { describe, expect, it, vi } from "vitest";

import { createThemeRuntime, THEME_STORAGE_KEY } from "../src/theme/themeRuntime";
import { applyDocsGlobalsUpdate } from "./docsGlobals";
import {
  applyPreviewThemeContext,
  normalizePreviewGlobals,
  selectPreviewTheme,
} from "./previewGlobals";

function createThemeHarness(initialValue: string | null = null, prefersDark = false) {
  let value = initialValue;
  const root = {
    dataset: { motion: "system", theme: "stale" },
    lang: "ko",
    style: { colorScheme: "" },
  };
  const storage = {
    getItem: () => value,
    setItem: vi.fn((_key: string, nextValue: string) => {
      value = nextValue;
    }),
  };
  const runtime = createThemeRuntime({
    matchMedia: () => ({
      addEventListener: () => undefined,
      matches: prefersDark,
      removeEventListener: () => undefined,
    }),
    root,
    storage,
  });

  return {
    getStoredPreference: () => value,
    root,
    runtime,
    storage,
  };
}

describe("preview globals", () => {
  it("normalizes theme without changing locale and motion contracts", () => {
    expect(normalizePreviewGlobals({
      locale: "en",
      motion: "reduced",
      theme: "system",
    })).toEqual({
      locale: "en",
      motion: "reduced",
      theme: "system",
    });

    expect(normalizePreviewGlobals({
      locale: "invalid",
      motion: "invalid",
      theme: "invalid",
    })).toEqual({
      locale: "ko",
      motion: "system",
      theme: "system",
    });
  });

  it("persists a user toolbar preference", () => {
    expect(selectPreviewTheme({
      globals: { theme: "dark" },
      userGlobals: { theme: "dark" },
    })).toEqual({ persist: true, preference: "dark" });
  });

  it("uses a story-authored effective override without persisting it", () => {
    expect(selectPreviewTheme({
      globals: { theme: "light" },
      storyGlobals: { theme: "light" },
      userGlobals: { theme: "dark" },
    })).toEqual({ persist: false, preference: "light" });
  });

  it("applies Docs user updates with the same root and persistence contract as Canvas", () => {
    const docs = createThemeHarness();
    const canvas = createThemeHarness();
    const update = {
      globals: { locale: "en", motion: "reduced", theme: "dark" },
      storyGlobals: {},
      userGlobals: { theme: "dark" },
    };

    const appliedGlobals = applyDocsGlobalsUpdate(update, {}, {
      root: docs.root,
      themeRuntime: docs.runtime,
    });
    applyPreviewThemeContext(update, {
      root: canvas.root,
      themeRuntime: canvas.runtime,
    });

    expect(appliedGlobals).toEqual(update.globals);
    expect(docs.getStoredPreference()).toBe("dark");
    expect(docs.storage.setItem).toHaveBeenCalledTimes(1);
    expect(docs.storage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, "dark");
    expect(canvas.getStoredPreference()).toBe("dark");
    expect(docs.root).toEqual(canvas.root);
    expect(docs.root.lang).toBe("en");
    expect(docs.root.dataset).toEqual({ motion: "reduced", theme: "dark" });
    expect(docs.root.style.colorScheme).toBe("dark");
  });

  it("applies a Docs story override without replacing the stored user preference", () => {
    const docs = createThemeHarness("dark");
    const update = {
      globals: { locale: "ko", motion: "system", theme: "light" },
      storyGlobals: { theme: "light" },
      userGlobals: { theme: "dark" },
    };

    applyDocsGlobalsUpdate(update, {}, {
      root: docs.root,
      themeRuntime: docs.runtime,
    });

    expect(docs.getStoredPreference()).toBe("dark");
    expect(docs.storage.setItem).not.toHaveBeenCalled();
    expect(docs.root.lang).toBe("ko");
    expect(docs.root.dataset.motion).toBe("system");
    expect(docs.root.dataset.theme).toBe("light");
    expect(docs.root.style.colorScheme).toBe("light");
  });

  it("restores a stored manual preference despite the opposite OS preference", () => {
    const restored = createThemeHarness("dark", false);

    expect(restored.storage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(restored.runtime.getPreference()).toBe("dark");
    expect(restored.root.dataset.theme).toBe("dark");
    expect(restored.root.style.colorScheme).toBe("dark");
  });
});
