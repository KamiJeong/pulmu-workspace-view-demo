import { describe, expect, it } from "vitest";

import { createBarGeometry, createDonutGeometry, createLineGeometry } from "./chart-geometry";
import { formatDate, formatDuration, formatNumber, formatPercentage } from "./formatters";

describe("data formatters", () => {
  it("distinguishes zero, missing, unknown, invalid, and large numbers", () => {
    expect(formatNumber(0, { locale: "en-US" })).toEqual({ accessible: "0", display: "0", state: "valid" });
    expect(formatNumber(null)).toEqual({ accessible: "Not available", display: "—", state: "missing" });
    expect(formatNumber(undefined)).toEqual({ accessible: "Unknown", display: "Unknown", state: "unknown" });
    expect(formatNumber(Number.NaN)).toEqual({ accessible: "Unknown", display: "Unknown", state: "unknown" });
    expect(formatNumber(12_345_678, { compact: true, locale: "en-US" })).toEqual({ accessible: "12,345,678", display: "12.35M", state: "valid" });
    expect(formatNumber(1.2345, { locale: "en-US", maximumFractionDigits: 2 })).toEqual({ accessible: "1.2345", display: "1.23", state: "valid" });
  });

  it("documents ratio input and preserves exact accessible duration/date values", () => {
    expect(formatPercentage(0.425, { locale: "en-US" }).display).toBe("42.5%");
    expect(formatDuration(3_661_250, { locale: "en-US" })).toEqual({ accessible: "3,661,250 milliseconds", display: "1h 1m", state: "valid" });
    expect(formatDuration(0).display).toBe("0ms");
    expect(formatDate("2026-09-03T12:30:00Z", { locale: "en-US", timeZone: "UTC" })).toEqual({
      accessible: "Thursday, September 3, 2026",
      display: "Sep 3, 2026",
      state: "valid",
    });
    expect(formatDate("not-a-date").state).toBe("unknown");
  });
});

describe("chart geometry normalization", () => {
  const datum = (id: string, value: number | null) => ({ id, label: id.toUpperCase(), value });

  it("normalizes invalid donut values and returns no geometry for all-zero data", () => {
    expect(createDonutGeometry([datum("negative", -2), datum("missing", null), datum("zero", 0)])).toEqual([]);
    const geometry = createDonutGeometry([datum("negative", -2), datum("valid", 4)]);
    expect(geometry).toHaveLength(1);
    expect(geometry[0].safeValue).toBe(4);
    expect(geometry[0].seriesIndex).toBe(1);
    expect(geometry[0].path).not.toBe("");
  });

  it("keeps negative bars in the domain and omits null bars", () => {
    const geometry = createBarGeometry([datum("loss", -4), datum("missing", null), datum("gain", 8)]);
    expect(geometry.bars.map(({ id }) => id)).toEqual(["loss", "gain"]);
    expect(geometry.bars.every(({ height }) => height > 0)).toBe(true);
    expect(geometry.baseline).toBeGreaterThan(geometry.bars[1].y);
  });

  it("creates line gaps for null points while retaining negative values", () => {
    const geometry = createLineGeometry([{ id: "series", label: "Series", points: [datum("a", -2), datum("gap", null), datum("c", 3)] }]);
    expect(geometry.series[0].points).toHaveLength(2);
    expect(geometry.series[0].path.match(/M/g)).toHaveLength(2);
  });

  it("keeps zero in the y-domain when every line value is negative", () => {
    const geometry = createLineGeometry([{ id: "loss", label: "Loss", points: [datum("a", -8), datum("b", -2)] }]);
    expect(geometry.ticks).toContainEqual(expect.objectContaining({ value: 0, y: geometry.baseline }));
    expect(geometry.series[0].points.every(({ y }) => y > geometry.baseline)).toBe(true);
  });
});
