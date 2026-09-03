import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  BarChart,
  Button,
  DataState,
  DataTable,
  DonutChart,
  FilterSummary,
  LineChart,
  MetricCard,
  Pagination,
  Progress,
  TrendIndicator,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercentage,
  type SortState,
} from "@pulmu/ui";
import "@pulmu/ui/global.css";
import "./DataComponents.css";

const meta = {
  title: "06 Data Components/Components",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Run = { duration: number | null; id: string; name: string; score: number | null; updatedAt: string };
const runs: readonly Run[] = [
  { duration: 91_000, id: "run-14", name: "Release checks", score: 0.98, updatedAt: "2026-09-03T09:15:00Z" },
  { duration: null, id: "run-12", name: "Accessibility audit", score: 0, updatedAt: "2026-09-02T08:00:00Z" },
  { duration: 3_661_250, id: "run-13", name: "Workspace build", score: 0.875, updatedAt: "2026-09-03T08:30:00Z" },
];
const columns = [
  { accessor: (run: Run) => run.name, header: <span>Run</span>, key: "name", priority: 1, sortLabel: "Run name", sortable: true },
  { accessor: (run: Run) => run.score, align: "end" as const, header: "Pass rate", key: "score", priority: 2, render: (value: unknown) => { const result = formatPercentage(value as number | null); return <span aria-label={result.accessible}>{result.display}</span>; }, sortable: true },
  { accessor: (run: Run) => run.duration, align: "end" as const, header: "Duration", key: "duration", priority: 3, render: (value: unknown) => { const result = formatDuration(value as number | null); return <span aria-label={result.accessible}>{result.display}</span>; }, sortable: true },
  { accessor: (run: Run) => run.updatedAt, header: "Updated", key: "updatedAt", priority: 4, render: (value: unknown) => { const result = formatDate(value as string, { timeZone: "UTC" }); return <time aria-label={result.accessible}>{result.display}</time>; } },
] as const;

const TableDemo = () => {
  const [sort, setSort] = useState<SortState<(typeof columns)[number]["key"]>>({ column: "name", direction: "ascending" });
  const [filters, setFilters] = useState([{ id: "branch", label: "Branch", value: "main" }, { id: "status", label: "Status", value: "Complete" }]);
  return <div className="data-stack">
    <FilterSummary filters={filters} onClear={(id) => setFilters((current) => current.filter((filter) => filter.id !== id))} onClearAll={() => setFilters([])} />
    <DataTable caption="Recent Pulmu runs" columns={columns} onSortChange={setSort} rowKey={(run) => run.id} rows={runs} sort={sort} />
    <Pagination currentPage={1} getHref={(page) => `?page=${page}`} label="Recent runs pages" totalPages={3} />
  </div>;
};

export const SemanticTableAndFilters: Story = {
  globals: { viewport: { isRotated: false, value: "narrow" } },
  render: () => <TableDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Recent Pulmu runs" });
    const nameHeader = canvas.getByRole("columnheader", { name: /Run Sorted ascending/ });
    await expect(within(nameHeader).getByRole("button")).toHaveAccessibleName("Run name, sort descending");
    await expect(within(nameHeader).getByRole("button")).not.toHaveAccessibleName(/object Object/);
    await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Accessibility audit");
    await userEvent.click(within(nameHeader).getByRole("button"));
    await expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Workspace build");
    await userEvent.click(canvas.getByRole("button", { name: "Remove Branch filter" }));
    await expect(canvas.queryByText("main")).not.toBeInTheDocument();
    await expect(canvas.getByRole("navigation", { name: "Recent runs pages" })).toBeInTheDocument();
  },
};

export const MetricsAndProgress: Story = {
  render: () => <div className="data-stack">
    <div className="data-metrics">
      <MetricCard label="Runs completed" support="Across all active worktrees" trend={<TrendIndicator value={0.125} />} value={formatNumber(12_345_678, { compact: true })} />
      <MetricCard label="Pass rate" support="Includes accessibility checks" trend={<TrendIndicator value={0} />} value={formatPercentage(0.982)} />
      <MetricCard label="Median duration" support="Last 30 days" trend={<TrendIndicator format="number" value={-12} />} value={formatDuration(2_430_000)} />
    </div>
    <Progress label="Issue verification" value={82} />
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("12,345,678")).toHaveTextContent("12.35M");
    await expect(canvas.getByLabelText(/Change: up, 12.5%/)).toBeInTheDocument();
    await expect(canvas.getByRole("progressbar", { name: "Issue verification" })).toHaveAttribute("aria-valuenow", "82");
  },
};

