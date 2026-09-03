import {
  useId,
  type HTMLAttributes,
  type ReactNode,
  type TableHTMLAttributes,
  type ThHTMLAttributes,
} from "react";

import { Button } from "./actions";
import { Alert, EmptyState, ErrorState, Skeleton } from "./feedback";
import { formatNumber, formatPercentage, type FormattedDataValue } from "./formatters";
import { classes } from "./internal";

export type SortDirection = "ascending" | "descending";
export type SortState<ColumnKey extends string = string> = {
  readonly column: ColumnKey;
  readonly direction: SortDirection;
};

export type SortableHeaderProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "onChange"> & {
  readonly children: ReactNode;
  /** Controlled direction; null means this column is not the active sort. */
  readonly direction: SortDirection | null;
  readonly onSort: () => void;
  /** Plain-text column name used to describe the next sorting action. */
  readonly sortLabel: string;
};

export function SortableHeader({ children, className, direction, onSort, sortLabel, ...props }: SortableHeaderProps) {
  const next = direction === "ascending" ? "descending" : "ascending";
  return (
    <th {...props} aria-sort={direction ?? "none"} className={classes("pulmu-data-table__sortable", className)} scope="col">
      <button aria-label={`${sortLabel}, sort ${next}`} onClick={onSort} type="button">
        <span>{children}</span>
        <span aria-hidden="true" className="pulmu-data-table__sort-indicator">
          {direction === "ascending" ? "↑" : direction === "descending" ? "↓" : "↕"}
        </span>
        <span className="pulmu-visually-hidden">
          {direction ? `Sorted ${direction}` : "Not sorted"}
        </span>
      </button>
    </th>
  );
}

export type DataTableColumn<Row, ColumnKey extends string = string> = {
  readonly accessor: (row: Row) => unknown;
  readonly align?: "start" | "end";
  readonly compare?: (left: Row, right: Row) => number;
  readonly header: ReactNode;
  readonly key: ColumnKey;
  /** Documents reading priority without hiding data at narrow widths. Lower numbers are more important. */
  readonly priority?: number;
  readonly render?: (value: unknown, row: Row) => ReactNode;
  /** Explicit accessible column name for a sortable non-string header; defaults to a string header or key. */
  readonly sortLabel?: string;
  readonly sortable?: boolean;
};

export type DataTableProps<Row, ColumnKey extends string = string> = Omit<
  TableHTMLAttributes<HTMLTableElement>,
  "children"
> & {
  readonly caption: ReactNode;
  readonly columns: readonly DataTableColumn<Row, ColumnKey>[];
  readonly onSortChange?: (sort: SortState<ColumnKey>) => void;
  readonly rowKey: (row: Row) => string | number;
  readonly rows: readonly Row[];
  readonly sort?: SortState<ColumnKey> | null;
};

const compareUnknown = (left: unknown, right: unknown) => {
  if (left === right) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), undefined, { numeric: true });
};

const defaultCell = (value: unknown): ReactNode => {
  if (value === null) return <span aria-label="Not available">—</span>;
  if (value === undefined) return "Unknown";
  if (typeof value === "string" || typeof value === "number") return value;
  return String(value);
};

