import type { PanelPlugin } from '@perses-dev/plugin-system';

import type { PulzrMapPanelOptions, PulzrMapPanelProps } from './pulzr-map-panel-types';
import { PulzrMapPanelComponent } from './PulzrMapPanelComponent';
import { PulzrMapPanelSettingsEditor } from './PulzrMapPanelSettingsEditor';

export const PulzrMapPanel: PanelPlugin<PulzrMapPanelOptions, PulzrMapPanelProps> = {
  PanelComponent: PulzrMapPanelComponent,
  panelOptionsEditorComponents: [{ label: 'Map', content: PulzrMapPanelSettingsEditor }],
  supportedQueryTypes: ['TimeSeriesQuery'],
  createInitialOptions: () => ({}),
};