const chartData = [
  { id: "build", label: "Build", value: 18 },
  { id: "review", label: "Review", value: 11 },
  { id: "failed", label: "Failed", value: -4 },
] as const;
const lineSeries = [
  { id: "complete", label: "Completed", points: [{ id: "mon", label: "Mon", value: 8 }, { id: "tue", label: "Tue", value: null }, { id: "wed", label: "Wed", value: 14 }] },
  { id: "queued", label: "Queued", points: [{ id: "mon", label: "Mon", value: 5 }, { id: "tue", label: "Tue", value: 3 }, { id: "wed", label: "Wed", value: -2 }] },
] as const;

export const AccessibleVisualizations: Story = {
  globals: { viewport: { isRotated: false, value: "mobile" } },
  render: () => <div className="data-chart-grid">
    <DonutChart data={chartData} summary="Build and review are positive segments; negative values are retained in the data table but excluded from donut geometry." title="Run distribution" />
    <BarChart data={chartData} summary="Build has 18 runs, review 11, and failed is four below baseline." title="Runs by stage" />
    <LineChart series={lineSeries} summary="Completed rises from 8 to 14 with Tuesday missing; queued falls from 5 to -2." title="Weekly throughput" />
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chart = canvas.getByRole("group", { name: "Weekly throughput" });
    const first = within(chart).getByRole("img", { name: "Completed, Mon: 8" });
    const second = within(chart).getByRole("img", { name: "Completed, Wed: 14" });
    await expect(first).toHaveAttribute("tabindex", "0");
    await expect(second).toHaveAttribute("tabindex", "-1");
    first.focus();
    await expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(second).toHaveFocus();
    await expect(first).toHaveAttribute("tabindex", "-1");
    await expect(second).toHaveAttribute("tabindex", "0");
    await userEvent.keyboard("{End}");
    const last = within(chart).getByRole("img", { name: "Queued, Wed: -2" });
    await expect(last).toHaveFocus();
    await expect(last).toHaveAttribute("tabindex", "0");
    await userEvent.keyboard("{Escape}");
    const barChart = canvas.getByRole("group", { name: "Runs by stage" });
    const barLabels = [...barChart.querySelectorAll<SVGTextElement>(".pulmu-chart-x-label")];
    await expect(barLabels.map(({ textContent }) => textContent)).toEqual(["Build", "Review", "Failed"]);
    await expect(getComputedStyle(barLabels[0]).display).not.toBe("none");
    await expect(getComputedStyle(barLabels[1]).display).toBe("none");
    await expect(getComputedStyle(barLabels[2]).display).not.toBe("none");
    const figure = chart.closest("figure") as HTMLElement;
    await userEvent.click(within(figure).getByText("View chart data"));
    const table = within(figure).getByRole("table", { name: "Equivalent chart data" });
    await expect(within(table).getByRole("cell", { name: "-2" })).toBeInTheDocument();
    await expect(within(table).getByRole("cell", { name: "Not available" })).toBeInTheDocument();
    await expect(canvas.getAllByText("View chart data")).toHaveLength(3);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const LoadingEmptyErrorAndStale: Story = {
  render: () => <div className="data-state-grid">
    <DataState status="loading" title="Loading metrics" />
    <DataState action={<Button variant="secondary">Create run</Button>} status="empty" />
    <DataState action={<Button variant="secondary">Clear filters</Button>} status="filtered-empty" />
    <DataState action={<Button onClick={fn()} variant="secondary">Retry</Button>} status="error" />
    <DataState action={<Button variant="quiet">Refresh</Button>} status="stale" updatedAt="09:15 UTC"><p>Preserved value: 98.2%</p></DataState>
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Loading metrics" })).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByText("No data yet")).toBeInTheDocument();
    await expect(canvas.getByText("No matching results")).toBeInTheDocument();
    await expect(canvas.getByRole("alert")).toContainElement(canvas.getByRole("heading", { name: "Data could not be loaded" }));
    await expect(canvas.getByText("Preserved value: 98.2%")).toBeInTheDocument();
    await expect(canvas.getByText("Data may be out of date").closest("[role=status]")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  },
};
