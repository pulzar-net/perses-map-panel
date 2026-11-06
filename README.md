# Map panel for Perses

`PulzrMapPanel` places each series on a [MapLibre](https://maplibre.org) map at the position in its labels, colored by its last value, with the value on hover. The map fits itself to the points.

```yaml
kind: Panel
spec:
  plugin:
    kind: PulzrMapPanel
    spec:
      thresholds:
        defaultColor: '#2e9e6a'
        steps:
          - { value: 1, color: '#d64545' }
```

- Positions come from the series labels `latitude` and `longitude`, or the labels named by `latitudeLabel` and `longitudeLabel`. A series without them is left off the map.
- `thresholds` color a point by the highest step its value reaches; `format` is the unit and decimals in the tooltip.
- `styleUrl` is any MapLibre style. Unset is Carto's free basemap (no token), light or dark with the dashboard.

The [Pulzr Net datasource](https://github.com/pulzar-net/perses-pulzr-datasource) labels each device's series with its position when a field query has `groupBy: device` and `positions: true`.

MapLibre is a peer dependency, so an app embedding the panel uses its own copy. The plugin archive carries it for Perses servers, as a shared module a host can supply, and fetches it only when a map is first drawn.

## Install

Put the archive (`PulzrMapPanel-<version>.tar.gz`, from the releases) in a folder listed in the Perses server's `plugin.archive_paths`, or `npm install @pulzr/perses-map-panel` to embed it.

## Development

```bash
npm install
npm test
percli plugin test-schemas
npm run build
percli plugin build
```

### Releasing

Set the new version in `package.json`, commit, then tag and push it:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

The Release workflow tests and builds, publishes the package to npm with provenance, and attaches the Perses plugin archive and the npm tarball to a GitHub release.

## License

Apache 2.0. Basemap tiles are Carto's and OpenStreetMap's, under their own terms.
