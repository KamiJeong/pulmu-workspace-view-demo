import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type DialogHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { PulmuIcon, UI_ICONS } from "@pulmu/icons";

import { Button, IconButton } from "./actions";
import { classes } from "./internal";

function useDismiss(ref: React.RefObject<HTMLElement | null>, open: boolean, dismiss: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) dismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [dismiss, open, ref]);
}

function useViewportPlacement(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
) {
  const [style, setStyle] = useState<CSSProperties>({});
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) return;
    const place = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const panel = panelRef.current?.getBoundingClientRect();
      if (!trigger || !panel) return;
      const margin = 8;
      const gap = 8;
      const maxWidth = Math.max(0, window.innerWidth - margin * 2);
      const width = Math.min(panel.width, maxWidth);
      const left = Math.max(margin, Math.min(trigger.left, window.innerWidth - width - margin));
      const below = trigger.bottom + gap;
      const above = trigger.top - panel.height - gap;
      const top = below + panel.height <= window.innerHeight - margin
        ? below
        : above >= margin ? above : margin;
      setStyle({
        left,
        maxHeight: Math.max(0, window.innerHeight - top - margin),
        maxWidth,
        overflowY: "auto",
        position: "fixed",
        top,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, panelRef, triggerRef]);
  return style;
}

export type TooltipProps = {
  readonly children: ReactElement;
  readonly content: ReactNode;
};

export function Tooltip({ children, content }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const placement = useViewportPlacement(open, triggerRef, panelRef);
  if (!isValidElement<Record<string, unknown>>(children)) return children;
  const describedBy = [children.props["aria-describedby"], id].filter(Boolean).join(" ");
  return (
    <span
      className={classes("pulmu-tooltip", open && "pulmu-tooltip--open")}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
      onFocusCapture={() => setOpen(true)}
      onKeyDownCapture={(event) => { if (event.key === "Escape") { event.preventDefault(); setOpen(false); } }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      ref={triggerRef}
    >
      {cloneElement(children, { "aria-describedby": describedBy })}
      <span className="pulmu-tooltip__content" hidden={!open} id={id} ref={panelRef} role="tooltip" style={placement}>{content}</span>
    </span>
  );
}

export type PopoverProps = Omit<HTMLAttributes<HTMLDivElement>, "content"> & {
  readonly content: ReactNode;
  readonly triggerLabel: string;
};

export function Popover({ className, content, triggerLabel, ...props }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const placement = useViewportPlacement(open, triggerRef, panelRef);
  useDismiss(rootRef, open, () => setOpen(false));
  return (
    <div
      {...props}
      className={classes("pulmu-popover", className)}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (open && event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
      ref={rootRef}
    >
      <Button aria-controls={id} aria-expanded={open} id={`${id}-trigger`} onClick={() => setOpen((value) => !value)} ref={triggerRef} variant="secondary">{triggerLabel}</Button>
      {open ? <div aria-labelledby={`${id}-trigger`} className="pulmu-popover__content" id={id} ref={panelRef} role="region" style={placement}>{content}</div> : null}
    </div>
  );
}

export type MenuItem = {
  readonly disabled?: boolean;
  readonly href?: string;
  readonly id: string;
  readonly label: string;
  readonly onSelect?: () => void;
};
export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  readonly items: readonly MenuItem[];
  readonly label: string;
  readonly triggerLabel: string;
};

export function Menu({ className, items, label, triggerLabel, ...props }: MenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const searchRef = useRef("");
  const searchTimer = useRef<number | undefined>(undefined);
  const enabled = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled);
  const placement = useViewportPlacement(open, triggerRef, panelRef);
  useDismiss(rootRef, open, () => setOpen(false));
  useEffect(() => () => window.clearTimeout(searchTimer.current), []);
  const focusItem = (position: number) => enabled[(position + enabled.length) % enabled.length] && itemRefs.current[enabled[(position + enabled.length) % enabled.length].index]?.focus();
  const close = (returnFocus = true) => { setOpen(false); if (returnFocus) queueMicrotask(() => triggerRef.current?.focus()); };
  return (
    <div {...props} className={classes("pulmu-menu", className)} ref={rootRef}>
      <Button aria-controls={menuId} aria-expanded={open} aria-haspopup="menu" onClick={() => { setOpen((value) => !value); if (!open) queueMicrotask(() => focusItem(0)); }} ref={triggerRef} variant="secondary">
        {triggerLabel}<PulmuIcon decorative icon={UI_ICONS.chevronDown} />
      </Button>
      {open ? (
        <div
          aria-label={label}
          className="pulmu-menu__content"
          id={menuId}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
          onKeyDown={(event) => {
            const current = itemRefs.current.indexOf(document.activeElement as HTMLElement);
            const position = enabled.findIndex(({ index }) => index === current);
            if (event.key === "ArrowDown") { event.preventDefault(); focusItem(position + 1); }
            else if (event.key === "ArrowUp") { event.preventDefault(); focusItem(position - 1); }
            else if (event.key === "Home") { event.preventDefault(); focusItem(0); }
            else if (event.key === "End") { event.preventDefault(); focusItem(enabled.length - 1); }
            else if (event.key === "Escape") { event.preventDefault(); close(); }
            else if (event.key === "Tab") { window.setTimeout(() => setOpen(false), 0); }
            else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
              searchRef.current += event.key.toLocaleLowerCase();
              window.clearTimeout(searchTimer.current);
              searchTimer.current = window.setTimeout(() => { searchRef.current = ""; }, 500);
              const found = enabled.findIndex(({ item }) => item.label.toLocaleLowerCase().startsWith(searchRef.current));
              if (found >= 0) focusItem(found);
            }
          }}
          role="menu"
          ref={panelRef}
          style={placement}
        >
          {items.map((item, index) => {
            const common = {
              "aria-disabled": item.disabled || undefined,
              className: "pulmu-menu__item",
              onClick: (event: React.MouseEvent) => { if (item.disabled) { event.preventDefault(); return; } item.onSelect?.(); close(); },
              ref: (node: HTMLElement | null) => { itemRefs.current[index] = node; },
              role: "menuitem" as const,
              tabIndex: -1,
            };
            return item.href ? <a {...common} href={item.href} key={item.id}>{item.label}</a> : <button {...common} disabled={item.disabled} key={item.id} type="button">{item.label}</button>;
          })}
        </div>
      ) : null}
    </div>
  );
}

export type DialogProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "title"> & {
  readonly actions?: ReactNode;
  readonly closeLabel?: string;
  readonly description?: ReactNode;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly title: ReactNode;
};

export function Dialog({ actions, children, className, closeLabel = "Close dialog", description, onOpenChange, open, title, ...props }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      queueMicrotask(() => dialog.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);
  const close = () => { onOpenChange(false); };
  return (
    <dialog
      {...props}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={classes("pulmu-dialog", className)}
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClose={() => { if (open) onOpenChange(false); queueMicrotask(() => returnFocusRef.current?.focus()); }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          close();
        }
      }}
      ref={ref}
    >
      <div className="pulmu-dialog__header"><h2 id={titleId}>{title}</h2><IconButton icon={UI_ICONS.close} label={closeLabel} onClick={close} variant="quiet" /></div>
      {description ? <p className="pulmu-dialog__description" id={descriptionId}>{description}</p> : null}
      <div className="pulmu-dialog__content">{children}</div>
      {actions ? <div className="pulmu-dialog__actions">{actions}</div> : null}
    </dialog>
  );
}
