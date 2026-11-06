import { Box, useTheme } from '@mui/material';
import { formatValue } from '@perses-dev/components';
import type { FeatureCollection } from 'geojson';
import type * as MapLibre from 'maplibre-gl';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { boundsOf, pointsOf, thresholdColor } from './points';
import type { PulzrMapPanelProps } from './pulzr-map-panel-types';

const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const SOURCE = 'points';

// MapLibre is most of this plugin's size, so it is fetched when a map is first
// drawn: a dashboard without one never loads it.
const loadMapLibre = (): Promise<typeof MapLibre> => import('maplibre-gl');

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
    let created: MapLibreMap | undefined;
    let cancelled = false;
    void loadMapLibre().then(({ Map: MapLibreGl, Popup }) => {
      if (cancelled || !container.current) return;
      const map = new MapLibreGl({ container: container.current, style, attributionControl: { compact: true } });
      const popup = new Popup({ closeButton: false, closeOnClick: false });
      created = map;
      map.on('load', () => {
        map.addSource(SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({
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
        map.on('mouseenter', SOURCE, (event) => {
          const feature = event.features?.[0];
          if (!feature || feature.geometry.type !== 'Point') return;
          map.getCanvas().style.cursor = 'pointer';
          popup
            .setLngLat(feature.geometry.coordinates as [number, number])
            .setText(`${feature.properties.name}: ${feature.properties.label}`)
            .addTo(map);
        });
        map.on('mouseleave', SOURCE, () => {
          map.getCanvas().style.cursor = '';
          popup.remove();
        });
        setMap(map);
      });
    });
    return (): void => {
      cancelled = true;
      setMap(null);
      created?.remove();
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
