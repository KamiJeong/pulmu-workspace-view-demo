import { useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { classes } from "./internal";

export type TabItem = {
  readonly content: ReactNode;
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: ReactNode;
};

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  readonly activationMode?: "automatic" | "manual";
  readonly defaultValue?: string;
  readonly label: string;
  readonly onValueChange?: (value: string) => void;
  readonly orientation?: "horizontal" | "vertical";
  readonly value?: string;
  readonly items: readonly TabItem[];
};

export function Tabs({ activationMode = "automatic", className, defaultValue, items, label, onValueChange, orientation = "horizontal", value, ...props }: TabsProps) {
  const baseId = useId();
  const enabledItems = items.filter((item) => !item.disabled);
  const enabledSignature = enabledItems.map((item) => item.id).join("\u001f");
  const firstEnabled = enabledItems[0]?.id ?? "";
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabled);
  const requestedValue = value ?? internalValue;
  const selected = enabledItems.some((item) => item.id === requestedValue) ? requestedValue : firstEnabled;
  const [focusValue, setFocusValue] = useState(selected);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => {
    if (value === undefined && internalValue !== selected) setInternalValue(selected);
    setFocusValue((current) => enabledItems.some((item) => item.id === current) ? current : selected);
  }, [enabledSignature, internalValue, selected, value]);
  useEffect(() => {
    if (value !== undefined) setFocusValue(selected);
  }, [selected, value]);
  const resolvedFocusValue = enabledItems.some((item) => item.id === focusValue) ? focusValue : selected;
  const select = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  const move = (current: string, direction: 1 | -1 | "first" | "last") => {
    const currentIndex = enabledItems.findIndex((item) => item.id === current);
    const index = direction === "first" ? 0 : direction === "last" ? enabledItems.length - 1 : (currentIndex + direction + enabledItems.length) % enabledItems.length;
    const next = enabledItems[index]?.id;
    if (!next) return;
    setFocusValue(next);
    refs.current.get(next)?.focus();
    if (activationMode === "automatic") select(next);
  };
  const active = enabledItems.find((item) => item.id === selected);
  return (
    <div {...props} className={classes("pulmu-tabs", className)}>
      <div aria-label={label} aria-orientation={orientation} className={classes("pulmu-tabs__list", `pulmu-tabs__list--${orientation}`)} role="tablist">
        {items.map((item) => {
          const tabId = `${baseId}-tab-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;
          const isSelected = active?.id === item.id;
          return (
            <button
              aria-controls={panelId}
              aria-selected={isSelected}
              className="pulmu-tabs__tab"
              disabled={item.disabled}
              id={tabId}
              key={item.id}
              onClick={() => { setFocusValue(item.id); select(item.id); }}
              onFocus={() => setFocusValue(item.id)}
              onKeyDown={(event) => {
                if ((orientation === "horizontal" && event.key === "ArrowRight") || (orientation === "vertical" && event.key === "ArrowDown")) { event.preventDefault(); move(item.id, 1); }
                else if ((orientation === "horizontal" && event.key === "ArrowLeft") || (orientation === "vertical" && event.key === "ArrowUp")) { event.preventDefault(); move(item.id, -1); }
                else if (event.key === "Home") { event.preventDefault(); move(item.id, "first"); }
                else if (event.key === "End") { event.preventDefault(); move(item.id, "last"); }
                else if (activationMode === "manual" && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); select(item.id); }
              }}
              ref={(node) => { if (node) refs.current.set(item.id, node); else refs.current.delete(item.id); }}
              role="tab"
              tabIndex={enabledItems.length > 0 && resolvedFocusValue === item.id ? 0 : -1}
              type="button"
            >{item.label}</button>
          );
        })}
      </div>
      {active ? <div aria-labelledby={`${baseId}-tab-${active.id}`} className="pulmu-tabs__panel" id={`${baseId}-panel-${active.id}`} role="tabpanel" tabIndex={0}>{active.content}</div> : null}
    </div>
  );
}
