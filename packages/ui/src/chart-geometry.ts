import { extent } from "d3-array";
import { scaleBand, scaleLinear } from "d3-scale";
import { arc, line, pie } from "d3-shape";

export const CHART_VIEWBOX = { height: 320, width: 640 } as const;
const MARGIN = { bottom: 48, left: 56, right: 24, top: 24 } as const;

export type GeometryDatum = {
  readonly id: string;
  readonly label: string;
  readonly value: number | null | undefined;
};

export type DonutSliceGeometry = GeometryDatum & {
  readonly centroid: readonly [number, number];
  readonly path: string;
  readonly safeValue: number;
  readonly seriesIndex: number;
};

export function createDonutGeometry(data: readonly GeometryDatum[]) {
  const radius = Math.min(CHART_VIEWBOX.width, CHART_VIEWBOX.height) * 0.36;
  const center = [CHART_VIEWBOX.width / 2, CHART_VIEWBOX.height / 2] as const;
  const safe = data.map((datum, seriesIndex) => ({ ...datum, safeValue: typeof datum.value === "number" && Number.isFinite(datum.value) && datum.value > 0 ? datum.value : 0, seriesIndex }));
  if (!safe.some(({ safeValue }) => safeValue > 0)) return [];
  const arcs = pie<(typeof safe)[number]>().sort(null).value(({ safeValue }) => safeValue)(safe);
  const path = arc<(typeof arcs)[number]>().innerRadius(radius * 0.58).outerRadius(radius);
  return arcs.filter(({ data: datum }) => datum.safeValue > 0).map((item): DonutSliceGeometry => ({
    ...item.data,
    centroid: path.centroid(item).map((coordinate, index) => coordinate + center[index]) as [number, number],
    path: path(item) ?? "",
  }));
}

export type BarGeometry = Omit<GeometryDatum, "value"> & {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly value: number;
};

export function createBarGeometry(data: readonly GeometryDatum[]) {
  const finite = data.filter((datum): datum is GeometryDatum & { value: number } => typeof datum.value === "number" && Number.isFinite(datum.value));
  const values = finite.map(({ value }) => value);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const safeMaximum = minimum === maximum ? maximum + 1 : maximum;
  const x = scaleBand<string>()
    .domain(data.map(({ id }) => id))
    .range([MARGIN.left, CHART_VIEWBOX.width - MARGIN.right])
    .padding(0.28);
  const y = scaleLinear()
    .domain([minimum, safeMaximum])
    .nice()
    .range([CHART_VIEWBOX.height - MARGIN.bottom, MARGIN.top]);
  const baseline = y(0);
  const bars: BarGeometry[] = finite.map((datum) => {
    const valueY = y(datum.value);
    return {
      ...datum,
      height: Math.abs(valueY - baseline),
      width: x.bandwidth(),
      x: x(datum.id) ?? MARGIN.left,
      y: Math.min(valueY, baseline),
    };
  });
  return { bars, baseline, ticks: y.ticks(5).map((value) => ({ value, y: y(value) })) };
}

export type LineGeometrySeries = {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly points: readonly (GeometryDatum & { readonly x: number; readonly y: number })[];
};

export function createLineGeometry(series: readonly { readonly id: string; readonly label: string; readonly points: readonly GeometryDatum[] }[]) {
  const allValues = series.flatMap(({ points }) => points.map(({ value }) => value)).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const [rawMinimum = 0, rawMaximum = 1] = extent(allValues);
  const minimum = Math.min(0, rawMinimum);
  const clampedMaximum = Math.max(0, rawMaximum);
  const maximum = clampedMaximum === minimum ? minimum + 1 : clampedMaximum;
  const pointCount = Math.max(1, ...series.map(({ points }) => points.length));
  const x = scaleLinear().domain([0, Math.max(1, pointCount - 1)]).range([MARGIN.left, CHART_VIEWBOX.width - MARGIN.right]);
  const y = scaleLinear().domain([minimum, maximum]).nice().range([CHART_VIEWBOX.height - MARGIN.bottom, MARGIN.top]);
  const pathBuilder = line<GeometryDatum>()
    .defined(({ value }) => typeof value === "number" && Number.isFinite(value))
    .x((_point, index) => x(index))
    .y(({ value }) => y(value as number));
  return {
    baseline: y(0),
    series: series.map((item): LineGeometrySeries => ({
      id: item.id,
      label: item.label,
      path: pathBuilder(item.points) ?? "",
      points: item.points.flatMap((point, index) => typeof point.value === "number" && Number.isFinite(point.value)
        ? [{ ...point, x: x(index), y: y(point.value) }]
        : []),
    })),
    ticks: y.ticks(5).map((value) => ({ value, y: y(value) })),
    xTicks: Array.from({ length: pointCount }, (_, index) => ({ index, x: x(index) })),
  };
}
