import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { UI_ICONS } from "@pulmu/icons";

import { Button, IconButton } from "./actions";
import { SkipLink } from "./a11y";
import { Spinner } from "./feedback";
import { classes } from "./internal";
import { Dialog } from "./overlays";

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  /** Product-level header content. Keep page-specific headings in `PageHeader`. */
  readonly header: ReactNode;
  /** Stable target id used by the first-focusable skip link. */
  readonly mainId?: string;
  /** Optional persistent or modal navigation, normally `CollapsibleSidebar`. */
  readonly sidebar?: ReactNode;
  /** Localized skip-link text. */
  readonly skipLinkLabel?: string;
};

export function AppShell({ children, className, header, mainId = "main-content", sidebar, skipLinkLabel = "Skip to main content", ...props }: AppShellProps) {
  const target = `#${mainId}` as `#${string}`;
  return (
    <div {...props} className={classes("pulmu-app-shell", className)}>
      <SkipLink href={target}>{skipLinkLabel}</SkipLink>
      <header className="pulmu-app-shell__header">{header}</header>
      <div className="pulmu-app-shell__body">
        {sidebar}
        <main className="pulmu-app-shell__main" id={mainId} tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}

const SIDEBAR_MEDIA_QUERY = "(max-width: 47.999rem)";

function useCompactSidebar() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(SIDEBAR_MEDIA_QUERY);
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return compact;
}

export type CollapsibleSidebarProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Navigation or supporting content hidden from the tab order when collapsed. */
  readonly children: ReactNode;
  /** Localized accessible name for the desktop collapse control. */
  readonly collapseLabel?: string;
  /** Controlled desktop collapsed state. */
  readonly collapsed?: boolean;
  /** Initial desktop collapsed state for uncontrolled use. */
  readonly defaultCollapsed?: boolean;
  /** Localized accessible name for the desktop expand control. */
  readonly expandLabel?: string;
  /** Accessible label for the complementary region and mobile dialog. */
  readonly label: string;
  /** Full text label for the compact-screen navigation trigger. */
  readonly mobileTriggerLabel?: string;
  /** Localized accessible name for the modal close control. */
  readonly mobileCloseLabel?: string;
  /** Reports controlled and uncontrolled desktop collapse changes. */
  readonly onCollapsedChange?: (collapsed: boolean) => void;
  /** Reports link activation from the compact drawer after it begins closing. */
  readonly onNavigate?: (href: string) => void;
};

