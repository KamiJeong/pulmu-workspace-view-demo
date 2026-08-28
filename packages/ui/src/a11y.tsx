import { type AnchorHTMLAttributes, type HTMLAttributes } from "react";
import { classes } from "./internal";

export function VisuallyHidden({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={classes("pulmu-visually-hidden", className)} />;
}

export type SkipLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Required same-page target id, such as `#main`. */
  readonly href: `#${string}`;
};

export function SkipLink({ children = "Skip to main content", className, ...props }: SkipLinkProps) {
  return <a {...props} className={classes("pulmu-skip-link", className)}>{children}</a>;
}
