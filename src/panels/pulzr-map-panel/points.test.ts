import type { TimeSeriesData } from '@perses-dev/spec';

import { boundsOf, pointsOf, thresholdColor } from './points';

const data: TimeSeriesData[] = [
  {
    series: [
      {
        name: 'Bay 14',
        labels: { latitude: '34.02', longitude: '-118.28' },
        values: [
          [1, 1],
          [2, null],
        ],
      },
      { name: 'Bay 15', labels: { latitude: '34.03', longitude: '-118.27' }, values: [[1, 0]] },
      { name: 'Unplaced', values: [[1, 1]] },
    ],
  },
];

describe('pointsOf', () => {
  it('places each series with a position at its last value, and leaves the rest out', () => {
    expect(pointsOf(data)).toEqual([
      { name: 'Bay 14', latitude: 34.02, longitude: -118.28, value: 1 },
      { name: 'Bay 15', latitude: 34.03, longitude: -118.27, value: 0 },
    ]);
  });

  it('reads positions from other labels', () => {
    const elsewhere: TimeSeriesData[] = [{ series: [{ name: 'x', labels: { lat: '1', lon: '2' }, values: [] }] }];
    expect(pointsOf(elsewhere, 'lat', 'lon')).toEqual([{ name: 'x', latitude: 1, longitude: 2, value: null }]);
  });
});

it('bounds every point', () => {
  expect(boundsOf(pointsOf(data))).toEqual([
    [-118.28, 34.02],
    [-118.27, 34.03],
  ]);
  expect(boundsOf([])).toBeUndefined();
});

it('colors by threshold', () => {
  const thresholds = { steps: [{ value: 1, color: 'red' }] };
  expect(thresholdColor(1, thresholds, 'blue')).toBe('red');
  expect(thresholdColor(0, thresholds, 'blue')).toBe('blue');
  expect(thresholdColor(null, thresholds, 'blue')).toBe('blue');
});