export function CollapsibleSidebar({
  children,
  className,
  collapseLabel = "Collapse navigation",
  collapsed,
  defaultCollapsed = false,
  expandLabel = "Expand navigation",
  label,
  mobileCloseLabel = "Close navigation",
  mobileTriggerLabel = "Open navigation",
  onCollapsedChange,
  onNavigate,
  ...props
}: CollapsibleSidebarProps) {
  const compact = useCompactSidebar();
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopToggleRef = useRef<HTMLButtonElement>(null);
  const desktopToggleFocusedRef = useRef(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const pendingCompactDestinationRef = useRef<HTMLElement | null>(null);
  const isCollapsed = collapsed ?? internalCollapsed;
  const setCollapsed = (next: boolean) => {
    if (collapsed === undefined) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };
  const navigateFromCompactSidebar = (event: ReactMouseEvent<HTMLDivElement>) => {
    const source = event.target;
    const anchor = source instanceof Element ? source.closest<HTMLAnchorElement>("a[href]") : null;
    if (
      !anchor ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) return;

    const href = anchor.getAttribute("href");
    if (!href) return;
    onNavigate?.(href);
    setMobileOpen(false);

    if (!href.startsWith("#")) return;
    const destinationId = decodeURIComponent(href.slice(1));
    const destination = anchor.ownerDocument.getElementById(destinationId);
    if (!destination) return;

    event.preventDefault();
    const view = anchor.ownerDocument.defaultView;
    if (!view) return;
    view.location.hash = href;
    pendingCompactDestinationRef.current = destination;
  };
  useEffect(() => {
    if (compact) {
      if (desktopToggleFocusedRef.current) {
        desktopToggleFocusedRef.current = false;
        queueMicrotask(() => mobileTriggerRef.current?.focus());
      }
      const destination = pendingCompactDestinationRef.current;
      if (!mobileOpen && destination) {
        pendingCompactDestinationRef.current = null;
        const view = destination.ownerDocument.defaultView;
        view?.requestAnimationFrame(() => {
          view.requestAnimationFrame(() => {
            destination.focus();
            destination.scrollIntoView({ block: "start" });
          });
        });
      }
      return;
    }
    if (!mobileOpen) return;
    setMobileOpen(false);
    queueMicrotask(() => desktopToggleRef.current?.focus());
  }, [compact, mobileOpen]);

  if (compact) {
    return (
      <div {...props} className={classes("pulmu-collapsible-sidebar-mobile", className)}>
        <Button aria-haspopup="dialog" onClick={() => setMobileOpen(true)} ref={mobileTriggerRef} variant="secondary">{mobileTriggerLabel}</Button>
        <Dialog className="pulmu-collapsible-sidebar__dialog" closeLabel={mobileCloseLabel} onOpenChange={setMobileOpen} open={mobileOpen} title={label}>
          <div className="pulmu-collapsible-sidebar__content" onClick={navigateFromCompactSidebar}>{children}</div>
        </Dialog>
      </div>
    );
  }

  return (
    <aside {...props} aria-label={label} className={classes("pulmu-collapsible-sidebar", className)} data-collapsed={isCollapsed || undefined}>
      <IconButton
        aria-expanded={!isCollapsed}
        icon={UI_ICONS.menu}
        label={isCollapsed ? expandLabel : collapseLabel}
        onBlur={() => { desktopToggleFocusedRef.current = false; }}
        onClick={() => setCollapsed(!isCollapsed)}
        onFocus={() => { desktopToggleFocusedRef.current = true; }}
        ref={desktopToggleRef}
        variant="quiet"
      />
      <div className="pulmu-collapsible-sidebar__content" hidden={isCollapsed}>{children}</div>
    </aside>
  );
}

export type PageHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Optional action group that wraps, then stacks on narrow screens. */
  readonly actions?: ReactNode;
  /** Supporting copy shown below the only page-level heading. */
  readonly description?: ReactNode;
  /** Optional context shown before the page heading. */
  readonly eyebrow?: ReactNode;
  /** Page title rendered as the single `h1`. */
  readonly title: ReactNode;
};

