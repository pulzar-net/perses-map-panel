import { Box, useTheme } from '@mui/material';
import { formatValue } from '@perses-dev/components';
import type { FeatureCollection } from 'geojson';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { boundsOf, pointsOf, thresholdColor } from './points';
import type { PulzrMapPanelProps } from './pulzr-map-panel-types';

const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const SOURCE = 'points';

export function PulzrMapPanelComponent({ queryResults, spec }: PulzrMapPanelProps): ReactElement {
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  // Set once the style has loaded and the point layer exists.
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const style = spec.styleUrl ?? (theme.palette.mode === 'dark' ? DARK_STYLE : LIGHT_STYLE);
  const stroke = theme.palette.background.paper;

  const points = useMemo(
    () =>
      pointsOf(
        queryResults.map((r) => r.data),
        spec.latitudeLabel,
        spec.longitudeLabel,
      ),
    [queryResults, spec.latitudeLabel, spec.longitudeLabel],
  );
  const features = useMemo<FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: points.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
        properties: {
          name: p.name,
          label: p.value === null ? '–' : formatValue(p.value, spec.format),
          color: thresholdColor(p.value, spec.thresholds, theme.palette.primary.main),
        },
      })),
    }),
    [points, spec.format, spec.thresholds, theme.palette.primary.main],
  );

  // Made once per style; points change without remaking it.
  useEffect(() => {
    if (!container.current) return undefined;
    const created = new maplibregl.Map({ container: container.current, style, attributionControl: { compact: true } });
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
    created.on('load', () => {
      created.addSource(SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      created.addLayer({
        id: SOURCE,
        type: 'circle',
        source: SOURCE,
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': spec.radius ?? 6,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': stroke,
        },
      });
      created.on('mouseenter', SOURCE, (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;
        created.getCanvas().style.cursor = 'pointer';
        popup
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setText(`${feature.properties.name}: ${feature.properties.label}`)
          .addTo(created);
      });
      created.on('mouseleave', SOURCE, () => {
        created.getCanvas().style.cursor = '';
        popup.remove();
      });
      setMap(created);
    });
    return (): void => {
      setMap(null);
      created.remove();
    };
  }, [style, spec.radius, stroke]);

  useEffect(() => {
    if (!map) return;
    (map.getSource(SOURCE) as GeoJSONSource | undefined)?.setData(features);
    const bounds = boundsOf(points);
    if (bounds) map.fitBounds(bounds, { padding: 40, maxZoom: 17, duration: 0 });
  }, [map, features, points]);

  return <Box ref={container} sx={{ width: '100%', height: '100%' }} />;
}
