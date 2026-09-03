import {
  useId,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  CHART_VIEWBOX,
  createBarGeometry,
  createDonutGeometry,
  createLineGeometry,
  type GeometryDatum,
} from "./chart-geometry";
import { formatNumber, type FormattedDataValue } from "./formatters";
import { classes } from "./internal";

const DASHES = ["", "8 4", "2 3", "8 3 2 3", "12 4", "4 3", "10 3 3 3"] as const;
const SHAPES = ["circle", "square", "triangle", "diamond", "cross", "star", "plus"] as const;
export type ChartMarkerShape = (typeof SHAPES)[number];

export type ChartDatum = GeometryDatum;
export type ChartValueFormatter = (value: number | null | undefined) => FormattedDataValue;

export type LegendItem = {
  readonly id: string;
  readonly label: ReactNode;
  readonly seriesIndex?: number;
};

export type LegendProps = HTMLAttributes<HTMLUListElement> & {
  readonly items: readonly LegendItem[];
  readonly label?: string;
};

const seriesStyle = (index: number) => ({ color: `var(--pulmu-chart-series-${index % 7 + 1})` }) as CSSProperties;

function Marker({ index, x, y }: { readonly index: number; readonly x: number; readonly y: number }) {
  const shape = SHAPES[index % SHAPES.length];
  if (shape === "square") return <rect height="10" width="10" x={x - 5} y={y - 5} />;
  if (shape === "triangle") return <path d={`M ${x} ${y - 6} L ${x + 6} ${y + 5} L ${x - 6} ${y + 5} Z`} />;
  if (shape === "diamond") return <path d={`M ${x} ${y - 7} L ${x + 7} ${y} L ${x} ${y + 7} L ${x - 7} ${y} Z`} />;
  if (shape === "cross") return <path d={`M ${x - 6} ${y - 6} L ${x + 6} ${y + 6} M ${x + 6} ${y - 6} L ${x - 6} ${y + 6}`} />;
  if (shape === "plus") return <path d={`M ${x - 7} ${y} L ${x + 7} ${y} M ${x} ${y - 7} L ${x} ${y + 7}`} />;
  if (shape === "star") return <text textAnchor="middle" x={x} y={y + 5}>★</text>;
  return <circle cx={x} cy={y} r="5" />;
}

export function Legend({ className, items, label = "Chart legend", ...props }: LegendProps) {
  return (
    <ul {...props} aria-label={label} className={classes("pulmu-chart-legend", className)}>
      {items.map((item, index) => {
        const seriesIndex = item.seriesIndex ?? index;
        return <li key={item.id}>
          <svg aria-hidden="true" height="20" style={seriesStyle(seriesIndex)} viewBox="0 0 36 20" width="36">
            <line strokeDasharray={DASHES[seriesIndex % DASHES.length]} x1="2" x2="34" y1="10" y2="10" />
            <g className="pulmu-chart-marker"><Marker index={seriesIndex} x={18} y={10} /></g>
          </svg>
          <span>{item.label}</span>
        </li>;
      })}
    </ul>
  );
}

export type ChartSummaryProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  readonly summary: ReactNode;
  readonly title: ReactNode;
  readonly titleId?: string;
  readonly summaryId?: string;
};

export function ChartSummary({ className, summary, summaryId, title, titleId, ...props }: ChartSummaryProps) {
  return <div {...props} className={classes("pulmu-chart-summary", className)}>
    <h3 id={titleId}>{title}</h3>
    <p id={summaryId}>{summary}</p>
  </div>;
}

type InteractiveMark = {
  readonly id: string;
  readonly label: string;
  readonly seriesIndex: number;
  readonly x: number;
  readonly y: number;
};