export function PageHeader({ actions, className, description, eyebrow, title, ...props }: PageHeaderProps) {
  return (
    <div {...props} className={classes("pulmu-page-header", className)}>
      <div className="pulmu-page-header__copy">
        {eyebrow ? <div className="pulmu-page-header__eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="pulmu-page-header__actions">{actions}</div> : null}
    </div>
  );
}

export type LabelledLayoutProps = HTMLAttributes<HTMLElement> & {
  /** Accessible name for the grouped layout region. */
  readonly label: string;
};

export function MetricGrid({ children, className, label, ...props }: LabelledLayoutProps) {
  return <section {...props} aria-label={label} className={classes("pulmu-metric-grid", className)}>{children}</section>;
}

export type MasterDetailProps = Omit<LabelledLayoutProps, "children"> & {
  /** Secondary detail content, placed after the master content in DOM and visual order. */
  readonly detail: ReactNode;
  readonly detailLabel: string;
  /** Primary master content. */
  readonly master: ReactNode;
  readonly masterLabel: string;
};

export function MasterDetail({ className, detail, detailLabel, label, master, masterLabel, ...props }: MasterDetailProps) {
  return (
    <section {...props} aria-label={label} className={classes("pulmu-master-detail", className)}>
      <div aria-label={masterLabel} className="pulmu-master-detail__master" role="region">{master}</div>
      <aside aria-label={detailLabel} className="pulmu-master-detail__detail">{detail}</aside>
    </section>
  );
}

export type ContentWithRailProps = Omit<LabelledLayoutProps, "children"> & {
  /** Primary content, kept first in DOM and stacked order. */
  readonly children: ReactNode;
  /** Supporting content rendered as a labelled complementary region. */
  readonly rail: ReactNode;
  readonly railLabel: string;
};

export function ContentWithRail({ children, className, label, rail, railLabel, ...props }: ContentWithRailProps) {
  return (
    <section {...props} aria-label={label} className={classes("pulmu-content-with-rail", className)}>
      <div className="pulmu-content-with-rail__content">{children}</div>
      <aside aria-label={railLabel} className="pulmu-content-with-rail__rail">{rail}</aside>
    </section>
  );
}

export type FilterDataRegionProps = Omit<LabelledLayoutProps, "children"> & {
  /** Primary data view, first in DOM and stacked order. */
  readonly data: ReactNode;
  readonly dataLabel: string;
  /** Supporting filters. Native controls keep their normal keyboard behavior. */
  readonly filters: ReactNode;
  readonly filtersLabel: string;
};

export function FilterDataRegion({ className, data, dataLabel, filters, filtersLabel, label, ...props }: FilterDataRegionProps) {
  return (
    <section {...props} aria-label={label} className={classes("pulmu-filter-data-region", className)}>
      <div aria-label={dataLabel} className="pulmu-filter-data-region__data" role="region">{data}</div>
      <aside aria-label={filtersLabel} className="pulmu-filter-data-region__filters">{filters}</aside>
    </section>
  );
}

export type OverflowRegionProps = HTMLAttributes<HTMLDivElement> & {
  /** Required visible or contextual name announced when the scroll region receives focus. */
  readonly label: string;
};

export function OverflowRegion({ children, className, label, tabIndex = 0, ...props }: OverflowRegionProps) {
  return <div {...props} aria-label={label} className={classes("pulmu-overflow-region", className)} role="region" tabIndex={tabIndex}>{children}</div>;
}

export type StateLayoutKind = "loading" | "empty" | "failure" | "interrupted";
export type StateLayoutProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** At most one truthful next-step or recovery control. */
  readonly action?: ReactElement;
  readonly description: ReactNode;
  readonly state: StateLayoutKind;
  readonly title: ReactNode;
};

export function StateLayout({ action, className, description, state, title, ...props }: StateLayoutProps) {
  const role = state === "failure" ? "alert" : state === "loading" || state === "interrupted" ? "status" : undefined;
  return (
    <div
      {...props}
      aria-busy={state === "loading" || undefined}
      className={classes("pulmu-state-layout", `pulmu-state-layout--${state}`, className)}
      role={role}
    >
      {state === "loading" ? <Spinner decorative label="" /> : null}
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className="pulmu-state-layout__action">{action}</div> : null}
    </div>
  );
}

export type EmbeddedViewProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  readonly actions?: ReactNode;
  readonly description?: ReactNode;
  readonly mainId?: string;
  readonly skipLinkLabel?: string;
  /** Embedded-view title rendered as its `h1`. */
  readonly title: ReactNode;
};

export function EmbeddedView({ actions, children, className, description, mainId = "embedded-main", skipLinkLabel = "Skip to embedded content", title, ...props }: EmbeddedViewProps) {
  const target = `#${mainId}` as `#${string}`;
  return (
    <div {...props} className={classes("pulmu-embedded-view", className)}>
      <SkipLink href={target}>{skipLinkLabel}</SkipLink>
      <main id={mainId} tabIndex={-1}>
        <PageHeader actions={actions} description={description} title={title} />
        <div className="pulmu-embedded-view__content">{children}</div>
      </main>
    </div>
  );
}
