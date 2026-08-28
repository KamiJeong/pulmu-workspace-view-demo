import { type HTMLAttributes, type ReactNode } from "react";
import { classes } from "./internal";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** Semantic color intent: neutral, info, success, warning, or danger. */
  readonly tone?: Tone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return <span {...props} className={classes("pulmu-badge", `pulmu-tone--${tone}`, className)} />;
}

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  /** Accessible name for either the image or text fallback. */
  readonly alt: string;
  /** Short initials or glyph shown when `src` is absent. */
  readonly fallback: string;
  /** Optional image URL; omit it to render the fallback. */
  readonly src?: string;
};

export function Avatar({ alt, className, fallback, src, ...props }: AvatarProps) {
  return (
    <span {...props} className={classes("pulmu-avatar", className)}>
      {src ? <img alt={alt} src={src} /> : <span aria-label={alt} role="img">{fallback}</span>}
    </span>
  );
}

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** Optional trailing action area that wraps and stacks on narrow screens. */
  readonly actions?: ReactNode;
  /** Semantic container element: article for standalone content or section for grouped content. */
  readonly as?: "article" | "section";
  /** Optional card heading rendered at level two. */
  readonly heading?: ReactNode;
};

export function Card({ actions, as: Element = "article", children, className, heading, ...props }: CardProps) {
  return (
    <Element {...props} className={classes("pulmu-card", className)}>
      {heading ? <h2 className="pulmu-card__heading">{heading}</h2> : null}
      <div className="pulmu-card__content">{children}</div>
      {actions ? <div className="pulmu-card__actions">{actions}</div> : null}
    </Element>
  );
}

export function CodeReference({ children, className, ...props }: HTMLAttributes<HTMLElement>) {
  return <code {...props} className={classes("pulmu-code-reference", className)}>{children}</code>;
}
