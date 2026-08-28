import { type HTMLAttributes, type ReactNode } from "react";
import { classes } from "./internal";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export function Badge({ className, tone = "neutral", ...props }: HTMLAttributes<HTMLSpanElement> & { readonly tone?: Tone }) {
  return <span {...props} className={classes("pulmu-badge", `pulmu-tone--${tone}`, className)} />;
}

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  readonly alt: string;
  readonly fallback: string;
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
  readonly actions?: ReactNode;
  readonly as?: "article" | "section";
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
