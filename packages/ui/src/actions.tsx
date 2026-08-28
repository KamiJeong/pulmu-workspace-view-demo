import {
  forwardRef,
  useId,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { UI_ICONS, PulmuIcon, type PulmuIconProps } from "@pulmu/icons";

import { classes } from "./internal";
import { Spinner } from "./feedback";

export type ButtonVariant = "primary" | "secondary" | "danger" | "quiet";
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Prevents activation, sets `aria-busy`, and replaces the label with `loadingLabel`. */
  readonly loading?: boolean;
  /** Visible progress text shown while `loading` is true. Localize this as a complete phrase. */
  readonly loadingLabel?: string;
  /** Visual emphasis: primary, secondary, destructive danger, or chrome-free quiet. */
  readonly variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className, disabled, loading = false, loadingLabel = "Loading", type = "button", variant = "primary", ...props },
  ref,
) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={classes("pulmu-button", `pulmu-button--${variant}`, className)}
      data-loading={loading || undefined}
      disabled={disabled || loading}
      ref={ref}
      type={type}
    >
      {loading ? <Spinner decorative label={loadingLabel} size="sm" /> : null}
      <span>{loading ? loadingLabel : children}</span>
    </button>
  );
});

export type IconButtonProps = Omit<ButtonProps, "children"> & {
  /** Glyph rendered decoratively; the control name comes from `label`. */
  readonly icon: PulmuIconProps["icon"];
  /** Required accessible name for the icon-only control. */
  readonly label: string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, ...props }, ref,
) {
  return (
    <Button {...props} aria-label={label} className={classes("pulmu-icon-button", props.className)} ref={ref}>
      <PulmuIcon decorative icon={icon} />
    </Button>
  );
});

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Hidden suffix announced for links with `target="_blank"`. */
  readonly externalLabel?: string;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { children, className, externalLabel = "Opens in a new tab", rel, target, ...props }, ref,
) {
  const external = target === "_blank";
  return (
    <a
      {...props}
      className={classes("pulmu-link", className)}
      ref={ref}
      rel={external ? rel ?? "noreferrer" : rel}
      target={target}
    >
      {children}
      {external ? <><PulmuIcon decorative icon={UI_ICONS.externalLink} size="sm" /><span className="pulmu-visually-hidden">{externalLabel}</span></> : null}
    </a>
  );
});

export type CopyButtonProps = Omit<ButtonProps, "children" | "onClick"> & {
  /** Success feedback shown and politely announced after copying. */
  readonly copiedLabel?: string;
  /** Idle action label. */
  readonly copyLabel?: string;
  /** Failure feedback shown and politely announced when clipboard access fails. */
  readonly errorLabel?: string;
  /** Exact text written to the clipboard. */
  readonly text: string;
  /** Called after a successful clipboard write. */
  readonly onCopy?: (text: string) => void;
};

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { copiedLabel = "Copied", copyLabel = "Copy", errorLabel = "Copy failed", onCopy, text, ...props }, ref,
) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const statusId = useId();
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      onCopy?.(text);
    } catch {
      setStatus("error");
    }
    window.setTimeout(() => setStatus("idle"), 1600);
  };
  const feedback = status === "copied" ? copiedLabel : status === "error" ? errorLabel : "";
  return (
    <span className="pulmu-copy-control">
      <Button {...props} aria-describedby={statusId} onClick={() => void copy()} ref={ref} variant={props.variant ?? "secondary"}>
        {status === "copied" ? copiedLabel : status === "error" ? errorLabel : copyLabel}
      </Button>
      <span aria-live="polite" className="pulmu-visually-hidden" id={statusId}>{feedback}</span>
    </span>
  );
});

export type ActionContent = ReactNode;
