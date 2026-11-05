import type { FormatOptions, ThresholdOptions } from '@perses-dev/components';
import type { PanelProps } from '@perses-dev/plugin-system';
import type { TimeSeriesData } from '@perses-dev/spec';

export interface PulzrMapPanelOptions {
  /** A MapLibre style URL. Unset is Carto's free basemap, light or dark with the dashboard. */
  styleUrl?: string;
  /** The series labels holding each point's position. */
  latitudeLabel?: string;
  longitudeLabel?: string;
  /** Unit and decimals of the value in a point's tooltip. */
  format?: FormatOptions;
  /** Colors a point by the highest step its value reaches. */
  thresholds?: ThresholdOptions;
  /** Point radius in pixels. */
  radius?: number;
}

export type PulzrMapPanelProps = PanelProps<PulzrMapPanelOptions, TimeSeriesData>;
