export type FormattedDataValue = {
  /** Short value intended for the visible UI. */
  readonly display: string;
  /** Unabbreviated value intended for an accessible name or description. */
  readonly accessible: string;
  readonly state: "valid" | "missing" | "unknown";
};

export type FormatterOptions = {
  readonly locale?: Intl.LocalesArgument;
  readonly missingLabel?: string;
  readonly unknownLabel?: string;
};

const unavailable = (
  value: unknown,
  options: FormatterOptions,
): FormattedDataValue | undefined => {
  if (value === null) {
    const label = options.missingLabel ?? "Not available";
    return { accessible: label, display: "—", state: "missing" };
  }
  if (value === undefined) {
    const label = options.unknownLabel ?? "Unknown";
    return { accessible: label, display: label, state: "unknown" };
  }
  return undefined;
};

export type NumberFormatterOptions = FormatterOptions & {
  /** Compact only changes the visible value; `accessible` always remains unabbreviated. */
  readonly compact?: boolean;
  readonly maximumFractionDigits?: number;
  readonly minimumFractionDigits?: number;
};

export function formatNumber(
  value: number | null | undefined,
  options: NumberFormatterOptions = {},
): FormattedDataValue {
  const empty = unavailable(value, options);
  if (empty) return empty;
  const numericValue = value as number;
  if (!Number.isFinite(numericValue)) {
    const label = options.unknownLabel ?? "Unknown";
    return { accessible: label, display: label, state: "unknown" };
  }

  const digits = {
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    minimumFractionDigits: options.minimumFractionDigits,
  };
  const accessible = new Intl.NumberFormat(options.locale, {
    maximumFractionDigits: 20,
    minimumFractionDigits: options.minimumFractionDigits,
  }).format(numericValue);
  const display = options.compact
    ? new Intl.NumberFormat(options.locale, { ...digits, notation: "compact" }).format(numericValue)
    : new Intl.NumberFormat(options.locale, digits).format(numericValue);
  return { accessible, display, state: "valid" };
}

export type PercentageFormatterOptions = FormatterOptions & {
  readonly maximumFractionDigits?: number;
  readonly minimumFractionDigits?: number;
};

/** Formats a ratio (`0.42` means 42%), never an already-multiplied percent. */
export function formatPercentage(
  ratio: number | null | undefined,
  options: PercentageFormatterOptions = {},
): FormattedDataValue {
  const empty = unavailable(ratio, options);
  if (empty) return empty;
  const numericRatio = ratio as number;
  if (!Number.isFinite(numericRatio)) {
    const label = options.unknownLabel ?? "Unknown";
    return { accessible: label, display: label, state: "unknown" };
  }
  const display = new Intl.NumberFormat(options.locale, {
    maximumFractionDigits: options.maximumFractionDigits ?? 1,
    minimumFractionDigits: options.minimumFractionDigits,
    style: "percent",
  }).format(numericRatio);
  const accessible = new Intl.NumberFormat(options.locale, {
    maximumFractionDigits: 20,
    minimumFractionDigits: options.minimumFractionDigits,
    style: "percent",
  }).format(numericRatio);
  return { accessible, display, state: "valid" };
}

export type DateFormatterOptions = FormatterOptions & {
  readonly dateStyle?: "full" | "long" | "medium" | "short";
  readonly timeStyle?: "full" | "long" | "medium" | "short";
  readonly timeZone?: string;
};

export function formatDate(
  value: Date | number | string | null | undefined,
  options: DateFormatterOptions = {},
): FormattedDataValue {
  const empty = unavailable(value, options);
  if (empty) return empty;
  const presentValue = value as Date | number | string;
  const date = presentValue instanceof Date ? presentValue : new Date(presentValue);
  if (!Number.isFinite(date.getTime())) {
    const label = options.unknownLabel ?? "Unknown date";
    return { accessible: label, display: label, state: "unknown" };
  }
  const dateStyle = options.dateStyle ?? "medium";
  const display = new Intl.DateTimeFormat(options.locale, {
    dateStyle,
    timeStyle: options.timeStyle,
    timeZone: options.timeZone,
  }).format(date);
  const accessible = new Intl.DateTimeFormat(options.locale, {
    dateStyle: "full",
    timeStyle: options.timeStyle,
    timeZone: options.timeZone,
  }).format(date);
  return { accessible, display, state: "valid" };
}

export type DurationFormatterOptions = FormatterOptions & {
  /** Number of units shown in the compact visible value. */
  readonly maximumUnits?: number;
};

/** Formats a duration supplied in milliseconds. Negative durations are valid and retain their sign. */
export function formatDuration(
  milliseconds: number | null | undefined,
  options: DurationFormatterOptions = {},
): FormattedDataValue {
  const empty = unavailable(milliseconds, options);
  if (empty) return empty;
  const numericMilliseconds = milliseconds as number;
  if (!Number.isFinite(numericMilliseconds)) {
    const label = options.unknownLabel ?? "Unknown duration";
    return { accessible: label, display: label, state: "unknown" };
  }

  const sign = numericMilliseconds < 0 ? "−" : "";
  let remaining = Math.abs(numericMilliseconds);
  const units = [
    [86_400_000, "d"],
    [3_600_000, "h"],
    [60_000, "m"],
    [1_000, "s"],
  ] as const;
  const parts: string[] = [];
  for (const [size, label] of units) {
    const amount = Math.floor(remaining / size);
    if (amount > 0) {
      parts.push(`${amount}${label}`);
      remaining -= amount * size;
    }
  }
  if (parts.length === 0 || remaining > 0) parts.push(`${Math.round(remaining)}ms`);
  const display = `${sign}${parts.slice(0, options.maximumUnits ?? 2).join(" ")}`;
  const exact = new Intl.NumberFormat(options.locale, { maximumFractionDigits: 20 }).format(numericMilliseconds);
  return { accessible: `${exact} milliseconds`, display, state: "valid" };
}