function InteractiveMarks({ marks }: { readonly marks: readonly InteractiveMark[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const refs = useRef<Array<SVGCircleElement | null>>([]);
  useEffect(() => {
    setFocusedIndex((current) => Math.min(current, Math.max(0, marks.length - 1)));
  }, [marks.length]);
  const move = (event: KeyboardEvent<SVGCircleElement>, index: number) => {
    if (event.key === "Escape") {
      setActive(null);
      return;
    }
    const target = event.key === "Home" ? 0
      : event.key === "End" ? marks.length - 1
        : event.key === "ArrowRight" || event.key === "ArrowDown" ? (index + 1) % marks.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (index - 1 + marks.length) % marks.length
            : null;
    if (target === null) return;
    event.preventDefault();
    setFocusedIndex(target);
    setActive(target);
    refs.current[target]?.focus();
  };
  const activeMark = active === null ? undefined : marks[active];
  return <g className="pulmu-chart-interactions">
    {marks.map((mark, index) => <g key={mark.id} style={seriesStyle(mark.seriesIndex)}>
      <g aria-hidden="true" className="pulmu-chart-marker"><Marker index={mark.seriesIndex} x={mark.x} y={mark.y} /></g>
      <circle
        aria-label={mark.label}
        className="pulmu-chart-hit-target"
        cx={mark.x}
        cy={mark.y}
        data-chart-point="true"
        onBlur={() => setActive(null)}
        onFocus={() => { setActive(index); setFocusedIndex(index); }}
        onKeyDown={(event) => move(event, index)}
        onMouseEnter={() => setActive(index)}
        onMouseLeave={(event) => { if (document.activeElement !== event.currentTarget) setActive(null); }}
        r="14"
        ref={(element) => { refs.current[index] = element; }}
        role="img"
        tabIndex={index === focusedIndex ? 0 : -1}
      />
    </g>)}
    {activeMark ? <g aria-hidden="true" className="pulmu-chart-tooltip" transform={`translate(${Math.max(4, Math.min(CHART_VIEWBOX.width - 216, activeMark.x - 106))} ${Math.max(4, activeMark.y - 48)})`}>
      <rect height="38" rx="4" width="212" />
      <text x="10" y="24">{activeMark.label.length > 31 ? `${activeMark.label.slice(0, 30)}…` : activeMark.label}</text>
    </g> : null}
    <text aria-live="polite" className="pulmu-visually-hidden">{activeMark?.label ?? ""}</text>
  </g>;
}

function EquivalentDataTable({
  formatter,
  groups,
}: {
  readonly formatter: ChartValueFormatter;
  readonly groups: readonly { readonly id: string; readonly label: string; readonly values: readonly ChartDatum[] }[];
}) {
  const multiple = groups.length > 1;
  return <details className="pulmu-chart-data">
    <summary>View chart data</summary>
    <div className="pulmu-data-table-region" role="region" tabIndex={0}>
      <table className="pulmu-data-table">
        <caption>Equivalent chart data</caption>
        <thead><tr>{multiple ? <th scope="col">Series</th> : null}<th scope="col">Label</th><th data-align="end" scope="col">Value</th></tr></thead>
        <tbody>{groups.flatMap((group) => group.values.map((datum) => {
          const value = formatter(datum.value);
          return <tr key={`${group.id}-${datum.id}`}>{multiple ? <th scope="row">{group.label}</th> : null}<th scope="row">{datum.label}</th><td data-align="end"><span aria-label={value.accessible}>{value.display}</span></td></tr>;
        }))}</tbody>
      </table>
    </div>
  </details>;
}

type ChartFrameProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly data: readonly { readonly id: string; readonly label: string; readonly values: readonly ChartDatum[] }[];
  readonly formatter: ChartValueFormatter;
  readonly legend?: readonly LegendItem[];
  readonly summary: ReactNode;
  readonly title: ReactNode;
};

function ChartFrame({ children, className, data, formatter, legend, summary, title }: ChartFrameProps) {
  const generated = useId();
  const titleId = `${generated}-title`;
  const summaryId = `${generated}-summary`;
  return <figure aria-describedby={summaryId} aria-labelledby={titleId} className={classes("pulmu-chart", className)}>
    <ChartSummary summary={summary} summaryId={summaryId} title={title} titleId={titleId} />
    {children}
    {legend && legend.length > 0 ? <Legend items={legend} /> : null}
    <EquivalentDataTable formatter={formatter} groups={data} />
  </figure>;
}

export type CommonChartProps = {
  readonly className?: string;
  readonly summary: ReactNode;
  readonly title: ReactNode;
  readonly valueFormatter?: ChartValueFormatter;
};

export type DonutChartProps = CommonChartProps & {
  readonly data: readonly ChartDatum[];
};

export function DonutChart({ className, data, summary, title, valueFormatter = formatNumber }: DonutChartProps) {
  const geometry = createDonutGeometry(data);
  const marks = geometry.map((slice) => {
    const formatted = valueFormatter(slice.value);
    return { id: slice.id, label: `${slice.label}: ${formatted.accessible}`, seriesIndex: slice.seriesIndex, x: slice.centroid[0], y: slice.centroid[1] };
  });
  return <ChartFrame className={className} data={[{ id: "donut", label: String(title), values: data }]} formatter={valueFormatter} legend={data.map((datum, index) => ({ id: datum.id, label: datum.label, seriesIndex: index }))} summary={summary} title={title}>
    <svg aria-label={typeof title === "string" ? title : "Donut chart"} className="pulmu-chart__plot" role="group" viewBox={`0 0 ${CHART_VIEWBOX.width} ${CHART_VIEWBOX.height}`}>
      {geometry.length === 0 ? <text className="pulmu-chart__no-data" x="320" y="160">No positive values to plot</text> : geometry.map((slice) => <path className="pulmu-donut__slice" d={slice.path} key={slice.id} style={seriesStyle(slice.seriesIndex)} transform={`translate(${CHART_VIEWBOX.width / 2} ${CHART_VIEWBOX.height / 2})`} />)}
      <InteractiveMarks marks={marks} />
    </svg>
  </ChartFrame>;
}

export type BarChartProps = CommonChartProps & {
  readonly data: readonly ChartDatum[];
  readonly seriesLabel?: string;
};

export function BarChart({ className, data, seriesLabel = "Value", summary, title, valueFormatter = formatNumber }: BarChartProps) {
  const geometry = createBarGeometry(data);
  const marks = geometry.bars.map((bar, index) => {
    const formatted = valueFormatter(bar.value);
    return { id: bar.id, label: `${bar.label}: ${formatted.accessible}`, seriesIndex: index, x: bar.x + bar.width / 2, y: bar.value >= 0 ? bar.y : bar.y + bar.height };
  });
  return <ChartFrame className={className} data={[{ id: "bar", label: seriesLabel, values: data }]} formatter={valueFormatter} summary={summary} title={title}>
    <svg aria-label={typeof title === "string" ? title : "Bar chart"} className="pulmu-chart__plot" role="group" viewBox={`0 0 ${CHART_VIEWBOX.width} ${CHART_VIEWBOX.height}`}>
      <g className="pulmu-chart-axis">{geometry.ticks.map((tick) => <g key={tick.value}><line x1="56" x2="616" y1={tick.y} y2={tick.y} /><text textAnchor="end" x="48" y={tick.y + 4}>{valueFormatter(tick.value).display}</text></g>)}</g>
      <line className="pulmu-chart-baseline" x1="56" x2="616" y1={geometry.baseline} y2={geometry.baseline} />
      {geometry.bars.length === 0 ? <text className="pulmu-chart__no-data" x="320" y="160">No numeric values to plot</text> : null}
      {geometry.bars.map((bar, index) => <g key={bar.id} style={seriesStyle(index)}>
        <rect className="pulmu-bar__bar" height={bar.height} width={bar.width} x={bar.x} y={bar.y} />
        <text className="pulmu-bar__value" textAnchor="middle" x={bar.x + bar.width / 2} y={bar.value >= 0 ? bar.y - 8 : bar.y + bar.height + 18}>{valueFormatter(bar.value).display}</text>
        <text className="pulmu-chart-x-label" data-narrow-hidden={index % 2 === 1 || undefined} textAnchor="middle" x={bar.x + bar.width / 2} y="302">{bar.label}</text>
      </g>)}
      <InteractiveMarks marks={marks} />
    </svg>
  </ChartFrame>;
}

export type LineChartSeries = {
  readonly id: string;
  readonly label: string;
  readonly points: readonly ChartDatum[];
};

export type LineChartProps = CommonChartProps & {
  readonly series: readonly LineChartSeries[];
};

export function LineChart({ className, series, summary, title, valueFormatter = formatNumber }: LineChartProps) {
  const geometry = createLineGeometry(series);
  const marks = geometry.series.flatMap((item, seriesIndex) => item.points.map((point) => {
    const formatted = valueFormatter(point.value);
    return { id: `${item.id}-${point.id}`, label: `${item.label}, ${point.label}: ${formatted.accessible}`, seriesIndex, x: point.x, y: point.y };
  }));
  const xLabels = series[0]?.points ?? [];
  return <ChartFrame className={className} data={series.map((item) => ({ id: item.id, label: item.label, values: item.points }))} formatter={valueFormatter} legend={series.map((item, index) => ({ id: item.id, label: item.label, seriesIndex: index }))} summary={summary} title={title}>
    <svg aria-label={typeof title === "string" ? title : "Line chart"} className="pulmu-chart__plot" role="group" viewBox={`0 0 ${CHART_VIEWBOX.width} ${CHART_VIEWBOX.height}`}>
      <g className="pulmu-chart-axis">{geometry.ticks.map((tick) => <g key={tick.value}><line x1="56" x2="616" y1={tick.y} y2={tick.y} /><text textAnchor="end" x="48" y={tick.y + 4}>{valueFormatter(tick.value).display}</text></g>)}</g>
      {geometry.xTicks.map((tick) => <text className="pulmu-chart-x-label" data-narrow-hidden={tick.index % 2 === 1 || undefined} key={tick.index} textAnchor="middle" x={tick.x} y="302">{xLabels[tick.index]?.label ?? ""}</text>)}
      {geometry.series.map((item, index) => <path className="pulmu-line__path" d={item.path} key={item.id} strokeDasharray={DASHES[index % DASHES.length]} style={seriesStyle(index)} />)}
      {marks.length === 0 ? <text className="pulmu-chart__no-data" x="320" y="160">No numeric values to plot</text> : null}
      <InteractiveMarks marks={marks} />
    </svg>
  </ChartFrame>;
}
