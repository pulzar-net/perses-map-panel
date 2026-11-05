import type { ThresholdOptions } from '@perses-dev/components';
import type { TimeSeriesData } from '@perses-dev/spec';

export interface MapPoint {
  name: string;
  latitude: number;
  longitude: number;
  value: number | null;
}

/** The last non-null value of a series. */
function lastValue(values: Array<[number, number | null]>): number | null {
  for (let i = values.length - 1; i >= 0; i -= 1) {
    const value = values[i]![1];
    if (value !== null) return value;
  }
  return null;
}

/** Every series with a position in its labels, at its last value. Others cannot be placed and are left out. */
export function pointsOf(data: TimeSeriesData[], latitudeLabel = 'latitude', longitudeLabel = 'longitude'): MapPoint[] {
  return data.flatMap((d) =>
    d.series.flatMap((series): MapPoint[] => {
      const latitude = Number(series.labels?.[latitudeLabel]);
      const longitude = Number(series.labels?.[longitudeLabel]);
      if (!series.labels?.[latitudeLabel] || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
      return [{ name: series.formattedName ?? series.name, latitude, longitude, value: lastValue(series.values) }];
    }),
  );
}

/** The color of the highest absolute step a value reaches, or the default below them all. */
export function thresholdColor(
  value: number | null,
  thresholds: ThresholdOptions | undefined,
  fallback: string,
): string {
  let color = thresholds?.defaultColor ?? fallback;
  if (value === null) return color;
  for (const step of (thresholds?.steps ?? []).toSorted((a, b) => a.value - b.value)) {
    if (value >= step.value && step.color) color = step.color;
  }
  return color;
}

/** [[west, south], [east, north]] around every point. */
export function boundsOf(points: MapPoint[]): [[number, number], [number, number]] | undefined {
  if (points.length === 0) return undefined;
  const lngs = points.map((p) => p.longitude);
  const lats = points.map((p) => p.latitude);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}
