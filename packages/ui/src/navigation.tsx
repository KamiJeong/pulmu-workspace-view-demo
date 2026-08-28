import { type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { classes } from "./internal";

export type PaginationProps = HTMLAttributes<HTMLElement> & {
  readonly currentPage: number;
  readonly getHref: (page: number) => string;
  readonly label?: string;
  readonly totalPages: number;
};

export function Pagination({ className, currentPage, getHref, label = "Pagination", totalPages, ...props }: PaginationProps) {
  const pages = Array.from({ length: Math.max(0, totalPages) }, (_, index) => index + 1);
  return (
    <nav {...props} aria-label={label} className={classes("pulmu-pagination", className)}>
      <a aria-disabled={currentPage <= 1 || undefined} className="pulmu-pagination__edge" href={currentPage <= 1 ? undefined : getHref(currentPage - 1)}>Previous</a>
      <ol>{pages.map((page) => <li key={page}><a aria-current={page === currentPage ? "page" : undefined} href={getHref(page)}>{page}</a></li>)}</ol>
      <a aria-disabled={currentPage >= totalPages || undefined} className="pulmu-pagination__edge" href={currentPage >= totalPages ? undefined : getHref(currentPage + 1)}>Next</a>
    </nav>
  );
}

export type BreadcrumbItem = {
  readonly href?: string;
  readonly label: ReactNode;
};
export type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
  readonly items: readonly BreadcrumbItem[];
  readonly label?: string;
};

export function Breadcrumb({ className, items, label = "Breadcrumb", ...props }: BreadcrumbProps) {
  return (
    <nav {...props} aria-label={label} className={classes("pulmu-breadcrumb", className)}>
      <ol>{items.map((item, index) => {
        const current = index === items.length - 1;
        return <li key={index}>{current || !item.href ? <span aria-current={current ? "page" : undefined}>{item.label}</span> : <a href={item.href}>{item.label}</a>}</li>;
      })}</ol>
    </nav>
  );
}

export type NavigationLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;