export function DataTable<Row, ColumnKey extends string = string>({
  caption,
  className,
  columns,
  onSortChange,
  rowKey,
  rows,
  sort = null,
  ...props
}: DataTableProps<Row, ColumnKey>) {
  const captionId = useId();
  const activeColumn = sort ? columns.find((column) => column.key === sort.column) : undefined;
  const orderedRows = activeColumn
    ? rows.map((row, index) => ({ index, row })).sort((left, right) => {
      const result = activeColumn.compare
        ? activeColumn.compare(left.row, right.row)
        : compareUnknown(activeColumn.accessor(left.row), activeColumn.accessor(right.row));
      return (sort?.direction === "descending" ? -result : result) || left.index - right.index;
    }).map(({ row }) => row)
    : rows;

  const requestSort = (column: DataTableColumn<Row, ColumnKey>) => {
    if (!onSortChange) return;
    onSortChange({
      column: column.key,
      direction: sort?.column === column.key && sort.direction === "ascending" ? "descending" : "ascending",
    });
  };

  return (
    <div aria-labelledby={captionId} className="pulmu-data-table-region" role="region" tabIndex={0}>
      <table {...props} className={classes("pulmu-data-table", className)}>
        <caption id={captionId}>{caption}</caption>
        <thead>
          <tr>{columns.map((column) => column.sortable ? (
            <SortableHeader
              data-align={column.align}
              data-priority={column.priority}
              direction={sort?.column === column.key ? sort.direction : null}
              key={column.key}
              onSort={() => requestSort(column)}
              sortLabel={column.sortLabel ?? (typeof column.header === "string" ? column.header : column.key)}
            >
              {column.header}
            </SortableHeader>
          ) : (
            <th data-align={column.align} data-priority={column.priority} key={column.key} scope="col">{column.header}</th>
          ))}</tr>
        </thead>
        <tbody>{orderedRows.map((row) => (
          <tr key={rowKey(row)}>{columns.map((column) => {
            const value = column.accessor(row);
            return <td data-align={column.align} data-priority={column.priority} key={column.key}>{column.render ? column.render(value, row) : defaultCell(value)}</td>;
          })}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export type ActiveFilter = {
  readonly id: string;
  readonly label: string;
  readonly value: ReactNode;
};

export type FilterSummaryProps = HTMLAttributes<HTMLElement> & {
  readonly filters: readonly ActiveFilter[];
  /** Distinguishes multiple filter summaries on comparison or dashboard surfaces. */
  readonly label?: string;
  readonly onClear?: (id: string) => void;
  readonly onClearAll?: () => void;
};

export function FilterSummary({ "aria-label": ariaLabel, className, filters, label, onClear, onClearAll, ...props }: FilterSummaryProps) {
  const accessibleLabel = label ?? ariaLabel ?? "Active filters";
  return (
    <section {...props} aria-label={accessibleLabel} className={classes("pulmu-filter-summary", className)}>
      <strong>{filters.length === 0 ? "No filters applied" : `${filters.length} active ${filters.length === 1 ? "filter" : "filters"}`}</strong>
      {filters.length > 0 ? <ul>{filters.map((filter) => (
        <li key={filter.id}>
          <span><span className="pulmu-filter-summary__label">{filter.label}:</span> {filter.value}</span>
          {onClear ? <button aria-label={`Remove ${filter.label} filter`} onClick={() => onClear(filter.id)} type="button">Remove</button> : null}
        </li>
      ))}</ul> : null}
      {filters.length > 1 && onClearAll ? <Button onClick={onClearAll} variant="quiet">Clear all</Button> : null}
    </section>
  );
}

export type TrendIndicatorProps = HTMLAttributes<HTMLSpanElement> & {
  readonly format?: "number" | "percentage";
  readonly label?: string;
  readonly value: number | null | undefined;
};

export function TrendIndicator({ className, format = "percentage", label = "Change", value, ...props }: TrendIndicatorProps) {
  const formatted = format === "percentage" ? formatPercentage(value) : formatNumber(value);
  const direction = typeof value === "number" && Number.isFinite(value) ? (value > 0 ? "up" : value < 0 ? "down" : "flat") : "unknown";
  const symbol = direction === "up" ? "▲" : direction === "down" ? "▼" : direction === "flat" ? "●" : "?";
  const signed = direction === "up" ? `+${formatted.display}` : formatted.display;
  return (
    <span {...props} aria-label={`${label}: ${direction === "up" ? "up" : direction === "down" ? "down" : direction === "flat" ? "no change" : "unknown"}, ${formatted.accessible}`} className={classes("pulmu-trend", `pulmu-trend--${direction}`, className)} role="img">
      <span aria-hidden="true">{symbol} {signed}</span>
    </span>
  );
}

export type MetricCardProps = HTMLAttributes<HTMLElement> & {
  readonly label: ReactNode;
  readonly support?: ReactNode;
  readonly trend?: ReactNode;
  readonly value: ReactNode | FormattedDataValue;
};

const isFormattedValue = (value: MetricCardProps["value"]): value is FormattedDataValue => (
  typeof value === "object" && value !== null && "display" in value && "accessible" in value && "state" in value
);

export function MetricCard({ className, label, support, trend, value, ...props }: MetricCardProps) {
  return (
    <section {...props} className={classes("pulmu-metric-card", className)}>
      <div className="pulmu-metric-card__label">{label}</div>
      <div className="pulmu-metric-card__value">
        {isFormattedValue(value) ? <span aria-label={value.accessible}>{value.display}</span> : value}
      </div>
      {trend ? <div className="pulmu-metric-card__trend">{trend}</div> : null}
      {support ? <div className="pulmu-metric-card__support">{support}</div> : null}
    </section>
  );
}

export type DataStateProps = HTMLAttributes<HTMLDivElement> & {
  readonly action?: ReactNode;
  readonly children?: ReactNode;
  readonly description?: ReactNode;
  readonly status: "ready" | "loading" | "empty" | "filtered-empty" | "error" | "stale";
  readonly title?: ReactNode;
  readonly updatedAt?: ReactNode;
};

export function DataState({ action, children, className, description, status, title, updatedAt, ...props }: DataStateProps) {
  if (status === "loading") {
    return <div {...props} aria-busy="true" className={classes("pulmu-data-state", className)}><Skeleton label={typeof title === "string" ? title : "Loading data"} /></div>;
  }
  if (status === "empty" || status === "filtered-empty") {
    return <EmptyState {...props} action={action} className={classes("pulmu-data-state", className)} description={description ?? (status === "filtered-empty" ? "Adjust or clear filters to see results." : "There is no data to display yet.")} title={title ?? (status === "filtered-empty" ? "No matching results" : "No data yet")} />;
  }
  if (status === "error") {
    return <ErrorState {...props} action={action} className={classes("pulmu-data-state", className)} description={description ?? "Try again or contact support if the problem continues."} title={title ?? "Data could not be loaded"} />;
  }
  if (status === "stale") {
    return <div {...props} className={classes("pulmu-data-state", className)}>
      <Alert title={title ?? "Data may be out of date"} tone="warning">
        {description ?? "Refresh to load the latest values."}{updatedAt ? <> Last updated: <time>{updatedAt}</time>.</> : null} {action}
      </Alert>
      {children}
    </div>;
  }
  return <div {...props} className={classes("pulmu-data-state", className)}>{children}</div>;
}
